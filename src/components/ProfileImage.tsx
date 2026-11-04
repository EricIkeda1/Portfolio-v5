import { useState } from 'react'
import { usePortfolioContent } from '@/context/PortfolioContentContext'

export function ProfileImage({ eager = false }: { eager?: boolean }) {
  const { content } = usePortfolioContent()
  const version = content.updated_at ? `?v=${encodeURIComponent(content.updated_at)}` : ''
  return <RemoteProfileImage key={version} version={version} eager={eager} />
}

function RemoteProfileImage({ version, eager }: { version: string; eager: boolean }) {
  const [failed, setFailed] = useState(false)
  return failed ? <div className="portrait-fallback" role="img" aria-label="Eric Ikeda"><span>EI<span className="accent-dot">.</span></span></div> : <img src={`/api/profile-image${version}`} alt="Eric Ikeda" width="560" height="640" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" onError={() => setFailed(true)} />
}
