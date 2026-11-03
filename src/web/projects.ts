import type { PortfolioProject } from '@/lib/portfolio'

export function safeLink(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return ''
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : ''
  } catch { return '' }
}

export function safeImage(value: unknown): string {
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !/[\\\r\n]/.test(value)) return value
  return safeLink(value)
}

export function isWebProject(project: PortfolioProject) {
  if (project.published === false) return false
  if (project.category && project.category !== 'auto') return project.category === 'web'
  const text = `${project.name} ${project.type} ${project.tags.join(' ')} ${project.github}`.toLowerCase()
  if (/flutter|\bmobile\b|ademiconnect|temperlights|iniciação|iniciacao|\babnt\b|trabalhos acadêmicos|trabalhos academicos|\baes\b|criptografia/.test(text)) return false
  return /web|react|next|site|ecommerce|e-commerce|galeria|gallery|frontend|front-end|full.stack|vue|angular|django|laravel/.test(text)
}

export function webProjects(projects: PortfolioProject[]) {
  return projects.filter(isWebProject).sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
}

export function projectSlug(project: PortfolioProject) {
  return `${project.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'projeto'}-${project.id}`
}

export function projectPath(project: PortfolioProject) { return `/portfolio/${projectSlug(project)}` }

// Compatibilidade com registros antigos cujo campo "github" contém a demonstração.
// Apenas vínculos já verificados no GitHub de Eric são completados aqui.
const knownRepos = [
  { match: /webshop/i, repo: 'webshop', demo: 'https://webshopeyi.vercel.app/' },
  { match: /delivery|restaurante/i, repo: 'Delivery-Restaurante', demo: 'https://deliveryeyi.vercel.app/' },
  { match: /galeria|gallery|fotos|fotografia/i, repo: 'PortfolioFotos2.0', demo: 'https://blogjovemribeiro.vercel.app/' },
]

export function projectLinks(project: PortfolioProject) {
  const legacy = safeLink(project.github)
  const isRepo = legacy && ['github.com', 'www.github.com'].includes(new URL(legacy).hostname)
  const known = knownRepos.find((item) => item.match.test(project.name))
  return {
    repo: isRepo ? legacy : known ? `https://github.com/EricIkeda1/${known.repo}` : '',
    demo: safeLink(project.demo_url) || (!isRepo ? legacy : '') || (known?.demo ?? ''),
  }
}

export function projectCover(project: PortfolioProject) {
  const custom = safeImage(project.image_url)
  if (custom) return { src: custom, kind: 'image' as const }
  if (/webshop/i.test(project.name)) return { src: '/projects/webshop-logo.png', kind: 'brand' as const }
  if (/delivery|restaurante/i.test(project.name)) return { src: '/projects/delivery-hero.jpg', kind: 'image' as const }
  return { src: '', kind: 'type' as const }
}

export function projectFilter(project: PortfolioProject): 'Sites' | 'Aplicações' {
  return /galeria|fotografia|blog|landing|institucional|portfolio/i.test(`${project.name} ${project.type}`) ? 'Sites' : 'Aplicações'
}
