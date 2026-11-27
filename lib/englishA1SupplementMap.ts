import { ENGLISH_A1_IDS, isEnglishA1Core } from './englishA1Scope';
import { ENGLISH_A1_COURSE_UNITS } from './englishSupplement/content';

export type EnglishA1SupportRole = 'prepare' | 'review' | 'extend';
export const ENGLISH_A1_SUPPORT_LABELS: Record<EnglishA1SupportRole, string> = {
  prepare: 'آمادگی پیشنهادی', review: 'مرور مرتبط', extend: 'گسترش اختیاری',
};
export interface EnglishA1UnitSupport {
  unitId: string;
  role: EnglishA1SupportRole;
  afterLessonId: string;
  relatedLessonIds: readonly string[];
  reasonFa: string;
}
const lesson = (number: number) => ENGLISH_A1_IDS[number - 1];
const link = (unitId: string, role: EnglishA1SupportRole, after: number, related: number[], reasonFa: string): EnglishA1UnitSupport => ({
  unitId, role, afterLessonId: lesson(after), relatedLessonIds: related.map(lesson), reasonFa,
});
/** Whole-unit recommendations, not a claim that every topic is a prerequisite to an early lesson.
 * Some bundles deliberately come later (e.g. weather+future after lesson 21).
 * Existing supplement locks/assessment requirements and core completions are NOT modified.
 */
export const ENGLISH_A1_SUPPLEMENT_MAP: readonly EnglishA1UnitSupport[] = [
  link('foundation-5','review',8,[5,8],'عددها را با ساعت ترکیب می‌کند؛ پس از درس ساعت برای مرور مناسب است.'),
  link('foundation-6','review',6,[6],'خانواده و مالکیت را پس از آموزش اصلی دوباره تمرین می‌کند.'),
  link('foundation-7','review',9,[9],'عادت‌ها و سوم‌شخص را مرور می‌کند؛ جای چهار گامِ درس اصلی را نمی‌گیرد.'),
  link('foundation-8','review',9,[9],'برای مرورِ جداگانهٔ سؤال و منفی با do/does پس از درس روزمره است.'),
  link('foundation-9','review',23,[2,23],'نام و هجی را به فرم کامل‌تر پیوند می‌دهد؛ کل واحد را پس از درس فرم انجام بده.'),
  link('foundation-10','extend',27,[20,27],'پیام چندجمله‌ای و پیونددهنده‌ها را گسترش می‌دهد؛ برای شروع دعوت، پیش‌نیاز نیست.'),
  link('a1-profile','extend',23,[1,5,22,23],'معرفی را با زبان، شغل و اطلاعات بیشتر ترکیب می‌کند؛ همهٔ آن برای درس اول لازم نیست.'),
  link('a1-describing-people','extend',14,[4,6,14],'توصیف ظاهر و ویژگی‌ها را به جمله‌های پایه اضافه می‌کند؛ گسترش اختیاری است.'),
  link('a1-home','review',7,[7,24],'there is/are و جای وسایل را مرور می‌کند؛ بعداً در اتاق و خانه به کار می‌آید.'),
  link('a1-town-directions','review',17,[16,17],'مسیر را با رفت‌وآمد ترکیب می‌کند؛ پس از دو درس مرتبط مرور شود.'),
  link('a1-food-cafe','extend',15,[13,15],'مقدار و some/any را به سفارش ساده اضافه می‌کند؛ برای سفارش اولیه اجباری نیست.'),
  link('a1-shopping-clothes','extend',14,[13,14],'اندازه، اشاره به کالا و مقایسهٔ ساده را گسترش می‌دهد.'),
  link('a1-abilities-requests','prepare',19,[3,19,22],'پس از درس کلاس و پیش از معرفی توانایی کاری، مرور can و درخواست‌ها پیشنهاد می‌شود؛ شرط بازشدن درس ۲۲ نیست.'),
  link('a1-free-time','review',20,[11,20],'علاقه را با دعوت و پیشنهاد جایگزین ترکیب می‌کند؛ کل واحد پس از دعوت مناسب‌تر است.'),
  link('a1-now-and-routines','review',10,[9,10],'عادت و کارِ در جریان را پس از آشنایی با هر دو مقایسه می‌کند.'),
  link('a1-health','review',29,[29],'حال عمومی و درخواست کمک زبانی را مرور می‌کند؛ توصیهٔ درمانی نیست.'),
  link('a1-weather-plans','extend',21,[12,21],'واحد هم آب‌وهوا دارد و هم برنامهٔ آینده؛ به همین دلیل کل آن بعد از درس ۲۱ پیشنهاد می‌شود، نه پیش‌نیاز درس ۱۲.'),
  link('a1-travel','review',26,[17,25,26],'جدول سفر، بلیت و رزرو هتل را پس از درس هتل جمع‌بندی می‌کند.'),
  link('a1-past','review',21,[21],'رویدادهای کوتاه گذشته را پس از گام‌های دیروز مرور می‌کند؛ حفظ فهرست افعال هدف نیست.'),
  link('a1-notices-messages','extend',28,[8,18,27,28],'تابلو و پیام را با زمان و پیوند جمله‌ها ترکیب می‌کند؛ مرور زمان‌های اولیه را با گسترش متن یکی نگیریم.'),
];
export const englishA1SupportForLesson = (id: string) => isEnglishA1Core(id)
  ? ENGLISH_A1_SUPPLEMENT_MAP.filter(item => item.relatedLessonIds.includes(id)) : [];
export const englishA1SupportForUnit = (id: string) => ENGLISH_A1_SUPPLEMENT_MAP.find(item => item.unitId === id);
export function englishA1SupportPreview(unitId: string) {
  const support = englishA1SupportForUnit(unitId);
  const unit = ENGLISH_A1_COURSE_UNITS.find(item => item.id === unitId);
  return support && unit ? { support, unit } : undefined;
}
export const englishA1SupportTiming = (item: EnglishA1UnitSupport) =>
  `زمان پیشنهادی: پس از درس ${ENGLISH_A1_IDS.indexOf(item.afterLessonId as typeof ENGLISH_A1_IDS[number]) + 1} مسیر اصلی A1`;
