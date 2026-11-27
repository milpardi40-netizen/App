import type { LearningSentence } from './types';

/** A single lesson is revised: IDs/positions survive, old scores are not comparable. */
export const RUSSIAN_PRE_A1_LIGHT_VERBS_ID = 'ru-pre-12-verbs';
export const RUSSIAN_PRE_A1_LIGHT_CHECKS_REVISION = 'ru-pre-a1-light-verbs-checks-v1';
export const RUSSIAN_PRE_A1_LIGHT_SENTENCE_REVISION = 'ru-pre-a1-light-verbs-sentences-v1';
export const RUSSIAN_PRE_A1_LIGHT_ROOM_REVISION = 'ru-pre-a1-light-verbs-room-v1';

/** Eight short targets replace eight packed rows, not eight lessons or new historical IDs. */
export const RUSSIAN_PRE_A1_LIGHT_VERBS: readonly Omit<LearningSentence, 'id'>[] = [
  {text:'Я хочу́ чай.',fa:'من چای می‌خواهم.',pronunciation:'یا خاچو چای.',pattern:'همان چای را نگه دار: من می‌خواهم ← تو می‌خواهی؟',vocabulary:[{word:'Я',meaning:'من'},{word:'хочу́',meaning:'می‌خواهم'},{word:'чай',meaning:'چای'}]},
  {text:'Ты хо́чешь чай?',fa:'چای می‌خواهی؟',pronunciation:'تی خُچیش چای؟',pattern:'همان چای را نگه دار: من می‌خواهم ← تو می‌خواهی؟',vocabulary:[{word:'Ты',meaning:'تو'},{word:'хо́чешь',meaning:'می‌خواهی'},{word:'чай',meaning:'چای'}]},
  {text:'Я хочу́ ко́фе.',fa:'من قهوه می‌خواهم.',pronunciation:'یا خاچو کُفِه.',pattern:'فقط نوشیدنی را عوض کن؛ همان Я хочу́ را نگه دار.',vocabulary:[{word:'Я',meaning:'من'},{word:'хочу́',meaning:'می‌خواهم'},{word:'ко́фе',meaning:'قهوه'}]},
  {text:'Ты хо́чешь ко́фе?',fa:'قهوه می‌خواهی؟',pronunciation:'تی خُچیش کُفِه؟',pattern:'همان پرسش با یک نوشیدنی دیگر',vocabulary:[{word:'Ты',meaning:'تو'},{word:'хо́чешь',meaning:'می‌خواهی'},{word:'ко́фе',meaning:'قهوه'}]},
  {text:'Я чита́ю текст.',fa:'من متن می‌خوانم.',pronunciation:'یا چیتایو تِکْست.',pattern:'آشنایی کوتاه: فقط من + یک کار؛ صرفِ همهٔ شخص‌ها لازم نیست.',vocabulary:[{word:'Я',meaning:'من'},{word:'чита́ю',meaning:'می‌خوانم'},{word:'текст',meaning:'متن'}]},
  {text:'Я пишу́ текст.',fa:'من متن می‌نویسم.',pronunciation:'یا پیشو تِکْست.',pattern:'همان متن؛ این بار می‌نویسم.',vocabulary:[{word:'Я',meaning:'من'},{word:'пишу́',meaning:'می‌نویسم'},{word:'текст',meaning:'متن'}]},
  {text:'Ты зна́ешь текст?',fa:'متن را بلدی؟',pronunciation:'تی زْنایِش تِکْست؟',pattern:'آشنایی کوتاه: این پرسش آماده را یک‌جا بشناس.',vocabulary:[{word:'Ты',meaning:'تو'},{word:'зна́ешь',meaning:'می‌دانی / بلدی'},{word:'текст',meaning:'متن'}]},
  {text:'Я понима́ю.',fa:'من متوجه می‌شوم.',pronunciation:'یا پانیمایو.',pattern:'عبارت کوتاه؛ در درس درخواست کمک دوباره برمی‌گردد.',vocabulary:[{word:'Я',meaning:'من'},{word:'понима́ю',meaning:'متوجه می‌شوم'}]},
];

export const RUSSIAN_PRE_A1_VERB_STEPS = [
  {start:0,end:4,title:'۱ · یک خواسته، دو نوشیدنی',note:'هدف اصلی: بگو چه می‌خواهی و از دوستت بپرس. فقط چای را به قهوه عوض کن؛ هنوز صرفِ ما، شما و او را حفظ نکن.',recall:'نمونه را کنار بگذار: بگو قهوه می‌خواهم؛ بعد از دوستت بپرس چای می‌خواهد یا نه.'},
  {start:4,end:6,title:'۲ · دو کارِ کوتاه در کلاس',note:'پس از یک مکث، خواندن و نوشتن را فقط با «من» بشناس. هر ردیف یک جمله است؛ لازم نیست صورت «ما می‌خوانیم / می‌نویسیم» را اینجا اضافه کنی.',recall:'به متن اشاره کن و فقط یکی از دو کارِ خواندن یا نوشتن را بگو. در درس ۱۶ خواندن دوباره تمرین می‌شود.'},
  {start:6,end:8,title:'۳ · بلدی؟ متوجه می‌شوم',note:'این دو عبارت را کوتاه و جدا تمرین کن. هدف معرفیِ چند عبارت است، نه حفظ جدول افعال یا گفتن همهٔ آن‌ها در یک پاسخ.',recall:'ابتدا یک عبارت را با نمونه بخوان؛ بار دوم بدون آوانویسی بگو. اعلام نفهمیدن در درس ۱۴ برمی‌گردد.'},
] as const;
export function russianPreA1VerbStep(lessonId:string,index:number) {
  return lessonId===RUSSIAN_PRE_A1_LIGHT_VERBS_ID ? RUSSIAN_PRE_A1_VERB_STEPS.find(s=>index>=s.start&&index<s.end) : undefined;
}
