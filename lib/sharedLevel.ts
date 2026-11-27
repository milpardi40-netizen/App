import {
  COURSE_LEVELS,
  ENGLISH_LEARNER_LESSONS as SENTENCE_LESSONS,
  getSentenceLesson,
  type CourseLevelId,
  type SentenceLesson,
} from './courseContent';
import { readLocalProgress } from './courseProgress';
import {
  RUSSIAN_LESSONS,
  RUSSIAN_LEVELS,
  findRussianLesson,
  russianProgress,
  type RussianCourseLesson,
} from './languages/russian';
import {
  TURKISH_LESSONS,
  TURKISH_LEVELS,
  findTurkishLesson,
  turkishProgress,
  type TurkishCourseLesson,
} from './languages/turkish';
import { NEW_COURSES, type StarterLesson } from './languages/newCourses';
import {
  tokensOf,
  type ConversationTurn,
  type TurnConversationLanguage,
  type TurnConversationPlan,
  type TurnPrompt,
} from './turnConversation';

/**
 * Level-scoped conversation practice for every shipped language.
 *
 * When two learners connect, their conversation is scoped to ONE shared level:
 * the highest level BOTH learners have completed (or Pre-A1 when at least one
 * learner has not finished a full level yet). Inside that level they pick one
 * of its real lessons, and the turn count, prompt difficulty and mission gate
 * adapt to that shared CEFR level.
 */

export const CEFR_LEVELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];
export type SharedLanguage = TurnConversationLanguage;

export interface SharedSentence {
  id: string;
  targetText: string;
  fa: string;
  pattern?: string;
  vocabulary: { word: string; meaning: string }[];
}

export interface SharedLesson {
  id: string;
  language: SharedLanguage;
  levelId: CourseLevelId;
  order: number;
  title: string;
  subtitle: string;
  situation: string;
  sentences: SharedSentence[];
}

export interface LevelDifficultyProfile {
  levelId: CourseLevelId;
  cefr: CefrLevel;
  turnCount: number;
  minWordsFloor: number;
  minWordsCap: number;
  strictness: 'gentle' | 'standard' | 'challenging';
  difficultyFa: string;
  turnLabelFa: string;
}

const LEVEL_PROFILES: readonly LevelDifficultyProfile[] = [
  { levelId: 0, cefr: 'Pre-A1', turnCount: 3, minWordsFloor: 2, minWordsCap: 3, strictness: 'gentle', difficultyFa: 'خیلی آسان', turnLabelFa: 'خیلی آسان · ۳ نوبت' },
  { levelId: 1, cefr: 'A1', turnCount: 4, minWordsFloor: 3, minWordsCap: 4, strictness: 'gentle', difficultyFa: 'پایه', turnLabelFa: 'پایه · ۴ نوبت' },
  { levelId: 2, cefr: 'A2', turnCount: 5, minWordsFloor: 4, minWordsCap: 5, strictness: 'standard', difficultyFa: 'متوسط', turnLabelFa: 'متوسط · ۵ نوبت' },
  { levelId: 3, cefr: 'B1', turnCount: 5, minWordsFloor: 5, minWordsCap: 6, strictness: 'standard', difficultyFa: 'چالشی', turnLabelFa: 'چالشی · ۵ نوبت' },
  { levelId: 4, cefr: 'B2', turnCount: 6, minWordsFloor: 6, minWordsCap: 7, strictness: 'challenging', difficultyFa: 'پیشرفته', turnLabelFa: 'پیشرفته · ۶ نوبت' },
  { levelId: 5, cefr: 'C1', turnCount: 6, minWordsFloor: 7, minWordsCap: 8, strictness: 'challenging', difficultyFa: 'حرفه‌ای', turnLabelFa: 'حرفه‌ای · ۶ نوبت' },
];

const clampLevel = (levelId: number): CourseLevelId =>
  (Math.max(0, Math.min(CEFR_LEVELS.length - 1, Math.round(levelId))) as CourseLevelId);

export function cefrOfLevel(levelId: number): CefrLevel {
  return CEFR_LEVELS[clampLevel(levelId)];
}

export function levelProfileFor(levelId: number): LevelDifficultyProfile {
  return LEVEL_PROFILES[clampLevel(levelId)];
}

