import { build } from 'vite'
import { readFile, writeFile, mkdir, rm, access } from 'node:fs/promises'

// Renderiza somente conteúdo público local. Não depende de banco, rede ou navegador.
// O painel continua carregando os dados atualizados da API após a hidratação.
const temporary = new URL('../.seo-build/', import.meta.url)
try {
  await build({ build: { ssr: 'src/entry-server.tsx', outDir: '.seo-build', emptyOutDir: true } })
  const { renderPage, seoHead } = await import(new URL('entry-server.js', temporary).href)
  const template = await readFile('dist/index.html', 'utf8')
  if (!template.includes('<!-- seo:start -->')) throw new Error('Marcador SEO ausente no HTML.')
  for (const [pathname, output] of [['/', 'index.html'], ['/portfolio', 'portfolio/index.html'], ['/links', 'links/index.html'], ['/arena', 'arena/index.html'], ['/admin', 'admin/index.html'], ['/404', '404.html']]) {
    const content = pathname === '/' || pathname === '/portfolio' || pathname === '/links' ? renderPage(pathname) : ''
    const pageTemplate = pathname === '/admin' ? template.replace('</head>', '<link rel="manifest" href="/admin.webmanifest"><link rel="apple-touch-icon" href="/notification-icon.png"></head>') : template
    const publicTemplate = pathname === '/links' ? pageTemplate.replace('rel="icon" href="/api/logo-image"', 'rel="icon" href="/social-icon.svg"') : pageTemplate
    const html = publicTemplate
      .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, `<!-- seo:start -->\n${seoHead(pathname)}\n<!-- seo:end -->`)
      .replace('<div id="root"></div>', `<div id="root">${content}</div>`)
    // Detecta referências erradas antes de publicar imagens quebradas.
    for (const [, asset] of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)) await access(`dist${asset}`)
    await mkdir(`dist/${output.includes('/') ? output.slice(0, output.lastIndexOf('/')) : ''}`, { recursive: true })
    await writeFile(`dist/${output}`, html)
    console.log(`SEO: ${pathname} → ${output} (${Buffer.byteLength(html)} bytes)`)
  }
} finally {
  await rm(temporary, { recursive: true, force: true })
}
