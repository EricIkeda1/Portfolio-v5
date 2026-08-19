import { getSessionFromRequest } from './_lib/auth'

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  const session = getSessionFromRequest(req)
  if (!session) {
    return res.status(401).json({ authenticated: false })
  }

  return res.status(200).json({
    authenticated: true,
    admin: { id: session.adminId, email: session.email },
  })
}
