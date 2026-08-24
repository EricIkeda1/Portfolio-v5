import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  adminLogin,
  adminLogout,
  adminSession,
  announcePortfolioUpdate,
  createAdminProject,
  deleteAdminProject,
  getAdminContent,
  updateAdminContent,
  updateAdminProject,
} from '@/lib/api'
import { DEFAULT_CONTENT, type PortfolioContent, type PortfolioProject } from '@/lib/portfolio'
import ProtectedLogo from '@/components/ProtectedLogo'

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

type Notice = { type: 'success' | 'error'; text: string } | null

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
  const [email, setEmail] = useState('admin@portfolio.dev')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await adminLogin(email, password)
      onLogin()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível entrar no painel.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-glow" />
      <a className="admin-login-back" href="/">← Voltar ao portfólio</a>
      <main className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-brand-mark">
          <ProtectedLogo alt="Eric Y. Ikeda" />
          <span>ERIC Y. IKEDA</span>
        </div>
        <div className="admin-login-copy">
          <div className="section-label">Área restrita</div>
          <h1 id="admin-login-title">Painel <span>Admin</span></h1>
          <p>Gerencie o conteúdo publicado diretamente no seu portfólio.</p>
        </div>
        <form className="admin-login-form" onSubmit={submit}>
          <label>
            <span>E-mail</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" />
          </label>
          <label>
            <span>Senha</span>
            <div className="admin-password-field">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Mostrar ou ocultar senha"><Icon name="eye" size={17} /></button>
            </div>
          </label>
          {error && <div className="admin-login-error">{error}</div>}
          <button className="admin-login-submit" type="submit" disabled={submitting}>{submitting ? 'Entrando...' : 'Entrar no painel'} <span>→</span></button>
        </form>
        <p className="admin-demo-note">Autenticação protegida no backend. A conexão com o Neon nunca é enviada ao navegador.</p>
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

function PageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="admin-dashboard-heading"><div><span className="admin-eyebrow">Administrador</span><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

function NoticeBox({ notice }: { notice: Notice }) {
  if (!notice) return null
  return <div className={notice.type === 'error' ? 'admin-toast-demo admin-toast-error' : 'admin-toast-demo'}>{notice.text}</div>
}

function Overview({ content, onNavigate }: { content: PortfolioContent; onNavigate: (tab: string) => void }) {
  const published = content.projects.filter((project) => project.published !== false)
  const cards = [
    { label: 'Projetos publicados', value: published.length.toString().padStart(2, '0'), helper: 'Vindos do Neon', icon: 'projects' as IconName },
    { label: 'Seções conectadas', value: '03', helper: 'Perfil, projetos e contato', icon: 'edit' as IconName },
    { label: 'Status do banco', value: 'ON', helper: 'Conteúdo dinâmico', icon: 'external' as IconName },
  ]

  return (
    <>
      <div className="admin-dashboard-heading">
        <div><span className="admin-eyebrow">Dashboard</span><h1>Visão geral</h1><p>O que você salvar aqui passa a ser lido pelo portfólio público.</p></div>
        <a href="/" className="admin-outline-action" target="_blank" rel="noreferrer"><Icon name="eye" size={16}/> Ver portfólio</a>
      </div>
      <div className="admin-stat-grid">
        {cards.map((card) => <article className="admin-stat-card" key={card.label}><div className="admin-stat-top"><span>{card.label}</span><Icon name={card.icon} size={18}/></div><strong>{card.value}</strong><small>{card.helper}</small></article>)}
      </div>
      <div className="admin-overview-grid">
        <section className="admin-panel-card admin-quick-card">
          <div className="admin-panel-title"><div><span>ATALHOS</span><h2>Edição rápida</h2></div></div>
          <div className="admin-quick-list">
            <button onClick={() => onNavigate('profile')}><span className="admin-quick-icon"><Icon name="profile"/></span><span><strong>Quem sou eu</strong><small>Texto e imagem do perfil</small></span><b>→</b></button>
            <button onClick={() => onNavigate('projects')}><span className="admin-quick-icon"><Icon name="projects"/></span><span><strong>Projetos em destaque</strong><small>Adicionar, editar e excluir</small></span><b>→</b></button>
            <button onClick={() => onNavigate('contact')}><span className="admin-quick-icon"><Icon name="contact"/></span><span><strong>Informações de contato</strong><small>WhatsApp, e-mail e GitHub</small></span><b>→</b></button>
          </div>
        </section>
        <section className="admin-panel-card">
          <div className="admin-panel-title"><div><span>ÚLTIMOS PROJETOS</span><h2>Conteúdo atual</h2></div><button onClick={() => onNavigate('projects')}>Ver todos</button></div>
          <div className="admin-mini-projects">
            {content.projects.slice(0, 3).map((project) => <div key={project.id}><span className="admin-mini-project-index">{String(project.sort_order).padStart(2, '0')}</span><div><strong>{project.name}</strong><small>{project.type}</small></div><span className="admin-status-dot">{project.published === false ? 'Oculto' : 'Publicado'}</span></div>)}
          </div>
        </section>
      </div>
    </>
  )
}

