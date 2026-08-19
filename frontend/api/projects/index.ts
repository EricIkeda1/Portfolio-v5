import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth'
import { ensureDatabase, getSql } from '../_lib/db'
import { parseProjectInput } from '../_lib/project'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })
  if (!(await requireAdmin(req))) return res.status(401).json({ error: 'Não autorizado.' })

  try {
    const project = parseProjectInput(req.body)
    await ensureDatabase()
    const sql = getSql()
    const rows = await sql`
      INSERT INTO portfolio_projects
        (name, type, description, tags, highlights, github, color, image_url, sort_order)
      VALUES
        (${project.name}, ${project.type}, ${project.description}, CAST(${JSON.stringify(project.tags)} AS jsonb), CAST(${JSON.stringify(project.highlights)} AS jsonb), ${project.github}, ${project.color}, ${project.image_url}, ${project.sort_order})
      RETURNING id, name, type, description, tags, highlights, github, color, image_url, sort_order
    `
    return res.status(201).json({ project: rows[0] })
  } catch (error) {
    console.error(error)
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Não foi possível criar o projeto.' })
  }
}
