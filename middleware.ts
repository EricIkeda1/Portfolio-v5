import { next, rewrite } from '@vercel/functions'

// Serve personal metadata and HTML before the static portfolio index can match.
export const config = { matcher: ['/', '/index.html'] }

export default function middleware(request: Request) {
  const url = new URL(request.url)
  if (url.hostname === 'links.ericyikeda.com.br' && (url.pathname === '/' || url.pathname === '/index.html')) {
    url.pathname = '/links/index.html'
    return rewrite(url)
  }
  if (url.hostname === 'loja.ericyikeda.com.br' && (url.pathname === '/' || url.pathname === '/index.html')) {
    url.pathname = '/loja/index.html'
    return rewrite(url)
  }
  return next()
}
