import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
try {
  const { parseContactSubmission } = await server.ssrLoadModule('/api/_lib/contact-input.ts')
  const { encryptContact, decryptContact } = await server.ssrLoadModule('/api/_lib/contact-crypto.ts')
  const { parsePersonalRun } = await server.ssrLoadModule('/api/_lib/personal-run.ts')
  const note = { kind: 'anonymous', message: '  Um recadinho de teste, privado.  ', website: '' }
  const clean = parseContactSubmission(note)
  assert.deepEqual(clean, { name: 'Recado anônimo', email: '', message: note.message.trim() })
  for (const bad of [{ ...note, message: 'curta' }, { ...note, message: 'x'.repeat(1001) }, { ...note, website: 'bot.test' }, { ...note, kind: 'other' }, null, []]) assert.equal(parseContactSubmission(bad), null)
  assert.equal(parseContactSubmission({ ...note, name: 'injected', email: 'injected@test.com' }).email, '')
  assert.ok(parseContactSubmission({ name: 'Visitante', email: 'VISITOR@example.test', message: 'Contato tradicional válido.', website: '' }))
  assert.equal(parseContactSubmission({ name: 'Visitante', email: '', message: 'Contato tradicional inválido.' }), null)
  process.env.CONTACT_ENCRYPTION_KEY = randomBytes(32).toString('hex')
  const encrypted = encryptContact(clean)
  assert.ok(!encrypted.includes(clean.message)); assert.deepEqual(decryptContact(encrypted), clean)
  assert.notEqual(encryptContact(clean), encrypted, 'fresh nonce for each note')
  const bytes = Buffer.from(encrypted.slice(7), 'base64url'); bytes[bytes.length - 1] ^= 1
  assert.throws(() => decryptContact('enc:v1:' + bytes.toString('base64url')))
  delete process.env.CONTACT_ENCRYPTION_KEY
  assert.throws(() => encryptContact(clean), 'must fail closed without key')
  const run = { distanceKm: 5.12, durationSeconds: 1832, date: '2026-01-03', url: 'https://www.strava.com/activities/123456789' }
  assert.deepEqual(parsePersonalRun(run), run)
  for (const patch of [{ distanceKm: NaN }, { distanceKm: -1 }, { distanceKm: 999 }, { durationSeconds: 1.5 }, { durationSeconds: 0 }, { date: '2026-02-30' }, { date: '2999-01-01' }, { url: 'javascript:alert(1)' }, { url: 'https://www.strava.com.evil.test/activities/123' }, { url: 'https://www.strava.com@evil.test/activities/123' }, { url: 'https://www.strava.com/activities/123?secret=foo' }]) assert.equal(parsePersonalRun({ ...run, ...patch }), null)
  console.log('Links pessoais: validação, anonimato, AES-GCM, nonce, adulteração, falha sem chave e URLs de corrida verificados.')
} finally { await server.close() }
