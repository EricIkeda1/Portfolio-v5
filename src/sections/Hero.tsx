import { useMemo } from 'react'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { DeviceShowcase } from '@/components/DeviceShowcase'
import { publicProjects, isMobileProject } from '@/lib/projectPresentation'

export default function Hero() {
  const { content } = usePortfolioContent()
  const projects = useMemo(() => publicProjects(content.projects), [content.projects])
  const primary = projects.find(project => /webshop/i.test(project.name)) || projects.find(project => !isMobileProject(project)) || projects[0]
  const secondary = projects.find(project => project.id !== primary?.id && !isMobileProject(project))
  return <section id="inicio" className="hero-section">
    <div className="hero-copy container"><span className="hero-name">Eric Ikeda</span><h1>Ideias que<br />ganham vida.</h1><p>Desenvolvimento web e mobile. Design em cada detalhe.</p><div className="hero-actions"><a className="hero-link primary-action" href="#experiencia">Explore os projetos <span aria-hidden="true">›</span></a><a className="hero-link secondary-action" href="#sobre">Conheça meu trabalho <span aria-hidden="true">›</span></a></div></div>
    <div className="hero-scene" aria-label="Prévias dos projetos em desktop e celular">{secondary && <div className="hero-back-device"><DeviceShowcase project={secondary} /></div>}<div className="hero-main-device"><DeviceShowcase project={primary} /></div><div className="hero-stage" aria-hidden="true" /></div>
  </section>
}
