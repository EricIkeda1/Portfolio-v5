import { useState, useEffect } from 'react'
import { Reveal, RevealGroup } from '@/components/Reveal'

function BrasiliaTime() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const t = new Date().toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      setTime(t)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return <span>{time} (BRT)</span>
}

const contactItems = [
  {
    label: 'Email',
    value: 'ericikeda2002@mail.com',
    href: 'mailto:ericikeda2002@mail.com',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    value: 'github.com/EricIkeda1',
    href: 'https://github.com/EricIkeda1',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
      </svg>
    ),
  },
  {
    label: 'Localização',
    value: 'Ibiporã, PR - Brasil',
    href: null,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    extra: <BrasiliaTime />,
  },
]

function ContactCard({ item }: { item: (typeof contactItems)[0] }) {
  const inner = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.1rem 1.4rem',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 4,
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'rgba(66,133,255,0.35)'
        el.style.background = 'var(--surface)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--border)'
        el.style.background = 'var(--card)'
      }}
    >
      <span style={{ color: 'var(--blue)', flexShrink: 0 }}>{item.icon}</span>
      <div style={{ flex: 1 }}>
        <div className="font-mono" style={{ fontSize: '0.76rem', letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>
          {item.label}
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 500 }}>{item.value}</div>
        {'extra' in item && item.extra && (
          <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2, letterSpacing: '0.04em' }}>
            {item.extra}
          </div>
        )}
      </div>
      {item.href && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      )}
    </div>
  )

  return item.href ? (
    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      {inner}
    </a>
  ) : (
    <div>{inner}</div>
  )
}

export default function Contact() {
  return (
    <section id="contato" className="section-pad">
      <div className="container">
        <div className="contact-grid">
          {/* Left */}
          <div>
            <Reveal from="bottom">
              <div className="section-label">04 — Contato</div>
            </Reveal>
            <Reveal delay={80} from="bottom">
              <h2 className="display-heading" style={{ marginBottom: '1.25rem' }}>
                Vamos <span className="accent">conversar</span>
              </h2>
            </Reveal>

            <RevealGroup stagger={90} from="bottom" baseDelay={200} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {contactItems.map((item) => (
                <ContactCard key={item.label} item={item} />
              ))}
            </RevealGroup>
          </div>

          {/* Right */}
          <Reveal from="left" delay={100} threshold={0.08}>
            <div>
              <div
                style={{
                  padding: '2.25rem',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(66,133,255,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />

                <div className="font-mono" style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'var(--blue)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                  Objetivo
                </div>

                <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--muted)', marginBottom: '1.75rem', fontWeight: 400 }}>
                  Busco oportunidades de
                  <strong style={{ color: 'var(--text)', fontWeight: 600 }}></strong> vaga como{' '}
                  <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Desenvolvedor Júnior</strong> e projetos{' '}
                  <strong style={{ color: 'var(--text)', fontWeight: 600 }}>freelancer</strong>, contribuindo com
                  soluções modernas e evoluindo continuamente como desenvolvedor.
                </p>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <div className="font-mono" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Interesse em
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                    {['Dev Júnior', 'Freelancer', 'Full Stack', 'Mobile'].map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.84rem',
                          color: 'var(--blue)',
                          background: 'var(--blue-dim)',
                          border: '1px solid rgba(66,133,255,0.2)',
                          padding: '0.28rem 0.65rem',
                          borderRadius: 2,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '1rem 1.4rem',
                  background: 'rgba(66,133,255,0.05)',
                  border: '1px solid rgba(66,133,255,0.18)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#4ADE80',
                    boxShadow: '0 0 8px rgba(74,222,128,0.5)',
                    flexShrink: 0,
                    animation: 'pulse-glow 2s ease-in-out infinite',
                  }}
                />
                <span className="font-mono" style={{ fontSize: '0.74rem', letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Disponível para novas oportunidades
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
