"""Design only. Emits documentation data; never writes runtime content or learner stores."""
import json
from pathlib import Path
OUT=Path(__file__).parent
LESSONS=[]
MODULES={
1:'ورود به A1 و اطلاعات پایه',2:'شخص، اسم و توصیف',3:'ساخت جمله و فعل‌های پایه',
4:'زمان، کار و برنامهٔ روزانه',5:'خانه و مکان',6:'خوراک، خرید و انتخاب',
7:'تفریح و ارتباط اجتماعی',8:'رفت‌وآمد و سفر',9:'درخواست، ارتباط و تجربهٔ اخیر',10:'دلیل ساده و جمع‌بندی مرتبط'}
FOCUS={1:'تکیهٔ واژه و آهنگ پرسش؛ تفاوت du و Sie را همراه با موقعیت بشنو، نه با تبدیل مکانیکی ضمیر.',2:'اسم را با حرف تعریف و صورت جمع بشنو؛ پایان کم‌تکیهٔ -e و تفاوت صدای ü با u تمرین شود.',3:'پایان فعل و ضمیر با هم شنیده شوند؛ شکل نوشتاری صرف، جای شنیدن را نگیرد.',4:'تفاوت Uhr و um؛ تکیهٔ جزء جداشوندهٔ فعل و شنیدن عدد ساعت.',5:'ترکیب مکانی را یک واحد بشنو؛ dem/der و im را در متن تشخیص بده.',6:'تمایز عدد قیمت و مقدار؛ تفاوت ie/ei و نام کالا همراه حرف تعریف.',7:'آهنگ پذیرش، رد مؤدبانه و پیشنهاد؛ گفتار کوتاه و آهسته بدون نیاز به سرعت بومی.',8:'شنیدن مقصد، سکو و ساعت؛ تشخیص nach، um و Gleis در اطلاعات سفر.',9:'هجی نام و شنیدن پیام کوتاه؛ واج‌های ch و sch در واژه‌های همان موقعیت.',10:'مکث بین جمله‌های مرتبط؛ پیوند روشن با und، aber و denn، بدون جمله‌های تودرتو.'}
def add(slug,module,pre,deps,goal,grammar,vocabulary,caution,production,scene,listen,reading):
    lines=[dict(zip(('de','fa'),s.split(' | ',1))) for s in scene.strip().splitlines()]
    assert len(lines)==4,slug
    LESSONS.append(dict(id='de-a1-'+slug,proposedIndex=len(LESSONS)+1,module=module,
        preA1Ids=[('de-'+s if s.startswith(('pre-','foundation-')) else s) for s in pre.split()],
        prerequisiteIds=['de-a1-'+s for s in deps.split()],outcomeFa=goal,grammarFa=grammar,
        vocabularyFa=vocabulary,outOfScopeAndErrorFa=caution,productionFa=production,
        pronunciationFa=FOCUS[module],scene=[dict(role='partner' if i%2==0 else 'learner',**s) for i,s in enumerate(lines)],
        listening=dict(passage=' '.join(s['de'] for s in lines),questionFa=listen[0],answer=listen[1]),
        reading=dict(zip(('passage','questionFa','answer'),reading))))

add('greetings',1,'pre-1 pre-3 pre-7','',
'احوال‌پرسی دوستانه را آغاز و با خداحافظی متناسب تمام کنم.',
'Hallo/Tschüss و Wie geht es dir? به‌صورت قالب؛ سلام رسمی در مقایسهٔ موقعیتی، نه تعویض خطاب وسط صحنه.',
'Hallo=سلام؛ gut=خوب؛ danke=ممنون؛ bis morgen=تا فردا',
'تفاوت dir/Ihnen تشخیص داده شود؛ آموزش کامل داتیو لازم نیست. تکرار Pre-A1 با انتخاب موقعیت و پاسخ مستقل پیش می‌رود.',
'یک احوال‌پرسی چهارنوبتی دوستانه بساز و فقط نام یا حال را عوض کن.',
'''Hallo, Sara! Wie geht es dir? | سلام، سارا! حالت چطور است؟
Gut, danke. Und dir? | خوبم، ممنون. تو چطوری؟
Auch gut. Bis morgen! | من هم خوبم. تا فردا!
Tschüss, Lena! | خداحافظ، لنا!''',
('طرفین چه زمانی دوباره همدیگر را می‌بینند؟','morgen'),
('Guten Tag, Frau Weber. Auf Wiedersehen!','این دو عبارت برای برخورد رسمی‌اند یا دوستانه؟','رسمی'))

add('profile',1,'pre-2 pre-15 pre-16','greetings',
'نام و شهر محل زندگی را در آشنایی کوتاه بگویم و از مخاطب بپرسم.',
'ich heiße / ich wohne؛ Wie heißt du? و Wo wohnst du? قالب معرفی؛ تحلیل صرف در درس فعل.',
'heißen=نام داشتن؛ wohnen=سکونت داشتن؛ Name=نام؛ Bonn=بن',
'ثبت‌نام و هجی همهٔ حروف اینجا یکجا آموزش داده نشود؛ ملیت و سن در درس‌های بعد گسترش می‌یابند.',
'با نام و شهر خیالی چهار نوبت آشنایی بنویس.',
'''Hallo, ich heiße Lena. Wie heißt du? | سلام، اسم من لنا است. اسم تو چیست؟
Ich heiße Sara. | اسم من سارا است.
Wo wohnst du, Sara? | سارا، کجا زندگی می‌کنی؟
Ich wohne in Bonn. Und du? | در بن زندگی می‌کنم. تو چطور؟''',
('سارا در چه شهری زندگی می‌کند؟','Bonn'),
('Ich heiße Amir. Ich wohne in Berlin.','نام این شخص چیست؟','Amir'))

add('asking-help',1,'pre-14 pre-4','profile',
'وقتی نامی را نمی‌فهمم، مؤدبانه درخواست تکرار و هجی کنم.',
'Bitte … و Können Sie …? قالب آمادهٔ کمک؛ Sie رسمی و پیوسته؛ تحلیل können در درس توانایی.',
'langsam=آهسته؛ buchstabieren=هجی کردن؛ noch einmal=یک بار دیگر؛ verstehen=فهمیدن',
'کوتاه‌بودن درخواست‌ها مهم است. حرف V، W، J، ß و نام حروف جداگانه با صوت تمرین شود؛ نبودن این‌ها در Pre-A1 به‌معنی تسلط نیست.',
'نام خیالی خود را بنویس، هجی کن و یک درخواست تکرار اضافه کن.',
'''Guten Tag. Wie heißen Sie? | روز بخیر. نام شما چیست؟
Ich heiße Sara Ali. | نام من سارا علی است.
Können Sie Ihren Nachnamen bitte buchstabieren? | می‌توانید لطفاً نام خانوادگی‌تان را هجی کنید؟
Ja. A–L–I. | بله. اِی، اِل، ای.''',
('نام خانوادگی چگونه هجی شد؟','A–L–I'),
('Bitte sprechen Sie langsam. Ich verstehe das Wort nicht.','نویسنده از مخاطب می‌خواهد چگونه صحبت کند؟','langsam'))

add('nationalities',1,'pre-15 pre-16','profile asking-help',
'کشور مبدأ، شهر زندگی و زبان را از هم متمایز کنم.',
'kommen aus / wohnen in / sprechen؛ نام زبان با حرف بزرگ؛ aus dem Iran به‌عنوان ترکیب کامل.',
'Land=کشور؛ Stadt=شهر؛ Deutsch=آلمانی؛ Persisch=فارسی',
'جدول پسوند ملیت و صفت ملیتی اجباری نشود؛ aus Iran جای ترکیب استانداردِ این بانک aus dem Iran ننشیند.',
'سه جمله دربارهٔ کشور، شهر و زبانِ یک شخصیت خیالی بنویس.',
'''Woher kommst du? | اهل کجا هستی؟
Ich komme aus dem Iran. | من اهل ایران هستم.
Welche Sprachen sprichst du? | به چه زبان‌هایی صحبت می‌کنی؟
Ich spreche Persisch und ein bisschen Deutsch. | فارسی و کمی آلمانی صحبت می‌کنم.''',
('گوینده کدام زبان را کمی صحبت می‌کند؟','Deutsch'),
('Lena kommt aus Deutschland. Sie wohnt in Bonn.','لنا در کدام شهر زندگی می‌کند؟','Bonn'))

add('numbers-age',1,'foundation-words-2 pre-5','profile',
'سن و شمارهٔ تماس تمرینی را بفهمم و بگویم.',
'اعداد ۰ تا ۱۰۰ با دسته‌بندی؛ sein + Jahre alt؛ شمارهٔ تلفن رقم‌به‌رقم. دهگان/یکان آلمانی صریح آموزش داده شود.',
'null=صفر؛ zwanzig=بیست؛ dreißig=سی؛ Telefonnummer=شمارهٔ تلفن',
'فهرست عدد بدون کاربرد نباشد؛ برای سن haben به جای sein به کار نرود؛ عدد قیمت بعداً می‌آید.',
'سن و یک شمارهٔ خیالی کوتاه بنویس و عددها را بلند بخوان؛ اطلاعات واقعی لازم نیست.',
'''Wie alt bist du? | چند سال داری؟
Ich bin dreiundzwanzig Jahre alt. | بیست‌وسه سال دارم.
Wie ist deine Telefonnummer? | شمارهٔ تلفنت چیست؟
Null, eins, zwei, drei. | صفر، یک، دو، سه.''',
('گوینده چند سال دارد؟','23'),
('Name: Ben. Alter: 32 Jahre. Telefon: 0412.','سن بن چند سال است؟','32'))

