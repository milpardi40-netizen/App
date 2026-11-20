import { COURSE_SPEC, CEFR_BANDS, bandOfLevel, type CefrBand } from '@/lib/content/courseSpec';
import { familyKey, sameFamily } from '@/lib/content/morphology';

/**
 * Course readiness — how far a course is from the course spec, computed from the lesson data itself.
 *
 * Two branches are measured per CEFR band, and the learner sees both:
 *   • structure — what a band has to have: lessons, sentences, and (when the lesson shape carries them)
 *     an assessment in those lessons — averaged into `structureScore`; `structure` is the lessons-only
 *     half, kept for callers that want to show the raw lesson count;
 *   • vocabulary — `coverage`, the share of the band's word target that appears in at least one sentence
 *     of this band or an earlier one.
 * `readiness` is the lower branch: a band is only as ready as its weakest dimension.
 *
 * The word target is the language's beginner core (`beginnerFrequency`, `lib/content/frequency/
 * <lang>-beginner.json`) whenever that core covers the band's ceiling — Pre-A1 and A1 for Russian today.
 * Above the core the corpus list takes over: it is the open wordfreq export in `frequency/<lang>.json`
 * (top 8000, cleaned by `scripts/content/curateFrequency.ts`). A raw frequency list is the wrong
 * yardstick for a beginner band — its first 150 ranks are function words and news prose (`млн`,
 * `области`, `апреля`) — so the core, not the corpus, decides what a beginner course is measured on.
 * Everything here is pure and synchronous so it runs identically in the app, the admin app and scripts.
 */

export type CourseLanguage = 'en' | 'de' | 'fr' | 'es' | 'ru' | 'tr';

export interface AuditSentence { text: string; pattern?: string | null }
export interface AuditLesson {
  id: string;
  levelId: number;
  title: string;
  sentences: readonly AuditSentence[];
  hasDialogue: boolean;
  /**
   * Comprehension checks the lesson ships with. Omit it when the course's lesson shape has no checks at
   * all (the English course quizzes elsewhere): the readiness score then stops scoring a signal it cannot
   * observe instead of reading silence as zero.
   */
  checks?: number;
}

export interface BandReadiness {
  band: CefrBand;
  lessons: number;
  lessonsTarget: number;
  sentences: number;
  sentencesTarget: number;
  lessonsWithDialogue: number;
  lessonsWithChecks: number;
  patterns: number;
  patternsTarget: number;
  /** Words of the band's target met by the end of this band, cumulative — the headline number. */
  coveredWords: number;
  vocabularyCeiling: number;
  /** The same count for the bundled course alone, without the downloaded packs. */
  coveredWordsCourse: number;
  /** The same count with the published packs' vocabulary folded in. */
  coveredWordsWithPacks: number;
  /** 0–100 */
  structure: number;
  /** 0–100 — lessons + sentences + assessment, the structure branch the learner-facing bar shows. */
  structureScore: number;
  /** 0–100 — the headline: the bundled course only. Pack vocabulary never lifts it, see `coverageWithPacks`. */
  coverage: number;
  /** 0–100 — same number, kept under its own name so the two branches can be shown side by side. */
  coverageCourse: number;
  /** 0–100 — `coverageCourse` plus the published packs' vocabulary. */
  coverageWithPacks: number;
  /** Which list the vocabulary branch was measured against. */
  vocabularyTarget: 'beginner' | 'corpus';
  /** Size of that target, so a percentage can always be read back as «N из M слов». */
  vocabularyTargetSize: number;
  /** 0–100 — min(structureScore, coverage) */
  readiness: number;
  /** Most frequent uncovered words within the ceiling (the content order for this band). */
  gaps: string[];
}

/** A curated beginner lexicon, and the bands whose word target it is. */
export interface BeginnerCore { language?: CourseLanguage; bands: readonly CefrBand[]; words: readonly string[] }

export interface CourseReadiness {
  language: CourseLanguage;
  bands: BandReadiness[];
  uniqueWords: number;
  /** Whether published packs exist for this course, i.e. whether `coverageWithPacks` says anything new. */
  packsIncluded: boolean;
}

export interface ReadinessOptions {
  /**
   * The language's beginner core, in teaching order, with the bands it is the target for. A band named
   * there is measured against the core instead of the corpus list (`vocabularyTarget: 'beginner'`).
   */
  beginnerFrequency?: BeginnerCore;
}

const STRESS = /[\u0300\u0301\u0302\u0308]/g; // combining marks used for Russian stress etc. (keep ü/é as precomposed)
/** Tokenise a sentence into comparable lowercase words. Apostrophes split (l'école → l, école) as in the frequency lists. */
export function tokenize(text: string): string[] {
  return text
    .normalize('NFC')
    .replace(/[\u0301]/g, '')
    .toLowerCase()
    .split(/[^\p{L}\p{M}]+/u)
    .map(w => w.replace(STRESS, ''))
    .filter(Boolean);
}

/**
 * Inflection tolerance: frequency lists hold surface forms (говорю / говорит / говорили …), while a course
 * teaches a word once. A frequency word counts as met when a taught token shares its first STEM letters
 * and differs in length by at most 3 (good enough for Russian/Turkish/German endings; it can over-credit
 * short words, which is why the stem must be at least 5 letters).
 */
