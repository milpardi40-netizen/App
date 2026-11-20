import type { LearningLesson } from './types';
import { createCourseProgressStore } from '../createCourseProgressStore';
import { A1_FOUNDATION } from './russianBeginner/a1Band1';
import { A1_SURVIVAL } from './russianBeginner/a1Band2';
import { EVERYDAY_LESSONS_A } from './russianEverydayPartA';
import { EVERYDAY_LESSONS_B } from './russianEverydayPartB';
import { RUSSIAN_B1_LESSONS } from './russianB1';
import { RUSSIAN_B2_LESSONS } from './russianB2';
import { RUSSIAN_C1_LESSONS } from './russianC1';
import { RUSSIAN_A2_EXPANSION_LESSONS } from './russianA2Expansion';
import { RUSSIAN_PRE_A1_LESSONS, RUSSIAN_PRE_A1_MODULES, RUSSIAN_PRE_A1_SUBTITLES, russianPreA1ModuleForLesson } from './russianPreA1';
import { RUSSIAN_B1_EXPANSION_LESSONS } from './russianB1Expansion';
import { RUSSIAN_B2_EXPANSION_LESSONS } from './russianB2Expansion';
import { RUSSIAN_C1_EXPANSION_LESSONS } from './russianC1Expansion';
import { labLessonsOf, insertLabLessons } from '../content/labLessons';
import type { LabLesson } from '../content/labLessonTypes';

/**
 * دورهٔ روسی برای فارسی‌زبان‌ها — طراحی‌شده بر پایهٔ بهترین روش‌های آموزش زبان انگلیسی
 * (رویکرد جمله‌محور / Lexical Approach / Situational Language Teaching).
 *
 * اصول این دوره:
 *  ۱. جمله‌های کامل و کوتاه؛ واژه‌ها فقط در دل جمله و بافت آموخته می‌شوند.
 *  ۲. شروع از کاربردی‌ترین و پرتکرارترین جمله‌ها (سلام، لطفاً، متشکرم، بله/نه).
 *  ۳. سیریلیک به‌تدریج و در جمله معرفی می‌شود، نه با یک درس نظری در آغاز.
 *  ۴. هر جملهٔ روسی با معنی فارسی دقیق، تلفظ تقریبی فارسی و یک کلمهٔ کلیدی همراه است.
 *  ۵. نشانهٔ تکیه (´) روی واکهٔ تکیه‌دار نوشته شده تا زبان‌آموز مبتدی تلفظ را درست بشنود.
 */

/** الفبای سیریلیک (۳۳ حرف) برای معرفی تدریجی در نکات آموزشی. */
export const RUSSIAN_ALPHABET = [...'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'] as const;

export const RUSSIAN_LESSON_STAGES = [
  { id: 'situation', labelFa: 'موقعیت', labelEn: 'Situation' },
  { id: 'core-sentences', labelFa: 'جمله‌های اصلی', labelEn: 'Core Sentences' },
  { id: 'listening', labelFa: 'شنیدن', labelEn: 'Listening' },
  { id: 'shadowing', labelFa: 'سایه‌خوانی', labelEn: 'Shadowing' },
  { id: 'sentence-building', labelFa: 'ساخت جمله', labelEn: 'Sentence Building' },
  { id: 'vocabulary', labelFa: 'واژگان از جمله', labelEn: 'Vocabulary From Sentences' },
  { id: 'grammar-through-usage', labelFa: 'دستور در کاربرد', labelEn: 'Grammar Through Usage' },
  { id: 'short-assessment', labelFa: 'سنجش کوتاه', labelEn: 'Short Assessment' },
  { id: 'speaking-check', labelFa: 'آزمون گفتاری', labelEn: 'Speaking Check' },
  { id: 'conversation-room', labelFa: 'اتاق مکالمه', labelEn: 'Conversation Room' },
] as const;

const EVERYDAY_LESSONS: readonly LearningLesson[] = [
  ...EVERYDAY_LESSONS_A,
  ...EVERYDAY_LESSONS_B,
  ...RUSSIAN_A2_EXPANSION_LESSONS,
];

