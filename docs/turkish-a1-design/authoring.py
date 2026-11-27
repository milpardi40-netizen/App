"""Read-only Turkish A1 proposal: 64 actual IDs, each with its existing 3/4/5 scene turns."""
import json
from pathlib import Path
HERE=Path(__file__).parent
CONTEXT=json.loads((HERE/'runtime-context.json').read_text())
LESSONS=[]
MODULES={1:'ورود و ابزار یادگیری',2:'شخص، اسم و توصیف',3:'خانواده، مالکیت و وجود',4:'ریشه و فعل در پیام',5:'مکان، جهت و نقش اسم',6:'خواستن، توانایی و درخواست',7:'زمان و سازمان‌دهی روز',8:'خوراک، خرید و انتخاب',9:'تفریح و ارتباط اجتماعی',10:'مسیر و سفر',11:'درخواست، تماس و سلامت',12:'دلیل و گفت‌وگوی مرتبط'}
PRE_KEYS=['hello','pronouns','verbs','adjectives','numbers','days','food','family','places','objects','identity','space','calendar','questions','pairs','verbchunks','namechunks','timechunks','politechunks','firstsent','descriptions','shortquestions','needs','time','conversation']
PRE=dict(zip(PRE_KEYS,[l['id'] for l in CONTEXT['preA1']]))
SOUNDS={1:'ı/i و o/ö و u/ü و نیز c/ç، s/ş با واژهٔ آشنا شنیده شوند؛ ğ را همیشه g نخوان. فارسی‌نویسی جای صوت معتبر نیست.',2:'پسوند شخصی و جزء جداگانهٔ mı/mi/mu/mü با واژهٔ کامل شنیده شوند؛ جنس دستوری به فارسی/اروپایی قیاس نشود.',3:'تفاوت adım/adın و kitabım/kitabın؛ نرم‌شدن همخوان فقط در مثال معرفی‌شده، نه قانون بی‌استثنا. var/yok در پیام کوتاه شنیده شوند.',4:'بخش -yor و شناسهٔ شخصی، geliyorum/gelmiyorum و geliyor musun جدا تشخیص داده شوند؛ تکیه را از روی خط فارسی قطعی فرض نکن.',5:'پسوندهای -de/-te، -e/-ye، -den/-ten و -ı/-yı معنی متفاوت دارند؛ تمایز نهایی را در عبارت کامل و نقشه بشنو.',6:'istemiyorum در برابر gelemiyorum؛ درخواست مؤدبانه با لحن مناسب. پرسش بعد از -yor معمولاً mu می‌گیرد؛ صورت کامل شنیده شود.',7:'عددِ ساعت، پسوند زمان و روز از هم جدا تشخیص داده شوند؛ پنجاه/پانزده و نیم‌ساعت با صوت روشن تمرین شوند.',8:'مقدار، قیمت و کالا جدا شنیده شوند؛ çay و şekersiz را در سفارش کامل بفهم. متن‌ها قیمت واقعی نیستند.',9:'آهنگ دعوت، رد و پیشنهاد و مکث بین جمله‌ها؛ به همین دلیل و چون را با ترتیب معنایی سازگار بشنو.',10:'جهت، ایستگاه و ساعت در پیام کوتاه؛ sağ و sol متفاوت‌اند. دادهٔ مسیر فرضی است و باید با نقشهٔ تمرین تطابق داشته باشد.',11:'زمان تماس و علامت پزشکی، پسوند گذشته و حال با صوت معتبر تشخیص داده شوند؛ این مرحله آزمون واقعی میکروفن نیست.',12:'مکث و تأکید برای دلیل، رد پیشنهاد و زمان نهایی؛ هدف قابل‌فهم بودن است نه سرعت بومی.'}
def add(key,module,pre,deps,goal,grammar,words,caution,production,scene,listening,reading):
    id='tr-l'+key
    old=next(l for l in CONTEXT['turkishA1'] if l['id']==id)
    turns=[dict(zip(('tr','fa'),s.split(' | ',1))) for s in scene.strip().splitlines()]
    assert len(turns)==old['dialogueTurns'],(id,len(turns),old['dialogueTurns'])
    LESSONS.append(dict(id=id,proposedIndex=len(LESSONS)+1,module=module,preA1Ids=[PRE[k] for k in pre.split()],prerequisiteIds=['tr-l'+k for k in deps.split()],outcomeFa=goal,grammarFa=grammar,vocabularyFa=words,outOfScopeAndErrorFa=caution,pronunciationFa=SOUNDS[module],productionFa=production,scene=[dict(role='partner' if i%2==0 else 'learner',**t) for i,t in enumerate(turns)],listening=dict(zip(('passage','questionFa','answer'),listening)),reading=dict(zip(('passage','questionFa','answer'),reading))))

add('1-greetings',1,'hello conversation','',
'احوال‌پرسی و خداحافظی مناسب را بدون تقلید انتخاب کنم.',
'Merhaba، Nasılsın? و İyiyim؛ خطاب دوستانه در صحنه؛ Nasılsınız? در تمرین رسمی جدا.',
'merhaba=سلام؛ iyi=خوب؛ teşekkürler=ممنون؛ görüşürüz=می‌بینمت',
'هدف فراتر از تکرار Pre-A1 است؛ sen و siz در یک صحنه بی‌دلیل عوض نشوند.',
'یک احوال‌پرسی دوستانهٔ کوتاه و یک سلام رسمی جدا بنویس.',
'''Merhaba, Sara. Nasılsın? | سلام، سارا. حالت چطور است؟
İyiyim, teşekkürler. Sen nasılsın? | خوبم، ممنون. تو چطوری؟
Ben de iyiyim. Akşam görüşürüz. | من هم خوبم. عصر می‌بینمت.
Görüşürüz, Ece. | می‌بینمت، اجه.''',
('Merhaba, Mert. İyiyim, teşekkürler. Yarın görüşürüz.','خداحافظی تا چه زمانی است؟','yarın'),
('Günaydın, Ayşe Hanım. İyi akşamlar, Ayşe Hanım.','مخاطب با کدام نام و خطاب آمده است؟','Ayşe Hanım'))

add('1-alphabet-pronunciation',1,'hello objects identity','1-greetings',
'نام را هجی و چند صدای دشوار را در واژهٔ آشنا تشخیص بدهم.',
'الفبای ۲۹حرفی؛ I/ı در برابر İ/i؛ واژه‌های کوتاه su، süt، çay؛ Adım قالب بازیابی است.',
'ad=نام؛ harf=حرف؛ su=آب؛ süt=شیر',
'جملهٔ سنگین Öğretmen sınıfta konuşuyor لازم نیست؛ نام حروف و واج یکی نیست. هجی بدون صوت تأییدشده کامل نیست.',
'نام خیالی را هجی کن و دو جفت حرف/واژهٔ دشوار برای تمرین انتخاب کن.',
'''Adın ne? | نامت چیست؟
Adım Ece. E–C–E. | نامم اجه است. اِ، جِه، اِ.
Teşekkürler, Ece. | ممنون، اجه.''',
('Adım Ali. A–L–İ.','نام چگونه هجی شده است؟','A–L–İ'),
('su — süt — çay','کدام واژه به معنی شیر است؟','süt'))

add('2-asking-help-problems',1,'politechunks shortquestions firstsent','1-alphabet-pronunciation',
'برای تکرار، آهسته‌گویی و روشن‌کردن معنی کمک بخواهم.',
'Tekrar eder misiniz? و Yavaş konuşur musunuz? قالب‌های رسمی؛ Anlamıyorum قالب ضروری، تحلیل منفی بعداً.',
'yavaş=آهسته؛ tekrar=دوباره؛ kelime=واژه؛ anlamıyorum=نمی‌فهمم',
'همهٔ زمان‌ها و وجه‌های داخل قالب ادب در این درس صرف نشوند؛ مشکل و پاسخ کمک با هم مرتبط بمانند.',
'دو درخواست رسمی و یک تشکر پس از دریافت کمک بنویس.',
'''Affedersiniz, bu kelimeyi anlamıyorum. | ببخشید، این واژه را نمی‌فهمم.
Tekrar ediyorum: merhaba. | دوباره می‌گویم: سلام.
Yavaş konuşur musunuz? | می‌شود آهسته صحبت کنید؟
Tabii. Merhaba. | حتماً. سلام.''',
('Anlamıyorum. Tekrar eder misiniz, lütfen?','درخواست گوینده چیست؟','تکرارکردن'),
('Yavaş konuşun, lütfen. Teşekkürler.','نویسنده چه درخواستی دارد؟','آهسته صحبت‌کردن'))

add('1-introductions',1,'namechunks firstsent','2-asking-help-problems',
'نام خود و یک هم‌کلاسی را بگویم و بپرسم.',
'Adım/Adın و Ben …؛ Bu … در معرفی؛ جملهٔ اسمی بدون فعل مستقل معتبر است.',
'adım=نامم؛ arkadaş=دوست/هم‌کلاسی؛ memnun oldum=خوشوقتم',
'پسوند شخصی و ملیت فعلاً در حد قالب آشنا؛ سن، شغل و نشانی با هم انباشته نشوند.',
'خودت و یک هم‌کلاسی خیالی را در سه جمله معرفی کن.',
'''Merhaba, adım Ece. Senin adın ne? | سلام، نامم اجه است. نام تو چیست؟
Adım Sara. Memnun oldum. | نامم سارا است. از آشنایی خوشوقتم.
Ben de memnun oldum. Bu Mert. | من هم خوشوقتم. این مرت است.
Merhaba, Mert. | سلام، مرت.''',
('Merhaba, adım Deniz. Bu arkadaşım Ece.','نام گوینده چیست؟','Deniz'),
('Ben Sara. Bu Mert.','چه کسی معرفی شده است؟','Mert'))

add('1-vowel-harmony',1,'pairs namechunks','1-introductions',
'با آخرین واکه، دو انتخاب پسوند پربسامد را تشخیص بدهم.',
'دوگانه a/ı/o/u→a و e/i/ö/ü→e در -lar/-ler؛ چهارگانه a/ı→ı، e/i→i، o/u→u، ö/ü→ü در نمونه‌های محدود.',
'ev/evler=خانه/خانه‌ها؛ kitap/kitaplar=کتاب/کتاب‌ها؛ adım=نامم',
'این قواعد پیش‌تر در Pre-A1 اشاره شده‌اند؛ اینجا کاربرد روشن می‌شود، نه نظریهٔ کامل همهٔ پسوندها. وام‌واژه‌ها استثنا دارند.',
'چهار واژهٔ آشنا را در دو گروه پسوند و دو مثال نام/نامت دسته‌بندی کن.',
'''Ev, evler. Kitap, kitaplar. | خانه، خانه‌ها. کتاب، کتاب‌ها.
Evler, kitaplar. | خانه‌ها، کتاب‌ها.
Evet. Adım, adın. | بله. نامم، نامت.''',
('Bir ev, iki ev. Evler burada.','جمعِ ev در متن چیست؟','evler'),
('kitap → kitaplar; gün → günler','کدام صورت جمعِ gün است؟','günler'))

