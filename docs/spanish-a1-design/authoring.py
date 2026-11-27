"""Spanish A1 design only. No runtime lessons, storage, or other-language writes."""
import json
from pathlib import Path
HERE=Path(__file__).parent
LESSONS=[]
MODULES={1:'ورود و ابزار یادگیری',2:'شخص، اسم و توصیف',3:'فعل و ساخت پیام',4:'زمان و سازمان‌دهی روز',5:'مکان و خانه',6:'خوراک، خرید و انتخاب',7:'تفریح و ارتباط اجتماعی',8:'مسیر و سفر',9:'درخواست، تماس و سلامت',10:'دلیل و گفت‌وگوی مرتبط'}
SOUNDS={1:'پنج واکهٔ روشن؛ h خاموش، ñ، و تفاوت r/rr با صوت واقعی. نشانه‌های ¿ ? و ¡ ! حفظ شوند؛ آوانویسی فارسی تقریبی است.',2:'تکیه و اَکسان، tú در برابر tu؛ جنس/شمار در حرف تعریف و صفت شنیده و خوانده شود. تلفظ رایج اسپانیا مبناست؛ seseo در گونه‌های دیگر خطا نیست.',3:'تکیهٔ فعل‌ها و تمایز hablo/habla/hablamos؛ پایان فعل حامل شخص است. vosotros در اسپانیا، ustedes با صرف سوم‌شخص جمع؛ صدا با مثال معتبر بررسی شود.',4:'تشخیص روز، ساعت و عدد؛ es la una در برابر son las dos؛ ریتم de … a … و ساعت ۲۴ساعته در تابلو.',5:'estar، hay و نشانه‌های مکان در عبارت کامل شنیده شوند؛ نقشه باید با گفته هماهنگ باشد.',6:'عدد قیمت، مقدار و کالا جدا تشخیص داده شوند؛ b/v معمولاً دو واج متمایز نیستند. /θ/ رایج اسپانیا در برابر /s/ دیگر مناطق برتری‌گذاری نشود.',7:'آهنگ دعوت، رد و پیشنهاد و مکث بین جمله‌های کوتاه؛ que بدون اَکسان در پیوندها با qué پرسشی فرق نوشتاری دارد.',8:'مقصد، ساعت و andén در اعلان آهسته؛ recto و derecha یک معنی ندارند. نام خیابان و مسیر تمرینی‌اند.',9:'تلفن و عددها با تکرار تأییدی؛ duele و fiebre با صوت واقعی بررسی شوند. این طرح آزمون میکروفن یا کیفیت صدای دستگاه نیست.',10:'مکث میان دلیل و نتیجه و تأیید زمان نهایی؛ بازگویی قابل‌فهم، نه تقلید اجباری سرعت بومی.'}
def add(slug,module,pre,deps,goal,grammar,words,caution,production,scene,listening,reading):
    turns=[dict(zip(('es','fa'),line.split(' | ',1))) for line in scene.strip().splitlines()]
    assert len(turns)==4,slug
    LESSONS.append(dict(id='es-a1-'+slug,proposedIndex=len(LESSONS)+1,module=module,
      preA1Ids=['es-'+s for s in pre.split()],prerequisiteIds=['es-a1-'+s for s in deps.split()],
      outcomeFa=goal,grammarFa=grammar,vocabularyFa=words,outOfScopeAndErrorFa=caution,
      pronunciationFa=SOUNDS[module],productionFa=production,
      scene=[dict(role='partner' if i%2==0 else 'learner',**t) for i,t in enumerate(turns)],
      listening=dict(zip(('passage','questionFa','answer'),listening)),reading=dict(zip(('passage','questionFa','answer'),reading))))

add('greetings',1,'pre-1 pre-3 foundation-chunks-1','',
'سلام و احوال‌پرسی کنم و مناسب موقعیت خداحافظی کنم.',
'Hola، ¿Qué tal? و ¿Cómo estás? برای دوست؛ Buenos días و خطاب رسمی جدا؛ پاسخ و خداحافظی کوتاه.',
'hola=سلام؛ bien=خوب؛ hasta mañana=تا فردا؛ hasta luego=تا بعد',
'Pre-A1 قبلاً سلام دارد؛ هدف انتخاب پاسخ بدون تقلید است. tú و usted در یک صحنه بی‌دلیل عوض نشوند.',
'یک احوال‌پرسی دوستانهٔ چهارنوبتی و یک سلام/خداحافظی رسمی جدا بساز.',
'''¡Hola, Sara! ¿Qué tal? | سلام، سارا! چطوری؟
Bien, gracias. ¿Y tú? | خوبم، ممنون. تو چطوری؟
Muy bien. ¡Hasta mañana! | خیلی خوبم. تا فردا!
¡Hasta mañana, Lucía! | تا فردا، لوسیا!''',
('Buenos días, Amir. Estoy bien, gracias. ¡Hasta esta tarde!','گوینده تا چه زمانی خداحافظی می‌کند؟','esta tarde'),
('Buenos días, señor Martín. Adiós, señor Martín.','مخاطب چگونه خطاب شده است؟','señor Martín'))

add('profile',1,'pre-2 pre-16','greetings',
'نام و شهر محل زندگی را بگویم و بپرسم.',
'Me llamo / ¿Cómo te llamas? و Vivo en؛ فاعل ضمیری را می‌توان حذف کرد؛ me/te در llamarse جزئی از الگوست.',
'nombre=نام؛ vivir=زندگی کردن؛ ciudad=شهر؛ en Madrid=در مادرید',
'Me llamo را به Yo llamo تبدیل نکن. سن و شغل را به این درس انباشته نکن.',
'با نام و شهر خیالی خودت معرفی کوتاه و دو سؤال بنویس.',
'''Hola, me llamo Lucía. ¿Y tú? | سلام، اسم من لوسیا است. تو چطور؟
Me llamo Sara. | اسم من سارا است.
¿Dónde vives, Sara? | سارا، کجا زندگی می‌کنی؟
Vivo en Madrid. ¿Y tú? | در مادرید زندگی می‌کنم. تو چطور؟''',
('Me llamo Amir y vivo en Toledo.','امیر در کدام شهر زندگی می‌کند؟','Toledo'),
('Hola, soy Ana. Vivo en Sevilla.','نام نویسنده چیست؟','Ana'))

add('asking-help',1,'pre-14 pre-4 pre-2','profile',
'درخواست تکرار، آهسته‌گویی و هجی نام کنم.',
'¿Puede repetir? / Más despacio, por favor قالب‌های رسمی؛ No entiendo؛ ¿Cómo se escribe?؛ تحلیل poder بعداً.',
'repetir=تکرار؛ despacio=آهسته؛ deletrear=هجی کردن؛ apellido=نام خانوادگی',
'نام حروف و ñ جدا با صوت معرفی شوند. usted با puede می‌آید، نه puedes؛ شکل دوستانه جدا تمرین شود.',
'نامی خیالی هجی کن و دو درخواست تکرار/آهسته‌گویی بنویس.',
'''Buenos días. ¿Cómo se llama? | صبح بخیر. نام شما چیست؟
Me llamo Ali. | اسم من علی است.
¿Cómo se escribe? | چطور نوشته می‌شود؟
A–L–I. | آ، اِلِه، ای.''',
('Mi apellido es Lee. Se escribe L–E–E.','نام خانوادگی چگونه هجی شد؟','L–E–E'),
('No entiendo esta palabra. Más despacio, por favor.','نویسنده چه درخواستی دارد؟','آهسته‌تر صحبت‌کردن'))

add('nationalities',1,'pre-15 pre-16','profile asking-help',
'مبدأ، شهر زندگی و زبان را از هم جدا بیان کنم.',
'Soy de Irán؛ Vivo en Madrid؛ Hablo español بدون حرف تعریف؛ español/española صفت ملیت با حرف کوچک.',
'país=کشور؛ lengua=زبان؛ español=اسپانیایی؛ persa=فارسی',
'همهٔ ملیت‌ها و استثناهای جنس یکجا لازم نیست؛ فارسی‌زبان بودن با تابعیت یکی نیست.',
'یک شخصیت خیالی را با نام، کشور، شهر و زبان در چهار جمله معرفی کن.',
'''¿De dónde eres? | اهل کجا هستی؟
Soy de Irán. | اهل ایران هستم.
¿Hablas español? | اسپانیایی صحبت می‌کنی؟
Sí, un poco. También hablo persa. | بله، کمی. فارسی هم صحبت می‌کنم.''',
('Soy de España. Hablo español y un poco de persa.','گوینده کدام زبان را کمی صحبت می‌کند؟','persa'),
('Lucía es española. Vive en Madrid.','لوسیا کجا زندگی می‌کند؟','Madrid'))

add('numbers-age',1,'pre-5','profile',
'سن و یک شمارهٔ تماس کوتاه خیالی را بگویم و بفهمم.',
'Tener برای سن: Tengo veintitrés años؛ صفر تا صد گروه‌بندی‌شده؛ dieciséis و veintidós؛ treinta y dos؛ cien برای ۱۰۰ مستقل.',
'edad=سن؛ años=سال در سن؛ número=شماره؛ cero=صفر',
'Soy veinte años غلط است. شمارهٔ تمرین رقم‌به‌رقم خوانده شود؛ اطلاعات تماس واقعی لازم نیست.',
'سن و شمارهٔ چهاررقمی خیالی بنویس؛ یک سؤال سن هم اضافه کن.',
'''¿Cuántos años tienes? | چند سال داری؟
Tengo veintitrés años. | بیست‌وسه سال دارم.
¿Cuál es tu número? | شماره‌ات چیست؟
Cero, uno, dos, tres. | صفر، یک، دو، سه.''',
('Me llamo Ben. Tengo treinta y dos años.','بن چند سال دارد؟','32'),
('Nombre: Sara. Edad: 24 años. Teléfono: 0312.','سن سارا چقدر است؟','24'))

