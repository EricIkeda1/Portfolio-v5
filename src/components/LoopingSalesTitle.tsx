import { useEffect, useRef, useState } from 'react'

const firstLine = 'Sites com identidade.'
const secondLine = 'Não apenas presença.'
const total = firstLine.length + secondLine.length

export default function LoopingSalesTitle() {
  const title = useRef<HTMLHeadingElement>(null)
  const [count, setCount] = useState(total)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer: number | undefined
    let count = 0
    let deleting = false
    let visible = true
    let delay = 350
    const tick = () => {
      count += deleting ? -1 : 1
      setCount(count)
      delay = deleting ? 32 : 65
      if (count === total) { deleting = true; delay = 2200 }
      if (count === 0) { deleting = false; delay = 650 }
      schedule()
    }
    const schedule = () => {
      window.clearTimeout(timer)
      if (visible && !document.hidden && !reducedMotion.matches) timer = window.setTimeout(tick, delay)
    }
    const configure = () => {
      count = reducedMotion.matches ? total : 0
      deleting = false
      delay = 350
      setCount(count)
      schedule()
    }
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      schedule()
    }) : null
    if (title.current) observer?.observe(title.current)
    reducedMotion.addEventListener('change', configure)
    document.addEventListener('visibilitychange', schedule)
    configure()
    return () => {
      window.clearTimeout(timer)
      observer?.disconnect()
      reducedMotion.removeEventListener('change', configure)
      document.removeEventListener('visibilitychange', schedule)
    }
  }, [])

  return (
    <h1 ref={title} className="sales-typing-title" aria-label={`${firstLine} ${secondLine}`}>
      <span className="sales-type-line" aria-hidden="true">
        <span className="sales-type-reserve">{firstLine}</span>
        <span className="sales-type-visible">{firstLine.slice(0, count)}{count <= firstLine.length && <i className={`sales-type-caret ${count === 0 || count === total ? 'is-paused' : ''}`}>|</i>}</span>
      </span>
      <span className="sales-type-line" aria-hidden="true">
        <em className="sales-type-reserve">{secondLine}</em>
        <em className="sales-type-visible">{secondLine.slice(0, Math.max(0, count - firstLine.length))}{count > firstLine.length && <i className={`sales-type-caret ${count === 0 || count === total ? 'is-paused' : ''}`}>|</i>}</em>
      </span>
    </h1>
  )
}
