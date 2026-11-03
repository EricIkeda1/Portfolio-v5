import { getSql } from './_lib/db.js'
import { allowMethods, noStore } from './_lib/http.js'

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['GET'])) return
  if (!process.env.DATABASE_URL) return res.status(503).json({ ok: false, database: 'not_configured' })
  try {
    await getSql()`SELECT 1 AS ok`
    return res.status(200).json({ ok: true, database: 'connected' })
  } catch {
    return res.status(503).json({ ok: false, database: 'unavailable' })
  }
}
