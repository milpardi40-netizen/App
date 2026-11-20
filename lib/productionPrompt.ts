/**
 * A lesson ends with real production: a written answer of a given length and a
 * spoken answer to the same situation. Courses with hand-written prompts pass
 * them in; otherwise a prompt is derived from the lesson's situation, so every
 * guided lesson in every language has one — including A1, where the target is
 * three to five short sentences, not an essay. The written answer is self-checked
 * on the device and never graded by the app.
 */
export interface ProductionPrompt {
  speaking: string;
  writing: string;
  checklist: readonly string[];
  /** Target length of the written answer, in words. */
  minWords: number;
}

export interface ProductionSource {
  id: string;
  title: string;
  situation: string;
  levelId: number;
}

const CHECKLIST_A1 = ['سه تا پنج جمله نوشته‌ام، نه بیشتر', 'از واژه‌های همین درس دست‌کم دو تا به کار برده‌ام', 'هر جمله فعل دارد و فعل با فاعل می‌خواند', 'معنی را از خودم گفته‌ام، نه ترجمهٔ کلمه‌به‌کلمه'];
const CHECKLIST_A2 = ['چهار تا شش جمله نوشته‌ام', 'نفی و سؤال هم در متنم هست', 'حالت/پیش‌وند درستِ واژه‌های این درس را رعایت کرده‌ام', 'یک نکتهٔ شخصی یا مثال واقعی اضافه کرده‌ام'];

const CHECKLIST: Record<number, readonly string[]> = {
  1: CHECKLIST_A1,
  2: CHECKLIST_A2,
  3: ['موقعیت روشن است و مخاطب معلوم', 'دست‌کم یک دلیل یا مثال آورده‌ام', 'زمان فعل‌ها با هم سازگارند', 'جمله‌ها با پیوند (چون، اما، بعد…) به هم وصل‌اند'],
  4: ['موضع من و دلیل آن روشن است', 'یک دیدگاه مخالف را هم گفته و پاسخ داده‌ام', 'ساختارهای این درس را به‌کار برده‌ام', 'لحن با مخاطب (رسمی/دوستانه) می‌خواند'],
  5: ['استدلال ساختار دارد: ادعا، دلیل، نتیجه', 'از واژگان دقیق و کم‌تکرار استفاده کرده‌ام', 'ظرافت معنایی (قید، وجه، تأکید) درست است', 'متن بدون ترجمهٔ ذهنی از فارسی نوشته شده'],
};

const MIN_WORDS: Record<number, number> = { 1: 10, 2: 18, 3: 30, 4: 50, 5: 80 };

const clean = (text: string) => text.replace(/\s+/g, ' ').replace(/[.。]+$/, '').trim();

export function productionPrompt(
  source: ProductionSource,
  explicit?: { speaking?: string; writing?: string; checklist?: readonly string[] } | string,
): ProductionPrompt {
  const level = Math.min(5, Math.max(1, source.levelId));
  const minWords = MIN_WORDS[level];
  const situation = clean(source.situation || source.title);
  const custom = typeof explicit === 'string' ? { writing: explicit } : explicit ?? {};
  const generic = level === 1
    ? {
      writing: `با واژه‌های همین درس دربارهٔ «${situation}» سه تا پنج جمله بنویس. لازم نیست قشنگ باشد؛ فقط هر جمله فعل داشته باشد و خودت آن را ساخته باشی.`,
      speaking: `دربارهٔ «${situation}» در سه تا پنج جمله حرف بزن: اول بگو کجا/با کهیی، بعد چه چیزی می‌بینی یا می‌خواهی، در آخر یک دلیل کوتاه.`,
    }
    : level === 2
      ? {
        writing: `دربارهٔ «${situation}» چهار تا شش جمله بنویس و دست‌کم یک نفی و یک سؤال هم در آن بیاور.`,
        speaking: `دو دقیقه دربارهٔ «${situation}» حرف بزن؛ وضعیت، یک مشکل یا خواسته، و کاری که انجام می‌دهی.`,
      }
      : level === 3
    ? {
      writing: `دربارهٔ این موقعیت بنویس: «${situation}». توضیح بده چه خبر است، چه می‌خواهی یا چه مشکلی هست، و یک پیشنهاد یا نتیجه بیاور.`,
      speaking: `تصور کن الان در این موقعیت هستی: «${situation}». حدود ۴۵ ثانیه بی‌وقفه حرف بزن؛ اول وضعیت، بعد خواسته‌ات، بعد یک دلیل.`,
    }
    : level === 4
      ? {
        writing: `دربارهٔ «${situation}» نظر بده: موضعت را بگو، با دو دلیل پشتیبانی کن، یک دیدگاه مخالف را مطرح و به آن پاسخ بده.`,
        speaking: `یک دقیقه دربارهٔ «${situation}» صحبت کن، طوری که انگار برای همکار یا دوستی توضیح می‌دهی؛ مثال واقعی بیاور.`,
      }
      : {
        writing: `متنی منسجم دربارهٔ «${situation}» بنویس: مسئله را صورت‌بندی کن، دو سمت را بسنج، و با جمع‌بندی استدلالی تمام کن.`,
        speaking: `یک ارائهٔ دو دقیقه‌ای دربارهٔ «${situation}» بده: مقدمه، سه نکتهٔ اصلی با مثال، و نتیجه.`,
      };
  return {
    writing: custom.writing ?? generic.writing,
    speaking: custom.speaking ?? generic.speaking,
    checklist: custom.checklist ?? CHECKLIST[level],
    minWords,
  };
}

export const countWords = (text: string) => text.trim().split(/\s+/).filter(word => /[\p{L}\p{N}]/u.test(word)).length;
