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
    name: "EYI",
    title: "Arquitetura contemporânea para a vida real.",
    description:
      "Um conceito de site institucional que valoriza espaços, projetos e a identidade de um escritório de arquitetura.",
    image: "/shop/project-eyi.webp",
  },
  interior: {
    name: "Lume Interiores",
    title: "Design de interiores com propósito.",
    description:
      "Um conceito editorial para apresentar ambientes, serviços e uma experiência acolhedora em cada detalhe.",
    image: "/shop/project-lume.webp",
  },
}
type Example = keyof typeof examples
function SitePreview({
  kind = "architecture",
  small = false,
}: {
  kind?: Example
  small?: boolean
}) {
  const example = examples[kind]
  return (
    <div
      className={`shop-site-preview shop-site-${kind} ${
        small ? "shop-site-small" : ""
      }`}
      aria-hidden="true"
    >
      <img
        src={example.image}
        alt=""
        width="1400"
        height="934"
        loading={small ? "lazy" : "eager"}
        fetchPriority={small ? "auto" : "high"}
      />

    </div>
  )
}
const services: { image: string; title: string; text: string }[] = [
  {
    image: "service-landing",
    title: "Landing pages",
    text: "Páginas estratégicas para apresentar sua ideia, divulgar campanhas e receber novos contatos.",
  },
  {
    image: "service-institutional",
    title: "Sites institucionais",
    text: "Presença online profissional para apresentar sua empresa, seus serviços e diferenciais.",
  },
  {
    image: "service-store",
    title: "Lojas virtuais",
    text: "E-commerce em WordPress e WooCommerce para vender seus produtos com autonomia.",
  },
]
const benefits: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "screen",
    title: "Responsivo",
    text: "Uma experiência pensada para computador, tablet e celular.",
  },
  {
    icon: "pen",
    title: "Fácil de atualizar",
    text: "Você mesmo pode manter os conteúdos do seu site.",
  },
  {
    icon: "whatsapp",
    title: "Conectado ao WhatsApp",
    text: "Seus clientes falam com você de forma rápida e prática.",
  },
]
const steps = [
  [
    "Conversa",
    "Entendemos a sua ideia, os objetivos e as necessidades do projeto.",
  ],
  ["Design", "Definimos a estrutura, o conteúdo e o visual do site com você."],
  [
    "Desenvolvimento",
    "Criamos o seu site em WordPress, com atenção aos detalhes.",
  ],
  [
    "Publicação",
    "Você confere o resultado e, após os ajustes, o site vai ao ar.",
  ],
]
const faqs = [
  [
    "O site funciona no celular?",
    "Sim. O layout é adaptado para celulares, tablets e computadores, com uma experiência pensada para cada tela.",
  ],
  [
    "Posso atualizar o conteúdo?",
    "Sim. O WordPress permite editar textos e imagens pelo painel. Na entrega, você recebe orientação para cuidar dos conteúdos combinados no projeto.",
  ],
  [
    "Como funciona o orçamento?",
    "Primeiro conversamos sobre sua ideia, o número de páginas e os recursos necessários. Depois, você recebe uma proposta com escopo, prazo e valor antes de começar.",
  ],
  [
    "O que está incluído no projeto?",
    "O escopo é definido na proposta: design responsivo, desenvolvimento, ajustes e orientação de uso. Domínio, hospedagem, licenças e manutenção são alinhados separadamente, sem surpresas.",
  ],
]
export default function ShopPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selected, setSelected] = useState<Example | null>(null)
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
            <a href="#processo" onClick={() => setMenuOpen(false)}>
              Como funciona
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
            <p className="shop-eyebrow">
              Design + WordPress <span />
            </p>
            <h1 id="shop-title">Sites que<br /> valorizam o<br /> seu <em>negócio.</em></h1>
            <p className="shop-hero-description">Uma presença digital bonita,<br /> intuitiva e feita para você.</p>
            <div className="shop-hero-actions">
              <ContactLink dark>Começar meu projeto</ContactLink>
              <a href="#projetos">Ver projetos</a>
            </div>
          </div>
          <div className="shop-hero-visual">
            <img src="/shop/hero-eyi.webp" width="404" height="300" fetchPriority="high" alt="Site EYI em telas de computador e celular" />
          </div>
        </section>
        <section
          id="servicos"
          className="shop-services shop-wrap"
          aria-labelledby="services-title"
        >
          <h2 id="services-title">
            Sua ideia. A <em>experiência</em> certa.
          </h2>
          <div className="shop-service-grid">
            {services.map((service) => (
              <article key={service.title}>
                <img src={`/shop/${service.image}.webp`} alt="" width="194" height="125" loading="lazy" />
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          id="projetos"
          className="shop-projects shop-wrap"
          aria-labelledby="projects-title"
        >
          <div className="shop-section-heading">
            <h2 id="projects-title">Design que faz a <em>diferença.</em></h2>

          </div>
          <div className="shop-project-grid">
            {(Object.keys(examples) as Example[]).map((kind) => (
              <button
                key={kind}
                className="shop-project"
                onClick={() => setSelected(kind)}
                aria-label={`Explorar conceito ${examples[kind].name}`}
              >
                <SitePreview kind={kind} small />
                <span className="shop-project-caption">
                  Conceito de site · {kind === "architecture" ? "Arquitetura" : "Interiores"}
                  <span>
                    Explorar conceito <Icon name="arrow" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section
          className="shop-benefits shop-wrap"
          aria-labelledby="benefits-title"
        >
          <img className="shop-benefit-art" src="/shop/devices-eyi.webp" width="350" height="211" loading="lazy" alt="" />
          <div className="shop-benefit-list">
            <h2 id="benefits-title">Bonito por fora.<br /><em>Simples de usar.</em></h2>
            {benefits.map((benefit) => (
              <article key={benefit.title}>
                <Icon name={benefit.icon} />
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="processo" className="shop-process" aria-labelledby="process-title">
          <div className="shop-wrap">
            <span className="shop-blue-rule" />
            <h2 id="process-title">
              Um processo simples. Do início ao site no ar.
            </h2>
            <ol>
              {steps.map(([title, text], index) => (
                <li key={title}>
                  <span className="shop-step-number">0{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="shop-faq shop-wrap" aria-labelledby="faq-title">
          <div>
            <span className="shop-blue-rule" />
            <h2 id="faq-title">
              Vamos esclarecer suas dúvidas.
            </h2>
          </div>
          <div>
            {faqs.map(([question, answer]) => (
              <details key={question} name="shop-faq">
                <summary>
                  {question}
                  <span aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section
          id="contato"
          className="shop-contact"
          aria-labelledby="contact-title"
        >
          <div className="shop-wrap">
            <span className="shop-blue-rule" />
            <h2 id="contact-title">
              Vamos criar algo que<br /> tenha a sua cara?
            </h2>

            <ContactLink />
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
