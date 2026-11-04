import adminPreview from './_lib/admin-preview-handler.js'
import publicPreview from './_lib/public-preview-handler.js'

// A public image still passes the publication/session checks in publicPreview.
// Sharing this function keeps the deployment within Vercel Hobby's 12-function limit.
export default async function handler(req: any, res: any) {
  if (req.query?.preview_route === 'image') return publicPreview(req, res)
  return adminPreview(req, res)
}
