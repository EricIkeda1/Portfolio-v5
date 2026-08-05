import { Reveal, RevealGroup } from '@/components/Reveal'

const photoSrc = '/assets/images/Perfil.png'

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
  return (
    <section id="sobre" className="section-pad">
      <div className="container">
        <div className="grid-2">

          {/* Left — photo + bio */}
          <div>
            <Reveal from="bottom">
              <div className="section-label">01 — Sobre</div>
            </Reveal>

            <Reveal delay={60} from="bottom">
              <h2 className="display-heading" style={{ marginBottom: '1.5rem' }}>
                Quem sou <span className="accent">eu</span>
              </h2>
            </Reveal>

            {/* Profile photo */}
            <Reveal delay={120} from="scale">
              <div
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  marginBottom: '2rem',
                }}
              >
                {/* Blue glow ring */}
                <div
                  style={{
                    position: 'absolute',
                    inset: -3,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, var(--blue) 0%, rgba(66,133,255,0.2) 100%)',
                    zIndex: 0,
                  }}
                />
                <img
                  src={photoSrc}
                  alt="Eric Y. Ikeda"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    borderRadius: 10,
                    display: 'block',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
                {/* Online badge */}
                <span
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
                    zIndex: 2,
                    animation: 'pulse-glow 2s ease-in-out infinite',
                  }}
                />
              </div>
            </Reveal>

            <Reveal delay={200} from="bottom">
              <p style={{ fontSize: '0.97rem', lineHeight: 1.8, color: 'var(--muted)', marginBottom: '1rem', fontWeight: 300 }}>
                Meu nome é Eric, sou desenvolvedor de software e gosto de transformar ideias em projetos reais.
                Desenvolvo sites, sistemas e aplicações, sempre buscando criar soluções{' '}
                <strong style={{ color: 'var(--text)', fontWeight: 500 }}>modernas</strong>,{' '}
                <strong style={{ color: 'var(--text)', fontWeight: 500 }}>rápidas</strong> e que realmente façam
                a diferença para quem as utiliza.
              </p>
            </Reveal>

            <Reveal delay={260} from="bottom">
              <p style={{ fontSize: '0.97rem', lineHeight: 1.8, color: 'var(--muted)', marginBottom: '1rem', fontWeight: 300 }}>
                Gosto de participar de todas as etapas do desenvolvimento, desde o planejamento até a entrega,
                cuidando tanto da{' '}
                <strong style={{ color: 'var(--text)', fontWeight: 500 }}>experiência visual</strong> quanto da{' '}
                <strong style={{ color: 'var(--text)', fontWeight: 500 }}>qualidade do código</strong>. Meu objetivo
                é criar projetos organizados, funcionais e que ofereçam a melhor experiência possível.
              </p>
            </Reveal>

            <Reveal delay={310} from="bottom">
              <p style={{ fontSize: '0.97rem', lineHeight: 1.8, color: 'var(--muted)', marginBottom: '1.75rem', fontWeight: 300 }}>
                Além de desenvolver para clientes, também crio{' '}
                <strong style={{ color: 'var(--text)', fontWeight: 500 }}>projetos próprios</strong> para estudar
                novas tecnologias, testar ideias e evoluir como desenvolvedor. Acredito que sempre existe algo novo
                para aprender, e cada projeto é uma oportunidade de construir soluções das quais eu possa me orgulhar.
              </p>
            </Reveal>

            <Reveal delay={320} from="bottom">
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderLeft: '3px solid var(--blue)',
                  borderRadius: 4,
                }}
              >
                <div className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 4 }}>
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

          {/* Right — area cards */}
          <div>
            <Reveal from="fade">
              <div className="font-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Áreas de atuação
              </div>
            </Reveal>

            <RevealGroup stagger={90} from="bottom" baseDelay={100} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {areas.map((a) => (
                <div
                  key={a.title}
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
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'rgba(66,133,255,0.28)'
                    el.style.background = 'var(--surface)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--border)'
                    el.style.background = 'var(--card)'
                  }}
                >
                  <span style={{ color: 'var(--blue)', marginTop: 2, flexShrink: 0 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 3, fontSize: '0.9rem' }}>{a.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>{a.desc}</div>
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