import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto'

type Field = 'name' | 'email' | 'message'

function encryptionKey() {
  const value = process.env.CONTACT_ENCRYPTION_KEY ?? ''
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error('CONTACT_ENCRYPTION_KEY deve conter 32 bytes aleatórios em hexadecimal, somente no servidor.')
  return Buffer.from(value, 'hex')
}

function keyId(key: Buffer) {
  return createHash('sha256').update(key).digest('hex').slice(0, 16)
}

export function encryptContactField(value: string, field: Field, recordId: string) {
  const key = encryptionKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv, { authTagLength: 16 })
  cipher.setAAD(Buffer.from(`portfolio-contact:v1:${recordId}:${field}`))
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return ['v1', keyId(key), iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join('.')
}

export function decryptContactField(value: string, field: Field, recordId: string) {
  const key = encryptionKey()
  const [version, storedKeyId, iv, tag, content, extra] = value.split('.')
  if (version !== 'v1' || storedKeyId !== keyId(key) || extra !== undefined ||
      !iv || !tag || !content || ![iv, tag, content].every(part => /^[A-Za-z0-9_-]+$/.test(part))) throw new Error('Contato criptografado inválido ou chave indisponível.')
  const nonce = Buffer.from(iv, 'base64url'), authTag = Buffer.from(tag, 'base64url')
  if (nonce.length !== 12 || authTag.length !== 16) throw new Error('Contato criptografado inválido.')
  const decipher = createDecipheriv('aes-256-gcm', key, nonce, { authTagLength: 16 })
  decipher.setAAD(Buffer.from(`portfolio-contact:v1:${recordId}:${field}`))
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(Buffer.from(content, 'base64url')), decipher.final()]).toString('utf8')
}

export function encryptContactIdentity(name: string, email: string, recordId: string = randomUUID()) {
  return { recordId, name: encryptContactField(name, 'name', recordId), email: encryptContactField(email, 'email', recordId) }
}

export function decryptContactIdentity(row: Record<string, unknown>) {
  const { name_encrypted, email_encrypted, encryption_id } = row
  if (name_encrypted === null && email_encrypted === null && encryption_id === null) {
    // Compatibilidade temporária durante a migração controlada dos registros antigos.
    return { name: String(row.name), email: String(row.email) }
  }
  if (typeof name_encrypted !== 'string' || typeof email_encrypted !== 'string' || typeof encryption_id !== 'string') throw new Error('Contato criptografado incompleto.')
  return { name: decryptContactField(name_encrypted, 'name', encryption_id), email: decryptContactField(email_encrypted, 'email', encryption_id) }
}

export function encryptContactData(name: string, email: string, message: string, recordId: string = randomUUID()) {
  return { ...encryptContactIdentity(name, email, recordId), message: encryptContactField(message, 'message', recordId) }
}

export function decryptContactData(row: Record<string, unknown>) {
  const identity = decryptContactIdentity(row)
  if (row.message_encrypted === null) return { ...identity, message: String(row.message) }
  if (typeof row.message_encrypted !== 'string' || typeof row.encryption_id !== 'string') throw new Error('Mensagem criptografada incompleta.')
  return { ...identity, message: decryptContactField(row.message_encrypted, 'message', row.encryption_id) }
}
