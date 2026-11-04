import { lazy, Suspense } from 'react'
import Nav from '@/components/Nav'
import Hero from '@/sections/Hero'
import Purpose from '@/sections/Purpose'
import ProjectSpotlights from '@/sections/ProjectSpotlights'
import Skills from '@/sections/Skills'
import Highlights from '@/sections/Highlights'
import Experience from '@/sections/Experience'
import Versions from '@/sections/Versions'
import Contact from '@/sections/Contact'
import { PortfolioContentProvider } from '@/context/PortfolioContentContext'
import NotFoundPage from '@/NotFoundPage'

const AdminPage = lazy(() => import('@/admin/AdminPage'))

function PortfolioPage() {
  return (
    <PortfolioContentProvider>
      <div className="portfolio-shell">
        <Nav />
        <main id="conteudo">
          <Hero />
          <ProjectSpotlights />
          <Experience />
          <Purpose><Skills /><Highlights /><Versions /></Purpose>
          <Contact />
        </main>
        <footer className="portfolio-footer container">
          <p>© {new Date().getFullYear()} Eric Ikeda · Desenvolvido por EYI</p>
        </footer>
      </div>
    </PortfolioContentProvider>
  )
}

export default function App({ pathname = window.location.pathname }: { pathname?: string } = {}) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  if (normalizedPath === '/admin') return <Suspense fallback={<p className="route-loading" role="status">Carregando painel…</p>}><AdminPage /></Suspense>
  if (normalizedPath !== '/' && normalizedPath !== '/portfolio') return <NotFoundPage />
  return <PortfolioPage />
}
