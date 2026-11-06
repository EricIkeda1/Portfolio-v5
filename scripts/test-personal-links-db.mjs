// Use only an isolated preview database. Push delivery is stubbed to avoid notifying real devices.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { createServer } from 'vite'
import webpush from 'web-push'
import { seedSecurityAdmin } from './security-fixtures.mjs'
if (process.env.CONTACT_TEST_DATABASE !== '1' || !process.env.DATABASE_URL) throw new Error('Use a preview database.')
process.env.CONTACT_ENCRYPTION_KEY = randomBytes(32).toString('hex')
process.env.SESSION_SECRET = randomBytes(32).toString('hex')
webpush.sendNotification = async () => ({ statusCode: 201, headers: {}, body: '' })
const timeout = setTimeout(() => { console.error('Preview database connection timed out.'); process.exit(1) }, 60000)
timeout.unref()
const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
try {
  const { default: contact } = await server.ssrLoadModule('/api/contact.ts')
  const { default: adminContent } = await server.ssrLoadModule('/api/admin-content.ts')
  const { default: content } = await server.ssrLoadModule('/api/content.ts')
  const { getSql } = await server.ssrLoadModule('/api/_lib/db.ts')
  const { decryptContact } = await server.ssrLoadModule('/api/_lib/contact-crypto.ts')
  const { createSessionToken } = await server.ssrLoadModule('/api/_lib/auth.ts')
  const admin = await seedSecurityAdmin(server)
  const cookie = `portfolio_admin_session=${await createSessionToken(admin)}`
  process.env.NODE_ENV = 'production'
  const headers = { origin: 'https://links.test', host: 'links.test', 'content-type': 'application/json', 'x-forwarded-for': `test-${randomBytes(8).toString('hex')}` }
  async function call(handler, method, body, options = {}) {
    const res = { statusCode: 200, headers: {}, setHeader(k,v) { this.headers[k]=v }, status(code) { this.statusCode=code; return this }, json(data) { this.body=data; return this } }
    await handler({ method, body, headers: { ...headers, ...options.headers }, url: options.url, query: options.query || {} }, res)
    return res
  }
  const note = { kind: 'anonymous', website: '', message: `Recado de teste isolado ${randomBytes(8).toString('hex')}` }
  assert.equal((await call(contact, 'POST', note, { headers: { origin: 'https://evil.test' } })).statusCode, 403)
  assert.equal((await call(contact, 'POST', { ...note, website: 'spam.test' })).statusCode, 400)
  assert.equal((await call(contact, 'POST', note)).statusCode, 201)
  const sql = getSql()
  const rows = await sql`SELECT name, email, message, private_payload FROM contact_messages ORDER BY id DESC LIMIT 1`
  assert.equal(rows[0].name, '[protegido]'); assert.equal(rows[0].email, '[protegido]'); assert.equal(rows[0].message, '[conteúdo protegido]')
  assert.deepEqual(decryptContact(rows[0].private_payload), { name: 'Recado anônimo', email: '', message: note.message })
  const burst = await Promise.all(Array.from({ length: 6 }, () => call(contact, 'POST', note)))
  assert.equal(burst.filter(r => r.statusCode === 201).length, 4); assert.equal(burst.filter(r => r.statusCode === 429).length, 2)
  const regular = { name: 'Teste', email: 'test@example.test', message: 'Contato normal de teste.', website: '' }
  assert.equal((await call(contact, 'POST', regular)).statusCode, 429, 'shared quota prevents switching forms to bypass limits')
  const query = { personal_run: '1' }, run = { distanceKm: 5.12, durationSeconds: 1802, date: '2026-01-03', url: 'https://www.strava.com/activities/123456789' }
  assert.equal((await call(adminContent, 'PUT', { run }, { query })).statusCode, 401)
  assert.equal((await call(adminContent, 'PUT', { run: { ...run, url: 'https://evil.test' } }, { query, headers: { cookie } })).statusCode, 400)
  assert.equal((await call(adminContent, 'PUT', { run }, { query, headers: { cookie } })).statusCode, 200)
  assert.deepEqual((await call(content, 'GET', null, { url: '/api/content?view=run' })).body, { run })
  assert.deepEqual((await call(adminContent, 'GET', null, { query, headers: { cookie } })).body, { run })
  assert.equal((await call(adminContent, 'PUT', { run: null }, { query, headers: { cookie } })).statusCode, 200)
  assert.deepEqual((await call(content, 'GET', null, { url: '/api/content?view=run' })).body, { run: null })
  console.log('Preview Neon: recado criptografado persistido; limite concorrente e compartilhado; origem; autorização admin; publicação/leitura/remoção de corrida verificados. Push real não enviado.')
} finally { clearTimeout(timeout); await server.close() }
