import { getSql } from './_lib/db'

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  try {
    const sql = getSql()
    await sql`SELECT 1 AS ok`
    return res.status(200).json({ ok: true, api: 'online', database: 'connected' })
  } catch (error) {
    console.error('GET /api/health', error)
    return res.status(500).json({
      ok: false,
      api: 'online',
      database: 'error',
      error: 'A API está online, mas não foi possível conectar ao Neon.',
    })
  }
}
