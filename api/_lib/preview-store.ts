import { getSql } from './db.js'
let ready: Promise<void> | null = null
// Migração aditiva 003, independente das tabelas e registros existentes.
export async function ensurePreviewSchema() {
  if (!ready) ready = (async () => {
    const sql = getSql()
    await sql.transaction([
      sql`CREATE TABLE IF NOT EXISTS portfolio_project_previews (id UUID PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE, image_base64 TEXT NOT NULL, media_type TEXT NOT NULL, source_url TEXT NOT NULL, source_revision TEXT NOT NULL DEFAULT '', model TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
      sql`CREATE INDEX IF NOT EXISTS idx_project_previews_project ON portfolio_project_previews (project_id, created_at DESC)`,
      sql`CREATE TABLE IF NOT EXISTS portfolio_preview_locks (project_id INTEGER PRIMARY KEY REFERENCES portfolio_projects(id) ON DELETE CASCADE, locked_until TIMESTAMPTZ NOT NULL)`,
    ])
  })().catch((error) => { ready = null; throw error })
  await ready
}
