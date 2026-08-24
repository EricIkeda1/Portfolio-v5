import { neon } from '@neondatabase/serverless'

const DEFAULT_PROFILE_IMAGE = 'https://drive.google.com/thumbnail?id=18I4wMhuprbKT0OLBLvAvz12yAoPNQSNc&sz=w1000'
const DEFAULT_ADMIN_HASH = 'scrypt$f5d58b986bae5912a90f66a08158d67b$63d88d2b36c9474dc564149c83ea73e9cdf4e95ae5183b0480f7c510ba120715f952c061a33eff4a2489fae8eb99b11ffb662fd75b123ea07edcdbc3c36c845a'

let schemaPromise: Promise<void> | null = null

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL não configurada no servidor.')
  return neon(databaseUrl)
}

async function createSchema() {
  const sql = getSql()

  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS portfolio_settings (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      about_text TEXT NOT NULL,
      profile_image_url TEXT,
      whatsapp TEXT NOT NULL,
      email TEXT NOT NULL,
      github TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  await sql`
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
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_portfolio_projects_sort ON portfolio_projects (sort_order, id)`

  await sql`
    INSERT INTO admins (email, password_hash)
    VALUES ('admin@portfolio.dev', ${DEFAULT_ADMIN_HASH})
    ON CONFLICT (email) DO NOTHING
  `

  const insertedSettings = await sql`
    INSERT INTO portfolio_settings (id, about_text, profile_image_url, whatsapp, email, github)
    VALUES (
      1,
      ${`Meu nome é Eric, sou desenvolvedor de software e gosto de transformar ideias em projetos reais. Desenvolvo sites, sistemas e aplicações, sempre buscando criar soluções modernas, rápidas e que realmente façam a diferença para quem as utiliza.\n\nGosto de participar de todas as etapas do desenvolvimento, desde o planejamento até a entrega, cuidando tanto da experiência visual quanto da qualidade do código. Meu objetivo é criar projetos organizados, funcionais e que ofereçam a melhor experiência possível.\n\nAlém de desenvolver para clientes, também crio projetos próprios para estudar novas tecnologias, testar ideias e evoluir como desenvolvedor. Acredito que sempre existe algo novo para aprender, e cada projeto é uma oportunidade de construir soluções das quais eu possa me orgulhar.`},
      ${DEFAULT_PROFILE_IMAGE},
      '5543996369387',
      'ikedayuji.2002@gmail.com',
      'https://github.com/EricIkeda1'
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `

  if (insertedSettings.length > 0) {
    await sql`
      INSERT INTO portfolio_projects
        (name, type, description, tags, highlights, github, color, image_url, sort_order)
      VALUES
        ('Ademiconnect', 'CRM Mobile', ${'CRM Mobile desenvolvido com Flutter e Supabase, com sincronização em tempo real e funcionamento offline. Solução completa para gestão de relacionamento com clientes.'}, ${JSON.stringify(['Flutter', 'Supabase', 'Mobile'])}::jsonb, ${JSON.stringify(['Sync em tempo real', 'Modo offline', 'Flutter + Supabase'])}::jsonb, 'https://github.com/EricIkeda1/Ademiconnect', '#4285FF', NULL, 1),
        ('Temperlights', 'App Industrial', ${'Aplicativo para rastreabilidade da produção industrial, com acompanhamento em tempo real de cada etapa do processo de fabricação.'}, ${JSON.stringify(['Mobile', 'Rastreabilidade', 'Produção'])}::jsonb, ${JSON.stringify(['Rastreabilidade', 'Produção industrial', 'Tempo real'])}::jsonb, 'https://github.com/EricIkeda1/Temperlights-Mobile', '#5B9BFF', NULL, 2),
        ('X4Glass', 'Sistema Web', ${'Sistema de rastreabilidade para produção de vidros desenvolvido em equipe. Projeto colaborativo com foco em qualidade e organização de processos industriais.'}, ${JSON.stringify(['Full Stack', 'Rastreabilidade', 'Equipe'])}::jsonb, ${JSON.stringify(['Desenvolvimento em equipe', 'Rastreabilidade', 'Full Stack'])}::jsonb, 'https://github.com/EricIkeda1/X4Glass', '#7AB3FF', NULL, 3),
        ('AES', 'Criptografia', ${'Implementação completa do algoritmo AES (Advanced Encryption Standard) em Python do zero, sem bibliotecas externas. Desenvolvido na disciplina de Segurança da Informação, cobre todas as etapas: Key Expansion, SubBytes, ShiftRows, MixColumns e AddRoundKey — 10 rounds de criptografia com chave de 128 bits.'}, ${JSON.stringify(['Python', 'Cibersegurança', 'Algoritmos'])}::jsonb, ${JSON.stringify(['AES 128-bit', 'Python puro', 'Cibersegurança'])}::jsonb, 'https://github.com/EricIkeda1/AES', '#A78BFF', NULL, 4)
    `
  }
}

export async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = createSchema().catch((error) => {
      schemaPromise = null
      throw error
    })
  }
  await schemaPromise
}

function normalizeJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.map(String) : []
    } catch {
      return []
    }
  }
  return []
}

export function normalizeProject(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    name: String(row.name ?? ''),
    type: String(row.type ?? ''),
    description: String(row.description ?? ''),
    tags: normalizeJsonArray(row.tags),
    highlights: normalizeJsonArray(row.highlights),
    github: String(row.github ?? ''),
    color: String(row.color ?? '#4285FF'),
    image_url: row.image_url ? String(row.image_url) : null,
    sort_order: Number(row.sort_order ?? 0),
    published: row.published !== false,
  }
}

export async function readPortfolioContent(includeUnpublished = false) {
  await ensureSchema()
  const sql = getSql()
  const settingsRows = await sql`
    SELECT about_text, profile_image_url, whatsapp, email, github
    FROM portfolio_settings
    WHERE id = 1
    LIMIT 1
  `

  const projects = includeUnpublished
    ? await sql`SELECT * FROM portfolio_projects ORDER BY sort_order ASC, id ASC`
    : await sql`SELECT * FROM portfolio_projects WHERE published = true ORDER BY sort_order ASC, id ASC`

  const settings = settingsRows[0] ?? {}
  return {
    about_text: String(settings.about_text ?? ''),
    profile_image_url: settings.profile_image_url ? String(settings.profile_image_url) : DEFAULT_PROFILE_IMAGE,
    whatsapp: String(settings.whatsapp ?? ''),
    email: String(settings.email ?? ''),
    github: String(settings.github ?? ''),
    projects: projects.map((row) => normalizeProject(row as Record<string, unknown>)),
  }
}
