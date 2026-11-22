import { orderChecks } from './russianBeginner/checkOrder';
import type { LearningLesson, LearningSentence } from './types';

/**
 * سطح Pre-A1 روسی — طراحی‌شده از صفر مطلق (بدون هیچ پیش‌زمینهٔ قبلی):
 * ۲۸ درس تدریجی در ۸ بخشِ هماهنگ با ترتیب قطعی آموزشی:
 * ۱. کلمه (بخش ۱ و ۲) → ۲. عبارت و ترکیب (بخش ۳ و ۴) → ۳. جمله (بخش ۵)
 * → ۴. سؤال، پاسخ و بیان روزمره (بخش ۶ و ۷) → ۵. مکالمه‌های ابتدایی (بخش ۸).
 * دستور زبان به‌صورت تدریجی و در دل درس‌ها، بدون اصطلاحات پیچیدهٔ مقدماتی معرفی می‌شود.
 */

export const STARTER_CHECKS_REVISION = 'ru-pre-a1-zero-v2';

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
  // ══════════════════════════════════════════════════════════════════════════════
  // بخش ۱: اولین کلمات روسی (مرحلهٔ ۱: کلمه)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'ru-pre-01-hello',
    module: RUSSIAN_PRE_A1_MODULES[0],
    title: 'بله، خیر، سلام و خداحافظ',
    subtitle: 'نخستین واژه‌های ارتباطی و ادب',
    situation: 'شروع از صفر مطلق: گفتن بله و خیر، سلام و خداحافظی و تشکر و خواهش.',
    teachingFa: 'هدف: شناخت ۸ واژهٔ نخستین روسی بدون هیچ پیش‌زمینه‌ای.\nتلفظ: حرف «о» بدون تکیه در روسی شبیه «آ» یا «اَ» تلفظ می‌شود؛ پس Спаси́бо = «سْپاسیبا» و Пока́ = «پاکا».\nنکتهٔ تدریجی: در روسی لحن دوستانه (Приве́т / Пока́) با لحن محترمانه (Здра́вствуйте / До свида́ния) متفاوت است، اما Пожа́луйста هم به معنی «لطفاً» و هم به معنی «خواهش می‌کنم» به کار می‌رود.',
    durationMinutes: 5,
    sentences: [
      { text: 'Да.', fa: 'بله.', pronunciation: 'دا.', vocabulary: [['Да', 'بله']] },
      { text: 'Нет.', fa: 'نه / خیر.', pronunciation: 'نِت.', vocabulary: [['Нет', 'نه / خیر']] },
      { text: 'Приве́т.', fa: 'سلام. (دوستانه)', pronunciation: 'پْری‌ویت.', vocabulary: [['Приве́т', 'سلام (دوستانه)']] },
      { text: 'Здра́вствуйте.', fa: 'سلام. (محترمانه)', pronunciation: 'زْدْراسْت‌وُیْتِه.', vocabulary: [['Здра́вствуйте', 'سلام (محترمانه)']] },
      { text: 'Пока́.', fa: 'خداحافظ. (دوستانه)', pronunciation: 'پاکا.', vocabulary: [['Пока́', 'خداحافظ (دوستانه)']] },
      { text: 'До свида́ния.', fa: 'خداحافظ. (محترمانه)', pronunciation: 'دا سْویدانیا.', vocabulary: [['До свида́ния', 'خداحافظ (محترمانه)']] },
      { text: 'Спаси́бо.', fa: 'ممنون / متشکرم.', pronunciation: 'سْپاسیبا.', vocabulary: [['Спаси́бо', 'ممنون / متشکرم']] },
      { text: 'Пожа́луйста.', fa: 'لطفاً / خواهش می‌کنم.', pronunciation: 'پاژالُیْسْتا.', vocabulary: [['Пожа́луйста', 'لطفاً / خواهش می‌کنم']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Приве́т!', fa: 'سلام!', pronunciation: 'پْری‌ویت!' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Приве́т! Спаси́бо.', fa: 'سلام! ممنون.', pronunciation: 'پْری‌ویت! سْپاسیبا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Пожа́луйста.', fa: 'خواهش می‌کنم.', pronunciation: 'پاژالُیْسْتا.' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Пока́!', fa: 'خداحافظ!', pronunciation: 'پاکا!' },
    ],
    checks: [
      { promptFa: 'برای سلام محترمانه کدام واژه به کار می‌رود؟', choices: ['Здра́вствуйте.', 'Приве́т.', 'Пока́.', 'Нет.'], correctIndex: 0, explanationFa: '«Здра́вствуйте» سلام رسمی و محترمانه در روسی است.' },
      { promptFa: 'واژهٔ «Спаси́бо.» یعنی چه؟', choices: ['خداحافظ.', 'بله.', 'ممنون.', 'لطفاً.'], correctIndex: 2, explanationFa: '«Спаси́бо» یعنی «ممنون / متشکرم».' },
      { promptFa: 'برای خداحافظی دوستانه چه می‌گوییم؟', choices: ['Да.', 'Пока́.', 'Приве́т.', 'Пожа́луйста.'], correctIndex: 1, explanationFa: '«Пока́» خداحافظی دوستانه و خودمانی است.' },
    ],
  },
  {
    id: 'ru-pre-02-i-you-this-that',
    module: RUSSIAN_PRE_A1_MODULES[0],
    title: 'من، تو، این و آن',
    subtitle: 'اشاره و دو واژهٔ ربط پایه',
    situation: 'شناخت ضمیرهای «من» و «تو»، اشاره به «این» و «آن» و وصل کردن دو واژه با «و / یا».',
    teachingFa: 'هدف: یادگیری واژه‌های «من»، «تو»، «این»، «آن» و دو حرف ربط «و» و «یا».\nتلفظ: Я = «یا»؛ Ты = «تی»؛ Э́то = «اِتا».\nنکتهٔ تدریجی: در روسی برای اشارهٔ کلی به چیزهای نزدیک «Э́то» (این) و برای دور «То» (آن) می‌گوییم. «и» یعنی «و» و «и́ли» یعنی «یا».',
    durationMinutes: 5,
    sentences: [
      { text: 'Я.', fa: 'من.', pronunciation: 'یا.', vocabulary: [['Я', 'من']] },
      { text: 'Ты.', fa: 'تو.', pronunciation: 'تی.', vocabulary: [['Ты', 'تو']] },
      { text: 'Э́то.', fa: 'این.', pronunciation: 'اِتا.', vocabulary: [['Э́то', 'این']] },
      { text: 'То.', fa: 'آن.', pronunciation: 'تا.', vocabulary: [['То', 'آن']] },
      { text: 'И.', fa: 'و.', pronunciation: 'ای.', vocabulary: [['И', 'و']] },
      { text: 'И́ли.', fa: 'یا.', pronunciation: 'ایلی.', vocabulary: [['И́ли', 'یا']] },
      { text: 'Я и ты.', fa: 'من و تو.', pronunciation: 'یا ای تی.', pattern: 'واژه + и + واژه', vocabulary: [['Я', 'من'], ['и', 'و'], ['ты', 'تو']] },
      { text: 'Э́то и́ли то?', fa: 'این یا آن؟', pronunciation: 'اِتا ایلی تا؟', pattern: 'واژه + и́ли + واژه؟', vocabulary: [['Э́то', 'این'], ['и́ли', 'یا'], ['то', 'آن']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Приве́т! Э́то и́ли то?', fa: 'سلام! این یا آن؟', pronunciation: 'پْری‌ویت! اِتا ایلی تا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Приве́т! Э́то, пожа́луйста.', fa: 'سلام! این، لطفاً.', pronunciation: 'پْری‌ویت! اِتا، پاژالُیْسْتا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Да?', fa: 'بله؟', pronunciation: 'دا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, спаси́бо!', fa: 'بله، ممنون!', pronunciation: 'دا، سْپاسیبا!' },
    ],
    checks: [
      { promptFa: '«من و تو» به روسی کدام است؟', choices: ['Ты и́ли я.', 'Я и ты.', 'Э́то и то.', 'Да и нет.'], correctIndex: 1, explanationFa: '«Я» یعنی من، «и» یعنی و، «ты» یعنی تو.' },
      { promptFa: 'واژهٔ «То» چه معنی دارد؟', choices: ['این', 'تو', 'من', 'آن'], correctIndex: 3, explanationFa: '«Э́то» یعنی «این» و «То» یعنی «آن».' },
      { promptFa: 'برای پرسیدن «این یا آن؟» کدام را می‌گوییم؟', choices: ['Э́то и́ли то?', 'Я и́ли ты?', 'Да и́ли нет?', 'Э́то и то.'], correctIndex: 0, explanationFa: '«и́ли» به معنی «یا» دو گزینه را کنار هم می‌آورد.' },
    ],
  },
  {
    id: 'ru-pre-03-family-home',
    module: RUSSIAN_PRE_A1_MODULES[0],
    title: 'مادر، پدر، خانه و اتاق',
    subtitle: 'نخستین واژه‌های خانواده و محیط خانه',
    situation: 'یادگیری واژه‌های مادر و پدر، خانه و اتاق، همراه با میز و پنجره.',
    teachingFa: 'هدف: گفتن و شنیدن نام نزدیک‌ترین اعضای خانواده و بخش‌های خانه.\nتلفظ: Ко́мната = «کُمناتا»؛ Окно́ = «آکنُو».\nنکتهٔ تدریجی: از همین درس به حرف آخر کلمه‌ها دقت کنید: واژه‌هایی که به «а» ختم می‌شوند معمولاً مؤنث‌اند (`ма́ма`, `ко́мната`)؛ واژه‌هایی که به همخوان ختم می‌شوند معمولاً مذکرند (`дом`, `стол` — و `па́па` به‌خاطر معنی پدر مذکر است)؛ واژه‌های خنثی اغلب به «о» ختم می‌شوند (`окно́`).',
    durationMinutes: 5,
    sentences: [
      { text: 'Ма́ма.', fa: 'مادر.', pronunciation: 'ماما.', vocabulary: [['Ма́ма', 'مادر']] },
      { text: 'Па́па.', fa: 'پدر.', pronunciation: 'پاپا.', vocabulary: [['Па́па', 'پدر']] },
      { text: 'Ма́ма и па́па.', fa: 'مادر و پدر.', pronunciation: 'ماما ای پاپا.', pattern: 'واژه + и + واژه', vocabulary: [['Ма́ма', 'مادر'], ['па́па', 'پدر']] },
      { text: 'Дом.', fa: 'خانه.', pronunciation: 'دُم.', vocabulary: [['Дом', 'خانه']] },
      { text: 'Ко́мната.', fa: 'اتاق.', pronunciation: 'کُمناتا.', vocabulary: [['Ко́мната', 'اتاق']] },
      { text: 'Дом и ко́мната.', fa: 'خانه و اتاق.', pronunciation: 'دُم ای کُمناتا.', pattern: 'واژه + и + واژه', vocabulary: [['Дом', 'خانه'], ['ко́мната', 'اتاق']] },
      { text: 'Стол.', fa: 'میز.', pronunciation: 'سْتُل.', vocabulary: [['Стол', 'میز']] },
      { text: 'Окно́.', fa: 'پنجره.', pronunciation: 'آکنُو.', vocabulary: [['Окно́', 'پنجره']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то дом?', fa: 'این خانه است؟', pronunciation: 'اِتا دُم؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, э́то дом.', fa: 'بله، این خانه است.', pronunciation: 'دا، اِتا دُم.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Ма́ма и па́па?', fa: 'مادر و پدر؟', pronunciation: 'ماما ای پاپا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, ма́ма и па́па.', fa: 'بله، مادر و پدر.', pronunciation: 'دا، ماما ای پاپا.' },
    ],
    checks: [
      { promptFa: 'واژهٔ «Ко́мната» به چه معنی است؟', choices: ['پنجره', 'میز', 'اتاق', 'خانه'], correctIndex: 2, explanationFa: '«Ко́мната» یعنی «اتاق».' },
      { promptFa: '«مادر و پدر» به روسی کدام است؟', choices: ['Дом и стол.', 'Ма́ма и па́па.', 'Стол и окно́.', 'Я и ты.'], correctIndex: 1, explanationFa: '«Ма́ма и па́па» یعنی «مادر و پدر».' },
      { promptFa: 'کدام واژه به معنی «پنجره» است؟', choices: ['Окно́.', 'Дом.', 'Стол.', 'Па́па.'], correctIndex: 0, explanationFa: '«Окно́» به معنی «پنجره» است.' },
    ],
  },
  {
    id: 'ru-pre-04-food-study-daily',
    module: RUSSIAN_PRE_A1_MODULES[0],
    title: 'آب، نان، کتاب، قلم و کلمات روزمره',
    subtitle: 'واژه‌های ضروری خوراک، نوشت‌افزار و زمان روز',
    situation: 'آشنایی با نخستین واژه‌های خوراکی، کتاب و قلم، و چند واژهٔ سادهٔ روزمره.',
    teachingFa: 'هدف: یادگیری ۸ واژهٔ روزمره: آب، نان، کتاب، قلم، روز، شب، نام، کلمه.\nتلفظ: Хлеб = «خْلِب»؛ Ру́чка = «روچْکا»؛ Ночь = «نُچ».\nنکتهٔ تدریجی: در روسی حرف تعریف («یک» یا «آن/The») وجود ندارد؛ بنابراین «вода́» به تنهایی هم «آب» و هم «یک آب» معنی می‌دهد.',
    durationMinutes: 5,
    sentences: [
      { text: 'Вода́.', fa: 'آب.', pronunciation: 'وادا.', vocabulary: [['Вода́', 'آب']] },
      { text: 'Хлеб.', fa: 'نان.', pronunciation: 'خْلِب.', vocabulary: [['Хлеб', 'نان']] },
      { text: 'Вода́ и хлеб.', fa: 'آب و نان.', pronunciation: 'وادا ای خْلِب.', pattern: 'واژه + и + واژه', vocabulary: [['Вода́', 'آب'], ['хлеб', 'نان']] },
      { text: 'Кни́га.', fa: 'کتاب.', pronunciation: 'کْنیگا.', vocabulary: [['Кни́га', 'کتاب']] },
      { text: 'Ру́чка.', fa: 'قلم / خودکار.', pronunciation: 'روچْکا.', vocabulary: [['Ру́чка', 'قلم / خودکار']] },
      { text: 'Кни́га и ру́чка.', fa: 'کتاب و قلم.', pronunciation: 'کْنیگا ای روچْکا.', pattern: 'واژه + и + واژه', vocabulary: [['Кни́га', 'کتاب'], ['ру́чка', 'قلم']] },
      { text: 'День и ночь.', fa: 'روز و شب.', pronunciation: 'دِن ای نُچ.', pattern: 'واژه + и + واژه', vocabulary: [['День', 'روز'], ['ночь', 'شب']] },
      { text: 'И́мя и сло́во.', fa: 'نام و کلمه.', pronunciation: 'ایمیا ای سْلُوا.', pattern: 'واژه + и + واژه', vocabulary: [['И́мя', 'نام / اسم'], ['сло́во', 'کلمه']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Вода́ и́ли хлеб?', fa: 'آب یا نان؟', pronunciation: 'وادا ایلی خْلِب؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Вода́, пожа́луйста.', fa: 'آب، لطفاً.', pronunciation: 'وادا، پاژالُیْسْتا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Кни́га и́ли ру́чка?', fa: 'کتاب یا قلم؟', pronunciation: 'کْنیگا ایلی روچْکا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Кни́га и ру́чка, спаси́бо!', fa: 'کتاب و قلم، ممنون!', pronunciation: 'کْنیگا ای روچْکا، سْپاسیبا!' },
    ],
    checks: [
      { promptFa: '«کتاب و قلم» به روسی کدام است؟', choices: ['Вода́ и хлеб.', 'День и ночь.', 'Кни́га и ру́чка.', 'Дом и окно́.'], correctIndex: 2, explanationFa: '«Кни́га» یعنی کتاب و «ру́чка» یعنی قلم / خودکار.' },
      { promptFa: 'واژهٔ «Хлеб» چه معنی دارد؟', choices: ['آب', 'شب', 'نام', 'نان'], correctIndex: 3, explanationFa: '«Хлеб» یعنی «نان».' },
      { promptFa: 'کدام جفت به معنی «روز و شب» است؟', choices: ['День и ночь.', 'И́мя и сло́во.', 'Я и ты.', 'Ма́ма и па́па.'], correctIndex: 0, explanationFa: '«День» یعنی روز و «ночь» یعنی شب.' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // بخش ۲: کلمات پایه (مرحلهٔ ۱: کلمه — گسترش واژگان پایه)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'ru-pre-05-pronouns-family',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'ضمایر شخصی و اعضای خانواده',
    subtitle: 'او، ما، شما، آن‌ها و اعضای نزدیک خانواده',
    situation: 'یادگیری بقیهٔ ضمایر شخصی (در ادامهٔ «من» و «تو») و نام اعضای خانواده.',
    teachingFa: 'هدف: کامل کردن ضمیرهای شخصی (Он, Она́, Мы, Вы, Они́) و نام اعضای خانواده.\nتلفظ: Она́ = «آنا»؛ Семья́ = «سیمْیا».\nنکتهٔ تدریجی: در روسی برای «او»ی مرد از «он» و برای «او»ی زن از «она́» استفاده می‌کنیم. همچنین «ты» (تو) برای دوستان و خانواده است، ولی «вы» (شما) هم برای احترام به یک نفر و هم برای جمع به کار می‌رود.',
    durationMinutes: 5,
    sentences: [
      { text: 'Он.', fa: 'او. (مرد / مذکر)', pronunciation: 'اُن.', vocabulary: [['Он', 'او (مرد)']] },
      { text: 'Она́.', fa: 'او. (زن / مؤنث)', pronunciation: 'آنا.', vocabulary: [['Она́', 'او (زن)']] },
      { text: 'Мы.', fa: 'ما.', pronunciation: 'می.', vocabulary: [['Мы', 'ما']] },
      { text: 'Вы.', fa: 'شما.', pronunciation: 'وی.', vocabulary: [['Вы', 'شما']] },
      { text: 'Они́.', fa: 'آن‌ها.', pronunciation: 'آنی.', vocabulary: [['Они́', 'آن‌ها']] },
      { text: 'Семья́.', fa: 'خانواده.', pronunciation: 'سیمْیا.', vocabulary: [['Семья́', 'خانواده']] },
      { text: 'Брат.', fa: 'برادر.', pronunciation: 'بْرات.', vocabulary: [['Брат', 'برادر']] },
      { text: 'Сестра́.', fa: 'خواهر.', pronunciation: 'سیسْتْرا.', vocabulary: [['Сестра́', 'خواهر']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то брат?', fa: 'این برادر است؟', pronunciation: 'اِتا بْرات؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, он брат.', fa: 'بله، او برادر است.', pronunciation: 'دا، اُن بْرات.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Она́ сестра́?', fa: 'او خواهر است؟', pronunciation: 'آنا سیسْتْرا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, она́ сестра́. Мы семья́.', fa: 'بله، او خواهر است. ما خانواده هستیم.', pronunciation: 'دا، آنا سیسْتْرا. می سیمْیا.' },
    ],
    checks: [
      { promptFa: 'برای اشاره به «او» (زن) کدام ضمیر به کار می‌رود؟', choices: ['Он.', 'Она́.', 'Они́.', 'Мы.'], correctIndex: 1, explanationFa: '«Она́» یعنی «او (زن)» و «Он» یعنی «او (مرد)».' },
      { promptFa: 'واژهٔ «Семья́» یعنی چه؟', choices: ['برادر', 'خواهر', 'شما', 'خانواده'], correctIndex: 3, explanationFa: '«Семья́» به معنی «خانواده» است.' },
      { promptFa: 'کدام ضمیر به معنی «آن‌ها» است؟', choices: ['Мы.', 'Вы.', 'Они́.', 'Ты.'], correctIndex: 2, explanationFa: '«Они́» یعنی «آن‌ها».' },
    ],
  },
  {
    id: 'ru-pre-06-people-objects',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'افراد و اشیای ساده',
    subtitle: 'آدم‌های اطراف و وسایل پرکاربرد',
    situation: 'یادگیری نام افراد (شخص، دوست، معلم، دانشجو) و اشیای ساده (صندلی، کلید، گوشی، کیف).',
    teachingFa: 'هدف: شناخت ۸ واژهٔ کلیدی برای افراد و وسایل روزمره.\nتلفظ: Челове́к = «چیلاوِک»؛ Учи́тель = «اوچیتِل».\nنکتهٔ تدریجی: از روی حرف آخر اسم‌ها دوباره جنس آن‌ها را حدس بزنید: «су́мка» (کیف) با «-а» مؤنث است؛ اما «друг, учи́тель, студе́нт, стул, ключ, телефо́н» مذکر هستند.',
    durationMinutes: 5,
    sentences: [
      { text: 'Челове́к.', fa: 'انسان / شخص.', pronunciation: 'چیلاوِک.', vocabulary: [['Челове́к', 'انسان / شخص']] },
      { text: 'Друг.', fa: 'دوست.', pronunciation: 'دْروک.', vocabulary: [['Друг', 'دوست']] },
      { text: 'Учи́тель.', fa: 'معلم.', pronunciation: 'اوچیتِل.', vocabulary: [['Учи́тель', 'معلم']] },
      { text: 'Студе́нт.', fa: 'دانشجو / دانش‌آموز.', pronunciation: 'سْتودِنْت.', vocabulary: [['Студе́нт', 'دانشجو']] },
      { text: 'Стул.', fa: 'صندلی.', pronunciation: 'سْتول.', vocabulary: [['Стул', 'صندلی']] },
      { text: 'Ключ.', fa: 'کلید.', pronunciation: 'کْلیوچ.', vocabulary: [['Ключ', 'کلید']] },
      { text: 'Телефо́н.', fa: 'گوشی / تلفن.', pronunciation: 'تیلیفُن.', vocabulary: [['Телефо́н', 'گوشی / تلفن']] },
      { text: 'Су́мка.', fa: 'کیف.', pronunciation: 'سومْکا.', vocabulary: [['Су́мка', 'کیف']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то друг?', fa: 'این دوست است؟', pronunciation: 'اِتا دْروک؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, он друг. Он студе́нт.', fa: 'بله، او دوست است. او دانشجو است.', pronunciation: 'دا، اُن دْروک. اُن سْتودِنْت.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то ключ и́ли телефо́н?', fa: 'این کلید است یا گوشی؟', pronunciation: 'اِتا کْلیوچ ایلی تیلیفُن؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Э́то ключ и су́мка.', fa: 'این کلید و کیف است.', pronunciation: 'اِتا کْلیوچ ای سومْکا.' },
    ],
    checks: [
      { promptFa: '«Учи́тель» یعنی چه؟', choices: ['معلم', 'دوست', 'دانشجو', 'شخص'], correctIndex: 0, explanationFa: '«Учи́тель» یعنی «معلم».' },
      { promptFa: 'کدام واژه به معنی «کلید» است؟', choices: ['Стул.', 'Ключ.', 'Су́мка.', 'Стол.'], correctIndex: 1, explanationFa: '«Ключ» یعنی «کلید».' },
      { promptFa: 'واژهٔ «Су́мка» یعنی چه؟', choices: ['گوشی', 'صندلی', 'کتاب', 'کیف'], correctIndex: 3, explanationFa: '«Су́мка» یعنی «کیف».' },
    ],
  },
  {
    id: 'ru-pre-07-food-drinks',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'خوراکی‌ها و نوشیدنی‌ها',
    subtitle: 'غذاهای ساده و نوشیدنی‌های روزانه',
    situation: 'یادگیری نام ۴ خوراکی و ۴ نوشیدنی پایه (در ادامهٔ «آب» و «نان» از بخش ۱).',
    teachingFa: 'هدف: شناخت نام خوراکی‌ها و نوشیدنی‌های پایه.\nتلفظ: Я́блоко = «یابْلاکا»؛ Молоко́ = «مالاکُو».\nنکتهٔ تدریجی: واژه‌هایی مثل «я́блоко» و «молоко́» چون به «о» ختم می‌شوند خنثی هستند. واژهٔ «ко́фе» یک استثنای پرکاربرد و معمولاً مذکر است.',
    durationMinutes: 5,
    sentences: [
      { text: 'Суп.', fa: 'سوپ.', pronunciation: 'سوپ.', vocabulary: [['Суп', 'سوپ']] },
      { text: 'Сыр.', fa: 'پنیر.', pronunciation: 'سیر.', vocabulary: [['Сыр', 'پنیر']] },
      { text: 'Я́блоко.', fa: 'سیب.', pronunciation: 'یابْلاکا.', vocabulary: [['Я́блоко', 'سیب']] },
      { text: 'Са́хар.', fa: 'شکر.', pronunciation: 'ساخار.', vocabulary: [['Са́хар', 'شکر']] },
      { text: 'Чай.', fa: 'چای.', pronunciation: 'چای.', vocabulary: [['Чай', 'چای']] },
      { text: 'Ко́фе.', fa: 'قهوه.', pronunciation: 'کُفِه.', vocabulary: [['Ко́фе', 'قهوه']] },
      { text: 'Молоко́.', fa: 'شیر.', pronunciation: 'مالاکُو.', vocabulary: [['Молоко́', 'شیر']] },
      { text: 'Сок.', fa: 'آب‌میوه.', pronunciation: 'سُک.', vocabulary: [['Сок', 'آب‌میوه']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Чай и́ли ко́фе?', fa: 'چای یا قهوه؟', pronunciation: 'چای ایلی کُفِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Ко́фе и молоко́, пожа́луйста.', fa: 'قهوه و شیر، لطفاً.', pronunciation: 'کُفِه ای مالاکُو، پاژالُیْسْتا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Сыр и́ли я́блоко?', fa: 'پنیر یا سیب؟', pronunciation: 'سیر ایلی یابْلاکا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Сыр и хлеб, спаси́бо!', fa: 'پنیر و نان، ممنون!', pronunciation: 'سیر ای خْلِب، سْپاسیبا!' },
    ],
    checks: [
      { promptFa: '«Молоко́» یعنی چه؟', choices: ['شکر', 'شیر', 'آب‌میوه', 'پنیر'], correctIndex: 1, explanationFa: '«Молоко́» یعنی «شیر».' },
      { promptFa: 'کدام واژه به معنی «آب‌میوه» است؟', choices: ['Сок.', 'Суп.', 'Сыр.', 'Чай.'], correctIndex: 0, explanationFa: '«Сок» یعنی «آب‌میوه».' },
      { promptFa: '«Я́блоко» به چه معنی است؟', choices: ['شکر', 'قهوه', 'سوپ', 'سیب'], correctIndex: 3, explanationFa: '«Я́блоко» یعنی «سیب».' },
    ],
  },
  {
    id: 'ru-pre-08-animals-colors',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'حیوانات و رنگ‌ها',
    subtitle: 'نام ۴ حیوان و ۴ رنگ اصلی',
    situation: 'آشنایی با نام حیوانات ساده و رنگ‌های پرکاربرد.',
    teachingFa: 'هدف: یادگیری ۴ نام حیوان (گربه، سگ، پرنده، ماهی) و ۴ رنگ (سفید، سیاه، قرمز، سبز).\nتلفظ: Соба́ка = «ساباکا»؛ Зелёный = «زیلیُنی».\nنکتهٔ تدریجی: رنگ‌ها نوعی صفت هستند و شکل پایهٔ آن‌ها در فرهنگ لغت همیشه شکل مذکر است (مثل «бе́лый» با پایانهٔ -ый). در بخش ۴ یاد می‌گیرید چطور با اسم مؤنث هماهنگ شوند.',
    durationMinutes: 5,
    sentences: [
      { text: 'Кот.', fa: 'گربه.', pronunciation: 'کُت.', vocabulary: [['Кот', 'گربه']] },
      { text: 'Соба́ка.', fa: 'سگ.', pronunciation: 'ساباکا.', vocabulary: [['Соба́ка', 'سگ']] },
      { text: 'Пти́ца.', fa: 'پرنده.', pronunciation: 'پْتیتْسا.', vocabulary: [['Пти́ца', 'پرنده']] },
      { text: 'Ры́ба.', fa: 'ماهی.', pronunciation: 'ریبا.', vocabulary: [['Ры́ба', 'ماهی']] },
      { text: 'Бе́лый.', fa: 'سفید.', pronunciation: 'بِلی.', vocabulary: [['Бе́лый', 'سفید']] },
      { text: 'Чёрный.', fa: 'سیاه / مشکی.', pronunciation: 'چُرْنی.', vocabulary: [['Чёрный', 'سیاه']] },
      { text: 'Кра́сный.', fa: 'قرمز.', pronunciation: 'کْراسْنی.', vocabulary: [['Кра́сный', 'قرمز']] },
      { text: 'Зелёный.', fa: 'سبز.', pronunciation: 'زیلیُنی.', vocabulary: [['Зелёный', 'سبز']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то кот и́ли соба́ка?', fa: 'این گربه است یا سگ؟', pronunciation: 'اِتا کُت ایلی ساباکا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Э́то кот.', fa: 'این گربه است.', pronunciation: 'اِتا کُت.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Бе́лый и́ли чёрный?', fa: 'سفید یا سیاه؟', pronunciation: 'بِلی ایلی چُرْنی؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Чёрный кот.', fa: 'گربهٔ سیاه.', pronunciation: 'چُرْنی کُت.' },
    ],
    checks: [
      { promptFa: '«Соба́ка» یعنی چه؟', choices: ['گربه', 'پرنده', 'سگ', 'ماهی'], correctIndex: 2, explanationFa: '«Соба́ка» یعنی «سگ».' },
      { promptFa: 'کدام رنگ یعنی «قرمز»؟', choices: ['Кра́сный.', 'Бе́лый.', 'Чёрный.', 'Зелёный.'], correctIndex: 0, explanationFa: '«Кра́сный» یعنی «قرمز».' },
      { promptFa: '«Зелёный» کدام رنگ است؟', choices: ['سفید', 'سیاه', 'قرمز', 'سبز'], correctIndex: 3, explanationFa: '«Зелёный» یعنی «سبز».' },
    ],
  },
  {
    id: 'ru-pre-09-numbers',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'اعداد پایه',
    subtitle: 'شمارش از صفر تا ده و عدد بیست',
    situation: 'یادگیری اعداد ۰ تا ۱۰ و عدد ۲۰ برای شمارش و سن و خرید.',
    teachingFa: 'هدف: تلفظ درست و روان عددهای صفر تا ده و عدد بیست.\nتلفظ: Оди́н = «ادین»؛ Четы́ре = «چیتی‌رِه»؛ Пять = «پیات».\nنکتهٔ تدریجی: عددهای پایه در شمارش ثابت‌اند؛ در بخش ۷ می‌بینید با عدد ۵ تا ۲۰ برای گفتن سن از واژهٔ «лет» (سال) استفاده می‌شود.',
    durationMinutes: 5,
    sentences: [
      { text: 'Ноль.', fa: 'صفر.', pronunciation: 'نُل.', vocabulary: [['Ноль', 'صفر']] },
      { text: 'Оди́н, два.', fa: 'یک، دو.', pronunciation: 'ادین، دْوا.', vocabulary: [['Оди́н', 'یک'], ['два', 'دو']] },
      { text: 'Три, четы́ре.', fa: 'سه، چهار.', pronunciation: 'تْری، چیتی‌رِه.', vocabulary: [['Три', 'سه'], ['четы́ре', 'چهار']] },
      { text: 'Пять, шесть.', fa: 'پنج، شش.', pronunciation: 'پیات، شِسْت.', vocabulary: [['Пять', 'پنج'], ['шесть', 'شش']] },
      { text: 'Семь, во́семь.', fa: 'هفت، هشت.', pronunciation: 'سِم، وُسیم.', vocabulary: [['Семь', 'هفت'], ['во́семь', 'هشت']] },
      { text: 'Де́вять, де́сять.', fa: 'نه، ده.', pronunciation: 'دِویت، دِسیت.', vocabulary: [['Де́вять', 'نه'], ['де́сять', 'ده']] },
      { text: 'Два́дцать.', fa: 'بیست.', pronunciation: 'دْواتْسات.', vocabulary: [['Два́дцать', 'بیست']] },
      { text: 'Оди́н, пять, де́сять.', fa: 'یک، پنج، ده.', pronunciation: 'ادین، پیات، دِسیت.', pattern: 'عدد، عدد، عدد', vocabulary: [['Оди́н', 'یک'], ['пять', 'پنج'], ['де́сять', 'ده']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Оди́н, два, три.', fa: 'یک، دو، سه.', pronunciation: 'ادین، دْوا، تْری.' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Четы́ре, пять, шесть.', fa: 'چهار، پنج، شش.', pronunciation: 'چیتی‌رِه، پیات، شِسْت.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Семь, во́семь.', fa: 'هفت، هشت.', pronunciation: 'سِم، وُسیم.' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Де́вять, де́сять!', fa: 'نه، ده!', pronunciation: 'دِویت، دِسیت!' },
    ],
    checks: [
      { promptFa: 'عدد «пять» کدام است؟', choices: ['سه', 'پنج', 'هفت', 'ده'], correctIndex: 1, explanationFa: '«пять» عدد ۵ است.' },
      { promptFa: '«هفت، هشت» به روسی کدام است؟', choices: ['Три, четы́ре.', 'Де́вять, де́сять.', 'Семь, во́семь.', 'Оди́н, два.'], correctIndex: 2, explanationFa: '«Семь» (۷) و «во́семь» (۸).' },
      { promptFa: 'عدد «два́дцать» چند است؟', choices: ['بیست', 'ده', 'دوازده', 'صفر'], correctIndex: 0, explanationFa: '«Два́дцать» یعنی ۲۰.' },
    ],
  },
  {
    id: 'ru-pre-10-days-places',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'روزهای هفته و مکان‌های ساده',
    subtitle: 'هفت روز هفته و مکان‌های آشنای شهر',
    situation: 'شناخت نام روزهای هفته و مکان‌های ساده‌ای مثل مدرسه، فروشگاه، کافه، خیابان و شهر.',
    teachingFa: 'هدف: شناخت ۷ روز هفته و ۵ مکان پرکاربرد شهری.\nتلفظ: Понеде́льник = «پانیدِلْنیک»؛ Воскресе́нье = «واسْکْری‌سِنْیه».\nنکتهٔ تدریجی: در زبان روسی نام روزهای هفته با حرف کوچک نوشته می‌شود (مگر در ابتدای جمله). واژهٔ «кафе́» از کلمه‌های قرضی و بی‌تغییر است.',
    durationMinutes: 6,
    sentences: [
      { text: 'Понеде́льник, вто́рник, среда́.', fa: 'دوشنبه، سه‌شنبه، چهارشنبه.', pronunciation: 'پانیدِلْنیک، فْتُرْنیک، سْریدا.', vocabulary: [['Понеде́льник', 'دوشنبه'], ['вто́рник', 'سه‌شنبه'], ['среда́', 'چهارشنبه']] },
      { text: 'Четве́рг, пя́тница.', fa: 'پنج‌شنبه، جمعه.', pronunciation: 'چیتْوِرْک، پْیاتْنیتْسا.', vocabulary: [['Четве́рг', 'پنج‌شنبه'], ['пя́тница', 'جمعه']] },
      { text: 'Суббо́та и воскресе́нье.', fa: 'شنبه و یک‌شنبه.', pronunciation: 'سوبُتا ای واسْکْری‌سِنْیه.', vocabulary: [['Суббо́та', 'شنبه'], ['воскресе́нье', 'یک‌شنبه']] },
      { text: 'Шко́ла.', fa: 'مدرسه.', pronunciation: 'شْکُلا.', vocabulary: [['Шко́ла', 'مدرسه']] },
      { text: 'Магази́н.', fa: 'فروشگاه / مغازه.', pronunciation: 'ماگازین.', vocabulary: [['Магази́н', 'فروشگاه']] },
      { text: 'Кафе́.', fa: 'کافه.', pronunciation: 'کافِه.', vocabulary: [['Кафе́', 'کافه']] },
      { text: 'У́лица.', fa: 'خیابان.', pronunciation: 'اولیتْسا.', vocabulary: [['У́лица', 'خیابان']] },
      { text: 'Го́род.', fa: 'شهر.', pronunciation: 'گُرات.', vocabulary: [['Го́род', 'شهر']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то шко́ла и́ли магази́н?', fa: 'این مدرسه است یا فروشگاه؟', pronunciation: 'اِتا شْکُلا ایلی ماگازین؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Э́то шко́ла.', fa: 'این مدرسه است.', pronunciation: 'اِتا شْکُلا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Кафе́ и́ли дом?', fa: 'کافه یا خانه؟', pronunciation: 'کافِه ایلی دُم؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Кафе́.', fa: 'کافه.', pronunciation: 'کافِه.' },
    ],
    checks: [
      { promptFa: '«Пя́тница» کدام روز هفته است؟', choices: ['شنبه', 'دوشنبه', 'چهارشنبه', 'جمعه'], correctIndex: 3, explanationFa: '«Пя́тница» یعنی «جمعه».' },
      { promptFa: 'واژهٔ «Магази́н» به چه معنی است؟', choices: ['مدرسه', 'فروشگاه', 'خیابان', 'شهر'], correctIndex: 1, explanationFa: '«Магази́н» یعنی «فروشگاه / مغازه».' },
      { promptFa: '«У́лица» یعنی چه؟', choices: ['خیابان', 'کافه', 'شهر', 'خانه'], correctIndex: 0, explanationFa: '«У́лица» یعنی «خیابان».' },
    ],
  },
  {
    id: 'ru-pre-11-adjectives',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'صفات ساده',
    subtitle: 'ویژگی‌های پایه برای توصیف چیزها و آدم‌ها',
    situation: 'یادگیری ۸ صفت ساده و پرکاربرد در شکل پایهٔ آن‌ها.',
    teachingFa: 'هدف: شناخت ۸ صفت متضاد و کاربردی (بزرگ/کوچک، خوب/بد، نو/قدیمی، خوشمزه، زیبا).\nتلفظ: Большо́й = «بالْشُی»؛ Хоро́ший = «خارُشی».\nنکتهٔ تدریجی: فعلاً همهٔ صفت‌ها را در شکل پایه (مذکر) یاد می‌گیریم. در بخش ۴ می‌بینید که وقتی کنار اسم مؤنث یا خنثی می‌نشینند، پایانهٔ آن‌ها تغییر کوچکی می‌کند (`но́вый` ← `но́вая` / `но́вое`).',
    durationMinutes: 5,
    sentences: [
      { text: 'Большо́й.', fa: 'بزرگ.', pronunciation: 'بالْشُی.', vocabulary: [['Большо́й', 'بزرگ']] },
      { text: 'Ма́ленький.', fa: 'کوچک.', pronunciation: 'مالِنْکی.', vocabulary: [['Ма́ленький', 'کوچک']] },
      { text: 'Хоро́ший.', fa: 'خوب.', pronunciation: 'خارُشی.', vocabulary: [['Хоро́ший', 'خوب']] },
      { text: 'Плохо́й.', fa: 'بد.', pronunciation: 'پْلاخُی.', vocabulary: [['Плохо́й', 'بد']] },
      { text: 'Но́вый.', fa: 'نو / جدید.', pronunciation: 'نُوی.', vocabulary: [['Но́вый', 'نو / جدید']] },
      { text: 'Ста́рый.', fa: 'قدیمی / پیر.', pronunciation: 'سْتاری.', vocabulary: [['Ста́рый', 'قدیمی / پیر']] },
      { text: 'Вку́сный.', fa: 'خوشمزه.', pronunciation: 'فْکوسْنی.', vocabulary: [['Вку́сный', 'خوشمزه']] },
      { text: 'Краси́вый.', fa: 'زیبا.', pronunciation: 'کْراسیوی.', vocabulary: [['Краси́вый', 'زیبا']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то большо́й дом?', fa: 'این خانهٔ بزرگ است؟', pronunciation: 'اِتا بالْشُی دُم؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Нет, ма́ленький дом.', fa: 'نه، خانهٔ کوچک است.', pronunciation: 'نِت، مالِنْکی دُم.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Но́вый и́ли ста́рый?', fa: 'نو یا قدیمی؟', pronunciation: 'نُوی ایلی سْتاری؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Но́вый. Хоро́ший дом.', fa: 'نو. خانهٔ خوب.', pronunciation: 'نُوی. خارُشی دُم.' },
    ],
    checks: [
      { promptFa: 'متضاد «Большо́й» (بزرگ) کدام است؟', choices: ['Но́вый.', 'Ма́ленький.', 'Вку́сный.', 'Ста́рый.'], correctIndex: 1, explanationFa: '«Ма́ленький» یعنی «کوچک».' },
      { promptFa: 'صفت «Вку́сный» چه معنی دارد؟', choices: ['زیبا', 'قدیمی', 'خوشمزه', 'بد'], correctIndex: 2, explanationFa: '«Вку́сный» یعنی «خوشمزه».' },
      { promptFa: '«Но́вый» یعنی چه؟', choices: ['جدید / نو', 'خوب', 'کوچک', 'زیبا'], correctIndex: 0, explanationFa: '«Но́вый» به معنی «نو / جدید» است.' },
    ],
  },
  {
    id: 'ru-pre-12-verbs',
    module: RUSSIAN_PRE_A1_MODULES[1],
    title: 'افعال ساده',
    subtitle: 'نخستین فعل‌ها برای گفتن «من انجام می‌دهم»',
    situation: 'آشنایی با ۸ فعل بسیار پرکاربرد در صورت اول‌شخص («من ...») همراه با هستیِ «دارد/هست».',
    teachingFa: 'هدف: شناخت ۸ فعل پایه (دانستن، خواستن، دوست داشتن، دیدن، خواندن، نوشتن، زندگی کردن، بودن/داشتن).\nتلفظ: Хочу́ = «خاچو»؛ Люблю́ = «لیوبْلیو»؛ Живу́ = «ژیوو».\nنکتهٔ تدریجی: در روسی هر وقت پایان فعل به «-у» یا «-ю» ختم شود، یعنی انجام‌دهندهٔ کار «من» (`я`) هستم (`зна́ю`, `хочу́`, `чита́ю`). فعلاً همین شکل پایه را تمرین می‌کنیم.',
    durationMinutes: 5,
    sentences: [
      { text: 'Зна́ю.', fa: 'می‌دانم. (مصدر: знать)', pronunciation: 'زْنایو.', vocabulary: [['Зна́ю', 'می‌دانم']] },
      { text: 'Хочу́.', fa: 'می‌خواهم. (مصدر: хоте́ть)', pronunciation: 'خاچو.', vocabulary: [['Хочу́', 'می‌خواهم']] },
      { text: 'Люблю́.', fa: 'دوست دارم. (مصدر: люби́ть)', pronunciation: 'لیوبْلیو.', vocabulary: [['Люблю́', 'دوست دارم']] },
      { text: 'Ви́жу.', fa: 'می‌بینم. (مصدر: ви́деть)', pronunciation: 'ویژو.', vocabulary: [['Ви́жу', 'می‌بینم']] },
      { text: 'Чита́ю.', fa: 'می‌خوانم. (مصدر: чита́ть)', pronunciation: 'چیتایو.', vocabulary: [['Чита́ю', 'می‌خوانم']] },
      { text: 'Пишу́.', fa: 'می‌نویسم. (مصدر: писа́ть)', pronunciation: 'پیشو.', vocabulary: [['Пишу́', 'می‌نویسم']] },
      { text: 'Живу́.', fa: 'زندگی می‌کنم. (مصدر: жить)', pronunciation: 'ژیوو.', vocabulary: [['Живу́', 'زندگی می‌کنم']] },
      { text: 'Есть.', fa: 'هست / وجود دارد.', pronunciation: 'یِسْت.', vocabulary: [['Есть', 'هست / وجود دارد']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Суп и хлеб. Хочу́!', fa: 'سوپ و نان. می‌خواهم!', pronunciation: 'سوپ ای خْلِب. خاچو!' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Я хочу́ чай.', fa: 'من چای می‌خواهم.', pronunciation: 'یا خاچو چای.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Чай и́ли ко́фе?', fa: 'چای یا قهوه؟', pronunciation: 'چای ایلی کُفِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Ко́фе. Я люблю́ ко́фе!', fa: 'قهوه. من قهوه دوست دارم!', pronunciation: 'کُفِه. یا لیوبْلیو کُفِه!' },
    ],
    checks: [
      { promptFa: '«Хочу́.» یعنی چه؟', choices: ['می‌خوانم.', 'می‌نویسم.', 'می‌خواهم.', 'می‌دانم.'], correctIndex: 2, explanationFa: '«Хочу́» یعنی «می‌خواهم».' },
      { promptFa: 'کدام فعل به معنی «می‌خوانم» است؟', choices: ['Пишу́.', 'Чита́ю.', 'Ви́жу.', 'Живу́.'], correctIndex: 1, explanationFa: '«Чита́ю» یعنی «می‌خوانم» و «Пишу́» یعنی «می‌نویسم».' },
      { promptFa: '«Люблю́.» یعنی چه؟', choices: ['دوست دارم.', 'زندگی می‌کنم.', 'می‌بینم.', 'هست.'], correctIndex: 0, explanationFa: '«Люблю́» یعنی «دوست دارم».' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // بخش ۳: عبارت‌های بسیار ساده (مرحلهٔ ۲: عبارت)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'ru-pre-13-greeting-name-phrases',
    module: RUSSIAN_PRE_A1_MODULES[2],
    title: 'عبارت‌های سلام، احوال‌پرسی و نام',
    subtitle: 'سلام، صبح و شب بخیر، احوال‌پرسی و گفتن نام',
    situation: 'عبارت‌های کوتاه و آماده برای شروع هر دیدار و پرسیدن و گفتن اسم.',
    teachingFa: 'هدف: به‌کاربردن عبارت‌های «سلام»، «صبح بخیر»، «شب بخیر»، «حال شما چطور است؟»، «خوب هستم»، «اسم شما چیست؟» و «اسم من ...».\nتلفظ: Как дела́? = «کاک دیلا؟»؛ Меня́ зову́т = «مینْیا زاووت».\nنکتهٔ تدریجی: در عبارت «Меня́ зову́т ...» به‌طور تحت‌اللفظی یعنی «مرا صدا می‌زنند ...» و از فعل بودن استفاده نمی‌شود. برای «شب بخیر» هم «До́брой но́чи!» و هم «Споко́йной но́чи!» بسیار رایج‌اند.',
    durationMinutes: 5,
    sentences: [
      { text: 'Приве́т! Здра́вствуйте!', fa: 'سلام! (دوستانه / محترمانه)', pronunciation: 'پْری‌ویت! زْدْراسْت‌وُیْتِه!', vocabulary: [['Приве́т', 'سلام (دوستانه)'], ['Здра́вствуйте', 'سلام (محترمانه)']] },
      { text: 'До́брое у́тро!', fa: 'صبح بخیر!', pronunciation: 'دُبْرایِه اوتْرا!', vocabulary: [['До́брое', 'بخیر / خوب'], ['у́тро', 'صبح']] },
      { text: 'До́брой но́чи!', fa: 'شب بخیر!', pronunciation: 'دُبْرُی نُچی!', vocabulary: [['До́брой', 'بخیر'], ['но́чи', 'شب']] },
      { text: 'Как дела́?', fa: 'حالتان / حالت چطور است؟', pronunciation: 'کاک دیلا؟', vocabulary: [['Как', 'چطور'], ['дела́', 'کارها / احوال']] },
      { text: 'Хорошо́, спаси́бо.', fa: 'خوب هستم، ممنون.', pronunciation: 'خاراشُو، سْپاسیبا.', vocabulary: [['Хорошо́', 'خوب'], ['спаси́бо', 'ممنون']] },
      { text: 'Здра́вствуйте! Как вас зову́т?', fa: 'سلام! اسم شما چیست؟', pronunciation: 'زْدْراسْت‌وُیْتِه! کاک واس زاووت؟', pattern: 'Как + ضمیر + зову́т?', vocabulary: [['вас', 'شما را'], ['зову́т', 'صدا می‌زنند']] },
      { text: 'Меня́ зову́т Али́.', fa: 'اسم من علی است.', pronunciation: 'مینْیا زاووت علی.', pattern: 'Меня́ зову́т + اسم', vocabulary: [['Меня́', 'مرا'], ['зову́т', 'صدا می‌زنند']] },
      { text: 'Меня́ зову́т Са́ра.', fa: 'اسم من سارا است.', pronunciation: 'مینْیا زاووت سارا.', pattern: 'Меня́ зову́т + اسم', vocabulary: [['Меня́', 'مرا'], ['Са́ра', 'سارا']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'До́брое у́тро! Как дела́?', fa: 'صبح بخیر! حال شما چطور است؟', pronunciation: 'دُبْرایِه اوتْرا! کاک دیلا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'До́брое у́тро! Хорошо́, спаси́бо.', fa: 'صبح بخیر! خوب هستم، ممنون.', pronunciation: 'دُبْرایِه اوتْرا! خاراشُو، سْپاسیبا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Как вас зову́т?', fa: 'اسم شما چیست؟', pronunciation: 'کاک واس زاووت؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Меня́ зову́т Са́ра.', fa: 'اسم من سارا است.', pronunciation: 'مینْیا زاووت سارا.' },
    ],
    checks: [
      { promptFa: '«صبح بخیر» به روسی کدام است؟', choices: ['До́брой но́чи!', 'Как дела́?', 'До́брое у́тро!', 'Меня́ зову́т...'], correctIndex: 2, explanationFa: '«До́брое у́тро» یعنی «صبح بخیر».' },
      { promptFa: 'برای پرسیدن «اسم شما چیست؟» کدام عبارت را می‌گوییم؟', choices: ['Как дела́?', 'Как вас зову́т?', 'Хорошо́, спаси́бо.', 'До́брой но́чи!'], correctIndex: 1, explanationFa: '«Как вас зову́т?» سؤال محترمانه برای پرسیدن اسم است.' },
      { promptFa: 'پاسخ درست به «Как дела́?» کدام است؟', choices: ['Хорошо́, спаси́бо.', 'До́брое у́тро.', 'Меня́ зову́т Али́.', 'Нет.'], correctIndex: 0, explanationFa: '«Хорошо́, спаси́бо» یعنی «خوب هستم، ممنون».' },
    ],
  },
  {
    id: 'ru-pre-14-polite-phrases',
    module: RUSSIAN_PRE_A1_MODULES[2],
    title: 'عبارت‌های ادب و پاسخ کوتاه',
    subtitle: 'لطفاً، متشکرم، ببخشید، بله حتماً، نه متشکرم',
    situation: 'ادامهٔ عبارت‌های آمادهٔ روزمره برای ادب، عذرخواهی و قبول یا رد مؤدبانه.',
    teachingFa: 'هدف: تسلط بر عبارت‌های «لطفاً»، «ممنون»، «متشکرم»، «ببخشید»، «بله، حتماً» و «نه، متشکرم».\nتلفظ: Большо́е спаси́бо = «بالْشُیه سْپاسیبا»؛ Коне́чно = «کانیِشْنا».\nنکتهٔ تدریجی: در «Большо́е спаси́бо» (بسیار متشکرم)، چون «спаси́бо» خنثی در نظر گرفته می‌شود، صفتِ «большо́й» به شکل خنثیِ «большо́е» آمده است.',
    durationMinutes: 5,
    sentences: [
      { text: 'Пожа́луйста.', fa: 'لطفاً / خواهش می‌کنم.', pronunciation: 'پاژالُیْسْتا.', vocabulary: [['Пожа́луйста', 'لطفاً']] },
      { text: 'Спаси́бо.', fa: 'ممنون.', pronunciation: 'سْپاسیبا.', vocabulary: [['Спаси́бо', 'ممنون']] },
      { text: 'Большо́е спаси́бо.', fa: 'خیلی متشکرم.', pronunciation: 'بالْشُیه سْپاسیبا.', pattern: 'Большо́е + спаси́бо', vocabulary: [['Большо́е', 'بزرگ / خیلی'], ['спаси́бо', 'متشکرم']] },
      { text: 'Извини́те.', fa: 'ببخشید. (محترمانه)', pronunciation: 'ایزْوینیتِه.', vocabulary: [['Извини́те', 'ببخشید']] },
      { text: 'Да, коне́чно.', fa: 'بله، حتماً.', pronunciation: 'دا، کانیِشْنا.', pattern: 'Да, + коне́чно', vocabulary: [['Да', 'بله'], ['коне́чно', 'حتماً / البته']] },
      { text: 'Нет, спаси́бо.', fa: 'نه، متشکرم.', pronunciation: 'نِت، سْپاسیبا.', pattern: 'Нет, + спаси́бо', vocabulary: [['Нет', 'نه'], ['спаси́бо', 'متشکرم']] },
      { text: 'Вода́, пожа́луйста.', fa: 'آب، لطفاً.', pronunciation: 'وادا، پاژالُیْسْتا.', pattern: 'اسم + пожа́луйста', vocabulary: [['Вода́', 'آب'], ['пожа́луйста', 'لطفاً']] },
      { text: 'До́брой но́чи! Пока́!', fa: 'شب بخیر! خداحافظ!', pronunciation: 'دُبْرُی نُچی! پاکا!', vocabulary: [['но́чи', 'شب'], ['Пока́', 'خداحافظ']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Извини́те, чай и́ли ко́фе?', fa: 'ببخشید، چای یا قهوه؟', pronunciation: 'ایزْوینیتِه، چای ایلی کُفِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Ко́фе, пожа́луйста.', fa: 'قهوه، لطفاً.', pronunciation: 'کُفِه، پاژالُیْسْتا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Са́хар?', fa: 'شکر؟', pronunciation: 'ساخار؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Нет, спаси́бо. Большо́е спаси́бо!', fa: 'نه، متشکرم. خیلی متشکرم!', pronunciation: 'نِت، سْپاسیبا. بالْشُیه سْپاسیبا!' },
    ],
    checks: [
      { promptFa: '«بله، حتماً» به روسی کدام است؟', choices: ['Нет, спаси́бо.', 'Извини́те.', 'Да, коне́чно.', 'Пожа́луйста.'], correctIndex: 2, explanationFa: '«Да, коне́чно» یعنی «بله، حتماً».' },
      { promptFa: 'برای گفتن «خیلی متشکرم» کدام عبارت درست است؟', choices: ['Большо́е спаси́бо.', 'Да, коне́чно.', 'Извини́те.', 'До́брой но́чи!'], correctIndex: 0, explanationFa: '«Большо́е спаси́бо» یعنی «خیلی متشکرم».' },
      { promptFa: '«نه، متشکرم» کدام گزینه است؟', choices: ['Вода́, пожа́луйста.', 'Да, коне́чно.', 'До свида́ния.', 'Нет, спаси́бо.'], correctIndex: 3, explanationFa: '«Нет, спаси́бо» یعنی «نه، متشکرم».' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // بخش ۴: ترکیب کلمات (مرحلهٔ ۲: عبارت — ترکیب واژه‌های آموخته‌شده)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'ru-pre-15-combos-pronoun-demo',
    module: RUSSIAN_PRE_A1_MODULES[3],
    title: 'ترکیب ضمیر و اشاره با اسم و صفت',
    subtitle: 'من + اسم، من + صفت، این + اسم، آن + اسم',
    situation: 'ساختن نخستین ترکیب‌های دوکلمه‌ای با واژه‌هایی که در بخش ۱ و ۲ یاد گرفته‌اید.',
    teachingFa: 'هدف: ساختن چهار ترکیب کلیدی: «من + اسم»، «من + صفت»، «این + اسم» و «آن + اسم».\nتلفظ: Я рад = «یا رات»؛ Я студе́нт = «یا سْتودِنْت».\nنکتهٔ تدریجی: ۱) در زمان حال، فعل «هستم» میان «Я» و اسم یا صفت نمی‌آید (`Я студе́нт`). ۲) صفت کوتاهِ «рад» (خوشحال) برای آقایان `Я рад` و برای خانم‌ها `Я ра́да` گفته می‌شود. ۳) «Э́то» و «То» پیش از هر اسمی با هر جنسیت بدون تغییر می‌آیند.',
    durationMinutes: 6,
    sentences: [
      { text: 'Я брат.', fa: 'من برادر هستم.', pronunciation: 'یا بْرات.', pattern: 'Я + اسم', vocabulary: [['Я', 'من'], ['брат', 'برادر']] },
      { text: 'Я учи́тель.', fa: 'من معلم هستم.', pronunciation: 'یا اوچیتِل.', pattern: 'Я + اسم', vocabulary: [['Я', 'من'], ['учи́тель', 'معلم']] },
      { text: 'Я рад.', fa: 'من خوشحالم. (برای خانم‌ها: Я ра́да)', pronunciation: 'یا رات.', pattern: 'Я + صفت کوتاه', vocabulary: [['Я', 'من'], ['рад', 'خوشحال']] },
      { text: 'Я хоро́ший друг.', fa: 'من دوست خوبی هستم.', pronunciation: 'یا خارُشی دْروک.', pattern: 'Я + صفت + اسم', vocabulary: [['хоро́ший', 'خوب'], ['друг', 'دوست']] },
      { text: 'Э́то дом.', fa: 'این خانه است.', pronunciation: 'اِتا دُم.', pattern: 'Э́то + اسم', vocabulary: [['Э́то', 'این'], ['дом', 'خانه']] },
      { text: 'Э́то кни́га.', fa: 'این کتاب است.', pronunciation: 'اِتا کْنیگا.', pattern: 'Э́то + اسم', vocabulary: [['Э́то', 'این'], ['кни́га', 'کتاب']] },
      { text: 'То стол.', fa: 'آن میز است.', pronunciation: 'تا سْتُل.', pattern: 'То + اسم', vocabulary: [['То', 'آن'], ['стол', 'میز']] },
      { text: 'То окно́.', fa: 'آن پنجره است.', pronunciation: 'تا آکنُو.', pattern: 'То + اسم', vocabulary: [['То', 'آن'], ['окно́', 'پنجره']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Приве́т! Э́то дом?', fa: 'سلام! این خانه است؟', pronunciation: 'پْری‌ویت! اِتا دُم؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, э́то дом. Я студе́нт.', fa: 'بله، این خانه است. من دانشجو هستم.', pronunciation: 'دا، اِتا دُم. یا سْتودِنْت.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'То шко́ла?', fa: 'آن مدرسه است؟', pronunciation: 'تا شْکُلا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, то шко́ла. Я рад!', fa: 'بله، آن مدرسه است. من خوشحالم!', pronunciation: 'دا، تا شْکُلا. یا رات!' },
    ],
    checks: [
      { promptFa: 'ترکیب «این کتاب است» کدام است؟', choices: ['То кни́га.', 'Э́то кни́га.', 'Я учи́тель.', 'То окно́.'], correctIndex: 1, explanationFa: '«Э́то + اسم» برای معرفی چیز نزدیک است: «Э́то кни́га».' },
      { promptFa: 'یک خانم برای گفتن «من خوشحالم» چه می‌گوید؟', choices: ['Я ра́да.', 'Я рад.', 'Я студе́нт.', 'Э́то дом.'], correctIndex: 0, explanationFa: 'آقایان «Я рад» و خانم‌ها «Я ра́да» می‌گویند.' },
      { promptFa: '«То стол.» یعنی چه؟', choices: ['این میز است.', 'من میز دارم.', 'آن میز است.', 'آن پنجره است.'], correctIndex: 2, explanationFa: '«То» یعنی «آن» و «стол» یعنی «میز».' },
    ],
  },
  {
    id: 'ru-pre-16-combos-adj-verb',
    module: RUSSIAN_PRE_A1_MODULES[3],
    title: 'ترکیب اسم، صفت و فعل',
    subtitle: 'اسم + صفت، صفت + اسم، ضمیر + فعل، فعل + اسم',
    situation: 'تمرین جای صفت قبل و بعد از اسم، و آوردن مفعول ساده بعد از فعل.',
    teachingFa: 'هدف: ساختن ترکیب‌های «اسم + صفت»، «صفت + اسم»، «ضمیر + فعل» و «فعل + اسم».\nتلفظ: Кни́га но́вая = «کْنیگا نُوایا»؛ Чита́ю кни́гу = «چیتایو کْنیگو».\nنکتهٔ تدریجی: دو قانون بسیار ساده و کاربردی اینجا می‌بینید: ۱) «Большо́й дом» یعنی «خانهٔ بزرگ»، ولی «Дом большо́й» یعنی «خانه بزرگ است». ۲) اسمِ مؤنث مثل «кни́га» با صفت «но́вая» هماهنگ می‌شود و وقتی مفعول فعل («می‌خوانم چه چیز را؟») قرار می‌گیرد، «а» به «у» تبدیل می‌شود: `чита́ю кни́гу`.',
    durationMinutes: 6,
    sentences: [
      { text: 'Дом большо́й.', fa: 'خانه بزرگ است.', pronunciation: 'دُم بالْشُی.', pattern: 'اسم + صفت', vocabulary: [['Дом', 'خانه'], ['большо́й', 'بزرگ']] },
      { text: 'Кни́га но́вая.', fa: 'کتاب نو است.', pronunciation: 'کْنیگا نُوایا.', pattern: 'اسم + صفت', vocabulary: [['Кни́га', 'کتاب'], ['но́вая', 'نو (مؤنث)']] },
      { text: 'Большо́й дом.', fa: 'خانهٔ بزرگ.', pronunciation: 'بالْشُی دُم.', pattern: 'صفت + اسم', vocabulary: [['Большо́й', 'بزرگ'], ['дом', 'خانه']] },
      { text: 'Но́вая кни́га.', fa: 'کتابِ نو.', pronunciation: 'نُوایا کْنیگا.', pattern: 'صفت + اسم', vocabulary: [['Но́вая', 'نو (مؤنث)'], ['кни́га', 'کتاب']] },
      { text: 'Я зна́ю.', fa: 'من می‌دانم.', pronunciation: 'یا زْنایو.', pattern: 'ضمیر + فعل', vocabulary: [['Я', 'من'], ['зна́ю', 'می‌دانم']] },
      { text: 'Я чита́ю.', fa: 'من می‌خوانم.', pronunciation: 'یا چیتایو.', pattern: 'ضمیر + فعل', vocabulary: [['Я', 'من'], ['чита́ю', 'می‌خوانم']] },
      { text: 'Хочу́ чай.', fa: 'چای می‌خواهم.', pronunciation: 'خاچو چای.', pattern: 'فعل + اسم', vocabulary: [['Хочу́', 'می‌خواهم'], ['чай', 'چای']] },
      { text: 'Чита́ю кни́гу.', fa: 'کتاب می‌خوانم.', pronunciation: 'چیتایو کْنیگو.', pattern: 'فعل + اسم', vocabulary: [['Чита́ю', 'می‌خوانم'], ['кни́гу', 'کتاب (مفعول)']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то но́вая кни́га?', fa: 'این کتابِ نو است؟', pronunciation: 'اِتا نُوایا کْنیگا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, кни́га но́вая. Я чита́ю кни́гу.', fa: 'بله، کتاب نو است. دارم کتاب می‌خوانم.', pronunciation: 'دا، کْنیگا نُوایا. یا چیتایو کْنیگو.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Хорошо́! Хочу́ ко́фе.', fa: 'خوب است! قهوه می‌خواهم.', pronunciation: 'خاراشُو! خاچو کُفِه.' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Ко́фе, пожа́луйста.', fa: 'قهوه، لطفاً.', pronunciation: 'کُفِه، پاژالُیْسْتا.' },
    ],
    checks: [
      { promptFa: 'تفاوت «Но́вая кни́га» با «Кни́га но́вая» چیست؟', choices: ['اولی «کتابِ نو» و دومی «کتاب نو است» است.', 'هر دو دقیقاً یکسان‌اند.', 'اولی جمع است.', 'دومی منفی است.'], correctIndex: 0, explanationFa: 'وقتی صفت بعد از اسم می‌آید نقش خبر جمله را دارد («کتاب نو است»).' },
      { promptFa: 'چرا در «Чита́ю кни́гу» آخر کلمه «у» گرفته است؟', choices: ['چون جمع است', 'چون اسم مؤنث مفعولِ فعل شده است', 'چون مذکر است', 'چون سؤال است'], correctIndex: 1, explanationFa: 'اسم‌های مؤنثِ «-а» پس از فعل‌هایی مثل чита́ю و хочу́ به «-у» تبدیل می‌شوند.' },
      { promptFa: '«Хочу́ чай.» یعنی چه؟', choices: ['من می‌دانم.', 'چای می‌خواهم.', 'کتاب می‌خوانم.', 'خانه بزرگ است.'], correctIndex: 1, explanationFa: '«Хочу́ чай» یعنی «چای می‌خواهم».' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // بخش ۵: اولین جمله‌ها (مرحلهٔ ۳: جمله)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'ru-pre-17-sentences-be-have',
    module: RUSSIAN_PRE_A1_MODULES[4],
    title: 'جمله‌های بودن، اشاره و داشتن',
    subtitle: 'من هستم، این است، آن است، او است، اینجا است، من دارم',
    situation: 'ساختن نخستین جمله‌های کامل و روزمره برای معرفی، اشاره، مکان و مالکیت.',
    teachingFa: 'هدف: استفاده از ساختارهای «من ... هستم»، «این / آن / او / اینجا ... است» و «من ... دارم».\nتلفظ: У меня́ есть = «او مینْیا یِسْت»؛ Здесь = «زْدِس».\nنکتهٔ تدریجی: ۱) برای مالکیت («من ... دارم») در روسی از ساختار `У меня́ есть + اسم` استفاده می‌کنیم. ۲) برای «مالِ من»، کنار اسم مذکر `мой` (`мой дом`) و کنار اسم مؤنث `моя́` (`моя́ кни́га`) می‌گذاریم.',
    durationMinutes: 6,
    sentences: [
      { text: 'Я друг.', fa: 'من دوست هستم.', pronunciation: 'یا دْروک.', pattern: 'Я + اسم', vocabulary: [['Я', 'من'], ['друг', 'دوست']] },
      { text: 'Э́то мой дом.', fa: 'این خانهٔ من است.', pronunciation: 'اِتا مُی دُم.', pattern: 'Э́то мой + اسم مذکر', vocabulary: [['мой', 'مالِ من (مذکر)'], ['дом', 'خانه']] },
      { text: 'Э́то моя́ кни́га.', fa: 'این کتابِ من است.', pronunciation: 'اِتا مایا کْنیگا.', pattern: 'Э́то моя́ + اسم مؤنث', vocabulary: [['моя́', 'مالِ من (مؤنث)'], ['кни́га', 'کتاب']] },
      { text: 'То наш стол.', fa: 'آن میزِ ما است.', pronunciation: 'تا ناش سْتُل.', pattern: 'То наш + اسم', vocabulary: [['наш', 'مالِ ما'], ['стол', 'میز']] },
      { text: 'Он мой брат.', fa: 'او برادرِ من است.', pronunciation: 'اُن مُی بْرات.', pattern: 'Он мой + اسم', vocabulary: [['Он', 'او (مرد)'], ['брат', 'برادر']] },
      { text: 'Она́ моя́ сестра́.', fa: 'او خواهرِ من است.', pronunciation: 'آنا مایا سیسْتْرا.', pattern: 'Она́ моя́ + اسم', vocabulary: [['Она́', 'او (زن)'], ['сестра́', 'خواهر']] },
      { text: 'Здесь моя́ ко́мната.', fa: 'اینجا اتاقِ من است.', pronunciation: 'زْدِس مایا کُمناتا.', pattern: 'Здесь + اسم', vocabulary: [['Здесь', 'اینجا'], ['ко́мната', 'اتاق']] },
      { text: 'У меня́ есть кни́га.', fa: 'من یک کتاب دارم.', pronunciation: 'او مینْیا یِسْت کْنیگا.', pattern: 'У меня́ есть + اسم', vocabulary: [['У меня́ есть', 'من دارم'], ['кни́га', 'کتاب']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то дом?', fa: 'این خانه است؟', pronunciation: 'اِتا دُم؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, э́то мой дом. Здесь моя́ ко́мната.', fa: 'بله، این خانهٔ من است. اینجا اتاقِ من است.', pronunciation: 'دا، اِتا مُی دُم. زْدِس مایا کُمناتا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Он брат?', fa: 'او برادر است؟', pronunciation: 'اُن بْرات؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, он мой брат. У меня́ есть соба́ка.', fa: 'بله، او برادرِ من است. من یک سگ دارم.', pronunciation: 'دا، اُن مُی بْرات. او مینْیا یِسْت ساباکا.' },
    ],
    checks: [
      { promptFa: '«من یک کتاب دارم» به روسی کدام است؟', choices: ['Э́то моя́ кни́га.', 'У меня́ есть кни́га.', 'Здесь моя́ ко́мната.', 'Я чита́ю кни́гу.'], correctIndex: 1, explanationFa: 'ساختار «У меня́ есть + اسم» یعنی «من ... دارم».' },
      { promptFa: 'چرا می‌گوییم «мой дом» ولی «моя́ кни́га»؟', choices: ['дом جمع است', 'کنیگا زمان گذشته است', 'дом مذکر و кни́га مؤنث است', 'فرقی ندارند'], correctIndex: 2, explanationFa: '«мой» برای اسم مذکر و «моя́» برای اسم مؤنث به کار می‌رود.' },
      { promptFa: '«Здесь моя́ ко́мната.» یعنی چه؟', choices: ['اینجا اتاقِ من است.', 'این خانهٔ من است.', 'آن میز ما است.', 'او خواهر من است.'], correctIndex: 0, explanationFa: '«Здесь» یعنی «اینجا».' },
    ],
  },
  {
    id: 'ru-pre-18-sentences-verbs',
    module: RUSSIAN_PRE_A1_MODULES[4],
    title: 'جمله‌های خواستن، دوست داشتن و دانستن',
    subtitle: 'من می‌خواهم، دوست دارم، می‌دانم و نمی‌دانم',
    situation: 'بیان خواسته، علاقه، آگاهی و ندانستن در جمله‌های ساده، همراه با منفی‌سازی فعل.',
    teachingFa: 'هدف: ساختن جمله‌های «من ... می‌خواهم»، «دوست دارم»، «می‌دانم» و «نمی‌دانم».\nتلفظ: Я не зна́ю = «یا نی زْنایو»؛ Во́ду = «وُدو».\nنکتهٔ تدریجی: برای منفی کردن هر فعل در روسی، واژهٔ کوتاه «не» را دقیقاً قبل از فعل بگذارید (`Я зна́ю` ← `Я не зна́ю`). همچنین اسم مؤنث «вода́» و «ма́ма» پس از فعل خواستن و دوست داشتن به «во́ду» و «ма́му» تغییر می‌کنند.',
    durationMinutes: 6,
    sentences: [
      { text: 'Я хочу́ чай.', fa: 'من چای می‌خواهم.', pronunciation: 'یا خاچو چای.', pattern: 'Я хочу́ + اسم', vocabulary: [['хочу́', 'می‌خواهم'], ['чай', 'چای']] },
      { text: 'Я хочу́ во́ду.', fa: 'من آب می‌خواهم.', pronunciation: 'یا خاچو وُدو.', pattern: 'Я хочу́ + اسم مؤنث (-у)', vocabulary: [['хочу́', 'می‌خواهم'], ['во́ду', 'آب (مفعول)']] },
      { text: 'Я люблю́ ко́фе.', fa: 'من قهوه دوست دارم.', pronunciation: 'یا لیوبْلیو کُفِه.', pattern: 'Я люблю́ + اسم', vocabulary: [['люблю́', 'دوست دارم'], ['ко́фе', 'قهوه']] },
      { text: 'Я люблю́ ма́му и па́пу.', fa: 'من مادر و پدر را دوست دارم.', pronunciation: 'یا لیوبْلیو مامو ای پاپو.', pattern: 'Я люблю́ + اسم (-у)', vocabulary: [['ма́му', 'مادر (مفعول)'], ['па́пу', 'پدر (مفعول)']] },
      { text: 'Я зна́ю э́то.', fa: 'من این را می‌دانم.', pronunciation: 'یا زْنایو اِتا.', pattern: 'Я зна́ю + اسم/اشاره', vocabulary: [['зна́ю', 'می‌دانم'], ['э́то', 'این را']] },
      { text: 'Я зна́ю и́мя.', fa: 'من اسم را می‌دانم.', pronunciation: 'یا زْنایو ایمیا.', pattern: 'Я зна́ю + اسم', vocabulary: [['зна́ю', 'می‌دانم'], ['и́мя', 'اسم']] },
      { text: 'Я не зна́ю.', fa: 'من نمی‌دانم.', pronunciation: 'یا نی زْنایو.', pattern: 'Я не + فعل', vocabulary: [['не', 'نه (منفی‌ساز)'], ['зна́ю', 'می‌دانم']] },
      { text: 'Я не зна́ю э́то.', fa: 'من این را نمی‌دانم.', pronunciation: 'یا نی زْنایو اِتا.', pattern: 'Я не зна́ю + اسم', vocabulary: [['не', 'نه'], ['зна́ю', 'می‌دانم']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Чай и́ли ко́фе?', fa: 'چای یا قهوه؟', pronunciation: 'چای ایلی کُفِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Нет, спаси́бо. Я хочу́ во́ду.', fa: 'نه، ممنون. من آب می‌خواهم.', pronunciation: 'نِت، سْپاسیبا. یا خاچو وُدو.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Сок и́ли ко́фе?', fa: 'آب‌میوه یا قهوه؟', pronunciation: 'سُک ایلی کُفِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Я люблю́ ко́фе!', fa: 'من قهوه دوست دارم!', pronunciation: 'یا لیوبْلیو کُفِه!' },
    ],
    checks: [
      { promptFa: 'برای منفی کردن «Я зна́ю» کدام گزینه درست است؟', choices: ['Я нет зна́ю.', 'Я не зна́ю.', 'Не я зна́ю.', 'Зна́ю нет.'], correctIndex: 1, explanationFa: 'برای منفی کردن فعل همیشه «не» پیش از فعل می‌آید: «Я не зна́ю».' },
      { promptFa: '«من آب می‌خواهم» کدام است؟', choices: ['Я хочу́ во́ду.', 'Я люблю́ ко́фе.', 'Я зна́ю э́то.', 'У меня́ есть вода́.'], correctIndex: 0, explanationFa: '«вода́» پس از «хочу́» به شکل مفعولی «во́ду» درمی‌آید.' },
      { promptFa: '«Я люблю́ ма́му и па́пу.» یعنی چه؟', choices: ['من اسم مادر را می‌دانم.', 'مادر و پدر خانه هستند.', 'من مادر و پدر را دوست دارم.', 'من چای می‌خواهم.'], correctIndex: 2, explanationFa: '«люблю́» یعنی «دوست دارم».' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // بخش ۶: سؤال‌های بسیار ساده (مرحلهٔ ۴: سؤال و پاسخ)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'ru-pre-19-questions-basic',
    module: RUSSIAN_PRE_A1_MODULES[5],
    title: 'سؤال‌های چی، کی، اسم، حال و کجا',
    subtitle: 'این چیست؟ او کیست؟ اسم تو چیست؟ حالت چطور است؟ کجا هستی؟',
    situation: 'پرسیدن ۵ سؤال پایه برای شناخت اشیا، افراد، نام، احوال و مکان.',
    teachingFa: 'هدف: پرسیدن و پاسخ دادن به سؤال‌های «این چیست؟»، «او کیست؟»، «اسم تو چیست؟»، «حالت چطور است؟» و «کجا هستی؟».\nتلفظ: Что э́то? = «شْتو اِتا؟»؛ Где ты? = «گْدِه تی؟».\nنکتهٔ تدریجی: در پرسیدن «اسم تو چیست؟» به جای «вас» (شما، در بخش ۳) از «тебя́» (تو) استفاده می‌کنیم: `Как тебя́ зову́т?`. کلمهٔ «до́ма» یعنی «در خانه».',
    durationMinutes: 6,
    sentences: [
      { text: 'Что э́то?', fa: 'این چیست؟', pronunciation: 'شْتو اِتا؟', pattern: 'Что + э́то?', vocabulary: [['Что', 'چه / چی'], ['э́то', 'این']] },
      { text: 'Кто э́то?', fa: 'این کیست؟ / او کیست؟', pronunciation: 'کْتو اِتا؟', pattern: 'Кто + э́то?', vocabulary: [['Кто', 'چه کسی / کی'], ['э́то', 'این']] },
      { text: 'Кто он?', fa: 'او [مرد] کیست؟', pronunciation: 'کْتو اُن؟', pattern: 'Кто + ضمیر?', vocabulary: [['Кто', 'کی'], ['он', 'او (مرد)']] },
      { text: 'Кто она́?', fa: 'او [زن] کیست؟', pronunciation: 'کْتو آنا؟', pattern: 'Кто + ضمیر?', vocabulary: [['Кто', 'کی'], ['она́', 'او (زن)']] },
      { text: 'Как тебя́ зову́т?', fa: 'اسم تو چیست؟ (دوستانه)', pronunciation: 'کاک تیبْیا زاووت؟', pattern: 'Как тебя́ зову́т?', vocabulary: [['тебя́', 'تو را'], ['зову́т', 'صدا می‌زنند']] },
      { text: 'Как дела́?', fa: 'حالت چطور است؟', pronunciation: 'کاک دیلا؟', vocabulary: [['Как', 'چطور'], ['дела́', 'احوال']] },
      { text: 'Где ты?', fa: 'کجا هستی؟', pronunciation: 'گْدِه تی؟', pattern: 'Где + ضمیر?', vocabulary: [['Где', 'کجا'], ['ты', 'تو']] },
      { text: 'Я до́ма.', fa: 'من خانه هستم.', pronunciation: 'یا دُما.', pattern: 'Я + مکان', vocabulary: [['Я', 'من'], ['до́ма', 'در خانه']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Приве́т! Где ты?', fa: 'سلام! کجا هستی؟', pronunciation: 'پْری‌ویت! گْدِه تی؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Приве́т! Я до́ма. Как дела́?', fa: 'سلام! من خانه هستم. حالت چطور است؟', pronunciation: 'پْری‌ویت! یا دُما. کاک دیلا؟' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Хорошо́! Кто он?', fa: 'خوبم! او کیست؟', pronunciation: 'خاراشُو! کْتو اُن؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Он мой брат.', fa: 'او برادرِ من است.', pronunciation: 'اُن مُی بْرات.' },
    ],
    checks: [
      { promptFa: 'برای پرسیدن «این چیست؟» کدام درست است؟', choices: ['Кто э́то?', 'Что э́то?', 'Где ты?', 'Как дела́?'], correctIndex: 1, explanationFa: '«Что» برای اشیا («چیست؟») و «Кто» برای افراد («کیست؟») است.' },
      { promptFa: '«Где ты?» چه معنی دارد؟', choices: ['اسمت چیست؟', 'حالت چطور است؟', 'او کیست؟', 'کجا هستی؟'], correctIndex: 3, explanationFa: '«Где» یعنی «کجا».' },
      { promptFa: 'فرق «Как тебя́ зову́т?» با «Как вас зову́т?» چیست؟', choices: ['اولی دوستانه (تو) و دومی محترمانه (شما) است.', 'اولی برای اشیا است.', 'دومی جمعِ زن است.', 'هر دو غلط‌اند.'], correctIndex: 0, explanationFa: '«тебя́» برای «تو» و «вас» برای «شما» است.' },
    ],
  },
  {
    id: 'ru-pre-20-questions-whose-yesno-count',
    module: RUSSIAN_PRE_A1_MODULES[5],
    title: 'سؤال‌های مال کیست، آیا و چند تا',
    subtitle: 'این مال کیست؟ آیا ...؟ چند تا ...؟',
    situation: 'پرسیدن مالکیت چیزها، سؤال‌های بله/خیر («آیا ...؟») و تعداد و قیمت («چند تا / چند ...؟»).',
    teachingFa: 'هدف: پرسیدن «مال کیست؟»، سؤال‌های «آیا ...؟» و «چند تا ...؟».\nتلفظ: Чей = «چِی»؛ Чья = «چْیا»؛ Ско́лько = «سْکُلْکا».\nنکتهٔ تدریجی: ۱) در روسی برای سؤال «آیا ...؟» هیچ واژهٔ اضافه‌ای اول جمله نمی‌گذارند؛ کافی است آهنگ آخر جملهٔ خبری را سوالی کنید (`Э́то твой ключ?`). ۲) برای اسم مذکر «Чей / твой» و برای اسم مؤنث «Чья / твоя́» به کار می‌رود.',
    durationMinutes: 6,
    sentences: [
      { text: 'Чей э́то дом?', fa: 'این خانه مال کیست؟', pronunciation: 'چِی اِتا دُم؟', pattern: 'Чей э́то + اسم مذکر?', vocabulary: [['Чей', 'مالِ چه کسی (مذکر)'], ['дом', 'خانه']] },
      { text: 'Чья э́то кни́га?', fa: 'این کتاب مال کیست؟', pronunciation: 'چْیا اِتا کْنیگا؟', pattern: 'Чья э́то + اسم مؤنث?', vocabulary: [['Чья', 'مالِ چه کسی (مؤنث)'], ['кни́га', 'کتاب']] },
      { text: 'Э́то твой ключ?', fa: 'آیا این کلید تو است؟', pronunciation: 'اِتا تْوُی کْلیوچ؟', pattern: 'Э́то твой + اسم مذکر?', vocabulary: [['твой', 'مالِ تو (مذکر)'], ['ключ', 'کلید']] },
      { text: 'Э́то твоя́ су́мка?', fa: 'آیا این کیف تو است؟', pronunciation: 'اِتا تْوایا سومْکا؟', pattern: 'Э́то твоя́ + اسم مؤنث?', vocabulary: [['твоя́', 'مالِ تو (مؤنث)'], ['су́мка', 'کیف']] },
      { text: 'У тебя́ есть кот?', fa: 'آیا تو گربه داری؟', pronunciation: 'او تیبْیا یِسْت کُت؟', pattern: 'У тебя́ есть + اسم?', vocabulary: [['У тебя́ есть', 'تو داری'], ['кот', 'گربه']] },
      { text: 'Ты хо́чешь чай?', fa: 'آیا چای می‌خواهی؟', pronunciation: 'تی خُچِش چای؟', pattern: 'Ты хо́чешь + اسم?', vocabulary: [['хо́чешь', 'می‌خواهی'], ['чай', 'چای']] },
      { text: 'Ско́лько здесь книг?', fa: 'اینجا چند تا کتاب هست؟', pronunciation: 'سْکُلْکا زْدِس کْنیک؟', pattern: 'Ско́лько + ...?', vocabulary: [['Ско́лько', 'چند / چقدر'], ['книг', 'کتاب‌ها']] },
      { text: 'Ско́лько сто́ит хлеб?', fa: 'نان چند قیمت دارد؟', pronunciation: 'سْکُلْکا سْتُیت خْلِب؟', pattern: 'Ско́лько сто́ит + اسم?', vocabulary: [['Ско́лько', 'چقدر'], ['сто́ит', 'ارزش دارد / قیمت دارد'], ['хлеб', 'نان']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Чья э́то су́мка?', fa: 'این کیف مال کیست؟', pronunciation: 'چْیا اِتا سومْکا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Э́то моя́ су́мка.', fa: 'این کیفِ من است.', pronunciation: 'اِتا مایا سومْکا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то твой ключ?', fa: 'آیا این کلید تو است؟', pronunciation: 'اِتا تْوُی کْلیوچ؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, мой ключ. Спаси́бо!', fa: 'بله، کلید من است. ممنون!', pronunciation: 'دا، مُی کْلیوچ. سْپاسیبا!' },
    ],
    checks: [
      { promptFa: 'برای اسم مؤنثِ «кни́га» چطور می‌پرسیم «این کتاب مال کیست؟»', choices: ['Чей э́то кни́га?', 'Что э́то кни́га?', 'Чья э́то кни́га?', 'Где кни́га?'], correctIndex: 2, explanationFa: '«Чья» با اسم‌های مؤنث مثل «кни́га» و «су́мка» می‌آید.' },
      { promptFa: 'در روسی سؤال «آیا تو گربه داری؟» چطور ساخته می‌شود؟', choices: ['У тебя́ есть кот? (با لحن پرسشی)', 'آیا У тебя́ есть кот?', 'Кто у тебя́ кот?', 'Ско́лько кот?'], correctIndex: 0, explanationFa: 'سؤال بله/خیر با تغییر آهنگ صدای همان جملهٔ خبری ساخته می‌شود.' },
      { promptFa: '«Ско́лько сто́ит хлеб?» یعنی چه؟', choices: ['نان مال کیست؟', 'نان کجاست؟', 'نان چیست؟', 'نان چند است؟'], correctIndex: 3, explanationFa: '«Ско́лько сто́ит хлеб?» یعنی «نان چند قیمت دارد / چند است؟».' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // بخش ۷: جمله‌های روزمره (مرحلهٔ ۴: سؤال و پاسخ و بیان روزمره)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'ru-pre-21-daily-identity-family-age',
    module: RUSSIAN_PRE_A1_MODULES[6],
    title: 'معرفی خود، خانواده، سن و ملیت',
    subtitle: 'جمله‌های کاربردی برای معرفی کامل در سطح پایه',
    situation: 'بیان اسم و شغل، معرفی خانواده، گفتن سن و گفتن ملیت و کشور خود.',
    teachingFa: 'هدف: بیان خود، خانواده، سن و ملیت به زبان ساده.\nتلفظ: Я ира́нец = «یا ایرانِتس»؛ Мне два́дцать лет = «مْنِه دْواتْسات لِت».\nنکتهٔ تدریجی: ۱) برای سن از ساختار `Мне + عدد + лет` استفاده می‌شود (با عددهای ۵ تا ۲۰ همیشه `лет` می‌آید). ۲) آقایان می‌گویند `Я ира́нец` و خانم‌ها می‌گویند `Я ира́нка`؛ اما `Я из Ира́на` (من اهل ایران هستم) برای هر دو یکسان است.',
    durationMinutes: 6,
    sentences: [
      { text: 'Меня́ зову́т Али́. Я студе́нт.', fa: 'اسم من علی است. من دانشجو هستم.', pronunciation: 'مینْیا زاووت علی. یا سْتودِنْت.', pattern: 'Меня́ зову́т + اسم. Я + شغل', vocabulary: [['Меня́ зову́т', 'اسم من است'], ['студе́нт', 'دانشجو']] },
      { text: 'Я из Ира́на.', fa: 'من اهل ایران هستم.', pronunciation: 'یا ایز ایرانا.', pattern: 'Я из + کشور', vocabulary: [['из', 'اهلِ / از'], ['Ира́на', 'ایران']] },
      { text: 'Я ира́нец.', fa: 'من ایرانی هستم. (برای خانم‌ها: Я ира́нка)', pronunciation: 'یا ایرانِتس.', pattern: 'Я + ملیت', vocabulary: [['Я', 'من'], ['ира́нец', 'ایرانی']] },
      { text: 'Мне два́дцать лет.', fa: 'من بیست سال دارم.', pronunciation: 'مْنِه دْواتْسات لِت.', pattern: 'Мне + عدد + лет', vocabulary: [['Мне', 'برای من (سن)'], ['два́дцать', 'بیست'], ['лет', 'سال']] },
      { text: 'Ему́ де́сять лет.', fa: 'او (پسر) ده سال دارد.', pronunciation: 'یِمو دِسیت لِت.', pattern: 'Ему́ + عدد + лет', vocabulary: [['Ему́', 'برای او (پسر)'], ['де́сять', 'ده']] },
      { text: 'Э́то моя́ больша́я семья́.', fa: 'این خانوادهٔ بزرگِ من است.', pronunciation: 'اِتا مایا بالْشایا سیمْیا.', pattern: 'Э́то моя́ + صفت + اسم', vocabulary: [['моя́', 'مالِ من'], ['больша́я', 'بزرگ (مؤنث)'], ['семья́', 'خانواده']] },
      { text: 'Мою́ ма́му зову́т Ми́на.', fa: 'اسم مادرم مینا است.', pronunciation: 'مایو مامو زاووت مینا.', pattern: 'Мою́ + اسم (-у) + зову́т + اسم', vocabulary: [['Мою́', 'من را / مادر من'], ['ма́му', 'مادر']] },
      { text: 'У меня́ есть ма́ма, па́па и сестра́.', fa: 'من مادر، پدر و یک خواهر دارم.', pronunciation: 'او مینْیا یِسْت ماما، پاپا ای سیسْتْرا.', pattern: 'У меня́ есть + اعضای خانواده', vocabulary: [['ма́ма', 'مادر'], ['сестра́', 'خواهر']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Как тебя́ зову́т?', fa: 'اسم تو چیست؟', pronunciation: 'کاک تیبْیا زاووت؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Меня́ зову́т Са́ра. Я из Ира́на.', fa: 'اسم من سارا است. من اهل ایران هستم.', pronunciation: 'مینْیا زاووت سارا. یا ایز ایرانا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то твоя́ семья́?', fa: 'این خانوادهٔ تو است؟', pronunciation: 'اِتا تْوایا سیمْیا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да. У меня́ есть брат и сестра́.', fa: 'بله. من یک برادر و یک خواهر دارم.', pronunciation: 'دا. او مینْیا یِسْت بْرات ای سیسْتْرا.' },
    ],
    checks: [
      { promptFa: '«من بیست سال دارم» به روسی کدام است؟', choices: ['Я из Ира́на.', 'Мне два́дцать лет.', 'Ему́ де́сять лет.', 'Я ира́нец.'], correctIndex: 1, explanationFa: 'ساختار «Мне + عدد + лет» برای گفتن سن خود به کار می‌رود.' },
      { promptFa: 'خانمی که می‌خواهد بگوید «من ایرانی هستم» چه می‌گوید؟', choices: ['Я ира́нец.', 'Я ира́нка.', 'Я студе́нт.', 'Ему́ де́сять лет.'], correctIndex: 1, explanationFa: 'آقایان «ира́нец» و خانم‌ها «ира́нка» می‌گویند.' },
      { promptFa: 'جملهٔ «Мою́ ма́му зову́т Ми́на.» یعنی چه؟', choices: ['مادرم بیست سال دارد.', 'مادرم در خانه است.', 'اسم مادرم مینا است.', 'این خانوادهٔ من است.'], correctIndex: 2, explanationFa: '«Мою́ ма́му зову́т ...» یعنی «اسم مادرم ... است».' },
    ],
  },
  {
    id: 'ru-pre-22-daily-likes-needs-wants',
    module: RUSSIAN_PRE_A1_MODULES[6],
    title: 'علاقه‌مندی، مالکیت، نیاز و خواسته',
    subtitle: 'دوست داشتن، داشتن، نیاز داشتن و خواستن',
    situation: 'بیان اینکه چه چیزی را دوست دارید، چه دارید، چه لازم دارید و چه می‌خواهید.',
    teachingFa: 'هدف: بیان علاقه (`Мне нра́вится`), مالکیت (`Э́то мой / У меня́ есть`), نیاز (`Мне ну́жен / нужна́`) و خواسته (`Я хочу́`).\nتلفظ: Мне нра́вится = «مْنِه نْراویتْسیا»؛ Мне нужна́ = «مْنِه نوژْنا».\nنکتهٔ تدریجی: برای بیان نیاز، شکل واژه به چیزِ موردنیاز برمی‌گردد: برای اسم مذکر مثل `ключ` می‌گوییم `Мне ну́жен ключ` و برای اسم مؤنث مثل `вода́` می‌گوییم `Мне нужна́ вода́`.',
    durationMinutes: 6,
    sentences: [
      { text: 'Мне нра́вится чай.', fa: 'من چای را دوست دارم / از چای خوشم می‌آید.', pronunciation: 'مْنِه نْراویتْسیا چای.', pattern: 'Мне нра́вится + اسم', vocabulary: [['Мне нра́вится', 'دوست دارم / خوشم می‌آید'], ['чай', 'چای']] },
      { text: 'Мне нра́вится э́та кни́га.', fa: 'این کتاب را دوست دارم.', pronunciation: 'مْنِه نْراویتْسیا اِتا کْنیگا.', pattern: 'Мне нра́вится + э́та + اسم مؤنث', vocabulary: [['нра́вится', 'خوشم می‌آید'], ['э́та', 'این (مؤنث)']] },
      { text: 'Э́то мой телефо́н.', fa: 'این گوشیِ من است.', pronunciation: 'اِتا مُی تیلیفُن.', pattern: 'Э́то мой + اسم مذکر', vocabulary: [['мой', 'مالِ من'], ['телефо́н', 'گوشی']] },
      { text: 'У меня́ есть но́вая ру́чка.', fa: 'من یک قلمِ نو دارم.', pronunciation: 'او مینْیا یِسْت نُوایا روچْکا.', pattern: 'У меня́ есть + صفت + اسم', vocabulary: [['но́вая', 'نو'], ['ру́чка', 'قلم']] },
      { text: 'Мне нужна́ вода́.', fa: 'من آب لازم دارم.', pronunciation: 'مْنِه نوژْنا وادا.', pattern: 'Мне нужна́ + اسم مؤنث', vocabulary: [['нужна́', 'لازم است (مؤنث)'], ['вода́', 'آب']] },
      { text: 'Мне ну́жен ключ.', fa: 'من کلید لازم دارم.', pronunciation: 'مْنِه نوژِن کْلیوچ.', pattern: 'Мне ну́жен + اسم مذکر', vocabulary: [['ну́жен', 'لازم است (مذکر)'], ['ключ', 'کلید']] },
      { text: 'Я хочу́ ко́фе.', fa: 'من قهوه می‌خواهم.', pronunciation: 'یا خاچو کُفِه.', pattern: 'Я хочу́ + اسم', vocabulary: [['хочу́', 'می‌خواهم'], ['ко́фе', 'قهوه']] },
      { text: 'Я хочу́ но́вую кни́гу.', fa: 'من یک کتابِ نو می‌خواهم.', pronunciation: 'یا خاچو نُوویو کْنیگو.', pattern: 'Я хочу́ + صفت + اسم (-у)', vocabulary: [['но́вую', 'نو (مفعول مؤنث)'], ['кни́гу', 'کتاب (مفعول)']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Ты хо́чешь ко́фе?', fa: 'آیا قهوه می‌خواهی؟', pronunciation: 'تی خُچِش کُفِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Нет, спаси́бо. Мне нужна́ вода́.', fa: 'نه، متشکرم. من آب لازم دارم.', pronunciation: 'نِت، سْپاسیبا. مْنِه نوژْنا وادا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'У меня́ есть вода́. Пожа́луйста!', fa: 'من آب دارم. بفرمایید!', pronunciation: 'او مینْیا یِسْت وادا. پاژالُیْسْتا!' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Большо́е спаси́бо! Я люблю́ во́ду.', fa: 'خیلی متشکرم! من آب دوست دارم.', pronunciation: 'بالْشُیه سْپاسیبا! یا لیوبْلیو وُدو.' },
    ],
    checks: [
      { promptFa: 'برای اسمِ مذکر «ключ» چطور می‌گوییم «من کلید لازم دارم»؟', choices: ['Мне нужна́ ключ.', 'Мне ну́жен ключ.', 'Мне нра́вится ко́фе.', 'У меня́ ключ.'], correctIndex: 1, explanationFa: '«ну́жен» برای اسم مذکر («ключ») و «нужна́» برای اسم مؤنث («вода́») است.' },
      { promptFa: '«Мне нра́вится э́та кни́га.» یعنی چه؟', choices: ['من کتاب می‌خواهم.', 'من کتاب ندارم.', 'این کتاب را دوست دارم.', 'این کتابِ من است.'], correctIndex: 2, explanationFa: '«Мне нра́вится ...» یعنی «از ... خوشم می‌آید / ... را دوست دارم».' },
      { promptFa: '«Я хочу́ но́вую кни́гу.» چه معنی دارد؟', choices: ['من کتابِ نو دارم.', 'من یک کتابِ نو می‌خواهم.', 'این قلمِ نو من است.', 'من آب لازم دارم.'], correctIndex: 1, explanationFa: '«хочу́» یعنی «می‌خواهم» و صفت و اسم مؤنث هر دو پایانهٔ مفعولی «-ую / -у» گرفته‌اند.' },
    ],
  },
  {
    id: 'ru-pre-23-daily-descriptions',
    module: RUSSIAN_PRE_A1_MODULES[6],
    title: 'توصیف اشیا و افراد',
    subtitle: 'ویژگی‌های رنگ، اندازه، مزه و شخصیت',
    situation: 'ساختن جمله‌های توصیفی دربارهٔ وسایل خانه، خوراکی‌ها و افراد.',
    teachingFa: 'هدف: توصیف اشیا و افراد با صفت‌های هماهنگ (مذکر، مؤنث و خنثی).\nتلفظ: Зелёное я́блоко = «زیلیُنایه یابْلاکا»؛ До́брый = «دُبْری».\nنکتهٔ تدریجی: یک جمع‌بندی ساده از هماهنگی صفت‌ها: مذکر (`большо́й стол`, `до́брый друг`)، مؤنث (`ма́ленькая ко́мната`, `у́мная подру́га`) و خنثی (`зелёное я́блоко`).',
    durationMinutes: 6,
    sentences: [
      { text: 'Мой стол большо́й и но́вый.', fa: 'میزِ من بزرگ و نو است.', pronunciation: 'مُی سْتُل بالْشُی ای نُوی.', pattern: 'мой + اسم + صفت', vocabulary: [['стол', 'میز'], ['большо́й', 'بزرگ'], ['но́вый', 'نو']] },
      { text: 'Моя́ ко́мната ма́ленькая и краси́вая.', fa: 'اتاقِ من کوچک و زیبا است.', pronunciation: 'مایا کُمناتا مالِنْکایا ای کْراسیوایا.', pattern: 'моя́ + اسم مؤنث + صفت (-ая)', vocabulary: [['ко́мната', 'اتاق'], ['ма́ленькая', 'کوچک (مؤنث)'], ['краси́вая', 'زیبا (مؤنث)']] },
      { text: 'Э́то вку́сный суп.', fa: 'این سوپِ خوشمزه‌ای است.', pronunciation: 'اِتا فْکوسْنی سوپ.', pattern: 'Э́то + صفت + اسم', vocabulary: [['вку́сный', 'خوشمزه'], ['суп', 'سوپ']] },
      { text: 'Э́то зелёное я́блоко.', fa: 'این یک سیبِ سبز است.', pronunciation: 'اِتا زیلیُنایه یابْلاکا.', pattern: 'Э́то + صفت خنثی (-ое) + اسم', vocabulary: [['зелёное', 'سبز (خنثی)'], ['я́блоко', 'سیب']] },
      { text: 'Наш учи́тель до́брый.', fa: 'معلمِ ما مهربان است.', pronunciation: 'ناش اوچیتِل دُبْری.', pattern: 'Наш + اسم + صفت', vocabulary: [['учи́тель', 'معلم'], ['до́брый', 'مهربان']] },
      { text: 'Моя́ подру́га у́мная.', fa: 'دوست (خانم) من باهوش است.', pronunciation: 'مایا پادْروگا اومْنایا.', pattern: 'Моя́ + اسم مؤنث + صفت', vocabulary: [['подру́га', 'دوست (خانم)'], ['у́мная', 'باهوش (مؤنث)']] },
      { text: 'Мой друг хоро́ший челове́к.', fa: 'دوست من انسانِ خوبی است.', pronunciation: 'مُی دْروک خارُشی چیلاوِک.', pattern: 'Мой друг + صفت + اسم', vocabulary: [['друг', 'دوست'], ['хоро́ший', 'خوب'], ['челове́к', 'انسان']] },
      { text: 'Э́та де́вочка ма́ленькая.', fa: 'این دختر کوچک است.', pronunciation: 'اِتا دِواچْکا مالِنْکایا.', pattern: 'Э́та + اسم مؤنث + صفت', vocabulary: [['де́вочка', 'دختر'], ['ма́ленькая', 'کوچک (مؤنث)']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то вку́сный суп?', fa: 'آیا این سوپ خوشمزه‌ای است؟', pronunciation: 'اِتا فْکوسْنی سوپ؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, э́то вку́сный суп.', fa: 'بله، این سوپ خوشمزه‌ای است.', pronunciation: 'دا، اِتا فْکوسْنی سوپ.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Кто твой учи́тель?', fa: 'معلم تو کیست؟', pronunciation: 'کْتو تْوُی اوچیتِل؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Наш учи́тель хоро́ший и до́брый.', fa: 'معلم ما خوب و مهربان است.', pronunciation: 'ناش اوچیتِل خارُشی ای دُبْری.' },
    ],
    checks: [
      { promptFa: 'برای اسم خنثیِ «я́блоко» کدام شکلِ «سبز» درست است؟', choices: ['зелёный', 'зелёная', 'зелёное', 'зелёную'], correctIndex: 2, explanationFa: 'صفت خنثی به «-ое / -ее» ختم می‌شود: «зелёное я́блоко».' },
      { promptFa: '«Наш учи́тель до́брый.» یعنی چه؟', choices: ['معلم ما مهربان است.', 'اتاق ما کوچک است.', 'دوست من باهوش است.', 'این سوپ خوشمزه است.'], correctIndex: 0, explanationFa: '«до́брый» یعنی «مهربان».' },
      { promptFa: 'کدام جمله دربارهٔ «подру́га» (دوستِ خانم) درست است؟', choices: ['Мой подру́га у́мный.', 'Моя́ подру́га у́мная.', 'Мой подру́га у́мная.', 'Моя́ подру́га у́мный.'], correctIndex: 1, explanationFa: 'برای اسم مؤنث هم ضمیر ملکی («моя́») و هم صفت («у́мная») مؤنث می‌آیند.' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // بخش ۸: مکالمات ابتدایی (مرحلهٔ ۵: مکالمه — استفاده از آموخته‌ها)
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'ru-pre-24-conv-greeting-intro',
    module: RUSSIAN_PRE_A1_MODULES[7],
    title: 'مکالمه: سلام، احوال‌پرسی و آشنایی',
    subtitle: 'سلام و احوال‌پرسی، آشنایی با یک شخص، معرفی خود',
    situation: 'ترکیب تمام عبارت‌ها و جمله‌های معرفی خود در یک مکالمهٔ کامل و واقعی آشنایی.',
    teachingFa: 'هدف: اجرای کامل مکالمهٔ «سلام و احوال‌پرسی»، «آشنایی با یک شخص» و «معرفی خود».\nتلفظ: О́чень прия́тно = «اُچِن پْری‌یاتْنا»؛ А у тебя́ = «آ او تیبْیا».\nنکتهٔ تدریجی: «А у тебя́?» (و تو چطوری؟) سؤال را به طرف مقابل برمی‌گرداند. برای خانم دانشجو به جای «студе́нт» از «студе́нтка» استفاده می‌شود.',
    durationMinutes: 6,
    sentences: [
      { text: 'Здра́вствуйте! До́брое у́тро!', fa: 'سلام! صبح بخیر!', pronunciation: 'زْدْراسْت‌وُیْتِه! دُبْرایِه اوتْرا!', vocabulary: [['Здра́вствуйте', 'سلام (محترمانه)'], ['у́тро', 'صبح']] },
      { text: 'Приве́т! Как дела́?', fa: 'سلام! حالت چطور است؟', pronunciation: 'پْری‌ویت! کاک دیلا؟', vocabulary: [['Приве́т', 'سلام'], ['Как дела́', 'حالت چطور است']] },
      { text: 'Хорошо́, спаси́бо. А у тебя́?', fa: 'خوبم، ممنون. تو چطوری؟', pronunciation: 'خاراشُو، سْپاسیبا. آ او تیبْیا؟', pattern: 'Хорошо́, спаси́бо. А у + ضمیر?', vocabulary: [['Хорошо́', 'خوب'], ['у тебя́', 'حالِ تو']] },
      { text: 'Как тебя́ зову́т?', fa: 'اسم تو چیست؟', pronunciation: 'کاک تیبْیا زاووت؟', vocabulary: [['тебя́', 'تو را'], ['зову́т', 'صدا می‌زنند']] },
      { text: 'Меня́ зову́т Али́. Я из Ира́на.', fa: 'اسم من علی است. اهل ایران هستم.', pronunciation: 'مینْیا زاووت علی. یا ایز ایرانا.', vocabulary: [['Меня́ зову́т', 'اسم من است'], ['из Ира́на', 'اهل ایران']] },
      { text: 'Я Са́ра. Я студе́нтка.', fa: 'من سارا هستم. من دانشجو هستم.', pronunciation: 'یا سارا. یا سْتودِنْتْکا.', vocabulary: [['Я', 'من'], ['студе́нтка', 'دانشجو (خانم)']] },
      { text: 'О́чень прия́тно!', fa: 'خیلی خوشوقتم!', pronunciation: 'اُچِن پْری‌یاتْنا!', vocabulary: [['О́чень', 'خیلی'], ['прия́тно', 'خوشوقتم / دلپذیر']] },
      { text: 'До свида́ния! Уви́димся!', fa: 'خداحافظ! می‌بینمت!', pronunciation: 'دا سْویدانیا! اوویدیمْسیا!', vocabulary: [['До свида́ния', 'خداحافظ'], ['Уви́димся', 'می‌بینمت']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Приве́т! Как дела́?', fa: 'سلام! حالت چطور است؟', pronunciation: 'پْری‌ویت! کاک دیلا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Приве́т! Хорошо́, спаси́бо. Как тебя́ зову́т?', fa: 'سلام! خوبم، ممنون. اسمت چیست؟', pronunciation: 'پْری‌ویت! خاراشُو، سْپاسیبا. کاک تیبْیا زاووت؟' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Меня́ зову́т Са́ра. Я из Ира́на.', fa: 'اسم من سارا است. اهل ایران هستم.', pronunciation: 'مینْیا زاووت سارا. یا ایز ایرانا.' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Меня́ зову́т Али́. О́чень прия́тно!', fa: 'اسم من علی است. خیلی خوشوقتم!', pronunciation: 'مینْیا زاووت علی. اُچِن پْری‌یاتْنا!' },
    ],
    checks: [
      { promptFa: 'برای گفتن «خیلی خوشوقتم!» چه می‌گوییم؟', choices: ['До свида́ния!', 'А у тебя́?', 'О́чень прия́тно!', 'Как дела́?'], correctIndex: 2, explanationFa: '«О́чень прия́тно!» عبارت استاندارد هنگام آشنایی است.' },
      { promptFa: '«А у тебя́?» در پاسخ به احوال‌پرسی چه نقشی دارد؟', choices: ['خداحافظی می‌کند', 'سؤال را به طرف مقابل برمی‌گرداند («تو چطوری؟»)', 'اسم می‌پرسد', 'تشکر می‌کند'], correctIndex: 1, explanationFa: '«А у тебя́?» یعنی «و حالِ تو چطور است؟».' },
      { promptFa: 'واژهٔ «Уви́димся!» یعنی چه؟', choices: ['می‌بینمت!', 'صبح بخیر!', 'خوشوقتم!', 'اهل ایرانم!'], correctIndex: 0, explanationFa: '«Уви́димся!» یعنی «می‌بینمت».' },
    ],
  },
  {
    id: 'ru-pre-25-conv-family-home',
    module: RUSSIAN_PRE_A1_MODULES[7],
    title: 'مکالمه: خانواده و خانه',
    subtitle: 'صحبت دربارهٔ خانواده و صحبت دربارهٔ خانه',
    situation: 'گفت‌وگوی ساده دربارهٔ خانه، تعداد اتاق‌ها و اعضای خانواده.',
    teachingFa: 'هدف: به‌کارگیری آموخته‌ها در مکالمه دربارهٔ خانواده و خانه.\nتلفظ: Живёт = «ژیویُت»؛ Три ко́мнаты = «تْری کُمناتی».\nنکتهٔ تدریجی: ۱) برای «او زندگی می‌کند» از «живёт» (شکل سوم‌شخصِ `жить`) استفاده می‌شود. ۲) پس از عدد ۲، ۳ و ۴ شکل اسم کمی تغییر می‌کند (`одна́ ко́мната` ← `три ко́мнаты`).',
    durationMinutes: 6,
    sentences: [
      { text: 'Э́то твой дом?', fa: 'این خانهٔ تو است؟', pronunciation: 'اِتا تْوُی دُم؟', vocabulary: [['твой', 'مالِ تو'], ['дом', 'خانه']] },
      { text: 'Да, здесь живёт моя́ семья́.', fa: 'بله، اینجا خانوادهٔ من زندگی می‌کند.', pronunciation: 'دا، زْدِس ژیویُت مایا سیمْیا.', vocabulary: [['живёт', 'زندگی می‌کند'], ['семья́', 'خانواده']] },
      { text: 'Наш дом большо́й и краси́вый.', fa: 'خانهٔ ما بزرگ و زیبا است.', pronunciation: 'ناش دُم بالْشُی ای کْراسیوی.', vocabulary: [['Наш', 'مالِ ما'], ['краси́вый', 'زیبا']] },
      { text: 'Здесь есть три ко́мнаты.', fa: 'اینجا سه اتاق هست.', pronunciation: 'زْدِس یِسْت تْری کُمناتی.', pattern: 'Здесь есть + عدد + اسم', vocabulary: [['три', 'سه'], ['ко́мнаты', 'اتاق‌ها (با ۳)']] },
      { text: 'У меня́ есть ма́ма, па́па и брат.', fa: 'من مادر، پدر و برادر دارم.', pronunciation: 'او مینْیا یِسْت ماما، پاپا ای بْرات.', vocabulary: [['ма́ма', 'مادر'], ['брат', 'برادر']] },
      { text: 'Мою́ ма́му зову́т А́нна.', fa: 'اسم مادرم آنا است.', pronunciation: 'مایو مامو زاووت آنّا.', vocabulary: [['ма́му', 'مادر'], ['зову́т', 'صدا می‌زنند']] },
      { text: 'Мой брат ещё ма́ленький.', fa: 'برادرم هنوز کوچک است.', pronunciation: 'مُی بْرات یِشْچُ مالِنْکی.', vocabulary: [['ещё', 'هنوز'], ['ма́ленький', 'کوچک']] },
      { text: 'Моя́ ко́мната ти́хая и све́тлая.', fa: 'اتاق من آرام و روشن است.', pronunciation: 'مایا کُمناتا تیخایا ای سْوِتْلایا.', vocabulary: [['ти́хая', 'آرام (مؤنث)'], ['све́тлая', 'روشن (مؤنث)']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Э́то твой дом?', fa: 'این خانهٔ تو است؟', pronunciation: 'اِتا تْوُی دُم؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, э́то наш дом. Он большо́й и краси́вый.', fa: 'بله، این خانهٔ ما است. بزرگ و زیبا است.', pronunciation: 'دا، اِتا ناش دُم. اُن بالْشُی ای کْراسیوی.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'У тебя́ есть брат и́ли сестра́?', fa: 'آیا برادر یا خواهر داری؟', pronunciation: 'او تیبْیا یِسْت بْرات ایلی سیسْتْرا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'У меня́ есть брат. Он ма́ленький.', fa: 'من یک برادر دارم. او کوچک است.', pronunciation: 'او مینْیا یِسْت بْرات. اُن مالِنْکی.' },
    ],
    checks: [
      { promptFa: '«Здесь живёт моя́ семья́.» یعنی چه؟', choices: ['اینجا سه اتاق هست.', 'اینجا خانوادهٔ من زندگی می‌کند.', 'برادرم هنوز کوچک است.', 'اتاق من روشن است.'], correctIndex: 1, explanationFa: '«живёт» یعنی «زندگی می‌کند».' },
      { promptFa: 'پس از عدد «три» (۳) کلمهٔ «ко́мната» به چه شکلی می‌آید؟', choices: ['ко́мната', 'ко́мнат', 'ко́мнаты', 'ко́мнату'], correctIndex: 2, explanationFa: 'پس از ۲، ۳ و ۴ از شکل «ко́мнаты» استفاده می‌شود.' },
      { promptFa: '«ти́хая и све́тлая» چه معنی دارد؟', choices: ['بزرگ و زیبا', 'جدید و قدیمی', 'آرام و روشن', 'خوب و مهربان'], correctIndex: 2, explanationFa: '«ти́хая» یعنی آرام و «све́тлая» یعنی روشن.' },
    ],
  },
  {
    id: 'ru-pre-26-conv-objects',
    module: RUSSIAN_PRE_A1_MODULES[7],
    title: 'مکالمه: صحبت دربارهٔ اشیا',
    subtitle: 'پیدا کردن وسایل، پرسیدن مالکیت و جای چیزها',
    situation: 'گفت‌وگو دربارهٔ وسایل روزمره (کتاب، قلم، گوشی، کلید، کیف) و محل قرارگیری آن‌ها.',
    teachingFa: 'هدف: مکالمه دربارهٔ اشیا، مالکیت («مال کیست؟») و مکان («روی میز / توی کیف»).\nتلفظ: На столе́ = «نا سْتالِه»؛ В су́мке = «ف سومْکِه»؛ Вот = «وُت».\nنکتهٔ تدریجی: برای گفتن جای چیزها، حروف اضافهٔ «на» (رویِ) و «в» (در / تویِ) باعث می‌شوند اسم در پایان خود «-е» بگیرد: `стол` ← `на столе́`، `су́мка` ← `в су́мке`.',
    durationMinutes: 6,
    sentences: [
      { text: 'Что э́то на столе́?', fa: 'آن روی میز چیست؟', pronunciation: 'شْتو اِتا نا سْتالِه؟', pattern: 'Что э́то + на + اسم (-е)?', vocabulary: [['на', 'رویِ'], ['столе́', 'میز (در جایگاه)']] },
      { text: 'Э́то моя́ но́вая кни́га.', fa: 'این کتابِ نوِ من است.', pronunciation: 'اِتا مایا نُوایا کْنیگا.', vocabulary: [['моя́', 'مالِ من'], ['но́вая', 'نو']] },
      { text: 'Чья э́то ру́чка?', fa: 'این قلم مال کیست؟', pronunciation: 'چْیا اِتا روچْکا؟', vocabulary: [['Чья', 'مالِ چه کسی'], ['ру́чка', 'قلم']] },
      { text: 'Э́то ру́чка Али́.', fa: 'این قلمِ علی است.', pronunciation: 'اِتا روچْکا علی.', vocabulary: [['ру́чка', 'قلم'], ['Али́', 'علی']] },
      { text: 'Где мой телефо́н?', fa: 'گوشی من کجاست؟', pronunciation: 'گْدِه مُی تیلیفُن؟', vocabulary: [['Где', 'کجا'], ['телефо́н', 'گوشی']] },
      { text: 'Твой телефо́н здесь, в су́мке.', fa: 'گوشی تو اینجا، توی کیف است.', pronunciation: 'تْوُی تیلیفُن زْدِس، ف سومْکِه.', pattern: 'в + اسم (-е)', vocabulary: [['в', 'تویِ / در'], ['су́мке', 'کیف (در جایگاه)']] },
      { text: 'У тебя́ есть ключ?', fa: 'آیا کلید داری؟', pronunciation: 'او تیبْیا یِسْت کْلیوچ؟', vocabulary: [['ключ', 'کلید']] },
      { text: 'Да, вот мой ключ.', fa: 'بله، بفرما این کلیدِ من است.', pronunciation: 'دا، وُت مُی کْلیوچ.', vocabulary: [['вот', 'این هم / بفرما']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Чья э́то су́мка?', fa: 'این کیف مال کیست؟', pronunciation: 'چْیا اِتا سومْکا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Э́то моя́ су́мка. Здесь моя́ кни́га и ру́чка.', fa: 'این کیفِ من است. اینجا کتاب و قلمِ من است.', pronunciation: 'اِتا مایا سومْکا. زْدِس مایا کْنیگا ای روچْکا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Где твой ключ?', fa: 'کلید تو کجاست؟', pronunciation: 'گْدِه تْوُی کْلیوچ؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Вот мой ключ, спаси́бо!', fa: 'این هم کلیدِ من، ممنون!', pronunciation: 'وُت مُی کْلیوچ، سْپاسیبا!' },
    ],
    checks: [
      { promptFa: '«توی کیف» به روسی کدام است؟', choices: ['на столе́', 'в су́мке', 'под ру́чкой', 'у меня́'], correctIndex: 1, explanationFa: '«в» یعنی «در / تویِ» و اسم پس از آن پایانهٔ «-е» می‌گیرد: «в су́мке».' },
      { promptFa: '«Вот мой ключ.» یعنی چه؟', choices: ['کلید من کجاست؟', 'این هم کلیدِ من.', 'کلید روی میز است.', 'این کلید مال کیست؟'], correctIndex: 1, explanationFa: '«вот» برای نشان دادن چیزی که پیش روی ماست به کار می‌رود.' },
      { promptFa: '«Что э́то на столе́?» چه می‌پرسد؟', choices: ['این میز مال کیست؟', 'روی میز چیست؟', 'میز کجاست؟', 'چند میز هست؟'], correctIndex: 1, explanationFa: '«на столе́» یعنی «روی میز».' },
    ],
  },
  {
    id: 'ru-pre-27-conv-food-shopping',
    module: RUSSIAN_PRE_A1_MODULES[7],
    title: 'مکالمه: غذا و خرید ساده',
    subtitle: 'صحبت دربارهٔ غذا و خرید روزمره',
    situation: 'درخواست غذا و نوشیدنی در کافه یا مغازه، پرسیدن موجودی و پرسیدن قیمت.',
    teachingFa: 'هدف: گفت‌وگو دربارهٔ غذا و خرید ساده با ادب و قیمت‌پرسیدن.\nتلفظ: Что вы хоти́те = «شْتو وی خاتیتِه»؛ Возьми́те = «وازْمیتِه».\nنکتهٔ تدریجی: برای مخاطب محترمانه («شما») به جای «ты хо́чешь» می‌گوییم «вы хоти́те» (چه می‌خواهید؟). همچنین بعد از عددهایی مثل «два́дцать» از شکل جمعِ «рубле́й» (روبل) استفاده می‌کنیم.',
    durationMinutes: 6,
    sentences: [
      { text: 'Что вы хоти́те?', fa: 'شما چه می‌خواهید؟', pronunciation: 'شْتو وی خاتیتِه؟', pattern: 'Что вы хоти́те?', vocabulary: [['вы', 'شما'], ['хоти́те', 'می‌خواهید']] },
      { text: 'Я хочу́ хлеб и сыр.', fa: 'من نان و پنیر می‌خواهم.', pronunciation: 'یا خاچو خْلِب ای سیر.', vocabulary: [['хлеб', 'نان'], ['сыр', 'پنیر']] },
      { text: 'У вас есть све́жее молоко́?', fa: 'آیا شیرِ تازه دارید؟', pronunciation: 'او واس یِسْت سْوِژِیه مالاکُو؟', pattern: 'У вас есть + ...?', vocabulary: [['У вас есть', 'شما دارید'], ['све́жее', 'تازه (خنثی)'], ['молоко́', 'شیر']] },
      { text: 'Да, коне́чно. Вот молоко́.', fa: 'بله، حتماً. بفرمایید شیر.', pronunciation: 'دا، کانیِشْنا. وُت مالاکُو.', vocabulary: [['коне́чно', 'حتماً'], ['Вот', 'بفرمایید / این هم']] },
      { text: 'Извини́те, ско́лько э́то сто́ит?', fa: 'ببخشید، این چقدر است؟', pronunciation: 'ایزْوینیتِه، سْکُلْکا اِتا سْتُیت؟', vocabulary: [['Извини́те', 'ببخشید'], ['ско́лько', 'چقدر'], ['сто́ит', 'قیمت دارد']] },
      { text: 'Два́дцать рубле́й.', fa: 'بیست روبل.', pronunciation: 'دْواتْسات روبْلِی.', pattern: 'عدد + рубле́й', vocabulary: [['Два́дцать', 'بیست'], ['рубле́й', 'روبل']] },
      { text: 'Я люблю́ вку́сный суп и чай.', fa: 'من سوپِ خوشمزه و چای دوست دارم.', pronunciation: 'یا لیوبْلیو فْکوسْنی سوپ ای چای.', vocabulary: [['вку́сный', 'خوشمزه'], ['суп', 'سوپ']] },
      { text: 'Возьми́те, пожа́луйста. Спаси́бо!', fa: 'بفرمایید بگیرید، لطفاً. متشکرم!', pronunciation: 'وازْمیتِه، پاژالُیْسْتا. سْپاسیبا!', vocabulary: [['Возьми́те', 'بفرمایید / بردارید'], ['Спаси́бо', 'متشکرم']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Здра́вствуйте! Что вы хоти́те?', fa: 'سلام! چه می‌خواهید؟', pronunciation: 'زْدْراسْت‌وُیْتِه! شْتو وی خاتیتِه؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Хлеб, сыр и во́ду, пожа́луйста.', fa: 'نان، پنیر و آب، لطفاً.', pronunciation: 'خْلِب، سیر ای وُدو، پاژالُیْسْتا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Хорошо́. Вот хлеб, сыр и вода́.', fa: 'بسیار خوب. بفرمایید نان، پنیر و آب.', pronunciation: 'خاراشُو. وُت خْلِب، سیر ای وادا.' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Ско́лько э́то сто́ит? Спаси́бо!', fa: 'این چقدر است؟ ممنون!', pronunciation: 'سْکُلْکا اِتا سْتُیت؟ سْپاسیبا!' },
    ],
    checks: [
      { promptFa: 'برای پرسیدن محترمانهٔ «شما چه می‌خواهید؟» کدام درست است؟', choices: ['Что вы хоти́те?', 'Что э́то?', 'Кто вы?', 'Где молоко́?'], correctIndex: 0, explanationFa: '«вы хоти́те» شکل محترمانه و جمعِ فعل «خواستن» است.' },
      { promptFa: '«У вас есть све́жее молоко́?» یعنی چه؟', choices: ['شیر تازه است؟', 'آیا شیر تازه دارید؟', 'شیر چند است؟', 'من شیر می‌خواهم.'], correctIndex: 1, explanationFa: '«У вас есть ...?» یعنی «آیا شما ... دارید؟».' },
      { promptFa: 'واژهٔ «Возьми́те» در پایان خرید چه معنی دارد؟', choices: ['می‌بینمت', 'نمی‌دانم', 'ببخشید', 'بفرمایید بگیرید'], correctIndex: 3, explanationFa: '«Возьми́те, пожа́луйста» یعنی «بفرمایید / تحویل بگیرید، لطفاً».' },
    ],
  },
  {
    id: 'ru-pre-28-conv-classroom',
    module: RUSSIAN_PRE_A1_MODULES[7],
    title: 'مکالمه: مکالمه در کلاس',
    subtitle: 'گفت‌وگو با معلم، خواندن و نوشتن و درخواست تکرار',
    situation: 'مکالمهٔ ساده در کلاس درس: باز کردن کتاب، خواندن کلمه، گفتن «نمی‌دانم» و درخواست تکرار.',
    teachingFa: 'هدف: ارتباط ساده در کلاس با معلم و هم‌کلاسی‌ها.\nتلفظ: Откро́йте = «آتْکْرُیْتِه»؛ Повтори́те = «پافْتاریتِه».\nنکتهٔ تدریجی: فعل‌های خواهشِ محترمانه در کلاس اغلب به «-те» ختم می‌شوند (`Откро́йте` = باز کنید، `Повтори́те` = تکرار کنید). با یادگیری «извини́те, я не зна́ю» و «повтори́те, пожа́луйста» می‌توانید هر زمان در کلاس کمک بخواهید.',
    durationMinutes: 6,
    sentences: [
      { text: 'До́брое у́тро, учи́тель!', fa: 'صبح بخیر، معلم!', pronunciation: 'دُبْرایِه اوتْرا، اوچیتِل!', vocabulary: [['До́брое у́тро', 'صبح بخیر'], ['учи́тель', 'معلم']] },
      { text: 'Откро́йте кни́гу, пожа́луйста.', fa: 'لطفاً کتاب را باز کنید.', pronunciation: 'آتْکْرُیْتِه کْنیگو، پاژالُیْسْتا.', pattern: 'Откро́йте + اسم (-у), пожа́луйста', vocabulary: [['Откро́йте', 'باز کنید'], ['кни́гу', 'کتاب (مفعول)']] },
      { text: 'Чита́ем и пи́шем сло́во.', fa: 'کلمه را می‌خوانیم و می‌نویسیم.', pronunciation: 'چیتایِم ای پیشِم سْلُوا.', vocabulary: [['Чита́ем', 'می‌خوانیم'], ['пи́шем', 'می‌نویسیم'], ['сло́во', 'کلمه']] },
      { text: 'Я зна́ю э́то сло́во.', fa: 'من این کلمه را بلدم / می‌دانم.', pronunciation: 'یا زْنایو اِتا سْلُوا.', vocabulary: [['зна́ю', 'می‌دانم'], ['сло́во', 'کلمه']] },
      { text: 'Извини́те, я не зна́ю.', fa: 'ببخشید، من نمی‌دانم.', pronunciation: 'ایزْوینیتِه، یا نی زْنایو.', vocabulary: [['Извини́те', 'ببخشید'], ['не зна́ю', 'نمی‌دانم']] },
      { text: 'Повтори́те сло́во, пожа́луйста.', fa: 'لطفاً کلمه را تکرار کنید.', pronunciation: 'پافْتاریتِه سْلُوا، پاژالُیْسْتا.', vocabulary: [['Повтори́те', 'تکرار کنید'], ['сло́во', 'کلمه'], ['пожа́луйста', 'لطفاً']] },
      { text: 'Мне нужна́ ру́чка.', fa: 'قلم لازم دارم.', pronunciation: 'مْنِه نوژْنا روچْکا.', vocabulary: [['нужна́', 'لازم است'], ['ру́чка', 'قلم']] },
      { text: 'Хорошо́! Уро́к око́нчен. Пока́!', fa: 'خوب! درس تمام شد. خداحافظ!', pronunciation: 'خاراشُو! اورُک آکُنْچِن. پاکا!', vocabulary: [['Уро́к', 'درس'], ['око́нчен', 'تمام شد']] },
    ],
    dialogue: [
      { speaker: 'هم‌صحبت', role: 'partner', text: 'До́брое у́тро! У тебя́ есть кни́га и ру́чка?', fa: 'صبح بخیر! آیا کتاب و قلم داری؟', pronunciation: 'دُبْرایِه اوتْرا! او تیبْیا یِسْت کْنیگا ای روچْکا؟' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Да, учи́тель. У меня́ есть кни́га и ру́чка.', fa: 'بله، معلم. من کتاب و قلم دارم.', pronunciation: 'دا، اوچیتِل. او مینْیا یِسْت کْنیگا ای روچْکا.' },
      { speaker: 'هم‌صحبت', role: 'partner', text: 'Чита́ем сло́во «семья́»!', fa: 'کلمهٔ «семья́» (خانواده) را می‌خوانیم!', pronunciation: 'چیتایِم سْلُوا «سیمْیا»!' },
      { speaker: 'زبان‌آموز', role: 'learner', text: 'Извини́те, я не зна́ю. Повтори́те, пожа́луйста.', fa: 'ببخشید، نمی‌دانم. لطفاً تکرار کنید.', pronunciation: 'ایزْوینیتِه، یا نی زْنایو. پافْتاریتِه، پاژالُیْسْتا.' },
    ],
    checks: [
      { promptFa: 'وقتی می‌خواهید معلم کلمه‌ای را دوباره بگوید چه می‌گویید؟', choices: ['Уро́к око́нчен.', 'Повтори́те сло́во, пожа́луйста.', 'Откро́йте кни́гу.', 'Я зна́ю э́то сло́во.'], correctIndex: 1, explanationFa: '«Повтори́те сло́во, пожа́луйста» یعنی «لطفاً کلمه را تکرار کنید».' },
      { promptFa: '«Откро́йте кни́гу, пожа́луйста.» یعنی چه؟', choices: ['کلمه را بنویسید.', 'لطفاً کتاب را باز کنید.', 'درس تمام شد.', 'قلم لازم دارم.'], correctIndex: 1, explanationFa: '«Откро́йте» یعنی «باز کنید».' },
      { promptFa: '«Уро́к око́нчен.» چه معنی دارد؟', choices: ['صبح بخیر.', 'درس تمام شد.', 'من نمی‌دانم.', 'کتاب و قلم دارم.'], correctIndex: 1, explanationFa: '«Уро́к» یعنی «درس» و «око́нчен» یعنی «تمام شد».' },
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

export const RUSSIAN_PRE_A1_LESSONS: readonly LearningLesson[] = PRE_A1_LESSON_DEFS.map(def => ({
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
