import { createHmac } from 'node:crypto'
import { getSessionSecret } from './auth.js'
import { getSql } from './db.js'
import { getClientIp } from './security.js'


type LimitKey = {
  key: string
  maxAttempts: number
  blockSeconds: number
}

function digest(kind: 'ip' | 'email', value: string) {
  return createHmac('sha256', getSessionSecret())
    .update(`${kind}:${value}`)
    .digest('hex')
}

export function loginRateLimitKeys(req: any, email: string): LimitKey[] {
  const ip = getClientIp(req)
  return [
    { key: `ip:${digest('ip', ip)}`, maxAttempts: 5, blockSeconds: 15 * 60 },
    // Limite por conta é mais alto para reduzir o risco de alguém bloquear o administrador só por conhecer o e-mail.
    { key: `email:${digest('email', email.trim().toLowerCase())}`, maxAttempts: 30, blockSeconds: 5 * 60 },
  ]
}

export async function reserveLoginAttempt(keys: LimitKey[]) {
  const sql = getSql()
  const reservations: { key: string; version: string }[] = []
  let failureDelay = 0
  for (const limit of keys) {
    const rows = await sql`
      INSERT INTO admin_login_attempts (key, attempt_count, window_started_at, blocked_until, updated_at)
      VALUES (${limit.key}, 1, now(), NULL, now())
      ON CONFLICT (key) DO UPDATE
      SET attempt_count = CASE
            WHEN admin_login_attempts.window_started_at <= now() - interval '15 minutes' THEN 1
            ELSE admin_login_attempts.attempt_count + 1
          END,
          window_started_at = CASE
            WHEN admin_login_attempts.window_started_at <= now() - interval '15 minutes' THEN now()
            ELSE admin_login_attempts.window_started_at
          END,
          blocked_until = CASE
            WHEN admin_login_attempts.blocked_until > now() THEN admin_login_attempts.blocked_until
            WHEN (
              CASE
                WHEN admin_login_attempts.window_started_at <= now() - interval '15 minutes' THEN 1
                ELSE admin_login_attempts.attempt_count + 1
              END
            ) >= ${limit.maxAttempts} THEN now() + (${limit.blockSeconds} * interval '1 second')
            ELSE NULL
          END,
          updated_at = now()
      WHERE admin_login_attempts.blocked_until IS NULL OR admin_login_attempts.blocked_until <= now()
      RETURNING updated_at::text AS version, blocked_until
    `
    if (!rows.length) {
      const [row] = await sql`
        SELECT ceil(extract(epoch FROM blocked_until - now())) AS remaining
        FROM admin_login_attempts WHERE key = ${limit.key}
      `
      return { reservations, denied: true, delay: Math.max(1, Number(row?.remaining || 1)) }
    }
    reservations.push({ key: limit.key, version: String(rows[0].version) })
    if (rows[0].blocked_until) failureDelay = Math.max(failureDelay, limit.blockSeconds)
  }
  return { reservations, denied: false, delay: failureDelay }
}

export async function clearLoginFailures(reservations: { key: string; version: string }[]) {
  const sql = getSql()
  for (const { key, version } of reservations) {
    // Preserve attempts that another request reserved after this successful login.
    await sql`DELETE FROM admin_login_attempts WHERE key = ${key} AND updated_at = ${version}::timestamptz`
  }
}

export async function cleanupOldLoginAttempts() {
  const sql = getSql()
  await sql`DELETE FROM admin_login_attempts WHERE updated_at < now() - interval '24 hours'`
}

