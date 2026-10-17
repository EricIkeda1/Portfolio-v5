import { useEffect, useState, type MouseEvent } from 'react'
import './SalesPage.css'
import { getPublicContent } from './lib/api'
import LoopingSalesTitle from './components/LoopingSalesTitle'
import LandingPageDemo from './components/LandingPageDemo'

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
export default function SalesPage() {
  const [menu, setMenu] = useState(false)
  const [slide, setSlide] = useState(0)
  const [previewStep, setPreviewStep] = useState([0,0])
  const [contact, setContact] = useState<{whatsapp:string;email:string;linkedin:string}|null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('topo')
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targets = document.querySelectorAll<HTMLElement>('.sales-page .sales-reveal')
    if (!('IntersectionObserver' in window) || reduce || window.matchMedia('(max-width: 900px)').matches) {
      targets.forEach(el => el.classList.add('is-visible'))
      return
    }
    document.querySelector('.sales-page')?.classList.add('sales-motion-ready')
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' })
    targets.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const sections = ['servicos', 'projetos', 'sobre', 'contato']
      .map(id => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    let frame = 0
    const update = () => {
      frame = 0
      setScrolled(window.scrollY > 22)
      const navHeight = document.querySelector('.sales-nav')?.getBoundingClientRect().height ?? 84
      let current = 'topo'
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= navHeight + 24) current = section.id
      }
      setActive(previous => previous === current ? previous : current)
    }
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.cancelAnimationFrame(frame)
    }
  }, [])
  const scrollToSection = (id: string, smooth = true) => {
    const section = document.getElementById(id)
    if (!section) return
    const navHeight = document.querySelector('.sales-nav')?.getBoundingClientRect().height ?? 84
    const anchor = id === 'projetos' ? section.querySelector('.sales-section-heading') ?? section : section
    const top = id === 'topo' ? 0 : window.scrollY + anchor.getBoundingClientRect().top - navHeight - 12
    window.scrollTo({ top: Math.max(0, top), behavior: smooth && Math.abs(window.scrollY - top) < window.innerHeight * 3 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant' })
  }
  const navigateSection = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
    const id = link?.getAttribute('href')?.slice(1)
    if (!id || !document.getElementById(id) || link?.getAttribute('aria-disabled') === 'true') return
    event.preventDefault()
    setMenu(false)
    document.body.style.overflow = ''
    window.history.pushState(null, '', `#${id}`)
    window.requestAnimationFrame(() => scrollToSection(id))
  }
  useEffect(() => {
    let frame = 0
    const followHash = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const id = window.location.hash.slice(1)
        if (id) scrollToSection(id, false)
      })
    }
    followHash()
    window.addEventListener('hashchange', followHash)
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener('hashchange', followHash) }
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
    let timer: number | undefined
    let visible = true
    const syncTimer = () => {
      window.clearInterval(timer)
      if (!document.hidden && visible) timer = window.setInterval(() => setSlide(n => (n + 1) % 3), 4500)
    }
    const hero = document.querySelector('.sales-hero')
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      syncTimer()
    }) : null
    if (hero) observer?.observe(hero)
    document.addEventListener('visibilitychange', syncTimer)
    syncTimer()
    return () => {
      window.clearInterval(timer)
      observer?.disconnect()
      document.removeEventListener('visibilitychange', syncTimer)
    }
  }, [])
  const changePreview = (index: number, direction: number) => {
    const next = (previewStep[index] + direction + 3) % 3
    const viewport = document.getElementById(`sales-preview-scroll-${index}`)
    if (viewport) {
      const section = viewport.querySelectorAll<HTMLElement>('.sales-preview-page')[next]
      if (section) viewport.scrollTo({ top: viewport.scrollTop + section.getBoundingClientRect().top - viewport.getBoundingClientRect().top, behavior: window.matchMedia('(max-width: 900px), (prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    }
    setPreviewStep(previous => previous.map((value, i) => i === index ? next : value))
  }
  const syncPreview = (index: number) => {
    const viewport = document.getElementById(`sales-preview-scroll-${index}`)
    if (!viewport) return
    const current = Math.min(2, Math.max(0, Math.round(viewport.scrollTop / viewport.clientHeight)))
    setPreviewStep(previous => previous[index] === current ? previous : previous.map((value, i) => i === index ? current : value))
  }
  const contactUrl = contact?.whatsapp?.trim() ? (() => {
    const raw = contact.whatsapp.trim()
    const digits = raw.replace(/\D/g, '')
    if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(raw)) return raw
    return digits.length >= 10 && digits.length <= 13 ? `https://wa.me/${digits.length <= 11 ? '55' + digits : digits}` : null
  })() : contact?.email?.trim() ? `mailto:${contact.email.trim()}` : contact?.linkedin?.trim() ? contact.linkedin.trim() : null
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  return <div className="sales-page" id="topo" onClick={navigateSection}>
    <header className={`sales-nav ${scrolled ? 'is-scrolled' : ''} ${menu ? 'menu-open' : ''}`}>
      <a className="sales-brand" href="/" aria-label="EYI início" onClick={() => setMenu(false)}><span className="sales-brand-monogram">EYI<span>.</span></span><small>ESTÚDIO DIGITAL <b> / </b> ERIC Y. IKEDA</small></a>
      <nav aria-hidden={false} className={`sales-nav-links ${menu ? 'is-open' : ''}`} aria-label="Navegação principal" id="sales-navigation">
        <a className={active === 'topo' ? 'is-active' : ''} onClick={() => setMenu(false)} href="#topo"><span>00</span> Início</a>
        <a className={active === 'servicos' ? 'is-active' : ''} onClick={() => setMenu(false)} href="#servicos"><span>01</span> Serviços</a>
        <a className={active === 'projetos' ? 'is-active' : ''} onClick={() => setMenu(false)} href="#projetos"><span>02</span> Projetos</a>
        <a className={active === 'sobre' ? 'is-active' : ''} onClick={() => setMenu(false)} href="#sobre"><span>03</span> Sobre</a>
        <a onClick={() => setMenu(false)} className={`sales-nav-cta ${active === 'contato' ? 'is-active' : ''}`} href="#contato">Vamos conversar </a>
      </nav>
      <button type="button" className={`sales-menu-toggle ${menu ? 'is-active' : ''}`} aria-label={menu ? 'Fechar menu' : 'Abrir menu'} aria-controls="sales-navigation" aria-expanded={menu} onClick={() => setMenu(!menu)}><span/><span/><span/></button>
    </header>
    <main>
      <div className="sales-intro">
      <section className="sales-hero sales-reveal"><div className="sales-hero-copy"><LoopingSalesTitle/><p>Criação de sites, landing pages e soluções WordPress para empresas que querem ser reconhecidas com clareza, personalidade e atenção aos detalhes.</p><div className="sales-hero-actions"><a className="sales-button sales-button-primary" href="#contato">Vamos criar seu site </a><a className="sales-text-link sales-button-secondary" href="#projetos">Explorar projetos </a></div><div className="sales-hero-foot"><span>WORDPRESS</span><span>DESIGN RESPONSIVO</span><span>SITES PERSONALIZADOS</span></div></div><div className="sales-hero-visual"><div className="sales-visual-label"><span>0{slide+1} / 03</span><span>UMA NOVA FORMA DE SE APRESENTAR</span></div><div className="sales-hero-slides" aria-label="Carrossel de conceitos visuais">{([{kind:'clinic',step:0},{kind:'architecture',step:0},{kind:'restaurant',step:0}] as const).map((demo, index) => <div key={index} className={`sales-hero-slide ${slide===index ? 'is-current' : ''}`} aria-hidden={slide!==index}><div className="sales-mock sales-hero-demo"><LandingPageDemo kind={demo.kind} step={demo.step} eager/></div></div>)}</div><div className="sales-visual-bottom"><span>CONCEITOS VISUAIS • DEMONSTRAÇÃO</span><div className="sales-slide-controls" aria-label="Selecionar imagem do carrossel">{[0,1,2].map(i=><button key={i} type="button" aria-label={`Ver imagem ${i+1}`} aria-pressed={slide===i} className={slide===i?'is-current':''} onClick={()=>setSlide(i)}/>)}</div></div></div></section>
      <div className="sales-marquee" aria-label="Serviços oferecidos"><span>WORDPRESS & DESIGN</span><i>✳</i><span>FEITO SOB MEDIDA</span><i>✳</i><span>EXPERIÊNCIAS DIGITAIS</span><i>✳</i></div>
      </div>
      <section className="sales-section sales-services sales-reveal" id="servicos"><div className="sales-section-heading"><div><span className="sales-overline">01 O QUE EU FAÇO</span><h2>Seu negócio, <em>bem apresentado.</em></h2></div><p>Da primeira impressão ao último detalhe, cada página é pensada para transmitir confiança e facilitar o contato com seus clientes.</p></div><div className="sales-service-list">{services.map(s=><article className="sales-service sales-reveal" key={s.n}><span className="sales-service-number">{s.n}</span><h3>{s.title}</h3><p>{s.desc}</p></article>)}</div></section>
      <section className="sales-section sales-audiences sales-reveal" id="segmentos"><div className="sales-section-heading"><div><span className="sales-overline">PARA QUEM É</span><h2>Seu trabalho merece <em>ser encontrado.</em></h2></div><p>Landing pages para apresentar serviços com clareza e facilitar o contato com novos clientes.</p></div><div className="sales-audiences-grid">{[
['01','Advogados e escritórios','Áreas de atuação e contato profissional.'],['02','Dentistas e clínicas','Especialidades, equipe e agendamento.'],['03','Arquitetos e engenheiros','Projetos e pedidos de orçamento.'],['04','Psicólogos e terapeutas','Apresentação do atendimento e contato.'],['05','Imobiliárias e corretores','Imóveis e captação de interessados.'],['06','Salões e profissionais da beleza','Serviços, resultados e agendamento.'],['07','Oficinas e serviços automotivos','Serviços e solicitação de orçamento.'],['08','Restaurantes e cafeterias','Cardápio, localização e pedidos.'],['09','Prestadores de serviços','Eletricistas, encanadores, instaladores e mais.']
].map(([n,title,description])=><article className="sales-audience sales-reveal" key={n}><span>{n}</span><h3>{title}</h3><p>{description}</p></article>)}</div><p className="sales-audiences-note">Seu segmento não está aqui? Também desenvolvo páginas para outros tipos de negócio.</p></section>
      <section className="sales-section sales-work sales-reveal" id="projetos"><div className="sales-section-heading"><div><span className="sales-overline">02 IDEIAS EM DESTAQUE</span><h2>Design que dá<br/><em>vontade de explorar.</em></h2></div><p>Algumas direções visuais que mostram como um site pode apresentar melhor uma marca. Os exemplos abaixo são conceitos demonstrativos.</p></div><div className="sales-work-grid">{(['warm','dark'] as const).map((variant,index)=><article className="sales-work-card sales-reveal" key={variant}>
        <div className="sales-demo-heading"><span>{index===0?'01 / SAÚDE & BEM-ESTAR':'02 / ARQUITETURA & INTERIORES'}</span><span>Conceito EYI</span></div><div className="sales-project-preview"><div className="sales-preview-window" id={`sales-preview-scroll-${index}`} onScroll={() => syncPreview(index)}><div className="sales-preview-pages">
          <LandingPageDemo kind={index===0?'clinic':'architecture'} step={0}/>
          <LandingPageDemo kind={index===0?'clinic':'architecture'} step={1}/>
          <LandingPageDemo kind={index===0?'clinic':'architecture'} step={2}/>
        </div></div><div className="sales-preview-toolbar"><span className="sales-preview-counter"><b>0{previewStep[index]+1}</b><span className="sales-preview-counter-separator">/</span>03</span><div><button type="button" aria-label="Seção anterior do exemplo" onClick={()=>changePreview(index,-1)}>Anterior</button><button type="button" aria-label="Próxima seção do exemplo" onClick={()=>changePreview(index,1)}>Próxima</button></div></div></div>
        <div className="sales-work-caption"><div><strong>{index===0?'Odontologia com um olhar mais humano':'Arquitetura para ser vivida'}</strong><span>LANDING PAGE CONCEITUAL · INÍCIO / CONTEÚDO / CONTATO</span></div><span>0{index+1}</span></div></article>)}</div></section>
      <section className="sales-about sales-reveal" id="sobre"><div className="sales-about-aside"><span className="sales-overline">03 QUEM ESTÁ POR TRÁS</span><div className="sales-about-mark">EYI<span>.</span></div><span>DESIGN. CÓDIGO. DETALHES.</span></div><div className="sales-about-copy"><h2>Um site bonito é bom.<br/><em>Um site pensado para você é melhor.</em></h2><p>Sou Eric Y. Ikeda, engenheiro de software e desenvolvedor web. Uno design e tecnologia para criar experiências digitais modernas, funcionais e alinhadas à identidade de cada negócio.</p><p>Do WordPress a projetos personalizados, meu objetivo é entregar uma presença online que faça sentido para sua empresa sem soluções genéricas. Atendo negócios de Ibiporã, Londrina e outras regiões, com atendimento online.</p></div></section>
      <section className="sales-section sales-process sales-reveal"><div className="sales-section-heading"><div><span className="sales-overline">04 COMO FUNCIONA</span><h2>Simples do início <em>ao lançamento.</em></h2></div></div><div className="sales-steps">{[['01','Conversa inicial','Entendo seu negócio, objetivos e o que você precisa.'],['02','Proposta e direção','Definimos escopo, identidade visual, prazo e orçamento.'],['03','Criação do site','Desenvolvo a experiência com atenção a cada detalhe.'],['04','Entrega','Revisamos o resultado e preparamos a publicação.']].map(([n,t,d])=><article className="sales-reveal" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section>
      <section className="sales-section sales-faq sales-reveal"><div><span className="sales-overline">05 DÚVIDAS FREQUENTES</span><h2>Antes de <em>começarmos.</em></h2></div><div className="sales-faq-items">{faqs.map(([q,a],i)=><div className="sales-faq-item sales-reveal" key={q}><button onClick={()=>setOpenFaq(openFaq===i?null:i)} aria-expanded={openFaq===i} aria-controls={`sales-faq-answer-${i}`}>{q}<span>{openFaq===i?'−':'+'}</span></button><p id={`sales-faq-answer-${i}`} hidden={openFaq!==i}>{a}</p></div>)}</div></section>
      <section className="sales-contact sales-reveal" id="contato"><div className="sales-contact-inner"><span className="sales-overline">06 VAMOS CONVERSAR?</span><h2>Seu próximo site<br/>começa com <em>uma ideia.</em></h2><p>Conte um pouco sobre seu projeto e vamos encontrar o melhor caminho para colocar sua marca em destaque.</p><a className="sales-button sales-button-light" href={contactUrl || "#contato"} aria-disabled={!contactUrl} onClick={e => { if (!contactUrl) e.preventDefault() }} target={contactUrl?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{(!contactUrl || /wa\.me|api\.whatsapp\.com/.test(contactUrl)) && <span className="sales-whatsapp-badge"><svg className="sales-whatsapp-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.9 11.9 0 0 0 12.05 0C5.49 0 .15 5.34.15 11.9c0 2.1.55 4.14 1.59 5.94L.05 24l6.31-1.66a11.9 11.9 0 0 0 5.69 1.45h.01c6.56 0 11.9-5.34 11.9-11.9a11.83 11.83 0 0 0-3.44-8.41ZM12.06 21.78h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.75.98 1-3.65-.23-.37a9.85 9.85 0 0 1-1.51-5.25c0-5.45 4.44-9.89 9.89-9.89a9.82 9.82 0 0 1 7 2.9 9.83 9.83 0 0 1 2.89 7c0 5.45-4.44 9.88-9.89 9.88Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.09 4.49.71.3 1.27.48 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"/></svg></span>}<span>{!contactUrl || /wa\.me|api\.whatsapp\.com/.test(contactUrl) ? 'Falar no WhatsApp' : 'Conversar sobre meu projeto'}</span></a></div></section>
    </main><footer className="sales-footer"><div className="sales-footer-top"><a className="sales-brand" href="/">EYI<span>.</span><small>DESENVOLVIMENTO WEB</small></a><div><a href="#topo">Voltar ao topo</a><a href="/portfolio">Portfólio</a><a href={contactUrl || "#contato"} onClick={e => { if (!contactUrl) e.preventDefault() }}>Contato</a></div></div><div className="sales-footer-bottom"><span>© {new Date().getFullYear()} Eric Y. Ikeda. Todos os direitos reservados.</span><span>DESENVOLVIDO POR ERIC Y. IKEDA</span></div></footer>
  </div>
}
