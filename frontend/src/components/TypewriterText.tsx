import { useState, useEffect } from 'react'

interface Segment {
  text: string
  color?: string
}

interface TypewriterTextProps {
  segments: Segment[]
  speed?: number
  startDelay?: number
  cursor?: boolean
  onDone?: () => void
}

export function TypewriterText({ segments, speed = 65, startDelay = 300, cursor = true, onDone }: TypewriterTextProps) {
  const fullText = segments.map((s) => s.text).join('')
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay)
    return () => clearTimeout(t)
  }, [startDelay])

  useEffect(() => {
    if (!started || count >= fullText.length) return
    const t = setTimeout(() => {
      setCount((c) => c + 1)
    }, speed)
    return () => clearTimeout(t)
  }, [started, count, fullText.length, speed])

  useEffect(() => {
    if (count >= fullText.length && fullText.length > 0) {
      setDone(true)
      onDone?.()
    }
  }, [count, fullText.length, onDone])

  // Build display segments from character count
  let remaining = count
  const rendered: { text: string; color?: string }[] = []
  for (const seg of segments) {
    if (remaining <= 0) break
    const slice = seg.text.slice(0, remaining)
    rendered.push({ text: slice, color: seg.color })
    remaining -= slice.length
  }

  return (
    <span>
      {rendered.map((r, i) => (
        <span key={i} style={r.color ? { color: r.color } : undefined}>
          {r.text}
        </span>
      ))}
      {cursor && (
        <span
          style={{
            display: 'inline-block',
            width: '3px',
            background: 'var(--blue)',
            marginLeft: 6,
            borderRadius: 1,
            verticalAlign: 'middle',
            height: '0.8em',
            animation: done ? 'cursorBlink 1s step-end infinite' : 'none',
            opacity: done ? undefined : 1,
          }}
        />
      )}
      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </span>
  )
}
