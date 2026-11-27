import { enrichRussianPreA1, RUSSIAN_PRE_A1_PRACTICAL_REVISION } from './russianPreA1Practical';
import { orderChecks } from './russianBeginner/checkOrder';
import type { LearningLesson, LearningSentence } from './types';

/**
 * سطح Pre-A1 روسی — طراحی‌شده از صفر مطلق (بدون هیچ پیش‌زمینهٔ قبلی):
 * ۳۱ درس تدریجی در ۸ بخشِ هماهنگ با ترتیب قطعی آموزشی:
 * ۱. کلمه (بخش ۱ و ۲) → ۲. عبارت و ترکیب (بخش ۳ و ۴) → ۳. جمله (بخش ۵)
 * → ۴. سؤال، پاسخ و بیان روزمره (بخش ۶ و ۷) → ۵. مکالمه‌های ابتدایی (بخش ۸).
 * دستور زبان به‌صورت تدریجی و در دل درس‌ها، بدون اصطلاحات پیچیدهٔ مقدماتی معرفی می‌شود.
 */

// A1 keeps its existing check revision; only Pre-A1 answers are retired.
export const STARTER_CHECKS_REVISION = 'ru-pre-a1-zero-v2';
export const PRE_A1_CONTENT_REVISION = RUSSIAN_PRE_A1_PRACTICAL_REVISION;
export const RUSSIAN_HELLO_LESSON_ID = 'ru-pre-01-hello';
export const RUSSIAN_HELLO_CONTENT_REVISION = PRE_A1_CONTENT_REVISION;

/** Retire answers only for the lesson whose checks changed. */
export function russianChecksRevisionFor(lessonId: string): string {
  return lessonId === RUSSIAN_HELLO_LESSON_ID ? RUSSIAN_HELLO_CONTENT_REVISION
    : lessonId.startsWith('ru-pre-') ? PRE_A1_CONTENT_REVISION : STARTER_CHECKS_REVISION;
}

/** Beginner rooms use their taught dialogue; A2–C1 room sources stay unchanged. */
export function russianRoomLines(lesson: Pick<LearningLesson, 'id' | 'sentences' | 'dialogue'>) {
  return lesson.id.startsWith('ru-pre-') || lesson.id.startsWith('ru-a1-')
    ? lesson.dialogue : lesson.sentences.map(sentence => ({ text: sentence.text, fa: sentence.fa }));
}


const HELLO_LISTENING_INTENTS = [
  'تأیید یا قبول‌کردن', 'نفی یا ردکردن', 'شروع ارتباط دوستانه',
  'شروع ارتباط محترمانه', 'پایان ارتباط دوستانه', 'خداحافظی با امید دیدار دوباره',
  'تشکر و پاسخ به تشکر', 'عذرخواهی مؤدبانه',
  'پذیرفتن پیشنهاد همراه با تشکر', 'ردکردن پیشنهاد همراه با تشکر',
  'پرسیدن حال یک دوست', 'پاسخ مثبت به احوال‌پرسی و پرسیدن حال طرف مقابل',
] as const;

/** In lesson one, listen for what the speaker is doing, not just literal translation. */
export function russianListeningItems(lesson: Pick<LearningLesson, 'id' | 'sentences'>) {
  return lesson.sentences.map((sentence, index) => ({
    id: sentence.id, text: sentence.text,
    fa: lesson.id === RUSSIAN_HELLO_LESSON_ID ? HELLO_LISTENING_INTENTS[index] ?? sentence.fa : sentence.fa,
  }));
}


export interface StarterLine {
  text: string;
  fa: string;
  pronunciation: string;
}

export interface StarterStep {
  id: string;
  title: string;
  letters: string;
  goal: string;
  note: string;
  situationCheck: string;
  oral: readonly StarterLine[];
  ending: StarterLine;
  read: readonly StarterLine[];
}

/** Kept as empty compatibility exports; Pre-A1 follows the structured 28-lesson zero-to-dialogue path. */
export const RUSSIAN_STARTER_STEPS: readonly StarterStep[] = [];
export function starterStep(_id: string): StarterStep | undefined {
  return undefined;
}

interface PreSentenceInput {
  text: string;
  fa: string;
  pronunciation: string;
  pattern?: string;
  vocabulary: readonly [word: string, meaning: string][];
}

