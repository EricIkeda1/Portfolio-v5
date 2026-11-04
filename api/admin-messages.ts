import { requireAdmin } from './_lib/auth.js'
import { ensureContactSchema } from './_lib/contact.js'
import { getSql } from './_lib/db.js'
import { allowMethods, noStore } from './_lib/http.js'
import { enforceSameOrigin, requireJson } from './_lib/security.js'

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['GET', 'PUT'])) return
  if (!enforceSameOrigin(req, res)) return
  if (!requireAdmin(req, res)) return
  if (req.method === 'PUT' && !requireJson(req, res)) return

  try {
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
      sql`SELECT id, name, email, message, created_at, read_at FROM contact_messages WHERE id < ${before} ORDER BY id DESC LIMIT 51`,
      sql`SELECT count(*)::integer AS unread FROM contact_messages WHERE read_at IS NULL`,
    ])
    return res.status(200).json({ messages: messages.slice(0, 50), next: messages.length > 50 ? Number(messages[49].id) : null, unread: Number(count[0].unread) })
  } catch {
    return res.status(503).json({ error: 'Não foi possível acessar as mensagens. Tente novamente.' })
  }
}
