import type { ReactNode } from 'react'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
const principles = [
  { title: 'Interfaces intuitivas', description: 'Soluções simples, claras e focadas no usuário.' },
  { title: 'Integrações eficientes', description: 'Conexão com serviços e APIs que geram valor.' },
  { title: 'Atenção ao desempenho', description: 'Código organizado e interações suaves.' },
]
export default function Purpose({ children }: { children?: ReactNode }) {
  const { content } = usePortfolioContent()
  return <section id="sobre" className="purpose-section"><div className="container"><h2>Tecnologia com propósito.</h2><p className="purpose-intro">Sou Eric Ikeda. Desenvolvo experiências digitais com React, TypeScript e Flutter.</p><div className="purpose-principles">{principles.map(principle => <div key={principle.title}><h3>{principle.title}</h3><p>{principle.description}</p></div>)}</div>
    <details className="portfolio-story"><summary>Mais sobre minha trajetória</summary><div className="story-bio">{content.about_text.split(/\n\s*\n/).filter(Boolean).map((text,index) => <p key={index}>{text}</p>)}<p><strong>Engenharia de Software</strong><br />UniSenai PR · Londrina</p>{content.resume_url && <a href={content.resume_url} target="_blank" rel="noopener noreferrer">Conheça meu currículo ›</a>}</div>{children}</details>
  </div></section>
}
