import { requireAdmin } from './_lib/auth.js'
import { ensureSchema, getSql, readPortfolioContent } from './_lib/db.js'
import { allowMethods, messageFromError, noStore } from './_lib/http.js'

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['GET', 'PUT'])) return
  if (!requireAdmin(req, res)) return

  try {
    await ensureSchema()

    if (req.method === 'GET') {
      return res.status(200).json(await readPortfolioContent(true))
    }

    const aboutText = String(req.body?.about_text ?? '').trim()
    const profileImageUrl = String(req.body?.profile_image_url ?? '').trim()
    const whatsapp = String(req.body?.whatsapp ?? '').trim()
    const email = String(req.body?.email ?? '').trim()
    const github = String(req.body?.github ?? '').trim()
    const linkedin = String(req.body?.linkedin ?? '').trim()
    const resumeUrl = String(req.body?.resume_url ?? '').trim()

    if (!aboutText || !whatsapp || !email || !github || !linkedin || !resumeUrl) {
      return res.status(400).json({ error: 'Preencha texto, WhatsApp, e-mail, GitHub, LinkedIn e o link do currículo.' })
    }

    const sql = getSql()
    await sql`
      UPDATE portfolio_settings
      SET about_text = ${aboutText},
          profile_image_url = ${profileImageUrl || null},
          whatsapp = ${whatsapp},
          email = ${email},
          github = ${github},
          linkedin = ${linkedin},
          resume_url = ${resumeUrl},
          updated_at = now()
      WHERE id = 1
    `

    res.status(200).json(await readPortfolioContent(true))
  } catch (error) {
    console.error(`${req.method} /api/admin-content`, error)
    res.status(500).json({ error: messageFromError(error) })
  }
}
