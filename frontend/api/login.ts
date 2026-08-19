import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createAdminToken } from './_lib/auth'
import { ensureDatabase, getSql } from './_lib/db'
import { verifyPassword } from './_lib/password'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })

  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '')

  if (!email || !password) {
    return res.status(400).json({ error: 'Informe o e-mail e a senha.' })
  }

  try {
    await ensureDatabase()
    const sql = getSql()
    const rows = await sql`
      SELECT id, email, password_hash
      FROM admin_users
      WHERE email = ${email} AND is_active = TRUE
      LIMIT 1
    `

    const admin = rows[0]
    if (!admin || !(await verifyPassword(password, String(admin.password_hash)))) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
    }

    await sql`
      UPDATE admin_users
      SET last_login_at = NOW()
      WHERE id = ${Number(admin.id)}
    `

    const user = { id: Number(admin.id), email: String(admin.email) }
    const token = await createAdminToken(user)
    return res.status(200).json({ token, user })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Não foi possível acessar o login no Neon.' })
  }
}
