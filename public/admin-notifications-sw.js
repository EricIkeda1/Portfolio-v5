// Este worker entrega avisos; não intercepta requests nem guarda páginas privadas em cache.
self.addEventListener('push', event => {
  let data = {}
  try { data = event.data?.json() || {} } catch { /* Mostra o aviso padrão mesmo sem JSON. */ }
  event.waitUntil(self.registration.showNotification(data.title || 'Nova mensagem no portfólio', {
    body: data.body || 'Toque para abrir a caixa de entrada.',
    tag: data.tag || 'portfolio-contact',
    icon: '/notification-icon.png',
    badge: '/notification-badge.png',
    data: { url: '/admin#mensagens' },
  }))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil((async () => {
    const url = new URL('/admin#mensagens', self.location.origin).href
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const client of windows) {
      if (new URL(client.url).pathname === '/admin') {
        await client.navigate(url)
        client.postMessage({ type: 'OPEN_PORTFOLIO_MESSAGES' })
        return client.focus()
      }
    }
    return self.clients.openWindow(url)
  })())
})

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))
