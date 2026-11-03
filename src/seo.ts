const origin = 'https://www.ericyikeda.com.br'

export function pageMeta(pathname: string, projectName?: string) {
  const pages: Record<string, { title: string; description: string }> = {
    '/': { title: 'Eric Y. Ikeda | Desenvolvimento web', description: 'Sites e aplicações web com Eric Ikeda. Conheça projetos em React e TypeScript, com foco em usabilidade, integrações e código bem organizado.' },
    '/portfolio': { title: 'Portfólio de desenvolvimento web | Eric Y. Ikeda', description: 'Explore as aplicações web de Eric Ikeda: projetos, tecnologias, demonstrações e repositórios.' },
    '/sobre': { title: 'Sobre Eric Ikeda | Engenharia de Software', description: 'Conheça Eric Ikeda, formado em Engenharia de Software pela UniSenai PR, suas tecnologias e sua trajetória no desenvolvimento web.' },
    '/contato': { title: 'Contato | Eric Y. Ikeda', description: 'Converse com Eric Ikeda sobre projetos e oportunidades em desenvolvimento web.' },
    '/admin': { title: 'Administração | Eric Y. Ikeda', description: 'Área administrativa do portfólio.' },
    '/404': { title: 'Página não encontrada | Eric Y. Ikeda', description: 'Explore o portfólio de Eric Ikeda.' },
  }
  const meta = pages[pathname] ?? (pathname.startsWith('/portfolio/') ? { title: `${projectName || 'Projeto web'} | Eric Y. Ikeda`, description: `Conheça ${projectName || 'este projeto web'}: tecnologias, recursos e links para o código e a demonstração.` } : pages['/404'])
  return { ...meta, url: `${origin}${pathname === '/' ? '/' : pathname}` }
}

export function seoHead(pathname: string) {
  const { title, description, url } = pageMeta(pathname)
  const privatePage = pathname === '/admin' || pathname === '/404'
  const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  const meta = (name: string, content: string, property = false) => `<meta ${property ? 'property' : 'name'}="${name}" content="${escape(content)}" />`
  const graph = [
    { '@type': 'Person', '@id': `${origin}/#person`, name: 'Eric Yuji Ikeda', url: `${origin}/sobre`, jobTitle: 'Engenheiro de Software', sameAs: ['https://github.com/EricIkeda1', 'https://www.linkedin.com/in/ericikeda1'], knowsAbout: ['React', 'TypeScript', 'JavaScript', 'Desenvolvimento web', 'APIs REST', 'PostgreSQL'] },
    { '@type': 'WebSite', '@id': `${origin}/#website`, url: origin, name: 'Eric Y. Ikeda', inLanguage: 'pt-BR' },
    { '@type': pathname === '/sobre' ? 'ProfilePage' : 'WebPage', url, name: title, description, isPartOf: { '@id': `${origin}/#website` }, ...(pathname === '/sobre' ? { mainEntity: { '@id': `${origin}/#person` } } : {}) },
  ]
  return [
    `<title>${escape(title)}</title>`, meta('description', description), meta('author', 'Eric Yuji Ikeda'),
    meta('robots', privatePage ? 'noindex, nofollow, noarchive' : 'index, follow, max-image-preview:large'), meta('theme-color', '#f5f5f7'),
    ...(!privatePage ? [`<link rel="canonical" href="${escape(url)}" />`, meta('og:type', 'website', true), meta('og:locale', 'pt_BR', true), meta('og:site_name', 'Eric Y. Ikeda', true), meta('og:url', url, true), meta('og:title', title, true), meta('og:description', description, true), meta('og:image', `${origin}/brand/eric-y-ikeda.png`, true), meta('twitter:card', 'summary_large_image'), meta('twitter:title', title), meta('twitter:description', description), meta('twitter:image', `${origin}/brand/eric-y-ikeda.png`), `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`] : []),
  ].join('\n    ')
}
