import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const KEY_LENGTH = 64
const PREFIX = 'scrypt'

export async function hashPassword(password: string) {
  if (password.length < 8) {
    throw new Error('A senha precisa ter pelo menos 8 caracteres.')
  }

  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  return `${PREFIX}$${salt}$${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, storedHash: string) {
  const [prefix, salt, hashHex] = storedHash.split('$')
  if (prefix !== PREFIX || !salt || !hashHex) return false

  try {
    const storedKey = Buffer.from(hashHex, 'hex')
    const derivedKey = (await scrypt(password, salt, storedKey.length)) as Buffer
    return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey)
  } catch {
    return false
  }
}
