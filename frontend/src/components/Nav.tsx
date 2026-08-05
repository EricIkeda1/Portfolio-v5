import { useState, useEffect } from 'react'
import logoSrc from '@/imports/Logo.png'

const links = [
  { label: 'Início', href: '#' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Habilidades', href: '#habilidades' },
  { label: 'Experiência', href: '#experiencia' },
  { label: 'Contato', href: '#contato' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const close = () => setOpen(false)

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'background 0.4s, border-color 0.4s, backdrop-filter 0.4s',
        backgroundColor: scrolled ? 'rgba(7,7,15,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <div
        className="container"
        style={{ height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}
      >
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src={logoSrc} alt="EYI logo" style={{ height: 38, width: 38, objectFit: 'contain' }} />
          <span
            className="font-display"
            style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            Eric Y. Ikeda
          </span>
        </a>

        {/* Desktop */}
        <nav className="nav-links">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono"
              style={{
                color: 'var(--muted)',
                textDecoration: 'none',
                fontSize: '0.68rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--muted)')}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contato"
            className="font-mono"
            style={{
              background: 'var(--blue)',
              color: '#fff',
              textDecoration: 'none',
              padding: '0.48rem 1.15rem',
              borderRadius: 3,
              fontSize: '0.68rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 700,
              transition: 'opacity 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.opacity = '0.82'
              el.style.boxShadow = '0 0 22px var(--blue-glow)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.opacity = '1'
              el.style.boxShadow = 'none'
            }}
          >
            Contratar
          </a>
        </nav>

        {/* Hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: 'block',
                width: i === 2 ? 14 : 22,
                height: 2,
                background: 'var(--text)',
                borderRadius: 1,
                transition: 'width 0.2s',
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: open ? '400px' : 0,
          transition: 'max-height 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          backgroundColor: 'rgba(7,7,15,0.98)',
          borderTop: open ? '1px solid var(--border)' : 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem 1.5rem 2rem' }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={close}
              className="font-mono"
              style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contato"
            onClick={close}
            className="font-mono"
            style={{
              background: 'var(--blue)',
              color: '#fff',
              textDecoration: 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: 3,
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Contratar
          </a>
        </div>
      </div>
    </header>
  )
}
