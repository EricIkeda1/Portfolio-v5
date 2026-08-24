export interface PortfolioProject {
  id: number
  name: string
  type: string
  description: string
  tags: string[]
  highlights: string[]
  github: string
  color: string
  image_url?: string | null
  sort_order: number
  published?: boolean
}

export interface PortfolioContent {
  about_text: string
  profile_image_url: string
  whatsapp: string
  email: string
  github: string
  updated_at: string
  projects: PortfolioProject[]
}

export const DEFAULT_ABOUT_TEXT = `Meu nome é Eric, sou desenvolvedor de software e gosto de transformar ideias em projetos reais. Desenvolvo sites, sistemas e aplicações, sempre buscando criar soluções modernas, rápidas e que realmente façam a diferença para quem as utiliza.

Gosto de participar de todas as etapas do desenvolvimento, desde o planejamento até a entrega, cuidando tanto da experiência visual quanto da qualidade do código. Meu objetivo é criar projetos organizados, funcionais e que ofereçam a melhor experiência possível.

Além de desenvolver para clientes, também crio projetos próprios para estudar novas tecnologias, testar ideias e evoluir como desenvolvedor. Acredito que sempre existe algo novo para aprender, e cada projeto é uma oportunidade de construir soluções das quais eu possa me orgulhar.`

export const DEFAULT_WHATSAPP = '5543996369387'
export const DEFAULT_EMAIL = 'ikedayuji.2002@gmail.com'
export const DEFAULT_GITHUB = 'https://github.com/EricIkeda1'

export const DEFAULT_PROJECTS: PortfolioProject[] = [
  {
    id: 1,
    name: 'Ademiconnect',
    type: 'CRM Mobile',
    tags: ['Flutter', 'Supabase', 'Mobile'],
    description:
      'CRM Mobile desenvolvido com Flutter e Supabase, com sincronização em tempo real e funcionamento offline. Solução completa para gestão de relacionamento com clientes.',
    highlights: ['Sync em tempo real', 'Modo offline', 'Flutter + Supabase'],
    github: 'https://github.com/EricIkeda1/Ademiconnect',
    color: '#4285FF',
    image_url: null,
    sort_order: 1,
    published: true,
  },
  {
    id: 2,
    name: 'Temperlights',
    type: 'App Industrial',
    tags: ['Mobile', 'Rastreabilidade', 'Produção'],
    description:
      'Aplicativo para rastreabilidade da produção industrial, com acompanhamento em tempo real de cada etapa do processo de fabricação.',
    highlights: ['Rastreabilidade', 'Produção industrial', 'Tempo real'],
    github: 'https://github.com/EricIkeda1/Temperlights-Mobile',
    color: '#5B9BFF',
    image_url: null,
    sort_order: 2,
    published: true,
  },
  {
    id: 3,
    name: 'X4Glass',
    type: 'Sistema Web',
    tags: ['Full Stack', 'Rastreabilidade', 'Equipe'],
    description:
      'Sistema de rastreabilidade para produção de vidros desenvolvido em equipe. Projeto colaborativo com foco em qualidade e organização de processos industriais.',
    highlights: ['Desenvolvimento em equipe', 'Rastreabilidade', 'Full Stack'],
    github: 'https://github.com/EricIkeda1/X4Glass',
    color: '#7AB3FF',
    image_url: null,
    sort_order: 3,
    published: true,
  },
  {
    id: 4,
    name: 'AES',
    type: 'Criptografia',
    tags: ['Python', 'Cibersegurança', 'Algoritmos'],
    description:
      'Implementação completa do algoritmo AES (Advanced Encryption Standard) em Python do zero, sem bibliotecas externas. Desenvolvido na disciplina de Segurança da Informação, cobre todas as etapas: Key Expansion, SubBytes, ShiftRows, MixColumns e AddRoundKey — 10 rounds de criptografia com chave de 128 bits.',
    highlights: ['AES 128-bit', 'Python puro', 'Cibersegurança'],
    github: 'https://github.com/EricIkeda1/AES',
    color: '#A78BFF',
    image_url: null,
    sort_order: 4,
    published: true,
  },
]

export const DEFAULT_CONTENT: PortfolioContent = {
  about_text: DEFAULT_ABOUT_TEXT,
  profile_image_url: '',
  whatsapp: DEFAULT_WHATSAPP,
  email: DEFAULT_EMAIL,
  github: DEFAULT_GITHUB,
  updated_at: '',
  projects: DEFAULT_PROJECTS,
}


export function normalizePortfolioContent(value: unknown): PortfolioContent {
  if (!value || typeof value !== 'object') return DEFAULT_CONTENT

  const raw = value as Partial<PortfolioContent>

  return {
    about_text:
      typeof raw.about_text === 'string' && raw.about_text.trim()
        ? raw.about_text
        : DEFAULT_CONTENT.about_text,
    profile_image_url:
      typeof raw.profile_image_url === 'string' && raw.profile_image_url.trim()
        ? raw.profile_image_url
        : '',
    whatsapp:
      typeof raw.whatsapp === 'string' && raw.whatsapp.trim()
        ? raw.whatsapp
        : DEFAULT_CONTENT.whatsapp,
    email:
      typeof raw.email === 'string' && raw.email.trim()
        ? raw.email
        : DEFAULT_CONTENT.email,
    github:
      typeof raw.github === 'string' && raw.github.trim()
        ? raw.github
        : DEFAULT_CONTENT.github,
    updated_at:
      typeof raw.updated_at === 'string'
        ? raw.updated_at
        : '',
    projects: Array.isArray(raw.projects) ? raw.projects : DEFAULT_CONTENT.projects,
  }
}
