// This module is server-only. Only the selected track metadata is returned publicly.
type Credentials = { clientId: string; clientSecret: string; refreshToken: string }
type Track = {
  title: string; artist: string; album: string; image: string | null; url: string
  isPlaying: boolean; durationMs: number; progressMs: number | null; updatedAt: number
}
export type SpotifyResult = { state: 'not_configured' | 'unavailable' | 'empty' | 'ready'; track: Track | null }

const unavailable: SpotifyResult = { state: 'unavailable', track: null }
const finiteNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0

function normalizeTrack(item: any, isPlaying: boolean, progress: unknown): Track | null {
  // Ads, episodes and local files do not necessarily have a public music URL.
  if (!item || item.type !== 'track' || item.is_local || typeof item.id !== 'string' || !/^[a-zA-Z0-9]{22}$/.test(item.id)) return null
  if (typeof item.name !== 'string' || !Array.isArray(item.artists)) return null
  const images = Array.isArray(item.album?.images) ? item.album.images : []
  const artwork = images.find((image: any) => image.width >= 200 && image.width <= 400) || images[0]
  const image = typeof artwork?.url === 'string' && /^https:\/\/i\.scdn\.co\//.test(artwork.url) ? artwork.url : null
  const durationMs = finiteNumber(item.duration_ms)
  return {
    title: item.name.slice(0, 300), artist: item.artists.map((artist: any) => typeof artist.name === 'string' ? artist.name : '').filter(Boolean).join(', ').slice(0, 500),
    album: typeof item.album?.name === 'string' ? item.album.name.slice(0, 300) : '', image,
    url: `https://open.spotify.com/track/${item.id}`, isPlaying, durationMs,
    progressMs: isPlaying ? Math.min(finiteNumber(progress), durationMs) : null, updatedAt: Date.now(),
  }
}

export function createSpotifyService(credentials: () => Credentials, request: typeof fetch = fetch) {
  // Best-effort warm-instance caching; correctness never depends on process persistence.
  let token = ''; let tokenExpires = 0
  let cached: SpotifyResult | null = null; let cacheExpires = 0
  let pending: Promise<SpotifyResult> | null = null

  async function accessToken() {
    if (token && Date.now() < tokenExpires) return token
    const { clientId, clientSecret, refreshToken } = credentials()
    const response = await request('https://accounts.spotify.com/api/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}` },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
      signal: AbortSignal.timeout(6000),
    })
    if (!response.ok) throw new Error('Spotify authorization unavailable')
    const data = await response.json()
    if (typeof data.access_token !== 'string') throw new Error('Invalid Spotify authorization')
    token = data.access_token
    tokenExpires = Date.now() + Math.max(0, finiteNumber(data.expires_in) - 60) * 1000
    return token
  }

  async function spotifyGet(path: string) {
    const response = await request(`https://api.spotify.com/v1/me/player/${path}`, {
      headers: { Authorization: `Bearer ${await accessToken()}` }, signal: AbortSignal.timeout(6000),
    })
    if (response.status === 429) {
      const delay = Number(response.headers.get('retry-after'))
      cacheExpires = Date.now() + Math.min(3600, Math.max(60, Number.isFinite(delay) ? delay : 60)) * 1000
    }
    if (!response.ok) throw new Error('Spotify temporarily unavailable')
    return response.status === 204 ? null : response.json()
  }

  async function load(): Promise<SpotifyResult> {
    try {
      const current = await spotifyGet('currently-playing')
      if (current?.is_playing) {
        const track = normalizeTrack(current.item, true, current.progress_ms)
        if (track) return { state: 'ready', track }
      }
      const recent = await spotifyGet('recently-played?limit=1')
      const track = normalizeTrack(recent?.items?.[0]?.track, false, null)
      return { state: track ? 'ready' : 'empty', track }
    } catch {
      // Never log upstream bodies, Authorization headers, refresh tokens or private history.
      token = ''; tokenExpires = 0
      return unavailable
    }
  }

  return async function read(): Promise<SpotifyResult> {
    const { clientId, clientSecret, refreshToken } = credentials()
    if (!clientId || !clientSecret || !refreshToken) return { state: 'not_configured', track: null }
    if (cached && Date.now() < cacheExpires) return cached
    if (pending) return pending
    cacheExpires = Date.now() + 30_000
    pending = load().then(result => { cached = result; return result }).finally(() => { pending = null })
    return pending
  }
}

export const readSpotify = createSpotifyService(() => ({
  clientId: process.env.SPOTIFY_CLIENT_ID || '', clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '', refreshToken: process.env.SPOTIFY_REFRESH_TOKEN || '',
}))
