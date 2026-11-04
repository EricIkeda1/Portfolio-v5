import type { PortfolioProject } from './portfolio'

export function publicProjects(projects: PortfolioProject[]) {
  return projects.filter(project => project.published !== false).sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
}
export function isMobileProject(project: PortfolioProject) {
  return /mobile|flutter|dart/i.test(`${project.type} ${project.tags.join(' ')}`)
}
export function projectDestination(value: string) {
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return { href: url.href, label: url.hostname === 'github.com' ? 'Ver no GitHub' : 'Conhecer projeto' }
  } catch { return null }
}
export function projectHeadline(project: PortfolioProject) {
  if (/ademiconnect/i.test(project.name)) return 'Mais organização. Em cada visita.'
  if (/webshop/i.test(project.name)) return 'Uma experiência de compra fluida.'
  if (/galeria|fotos/i.test(project.name)) return 'Momentos que merecem ser vistos.'
  return project.highlights[0] || project.type
}
export function selectFeatured(projects: PortfolioProject[]) {
  const preferred = ['ademiconnect', 'webshop']
  const selected = preferred.flatMap(name => {
    const project = projects.find(item => item.name.toLowerCase().includes(name))
    return project ? [project] : []
  })
  for (const project of projects) {
    if (selected.length >= 3) break
    if (!selected.some(item => item.id === project.id)) selected.push(project)
  }
  return selected
}
