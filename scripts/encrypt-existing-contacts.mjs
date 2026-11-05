// Uses the same server encryption code as the contact handler. Prints counts only.
// Run after deploying the new backend, using its persistent CONTACT_ENCRYPTION_KEY.
import { createServer } from 'vite'

if (!process.argv.includes('--apply') || !process.env.DATABASE_URL || !process.env.CONTACT_ENCRYPTION_KEY) {
  throw new Error('Informe DATABASE_URL, CONTACT_ENCRYPTION_KEY e --apply para migrar os contatos existentes.')
}

const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
try {
  const { ensureContactSchema } = await server.ssrLoadModule('/api/_lib/contact.ts')
  const { encryptContact, decryptContact } = await server.ssrLoadModule('/api/_lib/contact-crypto.ts')
  const { getSql } = await server.ssrLoadModule('/api/_lib/db.ts')
  // Validate the key before any schema or data changes.
  decryptContact(encryptContact({ name: 'key-check', email: 'key@example.invalid', message: 'key-check' }))
  await ensureContactSchema()
  const sql = getSql()
  const existing = await sql`SELECT private_payload FROM contact_messages WHERE private_payload IS NOT NULL LIMIT 1`
  if (existing.length) decryptContact(String(existing[0].private_payload))
  let migrated = 0
  for (;;) {
    const rows = await sql`SELECT id, name, email, message FROM contact_messages WHERE private_payload IS NULL ORDER BY id LIMIT 100`
    if (!rows.length) break
    const queries = rows.map(row => {
      const encrypted = encryptContact({ name: String(row.name), email: String(row.email), message: String(row.message) })
      return sql`UPDATE contact_messages SET name = '[protegido]', email = '[protegido]', message = '[conteúdo protegido]', private_payload = ${encrypted}
        WHERE id = ${row.id} AND private_payload IS NULL AND name = ${row.name} AND email = ${row.email} AND message = ${row.message} RETURNING id`
    })
    const result = await sql.transaction(queries)
    migrated += result.reduce((total, rows) => total + rows.length, 0)
  }
  const result = await sql`SELECT count(*)::integer AS total, count(*) FILTER (WHERE private_payload IS NULL)::integer AS pending FROM contact_messages`
  let lastId = 0
  let verified = 0
  for (;;) {
    const batch = await sql`SELECT id, private_payload FROM contact_messages WHERE id > ${lastId} AND private_payload IS NOT NULL ORDER BY id LIMIT 100`
    if (!batch.length) break
    for (const row of batch) { decryptContact(String(row.private_payload)); verified++ }
    lastId = Number(batch.at(-1).id)
  }
  console.log(JSON.stringify({ migrated, verified, ...result[0] }))
} catch {
  console.error('Migração interrompida. Confira conexão, esquema e chave no ambiente protegido antes de tentar novamente.')
  process.exitCode = 1
} finally {
  await server.close()
}