add('nouns-gender-plural',2,'pre-6 pre-5 foundation-chunks-2','numbers-age',
'اسم آشنا را با جنس و جمع معرفی کنم.',
'un/una؛ unos/unas در جمع نامعین؛ -s و -es در libros/papeles؛ جنس دستوری با جنس صاحب فرق دارد.',
'libro=کتاب؛ mesa=میز؛ silla=صندلی؛ papel=کاغذ',
'پایان -o/-a راهنماست نه قانون بدون استثنا؛ el problema و la mano فقط در صورت نیاز معرفی شوند، نه بار اضافی اجباری.',
'چهار چیز اطراف را با یک نمونهٔ مفرد و جمع معرفی کن.',
'''¿Qué es esto? | این چیست؟
Es un libro. | یک کتاب است.
¿Y estas cosas? | و این چیزها؟
Son dos mesas y tres sillas. | دو میز و سه صندلی هستند.''',
('Aquí hay tres libros y una mesa.','چند کتاب وجود دارد؟','tres'),
('un papel → dos papeles; una silla → dos sillas','جمع papel در متن چیست؟','papeles'))

add('articles',2,'foundation-chunks-2 pre-6','nouns-gender-plural',
'چیزی را نخست معرفی و سپس به همان چیز ارجاع بدهم.',
'un/una/unos/unas در برابر el/la/los/las؛ un libro → el libro؛ حرف تعریف با اسم هماهنگ است.',
'el libro=آن کتاب؛ la mesa=آن میز؛ los libros=کتاب‌های معین؛ las sillas=صندلی‌های معین',
'اسپانیایی حرف تعریف خنثای اسم مانند das ندارد؛ el agua استثنای آوایی است و در خوراک جدا معرفی می‌شود.',
'دو شیء را با نامعین معرفی و در جملهٔ دوم با معین به آن‌ها اشاره کن.',
'''Aquí hay un libro. | اینجا یک کتاب هست.
El libro es nuevo. | آن کتاب نو است.
También hay una mesa. | یک میز هم هست.
La mesa es pequeña. | آن میز کوچک است.''',
('Hay una silla. La silla está aquí.','کدام شیء معرفی شده است؟','una silla'),
('Hay unos libros. Los libros son nuevos.','در ارجاع دوم پیش از libros چه آمده؟','los'))

add('subject-pronouns',2,'foundation-words-2 pre-2','articles nationalities',
'مرجع شخص و خطاب را تشخیص بدهم و ضمیر را در جای لازم به کار ببرم.',
'yo/tú/él/ella/nosotros/nosotras/vosotros/vosotras/ellos/ellas؛ usted/ustedes با صرف سوم‌شخص؛ حذف ضمیر وقتی مرجع روشن است.',
'nosotros=ما؛ vosotros=شما دوستانه در اسپانیا؛ ustedes=شما با صرف سوم‌شخص جمع؛ ella=او زن',
'قاعدهٔ فاعل اجباری فرانسوی به اسپانیایی منتقل نشود. usted الزاماً فاصلهٔ اجتماعی ثابت در همهٔ کشورها ندارد.',
'سه شخص یا گروه خیالی را معرفی کن و برای هرکدام ضمیر مناسب انتخاب کن.',
'''Esta es Ana. Ella habla español. | این آنا است. او اسپانیایی صحبت می‌کند.
Yo también hablo español. | من هم اسپانیایی صحبت می‌کنم.
Sara y yo somos estudiantes. | سارا و من دانشجو هستیم.
Vosotras también sois estudiantes. | شما هم دانشجو هستید. (دوستانه، زنان، اسپانیا)''',
('Sara y yo vivimos en Madrid. Ben vive en Toledo.','چه کسانی در مادرید زندگی می‌کنند؟','Sara y el hablante'),
('Ana y Lucía están aquí. Ellas hablan español.','Ellas به چه کسانی برمی‌گردد؟','Ana y Lucía'))

add('verb-to-be',2,'pre-2 pre-15','subject-pronouns',
'هویت، ملیت و شغل را با ser بیان کنم.',
'soy/eres/es/somos/sois/son؛ Soy estudiante بدون حرف تعریف در معرفی سادهٔ شغل؛ estar برای حالت/مکان جدا است.',
'estudiante=دانشجو؛ profesor/profesora=معلم؛ compañero=هم‌کلاسی مرد',
'قاعدهٔ گمراه‌کنندهٔ «ser همیشه دائمی، estar همیشه موقتی» آموزش داده نشود. در یک صحنه tú و usted مخلوط نشوند.',
'دو معرفی کوتاه و دو سؤال دربارهٔ هویت/شغل شخصیت‌های خیالی بنویس.',
'''¿Eres estudiante? | دانشجو هستی؟
Sí, soy estudiante. ¿Y tú? | بله، دانشجو هستم. تو چطور؟
Soy profesora. | من معلم هستم. (زن)
Ana también es profesora. | آنا هم معلم است. (زن)''',
('Soy profesor. Lucía es estudiante.','لوسیا چه‌کاره است؟','estudiante'),
('Nosotros somos estudiantes. Vosotros sois profesores.','فعل همراه nosotros در متن چیست؟','somos'))

add('family',2,'pre-10','verb-to-be numbers-age',
'اعضای خانواده و سن یک نفر را معرفی کنم.',
'Este es mi padre / Esta es mi madre در قالب آشنا؛ se llama و tiene؛ بازیابی ser/tener.',
'madre=مادر؛ padre=پدر؛ hermana=خواهر؛ hermano=برادر',
'نوع خانواده یا داشتن خواهر/برادر فرض نشود؛ شخصیت خیالی مجاز است. esta در این معرفی با está فعلی فرق دارد.',
'یک خانوادهٔ خیالی سه‌نفره را با نام و یک سن معرفی کن.',
'''¿Quién está en la foto? | چه کسی در عکس است؟
Es mi hermana. | خواهرم است.
¿Cómo se llama? | اسم او چیست؟
Se llama Ana. Tiene veinte años. | اسمش آنا است. بیست سال دارد.''',
('Mi hermano se llama Ben. Tiene doce años.','برادر گوینده چند سال دارد؟','doce'),
('Esta es mi madre. Se llama Mina.','نام مادر چیست؟','Mina'))

add('possessives',2,'pre-11','family articles',
'مالکیت و صاحب شیء را روشن کنم.',
'mi/tu/su و mis/tus/sus با شمار شیء؛ nuestro/nuestra با جنس/شمار؛ de Ana برای رفع ابهام su؛ tu بدون اَکسان.',
'mi=مال من؛ tus=مال تو، جمع؛ nuestro=مال ما، مذکر؛ de Sara=مال سارا',
'su می‌تواند مال او/شما/آن‌ها باشد؛ بدون زمینه صاحب را حدس نزن. فعلاً همهٔ ضمایر ملکیِ مستقل لازم نیست.',
'سه وسیله را به دو شخصیت نسبت بده و یک ابهام su را با de رفع کن.',
'''¿Es tu libro? | این کتاب تو است؟
Sí, es mi libro. | بله، کتاب من است.
¿Y estos cuadernos? | و این دفترها؟
Son los cuadernos de Ana. | دفترهای آنا هستند.''',
('Ben tiene una hermana. Su hermana se llama Ana.','نام خواهر بن چیست؟','Ana'),
('Es la bolsa de Sara. Su bolsa es azul.','صاحب کیف چه کسی است؟','Sara'))

add('demonstratives',2,'pre-6 pre-10','possessives',
'به اشخاص و اشیای نزدیک و دورتر اشاره کنم.',
'este/esta/estos/estas و ese/esa/esos/esas؛ esto برای پرسش دربارهٔ چیز ناشناس بدون اسم؛ esta با está یکی نیست.',
'este libro=این کتاب؛ esa mesa=آن میز؛ estos libros=این کتاب‌ها؛ esto=این چیز',
'فاصله‌ها با تصویر روشن شوند؛ aquel فعلاً هدف اجباری نیست. برای esta فقط به جنس اسم نگاه کن.',
'چهار اشارهٔ کوتاه با اشیای خیالی نزدیک و دورتر بنویس.',
'''¿Este libro es tuyo? | این کتاب مال تو است؟
Sí, este libro es mío. | بله، این کتاب مال من است.
¿Y esa mesa? | و آن میز؟
Esa mesa es de Ana. | آن میز مال آنا است.''',
('Este libro es nuevo. Esa mesa es vieja.','کدام شیء نو است؟','este libro'),
('Esta silla es pequeña. Estas mesas son grandes.','کدام عبارت به چند میز اشاره دارد؟','estas mesas'))

add('descriptions',2,'pre-12','demonstratives verb-to-be',
'شیء یا اتاق را با صفت هماهنگ توصیف کنم.',
'pequeño/pequeña/pequeños/pequeñas؛ grande/grandes؛ ser برای توصیف این نمونه‌ها؛ صفت معمولاً پس از اسم.',
'pequeño=کوچک؛ grande=بزرگ؛ nuevo=نو؛ tranquilo=آرام',
'جنس دستوری اسم از صاحب نمی‌آید؛ grande در مفرد هر دو جنس یک شکل دارد. مکان با estar بعداً بازیابی می‌شود.',
'دو وسیله و یک اتاق را با سه صفت توصیف کن.',
'''¿Tu habitación es grande? | اتاقت بزرگ است؟
No, es pequeña y tranquila. | نه، کوچک و آرام است.
¿Y tu mesa? | و میزت؟
Mi mesa es grande y nueva. | میزم بزرگ و نو است.''',
('Mi bolsa es pequeña. Mi mesa es grande.','میز چه اندازه‌ای است؟','grande'),
('El libro es nuevo. La habitación es pequeña.','چه چیزی کوچک است؟','la habitación'))

