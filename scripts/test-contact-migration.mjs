import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { createServer } from 'vite'
if (process.env.CONTACT_TEST_DATABASE !== '1' || !process.env.CONTACT_ENCRYPTION_KEY) throw new Error('Use a branch e a chave exclusivas de testes.')
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
const timeout = setTimeout(() => { console.error('Migração de teste excedeu 180 segundos.'); process.exit(1) }, 180000); timeout.unref()
try {
  const { migrateContactIdentities } = await server.ssrLoadModule('/api/_lib/contact-migration.ts')
  const { getSql } = await server.ssrLoadModule('/api/_lib/db.ts')
  const { default: admin } = await server.ssrLoadModule('/api/admin-messages.ts')
  const { createSessionToken } = await server.ssrLoadModule('/api/_lib/auth.ts')
  await migrateContactIdentities()
  assert.equal(await migrateContactIdentities(), 0)
  const sql = getSql()
  const rows = await sql`SELECT count(*)::integer AS total, count(*) FILTER (WHERE name <> '[criptografado]' OR email <> '[criptografado]' OR message <> '[criptografado]' OR name_encrypted IS NULL OR email_encrypted IS NULL OR message_encrypted IS NULL)::integer AS pending FROM contact_messages`
  assert.ok(rows[0].total > 0); assert.equal(rows[0].pending, 0)
  await assert.rejects(sql`INSERT INTO contact_messages (name, email, message) VALUES ('Texto puro', 'blocked@example.test', 'O banco deve bloquear esta gravação.')`)
  const cookie = `portfolio_admin_session=${createSessionToken({ id: 1, email: 'admin@example.test' })}`
  const read = async (authenticated = true) => {
    const res = { statusCode: 200, status(code) { this.statusCode = code; return this }, setHeader() {}, json(body) { this.body = body; return this } }
    await admin({ method: 'GET', query: {}, headers: authenticated ? { cookie } : {} }, res)
    return res
  }
  assert.equal((await read(false)).statusCode, 401)
  let result = await read()
  assert.equal(result.statusCode, 200)
  assert.ok(result.body.messages.length > 0)
  assert.ok(result.body.messages.every(item => item.name !== '[criptografado]' && item.email.includes('@') && item.message !== '[criptografado]'))
  assert.ok(!JSON.stringify(result.body).includes('name_encrypted'))
  process.env.CONTACT_ENCRYPTION_KEY = randomBytes(32).toString('hex')
  result = await read()
  assert.equal(result.statusCode, 503)
  assert.equal(result.body.messages, undefined)
  console.log(`Migração: ${rows[0].total} registros protegidos; leitura administrativa, bloqueio de texto puro, chave incorreta e idempotência verificados.`)
} catch (error) { console.error(error); process.exitCode = 1 }
finally {
  clearTimeout(timeout)
  const closeTimeout = setTimeout(() => process.exit(process.exitCode ?? 0), 2000); closeTimeout.unref()
  await server.close(); clearTimeout(closeTimeout)
}
