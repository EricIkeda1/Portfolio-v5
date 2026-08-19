import crypto from 'node:crypto'

const COOKIE_NAME = 'portfolio_admin_session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7

type SessionPayload = {
  adminId: number
  email: string
  exp: number
}

function getSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET deve ter pelo menos 32 caracteres.')
  }
  return secret
}

function encode(value: string) {
  return Buffer.from(value).toString('base64url')
}

function decode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(value: string) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url')
}

export function createSessionToken(adminId: number, email: string) {
  const payload: SessionPayload = {
    adminId,
    email,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  }
  const body = encode(JSON.stringify(payload))
  return `${body}.${sign(body)}`
}

export function readSessionToken(token?: string): SessionPayload | null {
  if (!token) return null

  const [body, signature] = token.split('.')
  if (!body || !signature) return null

  const expected = sign(body)
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(decode(body)) as SessionPayload
    if (!payload.adminId || !payload.email || payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf('=')
        if (index === -1) return [item, '']
        return [item.slice(0, index), decodeURIComponent(item.slice(index + 1))]
      }),
  )
}

export function getSessionFromRequest(req: any) {
  const cookies = parseCookies(req.headers?.cookie || '')
  return readSessionToken(cookies[COOKIE_NAME])
}

export function requireAdmin(req: any, res: any) {
  const session = getSessionFromRequest(req)
  if (!session) {
    res.status(401).json({ error: 'Não autenticado.' })
    return null
  }
  return session
}

export function setSessionCookie(res: any, token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}${secure}`,
  )
}

export function clearSessionCookie(res: any) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  )
}
