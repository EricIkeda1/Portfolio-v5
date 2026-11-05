// Local orchestration helper: secrets are read from protected files, never printed.
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const env = { ...process.env, ...JSON.parse(readFileSync(process.argv[2], 'utf8')), ...JSON.parse(readFileSync(process.argv[3], 'utf8')), CONTACT_TEST_DATABASE: '1' }
for (const script of process.argv.slice(4)) {
  const args = script === 'scripts/encrypt-existing-contacts.mjs' ? [script, '--apply'] : [script]
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit', timeout: 600000 })
  if (result.status !== 0) {
    console.error(`Falha em ${script}: ${result.signal ?? result.error?.code ?? result.status}`)
    process.exit(result.status ?? 1)
  }
}
