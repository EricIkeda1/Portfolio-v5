import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  clearAdminToken,
  createProject,
  deleteProject,
  getAdminToken,
  saveSettings,
  updateAdminAccount,
  updateProject,
  verifyAdmin,
} from '@/lib/adminApi'
import { DEFAULT_CONTENT, type PortfolioContent, type PortfolioProject } from '@/lib/portfolio'

type ProjectDraft = Omit<PortfolioProject, 'id'>

const EMPTY_PROJECT: ProjectDraft = {
  name: '',
  type: '',
  description: '',
  tags: [],
  highlights: [],
  github: '',
  color: '#4285FF',
  image_url: '',
  sort_order: 1,
}

function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function joinList(value: string[]) {
  return value.join(', ')
}

export default function AdminPage() {
  const [checking, setChecking] = useState(true)
  const [content, setContent] = useState<PortfolioContent>(DEFAULT_CONTENT)
  const [aboutText, setAboutText] = useState(DEFAULT_CONTENT.about_text)
  const [whatsapp, setWhatsapp] = useState(DEFAULT_CONTENT.whatsapp)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState<ProjectDraft>(EMPTY_PROJECT)
  const [tagsText, setTagsText] = useState('')
  const [highlightsText, setHighlightsText] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)
  const [savingProject, setSavingProject] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingAccount, setSavingAccount] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const sortedProjects = useMemo(
    () => [...content.projects].sort((a, b) => a.sort_order - b.sort_order),
    [content.projects],
  )

  const loadContent = async () => {
    const response = await fetch('/api/content', { cache: 'no-store' })
    if (!response.ok) throw new Error('Não foi possível carregar os dados do portfólio.')
    const data = (await response.json()) as PortfolioContent
    setContent(data)
    setAboutText(data.about_text)
    setWhatsapp(data.whatsapp)
  }

  useEffect(() => {
    const start = async () => {
      if (!getAdminToken()) {
        window.location.href = '/login'
        return
      }

      try {
        const session = await verifyAdmin()
        setAdminEmail(session.user.email)
        await loadContent()
      } catch {
        clearAdminToken()
        window.location.href = '/login'
      } finally {
        setChecking(false)
      }
    }

    void start()
  }, [])

  const showSuccess = (text: string) => {
    setError('')
    setMessage(text)
    window.setTimeout(() => setMessage(''), 3000)
  }

  const showError = (err: unknown) => {
    setMessage('')
    setError(err instanceof Error ? err.message : 'Ocorreu um erro.')
  }

  const handleSettingsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingSettings(true)
    setError('')

    try {
      const cleanedWhatsapp = whatsapp.replace(/\D/g, '')
      await saveSettings({ about_text: aboutText.trim(), whatsapp: cleanedWhatsapp })
      setWhatsapp(cleanedWhatsapp)
      await loadContent()
      showSuccess('Informações do portfólio atualizadas.')
    } catch (err) {
      showError(err)
    } finally {
      setSavingSettings(false)
    }
  }

  const handleAccountSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (newPassword && newPassword !== confirmPassword) {
      showError(new Error('A confirmação da nova senha não confere.'))
      return
    }

    setSavingAccount(true)
    try {
      const result = await updateAdminAccount({
        email: adminEmail.trim().toLowerCase(),
        current_password: currentPassword,
        new_password: newPassword || undefined,
      })
      setAdminEmail(result.user.email)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showSuccess('Conta do administrador atualizada no Neon.')
    } catch (err) {
      showError(err)
    } finally {
      setSavingAccount(false)
    }
  }

  const resetProjectForm = () => {
    setEditingId(null)
    setDraft({ ...EMPTY_PROJECT, sort_order: sortedProjects.length + 1 })
    setTagsText('')
    setHighlightsText('')
  }

  const startEdit = (project: PortfolioProject) => {
    setEditingId(project.id)
    setDraft({
      name: project.name,
      type: project.type,
      description: project.description,
      tags: project.tags,
      highlights: project.highlights,
      github: project.github,
      color: project.color,
      image_url: project.image_url ?? '',
      sort_order: project.sort_order,
    })
    setTagsText(joinList(project.tags))
    setHighlightsText(joinList(project.highlights))
    document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleProjectSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingProject(true)
    setError('')

    const payload: ProjectDraft = {
      ...draft,
      name: draft.name.trim(),
      type: draft.type.trim(),
      description: draft.description.trim(),
      github: draft.github.trim(),
      image_url: draft.image_url?.trim() || null,
      tags: splitList(tagsText),
      highlights: splitList(highlightsText),
      sort_order: Number(draft.sort_order) || 1,
    }

    try {
      if (editingId) {
        await updateProject(editingId, payload)
        showSuccess('Projeto atualizado com sucesso.')
      } else {
        await createProject(payload)
        showSuccess('Projeto adicionado aos destaques.')
      }
      await loadContent()
      resetProjectForm()
    } catch (err) {
      showError(err)
    } finally {
      setSavingProject(false)
    }
  }

  const handleDelete = async (project: PortfolioProject) => {
    const confirmed = window.confirm(`Excluir o projeto “${project.name}”?`)
    if (!confirmed) return

    try {
      await deleteProject(project.id)
      await loadContent()
      if (editingId === project.id) resetProjectForm()
      showSuccess('Projeto excluído.')
    } catch (err) {
      showError(err)
    }
  }

  const logout = () => {
    clearAdminToken()
    window.location.href = '/login'
  }

  if (checking) {
    return <main className="admin-shell admin-loading">Carregando painel...</main>
  }

  return (
    <main className="admin-shell">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <div className="section-label">Painel administrativo</div>
            <h1 className="admin-title">Gerenciar <span>Portfólio</span></h1>
            <p className="admin-subtitle">As alterações são salvas no Neon e aparecem no site público.</p>
          </div>
          <div className="admin-header-actions">
            <a className="admin-secondary-button" href="/" target="_blank" rel="noreferrer">Ver portfólio</a>
            <button className="admin-secondary-button" type="button" onClick={logout}>Sair</button>
          </div>
        </header>

        {message && <div className="admin-alert success">{message}</div>}
        {error && <div className="admin-alert error">{error}</div>}

        <section className="admin-card">
          <div className="admin-card-heading">
            <div>
              <span className="admin-card-kicker">Conteúdo principal</span>
              <h2>Quem sou eu + WhatsApp</h2>
            </div>
          </div>

          <form className="admin-form" onSubmit={handleSettingsSubmit}>
            <label>
              <span>Texto “Quem sou eu”</span>
              <textarea
                rows={10}
                value={aboutText}
                onChange={(event) => setAboutText(event.target.value)}
                placeholder="Escreva sua apresentação..."
                required
              />
              <small>Separe os parágrafos deixando uma linha em branco.</small>
            </label>

            <label>
              <span>Número do WhatsApp</span>
              <input
                type="text"
                inputMode="numeric"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                placeholder="5543999999999"
                required
              />
              <small>Use DDI + DDD + número. Ex.: 5543999999999.</small>
            </label>

            <div className="admin-form-actions">
              <button className="admin-primary-button" type="submit" disabled={savingSettings}>
                {savingSettings ? 'Salvando...' : 'Salvar informações'}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card-heading">
            <div>
              <span className="admin-card-kicker">Acesso administrativo</span>
              <h2>Login salvo no Neon</h2>
            </div>
          </div>

          <form className="admin-form" onSubmit={handleAccountSubmit}>
            <label>
              <span>E-mail do administrador</span>
              <input
                type="email"
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                autoComplete="email"
                required
              />
              <small>Este e-mail fica armazenado na tabela admin_users do Neon.</small>
            </label>

            <div className="admin-form-grid">
              <label>
                <span>Senha atual</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
                <small>Obrigatória para confirmar alterações na conta.</small>
              </label>

              <label>
                <span>Nova senha (opcional)</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="Deixe vazio para manter a atual"
                />
              </label>
            </div>

            {newPassword && (
              <label>
                <span>Confirmar nova senha</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
            )}

            <div className="admin-form-actions">
              <button className="admin-primary-button" type="submit" disabled={savingAccount}>
                {savingAccount ? 'Salvando...' : 'Atualizar login'}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-card" id="project-form">
          <div className="admin-card-heading">
            <div>
              <span className="admin-card-kicker">Projetos em destaque</span>
              <h2>{editingId ? 'Editar projeto' : 'Adicionar projeto'}</h2>
            </div>
            {editingId && (
              <button type="button" className="admin-secondary-button" onClick={resetProjectForm}>
                Cancelar edição
              </button>
            )}
          </div>

          <form className="admin-form admin-project-form" onSubmit={handleProjectSubmit}>
            <div className="admin-form-grid">
              <label>
                <span>Nome</span>
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
              </label>
              <label>
                <span>Tipo</span>
                <input value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} placeholder="App Mobile, Sistema Web..." required />
              </label>
            </div>

            <label>
              <span>Descrição</span>
              <textarea rows={5} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} required />
            </label>

            <div className="admin-form-grid">
              <label>
                <span>Tecnologias / tags</span>
                <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="React, TypeScript, Neon" />
                <small>Separe por vírgulas.</small>
              </label>
              <label>
                <span>Destaques</span>
                <input value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} placeholder="Responsivo, Login, Dashboard" />
                <small>Separe por vírgulas.</small>
              </label>
            </div>

            <div className="admin-form-grid">
              <label>
                <span>GitHub / link do projeto</span>
                <input type="url" value={draft.github} onChange={(e) => setDraft({ ...draft, github: e.target.value })} placeholder="https://github.com/..." required />
              </label>
              <label>
                <span>Imagem do projeto (opcional)</span>
                <input type="url" value={draft.image_url ?? ''} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} placeholder="https://.../imagem.png" />
              </label>
            </div>

            <div className="admin-form-grid compact">
              <label>
                <span>Cor de destaque</span>
                <div className="admin-color-field">
                  <input type="color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} />
                  <input value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} pattern="#[0-9A-Fa-f]{6}" />
                </div>
              </label>
              <label>
                <span>Ordem</span>
                <input type="number" min="1" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} required />
              </label>
            </div>

            {draft.image_url && (
              <div className="admin-image-preview">
                <img src={draft.image_url} alt="Prévia do projeto" />
              </div>
            )}

            <div className="admin-form-actions">
              <button className="admin-primary-button" type="submit" disabled={savingProject}>
                {savingProject ? 'Salvando...' : editingId ? 'Salvar projeto' : 'Adicionar projeto'}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-card">
          <div className="admin-card-heading">
            <div>
              <span className="admin-card-kicker">Publicados</span>
              <h2>Projetos cadastrados</h2>
            </div>
            <span className="admin-count">{sortedProjects.length}</span>
          </div>

          <div className="admin-project-list">
            {sortedProjects.map((project) => (
              <article className="admin-project-item" key={project.id}>
                {project.image_url ? (
                  <img className="admin-project-thumb" src={project.image_url} alt="" />
                ) : (
                  <div className="admin-project-thumb placeholder">{project.name.slice(0, 1).toUpperCase()}</div>
                )}
                <div className="admin-project-info">
                  <div className="admin-project-meta">
                    <span style={{ color: project.color }}>{project.type}</span>
                    <span>Ordem {project.sort_order}</span>
                  </div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                </div>
                <div className="admin-project-actions">
                  <button type="button" className="admin-secondary-button" onClick={() => startEdit(project)}>Editar</button>
                  <button type="button" className="admin-danger-button" onClick={() => void handleDelete(project)}>Excluir</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
