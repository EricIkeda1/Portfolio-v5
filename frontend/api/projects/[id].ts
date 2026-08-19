import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from '../_lib/auth'
import { ensureDatabase, getSql } from '../_lib/db'
import { parseProjectInput } from '../_lib/project'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await requireAdmin(req))) return res.status(401).json({ error: 'Não autorizado.' })

  const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  const id = Number(rawId)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Projeto inválido.' })

  try {
    await ensureDatabase()
    const sql = getSql()

    if (req.method === 'DELETE') {
      await sql`DELETE FROM portfolio_projects WHERE id = ${id}`
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'PUT') {
      const project = parseProjectInput(req.body)
      const rows = await sql`
        UPDATE portfolio_projects
        SET
          name = ${project.name},
          type = ${project.type},
          description = ${project.description},
          tags = CAST(${JSON.stringify(project.tags)} AS jsonb),
          highlights = CAST(${JSON.stringify(project.highlights)} AS jsonb),
          github = ${project.github},
          color = ${project.color},
          image_url = ${project.image_url},
          sort_order = ${project.sort_order},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, name, type, description, tags, highlights, github, color, image_url, sort_order
      `
      if (!rows[0]) return res.status(404).json({ error: 'Projeto não encontrado.' })
      return res.status(200).json({ project: rows[0] })
    }

    return res.status(405).json({ error: 'Método não permitido.' })
  } catch (error) {
    console.error(error)
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Não foi possível alterar o projeto.' })
  }
}
