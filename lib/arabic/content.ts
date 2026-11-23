import type { Skill } from '@/lib/englishSupplement/content';
import { ARABIC_PRE_A1_LESSONS } from './preA1';
import { ARABIC_A1_LESSONS } from './a1';
import { ARABIC_A2_LESSONS } from './a2';
import { ARABIC_B1_LESSONS } from './b1';
import { ARABIC_B2_LESSONS } from './b2';
import { ARABIC_C1_LESSONS } from './c1';

export type ArabicLevelId = 0 | 1 | 2 | 3 | 4 | 5;

export interface ArabicVocabularyItem {
  word: string;
  meaning: string;
  root?: string;
  core?: true;
}

export interface ArabicSentence {
  id: string;
  /** Full Arabic sentence with educational harakat/tashkeel for clear pronunciation and reading. */
  ar: string;
  /** Optional plain unvowelled form if different from stripped harakat. */
  arPlain?: string;
  /** Persian translation. */
  fa: string;
  /** Persian phonetic transcription/transliteration. */
  pronunciation: string;
  /** Sentence grammar or structure pattern label. */
  pattern?: string;
  vocabulary: ArabicVocabularyItem[];
}

export interface ArabicDialogueLine {
  speaker: 'partner' | 'learner';
  name?: string;
  ar: string;
  fa: string;
  pronunciation?: string;
}

export interface ArabicCheck {
  id: string;
  skill: Skill;
  prompt: string;
  audio?: string;
  source?: string;
  options?: string[];
  answers: string[];
  explanation: string;
}

export interface ArabicLesson {
  id: string;
  levelId: ArabicLevelId;
  order: number;
  section?: 'foundation' | 'survival' | 'everyday' | 'fluency';
  title: string;
  subtitle: string;
  situation: string;
  teachingFa?: string;
  durationMinutes: number;
  sentences: ArabicSentence[];
  dialogue: ArabicDialogueLine[];
  checks?: ArabicCheck[];
  unitId?: string;
  unitTitle?: string;
  unitTitleAr?: string;
  goal?: string;
}

export interface ArabicLevel {
  id: ArabicLevelId;
  cefr: 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  title: string;
  arabicTitle: string;
  subtitle: string;
  accent: string;
  accentSoft: string;
}

export const ARABIC_LEVELS: readonly ArabicLevel[] = [
  {
    id: 0,
    cefr: 'Pre-A1',
    title: 'سطح ۰ · پیش‌نیاز و پایه‌های خواندن و سلام',
    arabicTitle: 'المستوى التمهيدي',
    subtitle: 'آشنایی با حرکات کوتاه و بلند، حروف پایه، احوال‌پرسی و معرفی خیلی کوتاه',
    accent: '#0F766E',
    accentSoft: '#CCFBF1',
  },
  {
    id: 1,
    cefr: 'A1',
    title: 'سطح ۱ · ارتباط‌های روزمرهٔ بقا',
    arabicTitle: 'المستوى المبتدئ الأول',
    subtitle: 'سفارش غذا، پرسیدن آدرس، عددها، خرید ساده و جمله‌های اسمی پایه',
    accent: '#0284C7',
    accentSoft: '#E0F2FE',
  },
  {
    id: 2,
    cefr: 'A2',
    title: 'سطح ۲ · زندگی روزمره و کارهای واقعی',
    arabicTitle: 'المستوى المبتدئ الثاني',
    subtitle: 'برنامه‌ریزی، زمان‌ها، کار، سفر، پزشک و فعل‌های پرکاربرد ماضی و مضارع',
    accent: '#2563EB',
    accentSoft: '#DBEAFE',
  },
  {
    id: 3,
    cefr: 'B1',
    title: 'سطح ۳ · روانی و بیان نظر',
    arabicTitle: 'المستوى المتوسط الأول',
    subtitle: 'بیان دلیل، تجربه، مقایسه، گفت‌وگوی پیوسته و روایت رخدادها',
    accent: '#7C3AED',
    accentSoft: '#EDE9FE',
  },
  {
    id: 4,
    cefr: 'B2',
    title: 'سطح ۴ · مکالمهٔ دقیق و حرفه‌ای',
    arabicTitle: 'المستوى المتوسط الثاني',
    subtitle: 'بحث و استدلال، شرایط، درخواست رسمی، تعامل کاری و متن‌های رسانه‌ای',
    accent: '#B45309',
    accentSoft: '#FEF3C7',
  },
  {
    id: 5,
    cefr: 'C1',
    title: 'سطح ۵ · تسلط و ظرافت بیان عربی',
    arabicTitle: 'المستوى المتقدم',
    subtitle: 'اصطلاحات فصیح، اقناع، تحلیل موضوعات پیچیده و بیان دقیق ظرایف معنایی',
    accent: '#BE123C',
    accentSoft: '#FFE4E6',
  },
] as const;

/**
 * Arabic curriculum lessons:
 * - Pre-A1 (levelId 0): 20 graded MSA lessons across 10 modules
 * - A1 (levelId 1): 14 functional MSA lessons across 5 units
 * - A2 (levelId 2): 14 intermediate-starter MSA lessons across 4 units
 * - B1 (levelId 3): 14 independent MSA lessons across 5 units
 * - B2 (levelId 4): 14 upper-intermediate analytical MSA lessons across 4 units
 * - C1 (levelId 5): 14 advanced academic/executive/literary MSA lessons across 5 units
 */
export const ARABIC_LESSONS: ArabicLesson[] = [
  ...ARABIC_PRE_A1_LESSONS,
  ...ARABIC_A1_LESSONS,
  ...ARABIC_A2_LESSONS,
  ...ARABIC_B1_LESSONS,
  ...ARABIC_B2_LESSONS,
  ...ARABIC_C1_LESSONS,
];

export function getArabicLesson(id?: string): ArabicLesson | undefined {
  if (!id) return ARABIC_LESSONS[0];
  return ARABIC_LESSONS.find(lesson => lesson.id === id);
}

export function getArabicLessonsByLevel(levelId: ArabicLevelId): ArabicLesson[] {
  return ARABIC_LESSONS
    .filter(lesson => lesson.levelId === levelId)
    .sort((a, b) => a.order - b.order);
}
