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

export async function checkLoginRateLimit(keys: LimitKey[]) {
  const sql = getSql()
  let retryAfterSeconds = 0

  for (const limit of keys) {
    const rows = await sql`
      SELECT blocked_until
      FROM admin_login_attempts
      WHERE key = ${limit.key}
      LIMIT 1
    `
    const blockedUntil = rows[0]?.blocked_until ? new Date(String(rows[0].blocked_until)).getTime() : 0
    const remaining = Math.ceil((blockedUntil - Date.now()) / 1000)
    if (remaining > retryAfterSeconds) retryAfterSeconds = remaining
  }

  return {
    limited: retryAfterSeconds > 0,
    retryAfterSeconds: Math.max(0, retryAfterSeconds),
  }
}

export async function recordFailedLogin(keys: LimitKey[]) {
  const sql = getSql()
  let retryAfterSeconds = 0

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
      RETURNING blocked_until
    `

    const blockedUntil = rows[0]?.blocked_until ? new Date(String(rows[0].blocked_until)).getTime() : 0
    const remaining = Math.ceil((blockedUntil - Date.now()) / 1000)
    if (remaining > retryAfterSeconds) retryAfterSeconds = remaining
  }

  return {
    limited: retryAfterSeconds > 0,
    retryAfterSeconds: Math.max(0, retryAfterSeconds),
  }
}

export async function clearLoginFailures(keys: LimitKey[]) {
  const sql = getSql()
  for (const limit of keys) {
    await sql`DELETE FROM admin_login_attempts WHERE key = ${limit.key}`
  }
}

export async function cleanupOldLoginAttempts() {
  const sql = getSql()
  await sql`DELETE FROM admin_login_attempts WHERE updated_at < now() - interval '24 hours'`
}