const RUSSIAN_STARTER_LESSONS: readonly LearningLesson[] = [
  ...RUSSIAN_PRE_A1_LESSONS,
  ...A1_FOUNDATION,
  ...A1_SURVIVAL,
  ...EVERYDAY_LESSONS,
  ...RUSSIAN_B1_LESSONS,
  ...RUSSIAN_B1_EXPANSION_LESSONS,
  ...RUSSIAN_B2_LESSONS,
  ...RUSSIAN_B2_EXPANSION_LESSONS,
  ...RUSSIAN_C1_LESSONS,
  ...RUSSIAN_C1_EXPANSION_LESSONS,
];

export type RussianLevelId = 0 | 1 | 2 | 3 | 4 | 5;

export interface RussianCourseLevel {
  id: RussianLevelId;
  title: string;
  cefr: string;
  description: string;
  color: string;
  modules: readonly string[];
  status: 'available' | 'planned';
}

export interface RussianCourseLesson extends LearningLesson {
  levelId: RussianLevelId;
  order: number;
  subtitle: string;
  module?: string;
}

export const RUSSIAN_A1_MODULES = [
  'ساختار جمله',
  'ضمیر و مالکیت',
  'اسم‌ها و حالت‌های دستوری',
  'فعل‌ها و زمان‌ها',
  'صفت‌ها و قیدها',
  'واژگان روزمره',
  'عبارت‌های کاربردی',
  'مکالمه و ارتباط',
  'شنیدن، خواندن و نوشتن',
] as const;

const RUSSIAN_A1_MODULE_BY_LESSON: Record<string, string> = {
  'ru-l1-greetings': RUSSIAN_A1_MODULES[0], 'ru-l1-how-are-you': RUSSIAN_A1_MODULES[0],
  'ru-l1-yes-no-understand': RUSSIAN_A1_MODULES[0], 'ru-l1-question-words': RUSSIAN_A1_MODULES[0],
  'ru-l1-where-is': RUSSIAN_A1_MODULES[0],
  'ru-l1-introductions': RUSSIAN_A1_MODULES[1], 'ru-l1-numbers-family': RUSSIAN_A1_MODULES[1],
  'ru-l1-objects-this-is': RUSSIAN_A1_MODULES[1], 'ru-l1-my-your': RUSSIAN_A1_MODULES[1],
  'ru-l1-we-they': RUSSIAN_A1_MODULES[1],
  'ru-l1-numbers-1-10': RUSSIAN_A1_MODULES[2], 'ru-l1-numbers-20-100': RUSSIAN_A1_MODULES[2],
  'ru-l1-prices': RUSSIAN_A1_MODULES[2], 'ru-l2-groceries': RUSSIAN_A1_MODULES[2],
  'ru-l1-everyday-verbs': RUSSIAN_A1_MODULES[3], 'ru-l1-time-words': RUSSIAN_A1_MODULES[3],
  'ru-l2-time': RUSSIAN_A1_MODULES[3], 'ru-l2-days': RUSSIAN_A1_MODULES[3],
  'ru-l2-daily-routine': RUSSIAN_A1_MODULES[3], 'ru-l2-weekend-plans': RUSSIAN_A1_MODULES[3],
  'ru-l2-months-dates': RUSSIAN_A1_MODULES[3],
  'ru-l1-colors': RUSSIAN_A1_MODULES[4], 'ru-l1-likes': RUSSIAN_A1_MODULES[4],
  'ru-l1-weather': RUSSIAN_A1_MODULES[4], 'ru-l1-adjectives': RUSSIAN_A1_MODULES[4],
  'ru-l2-clothes-sizes': RUSSIAN_A1_MODULES[4],
  'ru-l1-food': RUSSIAN_A1_MODULES[5], 'ru-l1-drinks': RUSSIAN_A1_MODULES[5],
  'ru-l1-body-parts': RUSSIAN_A1_MODULES[5], 'ru-l1-clothes': RUSSIAN_A1_MODULES[5],
  'ru-l1-places': RUSSIAN_A1_MODULES[5], 'ru-l1-transport': RUSSIAN_A1_MODULES[5],
  'ru-l1-jobs': RUSSIAN_A1_MODULES[5],
  'ru-l1-polite-words': RUSSIAN_A1_MODULES[6], 'ru-l1-basic-wants-needs': RUSSIAN_A1_MODULES[6],
  'ru-l2-cafe': RUSSIAN_A1_MODULES[6], 'ru-l2-shopping': RUSSIAN_A1_MODULES[6],
  'ru-l2-emergency': RUSSIAN_A1_MODULES[6], 'ru-l2-restaurant-order': RUSSIAN_A1_MODULES[6],
  'ru-l2-paying-bill': RUSSIAN_A1_MODULES[6], 'ru-l2-taxi': RUSSIAN_A1_MODULES[6],
  'ru-l2-bus-tickets': RUSSIAN_A1_MODULES[6], 'ru-l2-hotel': RUSSIAN_A1_MODULES[6],
  'ru-l2-pharmacy': RUSSIAN_A1_MODULES[6],
  'ru-l2-directions': RUSSIAN_A1_MODULES[7], 'ru-l2-lost-property': RUSSIAN_A1_MODULES[7],
  'ru-l2-invitations': RUSSIAN_A1_MODULES[7],
  'ru-l2-phone-calls': RUSSIAN_A1_MODULES[8], 'ru-l2-appointments': RUSSIAN_A1_MODULES[8],
};