add('colors',2,'pre-13','descriptions',
'رنگ را بپرسم و با اسم هماهنگ بیان کنم.',
'rojo/roja و blanco/blanca؛ azul/azules بدون تغییر جنس؛ ¿De qué color es …?؛ صفت رنگ پس از اسم.',
'rojo=قرمز؛ azul=آبی؛ verde=سبز؛ blanco=سفید؛ negro=سیاه',
'azula نساز؛ جمع azules و verdes معرفی شود. رنگ و جنس صاحب کیف را یکی نگیر.',
'چهار وسیله را با رنگ و یک پرسش رنگ توصیف کن.',
'''¿De qué color es tu bolsa? | کیفت چه رنگی است؟
Es azul. | آبی است.
¿Esta silla roja es tuya? | این صندلی قرمز مال تو است؟
No, mi silla es blanca. | نه، صندلی من سفید است.''',
('Mi cuaderno es verde. Mi bolígrafo es negro.','دفتر چه رنگی است؟','verde'),
('La mesa es negra. El libro es rojo.','کتاب چه رنگی است؟','rojo'))

add('feelings',2,'pre-7 pre-9','colors numbers-age',
'حالت، گرسنگی و تشنگی را بیان کنم.',
'estoy/estás/está و جمع‌های لازم estamos/estáis/están برای حالت؛ tener hambre/sed؛ cansado/cansada.',
'cansado=خسته؛ contenta=خوشحال، زن؛ hambre=گرسنگی؛ sed=تشنگی',
'Estoy hambre غلط است؛ tengo hambre. ser/estar به دائمی/موقتی فروکاسته نشود. جنس گوینده در مثال مشخص باشد.',
'حالت دو شخصیت و نیاز سادهٔ هرکدام را در سه یا چهار جمله بنویس.',
'''¿Cómo estás, Sara? | سارا، حالت چطور است؟
Estoy cansada y tengo sed. | خسته‌ام و تشنه‌ام. (زن)
¿Quieres agua? | آب می‌خواهی؟
Sí, gracias. | بله، ممنون.''',
('Ana está contenta. Ben tiene hambre.','چه کسی گرسنه است؟','Ben'),
('Sara tiene sed. Está cansada.','سارا چه نیازی دارد؟','agua'))

add('simple-verbs',3,'pre-8 pre-9','feelings subject-pronouns',
'با داشتن و جست‌وجو یک پیام کوتاه بسازم.',
'tener: tengo/tienes/tiene/tenemos/tenéis/tienen؛ tengo un libro و busco un cuaderno؛ حذف فاعل ضمیریِ روشن.',
'tener=داشتن؛ buscar=دنبال چیزی گشتن؛ llevar=حمل کردن؛ cuaderno=دفتر',
'این درس ساخت پیام و tener است، نه صرف تمام فعل‌ها. buscar چیزی معمولاً حرف اضافهٔ فارسی «دنبالِ» را کپی نمی‌کند.',
'بگو چه داری و دنبال چه می‌گردی؛ دو سؤال از هم‌کلاسی خیالی اضافه کن.',
'''¿Tienes un bolígrafo? | خودکار داری؟
Sí, tengo dos. | بله، دو تا دارم.
Yo busco un cuaderno. | من دنبال یک دفتر می‌گردم.
Tengo un cuaderno aquí. | اینجا یک دفتر دارم.''',
('Tengo un libro. Busco un cuaderno.','گوینده دنبال چه می‌گردد؟','un cuaderno'),
('Ben lleva una bolsa. Sara tiene un libro.','چه کسی کیف حمل می‌کند؟','Ben'))

add('verb-conjugation',3,'pre-15 pre-16','simple-verbs',
'چند فعل باقاعده را با شخص درست صرف کنم.',
'hablar: hablo/hablas/habla/hablamos/habláis/hablan؛ comer و vivir با پایان‌های پایهٔ -er/-ir؛ فعل بی‌قاعده را از این الگو نساز.',
'hablar=صحبت کردن؛ comer=خوردن؛ vivir=زندگی کردن؛ aprender=یاد گرفتن',
'تمام صورت‌ها در یک گفت‌وگوی مصنوعی چپانده نشوند؛ الگو، جایگزینی و بازیابی جدا باشند. اَکسان habláis/vivís حفظ شود.',
'سه جمله با سه شخص و دو سؤال بساز؛ دست‌کم دو گروه فعل به کار ببر.',
'''¿Hablas español? | اسپانیایی صحبت می‌کنی؟
Sí, hablo un poco. | بله، کمی صحبت می‌کنم.
Nosotros también hablamos español. | ما هم اسپانیایی صحبت می‌کنیم.
¿Vivís en Madrid? | در مادرید زندگی می‌کنید؟ (دوستانه، اسپانیا)''',
('Vivimos en Madrid. Ben vive en Toledo.','گوینده و همراهانش کجا زندگی می‌کنند؟','Madrid'),
('Yo hablo persa. Vosotros habláis español.','فعل همراه vosotros در متن چیست؟','habláis'))

add('present-tense',3,'pre-16 pre-19','verb-conjugation',
'از زمان حال برای کار امروز و عادت استفاده کنم.',
'trabajo/estudio؛ ir: voy/vas/va/vamos/vais/van برای رفتن؛ hacer در hago/haces؛ voy al curso و al= a+el.',
'trabajar=کار کردن؛ estudiar=درس خواندن؛ ir=رفتن؛ hacer la compra=خرید روزمره کردن',
'voy al curso رفتن به مکان است؛ آیندهٔ voy a estudiar بعداً معرفی می‌شود. زمان حال را به «در حال انجام» محدود نکن.',
'سه کار عادی و یک کار امروز را با یک نشانهٔ زمان بنویس.',
'''¿Qué haces hoy? | امروز چه کار می‌کنی؟
Hoy estudio español. | امروز اسپانیایی درس می‌خوانم.
¿Vas al curso? | به کلاس می‌روی؟
Sí, voy al curso por la tarde. | بله، عصر به کلاس می‌روم.''',
('Hoy trabajo. Ben estudia español.','چه کسی اسپانیایی درس می‌خواند؟','Ben'),
('Voy al curso en autobús.','گوینده چگونه به کلاس می‌رود؟','en autobús'))

add('positive-negative-questions',3,'pre-3 pre-8','present-tense',
'پیام مثبت را منفی و پرسشی کنم.',
'no پیش از فعل؛ no tengo libro / no tengo un libro طبق زمینه؛ آیا با آهنگ و ¿ ?؛ ¿Estudias hoy?؛ ضمیر فاعلی الزام ندارد.',
'sí=بله؛ no=نه؛ hoy=امروز؛ nada در این درس اجباری نیست',
'قاعدهٔ فرانسویِ تبدیل همهٔ حرف تعریف‌ها به de در نفی وارد اسپانیایی نشود. si با sí فرق دارد.',
'دو پیام را در سه صورت مثبت، منفی و پرسشی بنویس.',
'''¿Trabajas hoy? | امروز کار می‌کنی؟
No, hoy no trabajo. | نه، امروز کار نمی‌کنم.
¿Estudias español? | اسپانیایی درس می‌خوانی؟
Sí, estudio español. | بله، اسپانیایی درس می‌خوانم.''',
('No tengo cuaderno. Tengo un libro.','گوینده چه چیزی ندارد؟','cuaderno'),
('Hoy no trabajo. Estudio en casa.','نویسنده امروز کجا درس می‌خواند؟','en casa'))

add('question-words',3,'pre-14 pre-17','positive-negative-questions',
'برای شخص، مکان، زمان و چیز موردنیاز سؤال مناسب بسازم.',
'quién/dónde/cuándo/cómo/qué/cuánto با اَکسان پرسشی؛ ¿A qué hora …?؛ چرا برای دلیل در درس پایانی بازیابی می‌شود.',
'quién=چه کسی؛ dónde=کجا؛ cuándo=چه وقت؛ cuánto=چقدر',
'qué و cuál همیشه به یک الگوی فارسی قابل تقلیل نیستند؛ فقط نمونه‌های روشن. Qué بدون نشانه‌های پرسش در جملهٔ مستقیم ناقص است.',
'چهار سؤال با چهار واژهٔ پرسشی و پاسخ کوتاه بنویس.',
'''¿Quién es ella? | او کیست؟
Es Ana. | آنا است.
¿Dónde vive? | کجا زندگی می‌کند؟
Vive en Sevilla. | در سویا زندگی می‌کند.''',
('El curso empieza a las diez, en Madrid.','کلاس چه ساعتی شروع می‌شود؟','a las diez'),
('¿Quién viene? Lucía. ¿Dónde vive? En Toledo.','چه کسی می‌آید؟','Lucía'))

