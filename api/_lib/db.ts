import { neon } from '@neondatabase/serverless'

const DEFAULT_LINKEDIN = 'https://www.linkedin.com/in/ericikeda1'
const DEFAULT_RESUME_URL = 'https://drive.google.com/file/d/1VTpI8VouOdHnPuDKxZmskY_02dhK2wIC/view?usp=sharing'
const DEFAULT_PROFILE_IMAGE = 'https://drive.google.com/thumbnail?id=18I4wMhuprbKT0OLBLvAvz12yAoPNQSNc&sz=w1000'

let schemaPromise: Promise<void> | null = null

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL não configurada no servidor.')
  return neon(databaseUrl)
}

async function createSchema() {
  const sql = getSql()

  await sql.transaction([
    sql`CREATE TABLE IF NOT EXISTS admins (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_email_lower ON admins (lower(email))`,
    sql`CREATE TABLE IF NOT EXISTS admin_login_attempts (key TEXT PRIMARY KEY, attempt_count INTEGER NOT NULL DEFAULT 0, window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(), blocked_until TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    sql`CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_updated ON admin_login_attempts (updated_at)`,
    sql`CREATE TABLE IF NOT EXISTS portfolio_settings (id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), about_text TEXT NOT NULL, profile_image_url TEXT, whatsapp TEXT NOT NULL, email TEXT NOT NULL, github TEXT NOT NULL, linkedin TEXT NOT NULL DEFAULT 'https://www.linkedin.com/in/ericikeda1', resume_url TEXT NOT NULL DEFAULT '', updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    sql`ALTER TABLE portfolio_settings ADD COLUMN IF NOT EXISTS linkedin TEXT NOT NULL DEFAULT 'https://www.linkedin.com/in/ericikeda1'`,
    sql`ALTER TABLE portfolio_settings ADD COLUMN IF NOT EXISTS resume_url TEXT NOT NULL DEFAULT ''`,
    sql`CREATE TABLE IF NOT EXISTS portfolio_projects (id SERIAL PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, description TEXT NOT NULL, tags JSONB NOT NULL DEFAULT '[]'::jsonb, highlights JSONB NOT NULL DEFAULT '[]'::jsonb, github TEXT NOT NULL DEFAULT '', color TEXT NOT NULL DEFAULT '#1260eb', image_url TEXT, sort_order INTEGER NOT NULL DEFAULT 0, published BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
    sql`ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS demo_url TEXT NOT NULL DEFAULT ''`,
    sql`ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'auto'`,
    sql`CREATE INDEX IF NOT EXISTS idx_portfolio_projects_sort ON portfolio_projects (sort_order, id)`,
  ])

  const bootstrapEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const bootstrapHash = process.env.ADMIN_PASSWORD_HASH?.trim()
  if (bootstrapEmail && bootstrapHash && /^scrypt\$[a-f0-9]+\$[a-f0-9]{128}$/i.test(bootstrapHash)) {
    // Bootstrap cria a conta apenas uma vez; não redefine senhas já alteradas no painel.
    await sql`
      INSERT INTO admins (email, password_hash)
      VALUES (${bootstrapEmail}, ${bootstrapHash})
      ON CONFLICT DO NOTHING
    `
  }

  const insertedSettings = await sql`
    INSERT INTO portfolio_settings (id, about_text, profile_image_url, whatsapp, email, github, linkedin, resume_url)
    VALUES (
      1,
      ${`Meu nome é Eric, sou desenvolvedor web e gosto de transformar ideias em projetos reais. Desenvolvo sites, sistemas e aplicações, sempre buscando criar soluções modernas, rápidas e que realmente façam a diferença para quem as utiliza.\n\nGosto de participar de todas as etapas do desenvolvimento, desde o planejamento até a entrega, cuidando tanto da experiência visual quanto da qualidade do código. Meu objetivo é criar projetos organizados, funcionais e que ofereçam a melhor experiência possível.\n\nAlém de desenvolver para clientes, também crio projetos próprios para estudar novas tecnologias, testar ideias e evoluir como desenvolvedor. Acredito que sempre existe algo novo para aprender, e cada projeto é uma oportunidade de construir soluções das quais eu possa me orgulhar.`},
      ${DEFAULT_PROFILE_IMAGE},
      '5543996369387',
      'ikedayuji.2002@gmail.com',
      'https://github.com/EricIkeda1',
      ${DEFAULT_LINKEDIN},
      ${DEFAULT_RESUME_URL}
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `

  if (insertedSettings.length > 0) {
    await sql`
      INSERT INTO portfolio_projects
        (name, type, description, tags, highlights, github, demo_url, category, color, image_url, sort_order)
      VALUES
        ('WebShop', 'E-commerce', 'E-commerce demonstrativo com catálogo integrado, carrinho, favoritos e consulta de CEP.', '["React","TypeScript","APIs REST"]'::jsonb, '["Catálogo integrado","Carrinho e favoritos","Consulta de CEP","Checkout demonstrativo"]'::jsonb, 'https://github.com/EricIkeda1/webshop', 'https://webshopeyi.vercel.app/', 'web', '#1260eb', NULL, 0),
        ('Delivery-Restaurante', 'Aplicação web', 'Catálogo de restaurantes, personalização de pizzas, carrinho e pedidos demonstrativos.', '["React","TypeScript","Next.js"]'::jsonb, '["Catálogo de restaurantes","Personalização de pizzas","Carrinho","Pedidos demonstrativos"]'::jsonb, 'https://github.com/EricIkeda1/Delivery-Restaurante', 'https://deliveryeyi.vercel.app/', 'web', '#be724c', '/projects/delivery-hero.jpg', 1),
        ('Galeria de fotos', 'Sistema web', 'Plataforma de fotografia com galerias e gerenciamento de conteúdo.', '["React","TypeScript"]'::jsonb, '["Galerias de fotos","Gerenciamento de conteúdo","Interface responsiva"]'::jsonb, 'https://github.com/EricIkeda1/PortfolioFotos2.0', 'https://blogjovemribeiro.vercel.app/', 'web', '#697369', NULL, 2)
    `
  }
}

async function checkSchema() {
  const sql = getSql()
  const rows = await sql`
    SELECT count(*)::int AS columns_ready
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'portfolio_projects'
      AND column_name IN ('demo_url', 'category')
  `
  if (Number(rows[0]?.columns_ready) !== 2) await createSchema()
  else {
    const settings = await sql`SELECT id FROM portfolio_settings WHERE id = 1 LIMIT 1`
    if (!settings.length) { await createSchema(); return }
    // Uma configuração de bootstrap não redefine nenhuma conta já existente.
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    const hash = process.env.ADMIN_PASSWORD_HASH?.trim()
    if (email && hash && /^scrypt\$[a-f0-9]+\$[a-f0-9]{128}$/i.test(hash)) {
      await sql`INSERT INTO admins (email, password_hash) VALUES (${email}, ${hash}) ON CONFLICT DO NOTHING`
    }
  }
}

export async function ensureSchema() {
  if (!schemaPromise) schemaPromise = checkSchema().catch((error) => { schemaPromise = null; throw error })
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
    demo_url: String(row.demo_url ?? ''),
    category: ['web', 'mobile', 'other'].includes(String(row.category)) ? String(row.category) : 'auto',
    color: String(row.color ?? '#4285FF'),
    image_url: row.image_url ? String(row.image_url) : null,
    sort_order: Number(row.sort_order ?? 0),
    published: row.published !== false,
  }
}

export async function readPortfolioContent(includeUnpublished = false) {
  await ensureSchema()
  const sql = getSql()
  const settingsRequest = sql`
    SELECT about_text, profile_image_url, whatsapp, email, github, linkedin, resume_url, updated_at
    FROM portfolio_settings
    WHERE id = 1
    LIMIT 1
  `

  const projectsRequest = includeUnpublished
    ? sql`SELECT * FROM portfolio_projects ORDER BY sort_order ASC, id ASC`
    : sql`SELECT * FROM portfolio_projects WHERE published = true ORDER BY sort_order ASC, id ASC`

  const [settingsRows, projects] = await Promise.all([settingsRequest, projectsRequest])
  const settings = settingsRows[0] ?? {}
  return {
    about_text: String(settings.about_text ?? ''),
    profile_image_url: settings.profile_image_url ? String(settings.profile_image_url) : DEFAULT_PROFILE_IMAGE,
    whatsapp: String(settings.whatsapp ?? ''),
    email: String(settings.email ?? ''),
    github: String(settings.github ?? ''),
    linkedin: String(settings.linkedin ?? DEFAULT_LINKEDIN),
    resume_url: String(settings.resume_url ?? DEFAULT_RESUME_URL),
    updated_at: settings.updated_at ? String(settings.updated_at) : '',
    projects: projects.map((row) => normalizeProject(row as Record<string, unknown>)),
  }
}