function russianA1ModuleForLesson(lessonId: string): string {
  const module = RUSSIAN_A1_MODULE_BY_LESSON[lessonId];
  if (!module) throw new Error(`A1 Russian lesson ${lessonId} has no curriculum module.`);
  return module;
}

export const RUSSIAN_LEVELS: readonly RussianCourseLevel[] = [
  {
    id: 0,
    title: 'Absolute Beginner',
    cefr: 'Pre-A1',
    description: 'شروع مستقل از صفر: آشنایی تدریجی با الفبا و صداها، واژه‌ها و عبارت‌های پرتکرار، جمله‌های کوتاه و مکالمه‌های قابل‌پیش‌بینی. دستور فقط در الگوهای ساده می‌آید؛ صرف کامل و جدول‌های گسترده برای این مرحله نیست.',
    color: '#94a3b8',
    modules: RUSSIAN_PRE_A1_MODULES,
    status: 'available',
  },
  {
    id: 1,
    title: 'A1 · Foundation & Survival',
    cefr: 'A1',
    description: 'از عبارت‌های آمادهٔ Pre-A1 به ساخت جمله‌های مستقل‌تر و ارتباط ساده در موقعیت‌های روزمره برو. حالت‌ها و زمان‌های روسی با الگوهای پرتکرار و محدود آموزش داده می‌شوند، نه با حفظ همهٔ صرف‌ها و استثناها؛ این برچسب گواهی رسمی CEFR نیست.',
    color: '#27A1D6',
    modules: RUSSIAN_A1_MODULES,
    status: 'available',
  },
  {
    id: 2,
    title: 'Everyday Russian',
    cefr: 'A2',
    description: 'گذشته و آینده، قصد و برنامه، توصیف ظاهر، مقایسه، توصیه، نظر، کار، خانه، سفر، شرط، پزشک، تلفن، اداره و گفت‌وگوی روان',
    color: '#19A88B',
    modules: [
      'گذشته: کارهای دیروز',
      'آینده: برنامهٔ فردا',
      'قصد و برنامه‌ها',
      'توصیف ظاهر و شخصیت',
      'مقایسه کردن',
      'توصیه و پیشنهاد',
      'نظر و علاقه',
      'کار و تحصیل',
      'خانه و خانواده',
      'سرگرمی و ورزش',
      'سفر',
      'اگر و شرط',
      'ترتیب کارهای روزانه',
      'خرید و شکایت',
      'پزشک و علائم',
      'تلفن و اینترنت',
      'اداره و خدمات',
      'فصل‌ها و آب‌وهوا',
      'آشپزی و غذا',
      'گفت‌وگوی روان',
    ],
    status: 'available',
  },
  {
    id: 3,
    title: 'Communication Russian',
    cefr: 'B1',
    description: 'ساختار جمله، روایت، نظر و ارتباط در موقعیت‌های روزمره',
    color: '#E4A436',
    modules: ['Foundation · ساختار و جمله‌سازی', 'Survival · ارتباط در زندگی واقعی'],
    status: 'available',
  },
  {
    id: 4,
    title: 'B2 — Upper-Intermediate Communication',
    cefr: 'B2',
    description: 'روسی دقیق‌تر در موضوع‌های تخصصی و رسمی',
    color: '#9A68E8',
    modules: ['روسی حرفه‌ای', 'نوشتار رسمی', 'مطالعه و رسانه'],
    status: 'available',
  },
  {
    id: 5,
    title: 'C1 — Advanced Communication',
    cefr: 'C1',
    description: 'تحلیل، استدلال و ارتباط حرفه‌ای با زبان دقیق‌تر',
    color: '#D56788',
    modules: ['Foundation · ساختار و سبک پیشرفته', 'Survival · تحلیل و ارتباط حرفه‌ای'],
    status: 'available',
  },
];

