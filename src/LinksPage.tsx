import './links.css'

const portfolio = 'https://www.ericyikeda.com.br/'
const shortcuts = [
  { label: 'Meus projetos', detail: 'Ideias que viraram código.', hash: 'experiencia', icon: '01' },
  { label: 'Sobre mim', detail: 'Conheça quem está por trás.', hash: 'sobre', icon: '02' },
  { label: 'Vamos conversar', detail: 'Uma ideia começa com um oi.', hash: 'contato', icon: '03' },
]

export default function LinksPage() {
  return (
    <div className="links-page">
      <header className="links-top"><span>EYI<span className="links-blue">.</span></span><span className="links-top-caption">DESENVOLVIMENTO & CRIATIVIDADE</span></header>
      <main className="links-main">
        <div className="links-avatar" aria-hidden="true">EI<span /></div>
        <p className="links-eyebrow">WEB · MOBILE · SOFTWARE</p>
        <h1>Eric Y. Ikeda<span className="links-blue">.</span></h1>
        <p className="links-bio">Transformando ideias em experiências digitais.<br />Seu próximo clique começa aqui.</p>
        <nav className="links-nav" aria-label="Explore meu portfólio">
          <a className="links-featured" href={portfolio}>
            <span className="links-featured-top"><span className="links-chip">MEU UNIVERSO DIGITAL</span><span aria-hidden="true">↗</span></span>
            <span className="links-browser" aria-hidden="true"><span className="links-browser-bar"><i /><i /><i /><span>ericyikeda.com.br</span></span><span className="links-browser-content"><span>IDEIAS EM MOVIMENTO</span><strong>Design.<br />Código.<br /><em>Possibilidades.</em></strong><span className="links-browser-line" /></span><span className="links-code">&lt;/&gt;</span></span>
            <span className="links-featured-bottom"><span><strong>Explore meu portfólio</strong><small>Projetos, tecnologias e um pouco de mim.</small></span><span className="links-arrow" aria-hidden="true">↗</span></span>
          </a>
          {shortcuts.map(link => <a className="links-shortcut" href={`${portfolio}#${link.hash}`} key={link.hash}><span className="links-number" aria-hidden="true">{link.icon}</span><span><strong>{link.label}</strong><small>{link.detail}</small></span><span className="links-shortcut-arrow" aria-hidden="true">↗</span></a>)}
        </nav>
        <p className="links-note"><span aria-hidden="true" />Todos os caminhos levam ao meu portfólio.</p>
      </main>
      <footer className="links-footer">FEITO COM PROPÓSITO <span>© {new Date().getFullYear()} ERIC Y. IKEDA</span></footer>
    </div>
  )
}
