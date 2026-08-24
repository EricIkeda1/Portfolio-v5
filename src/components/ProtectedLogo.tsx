import type { CSSProperties } from 'react'

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
  return (
    <img
      src="/api/logo-image"
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      fetchPriority={loading === 'eager' ? 'high' : 'auto'}
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
