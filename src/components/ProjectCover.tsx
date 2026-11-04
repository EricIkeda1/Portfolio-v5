import { memo, useState, type CSSProperties } from 'react'
import type { PortfolioProject } from '@/lib/portfolio'

function imageSource(value?: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (!['https:', 'http:'].includes(url.protocol)) return null
    if (url.hostname === 'drive.google.com') {
      const id = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get('id')
      if (id) {
        const base = `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}`
        return { src: `${base}&sz=w1200`, srcSet: `${base}&sz=w600 600w, ${base}&sz=w1200 1200w` }
      }
    }
    return { src: url.href, srcSet: undefined }
  } catch { return null }
}

export const ProjectCover = memo(function ProjectCover({ project, index, eager = false, mobile = false }: { project: PortfolioProject; index: number; eager?: boolean; mobile?: boolean }) {
  let localPreview: string | null = null
  try {
    const host = new URL(project.github).hostname
    if (host === 'webshopeyi.vercel.app') localPreview = mobile ? '/previews/webshop-mobile.webp' : '/previews/webshop.webp'
    if (host === 'blogjovemribeiro.vercel.app') localPreview = '/previews/gallery.webp'
  } catch { /* Projects may not have an external link. */ }
  const source = imageSource(project.image_url || localPreview && `https://www.ericyikeda.com.br${localPreview}`)
  if (source && !project.image_url && localPreview) source.src = localPreview
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const color = /^#[0-9a-f]{6}$/i.test(project.color) ? project.color : '#477867'
  return <div className={`project-cover cover-${index % 4}`} style={{ '--project-color': color } as CSSProperties}>
    {source && failedSource !== source.src ? <img src={source.src} srcSet={source.srcSet} sizes="(max-width: 768px) 90vw, 600px" alt={`Prévia de ${project.name}`} width="1200" height="900" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" onError={() => setFailedSource(source.src)} /> : <div className="project-cover-type"><span className="cover-category">{project.type}</span><span className="cover-monogram" aria-hidden="true">{project.name.split(/\s+/).slice(0, 2).map(w => w[0]).join('')}<i>.</i></span><span className="cover-project-name">{project.name}</span><span className="cover-tech">{project.tags.slice(0, 3).join(' / ') || 'Projeto acadêmico'}</span></div>}
    <span className="cover-index" aria-hidden="true">{String(index + 1).padStart(2, '0')} / EYI</span>
  </div>
})
