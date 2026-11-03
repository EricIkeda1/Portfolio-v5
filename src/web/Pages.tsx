import { useState, type FormEvent } from 'react'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import type { PortfolioProject } from '@/lib/portfolio'
import { ContactBanner } from './Chrome'
import Icon from './Icons'
import { ProjectCard, ProjectCarousel, ProjectCover } from './ProjectCards'
import { projectFilter, projectLinks, projectPath, safeLink, webProjects } from './projects'

function Intro({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children: React.ReactNode }) {
  return <div className="page-intro wrap"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{children}</p></div>
}

export function HomePage() {
  const { content } = usePortfolioContent()
  const projects = webProjects(content.projects)
  return <>
    <section className="home-hero wrap"><div className="hero-copy"><span className="eyebrow">Eric Ikeda · Engenheiro de Software</span><h1>Desenvolvimento web.<br /><span>Do conceito à experiência.</span></h1><p>Sites e aplicações web com foco em interfaces intuitivas e código bem organizado.</p><div className="button-row"><a href="/portfolio" className="button">Explorar portfólio <Icon name="arrow" size={18} /></a><a href="/sobre" className="text-link">Sobre mim</a></div><div className="hero-stack"><span>React</span><span>TypeScript</span><span>Interfaces responsivas</span></div></div>
      <div className="hero-showcase" aria-label="Uma seleção de projetos web"><div className="showcase-orbit" />{projects.length ? projects.slice(0, 3).map((project, index) => <a key={project.id} href={projectPath(project)} className={`showcase-tile tile-${index}`}><ProjectCover project={project} priority={index < 2} /><span>{project.name} <Icon name="external" size={14} /></span></a>) : <div className="hero-empty"><Icon name="code" size={76} /><span>Ideias que ganham forma na web.</span></div>}<span className="showcase-label">Interfaces. Integrações. Experiências.</span></div>
    </section>
    <div className="craft-band"><div className="wrap"><span>Design com intenção</span><span>Desenvolvimento web</span><span>Atenção aos detalhes</span></div></div>
    <section className="featured-section"><div className="wrap"><div className="section-heading"><div><span className="eyebrow">Uma seleção do meu trabalho</span><h2>Projetos web.<br /><span>Na prática.</span></h2></div><a className="text-link" href="/portfolio">Todos os projetos <Icon name="arrow" size={18} /></a></div>{projects.length > 0 ? <ProjectCarousel projects={projects} dark /> : <EmptyProjects />}</div></section>
    <section className="about-teaser wrap"><div className="initials-block" aria-hidden="true">EI<span>.</span></div><div><span className="eyebrow">Por trás do código</span><h2>Prazer, Eric.</h2><p>{content.about_text.split(/\n\s*\n/)[0]}</p><a href="/sobre" className="text-link">Conheça minha trajetória <Icon name="arrow" size={18} /></a></div></section>
    <TechnologySection /><ContactBanner />
  </>
}

function EmptyProjects() { return <div className="empty-projects"><Icon name="projects" size={32} /><h3>Novos projetos em breve.</h3><p>Os trabalhos publicados aparecerão aqui.</p></div> }

export function PortfolioPage() {
  const { content } = usePortfolioContent()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')
  const projects = webProjects(content.projects)
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const found = projects.filter((project) => (filter === 'Todos' || projectFilter(project) === filter) && normalize(`${project.name} ${project.description} ${project.tags.join(' ')}`).includes(normalize(search.trim())))
  return <>
    <Intro eyebrow="Portfólio" title={<>Projetos web.<br /><span>Em detalhe.</span></>}>Uma seleção de aplicações e interfaces que desenvolvi, com foco em usabilidade, funcionalidade e boas práticas.</Intro>
    <section className="portfolio-body wrap" aria-label="Explorar projetos"><div className="project-toolbar"><label className="search-field"><Icon name="search" /><span className="sr-only">Buscar projeto</span><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar projeto ou tecnologia" /></label><div className="segmented" role="group" aria-label="Filtrar projetos">{['Todos', 'Aplicações', 'Sites'].map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
      <p className="result-count" aria-live="polite">{found.length} {found.length === 1 ? 'projeto' : 'projetos'}{search || filter !== 'Todos' ? (found.length === 1 ? ' encontrado' : ' encontrados') : ' para explorar'}</p>
      {found.length ? <><ProjectCarousel projects={found} /><div className="section-heading project-list-heading"><div><span className="eyebrow">Cada ideia tem sua história</span><h2>Explore cada trabalho.</h2></div></div><div className="project-grid">{found.map((project) => <ProjectCard key={project.id} project={project} />)}</div></> : projects.length ? <div className="empty-projects"><Icon name="search" size={32} /><h2>Nenhum projeto encontrado.</h2><p>Tente outro nome ou tecnologia.</p><button type="button" className="button" onClick={() => { setSearch(''); setFilter('Todos') }}>Limpar busca</button></div> : <EmptyProjects />}
      <a href={safeLink(content.github)} target="_blank" rel="noopener noreferrer" className="github-all text-link"><Icon name="github" /> Explorar outros repositórios no GitHub <Icon name="external" size={16} /></a>
    </section><ContactBanner />
  </>
}