export function levelMeta(levelId: number, language: SharedLanguage = 'en') {
  const id = clampLevel(levelId);
  const list = language === 'ru'
    ? RUSSIAN_LEVELS
    : language === 'tr'
      ? TURKISH_LEVELS
      : (language === 'de' || language === 'fr' || language === 'es')
        ? NEW_COURSES[language].levels
        : COURSE_LEVELS;
  return list.find(level => level.id === id) ?? list[0];
}

// ---------------------------------------------------------------------------
// Completed levels & multi-language profile sync
// ---------------------------------------------------------------------------

export function completedLevelIdsFromProgress(
  lessons: readonly { id: string; levelId: number }[],
  completedLessonIds: readonly string[],
): CourseLevelId[] {
  const completed = new Set(completedLessonIds);
  const done: CourseLevelId[] = [];
  for (let level = 0; level < CEFR_LEVELS.length; level += 1) {
    const levelLessons = lessons.filter(item => item.levelId === level);
    if (levelLessons.length > 0 && levelLessons.every(item => completed.has(item.id))) {
      done.push(level as CourseLevelId);
    }
  }
  return done;
}

export function highestLevelOf(completedLevels: readonly CourseLevelId[]): CourseLevelId | null {
  if (!completedLevels.length) return null;
  return Math.max(...completedLevels) as CourseLevelId;
}

export function effectiveLevelOf(completedLevels: readonly CourseLevelId[]): CourseLevelId {
  return highestLevelOf(completedLevels) ?? 0;
}

/** Encode completed levels across courses in one compact string stored in `profiles.english_level`. */
export function encodeCourseLevels(
  levels: { en: readonly CourseLevelId[]; ru: readonly CourseLevelId[] } & Partial<Record<SharedLanguage, readonly CourseLevelId[]>>,
): string {
  const format = (ids: readonly CourseLevelId[]) => (ids.length ? [...new Set(ids)].sort((a, b) => a - b).join(',') : '-');
  const keys: SharedLanguage[] = ['en', 'ru'];
  for (const extra of ['tr', 'de', 'fr', 'es'] as const) {
    if (levels[extra] !== undefined) keys.push(extra);
  }
  return keys.map(key => `${key}:${format(levels[key] ?? [])}`).join(';');
}

function parseLevelList(raw: string): CourseLevelId[] {
  const clean = raw.trim();
  if (!clean || clean === '-') return [];
  const out = new Set<CourseLevelId>();
  for (const part of clean.split(',')) {
    const n = Number(part.trim());
    if (Number.isInteger(n) && n >= 0 && n < CEFR_LEVELS.length) out.add(n as CourseLevelId);
  }
  return [...out].sort((a, b) => a - b);
}

export type StoredCourseLevels = Record<SharedLanguage, { completed: CourseLevelId[]; known: boolean }>;

function emptyStoredCourseLevels(): StoredCourseLevels {
  return {
    en: { completed: [], known: false },
    ru: { completed: [], known: false },
    tr: { completed: [], known: false },
    de: { completed: [], known: false },
    fr: { completed: [], known: false },
    es: { completed: [], known: false },
  };
}

/**
 * Parse `profiles.english_level` back into completed levels per language.
 * Handles both the structured `en:0,1;ru:0;...` format and legacy single CEFR strings.
 * Legacy `'Foundation'` (never synced) maps to empty completed levels (starts safely at Pre-A1).
 */
export function parseStoredCourseLevels(value?: string | null): StoredCourseLevels {
  const clean = (value || '').trim();
  if (/^(?:en|ru|tr|de|fr|es):/i.test(clean)) {
    const result = emptyStoredCourseLevels();
    for (const segment of clean.split(';')) {
      const [lang, rawList = ''] = segment.split(':');
      const key = lang?.trim().toLowerCase();
      if (key === 'en' || key === 'ru' || key === 'tr' || key === 'de' || key === 'fr' || key === 'es') {
        result[key] = { completed: parseLevelList(rawList), known: true };
      }
    }
    return result;
  }
  const result = emptyStoredCourseLevels();
  const index = CEFR_LEVELS.findIndex(level => level.toLowerCase() === clean.toLowerCase());
  if (index >= 0) {
    const through = Array.from({ length: index + 1 }, (_, i) => i as CourseLevelId);
    result.en = { completed: through, known: true };
  }
  return result;
}

/** Map a stored profile level string to an effective level id for one language. */
export function levelIdFromStoredLevel(value?: string | null, language: SharedLanguage = 'en'): CourseLevelId {
  const parsed = parseStoredCourseLevels(value);
  return effectiveLevelOf(parsed[language].completed);
}

