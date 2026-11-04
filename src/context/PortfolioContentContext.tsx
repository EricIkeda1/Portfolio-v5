import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getPublicContent } from '@/lib/api'
import { DEFAULT_CONTENT, normalizePortfolioContent, type PortfolioContent } from '@/lib/portfolio'

type PortfolioContentContextValue = {
  content: PortfolioContent
  loading: boolean
  refresh: () => Promise<void>
}

const PortfolioContentContext = createContext<PortfolioContentContextValue | null>(null)

export function PortfolioContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<PortfolioContent>(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const next = await getPublicContent()
      setContent(normalizePortfolioContent(next))
    } catch (error) {
      console.warn('Não foi possível carregar o conteúdo do banco. Usando conteúdo padrão.', error)
    } finally {
      setLoading(false)
    }
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

  const value = useMemo<PortfolioContentContextValue>(() => ({ content, loading, refresh }), [content, loading, refresh])

  return <PortfolioContentContext.Provider value={value}>{children}</PortfolioContentContext.Provider>
}

export function usePortfolioContent() {
  const context = useContext(PortfolioContentContext)
  if (!context) throw new Error('usePortfolioContent precisa estar dentro de PortfolioContentProvider.')
  return context
}
