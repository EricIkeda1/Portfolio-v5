import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'portfolio_admin_session'
const SESSION_SECONDS = 60 * 60 * 8

type SessionPayload = {
  id: number
  email: string
  exp: number
}

function getSecret() {
  const secret = process.env.SESSION_SECRET || process.env.DATABASE_URL
  if (!secret) throw new Error('SESSION_SECRET ou DATABASE_URL não configurada.')
  return secret
}

function sign(value: string) {
  return createHmac('sha256', getSecret()).update(value).digest('base64url')
}

export function createSessionToken(user: { id: number; email: string }) {
  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encoded}.${sign(encoded)}`
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return null

  const expected = sign(encoded)
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload
    if (!payload.id || !payload.email || payload.exp <= Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, hash] = stored.split('$')
  if (algorithm !== 'scrypt' || !salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=')
        return index === -1 ? [part, ''] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))]
      }),
  )
}

export function getSessionFromRequest(req: any) {
  const cookies = parseCookies(req.headers?.cookie || '')
  return verifySessionToken(cookies[COOKIE_NAME])
}

export function setSessionCookie(res: any, token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}${secure}`)
}

export function clearSessionCookie(res: any) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`)
}

export function requireAdmin(req: any, res: any) {
  const session = getSessionFromRequest(req)
  if (!session) {
    res.status(401).json({ error: 'Sessão inválida ou expirada.' })
    return null
  }
  return session
}
