import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { useTranslation } from '@/i18n/LanguageContext'

export default function Hero() {
  const { content } = usePortfolioContent()
  const { t } = useTranslation()
  const featured = [...content.projects].sort((a, b) => a.sort_order - b.sort_order)[0]

  return (
    <section id="inicio" className="portfolio-intro">
      <style>{`
        .portfolio-intro { position: relative; background: var(--bg); padding: clamp(7rem, 12vw, 11rem) clamp(1.25rem, 5vw, 4rem) clamp(3rem, 7vw, 6rem); }
        .intro-spread { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 23rem), 1fr)); gap: clamp(2rem, 6vw, 5rem); align-items: center; }
        .intro-kicker { color: var(--muted); font-weight: 700; }
        .intro-name { font: 700 clamp(3.5rem, 7.5vw, 7rem)/1.02 'Sora', sans-serif; letter-spacing: -.065em; margin: .5rem 0 1.25rem; }
        .intro-copy { color: var(--muted); max-width: 45ch; text-wrap: pretty; }
        .intro-actions, .intro-social { display: flex; align-items: center; flex-wrap: wrap; gap: .75rem 1.4rem; }
        .intro-actions { margin: 1.75rem 0 1rem; }
        .intro-actions a, .intro-social a { display: inline-flex; align-items: center; min-height: 44px; }
        .intro-primary { border-radius: 100px; background: var(--text); color: var(--bg); padding: .7rem 1.4rem; font-weight: 700; text-decoration: none; }
        .intro-social a { color: var(--muted); font-size: .875rem; }
        .intro-feature { display: block; min-width: 0; overflow: hidden; background: var(--surface); border: 1px solid var(--border-bright); border-radius: 1.35rem; color: var(--text); text-decoration: none; }
        .intro-art { display: grid; place-items: center; aspect-ratio: 16/10; padding: 1rem; background: linear-gradient(135deg,var(--blue-dim),var(--card)); }
        .intro-art img { width: 100%; height: 100%; min-height: 0; object-fit: contain; }
        .intro-caption { display: grid; gap: .3rem; padding: clamp(1.2rem, 3vw, 2rem); overflow-wrap: anywhere; }
        .intro-caption small { color: var(--muted); }
        .intro-caption strong { font: 700 clamp(1.5rem, 3vw, 2.6rem)/1.15 'Sora', sans-serif; letter-spacing: -.045em; }
        .intro-caption p { margin-top: .5rem; color: var(--muted); }
        .intro-feature:hover strong, .intro-social a:hover { text-decoration: underline; }
        .portfolio-intro a:focus-visible { outline: 3px solid var(--blue); outline-offset: 4px; }
      `}</style>
      <div className="container intro-spread">
        <div>
          <p className="intro-kicker">{t('Desenvolvedor de Software')}</p>
          <h1 className="intro-name">Eric Ikeda</h1>
          <p className="intro-copy">{t("Crio sites, aplicações web e experiências mobile. Explore meus projetos, conheça as tecnologias que uso e veja como transformo ideias em interfaces e funcionalidades.")}</p>
          <div className="intro-actions">
            <a className="intro-primary" href="#experiencia">{t('Ver projetos')}</a>
            <a href="#contato">{t('Vamos conversar')}</a>
          </div>
          <div className="intro-social">
            <a href={content.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href={content.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={`mailto:${content.email}`}>E-mail</a>
          </div>
        </div>
        {featured && (
          <a className="intro-feature" href="#experiencia">
            {featured.image_url && <div className="intro-art"><img src={featured.image_url} alt="" /></div>}
            <div className="intro-caption">
              <small>{t('Projeto')} · {t(featured.type)}</small>
              <strong>{t(featured.name)}</strong>
              {!featured.image_url && <p>{t(featured.description)}</p>}
            </div>
          </a>
        )}
      </div>
    </section>
  )
}
