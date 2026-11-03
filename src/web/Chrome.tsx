import { useEffect, useRef, useState } from 'react'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import Icon, { type IconName } from './Icons'
import { safeLink } from './projects'

export function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand ${compact ? 'brand-compact' : ''}`}><span className="brand-symbol"><img src="/brand/eric-y-ikeda.png" width="1280" height="1280" alt="Logo Eric Y. Ikeda" /></span>{!compact && <span className="brand-wordmark">ERIC <b>Y.</b> IKEDA</span>}</span>
}

const items: { href: string; name: string; icon: IconName }[] = [
  { href: '/', name: 'Início', icon: 'home' }, { href: '/portfolio', name: 'Portfólio', icon: 'projects' },
  { href: '/sobre', name: 'Sobre', icon: 'user' }, { href: '/contato', name: 'Contato', icon: 'mail' },
]

export function Header({ pathname }: { pathname: string }) {
  const { content } = usePortfolioContent()
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const current = pathname.startsWith('/portfolio') ? '/portfolio' : pathname
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
    if (!open) return
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = oldOverflow }
  }, [open])
  const close = () => { setOpen(false); trigger.current?.focus() }
  return <>
    <header className="floating-header">
      <a href="/" className="brand-link" aria-label="Eric Y. Ikeda, início"><Brand /></a>
      <nav className="desktop-nav" aria-label="Navegação principal">{items.map((item) => <a key={item.href} href={item.href} aria-current={current === item.href ? 'page' : undefined}>{item.name}</a>)}</nav>
      <div className="header-actions"><a className="header-github" href={safeLink(content.github)} target="_blank" rel="noopener noreferrer" aria-label="GitHub de Eric Ikeda"><Icon name="github" /></a><a href="/contato" className="button button-small">Vamos conversar</a><button ref={trigger} className="menu-trigger" type="button" aria-label="Abrir menu" aria-haspopup="dialog" aria-expanded={open} aria-controls="navigation-dialog" onClick={() => setOpen(true)}><Icon name="menu" /></button></div>
    </header>
    <dialog id="navigation-dialog" ref={dialog} className="menu-dialog" aria-label="Navegação do site" onCancel={(e) => { e.preventDefault(); close() }} onClose={() => setOpen(false)} onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="menu-panel"><div className="menu-top"><span className="eyebrow">Navegação</span><button type="button" className="icon-button" onClick={close} aria-label="Fechar menu"><Icon name="close" /></button></div>
        <nav aria-label="Menu flutuante">{items.map((item) => <a key={item.href} href={item.href} onClick={close} aria-current={current === item.href ? 'page' : undefined}><Icon name={item.icon} size={23} /><span>{item.name}</span></a>)}</nav>
        <div className="menu-social"><a href={safeLink(content.github)} target="_blank" rel="noopener noreferrer"><Icon name="github" /> GitHub <Icon name="external" size={16} /></a><a href={safeLink(content.linkedin)} target="_blank" rel="noopener noreferrer"><Icon name="linkedin" /> LinkedIn <Icon name="external" size={16} /></a></div>
        <a className="button menu-cta" href="/contato" onClick={close}>Vamos conversar <Icon name="arrow" /></a>
      </div>
    </dialog>
  </>
}

export function Footer() {
  return <footer className="web-footer"><div className="wrap"><Brand compact /><p>Desenvolvido por <strong>Eric Y. Ikeda</strong></p></div></footer>
}

export function ContactBanner() {
  return <section className="contact-banner"><div className="wrap"><div><span className="eyebrow">Um próximo passo</span><h2>Vamos conversar?</h2><p>Projetos e oportunidades em desenvolvimento web.</p></div><a className="button button-light" href="/contato">Entrar em contato <Icon name="arrow" /></a></div></section>
}
