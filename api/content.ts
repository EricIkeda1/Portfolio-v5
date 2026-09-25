import { readPortfolioContent } from './_lib/db.js'
import { allowMethods, noStore } from './_lib/http.js'

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['GET'])) return

  try {
    const content = await readPortfolioContent(false)
    const { profile_image_url: _profileImageUrl, ...publicContent } = content
    return res.status(200).json(publicContent)
  } catch (error) {
    console.error('GET /api/content', error)
    return res.status(500).json({ error: 'Não foi possível carregar o conteúdo do portfólio.' })
  }
}
