import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from './_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' })
  const admin = await requireAdmin(req)
  if (!admin) return res.status(401).json({ error: 'Não autorizado.' })
  return res.status(200).json({ authenticated: true, user: admin })
}
