import { useEffect, useRef } from 'react'
import { ArrowIcon, GridIcon } from './Icons'

const links = [
  { label: 'Início', href: '#inicio' },
  { label: 'Projetos', href: '#experiencia' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Habilidades', href: '#habilidades' },
  { label: 'Contato', href: '#contato' },
]

export default function Nav() {
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
        <a href="#inicio" className="wordmark" aria-label="Eric Ikeda, início">Eric Ikeda<span>.</span></a>
        <nav className="desktop-nav" aria-label="Navegação principal">{links.slice(1, 4).map(link => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
        <a className="nav-contact" href="#contato">Vamos conversar <ArrowIcon diagonal /></a>
        <button ref={trigger} type="button" className="menu-trigger" onClick={() => dialog.current?.showModal()} aria-label="Abrir menu" aria-haspopup="dialog" aria-controls="mobile-menu"><GridIcon /></button>
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
    <nav className="mobile-dock" aria-label="Atalhos do portfólio"><a href="#inicio">Início</a><a href="#experiencia"><GridIcon /> Projetos</a><a href="#contato">Contato</a></nav>
  </>
}
