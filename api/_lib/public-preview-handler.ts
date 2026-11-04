import { getSessionFromRequest } from './auth.js'
import { getSql } from './db.js'
import { allowMethods, noStore } from './http.js'

export default async function handler(req: any, res: any) {
  noStore(res)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (!allowMethods(req, res, ['GET'])) return
  const id = String(req.query?.id ?? '')
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id)) return res.status(400).json({ error: 'Imagem inválida.' })
  try {
    const rows = await getSql()`SELECT preview.image_base64, preview.media_type, project.image_url, project.published FROM portfolio_project_previews preview JOIN portfolio_projects project ON project.id = preview.project_id WHERE preview.id = ${id} LIMIT 1`
    const row = rows[0]
    const publicImage = row?.published === true && row?.image_url === `/api/project-preview?id=${id}`
    if (!row || (!publicImage && !getSessionFromRequest(req))) return res.status(404).json({ error: 'Imagem não encontrada.' })
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(String(row.media_type))) return res.status(404).json({ error: 'Imagem não encontrada.' })
    res.setHeader('Content-Type', row.media_type)
    res.setHeader('Cache-Control', publicImage ? 'public, max-age=0, must-revalidate' : 'private, no-store')
    return res.status(200).send(Buffer.from(String(row.image_base64), 'base64'))
  } catch { return res.status(404).json({ error: 'Imagem não encontrada.' }) }
}