export function ProjectPage({ project }: { project: PortfolioProject }) {
  const links = projectLinks(project)
  const { content } = usePortfolioContent()
  const related = webProjects(content.projects).filter((item) => item.id !== project.id).slice(0, 2)
  return <><section className="detail-page wrap"><nav className="breadcrumbs" aria-label="Localização"><a href="/">Início</a><span>/</span><a href="/portfolio">Portfólio</a><span>/</span><span aria-current="page">{project.name}</span></nav><div className="detail-hero"><ProjectCover project={project} priority /><div><span className="eyebrow">{project.type}</span><h1>{project.name}</h1><p>{project.description}</p><div className="tech-pills">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="button-row">{links.demo && <a className="button" href={links.demo} target="_blank" rel="noopener noreferrer">Ver demonstração <Icon name="external" size={18} /></a>}{links.repo && <a className="button button-outline" href={links.repo} target="_blank" rel="noopener noreferrer"><Icon name="github" size={18} /> Ver repositório</a>}</div></div></div>
      <div className="detail-information"><div><span className="eyebrow">Contexto</span><h2>O projeto.</h2><p>{project.description}</p><p>Conheça o código e os materiais disponíveis no repositório para explorar sua estrutura e implementação.</p></div><div><span className="eyebrow">O que faz parte</span><h2>{project.highlights.length ? 'Principais recursos.' : 'Tecnologias.'}</h2><ul className="feature-list">{(project.highlights.length ? project.highlights : project.tags).map((item) => <li key={item}><span><Icon name="check" size={18} /></span>{item}</li>)}</ul>{!project.highlights.length && !project.tags.length && <p>Mais informações no repositório do projeto.</p>}</div></div><a className="text-link" href="/portfolio"><Icon name="arrow" size={18} /> Voltar ao portfólio</a></section>
      {related.length > 0 && <section className="related-projects wrap"><div className="section-heading"><h2>Continue explorando.</h2></div><div className="project-grid">{related.map((item) => <ProjectCard key={item.id} project={item} />)}</div></section>}<ContactBanner /></>
}

export function TechnologySection() {
  return <section className="technology-section"><div className="wrap"><div className="section-heading"><div><span className="eyebrow">Tecnologias</span><h2>Ferramentas para construir.</h2></div></div><div className="technology-grid"><article><Icon name="code" size={30} /><div><h3>Frontend</h3><p>React · TypeScript · JavaScript<br />HTML · CSS · Tailwind CSS</p></div></article><article><Icon name="database" size={30} /><div><h3>Dados e integrações</h3><p>PostgreSQL · Neon · Supabase<br />APIs REST</p></div></article><article><Icon name="tools" size={30} /><div><h3>Ferramentas</h3><p>Git · GitHub · Vite<br />Figma · Vercel</p></div></article></div></div></section>
}

