/**
 * Band grammar gate — the pack sentence bank may never run ahead of the lessons it belongs to
 * (docs/RU-PRE-A1-A1-SPEC-ALIGNMENT-FA.md §۷.۲, Phase-0 item): while Pre-A1 teaches no past tense
 * and no subordination, its pack may not contain был/была/было/были, если, чтобы, более or any
 * other past-tense verb; the A1 pack may not introduce «более», which no A1 lesson teaches. если/
 * чтобы stay legal at A1 because the reviewed beginner core (ru-beginner.json) measures them there.
 *
 * Russian-specific by design: the gate encodes the Russian grammar ladder. Other languages pass
 * through unchanged until they get their own ladder entry.
 *
 * `looksLikePastVerb` reconstructs the infinitive (stem + ть/ться) and only rejects the word when
 * that infinitive is a known Russian word — so стол, стул, школа and пенал stay allowed while
 * читал, делала and был are rejected. Irregular past forms (шёл, мог) are not recognised by the
 * reconstruction; add them to the explicit list if they ever show up.
 */
import { FREQUENCY, BEGINNER_FREQUENCY } from '@/lib/content/courseAudit';
import { tokenize } from '@/lib/content/readiness';

const FORBIDDEN_BY_BAND: Partial<Record<string, readonly string[]>> = {
  pre: ['был', 'была', 'было', 'были', 'мог', 'могла', 'могло', 'могли', 'шёл', 'шла', 'шло', 'шли', 'если', 'чтобы', 'более'],
  A1: ['более'],
};

const infinitivesByLanguage: Record<string, Set<string>> = {};

/**
 * Known Russian infinitives: the corpus list plus the beginner core, because the corpus is built
 * from surface forms and misses common lemmas (хотеть is rank-52 in the core but absent from the
 * corpus top list where only хотел ranks). A word only counts as a past verb when its
 * reconstructed infinitive is in this union — стол/школа/пенал stay allowed, читал/делала/хотел
 * are rejected. This module must stay import-safe under the packTool stub bundle: it may not
 * reach the react-native side of the course modules.
 */
function infinitiveSet(lang: string): Set<string> {
  if (!infinitivesByLanguage[lang]) {
    const set = new Set<string>();
    for (const word of FREQUENCY[lang as keyof typeof FREQUENCY] ?? []) {
      for (const token of tokenize(word)) set.add(token);
    }
    const core = BEGINNER_FREQUENCY[lang as keyof typeof BEGINNER_FREQUENCY]?.words ?? [];
    for (const word of core) for (const token of tokenize(word)) set.add(token);
    infinitivesByLanguage[lang] = set;
  }
  return infinitivesByLanguage[lang];
}

/** Conservative Russian past-tense verb detector for regular verbs. */
export function looksLikePastVerb(word: string, lang: string): boolean {
  if (lang !== 'ru') return false;
  const match = word.toLowerCase().match(/^([а-яё]{2,})л(?:а|о|и|ась|ось|ись|ся)?$/u);
  if (!match) return false;
  const set = infinitiveSet(lang);
  return set.has(`${match[1]}ть`) || set.has(`${match[1]}ться`);
}

/** Words of `text` that the band's grammar ladder does not allow yet (empty when nothing applies). */
export function bandGrammarViolations(lang: string, band: string, text: string): string[] {
  const forbidden = FORBIDDEN_BY_BAND[band];
  if (!forbidden?.length) return [];
  const out: string[] = [];
  for (const word of tokenize(text)) {
    const lower = word.toLowerCase();
    if (forbidden.includes(lower)) { out.push(word); continue; }
    if (band === 'pre' && looksLikePastVerb(word, lang)) out.push(word);
  }
  return out;
}
