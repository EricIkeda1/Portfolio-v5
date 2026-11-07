import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import english from './en.json'
import { LOCALE_STORAGE_KEY, resolveLocale, translateText, type Locale } from './locale'

const LanguageContext = createContext({ locale: 'pt' as Locale, setLocale: (_locale: Locale) => {}, t: (text: string) => text })

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Keep the initial render equal to the Portuguese pre-rendered page.
  const [locale, updateLocale] = useState<Locale>('pt')
  useEffect(() => {
    let saved: string | null = null
    try { saved = localStorage.getItem(LOCALE_STORAGE_KEY) } catch { /* Optional browser storage. */ }
    updateLocale(resolveLocale(saved, navigator.languages?.length ? navigator.languages : [navigator.language]))
  }, [])
  const setLocale = useCallback((next: Locale) => {
    updateLocale(next)
    try { localStorage.setItem(LOCALE_STORAGE_KEY, next) } catch { /* The selector still works without persistence. */ }
  }, [])
  useEffect(() => {
    const oldLang = document.documentElement.lang
    const oldTitle = document.title
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const oldDescription = meta?.content
    document.documentElement.lang = locale === 'en' ? 'en' : 'pt-BR'
    if (locale === 'en') {
      document.title = 'Eric Yuji Ikeda | Web and mobile development portfolio'
      if (meta) meta.content = 'Explore Eric Yuji Ikeda’s projects: web and mobile development with React, Flutter, TypeScript, REST APIs and PostgreSQL.'
    }
    return () => {
      document.documentElement.lang = oldLang
      document.title = oldTitle
      if (meta && oldDescription !== undefined) meta.content = oldDescription
    }
  }, [locale])
  const t = useCallback((text: string) => translateText(text, locale, english), [locale])
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useTranslation() { return useContext(LanguageContext) }

export function LanguageSelector() {
  const { locale, setLocale, t } = useTranslation()
  return <label className="language-selector">
    <span className="sr-only">{t('Idioma do portfólio')}</span>
    <select value={locale} onChange={event => setLocale(event.target.value as Locale)} aria-label={t('Idioma do portfólio')}>
      <option value="pt" lang="pt-BR">PT</option>
      <option value="en" lang="en">EN</option>
    </select>
  </label>
}
