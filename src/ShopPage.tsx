import { useEffect, useRef, useState, type ReactNode } from "react"
import { DEFAULT_WHATSAPP } from "./lib/portfolio"
import "./shop.css"

type IconName = "screen" | "layers" | "cart" | "pen" | "whatsapp" | "arrow" | "menu" | "close"
function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    screen: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="1.5" />
        <path d="M8 21h8m-4-4v4" />
      </>
    ),
    layers: (
      <>
        <path d="m12 2 10 5-10 5L2 7l10-5Zm-10 10 10 5 10-5M2 17l10 5 10-5" />
      </>
    ),
    cart: (
      <>
        <path d="M1 2h3l3 14h13l3-10H5" />
        <circle cx="9" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
      </>
    ),
    pen: (
      <>
        <path d="m16 3 5 5M3 21l5-1L22 6l-5-5L3 15v6Z" />
      </>
    ),
    whatsapp: <image href="/shop/whatsapp.svg" width="24" height="24" className="shop-whatsapp-glyph" />,
    arrow: (
      <>
        <path d="M4 12h16m-6-6 6 6-6 6" />
      </>
    ),
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    close: <path d="m5 5 14 14M5 19 19 5" />,
  }
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
const whatsapp = (
  message = "Olá, Eric! Gostaria de conversar sobre a criação de um site em WordPress.",
) => `https://wa.me/${DEFAULT_WHATSAPP}?text=${encodeURIComponent(message)}`
function ContactLink({
  children = "Conversar no WhatsApp",
  dark = false,
}: {
  children?: ReactNode
  dark?: boolean
}) {
  return (
    <a
      className={`shop-button ${
        dark ? "shop-button-dark" : "shop-button-whatsapp"
      }`}
      href={whatsapp()}
      target="_blank"
      rel="noopener noreferrer"
    >
      {!dark && <Icon name="whatsapp" />}
      {children}

    </a>
  )
}
const examples = {
  architecture: {
    name: "EYI", category: "Arquitetura",
    title: "Arquitetura para viver.", action: "Conheça os projetos",
    image: "/shop/architecture.webp", section: "Projetos selecionados",
    items: ["Residencial", "Comercial", "Interiores"],
    description: "Landing page de um estúdio de arquitetura com portfólio e apresentação dos serviços.",
  },
  interior: {
    name: "Lume Interiores", category: "Interiores",
    title: "Seu espaço, com propósito.", action: "Explore os ambientes",
    image: "/shop/interior.webp", section: "Ambientes em destaque",
    items: ["Estar", "Descanso", "Convívio"],
    description: "Landing page editorial de interiores com ambientes e serviços de consultoria.",
  },
  store: {
    name: "Casa Lume", category: "Decoração",
    title: "Detalhes que habitam.", action: "Descubra a coleção",
    image: "/shop/interior.webp", section: "Explore a coleção",
    items: ["Iluminação", "Objetos", "Mobiliário"],
    description: "Landing page de uma coleção de decoração com destaques por categoria.",
  },
  realty: {
    name: "Rua Norte Imóveis", category: "Imobiliária",
    title: "Onde começa sua próxima história?", action: "Buscar imóveis",
    image: "/shop/architecture.webp", section: "Encontre seu imóvel",
    items: ["Comprar", "Alugar", "Agendar visita"],
    description: "Conceito de imobiliária com busca por finalidade e chamada para agendar uma visita.",
  },
  diner: {
    name: "Chapa 43", category: "Lanchonete",
    title: "Burger da casa.", action: "Ver cardápio",
    image: "/shop/chapa-burger.webp", section: "Monte seu pedido",
    items: ["Burgers", "Porções", "Bebidas"],
    description: "Conceito de lanchonete com destaque para o lanche da casa e categorias do cardápio.",
  },
  clinic: {
    name: "Clínica Oliva", category: "Clínica",
    title: "Tempo para cuidar de você.", action: "Escolher horário",
    image: "", section: "Consultas",
    items: ["Especialidades", "Equipe", "Contato"],
    description: "Conceito de clínica com apresentação das especialidades e uma prévia de agendamento.",
  },
}
type Example = keyof typeof examples
function PreviewNav({ kind }: { kind: Example }) {
  if (kind === "realty") return <div className="editorial-nav nav-realty"><b>Rua Norte Imóveis</b><span>Comprar　 Alugar</span></div>
  if (kind === "diner") return <div className="editorial-nav nav-diner"><b>CHAPA 43</b><span>Cardápio　 Pedidos</span></div>
  if (kind === "clinic") return <div className="editorial-nav nav-clinic"><b>Clínica Oliva</b><span>Consultas</span></div>
  if (kind === "interior") {
    return <div className="editorial-nav nav-studio">
      <span>Ambientes</span><b>Lume <i>Interiores</i></b><span>Estúdio</span>
    </div>
  }
  if (kind === "store") {
    return <div className="editorial-nav nav-boutique">
      <Icon name="menu" /><b>Casa Lume</b><span>Coleção</span><Icon name="cart" />
    </div>
  }
  return <div className="editorial-nav nav-architecture">
    <b>EYI</b><span>Projetos</span><span>Estúdio</span><Icon name="menu" />
  </div>
}
function SitePreview({ kind = "architecture", eager = false }: { kind?: Example; eager?: boolean }) {
  const example = examples[kind]
  if (kind === "clinic") {
    return <div className="shop-site-preview editorial-preview oliva-preview" aria-hidden="true">
      <PreviewNav kind={kind} />
      <div className="oliva-intro">
        <div><strong>{example.title}</strong><p>Clínica geral e acompanhamento em cada fase da vida.</p></div>
        <img src="/shop/oliva-clinica.webp" alt="" width="800" height="535" loading="lazy" decoding="async" />
      </div>
      <div className="oliva-schedule">
        <div><small>Especialidade</small><b>Clínica geral</b></div>
        <div><small>Segunda-feira</small><b>09h00 · 14h30</b></div>
        <span>Agendar consulta</span>
      </div>
    </div>
  }
  if (kind === "realty") {
    return <div className="shop-site-preview editorial-preview property-catalog" aria-hidden="true">
      <PreviewNav kind={kind} />
      <div className="property-search">
        <strong>Imóveis em Ibiporã</strong>
        <div><b>Comprar</b><span>Alugar</span></div>
        <p><span>Casa ou apartamento</span><span>Cidade ou bairro</span><b>Buscar</b></p>
      </div>
      <div className="property-results"><b>Imóveis em destaque</b>
        <div>{[
          ["/shop/architecture.webp", "Venda", "Casa com jardim", "3 quartos · 150 m²"],
          ["/shop/interior.webp", "Locação", "Apartamento no Centro", "2 quartos · 72 m²"],
        ].map(([image, purpose, title, details]) => <div className="property-listing" key={title}>
          <img src={image} alt="" loading="lazy" decoding="async" />
          <div><small>{purpose}</small><strong>{title}</strong><span>{details}</span></div>
        </div>)}</div>
      </div>
    </div>
  }
  return (
    <div className={`shop-site-preview editorial-preview editorial-${kind}`} aria-hidden="true">
      <PreviewNav kind={kind} />
      <div className="editorial-cover">
        {example.image && <img src={example.image} alt="" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" />}

        <div className="editorial-copy" key={kind}><strong>{example.title}</strong><span className="editorial-action">{example.action}</span></div>
      </div>
      <div className="editorial-collection"><b>{example.section}</b><div>{example.items.map(item => <span key={item}>{item}</span>)}</div></div>
    </div>
  )
}
function DevicePreview() {
  return (
    <div className="shop-device-scene" aria-hidden="true">
      <div className="shop-device-desktop"><SitePreview eager /></div>
      <div className="shop-device-mobile"><SitePreview /></div>
    </div>
  )
}
const services = [
  {
    title: "Landing pages",
    text: "Páginas estratégicas para apresentar sua ideia, divulgar campanhas e receber novos contatos.",
  },
  {
    title: "Sites institucionais",
    text: "Presença online profissional para apresentar sua empresa, seus serviços e diferenciais.",
  },
  {
    title: "Lojas virtuais",
    text: "E-commerce em WordPress e WooCommerce para vender seus produtos com autonomia.",
  },
]
const concepts: Example[] = ["architecture", "realty", "diner", "interior", "clinic", "store"]
const stages = [
  ["Conversa", "Entendemos sua ideia, seus objetivos e o que seu público precisa encontrar.", "whatsapp"],
  ["Criação", "Desenhamos e desenvolvemos seu site em WordPress com conteúdo e estrutura sob medida.", "screen"],
  ["Entrega", "Você revisa o site, faço os ajustes combinados e entrego o projeto desenvolvido. A publicação fica por sua conta.", "screen"],
] as const
const headlines = [
  ["Um site para ", "o seu negócio", " em Ibiporã."],
  ["Você pode estar ", "perdendo clientes", " por não ter um site."],
  ["Sua marca merece ", "ser encontrada", " online."],
  ["Seu próximo cliente pode ", "chegar pelo site", "."],
]
const introMessages = headlines.map(parts => parts.join(""))

function IntroHeadline() {
  const [frame, setFrame] = useState({ index: 0, length: introMessages[0].length })
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let timer: number
    function restart() {
      window.clearTimeout(timer)
      let index = 0
      let length = introMessages[0].length
      let deleting = true
      setFrame({ index, length })
      if (motion.matches || document.hidden) return
      function tick() {
        length += deleting ? -1 : 1
        setFrame({ index, length })
        let delay = deleting ? 24 : 48
        if (length === 0) {
          index = (index + 1) % introMessages.length
          deleting = false
          delay = 280
        } else if (length === introMessages[index].length) {
          deleting = true
          delay = 3200
        }
        timer = window.setTimeout(tick, delay)
      }
      timer = window.setTimeout(tick, 3200)
    }
    restart()
    motion.addEventListener("change", restart)
    document.addEventListener("visibilitychange", restart)
    return () => {
      window.clearTimeout(timer)
      motion.removeEventListener("change", restart)
      document.removeEventListener("visibilitychange", restart)
    }
  }, [])
  const [before, emphasis, after] = headlines[frame.index]
  return <h1 id="shop-title" className="shop-headline" aria-label={introMessages[0]}>
    {headlines.map(([start, accent, end]) => <span className="shop-headline-size" key={accent} aria-hidden="true">{start}<em>{accent}</em>{end}</span>)}
    <span aria-hidden="true">{before.slice(0, frame.length)}<em>{emphasis.slice(0, Math.max(0, frame.length - before.length))}</em>{after.slice(0, Math.max(0, frame.length - before.length - emphasis.length))}</span>
  </h1>
}