add('wants-needs',3,'pre-9 pre-3','question-words',
'خواستن، نیاز و علاقه را از هم جدا بیان کنم.',
'quiero/quieres؛ necesito/necesitas؛ me gusta + اسم مفرد یا مصدر در قالب؛ اسم ماده بدون حرف تعریف: quiero agua؛ quisiera قالب مؤدبانهٔ اختیاری.',
'querer=خواستن؛ necesitar=نیاز داشتن؛ me gusta=دوست دارم؛ agua=آب',
'نه du فرانسوی و نه «yo gusto el té». صرف کامل gustar و همهٔ ضمایرش اینجا لازم نیست؛ علاقه الزاماً سفارش نیست.',
'یک علاقه، یک نیاز و یک درخواست مؤدبانه دربارهٔ یک موقعیت بنویس.',
'''¿Qué necesitas? | چه لازم داری؟
Necesito agua. | آب لازم دارم.
¿Quieres también un café? | قهوه هم می‌خواهی؟
No, gracias. Quiero un té. | نه، ممنون. یک چای می‌خواهم.''',
('Me gusta el café, pero ahora quiero un té.','گوینده اکنون چه می‌خواهد؟','un té'),
('Ben necesita un bolígrafo. Ya tiene un cuaderno.','بن چه چیزی لازم دارد؟','un bolígrafo'))

add('ability',3,'pre-14','wants-needs',
'توانایی، امکان و ناتوانی را با مصدر بیان کنم.',
'poder: puedo/puedes/puede/podemos/podéis/pueden + مصدر؛ no puedo venir؛ برای مهارت آموخته‌شده saber هم هست اما هدف صرف کامل آن نیست.',
'poder=توانستن؛ leer=خواندن؛ venir=آمدن؛ nadar=شنا کردن',
'Puedo nadar در موقعیت امکان معتبر است؛ آن را تنها ترجمهٔ همهٔ «بلدم»ها ندان. فعل پس از poder دوباره صرف نمی‌شود.',
'دو کار ممکن و یک کار ناممکن امروز و یک درخواست کمک بنویس.',
'''¿Puedes venir hoy? | امروز می‌توانی بیایی؟
No, hoy no puedo. | نه، امروز نمی‌توانم.
¿Puedes venir mañana? | فردا می‌توانی بیایی؟
Sí, mañana puedo. | بله، فردا می‌توانم.''',
('Ben puede venir. Ana no puede venir hoy.','چه کسی امروز نمی‌تواند بیاید؟','Ana'),
('Podemos estudiar juntos. Puedes venir a las diez.','چه ساعتی می‌توانی بیایی؟','a las diez'))

add('dates-and-time',4,'pre-19 pre-20','numbers-age ability',
'ساعت، روز و تاریخ ساده را برای قرار بفهمم و بگویم.',
'Es la una / Son las dos؛ a la una / a las dos؛ y media؛ el dos de mayo؛ روزهای ماه معمولاً عدد اصلی؛ primero برای روز اول در گونه‌ها پذیرفته است.',
'hora=ساعت؛ día=روز؛ mayo=مه؛ mediodía=ظهر',
'قواعد premier فرانسوی کپی نشوند؛ ساعت گفتن با ساعت قرار فرق دارد. صورت 02/05 در این تمرین دوم مه است.',
'دو ساعت را بخوان و یک قرار با روز، تاریخ و ساعت خیالی بنویس.',
'''¿Qué hora es? | ساعت چند است؟
Son las nueve y media. | ساعت نه‌ونیم است.
¿A qué hora empieza el curso? | کلاس چه ساعتی شروع می‌شود؟
A las diez. | ساعت ده.''',
('Es la una. El curso empieza a las dos.','کلاس چه ساعتی شروع می‌شود؟','a las dos'),
('Curso: lunes 02/05, 09:30.','ساعت شروع کلاس در تابلو چیست؟','09:30'))

add('forms-information',4,'pre-2 pre-16','dates-and-time asking-help',
'نام، نام خانوادگی و اطلاعات سادهٔ یک فرم را تشخیص بدهم.',
'nombre در برابر apellido/apellidos؛ dirección، ciudad، fecha de nacimiento؛ ¿Cuál es su …? در فرم رسمی.',
'nombre=نام؛ apellidos=نام‌های خانوادگی؛ dirección=نشانی؛ fecha de nacimiento=تاریخ تولد',
'همه الزاماً یک یا دو نام خانوادگی ندارند؛ فرم تمرینی اطلاعات حساس نمی‌خواهد. tú و su رسمی در یک فرم قاطی نشوند.',
'فرمی خیالی با نام، نام خانوادگی، شهر و یک تاریخ پر کن.',
'''¿Cuál es su nombre? | نام شما چیست؟
Mi nombre es Ana. | نام من آنا است.
¿Y su apellido? | و نام خانوادگی شما؟
Martín. | مارتین.''',
('Mi nombre es Ben. Mi apellido es García.','نام خانوادگی چیست؟','García'),
('Nombre: Sara. Apellido: Martín. Ciudad: Toledo.','شهر نوشته‌شده چیست؟','Toledo'))

add('daily-routine',4,'pre-19 pre-20','forms-information present-tense',
'چند کار روزانه را با ساعت در ترتیب روشن بیان کنم.',
'me levanto / te levantas و me acuesto به‌صورت محدود؛ desayuno؛ por la mañana / por la tarde / por la noche؛ después.',
'levantarse=بلند شدن؛ desayunar=صبحانه خوردن؛ acostarse=خوابیدن؛ después=بعد',
'ضمایر بازتابی me/te حذف نشوند؛ صرف همهٔ افعال بازتابی/تغییرریشه‌ای لازم نیست. ساعت الگو، عادت همگانی نیست.',
'روزی خیالی را با چهار کار و دو ساعت توصیف کن.',
'''¿A qué hora te levantas? | چه ساعتی بلند می‌شوی؟
Me levanto a las siete. | ساعت هفت بلند می‌شوم.
¿Y después? | و بعد؟
Desayuno y voy al curso. | صبحانه می‌خورم و به کلاس می‌روم.''',
('Me levanto a las seis. Desayuno a las seis y media.','صبحانه چه ساعتی است؟','06:30'),
('Por la mañana trabajo. Por la noche estudio.','نویسنده چه زمانی درس می‌خواند؟','por la noche'))

add('weekly-schedule',4,'pre-20','daily-routine',
'برنامهٔ هفتگی و بازهٔ زمانی را بیان کنم.',
'el lunes یک دوشنبه؛ los lunes دوشنبه‌ها؛ de nueve a once؛ روزهای هفته با حرف کوچک؛ estoy libre.',
'lunes=دوشنبه؛ miércoles=چهارشنبه؛ viernes=جمعه؛ libre=آزاد',
'el/los در روزها معنی می‌سازند؛ ساعتِ شروع را به‌جای پایان نخوان. برنامه‌ها خیالی و قابل تغییرند.',
'سه روز هفته و یک بازهٔ کار/کلاس بنویس؛ یک زمان آزاد مشخص کن.',
'''¿Trabajas los lunes? | دوشنبه‌ها کار می‌کنی؟
Sí, de nueve a una. | بله، از نه تا یک.
¿Y el martes? | و سه‌شنبه؟
El martes estoy libre. | سه‌شنبه آزاد هستم.''',
('Trabajo los martes. Este viernes estoy libre.','این هفته کدام روز وقت آزاد دارد؟','viernes'),
('Curso de español: miércoles, de 9:00 a 11:00.','کلاس چه ساعتی تمام می‌شود؟','11:00'))

add('work-study',4,'pre-14 pre-19','weekly-schedule',
'دربارهٔ کلاس، کار و شروع/پایان فعالیت سؤال کنم.',
'empieza/termina در پیام کوتاه؛ tengo que + مصدر برای الزام؛ tenemos una pausa؛ سؤال ساعت بازیابی شود.',
'curso=کلاس؛ reunión=جلسه؛ pausa=استراحت؛ terminar=تمام شدن',
'tengo que با tengo un libro فرق دارد؛ مصدر را صرف نکن. هدف اینجا محیط کلاس/کار است، نه همهٔ شغل‌ها.',
'دو جمله دربارهٔ کار/کلاس و یک سؤال زمان جلسه بنویس.',
'''¿A qué hora empieza el curso? | کلاس چه ساعتی شروع می‌شود؟
A las nueve. | ساعت نه.
¿Y a qué hora termina? | و چه ساعتی تمام می‌شود؟
A las once. Después tengo que trabajar. | ساعت یازده. بعد باید کار کنم.''',
('Hoy tengo que estudiar. El curso termina a las doce.','کلاس چه ساعتی تمام می‌شود؟','a las doce'),
('Reunión: 10:00. Pausa: 11:00.','استراحت چه ساعتی است؟','11:00'))

add('past-events',4,'pre-19 pre-20','work-study positive-negative-questions',
'کارهای همین امروز و تغییر یک برنامه را با زمان حال روشن کنم.',
'شناسهٔ قدیمی past-events حفظ می‌شود، اما محتوای واقعی این درس حال است: hoy trabajo / hoy no estudio؛ en cambio در این سطح اجباری نیست.',
'hoy=امروز؛ ahora=اکنون؛ en casa=در خانه؛ por la tarde=عصر',
'از نام فنی درس، زمان گذشته استنباط نشود. pretérito perfecto/indefinido و contraste زمان‌ها در این درس هدف نیستند؛ عنوان فعلی «کارهای امروز» حفظ شود.',
'سه کار امروز را بنویس؛ یک کار را منفی و یک زمان آزاد برای امروز مشخص کن.',
'''¿Trabajas hoy, Ben? | بن، امروز کار می‌کنی؟
Sí, trabajo por la mañana. | بله، صبح کار می‌کنم.
¿Estudias por la tarde? | عصر درس می‌خوانی؟
No, hoy estoy libre por la tarde. | نه، امروز عصر آزاد هستم.''',
('Hoy trabajo en casa. Por la tarde estudio español.','گوینده امروز کجا کار می‌کند؟','en casa'),
('Hoy: curso a las diez. No trabajo. Estoy libre a las cinco.','چه ساعتی وقت آزاد دارد؟','a las cinco'))

