import { Reveal, RevealGroup } from '@/components/Reveal'

const items = [
  {
    kicker: 'Objetivo',
    title: 'Desenvolvedor de Software Júnior',
    description: 'Busco uma oportunidade como Desenvolvedor de Software Júnior, com foco em desenvolvimento web e mobile, para aplicar meus conhecimentos em projetos reais, evoluir tecnicamente e contribuir com soluções bem estruturadas e funcionais.',
  },
  {
    kicker: 'Formação',
    title: 'Engenharia de Software',
    description: 'UniSenai PR Dr. Celso Charuri — Londrina · concluído em 26/06/2026.',
  },
  {
    kicker: 'Foco',
    title: 'Web & Mobile',
    description: 'React, Flutter, TypeScript, Dart, APIs REST e PostgreSQL no dia a dia de projetos.',
  },
  {
    kicker: 'Disponibilidade',
    title: 'Novas oportunidades',
    description: 'Disponível para oportunidades presenciais, híbridas ou remotas.',
    status: true,
  },
]

export default function RecruiterSnapshot() {
  return (
    <section className="recruiter-snapshot" aria-labelledby="recruiter-snapshot-title">
      <div className="container">
        <Reveal from="bottom">
          <div className="recruiter-snapshot-heading">
            <div>
              <div className="section-label">Visão rápida para recrutadores</div>
              <h2 id="recruiter-snapshot-title" className="recruiter-snapshot-title">
                Meu perfil em <span>30 segundos</span>
              </h2>
            </div>
            <a className="recruiter-cv-link font-mono" href="/curriculo-eric-yuji-ikeda.pdf" target="_blank" rel="noopener noreferrer">
              Abrir currículo
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M14 3h7v7" />
                <path d="M10 14 21 3" />
                <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
              </svg>
            </a>
          </div>
        </Reveal>

        <RevealGroup stagger={80} from="bottom" baseDelay={80} className="recruiter-snapshot-grid">
          {items.map((item) => (
            <article key={item.kicker} className="recruiter-snapshot-card">
              <div className="recruiter-snapshot-kicker font-mono">
                {item.status && <span className="recruiter-status-dot" aria-hidden="true" />}
                {item.kicker}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
