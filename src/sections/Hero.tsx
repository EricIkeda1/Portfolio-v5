import { useTranslation } from '@/i18n/LanguageContext'
import { TypewriterText } from '@/components/TypewriterText'
import ProtectedLogo from '@/components/ProtectedLogo'
import { usePortfolioContent } from '@/context/PortfolioContentContext'

const roles = [
  'Desenvolvedor de Software Júnior',
  'Web & Mobile',
  'React • Flutter • TypeScript',
]

const anim = (delay: number) => ({
  animation: `heroUp 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
})

const getSocialLinks = (email: string, github: string, linkedin: string) => [
  {
    label: github.replace(/^https?:\/\//, ''),
    href: github,
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
      </svg>
    ),
  },
  {
    label: linkedin.replace(/^https?:\/\/(www\.)?/, ''),
    href: linkedin,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V8.997h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.289zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V8.997h3.564v11.455z" />
      </svg>
    ),
  },
  {
    label: email,
    href: `mailto:${email}`,
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
]

export default function Hero() {
  const { t } = useTranslation()
  const { content } = usePortfolioContent()
  const socialLinks = getSocialLinks(content.email, content.github, content.linkedin)

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 2rem',
        paddingTop: 72,
      }}
    >
      <style>{`
        @keyframes heroUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroScale {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes heroFade {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes scrollBounce {
          0% {
            transform: translateY(0);
            opacity: 1;
          }

          50% {
            transform: translateY(8px);
            opacity: 0.4;
          }

          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes chevronCascade {
          0%,
          100% {
            opacity: 0.15;
            transform: translateY(0);
          }

          50% {
            opacity: 1;
            transform: translateY(4px);
          }
        }

        @keyframes waFloat {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }

          50% {
            transform: translateY(-4px) scale(1.04);
          }
        }
      `}</style>

      <div className="container">
        <div className="hero-grid">
          {/* Text */}
          <div>
            <div style={anim(0)}>
              <div
                className="section-label"
                style={{
                  marginBottom: '1.25rem',
                }}
              >
                {t("Disponível para oportunidades Júnior")}</div>
            </div>

            <div style={anim(80)}>
              <h1
                className="font-display"
                style={{
                  fontSize: 'clamp(3rem, 10vw, 8rem)',
                  fontWeight: 800,
                  lineHeight: 0.95,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  color: 'var(--text)',
                  marginBottom: '0.2em',
                }}
              >
                <span style={{ display: 'block' }}>
                  <TypewriterText
                    segments={[
                      { text: 'ERIC ' },
                      {
                        text: 'Y.',
                        color: 'var(--blue)',
                      },
                    ]}
                    speed={60}
                    startDelay={200}
                    cursor={false}
                  />
                </span>

                <span style={{ display: 'block' }}>
                  <TypewriterText
                    segments={[{ text: 'IKEDA' }]}
                    speed={60}
                    startDelay={620}
                  />
                </span>
              </h1>
            </div>

            <div style={anim(160)}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                  margin: '1.75rem 0',
                }}
              >
                {roles.map((r) => (
                  <span
                    key={t(r)}
                    className="font-mono"
                    style={{
                      fontSize: '0.74rem',
                      letterSpacing: '0.1em',
                      color: 'var(--muted)',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      padding: '0.3rem 0.7rem',
                      borderRadius: 2,
                      textTransform: 'uppercase',
                    }}
                  >
                    {t(r)}
                  </span>
                ))}
              </div>
            </div>

            <div style={anim(240)}>
              <p
                style={{
                  fontSize: 'clamp(0.92rem, 2vw, 1.05rem)',
                  lineHeight: 1.75,
                  color: 'var(--muted)',
                  maxWidth: 520,
                  marginBottom: '2.25rem',
                  fontWeight: 400,
                }}
              >
                {t("Desenvolvedor de Software Júnior com formação em Engenharia de Software e experiência prática em aplicações web e mobile. Trabalho com React, Flutter, TypeScript, Dart, APIs REST e PostgreSQL para transformar requisitos em soluções funcionais, responsivas e bem estruturadas.")}</p>
            </div>

            <div style={anim(320)}>
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <a
                  href="#experiencia"
                  className="font-mono"
                  style={{
                    background: 'var(--blue)',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '0.8rem 1.75rem',
                    borderRadius: 3,
                    fontSize: '0.76rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    transition: 'opacity 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.opacity = '0.82'
                    el.style.boxShadow = '0 0 28px var(--blue-glow)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.opacity = '1'
                    el.style.boxShadow = 'none'
                  }}
                >
                  {t("Ver projetos")}</a>


                <a
                  href={content.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono"
                  style={{
                    background: 'transparent',
                    color: 'var(--text)',
                    textDecoration: 'none',
                    padding: '0.8rem 1.75rem',
                    borderRadius: 3,
                    fontSize: '0.76rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    border: '1px solid var(--border-bright)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--blue)'
                    el.style.color = 'var(--blue)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--border-bright)'
                    el.style.color = 'var(--text)'
                  }}
                >
                  LinkedIn
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="M14 3h7v7" />
                    <path d="M10 14 21 3" />
                    <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Social links */}
            <div
              style={{
                ...anim(400),
                display: 'flex',
                gap: '1.5rem',
                marginTop: '2.25rem',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {socialLinks.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="font-mono"
                  style={{
                    color: 'var(--muted)',
                    textDecoration: 'none',
                    fontSize: '0.72rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.color =
                      'var(--blue)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.color =
                      'var(--muted)'
                  }}
                >
                  {s.icon}
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Logo */}
          <div
            className="hero-logo"
            style={{
              animation:
                'heroScale 0.75s cubic-bezier(0.22,1,0.36,1) 200ms both',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 300,
                height: 300,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(66,133,255,0.14) 0%, transparent 70%)',
                filter: 'blur(24px)',
              }}
            />

            <ProtectedLogo
              style={{
                width: 230,
                height: 230,
                objectFit: 'contain',
                position: 'relative',
                zIndex: 1,
              }}
            />
          </div>
        </div>

        {/* Scroll cue — animated chevron cascade */}
        <div
          style={{
            animation: 'heroFade 0.8s ease 1000ms both',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '3rem',
            gap: 0,
            cursor: 'pointer',
          }}
          onClick={() =>
            document
              .getElementById('sobre')
              ?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          <span
            className="font-mono"
            style={{
              fontSize: '0.76rem',
              letterSpacing: '0.22em',
              color: 'var(--muted-2)',
              textTransform: 'uppercase',
              marginBottom: '0.6rem',
            }}
          >
            Scroll
          </span>
        </div>
      </div>

    </section>
  )
}