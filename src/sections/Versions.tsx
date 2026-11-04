import { ArrowIcon } from '@/components/Icons'

const versions = [
  {
    version: 'v1',
    title: 'Meu Portfólio',
    description: 'Primeira versão em React + TypeScript. Diferenciais: sistema de avaliação simples e gamificação básica para engajar visitantes.',
    tech: ['React', 'TypeScript'],
    url: 'https://ericikedaportfolio.vercel.app/',
    year: '2023',
  },
  {
    version: 'v2',
    title: 'Portfólio TypeScript',
    description: 'Segunda versão em React + TypeScript com sistema de gamificação bem elaborado, pontuação, conquistas e progressão interativa.',
    tech: ['React', 'TypeScript'],
    url: 'https://ericyikedaportfolio.vercel.app/',
    year: '2023',
  },
  {
    version: 'v3.2',
    title: 'Portfólio de Projetos',
    description: 'Foco em exibição de projetos, nova seção de habilidades e layout melhorado.',
    tech: ['React', 'TypeScript'],
    url: 'https://ericyikedaportfolio32.vercel.app/',
    year: '2024',
  },
  {
    version: 'v4',
    title: 'Portfolio 4.0',
    description: 'Design system maduro, animações e seções aprimoradas.',
    tech: ['React', 'TypeScript', 'Tailwind'],
    url: 'https://ericyikedaportfolio4.vercel.app/',
    year: '2024',
  },
  {
    version: 'v5',
    title: 'Portfólio atual',
    description: 'Uma nova experiência: visual refinado, navegação responsiva e projetos integrados ao banco de dados.',
    tech: ['React', 'TypeScript', 'Tailwind v4'],
    url: null,
    year: '2026',
    current: true,
  },
]

export default function Versions() {
  return <section className="section-pad versions-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">05 / Sempre em construção</span><h2>Cada versão, um novo olhar.</h2></div><p>O portfólio também conta uma história. Explore os caminhos até aqui.</p></div><div className="versions-track">{versions.map(v => <article key={v.version} className={`version-card ${v.current ? 'is-current' : ''}`}><div className="version-top"><span>{v.version}</span><span>{v.year}</span></div><h3>{v.title}</h3><p>{v.description}</p>{v.url ? <a className="text-link" href={v.url} target="_blank" rel="noopener noreferrer">Visitar versão <ArrowIcon diagonal /></a> : <span className="current-label">Você está aqui</span>}</article>)}</div></div></section>
}
