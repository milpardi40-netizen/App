/**
 * The ids of the courses that live in `newCourses`, without importing them.
 *
 * Route files only need to know *whether* a language is one of these. Importing `newCourses` for that
 * check pulled the whole German/French/Spanish seed graph — hundreds of kilobytes of lesson literals —
 * into every route, including the Russian and Turkish ones that never touch it.
 */
export const NEW_LANGUAGE_IDS = ['de', 'fr', 'es'] as const;
export type NewLanguageId = (typeof NEW_LANGUAGE_IDS)[number];

export function isNewLanguage(value: string | undefined): value is NewLanguageId {
  return value === 'de' || value === 'fr' || value === 'es';
}
