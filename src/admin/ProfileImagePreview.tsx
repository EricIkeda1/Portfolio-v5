import { useState } from 'react'

function draftImageSource(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return ''
    if (url.hostname === 'drive.google.com') {
      const id = url.pathname.match(/^\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get('id')
      return id ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(id)}=w320` : ''
    }
    return url.href
  } catch {
    return ''
  }
}

function PreviewImage({ source, draft }: { source: string; draft: boolean }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  if (!source) return <p role="status">Informe uma URL HTTPS de imagem para visualizar a foto.</p>
  return <>
    <div className="admin-profile-photo-wrap">
      {status !== 'error' && <img key={attempt} src={source} alt="Pré-visualização do perfil" referrerPolicy="no-referrer" onLoad={() => setStatus('loaded')} onError={() => setStatus('error')} />}
    </div>
    {status === 'loading' && <p role="status">Carregando foto…</p>}
    {status === 'error' && <div role="status"><p>{draft ? 'Não foi possível visualizar este link. Confira se a imagem está pública. A foto salva é carregada pelo servidor.' : 'Não foi possível carregar a foto salva. Confira a permissão de acesso ao arquivo.'}</p><button type="button" className="admin-ghost-action" onClick={() => { setAttempt(attempt + 1); setStatus('loading') }}>Tentar novamente</button></div>}
  </>
}

export default function ProfileImagePreview({ value, savedValue }: { value: string; savedValue: string }) {
  const draft = value.trim() !== savedValue.trim()
  // Saved Drive files use the same first-party endpoint as the public portfolio.
  const source = value.trim() && !draft ? `/api/profile-image?preview=${encodeURIComponent(savedValue)}` : draftImageSource(value.trim())
  return <PreviewImage key={source} source={source} draft={draft} />
}