add('1-word-order',1,'firstsent verbchunks descriptions','1-vowel-harmony',
'ترتیب خنثای پیام کوتاه را با واژه‌های آشنا بسازم.',
'در الگوی پایه فاعل–مفعول–فعل: Ben çay içiyorum؛ در جملهٔ اسمی Ben Ece؛ ضمیرِ روشن قابل حذف است.',
'ben=من؛ çay=چای؛ içiyorum=می‌نوشم؛ burada=اینجا',
'SOV تنها ترتیب مجاز ترکی نیست؛ اینجا الگوی خنثای آموزشی است. içiyorum قالب آشناست و صرفش بعداً تحلیل می‌شود.',
'دو پیام اسمی و دو پیام فعلی کوتاه را مرتب کن و بنویس.',
'''Ben çay içiyorum. | من چای می‌نوشم.
Ben de çay içiyorum. | من هم چای می‌نوشم.
Güzel. Birlikte çay içiyoruz. | خوب است. با هم چای می‌نوشیم.''',
('Ben kitap okuyorum. Ece çay içiyor.','چه کسی کتاب می‌خواند؟','گوینده'),
('Ben Sara. Buradayım.','نویسنده خود را با چه نامی معرفی می‌کند؟','Sara'))

add('1-personal-pronouns',2,'pronouns firstsent','1-word-order',
'مرجع شخص و خطاب sen/siz را تشخیص بدهم.',
'ben/sen/o/biz/siz/onlar؛ o جنسیت نمی‌دهد؛ siz جمع یا ادب؛ ضمیر در مرجع روشن می‌تواند حذف شود.',
'biz=ما؛ siz=شما؛ onlar=آن‌ها؛ o=او/آن',
'او را به مذکر/مؤنث اروپایی تقسیم نکن؛ حذف ضمیر به معنی حذف شناسهٔ لازم نیست.',
'سه شخص و یک گروه خیالی را معرفی کن و مرجع ضمیر را روشن نگه دار.',
'''Siz öğrenci misiniz? | شما دانشجو هستید؟
Evet, biz öğrenciyiz. Bu Ece. | بله، ما دانشجو هستیم. این اجه است.
Memnun oldum, Ece. | از آشنایی خوشوقتم، اجه.''',
('Ece ve ben buradayız. Mert evde.','چه کسانی اینجا هستند؟','Ece و گوینده'),
('Bu Ece. O Türkçe öğreniyor.','o به چه کسی برمی‌گردد؟','Ece'))

add('1-nominal-sentences',2,'firstsent descriptions shortquestions','1-personal-pronouns 1-vowel-harmony',
'هویت را در جملهٔ اسمی مثبت، منفی و پرسشی بیان کنم.',
'öğrenciyim/öğrencisin؛ o öğrenci؛ değilim؛ öğrenci misin?؛ y میانجی در öğrenciyim و جزء پرسشی جدا.',
'öğrenci=دانشجو؛ öğretmen=معلم؛ değil=نیست؛ arkadaş=دوست',
'-dır اجباری نیست؛ همهٔ شش شخص در هشت ردیف هدف تولیدی هم‌زمان نشوند. nominal negation با فعل منفی فرق دارد.',
'دو هویت خیالی را با یک نفی و یک پرسش معرفی کن.',
'''Öğrenci misin? | دانشجو هستی؟
Evet, öğrenciyim. Sen öğretmen misin? | بله، دانشجو هستم. تو معلم هستی؟
Hayır, öğretmen değilim. Ben de öğrenciyim. | نه، معلم نیستم. من هم دانشجو هستم.
Güzel, biz arkadaşız. | خوب است، ما دوست هستیم.''',
('Ben öğretmenim. Ece öğrenci.','اجه چه‌کاره است؟','öğrenci'),
('Mert öğretmen değil. Öğrenci.','مرت معلم است؟','خیر'))

add('1-nationality-language-residence',2,'identity namechunks places','1-nominal-sentences',
'کشور، زبان و شهر زندگی را متمایز بیان کنم.',
'İranlıyım/Türküm در نمونهٔ محدود؛ Farsça/Türkçe konuşuyorum؛ Ankara’da yaşıyorum در قالب مکانیِ بازیابی‌شونده.',
'İran=ایران؛ Türkiye=ترکیه؛ Türkçe=ترکی؛ Farsça=فارسی',
'ملیت و زبان یکی نیستند؛ شکل‌های نام کشور و پسوندِ نام خاص با آپاستروف درست نوشته شوند؛ همهٔ ملیت‌ها لازم نیست.',
'نام، مبدأ، شهر و زبان یک شخصیت خیالی را در چهار جمله بنویس.',
'''Nerelisin? | اهل کجایی؟
İranlıyım. Ankara’da yaşıyorum. | ایرانی هستم. در آنکارا زندگی می‌کنم.
Türkçe konuşuyor musun? | ترکی صحبت می‌کنی؟
Biraz. Farsça da konuşuyorum. | کمی. فارسی هم صحبت می‌کنم.''',
('Ben Türküm. Türkçe ve biraz Farsça konuşuyorum.','کدام زبان را کمی صحبت می‌کند؟','Farsça'),
('Ece Ankara’da yaşıyor. Mert İzmir’de yaşıyor.','اجه کجا زندگی می‌کند؟','Ankara'))

add('1-numbers-age-info',2,'numbers days namechunks','1-nationality-language-residence',
'سن، تعداد و یک شمارهٔ خیالی کوتاه را بفهمم.',
'۰ تا ۱۰۰ در گروه‌ها؛ on bir، yirmi üç؛ Kaç yaşındasın? / yirmi yaşındayım در قالب؛ عدد+اسم مفرد.',
'yaş=سن؛ numara=شماره؛ on=ده؛ yirmi=بیست',
'همهٔ ۰ تا ۱۰۰ در هشت ردیف، تسلط‌شده فرض نشوند؛ جدول/بازیابی در واژگان با همین ظرفیت، بدون افزودن شناسه لازم است.',
'سن و یک شمارهٔ چهاررقمی خیالی بنویس؛ دو عدد ترکیبی هم بساز.',
'''Kaç yaşındasın? | چند سال داری؟
Yirmi üç yaşındayım. | بیست‌وسه سال دارم.
Teşekkürler. | ممنون.''',
('Adım Mert. Otuz iki yaşındayım.','مرت چند سال دارد؟','32'),
('Ad: Sara. Yaş: 24. Numara: 0312.','سن سارا چند است؟','24'))

add('1-singular-plural',2,'pairs numbers objects','1-numbers-age-info 1-vowel-harmony',
'اسم مفرد، جمع و تعداد مشخص را از هم جدا کنم.',
'-lar/-ler؛ kitaplar/evler؛ بعد از عدد عادی اسم مفرد: iki kitap، نه iki kitaplar.',
'kitap=کتاب؛ ev=خانه؛ kalem=خودکار؛ defter=دفتر',
'جنس دستوری و حرف تعریف اروپایی به اسم ترکی تحمیل نشود؛ جمع انسان و تطابق فعل در این درس کامل تحلیل نمی‌شود.',
'سه جفت مفرد/جمع و دو عبارت عدد+اسم بنویس.',
'''Bunlar ne? | این‌ها چه هستند؟
Kitaplar. | کتاب‌ها هستند.
Kaç kitap var? | چند کتاب هست؟
Üç kitap var. | سه کتاب هست.''',
('İki kitap ve üç kalem var.','چند خودکار هست؟','üç'),
('bir ev — evler; iki kitap','کدام عبارت به تعداد دو کتاب اشاره می‌کند؟','iki kitap'))

add('1-demonstratives',2,'questions shortquestions pairs','1-singular-plural',
'به شیء نزدیک و دور اشاره کنم و نام آن را بپرسم.',
'bu/şu/o و bunlar/şunlar/onlar؛ در bu kitap اسم بی‌جهت جمع نمی‌شود؛ Bu ne? قالب آشنا.',
'bu=این؛ şu=آنِ مورد اشاره؛ o=آن؛ bunlar=این‌ها',
'نزدیکی/توجه مخاطب با تصویر روشن شود؛ bu کتاب و bu bir kitap هر دو بسته به پیام معتبرند.',
'چهار اشاره با یک تصویر خیالی و دو پرسش اسم بساز.',
'''Bu ne? | این چیست؟
Bu bir defter. | این یک دفتر است.
Şu da defter mi? | آن هم دفتر است؟
Hayır, o bir kitap. | نه، آن یک کتاب است.''',
('Bu kitap yeni. Şu çanta mavi.','کدام شیء آبی است؟','şu çanta'),
('Bunlar kitap. Şunlar kalem.','کدام ضمیر به خودکارها اشاره می‌کند؟','şunlar'))

add('1-describing-things',2,'adjectives descriptions','1-demonstratives',
'شیء یا اتاق را با ویژگی ساده توصیف کنم.',
'صفت پیش از اسم: küçük ev؛ در گزاره Ev küçük؛ صفت با جنس یا جمع صرف نمی‌شود.',
'küçük=کوچک؛ büyük=بزرگ؛ yeni=نو؛ sessiz=آرام',
'قانون صفت مؤنث/جمع اسپانیایی وارد ترکی نشود؛ جملهٔ کوتاه بدون فعل مستقل ناقص نیست.',
'دو شیء و یک اتاق خیالی را با سه صفت توصیف کن.',
'''Bu ev büyük mü? | این خانه بزرگ است؟
Hayır, küçük. | نه، کوچک است.
Güzel bir ev mi? | خانهٔ زیبایی است؟
Evet, güzel ve sessiz. | بله، زیبا و آرام است.''',
('Çanta küçük. Masa büyük.','میز چه اندازه‌ای است؟','büyük'),
('Yeni kitap. Küçük oda.','چه چیزی کوچک است؟','oda'))

