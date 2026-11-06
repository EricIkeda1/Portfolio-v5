import { useEffect, useState, type ReactNode } from 'react'

type Track = {
  title: string; artist: string; album: string; image: string | null; url: string
  isPlaying: boolean; durationMs: number; progressMs: number | null; updatedAt: number
}

function time(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export default function SpotifyPlayer({ fallback, compact = false }: { fallback: ReactNode; compact?: boolean }) {
  const [track, setTrack] = useState<Track | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let controller: AbortController | undefined
    let lastRequested = 0

    async function refresh() {
      clearTimeout(timer)
      if (document.hidden || cancelled) return
      // Visibility changes should not turn into a burst of API calls.
      const wait = 60_000 - (Date.now() - lastRequested)
      if (wait > 0) { timer = setTimeout(refresh, wait); return }
      lastRequested = Date.now()
      controller = new AbortController()
      const timeout = setTimeout(() => controller?.abort(), 22_000)
      try {
        const response = await fetch('/api/content?view=spotify', { signal: controller.signal })
        if (!response.ok) throw new Error('Spotify unavailable')
        const data = await response.json()
        const next = data.state === 'ready' ? data.track as Track : null
        if (next && (!/^https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]{22}$/.test(next.url) || typeof next.title !== 'string' || typeof next.artist !== 'string')) throw new Error('Invalid track')
        if (!cancelled) { setTrack(next); setImageError(false) }
      } catch {
        // Keep the profile link available; do not present stale data as live playback.
        if (!cancelled) setTrack(null)
      } finally {
        clearTimeout(timeout)
        if (!cancelled && !document.hidden) timer = setTimeout(refresh, 60_000)
      }
    }

    function onVisibility() {
      if (document.hidden) { clearTimeout(timer); controller?.abort() }
      else void refresh()
    }
    void refresh()
    document.addEventListener('visibilitychange', onVisibility)
    return () => { cancelled = true; clearTimeout(timer); controller?.abort(); document.removeEventListener('visibilitychange', onVisibility) }
  }, [])

  if (!track) return fallback
  if (compact) return (
    <a className="links-player-compact" href={track.url} target="_blank" rel="noopener noreferrer" aria-label={`${track.isPlaying ? 'Ouvindo agora' : 'Última música ouvida'}: ${track.title}, ${track.artist}. Abrir no Spotify`}>
      {track.image && !imageError ? <img src={track.image} alt="" width="36" height="36" onError={() => setImageError(true)} /> : <span aria-hidden="true">♫</span>}
      <span><small>{track.isPlaying ? 'Ouvindo agora' : 'Última música ouvida'}</small><strong>{track.title}</strong><span>{track.artist}</span></span>
    </a>
  )
  return (
    <article className="links-player" aria-label="Minha música no Spotify">
      <div className="links-player-top">
        <span className="links-player-status"><span className={`links-equalizer ${track.isPlaying ? 'is-playing' : ''}`} aria-hidden="true"><i /><i /><i /></span>{track.isPlaying ? 'Ouvindo agora' : 'Última música ouvida'}</span>
        <a href="https://open.spotify.com/user/zxcc5n3o1k5z5jd478dlcc8e8" target="_blank" rel="noopener noreferrer" className="links-player-brand">Spotify</a>
      </div>
      <div className="links-player-track">
        {track.image && !imageError ? <img src={track.image} alt={`Capa de ${track.album}`} width="72" height="72" decoding="async" onError={() => setImageError(true)} /> : <span className="links-player-art" aria-hidden="true">♫</span>}
        <div><a className="links-player-title" href={track.url} target="_blank" rel="noopener noreferrer">{track.title}</a><p className="links-player-artist">{track.artist}</p></div>
      </div>
      {track.isPlaying && track.progressMs !== null && track.durationMs > 0 ? <div className="links-player-progress"><progress value={track.progressMs} max={track.durationMs} aria-label="Posição da música na última atualização" /><div><span>{time(track.progressMs)}</span><span>{time(track.durationMs)}</span></div></div> : null}
      <a className="links-player-open" href={track.url} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▶</span> Ouvir no Spotify</a>
    </article>
  )
}
