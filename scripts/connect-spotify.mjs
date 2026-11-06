// Run locally with Node >=22. Secrets are saved to an ignored file, never printed.
import { createServer } from 'node:http'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { writeFile, access } from 'node:fs/promises'

for (const file of ['.env.local', '.env']) {
  try { process.loadEnvFile(file) } catch (error) { if (error.code !== 'ENOENT') throw error }
}
const clientId = process.env.SPOTIFY_CLIENT_ID?.trim()
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim()
if (!clientId || !clientSecret) {
  console.error('Configure SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET em .env.local antes de conectar. Veja docs/spotify.md.')
  process.exit(1)
}
try {
  await access('.env.spotify.local')
  console.error('Já existe .env.spotify.local. Preserve as credenciais anteriores e remova esse arquivo antes de reconectar.')
  process.exit(1)
} catch (error) { if (error.code !== 'ENOENT') throw error }

const redirect = 'http://127.0.0.1:43821/callback'
const state = randomBytes(32).toString('hex')
let exchanging = false
const server = createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  const url = new URL(req.url || '/', redirect)
  if (req.method !== 'GET' || url.pathname !== '/callback') { res.writeHead(404); res.end('Não encontrado.'); return }
  const actual = Buffer.from(url.searchParams.get('state') || '')
  const expected = Buffer.from(state)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) { res.writeHead(400); res.end('Autorização inválida.'); return }
  if (exchanging) { res.writeHead(409); res.end('Autorização em andamento.'); return }
  if (url.searchParams.has('error') || !url.searchParams.get('code')) {
    res.writeHead(400); res.end('Conexão não autorizada. Nenhuma credencial foi salva.'); stop(); return
  }
  exchanging = true
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}` },
      body: new URLSearchParams({ grant_type: 'authorization_code', code: url.searchParams.get('code'), redirect_uri: redirect }),
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) throw new Error('Token exchange failed')
    const result = await response.json()
    const granted = new Set(String(result.scope || '').split(' '))
    if (typeof result.refresh_token !== 'string' || !granted.has('user-read-currently-playing') || !granted.has('user-read-recently-played')) throw new Error('Missing permissions')
    if (![clientId, clientSecret, result.refresh_token].every(value => /^[A-Za-z0-9_\-]+$/.test(value))) throw new Error('Invalid credential')
    await writeFile('.env.spotify.local', `SPOTIFY_CLIENT_ID=${clientId}\nSPOTIFY_CLIENT_SECRET=${clientSecret}\nSPOTIFY_REFRESH_TOKEN=${result.refresh_token}\n`, { mode: 0o600, flag: 'wx' })
    res.end('Spotify conectado. Pode fechar esta aba. Publique as variáveis de .env.spotify.local na Vercel para ativar o player.')
    console.log('Autorização concluída. Credenciais salvas em .env.spotify.local (ignorado pelo Git). Importe as três variáveis na Vercel e faça redeploy.')
  } catch {
    res.writeHead(502); res.end('Não foi possível conectar. Confira o aplicativo e suas permissões no Spotify.');
    console.error('Não foi possível conectar ao Spotify. Nenhum token foi exibido. Tente novamente.')
    process.exitCode = 1
  } finally { stop() }
})
const timeout = setTimeout(() => { console.error('Autorização expirada. Execute o comando novamente.'); stop(); process.exitCode = 1 }, 10 * 60_000)
function stop() { clearTimeout(timeout); server.close() }
server.on('error', () => { console.error('Não foi possível abrir a porta local 43821.'); clearTimeout(timeout); process.exitCode = 1 })
server.listen(43821, '127.0.0.1', () => {
  const authorize = new URL('https://accounts.spotify.com/authorize')
  authorize.search = new URLSearchParams({ client_id: clientId, response_type: 'code', redirect_uri: redirect, state, scope: 'user-read-currently-playing user-read-recently-played', show_dialog: 'true' }).toString()
  console.log('Abra este endereço neste mesmo computador e autorize sua conta:\n' + authorize.href)
})
