import { requireAdmin } from './_lib/auth'
import { getSql } from './_lib/db'

function list(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item).trim()).filter(Boolean)
}

export default async function handler(req: any, res: any) {
  if (!requireAdmin(req, res)) return

  const sql = getSql()

  try {
    if (req.method === 'POST') {
      const name = String(req.body?.name ?? '').trim()
      if (!name) return res.status(400).json({ error: 'Nome do projeto é obrigatório.' })

      const rows = await sql`
        INSERT INTO portfolio_projects
          (name, type, description, tags, highlights, github_url, color, sort_order, is_active, updated_at)
        VALUES
          (${name}, ${String(req.body?.type ?? '').trim()}, ${String(req.body?.description ?? '').trim()},
           ${list(req.body?.tags)}, ${list(req.body?.highlights)}, ${String(req.body?.github_url ?? '').trim()},
           ${String(req.body?.color ?? '#4285FF').trim()}, ${Number(req.body?.sort_order) || 0},
           ${req.body?.is_active !== false}, now())
        RETURNING *
      `
      return res.status(201).json({ project: rows[0] })
    }

    if (req.method === 'PUT') {
      const id = Number(req.query?.id)
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' })

      const name = String(req.body?.name ?? '').trim()
      if (!name) return res.status(400).json({ error: 'Nome do projeto é obrigatório.' })

      const rows = await sql`
        UPDATE portfolio_projects SET
          name = ${name},
          type = ${String(req.body?.type ?? '').trim()},
          description = ${String(req.body?.description ?? '').trim()},
          tags = ${list(req.body?.tags)},
          highlights = ${list(req.body?.highlights)},
          github_url = ${String(req.body?.github_url ?? '').trim()},
          color = ${String(req.body?.color ?? '#4285FF').trim()},
          sort_order = ${Number(req.body?.sort_order) || 0},
          is_active = ${req.body?.is_active !== false},
          updated_at = now()
        WHERE id = ${id}
        RETURNING *
      `
      if (!rows[0]) return res.status(404).json({ error: 'Projeto não encontrado.' })
      return res.status(200).json({ project: rows[0] })
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query?.id)
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' })
      await sql`DELETE FROM portfolio_projects WHERE id = ${id}`
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', 'POST, PUT, DELETE')
    return res.status(405).json({ error: 'Método não permitido.' })
  } catch (error) {
    console.error(`${req.method} /api/admin-projects`, error)
    return res.status(500).json({ error: 'Não foi possível salvar o projeto.' })
  }
}
