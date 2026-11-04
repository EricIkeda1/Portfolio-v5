import { useEffect, useRef, type ReactNode, type CSSProperties, type ElementType } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  from?: 'bottom' | 'left' | 'right' | 'scale' | 'fade'
  distance?: number
  duration?: number
  threshold?: number
  as?: ElementType
  style?: CSSProperties
  className?: string
}
// Content stays visible during SSR, without JavaScript and with reduced motion.
// Web Animations runs once on intersection; React doesn't render on animation frames.
export function Reveal({ children, delay = 0, duration = 550, threshold = 0.08, as: Tag = 'div', style, className }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !el.animate || !('IntersectionObserver' in window)) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches) return
    let animation: Animation | undefined
    const cancel = () => { if (motion.matches) animation?.cancel() }
    motion.addEventListener('change', cancel)
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      if (!motion.matches) animation = el.animate([{ opacity: 0.45, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration, delay: Math.min(delay, 180), easing: 'cubic-bezier(.22,1,.36,1)' })
    }, { threshold })
    observer.observe(el)
    return () => { observer.disconnect(); motion.removeEventListener('change', cancel); animation?.cancel() }
  }, [delay, duration, threshold])
  return <Tag ref={ref} style={style} className={className}>{children}</Tag>
}
export function RevealGroup({ children, stagger = 50, baseDelay = 0, as: Tag = 'div', style, className }: { children: ReactNode[]; stagger?: number; from?: RevealProps['from']; duration?: number; threshold?: number; baseDelay?: number; as?: ElementType; style?: CSSProperties; className?: string }) {
  return <Tag style={style} className={className}>{children.map((child, index) => <Reveal key={index} delay={baseDelay + index * stagger}>{child}</Reveal>)}</Tag>
}