/** The shared conversation level: the lower of two effective levels. */
export function sharedLevelOf(a: number, b: number): CourseLevelId {
  return clampLevel(Math.min(a, b));
}

export interface SharedCompletionMatch {
  sharedLevelId: CourseLevelId;
  myHighest: CourseLevelId | null;
  partnerHighest: CourseLevelId | null;
  bothCompleted: boolean;
}

/**
 * Compute the shared level as the highest CEFR level BOTH learners have completed.
 * Falls back to Pre-A1 (0) when there is no completed level common to both.
 */
export function sharedCompletedLevel(
  myCompleted: readonly CourseLevelId[],
  partnerCompleted: readonly CourseLevelId[],
): SharedCompletionMatch {
  const partnerSet = new Set(partnerCompleted);
  const common = myCompleted.filter(id => partnerSet.has(id));
  const sharedLevelId = common.length ? (Math.max(...common) as CourseLevelId) : 0;
  return {
    sharedLevelId,
    myHighest: highestLevelOf(myCompleted),
    partnerHighest: highestLevelOf(partnerCompleted),
    bothCompleted: common.length > 0,
  };
}

export async function myCompletedLevels(language: SharedLanguage = 'en'): Promise<CourseLevelId[]> {
  try {
    if (language === 'ru') {
      const progress = await russianProgress.getCourseProgress();
      return completedLevelIdsFromProgress(RUSSIAN_LESSONS, progress.completedLessonIds);
    }
    if (language === 'tr') {
      const progress = await turkishProgress.getCourseProgress();
      return completedLevelIdsFromProgress(TURKISH_LESSONS, progress.completedLessonIds);
    }
    if (language === 'de' || language === 'fr' || language === 'es') {
      const course = NEW_COURSES[language];
      const progress = await course.progress.getCourseProgress();
      return completedLevelIdsFromProgress(course.lessons, progress.completedLessonIds);
    }
    const progress = await readLocalProgress();
    return completedLevelIdsFromProgress(SENTENCE_LESSONS, progress.completedLessonIds);
  } catch {
    return [];
  }
}

export async function myAllCompletedLevels(): Promise<Record<SharedLanguage, CourseLevelId[]>> {
  const [en, ru, tr, de, fr, es] = await Promise.all([
    myCompletedLevels('en'),
    myCompletedLevels('ru'),
    myCompletedLevels('tr'),
    myCompletedLevels('de'),
    myCompletedLevels('fr'),
    myCompletedLevels('es'),
  ]);
  return { en, ru, tr, de, fr, es };
}

export async function myCurrentLevelId(language: SharedLanguage = 'en'): Promise<CourseLevelId> {
  return effectiveLevelOf(await myCompletedLevels(language));
}

// ---------------------------------------------------------------------------
// Unified English & Russian lessons
// ---------------------------------------------------------------------------

function fromEnglishLesson(lesson: SentenceLesson): SharedLesson {
  return {
    id: lesson.id,
    language: 'en',
    levelId: lesson.levelId,
    order: lesson.order,
    title: lesson.title,
    subtitle: lesson.subtitle,
    situation: lesson.situation,
    sentences: lesson.sentences.map(sentence => ({
      id: sentence.id,
      targetText: sentence.en,
      fa: sentence.fa,
      pattern: sentence.pattern,
      vocabulary: sentence.vocabulary,
    })),
  };
}

function fromTextLesson(
  lesson: RussianCourseLesson | TurkishCourseLesson | StarterLesson,
  language: Exclude<SharedLanguage, 'en'>,
): SharedLesson {
  return {
    id: lesson.id,
    language,
    levelId: lesson.levelId,
    order: lesson.order,
    title: lesson.title,
    subtitle: lesson.subtitle,
    situation: lesson.situation,
    sentences: lesson.sentences.map(sentence => ({
      id: sentence.id,
      targetText: sentence.text,
      fa: sentence.fa,
      pattern: sentence.pattern,
      vocabulary: sentence.vocabulary,
    })),
  };
}

