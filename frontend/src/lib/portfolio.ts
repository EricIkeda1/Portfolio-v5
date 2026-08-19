export type PortfolioProfile = {
  photo_drive_url: string
  about_text: string
  whatsapp: string
  email: string
  github_url: string
  updated_at?: string
}

export type PortfolioProject = {
  id: number
  name: string
  type: string
  description: string
  tags: string[]
  highlights: string[]
  github_url: string
  color: string
  sort_order: number
  is_active: boolean
}

export type PortfolioData = {
  profile: PortfolioProfile
  projects: PortfolioProject[]
}

export const fallbackProfile: PortfolioProfile = {
  photo_drive_url: 'https://drive.google.com/file/d/18I4wMhuprbKT0OLBLvAvz12yAoPNQSNc/view?usp=sharing',
  about_text:
    'Meu nome é Eric, sou desenvolvedor de software e gosto de transformar ideias em projetos reais. Desenvolvo sites, sistemas e aplicações, sempre buscando criar soluções modernas, rápidas e que realmente façam a diferença para quem as utiliza.\n\nGosto de participar de todas as etapas do desenvolvimento, desde o planejamento até a entrega, cuidando tanto da experiência visual quanto da qualidade do código. Meu objetivo é criar projetos organizados, funcionais e que ofereçam a melhor experiência possível.\n\nAlém de desenvolver para clientes, também crio projetos próprios para estudar novas tecnologias, testar ideias e evoluir como desenvolvedor. Acredito que sempre existe algo novo para aprender, e cada projeto é uma oportunidade de construir soluções das quais eu possa me orgulhar.',
  whatsapp: '',
  email: 'ericikeda2002@mail.com',
  github_url: 'https://github.com/EricIkeda1',
}

export const fallbackProjects: PortfolioProject[] = [
  {
    id: 1,
    name: 'Ademiconnect',
    type: 'CRM Mobile',
    tags: ['Flutter', 'Supabase', 'Mobile'],
    description:
      'CRM Mobile desenvolvido com Flutter e Supabase, com sincronização em tempo real e funcionamento offline. Solução completa para gestão de relacionamento com clientes.',
    highlights: ['Sync em tempo real', 'Modo offline', 'Flutter + Supabase'],
    github_url: 'https://github.com/EricIkeda1/Ademiconnect',
    color: '#4285FF',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 2,
    name: 'Temperlights',
    type: 'App Industrial',
    tags: ['Mobile', 'Rastreabilidade', 'Produção'],
    description:
      'Aplicativo para rastreabilidade da produção industrial, com acompanhamento em tempo real de cada etapa do processo de fabricação.',
    highlights: ['Rastreabilidade', 'Produção industrial', 'Tempo real'],
    github_url: 'https://github.com/EricIkeda1/Temperlights-Mobile',
    color: '#5B9BFF',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 3,
    name: 'X4Glass',
    type: 'Sistema Web',
    tags: ['Full Stack', 'Rastreabilidade', 'Equipe'],
    description:
      'Sistema de rastreabilidade para produção de vidros desenvolvido em equipe. Projeto colaborativo com foco em qualidade e organização de processos industriais.',
    highlights: ['Desenvolvimento em equipe', 'Rastreabilidade', 'Full Stack'],
    github_url: 'https://github.com/EricIkeda1/X4Glass',
    color: '#7AB3FF',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 4,
    name: 'AES',
    type: 'Criptografia',
    tags: ['Python', 'Cibersegurança', 'Algoritmos'],
    description:
      'Implementação completa do algoritmo AES (Advanced Encryption Standard) em Python do zero, sem bibliotecas externas. Desenvolvido na disciplina de Segurança da Informação, cobrindo as principais etapas do AES de 128 bits.',
    highlights: ['AES 128-bit', 'Python puro', 'Cibersegurança'],
    github_url: 'https://github.com/EricIkeda1/AES',
    color: '#A78BFF',
    sort_order: 4,
    is_active: true,
  },
]

export const fallbackData: PortfolioData = {
  profile: fallbackProfile,
  projects: fallbackProjects,
}

export function googleDriveImageUrl(url: string) {
  const value = url.trim()
  if (!value) return ''

  const fileMatch = value.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  const idMatch = value.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  const id = fileMatch?.[1] ?? idMatch?.[1]

  if (!id) return value
  return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error('A API não retornou JSON. Use "npx vercel dev" no desenvolvimento local.')
  }

  const body = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(body.error || 'Erro na requisição.')
  }
  return body
}

export async function getPortfolioData() {
  const response = await fetch('/api/data', { credentials: 'same-origin' })
  const body = await parseResponse<{ profile: PortfolioProfile | null; projects: PortfolioProject[] }>(response)
  return {
    profile: body.profile ?? fallbackProfile,
    projects: body.projects,
  }
}


export async function getAdminData() {
  const response = await fetch('/api/admin-data', { credentials: 'same-origin' })
  const body = await parseResponse<{ profile: PortfolioProfile | null; projects: PortfolioProject[] }>(response)
  return {
    profile: body.profile ?? fallbackProfile,
    projects: body.projects,
  }
}

export async function login(email: string, password: string) {
  const response = await fetch('/api/auth-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ email, password }),
  })
  return parseResponse<{ ok: true; admin: { id: number; email: string } }>(response)
}

export async function getSession() {
  const response = await fetch('/api/auth-session', { credentials: 'same-origin' })
  return parseResponse<{ authenticated: true; admin: { id: number; email: string } }>(response)
}

export async function logout() {
  const response = await fetch('/api/auth-logout', {
    method: 'POST',
    credentials: 'same-origin',
  })
  return parseResponse<{ ok: true }>(response)
}

export async function saveProfile(profile: PortfolioProfile) {
  const response = await fetch('/api/admin-profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(profile),
  })
  return parseResponse<{ profile: PortfolioProfile }>(response)
}

export async function saveProject(project: Omit<PortfolioProject, 'id'> & { id?: number }) {
  const editing = Boolean(project.id)
  const response = await fetch(`/api/admin-projects${editing ? `?id=${project.id}` : ''}`, {
    method: editing ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(project),
  })
  return parseResponse<{ project: PortfolioProject }>(response)
}

export async function deleteProject(id: number) {
  const response = await fetch(`/api/admin-projects?id=${id}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  })
  return parseResponse<{ ok: true }>(response)
}
