import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { ArrowIcon } from '@/components/Icons'
import { ProfileImage } from '@/components/ProfileImage'

export default function Hero() {
  const { content } = usePortfolioContent()
  return <section id="inicio" className="hero-section container">
    <div className="hero-intro"><span className="eyebrow"><span className="status-dot" /> Desenvolvimento web & mobile</span><span className="hero-location">Ibiporã, PR · Brasil</span></div>
    <div className="hero-grid">
      <div className="hero-copy">
        <h1>Ideias que viram<br /><span>experiências.</span></h1>
        <p>Sou Eric Ikeda, desenvolvedor de software. Transformo ideias em interfaces e aplicações que conectam pessoas à tecnologia.</p>
        <div className="hero-actions"><a className="button button-primary" href="#experiencia">Conheça meus projetos <ArrowIcon /></a><a className="text-link" href="#sobre">Um pouco sobre mim <ArrowIcon diagonal /></a></div>
      </div>
      <div className="hero-identity">
        <div className="identity-top"><span>CRIATIVIDADE + ENGENHARIA</span><span aria-hidden="true">✳</span></div>
        <div className="identity-portrait"><ProfileImage eager /><span className="portrait-caption">Eric Yuji Ikeda</span></div>
        <div className="identity-bottom"><div><span className="identity-label">Da interface à solução.</span><strong>Web. Mobile. Possibilidades.</strong></div><a href={content.github} target="_blank" rel="noopener noreferrer" aria-label="Visitar meu GitHub"><ArrowIcon diagonal /></a></div>
      </div>
    </div>
    <div className="hero-bottom"><span>Engenharia de Software · UniSenai PR</span><div><span>React</span><span>TypeScript</span><span>Flutter</span></div><a href="#experiencia">Explore abaixo ↓</a></div>
  </section>
}
