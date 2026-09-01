/**
 * Returns the localized value for a given locale.
 * Falls back to the ES value when EN is missing.
 */
export function pickLocalized<T>(
  es: T,
  en: T | null | undefined,
  locale: 'es' | 'en',
): T {
  if (locale === 'en' && en != null) return en;
  return es;
}
