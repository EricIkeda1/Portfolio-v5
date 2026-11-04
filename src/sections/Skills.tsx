import { Reveal } from '@/components/Reveal'
const categories = [
  { category: 'Interfaces & experiências', symbol: '↗', items: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Figma'] },
  { category: 'Aplicações mobile', symbol: '◈', items: ['Flutter', 'Dart', 'Multiplataforma', 'UI responsiva'] },
  { category: 'Dados & integrações', symbol: '⌘', items: ['PostgreSQL', 'Neon', 'Supabase', 'SQLite', 'APIs REST', 'Django'] },
  { category: 'Ferramentas & processos', symbol: '✳', items: ['Git', 'GitHub', 'Vercel', 'Python', 'VS Code'] },
]
export default function Skills() {
  return <section id="habilidades" className="section-pad skills-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">03 / Ferramentas para construir</span><h2>Tecnologia com propósito.</h2></div><p>Uma base técnica que conecta a experiência visual aos dados e às integrações.</p></div><div className="skills-grid">{categories.map((group, index) => <Reveal key={group.category} delay={index * 50}><article className="skill-card"><span className="skill-symbol" aria-hidden="true">{group.symbol}</span><h3>{group.category}</h3><div className="chips">{group.items.map(item => <span key={item}>{item}</span>)}</div></article></Reveal>)}</div></div></section>
}