add('nouns-gender-plural',2,'pre-6 pre-5 foundation-chunks-2','numbers-age',
'چند اسم پربسامد را با جنس دستوری و جمعشان معرفی کنم.',
'der/die/das در مدخل واژه؛ جمع die؛ شمارش ein Buch / zwei Bücher بدون تعمیم ساخت جمع.',
'der Stift=خودکار؛ die Tasche=کیف؛ das Buch=کتاب؛ die Bücher=کتاب‌ها',
'جنس دستوری با جنسیت صاحب یا ظاهر شیء یکی نیست؛ جمع را تنها با افزودن -s نساز.',
'چهار شیء اطرافت را با حرف تعریف و جمع دو مورد ثبت کن.',
'''Was ist das? | این چیست؟
Das ist ein Buch. | این یک کتاب است.
Und was sind das? | و این‌ها چه هستند؟
Das sind zwei Bücher. | این‌ها دو کتاب هستند.''',
('چند کتاب معرفی شد؟','zwei'),
('der Stift – die Stifte; die Tasche – die Taschen','جمع Tasche چیست؟','die Taschen'))

add('articles',2,'pre-6','nouns-gender-plural',
'یک شیء نامشخص را معرفی و سپس به همان شیء مشخص اشاره کنم.',
'ein/eine در برابر der/die/das فقط فاعلی؛ جمع بدون ein؛ مفعولی پس از پایهٔ فعل خواهد آمد.',
'der Tisch=میز؛ die Lampe=چراغ؛ das Heft=دفتر؛ hier=اینجا',
'جدول چهار حالت دستوری ممنوع؛ einen فقط وقتی نقش مفعولی معرفی شده باشد، جداگانه تحلیل می‌شود.',
'دو جفت جمله بساز: معرفی یک شیء، سپس توصیف همان شیء.',
'''Was ist das? | این چیست؟
Das ist eine Lampe. | این یک چراغ است.
Ist die Lampe neu? | آیا آن چراغ نو است؟
Ja, die Lampe ist neu. | بله، آن چراغ نو است.''',
('شیء معرفی‌شده چیست؟','eine Lampe'),
('Das ist ein Heft. Das Heft ist blau.','در جملهٔ دوم پیش از Heft کدام حرف تعریف آمده؟','das'))

add('subject-pronouns',2,'pre-7','profile nouns-gender-plural',
'در معرفی افراد، اسم را با ضمیر درست جایگزین کنم.',
'ich/du/er/sie/es/wir/ihr/sie/Sie به‌صورت مرحله‌ای؛ ابتدا مفرد و wir؛ تفاوت sie و Sie در موقعیت.',
'ich=من؛ wir=ما؛ sie=او یا آن‌ها؛ Sie=شما رسمی',
'همهٔ صرف افعال هم‌زمان سنجیده نشود؛ es برای اسم خنثی، نه صرفاً اشیای بی‌جان.',
'خودت، یک فرد دیگر و یک گروه دونفره را با ضمیر معرفی کن.',
'''Wer ist das? | او کیست؟
Das ist Anna. Sie ist hier. | او آنا است. او اینجا است.
Und wo ist Ben? | و بن کجاست؟
Er ist auch hier. | او هم اینجا است.''',
('Er به چه کسی اشاره دارد؟','Ben'),
('Sara und ich sind hier. Wir lernen Deutsch.','Wir به چه کسانی اشاره دارد؟','Sara und ich'))

add('verb-to-be',2,'pre-7','subject-pronouns articles',
'با sein خودم و دیگران را معرفی و یک پرسش بله/خیر بسازم.',
'bin/bist/ist/sind/seid؛ پرسش با جابه‌جایی فعل؛ شغل پس از sein معمولاً بدون حرف تعریف.',
'Student=دانشجوی مرد؛ Studentin=دانشجوی زن؛ Lehrer=معلم مرد؛ hier=اینجا',
'Ich sein و du bin اصلاح شود؛ همهٔ شغل‌ها یا صرف زمان گذشته در این درس نیاید.',
'دو جملهٔ معرفی و یک پرسش با sein دربارهٔ شخصیت‌های خیالی بساز.',
'''Bist du Studentin? | آیا دانشجو هستی؟ (خطاب به زن)
Ja, ich bin Studentin. | بله، دانشجو هستم.
Ist Ben auch Student? | آیا بن هم دانشجو است؟
Nein, er ist Lehrer. | نه، او معلم است.''',
('شغل بن چیست؟','Lehrer'),
('Wir sind müde. Seid ihr auch müde?','شکل sein برای wir در متن چیست؟','sind'))

add('family',2,'foundation-words-1 pre-10','verb-to-be numbers-age',
'عضو خانواده را با نسبت و یک اطلاعات کوتاه معرفی کنم.',
'mein Vater / meine Mutter به‌عنوان ترکیب بازیابی؛ sein برای سن؛ haben + einen Bruder ابتدا قالب آشنا، تحلیل بعدی.',
'Mutter=مادر؛ Vater=پدر؛ Bruder=برادر؛ Schwester=خواهر',
'شجرهٔ گسترده و واژگان کم‌کاربرد اجباری نشود؛ شکل مذکر و مؤنث واژهٔ نسبت روشن بماند.',
'دربارهٔ دو عضو یک خانوادهٔ خیالی سه جمله بنویس.',
'''Wer ist das auf dem Foto? | این شخص در عکس کیست؟
Das ist meine Schwester. | این خواهر من است.
Wie alt ist sie? | او چند سال دارد؟
Sie ist zwanzig Jahre alt. | او بیست سال دارد.''',
('فرد در عکس چه نسبتی با گوینده دارد؟','Schwester'),
('Das ist mein Vater. Er heißt Ali.','نام پدر چیست؟','Ali'))

add('possessives',2,'pre-11 pre-10','family articles subject-pronouns',
'مالک یک وسیله را بپرسم و با mein/dein/sein/ihr پاسخ دهم.',
'تطابق ملکی در حالت فاعلی با اسم: mein Buch / meine Tasche؛ sein/ihr به مالک برمی‌گردد.',
'mein=مال من؛ dein=مال تو؛ sein=مال او مذکر؛ ihr=مال او مؤنث',
'پایان ملکی به جنسیت مالک وابسته نیست؛ صرف همهٔ حالت‌ها اینجا لازم نیست.',
'چهار وسیله را به خودت و دو شخصیت خیالی نسبت بده.',
'''Ist das deine Tasche? | آیا این کیف تو است؟
Nein, das ist Annas Tasche. | نه، این کیف آنا است.
Und ist das dein Buch? | و آیا این کتاب تو است؟
Ja, das ist mein Buch. | بله، این کتاب من است.''',
('کیف متعلق به چه کسی است؟','Anna'),
('Ben hat eine Tasche. Seine Tasche ist blau.','Seine Tasche به کیف چه کسی اشاره دارد؟','Ben'))

add('demonstratives',2,'pre-6','articles possessives',
'میان دو شیء، مورد نزدیک و مشخص را نشان بدهم.',
'dieser/diese/dieses در حالت فاعلی؛ das hier به‌عنوان جایگزین ساده؛ پرسش با این شیء مشخص.',
'dieser=این مذکر؛ diese=این مؤنث؛ dieses=این خنثی؛ neu=نو',
'پایان‌های اشاره در همهٔ حالت‌ها و صفت صرف‌شده آموزش داده نشود؛ قالب Dieses Buch ist neu ترجیح دارد.',
'با اسم‌های معلوم سه شیء را نشان بده و یک ویژگی بگو.',
'''Ist dieses Buch neu? | آیا این کتاب نو است؟
Ja, dieses Buch ist neu. | بله، این کتاب نو است.
Ist diese Tasche auch neu? | آیا این کیف هم نو است؟
Nein, diese Tasche ist alt. | نه، این کیف قدیمی است.''',
('کدام شیء قدیمی است؟','diese Tasche'),
('Dieser Stift ist hier. Dieses Heft ist dort.','کدام شیء آنجا است؟','dieses Heft'))

add('descriptions',2,'pre-12','verb-to-be demonstratives',
'شخص، شیء یا مکان را با یک صفت ساده توصیف کنم.',
'sein + صفت بدون پسوند؛ nicht + صفت برای تضاد محدود؛ صفت پیش از اسم هدف نیست.',
'groß=بزرگ؛ klein=کوچک؛ neu=نو؛ alt=قدیمی',
'ein großes Zimmer به‌عنوان قاعدهٔ صرف صفت امتحان نشود؛ صفت پس از ist پایان نمی‌گیرد.',
'دو وسیله و یک اتاق را با جمله‌های کوتاه توصیف کن.',
'''Ist dein Zimmer groß? | آیا اتاقت بزرگ است؟
Nein, mein Zimmer ist klein. | نه، اتاقم کوچک است.
Ist es ruhig? | آیا ساکت است؟
Ja, es ist ruhig. | بله، ساکت است.''',
('اتاق بزرگ است یا کوچک؟','klein'),
('Die Tasche ist alt. Der Stift ist neu.','کدام شیء نو است؟','der Stift'))

