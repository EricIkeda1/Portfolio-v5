import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import proxy from '../middleware.ts'
for (const path of ['/', '/index.html']) {
  const response = proxy(new Request(`https://links.ericyikeda.com.br${path}?utm_source=ig`))
  assert.equal(response.headers.get('x-middleware-rewrite'), 'https://links.ericyikeda.com.br/links/index.html?utm_source=ig')
}
for (const url of ['https://www.ericyikeda.com.br/', 'https://ericyikeda.com.br/', 'https://links.ericyikeda.com.br/api/contact', 'https://links.ericyikeda.com.br/admin', 'https://links.ericyikeda.com.br/links/index.html']) {
  assert.equal(proxy(new Request(url)).headers.get('x-middleware-next'), '1')
}
const html = await readFile('dist/links/index.html', 'utf8')
assert.ok(html.includes('Eric Yuji Ikeda · Me encontre por aqui'))
assert.ok(html.includes('https://links.ericyikeda.com.br/links-preview.png'))
assert.ok(html.includes('property="og:image:width" content="1200"'))
assert.ok(html.includes('property="og:image:height" content="630"'))
assert.ok(!html.includes('Horário de Brasília'))
const image = await readFile('public/links-preview.png')
assert.equal(image.readUInt32BE(16), 1200); assert.equal(image.readUInt32BE(20), 630)
assert.ok(image.length < 200_000)
console.log('Prévia: subdomínio reescrito antes do HTML estático; portfólio/APIs/admin preservados; imagem PNG 1200×630 e metadados pessoais verificados.')
