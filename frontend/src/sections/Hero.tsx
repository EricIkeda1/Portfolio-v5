import { TypewriterText } from '@/components/TypewriterText'
import logoSrc from '@/imports/Logo.png'

// ← coloque aqui o seu número com DDI+DDD, ex: 5543999990000
const WHATSAPP_NUMBER = '5543996369387'

const roles = ['Full Stack Developer', 'Mobile Developer', 'Software Engineering Student']

const anim = (delay: number) => ({
  animation: `heroUp 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
})

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const socialLinks = [
  {
    label: 'github.com/EricIkeda1',
    href: 'https://github.com/EricIkeda1',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
      </svg>
    ),
  },
  {
    label: 'ericikeda2002@mail.com',
    href: 'mailto:ericikeda2002@mail.com',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    icon: <WhatsAppIcon size={14} />,
    color: '#25D366',
  },
]

export default function Hero() {
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
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroScale {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes heroFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scrollBounce {
          0%   { transform: translateY(0);   opacity: 1; }
          50%  { transform: translateY(8px);  opacity: 0.4; }
          100% { transform: translateY(0);   opacity: 1; }
        }
        @keyframes chevronCascade {
          0%, 100% { opacity: 0.15; transform: translateY(0); }
          50%      { opacity: 1;    transform: translateY(4px); }
        }
        @keyframes waFloat {
          0%, 100% { transform: translateY(0)   scale(1); }
          50%      { transform: translateY(-4px) scale(1.04); }
        }
      `}</style>

      <div className="container">
        <div className="hero-grid">
          {/* Text */}
          <div>
            <div style={anim(0)}>
              <div className="section-label" style={{ marginBottom: '1.25rem' }}>Portfólio v5</div>
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
                    segments={[{ text: 'ERIC ' }, { text: 'Y.', color: 'var(--blue)' }]}
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '1.75rem 0' }}>
                {roles.map((r) => (
                  <span
                    key={r}
                    className="font-mono"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      color: 'var(--muted)',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      padding: '0.3rem 0.7rem',
                      borderRadius: 2,
                      textTransform: 'uppercase',
                    }}
                  >
                    {r}
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
                  fontWeight: 300,
                }}
              >
                Desenvolvedor apaixonado por tecnologia, focado na criação de aplicações web e
                mobile com código limpo, arquitetura organizada e boa experiência do usuário.
              </p>
            </div>

            <div style={anim(320)}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href="#experiencia"
                  className="font-mono"
                  style={{
                    background: 'var(--blue)',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '0.8rem 1.75rem',
                    borderRadius: 3,
                    fontSize: '0.7rem',
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
                  Ver projetos
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>

                {/* WhatsApp CTA button */}
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono"
                  style={{
                    background: '#25D366',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '0.8rem 1.75rem',
                    borderRadius: 3,
                    fontSize: '0.7rem',
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
                    el.style.opacity = '0.85'
                    el.style.boxShadow = '0 0 28px rgba(37,211,102,0.35)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.opacity = '1'
                    el.style.boxShadow = 'none'
                  }}
                >
                  <WhatsAppIcon size={14} />
                  WhatsApp
                </a>

                <a
                  href="#contato"
                  className="font-mono"
                  style={{
                    background: 'transparent',
                    color: 'var(--text)',
                    textDecoration: 'none',
                    padding: '0.8rem 1.75rem',
                    borderRadius: 3,
                    fontSize: '0.7rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    border: '1px solid var(--border-bright)',
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
                  Contato
                </a>
              </div>
            </div>

            {/* Social links */}
            <div style={{ ...anim(400), display: 'flex', gap: '1.5rem', marginTop: '2.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
                    fontSize: '0.62rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = (s as any).color ?? 'var(--blue)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--muted)')}
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
              animation: 'heroScale 0.75s cubic-bezier(0.22,1,0.36,1) 200ms both',
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
                background: 'radial-gradient(circle, rgba(66,133,255,0.14) 0%, transparent 70%)',
                filter: 'blur(24px)',
              }}
            />
            <img
              src={logoSrc}
              alt="Eric Y. Ikeda"
              style={{ width: 230, height: 230, objectFit: 'contain', position: 'relative', zIndex: 1 }}
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
          onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '0.56rem',
              letterSpacing: '0.22em',
              color: 'var(--muted-2)',
              textTransform: 'uppercase',
              marginBottom: '0.6rem',
            }}
          >
            Scroll
          </span>
          {/* Three cascading chevrons */}
          {[0, 1, 2].map((i) => (
            <svg
              key={i}
              width="20"
              height="12"
              viewBox="0 0 20 12"
              fill="none"
              style={{
                animation: `chevronCascade 1.4s ease-in-out ${i * 220}ms infinite`,
                display: 'block',
                marginTop: i === 0 ? 0 : -3,
              }}
            >
              <polyline
                points="2,2 10,10 18,2"
                stroke="var(--muted-2)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ))}
        </div>
      </div>

      {/* Floating WhatsApp button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Falar no WhatsApp"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#25D366',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
          animation: 'waFloat 3s ease-in-out infinite',
          transition: 'box-shadow 0.2s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = '0 6px 30px rgba(37,211,102,0.65)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(37,211,102,0.4)')}
      >
        <WhatsAppIcon size={26} />
      </a>
    </section>
  )
}
