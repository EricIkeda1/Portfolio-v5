import { randomBytes, scryptSync } from 'node:crypto'

const password = process.env.ADMIN_NEW_PASSWORD

if (!password) {
  console.error('Defina ADMIN_NEW_PASSWORD apenas no terminal antes de executar este comando.')
  console.error('PowerShell: $env:ADMIN_NEW_PASSWORD="sua-senha-forte"; npm run admin:hash')
  process.exit(1)
}

if (password.length < 12 || password.length > 128) {
  console.error('A senha deve ter entre 12 e 128 caracteres.')
  process.exit(1)
}

const salt = randomBytes(16).toString('hex')
const hash = scryptSync(password, salt, 64).toString('hex')
console.log(`scrypt$${salt}$${hash}`)
