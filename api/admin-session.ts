import { getSessionFromRequest } from './_lib/auth.js'
import { allowMethods, noStore } from './_lib/http.js'

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['GET'])) return
  const session = getSessionFromRequest(req)
  if (!session) return res.status(401).json({ authenticated: false })
  res.status(200).json({ authenticated: true, user: { id: session.id, email: session.email } })
}