add('instructions',4,'pre-14 pre-4','past-events asking-help',
'دستور سادهٔ کلاسی را بفهمم و اجرای آن را تأیید کنم.',
'فرمول‌های رسمی usted: abra/cierre/lea/escriba/escuche/repita؛ مصدر پس از puede؛ تفسیر امر در موقعیت.',
'abrir=بازکردن؛ cerrar=بستن؛ leer=خواندن؛ escribir=نوشتن',
'این قالب‌ها مجوز تدریس کامل subjuntivo نیستند. دستورهای tú مانند abre با usted در یک صحنه مخلوط نشوند.',
'سه دستور کلاسی مؤدبانه و یک درخواست روشن‌سازی بنویس.',
'''Abra el libro, por favor. | لطفاً کتاب را باز کنید.
¿En qué página? | در کدام صفحه؟
En la página dos. Lea el texto. | در صفحهٔ دو. متن را بخوانید.
De acuerdo. | بسیار خوب.''',
('Escriba su nombre. Después lea el texto.','اولین کار چیست؟','نوشتن نام'),
('Ejercicio 2: escuche y repita.','دو کار خواسته‌شده کدام‌اند؟','گوش‌کردن و تکرارکردن'))

add('location',5,'pre-17 pre-16','instructions feelings',
'جای شخص یا شیء مشخص را بپرسم و بگویم.',
'está/están برای مکان مشخص؛ ¿Dónde está el libro?؛ aquí/allí؛ مکان اشیا با ser معرفی نشود.',
'habitación=اتاق؛ cocina=آشپزخانه؛ baño=حمام/دستشویی؛ aquí=اینجا',
'برای مکان رخدادها استثنای ser وجود دارد، اما هدف این درس مکان اشخاص و اشیاست؛ قاعدهٔ «مکان همیشه estar» مطلق نشود.',
'جای سه چیز مشخص را بنویس و دو سؤال مکان بساز.',
'''¿Dónde está el libro? | کتاب کجاست؟
Está en la habitación. | در اتاق است.
¿Y la bolsa? | و کیف؟
Está en la cocina. | در آشپزخانه است.''',
('La bolsa está en la cocina. El libro está en la habitación.','کیف کجاست؟','en la cocina'),
('El baño está aquí. La cocina está allí.','چه مکانی اینجا است؟','el baño'))

add('prepositions',5,'pre-17','location',
'رابطهٔ مکانی دو وسیله را دقیق بیان کنم.',
'encima de/debajo de/dentro de/delante de/detrás de/al lado de؛ de+el=del؛ a+el=al در عبارت‌های لازم.',
'encima=روی؛ debajo=زیر؛ detrás=پشت؛ al lado=کنار',
'de la به del تبدیل نمی‌شود. جای وسیله با نقشه/تصویر یکی باشد؛ اینجا مقصد حرکت هدف نیست.',
'چهار رابطهٔ مکانی برای یک میز، کیف، کتاب و صندلی فرضی بساز.',
'''¿Dónde está el bolígrafo? | خودکار کجاست؟
Está encima del libro. | روی کتاب است.
¿Y la bolsa? | و کیف؟
Está debajo de la mesa. | زیر میز است.''',
('El bolígrafo está al lado del libro. La bolsa está detrás de la silla.','کیف کجای صندلی است؟','detrás de la silla'),
('El cuaderno está dentro de la bolsa. La lámpara está encima de la mesa.','دفتر کجاست؟','dentro de la bolsa'))

add('home-furniture',5,'pre-16 pre-17','prepositions',
'وجود وسایل و جای وسیلهٔ مشخص را متمایز توصیف کنم.',
'hay برای وجود: hay una cama؛ no hay mesa؛ la cama está … برای شیء مشخص؛ hay در این کاربرد مفرد/جمع تغییر نمی‌کند.',
'cama=تخت؛ lámpara=چراغ؛ ventana=پنجره؛ salón=نشیمن',
'Hay la cama در معرفی معمولِ این درس به‌جای la cama está ننشیند؛ hay با tenerِ مالکیت یکی نیست.',
'اتاقی خیالی را با دو hay، یک no hay و دو مکانِ مشخص توصیف کن.',
'''¿Qué hay en tu habitación? | در اتاقت چه هست؟
Hay una cama y una mesa. | یک تخت و یک میز هست.
¿Dónde está la cama? | تخت کجاست؟
Está al lado de la ventana. | کنار پنجره است.''',
('En el salón hay dos sillas, pero no hay mesa.','چه چیزی در نشیمن نیست؟','mesa'),
('La habitación es pequeña. La cama está al lado de la puerta.','تخت کنار چیست؟','la puerta'))

add('ordering-food',6,'pre-18 pre-9','home-furniture wants-needs',
'خوراک یا نوشیدنی ساده با مقدار و درخواست روشن سفارش بدهم.',
'Quiero / Quisiera / Para mí در قالب مؤدبانه؛ pan/agua بدون partitif فرانسوی؛ un vaso de agua؛ el agua fría، اسم هنوز مؤنث است.',
'pan=نان؛ sopa=سوپ؛ azúcar=شکر؛ leche=شیر؛ vaso=لیوان',
'دستور ایمنی آلرژی یا تضمین گیاه‌خواری صادر نشود؛ con/sin را روشن بگو. el agua را نشانهٔ مذکر بودن آب ندان.',
'یک سفارش شامل خوراک، نوشیدنی و یک درخواست con/sin بنویس.',
'''¿Qué desea tomar? | چه میل دارید؟
Una sopa y un té, por favor. | یک سوپ و یک چای، لطفاً.
¿El té con azúcar? | چای با شکر؟
No, sin azúcar, gracias. | نه، بدون شکر، ممنون.''',
('Quisiera pan y un té sin azúcar.','چه چیزی در چای نمی‌خواهد؟','azúcar'),
('Menú: sopa 5 €, pan 2 €, agua 1 €.','سوپ چقدر قیمت دارد؟','5 €'))

add('cafe',6,'pre-18 pre-4','ordering-food',
'سفارش، درخواست صورت‌حساب و پرداخت را به نتیجه برسانم.',
'La cuenta, por favor؛ ¿Puedo pagar?؛ juntos/por separado؛ son cinco euros؛ usted در نقش مشتری/کارمند ثابت.',
'cuenta=صورت‌حساب؛ pagar=پرداخت؛ juntos=با هم؛ por separado=جدا',
'تحویل سفارش پس از رد همان سفارش رخ ندهد؛ صحنه بسته شود. قیمت‌ها خیالی‌اند و انعام هدف اجباری نیست.',
'یک سفارش کوتاه و دو نوبت درخواست صورت‌حساب/پرداخت بنویس.',
'''Buenos días. ¿Qué desea? | صبح بخیر. چه میل دارید؟
Un café, por favor. | یک قهوه، لطفاً.
Aquí tiene su café. | بفرمایید قهوهٔ شما.
Gracias. La cuenta, por favor. | ممنون. صورت‌حساب، لطفاً.''',
('Un té, por favor. Quiero pagar ahora.','مشتری چه سفارش داده است؟','un té'),
('Café: 3 €. Té: 2 €. Agua: 1 €.','ارزان‌ترین نوشیدنی کدام است؟','agua'))

add('shopping-payment',6,'pre-4 pre-5','cafe numbers-age',
'قیمت را بپرسم، کالا انتخاب و روش پرداخت را تأیید کنم.',
'¿Cuánto cuesta? / cuesta؛ me llevo در قالب خرید؛ en efectivo / con tarjeta؛ ¿Puedo pagar …?؛ usted در صحنه.',
'precio=قیمت؛ euro=یورو؛ efectivo=نقد؛ tarjeta=کارت',
'نقد و کارت از یک تابلو هم‌زمان برداشت نشوند؛ قیمت عددی با پاسخ درست هماهنگ باشد. خرید واقعی انجام نمی‌شود.',
'گفت‌وگوی قیمت، انتخاب کالا و یک روش پرداخت بنویس.',
'''¿Cuánto cuesta este cuaderno? | این دفتر چقدر قیمت دارد؟
Tres euros. | سه یورو.
¿Puedo pagar con tarjeta? | می‌توانم با کارت پرداخت کنم؟
Sí, claro. | بله، حتماً.''',
('El libro cuesta cinco euros. Puede pagar con tarjeta.','قیمت کتاب چقدر است؟','5 €'),
('Bolígrafo: 2 €. Solo pago en efectivo.','کدام روش پرداخت پذیرفته است؟','en efectivo'))

add('supermarket',6,'pre-9 pre-5','shopping-payment prepositions',
'فهرست خرید، مقدار و جای کالا را بفهمم.',
'un kilo de manzanas؛ una botella de agua؛ ¿Tiene …? خطاب رسمی؛ no tenemos؛ شمار و مقدار از هم جدا.',
'manzana=سیب؛ botella=بطری؛ kilo=کیلو؛ huevos=تخم‌مرغ‌ها',
'اسپانیایی بعد از مقدار de دارد، اما قاعدهٔ نفی فرانسوی de اینجا وارد نمی‌شود. سبد تمرین قیمت واقعی نیست.',
'فهرست چهار قلم خرید با دو مقدار و یک پرسش مکان بنویس.',
'''¿Dónde está la leche? | شیر کجاست؟
Al lado del pan. | کنار نان.
¿Tiene huevos? | تخم‌مرغ دارید؟
No, hoy no tenemos. | نه، امروز نداریم.''',
('Un kilo de manzanas cuesta tres euros. La leche está al lado del pan.','یک کیلو سیب چند یورو است؟','3 €'),
('Lista: tres manzanas, una botella de agua y pan.','چند سیب در فهرست است؟','tres'))

