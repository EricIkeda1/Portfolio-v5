import { lazy, Suspense, useState, type CSSProperties, type PointerEvent } from 'react'
import Nav from '@/components/Nav'
import Hero from '@/sections/Hero'
import About from '@/sections/About'
import Skills from '@/sections/Skills'
import Highlights from '@/sections/Highlights'
import Experience from '@/sections/Experience'
import Versions from '@/sections/Versions'
import Contact from '@/sections/Contact'
import { PortfolioContentProvider } from '@/context/PortfolioContentContext'
import AdminPage from '@/admin/AdminPage'
import NotFoundPage from '@/NotFoundPage'
import LinksPage from './LinksPage'

const ArenaPage = lazy(() => import('./game/ArenaPage'))

function PortfolioPage() {
  const [hovering, setHovering] = useState(false)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setCursor({ x: event.clientX - rect.left, y: event.clientY - rect.top })
  }

  const mask = `radial-gradient(circle at ${cursor.x}px ${cursor.y}px, #000 80px, transparent 140px)`

  const dotsBase: CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundImage:
      'radial-gradient(circle at center, rgba(66, 133, 255, 0.18) 1px, transparent 1.2px)',
    backgroundSize: '22px 22px',
    pointerEvents: 'none',
    zIndex: 0,
  }

  const dotsHover: CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundImage:
      'radial-gradient(circle at center, rgba(66, 133, 255, 0.5) 1.8px, transparent 2px)',
    backgroundSize: '22px 22px',
    opacity: hovering ? 1 : 0,
    maskImage: mask,
    WebkitMaskImage: mask,
    transition: 'opacity 0.15s',
    pointerEvents: 'none',
    zIndex: 0,
  }

  return (
    <PortfolioContentProvider>
      <div
        style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', position: 'relative' }}
        onPointerEnter={() => setHovering(true)}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHovering(false)}
      >
        <div style={dotsBase} />
        <div style={dotsHover} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Nav />
          <main>
            <Hero />
            <About />
            <Highlights />
            <Skills />
            <Experience />
            <Versions />
            <Contact />
          </main>
          <footer className="site-footer">
            <div className="site-footer-inner">
              <div className="site-footer-main">
                <div className="site-footer-signature">
                  <span className="site-footer-monogram" aria-hidden="true">EI</span>
                  <div>
                    <span className="site-footer-name">Eric Y. Ikeda</span>
                    <p className="site-footer-tagline">Ideias, código e atenção aos detalhes.</p>
                  </div>
                </div>
                <nav className="site-footer-nav" aria-label="Navegação do rodapé">
                  <a href="#sobre">Sobre</a>
                  <a href="#contato">Contato</a>
                </nav>
              </div>
              <div className="site-footer-bottom">
                <span>© {new Date().getFullYear()} · Desenvolvido por Eric Y. Ikeda</span>
                <a href="https://www.ericyikeda.com.br/" className="site-footer-domain">ericyikeda<span>.com.br</span></a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </PortfolioContentProvider>
  )
}

export default function App({ pathname = window.location.pathname }: { pathname?: string } = {}) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'

  if (normalizedPath === '/links' || (normalizedPath === '/' && typeof window !== 'undefined' && window.location.hostname === 'links.ericyikeda.com.br')) return <LinksPage />

  if (normalizedPath === '/arena') return <Suspense fallback={<main style={{ padding: 32 }}>Preparando a arena…</main>}><ArenaPage /></Suspense>

  if (normalizedPath === '/admin') {
    return <AdminPage />
  }

  if (normalizedPath !== '/' && normalizedPath !== '/portfolio') {
    return <NotFoundPage />
  }

  return <PortfolioPage />
}
