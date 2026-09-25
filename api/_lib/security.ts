function firstHeaderValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] ?? '').trim()
  return String(value ?? '').split(',')[0]?.trim() ?? ''
}

export function getClientIp(req: any) {
  return (
    firstHeaderValue(req.headers?.['x-forwarded-for']) ||
    firstHeaderValue(req.headers?.['x-real-ip']) ||
    firstHeaderValue(req.socket?.remoteAddress) ||
    'unknown'
  )
}

export function requireJson(req: any, res: any) {
  const contentType = firstHeaderValue(req.headers?.['content-type']).toLowerCase()
  if (!contentType.startsWith('application/json')) {
    res.status(415).json({ error: 'Content-Type deve ser application/json.' })
    return false
  }
  return true
}

export function enforceSameOrigin(req: any, res: any) {
  const method = String(req.method ?? 'GET').toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true

  const fetchSite = firstHeaderValue(req.headers?.['sec-fetch-site']).toLowerCase()
  if (fetchSite === 'cross-site') {
    res.status(403).json({ error: 'Origem da requisição não permitida.' })
    return false
  }

  const origin = firstHeaderValue(req.headers?.origin)
  if (!origin) {
    // Navegadores modernos enviam Origin nos requests mutáveis feitos pelo painel.
    // Em desenvolvimento aceitamos a ausência para facilitar ferramentas locais.
    if (process.env.NODE_ENV !== 'production') return true
    res.status(403).json({ error: 'Origem da requisição ausente.' })
    return false
  }

  const host = firstHeaderValue(req.headers?.['x-forwarded-host']) || firstHeaderValue(req.headers?.host)
  const proto = firstHeaderValue(req.headers?.['x-forwarded-proto']) || (process.env.NODE_ENV === 'production' ? 'https' : 'http')

  if (!host) {
    res.status(403).json({ error: 'Host da requisição inválido.' })
    return false
  }

  const expectedOrigin = `${proto}://${host}`
  if (origin !== expectedOrigin) {
    res.status(403).json({ error: 'Origem da requisição não permitida.' })
    return false
  }

  return true
}
