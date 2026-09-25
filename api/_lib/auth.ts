import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'portfolio_admin_session'
const SESSION_SECONDS = 60 * 60 * 8
const MIN_SESSION_SECRET_LENGTH = 32

type SessionPayload = {
  id: number
  email: string
  exp: number
}

export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < MIN_SESSION_SECRET_LENGTH) {
    throw new Error(`SESSION_SECRET deve estar configurada com pelo menos ${MIN_SESSION_SECRET_LENGTH} caracteres.`)
  }
  return secret
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url')
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

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, hash] = stored.split('$')
  if (algorithm !== 'scrypt' || !salt || !hash || !/^[a-f0-9]{128}$/i.test(hash)) return false

  try {
    const candidate = scryptSync(password, salt, 64)
    const expected = Buffer.from(hash, 'hex')
    return candidate.length === expected.length && timingSafeEqual(candidate, expected)
  } catch {
    return false
  }
}

export function burnPasswordCheck(password: string) {
  // Mantém um custo semelhante mesmo quando o e-mail não existe, dificultando enumeração por tempo de resposta.
  scryptSync(password, 'portfolio-login-dummy-salt', 64)
}

function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=')
        if (index === -1) return [part, '']
        const rawValue = part.slice(index + 1)
        try {
          return [part.slice(0, index), decodeURIComponent(rawValue)]
        } catch {
          return [part.slice(0, index), '']
        }
      }),
  )
}

export function getSessionFromRequest(req: any) {
  const cookies = parseCookies(req.headers?.cookie || '')
  try {
    return verifySessionToken(cookies[COOKIE_NAME])
  } catch {
    return null
  }
}

export function setSessionCookie(res: any, token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}; Priority=High${secure}`,
  )
}

export function clearSessionCookie(res: any) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0; Priority=High${secure}`,
  )
}

export function requireAdmin(req: any, res: any) {
  const session = getSessionFromRequest(req)
  if (!session) {
    res.status(401).json({ error: 'Sessão inválida ou expirada.' })
    return null
  }
  return session
}
