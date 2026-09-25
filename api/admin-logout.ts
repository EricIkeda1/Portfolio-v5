import { clearSessionCookie } from './_lib/auth.js'
import { allowMethods, noStore } from './_lib/http.js'
import { enforceSameOrigin } from './_lib/security.js'

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['POST'])) return
  if (!enforceSameOrigin(req, res)) return
  clearSessionCookie(res)
  return res.status(200).json({ ok: true })
}