add('1-colors-shapes-appearance',2,'adjectives pairs','1-describing-things',
'رنگ و یک شکل ساده را بپرسم و توصیف کنم.',
'Ne renk?؛ kırmızı çanta / çanta kırmızı؛ رنگ/صفت بدون تطابق جنس/شمار؛ yuvarlak در یک نمونه.',
'mavi=آبی؛ kırmızı=قرمز؛ beyaz=سفید؛ yuvarlak=گرد',
'عنوان گستردهٔ ظاهر به معنی تدریس همهٔ شکل‌ها و ویژگی‌های بدن در هشت ردیف نیست؛ دامنه محدود بماند.',
'سه وسیله را با رنگ و یکی را با شکل توصیف کن.',
'''Çantan ne renk? | کیفت چه رنگی است؟
Mavi. | آبی است.
Bu kırmızı çanta senin mi? | این کیف قرمز مال تو است؟
Hayır, benim çantam mavi. | نه، کیف من آبی است.''',
('Defter yeşil. Kalem siyah.','دفتر چه رنگی است؟','yeşil'),
('Beyaz kitap ve yuvarlak masa.','چه چیزی گرد است؟','masa'))

add('2-feelings-daily-states',2,'descriptions needs','1-colors-shapes-appearance 1-nominal-sentences',
'حالت، گرسنگی و تشنگی را با شناسهٔ شخصی بگویم.',
'iyiyim/yorgunum/açım/susadım در قالب‌های محدود؛ در ترکی جنسیت دستوری در این صفت‌ها پسوند جدا نمی‌گیرد.',
'yorgun=خسته؛ aç=گرسنه؛ susadım=تشنه‌ام؛ mutlu=خوشحال',
'susadım از نظر صرف گذشته است اما در این پیام حالت تشنگی را می‌رساند؛ از آن جدول گذشته نساز.',
'دو شخصیت خیالی را با حالت و یک نیاز ساده توصیف کن.',
'''Nasılsın, Sara? | سارا، حالت چطور است؟
Yorgunum ve susadım. | خسته‌ام و تشنه‌ام.
Su ister misin? | آب می‌خواهی؟
Evet, lütfen. | بله، لطفاً.''',
('Ece mutlu. Mert aç.','چه کسی گرسنه است؟','Mert'),
('Sara yorgun. Su istiyor.','سارا چه می‌خواهد؟','su'))

add('1-family',3,'family descriptions','2-feelings-daily-states 1-numbers-age-info',
'اعضای خانواده را با نام و یک سن معرفی کنم.',
'annem/babam در بازیابی Pre-A1؛ kardeşim؛ adı؛ این‌ها مقدمهٔ تحلیل پسوند ملکی در درس بعدند.',
'anne=مادر؛ baba=پدر؛ kardeş=خواهر/برادر؛ aile=خانواده',
'kardeş جنسیت را مشخص نمی‌کند؛ برای مثال لازم kız kardeş/erkek kardeş روشن شود؛ اطلاعات واقعی اجباری نیست.',
'یک خانوادهٔ خیالی سه‌نفره را با نام و یک سن معرفی کن.',
'''Bu kim? | این کیست؟
Bu kız kardeşim. Adı Ece. | این خواهرم است. نامش اجه است.
Kaç yaşında? | چند سال دارد؟
Yirmi yaşında. | بیست سال دارد.''',
('Erkek kardeşimin adı Mert. On iki yaşında.','برادر گوینده چند سال دارد؟','12'),
('Bu annem. Adı Ayşe.','نام مادر چیست؟','Ayşe'))

add('1-possession-suffixes',3,'namechunks descriptions objects','1-family 1-vowel-harmony',
'صاحب وسیله را با پسوند ملکی و یک ترکیب ساده روشن کنم.',
'benim kitabım / senin kitabın؛ onun kitabı؛ p→b فقط در kitap→kitabım/kitabı؛ Ayşe’nin kitabı نمونهٔ محدود.',
'benim=مال من؛ senin=مال تو؛ kitabım=کتابم؛ çantam=کیفم',
'جدول کامل شش شخص و تمام تغییر همخوان در هشت ردیف جا نمی‌گیرد؛ ریشه و پسوند مرحله‌ای جدا شوند.',
'سه وسیله را به دو شخصیت نسبت بده و یک پرسش مالکیت بساز.',
'''Bu senin kitabın mı? | این کتاب تو است؟
Evet, benim kitabım. | بله، کتاب من است.
Güzel. Bu da benim defterim. | خوب است. این هم دفتر من است.''',
('Bu Ece’nin çantası. Çanta mavi.','صاحب کیف چه کسی است؟','Ece'),
('Benim kitabım yeni. Senin kitabın eski.','کتاب چه کسی نو است؟','گوینده'))

add('1-var-yok',3,'shortquestions objects','1-possession-suffixes',
'وجود، نبودن و داشتن وسیله را از هم تشخیص بدهم.',
'Masada kitap var / yok؛ Benim kitabım var برای داشتن؛ soru var mı?؛ var با جمع شکل تازه نمی‌گیرد.',
'var=هست؛ yok=نیست؛ masa=میز؛ anahtar=کلید',
'yok با değil یکی نیست؛ var/yok همیشه معادلِ داشتنِ فارسی نیست، زمینه مهم است.',
'دو پیام وجود و نبودن و دو پیام داشتن/نداشتن بنویس.',
'''Kalemin var mı? | خودکار داری؟
Evet, iki kalemim var. | بله، دو خودکار دارم.
Bende kalem yok. | من خودکار ندارم.''',
('Çantada kitap var, defter yok.','چه چیزی در کیف نیست؟','defter'),
('Benim telefonum var. Anahtarım yok.','نویسنده چه چیزی ندارد؟','anahtar'))

add('1-infinitive-verb-stem',4,'verbs verbchunks','1-var-yok 1-vowel-harmony',
'مصدر آشنا را از ریشه و صورت شخص‌دار جدا تشخیص بدهم.',
'-mak/-mek در gitmek/gelmek/okumak؛ ریشه git-/gel-/oku-؛ صرف در درس‌های بعد؛ حذف -mak همیشه همهٔ تغییرها را توضیح نمی‌دهد.',
'gelmek=آمدن؛ gitmek=رفتن؛ okumak=خواندن؛ içmek=نوشیدن',
'ساخت‌های سنگین اسم‌مصدر، جملهٔ موصولی و همهٔ نرم‌شدن‌ها هدف نیستند.',
'چهار مصدر آشنا و ریشهٔ آن‌ها را با معنی بنویس.',
'''Gelmek. Kökü ne? | آمدن. ریشه‌اش چیست؟
Gel-. | گِل-.
Evet. Okumak: oku-. | بله. خواندن: اوکو-.''',
('Okumak, kitap okumak.','کدام مصدر به معنی خواندن است؟','okumak'),
('gelmek → gel-; gitmek → git-','ریشهٔ gitmek چیست؟','git-'))

add('1-simple-verbal-sentences',4,'verbchunks firstsent','1-infinitive-verb-stem 1-word-order',
'با فاعل، مفعول نامعین و فعل یک پیام کوتاه بسازم.',
'Ben kitap okuyorum / çay içiyorum؛ ضمیر قابل حذف؛ این درس نقش اجزا است، تحلیل صرف -yor درس بعد.',
'kitap okumak=کتاب خواندن؛ çay içmek=چای نوشیدن؛ öğrenmek=یادگرفتن',
'در جملهٔ خنثی فعل آخر است؛ این تنها ترتیب معتبر همهٔ بافت‌ها نیست. مفعول مشخص در درس حالت مفعولی می‌آید.',
'سه فعالیت با واژه‌های آشنا در سه جملهٔ کوتاه بنویس.',
'''Ben kitap okuyorum. | من کتاب می‌خوانم.
Ben çay içiyorum. | من چای می‌نوشم.
Ece de kitap okuyor. | اجه هم کتاب می‌خواند.''',
('Ece kitap okuyor. Mert çay içiyor.','چه کسی چای می‌نوشد؟','Mert'),
('Ben Türkçe öğreniyorum.','نویسنده چه زبانی یاد می‌گیرد؟','Türkçe'))

add('1-present-continuous',4,'namechunks firstsent','1-simple-verbal-sentences',
'فعالیت اکنون را با -yor و شناسهٔ مناسب بگویم.',
'gel-iyor-um، oku-yor-um؛ ben/sen/o در هدف تولیدی؛ چهار واکه پیش از -yor با چند ریشهٔ آشنا؛ gitmek→gidiyorum استثنای پربسامد.',
'şimdi=اکنون؛ geliyorum=می‌آیم؛ okuyorum=می‌خوانم؛ gidiyorum=می‌روم',
'-yor فقط برای همین ثانیه نیست؛ جدول همهٔ فعل‌ها/اشخاص در هشت ردیف فشرده نشود؛ yazıyorum با geliyorum فرق واکه دارد.',
'دو فعالیت اکنون و یک سؤال دربارهٔ فعالیت دوست بنویس.',
'''Şimdi ne yapıyorsun? | الان چه کار می‌کنی؟
Kitap okuyorum. | کتاب می‌خوانم.
Ben de Türkçe öğreniyorum. | من هم ترکی یاد می‌گیرم.''',
('Şimdi çay içiyorum. Ece kitap okuyor.','گوینده الان چه می‌کند؟','çay içiyor'),
('Ben geliyorum. Sen geliyorsun.','صورت فعل برای sen کدام است؟','geliyorsun'))

add('1-common-verbs-present',4,'verbs verbchunks','1-present-continuous',
'چند فعل پربسامد را با شخص و معنی درست استفاده کنم.',
'yapıyorum/çalışıyorum/alıyorum/veriyorum؛ biz … -yoruz در بازیابی؛ شخص سوم بدون شناسهٔ اضافی در این نمونه‌ها.',
'yapmak=انجام دادن؛ çalışmak=کار/مطالعه؛ almak=گرفتن/خریدن؛ vermek=دادن',
'çalışmak با زمینه کار یا درس است؛ واژه‌های تازهٔ رزرو و غذاهای تخصصی بی‌دلیل وارد نشوند.',
'سه کار روزمره و یک کار مشترک با biz بنویس.',
'''Bugün ne yapıyorsun? | امروز چه کار می‌کنی؟
Türkçe çalışıyorum. | ترکی درس می‌خوانم.
Biz de Türkçe çalışıyoruz. | ما هم ترکی درس می‌خوانیم.
Güzel, birlikte çalışıyoruz. | خوب است، با هم درس می‌خوانیم.''',
('Ben ekmek alıyorum. Ece su içiyor.','گوینده چه می‌خرد؟','ekmek'),
('Biz kitap okuyoruz. Mert çalışıyor.','چه کسی کار/مطالعه می‌کند؟','Mert'))