function ProfileEditor({ content, onUpdated }: { content: PortfolioContent; onUpdated: (next: PortfolioContent) => void }) {
  const [about, setAbout] = useState(content.about_text)
  const [imageUrl, setImageUrl] = useState(content.profile_image_url)
  const [notice, setNotice] = useState<Notice>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setAbout(content.about_text); setImageUrl(content.profile_image_url) }, [content.about_text, content.profile_image_url])

  const save = async () => {
    setSaving(true); setNotice(null)
    try {
      const next = await updateAdminContent({ about_text: about, profile_image_url: imageUrl, whatsapp: content.whatsapp, email: content.email, github: content.github })
      onUpdated(next); announcePortfolioUpdate(); setNotice({ type: 'success', text: 'Perfil salvo no Neon e publicado no portfólio.' })
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Erro ao salvar perfil.' })
    } finally { setSaving(false) }
  }

  return (
    <>
      <PageHeading title="Quem sou eu" description="Edite o texto e a foto exibidos na seção de apresentação." />
      <NoticeBox notice={notice} />
      <section className="admin-panel-card admin-editor-card">
        <div className="admin-panel-title"><div><span>APRESENTAÇÃO</span><h2>Conteúdo da seção</h2></div></div>
        <div className="admin-editor-layout">
          <div className="admin-form-stack">
            <label><span>Imagem de perfil</span><input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} /><small>Use uma URL pública, inclusive link direto do Google Drive.</small></label>
            <label><span>Texto “Quem sou eu”</span><textarea rows={13} value={about} onChange={(e) => setAbout(e.target.value)} /></label>
            <div className="admin-form-row">
              <button className="admin-primary-action" onClick={() => void save()} disabled={saving}><Icon name="save" size={16}/> {saving ? 'Salvando...' : 'Salvar e publicar'}</button>
              <button className="admin-ghost-action" onClick={() => setAbout(DEFAULT_CONTENT.about_text)}>Restaurar texto padrão</button>
            </div>
          </div>
          <div className="admin-profile-preview"><span>PRÉ-VISUALIZAÇÃO</span><div className="admin-profile-photo-wrap"><img src={imageUrl} alt="Pré-visualização do perfil" referrerPolicy="no-referrer" /></div><h3>Quem sou <b>eu</b></h3><p>{about.split(/\n\s*\n/)[0]}</p></div>
        </div>
      </section>
    </>
  )
}

const EMPTY_PROJECT: Omit<PortfolioProject, 'id'> = {
  name: '', type: '', description: '', tags: [], highlights: [], github: '', color: '#4285FF', image_url: null, sort_order: 1, published: true,
}

