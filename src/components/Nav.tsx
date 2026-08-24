import { useEffect, useState } from 'react'

const logoSrc =
  'https://drive.google.com/thumbnail?id=19o0-cXysNK5HsufGJJSZThSlPpuury__&sz=w1000'

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
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }

    handleScroll()

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const close = () => {
    setOpen(false)
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition:
          'background 0.4s, border-color 0.4s, backdrop-filter 0.4s',
        backgroundColor: scrolled
          ? 'rgba(7,7,15,0.88)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled
          ? '1px solid var(--border)'
          : '1px solid transparent',
      }}
    >
      <div
        className="container"
        style={{
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
        }}
      >
        {/* Logo */}
        <a
          href="#"
          onClick={close}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <img
            src={logoSrc}
            alt="Logo Eric Y. Ikeda"
            loading="eager"
            referrerPolicy="no-referrer"
            style={{
              height: 38,
              width: 38,
              objectFit: 'contain',
              display: 'block',
            }}
          />

          <span
            className="font-display"
            style={{
              color: 'var(--text)',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Eric Y. Ikeda
          </span>
        </a>

        {/* Desktop */}
        <nav
          className="nav-links"
          aria-label="Navegação principal"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono"
              style={{
                color: 'var(--muted)',
                textDecoration: 'none',
                fontSize: '0.76rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.color =
                  'var(--text)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.color =
                  'var(--muted)'
              }}
            >
              {link.label}
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
              fontSize: '0.76rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 700,
              transition: 'opacity 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement

              el.style.opacity = '0.82'
              el.style.boxShadow =
                '0 0 22px var(--blue-glow)'
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
          type="button"
          className="nav-hamburger"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
          }}
        >
          <span
            style={{
              display: 'block',
              width: 22,
              height: 2,
              background: 'var(--text)',
              borderRadius: 1,
              transition:
                'transform 0.25s, width 0.25s',
              transform: open
                ? 'translateY(6px) rotate(45deg)'
                : 'none',
            }}
          />

          <span
            style={{
              display: 'block',
              width: 22,
              height: 2,
              background: 'var(--text)',
              borderRadius: 1,
              marginTop: 4,
              transition:
                'opacity 0.25s, transform 0.25s',
              opacity: open ? 0 : 1,
            }}
          />

          <span
            style={{
              display: 'block',
              width: open ? 22 : 14,
              height: 2,
              background: 'var(--text)',
              borderRadius: 1,
              marginTop: 4,
              transition:
                'transform 0.25s, width 0.25s',
              transform: open
                ? 'translateY(-6px) rotate(-45deg)'
                : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: open ? '400px' : 0,
          transition:
            'max-height 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          backgroundColor: 'rgba(7,7,15,0.98)',
          borderTop: open
            ? '1px solid var(--border)'
            : 'none',
        }}
      >
        <nav
          aria-label="Navegação mobile"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            padding: '1.5rem 1.5rem 2rem',
          }}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="font-mono"
              style={{
                color: 'var(--text)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {link.label}
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
        </nav>
      </div>
    </header>
  )
}