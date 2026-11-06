import { useState } from 'react'
import SpotifyPlayer from './components/SpotifyPlayer'
import './links.css'

const networks = [
  {
    name: 'Instagram',
    handle: '@yujiikeda_',
    description: 'Um pouco da vida fora das telas.',
    href: 'https://www.instagram.com/yujiikeda_/',
    icon: 'instagram',
  },
  {
    name: 'LinkedIn',
    handle: 'Eric Ikeda',
    description: 'Minha trajetória e novas conexões.',
    href: 'https://www.linkedin.com/in/ericikeda1/',
    icon: 'linkedin',
  },
  {
    name: 'Spotify',
    handle: 'Meu perfil',
    description: 'Música pra acompanhar o dia.',
    href: 'https://open.spotify.com/user/zxcc5n3o1k5z5jd478dlcc8e8',
    icon: 'spotify',
  },
  {
    name: 'Strava',
    handle: 'Eric Ikeda',
    description: 'Corridas, movimento e ar livre.',
    href: 'https://strava.app.link/abHHLSIVP7b',
    icon: 'strava',
  },
]

export default function LinksPage() {
  const [photoError, setPhotoError] = useState(false)

  return (
    <div className="links-page">
      <header className="links-top">
        <span>EYI<span className="links-blue">.</span></span>
        <span className="links-top-caption">ME ENCONTRE POR AQUI</span>
      </header>
      <main className="links-main">
        <div className="links-avatar">
          {photoError ? <span className="links-avatar-fallback" aria-hidden="true">EI</span> : (
            <img src="/api/profile-image" alt="Foto de Eric Ikeda" width="90" height="90" decoding="async" onError={() => setPhotoError(true)} />
          )}
          <span className="links-avatar-dot" aria-hidden="true" />
        </div>
        <p className="links-eyebrow">PRAZER, ERIC</p>
        <h1>Eric Ikeda<span className="links-blue">.</span></h1>
        <p className="links-bio">Tecnologia, jogos e um pouco de tudo.<br />Por aqui, a gente se conecta além do código.</p>
        <div className="links-interests" aria-label="Meus interesses">
          <span>Tecnologia</span><span>Games</span><span>Vida real</span>
        </div>
        <nav className="links-nav" aria-label="Minhas redes sociais">
          {networks.map(network => {
            const card = <a className={`links-social links-social-${network.icon}`} href={network.href} key={network.icon} target="_blank" rel="noopener noreferrer">
              <span className="links-social-icon" aria-hidden="true">
                {network.icon === 'instagram' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                ) : network.icon === 'spotify' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9.5" /><path d="M6.5 9c3.8-1.1 7.4-.8 11 1M7 12.5c3.3-.9 6.5-.5 9.5.9M7.7 15.8c2.7-.6 5.3-.3 7.8.9" /></svg>
                ) : network.icon === 'strava' ? (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="m10 2 6.2 11h-4L10 9l-2.2 4h-4L10 2Zm6.2 20-4.4-8h3l1.4 2.6 1.4-2.6h3l-4.4 8Z" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.3 8.5H2V22h3.3V8.5ZM3.65 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM22 14.3c0-4.1-2.2-6-5.1-6-2.4 0-3.5 1.3-4.1 2.2v-2H9.5V22h3.3v-7.5c0-2 1-3.3 2.9-3.3s3 1.3 3 3.3V22H22v-7.7Z" /></svg>
                )}
              </span>
              <span className="links-social-copy"><strong>{network.name}</strong><span className="links-handle">{network.handle}</span><small>{network.description}</small></span>
            </a>
            return network.icon === 'spotify' ? <SpotifyPlayer key={network.icon} fallback={card} /> : card
          })}
        </nav>
        <p className="links-note">Do outro lado da tela, sou eu mesmo.</p>
      </main>
      <footer className="links-footer">FEITO POR ERIC Y. IKEDA<span>CONEXÕES DE VERDADE.</span></footer>
    </div>
  )
}
