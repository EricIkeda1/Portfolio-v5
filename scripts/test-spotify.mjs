import test from 'node:test'
import assert from 'node:assert/strict'
import { createSpotifyService } from '../api/_lib/spotify.ts'

const credentials = () => ({ clientId: 'test-client', clientSecret: 'private-secret', refreshToken: 'private-refresh' })
const track = { id: 'abcdefghijklmnopqrstuv', type: 'track', name: 'Test track', artists: [{ name: 'Test artist' }], duration_ms: 180000, album: { name: 'Test album', images: [{ url: 'https://i.scdn.co/image/art', width: 300 }] } }
const json = (data, options) => Response.json(data, options)
function mock(responses) {
  const calls = []
  const request = async (url, options) => {
    calls.push({ url, options })
    const response = responses.shift()
    if (!response) throw new Error('Unexpected request')
    return response
  }
  return { calls, read: createSpotifyService(credentials, request) }
}
const auth = () => json({ access_token: 'private-access', expires_in: 3600 })

test('no requests without credentials', async () => {
  const read = createSpotifyService(() => ({ clientId: '', clientSecret: '', refreshToken: '' }), () => { throw new Error('Must not fetch') })
  assert.deepEqual(await read(), { state: 'not_configured', track: null })
})
test('currently playing is sanitized, cached and secrets stay server-side', async () => {
  const { calls, read } = mock([auth(), json({ is_playing: true, progress_ms: 32000, item: track })])
  const [first, second] = await Promise.all([read(), read()])
  assert.deepEqual(first, second)
  assert.equal(first.state, 'ready'); assert.equal(first.track.isPlaying, true)
  assert.equal(first.track.progressMs, 32000); assert.equal(first.track.artist, 'Test artist')
  assert.equal(first.track.url, 'https://open.spotify.com/track/abcdefghijklmnopqrstuv')
  assert.equal(calls.length, 2)
  await read(); assert.equal(calls.length, 2)
  assert.equal(calls[0].options.headers.Authorization, `Basic ${Buffer.from('test-client:private-secret').toString('base64')}`)
  assert.equal(calls[0].options.body.get('refresh_token'), 'private-refresh')
  assert.ok(!JSON.stringify(first).includes('private-'))
})
test('204 falls back to the most recent track', async () => {
  const { calls, read } = mock([auth(), new Response(null, { status: 204 }), json({ items: [{ track }] })])
  const result = await read()
  assert.equal(result.track.isPlaying, false); assert.equal(result.track.progressMs, null)
  assert.ok(calls[2].url.endsWith('recently-played?limit=1'))
})
test('paused playback uses recent history rather than pretending it is live', async () => {
  const { read } = mock([auth(), json({ is_playing: false, item: track }), json({ items: [{ track: { ...track, name: 'Last listened' } }] })])
  const result = await read(); assert.equal(result.track.title, 'Last listened'); assert.equal(result.track.isPlaying, false)
})
test('no history produces an empty state', async () => {
  const { read } = mock([auth(), new Response(null, { status: 204 }), json({ items: [] })])
  assert.deepEqual(await read(), { state: 'empty', track: null })
})
test('ads and unsafe artwork are not exposed', async () => {
  const { read } = mock([auth(), json({ is_playing: true, item: { type: 'ad' } }), json({ items: [{ track: { ...track, album: { images: [{ url: 'https://example.com/track-user' }] } } }] })])
  const result = await read(); assert.equal(result.track.image, null); assert.equal(result.track.isPlaying, false)
})
test('expired authorization and rate limiting fail without exposing credentials', async () => {
  for (const status of [401, 403, 429, 500]) {
    const { calls, read } = mock([auth(), json({ error: 'private-refresh' }, { status, headers: { 'Retry-After': '120' } })])
    assert.deepEqual(await read(), { state: 'unavailable', track: null })
    assert.deepEqual(await read(), { state: 'unavailable', track: null })
    assert.equal(calls.length, 2)
  }
})
test('token exchange failure is sanitized', async () => {
  const { read } = mock([json({ error: 'private-secret' }, { status: 400 })])
  assert.deepEqual(await read(), { state: 'unavailable', track: null })
})