add('1-affirmative-negative-interrogative',4,'shortquestions needs','1-common-verbs-present',
'کار را مثبت، منفی و پرسشی بیان کنم.',
'geliyorum/gelmiyorum/geliyor musun?؛ منفی پیش از -yor؛ gitmiyorum در برابر gidiyorum؛ جزء پرسشی جدا و شناسه پس از آن.',
'evet=بله؛ hayır=نه؛ bugün=امروز؛ değil=نفی اسمی در بازیابی',
'gelmiyorum یعنی نمی‌آیم، gelemiyorum نمی‌توانم بیایم؛ پرسشِ خنثی Geliyor musun? است، نه تمرکزهای دیگر به‌عنوان قاعدهٔ پایه.',
'دو فعالیت را در صورت مثبت، منفی و پرسشی تمرین کن.',
'''Bugün çalışıyor musun? | امروز کار می‌کنی؟
Hayır, çalışmıyorum. | نه، کار نمی‌کنم.
Türkçe öğreniyor musun? | ترکی یاد می‌گیری؟
Evet, öğreniyorum. | بله، یاد می‌گیرم.''',
('Bugün çalışmıyorum. Evde kitap okuyorum.','آیا گوینده امروز کار می‌کند؟','خیر'),
('Ben gidiyorum. Mert gitmiyor.','چه کسی نمی‌رود؟','Mert'))

add('1-question-words',4,'questions space time','1-affirmative-negative-interrogative',
'با واژهٔ مناسب دربارهٔ شخص، مکان، چیز و زمان سؤال کنم.',
'ne/kim/nerede/ne zaman/nasıl/kaç/hangi؛ neden برای دلیل بعداً؛ ne sorusu معمولاً بدون mi دوباره‌کاری می‌شود.',
'kim=چه کسی؛ nerede=کجا؛ ne zaman=چه وقت؛ hangi=کدام',
'همهٔ واژه‌ها در یک مکالمهٔ بازجویی‌وار انباشته نشوند؛ فرق Nerede/Nereye بعداً با حالت‌ها روشن می‌شود.',
'چهار سؤال با چهار واژهٔ پرسشی و پاسخ کوتاه بنویس.',
'''Bu kim? | این کیست؟
Bu Mert. | این مرت است.
Mert nerede? | مرت کجاست؟
Evde. | در خانه است.''',
('Ders bugün saat onda başlıyor.','کلاس چه ساعتی شروع می‌شود؟','onda'),
('Kim geliyor? Ece. Ne zaman? Yarın.','چه کسی می‌آید؟','Ece'))

add('1-location-position',5,'space shortquestions','1-question-words',
'جای شخص یا شیء مشخص را بپرسم و بگویم.',
'nerede/burada/orada؛ evde/okulda در قالب مکان؛ تحلیل -DA درس بعد؛ جملهٔ اسمی مکان بدون فعل مستقل.',
'burada=اینجا؛ orada=آنجا؛ oda=اتاق؛ mutfak=آشپزخانه',
'وجود با var و جای شیء معلوم یکی نیستند؛ قاعدهٔ ser/estar به ترکی منتقل نشود.',
'جای سه چیز مشخص و دو سؤال مکان بنویس.',
'''Kitap nerede? | کتاب کجاست؟
Kitap odada. | کتاب در اتاق است.
Çanta nerede? | کیف کجاست؟
Mutfakta. | در آشپزخانه است.''',
('Çanta mutfakta. Kitap odada.','کیف کجاست؟','mutfakta'),
('Tuvalet burada. Mutfak orada.','چه مکانی اینجا است؟','tuvalet'))

add('1-locative-case',5,'space places','1-location-position 1-vowel-harmony',
'برای «در/روی» در نمونهٔ ساده پسوند مکانی انتخاب کنم.',
'-da/-de و پس از f/s/t/k/ç/ş/h/p صورت -ta/-te؛ evde، okulda، sınıfta، kitapta؛ نام خاص Ankara’da.',
'evde=در خانه؛ okulda=در مدرسه؛ sınıfta=در کلاس؛ durakta=در ایستگاه',
'این پسوند چسبیده با de/da مستقلِ «هم» فرق دارد؛ تمام کاربردهای انتزاعی -DA هدف نیست.',
'چهار مکان کوتاه با دو صورت d و t بنویس.',
'''Ece okulda mı? | اجه در مدرسه است؟
Evet, sınıfta. | بله، در کلاس است.
Mert evde mi? | مرت در خانه است؟
Hayır, o da okulda. | نه، او هم در مدرسه است.''',
('Ben evdeyim. Ece okulda.','اجه کجاست؟','okulda'),
('Kitap çantada. Kalem masada.','خودکار کجاست؟','masada'))

add('1-dative-case',5,'verbchunks politechunks','1-locative-case 1-common-verbs-present',
'مقصد حرکت را با -A از جای ثابت جدا کنم.',
'-(y)a/-(y)e؛ okula، eve، Ankara’ya؛ nereye?؛ gitmek همراه مقصد؛ y پس از واکه.',
'eve=به خانه؛ okula=به مدرسه؛ buraya=به اینجا؛ nereye=به کجا',
'هر -A به معنی حرکت فیزیکی نیست؛ این درس مقصد آشنا را هدف می‌گیرد، نه فهرست کامل متمم فعل‌ها.',
'سه مقصد و یک سؤال جهت با فعل آشنا بنویس.',
'''Nereye gidiyorsun? | به کجا می‌روی؟
Okula gidiyorum. | به مدرسه می‌روم.
Ece de okula mı gidiyor? | اجه هم به مدرسه می‌رود؟
Evet, birlikte gidiyoruz. | بله، با هم می‌رویم.''',
('Şimdi eve gidiyorum. Mert okula gidiyor.','مقصد گوینده کجاست؟','ev'),
('Ece Ankara’ya gidiyor. Sara İzmir’e gidiyor.','سارا به کجا می‌رود؟','İzmir'))

add('1-ablative-case',5,'places space','1-dative-case',
'مبدأ را با -DAn از مکان و مقصد جدا کنم.',
'-dan/-den/-tan/-ten؛ evden، okuldan، marketten؛ nereden?؛ با geliyorum/çıkıyorum در حد نمونه.',
'evden=از خانه؛ okuldan=از مدرسه؛ marketten=از فروشگاه؛ nereden=از کجا',
'مقایسه با -den هنوز هدف نیست؛ نقش مبدأ پیش از گسترش آن تثبیت شود.',
'دو حرکت با مبدأ و مقصد روشن و یک سؤال مبدأ بنویس.',
'''Nereden geliyorsun? | از کجا می‌آیی؟
Okuldan geliyorum. | از مدرسه می‌آیم.
Şimdi eve mi gidiyorsun? | الان به خانه می‌روی؟
Evet. | بله.''',
('Marketten geliyorum. Ece evden geliyor.','گوینده از کجا می‌آید؟','market'),
('Mert okuldan eve gidiyor.','مقصد مرت کجاست؟','ev'))

add('1-accusative-case',5,'objects verbchunks','1-ablative-case 1-possession-suffixes',
'مفعول مشخص را از مفعول نامعین جدا کنم.',
'kitap okuyorum در برابر bu kitabı okuyorum؛ -(y)ı/i/u/ü؛ defteri، suyu؛ kitap→kitabı در نمونه؛ ضمیر onu محدود.',
'kitabı=کتاب را؛ defteri=دفتر را؛ suyu=آب را؛ bunu=این را',
'هر مفعول را خودکار پسونددار نکن؛ ترکیب همهٔ ملکی+حالت در یک ردیف اولیه لازم نیست.',
'دو جفت مفعول نامعین/مشخص با فعل آشنا بنویس.',
'''Kitap okuyorum. | کتاب می‌خوانم.
Hangi kitabı? | کدام کتاب را؟
Bu kitabı okuyorum. | این کتاب را می‌خوانم.''',
('Bu defteri alıyorum. Kitabı almıyorum.','کدام شیء را می‌خرد؟','bu defter'),
('Bir kitap okuyorum. Bu kitabı seviyorum.','در جملهٔ دوم کدام صورت «کتاب را» آمده؟','kitabı'))

add('1-postpositions-spatial',5,'space objects','1-accusative-case 1-possession-suffixes',
'رابطهٔ مکانی دو وسیله را با ترکیب روشن بیان کنم.',
'masanın üstünde/altında؛ kapının yanında؛ اسمِ مکان با ملکی سوم و n میانجی در üstünde؛ فقط ترکیب‌های ثابتِ نمونه.',
'üstünde=روی؛ altında=زیر؛ yanında=کنار؛ önünde=جلو',
'اسم‌اضافه و چند لایهٔ پسوند در هشت ردیف کامل تدریس نمی‌شود؛ مکان دقیق با تصویر کنترل شود.',
'چهار رابطهٔ مکانی برای میز، کتاب، کیف و در فرضی بنویس.',
'''Kalem nerede? | خودکار کجاست؟
Masanın üstünde. | روی میز است.
Tamam, çanta da masanın altında. | بسیار خوب، کیف هم زیر میز است.''',
('Kitap masanın üstünde. Çanta kapının yanında.','کیف کجاست؟','kapının yanında'),
('Kalem kitabın altında.','خودکار کجای کتاب است؟','altında'))

add('2-home-furniture',5,'objects descriptions','1-postpositions-spatial 1-var-yok',
'اتاقی را با وجود وسایل و جای مشخص توصیف کنم.',
'Odada … var/yok؛ yatak pencerenin yanında؛ بازیابی وصف و مکان، نه ساخت تازهٔ طولانی.',
'yatak=تخت؛ pencere=پنجره؛ sandalye=صندلی؛ lamba=چراغ',
'داشتن، وجود و جای شیء در ترجمه از هم جدا بمانند؛ همهٔ اتاق‌ها و اجاره در همین درس لازم نیست.',
'اتاقی خیالی را با دو وسیله، یک نبودن و دو رابطهٔ مکانی توصیف کن.',
'''Odanda ne var? | در اتاقت چه هست؟
Bir yatak ve bir masa var. | یک تخت و یک میز هست.
Yatak nerede? | تخت کجاست؟
Pencerenin yanında. | کنار پنجره است.''',
('Odada iki sandalye var, masa yok.','چه چیزی در اتاق نیست؟','masa'),
('Yatak kapının yanında. Lamba masada.','چراغ کجاست؟','masada'))

