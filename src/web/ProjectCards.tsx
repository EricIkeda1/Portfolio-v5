import { useEffect, useRef, useState } from 'react'
import type { PortfolioProject } from '@/lib/portfolio'
import Icon from './Icons'
import { projectCover, projectLinks, projectPath } from './projects'

export function ProjectCover({ project, priority = false }: { project: PortfolioProject; priority?: boolean }) {
  const cover = projectCover(project)
  const [failed, setFailed] = useState(false)
  useEffect(() => { setFailed(false) }, [cover.src])
  const generated = /^\/api\/project-preview\?id=/.test(String(project.image_url ?? ''))
  return <div className={`project-cover cover-${cover.kind} ${failed || !cover.src ? 'cover-type' : ''}`}>
    {generated && !failed && <span className="ai-preview-label">Prévia com IA</span>}
    {cover.src && !failed ? <img src={cover.src} alt={cover.kind === 'brand' ? `Marca do projeto ${project.name}` : `Imagem do projeto ${project.name}${generated ? ' (prévia ilustrativa com IA)' : ''}`} loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : 'auto'} onError={() => setFailed(true)} /> : <><span className="cover-code" aria-hidden="true">{'</>'}</span><span className="cover-title">{project.name}</span><span className="cover-caption">{project.type}</span></>}
  </div>
}

export function ProjectLinks({ project }: { project: PortfolioProject }) {
  const links = projectLinks(project)
  return <div className="project-links">{links.demo && <a href={links.demo} target="_blank" rel="noopener noreferrer">Demonstração <Icon name="external" size={15} /></a>}{links.repo && <a href={links.repo} target="_blank" rel="noopener noreferrer"><Icon name="github" size={17} /> Repositório</a>}</div>
}

export function ProjectCard({ project }: { project: PortfolioProject }) {
  return <article className="project-card"><a href={projectPath(project)} className="project-card-image" aria-label={`Explorar ${project.name}`}><ProjectCover project={project} /></a><div className="project-card-copy"><span className="eyebrow">{project.type}</span><h3><a href={projectPath(project)}>{project.name}</a></h3><p>{project.description}</p><div className="tech-line">{project.tags.slice(0, 4).join(' · ')}</div><ProjectLinks project={project} /><a className="details-link" href={projectPath(project)}>Explorar projeto <Icon name="arrow" size={17} /></a></div></article>
}

export function ProjectCarousel({ projects, dark = false }: { projects: PortfolioProject[]; dark?: boolean }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const viewport = useRef<HTMLDivElement>(null)
  const currentIndex = useRef(0)
  currentIndex.current = active
  const count = projects.length
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update(); mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  const go = (index: number) => {
    const element = viewport.current
    if (element) element.scrollTo({ left: index * element.clientWidth, behavior: reduced ? 'instant' : 'smooth' })
  }
  useEffect(() => {
    if (count < 2 || paused || hovered || focused || reduced) return
    const timer = window.setInterval(() => { if (!document.hidden) go((active + 1) % count) }, 5000)
    return () => window.clearInterval(timer)
  }, [active, count, paused, hovered, focused, reduced])
  useEffect(() => { setActive(0); viewport.current?.scrollTo({ left: 0 }) }, [count])
  useEffect(() => {
    const el = viewport.current
    if (!el) return
    const observer = new ResizeObserver(() => { el.scrollTo({ left: currentIndex.current * el.clientWidth, behavior: 'instant' }) })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  if (!count) return null
  return <section className={`project-carousel ${dark ? 'carousel-dark' : ''}`} aria-roledescription="carrossel" aria-label="Projetos em destaque" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false) }}>
    <div className="carousel-viewport" ref={viewport} tabIndex={0} aria-label="Deslize para explorar os projetos" onScroll={(e) => { const el = e.currentTarget; setActive(Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth)))) }} onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.min(active + 1, count - 1)) } if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.max(active - 1, 0)) } }}>
      {projects.map((project, index) => <article className="carousel-slide" key={project.id} role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${count}: ${project.name}`} inert={index !== active}>
        <div className="carousel-copy"><span className="eyebrow">{project.type}</span><h2>{project.name}</h2><p>{project.description}</p><div className="tech-line">{project.tags.slice(0, 4).join(' · ')}</div><div className="button-row"><a className={`button ${dark ? 'button-light' : ''}`} href={projectPath(project)}>Explorar projeto <Icon name="arrow" size={18} /></a></div><ProjectLinks project={project} /></div>
        <a href={projectPath(project)} className="carousel-art" aria-label={`Detalhes de ${project.name}`}><ProjectCover project={project} priority={index === 0} /></a>
      </article>)}
    </div>
    <div className="carousel-controls"><span className="carousel-counter">{String(active + 1).padStart(2, '0')} <span>/ {String(count).padStart(2, '0')}</span></span><div className="carousel-dots" aria-label="Selecionar projeto">{projects.map((project, index) => <button type="button" key={project.id} aria-label={`Mostrar ${project.name}`} aria-pressed={active === index} onClick={() => { setPaused(true); go(index) }}><span /></button>)}</div>{count > 1 && <button className="icon-button pause-button" type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Retomar carrossel' : 'Pausar carrossel'} aria-pressed={paused}><Icon name={paused ? 'play' : 'pause'} size={16} /></button>}</div>
  </section>
}
