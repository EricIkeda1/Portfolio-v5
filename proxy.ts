import { next, rewrite } from '@vercel/functions'

// Serve personal metadata and HTML before the static portfolio index can match.
export default function proxy(request: Request) {
  const url = new URL(request.url)
  if (url.hostname === 'links.ericyikeda.com.br' && (url.pathname === '/' || url.pathname === '/index.html')) {
    url.pathname = '/links/index.html'
    return rewrite(url)
  }
  return next()
}
