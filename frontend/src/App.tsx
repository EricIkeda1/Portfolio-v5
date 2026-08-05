import { useState, type CSSProperties, type PointerEvent } from 'react'
import Nav from '@/components/Nav'
import Hero from '@/sections/Hero'
import About from '@/sections/About'
import Skills from '@/sections/Skills'
import Highlights from '@/sections/Highlights'
import Experience from '@/sections/Experience'
import Versions from '@/sections/Versions'
import Contact from '@/sections/Contact'

export default function App() {
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
        <footer
          style={{
            borderTop: '1px solid var(--border)',
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--muted)',
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
          }}
        >
          © {new Date().getFullYear()} ERIC Y. IKEDA — PORTFOLIO V5
        </footer>
      </div>
    </div>
  )
}