const STEM = 5;
function stemIndex(seen: Set<string>): Map<string, number[]> {
  const index = new Map<string, number[]>();
  for (const token of seen) if (token.length >= STEM) { const key = token.slice(0, STEM); const list = index.get(key) ?? []; list.push(token.length); index.set(key, list); }
  return index;
}
function stemMatch(word: string, stems: Map<string, number[]>): boolean {
  if (word.length < STEM) return false;
  const lengths = stems.get(word.slice(0, STEM));
  return !!lengths && lengths.some(length => Math.abs(length - word.length) <= 3);
}

const pct = (n: number, d: number) => d <= 0 ? 100 : Math.max(0, Math.min(100, Math.round((n / d) * 100)));

export function computeReadiness(
  language: CourseLanguage,
  lessons: readonly AuditLesson[],
  frequency: readonly string[],
  gapLimit = 60,
  /** Frequency words a published pack adds at each band (bundled index, so readiness reflects the full course). */
  extraWordsByBand?: Partial<Record<CefrBand, readonly string[]>>,
  options?: ReadinessOptions,
): CourseReadiness {
  const beginner = options?.beginnerFrequency?.words ?? [];
  const beginnerBands = options?.beginnerFrequency?.bands ?? [];
  const seen = new Set<string>();
  const course = new Set<string>();
  const all = new Set<string>();
  const bands: BandReadiness[] = [];
  for (const band of CEFR_BANDS) {
    const spec = COURSE_SPEC[band];
    const own = lessons.filter(lesson => bandOfLevel(lesson.levelId) === band);
    let sentences = 0, patterns = 0;
    for (const lesson of own) for (const sentence of lesson.sentences) {
      sentences++;
      if (sentence.pattern) patterns++;
      // Every taught token is a candidate: a word the course teaches counts even when the list spells a
      // different case form of it, which is why the stem index is built from `all` and not from the
      // intersection of taught tokens with the list.
      for (const token of tokenize(sentence.text)) { all.add(token); course.add(token); }
    }
    // Published packs are part of the course even though their sentences are downloaded, not bundled.
    // Their vocabulary index ships with the APK so readiness is the same number the learner sees.
    const extras = extraWordsByBand?.[band] ?? [];
    for (const word of extras) { seen.add(word); all.add(word); }
    const target = beginner.length > 0 && beginnerBands.includes(band) ? beginner : frequency;
    const size = Math.min(spec.vocabularyCeiling, target.length);
    // A beginner core holds lemmas, so a taught form only counts when it is the same lexeme: reduce the
    // tokens to stems and compare families. The corpus list is made of surface forms and needs neither.
    const onCore = target === beginner;
    const courseKeys = onCore ? [...course].map(token => familyKey(language, token)) : [];
    const allKeys = onCore ? [...all].map(token => familyKey(language, token)) : [];
    const familyHit = (word: string, keys: (string | null)[], index: Map<string, number[]>) => {
      if (stemMatch(word, index)) return true;
      const key = familyKey(language, word);
      if (!key) return false;
      for (const taught of keys) if (taught && sameFamily(key, taught)) return true;
      return false;
    };
    let coveredCourse = 0, coveredWithPacks = 0;
    const gaps: string[] = [];
    const stems = stemIndex(all);
    const stemsCourse = stemIndex(course);
    for (let i = 0; i < size; i++) {
      const word = target[i];
      const byCourse = course.has(word) || familyHit(word, courseKeys, stemsCourse);
      if (byCourse) coveredCourse++;
      const met = byCourse || seen.has(word) || familyHit(word, allKeys, stems);
      if (met) coveredWithPacks++; else if (gaps.length < gapLimit) gaps.push(word);
    }
    const structure = pct(own.length, spec.lessons);
    const measuresChecks = lessons.some(lesson => typeof lesson.checks === 'number');
    const signals = [structure, pct(sentences, spec.lessons * spec.sentencesPerLesson)];
    if (measuresChecks) signals.push(own.length === 0 ? 0 : pct(own.filter(lesson => (lesson.checks ?? 0) > 0).length, own.length));
    const structureScore = own.length === 0 ? 0 : Math.round(signals.reduce((sum, signal) => sum + signal, 0) / signals.length);
    // The headline is what the course itself does. Downloaded coverage frames can raise a second number
    // next to it, but a percentage built from them is not a claim about the course (see the Pre-A1/A1
    // spec-alignment report, phase 3).
    const coverage = pct(coveredCourse, size);
    bands.push({
      band, lessons: own.length, lessonsTarget: spec.lessons, sentences, sentencesTarget: spec.lessons * spec.sentencesPerLesson,
      lessonsWithDialogue: own.filter(l => l.hasDialogue).length, lessonsWithChecks: own.filter(l => (l.checks ?? 0) > 0).length,
      patterns, patternsTarget: spec.lessons * spec.patternsPerLesson,
      coveredWords: coveredCourse, coveredWordsCourse: coveredCourse, vocabularyCeiling: spec.vocabularyCeiling,
      coveredWordsWithPacks: coveredWithPacks,
      structure, structureScore, coverage, coverageCourse: pct(coveredCourse, size), coverageWithPacks: pct(coveredWithPacks, size),
      vocabularyTarget: target === beginner ? 'beginner' : 'corpus', vocabularyTargetSize: size,
      readiness: own.length === 0 ? 0 : Math.min(structureScore, coverage), gaps,
    });
  }
  const packsIncluded = CEFR_BANDS.some(band => (extraWordsByBand?.[band] ?? []).length > 0);
  return { language, bands, uniqueWords: all.size, packsIncluded };
}

/** Readiness of the band a level belongs to, for level cards. */
export function bandReadinessForLevel(course: CourseReadiness, levelId: number): BandReadiness | undefined {
  return course.bands.find(b => b.band === bandOfLevel(levelId));
}
