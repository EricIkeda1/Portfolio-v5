export type Locale = 'pt' | 'en'
export const LOCALE_STORAGE_KEY = 'eyi-portfolio-locale-v1'

export function resolveLocale(saved: string | null, languages: readonly string[]): Locale {
  if (saved === 'pt' || saved === 'en') return saved
  // The primary browser preference wins; other languages fall back to Portuguese.
  return /^en(?:-|$)/i.test(languages[0] ?? '') ? 'en' : 'pt'
}

export function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

export function translateText(text: string, locale: Locale, english: Record<string, string>): string {
  if (locale === 'pt') return text
  const key = normalizeText(text)
  return Object.prototype.hasOwnProperty.call(english, key) ? english[key] : text
}
