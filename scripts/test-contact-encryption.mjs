import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
const previousKey = process.env.CONTACT_ENCRYPTION_KEY
try {
  const { encryptContactData, decryptContactData, decryptContactField } = await server.ssrLoadModule('/api/_lib/contact-encryption.ts')
  process.env.CONTACT_ENCRYPTION_KEY = randomBytes(32).toString('hex')
  const key = process.env.CONTACT_ENCRYPTION_KEY
  const name = 'João 日本語', email = 'contato@example.test', message = 'Mensagem privada com acentos 日本語'
  const first = encryptContactData(name, email, message), second = encryptContactData(name, email, message)
  assert.notEqual(first.name, second.name)
  assert.notEqual(first.email, second.email)
  assert.notEqual(first.message, second.message)
  assert.throws(() => decryptContactField(first.message, 'name', first.recordId))
  assert.throws(() => decryptContactField(first.name, 'message', first.recordId))
  assert.ok(!first.name.includes(name) && !first.email.includes(email))
  const row = { name: '[criptografado]', email: '[criptografado]', message: '[criptografado]', name_encrypted: first.name, email_encrypted: first.email, message_encrypted: first.message, encryption_id: first.recordId }
  assert.deepEqual(decryptContactData(row), { name, email, message })
  assert.deepEqual(decryptContactData({ name, email, message, name_encrypted: null, email_encrypted: null, message_encrypted: null, encryption_id: null }), { name, email, message })
  const intermediate = decryptContactData({ ...row, message, message_encrypted: null })
  assert.deepEqual(intermediate, { name, email, message })
  const migrated = encryptContactData(intermediate.name, intermediate.email, intermediate.message, first.recordId)
  assert.equal(decryptContactField(migrated.message, 'message', migrated.recordId), message)
  assert.throws(() => decryptContactData({ ...row, message_encrypted: first.name }))
  assert.throws(() => decryptContactField(first.name, 'email', first.recordId))
  assert.throws(() => decryptContactField(first.name, 'name', second.recordId))
  const parts = first.name.split('.')
  const ciphertext = Buffer.from(parts[4], 'base64url'); ciphertext[0] ^= 1; parts[4] = ciphertext.toString('base64url')
  assert.throws(() => decryptContactField(parts.join('.'), 'name', first.recordId))
  assert.throws(() => decryptContactField('v1.malformed', 'name', first.recordId))
  assert.throws(() => decryptContactData({ ...row, email_encrypted: null }))
  process.env.CONTACT_ENCRYPTION_KEY = randomBytes(32).toString('hex')
  assert.throws(() => decryptContactData(row))
  delete process.env.CONTACT_ENCRYPTION_KEY
  assert.throws(() => encryptContactData(name, email, message))
  process.env.CONTACT_ENCRYPTION_KEY = 'incorrect'
  assert.throws(() => encryptContactData(name, email, message))
  process.env.CONTACT_ENCRYPTION_KEY = key
  assert.deepEqual(decryptContactData(row), { name, email, message })
  console.log('Criptografia: Unicode, IVs aleatórios, autenticação, contexto por registro/campo, dados adulterados e chave ausente/incorreta verificados.')
} catch (error) { console.error(error); process.exitCode = 1 }
finally {
  if (previousKey === undefined) delete process.env.CONTACT_ENCRYPTION_KEY
  else process.env.CONTACT_ENCRYPTION_KEY = previousKey
  const timeout = setTimeout(() => process.exit(process.exitCode ?? 0), 2000); timeout.unref()
  await server.close(); clearTimeout(timeout)
}
