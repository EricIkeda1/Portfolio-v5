import { readContact } from './contact-crypto.js'
import { getSql } from './db.js'

export type MessageSource = 'portfolio' | 'personal'
export function legacyMessageSource(row: Record<string, unknown>): MessageSource {
  const fields = readContact(row)
  return fields.email === '' && fields.name === 'Recado anônimo' ? 'personal' : 'portfolio'
}
export function parseMessageSource(value: unknown): MessageSource | null {
  return value === undefined || value === 'portfolio' ? 'portfolio' : value === 'personal' ? 'personal' : null
}

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
  await sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS source TEXT`
  // Classify existing encrypted notes on the server; never persist decrypted data.
  for (;;) {
    const pending = await sql`SELECT id, name, email, private_payload FROM contact_messages WHERE source IS NULL ORDER BY id LIMIT 200`
    if (!pending.length) break
    const assignments = pending.map(row => ({ id: row.id, source: legacyMessageSource(row) }))
    await sql`UPDATE contact_messages AS message SET source = assignments.source
      FROM jsonb_to_recordset(${JSON.stringify(assignments)}::jsonb) AS assignments(id integer, source text)
      WHERE message.id = assignments.id AND message.source IS NULL`
  }
  await sql`ALTER TABLE contact_messages ALTER COLUMN source SET DEFAULT 'portfolio'`
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_messages_source_id ON contact_messages(source, id DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_messages_source_unread ON contact_messages(source) WHERE read_at IS NULL`
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
