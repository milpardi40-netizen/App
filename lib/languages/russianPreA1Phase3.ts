/** Pre-A1-only support: small everyday choices and ungraded transfer, not a new course band. */
export const RUSSIAN_PRE_A1_CONTEXT_CHECK_IDS = [
  'ru-pre-03-family-home','ru-pre-08-animals-colors','ru-pre-10-days-places','ru-pre-11-adjectives',
] as const;
export const RUSSIAN_PRE_A1_CONTEXT_CHECKS_REVISION = 'ru-pre-a1-self-contained-contexts-v1';
export function russianPreA1ContextChecksRevisionFor(id:string):string|undefined {
  return (RUSSIAN_PRE_A1_CONTEXT_CHECK_IDS as readonly string[]).includes(id) ? RUSSIAN_PRE_A1_CONTEXT_CHECKS_REVISION : undefined;
}
export interface RussianPreA1EverydayRow { id:string;labelFa:string;text:string;fa:string;pronunciationFa:string;noteFa:string }
export interface RussianPreA1EverydayPanel {titleFa:string;noteFa:string;rows:readonly RussianPreA1EverydayRow[]}
export const RUSSIAN_PRE_A1_EVERYDAY:Readonly<Record<string,RussianPreA1EverydayPanel>> = {
 'ru-pre-06-people-objects':{titleFa:'دو وسیلهٔ روزمره؛ بدون جدولِ جنس‌ها',noteFa:'برای معرفی هر دو از همان «Это» استفاده کن. جنس دستوریِ اسم به جنسیتِ گوینده مربوط نیست؛ فعلاً همین دو عبارت کافی است.',rows:[
  {id:'book',labelFa:'کتاب',text:'Э́то кни́га.',fa:'این کتاب است.',pronunciationFa:'اِتا کْنیگا.',noteFa:'книга یعنی کتاب و از نظر دستوری مؤنث است. در این معرفی، پایانِ Это را عوض نمی‌کنیم.'},
  {id:'pen',labelFa:'خودکار',text:'Э́то ру́чка.',fa:'این خودکار است.',pronunciationFa:'اِتا روچْکا.',noteFa:'ручка در این مثال خودکار است؛ карандаш در مثال‌های اصلی مداد است. هر دو وسیلهٔ نوشتن‌اند، ولی یک واژه نیستند.'},
 ]},
 'ru-pre-07-food-drinks':{titleFa:'آب هم می‌توانم بخواهم',noteFa:'یک درخواست پرکاربردِ دیگر؛ این عبارت آماده را یاد بگیر، نه جدولِ حالت‌های اسم را.',rows:[
  {id:'water',labelFa:'آب خواستن',text:'Во́ду, пожа́луйста.',fa:'آب، لطفاً.',pronunciationFa:'وُدو، پاژالُیْسْتا.',noteFa:'نام پایه вода́ یعنی آب است؛ در این درخواست во́ду می‌گوییم. تکیه هم جابه‌جا می‌شود. مؤنث‌بودن اسم، این درخواست را مخصوص گویندهٔ زن نمی‌کند.'},
 ]},
 'ru-pre-13-greeting-name-phrases':{titleFa:'معرفی نام، برای هر زبان‌آموز',noteFa:'الگوی «Меня зовут + نام» برای گویندگان مختلف یکسان است. نام خودت را لازم نیست وارد یا ذخیره کنی؛ نام خیالی هم مناسب است.',rows:[
  {id:'sara',labelFa:'نام خیالی: سارا',text:'Меня́ зову́т Са́ра.',fa:'اسم من سارا است.',pronunciationFa:'مینْیا زاووت سارا.',noteFa:'فقط نام را عوض کرده‌ایم؛ نیازی نیست صورت دیگری برای فعل بسازی.'},
  {id:'amir',labelFa:'نام خیالی: امیر',text:'Меня́ зову́т Ами́р.',fa:'اسم من امیر است.',pronunciationFa:'مینْیا زاووت امیر.',noteFa:'همان الگو با یک نام دیگر؛ جملهٔ نمونه قرار نیست هویت واقعی تو را تعیین کند.'},
 ]},
 'ru-pre-15-combos-pronoun-demo':{titleFa:'«خوشحالم» متناسب با گوینده',noteFa:'دو صورت آماده برای همین معنی را می‌بینی؛ انتخاب این کارت‌ها انتخاب نقشِ تمرین است و اطلاعات شخصی ذخیره نمی‌کند.',rows:[
  {id:'glad-man',labelFa:'نمونه برای گویندهٔ مرد',text:'Я рад.',fa:'من خوشحالم. (گویندهٔ مرد)',pronunciationFa:'یا رات.',noteFa:'در این صفت کوتاه، صورتِ گویندهٔ مرد рад است؛ دالِ آخر در صدا بی‌واک می‌شود.'},
  {id:'glad-woman',labelFa:'نمونه برای گویندهٔ زن',text:'Я ра́да.',fa:'من خوشحالم. (گویندهٔ زن)',pronunciationFa:'یا رادا.',noteFa:'برای گویندهٔ زن در همین عبارت рада می‌آید. لازم نیست همهٔ صفت‌ها را یک‌جا صرف کنی.'},
 ]},
 'ru-pre-17-sentences-be-have':{titleFa:'معرفی دانشجو؛ فقط یک صورتِ اجباری نداریم',noteFa:'اگر این نقش دربارهٔ تو صدق نمی‌کند، با یک شخصیت خیالی تمرین کن یا فقط نام و محل زندگی را بگو. در جملهٔ اسمیِ سادهٔ حال، «هستم» جدا نمی‌آید.',rows:[
  {id:'student-man',labelFa:'دانشجوی مرد',text:'Я студе́нт.',fa:'من دانشجو هستم. (مرد)',pronunciationFa:'یا ستودِنت.',noteFa:'این نمونهٔ مذکرِ نقش دانشجو است.'},
  {id:'student-woman',labelFa:'دانشجوی زن',text:'Я студе́нтка.',fa:'من دانشجو هستم. (زن)',pronunciationFa:'یا ستودِنتکا.',noteFa:'در این نقش، студентка صورت مربوط به دانشجوی زن است؛ آن را به‌صورت یک واژهٔ آماده یاد بگیر.'},
 ]},
 'ru-pre-21-daily-identity-family-age':{titleFa:'اهل کجا هستم؟ یک الگوی مشترک هم داریم',noteFa:'این مثال‌ها دربارهٔ ایران‌اند؛ اگر مناسب اطلاعات تو نیستند، آن‌ها را برای یک شخصیت خیالی به کار ببر. لازم نیست ملیت یا جنسیت واقعی خودت را ثبت کنی.',rows:[
  {id:'from-iran',labelFa:'الگوی مشترک برای گویندگان مختلف',text:'Я из Ира́на.',fa:'من اهل ایران هستم.',pronunciationFa:'یا ایز ایرانا.',noteFa:'در همین الگو با تغییر گوینده لازم نیست «из Ирана» را عوض کنی.'},
  {id:'iranian-man',labelFa:'ایرانی؛ گویندهٔ مرد',text:'Я ира́нец.',fa:'من ایرانی هستم. (مرد)',pronunciationFa:'یا ایرانِتس.',noteFa:'иранец در این معرفی برای مرد است.'},
  {id:'iranian-woman',labelFa:'ایرانی؛ گویندهٔ زن',text:'Я ира́нка.',fa:'من ایرانی هستم. (زن)',pronunciationFa:'یا ایرانکا.',noteFa:'иранка در این معرفی برای زن است؛ برای بیان اهل ایران بودن می‌توانی از الگوی مشترک هم استفاده کنی.'},
 ]},
};
export interface RussianPreA1TransferCase {id:string;factsFa:string;taskFa:string;sample:string;sampleFa:string;feedbackFa:string}
export interface RussianPreA1Transfer {titleFa:string;hintFa:string;cases:readonly RussianPreA1TransferCase[]}
export const RUSSIAN_PRE_A1_TRANSFERS:Readonly<Record<string,RussianPreA1Transfer>> = {
 'ru-pre-12-verbs':{titleFa:'همان خواسته، با یک انتخاب تازه',hintFa:'الگوی Я хочу + چیزِ خواسته‌شده را به یاد بیاور؛ واژهٔ جدید نساز، از خوراکی‌های درس‌های قبل استفاده کن.',cases:[
  {id:'juice',factsFa:'انتخاب تازه: آب‌میوه؛ واژهٔ آشنا: сок',taskFa:'فقط بگو آب‌میوه می‌خواهی.',sample:'Я хочу́ сок.',sampleFa:'من آب‌میوه می‌خواهم.',feedbackFa:'فعل ثابت مانده است؛ فقط چای/قهوه را با сок جایگزین کرده‌ای.'},
  {id:'bread',factsFa:'انتخاب تازه: نان؛ واژهٔ آشنا: хлеб',taskFa:'فقط بگو نان می‌خواهی.',sample:'Я хочу́ хлеб.',sampleFa:'من نان می‌خواهم.',feedbackFa:'همان Я хочу با یک خوراکیِ آشنا. لازم نیست فعلِ دیگری اضافه کنی.'},
 ]},
 'ru-pre-13-greeting-name-phrases':{titleFa:'معرفی یک نام تازه',hintFa:'الگوی Меня зовут را نگه دار و نامِ روی کارت را جایگزین کن. کارت خیالی است؛ نام واقعی لازم نیست.',cases:[
  {id:'nina',factsFa:'نامِ روی کارت: Ни́на — نینا',taskFa:'به جای این شخصیت فقط نامت را معرفی کن.',sample:'Меня́ зову́т Ни́на.',sampleFa:'اسم من نینا است.',feedbackFa:'بخش ثابت معرفی عوض نمی‌شود؛ نامِ داده‌شده را به آن وصل می‌کنی.'},
  {id:'lena',factsFa:'نامِ روی کارت: Ле́на — لنا',taskFa:'این بار نامِ کارت دوم را معرفی کن.',sample:'Меня́ зову́т Ле́на.',sampleFa:'اسم من لنا است.',feedbackFa:'برای عوض‌کردن نام، صرف یا ضمیر تازه لازم نیست.'},
 ]},
 'ru-pre-20-questions-whose-yesno-count':{titleFa:'تعداد تازه، همان متن‌ها',hintFa:'در نمونهٔ «Три текста» عبارت شمارشی را دیدی. با ۲ و ۴ در این تمرین هم текста می‌آید؛ فعلاً همین سه حالتِ کوتاه را بشناس.',cases:[
  {id:'two-texts',factsFa:'تعداد متن‌ها در این نوبت: ۲',taskFa:'فقط تعداد را با نامِ متن بگو.',sample:'Два те́кста.',sampleFa:'دو متن.',feedbackFa:'عدد از три به два تغییر کرد؛ در این عبارت همان текста می‌ماند.'},
  {id:'four-texts',factsFa:'تعداد متن‌ها در نوبت تازه: ۴',taskFa:'این بار تعداد کارت دوم را بگو.',sample:'Четы́ре те́кста.',sampleFa:'چهار متن.',feedbackFa:'چون همین تعداد تازه خواسته شده، سه متنِ نمونهٔ درس پاسخِ این نوبت نیست.'},
 ]},
 'ru-pre-21-daily-identity-family-age':{titleFa:'سنِ یک شخصیت خیالی',hintFa:'الگوی Мне ... лет را با عددِ داده‌شده کامل کن. این تمرین دربارهٔ سن واقعی تو نیست.',cases:[
  {id:'eight',factsFa:'شخصیت خیالی هشت سال دارد.',taskFa:'از زبان همین شخصیت، سن را با یک جملهٔ کوتاه بگو.',sample:'Мне во́семь лет.',sampleFa:'من هشت سال دارم.',feedbackFa:'با هشت و نه در این تمرین، лет می‌آید. لازم نیست سن واقعی‌ات را بنویسی.'},
  {id:'nine',factsFa:'شخصیت دوم نُه سال دارد.',taskFa:'با اطلاعات شخصیت دوم پاسخ بده.',sample:'Мне де́вять лет.',sampleFa:'من نه سال دارم.',feedbackFa:'عددِ تازه را جایگزین کرده‌ای؛ ساختارِ جمله ثابت است.'},
 ]},
 'ru-pre-24-conv-greeting-intro':{titleFa:'دو اطلاعات کوتاه از کارت تازه',hintFa:'نام را با Меня зовут و کشور را با Я из Ирана بگو. دو جملهٔ کوتاه کافی است؛ لازم نیست نقش شغلی یا جنسیت اضافه کنی.',cases:[
  {id:'nina-iran',factsFa:'کارت خیالی: Ни́на؛ اهل ایران',taskFa:'نام و محلِ اهل‌بودن را در دو جملهٔ کوتاه بگو.',sample:'Меня́ зову́т Ни́на. Я из Ира́на.',sampleFa:'اسم من نینا است. اهل ایران هستم.',feedbackFa:'دو الگوی آشنا را با اطلاعات این کارت کنار هم آورده‌ای، نه معرفی علیِ نمونه را کپی کرده باشی.'},
  {id:'lena-iran',factsFa:'کارت دوم: Ле́на؛ اهل ایران',taskFa:'با نامِ کارت دوم همین معرفی کوتاه را انجام بده.',sample:'Меня́ зову́т Ле́на. Я из Ира́на.',sampleFa:'اسم من لنا است. اهل ایران هستم.',feedbackFa:'کشور ثابت ماند و نام عوض شد. گفتن نام و سپس کشور تنها ترتیبِ درستِ ممکن نیست.'},
 ]},
 'ru-pre-27-conv-food-shopping':{titleFa:'قیمتِ تازه را بگو',hintFa:'در خرید «Двадцать рублей» را دیدی. در این دو قیمت هم рублей ثابت است؛ فقط عدد را از درس عددها بیاور.',cases:[
  {id:'ten-rubles',factsFa:'برچسب قیمتِ این نوبت: ۱۰ روبل',taskFa:'فقط قیمت را کوتاه بگو؛ نه قیمت بیستِ نمونه را.',sample:'Де́сять рубле́й.',sampleFa:'ده روبل.',feedbackFa:'قیمت تازه ده است. اینجا جواب کوتاهِ عدد + рублей کافی است.'},
  {id:'five-rubles',factsFa:'برچسب قیمتِ دوم: ۵ روبل',taskFa:'قیمتِ برچسب دوم را بگو.',sample:'Пять рубле́й.',sampleFa:'پنج روبل.',feedbackFa:'با پنج در این عبارت هم همان рублей می‌آید؛ برای این تمرین جدولِ همهٔ پول‌ها لازم نیست.'},
 ]},
};
