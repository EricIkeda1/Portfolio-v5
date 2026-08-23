import { useEffect, useState, useRef } from 'react'
import { Reveal } from '@/components/Reveal'

const GITHUB_USER = 'EricIkeda1'

interface GithubStats {
  repos: number
  followers: number
  stars: number
  languages: { name: string; count: number }[]
  yearsActive: number
}

const STATIC_GITHUB_STATS: GithubStats = {
  repos: 50,
  followers: 0,
  stars: 0,
  languages: [
    { name: 'TypeScript', count: 18 },
    { name: 'Dart', count: 10 },
    { name: 'Python', count: 8 },
    { name: 'JavaScript', count: 5 },
    { name: 'HTML', count: 4 },
  ],
  yearsActive: 2,
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  Dart: '#00B4AB',
  HTML: '#E34F26',
  CSS: '#1572B6',
  Other: '#6B6B90',
}

function useCountUp(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active || target === 0) return
    const start = performance.now()
    const raf = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * target))
      if (p < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [target, active, duration])
  return value
}

function StatCard({
  label,
  value,
  suffix = '',
  sub,
  active,
  accent,
  large,
}: {
  label: string
  value: number
  suffix?: string
  sub?: string
  active: boolean
  accent?: boolean
  large?: boolean
}) {
  const count = useCountUp(value, active)
  return (
    <div
      style={{
        padding: large ? '2rem' : '1.5rem',
        background: accent ? 'var(--blue-dim)' : 'var(--card)',
        border: `1px solid ${accent ? 'rgba(66,133,255,0.25)' : 'var(--border)'}`,
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        transition: 'border-color 0.2s, background 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(66,133,255,0.4)'
        el.style.background = accent ? 'rgba(66,133,255,0.12)' : 'var(--surface)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = accent ? 'rgba(66,133,255,0.25)' : 'var(--border)'
        el.style.background = accent ? 'var(--blue-dim)' : 'var(--card)'
      }}
    >
      <div
        className="font-mono"
        style={{ fontSize: '0.72rem', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase' }}
      >
        {label}
      </div>
      <div
        className="font-display"
        style={{
          fontSize: large ? 'clamp(2.5rem, 5vw, 4rem)' : 'clamp(1.8rem, 3vw, 2.6rem)',
          fontWeight: 800,
          color: accent ? 'var(--blue)' : 'var(--text)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {count}{suffix}
      </div>
      {sub && (
        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 400, marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function LangBar({ languages, active }: { languages: GithubStats['languages']; active: boolean }) {
  const total = languages.reduce((s, l) => s + l.count, 0)
  return (
    <div
      style={{
        padding: '1.5rem',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div className="font-mono" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase' }}>
        Linguagens — Top {languages.length}
      </div>

      {/* Stacked bar */}
      <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 2 }}>
        {languages.map((l) => {
          const pct = (l.count / total) * 100
          return (
            <div
              key={l.name}
              style={{
                width: active ? `${pct}%` : '0%',
                background: LANG_COLORS[l.name] ?? LANG_COLORS.Other,
                borderRadius: 3,
                transition: `width 1s cubic-bezier(0.22,1,0.36,1) ${languages.indexOf(l) * 80}ms`,
              }}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem 1.25rem' }}>
        {languages.map((l) => (
          <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: LANG_COLORS[l.name] ?? LANG_COLORS.Other,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{l.name}</span>
            <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
              {Math.round((l.count / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Highlights() {
  const stats = STATIC_GITHUB_STATS
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); obs.unobserve(el) } }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '6rem 2rem',
      }}
    >
      <div className="container">
        {/* Header */}
        <Reveal from="bottom">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2.5rem',
            }}
          >
            <div>
              <div className="section-label" style={{ marginBottom: '0.75rem' }}>Destaques</div>
              <h2 className="display-heading">
                Números <span className="accent">reais</span>
              </h2>
            </div>
            <a
              href={`https://github.com/${GITHUB_USER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.76rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                textDecoration: 'none',
                padding: '0.55rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: 4,
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.color = 'var(--text)'
                el.style.borderColor = 'var(--border-bright)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.color = 'var(--muted)'
                el.style.borderColor = 'var(--border)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
              </svg>
              github.com/{GITHUB_USER}
            </a>
          </div>
        </Reveal>

        <div ref={ref}>
          {stats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Row 1 — 4 stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }} className="highlights-grid">
                <StatCard label="Repositórios públicos" value={stats.repos} suffix="+" active={active} accent large />
                <StatCard label="Seguidores GitHub" value={stats.followers} active={active} />
                <StatCard label="Stars recebidas" value={stats.stars} active={active} />
                <StatCard
                  label="Anos no GitHub"
                  value={stats.yearsActive}
                  suffix="+"
                  sub="desenvolvendo continuamente"
                  active={active}
                />
              </div>

              {/* Row 2 — language bar + github CTA card */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'stretch' }} className="highlights-row2">
                <LangBar languages={stats.languages} active={active} />

                <a
                  href={`https://github.com/${GITHUB_USER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '1.5rem 2rem',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    minWidth: 160,
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'rgba(66,133,255,0.4)'
                    el.style.background = 'var(--surface)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--border)'
                    el.style.background = 'var(--card)'
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--text)">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
                  </svg>
                  <span
                    className="font-mono"
                    style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', textAlign: 'center' }}
                  >
                    Ver perfil
                  </span>
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.7; }
        }
        @media (max-width: 900px) {
          .highlights-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .highlights-row2 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .highlights-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
