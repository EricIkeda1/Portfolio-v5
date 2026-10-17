const origin = 'https://www.ericyikeda.com.br'
const personId = `${origin}/#person`
const websiteId = `${origin}/#website`

export function seoHead(pathname: string) {
  const portfolio = pathname === '/portfolio'
  const privatePage = pathname === '/admin' || pathname === '/404'
  const title = privatePage
    ? `${pathname === '/admin' ? 'Administração' : 'Página não encontrada'} | Eric Y. Ikeda`
    : portfolio
      ? 'Eric Yuji Ikeda | Portfólio de desenvolvimento web e mobile'
      : 'Criação de sites em Ibiporã e Londrina | Eric Y. Ikeda'
  const description = portfolio
    ? 'Conheça os projetos de Eric Yuji Ikeda: desenvolvimento web e mobile com React, Flutter, TypeScript, APIs REST e PostgreSQL.'
    : 'Criação de sites, landing pages e WordPress em Ibiporã e Londrina. Design responsivo, modernização e manutenção com Eric Y. Ikeda. Solicite uma proposta.'
  const url = `${origin}${portfolio ? '/portfolio' : '/'}`
  const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  const meta = (name: string, content: string, property = false) => `<meta ${property ? 'property' : 'name'}="${name}" content="${escape(content)}" />`
  const graph: Record<string, unknown>[] = [
    { '@type': 'Person', '@id': personId, name: 'Eric Yuji Ikeda', url: `${origin}/portfolio`, jobTitle: 'Desenvolvedor de software', sameAs: ['https://github.com/EricIkeda1', 'https://www.linkedin.com/in/ericikeda1'], knowsAbout: ['Criação de sites', 'WordPress', 'Design responsivo', 'React', 'Flutter', 'TypeScript'] },
    { '@type': 'WebSite', '@id': websiteId, url: `${origin}/`, name: 'Eric Y. Ikeda — Criação de sites', inLanguage: 'pt-BR', publisher: { '@id': personId } },
    { '@type': portfolio ? 'ProfilePage' : 'WebPage', '@id': `${url}#webpage`, url, name: title, description, inLanguage: 'pt-BR', isPartOf: { '@id': websiteId }, ...(portfolio ? { mainEntity: { '@id': personId } } : { about: { '@id': `${origin}/#service` } }) },
  ]
  if (!portfolio) graph.push({ '@type': 'Service', '@id': `${origin}/#service`, name: 'Criação e modernização de sites', serviceType: 'Sites institucionais, landing pages, WordPress e manutenção de sites', url: `${origin}/#servicos`, description: 'Criação de sites responsivos e personalizados para empresas, com atendimento online.', provider: { '@id': personId }, areaServed: [{ '@type': 'City', name: 'Ibiporã' }, { '@type': 'City', name: 'Londrina' }] })
  return [
    `<title>${escape(title)}</title>`,
    meta('description', description), meta('author', 'Eric Yuji Ikeda'),
    meta('robots', privatePage ? 'noindex, nofollow, noarchive' : 'index, follow, max-image-preview:large'),
    meta('theme-color', portfolio ? '#07070f' : '#f5f5f0'),
    ...(!privatePage ? [`<link rel="canonical" href="${url}" />`, meta('og:type', 'website', true), meta('og:locale', 'pt_BR', true), meta('og:site_name', 'Eric Y. Ikeda', true), meta('og:url', url, true), meta('og:title', title, true), meta('og:description', description, true), meta('og:image', `${origin}/api/logo-image`, true), meta('og:image:alt', 'Eric Y. Ikeda — Criação de sites', true), meta('twitter:card', 'summary_large_image'), meta('twitter:title', title), meta('twitter:description', description), meta('twitter:image', `${origin}/api/logo-image`), `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`] : []),
  ].join('\n    ')
}