const RUSSIAN_LESSON_LEVELS: Record<string, { levelId: RussianLevelId; subtitle: string }> = {
  ...Object.fromEntries(RUSSIAN_PRE_A1_LESSONS.map(lesson => [lesson.id, { levelId: 0 as const, module: russianPreA1ModuleForLesson(lesson.id), subtitle: RUSSIAN_PRE_A1_SUBTITLES[lesson.id] ?? lesson.situation }])),
  /* سطح ۱ */
  ...Object.fromEntries([...A1_FOUNDATION, ...A1_SURVIVAL].map(l => [l.id, {levelId: 1 as const, module: russianA1ModuleForLesson(l.id), subtitle: l.situation}])),
  'ru-l3-past-simple': { levelId: 2, subtitle: 'گذشته: دیروز چه کار کردیم و چه بود' },
  'ru-l3-future-simple': { levelId: 2, subtitle: 'آینده ساده با «бу́ду» و فعل کامل' },
  'ru-l3-plans': { levelId: 2, subtitle: 'قصد، تصمیم و بایدهای آینده' },
  'ru-l3-appearance': { levelId: 2, subtitle: 'توصیف قد، موی، چشم و شخصیت' },
  'ru-l3-comparisons': { levelId: 2, subtitle: 'تفضیلی و عالی: سریع‌تر، بهتر، زیباترین' },
  'ru-l3-advice': { levelId: 2, subtitle: 'توصیه، هشدار و پیشنهاد مؤدبانه' },
  'ru-l3-likes-opinions': { levelId: 2, subtitle: 'علاقه، نظر شخصی و موافقت' },
  'ru-l3-work-study': { levelId: 2, subtitle: 'محل کار، تحصیل و برنامهٔ هفتگی' },
  'ru-l3-home': { levelId: 2, subtitle: 'آپارتمان، خانواده و محل زندگی' },
  'ru-l3-hobbies-sport': { levelId: 2, subtitle: 'سرگرمی، ورزش و بازی' },
  'ru-l3-travel': { levelId: 2, subtitle: 'بلیت، هتل، قطار و برنامهٔ سفر' },
  'ru-l3-conditions': { levelId: 2, subtitle: 'اگر و شرط، آرزو با бы' },
  'ru-l3-daily-sequence': { levelId: 2, subtitle: 'اول، بعد، قبل و بعد از کارهای روزانه' },
  'ru-l3-shopping-return': { levelId: 2, subtitle: 'عوض کردن، پس دادن و پرداخت با کارت' },
  'ru-l3-health-doctor': { levelId: 2, subtitle: 'علائم، دارو و توصیه‌های پزشک' },
  'ru-l3-phone-internet': { levelId: 2, subtitle: 'شماره، آنتن، وای‌فای و پیام' },
  'ru-l3-public-service': { levelId: 2, subtitle: 'صف، فرم، ویزا و حساب بانکی' },
  'ru-l3-weather-seasons': { levelId: 2, subtitle: 'فصل‌ها، باد، برف و گرما' },
  'ru-l3-cooking-food': { levelId: 2, subtitle: 'دستور پخت، مواد و میز شام' },
  'ru-l3-conversation-tools': { levelId: 2, subtitle: 'موافقت، پوزش، بحث و تصمیم مشترک' },
  ...Object.fromEntries(RUSSIAN_B1_LESSONS.map((lesson, index) => [lesson.id, {
    levelId: 3 as const,
    subtitle: `${index < 10 ? 'Foundation' : 'Survival'} · ${lesson.situation}`,
  }])),
  ...Object.fromEntries(RUSSIAN_B2_LESSONS.map((lesson, index) => [lesson.id, {
    levelId: 4 as const,
    subtitle: `${index < 10 ? 'Foundation' : 'Survival'} · ${lesson.situation}`,
  }])),
  ...Object.fromEntries(RUSSIAN_C1_LESSONS.map((lesson, index) => [lesson.id, {
    levelId: 5 as const,
    subtitle: `${index < 10 ? 'Foundation' : 'Survival'} · ${lesson.situation}`,
  }])),
  ...Object.fromEntries(RUSSIAN_A2_EXPANSION_LESSONS.map(lesson => [lesson.id, { levelId: 2 as const, subtitle: `تکمیلی · ${lesson.situation}` }])),
  ...Object.fromEntries(RUSSIAN_B1_EXPANSION_LESSONS.map(lesson => [lesson.id, { levelId: 3 as const, subtitle: `تکمیلی · ${lesson.situation}` }])),
  ...Object.fromEntries(RUSSIAN_B2_EXPANSION_LESSONS.map(lesson => [lesson.id, { levelId: 4 as const, subtitle: `تکمیلی · ${lesson.situation}` }])),
  ...Object.fromEntries(RUSSIAN_C1_EXPANSION_LESSONS.map(lesson => [lesson.id, { levelId: 5 as const, subtitle: `تکمیلی · ${lesson.situation}` }])),
};

