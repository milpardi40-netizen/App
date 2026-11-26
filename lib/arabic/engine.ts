import type { LearningLesson } from '@/lib/languages/types';
import {
  ARABIC_LESSONS,
  ARABIC_LEVELS,
  type ArabicLesson,
  type ArabicLevelId,
} from './content';
import { stripArabicDiacritics } from './text';

export interface ArabicEngineStep {
  key:
    | 'situation'
    | 'core-sentences'
    | 'listening'
    | 'shadowing'
    | 'sentence-building'
    | 'vocabulary'
    | 'grammar-through-usage'
    | 'short-assessment'
    | 'speaking-check'
    | 'dialogue-room';
  title: string;
  subtitle: string;
}

/**
 * Canonical 10-stage English-pattern learning flow for Arabic:
 * Situation -> Core Sentences -> Listening -> Shadowing -> Sentence Building (RTL)
 * -> Vocabulary from Sentences -> Grammar through Usage -> Short Assessment -> Speaking Exam -> Dialogue Room.
 */
export const ARABIC_ENGINE_STEPS: readonly ArabicEngineStep[] = [
  { key: 'situation', title: 'موقعیت', subtitle: 'درک صحنه و نیاز ارتباطی واقعی' },
  { key: 'core-sentences', title: 'جمله‌های اصلی', subtitle: 'شنیدن، دیدن خط حرکات‌دار، معنی و تلفظ' },
  { key: 'listening', title: 'شنیدن', subtitle: 'تمرین گوش و تشخیص جمله در عربی فصیح' },
  { key: 'shadowing', title: 'سایه‌خوانی', subtitle: 'تکرار هم‌زمان و بررسی تلفظ عربی' },
  { key: 'sentence-building', title: 'ساخت جمله', subtitle: 'چینش راست‌به‌چپ واژه‌ها و درک ساختار جمله' },
  { key: 'vocabulary', title: 'واژگان از جمله', subtitle: 'یادگیری واژه و ریشه در متن واقعی' },
  { key: 'grammar-through-usage', title: 'دستور در کاربرد', subtitle: 'قالب اسمی/فعلی و مطابقت از دل مثال‌ها' },
  { key: 'short-assessment', title: 'سنجش کوتاه', subtitle: 'شنیداری، خواندن، نوشتن و کاربرد' },
  { key: 'speaking-check', title: 'آزمون گفتاری', subtitle: 'سنجش بدون تکرار و ثبت خطاهای واقعی' },
  { key: 'dialogue-room', title: 'اتاق گفت‌وگو', subtitle: 'هشت جملهٔ درس در یک گفت‌وگوی دوستانه با اپراتور' },
] as const;

export interface ArabicLevelBlueprint {
  levelId: ArabicLevelId;
  cefr: 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  focus: string;
  readingGoal: string;
  speakingGoal: string;
  grammarGoal: string;
}

export const ARABIC_ENGINE_BLUEPRINT: readonly ArabicLevelBlueprint[] = [
  {
    levelId: 0,
    cefr: 'Pre-A1',
    focus: 'حرکات کوتاه و بلند، حروف شمسی و قمری، سلام و معرفی',
    readingGoal: 'خواندن واژه‌های حرکات‌دار بدون حدس و شناخت نشانه‌های تنوین و تشدید',
    speakingGoal: 'ادای واضح حروف خاص عربی (ع، ح، خ، غ، ق) در عبارت‌های کوتاه',
    grammarGoal: 'ضمایر منفصل پایه (أنا، أنتَ، أنتِ) و جملهٔ اسمی ساده',
  },
  {
    levelId: 1,
    cefr: 'A1',
    focus: 'جملهٔ اسمی، اضافه، سؤال کوتاه، عددها و نیازهای روزمره',
    readingGoal: 'درک پیام‌ها، تابلوها و دیالوگ‌های کوتاه حرکات‌دار',
    speakingGoal: 'پرسیدن و پاسخ‌دادن در موقعیت‌های خرید، کافه، آدرس و زمان',
    grammarGoal: 'مذکر و مؤنث، تاء مربوطه، حروف جر و صیغهٔ حال ساده',
  },
  {
    levelId: 2,
    cefr: 'A2',
    focus: 'ماضی و مضارع در مکالمه‌های واقعی روزمره',
    readingGoal: 'خواندن متن‌های کوتاه روزمره و درک ارتباط جمله‌ها',
    speakingGoal: 'توصیف برنامهٔ روز، تجربهٔ گذشته و خواسته‌های مشخص',
    grammarGoal: 'فعل ماضی، مضارع با س/سوف برای آینده، نفی با لا/لم/لن',
  },
  {
    levelId: 3,
    cefr: 'B1',
    focus: 'ربط جمله‌ها، دلیل‌آوردن، مقایسه و روایت پیوسته',
    readingGoal: 'درک متن‌های بدون حرکت کامل بر پایهٔ ریشه و وزن',
    speakingGoal: 'بیان نظر، دلیل‌گذاری و مدیریت مکالمهٔ چندنوبتی',
    grammarGoal: 'اسم موصول (الذي/التي)، حروف ربط سببی و شرطی ساده',
  },
  {
    levelId: 4,
    cefr: 'B2',
    focus: 'مناظره، زبان کاری/رسمی و متون تحلیلی',
    readingGoal: 'خواندن متون خبری و رسمی بدون حرکات اعرابی کامل',
    speakingGoal: 'استدلال منسجم، مخالفت مؤدبانه و پاسخ دقیق به پرسش‌های چالشی',
    grammarGoal: 'ساختارهای شرطی پیشرفته، مفعول مطلق و مبنی‌للمجهول',
  },
  {
    levelId: 5,
    cefr: 'C1',
    focus: 'فصاحت، ظرایف سبکی، اصطلاحات و بیان دقیق در بافت‌های پیچیده',
    readingGoal: 'تحلیل فوری متون تخصصی، مقالات و سخنان رسمی عربی',
    speakingGoal: 'سخنوری منعطف و اقناع با انتخاب دقیق واژگان و ترکیب‌های بومی',
    grammarGoal: 'ظرایف نحوی، تمیز، حال، اسلوب حصر و بلاغت کاربردی',
  },
] as const;

