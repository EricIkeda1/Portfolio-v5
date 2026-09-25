import { requireAdmin } from './_lib/auth.js'
import { ensureSchema, getSql, readPortfolioContent } from './_lib/db.js'
import { allowMethods, noStore } from './_lib/http.js'
import { enforceSameOrigin, requireJson } from './_lib/security.js'

const MAX_TEXT = 10_000
const MAX_URL = 2_048

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['GET', 'PUT'])) return

  if (req.method === 'PUT') {
    if (!enforceSameOrigin(req, res)) return
    if (!requireJson(req, res)) return
  }

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

    if (aboutText.length > MAX_TEXT || [profileImageUrl, github, linkedin, resumeUrl].some((value) => value.length > MAX_URL)) {
      return res.status(400).json({ error: 'Um ou mais campos ultrapassaram o tamanho permitido.' })
    }

    if (![github, linkedin, resumeUrl].every(isHttpUrl) || (profileImageUrl && !isHttpUrl(profileImageUrl))) {
      return res.status(400).json({ error: 'Informe apenas URLs HTTP/HTTPS válidas.' })
    }

    const sql = getSql()
    await sql`
      UPDATE portfolio_settings
      SET about_text = ${aboutText},
          profile_image_url = ${profileImageUrl || null},
          whatsapp = ${whatsapp.slice(0, 40)},
          email = ${email.slice(0, 254)},
          github = ${github},
          linkedin = ${linkedin},
          resume_url = ${resumeUrl},
          updated_at = now()
      WHERE id = 1
    `

    return res.status(200).json(await readPortfolioContent(true))
  } catch (error) {
    console.error(`${req.method} /api/admin-content`, error)
    return res.status(500).json({ error: 'Não foi possível atualizar o conteúdo.' })
  }
}
