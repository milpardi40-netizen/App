// Build/verify a design document only. Never writes lib/, components/, or learner storage.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {loadInventory} = require('../../scripts/helpers/practical-inventory.cjs');
const hash = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');
const out = path.resolve(__dirname);
const read = p => JSON.parse(fs.readFileSync(p,'utf8'));
const modules = [
  'ورود به A1 و ابزار یادگیری', 'عدد، مالکیت و جای وسایل', 'زمان و کارهای روزمره',
  'علاقه‌ها و آب‌وهوا', 'خرید و سفارش', 'حرکت و قرار در شهر',
  'کلاس، دعوت و زمان‌های نزدیک', 'کار، فرم و محل اقامت', 'سفر، ارتباط و درخواست خدمات',
];
(async () => {
  process.chdir(path.resolve(__dirname,'../..'));
  const design = read(path.join(out,'design.json'));
  const lessons = design.lessons;
  const inventory = await loadInventory();
  const audit = read('docs/six-language-a1-audit/evidence.json');
  for (const [lang,bank] of Object.entries(inventory)) assert.equal(hash(bank), audit.inventoryHashes[lang], `${lang}: runtime is unchanged since comparative audit`);
  assert.equal(design.status,'proposal-not-runtime-content');
  const english = inventory.en;
  const core = english.filter(l=>l.levelId===1 && !l.id.startsWith('lab-'));
  const labs = english.filter(l=>l.levelId===1 && l.id.startsWith('lab-'));
  const pre = english.filter(l=>l.levelId===0);
  const ids = lessons.map(l=>l.id);
  assert.equal(ids.length,29);assert.equal(new Set(ids).size,29);
  assert.deepEqual([...ids].sort(),core.map(l=>l.id).sort());
  assert.equal(labs.length,8);assert.equal(labs.reduce((n,l)=>n+l.sentences.length,0),64);
  assert.equal(core.reduce((n,l)=>n+l.sentences.length,0),1450);
  assert.deepEqual([...new Set(lessons.map(l=>l.module))],[1,2,3,4,5,6,7,8,9]);
  const preIds = new Set(pre.map(l=>l.id));
  for(const [i,l] of lessons.entries()) {
    assert.equal(l.proposedIndex,i+1);
    const existing = core.find(x=>x.id===l.id);assert.equal(existing.sentences.length,50);
    assert.equal(new Set(existing.sentences.map(s=>s.id)).size,50,'sentence IDs unique within lesson, not necessarily across English');
    assert.ok(l.preA1Ids.length);
    for(const ref of l.preA1Ids)assert.ok(preIds.has(ref),`${l.id}: real Pre-A1 reference ${ref}`);
    for(const ref of l.prerequisiteIds)assert.ok(ids.indexOf(ref)>=0 && ids.indexOf(ref)<i,`${l.id}: prerequisite must precede lesson: ${ref}`);
    assert.deepEqual(l.transferToIds,lessons.slice(i+1).filter(x=>x.prerequisiteIds.includes(l.id)).map(x=>x.id));
    for(const key of ['outcomeFa','retrievalFa','vocabularyFa','grammarFa','outOfScopeFa','pronunciationFa','writingFa','speakingFa','commonErrorFa'])assert.ok(l[key]?.trim(),`${l.id}/${key}`);
    assert.equal(l.examples.length,6);assert.equal(new Set(l.examples.map(x=>x.en)).size,6);
    assert.equal(l.scene.length,4);
    for(const [n,turn]of l.scene.entries())assert.equal(turn.role,n%2?'learner':'partner');
    for(const row of [...l.examples,...l.scene])assert.ok(row.en.trim()&&row.fa.trim());
    assert.equal(l.checks.length,2);
    for(const task of l.checks){assert.equal(task.choices.length,3);assert.equal(new Set(task.choices).size,3);assert.ok(task.correctIndex>=0&&task.correctIndex<3);assert.ok(task.promptFa&&task.explanationFa);}
    for(const kind of ['listening','reading'])for(const key of ['passage','questionFa','answer'])assert.ok(l[kind][key]?.trim());
    assert.notEqual(l.listening.passage,l.reading.passage);
    assert.equal(l.productionSelfCheckFa.length,3);
  }
  const context = {
    capturedAt:'2026-11-26',purpose:'Design evidence only; not a migration or new runtime bank.',
    inventoryHashes:audit.inventoryHashes,
    englishCore:core.map(l=>({id:l.id,title:l.title,order:l.order,levelId:l.levelId,sentenceIds:l.sentences.map(s=>s.id),hash:hash(l)})),
    englishLabs:labs.map(l=>({id:l.id,order:l.order,hash:hash(l),sentenceIds:l.sentences.map(s=>s.id)})),
    protectedEnglishOutsideCore:hash(english.filter(l=>!ids.includes(l.id))),
    preA1:pre.map(l=>({id:l.id,title:l.title,order:l.order,teachingFa:l.teachingFa,samples:l.sentences.map(s=>({id:s.id,en:s.en,fa:s.fa}))})),
  };
  fs.writeFileSync(path.join(out,'runtime-context.json'),JSON.stringify(context,null,2)+'\n');
  let md = `# طراحی کامل A1 انگلیسی — هر ۲۹ درس اصلی\n\n**وضعیت: پیشنهاد برای بررسی و تأیید؛ هنوز در برنامه اجرا نشده است.**\n\nتاریخ: ۲۶ نوامبر ۲۰۲۶. مبنا: [ممیزی شش زبان](SIX-LANGUAGE-A1-INITIAL-AUDIT.md). هدف: مسیر مرتبط، از آسان به سخت، با اتکا به Pre-A1؛ نه ترجمهٔ نسخهٔ روسی و نه تکرار کامل مطالب مقدماتی.\n\n## حدود این بسته\n\n- هر ۲۹ درس اصلی یکجا طراحی شده است؛ نه پنج درس نمونه. برای هر درس: پیش‌نیاز، هدف، واژگان، دستور، تلفظ، شش نمونهٔ دوزبانه، چهار نوبت مکالمه، دو سنجش با گزینه و کلید، شنیدن و خواندن مستقل با کلید، نوشتن و گفتن شخصی و خطای رایج آمده است.\n- این‌ها **نمونه‌ها و قرارداد تألیف** هستند، نه بانک نهایی ۱۴۵۰ ردیف. در مرحلهٔ اجرا باید همهٔ ۵۰ ردیفِ هر درس با شناسه‌های موجود تألیف و بازبینی شوند. آوانویسی هر ردیف، همهٔ گزینه‌های آزمون نهایی و بررسی مستقل زبانی هنوز نهایی نشده‌اند.\n- ۸ درس مرور واژگان A1 با ۶۴ ردیف، Pre-A1، A2 تا C1، روسی و پنج زبان دیگر خارج از دامنهٔ تغییرند. بانک مکمل مستقل انگلیسی نیز صرفاً با این طراحی تغییر نمی‌کند.\n- ۹ بخش زیر **گروه‌بندی سند طراحی** است، نه افزودن مرحله یا ساختار جدید به رابط برنامه. ترتیب تازهٔ درس‌ها هم فعلاً پیشنهاد است و در کد اعمال نشده است.\n- ادعای تأیید رسمی CEFR یا آمادگی آزمون نداریم. خروجی‌ها بر ارتباط‌های سادهٔ شخصی/روزمره با واژه‌های پربسامد متمرکزند؛ بازبینی متخصص زبان و تجربهٔ یادگیرنده پیش از انتشار لازم است.\n\n## سیاست بار آموزشی با حفظ ساختار\n\nساختار کنونی برای هر درس ۵۰ ردیف دارد. کاهش آن یا افزودن زیرمرحلهٔ اجباری بدون اجازه انجام نمی‌شود. برای کاهش **مطلب تازه**، نه ادعای کاهش تعداد تمرین، توزیع پیشنهادی هر ۵۰ ردیف چنین است:\n\n|کارکرد تألیفی، نه مرحلهٔ تازهٔ رابط|تعداد ردیف|قاعده|\n|---|---:|---|\n|الگوهای اصلیِ هدف|۱۰|فهرست بلند چندموضوعی نباشد؛ هر ردیف یک پیام کوتاه|\n|جایگزینی کنترل‌شده|۲۰|نام، عدد، شیء یا زمان آشنا تغییر کند؛ گرامر تازه اضافه نشود|\n|بازیابیِ پیش‌نیاز در موقعیت تازه|۱۲|هدف همان درس را پشتیبانی کند؛ صرفاً بازنویسی بی‌هدف نباشد|\n|انتقال محدود و جمع‌بندی|۸|ترکیب دو الگوی آشنا؛ بدون جهش واژگانی یا زمانی|\n\nاین تقسیم، جایگاه شناسه‌های قدیمی را تعیین نمی‌کند؛ نگاشت دقیق هر شناسه به ردیف جدید در بانک اجرایی لازم است. تفاوت معنیِ هر ردیف باید برای بازنشانی محدودِ شواهد مشخص شود. تا وقتی همهٔ ۵۰ ردیف در جریان فعلی تمرین می‌شوند، خستگی ناشی از تعداد بالا کاملاً حل نمی‌شود؛ حل آن نیاز به تصمیم جداگانه دربارهٔ ساختار دارد.\n\nواژگان هر درس «هسته» است، نه فهرست جامع همهٔ شکل‌های متن. نام خاص، واژهٔ کمکی تازه، صورت صرفی و واژه‌های فقط دریافتیِ متن خواندن/شنیدن هم باید پیش از سنجش معرفی شوند. فهرست ماه‌ها/حروف، یک هدف گفتاری بسیار بلند نباشد؛ چند نمونهٔ کوتاه در همان ردیف‌های موجود پخش شود.\n\n## ترتیب پیشنهادی و پیش‌نیازها\n\n«فعلی» و «پیشنهادی» در جدول، جایگاه در میان ۲۹ درس اصلی‌اند؛ شمارهٔ کلی دوره پس از ۱۴ درس Pre-A1، ۱۴ واحد بیشتر است. ۸ مرور واژگان در جای فعلی خود پس از این ۲۹ درس می‌مانند.\n\n|ترتیب پیشنهادی|عنوان|شناسهٔ ثابت|جایگاه فعلی در A1|\n|---:|---|---|---:|\n`;
  for(const l of lessons){const old=core.findIndex(x=>x.id===l.id)+1;md+=`|${l.proposedIndex}|${l.titleFa}|\`${l.id}\`|${old}|\n`;}
  md+='\n';
  for(const [i,title] of modules.entries())md+=`- **بخش ${i+1}: ${title}** — درس‌های ${lessons.filter(l=>l.module===i+1).map(l=>l.proposedIndex).join('، ')}\n`;
  md+=`\n## پیوستگی عمدی، نه جلو انداختن تمام قواعد\n\n۱. معرفی و کمک ابتدا با چند قالب آماده انجام می‌شوند؛ مثلاً Can you help me? پیش از آموزش کامل can قابل استفاده است، ولی همهٔ کاربردهای can همان‌جا امتحان نمی‌شوند.\n۲. be و مالکیت از Pre-A1 بازیابی و در A1 منظم می‌شوند؛ از صفر آموزش‌دیده فرض نمی‌شوند و تسلط فرد هم صرفاً از حضور محتوا نتیجه‌گیری نمی‌شود.\n۳. عدد پیش از قیمت؛ مکان پیش از مسیر؛ ساعت پیش از قرار؛ حال ساده پیش از مقایسهٔ عادت با فعالیت جاری؛ دعوت پیش از گذشته/برنامه؛ فرم و قرار پیش از جست‌وجوی اتاق می‌آیند.\n۴. پرسش What time does it start? در درس ساعت یک قالب است؛ تحلیل does بلافاصله در درس روزمره تثبیت می‌شود. has در متن خانواده همراه توضیح کوتاه دریافتی و در روزمره همراه تمرین می‌آید.\n۵. گذشته و برنامهٔ آینده محدود به شکل‌های پربسامد و دو گذر روشن‌اند؛ یادگیری همهٔ گذشته‌های بی‌قاعده و زمان‌های پیشرفته لازم نیست.\n۶. کمک فوری و درخواست روشن‌سازی از درس ۳ در دسترس‌اند؛ قرارگرفتن درس تخصصی سلامت در انتها به معنی عقب‌انداختن امکان کمک‌خواستن نیست.\n\n## قرارداد مشترک تمرین‌ها\n\n- ابتدا یک جزء تغییر کند، سپس همان هدف بدون جملهٔ کامل اجرا شود؛ با دادهٔ خیالی. شنیدن پیش از نمایش متن پاسخ انجام شود و خواندن قابل بازخوانی باشد.\n- دو سنجش هر درس در این سند حداقل طراحی‌شده‌اند، نه دستور حذف بانک فعلی سؤال‌ها. تمام شواهد فعلی باید در اجرای نهایی با محتوای همان درس تطبیق یا بازنویسی شوند.\n- گزینهٔ درست میان جایگاه‌ها پخش است. معنی‌های معادل و صورت‌های درست کوتاه/کامل نباید به‌عنوان گزینهٔ غلط استفاده شوند.\n- **نوشتن اختیاری است**؛ دستور متناسب با همان درس جای متن عمومی سه تا پنج جمله‌ای را می‌گیرد. فرم و هجی می‌توانند پاسخ کوتاه و غیرجمله‌ای داشته باشند. هدف تعداد واژه نباید شرط اتمام یا نمره شود.\n- برچسب تولید آزاد برای این ۲۹ درس A1 است؛ نمونه‌ها و چک‌لیست باید متعلق به همان درس باشند، نه عنوان B1 یا دستور عمومیِ بی‌ارتباط.\n- لهجهٔ ورودی/شنیدن فعلی en-US بدون تصمیم جداگانه تغییر نمی‌کند. واژه‌های بریتانیایی موجود مثل pound، centre و single/return در بافت روشن‌اند؛ املاهای colour/color و centre/center و صورت‌های درست دیگر پذیرفته شوند.\n- اتاق نهایی: ابتدا صحنهٔ کوتاه پیوسته، سپس مرورِ همهٔ ۵۰ هدف؛ «من شروع می‌کنم» نباید ترتیب معنایی صحنه را به هم بریزد. جابه‌جایی نقش‌ها با جابه‌جایی مکانیکی نوبت‌ها یکی نیست.\n- تصویر، نقشه، فایل، کارت یا مکالمهٔ بیرونیِ غایب فرض نمی‌شود. تمام اطلاعات پرسش در متن یا دادهٔ قابل‌نمایش همان تمرین هست.\n- معیار مشترک تولید شخصی: هدف انجام شده؛ واژه/الگوی درس استفاده شده؛ اشخاص، روز، ساعت، قیمت و مکان با هم تناقض ندارند. پاسخ آزاد با تطابق دقیق یک جملهٔ ثابت نمره‌گذاری نشود.\n\n---\n`;
  for(const l of lessons){
    const existing=core.find(x=>x.id===l.id);
    const preTitles=l.preA1Ids.map(id=>`\`${id}\` (${pre.find(x=>x.id===id).title})`).join('؛ ');
    const dep=l.prerequisiteIds.map(id=>`درس ${ids.indexOf(id)+1}: ${lessons.find(x=>x.id===id).titleFa}`).join('؛ ')||'معرفی کوتاه Pre-A1؛ پیش‌نیاز A1 ندارد';
    const later=l.transferToIds.map(id=>`درس ${ids.indexOf(id)+1}`).join('، ')||'کاربرد ترکیبی در مرور شخصی پایان A1؛ بدون افزودن درس اجباری تازه';
    md+=`\n## درس ${l.proposedIndex} — ${l.titleFa}\n\nشناسهٔ ثابت: \`${l.id}\` · بخش ${l.module} · جایگاه فعلی کل دوره: ${existing.order} · جایگاه پیشنهادی کل دوره: ${14+l.proposedIndex}\n\n**توانایی پایان درس:** ${l.outcomeFa}\n\n**پیش‌نیاز A1:** ${dep}\n\n**اتصال مستند به Pre-A1:** ${preTitles}\n\n**بازیابی آغازین:** ${l.retrievalFa}\n\n**واژگان هسته:** ${l.vocabularyFa}\n\n**دستور و توضیح درس:** ${l.grammarFa}\n\n**تلفظ و شنیدن:** ${l.pronunciationFa}\n\n**مرز سطح/هدف:** ${l.outOfScopeFa}\n\n### شش نمونهٔ پایه\n\n`;
    for(const [i,s]of l.examples.entries())md+=`${i+1}. **${s.en}** — ${s.fa}\n`;
    md+='\n### هستهٔ صحنهٔ پیوسته\n\n';
    for(const t of l.scene)md+=`- **${t.role==='partner'?'مخاطب':'زبان‌آموز'}:** ${t.en} — ${t.fa}\n`;
    md+='\nاین چهار نوبت هستهٔ طراحی‌اند؛ در اجرای نهایی پایان‌بندی طبیعی و هر دو حالت شروع جداگانه بررسی می‌شوند. سپس مرور همهٔ ردیف‌ها جدا از صحنه اجرا می‌شود.\n\n### سنجش کنترل‌شده\n\n';
    for(const [i,t]of l.checks.entries())md+=`${i+1}. ${t.promptFa}${t.source?' **'+t.source+'**':''}\n   - گزینه‌ها: ${t.choices.join(' / ')}\n   - کلید طراحی: **${t.choices[t.correctIndex]}** — ${t.explanationFa}\n`;
    md+=`\n### شنیدن و خواندن مستقل\n\n**شنیدن:** ${l.listening.passage}\n\nپرسش: ${l.listening.questionFa} **کلید طراحی:** ${l.listening.answer}\n\n**خواندن:** ${l.reading.passage}\n\nپرسش: ${l.reading.questionFa} **کلید طراحی:** ${l.reading.answer}\n\n### تولید شخصی و پیوند بعدی\n\n**نوشتن اختیاری:** ${l.writingFa}\n\n**گفتن شخصی:** ${l.speakingFa}\n\n**خطای محتمل/احتیاط تألیفی:** ${l.commonErrorFa}\n\n**بازیابی بعدی:** ${later}\n\n---\n`;
  }
  md+=`\n## قرارداد اجرای بعدی و حفظ اطلاعات\n\nاین بخش نقشهٔ اجراست؛ هیچ‌کدام در این مرحله اعمال نشده‌اند.\n\n|موضوع|قرارداد لازم|\n|---|---|\n|شناسه‌ها|هر ۲۹ lessonId و ۱۴۵۰ sentenceId در محدودهٔ درس خود ثابت بمانند؛ در انگلیسی s1 و مانند آن بین چند درس مشترک است، پس کلید باید ترکیب lessonId/sentenceId باشد|\n|تعداد و مراحل|۲۹ درس اصلی + ۸ مرور؛ ۵۰ ردیف هر درس اصلی؛ ۱۰ مرحلهٔ فعلی؛ بدون مهاجرت schema یا بازطراحی رابط|\n|ترتیب|فقط ترتیب ۲۹ درس اصلی، پس از تأیید طرح؛ Pre-A1 و مرورها و شمارهٔ درس‌های سطوح بالاتر جابه‌جا نشوند|\n|مونتاژ محتوا|خروجی نهایی SENTENCE_LESSONS مبناست؛ افزودن طرح به فایل خام کافی نیست، چون completion/extension و insertLabLessons روی خروجی اثر دارند|\n|سنجش|FOUNDATION_LESSON_EVIDENCE، SURVIVAL_EXPANSION_EVIDENCE، ورودی نهایی CORE_LESSON_EVIDENCE و پرسش‌های تولیدی expandedEvidenceTasks باید همگی با درس جدید منطبق شوند؛ مثلاً آزمون ماه/تاریخ دیگر نباید در درس کمک باقی بماند|\n|گزارش پیشرفت|اتمام درس و مکان ذخیره‌شده پاک نشوند؛ امتیاز/پاسخ قدیمیِ معنای عوض‌شده به محتوای تازه نسبت داده نشود؛ نسخه‌بندی فقط دامنهٔ ۲۹ شناسهٔ هسته، نه تمام levelId=1 که مرورها را هم می‌گیرد|\n|ادامهٔ درس|درس‌های جابه‌جا یا دارای ردیف تغییرمعنی را با شناسهٔ ثابت بازیابی کن؛ شواهد attempt و checksRevision و sentenceIndex ذخیره‌شده بررسی شوند؛ بازنشانی محدودِ بخش وابسته به محتوا، نه بازنشانی کل دوره|\n|گفتار و واژگان|نتیجهٔ تلفظ/مرورِ جملهٔ تغییرمعنی اعتبار محتوای تازه نیست؛ محل مصرف outcome و صف مرورِ مبتنی بر جمله باید ردیابی شود؛ تاریخچهٔ خام نگه داشته شود|\n|اتاق مکالمه|نسخهٔ محتوایی مخصوص هستهٔ A1؛ صحنهٔ پیوسته + پوشش ۵۰/۵۰ برای هر دو شروع؛ روند امتیازهای متن قدیم با متن تازه مخلوط نشود|\n|تولید شخصی|برچسب A1 و دستور اختصاصی؛ تکلیف هجی/فرم کوتاه مجاز؛ ذخیرهٔ قبلی کاربر حذف نشود و به‌عنوان پاسخ تأییدشدهٔ تکلیف تازه نشان داده نشود|\n|دامنهٔ حفاظت|تمام شش زبان دیگر، انگلیسی خارج از ۲۹ درس هسته، ۸ مرور A1 و بانک مستقل مکمل با شاهد ثابت حفاظت شوند|\n\nمسیرهای اجرایی مهم: \`lib/courseContent.ts\` و فایل‌های Foundation/Survival completion/expansion؛ \`lib/englishFoundationEvidence.ts\`، \`lib/englishSurvivalEvidence.ts\`، \`lib/lessonEvidenceBank.ts\`، \`lib/lessonAssessment.ts\`، \`lib/englishStudyState.ts\`، \`components/EnglishLessonRoute.tsx\`، \`lib/lessonDialoguePairs.ts\` و \`components/ProductionTask.tsx\`. این فهرست جای ردیابی کامل مصرف‌کنندگان در اجرای بعدی نیست.\n\n## شواهد و آزمون همین مرحله\n\n- دادهٔ طرح: [design.json](english-a1-design/design.json)؛ منبع تألیف: [authoring.py](english-a1-design/authoring.py).\n- شاهد ساختار فعلی، شناسه‌ها و تمام ۱۲۴ ردیف Pre-A1: [runtime-context.json](english-a1-design/runtime-context.json). ارجاع Pre-A1 فقط حضور محتوا را ثابت می‌کند، نه تسلط یادگیرنده.\n- بازتولید: \`python docs/english-a1-design/authoring.py && node docs/english-a1-design/build.cjs\`.\n- اعتبارسنجی خودکار: هر ۲۹ شناسه دقیقاً یک بار؛ ۹ بخش؛ تمام پیش‌نیازهای A1 قبل از مصرف و بدون دور؛ تمام ارجاع‌های Pre-A1 واقعی؛ ۱۷۴ نمونهٔ دوزبانه؛ ۱۱۶ نوبت صحنه؛ ۵۸ سنجش با گزینه/کلید معتبر؛ ۲۹ متن شنیدن و ۲۹ متن خواندن؛ ۲۹ تکلیف نوشتن و ۲۹ تکلیف گفتن.\n- هش مونتاژ فعلی هر هفت زبان با شواهد ممیزی قبلی یکسان می‌ماند؛ این دستور فقط فایل‌های مستندات را می‌نویسد و فایل اجرایی یا ذخیرهٔ کاربر را تغییر نمی‌دهد.\n- این آزمون‌ها صحت زبانی همهٔ مثال‌ها، CEFR رسمی، کیفیت صوت، تجربهٔ واقعی یادگیرنده یا رفتار دستگاه را اثبات نمی‌کنند. تست کامپوننتِ mountشده برای کل ۱۴۵۰ هدف × دو شروع، مهاجرت شواهد، رگرسیون‌ها و کنترل دستگاه در مرحلهٔ اجرای تأییدشده لازم است؛ اکنون ادعای عبور آن‌ها نداریم.\n\n## تصمیم بعدی\n\nاین طرح برای بررسی یکجای مسیر و محتوای هر ۲۹ درس ارائه شده است. پس از تأیید، تألیف و اجرای تمام ۲۹ درس اصلی در همین دامنه انجام شود؛ نه پیاده‌سازی پراکندهٔ چند درس و نه دست‌زدن هم‌زمان به زبان‌های دیگر.\n\n**ساخت APK همچنان تا دریافت جزئیات ایرادهای نسخهٔ ۱۷۹ متوقف است.**\n`;
  fs.writeFileSync('docs/ENGLISH-A1-ALL-29-DETAILED-DESIGN.md',md);
  console.log('PASS design: 29 exact core IDs; 9 modules; acyclic backward prerequisites; 174 bilingual examples; 116 scene turns; 58 checks; 58 comprehension tasks; 58 personal-production tasks.');
  console.log('PASS protected: all seven assembled course hashes unchanged since the six-language audit.');
  console.log('Wrote design document and runtime-context.json ONLY (no runtime changes).');
})().catch(e=>{console.error(e);process.exitCode=1;});
