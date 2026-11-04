import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getPublicContent } from '@/lib/api'
import { DEFAULT_CONTENT, type PortfolioContent } from '@/lib/portfolio'

type PortfolioContentContextValue = {
  content: PortfolioContent
  loading: boolean
  error: boolean
  refresh: () => Promise<void>
}
const PortfolioContentContext = createContext<PortfolioContentContextValue | null>(null)
export function PortfolioContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<PortfolioContent>({ ...DEFAULT_CONTENT, projects: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const alive = useRef(false)
  const lastSuccess = useRef(0)
  const signature = useRef('')
  const refresh = useCallback(async () => {
    try {
      const next = await getPublicContent()
      if (!alive.current) return
      const nextSignature = JSON.stringify(next)
      if (signature.current !== nextSignature) {
        signature.current = nextSignature
        setContent(next)
      }
      lastSuccess.current = Date.now()
      setError(false)
    } catch {
      if (alive.current) setError(true)
    } finally {
      if (alive.current) setLoading(false)
    }
  }, [])
  useEffect(() => {
    alive.current = true
    void refresh()
    // Revalidate on return, instead of polling an idle tab every 30 seconds.
    const onReturn = () => { if (document.visibilityState === 'visible' && Date.now() - lastSuccess.current > 120_000) void refresh() }
    window.addEventListener('focus', onReturn)
    document.addEventListener('visibilitychange', onReturn)
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('portfolio-content')
      channel.onmessage = event => { if (event.data?.type === 'refresh') void refresh() }
    } catch { /* Older browsers refresh when the tab regains focus. */ }
    return () => {
      alive.current = false
      window.removeEventListener('focus', onReturn)
      document.removeEventListener('visibilitychange', onReturn)
      channel?.close()
    }
  }, [refresh])
  const value = useMemo(() => ({ content, loading, error, refresh }), [content, loading, error, refresh])
  return <PortfolioContentContext.Provider value={value}>{children}</PortfolioContentContext.Provider>
}
export function usePortfolioContent() {
  const context = useContext(PortfolioContentContext)
  if (!context) throw new Error('usePortfolioContent precisa estar dentro de PortfolioContentProvider.')
  return context
}