export default function ShopPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selected, setSelected] = useState<Example | null>(null)
  const [slide, setSlide] = useState(0)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const [outgoing, setOutgoing] = useState<Example | null>(null)
  const [direction, setDirection] = useState<"forward" | "back" | undefined>()
  function moveSlide(offset: number) {
    setOutgoing(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? null : concepts[slide])
    setDirection(offset > 0 ? "forward" : "back")
    setSlide(current => (current + offset + concepts.length) % concepts.length)
  }
  const current = concepts[slide]
  const following = concepts[(slide + 1) % concepts.length]
  const main = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!main.current || !("IntersectionObserver" in window)) return
    const sections = main.current.querySelectorAll<HTMLElement>(":scope > section")
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        entry.target.classList.toggle("shop-out-of-view", !entry.isIntersecting)
      }
    }, { rootMargin: "-8% 0px -6% 0px" })
    sections.forEach(section => observer.observe(section))
    return () => {
      observer.disconnect()
      sections.forEach(section => section.classList.remove("shop-out-of-view"))
    }
  }, [])
  const dialog = useRef<HTMLDialogElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (document.querySelector('link[href*="DM+Sans"]')) return
    const font = document.createElement("link")
    font.rel = "stylesheet"
    font.href =
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap"
    document.head.appendChild(font)
    return () => font.remove()
  }, [])
  useEffect(() => {
    if (!menuOpen) return
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false)
        menuButton.current?.focus()
      }
    }
    const outside = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("keydown", dismiss)
    document.addEventListener("pointerdown", outside)
    return () => {
      document.removeEventListener("keydown", dismiss)
      document.removeEventListener("pointerdown", outside)
    }
  }, [menuOpen])
  useEffect(() => {
    if (!selected) return
    dialog.current?.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [selected])
  return (
    <div className="shop-page" id="inicio">
      <header className="shop-header shop-wrap">
        <a
          className="shop-brand"
          href="#inicio"
          aria-label="Eric Y. Ikeda — início"
        >
          <span className="shop-brand-symbol">
            <img
              src="/shop/logo.webp"
              width="110"
              height="110"
              alt=""
              fetchPriority="high"
            />
          </span>
          <span className="shop-brand-name">
            Eric <b>Y.</b> Ikeda
          </span>
        </a>
        <div ref={menu} className="shop-navigation">
          <button
            ref={menuButton}
            className="shop-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="shop-nav"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="shop-menu-lines" aria-hidden="true" />
          </button>
          <nav
            id="shop-nav"
            className={menuOpen ? "is-open" : ""}
            aria-label="Navegação da loja"
          >
            <a href="#inicio" onClick={() => setMenuOpen(false)}>Início</a>
            <a href="#sobre" onClick={() => setMenuOpen(false)}>Sobre</a>
            <a href="#servicos" onClick={() => setMenuOpen(false)}>
              Serviços
            </a>
            <a href="#projetos" onClick={() => setMenuOpen(false)}>
              Projetos
            </a>
            <a href="#contato" onClick={() => setMenuOpen(false)}>
              Contato
            </a>
          </nav>
        </div>
        <div className="shop-header-contact">
          <ContactLink>Fale no WhatsApp</ContactLink>
        </div>
      </header>
      <main ref={main}>
        <section className="shop-hero shop-wrap" aria-labelledby="shop-title">
          <div className="shop-hero-text">
            <IntroHeadline />
            <p className="shop-hero-description">Sou Eric Ikeda, desenvolvedor aqui de Ibiporã. Crio sites em WordPress para seus clientes conhecerem seus serviços e falarem com você pelo WhatsApp.</p>
            <div className="shop-hero-actions">
              <ContactLink dark>Pedir orçamento</ContactLink>
              <a href="#projetos">Ver exemplos de sites</a>
            </div>
          </div>
          <div className="shop-hero-visual">
            <DevicePreview />
          </div>
        </section>
        <section id="sobre" className="shop-split shop-about shop-wrap" aria-labelledby="shop-about-title">
          <h2 id="shop-about-title">Sobre a <em>EYI.</em></h2>
          <div className="shop-letter">
            <p>Sou Eric Ikeda, desenvolvedor de sites em Ibiporã. Pela EYI, crio landing pages, sites institucionais e lojas virtuais em WordPress para profissionais e empresas de Ibiporã, Londrina e região.</p>
            <p>Você conversa diretamente comigo, da primeira ideia à revisão final. Começamos pelo que seu cliente precisa fazer no site, como conhecer um serviço, explorar um catálogo ou pedir um orçamento. A partir disso, organizo o conteúdo, desenho as páginas e desenvolvo o projeto para celular e computador.</p>
            <p className="shop-letter-signature">Eric Y. Ikeda</p>
          </div>
        </section>
        <section id="projetos" className="shop-gallery shop-wrap" aria-labelledby="projects-title" aria-roledescription="carrossel">
          <h2 id="projects-title">Imagine seu negócio <em>aqui.</em></h2>
          <div className="shop-slides" data-direction={direction} onTouchStart={event => {
            const point = event.touches[0]
            touch.current = { x: point.clientX, y: point.clientY }
          }} onTouchCancel={() => { touch.current = null }} onTouchEnd={event => {
            if (!touch.current) return
            const dx = event.changedTouches[0].clientX - touch.current.x
            const dy = event.changedTouches[0].clientY - touch.current.y
            touch.current = null
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) moveSlide(dx < 0 ? 1 : -1)
          }}>
            <button className="shop-feature" onClick={() => setSelected(current)} aria-label={`Explorar conceito de ${examples[current].category}`}><SitePreview key={current} kind={current} />
              {outgoing && <div key={`out-${current}`} className="shop-card-leaving" aria-hidden="true"
                onAnimationEnd={event => { if (event.target === event.currentTarget) setOutgoing(null) }}>
                <SitePreview kind={outgoing} />
              </div>}
            </button>
            <button className="shop-peek" aria-label={`Mostrar conceito de ${examples[following].category}`} onClick={() => moveSlide(1)}><SitePreview key={following} kind={following} /></button>
          </div>
          <div className="shop-gallery-controls">
            <button aria-label="Projeto anterior" onClick={() => moveSlide(-1)}>Anterior</button>
            <span aria-live="polite">Conceito · {examples[current].category}　{slide + 1} / {concepts.length}</span>
            <button aria-label="Próximo projeto" onClick={() => moveSlide(1)}>Próximo</button>
          </div>
        </section>
        <section id="servicos" className="shop-split shop-wrap">
          <h2>Não deixe sua presença digital para <em>depois.</em></h2>
          <ol>{services.map((service, index) => <li key={service.title}>
            <strong>0{index + 1}</strong><div><h3>{service.title}</h3><p>{service.text}</p></div>
          </li>)}</ol>
        </section>
        <section id="processo" className="shop-split shop-wrap">
          <h2>Sua ideia merece <em>sair do papel.</em></h2>
          <ol>{stages.map(([title, text, icon]) => <li key={title}>
            <span className="shop-stage-icon"><Icon name={icon} /></span><div><h3>{title}</h3><p>{text}</p></div>
          </li>)}</ol>
        </section>
        <section
          id="contato"
          className="shop-contact"
          aria-labelledby="contact-title"
        >
          <div className="shop-wrap">
            <span className="shop-blue-rule" />
            <h2 id="contact-title">
              Seu próximo cliente pode estar procurando por você.
            </h2>

            <ContactLink>Vamos criar meu site</ContactLink>
          </div>
        </section>
      </main>
      <footer className="shop-footer shop-wrap">
        <span>Eric Y. Ikeda</span>
        <a href="#inicio">loja.ericyikeda.com.br</a>
      </footer>
      {selected && (
        <dialog
          className="shop-example-dialog"
          ref={dialog}
          aria-labelledby="shop-example-title"
          onCancel={() => setSelected(null)}
          onClose={() => setSelected(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) dialog.current?.close()
          }}
        >
          <div className="shop-example-toolbar">
            <span>Conceito demonstrativo · WordPress</span>
            <button
              onClick={() => dialog.current?.close()}
              aria-label="Fechar prévia"
            >
              <Icon name="close" />
            </button>
          </div>
          <SitePreview kind={selected} />
          <div className="shop-example-description">
            <h2 id="shop-example-title">{examples[selected].name}</h2>
            <p>
              {examples[selected].description} Uma referência visual para
              inspirar seu projeto; não representa um cliente real ou um site já
              publicado.
            </p>
            <a
              className="shop-button shop-button-dark"
              target="_blank"
              rel="noopener noreferrer"
              href={whatsapp(
                `Olá, Eric! Gostei do conceito ${examples[selected].name} e gostaria de um orçamento para meu site.`,
              )}
            >
              Quero um site assim
            </a>
          </div>
        </dialog>
      )}
    </div>
  )
}
