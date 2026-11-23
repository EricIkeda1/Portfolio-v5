import { useEffect, useState } from 'react'
import { useTranslation } from '../i18n/LanguageContext'
const key = 'portfolio-journey-v1'
const missions = [
  ['sobre', 'Conhecer minha história', '#sobre'],
  ['experiencia', 'Explorar os projetos', '#experiencia'],
  ['project', 'Abrir um projeto', '#experiencia'],
  ['habilidades', 'Conhecer a stack', '#habilidades'],
  ['formacao', 'Ver minha formação', '#formacao'],
  ['navigation', 'Navegar pelo menu', '#inicio'],
  ['theme', 'Experimentar outro tema', '#inicio'],
  ['language', 'Trocar o idioma', '#inicio'],
  ['menu', 'Conferir suas conquistas', '#jornada'],
  ['about', 'Ler mais sobre meu trabalho', '#sobre'],
  ['store', 'Visitar a loja real', '#inicio'],
  ['history', 'Abrir uma versão do portfólio', '#evolucao'],
  ['github', 'Explorar meu GitHub', '#sobre'],
  ['source', 'Visitar o código de um projeto', '#experiencia'],
  ['quarter', 'Explorar 25% da página', '#sobre'],
  ['half', 'Explorar metade da página', '#experiencia'],
  ['threequarters', 'Explorar 75% da página', '#formacao'],
  ['end', 'Chegar ao final do site', '#contato'],
 ] as const
const points = (id: string) => ['sobre','experiencia','project','habilidades','formacao','end'].includes(id) ? 20 : 10
const total = missions.reduce((sum,[id])=>sum+points(id),0)
export default function PortfolioJourney({ onProgress }: { onProgress: (xp: number) => void }) {
  const { t } = useTranslation()
  const [active, setActive] = useState(false)
  const [done, setDone] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem(key) || 'null'); if (Array.isArray(saved)) { setDone(missions.map(([id])=>id).filter(id=>saved.includes(id))); setActive(true) } } catch { /* Storage is optional. */ }
    setReady(true)
  }, [])
  const xp = done.reduce((sum,id)=>sum+points(id),0)
  useEffect(() => { onProgress(active ? xp : 0) }, [active, xp, onProgress])
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
    const click = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target) return
      const rules = [
        ['.pf-nav nav a', 'navigation'], ['.pf-theme','theme'],
        ['.pf-journey details:not([open]) summary','menu'],
        ['.pf-about details:not([open]) summary','about'],
        ['.pf-live-preview a','store'], ['.pf-evolution a[target]','history'],
        ['.pf-stats>a','github'], ['.pf-dialog-copy>a','source'],
      ]
      rules.forEach(([selector,id])=>{if(target.closest(selector)) unlock(id)})
    }
    const change = (event: Event) => { if(event.target instanceof Element && event.target.closest('.pf-nav .language-selector select')) unlock('language') }
    let frame = 0
    const measure = () => {
      frame = 0
      const range = document.documentElement.scrollHeight - window.innerHeight
      if (range <= 0) return
      const progress = window.scrollY / range
      if(progress >= .25) unlock('quarter')
      if(progress >= .5) unlock('half')
      if(progress >= .75) unlock('threequarters')
      if(progress >= .99) unlock('end')
    }
    const scroll = () => { if(!frame) frame = requestAnimationFrame(measure) }
    document.addEventListener('click', click, true)
    document.addEventListener('change', change)
    window.addEventListener('scroll', scroll, {passive:true})
    measure()
    window.addEventListener('portfolio-project-open', project)
    return () => { observer.disconnect(); window.removeEventListener('portfolio-project-open', project); document.removeEventListener('click',click,true); document.removeEventListener('change',change); window.removeEventListener('scroll',scroll); cancelAnimationFrame(frame) }
  }, [active])
  function reset() { setActive(false); setDone([]); try { localStorage.removeItem(key) } catch { /* Optional storage. */ } }
  return <aside id="jornada" className="pf-journey" aria-label={t('Explore o portfólio')}>
    <div className="pf-journey-heading"><div><strong>{t(done.length === missions.length ? 'Explorador completo' : 'Explore o portfólio')}</strong><p>{t('Conheça meu trabalho e desbloqueie conquistas.')}</p></div>{!active ? <button type="button" onClick={()=>setActive(true)}>{t('Começar jornada')}</button> : <span aria-live="polite">{xp} / {total} XP</span>}</div>
    {active && <><progress value={xp} max={total} aria-label={t('Progresso da exploração')}/><details><summary>{t('Suas conquistas')} · {done.length}/{missions.length}</summary><ul>{missions.map(([id,label,href])=><li key={id} data-complete={done.includes(id)}><a href={href}><span aria-hidden="true">{done.includes(id) ? '✓' : '○'}</span>{t(label)}</a><small>{points(id)} XP</small></li>)}</ul><p>{t('Cada conquista vale pontos uma vez. Progresso salvo apenas neste navegador. Sem cadastro.')}</p><button type="button" onClick={reset}>{t('Apagar progresso')}</button></details></>}
  </aside>
}
