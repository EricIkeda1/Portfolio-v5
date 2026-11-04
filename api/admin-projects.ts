import { requireAdmin } from './_lib/auth.js'
import { ensureSchema, getSql, normalizeProject } from './_lib/db.js'
import { allowMethods, noStore } from './_lib/http.js'
import { enforceSameOrigin, requireJson } from './_lib/security.js'

function safeUrl(value: string, allowEmpty = true) {
  if (!value && allowEmpty) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function cleanProject(body: any) {
  const tags = Array.isArray(body?.tags)
    ? body.tags.map(String).map((value: string) => value.trim().slice(0, 60)).filter(Boolean).slice(0, 20)
    : []
  const highlights = Array.isArray(body?.highlights)
    ? body.highlights.map(String).map((value: string) => value.trim().slice(0, 120)).filter(Boolean).slice(0, 20)
    : []

  const rawOrder = Number(body?.sort_order)
  return {
    name: String(body?.name ?? '').trim().slice(0, 120),
    type: String(body?.type ?? '').trim().slice(0, 120),
    description: String(body?.description ?? '').trim().slice(0, 5_000),
    tags,
    highlights,
    github: String(body?.github ?? '').trim().slice(0, 2_048),
    color: String(body?.color ?? '#4285FF').trim(),
    image_url: String(body?.image_url ?? '').trim().slice(0, 2_048) || null,
    sort_order: Number.isFinite(rawOrder) ? Math.max(0, Math.min(10_000, Math.trunc(rawOrder))) : 0,
    published: body?.published !== false,
  }
}

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['POST', 'PUT', 'DELETE'])) return
  if (!enforceSameOrigin(req, res)) return
  if (req.method !== 'DELETE' && !requireJson(req, res)) return
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

    if (!/^#[0-9a-f]{6}$/i.test(project.color)) {
      return res.status(400).json({ error: 'Cor inválida.' })
    }

    if (!safeUrl(project.github) || !safeUrl(project.image_url ?? '')) {
      return res.status(400).json({ error: 'Use apenas URLs HTTP/HTTPS válidas nos links do projeto.' })
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
    return res.status(200).json(normalizeProject(rows[0] as Record<string, unknown>))
  } catch (error) {
    console.error(`${req.method} /api/admin-projects`, error)
    return res.status(500).json({ error: 'Não foi possível atualizar os projetos.' })
  }
}
