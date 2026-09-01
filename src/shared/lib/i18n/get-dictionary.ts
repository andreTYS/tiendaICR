import { content } from './content';
import type { Locale } from './types';

/**
 * Returns the full typed dictionary for a locale.
 * EN proyectos.list falls back to ES (tech data is locale-agnostic).
 */
export function getDictionary(locale: Locale) {
  const t = content[locale];
  return {
    ...t,
    proyectos: {
      ...t.proyectos,
      list: content.es.proyectos.list,
    },
  };
}

export type Dictionary = ReturnType<typeof getDictionary>;