add('colors',2,'pre-13','descriptions articles',
'رنگ یک شیء را بپرسم و با رنگ از میان دو شیء انتخاب کنم.',
'Welche Farbe hat …? قالب پرسش؛ رنگ پس از sein بدون پسوند.',
'rot=قرمز؛ blau=آبی؛ grün=سبز؛ schwarz=مشکی',
'صرف صفت رنگی پیش از اسم به این درس تحمیل نشود؛ تفاوت grün و grau شنیده شود.',
'سه شیء را با رنگ معرفی کن؛ جمله‌ها با ist باشند.',
'''Welche Farbe hat deine Tasche? | کیفت چه رنگی است؟
Meine Tasche ist blau. | کیفم آبی است.
Ist dein Buch auch blau? | آیا کتابت هم آبی است؟
Nein, mein Buch ist grün. | نه، کتابم سبز است.''',
('کتاب چه رنگی است؟','grün'),
('Der Stift ist rot. Das Heft ist schwarz.','دفتر چه رنگی است؟','schwarz'))

add('feelings',2,'pre-7','verb-to-be descriptions',
'حال خود را بگویم و نیاز سادهٔ مرتبط را بیان کنم.',
'ich bin müde / ich habe Hunger/Durst؛ haben فقط با این ترکیب‌ها، نه آموزش همهٔ افعال.',
'müde=خسته؛ froh=خوشحال؛ Hunger=گرسنگی؛ Durst=تشنگی',
'Ich bin Hunger به جای Ich habe Hunger اصلاح شود؛ واژگان روان‌شناختی پیچیده لازم نیست.',
'دو حالت متفاوت خود یا شخصیت خیالی را با sein/haben بنویس.',
'''Wie geht es dir? | حالت چطور است؟
Ich bin müde. | خسته‌ام.
Hast du auch Durst? | آیا تشنه هم هستی؟
Ja, ich habe Durst. | بله، تشنه‌ام.''',
('گوینده علاوه بر خستگی چه نیازی دارد؟','Durst'),
('Lena ist froh. Ben hat Hunger.','چه کسی گرسنه است؟','Ben'))

add('simple-verbs',3,'pre-8 pre-9','subject-pronouns articles feelings',
'با haben، brauchen و kaufen یک جملهٔ کوتاه دربارهٔ وسیله بسازم.',
'فاعل + فعل صرف‌شده + مفعول؛ ich habe / du hast؛ حالت مفعولی مذکر ein→einen، der→den؛ خنثی/مؤنث ثابت.',
'haben=داشتن؛ brauchen=نیاز داشتن؛ kaufen=خریدن؛ einen Stift=یک خودکار در نقش مفعول',
'نقش مفعول با ترجمهٔ فارسی تنها توضیح داده نشود؛ قاعدهٔ همهٔ حروف اضافه یا داتیو اضافه نشود.',
'یک نیاز، یک داشته و یک پرسش دربارهٔ وسیلهٔ کلاس بنویس.',
'''Was brauchst du? | چه لازم داری؟
Ich brauche einen Stift. | یک خودکار لازم دارم.
Hast du ein Heft? | آیا دفتر داری؟
Ja, ich habe ein Heft. | بله، دفتر دارم.''',
('گوینده چه چیزی لازم دارد؟','einen Stift'),
('Ich kaufe eine Tasche. Ich habe ein Buch.','گوینده چه چیزی می‌خرد؟','eine Tasche'))

add('verb-conjugation',3,'pre-14','simple-verbs subject-pronouns',
'یک فعل باقاعدهٔ آشنا را برای شخص‌های مختلف تغییر بدهم.',
'lernen و wohnen در حال: -e/-st/-t/-en؛ wir/sie/Sie؛ ihr با تمرین محدود؛ صرف با معنا و مخاطب.',
'lernen=یاد گرفتن؛ wohnen=ساکن بودن؛ zusammen=با هم؛ hier=اینجا',
'جدول افعال کم‌کاربرد و استثناهای زیاد لازم نیست؛ du lernst نه du lernen.',
'چهار جمله با lernen برای ich، du، wir و Sie بساز.',
'''Lernst du Deutsch? | آیا آلمانی یاد می‌گیری؟
Ja, ich lerne Deutsch. | بله، آلمانی یاد می‌گیرم.
Lernt Anna auch Deutsch? | آیا آنا هم آلمانی یاد می‌گیرد؟
Ja, wir lernen zusammen. | بله، ما با هم یاد می‌گیریم.''',
('آیا گوینده و آنا با هم یاد می‌گیرند؟','Ja'),
('Ich wohne in Bonn. Ihr wohnt in Berlin.','شکل فعل برای ihr چیست؟','wohnt'))

add('present-tense',3,'pre-16','verb-conjugation nationalities',
'دربارهٔ کار و یادگیری در زمان حال دو جملهٔ مرتبط بگویم.',
'حال برای فعالیت فعلی/عادت؛ arbeiten با -est/-et؛ صورت‌های پربسامد lesen/sprechen با تغییر واکه، محدود و صریح.',
'arbeiten=کار کردن؛ lesen=خواندن؛ sprechen=صحبت کردن؛ heute=امروز',
'حال استمراری جداگانه ساخته نشود؛ تفاوت liest/lese و sprichst/spreche با نمونه یاد داده شود، نه حفظ همهٔ بی‌قاعده‌ها.',
'دربارهٔ کار و یادگیری یک نفر، سه جملهٔ حال بنویس.',
'''Arbeitest du heute? | آیا امروز کار می‌کنی؟
Nein, ich lerne heute Deutsch. | نه، امروز آلمانی یاد می‌گیرم.
Liest du auch ein Buch? | آیا کتاب هم می‌خوانی؟
Ja, ich lese ein Buch. | بله، کتاب می‌خوانم.''',
('گوینده امروز کار می‌کند یا یاد می‌گیرد؟','lernt Deutsch'),
('Sara arbeitet heute. Ben liest ein Buch.','چه کسی کتاب می‌خواند؟','Ben'))

add('positive-negative-questions',3,'pre-8','simple-verbs verb-to-be present-tense',
'یک جملهٔ مثبت را منفی کنم و دربارهٔ آن بله/خیر بپرسم.',
'فعل در آغاز پرسش؛ kein برای اسم نامعین، nicht برای صفت/منفی‌کردن ساده؛ kein/e/keinen در واژگان آشنا.',
'kein=هیچ/نه یک؛ nicht=نه؛ ja=بله؛ nein=نه',
'جایگاه nicht در همهٔ ساختارهای ممکن هدف نیست؛ du hast→Hast du را با کمک تصویری نشان بده.',
'یک پرسش و پاسخ مثبت و منفی برای دو شیء یا فعالیت بساز.',
'''Hast du einen Stift? | آیا خودکار داری؟
Nein, ich habe keinen Stift. | نه، خودکار ندارم.
Ist dein Buch neu? | آیا کتابت نو است؟
Nein, es ist nicht neu. | نه، نو نیست.''',
('آیا گوینده خودکار دارد؟','Nein'),
('Ich lerne heute nicht. Ich habe keine Zeit.','نویسنده امروز چه چیزی ندارد؟','Zeit'))

add('question-words',3,'pre-15 pre-16 pre-19','positive-negative-questions numbers-age',
'برای شخص، شیء، مکان و زمان پرسش مناسب انتخاب کنم.',
'wer/was/wo/woher/wann/wie/wie viel؛ واژهٔ پرسشی + فعل + فاعل؛ فقط پرسش‌های کوتاه.',
'wer=چه کسی؛ wo=کجا؛ wann=چه وقت؛ was=چه',
'wo با woher یکی نیست؛ پرسش غیرمستقیم و جملهٔ وابسته لازم نیست.',
'چهار پرسش دربارهٔ نام، شهر، زمان و نیاز یک هم‌کلاسی بنویس.',
'''Wo ist der Kurs? | کلاس کجاست؟
Der Kurs ist hier. | کلاس اینجا است.
Wann beginnt der Kurs? | کلاس چه زمانی شروع می‌شود؟
Um neun Uhr. | ساعت نه.''',
('کلاس چه ساعتی شروع می‌شود؟','neun Uhr'),
('Wer kommt? Anna kommt. Wo wohnt sie? In Bonn.','پاسخ پرسش Wer چیست؟','Anna'))

