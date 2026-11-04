import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { DeviceShowcase } from '@/components/DeviceShowcase'
import { ArrowIcon } from '@/components/Icons'
import type { PortfolioProject } from '@/lib/portfolio'

function category(project: PortfolioProject) {
  const label = `${project.type} ${project.tags.join(' ')}`.toLowerCase()
  if (/mobile|flutter|dart/.test(label)) return 'Mobile'
  if (/web|react|ecommerce|full stack/.test(label)) return 'Web'
  return 'Outros'
}
function projectLink(value: string) {
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return { href: url.href, label: url.hostname === 'github.com' ? 'Ver repositório' : /vercel\.app$/.test(url.hostname) ? 'Explorar projeto' : 'Abrir projeto' }
  } catch { return null }
}
const ProjectCard = memo(function ProjectCard({ project, index, total }: { project: PortfolioProject; index: number; total: number }) {
  const link = projectLink(project.github)
  return <article className="project-card" role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${total}: ${project.name}`}>
    <div className="project-art"><span className="project-kind">{category(project)}</span><DeviceShowcase project={project} compact /></div>
    <div className="project-details"><span className="eyebrow">{project.type}</span><h3>{project.name}</h3><p className="project-summary">{project.description}</p><details className="project-more"><summary>Mais sobre o projeto</summary><p>{project.description}</p></details>{project.tags.length > 0 && <ul className="chips" aria-label="Tecnologias">{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>}{project.highlights.length > 0 && <ul className="project-highlights">{project.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul>}{link && <a className="project-link" href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<ArrowIcon diagonal /></a>}</div>
  </article>
})
export default function Experience() {
  const { content, loading, error, refresh } = usePortfolioContent()
  const [filter, setFilter] = useState('Todos')
  const [active, setActive] = useState(0)
  const track = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const allProjects = useMemo(() => content.projects.filter(p => p.published !== false).sort((a, b) => a.sort_order - b.sort_order || a.id - b.id), [content.projects])
  const categories = useMemo(() => ['Todos', ...['Web', 'Mobile', 'Outros'].filter(c => allProjects.some(p => category(p) === c))], [allProjects])
  const projects = useMemo(() => filter === 'Todos' ? allProjects : allProjects.filter(p => category(p) === filter), [allProjects, filter])
  const goTo = useCallback((index: number) => {
    const container = track.current
    const slide = container?.children[index] as HTMLElement | undefined
    if (!container || !slide) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    container.scrollTo({ left: slide.offsetLeft - (container.firstElementChild as HTMLElement).offsetLeft, behavior: reduced ? 'instant' : 'smooth' })
  }, [])
  useEffect(() => {
    setActive(0)
    if (track.current) track.current.scrollLeft = 0
    return () => { cancelAnimationFrame(frame.current); frame.current = 0 }
  }, [filter, projects.length])
  const onScroll = () => {
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      const container = track.current
      if (!container) return
      const origin = (container.firstElementChild as HTMLElement)?.offsetLeft || 0
      let closest = 0
      let distance = Infinity
      Array.from(container.children).forEach((slide, index) => {
        const next = Math.abs((slide as HTMLElement).offsetLeft - origin - container.scrollLeft)
        if (next < distance) { distance = next; closest = index }
      })
      setActive(value => value === closest ? value : closest)
    })
  }
  return <section id="experiencia" className="section-pad projects-section"><div className="container">
    <div className="section-heading"><div><span className="eyebrow section-pill">Projetos em destaque</span><h2>Conheça meus principais projetos.</h2></div><p>Uma seleção de trabalhos que unem design, tecnologia e resultado real.</p></div>
    <div className="project-toolbar"><div className="project-filters" aria-label="Filtrar projetos">{categories.map(item => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}{item === 'Todos' && <span>{allProjects.length}</span>}</button>)}</div><span className="carousel-hint">Deslize para explorar</span></div>
    {loading ? <div className="project-loading" role="status"><span className="loading-mark">EYI<span>.</span></span><p>Preparando os projetos…</p></div> : error ? <div className="project-empty" role="status"><h3>Os projetos estão temporariamente indisponíveis.</h3><p>Tente carregar novamente em instantes.</p><button type="button" className="button button-outline" onClick={() => void refresh()}>Tentar novamente</button></div> : !projects.length ? <div className="project-empty">Nenhum projeto publicado nesta categoria.</div> : <>
      <div className="project-track" ref={track} onScroll={onScroll} role="region" aria-roledescription="carrossel" aria-label="Projetos do portfólio" tabIndex={0} onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); goTo(Math.max(0, Math.min(projects.length - 1, active + (event.key === 'ArrowRight' ? 1 : -1)))) } }}>{projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} total={projects.length} />)}</div>
      <div className="carousel-footer"><p><strong>{String(active + 1).padStart(2, '0')}</strong><span> / {String(projects.length).padStart(2, '0')}</span></p><div className="carousel-dots" aria-label="Selecionar projeto">{projects.map((project, index) => <button key={project.id} type="button" aria-label={`Ver ${project.name}`} aria-current={active === index ? 'true' : undefined} onClick={() => goTo(index)}><span /></button>)}</div></div>
    </>}
  </div></section>
}
