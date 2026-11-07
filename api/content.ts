import { getModerationStatus } from './_lib/moderation/index.js'
import { readPersonalRun } from './_lib/personal-run.js'
import { readSpotify } from './_lib/spotify.js'
import { readPortfolioContent } from './_lib/db.js'
import { allowMethods, noStore } from './_lib/http.js'

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['GET'])) return

  // Reuse this function so the Hobby deployment stays within its function limit.
  const view = new URL(req.url || '/', 'https://portfolio.invalid').searchParams.get('view')
  if (view === 'moderation') {
    try { return res.status(200).json(getModerationStatus()) }
    catch { return res.status(503).json({ enabled: false, error: 'Moderação indisponível.' }) }
  }
  if (view === 'run') {
    try { return res.status(200).json({ run: await readPersonalRun() }) }
    catch { return res.status(503).json({ error: 'Corrida indisponível.' }) }
  }
  if (view === 'spotify') {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30')
    return res.status(200).json(await readSpotify())
  }

  try {
    const content = await readPortfolioContent(false)
    const { profile_image_url: _profileImageUrl, ...publicContent } = content
    return res.status(200).json(publicContent)
  } catch (error) {
    console.error('GET /api/content', error)
    return res.status(500).json({ error: 'Não foi possível carregar o conteúdo do portfólio.' })
  }
}
