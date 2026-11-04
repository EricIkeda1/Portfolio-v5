import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { ArrowIcon } from '@/components/Icons'
export default function Contact() {
  const { content } = usePortfolioContent()
  const digits = content.whatsapp.replace(/\D/g, '')
  const whatsapp = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits
  return <section id="contato" className="section-pad contact-section"><div className="container"><div className="contact-panel"><span className="eyebrow"><span className="status-dot" /> Vamos nos conectar</span><h2>Boas conversas.<br /><span>Novas possibilidades.</span></h2><p>Uma oportunidade, uma ideia ou uma troca sobre tecnologia?<br />Vai ser bom conversar com você.</p><div className="contact-actions">{content.email && <a className="button button-primary" href={`mailto:${content.email}`}>Me mande um e-mail <ArrowIcon diagonal /></a>}{whatsapp && <a className="button button-outline" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">Conversar no WhatsApp <ArrowIcon diagonal /></a>}</div><div className="contact-socials">{content.github && <a href={content.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowIcon diagonal /></a>}{content.linkedin && <a href={content.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowIcon diagonal /></a>}{content.resume_url && <a href={content.resume_url} target="_blank" rel="noopener noreferrer">Currículo <ArrowIcon diagonal /></a>}</div></div></div></section>
}