add('clothes-shopping',6,'pre-13 pre-12','supermarket colors',
'لباس را با رنگ و سایز بخواهم و دربارهٔ پرو سؤال کنم.',
'¿Tiene esta camisa en azul?؛ talla؛ ¿Puedo probármela? در قالب با مرجع camisa؛ me queda pequeña؛ صفت مؤنث.',
'camisa=پیراهن؛ chaqueta=کاپشن؛ talla=سایز؛ probador=اتاق پرو',
'تحلیل کامل ضمایر پی‌بستی اینجا لازم نیست؛ مرجع la روشن باشد. مقایسهٔ بزرگ‌تر در درس مقایسه می‌آید.',
'یک درخواست رنگ/سایز، اجازهٔ پرو و نتیجهٔ اندازه را بنویس.',
'''Busco una camisa azul. | دنبال یک پیراهن آبی می‌گردم.
¿Qué talla necesita? | چه سایزی لازم دارید؟
La M. ¿Puedo probármela? | مدیوم. می‌توانم آن را پرو کنم؟
Sí, el probador está allí. | بله، اتاق پرو آنجا است.''',
('Busco una chaqueta en talla L, en azul.','سایز موردنیاز چیست؟','L'),
('Camisa: roja, talla S, 20 €.','رنگ پیراهن چیست؟','roja'))

add('preferences',6,'pre-3 pre-9','clothes-shopping wants-needs',
'علاقه و ترجیح خود را با دو گزینه بیان کنم.',
'me gusta + مفرد/مصدر؛ me gustan + جمع؛ te gusta در سؤال؛ prefiero/prefieres برای ترجیح؛ اسم کلی معمولاً با حرف تعریف.',
'preferir=ترجیح دادن؛ arroz=برنج؛ galleta=بیسکویت؛ café=قهوه',
'me gustan los libros نه me gusta los libros. شمار با چیز موردعلاقه هماهنگ است، نه با yo؛ صرف همهٔ ضمایر gustar لازم نیست.',
'دو علاقه با مفرد/جمع و دو ترجیح میان گزینه‌ها بنویس.',
'''¿Prefieres té o café? | چای را ترجیح می‌دهی یا قهوه؟
Prefiero té. ¿Y tú? | چای را ترجیح می‌دهم. تو چطور؟
A mí me gusta el café. ¿Te gustan las galletas? | من قهوه دوست دارم. بیسکویت‌ها را دوست داری؟
Sí, me gustan mucho. | بله، خیلی دوستشان دارم.''',
('Prefiero café. No me gusta mucho el té.','گوینده چه چیزی را ترجیح می‌دهد؟','café'),
('Ben: Me gusta el pan. Sara: Prefiero arroz.','سارا چه چیزی را ترجیح می‌دهد؟','arroz'))

add('comparisons',6,'pre-12','preferences descriptions',
'دو گزینهٔ آشنا را با صفت مقایسه کنم.',
'más/menos + صفت + que؛ más barato que؛ صفت با اسم هماهنگ؛ mejor/peor و عالی فعلاً اجباری نیستند.',
'barato=ارزان؛ caro=گران؛ más=بیشتر؛ menos=کمتر',
'más با اَکسان است. grande را مکانیکی به más grande در هر کاربرد تعمیم نده؛ فقط اندازهٔ اشیای این بانک.',
'دو کالا و دو اتاق فرضی را با قیمت یا اندازه مقایسه کن.',
'''¿Qué libro es más barato? | کدام کتاب ارزان‌تر است؟
Este es más barato que ese. | این از آن ارزان‌تر است.
¿Y esta bolsa? | و این کیف؟
Es más pequeña que mi bolsa. | از کیف من کوچک‌تر است.''',
('El libro cuesta diez euros. El cuaderno cuesta dos euros. El cuaderno es más barato.','کدام ارزان‌تر است؟','el cuaderno'),
('La habitación de Toledo es más pequeña que la habitación de Madrid.','کدام اتاق کوچک‌تر است؟','la habitación de Toledo'))

add('leisure',7,'pre-3','comparisons preferences',
'از فعالیت موردعلاقه و اوقات فراغت بگویم.',
'me gusta + مصدر؛ برای شخص سوم A Ben le gusta leer در قالب؛ los fines de semana؛ escuchar música بدون de partitif فرانسوی؛ me gusta pasear.',
'música=موسیقی؛ pasear=قدم‌زدن؛ nadar=شنا؛ dibujar=نقاشی‌کشیدن',
'علاقه را با توانایی یکسان ندان؛ متن فهم شکل‌های تازهٔ فعالیت‌ها را اول آموزش بدهد.',
'سه علاقه و یک سؤال دربارهٔ آخر هفته بنویس.',
'''¿Qué te gusta hacer? | دوست داری چه کار کنی؟
Me gusta leer y escuchar música. | مطالعه و گوش‌دادن به موسیقی را دوست دارم.
¿Te gusta pasear? | قدم‌زدن را دوست داری؟
Sí, paseo los domingos. | بله، یکشنبه‌ها قدم می‌زنم.''',
('Me gusta escuchar música. A Ben le gusta leer.','بن چه کاری را دوست دارد؟','leer'),
('Ana pasea. Sara dibuja los domingos.','چه کسی یکشنبه‌ها نقاشی می‌کند؟','Sara'))

add('weather',7,'pre-7','leisure feelings',
'هوای امروز و فصل را ساده توصیف کنم.',
'hace calor/frío؛ hace sol؛ llueve؛ está nublado در قالب؛ اینجا آیندهٔ هوا هدف نیست.',
'calor=گرما؛ frío=سرما؛ lluvia=باران؛ verano=تابستان؛ invierno=زمستان',
'Tengo calor احساس شخص است و hace calor هوا؛ estoy frío را به‌جای هوا به کار نبر. پیش‌بینی واقعی ارائه نمی‌شود.',
'هوای دو روز فرضی و یک فصل را در سه جمله توصیف کن.',
'''¿Qué tiempo hace hoy? | امروز هوا چطور است؟
Hace frío. | هوا سرد است.
¿Llueve? | باران می‌بارد؟
No, hace sol. | نه، آفتابی است.''',
('Hoy hace calor. No llueve.','دمای هوا چگونه توصیف شده است؟','calor'),
('Lunes: lluvia. Martes: sol.','کدام روز بارانی است؟','lunes'))

add('connectors',7,'pre-21','weather positive-negative-questions',
'دو پیام کوتاه را با افزودن، تضاد یا انتخاب وصل کنم.',
'y/pero/o؛ e قبل از صدای /i/ و u قبل از /o/ فقط در صورت نیاز نمونه، نه بار اجباری این بانک؛ tengo tiempo.',
'y=و؛ pero=ولی؛ o=یا؛ tiempo=وقت/هوا طبق متن',
'پیوندها جای معنی را نمی‌گیرند؛ گزینهٔ o با پرسش مکان dónde یکی نیست. porque در درس دلیل تحلیل می‌شود.',
'سه جفت جمله با y، pero و o بساز؛ اطلاعاتشان سازگار باشد.',
'''¿Quieres té o café? | چای می‌خواهی یا قهوه؟
Quiero té, pero no tengo tiempo. | چای می‌خواهم، ولی وقت ندارم.
Yo tengo tiempo y estoy libre. | من وقت دارم و آزاد هستم.
Podemos tomar té mañana. | می‌توانیم فردا چای بنوشیم.''',
('Tengo tiempo, pero Ben trabaja. Estudiamos juntos mañana.','چه زمانی با هم درس می‌خوانند؟','mañana'),
('Me gusta leer, pero hoy no tengo tiempo.','نویسنده امروز چه چیزی ندارد؟','tiempo'))

add('future-plans',7,'pre-20','connectors present-tense',
'برنامهٔ آیندهٔ نزدیک را با زمان روشن بگویم.',
'ir a + مصدر: voy a estudiar / vamos a tomar؛ a حذف نشود؛ voy al curso رفتن به مکان است و voy a estudiar برنامهٔ فعالیت.',
'mañana=فردا؛ esta noche=امشب؛ el sábado=شنبه؛ plan=برنامه',
'صورت آیندهٔ ساده و همهٔ ارزش‌های ir a اجباری نیستند. voy a estudio غلط است؛ مصدر را نگه دار.',
'سه برنامهٔ فردا/آخر هفته و یک سؤال برنامه بنویس.',
'''¿Qué vas a hacer mañana? | فردا چه کار خواهی کرد؟
Voy a estudiar español. | قرار است اسپانیایی درس بخوانم.
¿Vamos a estudiar juntos? | قرار است با هم درس بخوانیم؟
Sí, a las diez. | بله، ساعت ده.''',
('Mañana voy a trabajar. Esta noche voy a leer.','امشب چه کاری خواهد کرد؟','leer'),
('El sábado vamos a tomar un café. El domingo voy a estudiar.','کدام روز قهوه می‌نوشند؟','sábado'))

