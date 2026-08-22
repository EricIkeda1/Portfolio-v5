import { requireAdmin } from './_lib/auth'
import { getSql } from './_lib/db'

export default async function handler(req: any, res: any) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT')
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  if (!requireAdmin(req, res)) return

  const photoDriveUrl = String(req.body?.photo_drive_url ?? '').trim()
  const aboutText = String(req.body?.about_text ?? '').trim()
  const educationCourse = String(req.body?.education_course ?? '').trim()
  const educationInstitution = String(req.body?.education_institution ?? '').trim()
  const educationCompletion = String(req.body?.education_completion ?? '').trim()
  const whatsapp = String(req.body?.whatsapp ?? '').trim()
  const email = String(req.body?.email ?? '').trim()
  const githubUrl = String(req.body?.github_url ?? '').trim()

  if (!aboutText || !email) {
    return res.status(400).json({ error: 'Descrição e e-mail são obrigatórios.' })
  }

  try {
    const sql = getSql()
    const rows = await sql`
      INSERT INTO portfolio_profile (id, photo_drive_url, about_text, education_course, education_institution, education_completion, whatsapp, email, github_url, updated_at)
      VALUES (1, ${photoDriveUrl}, ${aboutText}, ${educationCourse}, ${educationInstitution}, ${educationCompletion}, ${whatsapp}, ${email}, ${githubUrl}, now())
      ON CONFLICT (id) DO UPDATE SET
        photo_drive_url = EXCLUDED.photo_drive_url,
        about_text = EXCLUDED.about_text,
        education_course = EXCLUDED.education_course,
        education_institution = EXCLUDED.education_institution,
        education_completion = EXCLUDED.education_completion,
        whatsapp = EXCLUDED.whatsapp,
        email = EXCLUDED.email,
        github_url = EXCLUDED.github_url,
        updated_at = now()
      RETURNING photo_drive_url, about_text, education_course, education_institution, education_completion, whatsapp, email, github_url, updated_at
    `

    return res.status(200).json({ profile: rows[0] })
  } catch (error) {
    console.error('PUT /api/admin-profile', error)
    return res.status(500).json({ error: 'Não foi possível salvar os dados.' })
  }
}
