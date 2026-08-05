import { Reveal, RevealGroup } from '@/components/Reveal'

const stats = [
  { value: '15+', label: 'Projetos Completos', desc: 'Aplicações entregues do início ao fim' },
  { value: '50+', label: 'Repositórios Públicos', desc: 'Contribuições abertas no GitHub' },
  { value: '4', label: 'Tecnologias Core', desc: 'Flutter, React, Node.js, Python' },
  { value: '2026', label: 'Formação', desc: 'Engenharia de Software — UniSenaiPR' },
]

export default function Highlights() {
  return (
    <section
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '5rem 2rem',
      }}
    >
      <div className="container">
        <Reveal from="fade">
          <div
            className="font-mono"
            style={{
              fontSize: '0.68rem',
              letterSpacing: '0.2em',
              color: 'var(--blue)',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginBottom: '2.5rem',
            }}
          >
            Destaques
          </div>
        </Reveal>

        <RevealGroup
          stagger={80}
          from="scale"
          baseDelay={0}
          className="stats-grid"
          style={{
            gap: '1px',
            background: 'var(--border)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                padding: '2.25rem 1.75rem',
                background: 'var(--card)',
                textAlign: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--card)')}
            >
              <div
                className="font-display"
                style={{
                  fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
                  fontWeight: 800,
                  color: 'var(--blue)',
                  lineHeight: 1,
                  marginBottom: '0.4rem',
                  letterSpacing: '-0.02em',
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.3rem' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                {s.desc}
              </div>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
