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
    whatsapp: (
      <>
        <path d="M21 11.5A9 9 0 0 1 7.6 19.4L2 21l1.6-5.5A9 9 0 1 1 21 11.5Z" />
        <path d="M8 7c-2 3 3 8 6 8l2-2-3-1-1 1-2-2 1-1-1-3H8Z" />
      </>
    ),
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
      {dark && <Icon name="arrow" />}
    </a>
  )
}
const examples = {
  architecture: {
    name: "EYI", category: "Arquitetura", nav: "Projetos　 Estúdio",
    title: "Arquitetura para viver.", action: "Conheça os projetos",
    image: "/shop/architecture.webp", section: "Projetos selecionados",
    items: ["Residencial", "Comercial", "Interiores"],
    description: "Landing page de um estúdio de arquitetura com portfólio e apresentação dos serviços.",
  },
  interior: {
    name: "Lume Interiores", category: "Interiores", nav: "Ambientes　 Sobre",
    title: "Seu espaço, com propósito.", action: "Explore os ambientes",
    image: "/shop/interior.webp", section: "Ambientes em destaque",
    items: ["Estar", "Descanso", "Convívio"],
    description: "Landing page editorial de interiores com ambientes e serviços de consultoria.",
  },
  store: {
    name: "Casa Lume", category: "Decoração", nav: "Coleção　 Sobre",
    title: "Detalhes que habitam.", action: "Descubra a coleção",
    image: "/shop/interior.webp", section: "Explore a coleção",
    items: ["Iluminação", "Objetos", "Mobiliário"],
    description: "Landing page de uma coleção de decoração com destaques por categoria.",
  },
}
type Example = keyof typeof examples
function SitePreview({ kind = "architecture", eager = false }: { kind?: Example; eager?: boolean }) {
  const example = examples[kind]
  return (
    <div className={`shop-site-preview editorial-preview editorial-${kind}`} aria-hidden="true">
      <div className="editorial-nav"><b>{example.name}</b><span>{example.nav}　 Contato</span></div>
      <div className="editorial-cover">
        <img src={example.image} alt="" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" />
        <div className="editorial-copy"><strong>{example.title}</strong><span className="editorial-action">{example.action}{kind === "architecture" && " ↗"}{kind === "store" && <i aria-hidden="true">→</i>}</span></div>
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
const concepts: Example[] = ["architecture", "interior", "store"]
const stages = [
  ["Conversa", "Entendemos sua ideia, seus objetivos e o que seu público precisa encontrar.", "whatsapp"],
  ["Criação", "Desenhamos e desenvolvemos seu site em WordPress com conteúdo e estrutura sob medida.", "screen"],
  ["Publicação", "Revisamos juntos e colocamos o site no ar para seus clientes conhecerem seu trabalho.", "arrow"],
] as const
export default function ShopPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selected, setSelected] = useState<Example | null>(null)
  const [slide, setSlide] = useState(0)
  const touch = useRef<{ x: number; y: number } | null>(null)
  function moveSlide(offset: number) {
    setSlide(current => (current + offset + concepts.length) % concepts.length)
  }
  const current = concepts[slide]
  const following = concepts[(slide + 1) % concepts.length]
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
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
          <nav
            id="shop-nav"
            className={menuOpen ? "is-open" : ""}
            aria-label="Navegação da loja"
          >
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
      <main>
        <section className="shop-hero shop-wrap" aria-labelledby="shop-title">
          <div className="shop-hero-text">
            <h1 id="shop-title">Você pode estar <em>perdendo clientes</em> por não ter um site.</h1>
            <p className="shop-hero-description">Quem procura seu negócio precisa encontrar motivos para confiar. Mostre seus serviços e facilite o contato com um site profissional.</p>
            <div className="shop-hero-actions">
              <ContactLink dark>Quero meu site</ContactLink>
              <a href="#projetos">Ver exemplos</a>
            </div>
          </div>
          <div className="shop-hero-visual">
            <DevicePreview />
          </div>
        </section>
        <section id="projetos" className="shop-gallery shop-wrap" aria-labelledby="projects-title" aria-roledescription="carrossel">
          <h2 id="projects-title">Imagine seu negócio <em>aqui.</em></h2>
          <div className="shop-slides" onTouchStart={event => {
            const point = event.touches[0]
            touch.current = { x: point.clientX, y: point.clientY }
          }} onTouchCancel={() => { touch.current = null }} onTouchEnd={event => {
            if (!touch.current) return
            const dx = event.changedTouches[0].clientX - touch.current.x
            const dy = event.changedTouches[0].clientY - touch.current.y
            touch.current = null
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) moveSlide(dx < 0 ? 1 : -1)
          }}>
            <button className="shop-feature" onClick={() => setSelected(current)} aria-label={`Explorar conceito de ${examples[current].category}`}><SitePreview kind={current} /></button>
            <button className="shop-peek" aria-label={`Mostrar conceito de ${examples[following].category}`} onClick={() => moveSlide(1)}><SitePreview kind={following} /></button>
          </div>
          <div className="shop-gallery-controls">
            <button aria-label="Projeto anterior" onClick={() => moveSlide(-1)}>←</button>
            <span aria-live="polite">Conceito · {examples[current].category}　{slide + 1} / {concepts.length}</span>
            <button aria-label="Próximo projeto" onClick={() => moveSlide(1)}>→</button>
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
        <a href="https://www.ericyikeda.com.br/">Eric Y. Ikeda</a>
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
              Quero um site assim <Icon name="arrow" />
            </a>
          </div>
        </dialog>
      )}
    </div>
  )
}
