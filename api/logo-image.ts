import { allowMethods, messageFromError, noStore } from './_lib/http.js'

const LOGO_URL =
  'https://drive.google.com/thumbnail?id=19o0-cXysNK5HsufGJJSZThSlPpuury__&sz=w1000'

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
    const candidates = getImageCandidates(LOGO_URL)

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

    return res.status(502).json({ error: 'Não foi possível carregar a logo.' })
  } catch (error) {
    console.error('GET /api/logo-image', error)
    return res.status(500).json({ error: messageFromError(error) })
  }
}
