import { getSql } from './db.js'

export type PersonalRun = { distanceKm: number; durationSeconds: number; date: string; url: string }
export function parsePersonalRun(value: any): PersonalRun | null {
  if (!value || typeof value.distanceKm !== 'number' || !Number.isFinite(value.distanceKm) || value.distanceKm <= 0 || value.distanceKm > 500 ||
      !Number.isSafeInteger(value.durationSeconds) || value.durationSeconds <= 0 || value.durationSeconds > 604800 ||
      typeof value.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.date)) return null
  const date = new Date(value.date + 'T12:00:00Z')
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value.date || date.getTime() > Date.now() + 86400000) return null
  if (typeof value.url !== 'string' || value.url.length > 300) return null
  // Only direct activity links; reject redirects, arbitrary URLs and embedded credentials.
  if (!/^https:\/\/(?:www\.)?strava\.com\/activities\/[0-9]+$/.test(value.url)) return null
  return { distanceKm: value.distanceKm, durationSeconds: value.durationSeconds, date: value.date, url: value.url }
}
let schema: Promise<unknown> | null = null
async function ensureRunSchema() {
  if (!schema) schema = getSql()`CREATE TABLE IF NOT EXISTS personal_run (
    id INTEGER PRIMARY KEY CHECK (id = 1), payload JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`.catch(error => { schema = null; throw error })
  await schema
}
export async function readPersonalRun() {
  await ensureRunSchema()
  const rows = await getSql()`SELECT payload FROM personal_run WHERE id = 1`
  return rows[0] ? parsePersonalRun(rows[0].payload) : null
}
export async function savePersonalRun(run: PersonalRun | null) {
  await ensureRunSchema()
  const sql = getSql()
  if (!run) { await sql`DELETE FROM personal_run WHERE id = 1`; return }
  await sql`INSERT INTO personal_run (id, payload) VALUES (1, ${JSON.stringify(run)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = now()`
}
