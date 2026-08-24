import { Reveal } from '@/components/Reveal'

const categories = [
  { category: 'Frontend & Mobile', items: ['Flutter', 'React', 'TypeScript', 'JavaScript', 'HTML / CSS'] },
  { category: 'Back-end', items: ['Node.js', 'Python', 'Django', 'REST APIs'] },
  { category: 'Banco de Dados', items: ['PostgreSQL', 'Supabase', 'SQLite'] },
  { category: 'Ferramentas', items: ['Git', 'GitHub', 'VS Code', 'Docker', 'Figma'] },
  { category: 'Machine Learning', items: ['Python', 'Pandas', 'NumPy', 'Scikit-learn'] },
]

export default function Skills() {
  return (
    <section id="habilidades" className="section-pad">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <Reveal from="bottom">
            <div className="section-label">02 — Habilidades</div>
          </Reveal>
          <Reveal delay={80} from="bottom">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <h2 className="display-heading">
                Stack <span className="accent">técnico</span>
              </h2>
              <p className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--muted)', letterSpacing: '0.04em', maxWidth: 280, lineHeight: 1.7 }}>
                Tecnologias para construir soluções completas e escaláveis.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Rows — each row reveals independently */}
        <div>
          {categories.map((cat, i) => (
            <Reveal key={cat.category} delay={i * 60} from="bottom" threshold={0.06}>
              <div className="skills-row">
                <span
                  className="font-mono"
                  style={{ fontSize: '0.74rem', letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase' }}
                >
                  {cat.category}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {cat.items.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        padding: '0.35rem 0.85rem',
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 2,
                        fontSize: '0.82rem',
                        color: 'var(--text)',
                        fontWeight: 500,
                        cursor: 'default',
                        transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement
                        el.style.borderColor = 'var(--blue)'
                        el.style.color = 'var(--blue)'
                        el.style.background = 'var(--blue-dim)'
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement
                        el.style.borderColor = 'var(--border)'
                        el.style.color = 'var(--text)'
                        el.style.background = 'var(--card)'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