add('1-likes-wants-needs',6,'needs food','2-home-furniture 1-accusative-case',
'علاقه، خواستن و نیاز را جدا بیان کنم.',
'çay istiyorum؛ çayı seviyorum؛ suya ihtiyacım var در قالب با -A؛ -mek istiyorum با مصدر آشنا.',
'istemek=خواستن؛ sevmek=دوست‌داشتن؛ ihtiyaç=نیاز؛ su=آب',
'فارسی «دوست دارم» و سفارش یک معنی ندارند؛ ihtiyacım شکل ملکی است و یکجا با همهٔ شخص‌ها صرف نشود.',
'یک علاقه، یک نیاز و یک خواستهٔ موقعیتی بنویس.',
'''Ne istiyorsun? | چه می‌خواهی؟
Bir çay istiyorum. | یک چای می‌خواهم.
Suya da ihtiyacın var mı? | آب هم لازم داری؟
Evet, su da istiyorum. | بله، آب هم می‌خواهم.''',
('Kahveyi seviyorum ama şimdi çay istiyorum.','اکنون چه می‌خواهد؟','çay'),
('Mert’in kaleme ihtiyacı var. Defteri var.','مرت چه لازم دارد؟','kalem'))

add('1-ability-inability',6,'verbs firstsent','1-likes-wants-needs 1-affirmative-negative-interrogative',
'توانایی یا ناممکن‌بودن کار را روشن بیان کنم.',
'-(y)abil/ebil در okuyabiliyorum/gelebiliyorum؛ gelemiyorum برای ناتوانی آمدن؛ okuyabiliyor musun? با صورت کامل.',
'yüzmek=شناکردن؛ okuyabilmek=توانستن خواندن؛ gelemiyorum=نمی‌توانم بیایم',
'gelmiyorum و gelemiyorum یکی نیستند؛ صورت‌های وسیع احتمال/اجازه و همهٔ زمان‌ها هدف نیستند.',
'دو توانایی و یک ناتوانی امروز را با یک سؤال بنویس.',
'''Bugün gelebiliyor musun? | امروز می‌توانی بیایی؟
Hayır, bugün gelemiyorum. | نه، امروز نمی‌توانم بیایم.
Yarın gelebiliyor musun? | فردا می‌توانی بیایی؟
Evet, yarın gelebiliyorum. | بله، فردا می‌توانم بیایم.''',
('Ece yüzebiliyor. Mert yüzemiyor.','چه کسی نمی‌تواند شنا کند؟','Mert'),
('Türkçe okuyabiliyorum ama hızlı okuyamıyorum.','آیا نویسنده می‌تواند سریع بخواند؟','خیر'))

add('1-requests-permission-imperative',6,'politechunks conversation','1-ability-inability',
'دستور ساده و اجازه‌خواستن را در کلاس بفهمم.',
'Açın/okuyun/yazın خطاب siz؛ Açabilir miyim? برای اجازه؛ دستور دوستانه بازشناسی شود ولی در همان صحنه عوض نشود.',
'açmak=بازکردن؛ okumak=خواندن؛ yazmak=نوشتن؛ lütfen=لطفاً',
'همهٔ وجوه امری و شرطی لازم نیست؛ سکوت به معنی رضایت قطعی تلقی نشود.',
'دو دستور رسمی کوتاه و یک سؤال اجازه در کلاس بنویس.',
'''Kitabı açın, lütfen. | لطفاً کتاب را باز کنید.
Buraya yazabilir miyim? | می‌توانم اینجا بنویسم؟
Evet, buraya yazın. | بله، اینجا بنویسید.''',
('Kitabı açın. Sonra adınızı yazın.','اولین کار چیست؟','بازکردن کتاب'),
('Buraya oturabilir miyim?','اجازهٔ چه کاری خواسته شده؟','اینجا نشستن'))

add('1-ordinals-time-date',7,'time timechunks days calendar','1-requests-permission-imperative 1-numbers-age-info',
'ساعت، روز و تاریخ ساده را در قرار مشخص کنم.',
'Saat üç؛ üçte/üç buçukta برای زمان کار؛ birinci/ikinci برای بازشناسی محدود؛ iki Mayıs؛ نیم و ساعت کامل هدف اصلی.',
'saat=ساعت؛ buçuk=نیم؛ Mayıs=مه؛ gün=روز',
'همهٔ ربع/مانده، ماه‌ها، ترتیبی‌ها و اعداد بالا در هشت ردیف هدف تسلط نمی‌شوند؛ سال/جزئیات تازه بعداً.',
'دو ساعت و یک قرار با روز و تاریخ خیالی بنویس.',
'''Saat kaç? | ساعت چند است؟
Üç buçuk. | سه‌ونیم است.
Ders kaçta başlıyor? | کلاس چه ساعتی شروع می‌شود؟
Dörtte. | ساعت چهار.''',
('Saat bir. Ders saat ikide başlıyor.','کلاس چه ساعتی شروع می‌شود؟','ikide'),
('Ders: 2 Mayıs, pazartesi, 09.30.','ساعت شروع کلاس چیست؟','09.30'))

add('1-daily-routine-habits',7,'time calendar verbchunks','1-ordinals-time-date',
'برنامهٔ روزانه را با زمان و ترتیب بیان کنم.',
'her gün + -yor در عادتِ فعلی؛ kalkıyorum/kahvaltı yapıyorum؛ önce/sonra؛ گذشته و aorist جدول جدید نیست.',
'kalkmak=بلندشدن؛ kahvaltı=صبحانه؛ önce=اول؛ sonra=بعد',
'-yor فقط «الان همین لحظه» ترجمه نشود؛ همهٔ افعال بازتابی و روتین‌های شخصی انباشته نشوند.',
'چهار کار روز خیالی با دو ساعت و یک sonra بنویس.',
'''Sabah kaçta kalkıyorsun? | صبح چه ساعتی بلند می‌شوی؟
Yedide kalkıyorum. Sonra kahvaltı yapıyorum. | ساعت هفت بلند می‌شوم. بعد صبحانه می‌خورم.
Ben de yedide kalkıyorum. | من هم ساعت هفت بلند می‌شوم.''',
('Altıda kalkıyorum. Altı buçukta kahvaltı yapıyorum.','صبحانه چه ساعتی است؟','06.30'),
('Sabah çalışıyorum. Akşam kitap okuyorum.','نویسنده چه زمانی کتاب می‌خواند؟','akşam'))

add('2-weekly-schedule',7,'days calendar time','1-daily-routine-habits',
'برنامهٔ هفته و زمان آزاد را روشن کنم.',
'pazartesi/pazartesileri در حد یک مثال؛ dokuzdan on bire kadar بازهٔ آماده با مبدأ/مقصد؛ boşum.',
'hafta=هفته؛ boş=آزاد؛ cuma=جمعه؛ kadar=تا',
'صورت عادت و روز مشخص با زمینه روشن شود؛ برای بازه، ابتدا و پایان جابه‌جا نشوند.',
'سه روز هفته و یک بازهٔ کلاس و یک زمان آزاد بنویس.',
'''Salı günü çalışıyor musun? | سه‌شنبه کار می‌کنی؟
Evet. Cuma günü boşum. | بله. جمعه آزاد هستم.
Tamam, cuma görüşürüz. | بسیار خوب، جمعه می‌بینمت.''',
('Pazartesi çalışıyorum. Cuma günü boşum.','کدام روز آزاد است؟','cuma'),
('Türkçe dersi: çarşamba, 09.00–11.00.','کلاس چه ساعتی تمام می‌شود؟','11.00'))

add('2-work-study-talk',7,'firstsent time','2-weekly-schedule 1-common-verbs-present',
'دربارهٔ کلاس/کار و شروع و پایان فعالیت صحبت کنم.',
'ders başlıyor/bitiyor؛ toplantı saat onda؛ çalışmak برای کار یا مطالعه با زمینه؛ اینجا -malı اجباری نیست.',
'ders=کلاس؛ iş=کار؛ toplantı=جلسه؛ mola=استراحت',
'یک ردیف چند بند با متمم‌های سنگین نداشته باشد؛ همهٔ شغل‌ها و واژگان اداره هدف نیستند.',
'دو پیام کار/کلاس و یک پرسش ساعت جلسه بنویس.',
'''Ders kaçta başlıyor? | کلاس چه ساعتی شروع می‌شود؟
Dokuzda. Saat on birde bitiyor. | ساعت نه. ساعت یازده تمام می‌شود.
Tamam, sonra mola veriyoruz. | بسیار خوب، بعد استراحت می‌کنیم.''',
('Bugün Türkçe çalışıyorum. Ders saat on ikide bitiyor.','کلاس چه ساعتی تمام می‌شود؟','on ikide'),
('Toplantı: 10.00. Mola: 11.00.','استراحت چه ساعتی است؟','11.00'))

add('2-asking-info-forms',7,'identity namechunks time','2-work-study-talk 2-asking-help-problems',
'فیلدهای فرم و پرسش محترمانهٔ اطلاعات را بفهمم.',
'Adınız/soyadınız؛ doğum tarihi؛ adresiniz؛ -(I)nIz در خطاب رسمیِ بازیابی‌شده؛ جدول تاریخ کامل لازم نیست.',
'ad=نام؛ soyadı=نام خانوادگی؛ adres=نشانی؛ doğum tarihi=تاریخ تولد',
'شماره، نشانی و تاریخ واقعی اجباری نیستند؛ بزرگ/کوچک I/İ در فرم و جست‌وجو حفظ شود.',
'فرم خیالی نام، نام خانوادگی، شهر و یک تاریخ را پر کن.',
'''Adınız ne? | نام شما چیست؟
Adım Sara. | نام من سارا است.
Soyadınız ne? | نام خانوادگی شما چیست؟
Yılmaz. | ییلماز.''',
('Adım Mert. Soyadım Yılmaz.','نام خانوادگی چیست؟','Yılmaz'),
('Ad: Ece. Soyadı: Kaya. Şehir: Ankara.','شهر نوشته‌شده چیست؟','Ankara'))

add('2-simple-instructions',7,'politechunks conversation','2-asking-info-forms 1-requests-permission-imperative',
'سه دستور مرتبط را به ترتیب دنبال کنم.',
'önce/sonra/en son؛ kartı koyun/alın در قالب؛ بازیابی مفعول مشخص و دستور siz.',
'kart=کارت؛ düğme=دکمه؛ koymak=گذاشتن؛ almak=برداشتن',
'چند فرایند نامرتبط مثل چای/فرم/بلیط در یک صحنه مخلوط نشوند؛ دستگاه تمرینی است.',
'سه دستور برای کار با دستگاه خیالی با önce/sonra/en son بنویس.',
'''Bir bilet, lütfen. | یک بلیت، لطفاً.
Önce kartı koyun. Sonra yeşil düğmeye basın. | اول کارت را بگذارید. بعد دکمهٔ سبز را فشار دهید.
Tamam, teşekkürler. | بسیار خوب، ممنون.''',
('Önce kartı koyun. Sonra düğmeye basın.','اولین کار چیست؟','گذاشتن کارت'),
('En son kartınızı alın.','در پایان چه کاری لازم است؟','برداشتن کارت'))

