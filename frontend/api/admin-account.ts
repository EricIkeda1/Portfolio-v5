import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createAdminToken, requireAdmin } from './_lib/auth'
import { ensureDatabase, getSql } from './_lib/db'
import { hashPassword, verifyPassword } from './_lib/password'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req)
  if (!admin) return res.status(401).json({ error: 'Não autorizado.' })

  try {
    await ensureDatabase()
    const sql = getSql()

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, email, created_at, last_login_at
        FROM admin_users
        WHERE id = ${admin.id}
        LIMIT 1
      `
      return res.status(200).json({ user: rows[0] })
    }

    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Método não permitido.' })
    }

    const email = String(req.body?.email ?? '').trim().toLowerCase()
    const currentPassword = String(req.body?.current_password ?? '')
    const newPassword = String(req.body?.new_password ?? '')

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Informe um e-mail válido.' })
    }
    if (!currentPassword) {
      return res.status(400).json({ error: 'Informe sua senha atual para confirmar a alteração.' })
    }
    if (newPassword && newPassword.length < 8) {
      return res.status(400).json({ error: 'A nova senha precisa ter pelo menos 8 caracteres.' })
    }

    const currentRows = await sql`
      SELECT id, password_hash
      FROM admin_users
      WHERE id = ${admin.id} AND is_active = TRUE
      LIMIT 1
    `
    const current = currentRows[0]
    if (!current || !(await verifyPassword(currentPassword, String(current.password_hash)))) {
      return res.status(403).json({ error: 'Senha atual incorreta.' })
    }

    const duplicated = await sql`
      SELECT id
      FROM admin_users
      WHERE email = ${email} AND id <> ${admin.id}
      LIMIT 1
    `
    if (duplicated[0]) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' })
    }

    const passwordHash = newPassword ? await hashPassword(newPassword) : String(current.password_hash)
    const rows = await sql`
      UPDATE admin_users
      SET email = ${email}, password_hash = ${passwordHash}, updated_at = NOW()
      WHERE id = ${admin.id}
      RETURNING id, email, created_at, last_login_at
    `

    const user = { id: Number(rows[0].id), email: String(rows[0].email) }
    const token = await createAdminToken(user)
    return res.status(200).json({ user: rows[0], token })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Não foi possível atualizar a conta do administrador.' })
  }
}
