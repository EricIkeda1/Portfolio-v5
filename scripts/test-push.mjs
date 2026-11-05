import assert from 'node:assert/strict'
import { seedSecurityAdmin } from './security-fixtures.mjs'
import { createECDH, randomBytes } from 'node:crypto'
import webpush from 'web-push'
import { createServer } from 'vite'

if (process.env.CONTACT_TEST_DATABASE !== '1' || !process.env.DATABASE_URL) throw new Error('Use apenas DATABASE_URL de uma branch isolada e CONTACT_TEST_DATABASE=1.')
const timeout = setTimeout(() => { console.error('Teste excedeu 600 segundos.'); process.exit(1) }, 600000)
timeout.unref()
const originalSend = webpush.sendNotification
const deliveries = []
// Valida assinatura e criptografia reais, sem enviar notificações a um serviço externo.
webpush.sendNotification = async (subscription, payload, options) => {
  const request = webpush.generateRequestDetails(subscription, payload, options)
  assert.ok(request.headers.Authorization)
  assert.ok(Buffer.isBuffer(request.body))
  deliveries.push(JSON.parse(payload))
  return { statusCode: 201, headers: {}, body: '' }
}
const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
try {
  const { default: admin } = await server.ssrLoadModule('/api/admin-messages.ts')
  const { default: contact } = await server.ssrLoadModule('/api/contact.ts')
  const { createSessionToken } = await server.ssrLoadModule('/api/_lib/auth.ts')
  const { cleanPushSubscription, notifyNewContact } = await server.ssrLoadModule('/api/_lib/push.ts')
  const { getSql } = await server.ssrLoadModule('/api/_lib/db.ts')
  process.env.NODE_ENV = 'production'
  const key = createECDH('prime256v1'); key.generateKeys()
  const endpoint = `https://fcm.googleapis.com/fcm/send/test-${Date.now()}`
  const subscription = { endpoint, keys: { p256dh: key.getPublicKey().toString('base64url'), auth: randomBytes(16).toString('base64url') } }
  assert.ok(cleanPushSubscription(subscription))
  for (const endpoint of ['https://127.0.0.1/x', 'http://fcm.googleapis.com/x', 'https://fcm.googleapis.com.evil.test/x', 'https://evil.test/x']) assert.equal(cleanPushSubscription({ ...subscription, endpoint }), null)
  const adminUser = await seedSecurityAdmin(server)
  const cookie = `portfolio_admin_session=${await createSessionToken(adminUser)}`
  const call = async (handler, method, body, query = {}, authenticated = true) => {
    const res = { statusCode: 200, headers: {}, status(code) { this.statusCode = code; return this }, setHeader(k,v) { this.headers[k] = v }, json(body) { this.body = body; return this } }
    await handler({ method, body, query, headers: { host: 'portfolio.test', origin: 'https://portfolio.test', 'content-type': 'application/json', 'x-forwarded-for': `push-test-${Date.now()}`, ...(authenticated ? { cookie } : {}) } }, res)
    return res
  }
  assert.equal((await call(admin, 'GET', undefined, { notifications: '1' }, false)).statusCode, 401)
  assert.equal((await call(admin, 'POST', { action: 'subscribe', subscription }, {}, false)).statusCode, 401)
  const config = await call(admin, 'GET', undefined, { notifications: '1' })
  assert.equal(config.statusCode, 200)
  assert.ok(config.body.publicKey)
  assert.equal(config.body.privateKey, undefined)
  assert.equal((await call(admin, 'GET', undefined, { notifications: '1' })).body.publicKey, config.body.publicKey)
  assert.equal((await call(admin, 'POST', { action: 'subscribe', subscription: { ...subscription, endpoint: 'https://127.0.0.1/' } })).statusCode, 400)
  assert.equal((await call(admin, 'POST', { action: 'subscribe', subscription })).statusCode, 200)
  assert.equal((await call(admin, 'POST', { action: 'status', endpoint })).body.enabled, true)
  assert.equal((await call(admin, 'POST', { action: 'test', endpoint })).statusCode, 200)
  assert.equal(deliveries.at(-1).title, 'Notificações ativadas')
  const saved = await call(contact, 'POST', { name: 'Push Integration', email: 'push@example.test', message: 'Conteúdo privado que não deve aparecer na notificação.' })
  assert.equal(saved.statusCode, 201)
  assert.equal(deliveries.at(-1).title, 'Nova mensagem no portfólio')
  assert.ok(!JSON.stringify(deliveries).includes('Conteúdo privado'))
  assert.ok(!JSON.stringify(deliveries).includes('push@example.test'))
  webpush.sendNotification = async () => { throw Object.assign(new Error('Expired'), { statusCode: 410 }) }
  await notifyNewContact(999)
  assert.equal((await call(admin, 'POST', { action: 'status', endpoint })).body.enabled, false)
  const sql = getSql()
  await sql`UPDATE admin_push_subscriptions SET enabled = true WHERE endpoint = ${endpoint}`
  assert.equal((await call(admin, 'DELETE', { endpoint })).statusCode, 200)
  assert.equal((await call(admin, 'POST', { action: 'status', endpoint })).body.enabled, false)
  const afterDisable = deliveries.length
  await notifyNewContact(1000)
  assert.equal(deliveries.length, afterDisable)
  console.log('Push: autenticação, inscrição, VAPID persistente, criptografia, envio pelo formulário, privacidade, expiração e desativação verificados.')
} catch (error) { console.error(error); process.exitCode = 1 }
finally {
  webpush.sendNotification = originalSend
  clearTimeout(timeout)
  const closeTimeout = setTimeout(() => process.exit(process.exitCode ?? 0), 2000); closeTimeout.unref()
  await server.close(); clearTimeout(closeTimeout)
}
