const origin = 'https://www.ericyikeda.com.br'
const personId = `${origin}/#person`
const websiteId = `${origin}/#website`

export function seoHead(pathname: string) {
  const portfolio = pathname === '/' || pathname.replace(/\/+$/, '') === '/portfolio'
  const privatePage = pathname === '/admin' || pathname === '/404'
  const title = privatePage
    ? `${pathname === '/admin' ? 'Administração' : 'Página não encontrada'} | Eric Y. Ikeda`
    : 'Eric Yuji Ikeda | Portfólio de desenvolvimento web e mobile'
  const description = 'Conheça os projetos de Eric Yuji Ikeda: desenvolvimento web e mobile com React, Flutter, TypeScript, APIs REST e PostgreSQL.'
  const url = `${origin}/`
  const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  const meta = (name: string, content: string, property = false) => `<meta ${property ? 'property' : 'name'}="${name}" content="${escape(content)}" />`
  const graph: Record<string, unknown>[] = [
    { '@type': 'Person', '@id': personId, name: 'Eric Yuji Ikeda', url: `${origin}/`, jobTitle: 'Desenvolvedor de software', sameAs: ['https://github.com/EricIkeda1', 'https://www.linkedin.com/in/ericikeda1'], knowsAbout: ['Desenvolvimento web', 'Desenvolvimento mobile', 'React', 'Flutter', 'TypeScript', 'APIs REST', 'PostgreSQL'] },
    { '@type': 'WebSite', '@id': websiteId, url: `${origin}/`, name: 'Eric Y. Ikeda — Portfólio', inLanguage: 'pt-BR', publisher: { '@id': personId } },
    { '@type': portfolio ? 'ProfilePage' : 'WebPage', '@id': `${url}#webpage`, url, name: title, description, inLanguage: 'pt-BR', isPartOf: { '@id': websiteId }, ...(portfolio ? { mainEntity: { '@id': personId } } : {}) },
  ]
  return [
    `<title>${escape(title)}</title>`,
    meta('description', description), meta('author', 'Eric Yuji Ikeda'),
    meta('robots', privatePage ? 'noindex, nofollow, noarchive' : 'index, follow, max-image-preview:large'),
    meta('theme-color', '#f5f5f2'),
    ...(!privatePage ? [`<link rel="canonical" href="${url}" />`, meta('og:type', 'website', true), meta('og:locale', 'pt_BR', true), meta('og:site_name', 'Eric Y. Ikeda', true), meta('og:url', url, true), meta('og:title', title, true), meta('og:description', description, true), meta('og:image', `${origin}/api/logo-image`, true), meta('og:image:alt', 'Eric Y. Ikeda — Portfólio', true), meta('twitter:card', 'summary_large_image'), meta('twitter:title', title), meta('twitter:description', description), meta('twitter:image', `${origin}/api/logo-image`), `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`] : []),
  ].join('\n    ')
}
