import { useEffect, useState } from 'react'

const NAME = 'Eric Yuji Ikeda'
export default function TypingName() {
  const [count, setCount] = useState(NAME.length)
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer: ReturnType<typeof setTimeout> | undefined
    let length = NAME.length
    let deleting = true
    const stop = () => { clearTimeout(timer) }
    const tick = () => {
      length += deleting ? -1 : 1
      setCount(length)
      let delay = deleting ? 65 : 110
      if (length === 0) { deleting = false; delay = 550 }
      if (length === NAME.length) { deleting = true; delay = 2200 }
      timer = setTimeout(tick, delay)
    }
    const restart = () => {
      stop(); length = NAME.length; deleting = true; setCount(NAME.length)
      if (!motion.matches && !document.hidden) timer = setTimeout(tick, 2200)
    }
    motion.addEventListener('change', restart)
    document.addEventListener('visibilitychange', restart)
    restart()
    return () => { stop(); motion.removeEventListener('change', restart); document.removeEventListener('visibilitychange', restart) }
  }, [])
  return <h1 className="links-typing-name" aria-label={NAME}>
    <span className="links-name-reserve" aria-hidden="true">{NAME}</span>
    <span className="links-name-typed" aria-hidden="true">{NAME.slice(0, count)}<span className="links-name-caret" /></span>
  </h1>
}
