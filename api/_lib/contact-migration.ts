import { decryptContactData, decryptContactField, encryptContactData } from './contact-encryption.js'
import { ensureContactSchema } from './contact.js'
import { getSql } from './db.js'

export async function migrateContactIdentities() {
  // Valida a chave antes de alterar qualquer registro.
  const probe = encryptContactData('Validação', 'probe@example.test', 'Mensagem de validação')
  decryptContactField(probe.name, 'name', probe.recordId)
  await ensureContactSchema()
  const sql = getSql()
  // Não substitui uma chave existente inadvertidamente.
  const prefix = `${probe.name.split('.').slice(0, 2).join('.')}.%`
  const mismatches = await sql`SELECT count(*)::integer AS total FROM contact_messages
    WHERE (name_encrypted IS NOT NULL AND name_encrypted NOT LIKE ${prefix})
       OR (email_encrypted IS NOT NULL AND email_encrypted NOT LIKE ${prefix})
       OR (message_encrypted IS NOT NULL AND message_encrypted NOT LIKE ${prefix})`
  if (Number(mismatches[0].total)) throw new Error('A chave não corresponde aos registros existentes.')
  const previous = await sql`SELECT name_encrypted, encryption_id FROM contact_messages WHERE name_encrypted IS NOT NULL LIMIT 1`
  if (previous.length) decryptContactField(String(previous[0].name_encrypted), 'name', String(previous[0].encryption_id))
  let migrated = 0
  for (;;) {
    const rows = await sql`SELECT id, name, email, message, name_encrypted, email_encrypted, message_encrypted, encryption_id FROM contact_messages
      WHERE message_encrypted IS NULL ORDER BY id LIMIT 100`
    if (!rows.length) break
    const updates = rows.map(row => {
      const plain = decryptContactData(row)
      const identity = encryptContactData(plain.name, plain.email, plain.message, row.encryption_id ? String(row.encryption_id) : undefined)
      if (decryptContactField(identity.name, 'name', identity.recordId) !== plain.name ||
          decryptContactField(identity.email, 'email', identity.recordId) !== plain.email ||
          decryptContactField(identity.message, 'message', identity.recordId) !== plain.message) throw new Error('Falha na verificação da migração.')
      return sql`UPDATE contact_messages SET name = '[criptografado]', email = '[criptografado]', message = '[criptografado]',
        name_encrypted = ${identity.name}, email_encrypted = ${identity.email}, message_encrypted = ${identity.message}, encryption_id = ${identity.recordId}::uuid
        WHERE id = ${row.id} AND name = ${row.name} AND email = ${row.email} AND message = ${row.message}
          AND name_encrypted IS NOT DISTINCT FROM ${row.name_encrypted}
          AND email_encrypted IS NOT DISTINCT FROM ${row.email_encrypted}
          AND message_encrypted IS NULL RETURNING id`
    })
    const results = await sql.transaction(updates)
    const updated = results.reduce((total, result) => total + result.length, 0)
    if (!updated) throw new Error('Registros foram alterados durante a migração. Execute novamente.')
    migrated += updated
  }
  const remaining = await sql`SELECT count(*)::integer AS total FROM contact_messages
    WHERE name_encrypted IS NULL OR email_encrypted IS NULL OR message_encrypted IS NULL OR encryption_id IS NULL
      OR name <> '[criptografado]' OR email <> '[criptografado]' OR message <> '[criptografado]'`
  if (Number(remaining[0].total)) throw new Error('Ainda existem registros pendentes. Nenhum dado pessoal é registrado nos logs.')
  // Após a migração, o próprio banco impede novas identidades em texto puro,
  // inclusive se uma versão antiga da aplicação for implantada por engano.
  await sql`DO $$ BEGIN
    ALTER TABLE contact_messages ADD CONSTRAINT contact_identity_protected CHECK (
      name = '[criptografado]' AND email = '[criptografado]'
      AND name_encrypted IS NOT NULL AND email_encrypted IS NOT NULL AND encryption_id IS NOT NULL
      AND name_encrypted LIKE 'v1.%' AND email_encrypted LIKE 'v1.%'
    );
    EXCEPTION WHEN duplicate_object THEN NULL;
  END $$`
  await sql`DO $$ BEGIN
    ALTER TABLE contact_messages ADD CONSTRAINT contact_payload_protected CHECK (
      message = '[criptografado]' AND message_encrypted IS NOT NULL AND message_encrypted LIKE 'v1.%'
    );
    EXCEPTION WHEN duplicate_object THEN NULL;
  END $$`
  return migrated
}
