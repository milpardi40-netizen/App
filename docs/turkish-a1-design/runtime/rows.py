"""512 authored stable slots. In each lesson: 3 core, 2 substitutions, 2 retrievals, 1 transfer.
Each row includes a literal vocabulary anchor with an actual Persian meaning.
"""
BANK={}
def add(key,text):
    rows=[line.split(' | ') for line in text.strip().splitlines()]
    assert len(rows)==8 and all(len(r)==4 for r in rows),key
    BANK['tr-l'+key]=rows

add('1-greetings','''Merhaba, Ece. | سلام، اجه. | Merhaba | سلام
Nasılsın? | حالت چطور است؟ | Nasılsın | حالت چطور است
İyiyim, teşekkürler. | خوبم، ممنون. | İyiyim | خوبم
Ben de iyiyim. | من هم خوبم. | de | هم
Günaydın, Ayşe Hanım. | صبح بخیر، خانم عایشه. | Günaydın | صبح بخیر
Teşekkür ederim. | متشکرم. | Teşekkür ederim | متشکرم
İyi akşamlar. | عصر بخیر. | İyi akşamlar | عصر بخیر
Yarın görüşürüz, Mert. | فردا می‌بینمت، مرت. | Yarın | فردا''')
add('1-alphabet-pronunciation','''Adım Ece. | نامم اجه است. | Adım | نامم
E–C–E. | اِ، جِه، اِ؛ هجیِ اجه. | E–C–E | هجی اجه
Su ve süt. | آب و شیر. | süt | شیر
Çay ve şeker. | چای و شکر. | şeker | شکر
I, ı; İ, i. | حرف آیِ بی‌نقطه و ایِ نقطه‌دار. | ı | آیِ بی‌نقطه
Merhaba, adım Ali. | سلام، نامم علی است. | Merhaba | سلام
Adın ne? | نامت چیست؟ | Adın | نامت
Adım Ali. A–L–İ. | نامم علی است. آ، لِه، ای. | A–L–İ | هجی علی''')
add('2-asking-help-problems','''Anlamıyorum. | نمی‌فهمم. | Anlamıyorum | نمی‌فهمم
Tekrar eder misiniz, lütfen? | می‌شود لطفاً تکرار کنید؟ | Tekrar | دوباره
Yavaş konuşur musunuz? | می‌شود آهسته صحبت کنید؟ | Yavaş | آهسته
Bu kelime ne demek? | این واژه چه معنی دارد؟ | kelime | واژه
Bir daha, lütfen. | یک بار دیگر، لطفاً. | Bir daha | یک بار دیگر
Adım Sara. | نامم سارا است. | Adım | نامم
Teşekkürler. | ممنون. | Teşekkürler | ممنون
Affedersiniz, bu kelimeyi anlamıyorum. | ببخشید، این واژه را نمی‌فهمم. | Affedersiniz | ببخشید''')
add('1-introductions','''Ben Ece. | من اجه هستم. | Ben | من
Adım Sara. | نامم سارا است. | Adım | نامم
Senin adın ne? | نام تو چیست؟ | Senin | مال تو
Bu Mert. | این مرت است. | Bu | این
Memnun oldum, Mert. | از آشنایی خوشوقتم، مرت. | Memnun oldum | از آشنایی خوشوقتم
Merhaba. Nasılsın? | سلام. حالت چطور است؟ | Nasılsın | حالت چطور است
İyiyim, teşekkürler. | خوبم، ممنون. | teşekkürler | ممنون
Ben Sara. Bu arkadaşım Ece. | من سارا هستم. این دوستم اجه است. | arkadaşım | دوستم''')
add('1-vowel-harmony','''Ev, evler. | خانه، خانه‌ها. | evler | خانه‌ها
Kitap, kitaplar. | کتاب، کتاب‌ها. | kitaplar | کتاب‌ها
Gün, günler. | روز، روزها. | günler | روزها
Okul, okullar. | مدرسه، مدرسه‌ها. | okullar | مدرسه‌ها
Adım, adın. | نامم، نامت. | adın | نامت
Su ve süt. | آب و شیر. | süt | شیر
Ben Ece. | من اجه هستم. | Ben | من
Bir ev, iki ev; evler burada. | یک خانه، دو خانه؛ خانه‌ها اینجا هستند. | burada | اینجا''')
add('1-word-order','''Ben çay içiyorum. | من چای می‌نوشم. | içiyorum | می‌نوشم
Ece kitap okuyor. | اجه کتاب می‌خواند. | okuyor | می‌خواند
Ben Sara. | من سارا هستم. | Ben | من
Ben kitap okuyorum. | من کتاب می‌خوانم. | okuyorum | می‌خوانم
Çay içiyorum. | چای می‌نوشم. | Çay | چای
Adın ne? | نامت چیست؟ | Adın | نامت
İyiyim, teşekkürler. | خوبم، ممنون. | İyiyim | خوبم
Ben buradayım. Ece çay içiyor. | من اینجا هستم. اجه چای می‌نوشد. | buradayım | اینجا هستم''')
add('1-personal-pronouns','''Ben öğrenciyim. | من دانشجو هستم. | Ben | من
Sen öğrencisin. | تو دانشجو هستی. | Sen | تو
O öğrenci. | او دانشجو است. | O | او
Biz öğrenciyiz. | ما دانشجو هستیم. | Biz | ما
Siz öğrenci misiniz? | شما دانشجو هستید؟ | Siz | شما
Ben Ece. | من اجه هستم. | Ben | من
Bu Mert. | این مرت است. | Bu | این
Ece ve Mert burada. Onlar arkadaş. | اجه و مرت اینجا هستند. آن‌ها دوست هستند. | Onlar | آن‌ها''')
add('1-nominal-sentences','''Öğrenciyim. | دانشجو هستم. | Öğrenciyim | دانشجو هستم
Öğretmen değilim. | معلم نیستم. | değilim | نیستم
Öğrenci misin? | دانشجو هستی؟ | misin | آیا هستی
Ece öğretmen. | اجه معلم است. | öğretmen | معلم
Mert öğrenci değil. | مرت دانشجو نیست. | değil | نیست
Ben Sara. | من سارا هستم. | Ben | من
Biz arkadaşız. | ما دوست هستیم. | arkadaşız | دوست هستیم
Öğretmen misin? Hayır, öğrenciyim. | معلم هستی؟ نه، دانشجو هستم. | Hayır | نه''')
add('1-nationality-language-residence','''İranlıyım. | ایرانی هستم. | İranlıyım | ایرانی هستم
Türkçe öğreniyorum. | ترکی یاد می‌گیرم. | öğreniyorum | یاد می‌گیرم
Ankara’da yaşıyorum. | در آنکارا زندگی می‌کنم. | yaşıyorum | زندگی می‌کنم
Farsça konuşuyorum. | فارسی صحبت می‌کنم. | Farsça | فارسی
Ben Türküm. | من ترک هستم. | Türküm | ترک هستم
Adım Sara. | نامم سارا است. | Adım | نامم
Sen öğrenci misin? | تو دانشجو هستی؟ | öğrenci | دانشجو
İranlıyım. Ankara’da yaşıyorum ve biraz Türkçe konuşuyorum. | ایرانی هستم. در آنکارا زندگی می‌کنم و کمی ترکی صحبت می‌کنم. | biraz | کمی''')
add('1-numbers-age-info','''Bir, iki, üç. | یک، دو، سه. | üç | سه
On bir, yirmi üç. | یازده، بیست‌وسه. | yirmi | بیست
Kaç yaşındasın? | چند سال داری؟ | Kaç | چند
Yirmi üç yaşındayım. | بیست‌وسه سال دارم. | yaşındayım | سال دارم
Otuz iki yaşındayım. | سی‌ودو سال دارم. | Otuz | سی
Adım Sara. | نامم سارا است. | Adım | نامم
Ben öğrenciyim. | من دانشجو هستم. | öğrenciyim | دانشجو هستم
Yaş: yirmi dört. Numara: sıfır, üç, bir, iki. | سن: بیست‌وچهار. شماره: صفر، سه، یک، دو. | sıfır | صفر''')
add('1-singular-plural','''Bir kitap. | یک کتاب. | kitap | کتاب
Kitaplar burada. | کتاب‌ها اینجا هستند. | Kitaplar | کتاب‌ها
İki kitap var. | دو کتاب هست. | İki | دو
Bir ev, evler. | یک خانه، خانه‌ها. | evler | خانه‌ها
Üç kalem var. | سه خودکار هست. | kalem | خودکار
Adım Ece. | نامم اجه است. | Adım | نامم
Yirmi yaşındayım. | بیست سال دارم. | Yirmi | بیست
İki kitap ve üç kalem var. | دو کتاب و سه خودکار هست. | var | هست''')
add('1-demonstratives','''Bu bir kitap. | این یک کتاب است. | Bu | این
Şu bir defter. | آن یک دفتر است. | Şu | آنِ مورد اشاره
O bir kalem. | آن یک خودکار است. | O | آن
Bunlar kitap. | این‌ها کتاب هستند. | Bunlar | این‌ها
Şunlar kalem. | آن‌ها خودکار هستند. | Şunlar | آن‌ها‌ی مورد اشاره
İki kitap var. | دو کتاب هست. | İki | دو
Ben öğrenciyim. | من دانشجو هستم. | öğrenciyim | دانشجو هستم
Bu ne? Bu bir defter. | این چیست؟ این یک دفتر است. | ne | چه''')
add('1-describing-things','''Bu ev küçük. | این خانه کوچک است. | küçük | کوچک
Büyük bir masa. | یک میز بزرگ. | Büyük | بزرگ
Bu kitap yeni. | این کتاب نو است. | yeni | نو
Oda sessiz. | اتاق آرام است. | sessiz | آرام
Bu eski bir defter. | این یک دفتر قدیمی است. | eski | قدیمی
Bunlar kitap. | این‌ها کتاب هستند. | Bunlar | این‌ها
Üç kalem var. | سه خودکار هست. | var | هست
Bu ev küçük ama güzel. | این خانه کوچک ولی زیبا است. | güzel | زیبا''')
add('1-colors-shapes-appearance','''Çanta mavi. | کیف آبی است. | mavi | آبی
Kırmızı bir kitap. | یک کتاب قرمز. | Kırmızı | قرمز
Masa yuvarlak. | میز گرد است. | yuvarlak | گرد
Defter yeşil. | دفتر سبز است. | yeşil | سبز
Kalem siyah. | خودکار سیاه است. | siyah | سیاه
Bu kitap yeni. | این کتاب نو است. | yeni | نو
Beyaz bir masa var. | یک میز سفید هست. | Beyaz | سفید
Çantan ne renk? Benim çantam mavi. | کیفت چه رنگی است؟ کیف من آبی است. | renk | رنگ''')
add('2-feelings-daily-states','''Yorgunum. | خسته‌ام. | Yorgunum | خسته‌ام
Açım. | گرسنه‌ام. | Açım | گرسنه‌ام
Susadım. | تشنه‌ام. | Susadım | تشنه‌ام
Ece mutlu. | اجه خوشحال است. | mutlu | خوشحال
Mert aç. | مرت گرسنه است. | aç | گرسنه
İyiyim, teşekkürler. | خوبم، ممنون. | İyiyim | خوبم
Öğretmen değilim. | معلم نیستم. | değilim | نیستم
Yorgunum. Su istiyorum. | خسته‌ام. آب می‌خواهم. | istiyorum | می‌خواهم''')
add('1-family','''Bu annem. | این مادرم است. | annem | مادرم
Bu babam. | این پدرم است. | babam | پدرم
Kız kardeşimin adı Ece. | نام خواهرم اجه است. | Kız kardeşimin | خواهرم؛ در ترکیب «نامِ خواهرم»
Erkek kardeşimin adı Mert. | نام برادرم مرت است. | Erkek kardeşimin | برادرم؛ در ترکیب «نامِ برادرم»
Annem öğretmen. | مادرم معلم است. | öğretmen | معلم
Ben yirmi yaşındayım. | من بیست سال دارم. | yaşındayım | سال دارم
Bu Ece. O öğrenci. | این اجه است. او دانشجو است. | öğrenci | دانشجو
Bu kız kardeşim. On iki yaşında. | این خواهرم است. دوازده سال دارد. | On iki | دوازده''')
add('1-possession-suffixes','''Benim kitabım. | کتاب من. | kitabım | کتابم
Senin kitabın. | کتاب تو. | kitabın | کتابت
Onun kitabı. | کتاب او. | Onun | مال او
Benim defterim yeni. | دفتر من نو است. | defterim | دفترم
Ece’nin çantası mavi. | کیف اجه آبی است. | çantası | کیفش
Bu annem. | این مادرم است. | annem | مادرم
İki kalem var. | دو خودکار هست. | kalem | خودکار
Bu senin kitabın mı? Hayır, benim değil. | این کتاب تو است؟ نه، مال من نیست. | benim | مال من''')
add('1-var-yok','''Masada kitap var. | روی میز کتاب هست. | var | هست
Çantada defter yok. | در کیف دفتر نیست. | yok | نیست
Kalemin var mı? | خودکار داری؟ | Kalemin | خودکارت
Benim telefonum var. | من تلفن دارم. | telefonum | تلفنم
Anahtarım yok. | کلید ندارم. | Anahtarım | کلیدم
Bu benim kitabım. | این کتاب من است. | kitabım | کتابم
Ben öğrenci değilim. | من دانشجو نیستم. | değilim | نیستم
İki kalemim var. Sende kalem var mı? | دو خودکار دارم. تو خودکار داری؟ | Sende | نزد تو؛ در اینجا «تو داری»''')
add('1-infinitive-verb-stem','''Gelmek: gel-. | آمدن: ریشهٔ gel-. | Gelmek | آمدن
Gitmek: git-. | رفتن: ریشهٔ git-. | Gitmek | رفتن
Okumak: oku-. | خواندن: ریشهٔ oku-. | Okumak | خواندن
İçmek: iç-. | نوشیدن: ریشهٔ iç-. | İçmek | نوشیدن
Yazmak: yaz-. | نوشتن: ریشهٔ yaz-. | Yazmak | نوشتن
Ben çay içiyorum. | من چای می‌نوشم. | içiyorum | می‌نوشم
Kitap burada. | کتاب اینجا است. | burada | اینجا
Kitap okumak, Türkçe öğrenmek. | کتاب خواندن، ترکی یادگرفتن. | öğrenmek | یادگرفتن''')
add('1-simple-verbal-sentences','''Ben kitap okuyorum. | من کتاب می‌خوانم. | okuyorum | می‌خوانم
Ece çay içiyor. | اجه چای می‌نوشد. | içiyor | می‌نوشد
Türkçe öğreniyorum. | ترکی یاد می‌گیرم. | öğreniyorum | یاد می‌گیرم
Mert su içiyor. | مرت آب می‌نوشد. | su | آب
Biz kitap okuyoruz. | ما کتاب می‌خوانیم. | okuyoruz | می‌خوانیم
Ben öğrenciyim. | من دانشجو هستم. | öğrenciyim | دانشجو هستم
Kitabım var. | کتاب دارم. | Kitabım | کتابم
Ece kitap okuyor. Ben de Türkçe öğreniyorum. | اجه کتاب می‌خواند. من هم ترکی یاد می‌گیرم. | de | هم''')
add('1-present-continuous','''Şimdi geliyorum. | الان می‌آیم. | Şimdi | الان
Sen geliyorsun. | تو می‌آیی. | geliyorsun | می‌آیی
Ece geliyor. | اجه می‌آید. | geliyor | می‌آید
Kitap okuyorum. | کتاب می‌خوانم. | okuyorum | می‌خوانم
Eve gidiyorum. | به خانه می‌روم. | gidiyorum | می‌روم
Ben öğrenciyim. | من دانشجو هستم. | öğrenciyim | دانشجو هستم
Çay içiyorum. | چای می‌نوشم. | içiyorum | می‌نوشم
Şimdi ne yapıyorsun? Türkçe öğreniyorum. | الان چه کار می‌کنی؟ ترکی یاد می‌گیرم. | yapıyorsun | انجام می‌دهی''')
add('1-common-verbs-present','''Bugün çalışıyorum. | امروز کار/مطالعه می‌کنم. | çalışıyorum | کار/مطالعه می‌کنم
Ekmek alıyorum. | نان می‌خرم. | alıyorum | می‌خرم
Ece’ye kitap veriyorum. | به اجه کتاب می‌دهم. | veriyorum | می‌دهم
Biz Türkçe çalışıyoruz. | ما ترکی درس می‌خوانیم. | çalışıyoruz | درس می‌خوانیم
Mert kahvaltı yapıyor. | مرت صبحانه می‌خورد. | kahvaltı | صبحانه
Ben çay içiyorum. | من چای می‌نوشم. | içiyorum | می‌نوشم
Ece kitap okuyor. | اجه کتاب می‌خواند. | okuyor | می‌خواند
Bugün ne yapıyorsun? Kitap alıyorum. | امروز چه کار می‌کنی؟ کتاب می‌خرم. | Bugün | امروز''')
add('1-affirmative-negative-interrogative','''Geliyorum. | می‌آیم. | Geliyorum | می‌آیم
Gelmiyorum. | نمی‌آیم. | Gelmiyorum | نمی‌آیم
Geliyor musun? | می‌آیی؟ | musun | آیا؛ جزء پرسش و شناسهٔ تو
Bugün çalışmıyorum. | امروز کار نمی‌کنم. | çalışmıyorum | کار نمی‌کنم
Mert gitmiyor. | مرت نمی‌رود. | gitmiyor | نمی‌رود
Ben öğrenci değilim. | من دانشجو نیستم. | değilim | نیستم
Çantada kitap yok. | در کیف کتاب نیست. | yok | نیست
Türkçe öğreniyor musun? Evet, öğreniyorum. | ترکی یاد می‌گیری؟ بله، یاد می‌گیرم. | öğreniyorum | یاد می‌گیرم''')
add('1-question-words','''Bu kim? | این کیست؟ | kim | چه کسی
Ne yapıyorsun? | چه کار می‌کنی؟ | Ne | چه
Mert nerede? | مرت کجاست؟ | nerede | کجا
Ne zaman geliyorsun? | چه وقت می‌آیی؟ | Ne zaman | چه وقت
Hangi kitabı okuyorsun? | کدام کتاب را می‌خوانی؟ | Hangi | کدام
Kaç yaşındasın? | چند سال داری؟ | Kaç | چند
Bugün çalışıyor musun? | امروز کار می‌کنی؟ | Bugün | امروز
Kim geliyor? Ece. Ne zaman? Yarın. | چه کسی می‌آید؟ اجه. چه وقت؟ فردا. | Yarın | فردا''')
add('1-location-position','''Kitap nerede? | کتاب کجاست؟ | nerede | کجا
Kitap burada. | کتاب اینجا است. | burada | اینجا
Çanta orada. | کیف آنجا است. | orada | آنجا
Mert evde. | مرت در خانه است. | evde | در خانه
Tuvalet burada. | دستشویی اینجا است. | Tuvalet | دستشویی
Bu benim kitabım. | این کتاب من است. | kitabım | کتابم
Çantada kalem var. | در کیف خودکار هست. | var | هست
Çanta nerede? Mutfakta. Kitap odada. | کیف کجاست؟ در آشپزخانه است. کتاب در اتاق است. | Mutfakta | در آشپزخانه''')
add('1-locative-case','''Evdeyim. | در خانه هستم. | Evdeyim | در خانه هستم
Ece okulda. | اجه در مدرسه است. | okulda | در مدرسه
Mert sınıfta. | مرت در کلاس است. | sınıfta | در کلاس
Kitap çantada. | کتاب در کیف است. | çantada | در کیف
Kalem masada. | خودکار روی میز است. | masada | روی میز
Ben İranlıyım. | من ایرانی هستم. | İranlıyım | ایرانی هستم
Ankara’da yaşıyorum. | در آنکارا زندگی می‌کنم. | Ankara’da | در آنکارا
Mert nerede? Durakta. Ece de durakta. | مرت کجاست؟ در ایستگاه است. اجه هم در ایستگاه است. | Durakta | در ایستگاه''')
add('1-dative-case','''Eve gidiyorum. | به خانه می‌روم. | Eve | به خانه
Ece okula gidiyor. | اجه به مدرسه می‌رود. | okula | به مدرسه
Nereye gidiyorsun? | به کجا می‌روی؟ | Nereye | به کجا
Mert Ankara’ya gidiyor. | مرت به آنکارا می‌رود. | Ankara’ya | به آنکارا
Buraya gelin, lütfen. | لطفاً به اینجا بیایید. | Buraya | به اینجا
Ben evdeyim. | من در خانه هستم. | evdeyim | در خانه هستم
Kitap masada. | کتاب روی میز است. | masada | روی میز
Ece okulda. Ben de okula gidiyorum. | اجه در مدرسه است. من هم به مدرسه می‌روم. | gidiyorum | می‌روم''')
add('1-ablative-case','''Evden geliyorum. | از خانه می‌آیم. | Evden | از خانه
Okuldan geliyorum. | از مدرسه می‌آیم. | Okuldan | از مدرسه
Marketten geliyorum. | از فروشگاه می‌آیم. | Marketten | از فروشگاه
Nereden geliyorsun? | از کجا می‌آیی؟ | Nereden | از کجا
Ankara’dan geliyorum. | از آنکارا می‌آیم. | Ankara’dan | از آنکارا
Ece okulda. | اجه در مدرسه است. | okulda | در مدرسه
Mert eve gidiyor. | مرت به خانه می‌رود. | eve | به خانه
Okuldan eve gidiyorum. | از مدرسه به خانه می‌روم. | Okuldan | از مدرسه''')
add('1-accusative-case','''Kitap okuyorum. | کتاب می‌خوانم. | Kitap | کتاب
Bu kitabı okuyorum. | این کتاب را می‌خوانم. | kitabı | کتاب را
Defteri alıyorum. | دفتر را می‌خرم. | Defteri | دفتر را
Suyu içiyorum. | آب را می‌نوشم. | Suyu | آب را
Bunu istiyorum. | این را می‌خواهم. | Bunu | این را
Eve gidiyorum. | به خانه می‌روم. | Eve | به خانه
Kitap çantada. | کتاب در کیف است. | çantada | در کیف
Bu defteri alıyorum ama kitabı almıyorum. | این دفتر را می‌خرم ولی کتاب را نمی‌خرم. | almıyorum | نمی‌خرم''')
add('1-postpositions-spatial','''Kitap masanın üstünde. | کتاب روی میز است. | üstünde | روی
Çanta masanın altında. | کیف زیر میز است. | altında | زیر
Sandalye kapının yanında. | صندلی کنار در است. | yanında | کنار
Kalem kitabın altında. | خودکار زیر کتاب است. | kitabın | کتاب؛ در ترکیب «زیرِ کتاب»
Mert okulun önünde. | مرت جلوی مدرسه است. | önünde | جلو
Kitap nerede? | کتاب کجاست؟ | nerede | کجا
Bu kitabı okuyorum. | این کتاب را می‌خوانم. | okuyorum | می‌خوانم
Kitap masanın üstünde, çanta kapının yanında. | کتاب روی میز است، کیف کنار در است. | masanın | میز؛ در ترکیب «رویِ میز»''')
add('2-home-furniture','''Odada bir yatak var. | در اتاق یک تخت هست. | yatak | تخت
Masa pencerenin yanında. | میز کنار پنجره است. | pencerenin | پنجره؛ در ترکیب «کنارِ پنجره»
Lamba masada. | چراغ روی میز است. | Lamba | چراغ
Odada iki sandalye var. | در اتاق دو صندلی هست. | sandalye | صندلی
Mutfakta masa yok. | در آشپزخانه میز نیست. | yok | نیست
Kitap masanın üstünde. | کتاب روی میز است. | üstünde | روی
Bu ev küçük. | این خانه کوچک است. | küçük | کوچک
Odam küçük. Bir yatak ve bir lamba var. | اتاقم کوچک است. یک تخت و یک چراغ هست. | Odam | اتاقم''')
add('1-likes-wants-needs','''Çayı seviyorum. | چای را دوست دارم. | seviyorum | دوست دارم
Bir çay istiyorum. | یک چای می‌خواهم. | istiyorum | می‌خواهم
Suya ihtiyacım var. | به آب نیاز دارم. | ihtiyacım | نیازم
Kitap okumak istiyorum. | می‌خواهم کتاب بخوانم. | okumak | خواندن
Mert’in kaleme ihtiyacı var. | مرت به خودکار نیاز دارد. | kaleme | به خودکار
Benim kalemim yok. | من خودکار ندارم. | kalemim | خودکارم
Suyu içiyorum. | آب را می‌نوشم. | Suyu | آب را
Kahveyi seviyorum ama şimdi çay istiyorum. | قهوه را دوست دارم ولی الان چای می‌خواهم. | Kahveyi | قهوه را''')
add('1-ability-inability','''Türkçe okuyabiliyorum. | می‌توانم ترکی بخوانم. | okuyabiliyorum | می‌توانم بخوانم
Bugün gelemiyorum. | امروز نمی‌توانم بیایم. | gelemiyorum | نمی‌توانم بیایم
Yarın gelebiliyor musun? | فردا می‌توانی بیایی؟ | gelebiliyor | می‌تواند بیاید؛ پیش از جزء پرسشی
Ece yüzebiliyor. | اجه می‌تواند شنا کند. | yüzebiliyor | می‌تواند شنا کند
Mert yüzemiyor. | مرت نمی‌تواند شنا کند. | yüzemiyor | نمی‌تواند شنا کند
Bugün gelmiyorum. | امروز نمی‌آیم. | gelmiyorum | نمی‌آیم
Kitap okumak istiyorum. | می‌خواهم کتاب بخوانم. | istiyorum | می‌خواهم
Türkçe okuyabiliyorum ama hızlı okuyamıyorum. | می‌توانم ترکی بخوانم ولی نمی‌توانم سریع بخوانم. | hızlı | سریع''')
add('1-requests-permission-imperative','''Kitabı açın, lütfen. | لطفاً کتاب را باز کنید. | açın | باز کنید
Adınızı yazın. | نام خود را بنویسید. | yazın | بنویسید
Buraya yazabilir miyim? | می‌توانم اینجا بنویسم؟ | yazabilir | می‌تواند بنویسد؛ در قالب اجازه
Bu kelimeyi okuyun. | این واژه را بخوانید. | okuyun | بخوانید
Buraya oturabilir miyim? | می‌توانم اینجا بنشینم؟ | oturabilir | می‌تواند بنشیند؛ در قالب اجازه
Yavaş konuşur musunuz? | می‌شود آهسته صحبت کنید؟ | Yavaş | آهسته
Bugün gelemiyorum. | امروز نمی‌توانم بیایم. | gelemiyorum | نمی‌توانم بیایم
Kitabı açın. Sonra adınızı yazın. | کتاب را باز کنید. بعد نام خود را بنویسید. | Sonra | بعد''')
add('1-ordinals-time-date','''Saat üç. | ساعت سه است. | Saat | ساعت
Ders dörtte başlıyor. | کلاس ساعت چهار شروع می‌شود. | dörtte | ساعت چهار
Saat üç buçuk. | ساعت سه‌ونیم است. | buçuk | نیم
Ders iki Mayıs’ta. | کلاس در دوم مه است. | Mayıs | مه
Birinci ders, ikinci ders. | درس اول، درس دوم. | ikinci | دوم
Yirmi üç yaşındayım. | بیست‌وسه سال دارم. | yaşındayım | سال دارم
Bugün pazartesi. | امروز دوشنبه است. | pazartesi | دوشنبه
Ders kaçta? Saat dokuz buçukta. | کلاس چه ساعتی است؟ ساعت نه‌ونیم. | kaçta | چه ساعتی''')
add('1-daily-routine-habits','''Her gün yedide kalkıyorum. | هر روز ساعت هفت بلند می‌شوم. | kalkıyorum | بلند می‌شوم
Sonra kahvaltı yapıyorum. | بعد صبحانه می‌خورم. | kahvaltı | صبحانه
Akşam kitap okuyorum. | عصر کتاب می‌خوانم. | Akşam | عصر
Sabah çalışıyorum. | صبح کار می‌کنم. | Sabah | صبح
Altı buçukta kahvaltı yapıyorum. | ساعت شش‌ونیم صبحانه می‌خورم. | Altı | شش
Saat kaç? | ساعت چند است؟ | kaç | چند
Bugün çalışmıyorum. | امروز کار نمی‌کنم. | çalışmıyorum | کار نمی‌کنم
Önce kahvaltı yapıyorum, sonra okula gidiyorum. | اول صبحانه می‌خورم، بعد به مدرسه می‌روم. | Önce | اول''')
add('2-weekly-schedule','''Pazartesi çalışıyorum. | دوشنبه کار می‌کنم. | Pazartesi | دوشنبه
Cuma günü boşum. | جمعه آزاد هستم. | boşum | آزاد هستم
Ders dokuzdan on bire kadar. | کلاس از ساعت نه تا یازده است. | kadar | تا
Salı günü Türkçe çalışıyorum. | سه‌شنبه ترکی درس می‌خوانم. | Salı | سه‌شنبه
Çarşamba ders var. | چهارشنبه کلاس هست. | Çarşamba | چهارشنبه
Her gün yedide kalkıyorum. | هر روز ساعت هفت بلند می‌شوم. | Her gün | هر روز
Ders saat dokuzda başlıyor. | کلاس ساعت نه شروع می‌شود. | başlıyor | شروع می‌شود
Salı çalışıyorum ama cuma günü boşum. | سه‌شنبه کار می‌کنم ولی جمعه آزاد هستم. | ama | ولی''')
add('2-work-study-talk','''Türkçe çalışıyorum. | ترکی درس می‌خوانم. | çalışıyorum | درس می‌خوانم
Ders dokuzda başlıyor. | کلاس ساعت نه شروع می‌شود. | başlıyor | شروع می‌شود
Ders on birde bitiyor. | کلاس ساعت یازده تمام می‌شود. | bitiyor | تمام می‌شود
Toplantı saat onda. | جلسه ساعت ده است. | Toplantı | جلسه
Sonra mola veriyoruz. | بعد استراحت می‌کنیم. | mola | استراحت
Pazartesi çalışıyorum. | دوشنبه کار می‌کنم. | Pazartesi | دوشنبه
Cuma günü boşum. | جمعه آزاد هستم. | boşum | آزاد هستم
Bugün ders on ikide bitiyor, sonra eve gidiyorum. | امروز کلاس ساعت دوازده تمام می‌شود، بعد به خانه می‌روم. | on ikide | ساعت دوازده''')
add('2-asking-info-forms','''Adınız ne? | نام شما چیست؟ | Adınız | نام شما
Soyadınız ne? | نام خانوادگی شما چیست؟ | Soyadınız | نام خانوادگی شما
Adresiniz ne? | نشانی شما چیست؟ | Adresiniz | نشانی شما
Doğum tarihi: iki Mayıs. | تاریخ تولد: دوم مه. | Doğum tarihi | تاریخ تولد
Adım Mert. Soyadım Yılmaz. | نامم مرت است. نام خانوادگی‌ام ییلماز است. | Soyadım | نام خانوادگی‌ام
Ankara’da yaşıyorum. | در آنکارا زندگی می‌کنم. | yaşıyorum | زندگی می‌کنم
Yavaş konuşur musunuz? | می‌شود آهسته صحبت کنید؟ | Yavaş | آهسته
Ad: Ece. Soyadı: Kaya. Şehir: Ankara. | نام: اجه. نام خانوادگی: کایا. شهر: آنکارا. | Şehir | شهر''')
add('2-simple-instructions','''Önce kartı koyun. | اول کارت را بگذارید. | koyun | بگذارید
Sonra yeşil düğmeye basın. | بعد دکمهٔ سبز را فشار دهید. | basın | فشار دهید
En son kartınızı alın. | در پایان کارت خود را بردارید. | En son | در پایان
Bileti alın, lütfen. | لطفاً بلیت را بردارید. | Bileti | بلیت را
Kırmızı düğmeye basmayın. | دکمهٔ قرمز را فشار ندهید. | basmayın | فشار ندهید
Kitabı açın. | کتاب را باز کنید. | açın | باز کنید
Adınızı yazın. | نام خود را بنویسید. | yazın | بنویسید
Önce kartı koyun, sonra bileti alın. | اول کارت را بگذارید، بعد بلیت را بردارید. | kartı | کارت را''')
add('2-ordering-food-drinks','''Bir çorba, lütfen. | یک سوپ، لطفاً. | çorba | سوپ
Şekersiz çay istiyorum. | چای بدون شکر می‌خواهم. | Şekersiz | بدون شکر
Bir bardak su alabilir miyim? | می‌توانم یک لیوان آب بگیرم؟ | bardak | لیوان
Bir ekmek de istiyorum. | یک نان هم می‌خواهم. | ekmek | نان
Çay şekerli olsun. | چای با شکر باشد. | şekerli | با شکر
Suya ihtiyacım var. | به آب نیاز دارم. | ihtiyacım | نیازم
Çayı seviyorum. | چای را دوست دارم. | seviyorum | دوست دارم
Bir çorba ve şekersiz bir çay, lütfen. | یک سوپ و یک چای بدون شکر، لطفاً. | ve | و''')
add('2-restaurant-cafe','''Hesap, lütfen. | صورت‌حساب، لطفاً. | Hesap | صورت‌حساب
Şimdi ödemek istiyorum. | الان می‌خواهم پرداخت کنم. | ödemek | پرداخت‌کردن
Toplam ne kadar? | جمعاً چقدر است؟ | Toplam | جمع
Bir kahve, lütfen. | یک قهوه، لطفاً. | kahve | قهوه
Kartla ödeyebilir miyim? | می‌توانم با کارت پرداخت کنم؟ | Kartla | با کارت
Şekersiz çay istiyorum. | چای بدون شکر می‌خواهم. | Şekersiz | بدون شکر
Bir bardak su, lütfen. | یک لیوان آب، لطفاً. | bardak | لیوان
Çay yirmi lira. Hesap, lütfen. | چای بیست لیر است. صورت‌حساب، لطفاً. | lira | لیر''')
add('2-shopping-price-payment','''Bu defter ne kadar? | این دفتر چند است؟ | ne kadar | چقدر
Otuz lira. | سی لیر. | Otuz | سی
Nakit ödemek istiyorum. | می‌خواهم نقدی پرداخت کنم. | Nakit | نقد
Kitap elli lira. | کتاب پنجاه لیر است. | elli | پنجاه
Sadece nakit. | فقط نقد. | Sadece | فقط
Bu defteri alıyorum. | این دفتر را می‌خرم. | alıyorum | می‌خرم
Hesap, lütfen. | صورت‌حساب، لطفاً. | Hesap | صورت‌حساب
Bunu alıyorum. Kartla ödeyebilir miyim? | این را می‌خرم. می‌توانم با کارت پرداخت کنم؟ | Bunu | این را''')
add('2-store-supermarket','''Bir kilo elma istiyorum. | یک کیلو سیب می‌خواهم. | elma | سیب
Süt nerede? | شیر کجاست؟ | Süt | شیر
Yumurta var mı? | تخم‌مرغ هست؟ | Yumurta | تخم‌مرغ
İki ekmek alıyorum. | دو نان می‌خرم. | ekmek | نان
Bir şişe su, lütfen. | یک بطری آب، لطفاً. | şişe | بطری
Bu ne kadar? | این چند است؟ | ne kadar | چقدر
Kartla ödemek istiyorum. | می‌خواهم با کارت پرداخت کنم. | Kartla | با کارت
Üç elma ve bir süt alıyorum. | سه سیب و یک بسته شیر می‌خرم. | Üç | سه''')
add('2-clothes-shopping','''Mavi bir gömlek arıyorum. | دنبال یک پیراهن آبی می‌گردم. | gömlek | پیراهن
Hangi beden? | چه سایزی؟ | beden | سایز
Deneyebilir miyim? | می‌توانم پرو کنم؟ | Deneyebilir | می‌تواند پرو کند؛ در قالب اجازه
L beden, siyah bir ceket istiyorum. | یک کاپشن سیاه سایز لارج می‌خواهم. | ceket | کاپشن
Bu küçük geldi. | این برایم کوچک بود. | küçük geldi | کوچک بود؛ از نظر اندازه
Çanta mavi. | کیف آبی است. | mavi | آبی
Bunu alıyorum. | این را می‌خرم. | Bunu | این را
Kırmızı gömlek, S beden. İki yüz lira. | پیراهن قرمز، سایز اسمال. دویست لیر. | yüz | صد''')
add('2-preferences-choices','''Çay mı kahve mi? | چای یا قهوه؟ | kahve | قهوه
Çayı tercih ediyorum. | چای را ترجیح می‌دهم. | tercih ediyorum | ترجیح می‌دهم
Kahveyi çok sevmiyorum. | قهوه را زیاد دوست ندارم. | sevmiyorum | دوست ندارم
Pilavı tercih ediyorum. | پلو را ترجیح می‌دهم. | Pilavı | پلو را
Mert ekmek istiyor. | مرت نان می‌خواهد. | istiyor | می‌خواهد
Bir çay, lütfen. | یک چای، لطفاً. | lütfen | لطفاً
Şekersiz olsun. | بدون شکر باشد. | Şekersiz | بدون شکر
Kahveyi seviyorum ama şimdi çayı tercih ediyorum. | قهوه را دوست دارم ولی الان چای را ترجیح می‌دهم. | ama | ولی''')
add('2-simple-comparisons','''Bu kitap daha ucuz. | این کتاب ارزان‌تر است. | ucuz | ارزان
O çanta daha pahalı. | آن کیف گران‌تر است. | pahalı | گران
Bu oda o odadan daha büyük. | این اتاق از آن اتاق بزرگ‌تر است. | odadan | از اتاق
Defter kitaptan daha ucuz. | دفتر از کتاب ارزان‌تر است. | kitaptan | از کتاب
Bu masa daha küçük. | این میز کوچک‌تر است. | daha | بیشتر/ـتر
Kitap elli lira. | کتاب پنجاه لیر است. | elli | پنجاه
Çayı tercih ediyorum. | چای را ترجیح می‌دهم. | tercih ediyorum | ترجیح می‌دهم
Bu kitap o kitaptan daha ucuz. Bunu alıyorum. | این کتاب از آن کتاب ارزان‌تر است. این را می‌خرم. | Bunu | این را''')
add('2-leisure-hobbies','''Kitap okumayı seviyorum. | کتاب‌خواندن را دوست دارم. | okumayı | خواندن را
Müzik dinliyorum. | موسیقی گوش می‌کنم. | dinliyorum | گوش می‌کنم
Boş zamanda yürüyorum. | در وقت آزاد قدم می‌زنم. | Boş zamanda | در وقت آزاد
Mert yüzmeyi seviyor. | مرت شناکردن را دوست دارد. | yüzmeyi | شناکردن را
Sara resim yapıyor. | سارا نقاشی می‌کند. | resim | نقاشی
Kitap okumak istiyorum. | می‌خواهم کتاب بخوانم. | okumak | خواندن
Pazar günü boşum. | یکشنبه آزاد هستم. | Pazar | یکشنبه
Kitap okumayı seviyorum ama bugün müzik dinliyorum. | کتاب‌خواندن را دوست دارم ولی امروز موسیقی گوش می‌کنم. | Müzik | موسیقی''')
add('2-weather','''Hava sıcak. | هوا گرم است. | sıcak | گرم
Bugün soğuk. | امروز سرد است. | soğuk | سرد
Yağmur yağıyor. | باران می‌بارد. | Yağmur | باران
Bugün güneşli. | امروز آفتابی است. | güneşli | آفتابی
Yağmur yağmıyor. | باران نمی‌بارد. | yağmıyor | نمی‌بارد
Ben yorgunum. | من خسته‌ام. | yorgunum | خسته‌ام
Yarın boşum. | فردا آزاد هستم. | Yarın | فردا
Hava nasıl? Soğuk ama güneşli. | هوا چطور است؟ سرد ولی آفتابی است. | nasıl | چطور''')
add('1-conjunctions','''Çay ve su istiyorum. | چای و آب می‌خواهم. | ve | و
Bugün çalışıyorum ama yarın boşum. | امروز کار می‌کنم ولی فردا آزاد هستم. | ama | ولی
Çay veya kahve ister misin? | چای یا قهوه می‌خواهی؟ | veya | یا
Kitap okumayı seviyorum ama zamanım yok. | کتاب‌خواندن را دوست دارم ولی وقت ندارم. | zamanım | وقتم
Hava soğuk ve yağmurlu. | هوا سرد و بارانی است. | yağmurlu | بارانی
Yarın gelebiliyor musun? | فردا می‌توانی بیایی؟ | gelebiliyor | می‌تواند بیاید؛ پیش از پرسش
Çayı tercih ediyorum. | چای را ترجیح می‌دهم. | tercih ediyorum | ترجیح می‌دهم
Çay istiyorum ama şimdi zamanım yok. Yarın birlikte içiyoruz. | چای می‌خواهم ولی الان وقت ندارم. فردا با هم می‌نوشیم. | birlikte | با هم''')
add('2-near-future-plans','''Yarın çalışıyorum. | فردا کار می‌کنم. | Yarın | فردا
Bu akşam evde kalıyorum. | امشب در خانه می‌مانم. | kalıyorum | می‌مانم
Haftaya Ankara’ya gidiyorum. | هفتهٔ آینده به آنکارا می‌روم. | Haftaya | هفتهٔ آینده
Cumartesi birlikte kahve içiyoruz. | شنبه با هم قهوه می‌نوشیم. | Cumartesi | شنبه
Pazar günü evdeyim. | یکشنبه در خانه هستم. | Pazar | یکشنبه
Bugün Türkçe çalışıyorum. | امروز ترکی درس می‌خوانم. | Bugün | امروز
Cuma günü boşum. | جمعه آزاد هستم. | boşum | آزاد هستم
Yarın ne yapıyorsun? Ders çalışıyorum, sonra eve gidiyorum. | فردا چه کار می‌کنی؟ درس می‌خوانم، بعد به خانه می‌روم. | sonra | بعد''')
add('2-invitations','''Yarın birlikte kahve içelim mi? | فردا با هم قهوه بنوشیم؟ | içelim | بنوشیم
Üzgünüm, yarın gelemiyorum. | متأسفم، فردا نمی‌توانم بیایم. | Üzgünüm | متأسفم
Cumartesi uygun mu? | شنبه مناسب است؟ | uygun | مناسب
Olur, saat onda. | باشد، ساعت ده. | Olur | باشد
Cuma çalışıyorum, pazar boşum. | جمعه کار می‌کنم، یکشنبه آزاد هستم. | pazar | یکشنبه
Bu akşam evde kalıyorum. | امشب در خانه می‌مانم. | Bu akşam | امشب
Çay veya kahve ister misin? | چای یا قهوه می‌خواهی؟ | veya | یا
Yarın gelemiyorum. Cumartesi saat onda görüşelim mi? | فردا نمی‌توانم بیایم. شنبه ساعت ده همدیگر را ببینیم؟ | görüşelim | همدیگر را ببینیم''')
add('2-suggestions-advice','''Parka gidelim mi? | به پارک برویم؟ | gidelim | برویم
Kütüphanede ders çalışabiliriz. | می‌توانیم در کتابخانه درس بخوانیم. | çalışabiliriz | می‌توانیم درس بخوانیم
İyi fikir. | فکر خوبی است. | fikir | فکر
Bugün olmaz. Yarın uygun mu? | امروز نمی‌شود. فردا مناسب است؟ | olmaz | نمی‌شود
Saat dörtte gidelim. | ساعت چهار برویم. | dörtte | ساعت چهار
Hava güzel. | هوا خوب است. | Hava | هوا
Yarın boşum. | فردا آزاد هستم. | boşum | آزاد هستم
Kütüphaneye gidelim mi? Evet, saat dört uygun. | به کتابخانه برویم؟ بله، ساعت چهار مناسب است. | Kütüphaneye | به کتابخانه''')
add('2-social-situations','''Kursta yeni misin? | در کلاس تازه‌واردی؟ | Kursta | در کلاس/دوره
Ben de Türkçe öğreniyorum. | من هم ترکی یاد می‌گیرم. | öğreniyorum | یاد می‌گیرم
Birlikte çay içelim mi? | با هم چای بنوشیم؟ | Birlikte | با هم
Kitap okumayı seviyorum. | کتاب‌خواندن را دوست دارم. | okumayı | خواندن را
Yarın saat onda boşum. | فردا ساعت ده آزاد هستم. | boşum | آزاد هستم
Merhaba, adım Sara. | سلام، نامم سارا است. | adım | نامم
Ankara’da yaşıyorum. | در آنکارا زندگی می‌کنم. | yaşıyorum | زندگی می‌کنم
Ben de kursta yeniyim. Yarın birlikte çalışabiliriz. | من هم در کلاس تازه‌وارد هستم. فردا می‌توانیم با هم درس بخوانیم. | yeniyim | تازه‌وارد هستم''')
add('2-directions-navigation','''Banka nerede? | بانک کجاست؟ | Banka | بانک
Düz gidin. | مستقیم بروید. | Düz | مستقیم
Sağa dönün. | به راست بپیچید. | Sağa | به راست
Sonra sola dönün. | بعد به چپ بپیچید. | sola | به چپ
Banka marketin sağında. | بانک سمت راست فروشگاه است. | sağında | سمت راستِ
Kitap masanın üstünde. | کتاب روی میز است. | üstünde | روی
Okula gidiyorum. | به مدرسه می‌روم. | Okula | به مدرسه
Düz gidin, sonra sağa dönün. Banka solda. | مستقیم بروید، بعد به راست بپیچید. بانک سمت چپ است. | solda | سمت چپ''')
add('2-public-transport-taxi','''Bu otobüs merkeze gidiyor mu? | این اتوبوس به مرکز شهر می‌رود؟ | otobüs | اتوبوس
Sonraki durakta inin. | در ایستگاه بعدی پیاده شوید. | inin | پیاده شوید
Taksiyle eve gidiyorum. | با تاکسی به خانه می‌روم. | Taksiyle | با تاکسی
Otobüs istasyona gidiyor. | اتوبوس به ایستگاه قطار می‌رود. | istasyona | به ایستگاه قطار
Otobüs saat sekiz onda kalkıyor. | اتوبوس ساعت هشت‌وده دقیقه حرکت می‌کند. | kalkıyor | حرکت می‌کند
Düz gidin. | مستقیم بروید. | Düz | مستقیم
Banka sağda. | بانک سمت راست است. | sağda | سمت راست
Otobüsle merkeze gidiyorum. Sonraki durakta iniyorum. | با اتوبوس به مرکز شهر می‌روم. در ایستگاه بعدی پیاده می‌شوم. | iniyorum | پیاده می‌شوم''')
add('2-travel-airport-tickets','''Ankara’ya bir bilet, lütfen. | یک بلیت به آنکارا، لطفاً. | bilet | بلیت
Tek yön, lütfen. | یک‌طرفه، لطفاً. | Tek yön | یک‌طرفه
Kaçta kalkıyor? | چه ساعتی حرکت می‌کند؟ | kalkıyor | حرکت می‌کند
Gidiş dönüş istiyorum. | رفت‌وبرگشت می‌خواهم. | Gidiş dönüş | رفت‌وبرگشت
Peron üç. | سکوی سه. | Peron | سکو
Kartla ödeyebilir miyim? | می‌توانم با کارت پرداخت کنم؟ | Kartla | با کارت
Saat on birde. | ساعت یازده. | on birde | ساعت یازده
İzmir otobüsü saat iki buçukta kalkıyor. | اتوبوس ازمیر ساعت دو‌ونیم حرکت می‌کند. | iki buçukta | ساعت دوونیم''')
add('2-hotel-accommodation','''Rezervasyonum var. | رزرو دارم. | Rezervasyonum | رزرو من
Sara Yılmaz adına. | به نام سارا ییلماز. | adına | به نام
İki gece kalıyorum. | دو شب می‌مانم. | gece | شب
Kahvaltı dahil mi? | صبحانه شامل می‌شود؟ | dahil | شامل
Oda anahtarınız burada. | کلید اتاق شما اینجا است. | anahtarınız | کلید شما
Adım Sara. | نامم سارا است. | Adım | نامم
Saat kaçta başlıyor? | چه ساعتی شروع می‌شود؟ | başlıyor | شروع می‌شود
Kahvaltı yediden ona kadar. Odam on iki. | صبحانه از ساعت هفت تا ده است. اتاقم دوازده است. | yediden | از ساعت هفت''')
add('2-polite-requests-permission','''Yardım eder misiniz, lütfen? | لطفاً کمک می‌کنید؟ | Yardım | کمک
Buraya oturabilir miyim? | می‌توانم اینجا بنشینم؟ | oturabilir | می‌تواند بنشیند؛ در قالب اجازه
Daha yavaş konuşur musunuz? | می‌شود آهسته‌تر صحبت کنید؟ | Daha yavaş | آهسته‌تر
Pencereyi açabilir miyim? | می‌توانم پنجره را باز کنم؟ | Pencereyi | پنجره را
Müsait misiniz? | وقت دارید؟ | Müsait | دارای وقت/آزاد
Tekrar eder misiniz? | می‌شود تکرار کنید؟ | Tekrar | دوباره
Kalemim yok. | خودکار ندارم. | Kalemim | خودکارم
Bu sandalye boş mu? Buraya oturabilir miyim? | این صندلی خالی است؟ می‌توانم اینجا بنشینم؟ | boş | خالی''')
add('2-phone-short-messages','''Alo, ben Sara. | الو، من سارا هستم. | Alo | الو
Mesaj bırakabilir miyim? | می‌توانم پیام بگذارم؟ | Mesaj | پیام
Yarın saat onda arıyorum. | فردا ساعت ده تماس می‌گیرم. | arıyorum | تماس می‌گیرم
Beni saat beşte arar mısınız? | می‌شود ساعت پنج با من تماس بگیرید؟ | Beni | من را
Tamam, saat beşte. | بسیار خوب، ساعت پنج. | beşte | ساعت پنج
Müsait misiniz? | وقت دارید؟ | Müsait | دارای وقت
Adım Mert. | نامم مرت است. | Adım | نامم
Merhaba, ben Ece. Lütfen beni yarın arayın. | سلام، من اجه هستم. لطفاً فردا با من تماس بگیرید. | arayın | تماس بگیرید''')
add('2-doctor-symptoms','''Başım ağrıyor. | سردرد دارم. | Başım | سرم
Boğazım ağrıyor. | گلودرد دارم. | Boğazım | گلویم
Ateşim var. | تب دارم. | Ateşim | تب من
Sabahtan beri ağrıyor. | از صبح درد می‌کند. | Sabahtan beri | از صبح تاکنون
Randevu almak istiyorum. | می‌خواهم نوبت بگیرم. | Randevu | نوبت
Kendimi iyi hissetmiyorum. | حالم خوب نیست. | iyi hissetmiyorum | احساس خوبی ندارم
Saat onda gelebiliyorum. | می‌توانم ساعت ده بیایم. | gelebiliyorum | می‌توانم بیایم
Boğazım ağrıyor. Bugün randevu var mı? | گلودرد دارم. امروز وقت نوبت هست؟ | Bugün | امروز''')
add('2-recent-past-basics','''Dün geldim. | دیروز آمدم. | geldim | آمدم
Eve gittim. | به خانه رفتم. | gittim | رفتم
Çay içtim. | چای نوشیدم. | içtim | نوشیدم
Dün Türkçe çalıştım. | دیروز ترکی درس خواندم. | çalıştım | درس خواندم
Akşam kitap okudum. | عصر کتاب خواندم. | okudum | خواندم
Bugün çalışıyorum. | امروز کار می‌کنم. | Bugün | امروز
Ece kitap okuyor. | اجه کتاب می‌خواند. | okuyor | می‌خواند
Dün Mert ekmek aldı. Ben az önce eve geldim. | دیروز مرت نان خرید. من کمی پیش به خانه آمدم. | az önce | کمی پیش''')
add('2-simple-reason-result','''Neden bugün gelemiyorsun? | چرا امروز نمی‌توانی بیایی؟ | Neden | چرا
Çünkü çalışıyorum. | چون کار می‌کنم. | Çünkü | چون
Yağmur yağıyor. Bu yüzden evde kalıyoruz. | باران می‌بارد. به همین دلیل در خانه می‌مانیم. | Bu yüzden | به همین دلیل
Evde kalıyorum çünkü ateşim var. | در خانه می‌مانم چون تب دارم. | çünkü | چون
Yorgunum. Bu yüzden gelemiyorum. | خسته‌ام. به همین دلیل نمی‌توانم بیایم. | Yorgunum | خسته‌ام
Bugün çalışıyorum ama yarın boşum. | امروز کار می‌کنم ولی فردا آزاد هستم. | ama | ولی
Dün Türkçe çalıştım. | دیروز ترکی درس خواندم. | Dün | دیروز
Bugün gelemiyorum çünkü çalışıyorum. Yarın görüşelim mi? | امروز نمی‌توانم بیایم چون کار می‌کنم. فردا همدیگر را ببینیم؟ | görüşelim | همدیگر را ببینیم''')
add('2-connected-conversation','''Merhaba, ben Ece. Ankara’da yaşıyorum. | سلام، من اجه هستم. در آنکارا زندگی می‌کنم. | yaşıyorum | زندگی می‌کنم
Yarın birlikte çay içelim mi? | فردا با هم چای بنوشیم؟ | içelim | بنوشیم
Yarın gelemiyorum çünkü çalışıyorum. | فردا نمی‌توانم بیایم چون کار می‌کنم. | çünkü | چون
Cumartesi saat onda uygun mu? | شنبه ساعت ده مناسب است؟ | Cumartesi | شنبه
Evet, kütüphanede görüşelim. | بله، در کتابخانه همدیگر را ببینیم. | kütüphanede | در کتابخانه
Kitap okumayı seviyorum. | کتاب‌خواندن را دوست دارم. | okumayı | خواندن را
Dün Türkçe çalıştım. | دیروز ترکی درس خواندم. | çalıştım | درس خواندم
Olur, cumartesi saat onda kütüphanede. Görüşürüz! | باشد، شنبه ساعت ده در کتابخانه. می‌بینمت! | Görüşürüz | می‌بینمت''')
