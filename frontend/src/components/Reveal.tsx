import { useRef, useEffect, useState, type ReactNode, type CSSProperties, type ElementType } from 'react'

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

const origins: Record<string, string> = {
  bottom: 'translateY(28px)',
  left: 'translateX(-28px)',
  right: 'translateX(28px)',
  scale: 'translateY(16px) scale(0.97)',
  fade: 'translateY(0px)',
}

export function Reveal({
  children,
  delay = 0,
  from = 'bottom',
  duration = 600,
  threshold = 0.1,
  as: Tag = 'div',
  style,
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  const base: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0) translateX(0) scale(1)' : origins[from],
    transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    willChange: 'opacity, transform',
    ...style,
  }

  return (
    <Tag ref={ref} style={base} className={className}>
      {children}
    </Tag>
  )
}

/** Stagger a list of children with sequential delays */
export function RevealGroup({
  children,
  stagger = 80,
  from = 'bottom',
  duration = 600,
  threshold = 0.08,
  baseDelay = 0,
  as: Tag = 'div',
  style,
  className,
}: {
  children: ReactNode[]
  stagger?: number
  from?: RevealProps['from']
  duration?: number
  threshold?: number
  baseDelay?: number
  as?: ElementType
  style?: CSSProperties
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <Tag ref={ref} style={style} className={className}>
      {(children as ReactNode[]).map((child, i) => (
        <div
          key={i}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : origins[from ?? 'bottom'],
            transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${baseDelay + i * stagger}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${baseDelay + i * stagger}ms`,
            willChange: 'opacity, transform',
          }}
        >
          {child}
        </div>
      ))}
    </Tag>
  )
}
