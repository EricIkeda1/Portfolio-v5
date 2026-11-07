import { moderateMessage } from './_lib/moderation/index.js'
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

export function createContactHandler(deps = { moderateMessage, encryptContact, getSessionSecret, ensureContactSchema, getSql, notifyNewContact }) {
  return async function handler(req: any, res: any) {
    noStore(res)
    if (!allowMethods(req, res, ['POST'])) return
    if (!enforceSameOrigin(req, res) || !requireJson(req, res)) return

    const body = req.body
    if (!body || typeof body !== 'object' || Array.isArray(body) || JSON.stringify(body).length > 16000) {
      return res.status(400).json({ error: 'Mensagem inválida ou muito grande.' })
    }
    const clean = parseContactSubmission(body)
    if (!clean) return res.status(400).json({ error: ['anonymous', 'personal'].includes(body.kind) ? 'Escreva de 10 a 1.000 caracteres e, ao se identificar, informe um nome de 2 a 100 caracteres.' : 'Use um nome de 2 a 100 caracteres, um e-mail válido e uma mensagem de 10 a 5.000 caracteres.' })

    try {
      const messageCheck = deps.moderateMessage(clean.message)
      const nameCheck = (Boolean(clean.email) || clean.anonymous === false) ? deps.moderateMessage(clean.name) : { blocked: false }
      if (messageCheck.blocked || nameCheck.blocked) return res.status(422).json({ code: 'CONTENT_BLOCKED', error: 'Mensagem bloqueada pela moderação automática. Ameaças e conteúdo abusivo não são permitidos.' })
      // Fail closed if the key is missing: personal data must never fall back to plaintext.
      const encrypted = deps.encryptContact(clean)
      const source = ['anonymous', 'personal'].includes(body.kind) ? 'personal' : 'portfolio'
      const key = createHmac('sha256', deps.getSessionSecret()).update(`contact:${getClientIp(req)}`).digest('hex')
      await deps.ensureContactSchema()
      const sql = deps.getSql()
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
        INSERT INTO contact_messages (name, email, message, private_payload, source)
        SELECT '[protegido]', '[protegido]', '[conteúdo protegido]', ${encrypted}, ${source} FROM allowed
        RETURNING id
      `
      if (!rows.length) {
        res.setHeader('Retry-After', '900')
        return res.status(429).json({ error: 'Você enviou várias mensagens. Aguarde 15 minutos antes de tentar novamente.' })
      }
      // A tabela de limites guarda somente um hash temporário por origem.
      await sql`DELETE FROM contact_submission_limits WHERE window_started_at < now() - interval '1 day'`.catch(() => {})
      // Uma falha no push nunca transforma uma mensagem já salva em erro de envio.
      await deps.notifyNewContact(Number(rows[0].id), source).catch(() => {})
      return res.status(201).json({ ok: true })
    } catch {
      return res.status(503).json({ error: 'Não foi possível enviar agora. Sua mensagem continua no formulário; tente novamente em instantes.' })
    }
  }

}

export default createContactHandler()