add('invitations',7,'pre-20 pre-3','future-plans',
'دعوت را بپذیرم یا مؤدبانه رد و زمان جایگزین تعیین کنم.',
'¿Quieres tomar …? / ¿Te apetece …? در قالب؛ lo siento، no puedo؛ ¿Te viene bien …?؛ تأیید روز و ساعت.',
'invitar=دعوت کردن؛ lo siento=متأسفم؛ de acuerdo=موافقم؛ juntos=با هم',
'نه گفتن مجاز است؛ دلیل خصوصی لازم نیست. زمان ردشده نباید در پایان زمان نهایی محسوب شود.',
'یک دعوت، یک رد و یک توافق تازه با روز و ساعت بنویس.',
'''¿Quieres tomar un café mañana? | می‌خواهی فردا قهوه بنوشیم؟
Lo siento, mañana no puedo. | متأسفم، فردا نمی‌توانم.
¿Te viene bien el sábado? | شنبه برایت مناسب است؟
Sí, el sábado a las diez. | بله، شنبه ساعت ده.''',
('El viernes no puedo. El domingo estoy libre para un café.','کدام روز برای قهوه آزاد است؟','domingo'),
('Hola, Ben. ¿Nos vemos el lunes a las quince? Ana','ملاقات چه ساعتی پیشنهاد شده؟','15:00'))

add('suggestions',7,'pre-7','invitations ability',
'پیشنهاد کار مشترک بدهم و پاسخ بدهم.',
'Podemos + مصدر؛ ¿Vamos a …? در پیشنهاد؛ ¿Por qué no …? قالب؛ buena idea / hoy no puedo.',
'parque=پارک؛ biblioteca=کتابخانه؛ cine=سینما؛ idea=فکر',
'این درس subjuntivo پیشنهاد نیست؛ vamos در پیشنهاد با توافق و زمینه روشن شود، نه ترجمهٔ همیشه یکسان.',
'دو پیشنهاد و پاسخ پذیرش و رد مؤدبانه برای آن‌ها بنویس.',
'''¿Vamos a la biblioteca? | به کتابخانه برویم؟
Buena idea. Podemos estudiar juntos. | فکر خوبی است. می‌توانیم با هم درس بخوانیم.
¿A las cuatro? | ساعت چهار؟
Sí, de acuerdo. | بله، موافقم.''',
('Hace buen tiempo. Podemos ir al parque juntos.','پیشنهاد رفتن به کجاست؟','al parque'),
('Podemos estudiar juntos en la biblioteca a las cuatro.','کار پیشنهادی چیست؟','estudiar juntos'))

add('social-chat',7,'pre-21','suggestions profile leisure',
'آشنایی کوتاه را با موضوع مشترک و دعوت ادامه بدهم.',
'بازیابی نام/شهر/علاقه؛ nuevo/nueva در اشاره به شخص؛ también برای نقطهٔ مشترک؛ دعوت با زمان روشن.',
'compañero=هم‌کلاسی؛ nuevo=تازه‌وارد مرد؛ nueva=تازه‌وارد زن؛ también=همچنین',
'اطلاعات یک شخصیت در صحنه ثابت بماند؛ گفت‌وگو فهرست سؤال‌های نامرتبط نباشد. صفت گوینده با جنس معرفی‌شده سازگار باشد.',
'آشنایی چهارنوبتی از شهر یا کلاس به یک علاقهٔ مشترک و دعوت بساز.',
'''Hola, soy Lucía. ¿Eres nueva en el curso? | سلام، من لوسیا هستم. در کلاس تازه‌وارد هستی؟ (خطاب به زن)
Sí, me llamo Sara. Me gusta el español. | بله، اسمم سارا است. اسپانیایی را دوست دارم.
A mí también. ¿Tomamos un café mañana? | من هم همین‌طور. فردا قهوه بنوشیم؟
Sí, a las diez estoy libre. | بله، ساعت ده آزاد هستم.''',
('Hola, soy Sara. Vivo en Toledo y me gusta leer.','سارا کجا زندگی می‌کند؟','Toledo'),
('Amir y Ben estudian juntos el martes a las diez.','زمان درس‌خواندن مشترک چیست؟','martes a las diez'))

add('directions',8,'pre-17','social-chat prepositions instructions',
'مسیر کوتاه تا یک مکان را با راست/چپ بفهمم و بدهم.',
'¿Dónde está …?؛ Siga recto / gire a la derecha/izquierda در خطاب usted؛ cerca/lejos؛ کنترل یک مسیر ساده.',
'derecha=راست؛ izquierda=چپ؛ recto=مستقیم؛ estación=ایستگاه',
'دستور رسمی siga با tú sigues یکی نیست. به نقشهٔ فرضی وفادار بمان؛ جای ثابت و جهت حرکت فرق دارند.',
'مسیر سه‌گامی از کلاس تا کتابخانهٔ خیالی بنویس.',
'''Perdone, ¿dónde está la estación? | ببخشید، ایستگاه کجاست؟
Siga recto. | مستقیم بروید.
¿Y después? | و بعد؟
Gire a la izquierda. | به چپ بپیچید.''',
('Siga recto y después gire a la derecha. Allí está Correos.','پس از مستقیم رفتن به کدام سمت می‌پیچد؟','a la derecha'),
('El banco está a la izquierda de Correos.','بانک نسبت به ادارهٔ پست کجاست؟','a la izquierda'))

add('metro-directions',8,'pre-17 pre-19','directions dates-and-time',
'مسیر پیاده تا ورودی مترو را با نشانهٔ راه و تأیید مقصد کامل کنم.',
'¿Cómo llego a …?؛ hasta برای حد مسیر؛ delante de و junto a به معنی کنار؛ Siga/Gire قالب رسمی؛ این درس مسیر تا ورودی است، نه همهٔ شبکهٔ مترو.',
'metro=مترو؛ entrada=ورودی؛ semáforo=چراغ راهنمایی؛ plaza=میدان',
'این درس ۲۰ردیفی صرفاً تکرار جهت‌ها نیست؛ نشانه، ترتیب و تأیید ورودی افزوده شود. نقشهٔ واقعی شهر ادعا نمی‌شود.',
'مسیر تا متروی خیالی را با دو نشانه و یک تأیید پایانی در شش نوبت بنویس.',
'''Perdone, ¿cómo llego al metro? | ببخشید، چطور به مترو برسم؟
Siga recto hasta el semáforo. | تا چراغ راهنمایی مستقیم بروید.
¿Y después? | و بعد؟
Gire a la derecha. La entrada está delante de la plaza. | به راست بپیچید. ورودی جلوی میدان است.''',
('Siga recto hasta el semáforo. La entrada del metro está a la izquierda.','ورودی مترو کدام سمت است؟','a la izquierda'),
('Metro: entrada junto a la biblioteca. No está junto al banco.','ورودی کنار کدام مکان است؟','la biblioteca'))

add('public-transport',8,'pre-17 pre-19','metro-directions',
'مقصد، زمان حرکت و محل پیاده‌شدن را بفهمم.',
'¿Este autobús va a …?؛ bajo aquí / baje en la próxima parada قالب رسمی؛ en autobús/en taxi؛ salida در تابلو.',
'autobús=اتوبوس؛ parada=ایستگاه اتوبوس؛ próxima=بعدی؛ centro=مرکز',
'estación و parada بسته به وسیله فرق کاربرد دارند؛ آدرس واقعی داده نمی‌شود. baje با فعل سادهٔ خبری قاطی نشود.',
'یک پرسش مقصد، یک ساعت حرکت و یک دستور پیاده‌شدن بنویس.',
'''¿Este autobús va al centro? | این اتوبوس به مرکز شهر می‌رود؟
Sí, va al centro. | بله، به مرکز شهر می‌رود.
¿Dónde bajo? | کجا پیاده شوم؟
En la próxima parada. | در ایستگاه بعدی.''',
('Este autobús va a la estación. Baje en la próxima parada.','کجا باید پیاده شود؟','en la próxima parada'),
('Autobús 5: estación–centro. Salida: 08:10.','اتوبوس چه ساعتی حرکت می‌کند؟','08:10'))

add('travel-tickets',8,'pre-19 pre-5','public-transport shopping-payment',
'بلیت ساده بخواهم و مقصد، ساعت و سکو را جدا تشخیص بدهم.',
'un billete a/para Madrid؛ solo ida / ida y vuelta؛ sale a las … del andén …؛ es-ES با billete.',
'billete=بلیت؛ ida=رفت؛ vuelta=برگشت؛ andén=سکو',
'boleto در مناطق دیگر غلط نیست؛ این بانک اسپانیا را یکدست نگه می‌دارد. ساعت و سکو اطلاعات جدا هستند.',
'یک درخواست بلیت و دو سؤال ساعت/سکو با اطلاعات خیالی بنویس.',
'''Un billete a Toledo, por favor. | یک بلیت به تولدو، لطفاً.
¿Solo ida o ida y vuelta? | یک‌طرفه یا رفت‌وبرگشت؟
Solo ida. ¿De qué andén sale? | یک‌طرفه. از کدام سکو حرکت می‌کند؟
Del andén dos. | از سکوی دو.''',
('El tren a Madrid sale a las once, del andén tres.','سکوی حرکت کدام است؟','andén tres'),
('Tren a Sevilla: 14:30, andén 4.','مقصد قطار چیست؟','Sevilla'))

