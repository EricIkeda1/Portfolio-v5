import { useMemo } from 'react'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { ArrowIcon } from '@/components/Icons'
import { DeviceShowcase } from '@/components/DeviceShowcase'
import { PortfolioIcon } from '@/components/PortfolioIcon'

export default function Hero() {
  const { content, loading, error } = usePortfolioContent()
  const projects = useMemo(() => content.projects.filter(p => p.published !== false).sort((a, b) => a.sort_order - b.sort_order || a.id - b.id), [content.projects])
  const technologies = new Set(projects.flatMap(p => p.tags)).size
  return <section id="inicio" className="hero-section container">
    <div className="hero-grid">
      <div className="hero-copy"><span className="hero-badge"><PortfolioIcon name="code" /> Desenvolvedor de Software</span>
        <h1><span className="hero-title-intro">Transformo <span>ideias em</span></span><br /><span className="hero-title-accent">produtos digitais.</span></h1>
        <p>Desenvolvimento web, mobile e soluções completas com foco em performance, experiência e resultado.</p>
        <div className="hero-actions"><a className="button button-primary" href="#experiencia">Ver projetos <ArrowIcon diagonal /></a><a className="button button-outline" href="#sobre">Sobre mim</a></div>
      </div>
      <DeviceShowcase project={projects[0]} />
    </div>
    <div className="hero-metrics" aria-label="Sobre meu trabalho">
      <div><PortfolioIcon name="code" /><p><strong>{loading || error ? '—' : projects.length}</strong><span>Projetos publicados</span></p></div>
      <div><PortfolioIcon name="layers" /><p><strong>{loading || error ? '—' : technologies}</strong><span>Tecnologias e temas</span></p></div>
      <div><PortfolioIcon name="mobile" /><p><strong>Web + Mobile</strong><span>Experiências conectadas</span></p></div>
      <div><PortfolioIcon name="check" /><p><strong>Design & código</strong><span>Cuidado em cada detalhe</span></p></div>
    </div>
  </section>
}
