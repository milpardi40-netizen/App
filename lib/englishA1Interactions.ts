/** Optional, explicitly scripted two-turn rehearsals. No recognition, score, or saved mastery. */
export interface EnglishA1InteractionTurn { text: string; goalFa: string; example: string }
export interface EnglishA1Interaction {
  contextFa: string;
  first: EnglishA1InteractionTurn;
  branches: readonly (EnglishA1InteractionTurn & { labelFa: string })[];
  checksFa: readonly string[];
}
export const ENGLISH_A1_INTERACTIONS: Readonly<Record<string, EnglishA1Interaction>> = {
  'foundation-asking-for-help': {
    contextFa: 'نام مخاطب خیالی Ben است، اما فرض کن آن را روشن نشنیده‌ای. درخواست تکرار آهسته کن؛ نام تازه‌ای حدس نزن.',
    first: {text:'Hello. My name is Ben.',goalFa:'درخواست کن نام را دوباره و آهسته بگوید.',example:'Please say that again, slowly.'},
    branches: [
      {labelFa:'مخاطب نام را هجی می‌کند',text:'B. E. N.',goalFa:'نام را برای تأیید بگو و تشکر کن.',example:'Ben. Thank you.'},
      {labelFa:'مخاطب دربارهٔ نوع کمک می‌پرسد',text:'Can I spell it for you?',goalFa:'پیشنهاد هجی را مؤدبانه بپذیر.',example:'Yes, please. Thank you.'},
    ], checksFa:['کمک مورد نیاز را مشخص خواستم.','از اطلاعات نشنیده نتیجه‌گیری نکردم.','پس از روشن‌شدن نام، آن را تأیید یا تشکر کردم.'],
  },
  'foundation-objects-and-places': {
    contextFa:'چیدمان خیالی: کلید داخل کیفِ مخاطب است؛ کیف زیر صندلی است. صاحب وسیله در طول گفت‌وگو عوض نمی‌شود.',
    first:{text:'Where is my key?',goalFa:'جای کلید را بگو.',example:'It is in your bag.'},
    branches:[
      {labelFa:'مخاطب جای کیف را می‌پرسد',text:'Where is my bag?',goalFa:'جای کیف را روشن کن.',example:'It is under the chair.'},
      {labelFa:'مخاطب مکان را اشتباه تکرار می‌کند',text:'Is my bag on the chair?',goalFa:'on را به under اصلاح کن.',example:'No, it is under the chair.'},
    ],checksFa:['کلید را داخل کیف قرار دادم.','زیر صندلی را با روی صندلی اشتباه نکردم.','با my/your صاحب وسیله را ناخواسته عوض نکردم.'],
  },
  'foundation-everyday-routine': {
    contextFa:'برنامهٔ خیالی تو: یکشنبه کار نمی‌کنی؛ دوشنبه ساعت ۹ کار را شروع می‌کنی.',
    first:{text:'Do you work on Sunday?',goalFa:'به پرسش دربارهٔ یکشنبه جواب منفی بده.',example:'No, I do not work on Sunday.'},
    branches:[
      {labelFa:'مخاطب ساعت را می‌پرسد',text:'What time do you start work on Monday?',goalFa:'ساعت شروع کار را بگو.',example:'I start work at nine.'},
      {labelFa:'مخاطب روز را اشتباه می‌گوید',text:'Do you start work at nine on Saturday?',goalFa:'روز را به دوشنبه اصلاح کن.',example:'No, on Monday at nine.'},
    ],checksFa:['یکشنبه را منفی گفتم.','۹ را زمان شروع کار گفتم، نه بیدارشدن.','پس از do not از work ساده استفاده کردم.'],
  },
  'survival-cafe-and-food': {
    contextFa:'سفارش خیالی: چای بدون شکر و ساندویچ پنیر. اگر قیمت اعلام شد، آن را برای تأیید تکرار کن.',
    first:{text:'Hello. What would you like?',goalFa:'خوراکی، نوشیدنی و ترجیح را بگو.',example:'A tea without sugar and a cheese sandwich, please.'},
    branches:[
      {labelFa:'پیشخدمت نوشیدنی را اشتباه می‌گوید',text:'A coffee without sugar?',goalFa:'فقط نوشیدنیِ اشتباه را اصلاح کن.',example:'No, a tea without sugar, please.'},
      {labelFa:'پیشخدمت قیمت را اعلام می‌کند',text:'That is eight dollars.',goalFa:'مبلغ را تأیید کن و تشکر کن.',example:'Eight dollars. Thank you.'},
    ],checksFa:['tea و cheese sandwich را سفارش دادم.','without sugar را حفظ کردم.','اصلاح سفارش یا تأیید قیمت با خواستهٔ اول سازگار بود.'],
  },
  'survival-directions-and-neighborhood': {
    contextFa:'مسیر خیالی از بانک تا ایستگاه: مستقیم برو، کنار پارک به چپ بپیچ. ایستگاه کنار کافه است.',
    first:{text:'Excuse me. How do I get to the station?',goalFa:'دو دستور مسیر را به ترتیب بگو.',example:'Go straight. Turn left at the park.'},
    branches:[
      {labelFa:'مخاطب جهت را روشن می‌کند',text:'Left or right?',goalFa:'جهت درست را کوتاه تکرار کن.',example:'Left, at the park.'},
      {labelFa:'مخاطب نشانه را اشتباه شنیده است',text:'Turn left at the bank?',goalFa:'پارک را به‌عنوان محل پیچیدن اصلاح کن.',example:'No, turn left at the park.'},
    ],checksFa:['اول مستقیم و بعد چپ را گفتم.','نشانهٔ پیچیدن پارک بود، نه بانک.','اطلاعات تازه‌ای که در مسیر نبود اختراع نکردم.'],
  },
  'survival-public-transport': {
    contextFa:'می‌خواهی به مرکز شهر بروی؛ اتوبوس شمارهٔ ۶ را می‌بینی اما هنوز مقصد و ساعتش را نمی‌دانی.',
    first:{text:'Hello. Can I help you?',goalFa:'بپرس اتوبوس ۶ به مرکز شهر می‌رود یا نه.',example:'Does bus six go to the town centre?'},
    branches:[
      {labelFa:'مسئول مقصد و ساعت را می‌گوید',text:'Yes. It leaves at eleven.',goalFa:'شماره و ساعت را یک‌جا تأیید کن.',example:'Bus six at eleven. Thank you.'},
      {labelFa:'مسئول شماره را اشتباه شنیده است',text:'Bus eight?',goalFa:'شمارهٔ مورد سؤال را اصلاح کن؛ زمان را حدس نزن.',example:'No, bus six, please.'},
    ],checksFa:['مقصد را پرسیدم، نه اینکه از شماره حدس بزنم.','شمارهٔ ۶ را با ساعت ۱۱ اشتباه نکردم.','در شاخهٔ روشن‌سازی، فقط شمارهٔ نادرست را اصلاح کردم.'],
  },
  'survival-appointments-and-time': {
    contextFa:'قرار خیالی قبلی دوشنبه ساعت ۱۰ است؛ می‌خواهی آن را عوض کنی. ساعت جدید را از مخاطب بگیر، نه از حدس خودت.',
    first:{text:'Good morning. How can I help you?',goalFa:'درخواست تغییر قرار کن.',example:'Can I change my appointment, please?'},
    branches:[
      {labelFa:'زمان تازه پیشنهاد می‌شود',text:'Tuesday at eleven?',goalFa:'اگر این زمان مناسب است، روز و ساعت را با هم تأیید کن.',example:'Yes, Tuesday at eleven. Thank you.'},
      {labelFa:'زمان قبلی برای روشن‌سازی پرسیده می‌شود',text:'Your appointment is Monday at ten?',goalFa:'زمان قبلی را تأیید کن اما هنوز آن را قرار جدید ننام.',example:'Yes. Can I change it, please?'},
    ],checksFa:['درخواست تغییر روشن بود.','زمان قبلی را با زمان تازه مخلوط نکردم.','قبول زمان تازه را فقط پس از پیشنهاد همان زمان گفتم.'],
  },
  'survival-invitations-and-plans': {
    contextFa:'جمعه وقت نداری. شنبه ساعت ۱۰ و یکشنبه ساعت ۱۱ برایت ممکن است. ابتدا شنبه را پیشنهاد کن.',
    first:{text:'Would you like to meet at the café on Friday?',goalFa:'مؤدبانه رد کن و شنبه ساعت ۱۰ پیشنهاد بده.',example:'Sorry, I cannot. How about Saturday at ten?'},
    branches:[
      {labelFa:'مخاطب پیشنهاد را می‌پذیرد',text:'Yes, Saturday at ten is good.',goalFa:'زمان و مکان نهایی را تأیید کن.',example:'See you at the café on Saturday at ten.'},
      {labelFa:'مخاطب شنبه هم وقت ندارد',text:'Sorry, I am busy on Saturday too.',goalFa:'یکشنبه ساعت ۱۱ را پیشنهاد کن؛ آن را توافق قطعی ندان.',example:'How about Sunday at eleven?'},
    ],checksFa:['رد دعوت کوتاه و مؤدبانه بود.','در شاخهٔ پذیرش زمان و مکان را تأیید کردم.','در شاخهٔ رد، پیشنهاد تازه را توافقِ انجام‌شده ننامیدم.'],
  },
  'survival-past-and-future-plans': {
    contextFa:'کارت خیالی: دیروز در خانه انگلیسی خواندی؛ فردا قصد داری Anna را ببینی.',
    first:{text:'What did you do yesterday?',goalFa:'کار دیروز را با نشانهٔ زمانی بگو.',example:'I studied English at home yesterday.'},
    branches:[
      {labelFa:'پرسش به برنامهٔ فردا تغییر می‌کند',text:'What are you going to do tomorrow?',goalFa:'از گذشته به برنامهٔ فردا برو.',example:'I am going to visit Anna tomorrow.'},
      {labelFa:'مخاطب مکان دیروز را اشتباه می‌گوید',text:'Were you at school yesterday?',goalFa:'مکان را به خانه اصلاح کن.',example:'No, I was at home yesterday.'},
    ],checksFa:['کار دیروز را با studied گفتم.','در شاخهٔ فردا از going to + فعل ساده استفاده کردم.','در شاخهٔ مکان، خانه را به مدرسه تغییر ندادم.'],
  },
  'survival-renting-a-home': {
    contextFa:'آگهی خیالی: اتاق نزدیک ایستگاه، آشپزخانه و حمام مشترک. اجاره و زمان بازدید مشخص نیستند؛ دربارهٔ همین اطلاعاتِ گمشده سؤال کن.',
    first:{text:'Hello. What would you like to know about the room?',goalFa:'اجارهٔ ماهانه را بپرس.',example:'How much is the rent a month?'},
    branches:[
      {labelFa:'اجاره اعلام می‌شود',text:'Five hundred dollars a month.',goalFa:'حالا دربارهٔ زمان بازدید سؤال کن.',example:'When can I see the room?'},
      {labelFa:'مخاطب بازهٔ قیمت را روشن می‌کند',text:'Do you want the price for one night?',goalFa:'روشن کن که مبلغ ماهانه را می‌خواهی، نه شبی.',example:'No, how much is it a month, please?'},
    ],checksFa:['اطلاعاتِ نداده را پرسیدم، نه اینکه مبلغی اختراع کنم.','ماهانه را با شبی اشتباه نکردم.','پس از پاسخ اجاره، سراغ زمان بازدید رفتم؛ قرارداد تخصصی لازم نبود.'],
  },
  'survival-hotel-and-stay': {
    contextFa:'نام خیالی تو Ben Lee و اتاقت شمارهٔ ۱۲ است. در اتاق حوله نیست.',
    first:{text:'Reception. What is your room number?',goalFa:'اتاق را بگو و حوله بخواه.',example:'Room twelve. Can I have a towel, please?'},
    branches:[
      {labelFa:'پذیرش درخواست را تأیید می‌کند',text:'A towel for room twelve?',goalFa:'تأیید و تشکر کن.',example:'Yes, please. Thank you.'},
      {labelFa:'پذیرش شماره را اشتباه شنیده است',text:'Room twenty?',goalFa:'شمارهٔ اتاق را اصلاح کن.',example:'No, room twelve, please.'},
    ],checksFa:['شمارهٔ اتاق ۱۲ باقی ماند.','درخواست towel روشن و مؤدبانه بود.','twelve و twenty را در روشن‌سازی از هم جدا کردم.'],
  },
  'survival-phone-and-messages': {
    contextFa:'تو Tim هستی و الان در ایستگاه هستی. Sara حاضر نیست؛ می‌خواهی بعد از ساعت ۶ تماس بگیرد. شمارهٔ واقعی لازم نیست.',
    first:{text:'Sara is not here. Can I take a message?',goalFa:'نام و درخواست تماس بعد از ۶ را در پیام بگو.',example:'This is Tim. Please ask Sara to call me after six.'},
    branches:[
      {labelFa:'پاسخ‌گو نام را دوباره می‌پرسد',text:'Who is calling, please?',goalFa:'نام فرستنده را روشن کن.',example:'This is Tim.'},
      {labelFa:'پاسخ‌گو زمان را اشتباه تکرار می‌کند',text:'Before six?',goalFa:'before را به after اصلاح کن.',example:'No, after six, please.'},
    ],checksFa:['فرستنده Tim و گیرنده Sara بود.','تماس را بعد از ۶ خواستم، نه قبل از آن.','فقط از موقعیت و نام خیالی استفاده کردم.'],
  },
};