export function findSharedLesson(lessonId?: string | null): SharedLesson | null {
  if (!lessonId) return null;
  if (lessonId.startsWith('tr')) {
    const tr = findTurkishLesson(lessonId);
    if (tr) return fromTextLesson(tr, 'tr');
  }
  if (lessonId.startsWith('de-')) {
    const de = NEW_COURSES.de.lessons.find(item => item.id === lessonId);
    if (de) return fromTextLesson(de, 'de');
  }
  if (lessonId.startsWith('fr-')) {
    const fr = NEW_COURSES.fr.lessons.find(item => item.id === lessonId);
    if (fr) return fromTextLesson(fr, 'fr');
  }
  if (lessonId.startsWith('es-')) {
    const es = NEW_COURSES.es.lessons.find(item => item.id === lessonId);
    if (es) return fromTextLesson(es, 'es');
  }
  if (lessonId.startsWith('ru-')) {
    const ru = findRussianLesson(lessonId);
    if (ru) return fromTextLesson(ru, 'ru');
  }
  const en = getSentenceLesson(lessonId);
  if (en) return fromEnglishLesson(en);
  const ru = findRussianLesson(lessonId);
  if (ru) return fromTextLesson(ru, 'ru');
  const tr = findTurkishLesson(lessonId);
  if (tr) return fromTextLesson(tr, 'tr');
  for (const id of ['de', 'fr', 'es'] as const) {
    const match = NEW_COURSES[id].lessons.find(item => item.id === lessonId);
    if (match) return fromTextLesson(match, id);
  }
  return null;
}

/** Only the lessons of one level and language, in course order. */
export function lessonsOfLevel(levelId: number, language: SharedLanguage = 'en'): SharedLesson[] {
  const id = clampLevel(levelId);
  const profile = levelProfileFor(id);
  const minSentences = Math.min(profile.turnCount, 3);
  if (language === 'ru') {
    return RUSSIAN_LESSONS
      .filter(lesson => lesson.levelId === id && lesson.sentences.length >= minSentences)
      .sort((a, b) => a.order - b.order)
      .map(lesson => fromTextLesson(lesson, 'ru'));
  }
  if (language === 'tr') {
    return TURKISH_LESSONS
      .filter(lesson => lesson.levelId === id && lesson.sentences.length >= minSentences)
      .sort((a, b) => a.order - b.order)
      .map(lesson => fromTextLesson(lesson, 'tr'));
  }
  if (language === 'de' || language === 'fr' || language === 'es') {
    return NEW_COURSES[language].lessons
      .filter(lesson => lesson.levelId === id && lesson.sentences.length >= minSentences)
      .sort((a, b) => a.order - b.order)
      .map(lesson => fromTextLesson(lesson, language));
  }
  return SENTENCE_LESSONS
    .filter(lesson => lesson.levelId === id && lesson.sentences.length >= minSentences)
    .sort((a, b) => a.order - b.order)
    .map(fromEnglishLesson);
}

// ---------------------------------------------------------------------------
// Level-adapted, lesson-based turn plan
// ---------------------------------------------------------------------------

const FOCUS_BY_TURN_COUNT: Record<number, readonly string[]> = {
  3: ['شروع گفت‌وگو', 'تمرین جمله', 'جمع‌بندی'],
  4: ['شروع گفت‌وگو', 'تمرین جمله', 'کاربرد در گفت‌وگو', 'جمع‌بندی'],
  5: ['شروع گفت‌وگو', 'تمرین جمله', 'گفت‌وگو با جمله‌های درس', 'ادامهٔ تمرین', 'جمع‌بندی'],
  6: ['شروع گفت‌وگو', 'تمرین الگو', 'گسترش گفت‌وگو', 'تجربه و دلیل', 'پرسش و پاسخ عمیق', 'جمع‌بندی'],
};

const QUESTION_START_EN = /^(what|where|when|why|how|who|whom|whose|which|can|could|do|does|did|are|is|am|was|were|will|would|have|has|had|shall|should|may)\b/i;
const QUESTION_START_RU = /^(кто|что|где|куда|откуда|когда|почему|зачем|как|какой|какая|какое|какие|сколько|можно|есть)\b/i;
const QUESTION_START_TR = /^(ne|nerede|nereye|nereden|ne zaman|neden|niçin|niye|nasıl|kim|hangi|kaç)\b|\b(mi|mı|mu|mü|misin|mısın|musun|müsün)\b/i;
const QUESTION_START_DE = /^(was|wo|wohin|woher|wann|warum|wieso|wie|wer|wen|wem|welche|welcher|welches|kann|kannst|können|hast|haben|bist|sind|ist)\b/i;
const QUESTION_START_FR = /^(quel|quelle|quels|quelles|quoi|où|quand|pourquoi|comment|qui|combien|est-ce)\b/i;
const QUESTION_START_ES = /^(¿|qué|dónde|adónde|cuándo|por qué|cómo|quién|quiénes|cuál|cuáles|cuánto|cuántos)\b/i;

