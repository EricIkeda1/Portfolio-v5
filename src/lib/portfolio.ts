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
  demo_url?: string | null
  category?: 'auto' | 'web' | 'mobile' | 'other'
}

export interface PortfolioContent {
  about_text: string
  profile_image_url: string
  whatsapp: string
  email: string
  github: string
  linkedin: string
  resume_url: string
  updated_at: string
  projects: PortfolioProject[]
}

export const DEFAULT_ABOUT_TEXT = `Sou Eric Ikeda, formado em Engenharia de Software pela UniSenai PR. Desenvolvo sites e aplicações web com atenção ao design, à usabilidade e à organização do código.

Gosto de participar de todas as etapas do desenvolvimento, desde o planejamento até a entrega, cuidando tanto da experiência visual quanto da qualidade do código. Meu objetivo é criar projetos organizados, funcionais e que ofereçam a melhor experiência possível.

Além de desenvolver para clientes, também crio projetos próprios para estudar novas tecnologias, testar ideias e evoluir como desenvolvedor. Acredito que sempre existe algo novo para aprender, e cada projeto é uma oportunidade de construir soluções das quais eu possa me orgulhar.`

export const DEFAULT_WHATSAPP = '5543996369387'
export const DEFAULT_EMAIL = 'ericikeda2002@gmail.com'
export const DEFAULT_GITHUB = 'https://github.com/EricIkeda1'
export const DEFAULT_LINKEDIN = 'https://www.linkedin.com/in/ericikeda1'
export const DEFAULT_RESUME_URL = 'https://drive.google.com/file/d/1VTpI8VouOdHnPuDKxZmskY_02dhK2wIC/view?usp=sharing'

export const LEGACY_PROJECTS: PortfolioProject[] = [
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

// Conteúdo de apresentação usado somente antes da resposta da API ou sem configuração local.
// Com o Neon disponível, os registros do banco substituem integralmente esta lista.
export const DEFAULT_PROJECTS: PortfolioProject[] = [
  { id: 7, name: 'WebShop', type: 'E-commerce', description: 'E-commerce demonstrativo com catálogo integrado, carrinho de compras, favoritos e consulta de CEP.', tags: ['React', 'TypeScript', 'APIs REST'], highlights: ['Catálogo integrado', 'Carrinho e favoritos', 'Consulta de CEP', 'Checkout demonstrativo'], github: 'https://github.com/EricIkeda1/webshop', demo_url: 'https://webshopeyi.vercel.app/', color: '#1260eb', image_url: null, sort_order: 0, published: true, category: 'web' },
  { id: 8, name: 'Delivery-Restaurante', type: 'Aplicação web', description: 'Catálogo de restaurantes, personalização de pizzas, carrinho e acompanhamento de pedidos demonstrativos.', tags: ['React', 'TypeScript', 'Next.js'], highlights: ['Catálogo de restaurantes', 'Personalização de pizzas', 'Carrinho de compras', 'Pedidos demonstrativos'], github: 'https://github.com/EricIkeda1/Delivery-Restaurante', demo_url: 'https://deliveryeyi.vercel.app/', color: '#be724c', image_url: '/projects/delivery-hero.jpg', sort_order: 1, published: true, category: 'web' },
  { id: 5, name: 'Galeria de fotos', type: 'Sistema web', description: 'Plataforma para divulgação de ensaios fotográficos, com galerias e gerenciamento de conteúdo.', tags: ['React', 'TypeScript'], highlights: ['Galerias de fotos', 'Gerenciamento de conteúdo', 'Interface responsiva'], github: 'https://github.com/EricIkeda1/PortfolioFotos2.0', demo_url: 'https://blogjovemribeiro.vercel.app/', color: '#697369', image_url: null, sort_order: 2, published: true, category: 'web' },
]

export const DEFAULT_CONTENT: PortfolioContent = {
  about_text: DEFAULT_ABOUT_TEXT,
  profile_image_url: '',
  whatsapp: DEFAULT_WHATSAPP,
  email: DEFAULT_EMAIL,
  github: DEFAULT_GITHUB,
  linkedin: DEFAULT_LINKEDIN,
  resume_url: DEFAULT_RESUME_URL,
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
    linkedin:
      typeof raw.linkedin === 'string' && raw.linkedin.trim()
        ? raw.linkedin
        : DEFAULT_CONTENT.linkedin,
    resume_url:
      typeof raw.resume_url === 'string' && raw.resume_url.trim()
        ? raw.resume_url
        : DEFAULT_CONTENT.resume_url,
    updated_at:
      typeof raw.updated_at === 'string'
        ? raw.updated_at
        : '',
    projects: Array.isArray(raw.projects) ? raw.projects.filter((p) => p && typeof p === 'object' && Number.isFinite(Number(p.id))).map((p) => ({
      ...p,
      id: Number(p.id), name: String(p.name ?? ''), type: String(p.type ?? ''), description: String(p.description ?? ''),
      tags: Array.isArray(p.tags) ? p.tags.map(String) : [], highlights: Array.isArray(p.highlights) ? p.highlights.map(String) : [],
      github: String(p.github ?? ''), color: /^#[a-f0-9]{6}$/i.test(p.color) ? p.color : '#1260eb',
      sort_order: Number(p.sort_order) || 0,
    })) : DEFAULT_CONTENT.projects,
  }
}
