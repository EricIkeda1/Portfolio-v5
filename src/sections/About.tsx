import { Reveal } from '@/components/Reveal'
import { ArrowIcon } from '@/components/Icons'
import { usePortfolioContent } from '@/context/PortfolioContentContext'

export default function About() {
  const { content } = usePortfolioContent()
  const paragraphs = content.about_text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  return <section id="sobre" className="section-pad about-section"><div className="container about-grid">
    <div><span className="eyebrow">02 / Por trás do código</span><Reveal><h2>Curiosidade para criar.<br /><span className="soft-text">Cuidado para construir.</span></h2></Reveal><div className="education-card"><span className="education-symbol" aria-hidden="true">↗</span><div><span className="eyebrow">Formação</span><h3>Engenharia de Software</h3><p>UniSenai PR · Londrina</p></div></div>{content.resume_url && <a className="text-link" href={content.resume_url} target="_blank" rel="noopener noreferrer">Conheça meu currículo <ArrowIcon diagonal /></a>}</div>
    <div className="about-copy">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<div className="about-note"><span className="status-dot" /> Aberto a oportunidades como desenvolvedor júnior.</div></div>
  </div></section>
}
