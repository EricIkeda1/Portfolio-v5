import { useEffect, useState } from 'react'
import DottedBackground from '@/components/DottedBackground'
import Nav from '@/components/Nav'
import Hero from '@/sections/Hero'
import About from '@/sections/About'
import Skills from '@/sections/Skills'
import Highlights from '@/sections/Highlights'
import Experience from '@/sections/Experience'
import Versions from '@/sections/Versions'
import Contact from '@/sections/Contact'
import LoginPage from '@/pages/LoginPage'
import AdminPage from '@/pages/AdminPage'
import { fallbackData, getPortfolioData, type PortfolioData } from '@/lib/portfolio'

function PortfolioPage() {
  const [data, setData] = useState<PortfolioData>(fallbackData)

  useEffect(() => {
    getPortfolioData()
      .then(setData)
      .catch((error) => console.warn('Usando conteúdo local de fallback:', error))
  }, [])

  return (
    <DottedBackground>
      <Nav />
      <main>
        <Hero />
        <About profile={data.profile} />
        <Highlights />
        <Skills />
        <Experience projects={data.projects} />
        <Versions />
        <Contact profile={data.profile} />
      </main>
      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Space Mono, monospace', fontSize: '0.72rem', letterSpacing: '0.08em' }}>
        © {new Date().getFullYear()} ERIC Y. IKEDA — PORTFOLIO V5
        <span style={{ margin: '0 0.65rem', opacity: 0.35 }}>·</span>
        <a href="/admin/login" style={{ color: 'var(--muted)', textDecoration: 'none' }}>ADMIN</a>
      </footer>
    </DottedBackground>
  )
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/admin/login') return <LoginPage />
  if (path === '/admin') return <AdminPage />
  return <PortfolioPage />
}
