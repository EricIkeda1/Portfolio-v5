import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { ensureSchema, getSql } from './db.js'

const COOKIE_NAME = 'portfolio_admin_session'
const SESSION_SECONDS = 60 * 60 * 8
const MIN_SESSION_SECRET_LENGTH = 32

type SessionPayload = {
  sid: string
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

export async function createSessionToken(user: { id: number; email: string; password_hash: string }) {
  await ensureSchema()
  const payload: SessionPayload = {
    sid: randomBytes(32).toString('hex'),
    id: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  }
  const sql = getSql()
  // The checked password must still be current when the session is issued.
  const rows = await sql`
    INSERT INTO admin_sessions (token_hash, admin_id, credential_hash, expires_at)
    SELECT ${sessionHash(payload.sid)}, id, password_hash, ${new Date(payload.exp * 1000).toISOString()}
    FROM admins WHERE id = ${user.id} AND email = ${user.email} AND password_hash = ${user.password_hash}
    RETURNING admin_id
  `
  if (!rows.length) throw new Error('Credenciais alteradas durante o login. Tente novamente.')
  await sql`DELETE FROM admin_sessions WHERE expires_at <= now()`
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encoded}.${sign(encoded)}`
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null
  if (token.length > 2048 || token.split('.').length !== 2) return null
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return null

  const expected = sign(encoded)
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload
    if (!Number.isSafeInteger(payload.id) || payload.id <= 0 || typeof payload.email !== 'string' ||
        !payload.email || !Number.isSafeInteger(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000) ||
        typeof payload.sid !== 'string' || !/^[a-f0-9]{64}$/.test(payload.sid)) return null
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

function sessionHash(sid: string) {
  return createHash('sha256').update(sid).digest('hex')
}

export async function getSessionFromRequest(req: any) {
  const cookies = parseCookies(req.headers?.cookie || '')
  try {
    const session = verifySessionToken(cookies[COOKIE_NAME])
    if (!session) return null
    await ensureSchema()
    const sql = getSql()
    const rows = await sql`
      SELECT a.id FROM admin_sessions s JOIN admins a ON a.id = s.admin_id
      WHERE s.token_hash = ${sessionHash(session.sid)} AND s.admin_id = ${session.id}
        AND s.expires_at > now() AND s.credential_hash = a.password_hash AND a.email = ${session.email}
      LIMIT 1
    `
    return rows.length ? session : null
  } catch {
    return null
  }
}

export async function revokeSessionFromRequest(req: any) {
  const session = verifySessionToken(parseCookies(req.headers?.cookie || '')[COOKIE_NAME])
  if (!session) return
  await ensureSchema()
  const sql = getSql()
  await sql`DELETE FROM admin_sessions WHERE token_hash = ${sessionHash(session.sid)}`
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

export async function requireAdmin(req: any, res: any) {
  const session = await getSessionFromRequest(req)
  if (!session) {
    res.status(401).json({ error: 'Sessão inválida ou expirada.' })
    return null
  }
  return session
}
