import { getSql } from './_lib/db'

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  try {
    const sql = getSql()
    const [profiles, projects] = await Promise.all([
      sql`SELECT photo_drive_url, about_text, whatsapp, email, github_url, updated_at
          FROM portfolio_profile WHERE id = 1 LIMIT 1`,
      sql`SELECT id, name, type, description, tags, highlights, github_url, color, sort_order, is_active
          FROM portfolio_projects
          WHERE is_active = true
          ORDER BY sort_order ASC, id ASC`,
    ])

    return res.status(200).json({
      profile: profiles[0] ?? null,
      projects,
    })
  } catch (error) {
    console.error('GET /api/data', error)
    return res.status(500).json({ error: 'Não foi possível carregar os dados do portfólio.' })
  }
}
