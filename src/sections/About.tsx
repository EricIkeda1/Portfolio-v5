import { useEffect, useState, type DragEvent, type MouseEvent } from 'react'
import { Reveal, RevealGroup } from '@/components/Reveal'
import { usePortfolioContent } from '@/context/PortfolioContentContext'

const areas = [
  {
    title: 'Full Stack',
    desc: 'Desenvolvimento de aplicações web completas, do banco de dados à interface.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    title: 'Mobile',
    desc: 'Apps multiplataforma com Flutter — foco em UX e desempenho nativo.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    title: 'Back-end',
    desc: 'APIs robustas com Node.js e Django em arquiteturas escaláveis.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
]

export default function About() {
  const { content } = usePortfolioContent()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false
    const controller = new AbortController()

    const loadProfileImage = async () => {
      try {
        setImageLoaded(false)
        setImageError(false)

        const response = await fetch('/api/profile-image', {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'image/*' },
          signal: controller.signal,
        })

        if (!response.ok) throw new Error(`Erro ao carregar imagem: ${response.status}`)

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.toLowerCase().startsWith('image/')) {
          throw new Error(`Resposta inválida: ${contentType || 'sem Content-Type'}.`)
        }

        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)

        if (!cancelled) {
          setProfileImage(objectUrl)
          setImageLoaded(true)
        }
      } catch (error) {
        if (cancelled || controller.signal.aborted) return

        console.error('Erro ao carregar foto do perfil:', error)
        setProfileImage(null)
        setImageError(true)
        setImageLoaded(false)
      }
    }

    void loadProfileImage()

    return () => {
      cancelled = true
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [content.updated_at])

  const paragraphs = content.about_text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const blockContextMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
  }

  const blockDrag = (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
  }

  return (
    <section id="sobre" className="section-pad">
      <div className="container">
        <div className="grid-2">
          <div>
            <Reveal from="bottom">
              <div className="section-label">01 — Sobre</div>
            </Reveal>

            <Reveal delay={60} from="bottom">
              <h2 className="display-heading" style={{ marginBottom: '1.5rem' }}>
                Quem sou <span className="accent">eu</span>
              </h2>
            </Reveal>

            <Reveal delay={120} from="scale">
              <div
                onContextMenu={blockContextMenu}
                onDragStart={blockDrag}
                onMouseDown={(event) => {
                  if (event.button === 2) event.preventDefault()
                }}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: 120,
                  height: 120,
                  marginBottom: '2rem',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: -3,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, var(--blue) 0%, rgba(66,133,255,0.2) 100%)',
                    zIndex: 0,
                    pointerEvents: 'none',
                  }}
                />

                <div
                  role="img"
                  aria-label="Eric Y. Ikeda"
                  style={{
                    width: 120,
                    height: 120,
                    position: 'relative',
                    zIndex: 1,
                    borderRadius: 10,
                    overflow: 'hidden',
                    backgroundColor: 'var(--surface)',
                    backgroundImage: profileImage ? `url("${profileImage}")` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                    backgroundRepeat: 'no-repeat',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    pointerEvents: 'none',
                  }}
                >
                  {!imageLoaded && !imageError && (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--muted)',
                        fontSize: '0.7rem',
                      }}
                    >
                      Carregando...
                    </div>
                  )}

                  {imageError && (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--muted)',
                        fontSize: '0.7rem',
                        textAlign: 'center',
                        padding: '0.5rem',
                      }}
                    >
                      Foto indisponível
                    </div>
                  )}
                </div>

                <div
                  aria-hidden="true"
                  onContextMenu={blockContextMenu}
                  onDragStart={blockDrag}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 10,
                    zIndex: 2,
                    cursor: 'default',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                  }}
                />

                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    bottom: 6,
                    right: 6,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#4ADE80',
                    border: '2px solid var(--card)',
                    boxShadow: '0 0 8px rgba(74,222,128,0.6)',
                    zIndex: 3,
                    animation: 'pulse-glow 2s ease-in-out infinite',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </Reveal>

            {paragraphs.map((paragraph, index) => (
              <Reveal key={`${paragraph.slice(0, 24)}-${index}`} delay={200 + index * 60} from="bottom">
                <p
                  style={{
                    fontSize: '0.97rem',
                    lineHeight: 1.8,
                    color: 'var(--muted)',
                    marginBottom: index === paragraphs.length - 1 ? '1.75rem' : '1rem',
                    fontWeight: 400,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {paragraph}
                </p>
              </Reveal>
            ))}

            <Reveal delay={380} from="bottom">
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderLeft: '3px solid var(--blue)',
                  borderRadius: 4,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.72rem',
                    letterSpacing: '0.12em',
                    color: 'var(--blue)',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  Formação
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 500 }}>
                  Engenharia de Software
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 2 }}>
                  UniSenaiPR – Londrina · Conclusão: 2026
                </div>
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal from="fade">
              <div
                className="font-mono"
                style={{
                  fontSize: '0.74rem',
                  letterSpacing: '0.15em',
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  marginBottom: '1.5rem',
                }}
              >
                Áreas de atuação
              </div>
            </Reveal>

            <RevealGroup
              stagger={90}
              from="bottom"
              baseDelay={100}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
            >
              {areas.map((area) => (
                <div
                  key={area.title}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1.25rem',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    cursor: 'default',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.borderColor = 'rgba(66,133,255,0.28)'
                    event.currentTarget.style.background = 'var(--surface)'
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.borderColor = 'var(--border)'
                    event.currentTarget.style.background = 'var(--card)'
                  }}
                >
                  <span style={{ color: 'var(--blue)', marginTop: 2, flexShrink: 0 }}>{area.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 3, fontSize: '0.9rem' }}>
                      {area.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                      {area.desc}
                    </div>
                  </div>
                </div>
              ))}
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  )
}
