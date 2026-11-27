/** Editorial quarantine from the English A1 audit. IDs/data remain valid for old backups.
 * This is NOT a deletion, renumbering, or a change to any other level/language.
 * Keep this module free of course imports so route guards can run before mounting a lesson.
 */
export const RETIRED_ENGLISH_A1_LAB_IDS = [
  'lab-en-a1-01', 'lab-en-a1-02', 'lab-en-a1-03', 'lab-en-a1-04',
  'lab-en-a1-05', 'lab-en-a1-06', 'lab-en-a1-07', 'lab-en-a1-08',
] as const;
const retired = new Set<string>(RETIRED_ENGLISH_A1_LAB_IDS);
export const isRetiredEnglishA1Lab = (id: string): boolean => retired.has(id);
export const isEnglishLessonAvailable = (lesson: { id: string }): boolean => !isRetiredEnglishA1Lab(lesson.id);
export const ENGLISH_A1_LAB_RETIREMENT_NOTICE = 'این آزمایشگاه قدیمی A1 برای بازبینی آموزشی از دسترس خارج شده است. سابقه و پیشرفت قبلی شما حذف نشده است؛ از مسیر اصلی A1 ادامه دهید.';