add('wants-needs',3,'pre-9 pre-18','simple-verbs positive-negative-questions',
'نیاز، خواستن مؤدبانه و دوست‌داشتن یک نوشیدنی را متمایز کنم.',
'brauchen + اسم؛ möchten + اسم؛ mögen با ich mag؛ آموزش نظام کامل Konjunktiv II لازم نیست.',
'Wasser=آب؛ Tee=چای؛ Kaffee=قهوه؛ möchten=خواستن مؤدبانه',
'خواستن و دوست‌داشتن یکی فرض نشوند؛ möchte در این درس قالب پربسامد است.',
'یک نیاز و یک خواستهٔ مؤدبانه بنویس و یک گزینه را رد کن.',
'''Was möchtest du trinken? | چه می‌خواهی بنوشی؟
Ich möchte Wasser, bitte. | لطفاً آب می‌خواهم.
Magst du auch Tee? | آیا چای هم دوست داری؟
Ja, aber jetzt brauche ich Wasser. | بله، ولی الان آب لازم دارم.''',
('گوینده الان چه چیزی لازم دارد؟','Wasser'),
('Ben mag Kaffee. Heute möchte er Tee.','بن امروز چه می‌خواهد؟','Tee'))

add('ability',3,'pre-14','present-tense wants-needs',
'یک توانایی را بیان و درخواست کمک ساده کنم.',
'können صرف‌شده + مصدر آخر؛ ich kann / du kannst / Sie können؛ جای nicht در قالب محدود.',
'helfen=کمک کردن؛ schwimmen=شنا کردن؛ lesen=خواندن؛ können=توانستن',
'Können Sie mir helfen? به‌صورت قالب پیشین بازیابی و اینجا ساختارش روشن شود؛ صرف چند فعل وجهی هم‌زمان نه.',
'دو توانایی و یک درخواست با können بنویس.',
'''Kannst du Deutsch lesen? | آیا می‌توانی آلمانی بخوانی؟
Ja, ein bisschen. | بله، کمی.
Kannst du mir bitte helfen? | می‌توانی لطفاً به من کمک کنی؟
Ja, gern. | بله، با کمال میل.''',
('آیا مخاطب درخواست کمک را می‌پذیرد؟','Ja'),
('Anna kann schwimmen. Ben kann nicht schwimmen.','چه کسی نمی‌تواند شنا کند؟','Ben'))

add('dates-and-time',4,'pre-19 pre-20','numbers-age question-words',
'ساعت و روز یک قرار را بپرسم و یک تاریخ کوتاه را بفهمم.',
'um برای ساعت، am برای روز؛ ساعت دیجیتال ابتدا؛ halb zehn یعنی ۹:۳۰؛ تاریخ عددی و am ersten Mai محدود.',
'Uhr=ساعت؛ Montag=دوشنبه؛ Mai=ماه مه؛ halb=نیم',
'همهٔ اعداد ترتیبی با صرف کامل یکجا نیایند؛ halb zehn با ۱۰:۳۰ اشتباه نشود.',
'یک روز و ساعت قرار خیالی بنویس و آن را به زبان ساده بخوان.',
'''Wann ist der Termin? | قرار چه زمانی است؟
Am Montag. | دوشنبه.
Um wie viel Uhr? | ساعت چند؟
Um neun Uhr dreißig. | ساعت نه و سی دقیقه.''',
('قرار چه ساعتی است؟','09:30'),
('Kursbeginn: 01.05., 10:00 Uhr.','کلاس چه ساعتی شروع می‌شود؟','10:00'))

add('daily-routine',4,'pre-19','present-tense dates-and-time',
'سه کار روزانه را با زمان بگویم.',
'قید زمان اول + فعل دوم؛ aufstehen و einkaufen جداشدنی؛ جزء دوم پایان جمله.',
'aufstehen=بلند شدن؛ frühstücken=صبحانه خوردن؛ morgens=صبح‌ها؛ abends=عصرها',
'همهٔ افعال جداشدنی لازم نیست؛ Ich stehe um sieben Uhr auf با مصدر aufstehen پیوند بخورد.',
'سه کار روزانهٔ خیالی را به ترتیب زمانی بنویس.',
'''Wann stehst du auf? | چه زمانی از خواب بلند می‌شوی؟
Ich stehe um sieben Uhr auf. | ساعت هفت بلند می‌شوم.
Und wann frühstückst du? | و چه زمانی صبحانه می‌خوری؟
Um halb acht. | ساعت هفت و نیم.''',
('گوینده چه ساعتی صبحانه می‌خورد؟','07:30'),
('Morgens lerne ich. Abends kaufe ich ein.','نویسنده چه زمانی خرید می‌کند؟','abends'))

add('weekly-schedule',4,'pre-20','daily-routine dates-and-time',
'تکرار هفتگی را از یک قرار مشخص متمایز کنم.',
'montags در برابر am Montag؛ von … bis … برای بازهٔ ساعت؛ جای فعل دوم.',
'Woche=هفته؛ Wochenende=آخر هفته؛ montags=دوشنبه‌ها؛ frei=آزاد',
'روزهای اسمی با حرف بزرگ، قید تکراری با حرف کوچک؛ برنامهٔ هفتگی فهرست بی‌ربط نشود.',
'برنامهٔ دو روز هفته و یک وقت آزاد را بنویس.',
'''Wann arbeitest du? | چه زمانی کار می‌کنی؟
Ich arbeite montags und dienstags. | دوشنبه‌ها و سه‌شنبه‌ها کار می‌کنم.
Hast du am Samstag Zeit? | شنبه وقت داری؟
Ja, am Samstag habe ich frei. | بله، شنبه آزاد هستم.''',
('گوینده کدام روز آزاد است؟','Samstag'),
('Deutschkurs: Mittwoch, 09:00–11:00 Uhr.','کلاس چه ساعتی تمام می‌شود؟','11:00'))

add('work-study',4,'pre-14','weekly-schedule ability',
'در کلاس یا محل کار دربارهٔ وظیفه و زمان سؤال ساده بپرسم.',
'arbeiten/lernen؛ wann و wo در کاربرد؛ ich muss … به‌عنوان ورودی محدودِ نیاز/وظیفه با مصدر، نه همهٔ وجهی‌ها.',
'Kurs=کلاس؛ Pause=استراحت؛ Aufgabe=تکلیف؛ Büro=دفتر کار',
'مصاحبهٔ کاری یا شرح سابقهٔ تخصصی هدف نیست؛ müssen پیش از استفاده یک‌بار صریح معرفی شود.',
'دربارهٔ زمان کار یا کلاس خیالی سه جمله و یک سؤال بنویس.',
'''Wann beginnt die Arbeit? | کار چه زمانی شروع می‌شود؟
Um acht Uhr. | ساعت هشت.
Wann ist die Pause? | زمان استراحت چه موقع است؟
Um zehn Uhr. | ساعت ده.''',
('زمان استراحت چه ساعتی است؟','zehn Uhr'),
('Ich muss heute lernen. Der Kurs beginnt um neun.','نویسنده امروز باید چه کاری انجام دهد؟','lernen'))

add('instructions',4,'pre-14','work-study ability',
'یک دستور کوتاه کلاس را بفهمم و درخواست توضیح کنم.',
'امر رسمی: فعل + Sie؛ öffnen/lesen/schreiben؛ du فقط تشخیص نمونهٔ پربسامد، نه جدول کامل امر.',
'öffnen=باز کردن؛ schreiben=نوشتن؛ Seite=صفحه؛ Aufgabe=تمرین',
'Sie در امر رسمی حذف نشود؛ ضمایر مفعولی پیچیده و همهٔ افعال جداشدنی اضافه نشوند.',
'دو دستور رسمی برای یک فعالیت کلاسی و یک درخواست تکرار بنویس.',
'''Öffnen Sie bitte Ihr Buch. | لطفاً کتابتان را باز کنید.
Welche Seite, bitte? | کدام صفحه، لطفاً؟
Seite zwölf. Lesen Sie bitte den Text. | صفحهٔ دوازده. لطفاً متن را بخوانید.
Danke. Ich lese den Text. | ممنون. متن را می‌خوانم.''',
('کدام صفحه باید باز شود؟','zwölf'),
('Bitte schreiben Sie Ihren Namen.','چه چیزی باید نوشته شود؟','نام'))

add('location',5,'pre-17','question-words articles',
'محل یک اتاق یا وسیله را بپرسم و بگویم.',
'wo + sein؛ hier/dort؛ im Zimmer و in der Küche به‌صورت ترکیب مکانی؛ توضیح im=in dem.',
'Küche=آشپزخانه؛ Bad=حمام؛ Zimmer=اتاق؛ dort=آنجا',
'Wo و Wohin و دو حالتِ همهٔ حروف اضافه با هم تدریس نشوند؛ حرکت هدف این درس نیست.',
'جای سه اتاق یا وسیله را در یک نقشهٔ خیالی بنویس.',
'''Wo ist die Küche? | آشپزخانه کجاست؟
Die Küche ist dort. | آشپزخانه آنجا است.
Und wo ist mein Buch? | و کتاب من کجاست؟
Es ist im Zimmer. | در اتاق است.''',
('کتاب کجاست؟','im Zimmer'),
('Das Bad ist hier. Die Tasche ist in der Küche.','کیف کجاست؟','in der Küche'))

