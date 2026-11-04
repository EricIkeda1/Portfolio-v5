import { lazy, Suspense } from 'react'
import Nav from '@/components/Nav'
import Hero from '@/sections/Hero'
import About from '@/sections/About'
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
          <Experience />
          <About />
          <Skills />
          <Highlights />
          <Versions />
          <Contact />
        </main>
        <footer className="portfolio-footer container">
          <a href="#inicio" className="wordmark">Eric Ikeda<span>.</span></a>
          <p>© {new Date().getFullYear()} · Desenvolvido por EYI</p>
          <a href="#inicio">Voltar ao início ↑</a>
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
