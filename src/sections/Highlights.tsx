import { useEffect, useRef, useState } from 'react'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { ArrowIcon } from '@/components/Icons'

type Stats = { repos: number; since: number }
export default function Highlights() {
  const { content, loading, error } = usePortfolioContent()
  const root = useRef<HTMLElement>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const url = new URL(content.github)
        if (url.hostname !== 'github.com') return
        const username = url.pathname.split('/').filter(Boolean)[0]
        if (!username) return
        const cacheKey = `github-stats:${username}`
        try {
          const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null')
          if (cached && Date.now() - cached.time < 600_000 && Number.isFinite(cached.value?.repos) && Number.isFinite(cached.value?.since)) { setStats(cached.value); return }
        } catch { /* Storage is optional. */ }
        const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { signal: controller.signal })
        if (!response.ok) return
        const data = await response.json()
        const value = { repos: Number(data.public_repos), since: new Date(data.created_at).getFullYear() }
        if (!Number.isFinite(value.repos) || !Number.isFinite(value.since)) return
        if (!controller.signal.aborted) setStats(value)
        try { sessionStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), value })) } catch { /* Storage is optional. */ }
      } catch { /* The GitHub link remains available when rate limited or offline. */ }
    }
    if (!('IntersectionObserver' in window)) { void load(); return () => controller.abort() }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { observer.disconnect(); void load() } }, { rootMargin: '200px' })
    if (root.current) observer.observe(root.current)
    return () => { observer.disconnect(); controller.abort() }
  }, [content.github])
  const projects = content.projects.filter(p => p.published !== false)
  const tags = new Set(projects.flatMap(p => p.tags))
  return <section ref={root} className="section-pad github-section"><div className="container github-panel"><div><span className="eyebrow">04 / Além das interfaces</span><h2>O código também<br />conta a história.</h2><a className="text-link" href={content.github} target="_blank" rel="noopener noreferrer">Explore meu GitHub <ArrowIcon diagonal /></a></div><div className="stats-grid"><div><strong>{stats?.repos ?? '—'}</strong><span>repositórios públicos</span></div><div><strong>{loading || error ? '—' : projects.length}</strong><span>projetos no portfólio</span></div><div><strong>{loading || error ? '—' : tags.size}</strong><span>tecnologias e temas</span></div><div><strong>{stats?.since ?? '—'}</strong><span>início no GitHub</span></div></div></div></section>
}
