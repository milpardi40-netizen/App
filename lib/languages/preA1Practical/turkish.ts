import { balanceSamples, balancedTeaching, balancedDialogue, balancedChecks } from './balance';
import type { TurkishCourseLesson } from '../turkish';
import { practicalChecks, practicalDialogue, practicalNotes, type PracticalPlan } from './model';

// The first fourteen are word lessons, followed by five chunk lessons and six sentence lessons.
// No conversation is added to the word ladder.
const NOTES: Record<string, readonly [string, string, string]> = {
  'tr-prea1-01-greetings': ['سلام و پاسخ کوتاه مناسب را تشخیص بدهم.', 'Merhaba سلام عمومی و Selam دوستانه است؛ فعلاً خود واژه‌ها را بشنو.', 'فقط Evet را با Hayır عوض کن.'],
  'tr-prea1-02-how-are-you': ['ضمیرهای پایه را از هم تشخیص بدهم.', 'O برای او، زن یا مرد، یکسان است؛ این درس ضمیر است نه گفت‌وگوی احوال‌پرسی.', 'فقط Ben را با Sen عوض کن.'],
  'tr-prea1-03-basic-verbs': ['معنی چند فعل پایه را بشناسم.', 'پایان -mek/-mak نشانهٔ مصدر است؛ Gelmek و Gitmek هنوز جمله نیستند.', 'فقط Gelmek آمدن را با Gitmek رفتن مقایسه کن.'],
  'tr-prea1-04-adjectives-and-adverbs': ['صفت و رنگ پایه را بشنوم و تشخیص بدهم.', 'در küçük و büyük لب‌ها برای ü گردند؛ صدای آن ای فارسیِ ساده نیست.', 'فقط Küçük را با Büyük مقایسه کن.'],
  'tr-prea1-05-numbers-zero-to-seven': ['عددهای صفر تا هفت را تشخیص بدهم.', 'ı در sıfır و altı با i در bir یکسان نیست؛ زبان عقب‌تر است و لب‌ها گرد نمی‌شوند. ö در dört با لب گرد و زبان نزدیک اِ ادا می‌شود.', 'Sıfır و Bir را با تمرکز بر ı/i بشنو.'],
  'tr-prea1-06-numbers-eight-to-ten-weekdays': ['عددهای هشت تا ده و نام چند روز را بشناسم.', 'فعلاً Sekiz، Dokuz، On را بشمار؛ نام روزها را جداگانه بشنو، نه در یک پاسخ بلند.', 'فقط عدد Sekiz را با Dokuz عوض کن.'],
  'tr-prea1-07-food-and-drink': ['نام نوشیدنی و خوراکی‌های پایه را تشخیص بدهم.', 'در süt لب‌ها گرد و زبان جلو است؛ su واکهٔ عقب دارد. ç در çay مانند چ است.', 'فقط Su را با Çay عوض کن.'],
  'tr-prea1-08-family-and-relations': ['نسبت‌های نزدیک خانواده را تشخیص بدهم.', 'Kardeş خواهر یا برادر است؛ برخلاف فارسی خود این واژه جنسیت را مشخص نمی‌کند.', 'فقط Anne را با Baba عوض کن.'],
  'tr-prea1-09-places': ['نام چند مکان روزمره را تشخیص بدهم.', 'Durak ایستگاه توقف است؛ İstasyon بیشتر برای ایستگاه‌هایی مانند قطار به کار می‌رود.', 'فقط Ev را با Okul عوض کن.'],
  'tr-prea1-10-home-and-everyday-objects': ['نام وسایل روی میز را تشخیص بدهم.', 'ı در kapı با i در kitap فرق دارد؛ نام وسایل را جداگانه از صدا یاد بگیر.', 'Kitap و Kapı را با تمرکز بر واکهٔ آخر بشنو.'],
  'tr-prea1-11-personal-details-and-languages': ['نام کشور و زبان را از هم جدا کنم.', 'İran نام کشور، İranlı ایرانی و Farsça فارسی است؛ Türkçe نام زبان است.', 'فقط نام زبان Türkçe را با Farsça عوض کن.'],
  'tr-prea1-12-location-and-direction-words': ['واژه‌های اینجا، آنجا و جهت را تشخیص بدهم.', 'Burada اینجا و Orada آنجا است؛ برای پرسش مکان Nerede می‌آید.', 'فقط Burada را با Orada عوض کن.'],
  'tr-prea1-13-calendar-and-time-words': ['واژه‌های زمان نزدیک را تشخیص بدهم.', 'Bugün امروز و Yarın فردا است؛ ü در bugün را با لب گرد از صدا دنبال کن.', 'فقط Bugün را با Yarın عوض کن.'],
  'tr-prea1-14-question-and-connecting-words': ['واژهٔ پرسشی مناسب را تشخیص بدهم.', 'Ne برای چه و Kim برای چه کسی است؛ فعلاً همین تفاوت کافی است.', 'فقط Ne را با Kim مقایسه کن.'],
  'tr-prea1-05-first-word-pairs': ['دو واژه را به شکل یک ترکیب کوتاه بخوانم.', 'صفت پیش از اسم و بدون تغییر جنسیت می‌آید: küçük ev؛ پس از عدد اسم معمولاً مفرد است.', 'فقط küçük را با büyük در کنار ev عوض کن.'],
  'tr-prea1-06-verb-chunks': ['اسم و فعل پایه را کنار هم بفهمم.', 'در kitap okumak اسم پیش از مصدر است؛ -mak/-mek را با صدای واژه یاد بگیر، نه با حفظ فهرست قواعد.', 'فقط çay را با kahve در çay içmek عوض کن.'],
  'tr-prea1-introduction-chunks': ['ترکیب کوتاه معرفی خودم را بگویم.', 'Adım نام من و Adın نام تو است؛ تغییر ı/i بخشی از هماهنگی واکه‌ای است، نه تغییر جنسیت.', 'فقط نام Ece را با نام خودت عوض کن.'],
  'tr-prea1-number-and-time-chunks': ['یک ترکیب عددی یا زمانی کوتاه بفهمم.', 'saat üç یک ترکیب ساعت است؛ yarın sabah یعنی فردا صبح. این دو را بی‌دلیل یک قرار کامل حساب نکن.', 'فقط عدد را در dört kalem عوض کن.'],
  'tr-prea1-polite-requests-and-directions': ['با یک عبارت کوتاه نوشیدنی بخواهم.', 'Lütfen درخواست را مؤدبانه می‌کند؛ درخواست نوشیدنی را جدا از تمرین جهت‌ها تکرار کن.', 'فقط çay را با kahve در همان درخواست عوض کن.'],
  'tr-prea1-07-first-short-sentences': ['نام خودم را بگویم و نام مخاطب را تأیید کنم.', 'در Sen Mert misin بخش پرسشی جدا نوشته می‌شود؛ برای پاسخ Evet کافی است.', 'فقط نام Mert را عوض کن.'],
  'tr-prea1-descriptions-and-family': ['حالم را بگویم و یکی از نزدیکانم را معرفی کنم.', 'در ترکی جنسیت دستوری نداریم؛ iyi خوب و iyiyim خوبم است. Annem مادرم و Annen مادرت است؛ Babam پدرم و Baban پدرت است.', 'فقط Annem را با Babam در همان جمله عوض کن.'],
  'tr-prea1-08-simple-questions': ['نام و جای یک وسیله را بپرسم.', 'Bu ne دربارهٔ چیستی و Nerede دربارهٔ مکان است؛ پاسخ باید با پرسش هماهنگ باشد.', 'فقط Çanta را با Anahtar در پرسش مکان عوض کن.'],
  'tr-prea1-09-needs-and-places': ['در کافه یک سفارش کوتاه بدهم.', 'İstiyorum خواستن را بیان می‌کند؛ برای ادب Lütfen را اضافه کن.', 'فقط çay را با kahve عوض کن.'],
  'tr-prea1-time-and-calendar-sentences': ['ساعت را بپرسم و پاسخ کوتاه بدهم.', 'Saat kaç پرسش ساعت است؛ Saat üç پاسخ است. روز و زمان دیدار را جدا تمرین کن.', 'فقط üç را با beş در پاسخ ساعت عوض کن.'],
  'tr-prea1-10-first-conversation': ['راه مترو را بپرسم و دستور کوتاه بفهمم.', 'Düz gidin و sağa dönün خطاب مؤدبانه‌اند؛ yakın نزدیک و uzak دور است.', 'فقط sağa را با sola در دستور چرخیدن عوض کن.'],
};
const TURNS: Record<string, readonly number[]> = {
  'tr-prea1-introduction-chunks': [7, 0],
  'tr-prea1-polite-requests-and-directions': [0, 2],
  'tr-prea1-07-first-short-sentences': [3, 4],
  'tr-prea1-08-simple-questions': [0, 1, 3, 4],
  'tr-prea1-time-and-calendar-sentences': [4, 3],
};
export function enrichTurkishPreA1(lesson: TurkishCourseLesson): TurkishCourseLesson {
  const note = NOTES[lesson.id];
  if (lesson.levelId !== 0 || !note) return lesson;
  const plan: PracticalPlan = { goal: note[0], scene: lesson.learningMode === 'words' ? 'واژه‌های این درس را جداگانه می‌شنوی و از میان همان نمونه‌ها انتخاب می‌کنی.' : lesson.learningMode === 'chunks' ? 'با همان واژه‌های آشنا، ترکیب‌های کوتاه همین درس را تمرین می‌کنی.' : lesson.situation, tip: note[1], change: note[2], turns: TURNS[lesson.id] };
  // Chunk lists that are not exchanges remain a repetition practice, not a forced dialogue.
  const repetition = lesson.learningMode === 'words' || ['tr-prea1-05-first-word-pairs', 'tr-prea1-06-verb-chunks', 'tr-prea1-number-and-time-chunks', 'tr-prea1-polite-requests-and-directions'].includes(lesson.id);
  let dialogue = repetition ? [] : plan.turns ? practicalDialogue(lesson.sentences, plan) : lesson.dialogue;
  if (lesson.id === 'tr-prea1-09-needs-and-places') dialogue = [
    { speaker: 'مشتری', text: 'Merhaba. Bir çay istiyorum.', fa: 'سلام. یک چای می‌خواهم.' },
    { speaker: 'کارمند', text: 'Tamam.', fa: 'باشد.' },
    { speaker: 'مشتری', text: 'Bir ekmek, lütfen.', fa: 'یک نان، لطفاً.' },
    { speaker: 'کارمند', text: 'Tamam.', fa: 'باشد.' },
    { speaker: 'مشتری', text: 'Çok teşekkürler.', fa: 'خیلی ممنون.' },
  ];
  const checks = lesson.id === 'tr-prea1-08-simple-questions' ? practicalChecks(lesson.sentences, { ...plan, intent: ['نام یک چیز را می‌پرسد.', 'ساعت را می‌پرسد.', 'سلام می‌کند.', 'قیمت می‌گوید.'] }, lesson.checks?.length ?? 2).map(check => ({ ...check, choices: check.choices.slice(0, 3) })) : lesson.checks;
  const sentences = balanceSamples(lesson.id, lesson.sentences);
  dialogue = balancedDialogue(lesson.id, sentences) ?? dialogue;
  return { ...lesson, ...practicalNotes(plan), teachingFa: balancedTeaching(lesson.id, practicalNotes(plan).teachingFa), sentences, dialogue, checks: lesson.id === 'tr-prea1-08-simple-questions' ? balancedChecks(lesson.id, checks, sentences, dialogue) : checks };
}
