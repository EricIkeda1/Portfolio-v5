// Execute somente com DATABASE_URL de uma branch isolada de teste.
import assert from 'node:assert/strict'
import { createServer } from 'vite'

if (process.env.CONTACT_TEST_DATABASE !== '1' || !process.env.DATABASE_URL || !process.env.CONTACT_ENCRYPTION_KEY) {
  throw new Error('Configure uma branch Neon isolada, CONTACT_ENCRYPTION_KEY de testes e CONTACT_TEST_DATABASE=1 antes de executar.')
}

const timeout = setTimeout(() => {
  console.error('O teste excedeu 360 segundos. Verifique o acesso à branch isolada do Neon.')
  process.exit(1)
}, 360000)
timeout.unref()

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { default: contact } = await server.ssrLoadModule('/api/contact.ts')
  const { default: inbox } = await server.ssrLoadModule('/api/admin-messages.ts')
  const { createSessionToken } = await server.ssrLoadModule('/api/_lib/auth.ts')
  const { getSql } = await server.ssrLoadModule('/api/_lib/db.ts')
  const { ensureContactSchema } = await server.ssrLoadModule('/api/_lib/contact.ts')
  process.env.NODE_ENV = 'production'
  const cookie = `portfolio_admin_session=${createSessionToken({ id: 1, email: 'admin@example.test' })}`
  const headers = { origin: 'https://portfolio.test', host: 'portfolio.test', 'content-type': 'application/json', 'x-forwarded-for': `test-${Date.now()}` }
  const valid = { name: 'Contato de teste', email: 'visitor@example.test', message: 'Mensagem de teste de integração, sem envio externo.', website: '' }
  const call = async (handler, method, body, options = {}) => {
    const res = { statusCode: 200, headers: {}, status(code) { this.statusCode = code; return this }, setHeader(key, value) { this.headers[key] = value }, json(value) { this.body = value; return this } }
    await handler({ method, body, headers: { ...headers, ...options.headers }, query: options.query ?? {} }, res)
    return res
  }

  assert.equal((await call(contact, 'GET')).statusCode, 405)
  assert.equal((await call(contact, 'POST', valid, { headers: { origin: 'https://other.test' } })).statusCode, 403)
  assert.equal((await call(contact, 'POST', valid, { headers: { 'content-type': 'text/plain' } })).statusCode, 415)
  assert.equal((await call(contact, 'POST', { ...valid, message: 'curta' })).statusCode, 400)
  assert.equal((await call(contact, 'POST', { ...valid, website: 'bot.test' })).statusCode, 400)
  assert.equal((await call(contact, 'POST', { ...valid, email: 'invalid' })).statusCode, 400)
  assert.equal((await call(inbox, 'GET')).statusCode, 401)
  await ensureContactSchema()
  await ensureContactSchema()
  const result = await call(contact, 'POST', valid)
  assert.equal(result.statusCode, 201)
  const sql = getSql()
  const saved = await sql`SELECT id, name, email, name_encrypted, email_encrypted, encryption_id, message, message_encrypted FROM contact_messages ORDER BY id DESC LIMIT 1`
  assert.equal(saved[0].message, '[criptografado]')
  assert.ok(saved[0].message_encrypted.startsWith('v1.'))
  assert.equal(saved[0].name, '[criptografado]')
  assert.equal(saved[0].email, '[criptografado]')
  assert.ok(saved[0].name_encrypted.startsWith('v1.'))
  assert.ok(saved[0].email_encrypted.startsWith('v1.'))
  const admin = { headers: { cookie } }
  let list = await call(inbox, 'GET', undefined, admin)
  assert.equal(list.statusCode, 200)
  assert.ok(list.body.messages.some(message => message.id === saved[0].id && message.name === valid.name && message.email === valid.email && message.message === valid.message))
  assert.ok(!JSON.stringify(list.body).includes('name_encrypted'))
  const marked = await call(inbox, 'PUT', { id: saved[0].id, read: true }, admin)
  assert.equal(marked.statusCode, 200)
  assert.ok(marked.body.read_at)
  assert.equal((await call(inbox, 'PUT', { id: saved[0].id, read: false }, admin)).body.read_at, null)
  assert.equal((await call(inbox, 'PUT', { id: saved[0].id, read: 'true' }, admin)).statusCode, 400)
  assert.equal((await call(inbox, 'PUT', { id: 2147483647, read: true }, admin)).statusCode, 404)
  const burst = await Promise.all(Array.from({ length: 6 }, () => call(contact, 'POST', valid)))
  assert.equal(burst.filter(result => result.statusCode === 201).length, 4)
  assert.equal(burst.filter(result => result.statusCode === 429).length, 2)
  assert.equal((await call(contact, 'POST', valid)).headers['Retry-After'], '900')
  const { encryptContactData, encryptContactIdentity } = await server.ssrLoadModule('/api/_lib/contact-encryption.ts')
  await sql.transaction(Array.from({ length: 51 }, () => {
    const identity = encryptContactData('Teste de paginação', 'pagination@example.test', 'Somente teste de paginação da caixa de entrada.')
    return sql`INSERT INTO contact_messages (name, email, message, name_encrypted, email_encrypted, message_encrypted, encryption_id) VALUES ('[criptografado]', '[criptografado]', '[criptografado]', ${identity.name}, ${identity.email}, ${identity.message}, ${identity.recordId}::uuid)`
  }))
  const protectedSchema = await sql`SELECT 1 FROM pg_constraint WHERE conname = 'contact_identity_protected' AND conrelid = 'contact_messages'::regclass`
  if (!protectedSchema.length) await sql`INSERT INTO contact_messages (name, email, message) VALUES ('Contato legado', 'migration@example.test', 'Registro antigo para teste da migração.')`
  const protectedPayload = await sql`SELECT 1 FROM pg_constraint WHERE conname = 'contact_payload_protected' AND conrelid = 'contact_messages'::regclass`
  if (!protectedPayload.length) {
    const oldIdentity = encryptContactIdentity('Identidade já protegida', 'partial@example.test')
    await sql`INSERT INTO contact_messages (name, email, message, name_encrypted, email_encrypted, encryption_id) VALUES ('[criptografado]', '[criptografado]', 'Mensagem da versão que criptografava apenas a identidade.', ${oldIdentity.name}, ${oldIdentity.email}, ${oldIdentity.recordId}::uuid)`
  }
  list = await call(inbox, 'GET', undefined, admin)
  assert.equal(list.body.messages.length, 50)
  assert.ok(list.body.next)
  const secondPage = await call(inbox, 'GET', undefined, { ...admin, query: { before: list.body.next } })
  assert.ok(secondPage.body.messages.length > 0)
  assert.ok(secondPage.body.messages.every(message => message.id < list.body.next))
  assert.equal((await call(inbox, 'GET', undefined, { ...admin, query: { before: 'invalid' } })).statusCode, 400)
  const { migrateContactIdentities } = await server.ssrLoadModule('/api/_lib/contact-migration.ts')
  const pending = await sql`SELECT count(*)::integer AS total FROM contact_messages WHERE name_encrypted IS NULL OR message_encrypted IS NULL`
  assert.equal(await migrateContactIdentities(), Number(pending[0].total))
  assert.equal(await migrateContactIdentities(), 0)
  const raw = await sql`SELECT count(*)::integer AS count FROM contact_messages WHERE name <> '[criptografado]' OR email <> '[criptografado]' OR message <> '[criptografado]' OR name_encrypted IS NULL OR email_encrypted IS NULL OR message_encrypted IS NULL`
  assert.equal(Number(raw[0].count), 0)
  await assert.rejects(sql`INSERT INTO contact_messages (name, email, message) VALUES ('Texto puro', 'blocked@example.test', 'O banco deve bloquear esta gravação.')`)
  list = await call(inbox, 'GET', undefined, admin)
  assert.equal(list.statusCode, 200)
  assert.ok(list.body.messages.some(message => message.email === 'pagination@example.test'))
  console.log('Contato: validação, origem, autenticação, persistência, leitura, paginação limite concorrente, dados criptografados e migração idempotente verificados.')
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  clearTimeout(timeout)
  // Encerra conexões HTTP ociosas do driver após os testes concluídos.
  const closeTimeout = setTimeout(() => process.exit(process.exitCode ?? 0), 2000)
  closeTimeout.unref()
  await server.close()
  clearTimeout(closeTimeout)
}
