// Local tests only: no real records, notifications or external model calls.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
const previous = process.env.NODE_ENV
try {
  const { moderateMessage, normalizeModerationText } = await server.ssrLoadModule('/api/_lib/moderation/index.ts')
  const { createContactHandler } = await server.ssrLoadModule('/api/contact.ts')
  const { encryptContact, decryptContact } = await server.ssrLoadModule('/api/_lib/contact-crypto.ts')
  process.env.NODE_ENV = 'production'; process.env.CONTACT_ENCRYPTION_KEY = randomBytes(32).toString('hex')
  assert.equal(normalizeModerationText('AMEAÇA\u200b de AGRESSÃO'), 'ameaca de agressao')
  const threats = ['vou te matar', 'VOU TE MATAR!', 'vou t3 m4t4r', 'vou te m.a.t.a.r', 'vou te ma\u200btar', 'v o u t e m a t a r', 'vou tirar sua vida hoje', 'você vai pagar com sangue', 'vou te esfaquear', 'vou matar sua família', 'voce merece morrer', 'I will kill you', 'vou quebrar sua cara']
  for (const text of threats) assert.equal(moderateMessage(text).blocked, true, `missed fixture: ${text}`)
  for (const text of ['Seu trabalho é uma merda e você é um idiota', 'vai tomar no cu seu imbecil', 'Seu filho da puta']) {
    const result = moderateMessage(text); assert.equal(result.blocked, true); assert.equal(result.reason, 'toxic_language', 'learned model catches abuse without a direct-threat rule')
  }
  const benign = ['Você me mata de rir', 'vou matar a saudade', 'Preciso matar um processo travado no Windows', 'Não vou te matar', 'Seu site está ruim e lento, poderia melhorar.', 'Quero conversar sobre uma oportunidade de trabalho.', 'Gostei bastante do seu projeto, parabéns!']
  for (const text of benign) assert.equal(moderateMessage(text).blocked, false, `false positive fixture: ${text}`)
  let stored = [], pushCount = 0, schemaCount = 0, encrypted = []
  const deps = {
    moderateMessage,
    encryptContact: input => { const cipher = encryptContact(input); encrypted.push(cipher); return cipher },
    getSessionSecret: () => 'local-test-session-secret-with-32-characters',
    ensureContactSchema: async () => { schemaCount++ },
    getSql: () => async (strings, ...values) => { if (strings.join('').includes('INSERT INTO contact_messages')) { stored.push(values); return [{ id: 1 }] } return [] },
    notifyNewContact: async () => { pushCount++ },
  }
  const handler = createContactHandler(deps)
  async function call(body, fn = handler) {
    const res = { statusCode: 200, setHeader() {}, status(code) { this.statusCode=code; return this }, json(data) { this.body=data; return this } }
    await fn({ method: 'POST', body, headers: { origin: 'https://local.test', host: 'local.test', 'content-type': 'application/json', 'x-forwarded-for': 'test-fixture' } }, res)
    return res
  }
  for (const fields of [{ kind: 'anonymous' }, { kind: 'personal', anonymous: true, name: 'Ignorado' }, { kind: 'personal', anonymous: false, name: 'Visitante' }, { name: 'Visitante', email: 'visitante@example.invalid' }]) {
    const blocked = await call({ ...fields, message: 'Vou te matar quando te encontrar.', website: '' })
    assert.equal(blocked.statusCode, 422); assert.equal(blocked.body.code, 'CONTENT_BLOCKED')
  }
  assert.equal((await call({ kind: 'personal', anonymous: false, name: 'Vou te matar', message: 'Um recado normal e inofensivo.' })).statusCode, 422)
  assert.deepEqual([stored.length, pushCount, schemaCount, encrypted.length], [0,0,0,0], 'blocked content must never reach storage/encryption/push')
  const unavailable = createContactHandler({ ...deps, moderateMessage: () => { throw new Error('model missing') } })
  assert.equal((await call({ kind: 'anonymous', message: benign[5] }, unavailable)).statusCode, 503)
  assert.equal(stored.length, 0, 'failure must not fall back to accepting messages')
  assert.equal((await call({ kind: 'personal', anonymous: false, name: 'Visitante', message: benign[5] })).statusCode, 201)
  assert.equal(stored.length, 1); assert.equal(pushCount, 1)
  assert.equal(decryptContact(encrypted[0]).message, benign[5])
  assert.ok(!JSON.stringify(stored).includes(benign[5]), 'allowed text must still be encrypted at rest')
  console.log('Moderação local: IA treinada, ameaças explícitas, disfarces, frases legítimas, todos os tipos de remetente, bloqueio antes da gravação/push, falha fechada e criptografia dos envios aceitos verificados.')
} finally { process.env.NODE_ENV = previous; await server.close() }
