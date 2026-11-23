import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { getSql } from './db.js'
import { getSessionSecret } from './auth.js'
import { allowMethods } from './http.js'
import { enforceSameOrigin, requireJson, getClientIp } from './security.js'
let schema: Promise<void> | null = null
const hash = (value: string) => createHmac('sha256', getSessionSecret()).update(value).digest('hex')
export function validRating(value: unknown): value is number { return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 5 }
async function ensureRatings() {
  if (!schema) schema = (async () => {
    const sql = getSql()
    await sql`CREATE TABLE IF NOT EXISTS portfolio_ratings (voter_key TEXT PRIMARY KEY, rating SMALLINT NOT NULL CHECK(rating BETWEEN 0 AND 5), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`
    await sql`CREATE TABLE IF NOT EXISTS portfolio_rating_limits (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, started_at TIMESTAMPTZ NOT NULL DEFAULT now())`
  })().catch(error => { schema = null; throw error })
  return schema
}
export async function ratingsHandler(req: any, res: any) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return
  if (req.method === 'POST' && (!enforceSameOrigin(req, res) || !requireJson(req, res))) return
  if (req.method === 'POST' && !validRating(req.body?.rating)) return res.status(400).json({ error: 'invalid_rating' })
  try {
    const cookie = String(req.headers?.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('portfolio_voter='))?.slice(16)
    let id = cookie?.split('.')[0] || ''
    const signature = cookie?.split('.')[1] || ''
    const valid = /^[a-f0-9-]{36}$/.test(id) && /^[a-f0-9]{64}$/.test(signature) && timingSafeEqual(Buffer.from(signature), Buffer.from(hash(`rating-cookie:${id}`)))
    if (!valid) {
      if (req.method === 'POST') return res.status(403).json({ error: 'cookies_required' })
      id = randomUUID()
      res.setHeader('Set-Cookie', `portfolio_voter=${id}.${hash(`rating-cookie:${id}`)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`)
    }
    await ensureRatings()
    const sql = getSql(), voter = hash(`rating-voter:${id}`)
    if (req.method === 'POST') {
      const ip = hash(`rating-limit:${getClientIp(req)}`)
      const rows = await sql`
        WITH allowed AS (
          INSERT INTO portfolio_rating_limits (key, attempts) VALUES (${ip}, 1)
          ON CONFLICT (key) DO UPDATE SET
            attempts = CASE WHEN portfolio_rating_limits.started_at < now() - interval '1 day' THEN 1 ELSE portfolio_rating_limits.attempts + 1 END,
            started_at = CASE WHEN portfolio_rating_limits.started_at < now() - interval '1 day' THEN now() ELSE portfolio_rating_limits.started_at END
          WHERE portfolio_rating_limits.attempts < 20 OR portfolio_rating_limits.started_at < now() - interval '1 day'
          RETURNING key
        )
        INSERT INTO portfolio_ratings (voter_key, rating) SELECT ${voter}, ${req.body.rating} FROM allowed
        ON CONFLICT (voter_key) DO UPDATE SET rating = EXCLUDED.rating, updated_at = now() RETURNING rating
      `
      if (!rows.length) return res.status(429).json({ error: 'rate_limited' })
      await sql`DELETE FROM portfolio_rating_limits WHERE started_at < now() - interval '2 days'`.catch(() => {})
    }
    const [summary] = await sql`SELECT count(*)::int AS total, round(avg(rating), 1)::float AS average FROM portfolio_ratings`
    const [mine] = await sql`SELECT rating FROM portfolio_ratings WHERE voter_key = ${voter}`
    return res.status(200).json({ total: summary.total, average: summary.average, mine: mine?.rating ?? null })
  } catch { return res.status(503).json({ error: 'unavailable' }) }
}
