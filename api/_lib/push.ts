import webpush, { type PushSubscription } from 'web-push'
import { getSql } from './db.js'

let schemaPromise: Promise<void> | null = null
export async function ensurePushSchema() {
  if (!schemaPromise) schemaPromise = (async () => {
    const sql = getSql()
    await sql`CREATE TABLE IF NOT EXISTS admin_push_config (
      id INTEGER PRIMARY KEY CHECK (id = 1), public_key TEXT NOT NULL, private_key TEXT NOT NULL
    )`
    await sql`CREATE TABLE IF NOT EXISTS admin_push_subscriptions (
      endpoint TEXT PRIMARY KEY, p256dh TEXT NOT NULL, auth TEXT NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT true, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_sent_at TIMESTAMPTZ, last_error TEXT
    )`
  })().catch(error => { schemaPromise = null; throw error })
  await schemaPromise
}

export async function getPushKeys() {
  await ensurePushSchema()
  const sql = getSql()
  let rows = await sql`SELECT public_key, private_key FROM admin_push_config WHERE id = 1`
  if (!rows.length) {
    const keys = webpush.generateVAPIDKeys()
    await sql`INSERT INTO admin_push_config (id, public_key, private_key)
      VALUES (1, ${keys.publicKey}, ${keys.privateKey}) ON CONFLICT (id) DO NOTHING`
    rows = await sql`SELECT public_key, private_key FROM admin_push_config WHERE id = 1`
  }
  return { publicKey: String(rows[0].public_key), privateKey: String(rows[0].private_key) }
}

export function validPushEndpoint(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false
  try {
    const url = new URL(value)
    const host = url.hostname
    return url.protocol === 'https:' && (!url.port || url.port === '443') && !url.username && !url.password && (
      host === 'fcm.googleapis.com' || host === 'updates.push.services.mozilla.com' ||
      host.endsWith('.push.apple.com') || host.endsWith('.notify.windows.com') || host.endsWith('.notify.live.net')
    )
  } catch { return false }
}

export function cleanPushSubscription(value: unknown): PushSubscription | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Partial<PushSubscription>
  if (!validPushEndpoint(item.endpoint) || !item.keys || typeof item.keys.p256dh !== 'string' || typeof item.keys.auth !== 'string') return null
  if (!/^[\w\-+/=]{80,100}$/.test(item.keys.p256dh) || !/^[\w\-+/=]{20,24}$/.test(item.keys.auth)) return null
  const key = Buffer.from(item.keys.p256dh, 'base64url')
  if (key.length !== 65 || key[0] !== 4 || Buffer.from(item.keys.auth, 'base64url').length !== 16) return null
  return { endpoint: item.endpoint, keys: { p256dh: item.keys.p256dh, auth: item.keys.auth } }
}

export async function sendDevicePush(subscription: PushSubscription, messageId?: number, keys?: { publicKey: string; privateKey: string }, source: 'portfolio' | 'personal' = 'portfolio') {
  const resolvedKeys = keys ?? await getPushKeys()
  await webpush.sendNotification(subscription, JSON.stringify({
    title: messageId ? (source === 'personal' ? 'Novo recado pessoal' : 'Novo contato no portfólio') : 'Notificações ativadas',
    source,
    body: messageId ? (source === 'personal' ? 'Um recadinho chegou na sua caixa pessoal.' : 'Você recebeu um novo contato no portfólio.') : 'Este aparelho já pode receber avisos de novos contatos.',
    tag: messageId ? `contact-${messageId}` : 'push-test',
  }), { vapidDetails: { subject: 'https://www.ericyikeda.com.br/', ...resolvedKeys }, TTL: 3600, timeout: 3000, urgency: 'high' })
}

export async function notifyNewContact(messageId: number, source: 'portfolio' | 'personal' = 'portfolio') {
  await ensurePushSchema()
  const sql = getSql()
  const devices = await sql`SELECT endpoint, p256dh, auth FROM admin_push_subscriptions WHERE enabled = true ORDER BY updated_at DESC LIMIT 20`
  if (!devices.length) return
  const keys = await getPushKeys()
  await Promise.allSettled(devices.map(async device => {
    const endpoint = String(device.endpoint)
    if (!validPushEndpoint(endpoint)) return
    try {
      await sendDevicePush({ endpoint, keys: { p256dh: String(device.p256dh), auth: String(device.auth) } }, messageId, keys, source)
      await sql`UPDATE admin_push_subscriptions SET last_sent_at = now(), last_error = NULL WHERE endpoint = ${endpoint}`
    } catch (error) {
      const status = Number((error as { statusCode?: number }).statusCode || 0)
      const expired = status === 404 || status === 410
      const description = expired ? 'A inscrição expirou. Ative novamente neste aparelho.' : 'Falha ao entregar o aviso. Use Testar notificação para conferir a conexão.'
      await sql`UPDATE admin_push_subscriptions SET enabled = ${!expired}, last_error = ${description} WHERE endpoint = ${endpoint}`
    }
  }))
}
