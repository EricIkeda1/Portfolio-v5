import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

export type ContactFields = { name: string; email: string; message: string }
const PREFIX = 'enc:v1:'
const AAD = Buffer.from('portfolio-contact:v1')

function encryptionKey() {
  const value = process.env.CONTACT_ENCRYPTION_KEY
  if (!value || !/^[a-f0-9]{64}$/i.test(value)) {
    throw new Error('CONTACT_ENCRYPTION_KEY precisa conter 32 bytes aleatórios em hexadecimal.')
  }
  return Buffer.from(value, 'hex')
}

export function encryptContact(fields: ContactFields) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  cipher.setAAD(AAD)
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(fields), 'utf8'), cipher.final()])
  return PREFIX + Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64url')
}

export function decryptContact(value: string): ContactFields {
  if (!value.startsWith(PREFIX) || !/^[A-Za-z0-9_-]+$/.test(value.slice(PREFIX.length))) {
    throw new Error('Formato de contato criptografado inválido.')
  }
  const bytes = Buffer.from(value.slice(PREFIX.length), 'base64url')
  if (bytes.length < 29) throw new Error('Contato criptografado incompleto.')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), bytes.subarray(0, 12))
  decipher.setAAD(AAD)
  decipher.setAuthTag(bytes.subarray(12, 28))
  const plaintext = Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8')
  const fields = JSON.parse(plaintext)
  if (!fields || typeof fields.name !== 'string' || typeof fields.email !== 'string' || typeof fields.message !== 'string') {
    throw new Error('Conteúdo do contato inválido.')
  }
  return { name: fields.name, email: fields.email, message: fields.message }
}

export function readContact(row: Record<string, unknown>) {
  const { private_payload, ...publicColumns } = row
  // Legacy rows remain readable until the explicit, idempotent backfill is run.
  return private_payload ? { ...publicColumns, ...decryptContact(String(private_payload)) } : publicColumns
}
