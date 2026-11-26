import { balanceSamples, balancedTeaching, balancedDialogue, balancedChecks } from './balance';
import type { StarterLesson } from '../newCourses';
import plans from './european.json';
import { practicalChecks, practicalDialogue, practicalNotes, practicalRows, type PracticalPlan } from './model';

const FOUNDATION_NOTES: Record<string, readonly [string, string, string]> = {
  'de-foundation-sounds-1': ['صدای واژه‌های خیلی کوتاه را تشخیص بدهم.', 'واژهٔ bitte را کنار danke بشنو؛ فعلاً جمله‌سازی لازم نیست.', 'فقط آغاز واژه‌های Hallo و Haus را مقایسه کن.'],
  'de-foundation-sounds-2': ['صدای ü و ö را در واژه‌ها تشخیص بدهم.', 'برای ü لب‌ها گرد و زبان نزدیک صدای ای است؛ برای ö لب‌ها گرد و زبان نزدیک اِ است.', 'Tür و fünf را با لب گرد بشنو و تکرار کن.'],
  'de-foundation-words-1': ['واژه‌های نزدیکان خانواده را تشخیص بدهم.', 'Mutter مادر و Vater پدر است؛ این درس معرفی کامل خانواده نیست.', 'فقط واژهٔ Mutter را با Vater جابه‌جا کن.'],
  'de-foundation-words-2': ['عددهای پایه را بشنوم و بگویم.', 'z در zwei با صدای «تس» شروع می‌شود؛ عددها را از صدا دنبال کن.', 'zwei و drei را کنار هم بشنو و از هم تشخیص بده.'],
  'de-foundation-chunks-1': ['سلام و درخواست کوتاه مناسب را انتخاب کنم.', 'Guten Morgen صبح و Guten Abend عصر است؛ Nein, danke رد مؤدبانه است.', 'در سلام فقط Morgen را با Abend عوض کن.'],
  'de-foundation-chunks-2': ['اسم و همراهش را به شکل یک ترکیب بشناسم.', 'ein Buch و ein Stift در حالت معرفی‌اند؛ در درخواست حالت واژه ممکن است تغییر کند.', 'mein Vater و meine Mutter را به شکل دو واحد بشنو.'],
  'fr-foundation-sounds-1': ['آوای واژه‌های نخست را تشخیص بدهم.', 'در salut صدای u با لب گرد ادا می‌شود و t آخر خوانده نمی‌شود؛ فارسی‌نویسی تقریبی است.', 'در papa و maman فقط صدای آغاز را مقایسه کن.'],
  'fr-foundation-sounds-2': ['نوشتار و صدای چند واژهٔ رایج را وصل کنم.', 'h در hôtel تلفظ نمی‌شود؛ eau یک صدای «او» دارد و bon پایان خیشومی دارد.', 'é و è را در été و mère از روی صدا مقایسه کن.'],
  'fr-foundation-words-1': ['نام چند شخص و واژهٔ کمک را تشخیص بدهم.', 'Ami دوست مذکر است؛ برای یادگیری این واژه‌ها هنوز جملهٔ بلند لازم نیست.', 'Femme و Homme را برای زن و مرد از هم تشخیص بده.'],
  'fr-foundation-words-2': ['ضمیر و نام وسایل پایه را تشخیص بدهم.', 'je من و tu توی دوستانه است؛ این درس فقط شناخت واژه است.', 'فقط ضمیر je را با tu عوض کن.'],
  'fr-foundation-chunks-1': ['تشکر و درخواست کوتاه را تشخیص بدهم.', 'S’il vous plaît محترمانه است؛ برای درخواست از غریبه همین ترکیب آماده کافی است.', 'Bonne journée و Bonne soirée را برای روز و عصر مقایسه کن.'],
  'fr-foundation-chunks-2': ['ترکیب‌های اسمی کوتاه را یکجا بشنوم.', 'un livre مذکر است؛ mon père و ma mère با اسم هماهنگ‌اند، نه با جنسیت صاحب.', 'فقط نام عضو خانواده را در mon père و ma mère عوض کن.'],
  'es-foundation-sounds-1': ['صدای واژه‌های کوتاه را به نوشتار وصل کنم.', 'h در hola خاموش است؛ در گونهٔ اسپانیا صدای ci در gracias مانند ث شنیده می‌شود.', 'café و té را با تکیهٔ آخر بشنو.'],
  'es-foundation-sounds-2': ['ñ و j را در واژه‌های پایه تشخیص بدهم.', 'ñ در niño نزدیک «نی» پیوسته و j در rojo نزدیک خ است؛ c پیش از e/i در این دوره صدای ث دارد.', 'mañana و niño را با تمرکز بر ñ تکرار کن.'],
  'es-foundation-words-1': ['واژه‌های شخص و ادب را تشخیص بدهم.', 'Amigo و Amiga دوست مذکر و مؤنث‌اند؛ انتخاب واژه به شخص مورد اشاره مربوط است.', 'فقط Amigo را با Amiga عوض کن.'],
  'es-foundation-words-2': ['ضمیر و نام چند وسیله را تشخیص بدهم.', 'yo من و tú تو است؛ tú با تکیه با tu به معنی مال تو فرق نوشتاری دارد.', 'فقط ضمیر yo را با tú عوض کن.'],
  'es-foundation-chunks-1': ['سلام یا خداحافظی کوتاه مناسب را انتخاب کنم.', 'Hasta luego یعنی تا بعد؛ Bienvenido خطاب به مرد و Bienvenida خطاب به زن است.', 'در Hasta mañana و Hasta el lunes فقط زمان دیدار را مقایسه کن.'],
  'es-foundation-chunks-2': ['اسم و همراهش را به شکل ترکیب آماده بخوانم.', 'mi madre و mi padre هر دو mi دارند؛ جنسیت صاحب، mi را عوض نمی‌کند.', 'فقط madre را با padre عوض کن.'],
};

export function enrichEuropeanPreA1(lesson: StarterLesson): StarterLesson {
  if (lesson.levelId !== 0) return lesson;
  const foundation = FOUNDATION_NOTES[lesson.id];
  if (foundation) return { ...lesson, situation: `هدف: بتوانم ${foundation[0]}\nموقعیت: تمرین شنیدن و انتخاب همان واژه‌ها و ترکیب‌های این درس.`, teachingFa: balancedTeaching(lesson.id, `${foundation[1]}\nتمرین اصلی: ${foundation[2]}`), sentences: balanceSamples(lesson.id, lesson.sentences), checks: balancedChecks(lesson.id, lesson.checks, balanceSamples(lesson.id, lesson.sentences), []), dialogue: [] };
  const plan = (plans as unknown as Record<string, PracticalPlan>)[lesson.id];
  if (!plan) return lesson;
  const original = practicalRows(lesson.sentences, plan);
  const sentences = balanceSamples(lesson.id, original);
  const dialogue = balancedDialogue(lesson.id, sentences) ?? practicalDialogue(original, plan);
  const checks = balancedChecks(lesson.id, practicalChecks(original, plan, lesson.checks?.length ?? 3), sentences, dialogue);
  return { ...lesson, ...practicalNotes(plan), teachingFa: balancedTeaching(lesson.id, practicalNotes(plan).teachingFa), sentences, dialogue, checks };
}
