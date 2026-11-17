/**
 * The narrator contract — one voice, one tempo, for every screen that reads a course line aloud.
 *
 * Before this module each screen carried its own pace constant: the German lesson read a sentence at
 * 1.0, its level practice at 0.85, its review at 1.0, its word lab at 0.72/0.68, and the Russian
 * lesson at 0.78/0.85/0.72 with the Russian review talking to the engine directly. The voice was
 * always the phone's own (device TTS), but the *narrator* changed speed from screen to screen, and
 * pre-rendered recordings were sped up on a different scale than the voice that replaced them.
 *
 * This file is the single source of truth:
 *
 *   • one locale per language (`narrationLocale`),
 *   • one pace ladder per language (`narrationRate`), so «listening», «words», «example sentences»,
 *     «normal» and «slow» mean exactly the same thing in a lesson, on a level and in the word lab,
 *   • one rule for pre-rendered packs (`recordedPlaybackRate`), so a recording and the device voice
 *     land on the same tempo for the same pace.
 *
 * It only decides *how* an existing string is spoken. It never adds, removes or rewrites content.
 */

export type NarrationLanguage = 'en' | 'de' | 'fr' | 'es' | 'ru' | 'tr';

/** The BCP-47 locale a language is spoken in. Keep in sync with `speechTagFor` at the call site. */
export const NARRATION_LOCALE: Record<NarrationLanguage, string> = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  ru: 'ru-RU',
  tr: 'tr-TR',
};

/**
 * Every pace a screen is allowed to ask for:
 *
 *   normal    – the «معمولی» replay button in a lesson.
 *   listen    – the first read of a line, the auto-read pass, and every practice/review/level card.
 *   word      – a single word in the word lab.
 *   sentence  – an example sentence in the word lab (a touch slower than the word itself).
 *   slow      – the «آهسته» replay button.
 *   natural   – conversational pace, used where the lesson asks for real-life speed.
 */
export type NarrationPace = 'normal' | 'listen' | 'word' | 'sentence' | 'slow' | 'natural';

export const NARRATION_PACES: readonly NarrationPace[] = ['normal', 'listen', 'word', 'sentence', 'slow', 'natural'];

type Ladder = Record<NarrationPace, number>;

/**
 * German / French / Spanish: the engine's 1× is a comfortable classroom pace, so it is «معمولی».
 * A line is first read at 0.72, a single word at 0.72 and an example sentence at 0.68.
 */
const STARTER_LADDER: Ladder = { normal: 1, listen: 0.72, word: 0.72, sentence: 0.68, slow: 0.5, natural: 1.15 };

/**
 * Russian / Turkish: the engine's 1× is too fast for learners, so «معمولی» is 0.85 and the first read
 * is 0.78. Words and example sentences follow the same ladder instead of the ad-hoc 0.72/0.68 they
 * used to have, so the narrator no longer speeds up when the learner opens the word lab.
 */
const CYRILLIC_LADDER: Ladder = { normal: 0.85, listen: 0.78, word: 0.78, sentence: 0.72, slow: 0.5, natural: 1 };

const LADDERS: Record<NarrationLanguage, Ladder> = {
  de: STARTER_LADDER,
  fr: STARTER_LADDER,
  es: STARTER_LADDER,
  ru: CYRILLIC_LADDER,
  tr: CYRILLIC_LADDER,
  // English keeps its own responsive engine (alternating 1× / 0.5×) in lib/responsiveSpeech.ts.
  en: { normal: 1, listen: 1, word: 1, sentence: 0.5, slow: 0.5, natural: 1.15 },
};

/**
 * Tempo a pre-rendered pack was rendered at, as a fraction of the engine's natural pace.
 *
 * The starter packs (German/French/Spanish) were rendered at natural speed, so a recording plays at
 * exactly the pace the lesson asked for. The Russian and Turkish packs were rendered at 0.78 tempo,
 * so their recordings are divided by it: `recordedPlaybackRate('ru-RU', 0.78)` is 1× and therefore
 * sounds exactly like the device voice reading at 0.78. Centralising it means a screen can no longer
 * drift away from the recording it replaces.
 */
const PACK_TEMPO: Record<NarrationLanguage, number> = { en: 1, de: 1, fr: 1, es: 1, ru: 0.78, tr: 0.78 };

const MIN_RATE = 0.4;
const MAX_RATE = 1.6;

/** `'de'`, `'de-DE'`, `'DE_de'` → `'de'`. Returns null for anything that is not a course language. */
export function narrationLanguageOf(locale: string): NarrationLanguage | null {
  const code = String(locale || '').trim().toLowerCase().replace('_', '-').split('-')[0];
  return code in LADDERS ? (code as NarrationLanguage) : null;
}

/** The locale to hand to expo-speech for a language id (or an already-complete locale). */
export function narrationLocale(locale: string): string {
  const language = narrationLanguageOf(locale);
  return language ? NARRATION_LOCALE[language] : locale;
}

/** The engine rate for one pace. Unknown languages fall back to the language's natural pace. */
export function narrationRate(locale: string, pace: NarrationPace = 'listen'): number {
  const language = narrationLanguageOf(locale);
  if (!language) return 1;
  return LADDERS[language][pace];
}

/** The whole ladder for a language, so screens and audits read the same numbers. */
export function narrationLadder(locale: string): Readonly<Ladder> {
  const language = narrationLanguageOf(locale);
  return language ? LADDERS[language] : LADDERS.en;
}

/**
 * Playback speed for a pre-rendered recording of this language at this pace, so the recording lands
 * on the same tempo as the device voice reading at `rate`.
 */
export function recordedPlaybackRate(locale: string, rate: number): number {
  const language = narrationLanguageOf(locale);
  const tempo = language ? PACK_TEMPO[language] : 1;
  const scaled = (Number.isFinite(rate) && rate > 0 ? rate : 1) / tempo;
  return Math.min(MAX_RATE, Math.max(MIN_RATE, Math.round(scaled * 1000) / 1000));
}
