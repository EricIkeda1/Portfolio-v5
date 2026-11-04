// A chave deve ser fornecida pelo ambiente seguro, nunca por argumento de linha de comando.
import { createServer } from 'vite'
if (process.env.CONTACT_ENCRYPTION_MIGRATION !== '1') throw new Error('Defina CONTACT_ENCRYPTION_MIGRATION=1 para executar a migração intencionalmente.')
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { migrateContactIdentities } = await server.ssrLoadModule('/api/_lib/contact-migration.ts')
  const total = await migrateContactIdentities()
  console.log(`Migração concluída: ${total} contato(s). Nenhum nome, e-mail ou chave foi registrado.`)
} catch {
  console.error('A migração não foi concluída. Verifique a chave original e a conexão; os dados já criptografados foram preservados.')
  process.exitCode = 1
} finally {
  const timeout = setTimeout(() => process.exit(process.exitCode ?? 0), 2000); timeout.unref()
  await server.close(); clearTimeout(timeout)
}
