import { useEffect, useState } from 'react'
import type { VisitorVibe } from './components/links/VibeWidget'
import PersonalExtras from './components/links/PersonalExtras'
import ShareLinks from './components/links/ShareLinks'
import VirtualPet from './components/links/VirtualPet'
import SpotifyPlayer from './components/SpotifyPlayer'
import './links.css'

const networks = [
  {
    name: 'Instagram',
    handle: '@yujiikeda_',
    href: 'https://www.instagram.com/yujiikeda_/',
    icon: 'instagram',
  },
  {
    name: 'LinkedIn',
    handle: 'Eric Yuji Ikeda',
    href: 'https://www.linkedin.com/in/ericikeda1/',
    icon: 'linkedin',
  },
  {
    name: 'Spotify',
    handle: 'Meu perfil',
    href: 'https://open.spotify.com/user/zxcc5n3o1k5z5jd478dlcc8e8',
    icon: 'spotify',
  },
  {
    name: 'Strava',
    handle: 'Eric Yuji Ikeda',
    href: 'https://strava.app.link/abHHLSIVP7b',
    icon: 'strava',
  },
]

export default function LinksPage() {
  const [reaction, setReaction] = useState<{ vibe: VisitorVibe; id: number } | null>(null)
  const [photoError, setPhotoError] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    let hasTracking = false
    for (const key of [...url.searchParams.keys()]) {
      if (/^utm_/i.test(key) || key.toLowerCase() === 'fbclid') {
        url.searchParams.delete(key)
        hasTracking = true
      }
    }
    if (hasTracking) window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)

    const previousTitle = document.title
    const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    const previousIcon = icon?.getAttribute('href')
    document.title = 'Eric Yuji Ikeda · Me encontre por aqui'
    icon?.setAttribute('href', '/social-icon.svg')
    return () => {
      document.title = previousTitle
      if (previousIcon) icon?.setAttribute('href', previousIcon)
    }
  }, [])

  return (
    <div className="links-page">
      <main className="links-main">
        <header className="links-profile">
        <div className="links-avatar">
          {photoError ? <span className="links-avatar-fallback" aria-hidden="true"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="8" r="4" /><path d="M4 22v-2a8 8 0 0 1 16 0v2" /></svg></span> : (
            <img src="/api/profile-image?size=avatar" alt="Foto de Eric Yuji Ikeda" width="104" height="104" loading="eager" fetchPriority="high" decoding="async" onError={() => setPhotoError(true)} />
          )}
        </div>
        <h1>Eric Yuji Ikeda</h1>
        <p className="links-bio">Tecnologia, jogos e vida real.</p>
        </header>
        <ShareLinks />
        <nav className="links-nav" aria-label="Minhas redes sociais">
          {networks.map(network => (
            <a className={`links-social links-social-${network.icon}`} href={network.href} key={network.icon} target="_blank" rel="noopener noreferrer" aria-label={`${network.name} — ${network.handle}`}>
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
              <span className="links-social-name">{network.name}</span>
            </a>
          ))}
        </nav>
        <SpotifyPlayer compact fallback={null} />
        <PersonalExtras vibe={reaction?.vibe} onVibe={vibe => setReaction(current => ({ vibe, id: (current?.id || 0) + 1 }))} />
        <VirtualPet reaction={reaction} />
      </main>
    </div>
  )
}