function russianLabLesson(lab: LabLesson): RussianCourseLesson {
  return {
    id: lab.id, levelId: lab.levelId, order: 0,
    title: lab.title, subtitle: lab.subtitle, situation: lab.situation,
    teachingFa: lab.teachingFa, durationMinutes: lab.durationMinutes,
    sentences: lab.sentences.map((sentence, index) => ({
      id: `${lab.id}-s${index + 1}`, text: sentence.text, fa: sentence.fa,
      pronunciation: sentence.pronunciation,
      ...(sentence.pattern ? { pattern: sentence.pattern } : {}),
      vocabulary: sentence.vocabulary,
    })),
    dialogue: lab.dialogue, checks: lab.checks,
  };
}

const russianBaseLessons: readonly RussianCourseLesson[] = RUSSIAN_STARTER_LESSONS.map((item, index) => {
  const level = RUSSIAN_LESSON_LEVELS[item.id];
  if (!level) throw new Error(`Russian lesson ${item.id} has no level assignment.`);
  return { ...item, ...level, order: index + 1 };
});

export const RUSSIAN_LESSONS: readonly RussianCourseLesson[] = insertLabLessons(
  russianBaseLessons,
  labLessonsOf('ru').map(russianLabLesson),
  'ru', // Pre-A1 is exempt: that band is hand-written now (see EXEMPT_LEVELS in ./content/labLessons).
).map((lesson, index) => ({ ...lesson, order: index + 1 }));

export function findRussianLesson(id: string | undefined): RussianCourseLesson | undefined {
  return RUSSIAN_LESSONS.find(item => item.id === id);
}

export const russianProgress = createCourseProgressStore({
  key: 'sentence_course_progress_ru_v2',
  lessons: RUSSIAN_LESSONS,
  cloudSync: false,
  recordEstimatedTime: false,
  markVocabularyOnCompletion: false,
});
