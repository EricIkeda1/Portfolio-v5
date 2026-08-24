import { useEffect, useState, type CSSProperties } from 'react'

type ProtectedLogoProps = {
  className?: string
  style?: CSSProperties
  alt?: string
  loading?: 'eager' | 'lazy'
}

export default function ProtectedLogo({
  className,
  style,
  alt = 'Logo Eric Y. Ikeda',
  loading = 'eager',
}: ProtectedLogoProps) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let objectUrl: string | null = null

    const load = async () => {
      try {
        const response = await fetch('/api/logo-image', {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'image/*' },
        })

        if (!response.ok) return

        const blob = await response.blob()
        if (blob.type && !blob.type.toLowerCase().startsWith('image/')) return

        objectUrl = URL.createObjectURL(blob)
        if (active) setSrc(objectUrl)
      } catch {
        return
      }
    }

    void load()

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [])

  if (!src) {
    return <span className={className} aria-hidden="true" style={{ ...style, display: 'inline-block' }} />
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      draggable={false}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
      style={{
        ...style,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    />
  )
}
