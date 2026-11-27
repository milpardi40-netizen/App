/** English-A1-only micro-lessons. Optional practice; no completion/mastery is stored.
 * Sentence IDs, saved checks and course stages are intentionally not repurposed.
 */
export interface EnglishA1ScaffoldStep {
  id: string;
  titleFa: string;
  explanationFa: string;
  examples: readonly { en: string; fa: string }[];
  recallFa: string;
  questionFa: string;
  choices: readonly string[];
  correctIndex: number;
  feedbackFa: string;
}
export interface EnglishA1Scaffold {
  titleFa: string;
  prerequisiteFa: string;
  steps: readonly EnglishA1ScaffoldStep[];
}
export const ENGLISH_A1_SCAFFOLDS: Readonly<Record<string, EnglishA1Scaffold>> = {
  'foundation-everyday-routine': {
    titleFa: 'روزمره را در چهار گام یاد بگیر',
    prerequisiteFa: 'از درس ساعت، at seven و از درس اشخاص، I/you/he/she را به یاد بیاور. فعلاً دربارهٔ عادت صحبت می‌کنیم، نه کاری که همین الان در جریان است.',
    steps: [
      {
        id: 'habit-i-you', titleFa: '۱ · اول عادت با I و you',
        explanationFa: 'برای عادت با I و you، فعل ساده می‌آید. every day یعنی هر روز؛ at seven ساعت را مشخص می‌کند. در این گام هنوز سؤال و منفی نمی‌سازیم.',
        examples: [{en:'I work every day.',fa:'من هر روز کار می‌کنم.'},{en:'You get up at seven.',fa:'تو ساعت هفت بیدار می‌شوی.'}],
        recallFa: 'نمونه را کنار بگذار و یک جمله با I دربارهٔ ساعت بیدارشدنِ یک شخصیت خیالی بگو.',
        questionFa: 'برای عادت روزانه کدام جمله درست است؟',
        choices: ['I studies at home.','I study at home.','I am study at home.'], correctIndex: 1,
        feedbackFa: 'با I در این جمله study ساده می‌آید. am را پیش از فعلِ عادت اضافه نمی‌کنیم.',
      },
      {
        id: 'habit-he-she', titleFa: '۲ · حالا جملهٔ مثبت با he و she',
        explanationFa: 'برای he و she در جملهٔ مثبتِ عادت، work به works و get up به gets up تبدیل می‌شود. شکلِ study در این کاربرد studies است. فعلاً همین صورت‌های پرتکرار را تمرین کن.',
        examples: [{en:'He works on Monday.',fa:'او دوشنبه کار می‌کند.'},{en:'She studies English.',fa:'او انگلیسی می‌خواند.'}],
        recallFa: 'یک جمله با I از گام قبل را دربارهٔ Ben با he بگو؛ فقط فاعل و صورت لازمِ فعل را عوض کن.',
        questionFa: 'Sara ___ English every day.', choices: ['study','studying','studies'], correctIndex: 2,
        feedbackFa: 'Sara یک نفر و در این کارت زن است؛ جملهٔ مثبت با she و صورت studies ساخته می‌شود.',
      },
      {
        id: 'habit-questions', titleFa: '۳ · بعد سؤال با do و does',
        explanationFa: 'برای سؤال از do با I/you/we/they و does با he/she/it استفاده می‌کنیم. بعد از does فعل دوباره ساده است: work، نه works. برای ساعت می‌توان What time را اول آورد.',
        examples: [{en:'Do you work on Sunday?',fa:'یکشنبه کار می‌کنی؟'},{en:'Does she work on Sunday?',fa:'آیا او یکشنبه کار می‌کند؟'}],
        recallFa: 'از Ben بپرس آیا دوشنبه کار می‌کند؛ سپس همین سؤال را دربارهٔ او از یک نفر دیگر بپرس.',
        questionFa: 'کدام پرسش دربارهٔ عادت Ben درست است؟',
        choices: ['Does Ben work on Monday?','Does Ben works on Monday?','Do Ben work on Monday?'], correctIndex: 0,
        feedbackFa: 'برای Ben از does استفاده می‌کنیم؛ پس از does، work بدون s می‌آید.',
      },
      {
        id: 'habit-negatives', titleFa: '۴ · در پایان منفی؛ بعد یک پیام کوتاه',
        explanationFa: 'برای منفی از do not با I/you/we/they و does not با he/she/it استفاده می‌کنیم. فعل پس از آن‌ها ساده است. ابتدا مثبت و منفی را جدا بگو؛ بعد سه جملهٔ سازگار دربارهٔ برنامه بساز.',
        examples: [{en:'I do not work on Sunday.',fa:'من یکشنبه کار نمی‌کنم.'},{en:'She does not work on Sunday.',fa:'او یکشنبه کار نمی‌کند.'}],
        recallFa: 'کارت خیالی: Sara دوشنبه کار می‌کند و یکشنبه کار نمی‌کند. یک جملهٔ مثبت، یک جملهٔ منفی و یک سؤال بنویس.',
        questionFa: 'کارت می‌گوید Sara یکشنبه کار نمی‌کند. کدام پیام درست است؟',
        choices: ['Sara does not works on Sunday.','Sara does not work on Sunday.','Sara do not work on Sunday.'], correctIndex: 1,
        feedbackFa: 'does not با Sara هماهنگ است و بعد از آن work ساده می‌آید. این پاسخ فقط همین تمایز را تمرین می‌کند، نه تسلط کامل بر حال ساده.',
      },
    ],
  },
  'survival-past-and-future-plans': {
    titleFa: 'اول دیروز؛ بعد، با مکث، برنامهٔ فردا',
    prerequisiteFa: 'be، پرسش و منفی، و یک برنامهٔ ساده را از درس‌های قبل بازیابی کن. اینجا پنج گام داریم؛ می‌توانی پس از بخش دیروز استراحت کنی. لازم نیست فهرست افعال نامنظم حفظ کنی.',
    steps: [
      {
        id: 'yesterday-be', titleFa: '۱ · دیروز کجا بودیم؟ was و were',
        explanationFa: 'با نشانهٔ yesterday دربارهٔ دیروز حرف می‌زنیم. برای I/he/she/it از was و برای you/we/they از were استفاده می‌کنیم. این گام فقط مکان و حالتِ گذشته است، نه همهٔ فعل‌ها.',
        examples: [{en:'I was at home yesterday.',fa:'من دیروز در خانه بودم.'},{en:'We were at school yesterday.',fa:'ما دیروز در مدرسه بودیم.'}],
        recallFa: 'بدون نگاه، یک جمله با I و یک جمله با we دربارهٔ مکان خیالیِ دیروز بگو.',
        questionFa: 'They ___ at home yesterday.', choices: ['were','was','are'], correctIndex: 0,
        feedbackFa: 'برای they در گذشته از were استفاده می‌کنیم. are صورتِ زمان حال است.',
      },
      {
        id: 'yesterday-regular', titleFa: '۲ · یک کارِ دیروز: worked و studied',
        explanationFa: 'برای این دو کار در گذشته از worked و studied استفاده کن. در این جمله‌های مثبت، همین صورت با I یا she می‌آید؛ مانند حال ساده دوباره s اضافه نمی‌کنیم.',
        examples: [{en:'I worked yesterday.',fa:'من دیروز کار کردم.'},{en:'She studied English yesterday.',fa:'او دیروز انگلیسی خواند.'}],
        recallFa: 'یک کار خیالیِ دیروز را با worked یا studied بگو؛ جملهٔ مکان از گام اول را هم بازیابی کن.',
        questionFa: 'برای گزارشِ کار انجام‌شده در دیروز کدام جمله درست است؟',
        choices: ['She study English yesterday.','She studies English yesterday.','She studied English yesterday.'], correctIndex: 2,
        feedbackFa: 'نشانهٔ yesterday با کارِ گذشته studied سازگار است. برای این تمرین صورت گذشتهٔ تازه‌ای لازم نیست.',
      },
      {
        id: 'yesterday-went', titleFa: '۳ · فقط یک صورت نامنظم: went',
        explanationFa: 'برای گفتن «رفت» در این جمله از went استفاده می‌کنیم؛ این صورتِ گذشتهٔ go است. فعلاً همین یک مورد کافی است و نباید goed بسازیم.',
        examples: [{en:'I went to the café yesterday.',fa:'من دیروز به کافه رفتم.'},{en:'She went to school yesterday.',fa:'او دیروز به مدرسه رفت.'}],
        recallFa: 'یک مقصد خیالی انتخاب کن و بگو دیروز به آنجا رفتی؛ سپس جمله را دربارهٔ Sara بگو.',
        questionFa: 'کدام جمله برای «بن دیروز به کافه رفت» درست است؟',
        choices: ['Ben goed to the café yesterday.','Ben went to the café yesterday.','Ben goes to the café yesterday.'], correctIndex: 1,
        feedbackFa: 'گذشتهٔ go در این کاربرد went است. اینجا فقط یک صورت پرتکرار را یاد می‌گیریم، نه تمام افعال نامنظم را.',
      },
      {
        id: 'yesterday-did', titleFa: '۴ · سؤال و منفیِ کار گذشته با did',
        explanationFa: 'برای پرسش از Did + فاعل + فعل ساده و برای منفی از did not + فعل ساده استفاده می‌کنیم: work، نه worked؛ go، نه went. این الگو برای کارهاست؛ جملهٔ was/were گام اول را با did ترکیب نکن.',
        examples: [{en:'Did you work yesterday?',fa:'آیا دیروز کار کردی؟'},{en:'I did not go to the café yesterday.',fa:'من دیروز به کافه نرفتم.'}],
        recallFa: 'از یک همراه خیالی دربارهٔ کار دیروز سؤال کن و یک جواب منفی کوتاه بده. بعد مکث کن؛ بخش دیروز تمام شد.',
        questionFa: 'کدام سؤال با did درست ساخته شده است؟',
        choices: ['Did she go to school yesterday?','Did she went to school yesterday?','Did she was at school yesterday?'], correctIndex: 0,
        feedbackFa: 'پس از did، go ساده می‌آید. برای مکان با be می‌پرسیم Was she at school?؛ did و was را روی هم نمی‌گذاریم.',
      },
      {
        id: 'tomorrow-plan', titleFa: '۵ · حالا برنامهٔ فردا، نه اتفاقِ انجام‌شده',
        explanationFa: 'پس از مرور دیروز، با نشانهٔ tomorrow وارد برنامهٔ فردا شو. الگو: am/is/are going to + فعل ساده. در این کاربرد پس از going to، فعل ساده‌ای مانند study، work یا visit می‌آید.',
        examples: [{en:'I am going to study tomorrow.',fa:'من قصد دارم فردا درس بخوانم.'},{en:'She is going to visit Anna tomorrow.',fa:'او قصد دارد فردا آنا را ببیند.'}],
        recallFa: 'دو کارت را جدا بگو: دیروز در خانه درس خواندی؛ فردا قصد داری آنا را ببینی. اول نشانهٔ زمان را روشن کن.',
        questionFa: 'برای برنامهٔ درس‌خواندنِ فردا کدام جمله درست است؟',
        choices: ['I am going to studied tomorrow.','I was study tomorrow.','I am going to study tomorrow.'], correctIndex: 2,
        feedbackFa: 'برای برنامهٔ فردا am going to + study می‌آید. صورت گذشته studied را با going to ترکیب نمی‌کنیم.',
      },
    ],
  },
};
export const englishA1Scaffold = (id: string): EnglishA1Scaffold | undefined => ENGLISH_A1_SCAFFOLDS[id];
