import { ensureSchema, getSql } from './_lib/db.js'

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {
    await ensureSchema()
    const sql = getSql()

    const settings = await sql`
      SELECT
        about_text,
        profile_image_url,
        whatsapp,
        email,
        github,
        linkedin,
        resume_url,
        updated_at
      FROM portfolio_settings
      WHERE id = 1
      LIMIT 1
    `

    const projects = await sql`
      SELECT
        id,
        name,
        type,
        description,
        tags,
        highlights,
        github,
        color,
        image_url,
        sort_order,
        published
      FROM portfolio_projects
      WHERE published = true
      ORDER BY sort_order, id
    `

    return res.status(200).json({
      settings: settings[0] ?? null,
      projects,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      error: 'Erro ao carregar dados do portfólio',
    })
  }
}