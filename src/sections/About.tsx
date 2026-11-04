import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { PortfolioIcon } from '@/components/PortfolioIcon'
import { ArrowIcon } from '@/components/Icons'
import { ProfileImage } from '@/components/ProfileImage'
const areas = [
  { title: 'Frontend', icon: 'code' as const, description: 'Interfaces modernas e responsivas.' },
  { title: 'Mobile', icon: 'mobile' as const, description: 'Apps com Flutter e experiência fluida.' },
  { title: 'Backend', icon: 'layers' as const, description: 'APIs, banco de dados e integrações.' },
  { title: 'Produto', icon: 'product' as const, description: 'Da ideia à entrega, com qualidade.' },
]
export default function About() {
  const { content } = usePortfolioContent()
  const paragraphs = content.about_text.split(/\n\s*\n/).filter(Boolean)
  return <section id="sobre" className="section-pad about-section"><div className="container">
    <div className="about-grid"><div className="about-introduction"><span className="eyebrow">Sobre mim</span><h2>Eric Ikeda</h2><p>Desenvolvedor com foco em criar soluções digitais modernas e responsivas, combinando design, tecnologia e usabilidade.</p><a className="button button-primary" href="#trajetoria" onClick={() => { const story = document.getElementById('trajetoria') as HTMLDetailsElement | null; if (story) story.open = true }}>Conheça minha trajetória <ArrowIcon diagonal /></a></div><div className="areas-grid">{areas.map(area => <article key={area.title}><PortfolioIcon name={area.icon} /><h3>{area.title}</h3><p>{area.description}</p></article>)}</div></div>
    <details id="trajetoria" className="about-story"><summary>Minha trajetória e formação</summary><div className="story-grid"><div className="story-portrait"><ProfileImage /></div><div>{paragraphs.map((paragraph,index) => <p key={index}>{paragraph}</p>)}<div className="education-card"><PortfolioIcon name="star" /><div><span className="eyebrow">Formação</span><h3>Engenharia de Software</h3><p>UniSenai PR · Londrina</p></div></div>{content.resume_url && <a className="text-link" href={content.resume_url} target="_blank" rel="noopener noreferrer">Conheça meu currículo <ArrowIcon diagonal /></a>}</div></div></details>
  </div></section>
}
