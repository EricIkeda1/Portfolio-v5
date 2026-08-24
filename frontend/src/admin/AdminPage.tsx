import { useMemo, useState } from 'react'
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react'
import { DEFAULT_CONTENT, type PortfolioProject } from '@/lib/portfolio'

const DEMO_EMAIL = 'admin@portfolio.dev'
const DEMO_PASSWORD = 'admin123'
const logoSrc =
  'https://drive.google.com/thumbnail?id=19o0-cXysNK5HsufGJJSZThSlPpuury__&sz=w1000'

type IconName =
  | 'dashboard'
  | 'profile'
  | 'projects'
  | 'contact'
  | 'settings'
  | 'logout'
  | 'eye'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'save'
  | 'external'
  | 'menu'
  | 'close'

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  const paths: Record<IconName, ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4.5 21c.8-4.2 3.3-6.3 7.5-6.3s6.7 2.1 7.5 6.3"/></>,
    projects: <><path d="M4 7.5h6l1.7 2H20v9.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M4 7.5V5a2 2 0 0 1 2-2h4l1.5 2H18a2 2 0 0 1 2 2v2.5"/></>,
    contact: <><path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2H10V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/></>,
    logout: <><path d="M10 5H5v14h5"/><path d="M14 8l4 4-4 4"/><path d="M18 12H9"/></>,
    eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    edit: <><path d="M4 20h4l11-11-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></>,
    trash: <><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M7 7l1 13h8l1-13"/><path d="M10 11v5M14 11v5"/></>,
    save: <><path d="M5 3h12l2 2v16H5z"/><path d="M8 3v6h8V3"/><path d="M8 21v-7h8v7"/></>,
    external: <><path d="M14 4h6v6"/><path d="m20 4-9 9"/><path d="M18 13v6H5V6h6"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  }

  return <svg {...props}>{paths[name]}</svg>
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (email.trim() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      sessionStorage.setItem('portfolio-admin-demo', 'true')
      setError('')
      onLogin()
      return
    }
    setError('Use as credenciais fictícias exibidas abaixo.')
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-glow" />
      <a className="admin-login-back" href="/">← Voltar ao portfólio</a>

      <main className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-brand-mark">
          <img src={logoSrc} alt="Eric Y. Ikeda" referrerPolicy="no-referrer" />
          <span>ERIC Y. IKEDA</span>
        </div>

        <div className="admin-login-copy">
          <div className="section-label">Área restrita</div>
          <h1 id="admin-login-title">Painel <span>Admin</span></h1>
          <p>Interface demonstrativa para gerenciamento visual do conteúdo do portfólio.</p>
        </div>

        <form className="admin-login-form" onSubmit={submit}>
          <label>
            <span>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              placeholder="admin@portfolio.dev"
            />
          </label>

          <label>
            <span>Senha</span>
            <div className="admin-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Mostrar ou ocultar senha">
                <Icon name="eye" size={17} />
              </button>
            </div>
          </label>

          {error && <div className="admin-login-error">{error}</div>}

          <button className="admin-login-submit" type="submit">Entrar no painel <span>→</span></button>
        </form>

        <div className="admin-demo-credentials">
          <div>
            <span>LOGIN FICTÍCIO</span>
            <strong>{DEMO_EMAIL}</strong>
          </div>
          <div>
            <span>SENHA FICTÍCIA</span>
            <strong>{DEMO_PASSWORD}</strong>
          </div>
        </div>

        <p className="admin-demo-note">Demonstração visual — nenhuma informação é enviada para servidor ou banco de dados.</p>
      </main>
    </div>
  )
}

const navigation = [
  { id: 'overview', label: 'Visão geral', icon: 'dashboard' as IconName },
  { id: 'profile', label: 'Quem sou eu', icon: 'profile' as IconName },
  { id: 'projects', label: 'Projetos', icon: 'projects' as IconName },
  { id: 'contact', label: 'Contato', icon: 'contact' as IconName },
  { id: 'settings', label: 'Configurações', icon: 'settings' as IconName },
]

