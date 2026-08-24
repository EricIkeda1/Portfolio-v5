import { clearSessionCookie } from './_lib/auth.js'
import { allowMethods, noStore } from './_lib/http.js'

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['POST'])) return
  clearSessionCookie(res)
  res.status(200).json({ ok: true })
}