export function AboutPage() {
  const { content } = usePortfolioContent()
  const [photoFailed, setPhotoFailed] = useState(false)
  return <><section className="about-page wrap"><span className="eyebrow">Sobre mim</span><div className="about-hero"><div className="portrait-block">{!photoFailed ? <img src="/api/profile-image" alt="Eric Y. Ikeda" width="600" height="680" onError={() => setPhotoFailed(true)} /> : <span className="initials-block" aria-label="Eric Ikeda">EI<span>.</span></span>}</div><div><h1>Prazer, Eric.</h1><p className="about-lead">Engenheiro de Software.<br /><span>Ideias, interfaces e código.</span></p>{content.about_text.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}<div className="button-row"><a className="button" href={safeLink(content.resume_url)} target="_blank" rel="noopener noreferrer">Ver currículo <Icon name="external" size={17} /></a><a className="text-link" href={safeLink(content.github)} target="_blank" rel="noopener noreferrer"><Icon name="github" /> GitHub</a><a className="text-link" href={safeLink(content.linkedin)} target="_blank" rel="noopener noreferrer">LinkedIn <Icon name="external" size={16} /></a></div></div></div></section><TechnologySection /><section className="education-section wrap"><div><span className="eyebrow">Formação</span><h2>Uma base para ir além.</h2></div><div className="education-card"><Icon name="book" size={30} /><div><h3>Engenharia de Software</h3><p>UniSenai PR · Concluído em 2026</p></div></div><div className="education-location"><Icon name="pin" size={22} /><p>Ibiporã, PR<br /><span>Remoto ou híbrido em Londrina.</span></p></div></section><ContactBanner /></>
}

export function ContactPage() {
  const { content } = usePortfolioContent()
  const [prepared, setPrepared] = useState(false)
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.email) ? content.email : ''
  const whatsapp = content.whatsapp.replace(/\D/g, '')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email) return
    const data = new FormData(event.currentTarget)
    const subject = `Contato pelo portfólio · ${String(data.get('name')).trim()}`
    const body = `${String(data.get('message')).trim()}\n\nNome: ${String(data.get('name')).trim()}\nE-mail: ${String(data.get('email')).trim()}`
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setPrepared(true)
  }
  return <section className="contact-page wrap"><div className="contact-copy"><span className="eyebrow">Contato</span><h1>Vamos<br /><span>conversar?</span></h1><p>Entre em contato para falar sobre projetos e oportunidades em desenvolvimento web.</p><div className="contact-channels">{email && <a href={`mailto:${email}`}><Icon name="mail" /><span>E-mail<small>{email}</small></span><Icon name="external" size={17} /></a>}<a href={safeLink(content.linkedin)} target="_blank" rel="noopener noreferrer"><Icon name="linkedin" /><span>LinkedIn<small>Vamos nos conectar</small></span><Icon name="external" size={17} /></a><a href={safeLink(content.github)} target="_blank" rel="noopener noreferrer"><Icon name="github" /><span>GitHub<small>Explore meu código</small></span><Icon name="external" size={17} /></a></div>{whatsapp && <a className="text-link whatsapp-link" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">Conversar pelo WhatsApp <Icon name="external" size={17} /></a>}</div>
    <form className="contact-form" onSubmit={submit}><h2>Me conte sua ideia.</h2><label htmlFor="contact-name">Nome<input id="contact-name" name="name" autoComplete="name" placeholder="Seu nome" maxLength={120} required /></label><label htmlFor="contact-email">E-mail<input id="contact-email" name="email" type="email" autoComplete="email" placeholder="seu@email.com" maxLength={254} required /></label><label htmlFor="contact-message">Mensagem<textarea id="contact-message" name="message" placeholder="Conte sobre seu projeto ou oportunidade..." rows={6} maxLength={5000} required /></label><p className="form-hint">Ao continuar, a mensagem será aberta no seu aplicativo de e-mail para você enviar.</p><button className="button" type="submit" disabled={!email}>Preparar e-mail <Icon name="arrow" size={18} /></button>{prepared && <p className="form-feedback" role="status">Mensagem preparada. Conclua o envio no aplicativo de e-mail ou use um dos canais ao lado.</p>}</form></section>
}

export function NotFound() { return <section className="not-found wrap"><span className="eyebrow">404</span><h1>Esse caminho<br />não está por aqui.</h1><p>Explore os projetos ou volte para o início.</p><a className="button" href="/portfolio">Ver portfólio <Icon name="arrow" /></a></section> }
