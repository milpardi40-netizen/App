/**
 * «میزبان گفت‌وگو» — a named companion per course × level so the conversation rooms
 * feel like talking to the same person across lessons, not a slideshow of strangers.
 * Display-only identity: hosts never add teaching content; they frame the scene.
 */
export interface ConversationHost {
  name: string;
  bio: string;
  emoji: string;
}

const HOSTS: Record<string, ConversationHost> = {
  // Russian
  'ru:0': { name: 'Ва́ня', bio: 'هم‌صحبت صمیمی برای اولین کلمه‌ها', emoji: '🙂' },
  'ru:1': { name: 'А́нна', bio: 'یک روز با آنا؛ از کافه تا داروخانه', emoji: '👩' },
  'ru:2': { name: 'Серге́й', bio: 'کار و شهر و زندگی روزمره', emoji: '🧑‍💼' },
  'ru:3': { name: 'Мари́на', bio: 'گفت‌وگوهای نظر داده و بحث نرم', emoji: '👩‍🏫' },
  'ru:4': { name: 'Дми́трий', bio: 'بحث‌های جدی‌تر با لحن رسانه‌ای', emoji: '🧔' },
  'ru:5': { name: 'Ири́на', bio: 'مکالمهٔ روان و رسمی', emoji: '👩‍💼' },
  // English
  'en:0': { name: 'Emma', bio: 'هم‌صحبت برای اولین جمله‌ها', emoji: '🙂' },
  'en:1': { name: 'Liam', bio: 'یک روز با لیام؛ خرید و کافه و مسیر', emoji: '👦' },
  'en:2': { name: 'Sophie', bio: 'کار، سفر و برنامه‌های روزمره', emoji: '👩' },
  'en:3': { name: 'James', bio: 'نظر دادن و گفت‌وگوی واقعی', emoji: '🧑' },
  'en:4': { name: 'Olivia', bio: 'بحث و استدلال روزمره', emoji: '👩‍💼' },
  'en:5': { name: 'Noah', bio: 'مکالمهٔ پیشرفته و روان', emoji: '🧔' },
  // Turkish
  'tr:0': { name: 'Elif', bio: 'هم‌صحبت اولین جمله‌های ترکی', emoji: '🙂' },
  'tr:1': { name: 'Kerem', bio: 'یک روز با کرمان؛ بازار و کافه', emoji: '👦' },
  'tr:2': { name: 'Zeynep', bio: 'کار و شهر و برنامه‌ها', emoji: '👩' },
  'tr:3': { name: 'Mert', bio: 'گفت‌وگوی نظر داده', emoji: '🧑' },
  'tr:4': { name: 'Ayşe', bio: 'بحث‌های روزمره', emoji: '👩‍💼' },
  'tr:5': { name: 'Emre', bio: 'مکالمهٔ روان پیشرفته', emoji: '🧔' },
  // German
  'de:0': { name: 'Lena', bio: 'هم‌صحبت اولین جمله‌ها', emoji: '🙂' },
  'de:1': { name: 'Jonas', bio: 'یک روز با یوناس؛ کافه و شهر', emoji: '👦' },
  'de:2': { name: 'Marie', bio: 'کار و زندگی روزمره', emoji: '👩' },
  'de:3': { name: 'Felix', bio: 'نظر دادن و گفت‌وگو', emoji: '🧑' },
  'de:4': { name: 'Hannah', bio: 'بحث روزمره', emoji: '👩‍💼' },
  'de:5': { name: 'Paul', bio: 'مکالمهٔ پیشرفته', emoji: '🧔' },
  // French
  'fr:0': { name: 'Julie', bio: 'هم‌صحبت اولین جمله‌ها', emoji: '🙂' },
  'fr:1': { name: 'Hugo', bio: 'یک روز با اگو؛ کافه و خیابان', emoji: '👦' },
  'fr:2': { name: 'Camille', bio: 'کار و روزمره', emoji: '👩' },
  'fr:3': { name: 'Louis', bio: 'گفت‌وگوی نظر داده', emoji: '🧑' },
  'fr:4': { name: 'Chloé', bio: 'بحث روزمره', emoji: '👩‍💼' },
  'fr:5': { name: 'Antoine', bio: 'مکالمهٔ پیشرفته', emoji: '🧔' },
  // Spanish
  'es:0': { name: 'Lucía', bio: 'هم‌صحبت اولین جمله‌ها', emoji: '🙂' },
  'es:1': { name: 'Mateo', bio: 'یک روز با ماتئو؛ کافه و بازار', emoji: '👦' },
  'es:2': { name: 'Valentina', bio: 'کار و روزمره', emoji: '👩' },
  'es:3': { name: 'Diego', bio: 'گفت‌وگوی نظر داده', emoji: '🧑' },
  'es:4': { name: 'Sofía', bio: 'بحث روزمره', emoji: '👩‍💼' },
  'es:5': { name: 'Javier', bio: 'مکالمهٔ پیشرفته', emoji: '🧔' },
  // Arabic
  'ar:0': { name: 'ليلى', bio: 'هم‌صحبت اولین جمله‌ها', emoji: '🙂' },
  'ar:1': { name: 'عمر', bio: 'یک روز با عمر؛ بازار و کافه', emoji: '👦' },
  'ar:2': { name: 'سارة', bio: 'کار و روزمره', emoji: '👩' },
  'ar:3': { name: 'خالد', bio: 'گفت‌وگوی نظر داده', emoji: '🧑' },
  'ar:4': { name: 'نور', bio: 'بحث روزمره', emoji: '👩‍💼' },
  'ar:5': { name: 'سامي', bio: 'مکالمهٔ پیشرفته', emoji: '🧔' },
};

export function hostFor(courseId: string, levelId: number): ConversationHost | undefined {
  return HOSTS[`${courseId}:${Math.max(0, Math.min(5, levelId))}`];
}
