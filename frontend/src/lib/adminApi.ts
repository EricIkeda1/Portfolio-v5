import type { PortfolioContent, PortfolioProject } from '@/lib/portfolio'

const TOKEN_KEY = 'portfolio_admin_token'

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function adminFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAdminToken()}`,
      ...(options.headers ?? {}),
    },
  })

  if (response.status === 401) {
    clearAdminToken()
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string } & T
  if (!response.ok) throw new Error(data.error || 'Erro ao processar a solicitação.')
  return data
}

export async function loginAdmin(email: string, password: string) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = (await response.json().catch(() => ({}))) as { token?: string; error?: string }
  if (!response.ok || !data.token) throw new Error(data.error || 'E-mail ou senha inválidos.')
  setAdminToken(data.token)
  return data.token
}

export async function verifyAdmin() {
  return adminFetch<{ authenticated: boolean; user: { id: number; email: string } }>('/api/admin-session')
}

export async function updateAdminAccount(payload: {
  email: string
  current_password: string
  new_password?: string
}) {
  const data = await adminFetch<{
    user: { id: number; email: string; created_at?: string; last_login_at?: string | null }
    token: string
  }>('/api/admin-account', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  setAdminToken(data.token)
  return data
}

export async function saveSettings(settings: Pick<PortfolioContent, 'about_text' | 'whatsapp'>) {
  return adminFetch<{ settings: Pick<PortfolioContent, 'about_text' | 'whatsapp'> }>('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  })
}

export async function createProject(project: Omit<PortfolioProject, 'id'>) {
  return adminFetch<{ project: PortfolioProject }>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  })
}

export async function updateProject(id: number, project: Omit<PortfolioProject, 'id'>) {
  return adminFetch<{ project: PortfolioProject }>(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(project),
  })
}

export async function deleteProject(id: number) {
  return adminFetch<{ ok: boolean }>(`/api/projects/${id}`, { method: 'DELETE' })
}
