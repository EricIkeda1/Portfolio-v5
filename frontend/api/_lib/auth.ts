import type { VercelRequest } from '@vercel/node'
import { SignJWT, jwtVerify } from 'jose'
import { ensureDatabase, getSql } from './db'

export type AdminSession = {
  id: number
  email: string
}

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET precisa ter pelo menos 32 caracteres.')
  }
  return new TextEncoder().encode(secret)
}

export async function createAdminToken(admin: AdminSession) {
  return new SignJWT({ role: 'admin', email: admin.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(admin.id))
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecret())
}

export async function requireAdmin(req: VercelRequest): Promise<AdminSession | null> {
  const header = req.headers.authorization
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.role !== 'admin' || !payload.sub) return null

    const id = Number(payload.sub)
    if (!Number.isInteger(id) || id <= 0) return null

    await ensureDatabase()
    const sql = getSql()
    const rows = await sql`
      SELECT id, email
      FROM admin_users
      WHERE id = ${id} AND is_active = TRUE
      LIMIT 1
    `

    if (!rows[0]) return null
    return { id: Number(rows[0].id), email: String(rows[0].email) }
  } catch {
    return null
  }
}
