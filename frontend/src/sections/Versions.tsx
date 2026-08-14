import { Reveal } from '@/components/Reveal'
import { useRef, useEffect, useState } from 'react'

const versions = [
  {
    version: 'v1',
    title: 'Meu Portfólio',
    description: 'Primeira versão em React + TypeScript. Diferenciais: sistema de avaliação simples e gamificação básica para engajar visitantes.',
    tech: ['React', 'TypeScript'],
    url: 'https://ericikedaportfolio.vercel.app/',
    year: '2023',
  },
  {
    version: 'v2',
    title: 'Portfólio TypeScript',
    description: 'Segunda versão em React + TypeScript com sistema de gamificação bem elaborado — pontuação, conquistas e progressão interativa.',
    tech: ['React', 'TypeScript'],
    url: 'https://ericyikedaportfolio.vercel.app/',
    year: '2023',
  },
  {
    version: 'v3.2',
    title: 'Portfólio de Projetos',
    description: 'Foco em exibição de projetos, nova seção de habilidades e layout melhorado.',
    tech: ['React', 'TypeScript'],
    url: 'https://ericyikedaportfolio32.vercel.app/',
    year: '2024',
  },
  {
    version: 'v4',
    title: 'Portfolio 4.0',
    description: 'Design system maduro, animações e seções aprimoradas.',
    tech: ['React', 'TypeScript', 'Tailwind'],
    url: 'https://ericyikedaportfolio4.vercel.app/',
    year: '2024',
  },
  {
    version: 'v5',
    title: 'Portfólio atual',
    description: 'Dark tech, animações de scroll, typewriter effect e foco em qualidade visual.',
    tech: ['React', 'TypeScript', 'Tailwind v4'],
    url: null,
    year: '2025',
    current: true,
  },
]

const ExternalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

function VersionCard({ v, index }: { v: (typeof versions)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) }
      },
      { threshold: 0.08 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${index * 80}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${index * 80}ms`,
        background: v.current ? 'var(--surface)' : 'var(--card)',
        padding: '1.6rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        position: 'relative',
        transition2: 'background 0.2s',
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        if (!v.current) (e.currentTarget as HTMLElement).style.background = 'var(--surface)'
      }}
      onMouseLeave={(e) => {
        if (!v.current) (e.currentTarget as HTMLElement).style.background = 'var(--card)'
      }}
    >
      {/* Blue top bar on current */}
      {v.current && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--blue)' }} />
      )}

      {/* Version number + year */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span
          className="font-display"
          style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            lineHeight: 1,
            color: v.current ? 'var(--blue)' : 'var(--muted-2)',
            letterSpacing: '-0.02em',
          }}
        >
          {v.version}
        </span>
        <span
          className="font-mono"
          style={{ fontSize: '0.70rem', letterSpacing: '0.1em', color: 'var(--muted-2)', textTransform: 'uppercase', marginTop: 4 }}
        >
          {v.year}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', lineHeight: 1.3 }}>
        {v.title}
      </div>

      {/* Description — fixed height so cards align */}
      <p
        style={{
          fontSize: '0.84rem',
          lineHeight: 1.65,
          color: 'var(--muted)',
          fontWeight: 400,
          flex: 1,
          minHeight: '3.3em',
        }}
      >
        {v.description}
      </p>

      {/* Tech chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
        {v.tech.map((t) => (
          <span
            key={t}
            className="font-mono"
            style={{
              fontSize: '0.76rem',
              letterSpacing: '0.08em',
              color: v.current ? 'var(--blue)' : 'var(--muted)',
              background: v.current ? 'var(--blue-dim)' : 'transparent',
              border: `1px solid ${v.current ? 'rgba(66,133,255,0.2)' : 'var(--border)'}`,
              padding: '0.2rem 0.5rem',
              borderRadius: 2,
              textTransform: 'uppercase',
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Footer link / current indicator */}
      <div style={{ marginTop: 2 }}>
        {v.url ? (
          <a
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              color: 'var(--muted)',
              textDecoration: 'none',
              textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--blue)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--muted)')}
          >
            Visitar <ExternalIcon />
          </a>
        ) : (
          <div className="font-mono" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--blue)', textTransform: 'uppercase' }}>
            ● Você está aqui
          </div>
        )}
      </div>
    </div>
  )
}

export default function Versions() {
  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '7rem 2rem' }}>
      <div style={{ marginBottom: '3.5rem' }}>
        <Reveal from="bottom">
          <div className="section-label">05 — Versões anteriores</div>
        </Reveal>
        <Reveal delay={80} from="bottom">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="display-heading">
              Evolução do <span className="accent">portfólio</span>
            </h2>
            <p className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--muted)', letterSpacing: '0.05em', maxWidth: 260, lineHeight: 1.7 }}>
              Cada versão representa um passo na jornada como desenvolvedor.
            </p>
          </div>
        </Reveal>
      </div>

      {/* 5-column grid — all cards same height, no empty space */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          border: '1px solid var(--border)',
          borderRight: 'none',
          borderBottom: 'none',
          borderRadius: 4,
          overflow: 'hidden',
        }}
        className="versions-grid"
      >
        {versions.map((v, i) => (
          <VersionCard key={v.version} v={v} index={i} />
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .versions-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 580px) {
          .versions-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 380px) {
          .versions-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
