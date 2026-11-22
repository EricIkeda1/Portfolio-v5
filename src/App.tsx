import { lazy, Suspense } from 'react'
import { LanguageProvider } from './i18n/LanguageContext'
import PortfolioHome from './PortfolioHome'
import AdminPage from './admin/AdminPage'
import NotFoundPage from './NotFoundPage'
import LinksPage from './LinksPage'
import ShopPage from './ShopPage'
const ArenaPage = lazy(() => import('./game/ArenaPage'))

export default function App({ pathname = window.location.pathname }: { pathname?: string } = {}) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'

  if (normalizedPath === '/loja' || (normalizedPath === '/' && typeof window !== 'undefined' && window.location.hostname === 'loja.ericyikeda.com.br')) return <ShopPage />

  if (normalizedPath === '/links' || (normalizedPath === '/' && typeof window !== 'undefined' && window.location.hostname === 'links.ericyikeda.com.br')) return <LinksPage />

  if (normalizedPath === '/arena') return <Suspense fallback={<main style={{ padding: 32 }}>Preparando a arena…</main>}><ArenaPage /></Suspense>

  if (normalizedPath === '/admin') {
    return <AdminPage />
  }

  if (normalizedPath !== '/' && normalizedPath !== '/portfolio') {
    return <NotFoundPage />
  }

  return <LanguageProvider><PortfolioHome /></LanguageProvider>
}