interface PreCheckInput {
  promptFa: string;
  choices: readonly [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanationFa: string;
}

interface PreDialogueLine<S extends 'هم‌صحبت' | 'زبان‌آموز', R extends 'partner' | 'learner'> {
  speaker: S;
  role: R;
  text: string;
  fa: string;
  pronunciation: string;
}

interface PreLessonInput {
  id: string;
  module: string;
  title: string;
  subtitle: string;
  situation: string;
  teachingFa: string;
  durationMinutes: number;
  sentences: readonly PreSentenceInput[];
  dialogue:
    | readonly [
        PreDialogueLine<'هم‌صحبت', 'partner'>,
        PreDialogueLine<'زبان‌آموز', 'learner'>,
        PreDialogueLine<'هم‌صحبت', 'partner'>,
        PreDialogueLine<'زبان‌آموز', 'learner'>,
        PreDialogueLine<'هم‌صحبت', 'partner'>,
        PreDialogueLine<'زبان‌آموز', 'learner'>,
      ]
    | readonly [
        PreDialogueLine<'هم‌صحبت', 'partner'>,
        PreDialogueLine<'زبان‌آموز', 'learner'>,
        PreDialogueLine<'هم‌صحبت', 'partner'>,
        PreDialogueLine<'زبان‌آموز', 'learner'>,
      ]
    | readonly [
        PreDialogueLine<'زبان‌آموز', 'learner'>,
        PreDialogueLine<'هم‌صحبت', 'partner'>,
        PreDialogueLine<'زبان‌آموز', 'learner'>,
        PreDialogueLine<'هم‌صحبت', 'partner'>,
      ];
  checks: readonly PreCheckInput[];
}

export const RUSSIAN_PRE_A1_MODULES = [
  'بخش ۱: اولین کلمات روسی',
  'بخش ۲: کلمات پایه',
  'بخش ۳: عبارت‌های بسیار ساده',
  'بخش ۴: ترکیب کلمات',
  'بخش ۵: اولین جمله‌ها',
  'بخش ۶: سؤال‌های بسیار ساده',
  'بخش ۷: جمله‌های روزمره',
  'بخش ۸: مکالمات ابتدایی',
] as const;

const PRE_A1_LESSON_DEFS: readonly PreLessonInput[] = [
  {
    id: 'ru-pre-01-hello',
    module: RUSSIAN_PRE_A1_MODULES[0],
    title: 'بله، خیر، سلام و خداحافظ',
    subtitle: 'سلام، احوال‌پرسی دوستانه و خداحافظی',
    situation: 'هدف: بتوانم سلام کنم، حال دوستم را بپرسم، پاسخ بدهم و گفت‌وگو را ببندم. موقعیت: دو دوست به هم می‌رسند، از حال هم می‌پرسند و با امید دیدار دوباره خداحافظی می‌کنند. تشکر، پاسخ تشکر و قبول یا رد مؤدبانه هم جداگانه تمرین می‌شوند.',
    teachingFa: 'کاربرد: «Приве́т» سلام دوستانه و «Здра́вствуйте» سلام محترمانه است؛ در هر گفت‌وگو لحن را هماهنگ نگه دار.\nپاسخ کوتاه: «Да, спаси́бо» یعنی بله، ممنون؛ با عوض‌کردن فقط «Да» به «Нет» پیشنهاد را مؤدبانه رد می‌کنی.\nتشکر و پاسخ: «Спаси́бо» → «Пожа́луйста». هنگام درخواست، «Пожа́луйста» معنی لطفاً می‌دهد؛ «Извини́те» برای عذرخواهی است.\nاحوال‌پرسی: «Как ты?» یعنی حالت چطور است؟ پاسخ کوتاه: «Хорошо́, спаси́бо» یعنی خوبم، ممنون. با «А ты?» یعنی و تو؟ نوبت را به دوستت برگردان. این عبارت‌ها برای دوست هستند؛ کنار سلام محترمانه از آن‌ها استفاده نکن. «Хорошо́» اینجا یعنی خوب؛ شکل آن برای گوینده عوض نمی‌شود.\nتلفظ: در «Приве́т» بخش آخر و در «Спаси́бо» بخش «سی» را پررنگ‌تر بگو. در تکرار دوم، اول از حافظه بگو و بعد نمونه را گوش کن.',
    durationMinutes: 10,
    sentences: [
      { text: 'Да.', fa: 'بله.', pronunciation: 'دا.', vocabulary: [['Да', 'بله']] },
      { text: 'Нет.', fa: 'نه / خیر.', pronunciation: 'نِت.', vocabulary: [['Нет', 'نه / خیر']] },
      { text: 'Приве́т.', fa: 'سلام. (دوستانه)', pronunciation: 'پْری‌ویت.', pattern: 'سلام دوستانه ← پاسخ دوستانه: Приве́т.', vocabulary: [['Приве́т', 'سلام (دوستانه)']] },
      { text: 'Здра́вствуйте.', fa: 'سلام. (محترمانه)', pronunciation: 'زْدْراسْت‌وُیْتِه.', pattern: 'سلام محترمانه ← پاسخ محترمانه: Здра́вствуйте.', vocabulary: [['Здра́вствуйте', 'سلام (محترمانه)']] },
      { text: 'Пока́.', fa: 'خداحافظ. (دوستانه)', pronunciation: 'پاکا.', vocabulary: [['Пока́', 'خداحافظ (دوستانه)']] },
      { text: 'Уви́димся.', fa: 'بعداً می‌بینمتان.', pronunciation: 'اوویدیمسیا.', vocabulary: [['Уви́димся', 'بعداً می‌بینمتان']] },
      { text: 'Спаси́бо. Пожа́луйста.', fa: 'ممنون. — خواهش می‌کنم. (تشکر و پاسخ آن)', pronunciation: 'سْپاسیبا. پاژالُیْسْتا.', pattern: 'تشکر: Спаси́бо. ← پاسخ: Пожа́луйста.', vocabulary: [['Спаси́бо', 'ممنون؛ برای تشکر'], ['Пожа́луйста', 'خواهش می‌کنم؛ در درخواست: لطفاً']] },
      { text: 'Извини́те.', fa: 'ببخشید / عذر می‌خواهم.', pronunciation: 'ایزْوینیتِه.', vocabulary: [['Извини́те', 'ببخشید / عذرخواهی']] },
      { text: 'Да, спаси́бо.', fa: 'بله، ممنون. (پذیرفتن پیشنهاد)', pronunciation: 'دا، سْپاسیبا.', pattern: 'پذیرفتن مؤدبانه: بله + تشکر', vocabulary: [['Да', 'بله؛ پذیرفتن پیشنهاد'], ['спаси́бо', 'ممنون']] },
      { text: 'Нет, спаси́бо.', fa: 'نه، ممنون. (ردکردن مؤدبانهٔ پیشنهاد)', pronunciation: 'نِت، سْپاسیبا.', pattern: 'ردکردن مؤدبانه: نه + تشکر', vocabulary: [['Нет', 'نه؛ ردکردن پیشنهاد'], ['спаси́бо', 'ممنون']] },
      { text: 'Как ты?', fa: 'حالت چطور است؟ (دوستانه)', pronunciation: 'کاک تی؟', pattern: 'احوال‌پرسی دوستانه: حالت چطور است؟', vocabulary: [['Как', 'چطور؛ در پرسیدن حال'], ['ты', 'تو؛ خطاب به دوست']] },
      { text: 'Хорошо́, спаси́бо. А ты?', fa: 'خوبم، ممنون. و تو؟', pronunciation: 'خاراشو، سْپاسیبا. آ تی؟', pattern: 'پاسخ به احوال‌پرسی + تشکر + پرسش متقابل', vocabulary: [['Хорошо́', 'خوب؛ در پاسخ به احوال‌پرسی'], ['спаси́бо', 'ممنون'], ['А ты', 'و تو؟؛ برگرداندن پرسش به دوست']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Приве́т! Как ты?', fa: 'سلام! حالت چطور است؟', pronunciation: 'پْری‌ویت! کاک تی؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Приве́т! Хорошо́, спаси́бо. А ты?', fa: 'سلام! خوبم، ممنون. و تو؟', pronunciation: 'پْری‌ویت! خاراشو، سْپاسیبا. آ تی؟' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Хорошо́, спаси́бо.', fa: 'خوبم، ممنون.', pronunciation: 'خاراشو، سْپاسیبا.' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Уви́димся!', fa: 'بعداً می‌بینمت!', pronunciation: 'اوویدیمسیا!' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Да, уви́димся. Пока́!', fa: 'بله، می‌بینمت. خداحافظ!', pronunciation: 'دا، اوویدیمسیا. پاکا!' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Пока́!', fa: 'خداحافظ!', pronunciation: 'پاکا!' },
    ],
    checks: [
      { promptFa: 'برای سلام محترمانه کدام واژه به کار می‌رود؟', choices: ['Здра́вствуйте.', 'Приве́т.', 'Пока́.', 'Нет.'], correctIndex: 0, explanationFa: '«Здра́вствуйте» سلام رسمی و محترمانه در روسی است.' },
      { promptFa: 'برای عذرخواهی و گفتن «ببخشید» کدام واژه درست است؟', choices: ['Пока́.', 'Да.', 'Извини́те.', 'Нет.'], correctIndex: 2, explanationFa: '«Извини́те» یعنی «ببخشید / عذر می‌خواهم».' },
      { promptFa: 'برای خداحافظی دوستانه چه می‌گوییم؟', choices: ['Да.', 'Пока́.', 'Приве́т.', 'Пожа́луйста.'], correctIndex: 1, explanationFa: '«Пока́» خداحافظی دوستانه و خودمانی است.' },
      { promptFa: 'دوستت می‌گوید «Спаси́бо!»؛ کدام پاسخ مناسب تشکر اوست؟', choices: ['Пока́!', 'Нет.', 'Пожа́луйста!', 'Приве́т!'], correctIndex: 2, explanationFa: 'در پاسخ تشکر، «Пожа́луйста!» یعنی «خواهش می‌کنم». اینجا معنی «لطفاً» ندارد.' },
      { promptFa: 'می‌خواهی پیشنهادی را مؤدبانه رد کنی. کدام عبارت مناسب است؟', choices: ['Да, спаси́бо.', 'Нет, спаси́бо.', 'Приве́т.', 'Здра́вствуйте.'], correctIndex: 1, explanationFa: '«Нет, спаси́бо» یعنی «نه، ممنون». همان الگوی پذیرفتن پیشنهاد است؛ فقط «Да» به «Нет» عوض شده است.' },
      { promptFa: 'برای پذیرفتن مؤدبانهٔ یک پیشنهاد، چه می‌گویی؟', choices: ['Извини́те.', 'Пока́.', 'Нет, спаси́бо.', 'Да, спаси́бо.'], correctIndex: 3, explanationFa: '«Да, спаси́бо» یعنی «بله، ممنون». حالا می‌توانی با همین دو واژه پیشنهاد را قبول کنی؛ با «Нет» آن را رد می‌کنی.' },
      { promptFa: 'دوستت می‌پرسد «Как ты?»؛ کدام پاسخ هم حال تو را می‌گوید و هم پرسش را به او برمی‌گرداند؟', choices: ['Нет, спаси́бо.', 'Хорошо́, спаси́бо. А ты?', 'Пока́.', 'Извини́те.'], correctIndex: 1, explanationFa: '«Хорошо́, спаси́бо» یعنی خوبم، ممنون. «А ты?» یعنی و تو؟؛ با آن از حال دوستت هم می‌پرسی.' },
      { promptFa: 'در پاسخ «Хорошо́, спаси́бо. А ты?» بخش «А ты?» چه کاری می‌کند؟', choices: ['گفت‌وگو را می‌بندد.', 'پیشنهاد را رد می‌کند.', 'از حال طرف مقابل می‌پرسد.', 'عذرخواهی می‌کند.'], correctIndex: 2, explanationFa: '«А ты?» یعنی و تو؟؛ در این موقعیت، پرسش دربارهٔ حال را به طرف مقابل برمی‌گرداند. فقط یک پاسخ حفظی نمی‌دهی، نوبت گفت‌وگو را هم ادامه می‌دهی.' },
    ],
  },
  {
    id: 'ru-pre-02-i-you-this-that',
    module: RUSSIAN_PRE_A1_MODULES[0],
    title: 'من، تو، این و آن',
    subtitle: 'ضمایر پایه و اشارهٔ مذکر',
    situation: 'گفتن من و تو، این یکی و آن یکی و نشان دادن اینجا و آنجا.',
    teachingFa: 'هدف: گفتن من و تو، این یکی و آن یکی و نشان دادن اینجا و آنجا.\nنکتهٔ تدریجی: «Я» یعنی من و «ты» یعنی تو. برای اشارهٔ مذکر «э́тот» (این یکی) و «тот» (آن یکی) را تمرین می‌کنیم. «Здесь» اینجا و «там» آنجاست؛ «и» یعنی و و «и́ли» یعنی یا.',
    durationMinutes: 5,
    sentences: [
      { text: 'Я.', fa: 'من.', pronunciation: 'یا.', vocabulary: [['Я', 'من']] },
      { text: 'Ты.', fa: 'تو.', pronunciation: 'تی.', vocabulary: [['Ты', 'تو']] },
      { text: 'Э́тот.', fa: 'این یکی (مذکر).', pronunciation: 'اِتَت.', vocabulary: [['э́тот', 'این (مذکر)']] },
      { text: 'Тот.', fa: 'آن یکی (مذکر).', pronunciation: 'تُت.', vocabulary: [['тот', 'آن (مذکر)']] },
      { text: 'Здесь.', fa: 'اینجا.', pronunciation: 'زْدِس.', vocabulary: [['Здесь', 'اینجا']] },
      { text: 'Там.', fa: 'آنجا.', pronunciation: 'تام.', vocabulary: [['Там', 'آنجا']] },
      { text: 'Я и ты.', fa: 'من و تو.', pronunciation: 'یا ای تی.', pattern: 'واژه + и + واژه', vocabulary: [['Я', 'من'], ['и', 'و'], ['ты', 'تو']] },
      { text: 'Э́тот и́ли тот?', fa: 'این یکی یا آن یکی؟ (مذکر)', pronunciation: 'اِتَت ایلی تُت؟', vocabulary: [['э́тот', 'این (مذکر)'], ['и́ли', 'یا'], ['тот', 'آن (مذکر)']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Приве́т! Э́тот и́ли тот?', fa: 'سلام! این یکی یا آن یکی؟', pronunciation: 'پْری‌ویت! اِتَت ایلی تُت؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Приве́т! Э́тот, пожа́луйста.', fa: 'سلام! این یکی، لطفاً.', pronunciation: 'پْری‌ویت! اِتَت، پاژالُیْسْتا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Здесь и́ли там?', fa: 'اینجا یا آنجا؟', pronunciation: 'زْدِس ایلی تام؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Здесь, спаси́бо!', fa: 'اینجا، ممنون!', pronunciation: 'زْدِس، سْپاسیبا!' },
    ],
    checks: [
      { promptFa: 'برای گفتن «من.» کدام گزینه درست است؟', choices: ['Я.', 'Ты.', 'Э́тот.', 'Тот.'], correctIndex: 0, explanationFa: '«Я.» یعنی «من.».' },
      { promptFa: 'واژهٔ «Здесь» به چه معنی است؟', choices: ['آنجا', 'تو', 'اینجا', 'آن'], correctIndex: 2, explanationFa: '«Здесь» یعنی «اینجا» و «Там» یعنی «آنجا».' },
      { promptFa: 'برای گفتن «این یکی یا آن یکی؟ (مذکر)» کدام گزینه درست است؟', choices: ['Тот.', 'Там.', 'Я и ты.', 'Э́тот и́ли тот?'], correctIndex: 3, explanationFa: '«Э́тот и́ли тот?» یعنی «این یکی یا آن یکی؟ (مذکر)».' },
    ],
  },
  {
    id: 'ru-pre-03-family-home',
    module: RUSSIAN_PRE_A1_MODULES[0],
    title: 'خانواده، خانه و میز',
    subtitle: 'مادر، پدر، خواهر، برادر و خانه',
    situation: 'شناخت برادر و پدر، خانه، میز، صندلی و کلید.',
    teachingFa: 'هدف: شناخت برادر و پدر، خانه، میز، صندلی و کلید.\nنکتهٔ تدریجی: اسم‌های «брат, па́па, дом, стол, стул, ключ» مذکرند. «Па́па» با وجود پایان «а» به پدر اشاره می‌کند و مذکر است. در این سطح فقط اسم‌های مذکر را تمرین می‌کنیم.',
    durationMinutes: 5,
    sentences: [
      { text: 'Брат.', fa: 'برادر.', pronunciation: 'بْرات.', vocabulary: [['брат', 'برادر']] },
      { text: 'Па́па.', fa: 'پدر.', pronunciation: 'پاپا.', vocabulary: [['Па́па', 'پدر (مذکر)']] },
      { text: 'Брат и па́па.', fa: 'برادر و پدر.', pronunciation: 'بْرات ای پاپا.', vocabulary: [['брат', 'برادر'], ['и', 'و'], ['па́па', 'پدر']] },
      { text: 'Дом.', fa: 'خانه.', pronunciation: 'دُم.', vocabulary: [['Дом', 'خانه (مذکر)']] },
      { text: 'Стул.', fa: 'صندلی.', pronunciation: 'سْتول.', vocabulary: [['стул', 'صندلی']] },
      { text: 'Стул и ключ.', fa: 'صندلی و کلید.', pronunciation: 'سْتول ای کْلیوچ.', vocabulary: [['стул', 'صندلی'], ['и', 'و'], ['ключ', 'کلید']] },
      { text: 'Стол.', fa: 'میز.', pronunciation: 'سْتُل.', vocabulary: [['Стол', 'میز (مذکر)']] },
      { text: 'Ключ.', fa: 'کلید.', pronunciation: 'کْلیوچ.', vocabulary: [['ключ', 'کلید']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то дом?', fa: 'این خانه است؟', pronunciation: 'اِتا دُم؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, э́то дом.', fa: 'بله، این خانه است.', pronunciation: 'دا، اِتا دُم.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Брат и па́па?', fa: 'برادر و پدر؟', pronunciation: 'بْرات ای پاپا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, брат и па́па.', fa: 'بله، برادر و پدر.', pronunciation: 'دا، بْرات ای پاپا.' },
    ],
    checks: [
      { promptFa: 'برای گفتن «برادر.» کدام گزینه درست است؟', choices: ['Брат.', 'Па́па.', 'Брат и па́па.', 'Дом.'], correctIndex: 0, explanationFa: '«Брат.» یعنی «برادر.».' },
      { promptFa: 'برای گفتن «صندلی.» کدام گزینه درست است؟', choices: ['Брат и па́па.', 'Стул.', 'Стул и ключ.', 'Стол.'], correctIndex: 1, explanationFa: '«Стул.» یعنی «صندلی.».' },
      { promptFa: 'برای گفتن «کلید.» کدام گزینه درست است؟', choices: ['Дом.', 'Стул и ключ.', 'Стол.', 'Ключ.'], correctIndex: 3, explanationFa: '«Ключ.» یعنی «کلید.».' },
    ],
  },
  {
    id: 'ru-pre-04-food-study-daily',
    module: RUSSIAN_PRE_A1_MODULES[0],
    title: 'چای، نان، متن و مداد',
    subtitle: 'واژه‌های مذکر روزمره',
    situation: 'درخواست چای و شناخت نان، متن، مداد، روز، عصر، شماره و درس.',
    teachingFa: 'هدف: درخواست چای و شناخت نان، متن، مداد، روز، عصر، شماره و درس.\nنکتهٔ تدریجی: «Чай, хлеб, текст, каранда́ш, день, ве́чер, но́мер, уро́к» مذکرند. «Чай, пожа́луйста» یک درخواست کوتاه و مؤدبانه است. «Хорошо́» یعنی خوب است.',
    durationMinutes: 5,
    sentences: [
      { text: 'Чай.', fa: 'چای.', pronunciation: 'چای.', vocabulary: [['Чай', 'چای (مذکر)']] },
      { text: 'Хлеб.', fa: 'نان.', pronunciation: 'خْلِب.', vocabulary: [['Хлеб', 'نان (مذکر)']] },
      { text: 'Чай, пожа́луйста.', fa: 'چای، لطفاً.', pronunciation: 'چای، پاژالُیْسْتا.', vocabulary: [['Чай', 'چای (مذکر)'], ['Пожа́луйста', 'لطفاً / خواهش می‌کنم']] },
      { text: 'Текст.', fa: 'متن.', pronunciation: 'تِکْست.', vocabulary: [['текст', 'متن']] },
      { text: 'Каранда́ш.', fa: 'مداد.', pronunciation: 'کاراندَش.', vocabulary: [['каранда́ш', 'مداد']] },
      { text: 'Хорошо́!', fa: 'خوب است! / باشه!', pronunciation: 'خاراشُو!', vocabulary: [['Хорошо́', 'خوب است / باشه (مشترک)']] },
      { text: 'День и ве́чер.', fa: 'روز و عصر.', pronunciation: 'دِین ای ویچِر.', vocabulary: [['День', 'روز (مذکر)'], ['и', 'و'], ['ве́чер', 'عصر']] },
      { text: 'Но́мер и уро́к.', fa: 'شماره و درس.', pronunciation: 'نُمِر ای اورُک.', vocabulary: [['но́мер', 'شماره'], ['и', 'و'], ['уро́к', 'درس']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Чай и́ли хлеб?', fa: 'چای یا نان؟', pronunciation: 'چای ایلی خْلِب؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Чай, пожа́луйста.', fa: 'چای، لطفاً.', pronunciation: 'چای، پاژالُیْسْتا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Текст и́ли каранда́ш?', fa: 'متن یا مداد؟', pronunciation: 'تِکْست ایلی کاراندَش؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Текст и каранда́ш, спаси́бо!', fa: 'متن و مداد، ممنون!', pronunciation: 'تِکْست ای کاراندَش، سْپاسیبا!' },
    ],
    checks: [
      { promptFa: 'برای گفتن «چای.» کدام گزینه درست است؟', choices: ['Чай.', 'Хлеб.', 'Чай, пожа́луйста.', 'Текст.'], correctIndex: 0, explanationFa: '«Чай.» یعنی «چای.».' },
      { promptFa: 'واژهٔ «Хлеб» چه معنی دارد؟', choices: ['آب', 'شب', 'نام', 'نان'], correctIndex: 3, explanationFa: '«Хлеб» یعنی «نان».' },
      { promptFa: 'برای گفتن «شماره و درس.» کدام گزینه درست است؟', choices: ['Текст.', 'Хорошо́!', 'День и ве́чер.', 'Но́мер и уро́к.'], correctIndex: 3, explanationFa: '«Но́мер и уро́к.» یعنی «شماره و درس.».' },
    ],
  },
  {
    id: 'ru-pre-05-pronouns-family',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'ضمایر شخصی و خانواده',
    subtitle: 'او برای زن و مرد؛ ما، شما و آن‌ها',
    situation: 'شناخت من و تو، او برای مرد، ما و شما و آن‌ها، پدر، برادر و پدربزرگ.',
    teachingFa: 'هدف: شناخت من و تو، او برای مرد، ما و شما و آن‌ها، پدر، برادر و پدربزرگ.\nنکتهٔ تدریجی: «Он» برای او (مرد)، «мы» برای ما، «вы» برای شما و «они́» برای آن‌هاست. «Вы» هم محترمانه برای یک نفر و هم برای جمع به کار می‌رود. «Брат, па́па, де́душка» به اعضای مذکر خانواده اشاره می‌کنند.',
    durationMinutes: 5,
    sentences: [
      { text: 'Он.', fa: 'او. (مرد / مذکر)', pronunciation: 'اُن.', vocabulary: [['Он', 'او (مرد)']] },
      { text: 'Ты.', fa: 'تو.', pronunciation: 'تی.', vocabulary: [['Ты', 'تو']] },
      { text: 'Мы.', fa: 'ما.', pronunciation: 'می.', vocabulary: [['Мы', 'ما']] },
      { text: 'Вы.', fa: 'شما.', pronunciation: 'وی.', vocabulary: [['Вы', 'شما']] },
      { text: 'Они́.', fa: 'آن‌ها.', pronunciation: 'آنی.', vocabulary: [['Они́', 'آن‌ها']] },
      { text: 'Па́па.', fa: 'پدر.', pronunciation: 'پاپا.', vocabulary: [['па́па', 'پدر']] },
      { text: 'Брат.', fa: 'برادر.', pronunciation: 'بْرات.', vocabulary: [['Брат', 'برادر']] },
      { text: 'Де́душка.', fa: 'پدربزرگ.', pronunciation: 'دِدوشکا.', vocabulary: [['де́душка', 'پدربزرگ']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то брат?', fa: 'این برادر است؟', pronunciation: 'اِتا بْرات؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, он брат.', fa: 'بله، او برادر است.', pronunciation: 'دا، اُن بْرات.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Он брат?', fa: 'او برادر است؟', pronunciation: 'اُن بْرات؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, он брат. А э́то па́па.', fa: 'بله، او برادر است. و این پدر است.', pronunciation: 'دا، اُن بْرات. آ اِتا پاپا.' },
    ],
    checks: [
      { promptFa: 'برای گفتن «او. (مرد / مذکر)» کدام گزینه درست است؟', choices: ['Он.', 'Ты.', 'Мы.', 'Вы.'], correctIndex: 0, explanationFa: '«Он.» یعنی «او. (مرد / مذکر)».' },
      { promptFa: 'برای گفتن «آن‌ها.» کدام گزینه درست است؟', choices: ['Мы.', 'Они́.', 'Па́па.', 'Брат.'], correctIndex: 1, explanationFa: '«Они́.» یعنی «آن‌ها.».' },
      { promptFa: 'کدام ضمیر به معنی «آن‌ها» است؟', choices: ['Мы.', 'Вы.', 'Они́.', 'Ты.'], correctIndex: 2, explanationFa: '«Они́» یعنی «آن‌ها».' },
    ],
  },
  {
    id: 'ru-pre-06-people-objects',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'افراد مذکر و اشیای ساده',
    subtitle: 'دوست، معلم، دانشجو، پسر و وسایل',
    situation: 'معرفی دوست، معلم، دانشجو و پسر با صورت مذکر و نام صندلی، کلید، تلفن و کوله‌پشتی.',
    teachingFa: 'هدف: معرفی دوست، معلم، دانشجو و پسر با صورت مذکر و نام صندلی، کلید، تلفن و کوله‌پشتی.\nنکتهٔ تدریجی: «Друг, учи́тель, студе́нт, ма́льчик» صورت‌های مذکر این درس‌اند. «Челове́к» یعنی انسان و از نظر دستوری مذکر است. «Стул, ключ, телефо́н, рюкза́к» نیز مذکرند.',
    durationMinutes: 6,
    sentences: [
      { text: 'Челове́к.', fa: 'انسان / شخص.', pronunciation: 'چیلاوِک.', vocabulary: [['Челове́к', 'انسان / شخص (مذکر)']] },
      { text: 'Друг.', fa: 'دوست (مذکر).', pronunciation: 'دْروک.', vocabulary: [['Друг', 'دوستِ آقا (مذکر)']] },
      { text: 'Учи́тель.', fa: 'معلم (مذکر).', pronunciation: 'اوچیتِل.', vocabulary: [['Учи́тель', 'معلم آقا (مذکر)']] },
      { text: 'Студе́нт.', fa: 'دانشجو (مذکر).', pronunciation: 'سْتودِنت.', vocabulary: [['Студе́нт', 'دانشجوی آقا (مذکر)']] },
      { text: 'Ма́льчик.', fa: 'پسر.', pronunciation: 'مالْچیک.', vocabulary: [['Ма́льчик', 'پسر (مذکر)']] },
      { text: 'Стул и ключ.', fa: 'صندلی و کلید.', pronunciation: 'سْتول ای کْلیوچ.', vocabulary: [['Стул', 'صندلی (مذکر)'], ['ключ', 'کلید (مذکر)']] },
      { text: 'Телефо́н.', fa: 'گوشی / تلفن.', pronunciation: 'تیلیفُن.', vocabulary: [['Телефо́н', 'گوشی / تلفن (مذکر)']] },
      { text: 'Рюкза́к.', fa: 'کوله‌پشتی.', pronunciation: 'ریوکْزَک.', vocabulary: [['рюкза́к', 'کوله‌پشتی']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то друг и́ли брат?', fa: 'این دوست است یا برادر؟', pronunciation: 'اِتا دْروک ایلی بْرات؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Он друг. Он студе́нт.', fa: 'او دوست است. او دانشجو است (مذکر).', pronunciation: 'اُن دْروک. اُن سْتودِنت.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то ключ и́ли телефо́н?', fa: 'این کلید است یا تلفن؟', pronunciation: 'اِتا کْلیوچ ایلی تیلیفُن؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Э́то ключ и рюкза́к.', fa: 'این کلید و کوله‌پشتی است.', pronunciation: 'اِتا کْلیوچ ای ریوکْزَک.' },
    ],
    checks: [
      { promptFa: 'برای گفتن «انسان / شخص.» کدام گزینه درست است؟', choices: ['Челове́к.', 'Друг.', 'Учи́тель.', 'Студе́нт.'], correctIndex: 0, explanationFa: '«Челове́к.» یعنی «انسان / شخص.».' },
      { promptFa: 'برای گفتن «پسر.» کدام گزینه درست است؟', choices: ['Учи́тель.', 'Ма́льчик.', 'Стул и ключ.', 'Телефо́н.'], correctIndex: 1, explanationFa: '«Ма́льчик.» یعنی «پسر.».' },
      { promptFa: 'برای گفتن «کوله‌پشتی.» کدام گزینه درست است؟', choices: ['Студе́нт.', 'Стул и ключ.', 'Телефо́н.', 'Рюкза́к.'], correctIndex: 3, explanationFa: '«Рюкза́к.» یعنی «کوله‌پشتی.».' },
    ],
  },
  {
    id: 'ru-pre-07-food-drinks',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'خوراکی‌ها و نوشیدنی‌های مذکر',
    subtitle: 'سوپ، پنیر، نان، شکر، چای، قهوه، عسل و آب‌میوه',
    situation: 'شناخت خوراکی‌ها و نوشیدنی‌های مذکر و سفارش کوتاه و مؤدبانه.',
    teachingFa: 'هدف: شناخت خوراکی‌ها و نوشیدنی‌های مذکر و سفارش کوتاه و مؤدبانه.\nنکتهٔ تدریجی: اسم‌های «суп, сыр, хлеб, са́хар, чай, ко́фе, мёд, сок» مذکرند. «Ко́фе» با وجود پایان «е» در کاربرد معیار مذکر است. برای سفارش از نام خوراکی و «пожа́луйста» استفاده می‌کنیم.',
    durationMinutes: 5,
    sentences: [
      { text: 'Суп.', fa: 'سوپ.', pronunciation: 'سوپ.', vocabulary: [['Суп', 'سوپ (مذکر)']] },
      { text: 'Сыр.', fa: 'پنیر.', pronunciation: 'سیر.', vocabulary: [['Сыр', 'پنیر (مذکر)']] },
      { text: 'Хлеб.', fa: 'نان.', pronunciation: 'خْلِب.', vocabulary: [['Хлеб', 'نان (مذکر)']] },
      { text: 'Са́хар.', fa: 'شکر.', pronunciation: 'ساخار.', vocabulary: [['Са́хар', 'شکر (مذکر)']] },
      { text: 'Чай.', fa: 'چای.', pronunciation: 'چای.', vocabulary: [['Чай', 'چای (مذکر)']] },
      { text: 'Ко́фе.', fa: 'قهوه.', pronunciation: 'کُفِه.', vocabulary: [['Ко́фе', 'قهوه (مذکر)']] },
      { text: 'Мёд.', fa: 'عسل.', pronunciation: 'میُت.', vocabulary: [['мёд', 'عسل']] },
      { text: 'Сок.', fa: 'آب‌میوه.', pronunciation: 'سُک.', vocabulary: [['Сок', 'آب‌میوه (مذکر)']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Чай и́ли ко́фе?', fa: 'چای یا قهوه؟', pronunciation: 'چای ایلی کُفِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Ко́фе и мёд, пожа́луйста.', fa: 'قهوه و عسل، لطفاً.', pronunciation: 'کُفِه ای میُت، پاژالُیْسْتا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Сыр и́ли хлеб?', fa: 'پنیر یا نان؟', pronunciation: 'سیر ایلی خْلِب؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Сыр и хлеб, спаси́бо!', fa: 'پنیر و نان، ممنون!', pronunciation: 'سیر ای خْلِب، سْپاسیبا!' },
    ],
    checks: [
      { promptFa: 'برای گفتن «سوپ.» کدام گزینه درست است؟', choices: ['Суп.', 'Сыр.', 'Хлеб.', 'Са́хар.'], correctIndex: 0, explanationFa: '«Суп.» یعنی «سوپ.».' },
      { promptFa: 'کدام واژه به معنی «آب‌میوه» است؟', choices: ['Сок.', 'Суп.', 'Сыр.', 'Чай.'], correctIndex: 0, explanationFa: '«Сок» یعنی «آب‌میوه».' },
      { promptFa: 'برای گفتن «آب‌میوه.» کدام گزینه درست است؟', choices: ['Са́хар.', 'Ко́фе.', 'Мёд.', 'Сок.'], correctIndex: 3, explanationFa: '«Сок.» یعنی «آب‌میوه.».' },
    ],
  },
  {
    id: 'ru-pre-08-animals-colors',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'حیوانات و رنگ‌ها؛ صورت مذکر',
    subtitle: 'نام حیوانات نر و رنگ‌های مذکر',
    situation: 'شناخت گربهٔ نر، سگ نر، شیر نر و ببر نر و رنگ‌های مذکر.',
    teachingFa: 'هدف: شناخت گربهٔ نر، سگ نر، شیر نر و ببر نر و رنگ‌های مذکر.\nنکتهٔ تدریجی: «Кот, пёс, лев, тигр» مذکرند. رنگ‌ها را فقط به صورت مذکر «бе́лый, чёрный, кра́сный, зелёный» می‌آموزیم: «чёрный кот» و «бе́лый пёс».',
    durationMinutes: 6,
    sentences: [
      { text: 'Кот.', fa: 'گربهٔ نر.', pronunciation: 'کُت.', vocabulary: [['Кот', 'گربه (مذکر)']] },
      { text: 'Пёс.', fa: 'سگ نر.', pronunciation: 'پیُس.', vocabulary: [['пёс', 'سگ نر']] },
      { text: 'Лев и тигр.', fa: 'شیر نر و ببر نر.', pronunciation: 'لِف ای تیگْر.', vocabulary: [['лев', 'شیر نر'], ['и', 'و'], ['тигр', 'ببر نر']] },
      { text: 'Бе́лый.', fa: 'سفید (مذکر).', pronunciation: 'بِلی.', vocabulary: [['Бе́лый', 'سفید (مذکر)']] },
      { text: 'Чёрный.', fa: 'سیاه (مذکر).', pronunciation: 'چُرْنی.', vocabulary: [['Чёрный', 'سیاه (مذکر)']] },
      { text: 'Кра́сный.', fa: 'قرمز (مذکر).', pronunciation: 'کْراسْنی.', vocabulary: [['Кра́сный', 'قرمز (مذکر)']] },
      { text: 'Зелёный.', fa: 'سبز (مذکر).', pronunciation: 'زیلیُنی.', vocabulary: [['Зелёный', 'سبز (مذکر)']] },
      { text: 'Чёрный кот и бе́лый пёс.', fa: 'گربهٔ نر سیاه و سگ نر سفید.', pronunciation: 'چُرْنی کُت ای بِلی پیُس.', vocabulary: [['Чёрный', 'سیاه (مذکر)'], ['Чёрный кот', 'گربهٔ سیاه (مذکر)'], ['Кот', 'گربه (مذکر)'], ['и', 'و'], ['Бе́лый', 'سفید (مذکر)'], ['пёс', 'سگ نر']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то кот и́ли пёс?', fa: 'این گربهٔ نر است یا سگ نر؟', pronunciation: 'اِتا کُت ایلی پیُس؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Э́то чёрный кот и бе́лый пёс.', fa: 'این گربهٔ نر سیاه و سگ نر سفید است.', pronunciation: 'اِتا چُرْنی کُت ای بِلی پیُس.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'А кот чёрный и́ли бе́лый?', fa: 'و گربهٔ نر سیاه است یا سفید؟', pronunciation: 'آ کُت چُرْنی ایلی بِلی؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Чёрный кот, спаси́бо!', fa: 'گربهٔ نر سیاه، ممنون!', pronunciation: 'چُرْنی کُت، سْپاسیبا!' },
    ],
    checks: [
      { promptFa: 'برای گفتن «گربهٔ نر.» کدام گزینه درست است؟', choices: ['Кот.', 'Пёс.', 'Лев и тигр.', 'Бе́лый.'], correctIndex: 0, explanationFa: '«Кот.» یعنی «گربهٔ نر.».' },
      { promptFa: 'برای گفتن «سیاه (مذکر).» کدام گزینه درست است؟', choices: ['Лев и тигр.', 'Чёрный.', 'Кра́сный.', 'Зелёный.'], correctIndex: 1, explanationFa: '«Чёрный.» یعنی «سیاه (مذکر).».' },
      { promptFa: 'برای گفتن «گربهٔ نر سیاه و سگ نر سفید.» کدام گزینه درست است؟', choices: ['Бе́лый.', 'Кра́сный.', 'Зелёный.', 'Чёрный кот и бе́лый пёс.'], correctIndex: 3, explanationFa: '«Чёрный кот и бе́лый пёс.» یعنی «گربهٔ نر سیاه و سگ نر سفید.».' },
    ],
  },
  {
    id: 'ru-pre-09-numbers',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'اعداد پایه با اسم مذکر',
    subtitle: 'شمارش صفر تا ده و بیست',
    situation: 'شمارش از صفر تا ده و عدد بیست با اسم‌های مذکر.',
    teachingFa: 'هدف: شمارش از صفر تا ده و عدد بیست با اسم‌های مذکر.\nنکتهٔ تدریجی: برای یک با اسم مذکر «оди́н» می‌گوییم: «оди́н дом, оди́н стол». بعد از «два» و «три» شکل شمارشی اسم را در «два стола́» و «три те́кста» می‌بینیم.',
    durationMinutes: 5,
    sentences: [
      { text: 'Ноль.', fa: 'صفر.', pronunciation: 'نُل.', vocabulary: [['Ноль', 'صفر']] },
      { text: 'Оди́н, два.', fa: 'یک، دو.', pronunciation: 'آدین، دْوا.', vocabulary: [['Оди́н', 'یک (مذکر)'], ['два', 'دو']] },
      { text: 'Три, четы́ре.', fa: 'سه، چهار.', pronunciation: 'تْری، چیتی‌رِه.', vocabulary: [['Три', 'سه'], ['четы́ре', 'چهار']] },
      { text: 'Пять, шесть.', fa: 'پنج، شش.', pronunciation: 'پیات، شِسْت.', vocabulary: [['Пять', 'پنج'], ['шесть', 'شش']] },
      { text: 'Семь, во́семь.', fa: 'هفت، هشت.', pronunciation: 'سِم، وُسیم.', vocabulary: [['Семь', 'هفت'], ['во́семь', 'هشت']] },
      { text: 'Де́вять, де́сять.', fa: 'نه، ده.', pronunciation: 'دِویت، دِسیت.', vocabulary: [['Де́вять', 'نه'], ['де́сять', 'ده']] },
      { text: 'Два́дцать.', fa: 'بیست.', pronunciation: 'دْواتْسات.', vocabulary: [['Два́дцать', 'بیست']] },
      { text: 'Оди́н дом, оди́н стол.', fa: 'یک خانه، یک میز.', pronunciation: 'آدین دُم، آدین سْتُل.', vocabulary: [['Оди́н', 'یک (مذکر)'], ['Оди́н дом', 'یک خانه (مذکر)'], ['Дом', 'خانه (مذکر)'], ['Стол', 'میز (مذکر)']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Оди́н, два, три.', fa: 'یک، دو، سه.', pronunciation: 'ادین، دْوا، تْری.' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Четы́ре, пять, шесть.', fa: 'چهار، پنج، شش.', pronunciation: 'چیتی‌رِه، پیات، شِسْت.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Оди́н стол и́ли оди́н рюкза́к?', fa: 'یک میز یا یک کوله‌پشتی؟', pronunciation: 'آدین سْتُل ایلی آدین ریوکْزَک؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Оди́н рюкза́к и семь те́кстов.', fa: 'یک کوله‌پشتی و هفت متن.', pronunciation: 'آدین ریوکْزَک ای سِم تِکْستَف.' },
    ],
    checks: [
      { promptFa: 'برای گفتن «صفر.» کدام گزینه درست است؟', choices: ['Ноль.', 'Оди́н, два.', 'Три, четы́ре.', 'Пять, шесть.'], correctIndex: 0, explanationFa: '«Ноль.» یعنی «صفر.».' },
      { promptFa: '«هفت، هشت» به روسی کدام است؟', choices: ['Три, четы́ре.', 'Де́вять, де́сять.', 'Семь, во́семь.', 'Оди́н, два.'], correctIndex: 2, explanationFa: '«Семь» (۷) و «во́семь» (۸).' },
      { promptFa: 'عدد «два́дцать» چند است؟', choices: ['بیست', 'ده', 'دوازده', 'صفر'], correctIndex: 0, explanationFa: '«Два́дцать» یعنی ۲۰.' },
    ],
  },
  {
    id: 'ru-pre-10-days-places',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'دوشنبه، سه‌شنبه، پنجشنبه و مکان‌ها',
    subtitle: 'روزها و مکان‌های با اسم مذکر',
    situation: 'شناخت سه روز با نام مذکر و کلاس، فروشگاه، پارک، شهر و خانه.',
    teachingFa: 'هدف: شناخت سه روز با نام مذکر و کلاس، فروشگاه، پارک، شهر و خانه.\nنکتهٔ تدریجی: نام‌های «понеде́льник, вто́рник, четве́рг» و مکان‌های «класс, магази́н, парк, го́род, дом» مذکرند. «Наш класс» یعنی کلاس ما.',
    durationMinutes: 6,
    sentences: [
      { text: 'Понеде́льник.', fa: 'دوشنبه.', pronunciation: 'پانیدِلْنیک.', vocabulary: [['Понеде́льник', 'دوشنبه (مذکر)']] },
      { text: 'Вто́рник.', fa: 'سه‌شنبه.', pronunciation: 'فْتُرْنیک.', vocabulary: [['вто́рник', 'سه‌شنبه']] },
      { text: 'Четве́рг.', fa: 'پنجشنبه.', pronunciation: 'چیتْویرْک.', vocabulary: [['Четве́рг', 'پنج‌شنبه (مذکر)']] },
      { text: 'Класс.', fa: 'کلاس.', pronunciation: 'کْلاس.', vocabulary: [['класс', 'کلاس (مذکر)']] },
      { text: 'Магази́н.', fa: 'فروشگاه / مغازه.', pronunciation: 'ماگازین.', vocabulary: [['Магази́н', 'فروشگاه (مذکر)']] },
      { text: 'Парк.', fa: 'پارک.', pronunciation: 'پارْک.', vocabulary: [['Парк', 'پارک']] },
      { text: 'Го́род.', fa: 'شهر.', pronunciation: 'گُرَت.', vocabulary: [['Го́род', 'شهر (مذکر)']] },
      { text: 'Дом и класс.', fa: 'خانه و کلاس.', pronunciation: 'دُم ای کْلاس.', vocabulary: [['Дом', 'خانه (مذکر)'], ['и', 'و'], ['класс', 'کلاس (مذکر)']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то класс и́ли магази́н?', fa: 'این کلاس است یا فروشگاه؟', pronunciation: 'اِتا کْلاس ایلی ماگازین؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Э́то наш класс.', fa: 'این کلاس ما است.', pronunciation: 'اِتا ناش کْلاس.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Парк и́ли дом?', fa: 'پارک یا خانه؟', pronunciation: 'پارْک ایلی دُم؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Дом здесь, парк там.', fa: 'خانه اینجاست، پارک آنجاست.', pronunciation: 'دُم زْدِس، پارْک تام.' },
    ],
    checks: [
      { promptFa: 'برای گفتن «دوشنبه.» کدام گزینه درست است؟', choices: ['Понеде́льник.', 'Вто́рник.', 'Четве́рг.', 'Класс.'], correctIndex: 0, explanationFa: '«Понеде́льник.» یعنی «دوشنبه.».' },
      { promptFa: 'برای گفتن «فروشگاه / مغازه.» کدام گزینه درست است؟', choices: ['Четве́рг.', 'Магази́н.', 'Парк.', 'Го́род.'], correctIndex: 1, explanationFa: '«Магази́н.» یعنی «فروشگاه / مغازه.».' },
      { promptFa: 'برای گفتن «خانه و کلاس.» کدام گزینه درست است؟', choices: ['Класс.', 'Парк.', 'Го́род.', 'Дом и класс.'], correctIndex: 3, explanationFa: '«Дом и класс.» یعنی «خانه و کلاس.».' },
    ],
  },
  {
    id: 'ru-pre-11-adjectives',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'صفات ساده؛ فقط صورت مذکر',
    subtitle: 'بزرگ، کوچک، خوب، نو و توصیف‌های مذکر',
    situation: 'توصیف خانه، کلاس و خوراک با صورت‌های مذکر صفت.',
    teachingFa: 'هدف: توصیف خانه، کلاس و خوراک با صورت‌های مذکر صفت.\nنکتهٔ تدریجی: صفت‌های «большо́й, ма́ленький, хоро́ший, но́вый, ста́рый, плохо́й, краси́вый, до́брый, у́мный, вку́сный, све́жий, ти́хий, све́тлый» در این درس همگی به صورت مذکر هستند.',
    durationMinutes: 6,
    sentences: [
      { text: 'Большо́й.', fa: 'بزرگ (مذکر).', pronunciation: 'بالْشُی.', vocabulary: [['Большо́й', 'بزرگ (مذکر)']] },
      { text: 'Ма́ленький.', fa: 'کوچک (مذکر).', pronunciation: 'مالینْکی.', vocabulary: [['Ма́ленький', 'کوچک (مذکر)']] },
      { text: 'Хоро́ший.', fa: 'خوب (مذکر).', pronunciation: 'خارُشی.', vocabulary: [['Хоро́ший', 'خوب (مذکر)']] },
      { text: 'Но́вый.', fa: 'نو (مذکر).', pronunciation: 'نُوی.', vocabulary: [['Но́вый', 'نو (مذکر)']] },
      { text: 'Ста́рый и плохо́й.', fa: 'قدیمی و بد (مذکر).', pronunciation: 'سْتاری ای پْلاخُی.', vocabulary: [['Ста́рый', 'قدیمی (مذکر)'], ['и', 'و'], ['плохо́й', 'بد (مذکر)']] },
      { text: 'Краси́вый.', fa: 'زیبا (مذکر).', pronunciation: 'کْراسیوی.', vocabulary: [['Краси́вый', 'زیبا (مذکر)']] },
      { text: 'До́брый и у́мный.', fa: 'مهربان و باهوش (مذکر).', pronunciation: 'دُبْری ای اومْنی.', vocabulary: [['До́брый', 'مهربان (مذکر)'], ['и', 'و'], ['у́мный', 'باهوش (مذکر)']] },
      { text: 'Вку́сный, све́жий, ти́хий, све́тлый.', fa: 'خوشمزه، تازه، آرام، روشن (مذکر).', pronunciation: 'فْکوسْنی، سْویژی، تیخی، سْویتْلی.', vocabulary: [['Вку́сный', 'خوشمزه (مذکر)'], ['све́жий', 'تازه (مذکر)'], ['ти́хий', 'آرام (مذکر)'], ['све́тлый', 'روشن (مذکر)']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то большо́й дом?', fa: 'این خانهٔ بزرگ است؟', pronunciation: 'اِتا بالْشُی دُم؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Нет, ма́ленький дом. А класс большо́й и све́тлый.', fa: 'نه، خانهٔ کوچک. و کلاس بزرگ و روشن است.', pronunciation: 'نِت، مالینْکی دُم. آ کْلاس بالْشُی ای سْویتْلی.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Но́вый и́ли ста́рый?', fa: 'نو یا قدیمی؟', pronunciation: 'نُوی ایلی سْتاری؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Но́вый дом и краси́вый класс.', fa: 'خانهٔ نو و کلاس زیبا.', pronunciation: 'نُوی دُم ای کْراسیوی کْلاس.' },
    ],
    checks: [
      { promptFa: 'برای گفتن «بزرگ (مذکر).» کدام گزینه درست است؟', choices: ['Большо́й.', 'Ма́ленький.', 'Хоро́ший.', 'Но́вый.'], correctIndex: 0, explanationFa: '«Большо́й.» یعنی «بزرگ (مذکر).».' },
      { promptFa: 'برای گفتن «قدیمی و بد (مذکر).» کدام گزینه درست است؟', choices: ['Хоро́ший.', 'Ста́рый и плохо́й.', 'Краси́вый.', 'До́брый и у́мный.'], correctIndex: 1, explanationFa: '«Ста́рый и плохо́й.» یعنی «قدیمی و بد (مذکر).».' },
      { promptFa: 'برای گفتن «خوشمزه، تازه، آرام، روشن (مذکر).» کدام گزینه درست است؟', choices: ['Но́вый.', 'Краси́вый.', 'До́брый и у́мный.', 'Вку́сный, све́жий, ти́хий, све́тлый.'], correctIndex: 3, explanationFa: '«Вку́сный, све́жий, ти́хий, све́тлый.» یعنی «خوشمزه، تازه، آرام، روشن (مذکر).».' },
    ],
  },
  {
    id: 'ru-pre-12-verbs',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'افعال ساده؛ زمان حال و فاعل‌ها',
    subtitle: 'دانستن، خواستن، خواندن و زندگی کردن',
    situation: 'تمرین فعل‌های حال با من، تو، او (مرد)، ما و شما.',
    teachingFa: 'هدف: تمرین فعل‌های حال با من، تو، او (مرد)، ما و شما.\nنکتهٔ تدریجی: فعل زمان حال با شخص فاعل هماهنگ می‌شود: «я зна́ю, ты зна́ешь»، «я живу́, он живёт»، «мы чита́ем». «Я хочу́» یعنی می‌خواهم و «вы хоти́те» یعنی شما می‌خواهید.',
    durationMinutes: 6,
    sentences: [
      { text: 'Я зна́ю, ты зна́ешь.', fa: 'من می‌دانم، تو می‌دانی.', pronunciation: 'یا زْنایو، تی زْنایِش.', pattern: 'я (-ю) / ты (-ешь)', vocabulary: [['зна́ю', 'می‌دانم'], ['зна́ешь', 'می‌دانی']] },
      { text: 'Я хочу́, ты хо́чешь, вы хоти́те.', fa: 'من می‌خواهم، تو می‌خواهی، شما می‌خواهید.', pronunciation: 'یا خاچو، تی خُچِش، وی خاتیتِه.', pattern: 'я / ты / вы', vocabulary: [['хочу́', 'می‌خواهم'], ['хо́чешь', 'می‌خواهی'], ['хоти́те', 'می‌خواهید']] },
      { text: 'Я люблю́, ты лю́бишь.', fa: 'من دوست دارم، تو دوست داری.', pronunciation: 'یا لیوبْلیو، تی لیوبیش.', pattern: 'я / ты', vocabulary: [['люблю́', 'دوست دارم'], ['лю́бишь', 'دوست داری']] },
      { text: 'Я чита́ю, мы чита́ем.', fa: 'من می‌خوانم، ما می‌خوانیم.', pronunciation: 'یا چیتایو، می چیتایِم.', pattern: 'я / мы', vocabulary: [['чита́ю', 'می‌خوانم'], ['чита́ем', 'می‌خوانیم']] },
      { text: 'Я пишу́, мы пи́шем.', fa: 'من می‌نویسم، ما می‌نویسیم.', pronunciation: 'یا پیشو، می پیشِم.', pattern: 'я / мы', vocabulary: [['пишу́', 'می‌نویسم'], ['пи́шем', 'می‌نویسیم']] },
      { text: 'Я живу́, он живёт.', fa: 'من زندگی می‌کنم، او (مرد) زندگی می‌کند.', pronunciation: 'یا ژیوو، اُن ژیویُت.', vocabulary: [['Я', 'من'], ['живу́', 'زندگی می‌کنم'], ['Он', 'او (مرد)'], ['живёт', 'او زندگی می‌کند']] },
      { text: 'Я говорю́, я понима́ю, я могу́.', fa: 'من صحبت می‌کنم، می‌فهمم، می‌توانم.', pronunciation: 'یا گاواریو، یا پانیمایو، یا ماگو.', pattern: 'فعل‌های اول‌شخص (مشترک)', vocabulary: [['говорю́', 'صحبت می‌کنم'], ['понима́ю', 'می‌فهمم'], ['могу́', 'می‌توانم']] },
      { text: 'Я иду́, ты идёшь; есть; сто́ит.', fa: 'من می‌روم، تو می‌روی؛ هست؛ قیمت دارد.', pronunciation: 'یا ایدو، تی ایدْیُش؛ یِسْت؛ سْتُیت.', pattern: 'فعل حرکت و هستی', vocabulary: [['иду́', 'می‌روم'], ['идёшь', 'می‌روی'], ['есть', 'هست'], ['сто́ит', 'قیمت دارد']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Ты хо́чешь чай и́ли ко́фе?', fa: 'آیا چای می‌خواهی یا قهوه؟', pronunciation: 'تی خُچِش چای ایلی کُفِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Я хочу́ чай. Я люблю́ чай!', fa: 'من چای می‌خواهم. من چای دوست دارم!', pronunciation: 'یا خاچو چای. یا لیوبْلیو چای!' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Мы чита́ем и пи́шем?', fa: 'آیا می‌خوانیم و می‌نویسیم؟', pronunciation: 'می چیتایِم ای پیشِم؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, я понима́ю и могу́ чита́ть.', fa: 'بله، می‌فهمم و می‌توانم بخوانم.', pronunciation: 'دا، یا پانیمایو ای ماگو چیتات.' },
    ],
    checks: [
      { promptFa: 'برای گفتن «من می‌دانم، تو می‌دانی.» کدام گزینه درست است؟', choices: ['Я зна́ю, ты зна́ешь.', 'Я хочу́, ты хо́чешь, вы хоти́те.', 'Я люблю́, ты лю́бишь.', 'Я чита́ю, мы чита́ем.'], correctIndex: 0, explanationFa: '«Я зна́ю, ты зна́ешь.» یعنی «من می‌دانم، تو می‌دانی.».' },
      { promptFa: 'برای گفتن «من می‌نویسم، ما می‌نویسیم.» کدام گزینه درست است؟', choices: ['Я люблю́, ты лю́бишь.', 'Я пишу́, мы пи́шем.', 'Я живу́, он живёт.', 'Я говорю́, я понима́ю, я могу́.'], correctIndex: 1, explanationFa: '«Я пишу́, мы пи́шем.» یعنی «من می‌نویسم، ما می‌نویسیم.».' },
      { promptFa: 'کدام فعل به معنی «می‌فهمم» است؟', choices: ['понима́ю', 'могу́', 'говорю́', 'сто́ит'], correctIndex: 0, explanationFa: '«понима́ю» یعنی «می‌فهمم» و «говорю́» یعنی «صحبت می‌کنم».' },
    ],
  },
  {
    id: 'ru-pre-13-greeting-name-phrases',
    module: RUSSIAN_PRE_A1_MODULES[2],
    title: 'عبارت‌های سلام، احوال‌پرسی و معرفی',
    subtitle: 'روز بخیر و معرفی با نام مذکر',
    situation: 'سلام کردن، پرسیدن حال و نام و معرفی علی و امیر.',
    teachingFa: 'هدف: سلام کردن، پرسیدن حال و نام و معرفی علی و امیر.\nنکتهٔ تدریجی: «До́брый день» روز بخیر است. «Как ты?» خودمانی و «Как вы?» محترمانه است. برای معرفی می‌گوییم «Меня́ зову́т Али́»؛ «О́чень прия́тно» یعنی بسیار خوشوقتم.',
    durationMinutes: 5,
    sentences: [
      { text: 'Приве́т! Здра́вствуйте!', fa: 'سلام! (دوستانه / محترمانه)', pronunciation: 'پْری‌ویت! زْدْراسْت‌وُیْتِه!', vocabulary: [['Приве́т', 'سلام (دوستانه)'], ['Здра́вствуйте', 'سلام (محترمانه)']] },
      { text: 'До́брый день!', fa: 'روز بخیر!', pronunciation: 'دُبْری دِین!', vocabulary: [['До́брый', 'مهربان (مذکر)'], ['До́брый день', 'روز بخیر'], ['День', 'روز (مذکر)']] },
      { text: 'Как ты? Как вы?', fa: 'حالت چطور است؟ حال شما چطور است؟', pronunciation: 'کاک تی؟ کاک وی؟', vocabulary: [['Ты', 'تو'], ['Как вы', 'شما چطورید'], ['Вы', 'شما']] },
      { text: 'Хорошо́, спаси́бо. А у вас?', fa: 'خوب هستم، ممنون. حال شما چطور است؟', pronunciation: 'خاراشُو، سْپاسیبا. آ او واس؟', vocabulary: [['Хорошо́', 'خوب'], ['А у вас', 'و حال شما چطور']] },
      { text: 'Здра́вствуйте! Как вас зову́т?', fa: 'سلام! اسم شما چیست؟', pronunciation: 'زْدْراسْت‌وُیْتِه! کاک واس زاووت؟', pattern: 'Как + ضمیر + зову́т?', vocabulary: [['вас', 'شما را'], ['зову́т', 'صدا می‌زنند']] },
      { text: 'Меня́ зову́т Али́.', fa: 'اسم من علی است.', pronunciation: 'مینْیا زاووت علی.', pattern: 'Меня́ зову́т + اسم', vocabulary: [['Меня́', 'مرا'], ['зову́т', 'صدا می‌زنند'], ['Али́', 'علی']] },
      { text: 'Меня́ зову́т Ами́р. О́чень прия́тно!', fa: 'اسم من امیر است. بسیار خوشوقتم!', pronunciation: 'مینْیا زاووت امیر. اُچین پْرییاتْنا!', vocabulary: [['Меня́', 'مرا'], ['Меня́ зову́т', 'اسم من است'], ['зову́т', 'صدا می‌زنند'], ['Ами́р', 'امیر'], ['О́чень прия́тно', 'خیلی خوشوقتم']] },
      { text: 'Пока́! Уви́димся!', fa: 'خداحافظ! بعداً می‌بینمتان!', pronunciation: 'پاکا! اوویدیمسیا!', vocabulary: [['Пока́', 'خداحافظ (دوستانه)'], ['Уви́димся', 'بعداً می‌بینمتان']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'До́брый день! Как вы?', fa: 'روز بخیر! حال شما چطور است؟', pronunciation: 'دُبْری دِین! کاک وی؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'До́брый день! Хорошо́, спаси́бо. А у вас?', fa: 'روز بخیر! خوبم، ممنون. و شما؟', pronunciation: 'دُبْری دِین! خاراشُو، سْپاسیبا. آ او واس؟' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Хорошо́! Как вас зову́т?', fa: 'خوبم! اسم شما چیست؟', pronunciation: 'خاراشُو! کاک واس زاووت؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Меня́ зову́т Ами́р. О́чень прия́тно!', fa: 'اسم من امیر است. بسیار خوشوقتم!', pronunciation: 'مینْیا زاووت امیر. اُچین پْرییاتْنا!' },
    ],
    checks: [
      { promptFa: 'برای گفتن «سلام! (دوستانه / محترمانه)» کدام گزینه درست است؟', choices: ['Приве́т! Здра́вствуйте!', 'До́брый день!', 'Как ты? Как вы?', 'Хорошо́, спаси́бо. А у вас?'], correctIndex: 0, explanationFa: '«Приве́т! Здра́вствуйте!» یعنی «سلام! (دوستانه / محترمانه)».' },
      { promptFa: 'برای گفتن «سلام! اسم شما چیست؟» کدام گزینه درست است؟', choices: ['Как ты? Как вы?', 'Здра́вствуйте! Как вас зову́т?', 'Меня́ зову́т Али́.', 'Меня́ зову́т Ами́р. О́чень прия́тно!'], correctIndex: 1, explanationFa: '«Здра́вствуйте! Как вас зову́т?» یعنی «سلام! اسم شما چیست؟».' },
      { promptFa: 'برای گفتن «خداحافظ! بعداً می‌بینمتان!» کدام گزینه درست است؟', choices: ['Хорошо́, спаси́бо. А у вас?', 'Меня́ зову́т Али́.', 'Меня́ зову́т Ами́р. О́чень прия́тно!', 'Пока́! Уви́димся!'], correctIndex: 3, explanationFa: '«Пока́! Уви́димся!» یعنی «خداحافظ! بعداً می‌بینمتان!».' },
    ],
  },
  {
    id: 'ru-pre-14-polite-phrases',
    module: RUSSIAN_PRE_A1_MODULES[2],
    title: 'عبارت‌های ادب، کمک و تکرار',
    subtitle: 'درخواست مؤدبانه و موافقت',
    situation: 'تشکر، درخواست کمک و تکرار و پذیرفتن یا رد مؤدبانه.',
    teachingFa: 'هدف: تسلط بر عبارت‌های «خیلی متشکرم»، «ببخشید، کمک کنید»، «نمی‌فهمم»، «لطفاً تکرار کنید»، «من ... می‌خواهم / دوست دارم» و «بله حتماً / نه متشکرم».\nتلفظ: Помоги́те = «پاماگیتِه»؛ Я не понима́ю = «یا نی پانیمایو»؛ Повтори́те = «پافْتاریتِه».\nنکتهٔ تدریجی: در موقعیت واقعی اگر جملهٔ طرف مقابل را متوجه نشدید، کافی است با ادب بگویید «Извини́те, я не понима́ю. Повтори́те, пожа́луйста.» (ببخشید، نمی‌فهمم. لطفاً تکرار کنید.).',
    durationMinutes: 6,
    sentences: [
      { text: 'Спаси́бо! Пожа́луйста.', fa: 'متشکرم! خواهش می‌کنم.', pronunciation: 'سْپاسیبا! پاژالُیْسْتا.', vocabulary: [['Спаси́бо', 'ممنون / متشکرم'], ['Пожа́луйста', 'لطفاً / خواهش می‌کنم']] },
      { text: 'Извини́те, помоги́те, пожа́луйста.', fa: 'ببخشید، لطفاً کمک کنید.', pronunciation: 'ایزْوینیتِه، پاماگیتِه، پاژالُیْسْتا.', pattern: 'Извини́те, + فعل خواهشی', vocabulary: [['Извини́те', 'ببخشید'], ['помоги́те', 'کمک کنید']] },
      { text: 'Извини́те, я не понима́ю.', fa: 'ببخشید، من نمی‌فهمم / متوجه نمی‌شوم.', pronunciation: 'ایزْوینیتِه، یا نی پانیمایو.', pattern: 'Извини́те, я не + فعل', vocabulary: [['Извини́те', 'ببخشید'], ['не', 'نه (منفی)'], ['понима́ю', 'می‌فهمم']] },
      { text: 'Извини́те, повтори́те, пожа́луйста.', fa: 'ببخشید، لطفاً تکرار کنید.', pronunciation: 'ایزْوینیتِه، پافْتاریتِه، پاژالُیْسْتا.', pattern: 'Повтори́те, пожа́луйста', vocabulary: [['Повтори́те', 'تکرار کنید'], ['пожа́луйста', 'لطفاً']] },
      { text: 'Да, коне́чно.', fa: 'بله، حتماً. (موافقت)', pronunciation: 'دا، کانیِشْنا.', pattern: 'Да, + коне́чно', vocabulary: [['Да', 'بله'], ['коне́чно', 'حتماً / البته']] },
      { text: 'Нет, спаси́бо.', fa: 'نه، متشکرم. (مخالفت مؤدبانه)', pronunciation: 'نِت، سْپاسیبا.', pattern: 'Нет, + спаси́бо', vocabulary: [['Нет', 'نه'], ['спаси́бо', 'متشکرم']] },
      { text: 'Я хочу́ чай. Мне нра́вится!', fa: 'من چای می‌خواهم. دوستش دارم!', pronunciation: 'یا خاچو چای. مْنِه نْراویتْسا!', vocabulary: [['Я', 'من'], ['хочу́', 'می‌خواهم'], ['Чай', 'چای (مذکر)'], ['Мне', 'به من / برایم'], ['Мне нра́вится', 'دوست دارم / خوشم می‌آید'], ['нра́вится', 'خوشم می‌آید']] },
      { text: 'Пока́! Уви́димся.', fa: 'خداحافظ! بعداً می‌بینمتان.', pronunciation: 'پاکا! اوویدیمسیا.', vocabulary: [['Пока́', 'خداحافظ (دوستانه)'], ['Уви́димся', 'بعداً می‌بینمتان']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Извини́те, чай и́ли ко́фе?', fa: 'ببخشید، چای یا قهوه؟', pronunciation: 'ایزْوینیتِه، چای ایلی کُفِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Я не понима́ю. Повтори́те, пожа́луйста.', fa: 'متوجه نمی‌شوم. لطفاً تکرار کنید.', pronunciation: 'یا نی پانیمایو. پافْتاریتِه، پاژالُیْسْتا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Ко́фе?', fa: 'قهوه؟', pronunciation: 'کُفِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, коне́чно! Спаси́бо!', fa: 'بله، حتماً! ممنون!', pronunciation: 'دا، کانیِشْنا! سْپاسیبا!' },
    ],
    checks: [
      { promptFa: 'برای گفتن «متشکرم! خواهش می‌کنم.» کدام گزینه درست است؟', choices: ['Спаси́бо! Пожа́луйста.', 'Извини́те, помоги́те, пожа́луйста.', 'Извини́те, я не понима́ю.', 'Извини́те, повтори́те, пожа́луйста.'], correctIndex: 0, explanationFa: '«Спаси́бо! Пожа́луйста.» یعنی «متشکرم! خواهش می‌کنم.».' },
      { promptFa: 'برای گفتن «بله، حتماً. (موافقت)» کدام گزینه درست است؟', choices: ['Извини́те, я не понима́ю.', 'Да, коне́чно.', 'Нет, спаси́бо.', 'Я хочу́ чай. Мне нра́вится!'], correctIndex: 1, explanationFa: '«Да, коне́чно.» یعنی «بله، حتماً. (موافقت)».' },
      { promptFa: 'برای رد مؤدبانهٔ یک پیشنهاد چه می‌گوییم؟', choices: ['Да, коне́чно.', 'Повтори́те, пожа́луйста.', 'Нет, спаси́бо.', 'Я хочу́ э́то.'], correctIndex: 2, explanationFa: '«Нет, спаси́бо» مخالفت مؤدبانه است.' },
    ],
  },
  {
    id: 'ru-pre-15-combos-pronoun-demo',
    module: RUSSIAN_PRE_A1_MODULES[3],
    title: 'ترکیب ضمیر، ملکی و عدد با اسم مذکر',
    subtitle: 'معرفی و مالکیت با صورت مذکر',
    situation: 'گفتن معلم هستم، خوشحالم و خانه و میز من، همراه با شمارش.',
    teachingFa: 'هدف: گفتن معلم هستم، خوشحالم و خانه و میز من، همراه با شمارش.\nنکتهٔ تدریجی: گویندهٔ مرد می‌گوید «Я рад». با اسم مذکر «мой» می‌آید: «мой дом, мой стол». «Наш учи́тель» معلم ماست. برای سه میز نو می‌گوییم «три но́вых стола́».',
    durationMinutes: 6,
    sentences: [
      { text: 'Я учи́тель.', fa: 'من معلم هستم (مذکر).', pronunciation: 'یا اوچیتِل.', vocabulary: [['Я', 'من'], ['Учи́тель', 'معلم آقا (مذکر)']] },
      { text: 'Я рад.', fa: 'خوشحالم (گویندهٔ مرد).', pronunciation: 'یا رات.', vocabulary: [['Я', 'من'], ['рад', 'خوشحال (آقا)']] },
      { text: 'Он хоро́ший друг.', fa: 'او دوست خوبی است (مذکر).', pronunciation: 'اُن خارُشی دْروک.', vocabulary: [['Он', 'او (مرد)'], ['Хоро́ший', 'خوب (مذکر)'], ['Друг', 'دوستِ آقا (مذکر)']] },
      { text: 'Мой дом.', fa: 'خانهٔ من.', pronunciation: 'مُی دُم.', pattern: 'ضمیر ملکی + اسم (مذکر)', vocabulary: [['Мой', 'مالِ من (مذکر)'], ['дом', 'خانه (مذکر)']] },
      { text: 'Мой стол.', fa: 'میز من.', pronunciation: 'مُی سْتُل.', vocabulary: [['Мой', 'مالِ من (مذکر)'], ['Стол', 'میز (مذکر)']] },
      { text: 'Наш учи́тель.', fa: 'معلمِ ما.', pronunciation: 'ناش اوچیتِل.', pattern: 'ضمیر ملکی + اسم', vocabulary: [['Наш', 'مالِ ما (مذکر)'], ['учи́тель', 'معلم']] },
      { text: 'Два стола́.', fa: 'دو میز.', pronunciation: 'دْوا سْتالا.', pattern: 'عدد + اسم', vocabulary: [['Два', 'دو'], ['стола́', 'میز (با ۲)']] },
      { text: 'Три но́вых стола́.', fa: 'سه میز نو.', pronunciation: 'تْری نُویخ سْتالا.', vocabulary: [['Три', 'سه'], ['но́вых', 'نو (در ترکیب شمارشی)'], ['стола́', 'میز (صورت شمارشی)']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Приве́т! Э́то твой дом?', fa: 'سلام! این خانهٔ تو است؟', pronunciation: 'پْری‌ویت! اِتا تْوُی دُم؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, мой дом. Я студе́нт.', fa: 'بله، خانهٔ من است. من دانشجو هستم.', pronunciation: 'دا، مُی دُم. یا سْتودِنْت.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Два стола́ и́ли три те́кста?', fa: 'دو میز یا سه متن؟', pronunciation: 'دْوا سْتالا ایلی تْری تِکْستا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Три но́вых те́кста. Я рад!', fa: 'سه متن نو. خوشحالم (مذکر)!', pronunciation: 'تْری نُویخ تِکْستا. یا رات!' },
    ],
    checks: [
      { promptFa: 'برای گفتن «من معلم هستم (مذکر).» کدام گزینه درست است؟', choices: ['Я учи́тель.', 'Я рад.', 'Он хоро́ший друг.', 'Мой дом.'], correctIndex: 0, explanationFa: '«Я учи́тель.» یعنی «من معلم هستم (مذکر).».' },
      { promptFa: 'ترکیب «عدد + اسم» در گزینهٔ درست کدام است؟', choices: ['Два стола́.', 'Я студе́нт.', 'Он хоро́ший друг.', 'Я рад.'], correctIndex: 0, explanationFa: '«Два стола́» یعنی «دو میز» (عدد + اسم).' },
      { promptFa: 'برای گفتن «سه میز نو.» کدام گزینه درست است؟', choices: ['Мой дом.', 'Наш учи́тель.', 'Два стола́.', 'Три но́вых стола́.'], correctIndex: 3, explanationFa: '«Три но́вых стола́.» یعنی «سه میز نو.».' },
    ],
  },
  {
    id: 'ru-pre-16-combos-adj-verb',
    module: RUSSIAN_PRE_A1_MODULES[3],
    title: 'ترکیب اسم، صفت، فعل و قید',
    subtitle: 'خانهٔ بزرگ، متن نو و خواندن',
    situation: 'توصیف خانه، خواندن متن و گفتن مکان و زمان روز.',
    teachingFa: 'هدف: توصیف خانه، خواندن متن و گفتن مکان و زمان روز.\nنکتهٔ تدریجی: «Дом большо́й» و «но́вый текст» از اسم و صفت مذکر ساخته می‌شوند. «Я чита́ю текст» یعنی متن می‌خوانم. «Днём» از اسم مذکر «день» می‌آید و «в кла́ссе» یعنی در کلاس.',
    durationMinutes: 6,
    sentences: [
      { text: 'Дом большо́й.', fa: 'خانه بزرگ است.', pronunciation: 'دُم بالْشُی.', pattern: 'اسم + صفت', vocabulary: [['Дом', 'خانه'], ['большо́й', 'بزرگ']] },
      { text: 'Но́вый текст.', fa: 'متن نو.', pronunciation: 'نُوی تِکْست.', vocabulary: [['Но́вый', 'نو (مذکر)'], ['текст', 'متن']] },
      { text: 'Я зна́ю. Я чита́ю.', fa: 'من می‌دانم. من می‌خوانم.', pronunciation: 'یا زْنایو. یا چیتایو.', pattern: 'ضمیر + فعل', vocabulary: [['зна́ю', 'می‌دانم'], ['чита́ю', 'می‌خوانم']] },
      { text: 'Хочу́ чай. Чита́ю текст.', fa: 'چای می‌خواهم. متن را می‌خوانم.', pronunciation: 'خاچو چای. چیتایو تِکْست.', vocabulary: [['хочу́', 'می‌خواهم'], ['Чай', 'چای (مذکر)'], ['чита́ю', 'می‌خوانم'], ['текст', 'متن']] },
      { text: 'Я слу́шаю вас.', fa: 'من به شما گوش می‌دهم.', pronunciation: 'یا سْلوشایو واس.', pattern: 'فعل + ضمیر', vocabulary: [['слу́шаю', 'گوش می‌دهم'], ['вас', 'به شما']] },
      { text: 'Я чита́ю хорошо́.', fa: 'من خوب می‌خوانم.', pronunciation: 'یا چیتایو خاراشُو.', pattern: 'فعل + قید', vocabulary: [['чита́ю', 'می‌خوانم'], ['хорошо́', 'به‌خوبی']] },
      { text: 'Я живу́ здесь.', fa: 'من اینجا زندگی می‌کنم.', pronunciation: 'یا ژیوو زْدِس.', pattern: 'فعل + قید مکان', vocabulary: [['живу́', 'زندگی می‌کنم'], ['здесь', 'اینجا']] },
      { text: 'Днём в кла́ссе.', fa: 'در طول روز در کلاس.', pronunciation: 'دْنیُم فْ کْلاسی.', vocabulary: [['днём', 'در طول روز'], ['в', 'تویِ / در'], ['кла́ссе', 'کلاس (در کلاس)']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то но́вый текст?', fa: 'این یک متن نو است؟', pronunciation: 'اِتا نُوی تِکْست؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, текст но́вый. Я чита́ю текст хорошо́.', fa: 'بله، متن نو است. من متن را خوب می‌خوانم.', pronunciation: 'دا، تِکْست نُوی. یا چیتایو تِکْست خاراشُو.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Я слу́шаю вас. Хочу́ чай днём в кла́ссе.', fa: 'من به شما گوش می‌دهم. در طول روز در کلاس چای می‌خواهم.', pronunciation: 'یا سْلوشایو واس. خاچو چای دْنیُم فْ کْلاسی.' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Хорошо́! Днём в кла́ссе.', fa: 'خوب! در طول روز در کلاس.', pronunciation: 'خاراشُو! دْنیُم فْ کْلاسی.' },
    ],
    checks: [
      { promptFa: 'برای گفتن «خانه بزرگ است.» کدام گزینه درست است؟', choices: ['Дом большо́й.', 'Но́вый текст.', 'Я зна́ю. Я чита́ю.', 'Хочу́ чай. Чита́ю текст.'], correctIndex: 0, explanationFa: '«Дом большо́й.» یعنی «خانه بزرگ است.».' },
      { promptFa: 'برای گفتن «من به شما گوش می‌دهم.» کدام گزینه درست است؟', choices: ['Я зна́ю. Я чита́ю.', 'Я слу́шаю вас.', 'Я чита́ю хорошо́.', 'Я живу́ здесь.'], correctIndex: 1, explanationFa: '«Я слу́шаю вас.» یعنی «من به شما گوش می‌دهم.».' },
      { promptFa: 'برای گفتن «در طول روز در کلاس.» کدام گزینه درست است؟', choices: ['Хочу́ чай. Чита́ю текст.', 'Я чита́ю хорошо́.', 'Я живу́ здесь.', 'Днём в кла́ссе.'], correctIndex: 3, explanationFa: '«Днём в кла́ссе.» یعنی «در طول روز در کلاس.».' },
    ],
  },
  {
    id: 'ru-pre-17-sentences-be-have',
    module: RUSSIAN_PRE_A1_MODULES[4],
    title: 'جمله‌های بودن، مکان و مالکیت',
    subtitle: 'خانه و متن من و معرفی برادر',
    situation: 'معرفی دانشجوی مرد، خانه، متن، کلاس و برادر و گفتن داشتن.',
    teachingFa: 'هدف: معرفی دانشجوی مرد، خانه، متن، کلاس و برادر و گفتن داشتن.\nنکتهٔ تدریجی: برای مالکیت از «мой» با اسم مذکر استفاده می‌کنیم: «мой дом, мой текст». «У меня́ есть текст» یعنی متن دارم. «На столе́» یعنی روی میز و «здесь» یعنی اینجا.',
    durationMinutes: 6,
    sentences: [
      { text: 'Меня́ зову́т Али́. Я студе́нт.', fa: 'اسم من علی است. من دانشجو هستم.', pronunciation: 'مینْیا زاووت علی. یا سْتودِنْت.', pattern: 'معرفی خود', vocabulary: [['Меня́ зову́т', 'اسم من است'], ['студе́нт', 'دانشجو']] },
      { text: 'Я из Ира́на. Я живу́ в го́роде.', fa: 'من اهل ایران هستم. من در شهر زندگی می‌کنم.', pronunciation: 'یا ایز ایرانا. یا ژیوو ف گُرادِه.', pattern: 'Я из + کشور. Я живу́ в + مکان', vocabulary: [['из Ира́на', 'اهل ایران'], ['живу́', 'زندگی می‌کنم'], ['в го́роде', 'در شهر']] },
      { text: 'Э́то мой дом. Э́то мой текст.', fa: 'این خانهٔ من است. این متن من است.', pronunciation: 'اِتا مُی دُم. اِتا مُی تِکْست.', vocabulary: [['Э́то', 'این'], ['Мой', 'مالِ من (مذکر)'], ['Дом', 'خانه (مذکر)'], ['текст', 'متن']] },
      { text: 'Он мой брат.', fa: 'او برادر من است.', pronunciation: 'اُن مُی بْرات.', vocabulary: [['Он', 'او (مرد)'], ['Мой', 'مالِ من (مذکر)'], ['брат', 'برادر']] },
      { text: 'Мой класс све́тлый.', fa: 'کلاس من روشن است.', pronunciation: 'مُی کْلاس سْویتْلی.', vocabulary: [['Мой', 'مالِ من (مذکر)'], ['класс', 'کلاس (مذکر)'], ['све́тлый', 'روشن (مذکر)']] },
      { text: 'Текст на столе́.', fa: 'متن روی میز است.', pronunciation: 'تِکْست نا سْتالی.', vocabulary: [['текст', 'متن'], ['на', 'رویِ'], ['на столе́', 'روی میز'], ['столе́', 'میز (در جایگاه)']] },
      { text: 'Здесь мой класс.', fa: 'اینجا کلاس من است.', pronunciation: 'زْدِس مُی کْلاس.', vocabulary: [['Здесь', 'اینجا'], ['Мой', 'مالِ من (مذکر)'], ['класс', 'کلاس (مذکر)']] },
      { text: 'У меня́ есть текст.', fa: 'من متن دارم.', pronunciation: 'او مینْیا یِسْت تِکْست.', vocabulary: [['У меня́', 'نزد من است / دارم'], ['У меня́ есть', 'من دارم'], ['Меня́', 'مرا'], ['есть', 'هست'], ['текст', 'متن']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то дом?', fa: 'این خانه است؟', pronunciation: 'اِتا دُم؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, э́то мой дом. Здесь мой класс.', fa: 'بله، این خانهٔ من است. اینجا کلاس من است.', pronunciation: 'دا، اِتا مُی دُم. زْدِس مُی کْلاس.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Он брат?', fa: 'او برادر است؟', pronunciation: 'اُن بْرات؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, он мой брат. У меня́ есть кот.', fa: 'بله، او برادر من است. من گربهٔ نر دارم.', pronunciation: 'دا، اُن مُی بْرات. او مینْیا یِسْت کُت.' },
    ],
    checks: [
      { promptFa: 'جای خالی را کامل کنید: «Я живу́ ___ го́роде.» (در شهر)', choices: ['на', 'в', 'из', 'у'], correctIndex: 1, explanationFa: 'برای «در شهر» از حرف اضافهٔ «в» استفاده می‌کنیم: «в го́роде».' },
      { promptFa: 'برای گفتن «کلاس من روشن است.» کدام گزینه درست است؟', choices: ['Э́то мой дом. Э́то мой текст.', 'Мой класс све́тлый.', 'Текст на столе́.', 'Здесь мой класс.'], correctIndex: 1, explanationFa: '«Мой класс све́тлый.» یعنی «کلاس من روشن است.».' },
      { promptFa: 'برای گفتن «من متن دارم.» کدام گزینه درست است؟', choices: ['Он мой брат.', 'Текст на столе́.', 'Здесь мой класс.', 'У меня́ есть текст.'], correctIndex: 3, explanationFa: '«У меня́ есть текст.» یعنی «من متن دارم.».' },
    ],
  },
  {
    id: 'ru-pre-18-sentences-verbs',
    module: RUSSIAN_PRE_A1_MODULES[4],
    title: 'جمله‌های خواستن، توانایی و کار روزمره',
    subtitle: 'فعل‌های کاربردی با واژه‌های مذکر',
    situation: 'خواستن چای و آب‌میوه، دوست داشتن پدر و برادر، خواندن و کار کردن.',
    teachingFa: 'هدف: ساختن جمله‌های روزمره با «می‌خواهم»، «دوست دارم»، «می‌توانم / نمی‌توانم»، «می‌دانم / نمی‌دانم» و «کار می‌کنم / می‌خوانم».\nتلفظ: Я могу́ = «یا ماگو»؛ Я не зна́ю = «یا نی زْنایو»؛ Я рабо́таю = «یا رابُتایو».\nنکتهٔ تدریجی: برای منفی کردن هر فعلی در روسی، واژهٔ «не» را دقیقاً قبل از فعل می‌آوریم: `Я зна́ю` ← `Я не зна́ю`؛ `Я могу́` ← `Я не могу́`.',
    durationMinutes: 6,
    sentences: [
      { text: 'Я хочу́ чай. Я хочу́ сок.', fa: 'من چای می‌خواهم. من آب‌میوه می‌خواهم.', pronunciation: 'یا خاچو چای. یا خاچو سُک.', vocabulary: [['Я', 'من'], ['хочу́', 'می‌خواهم'], ['Чай', 'چای (مذکر)'], ['Сок', 'آب‌میوه (مذکر)']] },
      { text: 'Я люблю́ ко́фе.', fa: 'من قهوه دوست دارم.', pronunciation: 'یا لیوبْلیو کُفِه.', pattern: 'Я люблю́ + اسم', vocabulary: [['люблю́', 'دوست دارم'], ['ко́фе', 'قهوه']] },
      { text: 'Я люблю́ па́пу и бра́та.', fa: 'من پدر و برادرم را دوست دارم.', pronunciation: 'یا لیوبْلیو پاپو ای بْراتا.', vocabulary: [['Я', 'من'], ['люблю́', 'دوست دارم'], ['па́пу', 'پدر (مفعول)'], ['и', 'و'], ['бра́та', 'برادر (مفعول)']] },
      { text: 'Я могу́ чита́ть.', fa: 'من می‌توانم بخوانم.', pronunciation: 'یا ماگو چیتات.', pattern: 'Я могу́ + مصدر', vocabulary: [['могу́', 'می‌توانم'], ['чита́ть', 'خواندن']] },
      { text: 'Я не могу́ помо́чь.', fa: 'من نمی‌توانم کمک کنم.', pronunciation: 'یا نی ماگو پامُچ.', pattern: 'Я не могу́ + مصدر', vocabulary: [['не могу́', 'نمی‌توانم'], ['помо́чь', 'کمک کردن']] },
      { text: 'Я зна́ю э́тот но́мер.', fa: 'من این شماره را می‌دانم.', pronunciation: 'یا زْنایو اِتَت نُمِر.', vocabulary: [['Я', 'من'], ['зна́ю', 'می‌دانم'], ['э́тот', 'این (مذکر)'], ['но́мер', 'شماره']] },
      { text: 'Я не зна́ю.', fa: 'من نمی‌دانم.', pronunciation: 'یا نی زْنایو.', vocabulary: [['Я', 'من'], ['не', 'نه (منفی)'], ['не зна́ю', 'نمی‌دانم'], ['зна́ю', 'می‌دانم']] },
      { text: 'Я рабо́таю до́ма и чита́ю текст.', fa: 'من در خانه کار می‌کنم و متن می‌خوانم.', pronunciation: 'یا رابُتایو دُما ای چیتایو تِکْست.', vocabulary: [['Я', 'من'], ['рабо́таю', 'کار می‌کنم'], ['до́ма', 'در خانه'], ['и', 'و'], ['чита́ю', 'می‌خوانم'], ['текст', 'متن']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Чай и́ли ко́фе?', fa: 'چای یا قهوه؟', pronunciation: 'چای ایلی کُفِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Нет, спаси́бо. Я хочу́ сок.', fa: 'نه، ممنون. من آب‌میوه می‌خواهم.', pronunciation: 'نِت، سْپاسیبا. یا خاچو سُک.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Сок и́ли ко́фе?', fa: 'آب‌میوه یا قهوه؟', pronunciation: 'سُک ایلی کُفِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Я люблю́ ко́фе!', fa: 'من قهوه دوست دارم!', pronunciation: 'یا لیوبْلیو کُفِه!' },
    ],
    checks: [
      { promptFa: 'جملهٔ مثبتِ «Я зна́ю.» به شکل منفی چه می‌شود؟', choices: ['Я нет зна́ю.', 'Я не зна́ю.', 'Не я зна́ю.', 'Зна́ю нет.'], correctIndex: 1, explanationFa: 'برای منفی کردن فعل همیشه «не» پیش از فعل می‌آید: «Я не зна́ю».' },
      { promptFa: 'برای بیان ناتوانی («من نمی‌توانم کمک کنم») کدام درست است؟', choices: ['Я не могу́ помо́чь.', 'Я могу́ чита́ть.', 'Я люблю́ ко́фе.', 'Я рабо́таю до́ма.'], correctIndex: 0, explanationFa: '«не могу́» یعنی «نمی‌توانم».' },
      { promptFa: 'جای خالی را کامل کنید: «Я ___ до́ма.» (من در خانه کار می‌کنم)', choices: ['хочу́', 'рабо́таю', 'зна́ю', 'могу́'], correctIndex: 1, explanationFa: '«рабо́таю» یعنی «کار می‌کنم».' },
    ],
  },
  {
    id: 'ru-pre-19-questions-basic',
    module: RUSSIAN_PRE_A1_MODULES[5],
    title: 'سؤال‌های چی، کی، نام، حال و کجا',
    subtitle: 'پرسش‌های پایه با صورت مذکر',
    situation: 'پرسیدن دربارهٔ میز، برادر، نام، حال، مکان و علاقه.',
    teachingFa: 'هدف: پرسیدن و پاسخ دادن به سؤال‌های نام و هویت، خانواده، افراد و اشیا، مکان، علاقه (`Что ты лю́бишь?`) و سؤال متقابل (`А ты?`).\nتلفظ: Что э́то? = «شْتو اِتا؟»؛ Где ты? = «گْدِه تی؟»؛ Что ты лю́бишь? = «شْتو تی لیوبیش؟».\nنکتهٔ تدریجی: برای ادامهٔ مکالمه بعد از پاسخ دادن، کافی است بپرسید `А ты?` (و تو؟) یا `А у тебя́?` (و تو چطور؟).',
    durationMinutes: 6,
    sentences: [
      { text: 'Что э́то? Э́то но́вый стол.', fa: 'این چیست؟ این یک میزِ نو است.', pronunciation: 'شْتو اِتا؟ اِتا نُوی سْتُل.', pattern: 'Что э́то? ← پاسخ کامل', vocabulary: [['Что', 'چه / چی'], ['э́то', 'این']] },
      { text: 'Кто э́то? Э́то мой брат.', fa: 'این کیست؟ این برادر من است.', pronunciation: 'کْتو اِتا؟ اِتا مُی بْرات.', vocabulary: [['Кто', 'کی'], ['Э́то', 'این'], ['Мой', 'مالِ من (مذکر)'], ['брат', 'برادر']] },
      { text: 'Кто он?', fa: 'او (مرد) کیست؟', pronunciation: 'کْتو اُن؟', vocabulary: [['Кто', 'کی'], ['Он', 'او (مرد)']] },
      { text: 'Как тебя́ зову́т? Меня́ зову́т Али́.', fa: 'اسم تو چیست؟ اسم من علی است.', pronunciation: 'کاک تیبْیا زاووت؟ مینْیا زاووت علی.', pattern: 'Как тебя́ зову́т?', vocabulary: [['тебя́', 'تو را'], ['зову́т', 'صدا می‌زنند']] },
      { text: 'Как ты? Хорошо́, а ты?', fa: 'حالت چطور است؟ خوبم، و تو؟', pronunciation: 'کاک تی؟ خاراشُو، آ تی؟', vocabulary: [['Ты', 'تو'], ['Хорошо́', 'خوب است / باشه (مشترک)'], ['А ты', 'و تو']] },
      { text: 'Где ты? Я до́ма.', fa: 'کجا هستی؟ من خانه هستم.', pronunciation: 'گْدِه تی؟ یا دُما.', pattern: 'Где + ضمیر? ← مکان', vocabulary: [['Где', 'کجا'], ['до́ма', 'در خانه']] },
      { text: 'Что ты лю́бишь? Я люблю́ чай.', fa: 'چه دوست داری؟ من چای دوست دارم.', pronunciation: 'شْتو تی لیوبیش؟ یا لیوبْلیو چای.', pattern: 'Что ты лю́бишь?', vocabulary: [['лю́бишь', 'دوست داری'], ['чай', 'چای']] },
      { text: 'А ты? Где твой брат?', fa: 'و تو چطور؟ برادرت کجاست؟', pronunciation: 'آ تی؟ گْدِه تْوُی بْرات؟', pattern: 'سؤال متقابل + خانواده', vocabulary: [['А ты', 'و تو'], ['твой', 'مالِ تو (مذکر)'], ['брат', 'برادر']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Приве́т! Где ты?', fa: 'سلام! کجا هستی؟', pronunciation: 'پْری‌ویت! گْدِه تی؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Приве́т! Я до́ма. Как ты?', fa: 'سلام! من خانه هستم. حالت چطور است؟', pronunciation: 'پْری‌ویت! یا دُما. کاک تی؟' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Хорошо́! Кто он?', fa: 'خوبم! او کیست؟', pronunciation: 'خاراشُو! کْتو اُن؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Он мой брат. А ты? Где ты?', fa: 'او برادرِ من است. و تو؟ کجا هستی؟', pronunciation: 'اُن مُی بْرات. آ تی؟ گْدِه تی؟' },
    ],
    checks: [
      { promptFa: 'برای گفتن «این چیست؟ این یک میزِ نو است.» کدام گزینه درست است؟', choices: ['Что э́то? Э́то но́вый стол.', 'Кто э́то? Э́то мой брат.', 'Кто он?', 'Как тебя́ зову́т? Меня́ зову́т Али́.'], correctIndex: 0, explanationFa: '«Что э́то? Э́то но́вый стол.» یعنی «این چیست؟ این یک میزِ نو است.».' },
      { promptFa: 'چطور سؤال «چه دوست داری؟» را در روسی می‌سازیم؟', choices: ['Что ты лю́бишь?', 'Кто ты?', 'Где ты?', 'Как тебя́ зову́т?'], correctIndex: 0, explanationFa: '«Что ты лю́бишь?» یعنی «چه دوست داری؟».' },
      { promptFa: 'برای برگرداندن سؤال به طرف مقابل («و تو؟») چه می‌گوییم؟', choices: ['Я до́ма.', 'А ты?', 'Кто он?', 'Что э́то?'], correctIndex: 1, explanationFa: '«А ты?» کوتاه‌ترین سؤال متقابل برای ادامه دادن گفت‌وگو است.' },
    ],
  },
  {
    id: 'ru-pre-20-questions-whose-yesno-count',
    module: RUSSIAN_PRE_A1_MODULES[5],
    title: 'سؤال‌های مال کیست، آیا و چند تا',
    subtitle: 'مالکیت و شمارش اسم‌های مذکر',
    situation: 'پرسیدن مالک خانه و متن و کوله‌پشتی و پرسیدن تعداد و قیمت.',
    teachingFa: 'هدف: پرسیدن مالک خانه و متن و کوله‌پشتی و پرسیدن تعداد و قیمت.\nنکتهٔ تدریجی: با اسم مذکر از «чей» استفاده می‌کنیم: «Чей э́то дом?» پاسخ «мой» یا «твой» است. «Ско́лько» هم برای تعداد و هم در «Ско́лько сто́ит хлеб?» برای قیمت به کار می‌رود.',
    durationMinutes: 6,
    sentences: [
      { text: 'Чей э́то дом? Э́то мой дом.', fa: 'این خانه مال کیست؟ این خانهٔ من است.', pronunciation: 'چِی اِتا دُم؟ اِتا مُی دُم.', pattern: 'Чей э́то + اسم مذکر?', vocabulary: [['Чей', 'مالِ چه کسی (مذکر)'], ['дом', 'خانه']] },
      { text: 'Чей э́то текст? Мой текст.', fa: 'این متن مال کیست؟ متن من است.', pronunciation: 'چِی اِتا تِکْست؟ مُی تِکْست.', vocabulary: [['Чей', 'مالِ چه کسی (مذکر)'], ['Э́то', 'این'], ['текст', 'متن'], ['Мой', 'مالِ من (مذکر)']] },
      { text: 'Э́то твой ключ? Да, мой.', fa: 'آیا این کلید تو است؟ بله، مال من است.', pronunciation: 'اِتا تْوُی کْلیوچ؟ دا، مُی.', pattern: 'پرسش بله/خیر + پاسخ کوتاه', vocabulary: [['твой', 'مالِ تو (مذکر)'], ['ключ', 'کلید']] },
      { text: 'Э́то твой рюкза́к?', fa: 'آیا این کوله‌پشتی تو است؟', pronunciation: 'اِتا تْوُی ریوکْزَک؟', vocabulary: [['Э́то', 'این'], ['твой', 'مالِ تو (مذکر)'], ['рюкза́к', 'کوله‌پشتی']] },
      { text: 'У тебя́ есть кот?', fa: 'آیا تو گربه داری؟', pronunciation: 'او تیبْیا یِسْت کُت؟', pattern: 'У тебя́ есть + اسم?', vocabulary: [['У тебя́ есть', 'تو داری'], ['кот', 'گربه']] },
      { text: 'Что ты хо́чешь? Ты хо́чешь чай?', fa: 'چه می‌خواهی؟ آیا چای می‌خواهی؟', pronunciation: 'شْتو تی خُچِش؟ تی خُچِش چای؟', pattern: 'Что ты хо́чешь? / Ты хо́чешь...?', vocabulary: [['хо́чешь', 'می‌خواهی'], ['чай', 'چای']] },
      { text: 'Ско́лько здесь те́кстов? Три те́кста.', fa: 'اینجا چند متن هست؟ سه متن.', pronunciation: 'سْکُلْکا زْدِس تِکْستَف؟ تْری تِکْستا.', vocabulary: [['Ско́лько', 'چند / چقدر'], ['Здесь', 'اینجا'], ['те́кстов', 'متن (بعد از پنج و بیشتر)'], ['Три', 'سه'], ['те́кста', 'متن (بعد از دو یا سه)']] },
      { text: 'Ско́лько сто́ит хлеб?', fa: 'نان چند قیمت دارد؟', pronunciation: 'سْکُلْکا سْتُیت خْلِب؟', pattern: 'Ско́лько сто́ит + اسم?', vocabulary: [['Ско́лько', 'چقدر'], ['сто́ит', 'قیمت دارد'], ['хлеб', 'نان']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Чей э́то рюкза́к?', fa: 'این کوله‌پشتی مال کیست؟', pronunciation: 'چِی اِتا ریوکْزَک؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Э́то мой рюкза́к.', fa: 'این کوله‌پشتی من است.', pronunciation: 'اِتا مُی ریوکْزَک.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то твой ключ?', fa: 'آیا این کلید تو است؟', pronunciation: 'اِتا تْوُی کْلیوچ؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, мой ключ. Спаси́бо!', fa: 'بله، کلید من است. ممنون!', pronunciation: 'دا، مُی کْلیوچ. سْپاسیبا!' },
    ],
    checks: [
      { promptFa: 'جملهٔ خبری «Э́то твой ключ.» چطور به سؤال بله/خیر تبدیل می‌شود؟', choices: ['Э́то твой ключ? (با آهنگ پرسشی)', 'Кто твой ключ?', 'Что твой ключ?', 'Где твой ключ?'], correctIndex: 0, explanationFa: 'سؤال بله/خیر در روسی با تغییر آهنگ صدای همان جملهٔ خبری ساخته می‌شود.' },
      { promptFa: 'برای گفتن «آیا تو گربه داری؟» کدام گزینه درست است؟', choices: ['Э́то твой ключ? Да, мой.', 'У тебя́ есть кот?', 'Что ты хо́чешь? Ты хо́чешь чай?', 'Ско́лько здесь те́кстов? Три те́кста.'], correctIndex: 1, explanationFa: '«У тебя́ есть кот?» یعنی «آیا تو گربه داری؟».' },
      { promptFa: 'جای خالی را کامل کنید: «___ сто́ит хлеб?» (نان چند قیمت دارد؟)', choices: ['Кто', 'Где', 'Чей', 'Ско́лько'], correctIndex: 3, explanationFa: 'برای پرسیدن تعداد و قیمت همیشه از «Ско́лько» استفاده می‌کنیم.' },
    ],
  },
  {
    id: 'ru-pre-21-daily-identity-family-age',
    module: RUSSIAN_PRE_A1_MODULES[6],
    title: 'معرفی خود، پدر، برادر، سن و ملیت',
    subtitle: 'هویت و خانواده با صورت مذکر',
    situation: 'معرفی علی و امیر، گفتن ملیت و سن و معرفی پدر و برادر.',
    teachingFa: 'هدف: معرفی علی و امیر، گفتن ملیت و سن و معرفی پدر و برادر.\nنکتهٔ تدریجی: برای مرد ایرانی می‌گوییم «Я ира́нец». «Я из Ира́на» یعنی اهل ایران هستم. سن با «Мне ... лет» بیان می‌شود. برای نام پدر می‌گوییم «Моего́ па́пу зову́т Ами́р».',
    durationMinutes: 6,
    sentences: [
      { text: 'Меня́ зову́т Али́. Я студе́нт.', fa: 'اسم من علی است. من دانشجو هستم.', pronunciation: 'مینْیا زاووت علی. یا سْتودِنْت.', pattern: 'Меня́ зову́т + اسم. Я + شغل', vocabulary: [['Меня́ зову́т', 'اسم من است'], ['студе́нт', 'دانشجو']] },
      { text: 'Я из Ира́на.', fa: 'من اهل ایران هستم.', pronunciation: 'یا ایز ایرانا.', pattern: 'Я из + کشور', vocabulary: [['из', 'اهلِ / از'], ['Ира́на', 'ایران']] },
      { text: 'Я ира́нец.', fa: 'من ایرانی هستم (مذکر).', pronunciation: 'یا ایرانِتْس.', vocabulary: [['Я', 'من'], ['ира́нец', 'ایرانی (آقا)']] },
      { text: 'Мне два́дцать лет.', fa: 'من بیست سال دارم.', pronunciation: 'مْنِه دْواتْسات لِت.', pattern: 'Мне + عدد + лет', vocabulary: [['Мне', 'برای من (سن)'], ['два́дцать', 'بیست'], ['лет', 'سال']] },
      { text: 'Ему́ де́сять лет.', fa: 'او (پسر) ده سال دارد.', pronunciation: 'یِمو دِسیت لِت.', pattern: 'Ему́ + عدد + лет', vocabulary: [['Ему́', 'برای او (پسر)'], ['де́сять', 'ده']] },
      { text: 'Э́то мой па́па.', fa: 'این پدر من است.', pronunciation: 'اِتا مُی پاپا.', vocabulary: [['Э́то', 'این'], ['Мой', 'مالِ من (مذکر)'], ['па́па', 'پدر']] },
      { text: 'Моего́ па́пу зову́т Ами́р.', fa: 'اسم پدر من امیر است.', pronunciation: 'ماییوُ پاپو زاووت امیر.', vocabulary: [['моего́', 'مال من (صورت وابسته به پدر)'], ['па́пу', 'پدر (مفعول)'], ['зову́т', 'صدا می‌زنند'], ['Ами́р', 'امیر']] },
      { text: 'У меня́ есть па́па и брат.', fa: 'من پدر و برادر دارم.', pronunciation: 'او مینْیا یِسْت پاپا ای بْرات.', vocabulary: [['У меня́', 'نزد من است / دارم'], ['У меня́ есть', 'من دارم'], ['Меня́', 'مرا'], ['есть', 'هست'], ['па́па', 'پدر'], ['и', 'و'], ['брат', 'برادر']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Как тебя́ зову́т?', fa: 'اسم تو چیست؟', pronunciation: 'کاک تیبْیا زاووت؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Меня́ зову́т Ами́р. Я из Ира́на.', fa: 'اسم من امیر است. من اهل ایران هستم.', pronunciation: 'مینْیا زاووت امیر. یا ایز ایرانا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то твой брат?', fa: 'این برادر تو است؟', pronunciation: 'اِتا تْوُی بْرات؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да. У меня́ есть брат и па́па.', fa: 'بله. من برادر و پدر دارم.', pronunciation: 'دا. او مینْیا یِسْت بْرات ای پاپا.' },
    ],
    checks: [
      { promptFa: 'برای ساختن جملهٔ «من بیست سال دارم» کدام گزینه درست است؟', choices: ['Я из Ира́на.', 'Мне два́дцать лет.', 'Ему́ де́сять лет.', 'Я ира́нец.'], correctIndex: 1, explanationFa: 'ساختار «Мне + عدد + лет» برای گفتن سن خود به کار می‌رود.' },
      { promptFa: 'برای گفتن «او (پسر) ده سال دارد.» کدام گزینه درست است؟', choices: ['Я ира́нец.', 'Ему́ де́сять лет.', 'Э́то мой па́па.', 'Моего́ па́пу зову́т Ами́р.'], correctIndex: 1, explanationFa: '«Ему́ де́сять лет.» یعنی «او (پسر) ده سال دارد.».' },
      { promptFa: 'برای گفتن «من پدر و برادر دارم.» کدام گزینه درست است؟', choices: ['Мне два́дцать лет.', 'Э́то мой па́па.', 'Моего́ па́пу зову́т Ами́р.', 'У меня́ есть па́па и брат.'], correctIndex: 3, explanationFa: '«У меня́ есть па́па и брат.» یعنی «من پدر و برادر دارم.».' },
    ],
  },
  {
    id: 'ru-pre-22-daily-likes-needs-wants',
    module: RUSSIAN_PRE_A1_MODULES[6],
    title: 'علاقه، مالکیت، نیاز و خواسته',
    subtitle: 'خواستن متن و مداد و نیاز به چای و کلید',
    situation: 'گفتن علاقه به چای و متن، داشتن تلفن و مداد و نیاز به کلید.',
    teachingFa: 'هدف: گفتن علاقه به چای و متن، داشتن تلفن و مداد و نیاز به کلید.\nنکتهٔ تدریجی: برای نیاز به اسم مذکر می‌گوییم «Мне ну́жен ...»: «Мне ну́жен ключ» و «Мне ну́жен чай». «Мне нра́вится э́тот текст» یعنی این متن را دوست دارم.',
    durationMinutes: 6,
    sentences: [
      { text: 'Мне нра́вится чай.', fa: 'من چای را دوست دارم / از چای خوشم می‌آید.', pronunciation: 'مْنِه نْراویتْسیا چای.', pattern: 'Мне нра́вится + اسم', vocabulary: [['Мне нра́вится', 'دوست دارم / خوشم می‌آید'], ['чай', 'چای']] },
      { text: 'Мне нра́вится э́тот текст.', fa: 'من این متن را دوست دارم.', pronunciation: 'مْنِه نْراویتْسا اِتَت تِکْست.', vocabulary: [['Мне', 'به من / برایم'], ['Мне нра́вится', 'دوست دارم / خوشم می‌آید'], ['нра́вится', 'خوشم می‌آید'], ['э́тот', 'این (مذکر)'], ['текст', 'متن']] },
      { text: 'Э́то мой телефо́н.', fa: 'این گوشیِ من است.', pronunciation: 'اِتا مُی تیلیفُن.', pattern: 'Э́то мой + اسم مذکر', vocabulary: [['мой', 'مالِ من'], ['телефо́н', 'گوشی']] },
      { text: 'У меня́ есть но́вый каранда́ш.', fa: 'من یک مداد نو دارم.', pronunciation: 'او مینْیا یِسْت نُوی کاراندَش.', vocabulary: [['У меня́', 'نزد من است / دارم'], ['У меня́ есть', 'من دارم'], ['Меня́', 'مرا'], ['есть', 'هست'], ['Но́вый', 'نو (مذکر)'], ['каранда́ш', 'مداد']] },
      { text: 'Мне ну́жен чай.', fa: 'من چای لازم دارم.', pronunciation: 'مْنِه نوژِن چای.', vocabulary: [['Мне', 'به من / برایم'], ['ну́жен', 'لازم است (مذکر)'], ['Чай', 'چای (مذکر)']] },
      { text: 'Мне ну́жен ключ.', fa: 'من کلید لازم دارم.', pronunciation: 'مْنِه نوژِن کْلیوچ.', pattern: 'Мне ну́жен + اسم مذکر', vocabulary: [['ну́жен', 'لازم است (مذکر)'], ['ключ', 'کلید']] },
      { text: 'Я хочу́ ко́фе.', fa: 'من قهوه می‌خواهم.', pronunciation: 'یا خاچو کُفِه.', pattern: 'Я хочу́ + اسم', vocabulary: [['хочу́', 'می‌خواهم'], ['ко́фе', 'قهوه']] },
      { text: 'Я хочу́ но́вый текст.', fa: 'من یک متن نو می‌خواهم.', pronunciation: 'یا خاچو نُوی تِکْست.', vocabulary: [['Я', 'من'], ['хочу́', 'می‌خواهم'], ['Но́вый', 'نو (مذکر)'], ['текст', 'متن']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Ты хо́чешь ко́фе?', fa: 'آیا قهوه می‌خواهی؟', pronunciation: 'تی خُچِش کُفِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Нет, спаси́бо. Мне ну́жен чай.', fa: 'نه، ممنون. من چای لازم دارم.', pronunciation: 'نِت، سْپاسیبا. مْنِه نوژِن چای.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'У меня́ есть чай. Пожа́луйста!', fa: 'من چای دارم. بفرمایید!', pronunciation: 'او مینْیا یِسْت چای. پاژالُیْسْتا!' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Спаси́бо! Я люблю́ чай.', fa: 'ممنون! من چای دوست دارم.', pronunciation: 'سْپاسیبا! یا لیوبْلیو چای.' },
    ],
    checks: [
      { promptFa: 'برای گفتن «من چای را دوست دارم / از چای خوشم می‌آید.» کدام گزینه درست است؟', choices: ['Мне нра́вится чай.', 'Мне нра́вится э́тот текст.', 'Э́то мой телефо́н.', 'У меня́ есть но́вый каранда́ш.'], correctIndex: 0, explanationFa: '«Мне нра́вится чай.» یعنی «من چای را دوست دارم / از چای خوشم می‌آید.».' },
      { promptFa: 'برای گفتن «من چای لازم دارم.» کدام گزینه درست است؟', choices: ['Э́то мой телефо́н.', 'Мне ну́жен чай.', 'Мне ну́жен ключ.', 'Я хочу́ ко́фе.'], correctIndex: 1, explanationFa: '«Мне ну́жен чай.» یعنی «من چای لازم دارم.».' },
      { promptFa: 'برای گفتن «من یک متن نو می‌خواهم.» کدام گزینه درست است؟', choices: ['У меня́ есть но́вый каранда́ш.', 'Мне ну́жен ключ.', 'Я хочу́ ко́фе.', 'Я хочу́ но́вый текст.'], correctIndex: 3, explanationFa: '«Я хочу́ но́вый текст.» یعنی «من یک متن نو می‌خواهم.».' },
    ],
  },
  {
    id: 'ru-pre-23-daily-descriptions',
    module: RUSSIAN_PRE_A1_MODULES[6],
    title: 'توصیف اشیا و افراد مذکر',
    subtitle: 'میز، کلاس، خوراک، متن و دوست',
    situation: 'توصیف میز، کلاس، سوپ، مداد و افراد با صورت مذکر و جمع اسم مذکر.',
    teachingFa: 'هدف: توصیف میز، کلاس، سوپ، مداد و افراد با صورت مذکر و جمع اسم مذکر.\nنکتهٔ تدریجی: «Мой стол большо́й» و «мой друг у́мный» از صورت مذکر استفاده می‌کنند. در جمع «но́вые те́ксты» می‌گوییم؛ اسم پایه «текст» مذکر است. «До́брый» یعنی مهربان و «хоро́ший» یعنی خوب.',
    durationMinutes: 6,
    sentences: [
      { text: 'Мой стол большо́й и но́вый.', fa: 'میزِ من بزرگ و نو است.', pronunciation: 'مُی سْتُل بالْشُی ای نُوی.', pattern: 'мой + اسم + صفت', vocabulary: [['стол', 'میز'], ['большо́й', 'بزرگ'], ['но́вый', 'نو']] },
      { text: 'Мой класс ма́ленький и краси́вый.', fa: 'کلاس من کوچک و زیبا است.', pronunciation: 'مُی کْلاس مالینْکی ای کْراسیوی.', vocabulary: [['Мой', 'مالِ من (مذکر)'], ['класс', 'کلاس (مذکر)'], ['Ма́ленький', 'کوچک (مذکر)'], ['и', 'و'], ['Краси́вый', 'زیبا (مذکر)']] },
      { text: 'Э́то вку́сный суп.', fa: 'این سوپِ خوشمزه‌ای است.', pronunciation: 'اِتا فْکوسْنی سوپ.', pattern: 'Э́то + صفت + اسم', vocabulary: [['вку́сный', 'خوشمزه'], ['суп', 'سوپ']] },
      { text: 'Э́то зелёный каранда́ш.', fa: 'این یک مداد سبز است.', pronunciation: 'اِتا زیلیُنی کاراندَش.', vocabulary: [['Э́то', 'این'], ['Зелёный', 'سبز (مذکر)'], ['каранда́ш', 'مداد']] },
      { text: 'Э́то но́вые те́ксты.', fa: 'این‌ها متن‌های نو هستند.', pronunciation: 'اِتا نُویه تِکْستی.', vocabulary: [['Э́то', 'این'], ['но́вые', 'نو (جمع)'], ['те́ксты', 'متن‌ها']] },
      { text: 'Наш учи́тель до́брый.', fa: 'معلمِ ما مهربان است.', pronunciation: 'ناش اوچیتِل دُبْری.', pattern: 'Наш + اسم + صفت', vocabulary: [['учи́тель', 'معلم'], ['до́брый', 'مهربان']] },
      { text: 'Мой друг у́мный.', fa: 'دوست من باهوش است (مذکر).', pronunciation: 'مُی دْروک اومْنی.', vocabulary: [['Мой', 'مالِ من (مذکر)'], ['Друг', 'دوستِ آقا (مذکر)'], ['у́мный', 'باهوش (مذکر)']] },
      { text: 'Мой друг хоро́ший челове́к. Э́тот ма́льчик ма́ленький.', fa: 'دوست من آدم خوبی است. این پسر کوچک است.', pronunciation: 'مُی دْروک خارُشی چیلاوِک. اِتَت مالْچیک مالینْکی.', vocabulary: [['Мой', 'مالِ من (مذکر)'], ['Друг', 'دوستِ آقا (مذکر)'], ['Хоро́ший', 'خوب (مذکر)'], ['Челове́к', 'انسان / شخص (مذکر)'], ['э́тот', 'این (مذکر)'], ['Ма́льчик', 'پسر (مذکر)'], ['Ма́ленький', 'کوچک (مذکر)']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то вку́сный суп?', fa: 'آیا این سوپ خوشمزه‌ای است؟', pronunciation: 'اِتا فْکوسْنی سوپ؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, э́то вку́сный суп. И вот но́вые те́ксты.', fa: 'بله، این سوپ خوشمزه است. و این هم متن‌های نو.', pronunciation: 'دا، اِتا فْکوسْنی سوپ. ای وُت نُویه تِکْستی.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Кто твой учи́тель?', fa: 'معلم تو کیست؟', pronunciation: 'کْتو تْوُی اوچیتِل؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Наш учи́тель хоро́ший и до́брый.', fa: 'معلم ما خوب و مهربان است.', pronunciation: 'ناش اوچیتِل خارُشی ای دُبْری.' },
    ],
    checks: [
      { promptFa: 'برای گفتن «میزِ من بزرگ و نو است.» کدام گزینه درست است؟', choices: ['Мой стол большо́й и но́вый.', 'Мой класс ма́ленький и краси́вый.', 'Э́то вку́сный суп.', 'Э́то зелёный каранда́ш.'], correctIndex: 0, explanationFa: '«Мой стол большо́й и но́вый.» یعنی «میزِ من بزرگ و نو است.».' },
      { promptFa: 'برای گفتن «این‌ها متن‌های نو هستند.» کدام گزینه درست است؟', choices: ['Э́то вку́сный суп.', 'Э́то но́вые те́ксты.', 'Наш учи́тель до́брый.', 'Мой друг у́мный.'], correctIndex: 1, explanationFa: '«Э́то но́вые те́ксты.» یعنی «این‌ها متن‌های نو هستند.».' },
      { promptFa: 'برای گفتن «دوست من آدم خوبی است. این پسر کوچک است.» کدام گزینه درست است؟', choices: ['Э́то зелёный каранда́ш.', 'Наш учи́тель до́брый.', 'Мой друг у́мный.', 'Мой друг хоро́ший челове́к. Э́тот ма́льчик ма́ленький.'], correctIndex: 3, explanationFa: '«Мой друг хоро́ший челове́к. Э́тот ма́льчик ма́ленький.» یعنی «دوست من آدم خوبی است. این پسر کوچک است.».' },
    ],
  },
  {
    id: 'ru-pre-29-numbers-teens',
    module: RUSSIAN_PRE_A1_MODULES[6],
    title: 'عددهای یازده تا بیست',
    subtitle: 'شمارش با اسم مذکر متن',
    situation: 'گفتن عددهای یازده تا نوزده، سن و شمارش متن‌ها.',
    teachingFa: 'هدف: گفتن عددهای یازده تا نوزده، سن و شمارش متن‌ها.\nنکتهٔ تدریجی: بعد از عددهای یازده تا نوزده، اسم را در شکل مناسب شمارش می‌آوریم: «пятна́дцать те́кстов» و «шестна́дцать те́кстов». اسم پایه «текст» مذکر است.',
    durationMinutes: 5,
    sentences: [
      { text: 'Оди́ннадцать.', fa: 'یازده.', pronunciation: 'ادینادات.', vocabulary: [['Оди́ннадцать', 'یازده']] },
      { text: 'Две́надцать, три́надцать.', fa: 'دوازده، سیزده.', pronunciation: 'دْوینادات، تْرینادات.', vocabulary: [['Две́надцать', 'دوازده'], ['три́надцать', 'سیزده']] },
      { text: 'Четы́рнадцать, пятна́дцать.', fa: 'چهارده، پانزده.', pronunciation: 'چیتی‌رْنادسات، پیتْنادسات.', vocabulary: [['Четы́рнадцать', 'چهارده'], ['пятна́дцать', 'پانزده']] },
      { text: 'Шестна́дцать, семна́дцать.', fa: 'شانزده، هفده.', pronunciation: 'شیشْنادسات، سیمْنادسات.', vocabulary: [['Шестна́дцать', 'شانزده'], ['семна́дцать', 'هفده']] },
      { text: 'Восемна́дцать, девятна́дцать.', fa: 'هجده، نوزده.', pronunciation: 'وَسیمْنادسات، دیویتْنادسات.', vocabulary: [['Восемна́дцать', 'هجده'], ['девятна́дцать', 'نوزده']] },
      { text: 'Мне двена́дцать лет.', fa: 'من دوازده سالم است.', pronunciation: 'مْنی دْوینادات لِت.', pattern: 'Мне + عدد + лет (سن)', vocabulary: [['Мне', 'به من / برای من'], ['двена́дцать лет', 'دوازده سال']] },
      { text: 'У меня́ шестна́дцать те́кстов.', fa: 'من شانزده متن دارم.', pronunciation: 'او مینْیا شیسْناتْسَت تِکْستَف.', vocabulary: [['У меня́', 'نزد من است / دارم'], ['Меня́', 'مرا'], ['Шестна́дцать', 'شانزده'], ['те́кстов', 'متن (بعد از پنج و بیشتر)']] },
      { text: 'Семна́дцать и́ли восемна́дцать?', fa: 'هفده یا هجده؟', pronunciation: 'سیمْنادسات ایلی وَسیمْنادسات؟', pattern: 'عدد + и́ли + عدد؟', vocabulary: [['и́ли', 'یا']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'У тебя́ есть текст?', fa: 'آیا متن داری؟', pronunciation: 'او تیبْیا یِسْت تِکْست؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да. У меня́ пятна́дцать те́кстов.', fa: 'بله. من پانزده متن دارم.', pronunciation: 'دا. او مینْیا پیتْناتْسَت تِکْستَف.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Пятна́дцать? О́чень мно́го!', fa: 'پانزده؟ خیلی زیاد!', pronunciation: 'پیتْنادسات؟ اُچین مْنُاگا!' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, о́чень мно́го. А у тебя́?', fa: 'بله، خیلی زیاد. و تو؟', pronunciation: 'دا، اُچین مْنُاگا. آ او تیبْیا؟' },
    ],
    checks: [
      { promptFa: '«دوازده» به روسی کدام است؟', choices: ['Оди́ннадцать.', 'Две́надцать.', 'Два́дцать.', 'Де́сять.'], correctIndex: 1, explanationFa: '«Две́надцать» یعنی دوازده؛ «Оди́ннадцать» یازده و «Два́дцать» بیست است.' },
      { promptFa: 'برای گفتن «هجده، نوزده.» کدام گزینه درست است؟', choices: ['Четы́рнадцать, пятна́дцать.', 'Восемна́дцать, девятна́дцать.', 'Мне двена́дцать лет.', 'У меня́ шестна́дцать те́кстов.'], correctIndex: 1, explanationFa: '«Восемна́дцать, девятна́дцать.» یعنی «هجده، نوزده.».' },
      { promptFa: 'عددهای ۱۱ تا ۱۹ با کدام پایان مشترک ساخته می‌شوند؟', choices: ['«-надцать»', '«-дцать лет»', '«-ин»', '«-на́»'], correctIndex: 0, explanationFa: 'همهٔ عددهای ۱۱ تا ۱۹ با «-надцать» تمام می‌شوند: две́надцать، три́надцать، …' },
    ],
  },
  {
    id: 'ru-pre-30-question-words-2',
    module: RUSSIAN_PRE_A1_MODULES[6],
    title: 'پرسش‌های کی، چه‌جور و چرا',
    subtitle: 'زمان درس و پرسش با какой برای اسم مذکر',
    situation: 'پرسیدن زمان درس، نوع چای و متن و علت و هدف.',
    teachingFa: 'هدف: پرسیدن زمان درس، نوع چای و متن و علت و هدف.\nنکتهٔ تدریجی: «Когда́» یعنی چه زمانی، «почему́» یعنی چرا و «заче́м» یعنی برای چه هدفی. «Како́й» با اسم مذکر می‌آید: «Како́й чай?» و «Како́й текст?». «Во вто́рник» یعنی سه‌شنبه.',
    durationMinutes: 6,
    sentences: [
      { text: 'Когда́?', fa: 'کی؟ / کی (زمان)؟', pronunciation: 'کاغْدا؟', vocabulary: [['Когда́', 'کی / چه‌زمان']] },
      { text: 'Когда́ уро́к? Во вто́рник.', fa: 'درس چه زمانی است؟ سه‌شنبه.', pronunciation: 'کاگْدا اورُک؟ وا فْتُرْنیک.', vocabulary: [['Когда́', 'کی / چه‌زمان'], ['уро́к', 'درس'], ['вто́рник', 'سه‌شنبه']] },
      { text: 'Како́й чай? Чёрный.', fa: 'چه چای‌ای؟ سیاه.', pronunciation: 'کاکُی چای؟ چورْنی.', pattern: 'Како́й + اسم مذکر?', vocabulary: [['Како́й', 'چه‌جور / کدام (مذکر)'], ['чёрный', 'سیاه']] },
      { text: 'Како́й текст? Но́вый.', fa: 'چه متنی؟ نو.', pronunciation: 'کاکُی تِکْست؟ نُوی.', vocabulary: [['Како́й', 'چه‌جور / کدام (مذکر)'], ['текст', 'متن'], ['Но́вый', 'نو (مذکر)']] },
      { text: 'Почему́?', fa: 'چرا؟', pronunciation: 'پاچیمُو؟', vocabulary: [['Почему́', 'چرا']] },
      { text: 'Почему́ до́ма? Не зна́ю.', fa: 'چرا خانه‌ای؟ نمی‌دانم.', pronunciation: 'پاچیمُو دُما؟ نی زْنایو.', pattern: 'Почему́ + …? ← پاسخ کوتاه', vocabulary: [['не зна́ю', 'نمی‌دانم']] },
      { text: 'Заче́м телефо́н?', fa: 'تلفن برای چه است؟', pronunciation: 'زاسیِم تیلیفُن؟', pattern: 'Заче́м + اسم?', vocabulary: [['Заче́м', 'برای چه / چرا (هدف)'], ['телефо́н', 'تلفن']] },
      { text: 'Заче́м? Чита́ть текст.', fa: 'برای چه؟ برای خواندن متن.', pronunciation: 'زاچِم؟ چیتات تِکْست.', vocabulary: [['Заче́м', 'برای چه / چرا (هدف)'], ['чита́ть', 'خواندن'], ['текст', 'متن']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Когда́ уро́к? Во вто́рник?', fa: 'درس چه زمانی است؟ سه‌شنبه؟', pronunciation: 'کاگْدا اورُک؟ وا فْتُرْنیک؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, во вто́рник. А ты?', fa: 'بله، سه‌شنبه. و تو؟', pronunciation: 'دا، وا فْتُرْنیک. آ تی؟' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Я то́же. Како́й э́то текст?', fa: 'من هم همین‌طور. این چه متنی است؟', pronunciation: 'یا تُژِه. کاکُی اِتا تِکْست؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Но́вый. Почему́ вы до́ма?', fa: 'نو. چرا شما خانه هستید؟', pronunciation: 'نُوی. پاچیمو وی دُما؟' },
    ],
    checks: [
      { promptFa: 'برای پرسیدن «کی؟» (زمان) از کدام واژه استفاده می‌شود؟', choices: ['Что?', 'Кто?', 'Когда́?', 'Где?'], correctIndex: 2, explanationFa: '«Когда́» پرسش‌واژهٔ زمان است؛ «Что» برای اشیا، «Кто» برای افراد و «Где» برای مکان.' },
      { promptFa: 'برای گفتن «چرا؟» کدام گزینه درست است؟', choices: ['Како́й чай? Чёрный.', 'Почему́?', 'Почему́ до́ма? Не зна́ю.', 'Заче́м телефо́н?'], correctIndex: 1, explanationFa: '«Почему́?» یعنی «چرا؟».' },
      { promptFa: '«Почему́?» چه معنایی دارد؟', choices: ['کجا؟', 'چرا؟', 'کی؟', 'چه‌جور؟'], correctIndex: 1, explanationFa: '«Почему́» یعنی «چرا؟» و پاسخش می‌تواند کوتاه باشد: «Не зна́ю.» (نمی‌دانم).' },
    ],
  },
  {
    id: 'ru-pre-31-more-descriptions',
    module: RUSSIAN_PRE_A1_MODULES[6],
    title: 'توصیف‌های بیشتر: رنگ، شغل و ضمیر он',
    subtitle: 'سرد و گرم، متن و مداد و پزشک',
    situation: 'توصیف چای، سوپ، متن، مداد و خانه و معرفی پزشک مرد.',
    teachingFa: 'هدف: توصیف چای، سوپ، متن، مداد و خانه و معرفی پزشک مرد.\nنکتهٔ تدریجی: «Холо́дный, горя́чий, интере́сный, си́ний, жёлтый» صورت‌های مذکرند. برای اسم مذکر از «он» استفاده می‌کنیم: «Э́то дом. Он но́вый». «Врач» و «уче́бник» نیز مذکرند.',
    durationMinutes: 6,
    sentences: [
      { text: 'Э́то холо́дный чай.', fa: 'این چایِ سرد است.', pronunciation: 'اِتا خالُدْنی چای.', pattern: 'Э́то + صفت + اسم', vocabulary: [['холо́дный', 'سرد']] },
      { text: 'Э́то горя́чий суп.', fa: 'این سوپِ داغ است.', pronunciation: 'اِتا گاریاچی سوپ.', vocabulary: [['горя́чий', 'داغ / گرم']] },
      { text: 'Э́то интере́сный текст.', fa: 'این متن جالب است.', pronunciation: 'اِتا اینْتیرِسْنی تِکْست.', vocabulary: [['Э́то', 'این'], ['интере́сный', 'جالب (مذکر)'], ['текст', 'متن']] },
      { text: 'Э́то си́ний каранда́ш.', fa: 'این یک مداد آبی است.', pronunciation: 'اِتا سینی کاراندَش.', vocabulary: [['Э́то', 'این'], ['си́ний', 'آبی (مذکر)'], ['каранда́ш', 'مداد']] },
      { text: 'Э́то жёлтый каранда́ш.', fa: 'این یک مداد زرد است.', pronunciation: 'اِتا ژُلتـی کاراندَش.', vocabulary: [['Э́то', 'این'], ['жёлтый', 'زرد (مذکر)'], ['каранда́ш', 'مداد']] },
      { text: 'Э́то дом. Он но́вый.', fa: 'این خانه است. آن نو است.', pronunciation: 'اِتا دُم. اُن نُوی.', vocabulary: [['Э́то', 'این'], ['Дом', 'خانه (مذکر)'], ['Он', 'او (مرد)'], ['Но́вый', 'نو (مذکر)']] },
      { text: 'Кто э́то? Э́то врач.', fa: 'این کیست؟ این پزشک است.', pronunciation: 'کْتو اِتا؟ اِتا وراچ.', pattern: 'Кто э́то? ← شغل', vocabulary: [['врач', 'پزشک / دکتر']] },
      { text: 'Уче́бник на столе́. Класс там.', fa: 'کتاب درسی روی میز است. کلاس آنجاست.', pronunciation: 'اوچیِبْنیک نا سْتالی. کْلاس تام.', vocabulary: [['уче́бник', 'کتاب درسی (مذکر)'], ['на', 'رویِ'], ['на столе́', 'روی میز'], ['столе́', 'میز (در جایگاه)'], ['класс', 'کلاس (مذکر)'], ['Там', 'آنجا']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Како́й чай? Горя́чий?', fa: 'چه چای‌ای؟ داغ؟', pronunciation: 'کاکُی چای؟ گاریاچی؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Нет, холо́дный. Я не лю́блю горя́чий.', fa: 'نه، سرد. داغ را دوست ندارم.', pronunciation: 'نِت، خالُدْنی. یا نی لیوبْلیو گاریاچی.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Кто он? Врач?', fa: 'او کیست؟ پزشک؟', pronunciation: 'کْتو اُن؟ وراچ؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, врач. Уче́бник врача́ там.', fa: 'بله، پزشک است. کتاب درسی پزشک آنجاست.', pronunciation: 'دا، وْراچ. اوچیِبْنیک وْراچا تام.' },
    ],
    checks: [
      { promptFa: 'برای گفتن «این چایِ سرد است.» کدام گزینه درست است؟', choices: ['Э́то холо́дный чай.', 'Э́то горя́чий суп.', 'Э́то интере́сный текст.', 'Э́то си́ний каранда́ш.'], correctIndex: 0, explanationFa: '«Э́то холо́дный чай.» یعنی «این چایِ سرد است.».' },
      { promptFa: '«Э́то холо́дный чай.» یعنی چه؟', choices: ['این چای داغ است.', 'این چای سرد است.', 'این چای سیاه است.', 'این سوپ سرد است.'], correctIndex: 1, explanationFa: '«холо́дный» یعنی «سرد» و «горя́чий» یعنی «داغ/گرم».' },
      { promptFa: 'برای گفتن «کتاب درسی روی میز است. کلاس آنجاست.» کدام گزینه درست است؟', choices: ['Э́то си́ний каранда́ш.', 'Э́то дом. Он но́вый.', 'Кто э́то? Э́то врач.', 'Уче́бник на столе́. Класс там.'], correctIndex: 3, explanationFa: '«Уче́бник на столе́. Класс там.» یعنی «کتاب درسی روی میز است. کلاس آنجاست.».' },
    ],
  },
  {
    id: 'ru-pre-24-conv-greeting-intro',
    module: RUSSIAN_PRE_A1_MODULES[7],
    title: 'مکالمه: سلام، احوال‌پرسی و آشنایی',
    subtitle: 'گفت‌وگوی کوتاه با نام‌های مذکر',
    situation: 'تمرین سلام و احوال‌پرسی و معرفی علی و امیر به عنوان دانشجوی مرد.',
    teachingFa: 'هدف: اجرای کامل مکالمهٔ «سلام و احوال‌پرسی»، «آشنایی با یک شخص»، «معرفی خود» و بیان توانایی صحبت به روسی.\nتلفظ: О́чень прия́тно = «اُچِن پْری‌یاتْنا»؛ Я немно́го говорю́ по-ру́сски = «یا نیمْنُگا گاواریو پا-روسْکی».\nنکتهٔ تدریجی: «А у тебя́?» (و تو چطوری؟) سؤال را به طرف مقابل برمی‌گرداند. جملهٔ «Я немно́го говорю́ по-ру́сски.» (من کمی روسی صحبت می‌کنم) در اولین مکالمه‌ها بسیار کاربردی است.',
    durationMinutes: 6,
    sentences: [
      { text: 'Здра́вствуйте! До́брый день!', fa: 'سلام! روز بخیر!', pronunciation: 'زْدْراسْت‌وُیْتِه! دُبْری دِین!', vocabulary: [['Здра́вствуйте', 'سلام (محترمانه)'], ['До́брый', 'مهربان (مذکر)'], ['До́брый день', 'روز بخیر'], ['День', 'روز (مذکر)']] },
      { text: 'Приве́т! Как ты?', fa: 'سلام! حالت چطور است؟', pronunciation: 'پْری‌ویت! کاک تی؟', vocabulary: [['Приве́т', 'سلام (دوستانه)'], ['Ты', 'تو']] },
      { text: 'Хорошо́, спаси́бо. А у тебя́?', fa: 'خوبم، ممنون. تو چطوری؟', pronunciation: 'خاراشُو، سْپاسیبا. آ او تیبْیا؟', pattern: 'Хорошо́, спаси́бо. А у + ضمیر?', vocabulary: [['Хорошо́', 'خوب'], ['у тебя́', 'حالِ تو']] },
      { text: 'Как тебя́ зову́т?', fa: 'اسم تو چیست؟', pronunciation: 'کاک تیبْیا زاووت؟', vocabulary: [['тебя́', 'تو را'], ['зову́т', 'صدا می‌زنند']] },
      { text: 'Меня́ зову́т Али́. Я из Ира́на.', fa: 'اسم من علی است. اهل ایران هستم.', pronunciation: 'مینْیا زاووت علی. یا ایز ایرانا.', vocabulary: [['Меня́ зову́т', 'اسم من است'], ['из Ира́на', 'اهل ایران']] },
      { text: 'Я Ами́р. Я студе́нт.', fa: 'من امیر هستم. من دانشجو هستم (مذکر).', pronunciation: 'یا امیر. یا سْتودِنت.', vocabulary: [['Я', 'من'], ['Ами́р', 'امیر'], ['Студе́нт', 'دانشجوی آقا (مذکر)']] },
      { text: 'О́чень прия́тно! Я немно́го говорю́ по-ру́сски.', fa: 'خیلی خوشوقتم! من کمی روسی صحبت می‌کنم.', pronunciation: 'اُچِن پْری‌یاتْنا! یا نیمْنُگا گاواریو پا-روسْکی.', vocabulary: [['О́чень прия́тно', 'خیلی خوشوقتم'], ['немно́го', 'کمی'], ['говорю́ по-ру́сски', 'روسی صحبت می‌کنم']] },
      { text: 'Пока́! Уви́димся!', fa: 'خداحافظ! بعداً می‌بینمتان!', pronunciation: 'پاکا! اوویدیمسیا!', vocabulary: [['Пока́', 'خداحافظ (دوستانه)'], ['Уви́димся', 'بعداً می‌بینمتان']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Приве́т! Как ты?', fa: 'سلام! حالت چطور است؟', pronunciation: 'پْری‌ویت! کاک تی؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Приве́т! Хорошо́, спаси́бо. Как тебя́ зову́т?', fa: 'سلام! خوبم، ممنون. اسمت چیست؟', pronunciation: 'پْری‌ویت! خاراشُو، سْپاسیبا. کاک تیبْیا زاووت؟' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Меня́ зову́т Ами́р. Я из Ира́на.', fa: 'اسم من امیر است. من اهل ایران هستم.', pronunciation: 'مینْیا زاووت امیر. یا ایز ایرانا.' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Меня́ зову́т Али́. О́чень прия́тно! Я немно́го говорю́ по-ру́сски.', fa: 'اسم من علی است. خیلی خوشوقتم! من کمی روسی صحبت می‌کنم.', pronunciation: 'مینْیا زاووت علی. اُچِن پْری‌یاتْنا! یا نیمْنُگا گاواریو پا-روسْکی.' },
    ],
    checks: [
      { promptFa: 'برای گفتن «سلام! روز بخیر!» کدام گزینه درست است؟', choices: ['Здра́вствуйте! До́брый день!', 'Приве́т! Как ты?', 'Хорошо́, спаси́бо. А у тебя́?', 'Как тебя́ зову́т?'], correctIndex: 0, explanationFa: '«Здра́вствуйте! До́брый день!» یعنی «سلام! روز بخیر!».' },
      { promptFa: 'برای گفتن «اسم من علی است. اهل ایران هستم.» کدام گزینه درست است؟', choices: ['Хорошо́, спаси́бо. А у тебя́?', 'Меня́ зову́т Али́. Я из Ира́на.', 'Я Ами́р. Я студе́нт.', 'О́чень прия́тно! Я немно́го говорю́ по-ру́сски.'], correctIndex: 1, explanationFa: '«Меня́ зову́т Али́. Я из Ира́на.» یعنی «اسم من علی است. اهل ایران هستم.».' },
      { promptFa: '«А у тебя́?» در پاسخ به احوال‌پرسی چه نقشی دارد؟', choices: ['خداحافظی می‌کند', 'سؤال را به طرف مقابل برمی‌گرداند («تو چطوری؟»)', 'اسم می‌پرسد', 'تشکر می‌کند'], correctIndex: 1, explanationFa: '«А у тебя́?» یعنی «و حالِ تو چطور است؟».' },
    ],
  },
  {
    id: 'ru-pre-25-conv-family-home',
    module: RUSSIAN_PRE_A1_MODULES[7],
    title: 'مکالمه: پدر، برادر و خانه',
    subtitle: 'توصیف خانه و معرفی اعضای مذکر خانواده',
    situation: 'صحبت دربارهٔ خانه، پدر، برادر، میزها و کلاس.',
    teachingFa: 'هدف: صحبت دربارهٔ خانه، پدر، برادر، میزها و کلاس.\nنکتهٔ تدریجی: برای یک نفر «живёт» و برای چند نفر «живу́т» می‌آید: «здесь живу́т мой па́па и брат». «Мой брат ма́ленький» یعنی برادرم کوچک است. «Три стола́» یعنی سه میز.',
    durationMinutes: 6,
    sentences: [
      { text: 'Э́то твой дом?', fa: 'این خانهٔ تو است؟', pronunciation: 'اِتا تْوُی دُم؟', vocabulary: [['твой', 'مالِ تو'], ['дом', 'خانه']] },
      { text: 'Да, здесь живу́т мой па́па и брат.', fa: 'بله، پدر و برادر من اینجا زندگی می‌کنند.', pronunciation: 'دا، زْدِس ژیووت مُی پاپا ای بْرات.', vocabulary: [['Да', 'بله'], ['Здесь', 'اینجا'], ['живу́т', 'زندگی می‌کنند'], ['Мой', 'مالِ من (مذکر)'], ['па́па', 'پدر'], ['и', 'و'], ['брат', 'برادر']] },
      { text: 'Наш дом большо́й и краси́вый.', fa: 'خانهٔ ما بزرگ و زیبا است.', pronunciation: 'ناش دُم بالْشُی ای کْراسیوی.', vocabulary: [['Наш', 'مالِ ما'], ['краси́вый', 'زیبا']] },
      { text: 'Здесь есть три стола́.', fa: 'اینجا سه میز هست.', pronunciation: 'زْدِس یِسْت تْری سْتالا.', vocabulary: [['Здесь', 'اینجا'], ['есть', 'هست'], ['Три', 'سه'], ['стола́', 'میز (صورت شمارشی)']] },
      { text: 'У меня́ есть па́па и брат.', fa: 'من پدر و برادر دارم.', pronunciation: 'او مینْیا یِسْت پاپا ای بْرات.', vocabulary: [['У меня́', 'نزد من است / دارم'], ['У меня́ есть', 'من دارم'], ['Меня́', 'مرا'], ['есть', 'هست'], ['па́па', 'پدر'], ['и', 'و'], ['брат', 'برادر']] },
      { text: 'Моего́ па́пу зову́т Ами́р.', fa: 'اسم پدر من امیر است.', pronunciation: 'ماییوُ پاپو زاووت امیر.', vocabulary: [['моего́', 'مال من (صورت وابسته به پدر)'], ['па́пу', 'پدر (مفعول)'], ['зову́т', 'صدا می‌زنند'], ['Ами́р', 'امیر']] },
      { text: 'Мой брат ещё ма́ленький.', fa: 'برادرم هنوز کوچک است.', pronunciation: 'مُی بْرات یِشْچُ مالِنْکی.', vocabulary: [['ещё', 'هنوز'], ['ма́ленький', 'کوچک']] },
      { text: 'Мой класс ти́хий и све́тлый.', fa: 'کلاس من آرام و روشن است.', pronunciation: 'مُی کْلاس تیخی ای سْویتْلی.', vocabulary: [['Мой', 'مالِ من (مذکر)'], ['класс', 'کلاس (مذکر)'], ['ти́хий', 'آرام (مذکر)'], ['и', 'و'], ['све́тлый', 'روشن (مذکر)']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то твой дом?', fa: 'این خانهٔ تو است؟', pronunciation: 'اِتا تْوُی دُم؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, э́то наш дом. Он большо́й и краси́вый.', fa: 'بله، این خانهٔ ما است. بزرگ و زیبا است.', pronunciation: 'دا، اِتا ناش دُم. اُن بالْشُی ای کْراسیوی.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'У тебя́ есть брат?', fa: 'آیا برادر داری؟', pronunciation: 'او تیبْیا یِسْت بْرات؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'У меня́ есть брат. Он ма́ленький.', fa: 'من یک برادر دارم. او کوچک است.', pronunciation: 'او مینْیا یِسْت بْرات. اُن مالِنْکی.' },
    ],
    checks: [
      { promptFa: 'برای گفتن «این خانهٔ تو است؟» کدام گزینه درست است؟', choices: ['Э́то твой дом?', 'Да, здесь живу́т мой па́па и брат.', 'Наш дом большо́й и краси́вый.', 'Здесь есть три стола́.'], correctIndex: 0, explanationFa: '«Э́то твой дом?» یعنی «این خانهٔ تو است؟».' },
      { promptFa: 'برای گفتن «من پدر و برادر دارم.» کدام گزینه درست است؟', choices: ['Наш дом большо́й и краси́вый.', 'У меня́ есть па́па и брат.', 'Моего́ па́пу зову́т Ами́р.', 'Мой брат ещё ма́ленький.'], correctIndex: 1, explanationFa: '«У меня́ есть па́па и брат.» یعنی «من پدر و برادر دارم.».' },
      { promptFa: 'برای گفتن «کلاس من آرام و روشن است.» کدام گزینه درست است؟', choices: ['Здесь есть три стола́.', 'Моего́ па́пу зову́т Ами́р.', 'Мой брат ещё ма́ленький.', 'Мой класс ти́хий и све́тлый.'], correctIndex: 3, explanationFa: '«Мой класс ти́хий и све́тлый.» یعنی «کلاس من آرام و روشن است.».' },
    ],
  },
  {
    id: 'ru-pre-26-conv-objects',
    module: RUSSIAN_PRE_A1_MODULES[7],
    title: 'مکالمه: اشیا، مکان و جهت',
    subtitle: 'متن، مداد، کوله‌پشتی و کلید',
    situation: 'پرسیدن مالک اشیای مذکر، جای تلفن و جهت رفتن به کلاس.',
    teachingFa: 'هدف: پرسیدن مالک اشیای مذکر، جای تلفن و جهت رفتن به کلاس.\nنکتهٔ تدریجی: «Чей» مالک اسم مذکر را می‌پرسد. «Где» جای فعلی و «куда́» مقصد را می‌پرسد. «В рюкзаке́» یعنی در کوله‌پشتی و «в класс» یعنی به کلاس.',
    durationMinutes: 6,
    sentences: [
      { text: 'Что э́то на столе́?', fa: 'آن روی میز چیست؟', pronunciation: 'شْتو اِتا نا سْتالِه؟', pattern: 'Что э́то + на + اسم (-е)?', vocabulary: [['на', 'رویِ'], ['столе́', 'میز (در جایگاه)']] },
      { text: 'Э́то мой но́вый текст.', fa: 'این متن نوی من است.', pronunciation: 'اِتا مُی نُوی تِکْست.', vocabulary: [['Э́то', 'این'], ['Мой', 'مالِ من (مذکر)'], ['Но́вый', 'نو (مذکر)'], ['текст', 'متن']] },
      { text: 'Чей э́то каранда́ш? Э́то каранда́ш Али́.', fa: 'این مداد مال کیست؟ این مداد علی است.', pronunciation: 'چِی اِتا کاراندَش؟ اِتا کاراندَش علی.', vocabulary: [['Чей', 'مالِ چه کسی (مذکر)'], ['Э́то', 'این'], ['каранда́ш', 'مداد'], ['Али́', 'علی']] },
      { text: 'Где мой телефо́н?', fa: 'گوشی من کجاست؟', pronunciation: 'گْدِه مُی تیلیفُن؟', vocabulary: [['Где', 'کجا'], ['телефо́н', 'گوشی']] },
      { text: 'Твой телефо́н здесь, в рюкзаке́.', fa: 'تلفن تو اینجا در کوله‌پشتی است.', pronunciation: 'تْوُی تیلیفُن زْدِس، فْ ریوکْزاکِه.', vocabulary: [['твой', 'مالِ تو (مذکر)'], ['Телефо́н', 'گوشی / تلفن (مذکر)'], ['Здесь', 'اینجا'], ['в', 'تویِ / در'], ['рюкзаке́', 'کوله‌پشتی (در کوله‌پشتی)']] },
      { text: 'Там, на столе́.', fa: 'آنجا، روی میز.', pronunciation: 'تام، نا سْتالِه.', pattern: 'Там + مکان', vocabulary: [['Там', 'آنجا'], ['на столе́', 'روی میز']] },
      { text: 'Куда́ ты идёшь? Туда́, в класс.', fa: 'کجا می‌روی؟ آنجا، به کلاس.', pronunciation: 'کودا تی ایدْیُش؟ تودا، ف کْلاس.', pattern: 'Куда́? ← Туда́', vocabulary: [['Куда́', 'به کجا'], ['идёшь', 'می‌روی'], ['Туда́', 'به آنجا'], ['класс', 'کلاس']] },
      { text: 'У тебя́ есть ключ? Да, вот мой ключ.', fa: 'آیا کلید داری؟ بله، این هم کلیدِ من است.', pronunciation: 'او تیبْیا یِسْت کْلیوچ؟ دا، وُت مُی کْلیوچ.', vocabulary: [['ключ', 'کلید'], ['вот', 'این هم / بفرما']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Чей э́то рюкза́к?', fa: 'این کوله‌پشتی مال کیست؟', pronunciation: 'چِی اِتا ریوکْزَک؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Э́то мой рюкза́к. Здесь мой текст и каранда́ш.', fa: 'این کوله‌پشتی من است. اینجا متن و مداد من است.', pronunciation: 'اِتا مُی ریوکْزَک. زْدِس مُی تِکْست ای کاراندَش.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Где твой ключ?', fa: 'کلید تو کجاست؟', pronunciation: 'گْدِه تْوُی کْلیوچ؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Там, на столе́! Вот мой ключ, спаси́бо!', fa: 'آنجا، روی میز! این هم کلیدِ من، ممنون!', pronunciation: 'تام، نا سْتالِه! وُت مُی کْلیوچ، سْپاسیبا!' },
    ],
    checks: [
      { promptFa: 'برای گفتن «آن روی میز چیست؟» کدام گزینه درست است؟', choices: ['Что э́то на столе́?', 'Э́то мой но́вый текст.', 'Чей э́то каранда́ш? Э́то каранда́ш Али́.', 'Где мой телефо́н?'], correctIndex: 0, explanationFa: '«Что э́то на столе́?» یعنی «آن روی میز چیست؟».' },
      { promptFa: 'برای گفتن «تلفن تو اینجا در کوله‌پشتی است.» کدام گزینه درست است؟', choices: ['Чей э́то каранда́ш? Э́то каранда́ш Али́.', 'Твой телефо́н здесь, в рюкзаке́.', 'Там, на столе́.', 'Куда́ ты идёшь? Туда́, в класс.'], correctIndex: 1, explanationFa: '«Твой телефо́н здесь, в рюкзаке́.» یعنی «تلفن تو اینجا در کوله‌پشتی است.».' },
      { promptFa: 'برای گفتن «آیا کلید داری؟ بله، این هم کلیدِ من است.» کدام گزینه درست است؟', choices: ['Где мой телефо́н?', 'Там, на столе́.', 'Куда́ ты идёшь? Туда́, в класс.', 'У тебя́ есть ключ? Да, вот мой ключ.'], correctIndex: 3, explanationFa: '«У тебя́ есть ключ? Да, вот мой ключ.» یعنی «آیا کلید داری؟ بله، این هم کلیدِ من است.».' },
    ],
  },
  {
    id: 'ru-pre-27-conv-food-shopping',
    module: RUSSIAN_PRE_A1_MODULES[7],
    title: 'مکالمه: غذا و خرید ساده',
    subtitle: 'سفارش خوراکی‌ها و نوشیدنی‌های مذکر',
    situation: 'سفارش نان، پنیر، قهوه با عسل و سوپ و پرسیدن قیمت.',
    teachingFa: 'هدف: سفارش نان، پنیر، قهوه با عسل و سوپ و پرسیدن قیمت.\nنکتهٔ تدریجی: برای سفارش مؤدبانه «Я хочу́ ... , пожа́луйста» بگو. «С мёдом» یعنی با عسل؛ «мёдом» شکل اسم مذکر «мёд» بعد از «с» است. «Два́дцать рубле́й» یعنی بیست روبل.',
    durationMinutes: 6,
    sentences: [
      { text: 'Что вы хоти́те?', fa: 'شما چه می‌خواهید؟', pronunciation: 'شْتو وی خاتیتِه؟', pattern: 'Что вы хоти́те?', vocabulary: [['вы', 'شما'], ['хоти́те', 'می‌خواهید']] },
      { text: 'Я хочу́ хлеб и сыр.', fa: 'من نان و پنیر می‌خواهم.', pronunciation: 'یا خاچو خْلِب ای سیر.', vocabulary: [['хлеб', 'نان'], ['сыр', 'پنیر']] },
      { text: 'Я хочу́ ко́фе с мёдом, пожа́луйста.', fa: 'لطفاً قهوه با عسل می‌خواهم.', pronunciation: 'یا خاچو کُفِه س میُدَم، پاژالُیْسْتا.', vocabulary: [['Я', 'من'], ['хочу́', 'می‌خواهم'], ['Ко́фе', 'قهوه (مذکر)'], ['с', 'با'], ['мёдом', 'عسل (بعد از с)'], ['Пожа́луйста', 'لطفاً / خواهش می‌کنم']] },
      { text: 'У вас есть све́жий хлеб?', fa: 'آیا نان تازه دارید؟', pronunciation: 'او واس یِسْت سْویژی خْلِب؟', vocabulary: [['У вас есть', 'شما دارید'], ['вас', 'شما را'], ['есть', 'هست'], ['све́жий', 'تازه (مذکر)'], ['Хлеб', 'نان (مذکر)']] },
      { text: 'Да, коне́чно. Вот хлеб.', fa: 'بله، حتماً. بفرمایید نان.', pronunciation: 'دا، کانیِشْنا. وُت خْلِب.', vocabulary: [['Да', 'بله'], ['коне́чно', 'حتماً / البته'], ['вот', 'این هم / بفرما'], ['Хлеб', 'نان (مذکر)']] },
      { text: 'Извини́те, ско́лько э́то сто́ит? Два́дцать рубле́й.', fa: 'ببخشید، این چقدر است؟ بیست روبل.', pronunciation: 'ایزْوینیتِه، سْکُلْکا اِتا سْتُیت؟ دْواتْسات روبْلِی.', pattern: 'Ско́лько э́то сто́ит? ← عدد + рубле́й', vocabulary: [['ско́лько', 'چقدر'], ['сто́ит', 'قیمت دارد'], ['рубле́й', 'روبل']] },
      { text: 'Я люблю́ вку́сный суп и чай.', fa: 'من سوپِ خوشمزه و چای دوست دارم.', pronunciation: 'یا لیوبْلیو فْکوسْنی سوپ ای چای.', vocabulary: [['вку́сный', 'خوشمزه'], ['суп', 'سوپ']] },
      { text: 'Возьми́те, пожа́луйста. Спаси́бо!', fa: 'بفرمایید بگیرید، لطفاً. متشکرم!', pronunciation: 'وازْمیتِه، پاژالُیْسْتا. سْپاسیبا!', vocabulary: [['Возьми́те', 'بفرمایید / بردارید'], ['Спаси́бо', 'متشکرم']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Здра́вствуйте! Что вы хоти́те?', fa: 'سلام! چه می‌خواهید؟', pronunciation: 'زْدْراسْت‌وُیْتِه! شْتو وی خاتیتِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Хлеб, сыр и ко́фе с мёдом, пожа́луйста.', fa: 'نان، پنیر و قهوه با عسل، لطفاً.', pronunciation: 'خْلِب، سیر ای کُفِه س میُدَم، پاژالُیْسْتا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Хорошо́. Вот хлеб, сыр и ко́фе.', fa: 'بسیار خوب. بفرمایید نان، پنیر و قهوه.', pronunciation: 'خاراشُو. وُت خْلِب، سیر ای کُفِه.' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Ско́лько э́то сто́ит? Спаси́бо!', fa: 'این چقدر است؟ ممنون!', pronunciation: 'سْکُلْکا اِتا سْتُیت؟ سْپاسیبا!' },
    ],
    checks: [
      { promptFa: 'برای گفتن «شما چه می‌خواهید؟» کدام گزینه درست است؟', choices: ['Что вы хоти́те?', 'Я хочу́ хлеб и сыр.', 'Я хочу́ ко́фе с мёдом, пожа́луйста.', 'У вас есть све́жий хлеб?'], correctIndex: 0, explanationFa: '«Что вы хоти́те?» یعنی «شما چه می‌خواهید؟».' },
      { promptFa: 'وقتی در مغازه می‌خواهید قیمت را بپرسید چه می‌گویید؟', choices: ['Возьми́те, пожа́луйста.', 'Извини́те, ско́лько э́то сто́ит?', 'Я люблю́ вку́сный суп.', 'Что вы хоти́те?'], correctIndex: 1, explanationFa: '«Извини́те, ско́лько э́то сто́ит?» یعنی «ببخشید، این چقدر قیمت دارد؟».' },
      { promptFa: 'برای گفتن «بفرمایید بگیرید، لطفاً. متشکرم!» کدام گزینه درست است؟', choices: ['У вас есть све́жий хлеб?', 'Извини́те, ско́лько э́то сто́ит? Два́дцать рубле́й.', 'Я люблю́ вку́сный суп и чай.', 'Возьми́те, пожа́луйста. Спаси́бо!'], correctIndex: 3, explanationFa: '«Возьми́те, пожа́луйста. Спаси́бо!» یعنی «بفرمایید بگیرید، لطفاً. متشکرم!».' },
    ],
  },
  {
    id: 'ru-pre-28-conv-classroom',
    module: RUSSIAN_PRE_A1_MODULES[7],
    title: 'مکالمه: گفت‌وگو در کلاس',
    subtitle: 'کتاب درسی، متن و مداد؛ همگی مذکر',
    situation: 'سلام به معلم، باز کردن کتاب درسی، خواندن متن و درخواست مداد و تکرار.',
    teachingFa: 'هدف: ارتباط ساده در کلاس با معلم و هم‌کلاسی‌ها با استفاده از تمام مهارت‌های Pre-A1.\nتلفظ: Откро́йте = «آتْکْرُیْتِه»؛ Повтори́те = «پافْتاریتِه»؛ Я понима́ю = «یا پانیمایو».\nنکتهٔ تدریجی: فعل‌های خواهشِ محترمانه در کلاس اغلب به «-те» ختم می‌شوند (`Откро́йте` = باز کنید، `Повтори́те` = تکرار کنید). با عبارت‌های «Я не понима́ю» و «Повтори́те, пожа́луйста» می‌توانید همیشه مکالمه را ادامه دهید.',
    durationMinutes: 6,
    sentences: [
      { text: 'До́брый день, учи́тель!', fa: 'روز بخیر، معلم!', pronunciation: 'دُبْری دِین، اوچیتِل!', vocabulary: [['До́брый', 'مهربان (مذکر)'], ['До́брый день', 'روز بخیر'], ['День', 'روز (مذکر)'], ['Учи́тель', 'معلم آقا (مذکر)']] },
      { text: 'Откро́йте уче́бник, пожа́луйста.', fa: 'لطفاً کتاب درسی را باز کنید.', pronunciation: 'آتْکْرُیْتِه اوچیِبْنیک، پاژالُیْسْتا.', vocabulary: [['Откро́йте', 'باز کنید'], ['уче́бник', 'کتاب درسی (مذکر)'], ['Пожа́луйста', 'لطفاً / خواهش می‌کنم']] },
      { text: 'Чита́ем и пи́шем текст.', fa: 'متن را می‌خوانیم و می‌نویسیم.', pronunciation: 'چیتایِم ای پیشِم تِکْست.', vocabulary: [['чита́ем', 'می‌خوانیم'], ['и', 'و'], ['пи́шем', 'می‌نویسیم'], ['текст', 'متن']] },
      { text: 'Я понима́ю. Я зна́ю э́тот текст.', fa: 'من می‌فهمم. من این متن را بلدم.', pronunciation: 'یا پانیمایو. یا زْنایو اِتَت تِکْست.', vocabulary: [['Я', 'من'], ['понима́ю', 'می‌فهمم'], ['зна́ю', 'می‌دانم'], ['э́тот', 'این (مذکر)'], ['текст', 'متن']] },
      { text: 'Извини́те, я не понима́ю. Я не зна́ю.', fa: 'ببخشید، نمی‌فهمم. من نمی‌دانم.', pronunciation: 'ایزْوینیتِه، یا نی پانیمایو. یا نی زْنایو.', vocabulary: [['Извини́те', 'ببخشید'], ['не понима́ю', 'نمی‌فهمم']] },
      { text: 'Повтори́те текст, пожа́луйста.', fa: 'لطفاً متن را تکرار کنید.', pronunciation: 'پافْتاریتِه تِکْست، پاژالُیْسْتا.', vocabulary: [['Повтори́те', 'تکرار کنید'], ['текст', 'متن'], ['Пожа́луйста', 'لطفاً / خواهش می‌کنم']] },
      { text: 'Мне ну́жен каранда́ш.', fa: 'مداد لازم دارم.', pronunciation: 'مْنِه نوژِن کاراندَش.', vocabulary: [['Мне', 'به من / برایم'], ['ну́жен', 'لازم است (مذکر)'], ['каранда́ш', 'مداد']] },
      { text: 'Хорошо́! Уро́к око́нчен. Пока́!', fa: 'خوب! درس تمام شد. خداحافظ!', pronunciation: 'خاراشُو! اورُک آکُنْچِن. پاکا!', vocabulary: [['Уро́к', 'درس'], ['око́нчен', 'تمام شد']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'До́брый день! У тебя́ есть уче́бник и каранда́ш?', fa: 'روز بخیر! آیا کتاب درسی و مداد داری؟', pronunciation: 'دُبْری دِین! او تیبْیا یِسْت اوچیِبْنیک ای کاراندَش؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, учи́тель. У меня́ есть уче́бник и каранда́ш.', fa: 'بله، معلم. من کتاب درسی و مداد دارم.', pronunciation: 'دا، اوچیتِل. او مینْیا یِسْت اوچیِبْنیک ای کاراندَش.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Чита́ем текст «Мой дом»!', fa: 'متن «خانهٔ من» را می‌خوانیم!', pronunciation: 'چیتایِم تِکْست «مُی دُم»!' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Извини́те, я не понима́ю. Повтори́те, пожа́луйста.', fa: 'ببخشید، متوجه نمی‌شوم. لطفاً تکرار کنید.', pronunciation: 'ایزْوینیتِه، یا نی پانیمایو. پافْتاریتِه، پاژالُیْسْتا.' },
    ],
    checks: [
      { promptFa: 'برای گفتن «روز بخیر، معلم!» کدام گزینه درست است؟', choices: ['До́брый день, учи́тель!', 'Откро́йте уче́бник, пожа́луйста.', 'Чита́ем и пи́шем текст.', 'Я понима́ю. Я зна́ю э́тот текст.'], correctIndex: 0, explanationFa: '«До́брый день, учи́тель!» یعنی «روز بخیر، معلم!».' },
      { promptFa: 'برای گفتن «ببخشید، نمی‌فهمم. من نمی‌دانم.» کدام گزینه درست است؟', choices: ['Чита́ем и пи́шем текст.', 'Извини́те, я не понима́ю. Я не зна́ю.', 'Повтори́те текст, пожа́луйста.', 'Мне ну́жен каранда́ш.'], correctIndex: 1, explanationFa: '«Извини́те, я не понима́ю. Я не зна́ю.» یعنی «ببخشید، نمی‌فهمم. من نمی‌دانم.».' },
      { promptFa: 'برای گفتن «خوب! درس تمام شد. خداحافظ!» کدام گزینه درست است؟', choices: ['Я понима́ю. Я зна́ю э́тот текст.', 'Повтори́те текст, пожа́луйста.', 'Мне ну́жен каранда́ш.', 'Хорошо́! Уро́к око́нчен. Пока́!'], correctIndex: 3, explanationFa: '«Хорошо́! Уро́к око́нчен. Пока́!» یعنی «خوب! درس تمام شد. خداحافظ!».' },
    ],
  },
];

const toSentence = (lessonId: string, input: PreSentenceInput, index: number): LearningSentence => ({
  id: `${lessonId}-${String(index + 1).padStart(2, '0')}`,
  text: input.text,
  fa: input.fa,
  pronunciation: input.pronunciation,
  ...(input.pattern ? { pattern: input.pattern } : {}),
  vocabulary: input.vocabulary.map(([word, meaning]) => ({ word, meaning })),
});

export const RUSSIAN_PRE_A1_LESSONS: readonly LearningLesson[] = PRE_A1_LESSON_DEFS.map(def => enrichRussianPreA1({
  id: def.id,
  title: def.title,
  situation: def.situation,
  teachingFa: def.teachingFa,
  durationMinutes: def.durationMinutes,
  sentences: def.sentences.map((s, i) => toSentence(def.id, s, i)),
  dialogue: def.dialogue.map(line => ({ ...line })),
  checks: orderChecks(def.checks.map(c => ({
    promptFa: c.promptFa,
    choices: [...c.choices],
    correctIndex: c.correctIndex,
    explanationFa: c.explanationFa,
  })), def.id),
}));

export const RUSSIAN_PRE_A1_SUBTITLES: Record<string, string> = Object.fromEntries(
  PRE_A1_LESSON_DEFS.map(def => [def.id, def.subtitle]),
);

const RUSSIAN_PRE_A1_MODULE_BY_LESSON: Record<string, string> = Object.fromEntries(
  PRE_A1_LESSON_DEFS.map(def => [def.id, def.module]),
);

export function russianPreA1ModuleForLesson(lessonId: string): string {
  const module = RUSSIAN_PRE_A1_MODULE_BY_LESSON[lessonId];
  if (!module) throw new Error(`Pre-A1 Russian lesson ${lessonId} has no curriculum module.`);
  return module;
}
