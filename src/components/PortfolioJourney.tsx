import { useEffect, useState } from 'react'
import { useTranslation } from '../i18n/LanguageContext'
const key = 'portfolio-journey-v1'
const missions = [
  ['sobre', 'Conhecer minha história', '#sobre'],
  ['experiencia', 'Explorar os projetos', '#experiencia'],
  ['project', 'Abrir um projeto', '#experiencia'],
  ['habilidades', 'Conhecer a stack', '#habilidades'],
  ['formacao', 'Ver minha formação', '#formacao'],
] as const
export default function PortfolioJourney() {
  const { t } = useTranslation()
  const [active, setActive] = useState(false)
  const [done, setDone] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem(key) || 'null'); if (Array.isArray(saved)) { setDone(missions.map(([id])=>id).filter(id=>saved.includes(id))); setActive(true) } } catch { /* Storage is optional. */ }
    setReady(true)
  }, [])
  useEffect(() => {
    if (!active || !ready) return
    try { localStorage.setItem(key, JSON.stringify(done)) } catch { /* Continue in memory. */ }
  }, [active, ready, done])
  useEffect(() => {
    if (!active) return
    const unlock = (id: string) => setDone(previous => previous.includes(id) ? previous : [...previous, id])
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { unlock(entry.target.id); observer.unobserve(entry.target) }
    }), { threshold: .15 })
    missions.forEach(([id]) => { const section = document.getElementById(id); if (section) observer.observe(section) })
    const project = () => unlock('project')
    window.addEventListener('portfolio-project-open', project)
    return () => { observer.disconnect(); window.removeEventListener('portfolio-project-open', project) }
  }, [active])
  function reset() { setActive(false); setDone([]); try { localStorage.removeItem(key) } catch { /* Optional storage. */ } }
  return <aside className="pf-journey" aria-label={t('Explore o portfólio')}>
    <div className="pf-journey-heading"><div><strong>{t(done.length === 5 ? 'Explorador completo' : 'Explore o portfólio')}</strong><p>{t('Conheça meu trabalho e desbloqueie conquistas.')}</p></div>{!active ? <button type="button" onClick={()=>setActive(true)}>{t('Começar jornada')}</button> : <span aria-live="polite">{done.length * 20} / 100 XP</span>}</div>
    {active && <><progress value={done.length} max={5} aria-label={t('Progresso da exploração')}/><details><summary>{t('Suas conquistas')} · {done.length}/5</summary><ul>{missions.map(([id,label,href])=><li key={id} data-complete={done.includes(id)}><a href={href}><span aria-hidden="true">{done.includes(id) ? '✓' : '○'}</span>{t(label)}</a><small>20 XP</small></li>)}</ul><p>{t('Progresso salvo apenas neste navegador. Sem cadastro.')}</p><button type="button" onClick={reset}>{t('Apagar progresso')}</button></details></>}
  </aside>
}
