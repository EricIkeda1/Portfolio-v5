import { burnPasswordCheck, createSessionToken, setSessionCookie, verifyPassword } from './_lib/auth.js'
import { ensureSchema, getSql } from './_lib/db.js'
import {
  checkLoginRateLimit,
  cleanupOldLoginAttempts,
  clearLoginFailures,
  loginRateLimitKeys,
  recordFailedLogin,
} from './_lib/login-rate-limit.js'
import { allowMethods, noStore } from './_lib/http.js'
import { enforceSameOrigin, requireJson } from './_lib/security.js'

const MAX_EMAIL_LENGTH = 254
const MAX_PASSWORD_LENGTH = 256

function rateLimited(res: any, retryAfterSeconds: number) {
  res.setHeader('Retry-After', String(Math.max(1, retryAfterSeconds)))
  return res.status(429).json({ error: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.' })
}

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['POST'])) return
  if (!enforceSameOrigin(req, res)) return
  if (!requireJson(req, res)) return

  try {
    await ensureSchema()

    const email = String(req.body?.email ?? '').trim().toLowerCase()
    const password = String(req.body?.password ?? '')

    if (!email || !password) return res.status(400).json({ error: 'Informe e-mail e senha.' })
    if (email.length > MAX_EMAIL_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      return res.status(400).json({ error: 'Credenciais inválidas.' })
    }

    const keys = loginRateLimitKeys(req, email)
    const currentLimit = await checkLoginRateLimit(keys)
    if (currentLimit.limited) return rateLimited(res, currentLimit.retryAfterSeconds)

    const sql = getSql()
    const rows = await sql`SELECT id, email, password_hash FROM admins WHERE lower(email) = ${email} LIMIT 1`
    const admin = rows[0] as { id?: number; email?: string; password_hash?: string } | undefined

    let validPassword = false
    if (admin?.password_hash) validPassword = verifyPassword(password, admin.password_hash)
    else burnPasswordCheck(password)

    if (!admin?.id || !admin.email || !validPassword) {
      const nextLimit = await recordFailedLogin(keys)
      if (nextLimit.limited) return rateLimited(res, nextLimit.retryAfterSeconds)
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
    }

    await clearLoginFailures(keys)
    setSessionCookie(res, createSessionToken({ id: Number(admin.id), email: admin.email }))

    // Limpeza oportunista para a tabela de tentativas, sem afetar o login caso falhe.
    void cleanupOldLoginAttempts().catch((error) => console.warn('cleanupOldLoginAttempts', error))

    return res.status(200).json({ ok: true, user: { id: Number(admin.id), email: admin.email } })
  } catch (error) {
    console.error('POST /api/admin-login', error)
    return res.status(500).json({ error: 'Não foi possível concluir o login.' })
  }
}
