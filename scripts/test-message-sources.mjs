import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import { createServer } from 'vite'
import webpush from 'web-push'
const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
const originalSend = webpush.sendNotification
try {
  const { legacyMessageSource, parseMessageSource } = await server.ssrLoadModule('/api/_lib/contact.ts')
  const { encryptContact } = await server.ssrLoadModule('/api/_lib/contact-crypto.ts')
  process.env.CONTACT_ENCRYPTION_KEY = randomBytes(32).toString('hex')
  const note = { name: 'Recado anônimo', email: '', message: 'Recadinho pessoal protegido.' }
  const contact = { name: 'Recado anônimo', email: 'person@example.test', message: 'Contato profissional protegido.' }
  for (const [fields, source] of [[note, 'personal'], [contact, 'portfolio']]) {
    assert.equal(legacyMessageSource({ ...fields, id: 1 }), source)
    assert.equal(legacyMessageSource({ id: 1, name: '[protegido]', email: '[protegido]', private_payload: encryptContact(fields) }), source)
  }
  assert.equal(parseMessageSource(undefined), 'portfolio')
  assert.equal(parseMessageSource('personal'), 'personal')
  for (const value of ['all', "personal' OR true", ['personal'], null]) assert.equal(parseMessageSource(value), null)
  const protectedNote = encryptContact(note)
  delete process.env.CONTACT_ENCRYPTION_KEY
  assert.throws(() => legacyMessageSource({ private_payload: protectedNote }), 'never silently misclassify when decryption fails')
  const { sendDevicePush } = await server.ssrLoadModule('/api/_lib/push.ts')
  const payloads = []
  webpush.sendNotification = async (_subscription, payload) => { payloads.push(JSON.parse(payload)); return {} }
  for (const source of ['portfolio', 'personal']) {
    await sendDevicePush({}, 7, { publicKey: 'test', privateKey: 'test' }, source)
  }
  assert.equal(payloads[0].title, 'Novo contato no portfólio')
  assert.equal(payloads[1].title, 'Novo recado pessoal')
  assert.equal(payloads[1].source, 'personal')
  assert.ok(!JSON.stringify(payloads).includes(note.message))
  const events = {}, navigations = [], notifications = []
  const self = {
    addEventListener(name, handler) { events[name] = handler }, location: { origin: 'https://portfolio.test' },
    registration: { async showNotification(title, options) { notifications.push({ title, ...options }) } },
    clients: { async matchAll() { return [] }, async openWindow(url) { navigations.push(url) } },
  }
  vm.runInNewContext(await readFile('public/admin-notifications-sw.js', 'utf8'), { self, URL })
  for (const [source, hash] of [['personal', '#recados'], ['portfolio', '#mensagens'], ['https://evil.test', '#mensagens']]) {
    let completed
    events.push({ data: { json: () => ({ source }) }, waitUntil(p) { completed = p } }); await completed
    events.notificationclick({ notification: { data: notifications.at(-1).data, close() {} }, waitUntil(p) { completed = p } }); await completed
    assert.equal(navigations.at(-1), 'https://portfolio.test/admin' + hash)
  }
  console.log('Caixas separadas: classificação de mensagens antigas criptografadas, rejeição de fontes inválidas, conteúdo privado fora do push e destino correto das notificações verificados. Nenhum envio externo realizado.')
} finally { webpush.sendNotification = originalSend; await server.close() }
