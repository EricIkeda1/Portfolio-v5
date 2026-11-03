import { lazy, Suspense, useEffect, useState, type MouseEvent } from 'react'
import { PortfolioContentProvider, usePortfolioContent } from '@/context/PortfolioContentContext'
import { AboutPage, ContactPage, HomePage, NotFound, PortfolioPage, ProjectPage } from '@/web/Pages'
import { Footer, Header } from '@/web/Chrome'
import { projectSlug, webProjects } from '@/web/projects'
import { pageMeta } from './seo'
import './web/web.css'

const AdminPage = lazy(() => import('@/admin/AdminPage'))

function PublicSite({ pathname }: { pathname: string }) {
  const { content, loading, source, refresh } = usePortfolioContent()
  const projects = webProjects(content.projects)
  let slug = ''
  try { if (pathname.startsWith('/portfolio/')) slug = decodeURIComponent(pathname.slice('/portfolio/'.length)) } catch { /* URL inválida segue para 404. */ }
  const project = projects.find((item) => projectSlug(item) === slug || String(item.id) === slug)
  const meta = pageMeta(pathname, project?.name)
  useEffect(() => {
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', meta.url)
    document.querySelector('meta[name="robots"]')?.setAttribute('content', slug && !project && !loading ? 'noindex, follow' : 'index, follow, max-image-preview:large')
  }, [meta.title, meta.description, meta.url, slug, project, loading])
  const page = pathname === '/' ? <HomePage /> : pathname === '/portfolio' ? <PortfolioPage /> : pathname === '/sobre' ? <AboutPage /> : pathname === '/contato' ? <ContactPage /> : project ? <ProjectPage project={project} /> : slug && loading ? <div className="page-loading wrap" role="status">Carregando projeto...</div> : <NotFound />
  return <div className="public-site"><Header pathname={pathname} /><main id="main-content" tabIndex={-1}>{source === 'offline' && <div className="content-notice wrap" role="status">Não foi possível atualizar o conteúdo. Exibindo a versão de apresentação. <button onClick={() => void refresh()} type="button">Tentar novamente</button></div>}{page}</main><Footer /></div>
}

export default function App({ pathname }: { pathname?: string } = {}) {
  const initial = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
  const [current, setCurrent] = useState(initial.replace(/\/+$/, '') || '/')
  useEffect(() => {
    const pop = () => { setCurrent(window.location.pathname.replace(/\/+$/, '') || '/'); window.scrollTo(0, 0) }
    window.addEventListener('popstate', pop)
    return () => window.removeEventListener('popstate', pop)
  }, [])
  const navigate = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
    const target = (event.target as HTMLElement).closest('a')
    if (!target || target.target || target.hasAttribute('download')) return
    const url = new URL(target.href, window.location.href)
    if (url.origin !== window.location.origin || url.hash || !/^\/(?:portfolio(?:\/[^/]+)?|sobre|contato)?\/?$/.test(url.pathname)) return
    event.preventDefault()
    window.history.pushState({}, '', url)
    setCurrent(url.pathname.replace(/\/+$/, '') || '/')
    window.scrollTo({ top: 0, behavior: 'instant' })
    requestAnimationFrame(() => document.getElementById('main-content')?.focus({ preventScroll: true }))
  }
  if (current === '/admin') return <Suspense fallback={<div className="page-loading">Carregando administração...</div>}><AdminPage /></Suspense>
  return <PortfolioContentProvider><div onClick={navigate}><PublicSite pathname={current} /></div></PortfolioContentProvider>
}
