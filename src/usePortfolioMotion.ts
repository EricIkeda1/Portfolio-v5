import { useEffect, type RefObject } from 'react'

/** Subtle depth without taking over native scrolling or a continuous render loop. */
export function usePortfolioMotion(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const node = root.current
    if (!node) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const fine = matchMedia('(hover: hover) and (pointer: fine)')
    const hero = node.querySelector<HTMLElement>('.pf-hero')
    const art = node.querySelector<HTMLElement>('.pf-hero-art')
    let frame = 0
    let x = 0, y = 0
    const paint = () => {
      frame = 0
      if (!hero || !art || reduced.matches) return
      const rect = hero.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > innerHeight) return
      const progress = Math.max(0, Math.min(1, -rect.top / rect.height))
      art.style.setProperty('--motion-y', `${progress * (fine.matches ? 35 : 12)}px`)
      art.style.setProperty('--motion-rx', `${y * -1.6}deg`)
      art.style.setProperty('--motion-ry', `${x * 2}deg`)
    }
    const schedule = () => { if (!frame && !reduced.matches) frame = requestAnimationFrame(paint) }
    const pointer = (event: PointerEvent) => {
      if (!fine.matches || reduced.matches || !hero) return
      const rect = hero.getBoundingClientRect()
      x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1))
      y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1))
      schedule()
    }
    const reset = () => { x = 0; y = 0; schedule() }
    const preference = () => {
      cancelAnimationFrame(frame); frame = 0
      if (reduced.matches) art?.removeAttribute('style')
      else schedule()
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    hero?.addEventListener('pointermove', pointer, { passive: true })
    hero?.addEventListener('pointerleave', reset)
    reduced.addEventListener('change', preference)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      hero?.removeEventListener('pointermove', pointer)
      hero?.removeEventListener('pointerleave', reset)
      reduced.removeEventListener('change', preference)
    }
  }, [root])
}
