import { normalizePortfolioContent, type PortfolioContent, type PortfolioProject } from '@/lib/portfolio'

type ApiErrorBody = { error?: string }

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body = isJson ? await response.json() : null

  if (!response.ok) {
    const message = (body as ApiErrorBody | null)?.error || `Erro ${response.status} ao acessar ${url}.`
    throw new Error(message)
  }

  if (!isJson || body === null) {
    throw new Error(
      `A rota ${url} não retornou JSON. No desenvolvimento local, execute "npm run dev:vercel" para iniciar o frontend e as funções /api juntos.`,
    )
  }

  return body as T
}

export async function getPublicContent() {
  const body = await request<unknown>('/api/content', { method: 'GET', cache: 'no-store' })
  return normalizePortfolioContent(body)
}

export function adminLogin(email: string, password: string) {
  return request<{ ok: true; user: { id: number; email: string } }>('/api/admin-login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function adminSession() {
  try {
    return await request<{ authenticated: true; user: { id: number; email: string } }>('/api/admin-session', {
      method: 'GET',
      cache: 'no-store',
    })
  } catch {
    return { authenticated: false as const }
  }
}

export function adminLogout() {
  return request<{ ok: true }>('/api/admin-logout', { method: 'POST' })
}

export async function getAdminContent() {
  const body = await request<unknown>('/api/admin-content', { method: 'GET', cache: 'no-store' })
  return normalizePortfolioContent(body)
}

export async function updateAdminContent(content: Pick<PortfolioContent, 'about_text' | 'profile_image_url' | 'whatsapp' | 'email' | 'github'>) {
  const body = await request<unknown>('/api/admin-content', {
    method: 'PUT',
    body: JSON.stringify(content),
  })
  return normalizePortfolioContent(body)
}

export function createAdminProject(project: Omit<PortfolioProject, 'id'>) {
  return request<PortfolioProject>('/api/admin-projects', {
    method: 'POST',
    body: JSON.stringify(project),
  })
}

export function updateAdminProject(project: PortfolioProject) {
  return request<PortfolioProject>('/api/admin-projects', {
    method: 'PUT',
    body: JSON.stringify(project),
  })
}

export function deleteAdminProject(id: number) {
  return request<{ ok: true }>(`/api/admin-projects?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function announcePortfolioUpdate() {
  try {
    const channel = new BroadcastChannel('portfolio-content')
    channel.postMessage({ type: 'refresh', at: Date.now() })
    channel.close()
  } catch {
    // BroadcastChannel pode não existir em navegadores muito antigos.
  }
}
