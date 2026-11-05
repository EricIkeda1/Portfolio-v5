// Execute somente com DATABASE_URL de uma branch isolada de teste.
import assert from 'node:assert/strict'
import { seedSecurityAdmin } from './security-fixtures.mjs'
import { createServer } from 'vite'
import webpush from 'web-push'

if (process.env.CONTACT_TEST_DATABASE !== '1' || !process.env.DATABASE_URL) {
  throw new Error('Configure uma branch Neon de teste e CONTACT_TEST_DATABASE=1 antes de executar.')
}

const timeout = setTimeout(() => {
  console.error('O teste excedeu 600 segundos. Verifique o acesso à branch isolada do Neon.')
  process.exit(1)
}, 600000)
timeout.unref()

// A cloned database may contain real push subscriptions: never contact them in tests.
const originalSend = webpush.sendNotification
webpush.sendNotification = async () => ({ statusCode: 201, headers: {}, body: '' })
const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
try {
  const { default: contact } = await server.ssrLoadModule('/api/contact.ts')
  const { default: inbox } = await server.ssrLoadModule('/api/admin-messages.ts')
  const { createSessionToken } = await server.ssrLoadModule('/api/_lib/auth.ts')
  const { getSql } = await server.ssrLoadModule('/api/_lib/db.ts')
  const { ensureContactSchema } = await server.ssrLoadModule('/api/_lib/contact.ts')
  const { decryptContact } = await server.ssrLoadModule('/api/_lib/contact-crypto.ts')
  process.env.NODE_ENV = 'production'
  const adminUser = await seedSecurityAdmin(server)
  const cookie = `portfolio_admin_session=${await createSessionToken(adminUser)}`
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
  const saved = await sql`SELECT id, name, email, message, private_payload FROM contact_messages WHERE private_payload IS NOT NULL ORDER BY id DESC LIMIT 1`
  assert.equal(saved[0].name, '[protegido]')
  assert.equal(saved[0].email, '[protegido]')
  assert.equal(saved[0].message, '[conteúdo protegido]')
  assert.deepEqual(decryptContact(saved[0].private_payload), { name: valid.name, email: valid.email, message: valid.message })
  const admin = { headers: { cookie } }
  let list = await call(inbox, 'GET', undefined, admin)
  assert.equal(list.statusCode, 200)
  assert.ok(list.body.messages.some(message => message.id === saved[0].id && message.message === valid.message && message.email === valid.email))
  assert.ok(list.body.messages.every(message => !('private_payload' in message)))
  const marked = await call(inbox, 'PUT', { id: saved[0].id, read: true }, admin)
  assert.equal(marked.statusCode, 200)
  assert.ok(marked.body.read_at)
  assert.equal((await call(inbox, 'PUT', { id: saved[0].id, read: false }, admin)).body.read_at, null)
  assert.equal((await call(inbox, 'PUT', { id: saved[0].id, read: 'true' }, admin)).statusCode, 400)
  assert.equal((await call(inbox, 'PUT', { id: 2147483647, read: true }, admin)).statusCode, 404)
  const encryptionKey = process.env.CONTACT_ENCRYPTION_KEY
  delete process.env.CONTACT_ENCRYPTION_KEY
  assert.equal((await call(contact, 'POST', valid)).statusCode, 503)
  process.env.CONTACT_ENCRYPTION_KEY = encryptionKey
  const afterMissingKey = await sql`SELECT count(*)::integer AS total FROM contact_messages WHERE email = 'visitor@example.test'`
  assert.equal(afterMissingKey[0].total, 0, 'Missing key must not persist plaintext')
  const burst = await Promise.all(Array.from({ length: 6 }, () => call(contact, 'POST', valid)))
  assert.equal(burst.filter(result => result.statusCode === 201).length, 4)
  assert.equal(burst.filter(result => result.statusCode === 429).length, 2)
  assert.equal((await call(contact, 'POST', valid)).headers['Retry-After'], '900')
  await sql`INSERT INTO contact_messages (name, email, message) SELECT 'Teste de paginação', 'pagination@example.test', 'Somente teste de paginação da caixa de entrada.' FROM generate_series(1, 51)`
  list = await call(inbox, 'GET', undefined, admin)
  assert.equal(list.body.messages.length, 50)
  assert.ok(list.body.next)
  const secondPage = await call(inbox, 'GET', undefined, { ...admin, query: { before: list.body.next } })
  assert.ok(secondPage.body.messages.length > 0)
  assert.ok(secondPage.body.messages.every(message => message.id < list.body.next))
  assert.equal((await call(inbox, 'GET', undefined, { ...admin, query: { before: 'invalid' } })).statusCode, 400)
  console.log('Contato: validação, origem, autenticação, persistência, leitura, paginação e limite concorrente verificados.')
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  webpush.sendNotification = originalSend
  clearTimeout(timeout)
  // Encerra conexões HTTP ociosas do driver após os testes concluídos.
  const closeTimeout = setTimeout(() => process.exit(process.exitCode ?? 0), 2000)
  closeTimeout.unref()
  await server.close()
  clearTimeout(closeTimeout)
}
