import { readPortfolioContent } from './_lib/db.js'
import { allowMethods, messageFromError, noStore } from './_lib/http.js'

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['GET'])) return

  try {
    const content = await readPortfolioContent(false)
    res.status(200).json(content)
  } catch (error) {
    console.error('GET /api/content', error)
    res.status(500).json({ error: messageFromError(error) })
  }
}