add('prepositions',5,'pre-17','location simple-verbs',
'موقعیت ثابت وسیله را با روی، زیر و کنار بیان کنم.',
'مکان ثابت با auf/unter/neben + dem/der در عبارت‌های منتخب؛ تفاوت نقش با مفعول فعل را در دو نمونه ببینم.',
'auf=روی؛ unter=زیر؛ neben=کنار؛ Tisch=میز',
'داتیو اینجا محدود به مکان ثابت است؛ همهٔ Wechselpräpositionen و حرکت با آکوزاتیو اجباری نشود.',
'روی نقشهٔ اتاق، سه جای ثابت با اسم و حرف تعریف درست بنویس.',
'''Wo ist das Buch? | کتاب کجاست؟
Es liegt auf dem Tisch. | روی میز است.
Und wo ist die Tasche? | و کیف کجاست؟
Sie ist unter dem Tisch. | زیر میز است.''',
('کیف نسبت به میز کجاست؟','unter dem Tisch'),
('Der Stift liegt neben dem Buch.','خودکار کنار چه چیزی است؟','dem Buch'))

add('home-furniture',5,'pre-12 pre-17','prepositions descriptions',
'یک اتاق را با وسایل و جای آن‌ها توصیف کنم.',
'es gibt + آکوزاتیو؛ es gibt einen Tisch؛ جملهٔ مکانی جدا با dem؛ keine برای نبودن.',
'Bett=تخت؛ Stuhl=صندلی؛ Tisch=میز؛ Fenster=پنجره',
'es gibt dem Tisch غلط است؛ صرف صفت و توصیف معماری مفصل هدف نیست.',
'سه جمله دربارهٔ وسایل و جای آن‌ها در اتاق خیالی بنویس.',
'''Was gibt es im Zimmer? | در اتاق چه چیزهایی هست؟
Es gibt ein Bett und einen Tisch. | یک تخت و یک میز هست.
Wo steht der Tisch? | میز کجاست؟
Er steht neben dem Fenster. | کنار پنجره است.''',
('میز کنار چه چیزی است؟','dem Fenster'),
('Im Zimmer gibt es zwei Stühle, aber kein Bett.','کدام وسیله وجود ندارد؟','Bett'))

add('room-search',5,'pre-9','home-furniture wants-needs numbers-age',
'دربارهٔ اتاق قابل اجاره، قیمت و امکانات ساده بپرسم.',
'ich suche؛ Wie viel kostet … pro Monat?؛ gibt es …?؛ für eine Person به‌صورت عبارت.',
'Miete=اجاره؛ Monat=ماه؛ Zimmer=اتاق؛ ruhig=ساکت',
'قرارداد حقوقی، بندهای اجاره و چانه‌زنی پیچیده هدف A1 نیست؛ اعداد قیمت ساده و روشن باشند.',
'برای یک آگهی خیالی، سه سؤال دربارهٔ قیمت، آشپزخانه و سکوت اتاق بنویس.',
'''Guten Tag. Ich suche ein Zimmer. | روز بخیر. دنبال یک اتاق هستم.
Das Zimmer ist frei. | اتاق خالی است.
Wie viel kostet es pro Monat? | ماهی چقدر هزینه دارد؟
Vierhundert Euro. | چهارصد یورو.''',
('اجارهٔ ماهانه چقدر است؟','400 Euro'),
('Zimmer frei: 300 Euro pro Monat. Küche und Bad zusammen.','اجارهٔ این آگهی چقدر است؟','300 Euro'))

add('ordering-food',6,'pre-18','wants-needs simple-verbs',
'یک خوراک و نوشیدنی ساده سفارش بدهم و گزینه‌ای را حذف کنم.',
'ich möchte + آکوزاتیو؛ mit/ohne در عبارت آماده؛ بدون تدریس همهٔ داتیو بعد از mit.',
'Wasser=آب؛ Suppe=سوپ؛ Brot=نان؛ ohne=بدون',
'Ich hätte gern فقط گزینهٔ تشخیصی، نه الزام هم‌زمان چند ساخت مؤدبانه؛ واژگان آلرژی ادعای تضمین ایمنی ندارد.',
'یک سفارش دو قلمی با یک درخواست بدونِ چیزی بنویس.',
'''Was möchten Sie essen? | چه میل دارید بخورید؟
Eine Suppe, bitte. | یک سوپ، لطفاً.
Und was möchten Sie trinken? | و چه میل دارید بنوشید؟
Wasser ohne Eis, bitte. | آب بدون یخ، لطفاً.''',
('آب بدون چه چیزی سفارش داده شد؟','Eis'),
('Heute: Suppe 5 Euro. Brot 2 Euro.','قیمت سوپ چقدر است؟','5 Euro'))

add('cafe',6,'pre-18','ordering-food numbers-age',
'سفارش کافه را تا درخواست صورت‌حساب و پرداخت پیش ببرم.',
'einen Kaffee / einen Tee؛ die Rechnung, bitte؛ zusammen/getrennt؛ قیمت ساده با Euro و Cent.',
'Rechnung=صورت‌حساب؛ zahlen=پرداخت کردن؛ zusammen=با هم؛ getrennt=جدا',
'تفاوت این درس با سفارش غذا: نوبت‌گیری، صورت‌حساب و پایان تراکنش؛ فقط واژهٔ غذا عوض نشود.',
'یک گفت‌وگوی کافه با سفارش و پرداخت، با خطاب رسمی ثابت بنویس.',
'''Was möchten Sie trinken? | چه میل دارید بنوشید؟
Einen Kaffee, bitte. | یک قهوه، لطفاً.
Möchten Sie jetzt zahlen? | آیا الان می‌خواهید پرداخت کنید؟
Ja. Die Rechnung, bitte. | بله. صورت‌حساب، لطفاً.''',
('مشتری چه چیزی سفارش می‌دهد؟','einen Kaffee'),
('Kaffee 3 Euro. Tee 2 Euro. Wasser 1 Euro.','ارزان‌ترین نوشیدنی کدام است؟','Wasser'))

add('shopping-payment',6,'pre-5','cafe colors',
'قیمت یک کالا را بپرسم و روش پرداخت را روشن کنم.',
'Wie viel kostet …?؛ ich nehme …؛ bar / mit Karte به‌صورت عبارت؛ آکوزاتیوِ کالای منتخب.',
'kosten=قیمت داشتن؛ bar=نقد؛ Karte=کارت؛ Euro=یورو',
'قیمت واقعی بازار ادعا نشود؛ متن‌ها خیالی‌اند. درس با تحویل کالا و پرداخت پایان یابد.',
'یک خرید خودکار یا دفتر با سؤال قیمت و روش پرداخت بنویس.',
'''Wie viel kostet das Heft? | دفتر چقدر قیمت دارد؟
Drei Euro. | سه یورو.
Kann ich mit Karte zahlen? | می‌توانم با کارت پرداخت کنم؟
Ja, natürlich. | بله، حتماً.''',
('دفتر چند یورو است؟','3 Euro'),
('Ein Stift kostet 2 Euro. Nur Barzahlung.','در این فروشگاه چه روش پرداختی پذیرفته می‌شود؟','bar'))

add('supermarket',6,'pre-5','shopping-payment ordering-food',
'جای یک کالا را بپرسم و مقدار ساده‌ای از آن بخواهم.',
'Wo finde ich …?؛ ein Kilo / eine Flasche؛ جمع بعد از عدد؛ keinen/keine در نبودن کالا.',
'Brot=نان؛ Apfel=سیب؛ Milch=شیر؛ Kilo=کیلو',
'تفاوت با خرید عمومی: یافتن قفسه و مقدار؛ جنس و جمعِ Lebensmittel واقعی بررسی شود.',
'یک فهرست خرید سه‌قلمی و یک سؤال دربارهٔ جای کالا بنویس.',
'''Entschuldigung, wo finde ich die Milch? | ببخشید، شیر را کجا پیدا می‌کنم؟
Dort, neben dem Brot. | آنجا، کنار نان.
Gibt es auch Äpfel? | سیب هم هست؟
Ja, ein Kilo kostet zwei Euro. | بله، یک کیلو دو یورو است.''',
('یک کیلو سیب چقدر است؟','2 Euro'),
('Einkaufsliste: drei Äpfel, eine Flasche Wasser, ein Brot.','در فهرست چند سیب آمده؟','drei'))

add('clothes-shopping',6,'pre-13','shopping-payment ability colors',
'سایز و رنگ یک لباس را بخواهم و اجازهٔ پرو بگیرم.',
'kann ich … anprobieren?؛ Größe M؛ این مرحله بدون صرف صفت مقایسه‌ای، passt/zu klein قالب ساده.',
'Hemd=پیراهن؛ Jacke=کاپشن؛ Größe=سایز؛ anprobieren=پرو کردن',
'dieses Hemd قبل از نقش مفعولی خنثی بازیابی شود؛ größere Größe پیش از درس مقایسه اجباری نشود.',
'رنگ، سایز و یک درخواست پرو برای لباس خیالی بنویس.',
'''Haben Sie dieses Hemd in Größe M? | این پیراهن را در سایز مدیوم دارید؟
Ja, hier bitte. | بله، بفرمایید.
Kann ich es anprobieren? | می‌توانم آن را پرو کنم؟
Ja, die Umkleide ist dort. | بله، اتاق پرو آنجا است.''',
('مشتری چه سایزی می‌خواهد؟','M'),
('Jacke: blau, Größe S, 30 Euro.','کاپشن چه رنگی است؟','blau'))