add('2-ordering-food-drinks',8,'needs food politechunks','2-simple-instructions 1-likes-wants-needs',
'خوراک و نوشیدنی را با خواستهٔ روشن سفارش بدهم.',
'Bir … istiyorum / … alabilir miyim?؛ şekerli/şekersiz در قالب با -li/-siz محدود؛ su با شمار ظرف.',
'çorba=سوپ؛ şeker=شکر؛ şekersiz=بدون شکر؛ bardak=لیوان',
'واژهٔ آلرژی/درمان یا ایمنی غذا تضمین نمی‌شود؛ سفارش بدون شکر را بعداً با شکر تأیید نکن.',
'سفارش خوراک، نوشیدنی و یک درخواست بدون شکر/شیر بنویس.',
'''Ne istersiniz? | چه میل دارید؟
Bir çorba ve bir çay, lütfen. | یک سوپ و یک چای، لطفاً.
Çay şekerli mi? | چای با شکر؟
Hayır, şekersiz olsun. | نه، بدون شکر باشد.''',
('Bir ekmek ve şekersiz çay istiyorum.','در چای چه نمی‌خواهد؟','şeker'),
('Menü: çorba 50 TL, ekmek 10 TL, su 5 TL.','سوپ چند لیر است؟','50 TL'))

add('2-restaurant-cafe',8,'needs politechunks','2-ordering-food-drinks',
'سفارش، صورت‌حساب و پرداخت را به پایان برسانم.',
'Hesap, lütfen؛ ödeyebilir miyim?؛ toplam؛ با دو مشتری جدا/باهم فقط در بانک جایگزینی؛ خطاب siz ثابت.',
'hesap=صورت‌حساب؛ ödemek=پرداخت؛ toplam=جمع؛ lira=لیر',
'صحنهٔ سه‌نوبتی می‌تواند تحویل سفارش تا درخواست صورت‌حساب باشد؛ ردیف‌های دیگر پرداخت را کامل کنند، نوبت جعلی به صحنه اضافه نشود.',
'یک سفارش و دو پیام درخواست صورت‌حساب و پرداخت بنویس.',
'''Buyurun, çayınız. | بفرمایید چای شما.
Teşekkürler. Hesap, lütfen. | ممنون. صورت‌حساب، لطفاً.
Tabii, yirmi lira. | حتماً، بیست لیر.''',
('Bir kahve, lütfen. Şimdi ödemek istiyorum.','چه چیزی سفارش داده است؟','kahve'),
('Çay 20 TL. Kahve 40 TL. Su 10 TL.','ارزان‌ترین نوشیدنی چیست؟','su'))

add('2-shopping-price-payment',8,'numbers objects','2-restaurant-cafe 1-numbers-age-info',
'قیمت را بپرسم و روش پرداخت را مشخص کنم.',
'Bu … ne kadar?؛ bunu alıyorum؛ kartla/nakit در پرداخت؛ lira پس از عدد مفرد می‌ماند.',
'fiyat=قیمت؛ nakit=نقد؛ kartla=با کارت؛ almak=خریدن',
'قیمت‌ها خیالی‌اند؛ پول و تعداد با هم اشتباه نشوند؛ nakit یا کارت از تابلوی همان تمرین تعیین شود.',
'گفت‌وگوی چهار نوبتی قیمت و انتخاب و پرداخت بنویس.',
'''Bu defter ne kadar? | این دفتر چند است؟
Otuz lira. | سی لیر.
Kartla ödeyebilir miyim? | می‌توانم با کارت پرداخت کنم؟
Evet, tabii. | بله، حتماً.''',
('Kitap elli lira. Kartla ödeyebilirsiniz.','قیمت کتاب چیست؟','50 TL'),
('Kalem: 10 TL. Sadece nakit.','روش پرداخت پذیرفته چیست؟','nakit'))

add('2-store-supermarket',8,'food numbers places','2-shopping-price-payment',
'فهرست خرید و مقدار و جای کالا را بفهمم.',
'bir kilo elma؛ iki ekmek؛ Süt nerede?؛ elma var mı? با بازیابی var/yok.',
'kilo=کیلو؛ elma=سیب؛ süt=شیر؛ yumurta=تخم‌مرغ',
'بعد از عدد اسم خودکار جمع نشود؛ مقدار و شمار ظرف جدا باشند. کل قیمت یا موجودی واقعی نیست.',
'فهرست چهار قلم با دو مقدار و یک سؤال مکان بنویس.',
'''Süt nerede? | شیر کجاست؟
Ekmeğin yanında. | کنار نان است.
Teşekkürler. Bir kilo elma da alıyorum. | ممنون. یک کیلو سیب هم می‌خرم.''',
('Bir kilo elma otuz lira. Süt ekmeğin yanında.','یک کیلو سیب چند لیر است؟','30 TL'),
('Liste: üç elma, bir şişe su, iki ekmek.','چند سیب در فهرست است؟','üç'))

add('2-clothes-shopping',8,'adjectives pairs','2-store-supermarket 1-colors-shapes-appearance',
'لباس را با رنگ و سایز بخواهم و اجازهٔ پرو بگیرم.',
'beden؛ mavi gömlek؛ deneyebilir miyim? در قالب؛ küçük/büyük geldi در حد عبارت نتیجهٔ اندازه.',
'gömlek=پیراهن؛ ceket=کاپشن؛ beden=سایز؛ denemek=پروکردن',
'پسوند جنس یا صفت مؤنث نداریم؛ جدول گذشته از küçük geldi ساخته نشود؛ مقایسه در درس جدا است.',
'یک درخواست سایز/رنگ و یک اجازهٔ پرو و نتیجهٔ اندازه بنویس.',
'''Mavi bir gömlek arıyorum. | دنبال یک پیراهن آبی می‌گردم.
Hangi beden? | چه سایزی؟
M beden. Deneyebilir miyim? | سایز مدیوم. می‌توانم پرو کنم؟
Tabii. | حتماً.''',
('L beden, siyah bir ceket istiyorum.','سایز موردنیاز چیست؟','L'),
('Gömlek: kırmızı, S beden, 200 TL.','رنگ پیراهن چیست؟','kırmızı'))

add('2-preferences-choices',8,'food needs','2-clothes-shopping 1-likes-wants-needs',
'میان دو گزینه ترجیح خود را بیان کنم.',
'Çay mı kahve mi?؛ çayı tercih ediyorum؛ kahveyi sevmiyorum؛ tercih etmek فقط صورت‌های لازم.',
'tercih=ترجیح؛ çay=چای؛ kahve=قهوه؛ pilav=پلو',
'ساخت کامل -maktansa در این سطح لازم نیست؛ موردِ مشخصِ انتخاب با مفعول قبلی پیوند بخورد.',
'دو انتخاب و یک علاقه/بی‌علاقگی دربارهٔ همان موقعیت بنویس.',
'''Çay mı kahve mi? | چای یا قهوه؟
Çayı tercih ediyorum. | چای را ترجیح می‌دهم.
Tamam, bir çay. | بسیار خوب، یک چای.''',
('Kahveyi tercih ediyorum. Çayı çok sevmiyorum.','چه چیزی را ترجیح می‌دهد؟','kahve'),
('Mert ekmek istiyor. Sara pilavı tercih ediyor.','سارا چه چیزی را ترجیح می‌دهد؟','pilav'))

add('2-simple-comparisons',8,'adjectives descriptions','2-preferences-choices 1-ablative-case',
'دو شیء را در قیمت یا اندازه مقایسه کنم.',
'-den daha + صفت؛ bu kitap o kitaptan daha ucuz؛ daha küçük؛ فقط یک محور در هر پیام.',
'daha=بیشتر/ـتر؛ ucuz=ارزان؛ pahalı=گران؛ küçük=کوچک',
'-den اینجا معیار مقایسه است نه مبدأ حرکت؛ عالی en و تمام مقایسه‌های پیچیده هدف نیستند.',
'دو کالا و دو اتاق خیالی را با قیمت یا اندازه مقایسه کن.',
'''Bu kitap daha ucuz mu? | این کتاب ارزان‌تر است؟
Evet, o kitaptan daha ucuz. | بله، از آن کتاب ارزان‌تر است.
Tamam, bunu alıyorum. | بسیار خوب، این را می‌خرم.''',
('Kitap elli lira, defter yirmi lira. Defter daha ucuz.','کدام ارزان‌تر است؟','defter'),
('Ankara: küçük oda. İzmir: daha büyük oda.','کدام شهر اتاق بزرگ‌تر دارد؟','İzmir'))

add('2-leisure-hobbies',9,'verbchunks verbs','2-simple-comparisons 1-likes-wants-needs',
'از فعالیت موردعلاقه و وقت آزاد بگویم.',
'kitap okumayı seviyorum در قالب با اسم‌مصدر و مفعولی؛ kitap okuyorum نیز برای فعالیت؛ صورت نو محدود و با تجزیهٔ واضح.',
'boş zaman=وقت آزاد؛ müzik=موسیقی؛ yürümek=قدم‌زدن؛ yüzmek=شنا',
'-mayı/-meyi بعد از sevmek با -mek istiyorum یکی نیست؛ همهٔ مصدرهای صرف‌شده و متمم‌ها در این درس هدف نیستند.',
'دو فعالیت محبوب و یک سؤال دربارهٔ اوقات فراغت بنویس.',
'''Boş zamanda ne yapıyorsun? | در وقت آزاد چه کار می‌کنی؟
Kitap okuyorum ve müzik dinliyorum. | کتاب می‌خوانم و موسیقی گوش می‌کنم.
Ben de kitap okumayı seviyorum. | من هم کتاب‌خواندن را دوست دارم.''',
('Müzik dinlemeyi seviyorum. Ece kitap okumayı seviyor.','اجه چه کاری را دوست دارد؟','kitap okumak'),
('Mert pazar günü yürüyor. Sara resim yapıyor.','چه کسی نقاشی می‌کند؟','Sara'))

add('2-weather',9,'calendar adjectives','2-leisure-hobbies 2-feelings-daily-states',
'هوای امروز را با دو ویژگی کوتاه توصیف کنم.',
'Hava sıcak/soğuk؛ yağmur yağıyor؛ güneşli در قالب؛ جملهٔ اسمی و فعلی در همان معنی جدا شناخته شوند.',
'hava=هوا؛ sıcak=گرم؛ soğuk=سرد؛ yağmur=باران',
'هوا با احساس شخص یکی نیست؛ پیش‌بینی آینده یا همهٔ فصل‌ها در هشت ردیف اجباری نیست.',
'هوای دو روز خیالی و یک واکنش ساده بنویس.',
'''Bugün hava nasıl? | امروز هوا چطور است؟
Soğuk. | سرد است.
Yağmur yağıyor mu? | باران می‌بارد؟
Hayır, güneşli. | نه، آفتابی است.''',
('Bugün hava sıcak. Yağmur yağmıyor.','هوا از نظر گرما چگونه است؟','sıcak'),
('Pazartesi: yağmur. Salı: güneş.','کدام روز بارانی است؟','pazartesi'))

