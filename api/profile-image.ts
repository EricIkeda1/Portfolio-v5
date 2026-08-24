import { ensureSchema, getSql } from './_lib/db.js'
import { allowMethods, messageFromError, noStore } from './_lib/http.js'

function getDriveFileId(url: string) {
  try {
    const fileMatch = url.match(/\/file\/d\/([^/?]+)/)
    if (fileMatch?.[1]) return fileMatch[1]

    const parsed = new URL(url)
    return parsed.searchParams.get('id')
  } catch {
    return null
  }
}

function isAllowedImageUrl(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return false

    const host = url.hostname.toLowerCase()
    return (
      host === 'drive.google.com' ||
      host === 'lh3.googleusercontent.com' ||
      host.endsWith('.googleusercontent.com')
    )
  } catch {
    return false
  }
}

function getImageCandidates(value: string) {
  const candidates = [value]
  const fileId = getDriveFileId(value)

  if (fileId) {
    candidates.unshift(
      `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}`,
      `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1000`,
    )
  }

  return [...new Set(candidates)].filter(isAllowedImageUrl)
}

export default async function handler(req: any, res: any) {
  noStore(res)
  if (!allowMethods(req, res, ['GET'])) return

  try {
    await ensureSchema()
    const sql = getSql()
    const rows = await sql`
      SELECT profile_image_url
      FROM portfolio_settings
      WHERE id = 1
      LIMIT 1
    `

    const profileImageUrl = String(rows[0]?.profile_image_url ?? '').trim()
    if (!profileImageUrl) {
      return res.status(404).json({ error: 'Imagem de perfil não encontrada.' })
    }

    const candidates = getImageCandidates(profileImageUrl)
    if (candidates.length === 0) {
      return res.status(400).json({ error: 'A imagem precisa estar hospedada no Google Drive.' })
    }

    for (const imageUrl of candidates) {
      try {
        const response = await fetch(imageUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*,*/*',
          },
        })

        if (!response.ok) continue

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.toLowerCase().startsWith('image/')) continue

        const bytes = Buffer.from(await response.arrayBuffer())

        res.setHeader('Content-Type', contentType)
        res.setHeader('Content-Disposition', 'inline')
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
        return res.status(200).send(bytes)
      } catch {
        continue
      }
    }

    return res.status(502).json({ error: 'Não foi possível carregar a imagem.' })
  } catch (error) {
    console.error('GET /api/profile-image', error)
    return res.status(500).json({ error: messageFromError(error) })
  }
}
