import { Children, useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from '../i18n/LanguageContext'
export default function ProjectCarousel({ children, count }: { children: ReactNode; count: number }) {
  const { t } = useTranslation()
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  useEffect(() => {
    const node = track.current
    if (!node) return
    let frame = 0
    const sync = () => {
      frame = 0
      const center = node.getBoundingClientRect().left + node.clientWidth / 2
      let closest = 0, distance = Infinity
      Array.from(node.children).forEach((child,index) => {
        const rect = child.getBoundingClientRect()
        const delta = Math.abs(rect.left + rect.width / 2 - center)
        if(delta < distance){distance=delta;closest=index}
      })
      setActive(closest)
    }
    const schedule = () => { if(!frame) frame=requestAnimationFrame(sync) }
    const observer = new ResizeObserver(schedule)
    observer.observe(node)
    node.addEventListener('scroll', schedule, { passive: true })
    sync()
    return () => { observer.disconnect(); node.removeEventListener('scroll', schedule);cancelAnimationFrame(frame) }
  }, [count])
  function move(index: number) {
    const node = track.current
    const slide = node?.children[index]
    if (!node || !slide) return
    const rect = slide.getBoundingClientRect(), box = node.getBoundingClientRect()
    node.scrollBy({ left: rect.left + rect.width/2 - box.left - node.clientWidth/2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <div className="pf-carousel pf-coverflow" role="region" aria-roledescription="carrossel" aria-label={t('Projetos')}>
    <div ref={track} id="project-carousel-track" className="pf-coverflow-track">
      {Children.toArray(children).map((child,index)=><div className="pf-coverflow-slide" key={index} data-side={index===active?'active':index<active?'left':'right'} role="group" aria-label={`${index+1} / ${count}`}>{child}</div>)}
    </div>
    {count > 1 && <div className="pf-coverflow-controls"><button type="button" onClick={()=>move(active-1)} disabled={active===0} aria-label={t('Anterior')} aria-controls="project-carousel-track">‹</button><div><span aria-live="polite">{String(active+1).padStart(2,'0')} / {String(count).padStart(2,'0')}</span><div className="pf-coverflow-dots">{Array.from({length:count},(_,index)=><button type="button" key={index} onClick={()=>move(index)} aria-label={`${t('Projetos')} ${index+1}`} aria-current={index===active?'true':undefined}/>)}</div></div><button type="button" onClick={()=>move(active+1)} disabled={active===count-1} aria-label={t('Próximo')} aria-controls="project-carousel-track">›</button></div>}
  </div>
}
