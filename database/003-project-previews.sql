-- Migração aditiva. Executada somente ao gerar a primeira prévia; preserva a capa publicada.
CREATE TABLE IF NOT EXISTS portfolio_project_previews (
  id UUID PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  image_base64 TEXT NOT NULL,
  media_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_revision TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_previews_project ON portfolio_project_previews (project_id, created_at DESC);
CREATE TABLE IF NOT EXISTS portfolio_preview_locks (
  project_id INTEGER PRIMARY KEY REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  locked_until TIMESTAMPTZ NOT NULL
);