function ProjectsEditor({ projects, onProjectsChange }: { projects: PortfolioProject[]; onProjectsChange: (projects: PortfolioProject[]) => void }) {
  const [editing, setEditing] = useState<PortfolioProject | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState<Omit<PortfolioProject, 'id'>>(EMPTY_PROJECT)
  const [notice, setNotice] = useState<Notice>(null)
  const [saving, setSaving] = useState(false)

  const openNew = () => {
    setEditing(null); setCreating(true); setNotice(null)
    setDraft({ ...EMPTY_PROJECT, sort_order: Math.max(0, ...projects.map((p) => p.sort_order)) + 1 })
  }

  const openEdit = (project: PortfolioProject) => {
    setCreating(false); setEditing(project); setNotice(null)
    setDraft({ name: project.name, type: project.type, description: project.description, tags: [...project.tags], highlights: [...project.highlights], github: project.github, color: project.color, image_url: project.image_url ?? null, sort_order: project.sort_order, published: project.published !== false })
  }

  const closeForm = () => { setCreating(false); setEditing(null) }

  const saveProject = async () => {
    setSaving(true); setNotice(null)
    try {
      const saved = editing ? await updateAdminProject({ id: editing.id, ...draft }) : await createAdminProject(draft)
      const next = editing ? projects.map((item) => item.id === saved.id ? saved : item) : [...projects, saved]
      next.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
      onProjectsChange(next); announcePortfolioUpdate(); closeForm()
      setNotice({ type: 'success', text: editing ? 'Projeto atualizado e publicado.' : 'Projeto adicionado ao portfólio.' })
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Erro ao salvar projeto.' })
    } finally { setSaving(false) }
  }

  const removeProject = async (project: PortfolioProject) => {
    if (!window.confirm(`Excluir “${project.name}” do portfólio?`)) return
    setNotice(null)
    try {
      await deleteAdminProject(project.id)
      onProjectsChange(projects.filter((item) => item.id !== project.id)); announcePortfolioUpdate()
      setNotice({ type: 'success', text: 'Projeto excluído do banco e removido do portfólio.' })
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Erro ao excluir projeto.' })
    }
  }

  const showForm = creating || editing !== null

  return (
    <>
      <PageHeading title="Projetos" description="Adicione e edite projetos. Ao salvar, o site público passa a ler o novo conteúdo." action={<button className="admin-primary-action" onClick={openNew}><Icon name="plus" size={16}/> Novo projeto</button>} />
      <NoticeBox notice={notice} />

      {showForm && <section className="admin-panel-card admin-editor-card admin-project-editor">
        <div className="admin-panel-title"><div><span>{editing ? 'EDITAR' : 'NOVO'}</span><h2>{editing ? editing.name : 'Adicionar projeto'}</h2></div><button onClick={closeForm}>Cancelar</button></div>
        <div className="admin-project-form-grid">
          <div className="admin-form-stack">
            <label><span>Nome</span><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
            <label><span>Tipo</span><input value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} placeholder="Ex.: Sistema Web" /></label>
            <label><span>Descrição</span><textarea rows={6} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
            <label><span>Tecnologias / tags</span><input value={draft.tags.join(', ')} onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} placeholder="React, TypeScript, Neon" /></label>
            <label><span>Destaques</span><input value={draft.highlights.join(', ')} onChange={(e) => setDraft({ ...draft, highlights: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} placeholder="Responsivo, API REST, Login" /></label>
          </div>
          <div className="admin-form-stack">
            <label><span>GitHub / link do projeto</span><input value={draft.github} onChange={(e) => setDraft({ ...draft, github: e.target.value })} /></label>
            <label><span>URL da imagem (opcional)</span><input value={draft.image_url ?? ''} onChange={(e) => setDraft({ ...draft, image_url: e.target.value || null })} /></label>
            <label><span>Cor</span><input type="color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} /></label>
            <label><span>Ordem</span><input type="number" min="0" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} /></label>
            <label className="admin-checkbox-label"><input type="checkbox" checked={draft.published !== false} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} /><span>Publicar no portfólio</span></label>
            <div className="admin-form-row"><button className="admin-primary-action" onClick={() => void saveProject()} disabled={saving}><Icon name="save" size={16}/> {saving ? 'Salvando...' : 'Salvar projeto'}</button></div>
          </div>
        </div>
      </section>}

      <section className="admin-panel-card">
        <div className="admin-panel-title"><div><span>PORTFÓLIO</span><h2>Projetos cadastrados</h2></div><span className="admin-pill-count">{projects.length} itens</span></div>
        <div className="admin-project-table">
          {projects.map((project) => <article key={project.id} className="admin-project-row">
            <div className="admin-project-number">{String(project.sort_order).padStart(2, '0')}</div>
            <div className="admin-project-color" style={{ background: project.color }} />
            <div className="admin-project-row-copy"><strong>{project.name}</strong><span>{project.published === false ? 'Oculto' : project.type}</span><p>{project.description}</p></div>
            <div className="admin-project-tags">{project.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="admin-row-actions"><button aria-label={`Editar ${project.name}`} onClick={() => openEdit(project)}><Icon name="edit" size={16}/></button><button className="danger" aria-label={`Excluir ${project.name}`} onClick={() => void removeProject(project)}><Icon name="trash" size={16}/></button></div>
          </article>)}
        </div>
      </section>
    </>
  )
}

function ContactEditor({ content, onUpdated }: { content: PortfolioContent; onUpdated: (next: PortfolioContent) => void }) {
  const [form, setForm] = useState({ whatsapp: content.whatsapp, email: content.email, github: content.github })
  const [notice, setNotice] = useState<Notice>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => setForm({ whatsapp: content.whatsapp, email: content.email, github: content.github }), [content.whatsapp, content.email, content.github])

  const save = async () => {
    setSaving(true); setNotice(null)
    try {
      const next = await updateAdminContent({ about_text: content.about_text, profile_image_url: content.profile_image_url, whatsapp: form.whatsapp, email: form.email, github: form.github })
      onUpdated(next); announcePortfolioUpdate(); setNotice({ type: 'success', text: 'Contatos salvos no Neon e atualizados no portfólio.' })
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Erro ao salvar contatos.' })
    } finally { setSaving(false) }
  }

  return (
    <>
      <PageHeading title="Contato" description="Atualize os canais de contato apresentados aos visitantes." />
      <NoticeBox notice={notice} />
      <section className="admin-panel-card admin-editor-card"><div className="admin-panel-title"><div><span>CANAIS</span><h2>Informações públicas</h2></div></div><div className="admin-form-stack narrow">
        <label><span>WhatsApp</span><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}/></label>
        <label><span>E-mail</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></label>
        <label><span>GitHub</span><input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })}/></label>
        <div className="admin-form-row"><button className="admin-primary-action" onClick={() => void save()} disabled={saving}><Icon name="save" size={16}/> {saving ? 'Salvando...' : 'Salvar e publicar'}</button></div>
      </div></section>
    </>
  )
}

