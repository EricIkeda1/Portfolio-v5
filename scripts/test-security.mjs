import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { createServer } from 'vite'
import { seedSecurityAdmin } from './security-fixtures.mjs'

if (process.env.CONTACT_TEST_DATABASE !== '1' || !process.env.DATABASE_URL || !process.env.CONTACT_ENCRYPTION_KEY) {
  throw new Error('Use somente uma branch isolada com CONTACT_TEST_DATABASE=1 e segredos de teste.')
}
const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
let cold
try {
  const auth = await server.ssrLoadModule('/api/_lib/auth.ts')
  const { encryptContact, decryptContact } = await server.ssrLoadModule('/api/_lib/contact-crypto.ts')
  const { getSql } = await server.ssrLoadModule('/api/_lib/db.ts')
  const { default: logout } = await server.ssrLoadModule('/api/admin-logout.ts')
  const { default: credentials } = await server.ssrLoadModule('/api/admin-credentials.ts')
  const { default: session } = await server.ssrLoadModule('/api/admin-session.ts')
  const { default: login } = await server.ssrLoadModule('/api/admin-login.ts')
  process.env.NODE_ENV = 'production'
  const sql = getSql()
  const user = await seedSecurityAdmin(server)
  const origin = 'https://portfolio.test'
  const request = (token, method = 'GET', body) => ({ method, body, headers: {
    host: 'portfolio.test', origin, 'content-type': 'application/json',
    'x-forwarded-for': `security-test-${user.id}`, cookie: token ? `portfolio_admin_session=${token}` : '',
  } })
  const call = async (handler, req) => {
    const res = { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v }, status(code) { this.statusCode = code; return this }, json(body) { this.body = body; return this } }
    await handler(req, res)
    return res
  }
  const cookieToken = res => decodeURIComponent(res.headers['Set-Cookie'].match(/^portfolio_admin_session=([^;]+)/)[1])

  const fields = { name: 'João 日本語', email: 'security@example.invalid', message: '<script>teste</script> Mensagem privada 🔒' }
  const encrypted = encryptContact(fields)
  assert.notEqual(encrypted, encryptContact(fields), 'Random IV for each encryption')
  assert.deepEqual(decryptContact(encrypted), fields)
  assert.ok(!encrypted.includes(fields.email))
  assert.throws(() => decryptContact(encrypted.slice(0, -5) + 'AAAAA'))
  assert.throws(() => decryptContact('plaintext'))
  const key = process.env.CONTACT_ENCRYPTION_KEY
  process.env.CONTACT_ENCRYPTION_KEY = '00'.repeat(32)
  assert.throws(() => decryptContact(encrypted))
  delete process.env.CONTACT_ENCRYPTION_KEY
  assert.throws(() => encryptContact(fields), 'Missing key must fail closed')
  process.env.CONTACT_ENCRYPTION_KEY = key

  const signedLegacy = Buffer.from(JSON.stringify({ id: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')
  const legacyToken = `${signedLegacy}.${createHmac('sha256', process.env.SESSION_SECRET).update(signedLegacy).digest('base64url')}`
  assert.equal((await call(session, request(legacyToken))).statusCode, 401)
  const authenticated = await call(login, request(null, 'POST', { email: user.email, password: user.password }))
  assert.equal(authenticated.statusCode, 200)
  const token = cookieToken(authenticated)
  assert.match(authenticated.headers['Set-Cookie'], /HttpOnly; SameSite=Strict/)
  assert.match(authenticated.headers['Set-Cookie'], /; Secure/)
  assert.equal((await call(session, request(token))).statusCode, 200)
  assert.equal((await call(session, request(token + 'x'))).statusCode, 401)
  console.log('Sessão: login e rejeição de adulteração verificados.')
  const otherToken = await auth.createSessionToken(user)
  assert.equal((await call(logout, request(token, 'POST'))).statusCode, 200)
  assert.equal((await call(session, request(token))).statusCode, 401, 'Copied token cannot be replayed after logout')
  assert.equal((await call(session, request(otherToken))).statusCode, 200, 'Logout only revokes its own session')
  console.log('Sessão: replay após logout bloqueado.')
  const nextEmail = `changed-${user.id}@example.invalid`
  const changed = await call(credentials, request(otherToken, 'PUT', { current_password: user.password, email: nextEmail, new_password: 'new-security-password-test-only' }))
  assert.equal(changed.statusCode, 200)
  const newToken = cookieToken(changed)
  assert.equal((await call(session, request(otherToken))).statusCode, 401, 'Credential change revokes other sessions')
  assert.equal((await call(session, request(newToken))).statusCode, 200)
  await assert.rejects(auth.createSessionToken(user), 'Stale login cannot issue a session after a credential change')
  console.log('Sessão: troca de credenciais revogou os tokens antigos.')
  const before = await sql`SELECT password_hash FROM admins WHERE id = ${user.id}`
  process.env.ADMIN_EMAIL = user.email
  process.env.ADMIN_PASSWORD_HASH = user.password_hash
  cold = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
  const { ensureSchema } = await cold.ssrLoadModule('/api/_lib/db.ts')
  await ensureSchema()
  const after = await sql`SELECT email, password_hash FROM admins WHERE id = ${user.id}`
  assert.equal(after[0].password_hash, before[0].password_hash, 'Cold start cannot restore bootstrap password')
  assert.equal(after[0].email, nextEmail)
  const recreated = await sql`SELECT count(*)::integer AS total FROM admins WHERE email = ${user.email}`
  assert.equal(recreated[0].total, 0, 'Bootstrap cannot recreate the previous email')
  const stored = await sql`SELECT token_hash FROM admin_sessions WHERE admin_id = ${user.id}`
  assert.ok(stored.length > 0)
  assert.ok(stored.every(row => /^[a-f0-9]{64}$/.test(row.token_hash) && row.token_hash !== auth.verifySessionToken(newToken).sid))
  await sql`DELETE FROM admins WHERE id = ${user.id}`
  assert.equal((await call(session, request(newToken))).statusCode, 401, 'Removed administrators lose access')
  console.log('Segurança: login, replay após logout, revogação após troca, bootstrap, cookies, tokens adulterados e criptografia autenticada verificados.')
} finally {
  await cold?.close()
  await server.close()
}
