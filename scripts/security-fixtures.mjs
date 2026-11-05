import { randomBytes } from 'node:crypto'

export async function seedSecurityAdmin(server) {
  if (process.env.CONTACT_TEST_DATABASE !== '1') throw new Error('Use somente uma branch de teste.')
  const { ensureSchema, getSql } = await server.ssrLoadModule('/api/_lib/db.ts')
  const { hashPassword } = await server.ssrLoadModule('/api/_lib/auth.ts')
  await ensureSchema()
  const email = `security-${randomBytes(8).toString('hex')}@example.invalid`
  const password = randomBytes(24).toString('hex')
  const password_hash = hashPassword(password)
  const sql = getSql()
  const rows = await sql`INSERT INTO admins (email, password_hash) VALUES (${email}, ${password_hash}) RETURNING id`
  return { id: Number(rows[0].id), email, password_hash, password }
}
