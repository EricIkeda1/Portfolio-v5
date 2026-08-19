import { neon } from '@neondatabase/serverless'
import { hashPassword } from './password'

const DEFAULT_ABOUT = `Meu nome é Eric, sou desenvolvedor de software e gosto de transformar ideias em projetos reais. Desenvolvo sites, sistemas e aplicações, sempre buscando criar soluções modernas, rápidas e que realmente façam a diferença para quem as utiliza.

Gosto de participar de todas as etapas do desenvolvimento, desde o planejamento até a entrega, cuidando tanto da experiência visual quanto da qualidade do código. Meu objetivo é criar projetos organizados, funcionais e que ofereçam a melhor experiência possível.

Além de desenvolver para clientes, também crio projetos próprios para estudar novas tecnologias, testar ideias e evoluir como desenvolvedor. Acredito que sempre existe algo novo para aprender, e cada projeto é uma oportunidade de construir soluções das quais eu possa me orgulhar.`

const DEFAULT_WHATSAPP = '5543996369387'

const defaultProjects = [
  {
    name: 'Ademiconnect',
    type: 'CRM Mobile',
    tags: ['Flutter', 'Supabase', 'Mobile'],
    description: 'CRM Mobile desenvolvido com Flutter e Supabase, com sincronização em tempo real e funcionamento offline. Solução completa para gestão de relacionamento com clientes.',
    highlights: ['Sync em tempo real', 'Modo offline', 'Flutter + Supabase'],
    github: 'https://github.com/EricIkeda1/Ademiconnect',
    color: '#4285FF',
    sortOrder: 1,
  },
  {
    name: 'Temperlights',
    type: 'App Industrial',
    tags: ['Mobile', 'Rastreabilidade', 'Produção'],
    description: 'Aplicativo para rastreabilidade da produção industrial, com acompanhamento em tempo real de cada etapa do processo de fabricação.',
    highlights: ['Rastreabilidade', 'Produção industrial', 'Tempo real'],
    github: 'https://github.com/EricIkeda1/Temperlights-Mobile',
    color: '#5B9BFF',
    sortOrder: 2,
  },
  {
    name: 'X4Glass',
    type: 'Sistema Web',
    tags: ['Full Stack', 'Rastreabilidade', 'Equipe'],
    description: 'Sistema de rastreabilidade para produção de vidros desenvolvido em equipe. Projeto colaborativo com foco em qualidade e organização de processos industriais.',
    highlights: ['Desenvolvimento em equipe', 'Rastreabilidade', 'Full Stack'],
    github: 'https://github.com/EricIkeda1/X4Glass',
    color: '#7AB3FF',
    sortOrder: 3,
  },
  {
    name: 'AES',
    type: 'Criptografia',
    tags: ['Python', 'Cibersegurança', 'Algoritmos'],
    description: 'Implementação completa do algoritmo AES (Advanced Encryption Standard) em Python do zero, sem bibliotecas externas. Desenvolvido na disciplina de Segurança da Informação, cobre todas as etapas: Key Expansion, SubBytes, ShiftRows, MixColumns e AddRoundKey — 10 rounds de criptografia com chave de 128 bits.',
    highlights: ['AES 128-bit', 'Python puro', 'Cibersegurança'],
    github: 'https://github.com/EricIkeda1/AES',
    color: '#A78BFF',
    sortOrder: 4,
  },
]

export function getSql() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL não configurada.')
  return neon(connectionString)
}

let initialization: Promise<void> | null = null

export async function ensureDatabase() {
  if (initialization) return initialization

  initialization = (async () => {
    const sql = getSql()

    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_login_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        about_text TEXT NOT NULL,
        whatsapp VARCHAR(30) NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(160) NOT NULL,
        type VARCHAR(120) NOT NULL,
        description TEXT NOT NULL,
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
        github TEXT NOT NULL,
        color VARCHAR(20) NOT NULL DEFAULT '#4285FF',
        image_url TEXT,
        sort_order INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `

    const adminCountRows = await sql`SELECT COUNT(*)::int AS count FROM admin_users`
    const adminCount = Number(adminCountRows[0]?.count ?? 0)

    if (adminCount === 0) {
      const seedEmail = String(process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()
      const seedPassword = String(process.env.ADMIN_PASSWORD ?? '')

      if (seedEmail && seedPassword) {
        const passwordHash = await hashPassword(seedPassword)
        await sql`
          INSERT INTO admin_users (email, password_hash)
          VALUES (${seedEmail}, ${passwordHash})
          ON CONFLICT (email) DO NOTHING
        `
      }
    }

    await sql`
      INSERT INTO portfolio_settings (id, about_text, whatsapp)
      VALUES (1, ${DEFAULT_ABOUT}, ${DEFAULT_WHATSAPP})
      ON CONFLICT (id) DO NOTHING
    `

    const countRows = await sql`SELECT COUNT(*)::int AS count FROM portfolio_projects`
    const count = Number(countRows[0]?.count ?? 0)

    if (count === 0) {
      for (const project of defaultProjects) {
        await sql`
          INSERT INTO portfolio_projects
            (name, type, description, tags, highlights, github, color, sort_order)
          VALUES
            (${project.name}, ${project.type}, ${project.description}, CAST(${JSON.stringify(project.tags)} AS jsonb), CAST(${JSON.stringify(project.highlights)} AS jsonb), ${project.github}, ${project.color}, ${project.sortOrder})
        `
      }
    }
  })().catch((error) => {
    initialization = null
    throw error
  })

  return initialization
}
