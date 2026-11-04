import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'

const handlers = new Map()
let shown, opened, pending
const self = {
  location: { origin: 'https://portfolio.test' },
  addEventListener(name, handler) { handlers.set(name, handler) },
  registration: { async showNotification(title, options) { shown = { title, options } } },
  clients: { async matchAll() { return [] }, async openWindow(url) { opened = url }, async claim() {} },
  skipWaiting() {},
}
runInNewContext(await readFile('public/admin-notifications-sw.js', 'utf8'), { self, URL })
assert.equal(handlers.has('fetch'), false)
handlers.get('push')({ data: { json() { return { title: 'Novo contato', body: 'Aviso genérico', tag: 'contact-1' } } }, waitUntil(promise) { pending = promise } })
await pending
assert.equal(shown.title, 'Novo contato')
assert.equal(shown.options.body, 'Aviso genérico')
assert.equal(shown.options.data.url, '/admin#mensagens')
handlers.get('push')({ data: { json() { throw new Error('JSON inválido') } }, waitUntil(promise) { pending = promise } })
await pending
assert.equal(shown.title, 'Nova mensagem no portfólio')
handlers.get('notificationclick')({ notification: { close() {} }, waitUntil(promise) { pending = promise } })
await pending
assert.equal(opened, 'https://portfolio.test/admin#mensagens')
let focused = false, navigated, message
self.clients.matchAll = async () => [{ url: 'https://portfolio.test/admin', async navigate(url) { navigated = url }, postMessage(value) { message = value }, async focus() { focused = true } }]
handlers.get('notificationclick')({ notification: { close() {} }, waitUntil(promise) { pending = promise } })
await pending
assert.ok(focused)
assert.equal(navigated, opened)
assert.equal(message.type, 'OPEN_PORTFOLIO_MESSAGES')
console.log('Worker: exibição, fallback, abertura e reutilização do painel verificados; sem cache de páginas privadas.')
