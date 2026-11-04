import { useMemo } from 'react'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { DeviceShowcase } from '@/components/DeviceShowcase'
import { publicProjects, selectFeatured, projectDestination, projectHeadline } from '@/lib/projectPresentation'
import type { PortfolioProject } from '@/lib/portfolio'

function Spotlight({ project, large = false }: { project: PortfolioProject; large?: boolean }) {
  const destination = projectDestination(project.github)
  return <article className={`spotlight ${large ? 'spotlight-large' : 'spotlight-tile'}`}>
    <div className="spotlight-copy"><h2>{project.name}<span className="title-period">.</span></h2><p className="spotlight-headline">{projectHeadline(project)}</p>{project.tags.length > 0 && <p className="spotlight-tags">{project.tags.slice(0, 3).join(' · ')}</p>}{destination && <a className="hero-link" href={destination.href} target="_blank" rel="noopener noreferrer">{destination.label} <span aria-hidden="true">›</span></a>}</div>
    <DeviceShowcase project={project} compact />
  </article>
}
export default function ProjectSpotlights() {
  const { content, loading, error } = usePortfolioContent()
  const featured = useMemo(() => selectFeatured(publicProjects(content.projects)), [content.projects])
  if (loading || error || !featured.length) return null
  return <section className="spotlights" aria-label="Projetos em destaque"><Spotlight project={featured[0]} large /><div className="spotlight-grid">{featured.slice(1).map(project => <Spotlight key={project.id} project={project} />)}</div></section>
}
