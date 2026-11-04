import reactLogo from '@/assets/react.svg'
const technologies = [
  { label: 'React', mark: 'react', color: '#61dafb' },
  { label: 'Flutter', mark: 'F', color: '#5bcaff' },
  { label: 'TypeScript', mark: 'TS', color: '#55a5fb' },
  { label: 'Django', mark: 'dj', color: '#58bb8b' },
  { label: 'PostgreSQL', mark: 'PG', color: '#8ab5e9' },
  { label: 'Figma', mark: 'Fi', color: '#f08b9d' },
  { label: 'GitHub', mark: 'git', color: '#dad2eb' },
]
export default function Skills() {
  return <section id="habilidades" className="section-pad skills-section"><div className="container technology-row"><div><span className="eyebrow">Tecnologias</span><h2>Principais ferramentas<br />que utilizo.</h2></div><ul className="technology-list" aria-label="Tecnologias">{technologies.map(tech => <li key={tech.label}><span className="technology-mark" style={{ color: tech.color }}>{tech.mark === 'react' ? <img src={reactLogo} width="32" height="32" alt="" loading="lazy" /> : tech.mark}</span><span>{tech.label}</span></li>)}</ul></div></section>
}
