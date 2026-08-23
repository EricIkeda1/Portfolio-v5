import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { DEFAULT_CONTENT, type PortfolioContent } from '@/lib/portfolio'

type PortfolioContentContextValue = {
  content: PortfolioContent
  loading: boolean
  refresh: () => Promise<void>
}

const PortfolioContentContext = createContext<PortfolioContentContextValue | null>(null)

export function PortfolioContentProvider({ children }: { children: ReactNode }) {
  const value = useMemo<PortfolioContentContextValue>(
    () => ({
      content: DEFAULT_CONTENT,
      loading: false,
      refresh: async () => undefined,
    }),
    [],
  )

  return <PortfolioContentContext.Provider value={value}>{children}</PortfolioContentContext.Provider>
}

export function usePortfolioContent() {
  const context = useContext(PortfolioContentContext)
  if (!context) throw new Error('usePortfolioContent precisa estar dentro de PortfolioContentProvider.')
  return context
}
