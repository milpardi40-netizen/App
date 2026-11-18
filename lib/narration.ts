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
 * English is the reference: its lesson reads a line and a word at the engine's natural 1×, replays at 1×,
 * keeps one genuinely slow 0.5× for deliberate repetition, and uses 1.15× for conversational speed
 * (see ENGLISH_*_SPEECH_RATE in lib/responsiveSpeech.ts). German and Russian follow that model.
 */
export const ENGLISH_REFERENCE_LADDER: Ladder = { normal: 1, listen: 1, word: 1, sentence: 0.85, slow: 0.5, natural: 1.15 };

/**
 * German / French / Spanish: words, first reads and replays now use the English pace (1×) instead of the
 * old 0.72/0.68 crawl. Only the explicit «آهسته» button stays slow, exactly like English.
 */
const STARTER_LADDER: Ladder = { normal: 1, listen: 1, word: 1, sentence: 0.85, slow: 0.5, natural: 1.15 };

/**
 * Russian / Turkish: same model as English — 1× for words and lines (Russian used to be held back at
 * 0.78, which is why it sounded sluggish next to the English course), 0.5× only for deliberate slowness,
 * 1.15× for conversational speed.
 */
const CYRILLIC_LADDER: Ladder = { normal: 1, listen: 1, word: 1, sentence: 0.85, slow: 0.5, natural: 1.15 };

const LADDERS: Record<NarrationLanguage, Ladder> = {
  de: STARTER_LADDER,
  fr: STARTER_LADDER,
  es: STARTER_LADDER,
  ru: CYRILLIC_LADDER,
  tr: CYRILLIC_LADDER,
  // English speaks through lib/responsiveSpeech.ts with the same numbers as the reference ladder.
  en: ENGLISH_REFERENCE_LADDER,
};


/**
 * Tempo a pre-rendered pack was rendered at, as a fraction of the engine's natural pace.
 *
 * The starter packs (German/French/Spanish) were rendered at natural speed, so a recording plays at
 * exactly the pace the lesson asked for. The Russian and Turkish packs were rendered at 0.78 tempo, so
 * their recordings are divided by it — the recorded voice and the phone voice then share one tempo at
 * every pace (see `narrationPackTempo`). Centralising it means a screen can no longer drift away from
 * the recording it replaces.
 */
const PACK_TEMPO: Record<NarrationLanguage, number> = { en: 1, de: 1, fr: 1, es: 1, ru: 0.78, tr: 0.78 };

/** The tempo a pre-rendered pack was rendered at for this language (1 = the engine's natural pace). */
export function narrationPackTempo(locale: string): number {
  const language = narrationLanguageOf(locale);
  return language ? PACK_TEMPO[language] : 1;
}

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
