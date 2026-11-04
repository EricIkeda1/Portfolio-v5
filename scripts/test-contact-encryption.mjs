import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
const previousKey = process.env.CONTACT_ENCRYPTION_KEY
try {
  const { encryptContactIdentity, decryptContactIdentity, decryptContactField } = await server.ssrLoadModule('/api/_lib/contact-encryption.ts')
  process.env.CONTACT_ENCRYPTION_KEY = randomBytes(32).toString('hex')
  const key = process.env.CONTACT_ENCRYPTION_KEY
  const name = 'João 日本語', email = 'contato@example.test'
  const first = encryptContactIdentity(name, email), second = encryptContactIdentity(name, email)
  assert.notEqual(first.name, second.name)
  assert.notEqual(first.email, second.email)
  assert.ok(!first.name.includes(name) && !first.email.includes(email))
  const row = { name: '[criptografado]', email: '[criptografado]', name_encrypted: first.name, email_encrypted: first.email, encryption_id: first.recordId }
  assert.deepEqual(decryptContactIdentity(row), { name, email })
  assert.throws(() => decryptContactField(first.name, 'email', first.recordId))
  assert.throws(() => decryptContactField(first.name, 'name', second.recordId))
  const parts = first.name.split('.')
  const ciphertext = Buffer.from(parts[4], 'base64url'); ciphertext[0] ^= 1; parts[4] = ciphertext.toString('base64url')
  assert.throws(() => decryptContactField(parts.join('.'), 'name', first.recordId))
  assert.throws(() => decryptContactField('v1.malformed', 'name', first.recordId))
  assert.throws(() => decryptContactIdentity({ ...row, email_encrypted: null }))
  process.env.CONTACT_ENCRYPTION_KEY = randomBytes(32).toString('hex')
  assert.throws(() => decryptContactIdentity(row))
  delete process.env.CONTACT_ENCRYPTION_KEY
  assert.throws(() => encryptContactIdentity(name, email))
  process.env.CONTACT_ENCRYPTION_KEY = 'incorrect'
  assert.throws(() => encryptContactIdentity(name, email))
  process.env.CONTACT_ENCRYPTION_KEY = key
  assert.deepEqual(decryptContactIdentity(row), { name, email })
  console.log('Criptografia: Unicode, IVs aleatórios, autenticação, contexto por registro/campo, dados adulterados e chave ausente/incorreta verificados.')
} catch (error) { console.error(error); process.exitCode = 1 }
finally {
  if (previousKey === undefined) delete process.env.CONTACT_ENCRYPTION_KEY
  else process.env.CONTACT_ENCRYPTION_KEY = previousKey
  const timeout = setTimeout(() => process.exit(process.exitCode ?? 0), 2000); timeout.unref()
  await server.close(); clearTimeout(timeout)
}
