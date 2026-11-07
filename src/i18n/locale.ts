export type Locale = 'pt' | 'en' | 'es'
export const LOCALE_STORAGE_KEY = 'eyi-portfolio-locale-v1'

export function resolveLocale(saved: string | null, languages: readonly string[]): Locale {
  if (saved === 'pt' || saved === 'en' || saved === 'es') return saved
  // The primary browser preference wins; other languages fall back to Portuguese.
  const language = (languages[0] ?? '').split('-')[0].toLowerCase()
  return language === 'en' || language === 'es' ? language : 'pt'
}

export function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

export function translateText(text: string, locale: Locale, dictionary: Record<string, string>): string {
  if (locale === 'pt') return text
  const key = normalizeText(text)
  return Object.prototype.hasOwnProperty.call(dictionary, key) ? dictionary[key] : text
}
