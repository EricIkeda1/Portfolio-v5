import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from '../i18n/LanguageContext'
export default function ProjectCarousel({ children, count }: { children: ReactNode; count: number }) {
  const { t } = useTranslation()
  const track = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ start: true, end: false })
  useEffect(() => {
    const node = track.current
    if (!node) return
    const sync = () => setPosition({ start: node.scrollLeft < 2, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 2 })
    const observer = new ResizeObserver(sync)
    observer.observe(node)
    node.addEventListener('scroll', sync, { passive: true })
    sync()
    return () => { observer.disconnect(); node.removeEventListener('scroll', sync) }
  }, [count])
  function move(direction: number) {
    const node = track.current
    if (!node) return
    const card = node.firstElementChild as HTMLElement | null
    const step = card ? card.offsetWidth + parseFloat(getComputedStyle(node).columnGap || '0') : node.clientWidth
    node.scrollBy({ left: direction * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <div className="pf-carousel" role="region" aria-roledescription="carrossel" aria-label={t('Projetos')}>
    <div ref={track} id="project-carousel-track" className="pf-project-grid pf-carousel-track">{children}</div>
    {count > 1 && <div className="pf-carousel-controls"><button type="button" onClick={()=>move(-1)} disabled={position.start} aria-controls="project-carousel-track">{t('Anterior')}</button><span>{count} {t('Projetos')}</span><button type="button" onClick={()=>move(1)} disabled={position.end} aria-controls="project-carousel-track">{t('Próximo')}</button></div>}
  </div>
}
