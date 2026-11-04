import { normalizePortfolioContent, type PortfolioContent, type PortfolioProject } from '@/lib/portfolio'

type ApiErrorBody = { error?: string }

export type AdminUser = { id: number; email: string }
export type ContactMessage = { id: number; name: string; email: string; message: string; created_at: string; read_at: string | null }

export function getNotificationKey() {
  return request<{ publicKey: string }>('/api/admin-messages?notifications=1', { cache: 'no-store' })
}

export function savePushSubscription(subscription: PushSubscriptionJSON) {
  return request<{ ok: true }>('/api/admin-messages', { method: 'POST', body: JSON.stringify({ action: 'subscribe', subscription }) })
}

export function getPushStatus(endpoint: string) {
  return request<{ enabled: boolean; lastError: string | null }>('/api/admin-messages', { method: 'POST', body: JSON.stringify({ action: 'status', endpoint }) })
}

export function testPushNotification(endpoint: string) {
  return request<{ ok: true }>('/api/admin-messages', { method: 'POST', body: JSON.stringify({ action: 'test', endpoint }) })
}

export function disablePushSubscription(endpoint: string) {
  return request<{ ok: true }>('/api/admin-messages', { method: 'DELETE', body: JSON.stringify({ endpoint }) })
}

export function sendContactMessage(input: { name: string; email: string; message: string; website: string }) {
  return request<{ ok: true }>('/api/contact', { method: 'POST', body: JSON.stringify(input) })
}

export function getAdminMessages(before?: number) {
  return request<{ messages: ContactMessage[]; next: number | null; unread: number }>(`/api/admin-messages${before ? `?before=${before}` : ''}`, { cache: 'no-store' })
}

export function markMessageRead(id: number, read: boolean) {
  return request<{ id: number; read_at: string | null }>('/api/admin-messages', { method: 'PUT', body: JSON.stringify({ id, read }) })
}

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
  return request<{ ok: true; user: AdminUser }>('/api/admin-login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function adminSession() {
  try {
    return await request<{ authenticated: true; user: AdminUser }>('/api/admin-session', {
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

export function updateAdminCredentials(input: { email: string; current_password: string; new_password?: string }) {
  return request<{ ok: true; user: AdminUser }>('/api/admin-credentials', {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function getAdminContent() {
  const body = await request<unknown>('/api/admin-content', { method: 'GET', cache: 'no-store' })
  return normalizePortfolioContent(body)
}

export async function updateAdminContent(content: Pick<PortfolioContent, 'about_text' | 'profile_image_url' | 'whatsapp' | 'email' | 'github' | 'linkedin' | 'resume_url'>) {
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
