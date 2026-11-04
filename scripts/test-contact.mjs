// Execute somente com DATABASE_URL de uma branch isolada de teste.
import assert from 'node:assert/strict'
import { createServer } from 'vite'

if (process.env.CONTACT_TEST_DATABASE !== '1' || !process.env.DATABASE_URL) {
  throw new Error('Configure uma branch Neon de teste e CONTACT_TEST_DATABASE=1 antes de executar.')
}

const timeout = setTimeout(() => {
  console.error('O teste excedeu 180 segundos. Verifique o acesso à branch isolada do Neon.')
  process.exit(1)
}, 180000)
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
  const saved = await sql`SELECT id, name, email, message FROM contact_messages WHERE email = 'visitor@example.test' ORDER BY id DESC LIMIT 1`
  assert.equal(saved[0].message, valid.message)
  assert.equal(saved[0].name, valid.name)
  const admin = { headers: { cookie } }
  let list = await call(inbox, 'GET', undefined, admin)
  assert.equal(list.statusCode, 200)
  assert.ok(list.body.messages.some(message => message.id === saved[0].id))
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
  clearTimeout(timeout)
  // Encerra conexões HTTP ociosas do driver após os testes concluídos.
  const closeTimeout = setTimeout(() => process.exit(process.exitCode ?? 0), 2000)
  closeTimeout.unref()
  await server.close()
  clearTimeout(closeTimeout)
}