add('preferences',6,'pre-3','wants-needs ordering-food',
'بین دو گزینهٔ آشنا انتخاب کنم و ترجیح را بگویم.',
'lieber … oder …?؛ ich trinke lieber …؛ nicht gern؛ تفاوت mögen و gern با فعل.',
'lieber=ترجیحاً؛ oder=یا؛ gern=با علاقه؛ lieber Tee=ترجیح چای',
'Ich gern Tee جملهٔ کامل نیست؛ lieber als محدود به انتخاب ساده بماند.',
'دو ترجیح دربارهٔ نوشیدنی و فعالیت بنویس و از مخاطب انتخاب بخواه.',
'''Trinkst du lieber Tee oder Kaffee? | ترجیح می‌دهی چای بنوشی یا قهوه؟
Ich trinke lieber Tee. | ترجیح می‌دهم چای بنوشم.
Mit Milch? | با شیر؟
Nein, ohne Milch, bitte. | نه، بدون شیر، لطفاً.''',
('گوینده کدام نوشیدنی را ترجیح می‌دهد؟','Tee'),
('Ben isst gern Brot. Sara isst lieber Reis.','سارا کدام غذا را ترجیح می‌دهد؟','Reis'))

add('comparisons',6,'pre-12','descriptions clothes-shopping preferences',
'دو کالای آشنا را با صفت مقایسه‌ای پربسامد مقایسه کنم.',
'kleiner/größer/billiger + als؛ صفت پس از sein؛ هیچ صرف صفت پیش از اسم لازم نیست.',
'größer=بزرگ‌تر؛ kleiner=کوچک‌تر؛ billiger=ارزان‌تر؛ als=از در مقایسه',
'این یک آشنایی محدود در مرز A1 است، نه تسلط به همهٔ مقایسه‌ها یا عالی؛ پیش‌نیاز خرید پایه نیست.',
'دو شیء خیالی را در دو جمله از نظر قیمت یا اندازه مقایسه کن.',
'''Dieses Hemd kostet zwanzig Euro. | این پیراهن بیست یورو قیمت دارد.
Das andere kostet zehn Euro. | آن یکی ده یورو قیمت دارد.
Ist das andere billiger? | آیا آن یکی ارزان‌تر است؟
Ja, es ist billiger. | بله، ارزان‌تر است.''',
('پیراهن ارزان‌تر چند یورو است؟','10 Euro'),
('Das Zimmer in Bonn ist kleiner als das Zimmer in Berlin.','کدام اتاق کوچک‌تر است؟','das Zimmer in Bonn'))

add('leisure',7,'pre-3','present-tense preferences ability',
'دربارهٔ دو سرگرمی و علاقهٔ خود پرسش و پاسخ کنم.',
'gern + فعل؛ lesen و fahren به‌صورت‌های پربسامد؛ فعل وجهی با مصدر آشنا بازیابی شود.',
'lesen=خواندن؛ schwimmen=شنا کردن؛ Musik=موسیقی؛ spazieren gehen=قدم زدن',
'فهرست ورزش‌های کم‌کاربرد لازم نیست؛ gern و gut از نظر علاقه و توانایی جدا شوند.',
'سه جمله دربارهٔ علاقه و یک سؤال دربارهٔ سرگرمی مخاطب بنویس.',
'''Was machst du gern? | دوست داری چه کار کنی؟
Ich lese gern. | دوست دارم مطالعه کنم.
Schwimmst du auch gern? | آیا شنا کردن را هم دوست داری؟
Ja, aber ich schwimme nicht gut. | بله، ولی خوب شنا نمی‌کنم.''',
('آیا گوینده خوب شنا می‌کند؟','Nein'),
('Lena hört gern Musik. Ben geht gern spazieren.','چه کسی قدم‌زدن را دوست دارد؟','Ben'))

add('weather',7,'pre-7','descriptions dates-and-time',
'وضعیت هوا را بفهمم و یک برنامهٔ کوتاه متناسب بگویم.',
'es ist warm/kalt؛ es regnet؛ heute/morgen + فعل دوم؛ بدون پیش‌بینی پیچیده یا werden اجباری.',
'Wetter=آب‌وهوا؛ warm=گرم؛ kalt=سرد؛ regnen=باریدن باران',
'es در هواشناسی به شخص اشاره ندارد؛ امر بی‌قاعدهٔ Nimm قبل از آموزش لازم نیست.',
'هوای امروز و یک برنامهٔ کوتاه با واژگان آشنا بنویس.',
'''Wie ist das Wetter heute? | امروز هوا چطور است؟
Es ist kalt. | هوا سرد است.
Regnet es auch? | باران هم می‌بارد؟
Ja, es regnet. | بله، باران می‌بارد.''',
('آیا امروز باران می‌بارد؟','Ja'),
('Montag: warm. Dienstag: Regen.','کدام روز هوا گرم است؟','Montag'))

add('connectors',7,'pre-3','positive-negative-questions leisure weather',
'دو جملهٔ کوتاه را با پیوند روشن به هم وصل کنم.',
'und/aber/oder؛ جای فعل جملهٔ دوم معمولاً مانند جملهٔ مستقل؛ ابتدا فاعل تکرارشده برای وضوح.',
'und=و؛ aber=اما؛ oder=یا؛ auch=هم',
'weil و deshalb هنوز معیار اجباری نیستند؛ دو واقعیت نامرتبط صرفاً با und زنجیر نشوند.',
'دربارهٔ یک برنامه سه جمله با und و aber بنویس.',
'''Möchtest du spazieren gehen? | می‌خواهی قدم بزنیم؟
Ja, aber es regnet. | بله، ولی باران می‌بارد.
Dann bleiben wir hier und trinken Tee. | پس اینجا می‌مانیم و چای می‌نوشیم.
Ja, gern. | بله، با کمال میل.''',
('با توجه به باران چه تصمیمی می‌گیرند؟','hier bleiben und Tee trinken'),
('Ich lese gern, aber heute habe ich keine Zeit.','نویسنده امروز چه چیزی ندارد؟','Zeit'))

add('future-plans',7,'pre-20','weekly-schedule connectors',
'با زمان حال و قید آینده از برنامهٔ نزدیک بگویم.',
'morgen / am Samstag + Präsens؛ زمان در جای اول و فعل دوم؛ werden اجباری نیست.',
'morgen=فردا؛ heute Abend=امشب؛ besuchen=دیدن کسی رفتن؛ frei=آزاد',
'آیندهٔ نزدیک با شکل حال کافی است؛ وعده و شرط پیچیده اضافه نشود.',
'دو برنامهٔ فردا و یک وقت آزاد بنویس.',
'''Was machst du morgen? | فردا چه کار می‌کنی؟
Morgen besuche ich Anna. | فردا به دیدن آنا می‌روم.
Hast du am Abend Zeit? | عصر وقت داری؟
Ja, am Abend habe ich Zeit. | بله، عصر وقت دارم.''',
('گوینده فردا به دیدن چه کسی می‌رود؟','Anna'),
('Am Samstag arbeite ich. Am Sonntag lerne ich Deutsch.','نویسنده چه روزی کار می‌کند؟','Samstag'))

add('invitations',7,'pre-20','future-plans dates-and-time wants-needs',
'دعوتی را بپذیرم یا رد کنم و زمان جایگزین پیشنهاد بدهم.',
'möchtest du …?؛ ich kann … nicht؛ passt dir …? قالب؛ پایان صحنه با زمان نهایی سازگار.',
'gern=با میل؛ leider=متأسفانه؛ Zeit=وقت؛ passen=مناسب بودن',
'دعوت فردا رد شود ولی پایان Bis morgen بیاید، خطای معنایی است؛ خطاب du در سراسر صحنه ثابت.',
'یک دعوت با رد زمان اول و توافق بر روز دیگر بنویس.',
'''Möchtest du morgen einen Kaffee trinken? | می‌خواهی فردا قهوه بنوشیم؟
Morgen kann ich leider nicht. | متأسفانه فردا نمی‌توانم.
Hast du am Samstag Zeit? | شنبه وقت داری؟
Ja, gern. Bis Samstag! | بله، با کمال میل. تا شنبه!''',
('در پایان برای چه روزی توافق می‌کنند؟','Samstag'),
('Hallo Ben, hast du am Sonntag um drei Zeit? Grüße, Anna','چه ساعتی پیشنهاد شده؟','15:00 / drei Uhr'))

add('suggestions',7,'pre-3','invitations ability weather',
'پیشنهاد مشترک بدهم و دربارهٔ جایگزین توافق کنم.',
'wollen wir …? و wir können …؛ مصدر آخر؛ پیشنهاد عملی بدون توصیهٔ تخصصی.',
'Park=پارک؛ Kino=سینما؛ Idee=ایده؛ zusammen=با هم',
'sollten و شرطی پیشرفته برای توصیه اجباری نشود؛ دلیل رد با aber ساده کافی است.',
'برای هوای بارانی دو پیشنهاد و یک انتخاب مشترک بنویس.',
'''Wollen wir in den Park gehen? | برویم پارک؟
Heute regnet es. | امروز باران می‌بارد.
Wir können ins Kino gehen. | می‌توانیم به سینما برویم.
Ja, gute Idee! | بله، فکر خوبی است!''',
('در پایان کجا رفتن را انتخاب می‌کنند؟','ins Kino'),
('Wir können heute zusammen lernen. Um vier in der Bibliothek?','چه فعالیتی پیشنهاد شده؟','zusammen lernen'))

