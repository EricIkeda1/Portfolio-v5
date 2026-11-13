import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const config = JSON.parse(await readFile('vercel.json', 'utf8'))
const policy = config.headers[0].headers.find(header => header.key === 'Content-Security-Policy').value
const scripts = policy.match(/(?:^|;)\s*script-src\s+([^;]+)/)[1]
assert.ok(!scripts.includes('unsafe-inline'))
assert.ok(!scripts.includes('unsafe-eval'))
for (const file of ['index.html', 'portfolio/index.html', 'links/index.html', 'loja/index.html', 'admin/index.html', 'arena/index.html', '404.html']) {
  const html = await readFile(`dist/${file}`, 'utf8')
  assert.ok(!/\son(?:load|error|click)\s*=/i.test(html), `Inline handler in ${file}`)
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc\s*=/.test(attrs)) continue
    const hash = `'sha256-${createHash('sha256').update(body).digest('base64')}'`
    assert.ok(scripts.includes(hash), `Missing CSP hash for ${file}`)
  }
}
console.log('CSP: scripts inline bloqueados, handlers removidos e hashes SEO verificados em todas as páginas.')
