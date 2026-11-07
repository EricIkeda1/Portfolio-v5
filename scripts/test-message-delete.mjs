// In-memory fixtures only: no database connection, real message deletion or push.
import assert from 'node:assert/strict'
import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
const previousEnv = process.env.NODE_ENV
try {
  const { createAdminMessagesHandler } = await server.ssrLoadModule('/api/admin-messages.ts')
  process.env.NODE_ENV = 'production'
  const rows = [{ id: 1, source: 'portfolio', read_at: null }, { id: 2, source: 'personal', read_at: null }, { id: 3, source: 'personal', read_at: '2026-01-01' }]
  let authorized = true, dbCalls = 0, failing = false
  const handler = createAdminMessagesHandler({
    requireAdmin: async (_req, res) => { if (!authorized) res.status(401).json({ error: 'Login necessário' }); return authorized },
    ensureContactSchema: async () => {},
    getSql: () => async (strings, id, source) => {
      dbCalls++
      assert.match(strings.join('?'), /DELETE FROM contact_messages WHERE id = \? AND source = \? RETURNING id, read_at/)
      if (failing) throw new Error('simulated database outage')
      const index = rows.findIndex(row => row.id === id && row.source === source)
      if (index < 0) return []
      const [row] = rows.splice(index, 1)
      return [{ id: row.id, read_at: row.read_at }]
    },
  })
  async function call(body, source = 'personal', headers = {}) {
    const res = { statusCode: 200, headers: {}, setHeader(k,v) { this.headers[k] = v }, status(code) { this.statusCode = code; return this }, json(body) { this.body = body; return this } }
    await handler({ method: 'DELETE', query: { source }, body, headers: { origin: 'https://site.test', host: 'site.test', 'content-type': 'application/json', ...headers } }, res)
    return res
  }
  const input = { action: 'delete_message', id: 2 }
  authorized = false
  assert.equal((await call(input)).statusCode, 401); assert.equal(dbCalls, 0)
  authorized = true
  assert.equal((await call(input, 'personal', { origin: 'https://evil.test' })).statusCode, 403)
  assert.equal((await call(input, 'personal', { 'content-type': 'text/plain' })).statusCode, 415)
  for (const id of [null, '2', -1, 0, 1.5, 2147483648]) assert.equal((await call({ ...input, id })).statusCode, 400)
  assert.equal((await call(input, 'all')).statusCode, 400); assert.equal(dbCalls, 0)
  assert.equal((await call({ ...input, id: 1 })).statusCode, 404); assert.equal(rows.length, 3)
  const deleted = await call(input)
  assert.equal(deleted.statusCode, 200); assert.deepEqual(deleted.body, { id: 2, read_at: null })
  assert.equal(rows.some(row => row.id === 1), true); assert.equal(rows.some(row => row.id === 3), true)
  assert.equal((await call(input)).statusCode, 404)
  failing = true
  assert.equal((await call({ ...input, id: 3 })).statusCode, 503); assert.equal(rows.some(row => row.id === 3), true)
  failing = false
  assert.equal((await call({ ...input, id: 1 }, 'portfolio')).statusCode, 200)
  assert.deepEqual((await call({ ...input, id: 3 })).body, { id: 3, read_at: '2026-01-01' })
  console.log('Exclusão: autenticação, origem, JSON, IDs, separação das caixas, mensagem ausente, resultado lida/não lida e falha do banco verificados em memória. Nenhum dado real excluído.')
} finally { process.env.NODE_ENV = previousEnv; await server.close() }
