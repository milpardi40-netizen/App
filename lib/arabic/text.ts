/**
 * Arabic orthography, diacritics (harakat/tashkeel), STT normalization, and RTL display helpers.
 * Pure TypeScript (no React Native dependencies) so it works identically in UI, STT scoring, and Node tests.
 */

/** Combining Arabic vowel/diacritic marks (fatha, damma, kasra, sukun, shadda, tanwin, dagger alef, maddah/hamza marks). */
const ARABIC_DIACRITICS_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ARABIC_TATWEEL_RE = /\u0640/g;
const ARABIC_SCRIPT_RE = /[\u0621-\u064A\u0671-\u06D3]/;
const PERSIAN_EXCLUSIVE_RE = /[پچژگ]/;

/** Remove harakat/tashkeel and tatweel while keeping base Arabic letters intact. */
export function stripArabicDiacritics(text: string): string {
  return text.replace(ARABIC_DIACRITICS_RE, '').replace(ARABIC_TATWEEL_RE, '');
}

/**
 * Normalize Arabic text for speech-recognition (STT) matching, search, and semantic comparison:
 * - strips harakat/tashkeel and tatweel (since STT returns unvowelled Arabic)
 * - folds Alef variants (أ إ آ ٱ -> ا), Taa Marbuta (ة -> ه), Alef Maqsura (ى -> ي), Hamza carriers (ؤ -> و, ئ -> ي)
 * - folds Persian keyboard variants (ک -> ك, ی -> ي) so learners typing on a Persian keyboard still match cleanly
 * - removes Arabic punctuation (؟ ، ؛)
 */
export function normalizeArabic(text: string): string {
  return stripArabicDiacritics(text)
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىی]/g, 'ي')
    .replace(/ک/g, 'ك')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[؟،؛«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function hasArabicScript(text: string): boolean {
  return ARABIC_SCRIPT_RE.test(text);
}

export function hasPersianExclusiveLetters(text: string): boolean {
  return PERSIAN_EXCLUSIVE_RE.test(text);
}

export function splitArabicWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}
