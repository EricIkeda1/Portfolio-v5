import { useState } from 'react'
import { Reveal } from '@/components/Reveal'

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
  </svg>
)

const projects = [
  {
    name: 'Ademiconnect',
    type: 'CRM Mobile',
    tags: ['Flutter', 'Supabase', 'Mobile'],
    description:
      'CRM Mobile desenvolvido com Flutter e Supabase, com sincronização em tempo real e funcionamento offline. Solução completa para gestão de relacionamento com clientes.',
    highlights: ['Sync em tempo real', 'Modo offline', 'Flutter + Supabase'],
    github: 'https://github.com/EricIkeda1/Ademiconnect',
    color: '#4285FF',
  },
  {
    name: 'Temperlights',
    type: 'App Industrial',
    tags: ['Mobile', 'Rastreabilidade', 'Produção'],
    description:
      'Aplicativo para rastreabilidade da produção industrial, com acompanhamento em tempo real de cada etapa do processo de fabricação.',
    highlights: ['Rastreabilidade', 'Produção industrial', 'Tempo real'],
    github: 'https://github.com/EricIkeda1/Temperlights-Mobile',
    color: '#5B9BFF',
  },
  {
    name: 'X4Glass',
    type: 'Sistema Web',
    tags: ['Full Stack', 'Rastreabilidade', 'Equipe'],
    description:
      'Sistema de rastreabilidade para produção de vidros desenvolvido em equipe. Projeto colaborativo com foco em qualidade e organização de processos industriais.',
    highlights: ['Desenvolvimento em equipe', 'Rastreabilidade', 'Full Stack'],
    github: 'https://github.com/EricIkeda1/X4Glass',
    color: '#7AB3FF',
  },
  {
    name: 'AES',
    type: 'Criptografia',
    tags: ['Python', 'Cibersegurança', 'Algoritmos'],
    description:
      'Implementação completa do algoritmo AES (Advanced Encryption Standard) em Python do zero, sem bibliotecas externas. Desenvolvido na disciplina de Segurança da Informação, cobre todas as etapas: Key Expansion, SubBytes, ShiftRows, MixColumns e AddRoundKey — 10 rounds de criptografia com chave de 128 bits.',
    highlights: ['AES 128-bit', 'Python puro', 'Cibersegurança'],
    github: 'https://github.com/EricIkeda1/AES',
    color: '#A78BFF',
  },
]

export default function Experience() {
  const [active, setActive] = useState(0)
  const proj = projects[active]

  return (
    <section
      id="experiencia"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '7rem 2rem',
      }}
    >
      <div className="container">
        <div style={{ marginBottom: '3.5rem' }}>
          <Reveal from="bottom">
            <div className="section-label">03 — Experiência</div>
          </Reveal>
          <Reveal delay={80} from="bottom">
            <h2 className="display-heading">
              Projetos <span className="accent">em destaque</span>
            </h2>
          </Reveal>
        </div>

        <Reveal from="bottom" delay={120} threshold={0.06}>
          <div
            className="exp-layout"
            style={{
              background: 'var(--border)',
              gap: '1px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            {/* Sidebar */}
            <div style={{ background: 'var(--card)', display: 'flex', flexDirection: 'column' }}>
              {projects.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => setActive(i)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '1.2rem 1.25rem',
                    background: active === i ? 'var(--bg)' : 'transparent',
                    border: 'none',
                    borderLeft: active === i ? `3px solid ${p.color}` : '3px solid transparent',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (active !== i) (e.currentTarget as HTMLElement).style.background = 'var(--surface)'
                  }}
                  onMouseLeave={(e) => {
                    if (active !== i) (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  <div
                    className="font-mono"
                    style={{
                      fontSize: '0.76rem',
                      letterSpacing: '0.14em',
                      color: active === i ? p.color : 'var(--muted)',
                      textTransform: 'uppercase',
                      marginBottom: 3,
                      transition: 'color 0.2s',
                    }}
                  >
                    {p.type}
                  </div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: active === i ? 'var(--text)' : 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      transition: 'color 0.2s',
                    }}
                  >
                    {p.name}
                  </div>
                </button>
              ))}
            </div>

            {/* Detail */}
            <div
              key={active}
              style={{
                background: 'var(--bg)',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                animation: 'detailIn 0.35s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <h3
                    className="font-display"
                    style={{
                      fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: 'var(--text)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {proj.name}
                  </h3>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.70rem',
                      letterSpacing: '0.1em',
                      color: proj.color,
                      background: `${proj.color}12`,
                      border: `1px solid ${proj.color}38`,
                      padding: '0.26rem 0.6rem',
                      borderRadius: 2,
                      textTransform: 'uppercase',
                    }}
                  >
                    {proj.type}
                  </span>
                </div>

                <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--muted)', maxWidth: 520, fontWeight: 400, marginBottom: '1.75rem' }}>
                  {proj.description}
                </p>
              </div>

              <div>
                <div className="font-mono" style={{ fontSize: '0.70rem', letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.7rem' }}>
                  Destaques
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {proj.highlights.map((h) => (
                    <span key={h} style={{ fontSize: '0.84rem', color: 'var(--text)', background: 'var(--card)', border: '1px solid var(--border)', padding: '0.28rem 0.65rem', borderRadius: 2 }}>
                      {h}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {proj.tags.map((t) => (
                      <span key={t} className="font-mono" style={{ fontSize: '0.70rem', letterSpacing: '0.1em', color: proj.color, textTransform: 'uppercase' }}>
                        #{t}
                      </span>
                    ))}
                  </div>

                  <a
                    href={proj.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.74rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--muted)',
                      textDecoration: 'none',
                      padding: '0.4rem 0.85rem',
                      border: '1px solid var(--border)',
                      borderRadius: 2,
                      transition: 'color 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.color = proj.color
                      el.style.borderColor = `${proj.color}60`
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.color = 'var(--muted)'
                      el.style.borderColor = 'var(--border)'
                    }}
                  >
                    <GithubIcon />
                    Ver no GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        @keyframes detailIn {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}