function Overview({ projects, onNavigate }: { projects: PortfolioProject[]; onNavigate: (tab: string) => void }) {
  const cards = [
    { label: 'Projetos publicados', value: projects.length.toString().padStart(2, '0'), helper: 'No portfólio', icon: 'projects' as IconName },
    { label: 'Seções editáveis', value: '04', helper: 'Conteúdo principal', icon: 'edit' as IconName },
    { label: 'Status do site', value: 'ON', helper: 'Portfólio online', icon: 'external' as IconName },
  ]

  return (
    <>
      <div className="admin-dashboard-heading">
        <div>
          <span className="admin-eyebrow">Dashboard</span>
          <h1>Visão geral</h1>
          <p>Gerencie os principais conteúdos do seu portfólio em um só lugar.</p>
        </div>
        <a href="/" className="admin-outline-action" target="_blank" rel="noreferrer"><Icon name="eye" size={16}/> Ver portfólio</a>
      </div>

      <div className="admin-stat-grid">
        {cards.map((card) => (
          <article className="admin-stat-card" key={card.label}>
            <div className="admin-stat-top"><span>{card.label}</span><Icon name={card.icon} size={18}/></div>
            <strong>{card.value}</strong>
            <small>{card.helper}</small>
          </article>
        ))}
      </div>

      <div className="admin-overview-grid">
        <section className="admin-panel-card admin-quick-card">
          <div className="admin-panel-title"><div><span>ATALHOS</span><h2>Edição rápida</h2></div></div>
          <div className="admin-quick-list">
            <button onClick={() => onNavigate('profile')}><span className="admin-quick-icon"><Icon name="profile"/></span><span><strong>Quem sou eu</strong><small>Edite sua apresentação e imagem</small></span><b>→</b></button>
            <button onClick={() => onNavigate('projects')}><span className="admin-quick-icon"><Icon name="projects"/></span><span><strong>Projetos em destaque</strong><small>Adicione, edite ou organize projetos</small></span><b>→</b></button>
            <button onClick={() => onNavigate('contact')}><span className="admin-quick-icon"><Icon name="contact"/></span><span><strong>Informações de contato</strong><small>WhatsApp, e-mail e GitHub</small></span><b>→</b></button>
          </div>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-title"><div><span>ÚLTIMOS PROJETOS</span><h2>Conteúdo atual</h2></div><button onClick={() => onNavigate('projects')}>Ver todos</button></div>
          <div className="admin-mini-projects">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id}>
                <span className="admin-mini-project-index">{String(project.sort_order).padStart(2, '0')}</span>
                <div><strong>{project.name}</strong><small>{project.type}</small></div>
                <span className="admin-status-dot">Publicado</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

function ProfileEditor() {
  const [about, setAbout] = useState(DEFAULT_CONTENT.about_text)
  const [imageUrl, setImageUrl] = useState('https://drive.google.com/thumbnail?id=18I4wMhuprbKT0OLBLvAvz12yAoPNQSNc&sz=w1000')
  const [saved, setSaved] = useState(false)

  return (
    <>
      <PageHeading title="Quem sou eu" description="Edite as informações exibidas na seção de apresentação do portfólio." />
      {saved && <div className="admin-toast-demo">Alterações simuladas com sucesso.</div>}
      <section className="admin-panel-card admin-editor-card">
        <div className="admin-panel-title"><div><span>APRESENTAÇÃO</span><h2>Conteúdo da seção</h2></div></div>
        <div className="admin-editor-layout">
          <div className="admin-form-stack">
            <label><span>Imagem de perfil</span><input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} /><small>Cole aqui uma URL de imagem pública.</small></label>
            <label><span>Texto “Quem sou eu”</span><textarea rows={13} value={about} onChange={(e) => setAbout(e.target.value)} /></label>
            <div className="admin-form-row">
              <button className="admin-primary-action" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2200) }}><Icon name="save" size={16}/> Salvar alterações</button>
              <button className="admin-ghost-action" onClick={() => setAbout(DEFAULT_CONTENT.about_text)}>Restaurar texto</button>
            </div>
          </div>
          <div className="admin-profile-preview">
            <span>PRÉ-VISUALIZAÇÃO</span>
            <div className="admin-profile-photo-wrap"><img src={imageUrl} alt="Pré-visualização do perfil" referrerPolicy="no-referrer" /></div>
            <h3>Quem sou <b>eu</b></h3>
            <p>{about.split(/\n\s*\n/)[0]}</p>
          </div>
        </div>
      </section>
    </>
  )
}

function ProjectsEditor({ projects, setProjects }: { projects: PortfolioProject[]; setProjects: Dispatch<SetStateAction<PortfolioProject[]>> }) {
  const removeProject = (id: number) => setProjects((items) => items.filter((item) => item.id !== id))
  const addProject = () => {
    const next = Math.max(0, ...projects.map((project) => project.id)) + 1
    setProjects((items) => [...items, { id: next, name: 'Novo projeto', type: 'Projeto', description: 'Descrição do novo projeto.', tags: ['React'], highlights: ['Novo projeto'], github: '#', color: '#4285FF', image_url: null, sort_order: items.length + 1 }])
  }

  return (
    <>
      <PageHeading title="Projetos" description="Organize os projetos que aparecem em destaque no seu portfólio." action={<button className="admin-primary-action" onClick={addProject}><Icon name="plus" size={16}/> Novo projeto</button>} />
      <section className="admin-panel-card">
        <div className="admin-panel-title"><div><span>PORTFÓLIO</span><h2>Projetos em destaque</h2></div><span className="admin-pill-count">{projects.length} itens</span></div>
        <div className="admin-project-table">
          {projects.map((project) => (
            <article key={project.id} className="admin-project-row">
              <div className="admin-project-number">{String(project.sort_order).padStart(2, '0')}</div>
              <div className="admin-project-color" style={{ background: project.color }} />
              <div className="admin-project-row-copy"><strong>{project.name}</strong><span>{project.type}</span><p>{project.description}</p></div>
              <div className="admin-project-tags">{project.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div>
              <div className="admin-row-actions">
                <button aria-label={`Editar ${project.name}`}><Icon name="edit" size={16}/></button>
                <button className="danger" aria-label={`Excluir ${project.name}`} onClick={() => removeProject(project.id)}><Icon name="trash" size={16}/></button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function ContactEditor() {
  const [form, setForm] = useState({ whatsapp: '+55 (43) 99636-9387', email: 'ikedayuji.2002@gmail.com', github: 'https://github.com/EricIkeda1' })
  const [saved, setSaved] = useState(false)
  return (
    <>
      <PageHeading title="Contato" description="Atualize os canais de contato apresentados aos visitantes do portfólio." />
      {saved && <div className="admin-toast-demo">Contato atualizado apenas nesta demonstração.</div>}
      <section className="admin-panel-card admin-editor-card">
        <div className="admin-panel-title"><div><span>CANAIS</span><h2>Informações públicas</h2></div></div>
        <div className="admin-form-stack narrow">
          <label><span>WhatsApp</span><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}/></label>
          <label><span>E-mail</span><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></label>
          <label><span>GitHub</span><input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })}/></label>
          <div className="admin-form-row"><button className="admin-primary-action" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2200) }}><Icon name="save" size={16}/> Salvar alterações</button></div>
        </div>
      </section>
    </>
  )
}

