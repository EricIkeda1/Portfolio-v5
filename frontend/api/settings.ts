import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAdmin } from './_lib/auth'
import { ensureDatabase, getSql } from './_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Método não permitido.' })
  if (!(await requireAdmin(req))) return res.status(401).json({ error: 'Não autorizado.' })

  const aboutText = String(req.body?.about_text ?? '').trim()
  const whatsapp = String(req.body?.whatsapp ?? '').replace(/\D/g, '')

  if (!aboutText || whatsapp.length < 10 || whatsapp.length > 15) {
    return res.status(400).json({ error: 'Preencha o texto e informe um WhatsApp válido com DDI e DDD.' })
  }

  try {
    await ensureDatabase()
    const sql = getSql()
    const rows = await sql`
      UPDATE portfolio_settings
      SET about_text = ${aboutText}, whatsapp = ${whatsapp}, updated_at = NOW()
      WHERE id = 1
      RETURNING about_text, whatsapp
    `
    return res.status(200).json({ settings: rows[0] })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Não foi possível salvar as informações.' })
  }
}