const isQuestionSentence = (text: string, language: SharedLanguage) => {
  const clean = text.trim();
  if (/[?؟]\s*$/.test(clean)) return true;
  if (language === 'ru') return QUESTION_START_RU.test(clean);
  if (language === 'tr') return QUESTION_START_TR.test(clean);
  if (language === 'de') return QUESTION_START_DE.test(clean);
  if (language === 'fr') return QUESTION_START_FR.test(clean);
  if (language === 'es') return QUESTION_START_ES.test(clean);
  return QUESTION_START_EN.test(clean);
};

const SHORT_KEY_WORDS = new Set([
  'am', 'is', 'are', 'do', 'go', 'my', 'we', 'he', 'she', 'no', 'hi',
  'я', 'ты', 'мы', 'вы', 'он', 'да', 'не', 'на', 'от', 'из',
  'ev', 'su', 'ne', 'bu', 'şu', 'az', 'iş',
  'ja', 'du', 'er', 'es', 'wo', 'da',
  'je', 'tu', 'il', 'où', 'et', 'si',
  'sí', 'yo', 'tú', 'té', 'el', 'la', 'un', 'mi', 'ir',
]);
const contentWordsOf = (text: string) => [...new Set(tokensOf(text).filter(word => word.length > 2 || SHORT_KEY_WORDS.has(word)))];

function pickLessonSentences(lesson: SharedLesson, count: number, minWordsFloor: number): SharedSentence[] {
  const rich = lesson.sentences.filter(sentence => tokensOf(sentence.targetText).length >= minWordsFloor);
  const usable = lesson.sentences.filter(sentence => tokensOf(sentence.targetText).length >= 2);
  const pool = rich.length >= count ? rich : usable.length >= count ? usable : lesson.sentences;
  if (pool.length <= count) return pool;
  const picks: SharedSentence[] = [];
  const used = new Set<string>();
  for (let index = 0; index < count; index += 1) {
    const at = Math.round((index * (pool.length - 1)) / Math.max(1, count - 1));
    let candidate = pool[at];
    let guard = 0;
    while (used.has(candidate.targetText) && guard < pool.length) {
      candidate = pool[(at + guard + 1) % pool.length];
      guard += 1;
    }
    used.add(candidate.targetText);
    picks.push(candidate);
  }
  return picks;
}

function lessonCues(lesson: SharedLesson): string[] {
  const words = new Set<string>();
  for (const sentence of lesson.sentences) {
    for (const item of sentence.vocabulary) {
      const normalizedPhrase = tokensOf(item.word).join(' ');
      if (normalizedPhrase.length > 2) words.add(normalizedPhrase);
      for (const token of tokensOf(item.word)) {
        if (token.length > 2) words.add(token);
      }
    }
    for (const token of contentWordsOf(sentence.targetText)) {
      if (words.size >= 24) break;
      words.add(token);
    }
  }
  return [...words].slice(0, 20);
}

function hintForLevel(levelId: CourseLevelId, isQuestion: boolean, slot: 0 | 1): string {
  if (levelId === 0) {
    if (slot === 0) return isQuestion ? 'با کلمه‌های ساده به این سؤال جواب بده.' : 'این جملهٔ کوتاه را با کلمه‌های خودت بگو.';
    return 'تو هم یک جملهٔ کوتاه دربارهٔ خودت بگو.';
  }
  if (levelId === 1) {
    if (slot === 0) return isQuestion ? 'به این سؤال جواب بده و از مخاطب هم بپرس.' : 'این جمله را دربارهٔ خودت بگو و از مخاطب هم بخواه همین را بگوید.';
    return 'همان جمله را تو هم بگو و یک جزئیات ساده اضافه کن.';
  }
  if (levelId === 2) {
    if (slot === 0) return isQuestion ? 'کامل پاسخ بده و با یک سؤال کوتاه گفت‌وگو را ادامه بده.' : 'این جمله را بگو و زمان، مکان یا یک مثال شخصی اضافه کن.';
    return 'واکنش نشان بده، جملهٔ خودت را بگو و یک جزئیات تازه اضافه کن.';
  }
  if (levelId === 3) {
    if (slot === 0) return isQuestion ? 'با دلیل و مثال شخصی پاسخ بده و نظر مخاطب را هم بپرس.' : 'این الگو را در یک تجربهٔ واقعی به کار ببر و توضیح بده چرا مهم است.';
    return 'با نظر او ارتباط بگیر، دیدگاه خودت را بگو و یک سؤال تکمیلی بپرس.';
  }
  if (levelId === 4) {
    if (slot === 0) return 'با مثال واقعی، مقایسه یا استدلال پاسخ بده و گفت‌وگو را عمیق‌تر کن.';
    return 'پاسخ را تحلیل کن، نکتهٔ تکمیلی بیاور و یک پرسش چالشی بپرس.';
  }
  if (slot === 0) return 'دیدگاه دقیق خودت را با واژگان سطح بالا و استدلال کامل بیان کن.';
  return 'نقد یا جمع‌بندی دقیق ارائه بده و بحث را با یک پرسش عمیق ادامه بده.';
}