function SettingsPanel() {
  return (
    <>
      <PageHeading title="Configurações" description="Preferências visuais da interface administrativa fictícia." />
      <div className="admin-settings-grid">
        <section className="admin-panel-card">
          <div className="admin-panel-title"><div><span>APARÊNCIA</span><h2>Identidade visual</h2></div></div>
          <div className="admin-setting-item"><div><strong>Cor principal</strong><small>Usada em botões e destaques.</small></div><div className="admin-color-demo"><span/><code>#4285FF</code></div></div>
          <div className="admin-setting-item"><div><strong>Tema</strong><small>Segue o mesmo visual do portfólio.</small></div><span className="admin-setting-badge">Escuro</span></div>
        </section>
        <section className="admin-panel-card">
          <div className="admin-panel-title"><div><span>DEMONSTRAÇÃO</span><h2>Sobre este painel</h2></div></div>
          <p className="admin-setting-description">Este painel foi criado apenas como interface. Os botões e formulários simulam a experiência de administração, sem conexão com banco de dados ou autenticação real.</p>
        </section>
      </div>
    </>
  )
}

function PageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="admin-dashboard-heading"><div><span className="admin-eyebrow">Administrador</span><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState('overview')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [projects, setProjects] = useState(DEFAULT_CONTENT.projects)
  const currentLabel = useMemo(() => navigation.find((item) => item.id === active)?.label ?? 'Visão geral', [active])

  const navigate = (tab: string) => {
    setActive(tab)
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const logout = () => {
    sessionStorage.removeItem('portfolio-admin-demo')
    onLogout()
  }

  return (
    <div className="admin-app-shell">
      <aside className={`admin-sidebar ${mobileMenu ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <img src={logoSrc} alt="Eric Y. Ikeda" referrerPolicy="no-referrer" />
          <div><strong>ERIC Y. IKEDA</strong><span>ADMIN PANEL</span></div>
          <button className="admin-sidebar-close" onClick={() => setMobileMenu(false)}><Icon name="close"/></button>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Menu administrativo">
          <span className="admin-nav-caption">MENU PRINCIPAL</span>
          {navigation.map((item) => (
            <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
              <Icon name={item.icon} size={18}/><span>{item.label}</span>{active === item.id && <i/>}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" target="_blank" rel="noreferrer"><Icon name="external" size={17}/><span>Ver portfólio</span></a>
          <button onClick={logout}><Icon name="logout" size={17}/><span>Sair</span></button>
          <div className="admin-user-chip"><span>EI</span><div><strong>Eric Ikeda</strong><small>Administrador</small></div></div>
        </div>
      </aside>

      {mobileMenu && <button className="admin-sidebar-overlay" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}

      <div className="admin-main-area">
        <header className="admin-topbar">
          <button className="admin-mobile-menu" onClick={() => setMobileMenu(true)}><Icon name="menu"/></button>
          <div><span>Painel administrativo</span><strong>{currentLabel}</strong></div>
          <div className="admin-topbar-status"><span/><em>Sistema fictício</em></div>
        </header>

        <main className="admin-dashboard-content">
          {active === 'overview' && <Overview projects={projects} onNavigate={navigate} />}
          {active === 'profile' && <ProfileEditor />}
          {active === 'projects' && <ProjectsEditor projects={projects} setProjects={setProjects} />}
          {active === 'contact' && <ContactEditor />}
          {active === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('portfolio-admin-demo') === 'true')
  return authenticated ? <Dashboard onLogout={() => setAuthenticated(false)} /> : <LoginScreen onLogin={() => setAuthenticated(true)} />
}
