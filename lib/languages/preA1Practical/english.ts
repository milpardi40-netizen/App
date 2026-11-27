import { balanceSamples, balancedTeaching, balancedDialogue } from './balance';
import type { SentenceLesson } from '../../courseContent';
import { practicalNotes, practicalRows, type PracticalPlan } from './model';

const PLANS: Record<string, PracticalPlan> = {
  'prea1-01-hello': { goal: 'متناسب با وقت روز سلام کنم.', scene: 'صبح با هم‌تمرین روبه‌رو می‌شوی.', tip: 'Good morning صبح و Good evening عصر است؛ Hi دوستانه‌تر است.', change: 'فقط morning را با evening عوض کن.' },
  'prea1-02-bye': { goal: 'با اشاره به دیدار بعدی خداحافظی کنم.', scene: 'شب از دوستت جدا می‌شوی؛ فردا دوباره او را می‌بینی.', tip: 'Good night برای پایان شب است، نه سلام شبانه؛ tomorrow یعنی فردا.', change: 'فقط tomorrow را با later عوض کن.', turns: [4, 4, 6, 6] },
  'prea1-03-yes-no': { goal: 'پیشنهاد را قبول یا مؤدبانه رد کنم.', scene: 'به تو آب و چای تعارف می‌کنند.', tip: 'Yes, please قبول و No, thank you رد مؤدبانه است؛ Sorry برای عذرخواهی است. در گفت‌وگوی کوتاه، Water یعنی آب و Tea یعنی چای.', change: 'پاسخ به همان پیشنهاد را از قبول به رد تغییر بده.' },
  'prea1-04-i-am': { goal: 'نام و مبدأ خودم را کوتاه بگویم.', scene: 'با هم‌تمرین تازه آشنا می‌شوی.', tip: 'با I از am استفاده کن؛ نام و حالت هر دو می‌توانند پس از I am بیایند.', change: 'فقط نام را در I am Ali عوض کن.', turns: [0, 1, 6, 7] },
  'prea1-05-numbers': { goal: 'عددهای یک تا ده را بشنوم و بگویم.', scene: 'با صدا عددها را می‌شماری و تشخیص می‌دهی.', tip: 'این درس شمارش است، نه مکالمه؛ برای th در three زبان نزدیک لبهٔ دندان‌هاست، نه صدای س.', change: 'فقط جهت شمارش هشت، نه، ده را برعکس کن.', turns: [] },
  'prea1-06-how-are-you': { goal: 'حالم را بگویم و حال دوستم را بپرسم.', scene: 'دوستت پس از سلام احوالت را می‌پرسد.', tip: 'And you پرسش را به طرف مقابل برمی‌گرداند؛ a little یعنی کمی.', change: 'فقط fine را با a little tired عوض کن.' },
  'prea1-07-i-have': { goal: 'داشتن یک وسیله را بپرسم و جواب بدهم.', scene: 'در کلاس به خودکار نیاز داری.', tip: 'در پاسخ کوتاه Do you have … از Yes, I do یا No, I do not استفاده کن.', change: 'فقط pen را با phone عوض کن.', turns: [4, 5] },
  'prea1-08-please-thankyou': { goal: 'درخواستی مؤدبانه بکنم و تشکر کنم.', scene: 'در کافه آب درخواست می‌کنی.', tip: 'Water معمولاً غیرقابل‌شمارش است؛ One water در سفارش می‌تواند یک بطری یا لیوان آب باشد.', change: 'فقط Water را با Tea عوض کن.' },
  'prea1-09-this-is': { goal: 'نام یک چیز نزدیک را بپرسم و معرفی کنم.', scene: 'روی میز به کتاب و تلفن اشاره می‌کنی.', tip: 'برای th در this نوک زبان نزدیک لبهٔ دندان و صدا با لرزش حنجره است؛ ذ فارسی که ز تلفظ می‌شود راهنمای دقیقی نیست.', change: 'فقط book را با pen عوض کن.' },
  'prea1-10-review': { goal: 'سلام و معرفی کوتاه را به هم وصل کنم.', scene: 'دوستت را به هم‌تمرین معرفی می‌کنی.', tip: 'در مرور از همان عبارت‌های آشنا استفاده کن؛ جملهٔ بلندتر الزاماً بهتر نیست.', change: 'فقط نام دوست را در This is my friend عوض کن.' },
  'prea1-11-at-home': { goal: 'مهمان را دعوت و وسیله‌ای را معرفی کنم.', scene: 'دوستت به خانه‌ات آمده است.', tip: 'my مال من و your مال تو است؛ these are برای چند چیز می‌آید.', change: 'فقط my را با your عوض کن.', turns: [4, 3, 5, 7] },
  'prea1-12-people': { goal: 'شخصی را با نام و نسبت معرفی کنم.', scene: 'پدر و معلمت را به هم‌تمرین معرفی می‌کنی.', tip: 'He برای مرد و She برای زن است؛ His/Her به شخص صاحب نام اشاره دارد.', change: 'فقط نام شخص را عوض کن؛ نسبت را ثابت نگه دار.' },
  'prea1-13-every-day': { goal: 'بگویم اکنون وقت ندارم و بعداً دیدار کنم.', scene: 'هنگام رفتن به کار دربارهٔ دیدار بعدی حرف می‌زنی.', tip: 'now یعنی اکنون و after work یعنی پس از کار؛ لازم نیست همهٔ جمله‌ها را در یک پاسخ جمع کنی.', change: 'فقط work را با home در I go … مقایسه کن.' },
  'prea1-14-i-like': { goal: 'دربارهٔ علاقه به چای یا قهوه بپرسم و جواب بدهم.', scene: 'برای دوستت نوشیدنی آماده می‌کنی.', tip: 'I like علاقه را می‌رساند؛ Do you like دربارهٔ علاقه می‌پرسد، نه سفارش همین لحظه.', change: 'فقط tea را با coffee عوض کن.', rows: [
    ['I like tea.', 'من چای دوست دارم.', 'آی لایک تی.', 'tea', 'چای'],
    ['I like coffee.', 'من قهوه دوست دارم.', 'آی لایک کافی.', 'coffee', 'قهوه'],
    ['Do you like tea?', 'چای دوست داری؟', 'دو یو لایک تی؟', 'like', 'دوست داشتن'],
    ['Yes, I do.', 'بله، دوست دارم.', 'یِس، آی دو.', 'yes', 'بله'],
    ['Do you like coffee?', 'قهوه دوست داری؟', 'دو یو لایک کافی؟', 'coffee', 'قهوه'],
    ['No, I do not.', 'نه، دوست ندارم.', 'نو، آی دو نات.', 'not', 'برای نفی'],
    ['Tea, please.', 'چای، لطفاً.', 'تی، پلیز.', 'please', 'لطفاً'],
    ['Here you are.', 'بفرما.', 'هیر یو آر.', 'Here you are', 'بفرما'],
  ], turns: [2, 3, 4, 5] },
};
export function enrichEnglishPreA1(lesson: SentenceLesson): SentenceLesson {
  const plan = PLANS[lesson.id];
  if (lesson.levelId !== 0 || !plan) return lesson;
  const rows = practicalRows(lesson.sentences.map(s => ({ ...s, text: s.en })), plan);
  const sentences = rows.map(({ text, ...s }, index) => ({ ...s, en: text,
    ...(lesson.id === 'prea1-14-i-like' ? { pattern: ({ 0: 'I like + drink', 1: 'I like + drink', 2: 'Do you like + drink?', 4: 'Do you like + drink?', 6: 'Drink + please' } as Record<number, string>)[index] } : {}),
  }));
  let dialogue = plan.turns ? plan.turns.map((index, turn) => ({ speaker: turn % 2 ? 'learner' as const : 'partner' as const, text: rows[index].text, fa: rows[index].fa })) : lesson.dialogue;
  if (lesson.id === 'prea1-11-at-home') dialogue = [
    { speaker: 'partner', text: 'Come in. Sit down, please.', fa: 'بیا داخل. بنشین، لطفاً.' },
    { speaker: 'learner', text: 'Thank you.', fa: 'ممنون.' },
    { speaker: 'partner', text: 'This is your book.', fa: 'این کتاب تو است.' },
    { speaker: 'learner', text: 'Thank you. I want water, please.', fa: 'ممنون. آب می‌خواهم، لطفاً.' },
  ];
  if (lesson.id === 'prea1-12-people') dialogue = [
    { speaker: 'partner', text: 'He is my father. His name is Karim.', fa: 'او پدر من است. نامش کریم است.' },
    { speaker: 'learner', text: 'Hello, Karim.', fa: 'سلام، کریم.' },
    { speaker: 'partner', text: 'She is my teacher. Her name is Laleh.', fa: 'او معلم من است. نامش لاله است.' },
    { speaker: 'learner', text: 'Hello, Laleh.', fa: 'سلام، لاله.' },
  ];
  if (lesson.id === 'prea1-13-every-day') dialogue = [
    { speaker: 'partner', text: 'I go to work.', fa: 'سر کار می‌روم.' },
    { speaker: 'learner', text: 'See you after work.', fa: 'پس از کار می‌بینمت.' },
    { speaker: 'partner', text: 'Can you call me?', fa: 'می‌توانی با من تماس بگیری؟' },
    { speaker: 'learner', text: 'Yes. See you after work.', fa: 'بله. پس از کار می‌بینمت.' },
  ];
  const balanced = balanceSamples(lesson.id, sentences.map(sentence => ({ ...sentence, text: sentence.en })));
  return { ...lesson, ...practicalNotes(plan), teachingFa: balancedTeaching(lesson.id, practicalNotes(plan).teachingFa),
    sentences: balanced.map(({ text, ...sentence }) => ({ ...sentence, en: text })),
    dialogue: balancedDialogue(lesson.id, balanced) ?? dialogue,
  };
}
