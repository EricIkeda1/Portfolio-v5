-- Estrutura usada pelo Portfolio v5 no Neon.
-- O backend também cria essas tabelas automaticamente na primeira requisição.

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  about_text TEXT NOT NULL,
  profile_image_url TEXT,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  github TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  github TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#4285FF',
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_sort
  ON portfolio_projects (sort_order, id);
