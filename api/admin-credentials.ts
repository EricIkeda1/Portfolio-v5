import { createSessionToken, hashPassword, requireAdmin, setSessionCookie, verifyPassword } from './_lib/auth.js'
import { ensureSchema, getSql } from './_lib/db.js'
import { allowMethods, noStore } from './_lib/http.js'
import { enforceSameOrigin, requireJson } from './_lib/security.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['PUT'])) return
  if (!enforceSameOrigin(req, res)) return
  if (!requireJson(req, res)) return

  const session = await requireAdmin(req, res)
  if (!session) return

  try {
    await ensureSchema()
    const sql = getSql()
    const rows = await sql`SELECT id, email, password_hash FROM admins WHERE id = ${session.id} LIMIT 1`
    const admin = rows[0] as { id?: number; email?: string; password_hash?: string } | undefined
    if (!admin?.id || !admin.email || !admin.password_hash) {
      return res.status(401).json({ error: 'Administrador não encontrado.' })
    }

    const currentPassword = String(req.body?.current_password ?? '')
    const nextEmail = String(req.body?.email ?? '').trim().toLowerCase()
    const newPassword = String(req.body?.new_password ?? '')

    if (!currentPassword || !verifyPassword(currentPassword, admin.password_hash)) {
      return res.status(401).json({ error: 'Senha atual inválida.' })
    }

    if (!nextEmail || nextEmail.length > 254 || !EMAIL_RE.test(nextEmail)) {
      return res.status(400).json({ error: 'Informe um e-mail administrativo válido.' })
    }

    if (newPassword && (newPassword.length < 12 || newPassword.length > 128)) {
      return res.status(400).json({ error: 'A nova senha deve ter entre 12 e 128 caracteres.' })
    }

    const nextHash = hashPassword(newPassword || currentPassword)

    try {
      const updated = await sql`
        UPDATE admins
        SET email = ${nextEmail}, password_hash = ${nextHash}
        WHERE id = ${session.id} AND password_hash = ${admin.password_hash}
        RETURNING id
      `
      if (!updated.length) return res.status(409).json({ error: 'As credenciais mudaram. Entre novamente.' })
    } catch (error: any) {
      if (error?.code === '23505') return res.status(409).json({ error: 'Esse e-mail administrativo já está em uso.' })
      throw error
    }

    setSessionCookie(res, await createSessionToken({ id: Number(admin.id), email: nextEmail, password_hash: nextHash }))
    return res.status(200).json({ ok: true, user: { id: Number(admin.id), email: nextEmail } })
  } catch (error) {
    console.error('PUT /api/admin-credentials', error)
    return res.status(500).json({ error: 'Não foi possível atualizar as credenciais.' })
  }
}
