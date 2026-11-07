import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import ts from 'typescript'
import { resolveLocale, translateText } from '../src/i18n/locale.ts'
const english = JSON.parse(readFileSync(new URL('../src/i18n/en.json', import.meta.url), 'utf8'))
assert.equal(resolveLocale(null, ['en-US', 'pt-BR']), 'en')
assert.equal(resolveLocale(null, ['en-GB']), 'en')
assert.equal(resolveLocale(null, ['pt-BR', 'en-US']), 'pt')
assert.equal(resolveLocale(null, ['es', 'en']), 'es')
assert.equal(resolveLocale(null, ['es-ES']), 'es')
assert.equal(resolveLocale(null, ['es-MX']), 'es')
assert.equal(resolveLocale(null, ['es-AR', 'en-US']), 'es')
assert.equal(resolveLocale(null, ['fr-FR', 'es']), 'pt')
assert.equal(resolveLocale('pt', ['es-ES']), 'pt')
assert.equal(resolveLocale('es', ['en-US']), 'es')
const spanish = JSON.parse(readFileSync(new URL('../src/i18n/es.json', import.meta.url), 'utf8'))
assert.deepEqual(Object.keys(spanish).sort(), Object.keys(english).sort())
assert.equal(translateText('Contato', 'es', spanish), 'Contacto')
assert.equal(translateText('Texto novo', 'es', spanish), 'Texto novo')
assert.equal(resolveLocale(null, []), 'pt')
assert.equal(resolveLocale('pt', ['en-US']), 'pt')
assert.equal(resolveLocale('en', ['pt-BR']), 'en')
assert.equal(resolveLocale('invalid', ['EN-us']), 'en')
assert.equal(translateText('Contato', 'pt', english), 'Contato')
assert.equal(translateText('Contato', 'en', english), 'Contact')
assert.equal(translateText('  Contato\n', 'en', english), 'Contact')
assert.equal(translateText('A new unreviewed project', 'en', english), 'A new unreviewed project')
assert.equal(translateText('toString', 'en', english), 'toString')
assert.equal(translateText('__proto__', 'en', english), '__proto__')
// Every literal translation requested by a public component must be present.
const paths = ['src/App.tsx', 'src/components/Nav.tsx', 'src/components/ContactForm.tsx', ...readdirSync(new URL('../src/sections/', import.meta.url)).map(f => `src/sections/${f}`)]
for (const path of paths) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
  const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 't' && ts.isStringLiteral(node.arguments[0])) {
      assert.ok(english[node.arguments[0].text], `Missing English translation in ${path}: ${node.arguments[0].text}`)
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
}
console.log('i18n: language detection, saved preference, fallback and literal coverage passed.')