add('social-chat',7,'pre-21','nationalities leisure invitations connectors',
'آشنایی کوتاه را با یک موضوع مشترک ادامه بدهم و طبیعی تمام کنم.',
'بازیابی نام، شهر و سرگرمی؛ und du?؛ یک دعوت با زمان روشن، بدون دستور تازه.',
'neu=جدید؛ zusammen=با هم؛ hier=اینجا؛ gern=با علاقه',
'گفت‌وگو از معرفی به اجاره و علائم بیماری نپرد؛ du از ابتدا با هم‌کلاسی توافق‌شده ثابت باشد.',
'شش جمله برای آشنایی با هم‌کلاسی و پیشنهاد یک فعالیت مشترک بساز.',
'''Hallo, bist du neu im Kurs? | سلام، در کلاس تازه‌وارد هستی؟
Ja, ich heiße Amir. Und du? | بله، اسم من امیر است. تو چطور؟
Ich heiße Ben. Lernen wir morgen zusammen? | اسم من بن است. فردا با هم درس بخوانیم؟
Ja, gern. Bis morgen! | بله، با کمال میل. تا فردا!''',
('آن‌ها برای فردا چه کاری قرار می‌گذارند؟','zusammen lernen'),
('Hallo, ich bin Lena. Ich wohne in Bonn und lese gern.','لنا به چه کاری علاقه دارد؟','lesen'))

add('directions',8,'pre-17','prepositions instructions ability',
'آدرس کوتاه بپرسم و دو جهت ساده را بفهمم.',
'wo ist …?؛ gehen Sie …؛ links/rechts/geradeaus؛ zur Bank به‌عنوان عبارت مقصد نه جدول داتیو تازه.',
'links=چپ؛ rechts=راست؛ geradeaus=مستقیم؛ Bahnhof=ایستگاه قطار',
'نقشه و جمله با هم سازگار باشند؛ فعل stehen برای مکان با gehen برای حرکت تفکیک شود.',
'روی نقشهٔ خیالی، مسیر دو مرحله‌ای به ایستگاه بنویس.',
'''Entschuldigung, wo ist der Bahnhof? | ببخشید، ایستگاه قطار کجاست؟
Gehen Sie geradeaus. | مستقیم بروید.
Und dann? | و بعد؟
Dann gehen Sie nach links. | سپس به چپ بروید.''',
('پس از مستقیم رفتن باید به کدام سمت بروند؟','links'),
('Die Bank ist rechts neben der Post.','بانک نسبت به ادارهٔ پست کجاست؟','rechts neben der Post'))

add('public-transport',8,'pre-19','directions dates-and-time',
'مقصد اتوبوس و محل پیاده‌شدن را بپرسم.',
'fährt dieser Bus …?؛ fahren با du fährst محدود؛ aussteigen جداشدنی؛ mit dem Bus عبارت.',
'Bus=اتوبوس؛ Haltestelle=ایستگاه؛ Zentrum=مرکز؛ aussteigen=پیاده شدن',
'ضمیر dieser با جنس Bus منطبق بماند؛ برنامهٔ واقعی شهر یا خط واقعی ادعا نشود.',
'برای مسیر خیالی، سؤال مقصد و سؤال ایستگاه پیاده‌شدن بنویس.',
'''Fährt dieser Bus ins Zentrum? | آیا این اتوبوس به مرکز شهر می‌رود؟
Ja, er fährt ins Zentrum. | بله، به مرکز شهر می‌رود.
Wo muss ich aussteigen? | کجا باید پیاده شوم؟
An der nächsten Haltestelle. | در ایستگاه بعدی.''',
('مسافر کجا باید پیاده شود؟','an der nächsten Haltestelle'),
('Bus 5: Bahnhof – Zentrum. Abfahrt: 08:10.','اتوبوس چه ساعتی حرکت می‌کند؟','08:10'))

add('travel-tickets',8,'pre-19','public-transport shopping-payment',
'بلیت ساده بخواهم و ساعت و سکوی حرکت را بفهمم.',
'nach + شهر؛ einfache Fahrt / hin und zurück؛ von Gleis …؛ سؤال Wann fährt …?',
'Fahrkarte=بلیت؛ Gleis=سکو/خط؛ Abfahrt=حرکت؛ zurück=برگشت',
'مقررات بلیت واقعی نیستند؛ بلیت قطار با پرواز و هتل در یک درس مخلوط نشود.',
'درخواست بلیت با مقصد، یک‌طرفه یا رفت‌وبرگشت و یک سؤال زمان بنویس.',
'''Eine Fahrkarte nach Köln, bitte. | یک بلیت به کلن، لطفاً.
Einfache Fahrt? | یک‌طرفه؟
Ja. Wann fährt der Zug? | بله. قطار چه زمانی حرکت می‌کند؟
Um zehn Uhr von Gleis zwei. | ساعت ده از سکوی دو.''',
('قطار از کدام سکو حرکت می‌کند؟','Gleis zwei'),
('Zug nach Bonn: 14:30, Gleis 4.','قطار به کدام شهر می‌رود؟','Bonn'))

add('hotel-stay',8,'pre-18','room-search travel-tickets asking-help',
'در پذیرش هتل نام رزرو و تعداد شب را بگویم و یک اطلاعات اقامت بپرسم.',
'ich habe eine Reservierung؛ auf den Namen … عبارت؛ für zwei Nächte؛ wann gibt es Frühstück?',
'Reservierung=رزرو؛ Nacht=شب؛ Schlüssel=کلید؛ Frühstück=صبحانه',
'این نمونه رزرو واقعی انجام نمی‌دهد؛ مشکل اتاق و فرم طولانی یکجا روی درس سوار نشود.',
'یک ورود کوتاه به هتل با نام خیالی، تعداد شب و سؤال صبحانه بنویس.',
'''Guten Tag. Ich habe eine Reservierung. | روز بخیر. رزرو دارم.
Auf welchen Namen, bitte? | به چه نامی، لطفاً؟
Auf den Namen Ali. Für zwei Nächte. | به نام علی. برای دو شب.
Ja, hier ist Ihr Schlüssel. | بله، این کلید شما است.''',
('رزرو برای چند شب است؟','zwei Nächte'),
('Frühstück: 07:00–10:00 Uhr. Zimmer 12.','صبحانه چه ساعتی شروع می‌شود؟','07:00'))

add('polite-requests',9,'pre-4 pre-14','ability instructions hotel-stay',
'در خدمات عمومی یک درخواست مؤدبانه یا اجازهٔ ساده مطرح کنم.',
'Können Sie …?؛ Könnten Sie …? فقط قالب جایگزین مؤدبانه؛ Darf ich …? برای اجازه.',
'helfen=کمک کردن؛ Fenster=پنجره؛ öffnen=باز کردن؛ bitte=لطفاً',
'صرف کامل Konjunktiv II لازم نیست؛ اجازه و توانایی یکی ترجمه نشوند؛ امر رسمی با du جابه‌جا نشود.',
'یک درخواست رسمی و یک اجازه‌خواستن بنویس.',
'''Darf ich das Fenster öffnen? | اجازه دارم پنجره را باز کنم؟
Ja, natürlich. | بله، حتماً.
Können Sie mir bitte helfen? | می‌توانید لطفاً به من کمک کنید؟
Ja, gern. | بله، با کمال میل.''',
('گوینده برای انجام چه کاری اجازه می‌خواهد؟','das Fenster öffnen'),
('Könnten Sie bitte langsam sprechen?','نویسنده چه درخواستی دارد؟','آهسته صحبت کردن'))

add('phone-messages',9,'pre-2','polite-requests asking-help future-plans',
'خود را در تماس معرفی کنم و یک پیام یا زمان تماس بعدی را بفهمم.',
'hier ist …؛ kann ich … sprechen?؛ anrufen با جزء جدا؛ zurückrufen در قالب محدود.',
'Nachricht=پیام؛ anrufen=زنگ زدن؛ später=بعداً؛ morgen=فردا',
'پیام صوتی طولانی و ضمایر مفعولی متعدد اجباری نشود؛ شماره‌ها خیالی باشند.',
'پیام دو یا سه‌جمله‌ای با نام و زمان تماس بعدی بنویس.',
'''Guten Tag, hier ist Sara Ali. Kann ich Frau Weber sprechen? | روز بخیر، سارا علی هستم. می‌توانم با خانم وبر صحبت کنم؟
Frau Weber ist heute nicht da. | خانم وبر امروز اینجا نیست.
Dann rufe ich morgen wieder an. | پس فردا دوباره تماس می‌گیرم.
Gut, auf Wiederhören! | بسیار خوب، خداحافظ!''',
('سارا چه زمانی دوباره تماس می‌گیرد؟','morgen'),
('Hallo Ben, hier ist Anna. Bitte ruf mich um fünf an.','آنا درخواست تماس در چه ساعتی دارد؟','fünf Uhr'))

