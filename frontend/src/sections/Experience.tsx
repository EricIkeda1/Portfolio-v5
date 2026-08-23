import { useEffect, useMemo, useState } from 'react'
import { Reveal } from '@/components/Reveal'
import { usePortfolioContent } from '@/context/PortfolioContentContext'

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
  </svg>
)

export default function Experience() {
  const { content } = usePortfolioContent()
  const projects = useMemo(
    () => [...content.projects].sort((a, b) => a.sort_order - b.sort_order),
    [content.projects],
  )
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (active >= projects.length) setActive(0)
  }, [active, projects.length])

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

        {!proj ? (
          <div className="portfolio-empty-state">Nenhum projeto cadastrado.</div>
        ) : (
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
              <div style={{ background: 'var(--card)', display: 'flex', flexDirection: 'column' }}>
                {projects.map((project, index) => (
                  <button
                    key={project.id}
                    onClick={() => setActive(index)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '1.2rem 1.25rem',
                      background: active === index ? 'var(--bg)' : 'transparent',
                      border: 'none',
                      borderLeft: active === index ? `3px solid ${project.color}` : '3px solid transparent',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(event) => {
                      if (active !== index) event.currentTarget.style.background = 'var(--surface)'
                    }}
                    onMouseLeave={(event) => {
                      if (active !== index) event.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div
                      className="font-mono"
                      style={{
                        fontSize: '0.76rem',
                        letterSpacing: '0.14em',
                        color: active === index ? project.color : 'var(--muted)',
                        textTransform: 'uppercase',
                        marginBottom: 3,
                      }}
                    >
                      {project.type}
                    </div>
                    <div
                      className="font-display"
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: active === index ? 'var(--text)' : 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {project.name}
                    </div>
                  </button>
                ))}
              </div>

              <div
                key={proj.id}
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
                  {proj.image_url && (
                    <div className="project-featured-image-wrap">
                      <img className="project-featured-image" src={proj.image_url} alt={`Imagem do projeto ${proj.name}`} />
                    </div>
                  )}

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

                  <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--muted)', maxWidth: 620, fontWeight: 400, marginBottom: '1.75rem' }}>
                    {proj.description}
                  </p>
                </div>

                <div>
                  {proj.highlights.length > 0 && (
                    <>
                      <div className="font-mono" style={{ fontSize: '0.70rem', letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.7rem' }}>
                        Destaques
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                        {proj.highlights.map((highlight) => (
                          <span key={highlight} style={{ fontSize: '0.84rem', color: 'var(--text)', background: 'var(--card)', border: '1px solid var(--border)', padding: '0.28rem 0.65rem', borderRadius: 2 }}>
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {proj.tags.map((tag) => (
                        <span key={tag} className="font-mono" style={{ fontSize: '0.70rem', letterSpacing: '0.1em', color: proj.color, textTransform: 'uppercase' }}>
                          #{tag}
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
                    >
                      <GithubIcon />
                      Ver projeto
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </div>

      <style>{`
        @keyframes detailIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
