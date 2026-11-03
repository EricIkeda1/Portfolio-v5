import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getPublicContent } from '@/lib/api'
import { DEFAULT_CONTENT, normalizePortfolioContent, type PortfolioContent } from '@/lib/portfolio'

type PortfolioContentContextValue = {
  content: PortfolioContent
  loading: boolean
  source: 'loading' | 'neon' | 'offline'
  refresh: () => Promise<void>
}

const PortfolioContentContext = createContext<PortfolioContentContextValue | null>(null)

export function PortfolioContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<PortfolioContent>(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'loading' | 'neon' | 'offline'>('loading')

  const inFlight = useRef<Promise<void> | null>(null)
  const refresh = useCallback(() => {
    if (inFlight.current) return inFlight.current
    inFlight.current = (async () => {
    try {
      const next = await getPublicContent()
      setContent(normalizePortfolioContent(next))
      setSource('neon')
    } catch (error) {
      console.warn('Conteúdo público indisponível.', error instanceof Error ? error.message : '')
      setSource('offline')
    } finally {
      setLoading(false)
      inFlight.current = null
    }
    })()
    return inFlight.current
  }, [])

  useEffect(() => {
    void refresh()

    const interval = window.setInterval(() => void refresh(), 30000)
    let channel: BroadcastChannel | null = null

    try {
      channel = new BroadcastChannel('portfolio-content')
      channel.onmessage = (event) => {
        if (event.data?.type === 'refresh') void refresh()
      }
    } catch {
      channel = null
    }

    return () => {
      window.clearInterval(interval)
      channel?.close()
    }
  }, [refresh])

  const value = useMemo<PortfolioContentContextValue>(() => ({ content, loading, source, refresh }), [content, loading, source, refresh])

  return <PortfolioContentContext.Provider value={value}>{children}</PortfolioContentContext.Provider>
}

export function usePortfolioContent() {
  const context = useContext(PortfolioContentContext)
  if (!context) throw new Error('usePortfolioContent precisa estar dentro de PortfolioContentProvider.')
  return context
}