export function getArabicLevelMetrics(levelId: ArabicLevelId, completedIds: readonly string[]) {
  const lessons = ARABIC_LESSONS.filter(item => item.levelId === levelId);
  const completed = lessons.filter(item => completedIds.includes(item.id)).length;
  const total = lessons.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  let sentenceCount = 0;
  const patternSet = new Set<string>();
  const vocabSet = new Set<string>();
  for (const lesson of lessons) {
    for (const sentence of lesson.sentences) {
      sentenceCount += 1;
      const pattern = sentence.pattern?.trim();
      if (pattern) patternSet.add(pattern);
      for (const vocab of sentence.vocabulary) {
        const key = stripArabicDiacritics(vocab.word).trim();
        if (key) vocabSet.add(key);
      }
    }
  }
  return {
    total,
    completed,
    percent,
    sentenceCount,
    patternCount: patternSet.size,
    vocabularyCount: vocabSet.size,
  };
}

export interface ArabicWordLabItem {
  id: string;
  target: string;
  plain: string;
  fa: string;
  root?: string;
  exampleTarget: string;
  exampleFa: string;
  examplePronunciation?: string;
  note: string;
  order: number;
  frequencyRank: number | null;
  levelId: number;
  lessonTitle: string;
  curated?: boolean;
}

export function getArabicWordLabWords(): readonly ArabicWordLabItem[] {
  const seen = new Set<string>();
  const items: ArabicWordLabItem[] = [];
  const ordered = [...ARABIC_LESSONS].sort((a, b) => a.levelId - b.levelId || a.order - b.order);
  for (const lesson of ordered) {
    for (const sentence of lesson.sentences) {
      for (const vocab of sentence.vocabulary) {
        const plain = stripArabicDiacritics(vocab.word).trim();
        if (!plain || plain.length < 2 || seen.has(plain)) continue;
        seen.add(plain);
        items.push({
          id: `ar-word-${plain}`,
          target: vocab.word,
          plain,
          fa: vocab.meaning,
          root: vocab.root,
          exampleTarget: sentence.ar,
          exampleFa: sentence.fa,
          examplePronunciation: sentence.pronunciation,
          note: vocab.root ? `ریشهٔ سه‌حرفی/اصلی: ${vocab.root} · از درس «${lesson.title}»` : `از درس «${lesson.title}»`,
          order: items.length + 1,
          frequencyRank: null,
          levelId: lesson.levelId,
          lessonTitle: lesson.title,
          curated: true,
        });
      }
    }
  }
  return items;
}

export function getArabicLessonVocabulary(lesson: ArabicLesson) {
  const seen = new Set<string>();
  const items: Array<{
    word: string;
    plain: string;
    meaning: string;
    root?: string;
    core?: true;
    sentenceAr: string;
    sentenceFa: string;
  }> = [];

  for (const sentence of lesson.sentences) {
    for (const vocab of sentence.vocabulary) {
      const key = stripArabicDiacritics(vocab.word).trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push({
        word: vocab.word,
        plain: key,
        meaning: vocab.meaning,
        root: vocab.root,
        core: vocab.core,
        sentenceAr: sentence.ar,
        sentenceFa: sentence.fa,
      });
    }
  }
  return items;
}

export function getArabicLessonPatterns(lesson: ArabicLesson) {
  const seen = new Set<string>();
  const patterns: Array<{ pattern: string; exampleAr: string; exampleFa: string }> = [];
  for (const sentence of lesson.sentences) {
    const label = sentence.pattern?.trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    patterns.push({
      pattern: label,
      exampleAr: sentence.ar,
      exampleFa: sentence.fa,
    });
  }
  return patterns;
}

/**
 * Adapts an ArabicLesson into the shared LearningLesson shape used by
 * WordLab and the shared course snapshot.
 */
export function arabicLessonToLearningLesson(lesson: ArabicLesson): LearningLesson {
  return {
    id: lesson.id,
    title: lesson.title,
    situation: lesson.situation,
    durationMinutes: lesson.durationMinutes,
    teachingFa: lesson.teachingFa,
    sentences: lesson.sentences.map(sentence => ({
      id: sentence.id,
      text: sentence.ar,
      fa: sentence.fa,
      pronunciation: sentence.pronunciation,
      pattern: sentence.pattern,
      vocabulary: sentence.vocabulary.map(v => ({ word: v.word, meaning: v.meaning })),
    })),
    dialogue: lesson.dialogue.map(line => ({
      speaker: line.name ?? (line.speaker === 'partner' ? 'المُحاوِر' : 'شما'),
      role: line.speaker,
      text: line.ar,
      fa: line.fa,
    })),
  };
}
