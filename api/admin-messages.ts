import { requireAdmin } from './_lib/auth.js'
import { ensureContactSchema } from './_lib/contact.js'
import { getSql } from './_lib/db.js'
import { allowMethods, noStore } from './_lib/http.js'
import { enforceSameOrigin, requireJson } from './_lib/security.js'
import { cleanPushSubscription, ensurePushSchema, getPushKeys, sendDevicePush, validPushEndpoint } from './_lib/push.js'
import { decryptContactData } from './_lib/contact-encryption.js'

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['GET', 'PUT', 'POST', 'DELETE'])) return
  if (!enforceSameOrigin(req, res)) return
  if (!requireAdmin(req, res)) return
  if (req.method !== 'GET' && !requireJson(req, res)) return

  try {
    if (req.method === 'GET' && req.query?.notifications === '1') {
      const keys = await getPushKeys()
      return res.status(200).json({ publicKey: keys.publicKey })
    }
    if (req.method === 'POST' || req.method === 'DELETE') {
      await ensurePushSchema()
      const sql = getSql()
      const action = req.body?.action
      if (req.method === 'POST' && action === 'subscribe') {
        const subscription = cleanPushSubscription(req.body?.subscription)
        if (!subscription) return res.status(400).json({ error: 'Inscrição de notificações inválida ou navegador não compatível.' })
        const existing = await sql`SELECT endpoint FROM admin_push_subscriptions WHERE endpoint = ${subscription.endpoint}`
        if (!existing.length) {
          const count = await sql`SELECT count(*)::integer AS total FROM admin_push_subscriptions WHERE enabled = true`
          if (Number(count[0].total) >= 20) return res.status(409).json({ error: 'Limite de 20 aparelhos atingido.' })
        }
        await sql`INSERT INTO admin_push_subscriptions (endpoint, p256dh, auth)
          VALUES (${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth})
          ON CONFLICT (endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth,
            enabled = true, updated_at = now(), last_error = NULL`
        return res.status(200).json({ ok: true })
      }
      const endpoint = req.body?.endpoint
      if (!validPushEndpoint(endpoint)) return res.status(400).json({ error: 'Aparelho inválido.' })
      if (req.method === 'DELETE') {
        await sql`UPDATE admin_push_subscriptions SET enabled = false WHERE endpoint = ${endpoint}`
        return res.status(200).json({ ok: true })
      }
      const devices = await sql`SELECT p256dh, auth, enabled, last_sent_at, last_error FROM admin_push_subscriptions WHERE endpoint = ${endpoint}`
      const device = devices[0]
      if (action === 'status') return res.status(200).json({ enabled: device?.enabled === true, lastError: device?.last_error ?? null })
      if (action !== 'test' || !device?.enabled) return res.status(400).json({ error: 'Ative as notificações neste aparelho primeiro.' })
      try {
        await sendDevicePush({ endpoint, keys: { p256dh: String(device.p256dh), auth: String(device.auth) } })
        await sql`UPDATE admin_push_subscriptions SET last_sent_at = now(), last_error = NULL WHERE endpoint = ${endpoint}`
        return res.status(200).json({ ok: true })
      } catch {
        return res.status(502).json({ error: 'O serviço de notificações não aceitou o teste. Desative e ative novamente neste aparelho.' })
      }
    }
    await ensureContactSchema()
    const sql = getSql()
    if (req.method === 'PUT') {
      const { id, read } = req.body ?? {}
      if (!Number.isSafeInteger(id) || id <= 0 || typeof read !== 'boolean') {
        return res.status(400).json({ error: 'Mensagem inválida.' })
      }
      const rows = await sql`
        UPDATE contact_messages SET read_at = CASE WHEN ${read} THEN now() ELSE NULL END
        WHERE id = ${id} RETURNING id, read_at
      `
      if (!rows.length) return res.status(404).json({ error: 'Mensagem não encontrada.' })
      return res.status(200).json(rows[0])
    }
    const before = req.query?.before === undefined ? 2147483647 : Number(req.query.before)
    if (!Number.isSafeInteger(before) || before <= 0) return res.status(400).json({ error: 'Página inválida.' })
    const [messages, count] = await Promise.all([
      sql`SELECT id, name, email, name_encrypted, email_encrypted, message_encrypted, encryption_id, message, created_at, read_at FROM contact_messages WHERE id < ${before} ORDER BY id DESC LIMIT 51`,
      sql`SELECT count(*)::integer AS unread FROM contact_messages WHERE read_at IS NULL`,
    ])
    const decrypted = messages.slice(0, 50).map(row => ({
      id: row.id, ...decryptContactData(row), created_at: row.created_at, read_at: row.read_at,
    }))
    return res.status(200).json({ messages: decrypted, next: messages.length > 50 ? Number(messages[49].id) : null, unread: Number(count[0].unread) })
  } catch {
    return res.status(503).json({ error: 'Não foi possível acessar as mensagens. Tente novamente.' })
  }
}
