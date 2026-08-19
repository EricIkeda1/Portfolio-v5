import { clearSessionCookie } from './_lib/auth'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  clearSessionCookie(res)
  return res.status(200).json({ ok: true })
}