add('hotel-stay',8,'pre-19 pre-2','travel-tickets forms-information',
'رزرو خیالی را معرفی و دربارهٔ اتاق و صبحانه سؤال کنم.',
'Tengo una reserva a nombre de …؛ para dos noches؛ ¿Está incluido el desayuno? در قالب؛ ساعت de … a ….',
'reserva=رزرو؛ noche=شب؛ llave=کلید؛ desayuno=صبحانه',
'در این الگو estar incluido یک قالب است، نه تدریس مجهول کامل. اطلاعات کارت بانکی/گذرنامهٔ واقعی لازم نیست.',
'نام رزرو، مدت اقامت و دو سؤال دربارهٔ اتاق/صبحانه بنویس.',
'''Buenos días. Tengo una reserva. | صبح بخیر. رزرو دارم.
¿A qué nombre? | به چه نامی؟
A nombre de Sara Martín. | به نام سارا مارتین.
Aquí tiene la llave de la habitación doce. | بفرمایید کلید اتاق دوازده.''',
('Tengo una reserva a nombre de Martín para tres noches.','رزرو برای چند شب است؟','tres noches'),
('Desayuno: de 7:00 a 10:00. Habitación 12.','صبحانه چه ساعتی شروع می‌شود؟','07:00'))

add('polite-requests',9,'pre-4','hotel-stay ability',
'برای اجازه یا کمک درخواست مؤدبانه کنم.',
'¿Puedo + مصدر? برای اجازه؛ ¿Puede …? درخواست رسمی؛ ¿Podría …? قالب مؤدبانه بدون صرف کامل شرطی؛ me در ayudarme.',
'ayudar=کمک؛ sentarse=نشستن؛ preguntar=پرسیدن؛ despacio=آهسته',
'محترمانه بودن فقط با ضمیر نیست؛ لحن و por favor مهم‌اند. ضمایر بازتابی در ¿Puedo sentarme? در قالب معرفی شوند.',
'دو درخواست رسمی و دو سؤال اجازه در موقعیت کلاس/هتل بنویس.',
'''¿Podría ayudarme, por favor? | می‌شود لطفاً کمکم کنید؟
Sí, claro. | بله، حتماً.
¿Puedo sentarme aquí? | می‌توانم اینجا بنشینم؟
Sí, esta silla está libre. | بله، این صندلی خالی است.''',
('¿Puedo sentarme aquí? Sí, esta silla está libre.','اجازهٔ چه کاری خواسته شده؟','sentarse aquí'),
('¿Podría hablar más despacio, por favor?','درخواست از مخاطب چیست؟','آهسته‌تر صحبت‌کردن'))

add('phone-messages',9,'pre-2 pre-5','polite-requests future-plans',
'خودم را پشت تلفن معرفی و زمان تماس بعدی را روشن کنم.',
'¿Dígame? برای پاسخ تماس در اسپانیا؛ Soy … / ¿Puedo dejar un mensaje?؛ voy a llamar؛ llámeme قالب رسمی محدود.',
'llamar=تماس گرفتن؛ mensaje=پیام؛ dejar=گذاشتن؛ móvil=تلفن همراه',
'Buenas را با همهٔ مناطق یکسان فرض نکن؛ شماره و زمان با تکرار تأیید شوند. اطلاعات تماس واقعی لازم نیست.',
'پیامی سه‌جمله‌ای با نام خیالی، موضوع و ساعت تماس بنویس.',
'''¿Dígame? | بفرمایید؟ (پاسخ تلفن، اسپانیا)
Hola, soy Ana. ¿Puedo dejar un mensaje? | سلام، من آنا هستم. می‌توانم پیام بگذارم؟
Sí, claro. | بله، حتماً.
Voy a llamar mañana a las diez. | فردا ساعت ده تماس خواهم گرفت.''',
('Hola, soy Ben Martín. Voy a llamar mañana a las diez.','تماس فردا چه ساعتی است؟','a las diez'),
('Hola, Ben. Soy Ana. ¿Puedes llamarme a las diecisiete?','درخواست تماس برای چه ساعتی است؟','17:00'))

add('doctor-symptoms',9,'pre-7 pre-9','phone-messages feelings dates-and-time',
'علامت ساده و نیاز به نوبت پزشکی را بیان کنم.',
'me duele la cabeza / la garganta؛ tengo fiebre؛ desde ayer / desde esta mañana؛ necesito una cita؛ no me encuentro bien در قالب.',
'cabeza=سر؛ garganta=گلو؛ fiebre=تب؛ cita=نوبت',
'me duele سر/گلو با tener fiebre یکی نیست؛ جمع me duelen فقط در صورت آموزش جدا. این درس تشخیص، دارو یا توصیهٔ درمانی نمی‌دهد.',
'برای شخصیتی خیالی دو علامت، زمان شروع و درخواست نوبت بنویس.',
'''Buenos días. Necesito una cita. | صبح بخیر. نوبت لازم دارم.
¿Qué le pasa? | چه مشکلی دارید؟
Me duele la cabeza. | سردرد دارم.
Tenemos una cita libre a las diez. | ساعت ده نوبت خالی داریم.''',
('Me duele la garganta desde esta mañana. Necesito una cita.','کدام عضو درد می‌کند؟','la garganta'),
('Tengo fiebre. No me encuentro bien.','چه علامتی صریحاً ذکر شده؟','fiebre'))

add('reasons',10,'pre-21','doctor-symptoms connectors past-events',
'دلیل و نتیجهٔ ساده را با جملهٔ کوتاه مرتبط بیان کنم.',
'¿Por qué …? در سؤال؛ porque در پاسخ؛ por eso برای نتیجه؛ ترتیب جملهٔ معمول حفظ می‌شود؛ مصدر پس از tener que.',
'por qué=چرا؛ porque=چون؛ por eso=به همین دلیل؛ quedarse=ماندن',
'por qué و porque املای یکسان ندارند؛ فعل مانند weil آلمانی به آخر جمله نمی‌رود. دلیل می‌تواند غیرشخصی و خیالی باشد.',
'دو دلیل و یک نتیجه برای انتخاب یا رد دعوت خیالی بنویس.',
'''¿Por qué no puedes venir hoy? | چرا امروز نمی‌توانی بیایی؟
Porque tengo que trabajar. | چون باید کار کنم.
Entonces, ¿nos vemos mañana? | پس، فردا همدیگر را ببینیم؟
Sí, mañana estoy libre. | بله، فردا آزاد هستم.''',
('Me quedo en casa porque tengo fiebre.','چرا در خانه می‌ماند؟','porque tiene fiebre'),
('Llueve. Por eso nos quedamos aquí.','نتیجهٔ باران چیست؟','nos quedamos aquí'))

add('connected-conversation',10,'pre-21','reasons social-chat invitations metro-directions',
'از آشنایی به دعوت، رفع مانع و توافق روشن برسم.',
'بازیابی نام، شهر، علاقه، دعوت، مکان و ساعت؛ ساخت تازهٔ اجباری ندارد؛ جنس و خطاب ثابت.',
'نام، شهر، café، día و hora؛ بازیابی واژگان پیشین بدون فهرست تازهٔ سنگین',
'گفت‌وگوی فعلی اسپانیایی از ابتدا منسجم بود؛ اصلاح طرح به معنی ادعای خرابی آن نیست. شرح نامربوط siéntese از توضیح پایانی حذف/جدا شود.',
'گفت‌وگوی شش تا هشت‌نوبتی با اطلاعات خیالی بنویس؛ زمان ردشده و توافق نهایی روشن باشند.',
'''Hola, soy Lucía. ¿Eres nueva en el curso? | سلام، من لوسیا هستم. در کلاس تازه‌وارد هستی؟ (خطاب به زن)
Sí, me llamo Sara. Vivo en Madrid. | بله، اسمم سارا است. در مادرید زندگی می‌کنم.
Yo también. ¿Tomamos un café mañana? | من هم همین‌طور. فردا قهوه بنوشیم؟
Mañana no puedo. ¿Y el sábado? | فردا نمی‌توانم. شنبه چطور؟''',
('Lucía y Sara no pueden el viernes. Van a tomar un café el sábado a las once.','زمان نهایی قهوه چه ساعتی است؟','a las once'),
('Lucía: ¿El sábado a las diez en el café? Sara: Sí, de acuerdo. ¡Hasta el sábado!','روز نهایی ملاقات چیست؟','sábado'))
LESSONS[-1]['scene'] += [
 dict(role='partner',es='Sí, el sábado a las diez en el café.',fa='بله، شنبه ساعت ده در کافه.'),
 dict(role='learner',es='De acuerdo. ¿Dónde está el café?',fa='موافقم. کافه کجاست؟'),
 dict(role='partner',es='Al lado de la biblioteca. ¡Hasta el sábado!',fa='کنار کتابخانه. تا شنبه!'),
 dict(role='learner',es='Muy bien, ¡hasta el sábado!',fa='بسیار خوب، تا شنبه!')]
for i,l in enumerate(LESSONS):
    l['proposedIndex']=i+1
    l['transferToIds']=[other['id'] for other in LESSONS[i+1:] if l['id'] in other['prerequisiteIds']]
    l['retrievalFa']='پیش از مطلب تازه، یک پاسخ کوتاه بدون متن از '+('، '.join(l['prerequisiteIds']) if l['prerequisiteIds'] else 'سلام و پاسخ کوتاه Pre-A1')+' بازیابی شود؛ در صورت نیاز همان الگو کوتاه بازآموزی شود.'
if __name__=='__main__':
    (HERE/'design.json').write_text(json.dumps(dict(language='es',date='2026-11-26',status='proposal-not-runtime-content',dialect='es-ES; regional alternatives are not errors',modules=MODULES,lessons=LESSONS),ensure_ascii=False,indent=2)+'\n')
    print(f'Authored Spanish A1 design: {len(LESSONS)} lessons; no runtime changes.')