function SettingsPanel() {
  return (
    <><PageHeading title="Configurações" description="Informações técnicas da integração administrativa." /><div className="admin-settings-grid">
      <section className="admin-panel-card"><div className="admin-panel-title"><div><span>BACKEND</span><h2>Integração ativa</h2></div></div><div className="admin-setting-item"><div><strong>Banco</strong><small>PostgreSQL serverless.</small></div><span className="admin-setting-badge">Neon</span></div><div className="admin-setting-item"><div><strong>Atualização</strong><small>O portfólio consulta a API e recebe alterações do painel.</small></div><span className="admin-setting-badge">Ao vivo</span></div></section>
      <section className="admin-panel-card"><div className="admin-panel-title"><div><span>SEGURANÇA</span><h2>Sessão administrativa</h2></div></div><p className="admin-setting-description">O login é validado no backend. A sessão usa cookie HttpOnly e a DATABASE_URL fica apenas nas variáveis de ambiente da Vercel.</p></section>
    </div></>
  )
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState('overview')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [content, setContent] = useState<PortfolioContent>(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const currentLabel = useMemo(() => navigation.find((item) => item.id === active)?.label ?? 'Visão geral', [active])

  useEffect(() => {
    void getAdminContent().then(setContent).catch((error) => setLoadError(error instanceof Error ? error.message : 'Erro ao carregar dados.')).finally(() => setLoading(false))
  }, [])

  const navigate = (tab: string) => { setActive(tab); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const logout = async () => { try { await adminLogout() } finally { onLogout() } }
  const updateProjects = (projects: PortfolioProject[]) => setContent((current) => ({ ...current, projects }))

  return (
    <div className="admin-app-shell">
      <aside className={`admin-sidebar ${mobileMenu ? 'open' : ''}`}>
        <div className="admin-sidebar-brand"><ProtectedLogo alt="Eric Y. Ikeda" /><div><strong>ERIC Y. IKEDA</strong><span>ADMIN PANEL</span></div><button className="admin-sidebar-close" onClick={() => setMobileMenu(false)}><Icon name="close"/></button></div>
        <nav className="admin-sidebar-nav" aria-label="Menu administrativo"><span className="admin-nav-caption">MENU PRINCIPAL</span>{navigation.map((item) => <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><Icon name={item.icon} size={18}/><span>{item.label}</span>{active === item.id && <i/>}</button>)}</nav>
        <div className="admin-sidebar-footer"><a href="/" target="_blank" rel="noreferrer"><Icon name="external" size={17}/><span>Ver portfólio</span></a><button onClick={() => void logout()}><Icon name="logout" size={17}/><span>Sair</span></button><div className="admin-user-chip"><span>EI</span><div><strong>Eric Ikeda</strong><small>Administrador</small></div></div></div>
      </aside>
      {mobileMenu && <button className="admin-sidebar-overlay" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}
      <div className="admin-main-area">
        <header className="admin-topbar"><button className="admin-mobile-menu" onClick={() => setMobileMenu(true)}><Icon name="menu"/></button><div><span>Painel administrativo</span><strong>{currentLabel}</strong></div><div className="admin-topbar-status"><span/><em>Neon conectado</em></div></header>
        <main className="admin-dashboard-content">
          {loading && <div className="admin-panel-card"><p className="admin-setting-description">Carregando conteúdo do Neon...</p></div>}
          {!loading && loadError && <div className="admin-toast-demo admin-toast-error">{loadError}</div>}
          {!loading && !loadError && active === 'overview' && <Overview content={content} onNavigate={navigate} />}
          {!loading && !loadError && active === 'profile' && <ProfileEditor content={content} onUpdated={setContent} />}
          {!loading && !loadError && active === 'projects' && <ProjectsEditor projects={content.projects} onProjectsChange={updateProjects} />}
          {!loading && !loadError && active === 'contact' && <ContactEditor content={content} onUpdated={setContent} />}
          {!loading && !loadError && active === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    void adminSession().then((session) => setAuthenticated(session.authenticated)).finally(() => setChecking(false))
  }, [])

  if (checking) return <div className="admin-login-page"><main className="admin-login-card"><div className="admin-login-copy"><div className="section-label">Área restrita</div><h1>Verificando <span>sessão</span></h1><p>Conectando ao painel administrativo...</p></div></main></div>
  return authenticated ? <Dashboard onLogout={() => setAuthenticated(false)} /> : <LoginScreen onLogin={() => setAuthenticated(true)} />
}
