import { createSessionToken, setSessionCookie } from './_lib/auth'
import { getSql } from './_lib/db'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '')

  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' })
  }

  try {
    const sql = getSql()
    const rows = await sql`
      SELECT id, email
      FROM admins
      WHERE lower(email) = ${email}
        AND password_hash = crypt(${password}, password_hash)
      LIMIT 1
    `

    const admin = rows[0]
    if (!admin) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
    }

    const token = createSessionToken(Number(admin.id), String(admin.email))
    setSessionCookie(res, token)

    return res.status(200).json({ ok: true, admin: { id: admin.id, email: admin.email } })
  } catch (error) {
    console.error('POST /api/auth-login', error)
    return res.status(500).json({ error: 'Não foi possível realizar o login.' })
  }
}
