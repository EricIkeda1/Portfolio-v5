import { Children, useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from '../i18n/LanguageContext'
export default function ProjectCarousel({ children, count }: { children: ReactNode; count: number }) {
  const { t } = useTranslation()
  const track = useRef<HTMLDivElement>(null)
  const current = useRef(count)
  const [physical, setPhysical] = useState(count)
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  const [touch, setTouch] = useState(false)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [hidden, setHidden] = useState(false)
  const active = count ? ((physical % count) + count) % count : 0
  const items = Children.toArray(children)
  const slides = count > 1 ? [...items, ...items, ...items] : items
  function go(index: number, instant = false) {
    const node = track.current, slide = node?.children[index]
    if (!node || !slide) return
    const rect = slide.getBoundingClientRect(), box = node.getBoundingClientRect()
    node.scrollBy({left: rect.left + rect.width/2 - box.left - node.clientWidth/2, behavior: instant || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})
  }
  useEffect(() => {
    const node = track.current
    if (!node) return
    let frame = 0, settle: ReturnType<typeof setTimeout> | undefined
    const sync = () => {
      frame = 0
      const center = node.getBoundingClientRect().left + node.clientWidth / 2
      let closest = 0, distance = Infinity
      Array.from(node.children).forEach((child,index) => {
        const rect = child.getBoundingClientRect(), delta = Math.abs(rect.left + rect.width/2 - center)
        if(delta < distance){distance=delta;closest=index}
      })
      current.current=closest;setPhysical(closest)
    }
    const recenter = () => {
      const index=current.current
      if(count>1 && (index<count || index>=count*2)) {
        const middle=count+index%count
        current.current=middle;setPhysical(middle);go(middle,true)
      }
    }
    const scroll = () => { if(!frame)frame=requestAnimationFrame(sync);clearTimeout(settle);settle=setTimeout(recenter,180) }
    current.current=count>1?count:0;setPhysical(current.current);go(current.current,true)
    const resize = new ResizeObserver(()=>go(current.current,true));resize.observe(node)
    let entered = false
    const observer = new IntersectionObserver(entries=>{
      const inView=entries.some(e=>e.intersectionRatio>=.65)
      if(inView && !entered){entered=true;current.current=count>1?count:0;setPhysical(current.current);go(current.current,true)}
      setVisible(inView)
    },{threshold:[0,.65]});observer.observe(node)
    const media=matchMedia('(prefers-reduced-motion: reduce)')
    const preference=()=>setReduced(media.matches)
    const visibility=()=>setHidden(document.hidden)
    preference();visibility()
    media.addEventListener('change',preference);document.addEventListener('visibilitychange',visibility)
    node.addEventListener('scroll',scroll,{passive:true})
    return()=>{resize.disconnect();observer.disconnect();node.removeEventListener('scroll',scroll);media.removeEventListener('change',preference);document.removeEventListener('visibilitychange',visibility);cancelAnimationFrame(frame);clearTimeout(settle)}
  },[count])
  const playing=count>1 && !hover && !focus && !touch && visible && !reduced && !hidden
  useEffect(()=>{
    if(!playing)return
    const timer=setInterval(()=>{if(!document.querySelector('dialog[open]'))go(current.current+1)},3000)
    return()=>clearInterval(timer)
  },[playing,physical])
  return <div className="pf-carousel pf-coverflow" role="region" aria-roledescription="carrossel" aria-label={t('Projetos')} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocusCapture={()=>setFocus(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocus(false)}}>
    <div ref={track} id="project-carousel-track" className="pf-coverflow-track" onPointerDown={()=>setTouch(true)} onPointerUp={()=>setTouch(false)} onPointerCancel={()=>setTouch(false)} onPointerLeave={()=>setTouch(false)}>
      {slides.map((child,index)=><div className="pf-coverflow-slide" key={index} data-side={index===physical?'active':index<physical?'left':'right'} inert={index!==physical} role="group" aria-label={`${index%count+1} / ${count}`}>{child}</div>)}
    </div>
    {count>1&&<div className="pf-coverflow-controls"><button type="button" onClick={()=>go(current.current-1)} aria-label={t('Anterior')}>‹</button><div><span aria-live={playing?'off':'polite'}>{String(active+1).padStart(2,'0')} / {String(count).padStart(2,'0')}</span><div className="pf-coverflow-dots">{items.map((_,index)=><button type="button" key={index} onClick={()=>go(count+index)} aria-label={`${t('Projetos')} ${index+1}`} aria-current={index===active?'true':undefined}/>)}</div></div><button type="button" onClick={()=>go(current.current+1)} aria-label={t('Próximo')}>›</button></div>}
  </div>
}
