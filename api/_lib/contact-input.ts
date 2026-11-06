// Anonymous notes and regular contacts share the same server-side IP quota.
export function parseContactSubmission(body: any): { name: string; email: string; message: string; anonymous?: boolean } | null {
  if (!body || typeof body !== 'object' || Array.isArray(body) || body.website || typeof body.message !== 'string') return null
  const message = body.message.trim()
  if (body.kind === 'personal') {
    if (typeof body.anonymous !== 'boolean' || message.length < 10 || message.length > 1000) return null
    if (body.anonymous) return { name: 'Recado anônimo', email: '', message, anonymous: true }
    if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 100) return null
    return { name: body.name.trim(), email: '', message, anonymous: false }
  }
  if (body.kind === 'anonymous') {
    if (message.length < 10 || message.length > 1000) return null
    return { name: 'Recado anônimo', email: '', message }
  }
  if (body.kind !== undefined || typeof body.name !== 'string' || typeof body.email !== 'string') return null
  const name = body.name.trim(), email = body.email.trim().toLowerCase()
  if (name.length < 2 || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10 || message.length > 5000) return null
  return { name, email, message }
}
