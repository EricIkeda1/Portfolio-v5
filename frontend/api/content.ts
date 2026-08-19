import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureDatabase, getSql } from './_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' })

  try {
    await ensureDatabase()
    const sql = getSql()
    const [settingsRows, projects] = await Promise.all([
      sql`SELECT about_text, whatsapp FROM portfolio_settings WHERE id = 1 LIMIT 1`,
      sql`
        SELECT id, name, type, description, tags, highlights, github, color, image_url, sort_order
        FROM portfolio_projects
        ORDER BY sort_order ASC, id ASC
      `,
    ])

    const settings = settingsRows[0]
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      about_text: settings?.about_text ?? '',
      whatsapp: settings?.whatsapp ?? '',
      projects,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Não foi possível acessar o banco Neon.' })
  }
}
