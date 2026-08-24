import { createSessionToken, setSessionCookie, verifyPassword } from './_lib/auth.js'
import { ensureSchema, getSql } from './_lib/db.js'
import { allowMethods, messageFromError, noStore } from './_lib/http.js'

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['POST'])) return

  try {
    await ensureSchema()
    const email = String(req.body?.email ?? '').trim().toLowerCase()
    const password = String(req.body?.password ?? '')
    if (!email || !password) return res.status(400).json({ error: 'Informe e-mail e senha.' })

    const sql = getSql()
    const rows = await sql`SELECT id, email, password_hash FROM admins WHERE lower(email) = ${email} LIMIT 1`
    const admin = rows[0] as { id?: number; email?: string; password_hash?: string } | undefined

    if (!admin?.id || !admin.email || !admin.password_hash || !verifyPassword(password, admin.password_hash)) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
    }

    setSessionCookie(res, createSessionToken({ id: Number(admin.id), email: admin.email }))
    res.status(200).json({ ok: true, user: { id: Number(admin.id), email: admin.email } })
  } catch (error) {
    console.error('POST /api/admin-login', error)
    res.status(500).json({ error: messageFromError(error) })
  }
}
