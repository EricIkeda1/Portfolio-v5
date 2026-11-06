import { createHmac } from 'node:crypto'
import { encryptContact } from './_lib/contact-crypto.js'
import { getSessionSecret } from './_lib/auth.js'
import { ensureContactSchema } from './_lib/contact.js'
import { getSql } from './_lib/db.js'
import { notifyNewContact } from './_lib/push.js'
import { allowMethods, noStore } from './_lib/http.js'
import { parseContactSubmission } from './_lib/contact-input.js'
import { enforceSameOrigin, getClientIp, requireJson } from './_lib/security.js'

export const config = { api: { bodyParser: { sizeLimit: '16kb' } } }

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['POST'])) return
  if (!enforceSameOrigin(req, res) || !requireJson(req, res)) return

  const body = req.body
  if (!body || typeof body !== 'object' || Array.isArray(body) || JSON.stringify(body).length > 16000) {
    return res.status(400).json({ error: 'Mensagem inválida ou muito grande.' })
  }
  const clean = parseContactSubmission(body)
  if (!clean) return res.status(400).json({ error: body.kind === 'anonymous' ? 'O recadinho deve ter de 10 a 1.000 caracteres.' : 'Use um nome de 2 a 100 caracteres, um e-mail válido e uma mensagem de 10 a 5.000 caracteres.' })

  try {
    // Fail closed if the key is missing: personal data must never fall back to plaintext.
    const encrypted = encryptContact(clean)
    const key = createHmac('sha256', getSessionSecret()).update(`contact:${getClientIp(req)}`).digest('hex')
    await ensureContactSchema()
    const sql = getSql()
    // Quota e gravação na mesma instrução: envios simultâneos também respeitam o limite.
    const rows = await sql`
      WITH allowed AS (
        INSERT INTO contact_submission_limits (key, attempt_count, window_started_at)
        VALUES (${key}, 1, now())
        ON CONFLICT (key) DO UPDATE SET
          attempt_count = CASE WHEN contact_submission_limits.window_started_at <= now() - interval '15 minutes'
            THEN 1 ELSE contact_submission_limits.attempt_count + 1 END,
          window_started_at = CASE WHEN contact_submission_limits.window_started_at <= now() - interval '15 minutes'
            THEN now() ELSE contact_submission_limits.window_started_at END
        WHERE contact_submission_limits.attempt_count < 5
          OR contact_submission_limits.window_started_at <= now() - interval '15 minutes'
        RETURNING key
      )
      INSERT INTO contact_messages (name, email, message, private_payload)
      SELECT '[protegido]', '[protegido]', '[conteúdo protegido]', ${encrypted} FROM allowed
      RETURNING id
    `
    if (!rows.length) {
      res.setHeader('Retry-After', '900')
      return res.status(429).json({ error: 'Você enviou várias mensagens. Aguarde 15 minutos antes de tentar novamente.' })
    }
    // A tabela de limites guarda somente um hash temporário por origem.
    await sql`DELETE FROM contact_submission_limits WHERE window_started_at < now() - interval '1 day'`.catch(() => {})
    // Uma falha no push nunca transforma uma mensagem já salva em erro de envio.
    await notifyNewContact(Number(rows[0].id)).catch(() => {})
    return res.status(201).json({ ok: true })
  } catch {
    return res.status(503).json({ error: 'Não foi possível enviar agora. Sua mensagem continua no formulário; tente novamente em instantes.' })
  }
}
