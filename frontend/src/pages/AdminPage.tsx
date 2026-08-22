import { useEffect, useMemo, useState, type FormEvent } from 'react'
import DottedBackground from '@/components/DottedBackground'
import {
  deleteProject,
  getAdminData,
  getSession,
  googleDriveImageUrl,
  logout,
  saveProfile,
  saveProject,
  type PortfolioProfile,
  type PortfolioProject,
} from '@/lib/portfolio'

const logoSrc = 'https://drive.google.com/thumbnail?id=19o0-cXysNK5HsufGJJSZThSlPpuury__&sz=w1000'

type ProjectForm = Omit<PortfolioProject, 'id' | 'tags' | 'highlights'> & {
  id?: number
  tags: string
  highlights: string
}

const emptyProject = (): ProjectForm => ({
  name: '',
  type: '',
  description: '',
  tags: '',
  highlights: '',
  github_url: '',
  color: '#4285FF',
  sort_order: 0,
  is_active: true,
})

function toForm(project: PortfolioProject): ProjectForm {
  return {
    ...project,
    tags: project.tags.join(', '),
    highlights: project.highlights.join(', '),
  }
}

function splitList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [section, setSection] = useState<'perfil' | 'projetos' | 'contato'>('perfil')
  const [profile, setProfile] = useState<PortfolioProfile | null>(null)
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProject())

  const photoPreview = useMemo(() => googleDriveImageUrl(profile?.photo_drive_url ?? ''), [profile?.photo_drive_url])

  useEffect(() => {
    const init = async () => {
      try {
        const session = await getSession()
        setAdminEmail(session.admin.email)
        const data = await getAdminData()
        setProfile(data.profile)
        setProjects(data.projects)
      } catch {
        window.location.replace('/admin/login')
        return
      } finally {
        setLoading(false)
      }
    }
    void init()
  }, [])

  const flash = (text: string) => {
    setMessage(text)
    setError('')
    window.setTimeout(() => setMessage(''), 3500)
  }

  const saveProfileForm = async (event: FormEvent) => {
    event.preventDefault()
    if (!profile) return
    setSaving(true)
    setError('')
    try {
      const result = await saveProfile(profile)
      setProfile(result.profile)
      flash('Alterações salvas com sucesso.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  const saveProjectForm = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...projectForm,
        tags: splitList(projectForm.tags),
        highlights: splitList(projectForm.highlights),
      }
      const result = await saveProject(payload)
      setProjects((current) => {
        const exists = current.some((item) => item.id === result.project.id)
        const next = exists ? current.map((item) => item.id === result.project.id ? result.project : item) : [...current, result.project]
        return next.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
      })
      setProjectForm(emptyProject())
      flash(projectForm.id ? 'Projeto atualizado.' : 'Projeto adicionado.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o projeto.')
    } finally {
      setSaving(false)
    }
  }

  const removeProject = async (project: PortfolioProject) => {
    if (!window.confirm(`Excluir o projeto "${project.name}"?`)) return
    try {
      await deleteProject(project.id)
      setProjects((current) => current.filter((item) => item.id !== project.id))
      if (projectForm.id === project.id) setProjectForm(emptyProject())
      flash('Projeto excluído.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir.')
    }
  }

  const doLogout = async () => {
    try { await logout() } finally { window.location.replace('/admin/login') }
  }

  if (loading || !profile) {
    return <DottedBackground><div className="admin-loading font-mono">Carregando painel...</div></DottedBackground>
  }

  return (
    <DottedBackground>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <a href="/" className="admin-logo">
            <img src={logoSrc} alt="Eric Y. Ikeda" referrerPolicy="no-referrer" />
            <div><strong className="font-display">Eric Y. Ikeda</strong><span className="font-mono">Admin v5</span></div>
          </a>

          <nav>
            <button className={section === 'perfil' ? 'active' : ''} onClick={() => setSection('perfil')}>01 <span>Quem sou eu</span></button>
            <button className={section === 'projetos' ? 'active' : ''} onClick={() => setSection('projetos')}>02 <span>Projetos</span></button>
            <button className={section === 'contato' ? 'active' : ''} onClick={() => setSection('contato')}>03 <span>Contato</span></button>
          </nav>

          <div className="admin-sidebar-bottom">
            <span className="font-mono">{adminEmail}</span>
            <button onClick={doLogout}>Sair</button>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-topbar">
            <div>
              <div className="admin-eyebrow font-mono">Painel administrativo</div>
              <h1 className="font-display">Editar portfólio</h1>
            </div>
            <a href="/" target="_blank" rel="noreferrer" className="admin-secondary">Ver site ↗</a>
          </header>

          {message && <div className="admin-alert success">{message}</div>}
          {error && <div className="admin-alert error">{error}</div>}

          {section === 'perfil' && (
            <section className="admin-panel">
              <div className="admin-panel-heading"><div><span className="font-mono">01 — SOBRE</span><h2 className="font-display">Quem sou eu</h2></div><p>Altere a foto e o texto exibidos na seção “Quem sou eu”.</p></div>
              <form className="admin-form" onSubmit={saveProfileForm}>
                <div className="admin-photo-grid">
                  <div className="admin-photo-preview">
                    {photoPreview ? <img src={photoPreview} alt="Prévia do perfil" referrerPolicy="no-referrer" /> : <span>Sem foto</span>}
                  </div>
                  <label>
                    <span>Link compartilhado do Google Drive</span>
                    <input value={profile.photo_drive_url} onChange={(event) => setProfile({ ...profile, photo_drive_url: event.target.value })} placeholder="https://drive.google.com/file/d/.../view?usp=sharing" />
                    <small>No Drive, deixe o arquivo como “Qualquer pessoa com o link” e cole aqui o link de compartilhamento.</small>
                  </label>
                </div>
                <label>
                  <span>Descrição do “Quem sou eu”</span>
                  <textarea rows={12} value={profile.about_text} onChange={(event) => setProfile({ ...profile, about_text: event.target.value })} required />
                  <small>Para criar novos parágrafos, deixe uma linha em branco entre os textos.</small>
                </label>

                <div className="admin-subsection">
                  <div className="admin-subsection-title">
                    <span className="font-mono">FORMAÇÃO</span>
                    <p>Esses dados também são carregados do Neon e exibidos na seção “Sobre”.</p>
                  </div>
                  <div className="admin-form-grid">
                    <label>
                      <span>Curso</span>
                      <input value={profile.education_course} onChange={(event) => setProfile({ ...profile, education_course: event.target.value })} placeholder="Engenharia de Software" />
                    </label>
                    <label>
                      <span>Conclusão</span>
                      <input value={profile.education_completion} onChange={(event) => setProfile({ ...profile, education_completion: event.target.value })} placeholder="2026" />
                    </label>
                  </div>
                  <label>
                    <span>Instituição</span>
                    <input value={profile.education_institution} onChange={(event) => setProfile({ ...profile, education_institution: event.target.value })} placeholder="UniSenaiPR – Londrina" />
                  </label>
                </div>

                <button className="admin-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações no Neon'}</button>
              </form>
            </section>
          )}

          {section === 'contato' && (
            <section className="admin-panel">
              <div className="admin-panel-heading"><div><span className="font-mono">03 — CONTATO</span><h2 className="font-display">Links e contato</h2></div><p>Esses dados aparecem na seção de contato da página inicial.</p></div>
              <form className="admin-form" onSubmit={saveProfileForm}>
                <div className="admin-form-grid">
                  <label><span>WhatsApp</span><input value={profile.whatsapp} onChange={(event) => setProfile({ ...profile, whatsapp: event.target.value })} placeholder="(43) 99999-9999" /></label>
                  <label><span>E-mail</span><input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required /></label>
                </div>
                <label><span>GitHub</span><input type="url" value={profile.github_url} onChange={(event) => setProfile({ ...profile, github_url: event.target.value })} placeholder="https://github.com/seuusuario" /></label>
                <button className="admin-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar contatos'}</button>
              </form>
            </section>
          )}

          {section === 'projetos' && (
            <section className="admin-project-layout">
              <div className="admin-panel project-list-panel">
                <div className="admin-panel-heading compact"><div><span className="font-mono">02 — PROJETOS</span><h2 className="font-display">Em destaque</h2></div><button className="admin-secondary" onClick={() => setProjectForm(emptyProject())}>+ Novo</button></div>
                <div className="admin-project-list">
                  {projects.map((project) => (
                    <div key={project.id} className={`admin-project-item ${projectForm.id === project.id ? 'selected' : ''}`}>
                      <button className="project-select" onClick={() => setProjectForm(toForm(project))}>
                        <span className="project-color" style={{ background: project.color }} />
                        <span><strong>{project.name}</strong><small>{project.type || 'Sem tipo'} · {project.is_active ? 'Visível' : 'Oculto'}</small></span>
                      </button>
                      <button className="project-delete" onClick={() => void removeProject(project)} aria-label={`Excluir ${project.name}`}>×</button>
                    </div>
                  ))}
                  {!projects.length && <div className="admin-empty">Nenhum projeto cadastrado.</div>}
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-heading"><div><span className="font-mono">{projectForm.id ? 'EDITAR PROJETO' : 'NOVO PROJETO'}</span><h2 className="font-display">{projectForm.id ? projectForm.name : 'Adicionar projeto'}</h2></div></div>
                <form className="admin-form" onSubmit={saveProjectForm}>
                  <div className="admin-form-grid">
                    <label><span>Nome</span><input value={projectForm.name} onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })} required /></label>
                    <label><span>Tipo</span><input value={projectForm.type} onChange={(event) => setProjectForm({ ...projectForm, type: event.target.value })} placeholder="CRM Mobile" /></label>
                  </div>
                  <label><span>Descrição</span><textarea rows={6} value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} /></label>
                  <div className="admin-form-grid">
                    <label><span>Tecnologias / tags</span><input value={projectForm.tags} onChange={(event) => setProjectForm({ ...projectForm, tags: event.target.value })} placeholder="Flutter, Supabase, Mobile" /><small>Separe por vírgulas.</small></label>
                    <label><span>Destaques</span><input value={projectForm.highlights} onChange={(event) => setProjectForm({ ...projectForm, highlights: event.target.value })} placeholder="Modo offline, Sync em tempo real" /><small>Separe por vírgulas.</small></label>
                  </div>
                  <label><span>Link do GitHub</span><input type="url" value={projectForm.github_url} onChange={(event) => setProjectForm({ ...projectForm, github_url: event.target.value })} placeholder="https://github.com/..." /></label>
                  <div className="admin-form-grid small-cols">
                    <label><span>Cor de destaque</span><div className="admin-color-input"><input type="color" value={projectForm.color} onChange={(event) => setProjectForm({ ...projectForm, color: event.target.value })} /><input value={projectForm.color} onChange={(event) => setProjectForm({ ...projectForm, color: event.target.value })} /></div></label>
                    <label><span>Ordem</span><input type="number" value={projectForm.sort_order} onChange={(event) => setProjectForm({ ...projectForm, sort_order: Number(event.target.value) })} /></label>
                  </div>
                  <label className="admin-check"><input type="checkbox" checked={projectForm.is_active} onChange={(event) => setProjectForm({ ...projectForm, is_active: event.target.checked })} /><span>Exibir este projeto no portfólio</span></label>
                  <div className="admin-actions">
                    <button className="admin-primary" disabled={saving}>{saving ? 'Salvando...' : projectForm.id ? 'Atualizar projeto' : 'Adicionar projeto'}</button>
                    {projectForm.id && <button type="button" className="admin-secondary" onClick={() => setProjectForm(emptyProject())}>Cancelar edição</button>}
                  </div>
                </form>
              </div>
            </section>
          )}
        </main>
      </div>
    </DottedBackground>
  )
}