add('doctor-symptoms',9,'pre-7','feelings dates-and-time polite-requests',
'یک علامت ساده و زمان شروع را بگویم و برای نوبت کمک بخواهم.',
'ich habe …؛ seit gestern فقط عبارت زمان؛ mir tut … weh به‌صورت گزینهٔ محدود؛ بدون تشخیص و درمان.',
'Kopfschmerzen=سردرد؛ Fieber=تب؛ Termin=نوبت؛ seit gestern=از دیروز',
'این درس مشاورهٔ پزشکی نیست؛ در وضعیت خطر به خدمات محلی مراجعه شود؛ Seit با همهٔ صورت‌ها تدریس نشود.',
'دو جملهٔ فرضی دربارهٔ علامت و یک درخواست نوبت بنویس؛ اطلاعات واقعی پزشکی لازم نیست.',
'''Guten Tag. Ich habe Kopfschmerzen. | روز بخیر. سردرد دارم.
Seit wann? | از چه زمانی؟
Seit gestern. | از دیروز.
Haben Sie auch Fieber? | آیا تب هم دارید؟''',
('سردرد از چه زمانی شروع شده؟','seit gestern'),
('Ich brauche einen Termin. Ich habe Halsschmerzen.','نویسنده چه دردی دارد؟','Halsschmerzen'))

add('past-events',9,'pre-20','present-tense daily-routine future-plans',
'با دو یا سه قالب آشنا از دیروز بگویم.',
'gestern؛ war / hatte پربسامد؛ haben + gelernt/gearbeitet برای شروع Perfekt؛ کاربرد محدود نه نظام همهٔ گذشته‌ها.',
'gestern=دیروز؛ gelernt=یاد گرفته؛ gearbeitet=کار کرده؛ war=بودم/بود',
'جدول Präteritum، همهٔ افعال قوی و همهٔ افعال با sein هدف این درس نیست؛ Partizip در آخر جمله شنیده شود.',
'دو جملهٔ واقعی یا خیالی دربارهٔ دیروز با الگوهای همین درس بنویس.',
'''Hast du gestern gearbeitet? | آیا دیروز کار کردی؟
Nein, ich habe Deutsch gelernt. | نه، آلمانی یاد گرفتم.
Warst du zu Hause? | در خانه بودی؟
Ja, ich war zu Hause. | بله، در خانه بودم.''',
('گوینده دیروز چه چیزی یاد گرفته؟','Deutsch'),
('Gestern hatte Ben frei. Er hat gelernt.','آیا بن دیروز وقت آزاد داشت؟','Ja'))

add('reasons',10,'pre-7','connectors feelings invitations past-events',
'برای یک تصمیم روزمره دلیل کوتاه و قابل فهم بدهم.',
'Warum? پاسخ با دو جمله یا denn + ترتیب جملهٔ اصلی؛ weil فقط تشخیص اختیاری، بدون شرط اتمام درس.',
'warum=چرا؛ denn=چون؛ deshalb=به همین دلیل (شناخت اختیاری)؛ müde=خسته',
'weil و Deshalb با قواعد جملهٔ وابسته و وارونگی هم‌زمان اجباری نشوند؛ برچسب موضوع حفظ می‌شود اما هدف محدود A1 است.',
'یک دعوت را با یک دلیل روشن رد کن و زمانی جایگزین پیشنهاد بده.',
'''Kommst du heute mit? | امروز همراه ما می‌آیی؟
Heute kann ich leider nicht. | متأسفانه امروز نمی‌توانم.
Warum nicht? | چرا نه؟
Ich bin müde, denn ich habe heute gearbeitet. | خسته‌ام، چون امروز کار کرده‌ام.''',
('چرا گوینده خسته است؟','hat heute gearbeitet'),
('Ich bleibe zu Hause. Ich habe Fieber.','دلیل در خانه ماندن چیست؟','Fieber'))

add('forms-information',10,'pre-2 pre-15','numbers-age nationalities asking-help dates-and-time',
'یک فرم کوتاهِ نام، نشانی و تاریخ را بفهمم و تکمیل کنم.',
'Vorname/Nachname؛ Ihr/Ihre خطاب رسمی؛ Geburtsdatum و آدرس در قالب، بدون الزام بیان تاریخ‌های پیچیده.',
'Vorname=نام کوچک؛ Nachname=نام خانوادگی؛ Adresse=نشانی؛ Geburtsdatum=تاریخ تولد',
'فقط اطلاعات خیالی؛ ایمیل/حروف با صوت و متن متناظر باشد؛ نام و نام خانوادگی جابه‌جا نشوند.',
'چهار خانهٔ یک فرم را با اطلاعات خیالی پر کن و یک درخواست هجی بنویس.',
'''Wie ist Ihr Vorname? | نام کوچک شما چیست؟
Mein Vorname ist Sara. | نام کوچک من سارا است.
Und Ihr Nachname? | و نام خانوادگی شما؟
Ali. Ich buchstabiere: A–L–I. | علی. هجی می‌کنم: اِی، اِل، ای.''',
('نام کوچک چیست؟','Sara'),
('Vorname: Ben. Nachname: Weber. Wohnort: Bonn.','نام خانوادگی چیست؟','Weber'))

add('connected-conversation',10,'pre-21','social-chat reasons forms-information phone-messages suggestions',
'آشنایی، محل زندگی و یک قرار را در یک گفت‌وگوی مرتبط مدیریت کنم.',
'فقط بازیابی ساخت‌های آشنا؛ خطاب du ثابت برای دو هم‌کلاسی؛ رد زمان اول، پیشنهاد و توافق زمان دوم.',
'بازیابی واژگان نام، شهر، کلاس، روز و ساعت؛ واژگان تازهٔ اجباری ندارد.',
'خطای Frau/Herr، تغییر بی‌دلیل Sie/du و خداحافظی برای روز ردشده ممنوع؛ شاخهٔ رسمی باید صحنهٔ جدا باشد.',
'یک مکالمهٔ شش تا هشت‌نوبتی دربارهٔ آشنایی و توافق زمان بنویس؛ نام، شهر و روز را خودت انتخاب کن.',
'''Hallo, ich bin Lena. Bist du neu im Kurs? | سلام، من لنا هستم. در کلاس تازه‌وارد هستی؟
Ja, ich heiße Amir. Ich wohne in Bonn. | بله، اسم من امیر است. در بن زندگی می‌کنم.
Ich wohne auch in Bonn. Hast du morgen Zeit? | من هم در بن زندگی می‌کنم. فردا وقت داری؟
Morgen leider nicht. Hast du am Samstag Zeit? | متأسفانه فردا نه. شنبه وقت داری؟''',
('امیر کدام روز را به‌جای فردا پیشنهاد می‌دهد؟','Samstag'),
('Lena: Samstag passt. Treffen wir uns um zehn im Café? Amir: Ja, gern. Bis Samstag!','زمان نهایی ملاقات چه ساعتی است؟','zehn Uhr'))

# Reorder only this design, not runtime; keep the exact original 56-lesson ID set.
# forms-information belongs after dates and before other multi-step transactions.
forms=next(l for l in LESSONS if l['id']=='de-a1-forms-information')
LESSONS.remove(forms)
forms['module']=4
forms['pronunciationFa']=FOCUS[4]
LESSONS.insert(next(i for i,l in enumerate(LESSONS) if l['id']=='de-a1-dates-and-time')+1,forms)
for i,l in enumerate(LESSONS):
    l['proposedIndex']=i+1
    l['transferToIds']=[other['id'] for other in LESSONS[i+1:] if l['id'] in other['prerequisiteIds']]
    l['retrievalFa']='بازیابی کوتاه از '+('، '.join(l['prerequisiteIds']) if l['prerequisiteIds'] else 'Pre-A1')+'؛ اگر پاسخ مستقل ممکن نبود، همان الگوی لازم پیش از مطلب تازه بازیابی شود.'
# Whole capstone: retain an eight-turn coherent conversation, with explicit agreement and closure.
LESSONS[-1]['scene'] += [
    dict(role='partner',de='Ja. Treffen wir uns um zehn im Café?',fa='بله. ساعت ده در کافه همدیگر را ببینیم؟'),
    dict(role='learner',de='Ja, gern. Wo ist das Café?',fa='بله، با کمال میل. کافه کجاست؟'),
    dict(role='partner',de='Neben dem Bahnhof. Bis Samstag!',fa='کنار ایستگاه قطار. تا شنبه!'),
    dict(role='learner',de='Gut, bis Samstag!',fa='بسیار خوب، تا شنبه!')]
# Optional listening uses a separate short passage, not the displayed dialogue or the reading passage.
listening={}
for line in (OUT/'listening.tsv').read_text().strip().splitlines():
    slug,passage,question,answer=line.split('|')
    assert slug not in listening,slug
    listening[slug]=dict(passage=passage,questionFa=question,answer=answer)
assert set(listening)=={l['id'].removeprefix('de-a1-') for l in LESSONS}
for l in LESSONS:
    l['listening']=listening[l['id'].removeprefix('de-a1-')]
if __name__=='__main__':
    data=dict(language='de',date='2026-11-26',status='proposal-not-runtime-content',modules=MODULES,lessons=LESSONS)
    (OUT/'design.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(f'Authored design for {len(LESSONS)} German A1 lessons; runtime unchanged.')