add('1-conjunctions',9,'questions timechunks','2-weather 1-affirmative-negative-interrogative',
'دو پیام کوتاه را با افزودن، تضاد یا انتخاب وصل کنم.',
've/ama/veya؛ çünkü در حد پاسخ کوتاهِ نمونه و تحلیل در دلیل؛ de/da جدا برای «هم» در بازیابی.',
've=و؛ ama=ولی؛ veya=یا؛ çünkü=چون',
'پیوستگی معنایی مهم‌تر از زیادکردن تعداد پیوندهاست؛ جملهٔ وابستهٔ سنگین و -dığı için لازم نیست.',
'سه جفت پیام با ve، ama و veya بنویس.',
'''Çay veya kahve ister misin? | چای یا قهوه می‌خواهی؟
Çay istiyorum ama şimdi zamanım yok. | چای می‌خواهم، ولی الان وقت ندارم.
Yarın birlikte çay içiyoruz. | فردا با هم چای می‌نوشیم.
Tamam. | بسیار خوب.''',
('Bugün çalışıyorum ama yarın boşum.','کدام روز آزاد است؟','yarın'),
('Kitap okumayı seviyorum ama bugün zamanım yok.','نویسنده امروز چه چیزی ندارد؟','zaman'))

add('2-near-future-plans',9,'calendar timechunks','1-conjunctions 2-weekly-schedule',
'برنامهٔ نزدیک را با زمان روشن بگویم و بپرسم.',
'yarın/bu akşam/haftaya + -yor برای برنامهٔ توافق‌شده؛ همان دامنهٔ واقعی فعلی؛ آیندهٔ -acak/-ecek برای مرحلهٔ بعد.',
'yarın=فردا؛ bu akşam=امشب؛ haftaya=هفتهٔ آینده؛ plan=برنامه',
'حال با زمانِ آینده برنامه می‌دهد، نه پیش‌بینی قطعی همهٔ رخدادها؛ این طرح دامنهٔ فعلی درس را بی‌دلیل گسترش نمی‌دهد.',
'سه برنامهٔ فردا/آخر هفته و یک سؤال برنامه بنویس.',
'''Yarın ne yapıyorsun? | فردا چه کار می‌کنی؟
Türkçe çalışıyorum. | ترکی درس می‌خوانم.
Ben de yarın ders çalışıyorum. | من هم فردا درس می‌خوانم.''',
('Yarın çalışıyorum. Bu akşam kitap okuyorum.','امشب چه کاری می‌کند؟','kitap okumak'),
('Cumartesi kahve içiyoruz. Pazar evde kalıyorum.','کدام روز با هم قهوه می‌نوشند؟','cumartesi'))

add('2-invitations',9,'conversation time','2-near-future-plans',
'دعوت را بپذیرم یا رد و زمان جایگزین پیشنهاد کنم.',
'Birlikte … içelim mi? قالب دعوت؛ üzgünüm/gelemiyorum؛ cumartesi uygun mu?؛ تأیید روز/ساعت.',
'birlikte=با هم؛ üzgünüm=متأسفم؛ uygun=مناسب؛ olur=باشه',
'-elim در اینجا قالب محدود است، نه صرف همهٔ وجه التزامی؛ دلیل شخصی واقعی اجباری نیست.',
'یک دعوت، یک رد و یک توافق تازه با روز و ساعت بنویس.',
'''Yarın birlikte kahve içelim mi? | فردا با هم قهوه بنوشیم؟
Üzgünüm, yarın gelemiyorum. Cumartesi uygun mu? | متأسفم، فردا نمی‌توانم بیایم. شنبه مناسب است؟
Olur, cumartesi saat onda. | باشد، شنبه ساعت ده.''',
('Cuma gelemiyorum. Pazar günü boşum.','کدام روز برای دیدار آزاد است؟','pazar'),
('Mert, pazartesi saat üçte görüşelim mi? Ece','ساعت پیشنهادی دیدار چیست؟','15.00'))

add('2-suggestions-advice',9,'politechunks calendar','2-invitations 1-ability-inability',
'یک پیشنهاد مشترک و پاسخ مناسب بدهم.',
'Gidelim mi? / … yapabiliriz در قالب محدود؛ İyi fikir / bugün olmaz؛ توصیهٔ پزشکی یا -malı هدف نیست.',
'park=پارک؛ kütüphane=کتابخانه؛ fikir=فکر؛ olmaz=نمی‌شود',
'تولید صرف کامل -elim و aorist اجباری نیست؛ پیشنهاد باید زمان/مکان قابل‌فهم داشته باشد.',
'دو پیشنهاد کوتاه و پاسخ قبول و رد برای آن‌ها بنویس.',
'''Kütüphaneye gidelim mi? | به کتابخانه برویم؟
İyi fikir. Saat dört uygun mu? | فکر خوبی است. ساعت چهار مناسب است؟
Evet, uygun. | بله، مناسب است.''',
('Hava güzel. Birlikte parka gidelim mi?','پیشنهاد رفتن به کجاست؟','park'),
('Kütüphanede birlikte ders çalışabiliriz.','کار مشترک پیشنهادی چیست؟','ders çalışmak'))

add('2-social-situations',9,'conversation firstsent','2-suggestions-advice 1-introductions 2-leisure-hobbies',
'آشنایی را با موضوع مشترک و دعوت ادامه بدهم.',
'بازیابی نام، کلاس، شهر، علاقه و زمان آزاد؛ ne zamandır و ساخت‌های پیچیده اجباری نیستند.',
'kurs=کلاس/دوره؛ yeni=تازه‌وارد؛ arkadaş=دوست؛ tanışmak=آشناشدن',
'صحنه به چند پرسش نامرتبط تبدیل نشود؛ شخصیت و خطاب ثابت بمانند.',
'گفت‌وگویی از آشنایی به یک علاقهٔ مشترک و دعوت بساز.',
'''Merhaba, ben Ece. Kursta yeni misin? | سلام، من اجه هستم. در کلاس تازه‌واردی؟
Evet, adım Sara. Türkçe öğreniyorum. | بله، نامم سارا است. ترکی یاد می‌گیرم.
Ben de. Yarın birlikte çay içelim mi? | من هم همین‌طور. فردا با هم چای بنوشیم؟
Olur, saat onda boşum. | باشد، ساعت ده آزاد هستم.''',
('Merhaba, adım Sara. Ankara’da yaşıyorum. Kitap okumayı seviyorum.','سارا کجا زندگی می‌کند؟','Ankara'),
('Ece ve Mert salı saat onda birlikte çalışıyor.','روز مطالعهٔ مشترک چیست؟','salı'))

add('2-directions-navigation',10,'conversation politechunks space','2-social-situations 1-dative-case 1-postpositions-spatial',
'مسیر کوتاه را با مستقیم/راست/چپ بفهمم و بدهم.',
'Düz gidin؛ sağa/sola dönün؛ sonra؛ siz در راهنمایی رسمی؛ نقش -A در جهت بازیابی شود.',
'sağ=راست؛ sol=چپ؛ düz=مستقیم؛ dönmek=پیچیدن',
'نقشه و گفته یکی باشند؛ آدرس واقعی شهر داده نمی‌شود و مسیرهای چندانتقالی هدف نیستند.',
'مسیر سه‌گامی از کلاس تا بانک خیالی بنویس.',
'''Affedersiniz, banka nerede? | ببخشید، بانک کجاست؟
Düz gidin. | مستقیم بروید.
Sonra? | بعد؟
Sağa dönün. Banka solda. | به راست بپیچید. بانک سمت چپ است.''',
('Düz gidin, sonra sola dönün. Market orada.','بعد از مستقیم رفتن به کدام سمت می‌پیچد؟','sola'),
('Banka marketin sağında.','بانک نسبت به فروشگاه کجاست؟','sağında'))

add('2-public-transport-taxi',10,'places time politechunks','2-directions-navigation',
'مقصد و محل پیاده‌شدن را در حمل‌ونقل بفهمم.',
'Bu otobüs … gidiyor mu?؛ sonraki durakta inin؛ taksiyle/otobüsle در قالب وسیله؛ جدول کامل ile لازم نیست.',
'otobüs=اتوبوس؛ durak=ایستگاه؛ inmek=پیاده‌شدن؛ sonraki=بعدی',
'مقصد با ایستگاه بعدی یکی فرض نشود؛ مسیرها تمرینی‌اند، نه راهنمای زندهٔ سفر.',
'یک پرسش مقصد و یک دستور پیاده‌شدن و یک ساعت حرکت بنویس.',
'''Bu otobüs merkeze gidiyor mu? | این اتوبوس به مرکز شهر می‌رود؟
Evet. Sonraki durakta inin. | بله. در ایستگاه بعدی پیاده شوید.
Teşekkürler. | ممنون.''',
('Bu otobüs istasyona gidiyor. Sonraki durakta inin.','کجا باید پیاده شود؟','sonraki durakta'),
('Otobüs 5: istasyon–merkez. Kalkış: 08.10.','ساعت حرکت چیست؟','08.10'))

add('2-travel-airport-tickets',10,'numbers places time','2-public-transport-taxi 2-shopping-price-payment',
'بلیت بخواهم و مقصد و ساعت حرکت را تشخیص بدهم.',
'Ankara’ya bir bilet؛ tek yön/gidiş dönüş؛ kaçta kalkıyor?؛ uçak/otobüs واژگان موقعیت، نه همهٔ فرودگاه.',
'bilet=بلیت؛ tek yön=یک‌طرفه؛ gidiş dönüş=رفت‌وبرگشت؛ kalkış=حرکت',
'عنوان فرودگاه مجوز انباشت واژگان کنترل گذرنامه و پرواز نیست؛ اطلاعات خیالی‌اند.',
'درخواست بلیت و دو پرسش مقصد/ساعت برای سفری خیالی بنویس.',
'''Ankara’ya bir bilet, lütfen. | یک بلیت به آنکارا، لطفاً.
Tek yön mü, gidiş dönüş mü? | یک‌طرفه یا رفت‌وبرگشت؟
Tek yön. Kaçta kalkıyor? | یک‌طرفه. چه ساعتی حرکت می‌کند؟
Saat on birde. | ساعت یازده.''',
('Ankara otobüsü saat onda kalkıyor. Peron üç.','شمارهٔ سکو چیست؟','üç'),
('İzmir: 14.30. Ankara: 15.00.','ساعت حرکت به ازمیر چیست؟','14.30'))

