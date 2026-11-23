export interface ArabicPronunciationExample {
  text: string;
  say: string;
  fa: string;
}

export interface ArabicPronunciationUnit {
  id: string;
  order: number;
  title: string;
  target: string;
  summary: string;
  mouthGuide: string;
  contrastTip: string;
  examples: ArabicPronunciationExample[];
  practiceText: string;
}

/**
 * 4 structured Modern Standard Arabic pronunciation workshop units
 * covering the sounds that Persian learners most often confuse (throat letters,
 * emphatic consonants, shadda/tanwin/vowel length, and hamza/taa marbuta).
 */
export const ARABIC_PRONUNCIATION_UNITS: readonly ArabicPronunciationUnit[] = [
  {
    id: 'ar-throat-letters',
    order: 1,
    title: 'حروف حلقی: ع، ح، خ، غ',
    target: 'ع / ح / خ / غ',
    summary: 'در عربی «ع» و «ح» از بخش میانی گلو و بدون لرزش کام ادا می‌شوند و با «ا» و «ه» تفاوت معنایی می‌سازند.',
    mouthGuide: 'برای «ح»، نفس گرم را از میانهٔ گلو روان بفرست (مثل پاک‌کردن عینک با بخار). برای «ع»، همان نقطه را کمی جمع کن تا صدای گرفته و عمیق بسازد.',
    contrastTip: 'تفاوت «حَبّ» (دانه) با «هَبّ» (وزید) و «عَلِمَ» (دانست) با «أَلِمَ» (درد کشید) فقط در مخرج حلقی است.',
    examples: [
      { text: 'حَالٌ', say: 'حالُن', fa: 'حال و وضعیت' },
      { text: 'عَرَبِيٌّ', say: 'عَرَبیّ', fa: 'عربی' },
      { text: 'صَبَاحُ الْخَيْرِ', say: 'صَباحُ‌لْخَیْر', fa: 'صبح بخیر' },
    ],
    practiceText: 'صَبَاحُ الْخَيْرِ، كَيْفَ حَالُكَ؟',
  },
  {
    id: 'ar-emphatic-consonants',
    order: 2,
    title: 'حروف مفخمه (درشت): ص، ض، ط، ظ',
    target: 'ص / ض / ط / ظ',
    summary: 'حروف مفخمه با بالارفتن ریشهٔ زبان به سمت کام ادا می‌شوند و فتحه پس از آن‌ها پرحجم‌تر شنیده می‌شود.',
    mouthGuide: 'نوک زبان در محل «س/د/ت/ذ» می‌ماند، اما عقب زبان به طرف سقف دهان بالا می‌رود تا صدا پر و بم شود.',
    contrastTip: 'در فارسی «س» و «ص» یکی تلفظ می‌شوند، ولی در عربی «سَفَر» با «صَفَر» و «تِين» (انجیر) با «طِين» (گِل) کاملاً متفاوت‌اند.',
    examples: [
      { text: 'صَدِيقٌ', say: 'صَدیقُن', fa: 'دوست' },
      { text: 'طَعَامٌ', say: 'طَعامُن', fa: 'غذا' },
      { text: 'ضَرُورِيٌّ', say: 'ضَروریّ', fa: 'ضروری' },
    ],
    practiceText: 'هَذَا طَعَامٌ طَيِّبٌ يَا صَدِيقِي',
  },
  {
    id: 'ar-vowels-shadda-tanwin',
    order: 3,
    title: 'حرکات کوتاه و بلند، تشدید و تنوین',
    target: 'ـَ ا / ـُ و / ـِ ي / ـّ / ـٌ',
    summary: 'کشش حرکت کوتاه (فتحه/ضمه/کسره) به حرف مدّی (ا/و/ي) و تشدید حرف، مستقیم معنی کلمه را عوض می‌کند.',
    mouthGuide: 'حرکت کوتاه را ضربه‌ای و سریع بخوان (۱ ضرب) و حرف مدّی را دو برابر بکش (۲ ضرب). روی حرف مشدّد مکث کوتاه کن.',
    contrastTip: '«كَتَبَ» (نوشت) با «كَاتَبَ» (مکاتبه کرد) و «عَلِمَ» (دانست) با «عَلَّمَ» (آموزش داد) دو واژهٔ جداگانه هستند.',
    examples: [
      { text: 'كِتَابٌ جَدِيدٌ', say: 'کِتابُن جَدیدُن', fa: 'کتاب جدید' },
      { text: 'مُعَلِّمٌ', say: 'مُعَلِّمُن', fa: 'آموزگار' },
      { text: 'شُكْرًا جَزِيلًا', say: 'شُکْرَنْ جَزیلَنْ', fa: 'بسیار سپاسگزارم' },
    ],
    practiceText: 'شُكْرًا جَزِيلًا، هَذَا كِتَابٌ جَدِيدٌ',
  },
  {
    id: 'ar-hamza-taa-marbuta',
    order: 4,
    title: 'همزه و تاء مربوطه (ة) در توقف و وصل',
    target: 'أ إ ء / ة',
    summary: '«ة» در پایان واژه هنگام وصل مثل «ت» و هنگام مکث پایانی مثل «ه» نرم خوانده می‌شود.',
    mouthGuide: 'اگر جمله ادامه دارد، تاء مربوطه را با حرکتش بخوان (مَدْرَسَةُ الْحَيِّ). اگر در پایان جمله ایستادی، مثل «ه» خفیف تمام کن (مَدْرَسَه).',
    contrastTip: 'همزهٔ قطع (أ/إ) همیشه با بسته و باز شدن ناگهانی حنجره تلفظ می‌شود، حتی در میانهٔ جمله.',
    examples: [
      { text: 'مَدْرَسَةٌ', say: 'مَدْرَسَتُن / مَدْرَسَه', fa: 'مدرسه' },
      { text: 'أَهْلًا وَسَهْلًا', say: 'أَهْلَنْ وَسَهْلَنْ', fa: 'خوش آمدید' },
      { text: 'لُغَةٌ عَرَبِيَّةٌ', say: 'لُغَتُن عَرَبِیَّتُن', fa: 'زبان عربی' },
    ],
    practiceText: 'أَهْلًا وَسَهْلًا فِي الْمَدْرَسَةِ',
  },
] as const;
