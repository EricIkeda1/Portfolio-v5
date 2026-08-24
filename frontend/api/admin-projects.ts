import { requireAdmin } from './_lib/auth.js'
import { ensureSchema, getSql, normalizeProject } from './_lib/db.js'
import { allowMethods, messageFromError, noStore } from './_lib/http.js'

function cleanProject(body: any) {
  const tags = Array.isArray(body?.tags) ? body.tags.map(String).map((value: string) => value.trim()).filter(Boolean) : []
  const highlights = Array.isArray(body?.highlights) ? body.highlights.map(String).map((value: string) => value.trim()).filter(Boolean) : []
  return {
    name: String(body?.name ?? '').trim(),
    type: String(body?.type ?? '').trim(),
    description: String(body?.description ?? '').trim(),
    tags,
    highlights,
    github: String(body?.github ?? '').trim(),
    color: String(body?.color ?? '#4285FF').trim() || '#4285FF',
    image_url: String(body?.image_url ?? '').trim() || null,
    sort_order: Number.isFinite(Number(body?.sort_order)) ? Number(body.sort_order) : 0,
    published: body?.published !== false,
  }
}

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['POST', 'PUT', 'DELETE'])) return
  if (!requireAdmin(req, res)) return

  try {
    await ensureSchema()
    const sql = getSql()

    if (req.method === 'DELETE') {
      const id = Number(req.query?.id)
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' })
      await sql`DELETE FROM portfolio_projects WHERE id = ${id}`
      return res.status(200).json({ ok: true })
    }

    const project = cleanProject(req.body)
    if (!project.name || !project.type || !project.description) {
      return res.status(400).json({ error: 'Nome, tipo e descrição são obrigatórios.' })
    }

    if (req.method === 'POST') {
      const rows = await sql`
        INSERT INTO portfolio_projects
          (name, type, description, tags, highlights, github, color, image_url, sort_order, published)
        VALUES
          (${project.name}, ${project.type}, ${project.description}, ${JSON.stringify(project.tags)}::jsonb, ${JSON.stringify(project.highlights)}::jsonb, ${project.github}, ${project.color}, ${project.image_url}, ${project.sort_order}, ${project.published})
        RETURNING *
      `
      return res.status(201).json(normalizeProject(rows[0] as Record<string, unknown>))
    }

    const id = Number(req.body?.id)
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' })

    const rows = await sql`
      UPDATE portfolio_projects
      SET name = ${project.name},
          type = ${project.type},
          description = ${project.description},
          tags = ${JSON.stringify(project.tags)}::jsonb,
          highlights = ${JSON.stringify(project.highlights)}::jsonb,
          github = ${project.github},
          color = ${project.color},
          image_url = ${project.image_url},
          sort_order = ${project.sort_order},
          published = ${project.published},
          updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `

    if (!rows[0]) return res.status(404).json({ error: 'Projeto não encontrado.' })
    res.status(200).json(normalizeProject(rows[0] as Record<string, unknown>))
  } catch (error) {
    console.error(`${req.method} /api/admin-projects`, error)
    res.status(500).json({ error: messageFromError(error) })
  }
}
