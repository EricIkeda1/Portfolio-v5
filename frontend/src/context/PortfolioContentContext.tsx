import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_CONTENT, type PortfolioContent } from '@/lib/portfolio'

type PortfolioContentContextValue = {
  content: PortfolioContent
  loading: boolean
  refresh: () => Promise<void>
}

const PortfolioContentContext = createContext<PortfolioContentContextValue | null>(null)

export function PortfolioContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<PortfolioContent>(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const response = await fetch('/api/content', { cache: 'no-store' })
      if (!response.ok) throw new Error('Não foi possível carregar o conteúdo do portfólio.')
      const data = (await response.json()) as PortfolioContent
      setContent({
        about_text: data.about_text || DEFAULT_CONTENT.about_text,
        whatsapp: data.whatsapp || DEFAULT_CONTENT.whatsapp,
        projects: Array.isArray(data.projects) && data.projects.length > 0 ? data.projects : DEFAULT_CONTENT.projects,
      })
    } catch {
      setContent(DEFAULT_CONTENT)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const value = useMemo(() => ({ content, loading, refresh }), [content, loading])

  return <PortfolioContentContext.Provider value={value}>{children}</PortfolioContentContext.Provider>
}

export function usePortfolioContent() {
  const context = useContext(PortfolioContentContext)
  if (!context) throw new Error('usePortfolioContent precisa estar dentro de PortfolioContentProvider.')
  return context
}
