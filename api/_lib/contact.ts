import { getSql } from './db.js'

let schemaPromise: Promise<void> | null = null

async function createContactSchema() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
      email TEXT NOT NULL CHECK (char_length(email) <= 254),
      message TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 5000),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      read_at TIMESTAMPTZ
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS contact_submission_limits (
      key TEXT PRIMARY KEY,
      attempt_count INTEGER NOT NULL DEFAULT 1,
      window_started_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS private_payload TEXT`
}

export async function ensureContactSchema() {
  if (!schemaPromise) {
    schemaPromise = createContactSchema().catch(error => {
      schemaPromise = null
      throw error
    })
  }
  await schemaPromise
}
