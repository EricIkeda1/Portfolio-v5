import { useEffect, useRef, useState } from 'react'
import { ArrowIcon, GridIcon } from './Icons'
import { PortfolioIcon } from './PortfolioIcon'

const links = [
  { label: 'Início', href: '#inicio' },
  { label: 'Projetos', href: '#experiencia' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Tecnologias', href: '#habilidades' },
  { label: 'Contato', href: '#contato' },
]

export default function Nav() {
  const [active, setActive] = useState('#inicio')
  useEffect(() => {
    const targets = links.map(link => document.querySelector(link.href)).filter((el): el is HTMLElement => el instanceof HTMLElement)
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActive(`#${visible.target.id}`)
    }, { rootMargin: '-15% 0px -45% 0px', threshold: [0, .2, .5] })
    targets.forEach(target => observer.observe(target))
    return () => observer.disconnect()
  }, [])
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const close = () => dialog.current?.close()
  useEffect(() => {
    const query = window.matchMedia('(min-width: 769px)')
    const onChange = () => { if (query.matches) close() }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return <>
    <header className="portfolio-header">
      <div className="container nav-inner">
        <a href="#inicio" className="wordmark" aria-label="Eric Ikeda, início"><span className="brand-initials">EYI</span><span className="brand-name">Eric Ikeda</span></a>
        <nav className="desktop-nav" aria-label="Navegação principal">{links.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
        <a className="nav-contact" href="#contato">Vamos conversar <ArrowIcon diagonal /></a>
        <button ref={trigger} type="button" className="menu-trigger" onClick={() => dialog.current?.showModal()} aria-label="Abrir menu" aria-haspopup="dialog" aria-controls="mobile-menu"><PortfolioIcon name="menu" /></button>
      </div>
    </header>
    <dialog id="mobile-menu" ref={dialog} className="mobile-menu" aria-labelledby="menu-title" onClick={event => { if (event.target === event.currentTarget) close() }} onClose={() => trigger.current?.focus()}>
      <div className="menu-sheet">
        <div className="sheet-handle" />
        <div className="menu-heading"><h2 id="menu-title">Explore o portfólio</h2><button type="button" aria-label="Fechar menu" onClick={close}>×</button></div>
        <nav aria-label="Navegação mobile">{links.map((link, index) => <a key={link.href} href={link.href} onClick={close}><span className="menu-number">0{index + 1}</span>{link.label}<ArrowIcon diagonal /></a>)}</nav>
        <p>Design, código e um pouco de mim.</p>
      </div>
    </dialog>
    <nav className="mobile-dock" aria-label="Atalhos do portfólio">{[
      { href: '#inicio', label: 'Início', icon: 'home' as const },
      { href: '#experiencia', label: 'Projetos', icon: null },
      { href: '#sobre', label: 'Sobre', icon: 'user' as const },
      { href: '#contato', label: 'Contato', icon: 'mail' as const },
    ].map(item => <a key={item.href} href={item.href} aria-current={active === item.href ? 'location' : undefined} onClick={() => setActive(item.href)}>{item.icon ? <PortfolioIcon name={item.icon} /> : <GridIcon />}<span>{item.label}</span></a>)}</nav>
  </>
}