add('2-hotel-accommodation',10,'namechunks time','2-travel-airport-tickets 2-asking-info-forms',
'رزرو خیالی را معرفی و دربارهٔ اتاق و صبحانه سؤال کنم.',
'Rezervasyonum var؛ … adına در قالب نام رزرو؛ iki gece؛ kahvaltı dahil mi? در قالب کوتاه.',
'rezervasyon=رزرو؛ gece=شب؛ anahtar=کلید؛ kahvaltı=صبحانه',
'شمارهٔ کارت/گذرنامه واقعی لازم نیست؛ این مکالمه رزرو واقعی نمی‌سازد.',
'نام رزرو، مدت اقامت و دو سؤال اتاق/صبحانه بنویس.',
'''Merhaba, rezervasyonum var. | سلام، رزرو دارم.
Hangi isim adına? | به چه نامی؟
Sara Yılmaz adına. | به نام سارا ییلماز.
Buyurun, oda anahtarınız. | بفرمایید، کلید اتاق شما.''',
('Yılmaz adına üç gece rezervasyonum var.','رزرو برای چند شب است؟','üç gece'),
('Kahvaltı: 07.00–10.00. Oda: 12.','صبحانه چه ساعتی شروع می‌شود؟','07.00'))

add('2-polite-requests-permission',11,'politechunks conversation','2-hotel-accommodation 1-requests-permission-imperative',
'درخواست کمک و سؤال اجازه را محترمانه‌تر مطرح کنم.',
'Yardım eder misiniz?؛ Oturabilir miyim?؛ Rica etsem …? فقط بازشناسی اختیاری؛ شخص اول اجازه و شخص دوم درخواست جدا.',
'yardım=کمک؛ oturmak=نشستن؛ rica=خواهش؛ müsait=خالی/دارای وقت',
'کل شرطی و aorist از قالب ادب استخراج نشود؛ لحن و lütfen هم مهم‌اند.',
'دو درخواست از دیگری و دو سؤال اجازه برای خودت بنویس.',
'''Yardım eder misiniz, lütfen? | لطفاً کمک می‌کنید؟
Tabii, buyurun. | حتماً، بفرمایید.
Buraya oturabilir miyim? | می‌توانم اینجا بنشینم؟''',
('Buraya oturabilir miyim? Evet, sandalye boş.','اجازهٔ چه کاری خواسته شده؟','اینجا نشستن'),
('Daha yavaş konuşur musunuz, lütfen?','درخواست چیست؟','آهسته‌تر صحبت‌کردن'))

add('2-phone-short-messages',11,'numbers namechunks time','2-polite-requests-permission 2-near-future-plans',
'خودم را پشت تلفن معرفی و زمان تماس بعدی را بگویم.',
'Alo؛ Ben …؛ mesaj bırakabilir miyim?؛ beni … arar mısınız? قالب رسمی؛ ساعت با تکرار تأیید شود.',
'aramak=تماس‌گرفتن؛ mesaj=پیام؛ bırakmak=گذاشتن؛ alo=الو',
'شماره و نام واقعی لازم نیستند؛ خطاب sen و siz در هر صحنه ثابت بماند.',
'پیام کوتاه با نام خیالی و زمان تماس بعدی بنویس.',
'''Alo, buyurun. | الو، بفرمایید.
Merhaba, ben Sara. Mesaj bırakabilir miyim? | سلام، من سارا هستم. می‌توانم پیام بگذارم؟
Tabii. | حتماً.
Yarın saat onda arıyorum. | فردا ساعت ده تماس می‌گیرم.''',
('Merhaba, ben Mert. Yarın saat onda arıyorum.','تماس فردا چه ساعتی است؟','onda'),
('Sara, beni saat beşte arar mısın? Ece','ساعت درخواست تماس چیست؟','17.00'))

add('2-doctor-symptoms',11,'descriptions needs','2-phone-short-messages 2-feelings-daily-states',
'علامت ساده و نیاز به نوبت پزشکی را بیان کنم.',
'Başım/boğazım ağrıyor؛ ateşim var؛ sabahtan beri در قالب زمانی محدود؛ randevu almak istiyorum.',
'baş=سر؛ boğaz=گلو؛ ateş=تب؛ randevu=نوبت',
'پسوند ملکیِ عضو بدن با جنسیت ربط ندارد؛ این درس تشخیص، دارو یا تضمین کمک اورژانسی نمی‌دهد.',
'برای شخصیت خیالی دو علامت، زمان شروع و درخواست نوبت بنویس.',
'''Randevu almak istiyorum. | می‌خواهم نوبت بگیرم.
Neyiniz var? | چه مشکلی دارید؟
Başım ağrıyor. | سردرد دارم.
Saat onda boş yer var. | ساعت ده وقت خالی هست.''',
('Boğazım sabahtan beri ağrıyor. Randevu istiyorum.','کدام عضو درد می‌کند؟','boğaz'),
('Ateşim var. Kendimi iyi hissetmiyorum.','کدام علامت صریحاً ذکر شده؟','ateş'))

add('2-recent-past-basics',11,'calendar verbchunks','2-doctor-symptoms 1-common-verbs-present',
'کار دیروز را با چند صورت گذشتهٔ آشنا بازگو کنم.',
'dün/az önce + geldim/gittim/içtim/çalıştım در قالب محدود؛ -DI و شخص اول در این نمونه‌ها؛ گذشتهٔ نقلی -miş و روایت بلند بعداً.',
'dün=دیروز؛ az önce=کمی پیش؛ geldim=آمدم؛ içtim=نوشیدم',
'کل جدول گذشته و بودمِ پیچیده در هشت ردیف لازم نیست؛ فرق گفتار امروز و دیروز با نشانهٔ زمان روشن شود.',
'سه کار دیروز با دو فعل آشنا و یک قید زمان بنویس.',
'''Dün ne yaptın? | دیروز چه کار کردی؟
Türkçe çalıştım. Sonra eve gittim. | ترکی درس خواندم. بعد به خانه رفتم.
Güzel. Ben de evde çalıştım. | خوب است. من هم در خانه درس خواندم.''',
('Dün çalıştım. Akşam kitap okudum.','عصر چه کاری کرد؟','kitap okumak'),
('Mert dün ekmek aldı. Ece kitap okudu.','چه کسی نان خرید؟','Mert'))

add('2-simple-reason-result',12,'questions calendar','2-recent-past-basics 1-conjunctions',
'دلیل و نتیجهٔ ساده را با دو جملهٔ کوتاه مرتبط بیان کنم.',
'Neden?؛ çünkü برای دلیل؛ bu yüzden برای نتیجه؛ زمان حال/اسمیِ آشنا، نه -dığı için.',
'neden=چرا؛ çünkü=چون؛ bu yüzden=به همین دلیل؛ kalmak=ماندن',
'ترتیب دلیل و نتیجه وارونه نشود؛ علت خصوصی واقعی لازم نیست. weil آلمانی یا صرف وابستهٔ تازه کپی نشود.',
'دو دلیل و یک نتیجه برای رد دعوت یا انتخاب خیالی بنویس.',
'''Neden bugün gelemiyorsun? | چرا امروز نمی‌توانی بیایی؟
Çünkü çalışıyorum. Yarın boşum. | چون کار می‌کنم. فردا آزاد هستم.
Tamam, yarın görüşürüz. | بسیار خوب، فردا می‌بینمت.''',
('Evde kalıyorum çünkü ateşim var.','چرا در خانه می‌ماند؟','ateşi var'),
('Yağmur yağıyor. Bu yüzden evde kalıyoruz.','نتیجهٔ باران چیست؟','evde kalıyoruz'))

add('2-connected-conversation',12,'conversation firstsent','2-simple-reason-result 2-social-situations 2-invitations 2-directions-navigation',
'از آشنایی به دعوت، رفع مانع و توافق روشن برسم.',
'بازیابی نام، شهر، کلاس، وقت آزاد و مکان؛ ساخت تازهٔ اجباری ندارد؛ صحنهٔ پنج‌نوبتی دقیقاً حفظ می‌شود.',
'نام، شهر، روز، ساعت و çay؛ بدون فهرست تازهٔ سنگین',
'طول فرد صحنه را با حذف آخرین نوبت یا افزودن نوبت جعلی زوج نکن؛ ردیف‌های آموزشی و صحنه دو بخش جدا باشند.',
'گفت‌وگویی پنج تا هفت نوبتی با رد یک زمان و توافق زمان تازه بنویس.',
'''Merhaba, ben Ece. Ankara’da yaşıyorum. | سلام، من اجه هستم. در آنکارا زندگی می‌کنم.
Ben Sara. Ben de Ankara’da yaşıyorum. | من سارا هستم. من هم در آنکارا زندگی می‌کنم.
Yarın birlikte çay içelim mi? | فردا با هم چای بنوشیم؟
Yarın gelemiyorum. Cumartesi saat onda kütüphanede görüşelim mi? | فردا نمی‌توانم بیایم. شنبه ساعت ده در کتابخانه همدیگر را ببینیم؟
Olur. Cumartesi saat onda. Görüşürüz! | باشد. شنبه ساعت ده. می‌بینمت!''',
('Ece ve Sara cuma günü gelemiyor. Cumartesi saat on birde çay içiyorlar.','زمان نهایی چای چه ساعتی است؟','on birde'),
('Ece: Cumartesi saat onda mı? Sara: Evet, kütüphanede. Görüşürüz!','مکان نهایی دیدار کجاست؟','kütüphane'))

for i,l in enumerate(LESSONS):
    l['proposedIndex']=i+1
    l['transferToIds']=[other['id'] for other in LESSONS[i+1:] if l['id'] in other['prerequisiteIds']]
    l['retrievalFa']='یک پاسخ کوتاه بدون متن از '+('، '.join(l['prerequisiteIds']) if l['prerequisiteIds'] else 'سلام و پاسخ کوتاه Pre-A1')+' بازیابی شود؛ در صورت نیاز همان الگو کوتاه بازآموزی شود.'
if __name__=='__main__':
    (HERE/'design.json').write_text(json.dumps(dict(language='tr',date='2026-11-26',status='proposal-not-runtime-content',variety='Modern standard Istanbul Turkish; tr-TR',modules=MODULES,lessons=LESSONS),ensure_ascii=False,indent=2)+'\n')
    print(f'Authored Turkish A1 design: {len(LESSONS)} lessons, {sum(len(l["scene"]) for l in LESSONS)} scene turns. No runtime writes.')
