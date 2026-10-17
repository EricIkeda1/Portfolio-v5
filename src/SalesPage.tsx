import { useEffect, useState } from 'react'
import './SalesPage.css'
import { getPublicContent } from './lib/api'

const services = [
  { n: '01', title: 'Sites institucionais', desc: 'Uma presença digital profissional para apresentar sua empresa, seus diferenciais e seus serviços.' },
  { n: '02', title: 'Landing pages', desc: 'Páginas objetivas para campanhas, lançamentos e captação de contatos.' },
  { n: '03', title: 'WordPress & modernização', desc: 'Criação, atualização visual e melhorias de sites WordPress existentes.' },
  { n: '04', title: 'Manutenção e melhorias', desc: 'Ajustes de conteúdo, responsividade, desempenho e evolução contínua do seu site.' },
]
const faqs = [
  ['Quanto custa desenvolver um site?', 'O orçamento depende das páginas, funcionalidades e materiais necessários. Primeiro conversamos sobre seu projeto e então envio uma proposta personalizada.'],
  ['Você trabalha com WordPress?', 'Sim. Desenvolvo e modernizo sites WordPress e também posso avaliar soluções personalizadas de acordo com a necessidade.'],
  ['Meu site vai funcionar no celular?', 'Sim. O desenvolvimento considera celulares, tablets e computadores desde o início.'],
  ['Posso solicitar melhorias no meu site atual?', 'Claro! Posso analisar seu site atual e propor uma modernização sem necessariamente refazer tudo.'],
]
function Mockup({ variant = 'light' }: {variant?: 'light' | 'dark' | 'warm'}) {
  return <div className={`sales-mock sales-mock--${variant}`} aria-hidden="true">
    <div className="sales-mock-top"><span className="sales-mock-logo">studio<span>.</span></span><span>INÍCIO &nbsp; SOBRE &nbsp; SERVIÇOS</span><span className="sales-mock-pill">CONTATO ↗</span></div>
    <div className="sales-mock-content"><div className="sales-mock-eyebrow">DESIGN • ESTRATÉGIA • PRESENÇA</div><div className="sales-mock-heading">Ideias que<br/><em>ganham forma.</em></div><div className="sales-mock-line"/><div className="sales-mock-description">Uma experiência digital feita para destacar o que torna sua marca única.</div><span className="sales-mock-button">EXPLORE O PROJETO ↗</span></div>
    <div className="sales-mock-art"><div className="sales-mock-orbit"/><div className="sales-mock-orbit second"/></div>
  </div>
}
export default function SalesPage() {
  const [menu, setMenu] = useState(false)
  const [slide, setSlide] = useState(0)
  const [contact, setContact] = useState<{whatsapp:string;email:string;linkedin:string}|null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('topo')
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targets = document.querySelectorAll<HTMLElement>('.sales-page .sales-reveal')
    if (!('IntersectionObserver' in window) || reduce) {
      targets.forEach(el => el.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting)
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' })
    targets.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 22)
      const ids = ['contato', 'sobre', 'projetos', 'servicos']
      const found = ids.find(id => {
        const el = document.getElementById(id)
        return el && el.getBoundingClientRect().top < window.innerHeight * .38 && el.getBoundingClientRect().bottom > 110
      })
      setActive(found || 'topo')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menu])
  useEffect(() => {
    let mounted = true
    getPublicContent().then(data => { if (mounted) setContact({ whatsapp:data.whatsapp, email:data.email, linkedin:data.linkedin }) }).catch(() => { /* Contato indisponível: não exibir dados inventados */ })
    return () => { mounted = false }
  }, [])
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setSlide(n => (n + 1) % 3), 4500)
    return () => window.clearInterval(timer)
  }, [])
  const contactUrl = contact?.whatsapp?.trim() ? (() => {
    const raw = contact.whatsapp.trim()
    const digits = raw.replace(/\D/g, '')
    if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(raw)) return raw
    return digits.length >= 10 && digits.length <= 13 ? `https://wa.me/${digits.length <= 11 ? '55' + digits : digits}` : null
  })() : contact?.email?.trim() ? `mailto:${contact.email.trim()}` : contact?.linkedin?.trim() ? contact.linkedin.trim() : null
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  return <div className="sales-page" id="topo">
    <header className={`sales-nav ${scrolled ? 'is-scrolled' : ''} ${menu ? 'menu-open' : ''}`}>
      <a className="sales-brand" href="/" aria-label="EYI início" onClick={() => setMenu(false)}><span className="sales-brand-monogram">EYI<span>.</span></span><small>ESTÚDIO DIGITAL <b> / </b> ERIC Y. IKEDA</small></a>
      <nav className={`sales-nav-links ${menu ? 'is-open' : ''}`} aria-label="Navegação principal" id="sales-navigation">
        <a onClick={() => setMenu(false)} href="#topo"><span>00</span> Início</a>
        <a className={active === 'servicos' ? 'is-active' : ''} onClick={() => setMenu(false)} href="#servicos"><span>01</span> Serviços</a>
        <a className={active === 'projetos' ? 'is-active' : ''} onClick={() => setMenu(false)} href="#projetos"><span>02</span> Projetos</a>
        <a className={active === 'sobre' ? 'is-active' : ''} onClick={() => setMenu(false)} href="#sobre"><span>03</span> Sobre</a>
        <a onClick={() => setMenu(false)} className="sales-nav-cta" href="#contato">Vamos conversar <span aria-hidden="true">↗</span></a>
      </nav>
      <button type="button" className={`sales-menu-toggle ${menu ? 'is-active' : ''}`} aria-label={menu ? 'Fechar menu' : 'Abrir menu'} aria-controls="sales-navigation" aria-expanded={menu} onClick={() => setMenu(!menu)}><span/><span/><span/></button>
    </header>
    <main>
      <section className="sales-hero sales-reveal"><div className="sales-hero-copy"><h1>Sites com identidade.<br/><em>Não apenas presença.</em></h1><p>Criação e modernização de sites para empresas que querem ser reconhecidas pelo que fazem com clareza, personalidade e atenção aos detalhes.</p><div className="sales-hero-actions"><a className="sales-button sales-button-primary" href="#contato">Vamos criar seu site <span>↗</span></a><a className="sales-text-link" href="#projetos">Explorar projetos <span>↘</span></a></div><div className="sales-hero-foot"><span>WORDPRESS</span><span>DESIGN RESPONSIVO</span><span>SITES PERSONALIZADOS</span></div></div><div className="sales-hero-visual"><div className="sales-visual-label"><span>0{slide+1} / 03</span><span>UMA NOVA FORMA DE SE APRESENTAR</span></div><div className="sales-hero-slides" aria-label="Carrossel de conceitos visuais">{(['light','warm','dark'] as const).map((variant, index) => <div key={variant} className={`sales-hero-slide ${slide===index ? 'is-current' : ''}`} aria-hidden={slide!==index}><Mockup variant={variant}/></div>)}</div><div className="sales-visual-bottom"><span>CONCEITOS VISUAIS • DEMONSTRAÇÃO</span><div className="sales-slide-controls" aria-label="Selecionar imagem do carrossel">{[0,1,2].map(i=><button key={i} type="button" aria-label={`Ver imagem ${i+1}`} aria-pressed={slide===i} className={slide===i?'is-current':''} onClick={()=>setSlide(i)}/>)}</div></div></div></section>
      <div className="sales-marquee" aria-label="Serviços oferecidos"><span>WORDPRESS & DESIGN</span><i>✳</i><span>FEITO SOB MEDIDA</span><i>✳</i><span>EXPERIÊNCIAS DIGITAIS</span><i>✳</i></div>
      <section className="sales-section sales-services sales-reveal" id="servicos"><div className="sales-section-heading"><div><span className="sales-overline">01 O QUE EU FAÇO</span><h2>Seu negócio, <em>bem apresentado.</em></h2></div><p>Da primeira impressão ao último detalhe, cada página é pensada para transmitir confiança e facilitar o contato com seus clientes.</p></div><div className="sales-service-list">{services.map(s=><article className="sales-service sales-reveal" key={s.n}><span className="sales-service-number">{s.n}</span><h3>{s.title}</h3><p>{s.desc}</p><span className="sales-service-arrow">↗</span></article>)}</div></section>
      <section className="sales-section sales-audiences sales-reveal" id="segmentos"><div className="sales-section-heading"><div><span className="sales-overline">PARA QUEM É</span><h2>Seu trabalho merece <em>ser encontrado.</em></h2></div><p>Landing pages para apresentar serviços com clareza e facilitar o contato com novos clientes.</p></div><div className="sales-audiences-grid">{[
['01','Advogados e escritórios','Áreas de atuação e contato profissional.'],['02','Dentistas e clínicas','Especialidades, equipe e agendamento.'],['03','Arquitetos e engenheiros','Projetos e pedidos de orçamento.'],['04','Psicólogos e terapeutas','Apresentação do atendimento e contato.'],['05','Imobiliárias e corretores','Imóveis e captação de interessados.'],['06','Salões e profissionais da beleza','Serviços, resultados e agendamento.'],['07','Oficinas e serviços automotivos','Serviços e solicitação de orçamento.'],['08','Restaurantes e cafeterias','Cardápio, localização e pedidos.'],['09','Prestadores de serviços','Eletricistas, encanadores, instaladores e mais.']
].map(([n,title,description])=><article className="sales-audience sales-reveal" key={n}><span>{n}</span><h3>{title}</h3><p>{description}</p></article>)}</div><p className="sales-audiences-note">Seu segmento não está aqui? Também desenvolvo páginas para outros tipos de negócio.</p></section>
      <section className="sales-section sales-work sales-reveal" id="projetos"><div className="sales-section-heading"><div><span className="sales-overline">02 IDEIAS EM DESTAQUE</span><h2>Design que dá<br/><em>vontade de explorar.</em></h2></div><p>Algumas direções visuais que mostram como um site pode apresentar melhor uma marca. Os exemplos abaixo são conceitos demonstrativos.</p></div><div className="sales-work-grid"><article className="sales-work-card sales-reveal"><Mockup variant="warm"/><div className="sales-work-caption"><div><strong>Conceito institucional</strong><span>IDENTIDADE DIGITAL • DEMONSTRAÇÃO</span></div><span>01 ↗</span></div></article><article className="sales-work-card sales-reveal"><Mockup variant="dark"/><div className="sales-work-caption"><div><strong>Conceito de landing page</strong><span>DESIGN RESPONSIVO • DEMONSTRAÇÃO</span></div><span>02 ↗</span></div></article></div></section>
      <section className="sales-about sales-reveal" id="sobre"><div className="sales-about-aside"><span className="sales-overline">03 QUEM ESTÁ POR TRÁS</span><div className="sales-about-mark">EYI<span>.</span></div><span>DESIGN. CÓDIGO. DETALHES.</span></div><div className="sales-about-copy"><h2>Um site bonito é bom.<br/><em>Um site pensado para você é melhor.</em></h2><p>Sou Eric Y. Ikeda, engenheiro de software e desenvolvedor web. Uno design e tecnologia para criar experiências digitais modernas, funcionais e alinhadas à identidade de cada negócio.</p><p>Do WordPress a projetos personalizados, meu objetivo é entregar uma presença online que faça sentido para sua empresa sem soluções genéricas.</p></div></section>
      <section className="sales-section sales-process sales-reveal"><div className="sales-section-heading"><div><span className="sales-overline">04 COMO FUNCIONA</span><h2>Simples do início <em>ao lançamento.</em></h2></div></div><div className="sales-steps">{[['01','Conversa inicial','Entendo seu negócio, objetivos e o que você precisa.'],['02','Proposta e direção','Definimos escopo, identidade visual, prazo e orçamento.'],['03','Criação do site','Desenvolvo a experiência com atenção a cada detalhe.'],['04','Entrega','Revisamos o resultado e preparamos a publicação.']].map(([n,t,d])=><article className="sales-reveal" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section>
      <section className="sales-section sales-faq sales-reveal"><div><span className="sales-overline">05 DÚVIDAS FREQUENTES</span><h2>Antes de <em>começarmos.</em></h2></div><div className="sales-faq-items">{faqs.map(([q,a],i)=><div className="sales-faq-item sales-reveal" key={q}><button onClick={()=>setOpenFaq(openFaq===i?null:i)} aria-expanded={openFaq===i}>{q}<span>{openFaq===i?'−':'+'}</span></button>{openFaq===i&&<p>{a}</p>}</div>)}</div></section>
      <section className="sales-contact sales-reveal" id="contato"><div className="sales-contact-inner"><span className="sales-overline">06 VAMOS CONVERSAR?</span><h2>Seu próximo site<br/>começa com <em>uma ideia.</em></h2><p>Conte um pouco sobre seu projeto e vamos encontrar o melhor caminho para colocar sua marca em destaque.</p><a className="sales-button sales-button-light" href={contactUrl || "#contato"} aria-disabled={!contactUrl} onClick={e => { if (!contactUrl) e.preventDefault() }} target={contactUrl?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">Conversar sobre meu projeto <span>↗</span></a><small>{contactUrl ? "Contato carregado a partir das informações cadastradas no painel administrativo." : "Contato temporariamente indisponível. Confira os dados no painel administrativo e a conexão com o banco."}</small></div><span className="sales-contact-deco">↗</span></section>
    </main><footer className="sales-footer"><div className="sales-footer-top"><a className="sales-brand" href="/">EYI<span>.</span><small>DESENVOLVIMENTO WEB</small></a><div><a href="#topo">Voltar ao topo ↑</a><a href="/portfolio">Portfólio</a><a href={contactUrl || "#contato"} onClick={e => { if (!contactUrl) e.preventDefault() }}>Contato</a></div></div><div className="sales-footer-bottom"><span>© {new Date().getFullYear()} Eric Y. Ikeda. Todos os direitos reservados.</span><span>DESENVOLVIDO POR ERIC Y. IKEDA</span></div></footer>
  </div>
}