function lessonPrompt(
  sentence: SharedSentence,
  cues: readonly string[],
  profile: LevelDifficultyProfile,
  hint: string,
): TurnPrompt {
  const sentenceTokens = tokensOf(sentence.targetText);
  const wordCount = sentenceTokens.length;
  const concepts: (readonly string[])[] = [];
  const sentenceWords = contentWordsOf(sentence.targetText);
  if (sentenceWords.length) concepts.push(sentenceWords);
  else if (sentenceTokens.length) concepts.push(sentenceTokens);
  if (sentence.pattern) {
    const patternWords = contentWordsOf(sentence.pattern.replace(/\+/g, ' '));
    if (patternWords.length) concepts.push(patternWords);
  }
  const baseMin = Math.max(profile.minWordsFloor, Math.min(profile.minWordsCap, Math.round(wordCount * 0.65)));
  const minWords = Math.max(1, Math.min(wordCount, baseMin));
  return {
    text: sentence.targetText,
    hint,
    cues,
    concepts,
    minWords,
    strictness: profile.strictness,
  };
}

function toSharedLesson(
  lesson: SharedLesson | SentenceLesson | RussianCourseLesson | TurkishCourseLesson | StarterLesson,
  language?: string,
): SharedLesson {
  if ('language' in lesson && 'sentences' in lesson && lesson.sentences[0] && 'targetText' in lesson.sentences[0]) {
    return lesson as SharedLesson;
  }
  if (lesson.sentences[0] && 'text' in lesson.sentences[0]) {
    const lang: Exclude<SharedLanguage, 'en'> =
      language === 'tr' || language === 'de' || language === 'fr' || language === 'es' ? language : 'ru';
    return fromTextLesson(lesson as RussianCourseLesson | TurkishCourseLesson | StarterLesson, lang);
  }
  return fromEnglishLesson(lesson as SentenceLesson);
}

/**
 * Turn plan built from one real lesson in any supported language: the topic,
 * mission, cues, turn count and difficulty come from that lesson and its
 * CEFR level. Both participants get the identical plan.
 */
export function buildLessonTurnPlan(
  rawLesson: SharedLesson | SentenceLesson | RussianCourseLesson | TurkishCourseLesson | StarterLesson,
  language?: string,
): TurnConversationPlan {
  const lesson = toSharedLesson(rawLesson, language);
  const profile = levelProfileFor(lesson.levelId);
  const cues = lessonCues(lesson);
  const picks = pickLessonSentences(lesson, profile.turnCount, profile.minWordsFloor);
  const focusLabels = FOCUS_BY_TURN_COUNT[picks.length] ?? FOCUS_BY_TURN_COUNT[5];
  const turns: ConversationTurn[] = picks.map((sentence, index) => {
    const isQuestion = isQuestionSentence(sentence.targetText, lesson.language);
    return {
      id: `lesson-${index + 1}`,
      focusFa: focusLabels[index] ?? focusLabels[focusLabels.length - 1],
      first: lessonPrompt(sentence, cues, profile, hintForLevel(lesson.levelId, isQuestion, 0)),
      second: lessonPrompt(sentence, cues, profile, hintForLevel(lesson.levelId, isQuestion, 1)),
    };
  });
  return {
    language: lesson.language,
    scenarioId: `lesson:${lesson.id}`,
    titleFa: lesson.title,
    missionFa: lesson.situation,
    topicFa: lesson.title,
    levelLabel: profile.cefr,
    difficultyLabel: profile.turnLabelFa,
    turns,
  };
}
