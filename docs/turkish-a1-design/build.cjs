// Historical, read-only proposal validator: do not refresh baseline after implementation.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {loadInventory}=require('../../scripts/helpers/practical-inventory.cjs');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
(async()=>{
 process.chdir(path.resolve(__dirname,'../..'));
 const d=JSON.parse(fs.readFileSync(path.join(__dirname,'design.json'),'utf8'));
 const b=JSON.parse(fs.readFileSync(path.join(__dirname,'runtime-context.json'),'utf8'));
 const inv=await loadInventory();
 for(const [lang,bank] of Object.entries(inv))assert.equal(hash(bank),b.inventoryHashes[lang],lang+': complete inventory unchanged');
 for(const [file,expected] of Object.entries(b.sourceHashes))assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'),expected,file+': source unchanged');
 const ls=d.lessons, ids=ls.map(l=>l.id),core=inv.tr.filter(l=>l.levelId===1),pre=new Set(b.preA1.map(l=>l.id));
 assert.equal(d.language,'tr');assert.equal(d.status,'proposal-not-runtime-content');
 assert.equal(ls.length,64);assert.equal(new Set(ids).size,64);
 assert.deepEqual([...ids].sort(),core.map(l=>l.id).sort());
 assert.equal(core.reduce((n,l)=>n+l.sentences.length,0),512);
 assert.ok(core.every(l=>l.sentences.length===8&&l.checks.length===2));
 assert.equal(core.reduce((n,l)=>n+l.dialogue.length,0),228);
 assert.equal(core.filter(l=>l.dialogue.length%2).length,30);
 assert.equal(hash(inv.tr.filter(l=>l.levelId!==1)),b.protectedTurkishOutsideA1);
 assert.equal(b.preA1.length,25);assert.equal(b.preA1.reduce((n,l)=>n+l.sentences.length,0),210);
 assert.deepEqual([...new Set(ls.map(l=>l.module))],Array.from({length:12},(_,i)=>i+1));
 for(const [i,l] of ls.entries()){
  const old=b.turkishA1.find(t=>t.id===l.id),now=core.find(t=>t.id===l.id);
  assert.equal(l.proposedIndex,i+1);assert.equal(hash(now),old.hash);assert.deepEqual(now.sentences.map(s=>s.id),old.sentenceIds);
  assert.ok(l.preA1Ids.length);for(const p of l.preA1Ids)assert.ok(pre.has(p),l.id+': Pre-A1 '+p);
  for(const p of l.prerequisiteIds)assert.ok(ids.indexOf(p)>=0&&ids.indexOf(p)<i,l.id+': backward prerequisite '+p);
  assert.deepEqual(l.transferToIds,ls.slice(i+1).filter(t=>t.prerequisiteIds.includes(l.id)).map(t=>t.id));
  for(const k of ['outcomeFa','grammarFa','vocabularyFa','outOfScopeAndErrorFa','pronunciationFa','productionFa','retrievalFa'])assert.ok(l[k]?.trim(),l.id+'/'+k);
  assert.equal(l.scene.length,old.dialogueTurns);
  for(const [j,t] of l.scene.entries()){assert.equal(t.role,j%2?'learner':'partner');assert.ok(t.tr&&t.fa);assert.ok(!/[{}]/.test(t.tr+t.fa));}
  for(const k of ['listening','reading']){
   assert.ok(l[k].passage&&l[k].questionFa&&l[k].answer);
   assert.notEqual(l.listening.passage,l.reading.passage,l.id+': independent passages');
   assert.ok(!l.scene.some(t=>t.tr===l[k].passage),l.id+': not scene memorization');
  }
 }
 const title=id=>b.turkishA1.find(l=>l.id===id)?.title||b.preA1.find(l=>l.id===id)?.title||id;
 const link=id=>{const n=ids.indexOf(id);return n<0?`${title(id)} (Pre-A1)`:`[${n+1}. ${title(id)}](#lesson-${n+1})`;};
 const oldIndex=id=>b.turkishA1.findIndex(l=>l.id===id)+1;
 const preRows=b.preA1.reduce((n,l)=>n+l.sentences.length,0);
 const out=[`# طرح کامل A1 ترکی استانبولی — هر ۶۴ درس

**وضعیت: پیشنهاد برای تأیید؛ محتوای اجرایی ترکی هنوز تغییر نکرده است.**

تاریخ سند: ۲۶ نوامبر ۲۰۲۶. این طرح پس از تکمیل مستقل روسی، انگلیسی، آلمانی، فرانسوی و اسپانیایی و با بررسی موجودی واقعی ترکی تهیه شده است؛ ترجمهٔ طرح اسپانیایی نیست.

## محدوده و شمارش واقعی

- تمام **۶۴ درس A1 × هشت ردیف = ۵۱۲ جایگاه**. شناسهٔ تمام درس‌ها و ردیف‌ها ثابت می‌ماند؛ ترتیب آموزشی پیشنهادی تغییر می‌کند.
- **۲۵ درس Pre-A1 و ${preRows} ردیف** پیش از این سطح وجود دارد: ۱۴ درس نخست واژگان، سپس جفت‌واژه/ترکیب، جمله و مکالمه. معرفی قبلی، معادل تسلط نیست.
- تمام **۲۲۸ نوبت صحنه** در همین طرح دوزبانه نوشته شده‌اند و تعداد نوبت همان درس حفظ می‌شود. **۳۰ درس صحنهٔ فردنوبتی** دارند؛ صحنهٔ آخر پنج نوبت دارد. نباید برای زوج‌کردن اتاق حذف یا پرکننده اضافه کرد.
- **۱۲۸ جایگاه سنجش تألیفی**، دو جایگاه در هر درس، محفوظ؛ سازوکار فعلی برای هشت ردیف پنج پرسش می‌سازد: جمعاً **۳۲۰ پرسش**. کیفیت گزینه‌های نهایی پس از تأیید جدا کنترل می‌شود.
- طرح برای هر درس **یک شنیدن و یک خواندن مستقل با سؤال و کلید** دارد: جمعاً **۱۲۸ تمرین مستقل**؛ **۶۴ تکلیف تولیدی اختیاری** نیز مشخص است.
- این سند **بانک نهایی هر ۵۱۲ ردیف، آوانویسی همهٔ جمله‌ها، صوت یا گزینه‌های نهایی آزمون نیست**. تألیف و اتصال آن‌ها فقط پس از تأیید انجام خواهد شد.
- زبان هدف ترکی معیار امروزی استانبولی با localeِ tr-TR است؛ تنوع معتبر گفتاری به‌صرف تفاوت لهجه خطا نیست.
- ترکیِ خارج از A1، شش زبان دیگر، ده مرحلهٔ فعلی درس و سابقهٔ ذخیره‌شده محافظت می‌شوند. APK همچنان متوقف است؛ commit/push/PR انجام نشده است.

## تصمیم‌های مخصوص ترکی و مسیر آسان به سخت

۱. سلام → تلفظ و هجیِ کم‌بار → ابزار درخواست کمک → معرفی؛ دانش‌آموز از آغاز راه درخواست تکرار دارد. کلمات دشوار و جمله‌های بلند از درس نخست تلفظ حذف می‌شوند.

۲. **هماهنگی واکه‌ها از جایگاه فعلی ۳۳ به ۵ و ترتیب جمله از ۳۴ به ۶ می‌آیند.** این موضوع‌ها در Pre-A1 اشاره شده‌اند؛ اکنون پیش از گسترش پسوندها با نمونهٔ ساده روشن می‌شوند. قاعدهٔ چهارگانه، تغییر همخوان و میانجی فقط هنگام نیاز و با نمونهٔ مشخص تدریس می‌شوند.

۳. ترکی جنس دستوری و الگوی حرف تعریف اروپایی ندارد. جملهٔ اسمی بدون فعل مستقل و جملهٔ فعلی با ضمیر حذف‌شده می‌تواند کامل باشد. SOV الگوی خنثای آموزشی است، نه تنها ترتیب مجاز زبان.

۴. اسم و شمار/اشاره/وصف پیش از خانواده و تحلیل مالکیت؛ سپس **var/yok** برای وجود و داشتن. نفی اسمی **değil**، نبودن **yok** و نفی فعل یک ساخت نیستند. رنگ‌ها و خانواده در Pre-A1 آمده‌اند؛ اینجا انتقال و انتخاب سنجیده می‌شود.

۵. مصدر/ریشه → ساخت پیام → -yor → فعل‌های رایج → نفی/پرسش → واژه‌های پرسشی. صورت‌های ضروری مانند konuşuyorum و tekrar eder misiniz ابتدا قالبِ توضیح‌داده‌شده‌اند؛ تدریس کامل صرفِ آن‌ها ادعا نمی‌شود.

۶. **مکان → -DA → -(y)A → -DAn → -(y)I → ترکیب مکانی**. مکان، مقصد، مبدأ و مفعول مشخص تدریجی از هم جدا می‌شوند. عدد+اسم عادی مفرد است؛ مفعول نامعین خودکار پسوند مفعولی نمی‌گیرد.

۷. علاقه/خواسته/نیاز → توانایی → درخواست و اجازه. **gelmiyorum** با **gelemiyorum** یکی نیست. istemek با مصدر ساده و sevmek با صورتِ اسمیِ مفعولی، مکانیکی با هم جایگزین نمی‌شوند.

۸. ساعت و روز و برنامهٔ روز/هفته پیش از دعوت، بلیت و تماس؛ چهار حالتِ عملی اسم و واژگان آشنا در خوراک و خرید و سپس سفر بازیابی می‌شوند. مقایسه بعد از -DAn می‌آید.

۹. آیندهٔ نزدیک مطابق دامنهٔ فعلی با زمان آینده و -yor برای برنامه است؛ صرف گستردهٔ -acak/-ecek در این مرحله وارد نمی‌شود. **گذشتهٔ اخیر ترکی واقعاً گذشته دارد** و برخلاف تصمیم اسپانیایی به حال تبدیل نمی‌شود: چند صورت پرکاربرد با -DI، بدون روایت بلند و -miş.

۱۰. پایان مسیر: دو جملهٔ مرتبط برای دلیل/نتیجه و مکالمهٔ پیوسته با رفع مانع و توافق واقعی. معیار، طول جمله یا تعداد قواعد نیست؛ پیام روشن و پیوسته است. این طراحی تضمین یا گواهی رسمی CEFR نیست.

## قرارداد تألیف پس از تأیید

- هر درس هشت ردیفی: **سه الگوی اصلی، دو جایگزینی کنترل‌شده، دو بازیابی پیش‌نیاز و یک انتقال**؛ ۳+۲+۲+۱=۸. فهرست گستردهٔ عنوان درس به معنی تسلط همهٔ جزئیات در هشت ردیف نیست. ابتدا واژه‌های آسان و مهم، سپس ترکیب؛ الگوهای قبلی در زمینهٔ تازه بازیابی شوند.
- قالب‌های ضروریِ جلوتر از دستور باید با معنی و نقش کامل در آموزش همان درس معرفی شوند، نه به‌عنوان دانشِ فرضی. مثلاً adın، çantam/ملکیِ آشنا و درخواست ادب می‌توانند قالب بازیابی باشند؛ تحلیل مولدشان جای خود را در مسیر دارد.
- هر واژه/صورت هدف در صحنه، متن مستقل و پاسخ باید در Pre-A1 یا ردیف‌ها/واژگان همان درس یا درس‌های پیشین معرفی شده باشد. در اجرا فهرست واژگان و صورت‌های صرفی و اتصال واقعی پیش‌نیاز کنترل شود؛ صرفِ عقب‌بودن یال‌های طرح، اثبات بسته‌بودن واژگانی نیست.
- دو سؤال تألیفی هر درس: یکی معنی/موقعیت و یکی تمایز ساخت یا پاسخ مناسب؛ سه سؤال تکمیلی پوشش آموزشی را گسترش دهند. گزینهٔ نهایی دقیقاً یک جواب دفاع‌پذیر داشته باشد؛ خطای تمرین با تفاوت معتبر کاربرد اشتباه نشود.
- شنیدن مستقل پیش از پاسخ، متن/ترجمه را نشان ندهد؛ دادهٔ شنیداری باید واقعاً پخش شود. خواندن، استنباط کوتاه از پیام/فرم/تابلو است نه مرتب‌کردن واژهٔ جملهٔ حفظ‌شده. صورت‌های تازهٔ موجود در طرح هنوز باید در تألیف همان درس پوشش داده شوند.
- تکلیف تولیدی در مرحلهٔ موجود و بدون افزودن مرحلهٔ یازدهم نصب شود؛ بدون میکروفن هم قابل انجام و قابل ردشدن باشد. ارزیابی خودکار دقیق تلفظ/نمرهٔ گفتاری ادعا نمی‌شود. اطلاعات واقعی شخصی/پزشکی لازم نیست.
- هر صحنه یک موقعیت و مرجع ثابت دارد؛ sen/siz بی‌دلیل عوض نشوند. نقش partner/learner در داده ترتیب اصلی را نشان می‌دهد. در حالت شروع «من»، نقش‌ها باید با حفظ ترتیب زمانی کل صحنه عوض شوند، نه این‌که هر دو خط جداگانه معکوس شوند.
- **اتاق: صحنهٔ پیوسته و مرور هشت ردیف دو بخش روشن باشند**. هر هشت شناسهٔ آموزشی باید هدف زبان‌آموز در مرور شود؛ طوطی‌وار تکرارشدن را exchange واقعی نام‌گذاری نکنیم. نوبت آخر صحنهٔ سه/پنج‌نوبتی نباید حذف شود. واژهٔ تک و پاسخ کوتاهِ معتبر در ترکی پذیرفته است.

## ساختار موجود رابط — بدون ادعای گروه‌بندی تازه

بررسی components/TurkishLibrary.tsx نشان می‌دهد فهرست A1 با **بسته‌های ده‌درسی** باز و بسته می‌شود: برای ۶۴ درس، شش بستهٔ ده‌تایی و یک بستهٔ چهارتایی. این سازوکار حفظ می‌شود. TURKISH_LEVELS سطح ۱ را A1 · Foundation & Survival می‌نامد و modules فهرست عنوان درس‌ها است؛ نمایش و ترتیب آن باید با ترتیب مصوب همسو شود، نه اینکه ساختار جدید دوازده‌بخشی جای آن بنشیند.

**دوازده بخش این سند فقط گروه آموزشی‌اند**؛ نه دوازده مرحله، نه دوازده منوی تازه. ده مرحلهٔ TurkishLesson و همهٔ شناسه‌ها حفظ خواهند شد. شناسه‌های tr-l2-* واقعاً levelId=1 دارند و A1 هستند؛ نام قدیمی نباید باعث انتقال به A2 شود.

ورودی الحاقی FoundationA1Entry و مسیر app/foundation/[language].tsx فعلاً برای ترکی نقشهٔ ۱۲سرفصل و نمونه‌های قدیمی نشان می‌دهند؛ تبدیل آن به یک دورهٔ جدا یا دستکاری زبان‌های دیگر در این طرح نیست. در اجرای مصوب باید از همین ورودی نیز به کتابخانهٔ واقعی A1 ترکی هدایت شود یا پیام/لینک روشن همان مسیر اضافه شود؛ نمونهٔ ناقص نباید مسیر اصلیِ گمراه‌کننده باقی بماند. ارجاعات شناسه‌ای getFoundationGreetings نباید خراب شوند.

## قرارداد حفاظت و مهاجرت اجرای آینده

۱. baseline در docs/turkish-a1-design/runtime-context.json فقط خواندنی است و پس از اجرا بازنویسی نمی‌شود. ترتیب جدید بر همان ۶۴ ID اعمال و جایگاه‌های هر ردیف حفظ می‌شود؛ دادهٔ سایر سطوح/زبان‌ها با هش محافظت شود.

۲. تغییر معنا با ثابت‌ماندن ID، مجوز ارث‌بردن تسلط قبلی نیست. نگاشت دقیق متن/معنیِ تغییرکرده و revision جدا برای محتوا، سنجش و اتاق لازم است. ردیفِ بدون تغییر بی‌دلیل پاک نشود.

۳. سابقهٔ قبلی در آرشیو محفوظ بماند، اما completed/check answers/room turns قدیمی به معنی گذراندن محتوای تازه نباشند؛ آمار تلاش تاریخی حفظ و تسلط جدید جدا محاسبه شود. اتاق، جواب‌ها، resume و نمایش پیشرفت واقعی باید آزمون شوند.

۴. خطای نوشتن آرشیو یا primary موجب حذف غیرقابل‌بازگشت یا اعلام موفقیت دروغین نشود. autosave دیررس نسخهٔ قدیمی و ادغام backup/cloud نباید revision کهنه را دوباره فعال کنند. کلید فعلی turkish_lesson_sessions_v1 حفظ یا با مهاجرت سازگار مدیریت شود؛ پاک‌کردن عمومی storage مجاز نیست.

۵. تست نهایی باید علاوه بر داده، خود TurkishLesson، نقش‌های هر دو شروع، همهٔ ۵۱۲ هدف مرور، ۶۴ تولید، ۱۲۸ تمرین مستقل و سناریوهای ذخیره/بازگشت را بررسی کند. این آزمون‌های اجرایی هنوز اجرا نشده‌اند؛ این مرحله فقط طراحی است.

## ترتیب کامل پیشنهادی

شمارهٔ پیشنهادی داخل A1 است؛ در مسیر واقعی پس از ۲۵ درس Pre-A1 می‌آید. ستون فعلی نیز داخل A1 است، نه شمارهٔ کلی سطح‌ها.

|پیشنهادی|فعلی|درس|ردیف|نوبت صحنه|بخش آموزشی|
|---:|---:|---|---:|---:|---|`];
 for(const l of ls)out.push(`|${l.proposedIndex}|${oldIndex(l.id)}|[${title(l.id)}](#lesson-${l.proposedIndex})|8|${l.scene.length}|${d.modules[l.module]}|`);
 out.push('\n## طراحی تفصیلی همهٔ درس‌ها\n');
 for(const l of ls){
  out.push(`<a id="lesson-${l.proposedIndex}"></a>\n\n### ${l.proposedIndex}. ${title(l.id)}\n\nشناسهٔ ثابت: \`${l.id}\` · جایگاه فعلی A1: ${oldIndex(l.id)} · بخش: ${d.modules[l.module]} · ۸ ردیف / ${l.scene.length} نوبت صحنه\n\n- **هدف عملی:** ${l.outcomeFa}\n- **پایهٔ Pre-A1:** ${l.preA1Ids.map(link).join('؛ ')}\n- **پیش‌نیاز A1:** ${l.prerequisiteIds.length?l.prerequisiteIds.map(link).join('؛ '):'شروع مسیر؛ بازیابی سلام و پاسخ Pre-A1'}\n- **بازیابی آغاز:** ${l.retrievalFa}\n- **واژگان مهم:** ${l.vocabularyFa}\n- **دستور و ساخت:** ${l.grammarFa}\n- **مرز سطح و خطای مهم:** ${l.outOfScopeAndErrorFa}\n- **شنیدن/تلفظ:** ${l.pronunciationFa}\n\n**صحنهٔ پیوستهٔ دوزبانه**\n\n|نوبت|نقش در شروع اصلی|ترکی|فارسی|\n|---:|---|---|---|`);
  l.scene.forEach((t,i)=>out.push(`|${i+1}|${t.role==='partner'?'هم‌صحبت':'زبان‌آموز'}|${t.tr}|${t.fa}|`));
  out.push(`\n**شنیدن مستقل**\n\n> ${l.listening.passage}\n\nپرسش: ${l.listening.questionFa} **کلید مدرس: ${l.listening.answer}.**\n\n**خواندن مستقل**\n\n> ${l.reading.passage}\n\nپرسش: ${l.reading.questionFa} **کلید مدرس: ${l.reading.answer}.**\n\n**تولید اختیاری:** ${l.productionFa}\n\n**اتصال به ادامه:** ${l.transferToIds.length?l.transferToIds.map(link).join('؛ '):'بازیابی در جمع‌بندی پایانی؛ این ردیف یالِ مستقیمِ پیش‌نیاز در درس بعدی ندارد.'}\n`);
 }
 out.push(`## نتیجهٔ کنترل همین مرحله\n\n- ۶۴ شناسهٔ یکتا، ۵۱۲ جایگاه و پیش‌نیازهای فقط رو به عقب: تأیید شد.\n- ۲۲۸ نوبت صحنه با حفظ طول دقیق هر درس، از جمله هر ۳۰ صحنهٔ فردنوبتی: تأیید شد.\n- ۱۲۸ متن مستقل با سؤال و کلید و ۶۴ تکلیف تولیدی: وجود و اتصال طرح تأیید شد.\n- هش موجودی هر هفت زبان و فایل‌های اجرایی baseline: بدون تغییر.\n- این کنترل ساختاری، تأیید گویندهٔ بومی، اجرای واقعی صوت/میکروفن، موفقیت مهاجرت یا گواهی CEFR نیست. همهٔ ادعاهای اجرایی به مرحلهٔ پس از تأیید موکول‌اند.\n\n**گام بعد فقط با تأیید:** تألیف و اجرای هر ۶۴ درس ترکی با هم، سپس آزمون و گزارش؛ نه پنج نمونه و نه تغییر هم‌زمان عربی. APK همچنان در توقف می‌ماند.\n`);
 fs.writeFileSync('docs/TURKISH-A1-ALL-64-DETAILED-DESIGN.md',out.join('\n')+'\n');
 fs.writeFileSync(path.join(__dirname,'validation.json'),JSON.stringify({status:'PASS',phase:'design-only-not-runtime-implementation',lessons:64,rows:512,authoredChecks:128,adaptiveChecks:320,sceneTurns:228,oddLengthScenes:30,independentSkills:128,productionTasks:64,preA1Lessons:25,preA1Rows:preRows,allSevenInventoriesUnchanged:true,baselineSourceHashesUnchanged:true,backwardPrerequisites:true},null,2)+'\n');
 console.log('PASS Turkish A1 proposal: 64 lessons/512 stable slots/228 exact scene turns/128 skills/64 production; backward prerequisites.');
 console.log('PASS protection: all seven runtime inventories and baseline source hashes unchanged. Documentation only.');
})().catch(e=>{console.error(e);process.exit(1)});
