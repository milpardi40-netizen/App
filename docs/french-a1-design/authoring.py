"""French A1 design only; no runtime content/storage writes. Full 56-ID prerequisite blueprint."""
import json
from pathlib import Path
HERE=Path(__file__).parent
LESSONS=[]
MODULES={1:'ورود به A1 و ابزار یادگیری',2:'شخص، اسم و توصیف',3:'ساخت جمله و فعل‌های پربسامد',4:'زمان، قرار و برنامه',5:'خانه و جای وسایل',6:'خوراک، خرید و انتخاب',7:'تفریح و ارتباط اجتماعی',8:'رفت‌وآمد و سفر',9:'درخواست، ارتباط و تجربهٔ اخیر',10:'دلیل ساده و جمع‌بندی مرتبط'}
SOUNDS={1:'تفاوت u و ou، واکهٔ خیشومی و پایان‌های اغلب خاموش؛ نام حروف با صوت جدا تمرین شود. آوانویسی فارسی فقط راهنمای تقریبی است.',2:'حرف تعریف و اسم را با هم بشنو؛ تفاوت un/une و تغییرِ شنیداریِ بعضی صفت‌های مؤنث مانند petit/petite، نه فرض خاموش‌بودن همهٔ eهای پایانی.',3:'صورت‌های نوشتاری je parle / tu parles / il parle اغلب هم‌آوا هستند؛ فاعل را حذف نکن. پیوند آوایی فقط با نمونهٔ معتبر همان عبارت آموزش داده شود.',4:'تشخیص heure/heures، روز و عدد در پیام؛ liaison عدد پیش از ans و heures با صوت بررسی شود، نه با خواندن مکانیکی حروف.',5:'تفاوت sur/sous و dans/devant؛ جای وسیله با تصویر یا نقشه و عبارت کامل بررسی شود.',6:'تمایز قیمت، مقدار و جنس کالا؛ un/une، du/de la و d’eau را در متن بشنو، نه به‌صورت حرف‌های جدا.',7:'آهنگ دعوت و رد مؤدبانه، مکث میان دو جملهٔ کوتاه؛ لازم نیست سرعت گفتار بومی تقلید شود.',8:'تشخیص مقصد، ساعت و quai در اعلان کوتاه؛ نام شهر و حرف اضافه همراه آن تمرین شود.',9:'شنیدن نام و زمان تماس؛ مرزبندی j’ai / je vais و درد با j’ai mal à …؛ صوت واقعی پیش از انتشار بررسی شود.',10:'پیوند و مکث جمله‌های مرتبط؛ parce que و donc بدون تودرتویی و با حفظ معنی شنیده شوند.'}
def add(slug,module,pre,deps,goal,grammar,words,caution,production,scene,listening,reading):
    turns=[dict(zip(('fr','fa'),line.split(' | ',1))) for line in scene.strip().splitlines()]
    assert len(turns)==4,slug
    LESSONS.append(dict(id='fr-a1-'+slug,proposedIndex=len(LESSONS)+1,module=module,
        preA1Ids=['fr-'+s for s in pre.split()],prerequisiteIds=['fr-a1-'+s for s in deps.split()],
        outcomeFa=goal,grammarFa=grammar,vocabularyFa=words,outOfScopeAndErrorFa=caution,
        pronunciationFa=SOUNDS[module],productionFa=production,
        scene=[dict(role='partner' if i%2==0 else 'learner',**t) for i,t in enumerate(turns)],
        listening=dict(zip(('passage','questionFa','answer'),listening)),reading=dict(zip(('passage','questionFa','answer'),reading))))

add('greetings',1,'pre-1 pre-3 pre-7','',
'در برخورد دوستانه سلام و احوال‌پرسی کنم و مناسب خداحافظی کنم.',
'Bonjour/Salut و Comment ça va?؛ پاسخ کوتاه با Et toi?؛ tu/vous از نظر موقعیت، بدون تعویض بی‌دلیل در صحنه.',
'bonjour=سلام روزانه؛ salut=سلام دوستانه؛ bien=خوب؛ à demain=تا فردا',
'اینجا هدف انتخاب موقعیت و پاسخ مستقل فراتر از تکرار Pre-A1 است؛ تصریف همهٔ فعل‌ها لازم نیست.',
'یک احوال‌پرسی چهارنوبتی دوستانه بساز و یک نسخهٔ سلام/خداحافظی رسمی جدا بنویس.',
'''Salut, Sara ! Comment ça va ? | سلام، سارا! حالت چطور است؟
Ça va bien, merci. Et toi ? | خوبم، ممنون. تو چطوری؟
Très bien. À demain ! | خیلی خوبم. تا فردا!
À demain, Léa ! | تا فردا، لئا!''',
('Bonjour, Ben ! Ça va bien, merci. À ce soir !','گوینده تا چه زمانی خداحافظی می‌کند؟','ce soir'),
('Bonjour, madame. Au revoir, madame.','این برخورد رسمی است یا دوستانه؟','رسمی'))

add('profile',1,'pre-2 pre-16','greetings',
'نام و شهر زندگی را بگویم و همین دو اطلاعات را بپرسم.',
'Je m’appelle و J’habite à؛ me→m’ در m’appelle و je→j’ در j’habite با h خاموش؛ پرسش با آهنگ و جملهٔ کوتاه، نه همهٔ روش‌های سؤال‌سازی.',
'prénom=نام کوچک؛ habiter=زندگی کردن؛ ville=شهر؛ à Lyon=در لیون',
'سن، فرم و شغل در همین درس انباشته نشوند؛ تلفظ m’appelle با نوشتن اشتباه ma pelle یکی نیست.',
'با نام و شهر خیالی خودت یک معرفی و دو سؤال کوتاه بنویس.',
'''Bonjour, je m’appelle Léa. Et toi ? | سلام، اسم من لئا است. تو چطور؟
Je m’appelle Sara. | اسم من سارا است.
Tu habites où, Sara ? | سارا، کجا زندگی می‌کنی؟
J’habite à Lyon. Et toi ? | در لیون زندگی می‌کنم. تو چطور؟''',
('Je m’appelle Amir. J’habite à Paris.','امیر در کدام شهر زندگی می‌کند؟','Paris'),
('Bonjour ! Moi, c’est Ben. J’habite à Lille.','نام نویسنده چیست؟','Ben'))

add('asking-help',1,'pre-14 pre-4 pre-2','profile',
'درخواست تکرار، آهسته‌گویی و هجی نام کنم.',
'Vous pouvez répéter? و Pouvez-vous épeler …? قالب رسمی؛ تحلیل pouvoir بعداً؛ Je ne comprends pas یک قالب ضروری.',
'répéter=تکرار کردن؛ lentement=آهسته؛ épeler=هجی کردن؛ nom=نام',
'نام حروف فرانسوی از جملهٔ نوشتاری قابل حدس فرض نشود؛ G/J و E/I و U جدا با صوت آموزش داده شوند.',
'نام خیالی را هجی کن و دو درخواست تکرار یا آهسته‌گویی بنویس.',
'''Bonjour. Quel est votre nom ? | سلام. نام شما چیست؟
Mon nom est Ali. | نام من علی است.
Vous pouvez l’épeler, s’il vous plaît ? | می‌توانید لطفاً آن را هجی کنید؟
Oui. A–L–I. | بله. آ، اِل، ای.''',
('Mon nom est Lee. J’épelle : L–E–E.','نام خانوادگی چگونه هجی شد؟','L–E–E'),
('Parlez lentement, s’il vous plaît. Je ne comprends pas ce mot.','نویسنده از مخاطب می‌خواهد چگونه صحبت کند؟','lentement'))

add('nationalities',1,'pre-15 pre-16','profile asking-help',
'کشور مبدأ، شهر زندگی و زبان را از هم متمایز کنم.',
'venir de/d’ در قالب‌های je viens / tu viens؛ habiter à + شهر؛ parler français بدون حرف تعریف؛ ملیت صفت با جنس هماهنگ و با حرف کوچک.',
'pays=کشور؛ langue=زبان؛ français=فرانسوی؛ persan=فارسی',
'همهٔ حرف‌اضافه‌های کشورها و همهٔ صورت‌های venir هم‌زمان لازم نیست؛ Je viens d’Iran را یک عبارت روشن یاد بده.',
'نام، کشور، شهر و زبان یک شخصیت خیالی را در سه یا چهار جمله معرفی کن.',
'''Tu viens d’où ? | اهل کجا هستی؟
Je viens d’Iran. | اهل ایران هستم.
Tu parles français ? | فرانسوی صحبت می‌کنی؟
Oui, un peu. Je parle aussi persan. | بله، کمی. فارسی هم صحبت می‌کنم.''',
('Je viens de France. Je parle français et un peu persan.','گوینده کدام زبان را کمی صحبت می‌کند؟','persan'),
('Léa est française. Elle habite à Paris.','لئا در کدام شهر زندگی می‌کند؟','Paris'))

add('numbers-age',1,'pre-5','profile',
'سن و یک شمارهٔ تماس خیالی کوتاه را بفهمم و بگویم.',
'avoir برای سن: J’ai vingt ans؛ اعداد ۰ تا ۱۰۰ گروه‌بندی‌شده؛ شماره در تمرین رقم‌به‌رقم؛ ۷۰/۸۰/۹۰ با الگوی رایج فرانسه.',
'âge=سن؛ ans=سال در بیان سن؛ numéro=شماره؛ zéro=صفر',
'Je suis vingt ans غلط است؛ اتصال عدد با ans شنیده شود. صورت‌های septante/nonante در مناطق دیگر خطا تلقی نشوند، اما بانک یک الگوی مشخص دارد.',
'سن و یک شمارهٔ چهاررقمی کاملاً خیالی بنویس و بلند بخوان.',
'''Tu as quel âge ? | چند سال داری؟
J’ai vingt-trois ans. | بیست‌وسه سال دارم.
Quel est ton numéro ? | شماره‌ات چیست؟
Zéro, un, deux, trois. | صفر، یک، دو، سه.''',
('Je m’appelle Ben. J’ai trente-deux ans.','بن چند سال دارد؟','32'),
('Prénom : Sara. Âge : 24 ans. Numéro : 0312.','سن سارا چند سال است؟','24'))

add('nouns-gender-plural',2,'pre-6 pre-5 foundation-chunks-2','numbers-age',
'اسم‌های آشنا را با جنس و جمع معرفی کنم.',
'un/une در معرفی؛ des برای جمع نامعین؛ -s جمع اغلب شنیده نمی‌شود؛ جنس اسم و نه جنسیت صاحب.',
'un livre=کتاب؛ une table=میز؛ un stylo=خودکار؛ des livres=کتاب‌ها',
'جنس از ظاهر یا ترجمهٔ فارسی حدس زده نشود؛ همهٔ جمع‌های استثنایی یکجا نیایند.',
'چهار وسیله را با un/une و جمع دو مورد ثبت کن.',
'''Qu’est-ce que c’est ? | این چیست؟
C’est un livre. | یک کتاب است.
Et ici ? | و اینجا؟
Ce sont deux livres. | این‌ها دو کتاب هستند.''',
('Ici, il y a trois stylos et une table.','چند خودکار وجود دارد؟','trois'),
('un cahier → des cahiers ; une table → des tables','جمع table در این مدخل چیست؟','des tables'))

add('articles',2,'pre-6','nouns-gender-plural',
'شیء نامشخص را معرفی و سپس به همان شیء مشخص اشاره کنم.',
'un/une/des در برابر le/la/les؛ l’ پیش از واکه یا h خاموش؛ کاربرد فاعلی و مفعولی اسم بدون حالت‌سازی آلمانی.',
'le livre=کتاب مشخص؛ la table=میز مشخص؛ l’école=مدرسه؛ les livres=کتاب‌های مشخص',
'du/de la برای خوراک مرحلهٔ بعد است؛ حرف تعریف را صرفاً معادل «یک» فرض نکن.',
'دو جفت جمله بساز: معرفی شیء، سپس توصیف همان شیء مشخص.',
'''Qu’est-ce que c’est ? | این چیست؟
C’est une table. | یک میز است.
La table est grande ? | آن میز بزرگ است؟
Oui, la table est grande. | بله، آن میز بزرگ است.''',
('C’est un livre. Le livre est ici.','شیء معرفی‌شده چیست؟','un livre'),
('C’est une école. L’école est ici.','در اشارهٔ دوم پیش از école چه آمده؟','l’'))

add('subject-pronouns',2,'foundation-words-2 pre-7','profile articles',
'به‌جای تکرار نام، ضمیر مناسب برای فرد یا گروه به کار ببرم.',
'je/tu/il/elle/nous/vous/ils/elles؛ on در گفتار روزمره اغلب «ما»؛ vous رسمی یا جمع؛ ضمیر معمولاً حذف نمی‌شود.',
'elle=او مؤنث؛ nous=ما؛ vous=شما؛ on=ما در بسیاری از موقعیت‌های گفتاری',
'همهٔ صرف‌ها هم‌زمان هدف نیستند؛ on از نظر صرف مفرد است، هرچند گاهی معنی جمع دارد.',
'خودت، یک فرد و یک گروه را با سه ضمیر معرفی کن.',
'''Qui est-ce ? | او کیست؟
C’est Léa. Elle habite à Lyon. | لئا است. او در لیون زندگی می‌کند.
Et Ben ? | و بن چطور؟
Il habite à Lille. | او در لیل زندگی می‌کند.''',
('Sara et moi, nous habitons à Paris. Ben habite à Lyon.','nous به چه کسانی اشاره دارد؟','Sara et le locuteur'),
('Léa et Anna sont ici. Elles parlent français.','Elles به چه کسانی اشاره دارد؟','Léa et Anna'))

add('verb-to-be',2,'pre-7 pre-12','subject-pronouns articles',
'با être خودم یا دیگری را معرفی و یک سؤال کوتاه بپرسم.',
'je suis، tu es، il/elle/on est، nous sommes، vous êtes، ils/elles sont؛ شغل پس از être معمولاً بدون حرف تعریف.',
'être=بودن؛ étudiant=دانشجوی مرد؛ étudiante=دانشجوی زن؛ professeur=معلم',
'سن، گرسنگی و تشنگی با être ساخته نشوند؛ تطابق مؤنث در نوشتار توضیح داده شود، نه اینکه هر e الزاماً صدای جدا دارد.',
'دو معرفی و یک سؤال با être بساز؛ جنس دستوری نمونه روشن باشد.',
'''Tu es étudiante, Sara ? | سارا، دانشجو هستی؟
Oui, je suis étudiante. | بله، دانشجو هستم.
Et Ben, il est étudiant ? | و بن، او دانشجو است؟
Non, il est professeur. | نه، او معلم است.''',
('Je suis professeur. Léa est étudiante.','لئا معلم است یا دانشجو؟','étudiante'),
('Nous sommes ici. Vous êtes à Lyon.','صورت être با nous در متن چیست؟','sommes'))

add('family',2,'pre-10','verb-to-be numbers-age',
'عضو خانواده را با نسبت، نام و یک اطلاعات کوتاه معرفی کنم.',
'mon père / ma mère در بازیابی؛ voici/c’est؛ avoir برای سن؛ un frère / une sœur.',
'mère=مادر؛ père=پدر؛ frère=برادر؛ sœur=خواهر',
'خانوادهٔ گسترده و ضمیر مفعولی تازه اجباری نشود؛ صاحب زن یا مرد، mon père را عوض نمی‌کند.',
'سه جمله دربارهٔ دو عضو یک خانوادهٔ خیالی بنویس.',
'''Qui est sur la photo ? | چه کسی در عکس است؟
C’est ma sœur. | خواهر من است.
Elle a quel âge ? | او چند سال دارد؟
Elle a vingt ans. | او بیست سال دارد.''',
('Mon frère s’appelle Ben. Il a douze ans.','برادر گوینده چند سال دارد؟','douze'),
('Voici mon père. Il s’appelle Ali.','نام پدر چیست؟','Ali'))

add('possessives',2,'pre-11 pre-10','family articles',
'مالک وسیله را بپرسم و با ملکی مناسب پاسخ بدهم.',
'mon/ma/mes و ton/ta/tes؛ son/sa/ses با اسمِ متعلق هماهنگ‌اند نه جنسیت صاحب؛ mon amie برای مؤنثِ آغازشده با واکه.',
'mon=مال من مذکر؛ ma=مال من مؤنث؛ mes=مال من جمع؛ à qui=مال چه کسی',
'با تفاوت mon amie و ma sœur کل نظام تلفظ/صرف یکجا امتحان نشود؛ ضمیر مستقلِ le mien هنوز هدف نیست.',
'چهار وسیله را به خودت و دو شخصیت خیالی نسبت بده.',
'''C’est ton livre ? | این کتاب تو است؟
Oui, c’est mon livre. | بله، این کتاب من است.
Et cette table, elle est à qui ? | و این میز مال چه کسی است؟
C’est la table de Léa. | میز لئا است.''',
('Ben a une sœur. Sa sœur s’appelle Anna.','نام خواهر بن چیست؟','Anna'),
('C’est le sac de Sara. Son sac est bleu.','کیف متعلق به چه کسی است؟','Sara'))

add('demonstratives',2,'pre-6','articles possessives',
'به یک شیء مشخص اشاره کنم و آن را از شیء دیگر متمایز کنم.',
'ce/cet/cette/ces؛ cet پیش از واکه یا h خاموشِ مذکر؛ c’est با ce livre یکی نیست.',
'ce livre=این کتاب؛ cette table=این میز؛ cet hôtel=این هتل؛ ces livres=این کتاب‌ها',
'ضمیر مستقل celui/celle و همهٔ ترکیب‌های اشاره لازم نیست؛ cette با اسم مؤنث، نه جنسیت گوینده، هماهنگ است.',
'سه شیء و یک هتل خیالی را با اشاره و ویژگی کوتاه معرفی کن.',
'''Ce livre est à toi ? | این کتاب مال تو است؟
Oui, ce livre est à moi. | بله، این کتاب مال من است.
Et cette table ? | و این میز چطور؟
Cette table est à Léa. | این میز مال لئا است.''',
('Ce livre est neuf. Cette table est vieille.','کدام شیء نو است؟','ce livre'),
('Cet hôtel est ici. Ces livres sont là-bas.','کدام چیزها آنجا هستند؟','ces livres'))

add('descriptions',2,'pre-12','verb-to-be demonstratives',
'یک وسیله، شخص یا اتاق را با صفت مناسب توصیف کنم.',
'تطابق مذکر/مؤنث و جمع: petit/petite، grand/grande؛ نمونهٔ پس از être ابتدا؛ جای صفت‌های تازه کنترل‌شده.',
'petit=کوچک مذکر؛ petite=کوچک مؤنث؛ grand=بزرگ مذکر؛ calme=آرام',
'تطابق فقط نوشتاری نیست: petit/petite تفاوت شنیداری دارد؛ جدول استثناهای جای صفت به مبتدی تحمیل نشود.',
'دو شیء با جنس متفاوت و یک اتاق را در سه جمله توصیف کن.',
'''Ta chambre est grande ? | اتاقت بزرگ است؟
Non, elle est petite. | نه، کوچک است.
Elle est calme ? | آرام است؟
Oui, elle est calme. | بله، آرام است.''',
('Mon sac est petit. Ma table est grande.','میز بزرگ است یا کوچک؟','grande'),
('Le livre est neuf. La chambre est petite.','کدام چیز کوچک است؟','la chambre'))

add('colors',2,'pre-13','descriptions articles',
'رنگ یک شیء را بپرسم و با تطابق لازم جواب بدهم.',
'bleu/bleue، noir/noire، vert/verte؛ rouge در مفرد جنس یک شکل دارد؛ پرسش de quelle couleur.',
'bleu=آبی؛ rouge=قرمز؛ noir=مشکی؛ vert=سبز',
'صرف همهٔ صفت‌های رنگی استثنایی و رنگ‌های مرکب لازم نیست؛ noir/noire برخلاف vert/verte معمولاً هم‌آوا هستند.',
'رنگ سه وسیله را با اسمِ همراه حرف تعریف بنویس.',
'''Ton sac est de quelle couleur ? | کیفت چه رنگی است؟
Mon sac est bleu. | کیفم آبی است.
Et ta table ? | و میزت؟
Elle est blanche. | سفید است.''',
('Mon cahier est vert. Mon stylo est noir.','دفتر چه رنگی است؟','vert'),
('La table est noire. Le livre est rouge.','کتاب چه رنگی است؟','rouge'))

add('feelings',2,'pre-7 pre-8','verb-to-be descriptions',
'حال خود و نیاز سادهٔ مرتبط را بیان کنم.',
'être + صفت برای حالت؛ avoir faim/soif؛ fatigué/fatiguée و content/contente با هویت شخصیت روشن.',
'faim=گرسنگی؛ soif=تشنگی؛ fatigué=خسته مذکر؛ contente=خوشحال مؤنث',
'Je suis faim غلط است؛ جنس شخصیت در سؤال و کلید پاسخ مبهم نباشد.',
'دو حالت و یک نیاز شخصیت خیالی را بنویس؛ شکل صفت را با شخصیت هماهنگ کن.',
'''Sara, tu es fatiguée ? | سارا، خسته‌ای؟
Oui, je suis fatiguée. | بله، خسته‌ام.
Tu as aussi soif ? | تشنه هم هستی؟
Oui, j’ai soif. | بله، تشنه‌ام.''',
('Léa est contente. Ben a faim.','چه کسی گرسنه است؟','Ben'),
('Sara a soif. Elle est fatiguée.','سارا علاوه بر خستگی چه نیازی دارد؟','soif'))

add('simple-verbs',3,'pre-8 pre-9','subject-pronouns articles feelings',
'با avoir و یک فعل ساده دربارهٔ وسیلهٔ موردنیاز جمله بسازم.',
'فاعل + فعل + مفعول؛ j’ai/tu as/il a؛ Je cherche و Je porte با اسم آشنا؛ قبل از واکه je→j’.',
'avoir=داشتن؛ chercher=دنبال چیزی گشتن؛ porter=حمل کردن؛ stylo=خودکار',
'اسم نقش مفعولی در فرانسوی به روش einen آلمانی تغییر نمی‌کند؛ ضمایر مفعولی و سه گروه فعل هم‌زمان نه.',
'یک داشته، یک جست‌وجو و یک سؤال دربارهٔ وسیله بنویس.',
'''Tu cherches quoi ? | دنبال چه می‌گردی؟
Je cherche un stylo. | دنبال یک خودکار می‌گردم.
Tu as un cahier ? | دفتر داری؟
Oui, j’ai un cahier. | بله، دفتر دارم.''',
('J’ai un livre. Je cherche un cahier.','گوینده دنبال چه چیزی می‌گردد؟','un cahier'),
('Ben porte un sac. Sara a un livre.','چه کسی کیف حمل می‌کند؟','Ben'))

add('verb-conjugation',3,'pre-14','simple-verbs subject-pronouns',
'یک فعل باقاعدهٔ -er را برای چند شخص با معنای روشن تغییر بدهم.',
'parler و habiter؛ je parle، tu parles، il parle، nous parlons، vous parlez، ils parlent؛ فاعل نوشته و شنیده شود.',
'parler=صحبت کردن؛ habiter=ساکن بودن؛ ensemble=با هم؛ ici=اینجا',
'صورت‌های parle/parles/parlent عموماً هم‌آوا هستند؛ این قاعده را به finir و prendre تعمیم نده.',
'چهار جمله با parler برای je، tu، nous و vous بنویس.',
'''Tu parles français ? | فرانسوی صحبت می‌کنی؟
Oui, je parle français. | بله، فرانسوی صحبت می‌کنم.
Et Léa, elle parle français ? | و لئا، او فرانسوی صحبت می‌کند؟
Oui, nous parlons français ensemble. | بله، ما با هم فرانسوی صحبت می‌کنیم.''',
('Nous habitons à Lyon. Ben habite à Lille.','ما در کدام شهر زندگی می‌کنیم؟','Lyon'),
('Je parle persan. Vous parlez français.','صورت فعل همراه vous چیست؟','parlez'))

add('present-tense',3,'pre-16','verb-conjugation simple-verbs',
'دربارهٔ کار امروز و رفتن به کلاس با چند صورت پربسامد جمله بگویم.',
'حالِ travailler/étudier و صورت‌های لازم aller/faire/prendre؛ je vais، tu vas، je fais، je prends؛ فهرست محدود و کاربردی.',
'travailler=کار کردن؛ étudier=درس خواندن؛ aller=رفتن؛ faire=انجام دادن',
'حال استمراری جدا اجباری نیست؛ عنوان «حال» مجوز امتحان همهٔ افعال بی‌قاعده یا finir نیست.',
'سه جمله دربارهٔ کار، کلاس و یک کار امروز بنویس.',
'''Tu travailles aujourd’hui ? | امروز کار می‌کنی؟
Non, j’étudie le français. | نه، فرانسوی درس می‌خوانم.
Tu vas au cours ? | به کلاس می‌روی؟
Oui, je vais au cours. | بله، به کلاس می‌روم.''',
('Aujourd’hui, je travaille. Ben étudie le français.','چه کسی فرانسوی درس می‌خواند؟','Ben'),
('Je prends le bus. Je vais au cours.','نویسنده با چه وسیله‌ای می‌رود؟','le bus'))

add('positive-negative-questions',3,'pre-8','simple-verbs verb-to-be present-tense',
'یک خبر را به سؤال یا نفی کوتاه تبدیل کنم.',
'آهنگ پرسشی یا est-ce que؛ ne … pas دور فعل صرف‌شده؛ pas de/d’ پس از داشتن؛ بعد از être حرف تعریف معمولاً حفظ می‌شود.',
'ne … pas=نفی؛ est-ce que=قالب پرسش؛ pas de=نداشتن مقدار/شیء در ساخت منتخب',
'در نوشتار معیار ne حذف نشود، هرچند حذف آن در گفتار شناختنی است؛ همهٔ انواع وارونگی اجباری نیست.',
'برای یک داشته و یک فعالیت، پرسش و پاسخ منفی بساز.',
'''Est-ce que tu as un stylo ? | آیا خودکار داری؟
Non, je n’ai pas de stylo. | نه، خودکار ندارم.
Tu travailles aujourd’hui ? | امروز کار می‌کنی؟
Non, je ne travaille pas aujourd’hui. | نه، امروز کار نمی‌کنم.''',
('Je n’ai pas de cahier. J’ai un livre.','گوینده چه چیزی ندارد؟','de cahier'),
('Ce n’est pas un livre. C’est un cahier.','شیء معرفی‌شده در واقع چیست؟','un cahier'))

add('question-words',3,'pre-15 pre-16 pre-19','positive-negative-questions numbers-age',
'برای شخص، مکان، زمان و قیمت سؤال مناسب انتخاب کنم.',
'qui/où/quand/comment/combien؛ پرسش کوتاه گفتاری و est-ce que؛ شکل وارونهٔ همهٔ افعال هنوز لازم نیست.',
'qui=چه کسی؛ où=کجا؛ quand=کی؛ combien=چقدر/چند',
'سؤال غیرمستقیم و همهٔ شکل‌های quel یکجا نیایند؛ معنی نوع پاسخ مهم‌تر از حفظ چند قالب هم‌معنی است.',
'چهار سؤال کوتاه دربارهٔ نام، محل، زمان و قیمت بنویس.',
'''Le cours est où ? | کلاس کجاست؟
Il est ici. | اینجا است.
Il commence à quelle heure ? | چه ساعتی شروع می‌شود؟
À neuf heures. | ساعت نه.''',
('Le cours commence à dix heures, à Lyon.','کلاس چه ساعتی شروع می‌شود؟','dix heures'),
('Qui arrive ? Léa. Elle habite où ? À Paris.','پاسخ پرسش Qui چیست؟','Léa'))

add('wants-needs',3,'pre-9 pre-18','simple-verbs positive-negative-questions',
'نیاز، دوست‌داشتن و خواستن مؤدبانه را از هم جدا کنم.',
'avoir besoin de/d’؛ aimer + اسم معین؛ je voudrais قالب مؤدبانهٔ آماده، نه آموزش زمان شرطی؛ vouloir در je veux/tu veux محدود.',
'besoin=نیاز؛ vouloir=خواستن؛ aimer=دوست داشتن؛ eau=آب',
'J’ai besoin d’eau با Je suis besoin اشتباه نشود؛ je voudrais به همهٔ فعل‌ها تعمیم داده نشود.',
'یک نیاز و یک خواستهٔ مؤدبانه بنویس و یک گزینه را رد کن.',
'''Tu veux du thé ? | چای می‌خواهی؟
Non, merci. J’ai besoin d’eau. | نه، ممنون. آب لازم دارم.
Tu aimes le thé ? | چای دوست داری؟
Oui, mais maintenant, je voudrais de l’eau. | بله، ولی الان آب می‌خواهم.''',
('J’aime le café, mais maintenant, je voudrais du thé.','گوینده الان چه می‌خواهد؟','du thé'),
('Ben a besoin d’un stylo. Il a déjà un cahier.','بن چه چیزی لازم دارد؟','un stylo'))

add('ability',3,'pre-14','present-tense wants-needs',
'یک توانایی را بگویم و درخواست کمک ساده کنم.',
'pouvoir + مصدر؛ je peux/tu peux/il peut/nous pouvons/vous pouvez؛ نفی دور pouvoir، مصدر پس از آن.',
'pouvoir=توانستن؛ aider=کمک کردن؛ lire=خواندن؛ nager=شنا کردن',
'صرف lire در همهٔ اشخاص یا ساخت‌های شرطی هم‌زمان لازم نیست؛ je peux lire نه je peux lis.',
'دو توانایی و یک درخواست با pouvoir بنویس.',
'''Tu peux lire en français ? | می‌توانی به فرانسوی بخوانی؟
Oui, un peu. | بله، کمی.
Tu peux m’aider ? | می‌توانی به من کمک کنی؟
Oui, bien sûr. | بله، حتماً.''',
('Ben peut nager. Léa ne peut pas nager.','چه کسی نمی‌تواند شنا کند؟','Léa'),
('Nous pouvons étudier ensemble. Vous pouvez venir à dix heures.','چه ساعتی امکان آمدن هست؟','dix heures'))

add('dates-and-time',4,'pre-19 pre-20','numbers-age question-words',
'ساعت، روز و تاریخ کوتاه را بخوانم و بگویم.',
'il est une heure/deux heures؛ à برای ساعت قرار؛ تاریخ le premier mai ولی le deux mai؛ روز و ماه معمولاً حرف کوچک.',
'heure=ساعت؛ mai=مه؛ lundi=دوشنبه؛ et demie=و نیم',
'همهٔ اعداد ترتیبی و شیوه‌های ساعت رسمی/عامیانه یکجا اجباری نیست؛ تاریخ عددی با قالب روز/ماه روشن شود.',
'یک تاریخ خیالی و دو ساعت بنویس و با قالب همان درس بخوان.',
'''Quelle heure est-il ? | ساعت چند است؟
Il est neuf heures et demie. | ساعت نه و نیم است.
Quelle est la date aujourd’hui ? | تاریخ امروز چیست؟
On est le premier mai. | امروز اول ماه مه است.''',
('Il est une heure. Le cours commence à deux heures.','کلاس چه ساعتی شروع می‌شود؟','deux heures'),
('Cours : lundi 02/05, 09 h 30.','کلاس چه ساعتی است؟','09 h 30'))

add('appointment-time',4,'pre-19 pre-20','dates-and-time ability',
'یک قرار بگیرم، زمان نامناسب را رد و زمان نهایی را تأیید کنم.',
'Je voudrais un rendez-vous؛ vous êtes disponible …?؛ mardi à dix heures؛ کاربرد زمان در مذاکرهٔ دوگزینه‌ای، نه تکرار صرف ساعت.',
'rendez-vous=قرار/نوبت؛ disponible=در دسترس؛ mardi=سه‌شنبه؛ jeudi=پنج‌شنبه',
'دو زمان پیشنهادی با وقت نهایی اشتباه نشوند؛ موضوع حساس یا اطلاعات واقعی پزشکی لازم نیست.',
'یک گفت‌وگوی کوتاه با رد زمان اول و تأیید زمان دوم بنویس.',
'''Vous êtes disponible mardi à dix heures ? | سه‌شنبه ساعت ده وقت دارید؟
Non, je ne peux pas mardi. | نه، سه‌شنبه نمی‌توانم.
Et jeudi à onze heures ? | و پنج‌شنبه ساعت یازده چطور؟
Oui, jeudi à onze heures. Merci. | بله، پنج‌شنبه ساعت یازده. ممنون.''',
('Votre rendez-vous est vendredi à neuf heures.','قرار چه زمانی است؟','vendredi à neuf heures'),
('Rendez-vous confirmé : mardi 10 mai à 14 h.','ساعت تأییدشده چیست؟','14 h'))

add('forms-information',4,'pre-2 pre-15','numbers-age nationalities asking-help dates-and-time',
'فرم کوتاه نام، شهر و تاریخ را با اطلاعات خیالی تکمیل کنم.',
'prénom در برابر nom de famille؛ votre در خطاب رسمی؛ date de naissance با تاریخِ درس قبل؛ épeler برای تصحیح.',
'prénom=نام کوچک؛ nom de famille=نام خانوادگی؛ adresse=نشانی؛ naissance=تولد',
'nom بسته به فرم می‌تواند نام عمومی یا خانوادگی باشد؛ برای جلوگیری از ابهام nom de famille صریح نوشته شود؛ فقط دادهٔ خیالی.',
'چهار خانهٔ یک فرم خیالی را پر کن و درخواست هجی نام خانوادگی بنویس.',
'''Quel est votre prénom ? | نام کوچک شما چیست؟
Mon prénom est Sara. | نام کوچک من سارا است.
Et votre nom de famille ? | و نام خانوادگی شما؟
Ali. A–L–I. | علی. آ، اِل، ای.''',
('Mon prénom est Ben. Mon nom de famille est Martin.','نام خانوادگی چیست؟','Martin'),
('Prénom : Léa. Nom de famille : Petit. Ville : Lyon.','شهر محل زندگی چیست؟','Lyon'))

add('daily-routine',4,'pre-19','present-tense dates-and-time',
'سه کار روزانه را با زمان و ترتیب بگویم.',
'je me lève / tu te lèves به‌عنوان ورود محدود به بازتابی؛ je prends le petit déjeuner؛ قید زمان بدون وارونگی آلمانی.',
'se lever=بلند شدن؛ petit déjeuner=صبحانه؛ le matin=صبح؛ le soir=عصر/شب',
'صورت همهٔ افعال بازتابی با همهٔ ضمیرها لازم نیست؛ À huit heures, je travaille نه جابه‌جایی فعل و فاعل به سبک آلمانی.',
'سه کار روزانهٔ شخصیت خیالی را با زمان بنویس.',
'''Tu te lèves à quelle heure ? | چه ساعتی از خواب بلند می‌شوی؟
Je me lève à sept heures. | ساعت هفت بلند می‌شوم.
Et tu prends ton petit déjeuner quand ? | و چه وقت صبحانه می‌خوری؟
À sept heures et demie. | ساعت هفت و نیم.''',
('Je me lève à six heures. Je prends mon petit déjeuner à six heures et demie.','صبحانه چه ساعتی خورده می‌شود؟','06 h 30'),
('Le matin, je travaille. Le soir, j’étudie.','نویسنده چه زمانی درس می‌خواند؟','le soir'))

add('weekly-schedule',4,'pre-20','daily-routine dates-and-time',
'عادت هفتگی را از قرار یک روز مشخص جدا کنم.',
'le lundi برای دوشنبه‌ها در برابر lundi برای دوشنبهٔ مشخص؛ de … à … برای بازهٔ ساعت؛ tous les jours محدود.',
'semaine=هفته؛ week-end=آخر هفته؛ libre=آزاد؛ le lundi=دوشنبه‌ها',
'le به‌طور مکانیکی پیش از همهٔ روزهای قرار اضافه نشود؛ روزها و ماه‌ها در فرانسوی معمولاً کوچک نوشته می‌شوند.',
'برنامهٔ دو روز هفته و یک زمان آزاد را بنویس.',
'''Tu travailles le lundi ? | دوشنبه‌ها کار می‌کنی؟
Oui, de neuf heures à midi. | بله، از نه تا ظهر.
Et samedi, tu es libre ? | و شنبه آزاد هستی؟
Oui, samedi, je suis libre. | بله، شنبه آزاد هستم.''',
('Je travaille le mardi. Vendredi, je suis libre.','کدام روز آزاد است؟','vendredi'),
('Cours de français : mercredi, de 9 h à 11 h.','کلاس چه ساعتی تمام می‌شود؟','11 h'))

add('work-study',4,'pre-14','weekly-schedule ability',
'دربارهٔ زمان کار یا کلاس سؤال و یک نیاز کلاسی مطرح کنم.',
'travailler/étudier؛ commencer/finir در صورت‌های همان موقعیت؛ je dois + مصدر ورودی محدودِ ضرورت، نه همهٔ devoir.',
'pause=استراحت؛ question=سؤال؛ cours=کلاس؛ bureau=دفتر کار',
'عنوان درس مجوز مصاحبهٔ کاری تخصصی یا صرف کامل همهٔ افعال -ir نیست؛ finir فقط در پیام پایان کلاس به‌روشنی معرفی شود.',
'سه جمله دربارهٔ کار یا کلاس خیالی و یک سؤال بنویس.',
'''Le cours commence à quelle heure ? | کلاس چه ساعتی شروع می‌شود؟
À neuf heures. | ساعت نه.
Et la pause ? | و استراحت؟
La pause est à dix heures. | استراحت ساعت ده است.''',
('Je dois étudier aujourd’hui. Le cours finit à midi.','کلاس چه زمانی تمام می‌شود؟','midi'),
('Réunion à 10 h. Pause à 11 h.','استراحت چه ساعتی است؟','11 h'))

add('instructions',4,'pre-14','work-study ability',
'دستور کوتاه کلاس را بفهمم و اگر لازم شد توضیح بخواهم.',
'امرِ vous بدون ضمیر فاعلی: ouvrez/fermez/écoutez/lisez/écrivez؛ s’il vous plaît برای ادب؛ نه همهٔ صرف امر.',
'ouvrir=باز کردن؛ page=صفحه؛ lire=خواندن؛ écrire=نوشتن',
'در فرانسوی برخلاف آلمانی vous در خود امر حذف می‌شود: Ouvrez le livre؛ زمان و روش امر همهٔ فعل‌ها یکجا نه.',
'دو دستور رسمی کلاسی و یک درخواست تکرار بنویس.',
'''Ouvrez votre livre, s’il vous plaît. | لطفاً کتابتان را باز کنید.
À quelle page ? | صفحهٔ چند؟
À la page douze. Lisez le texte. | صفحهٔ دوازده. متن را بخوانید.
D’accord, merci. | بسیار خوب، ممنون.''',
('Écrivez votre nom, puis lisez le texte.','اول چه کاری باید انجام شود؟','écrire son nom'),
('Exercice 2 : écoutez et répétez.','در تمرین دو چه کاری خواسته شده؟','écouter et répéter'))

add('location',5,'pre-17','question-words articles',
'محل یک اتاق یا وسیله را بپرسم و بگویم.',
'où + être؛ ici/là-bas؛ dans la chambre و dans la cuisine؛ اسم‌ها داتیو یا آکوزاتیو نمی‌گیرند.',
'chambre=اتاق؛ cuisine=آشپزخانه؛ ici=اینجا؛ là-bas=آنجا',
'مقصد سفر و مکان ثابت یک درس نشوند؛ جنس حرف تعریف اسم همچنان باید درست بماند.',
'محل سه اتاق یا وسیله را در یک خانهٔ خیالی بنویس.',
'''Où est la cuisine ? | آشپزخانه کجاست؟
Elle est là-bas. | آنجا است.
Et mon livre ? | و کتاب من؟
Il est dans la chambre. | در اتاق است.''',
('Le sac est dans la cuisine. Le livre est dans la chambre.','کیف کجاست؟','dans la cuisine'),
('La salle de bains est ici. La cuisine est là-bas.','کدام مکان اینجا است؟','la salle de bains'))

add('prepositions',5,'pre-17','location articles',
'جای ثابت وسیله را با روی، زیر و کنار بیان کنم.',
'sur/sous/dans/devant/derrière؛ à côté de؛ de + le→du و de + les→des فقط در همین عبارت‌های مشخص.',
'sur=روی؛ sous=زیر؛ à côté de=کنار؛ devant=جلوی',
'du در à côté du livre با du در خوراک یک کاربرد نیست؛ جدول تمام حروف اضافه و همهٔ ادغام‌ها یکجا لازم نیست.',
'روی نقشهٔ اتاق سه جملهٔ مکانی با اسم همراه حرف تعریف بساز.',
'''Où est le livre ? | کتاب کجاست؟
Il est sur la table. | روی میز است.
Et le sac ? | و کیف؟
Il est sous la table. | زیر میز است.''',
('Le stylo est à côté du livre. Le sac est derrière la chaise.','کیف نسبت به صندلی کجاست؟','derrière la chaise'),
('Le cahier est dans le sac. La lampe est sur la table.','دفتر کجاست؟','dans le sac'))

add('home-furniture',5,'pre-16 pre-17','prepositions descriptions simple-verbs',
'یک خانه یا اتاق را با وسایل و جای آن‌ها توصیف کنم.',
'il y a در برابر avoir؛ نفی il n’y a pas de؛ صفت مؤنث مثل ouverte فقط در صورت کاربرد روشن.',
'lit=تخت؛ chaise=صندلی؛ salon=نشیمن؛ fenêtre=پنجره',
'جست‌وجوی اجارهٔ حقوقی یا قرارداد به این درس افزوده نشود؛ این زبان برخلاف آلمانی lessonId جدا برای room-search ندارد.',
'چهار جمله دربارهٔ وسایل، نبودن یک وسیله و جای آن‌ها در اتاق خیالی بنویس.',
'''Il y a quoi dans la chambre ? | در اتاق چه هست؟
Il y a un lit et une table. | یک تخت و یک میز هست.
La table est où ? | میز کجاست؟
Elle est à côté de la fenêtre. | کنار پنجره است.''',
('Dans le salon, il y a deux chaises, mais il n’y a pas de table.','کدام وسیله وجود ندارد؟','de table'),
('La chambre est petite. Le lit est à côté de la porte.','تخت کنار چه چیزی است؟','la porte'))

add('ordering-food',6,'pre-18','wants-needs simple-verbs',
'غذا و نوشیدنی ساده سفارش بدهم و یک مورد را حذف کنم.',
'je voudrais؛ du/de la/de l’ برای مقدار نامعین؛ un verre d’eau و sans؛ تمایز سفارش یک قلم با اسم ماده.',
'pain=نان؛ soupe=سوپ؛ eau=آب؛ sans=بدون',
'partitif کامل با همهٔ استثناها یکجا نه؛ تشخیص du pain به معنی مقداری نان، نه جنس دستوری تازه؛ ایمنی آلرژی نیاز به تأیید واقعی دارد.',
'یک سفارش دو قلمی و یک درخواست بدونِ چیزی بنویس.',
'''Vous désirez ? | چه میل دارید؟
Une soupe, s’il vous plaît. | یک سوپ، لطفاً.
Et comme boisson ? | و برای نوشیدنی؟
De l’eau sans glace, s’il vous plaît. | آب بدون یخ، لطفاً.''',
('Je voudrais du pain et un thé sans sucre.','چای بدون چه چیزی سفارش داده شده؟','sucre'),
('Menu : soupe 5 €, pain 2 €, eau 1 €.','سوپ چند یورو است؟','5 €'))

add('cafe',6,'pre-18','ordering-food numbers-age',
'سفارش کافه را تا صورت‌حساب و پرداخت کامل کنم.',
'un café/un thé؛ l’addition؛ ensemble/séparément؛ prix با euro؛ نقش هر نوبت و خطاب vous ثابت.',
'addition=صورت‌حساب؛ payer=پرداخت کردن؛ ensemble=با هم؛ séparément=جدا',
'این درس صرفاً تکرار واژگان غذا نیست؛ نوبت‌گیری، صورت‌حساب و پایان تراکنش نتیجهٔ تازه‌اند.',
'یک گفت‌وگوی شش‌نوبتی با سفارش، صورت‌حساب و پرداخت بنویس.',
'''Bonjour. Vous désirez ? | سلام. چه میل دارید؟
Un café, s’il vous plaît. | یک قهوه، لطفاً.
Vous voulez payer maintenant ? | می‌خواهید الان پرداخت کنید؟
Oui. L’addition, s’il vous plaît. | بله. صورت‌حساب، لطفاً.''',
('Un thé, s’il vous plaît. Je voudrais payer maintenant.','مشتری چه نوشیدنی‌ای سفارش داده؟','un thé'),
('Café : 3 €. Thé : 2 €. Eau : 1 €.','ارزان‌ترین نوشیدنی چیست؟','eau'))

add('shopping-payment',6,'pre-5','cafe colors',
'قیمت کالا را بپرسم و روش پرداخت را مشخص کنم.',
'combien coûte …?؛ je prends … برای انتخاب؛ en espèces/par carte قالب پرداخت؛ prendre از درس فعل بازیابی.',
'coûter=قیمت داشتن؛ carte=کارت؛ espèces=پول نقد؛ caisse=صندوق',
'تفاوت prendre برای انتخاب و aller برای رفتن روشن بماند؛ اعداد قیمت نمونه‌اند، نه قیمت واقعی بازار.',
'یک خرید دفتر با قیمت، انتخاب و سؤال روش پرداخت بنویس.',
'''Combien coûte ce cahier ? | این دفتر چقدر قیمت دارد؟
Trois euros. | سه یورو.
Je peux payer par carte ? | می‌توانم با کارت پرداخت کنم؟
Oui, bien sûr. | بله، حتماً.''',
('Le livre coûte cinq euros. Vous pouvez payer par carte.','قیمت کتاب چقدر است؟','5 €'),
('Un stylo : 2 €. Paiement en espèces uniquement.','کدام روش پرداخت پذیرفته می‌شود؟','en espèces'))

add('supermarket',6,'pre-5','shopping-payment ordering-food',
'جای کالا را پیدا کنم و مقدار ساده‌ای بخواهم.',
'où se trouve …? به‌صورت عبارت؛ trois pommes، un kilo de pommes؛ de بعد از مقدار؛ pas de در نبودن کالا.',
'pomme=سیب؛ lait=شیر؛ œufs=تخم‌مرغ‌ها؛ kilo=کیلو',
'بعد از un kilo de، حرف تعریف partitif مکانیکی تکرار نشود؛ هدف یافتن قفسه و مقدار است، نه تکرار خرید عمومی.',
'فهرست خرید سه‌قلمی و یک سؤال دربارهٔ جای کالا بنویس.',
'''Excusez-moi, où est le lait ? | ببخشید، شیر کجاست؟
Il est là-bas, à côté du pain. | آنجا، کنار نان است.
Et les pommes ? | و سیب‌ها؟
Ici. Deux euros le kilo. | اینجا. کیلویی دو یورو.''',
('Un kilo de pommes coûte trois euros. Le lait est à côté du pain.','قیمت یک کیلو سیب چقدر است؟','3 €'),
('Liste : trois pommes, une bouteille d’eau, du pain.','چند سیب در فهرست است؟','trois'))

add('clothes-shopping',6,'pre-13','shopping-payment ability colors',
'لباس را با سایز یا رنگ بخواهم و اجازهٔ پرو بگیرم.',
'je peux essayer …?؛ cette chemise؛ en bleu؛ taille M؛ trop petit/petite با جنس کالای مشخص.',
'chemise=پیراهن؛ veste=کاپشن/کت؛ taille=سایز؛ essayer=پرو کردن',
'plus grande را پیش از درس مقایسه شرط موفقیت نکن؛ صفت اندازه باید با chemise مؤنث هماهنگ باشد.',
'رنگ، سایز و یک درخواست پرو برای لباسی خیالی بنویس.',
'''Vous avez cette chemise en taille M ? | این پیراهن را در سایز مدیوم دارید؟
Oui, la voici. | بله، بفرمایید.
Je peux l’essayer ? | می‌توانم آن را پرو کنم؟
Oui, la cabine est là-bas. | بله، اتاق پرو آنجا است.''',
('Je cherche une veste en taille L, en bleu.','چه سایزی درخواست شده؟','L'),
('Chemise : rouge, taille S, 20 €.','پیراهن چه رنگی است؟','rouge'))

add('preferences',6,'pre-3','wants-needs ordering-food',
'بین دو گزینه انتخاب کنم و ترجیح را بیان کنم.',
'je préfère …؛ tu préfères … ou …?؛ aimer + مصدر برای علاقه؛ à در ترجیح فقط در مثال محدود.',
'préférer=ترجیح دادن؛ ou=یا؛ thé=چای؛ café=قهوه',
'تکیهٔ نوشتاری préfère با préférer روشن شود؛ ne pas aimer و préférer یکی نیستند.',
'دو ترجیح دربارهٔ نوشیدنی و فعالیت بنویس و از مخاطب سؤال کن.',
'''Tu préfères le thé ou le café ? | چای را ترجیح می‌دهی یا قهوه؟
Je préfère le thé. | چای را ترجیح می‌دهم.
Avec du lait ? | با شیر؟
Non, sans lait, merci. | نه، بدون شیر، ممنون.''',
('Je préfère le café. Je n’aime pas beaucoup le thé.','گوینده کدام نوشیدنی را ترجیح می‌دهد؟','le café'),
('Ben aime le pain. Sara préfère le riz.','سارا کدام غذا را ترجیح می‌دهد؟','le riz'))

add('comparisons',6,'pre-12','descriptions clothes-shopping preferences',
'دو کالای آشنا را در اندازه یا قیمت به‌سادگی مقایسه کنم.',
'plus … que / moins … que با صفت آشنا؛ moins cher/chère؛ تطابق مؤنث و مذکر در مثال‌ها.',
'plus grand=بزرگ‌تر؛ moins cher=ارزان‌تر؛ que=از در مقایسه؛ autre=دیگر',
'آشنایی محدود در مرز A1 است، نه تسلط بر همهٔ مقایسه‌ها یا عالی؛ شرط انجام خرید پایه نباشد.',
'دو شیء یا دو اتاق خیالی را با دو مقایسهٔ کوتاه توصیف کن.',
'''Cette chemise coûte vingt euros. | این پیراهن بیست یورو قیمت دارد.
L’autre coûte dix euros. | آن یکی ده یورو قیمت دارد.
L’autre est moins chère ? | آن یکی ارزان‌تر است؟
Oui, elle est moins chère. | بله، ارزان‌تر است.''',
('Le livre coûte dix euros. Le cahier coûte deux euros. Le cahier est moins cher.','کدام کالا ارزان‌تر است؟','le cahier'),
('La chambre à Lyon est plus petite que la chambre à Paris.','کدام اتاق کوچک‌تر است؟','la chambre à Lyon'))

add('leisure',7,'pre-3','present-tense preferences ability',
'دربارهٔ سرگرمی و علاقه سؤال و پاسخ کوتاه بسازم.',
'aimer + مصدر؛ lire، nager، écouter de la musique؛ تفاوت علاقه و توانایی با pouvoir.',
'lire=مطالعه کردن؛ nager=شنا کردن؛ musique=موسیقی؛ se promener=قدم زدن',
'صرف کامل همهٔ مصدرهای سرگرمی لازم نیست؛ je nage bien با j’aime nager یکی نیست.',
'سه جمله دربارهٔ علاقه و یک سؤال دربارهٔ سرگرمی مخاطب بنویس.',
'''Tu aimes faire quoi ? | دوست داری چه کار کنی؟
J’aime lire. | مطالعه را دوست دارم.
Tu aimes aussi nager ? | شنا کردن را هم دوست داری؟
Oui, mais je ne nage pas très bien. | بله، ولی خیلی خوب شنا نمی‌کنم.''',
('J’aime écouter de la musique. Ben aime lire.','بن چه کاری را دوست دارد؟','lire'),
('Léa aime se promener. Sara aime dessiner.','چه کسی نقاشی کردن را دوست دارد؟','Sara'))

add('weather',7,'pre-7','descriptions dates-and-time',
'وضعیت سادهٔ هوا را بفهمم و درباره‌اش جمله بسازم.',
'il fait chaud/froid در برابر il pleut؛ il غیرشخصی؛ aujourd’hui/demain برای زمان.',
'temps=آب‌وهوا؛ chaud=گرم؛ froid=سرد؛ pleuvoir=باریدن باران',
'برای هوای گرم Il est chaud گفته نشود؛ دستور بی‌قاعدهٔ Prends بدون معرفی، شرط اتمام درس نشود.',
'هوای دو روز خیالی را در دو یا سه جمله توصیف کن.',
'''Quel temps fait-il aujourd’hui ? | امروز هوا چطور است؟
Il fait froid. | هوا سرد است.
Il pleut aussi ? | باران هم می‌بارد؟
Oui, il pleut. | بله، باران می‌بارد.''',
('Aujourd’hui, il fait chaud. Il ne pleut pas.','هوا گرم است یا سرد؟','chaud'),
('Lundi : pluie. Mardi : soleil.','کدام روز بارانی است؟','lundi'))

add('connectors',7,'pre-3','positive-negative-questions leisure weather',
'دو پیام مرتبط را با و، اما یا یا به هم وصل کنم.',
'et/mais/ou؛ حفظ فاعل و ترتیب جملهٔ اصلی؛ حذف فاعل تکراری فقط در نمونه‌های روشن.',
'et=و؛ mais=اما؛ ou=یا؛ alors=پس در قالب ساده',
'ou به معنی «یا» با où مکانی یکی نیست؛ دلیل و نتیجه در درس پایان می‌آید و تودرتویی لازم نیست.',
'سه جمله دربارهٔ یک برنامه با et و mais بنویس.',
'''Tu veux te promener ? | می‌خواهی قدم بزنیم؟
Oui, mais il pleut. | بله، ولی باران می‌بارد.
Alors, on reste ici et on boit un thé ? | پس اینجا بمانیم و چای بنوشیم؟
Oui, bonne idée. | بله، فکر خوبی است.''',
('J’ai du temps, mais Ben travaille. Nous étudions ensemble demain.','آن‌ها چه زمانی با هم درس می‌خوانند؟','demain'),
('J’aime lire, mais aujourd’hui, je n’ai pas le temps.','نویسنده امروز چه چیزی ندارد؟','le temps'))

add('future-plans',7,'pre-20','present-tense weekly-schedule connectors',
'دربارهٔ برنامهٔ نزدیک با aller و مصدر حرف بزنم.',
'aller صرف‌شده + مصدر: je vais étudier، tu vas travailler، nous allons …؛ تمایز aller à مکان با aller + مصدر.',
'demain=فردا؛ ce soir=امشب؛ visiter=بازدید کردن؛ rester=ماندن',
'صرف futur simple با -rai و همهٔ ساخت‌های آینده یکجا لازم نیست؛ مصدر پس از vais صرف دوباره نمی‌شود.',
'دو برنامهٔ فردا و یک وقت آزاد را با آیندهٔ نزدیک بنویس.',
'''Tu vas faire quoi demain ? | فردا چه کار می‌کنی؟
Je vais étudier le français. | قرار است فرانسوی درس بخوانم.
Et demain soir ? | و فردا شب؟
Je vais rester à la maison. | قرار است در خانه بمانم.''',
('Demain, je vais travailler. Ce soir, je vais lire.','گوینده امشب چه کاری می‌کند؟','lire'),
('Samedi, nous allons prendre un café. Dimanche, je vais étudier.','نوشیدن قهوه برای چه روزی برنامه‌ریزی شده؟','samedi'))

add('invitations',7,'pre-20','future-plans dates-and-time wants-needs',
'دعوت را بپذیرم یا با ادب رد کنم و زمان دیگری پیشنهاد بدهم.',
'tu veux …?؛ je ne peux pas؛ ça te va? قالب؛ désolé/désolée با گویندهٔ روشن؛ زمان نهایی در پایان.',
'avec plaisir=با کمال میل؛ dommage=حیف؛ samedi=شنبه؛ libre=آزاد',
'روز ردشده و روز توافق‌شده در کلید یا خداحافظی جابه‌جا نشوند؛ خطاب tu ثابت بماند.',
'یک دعوت با رد روز اول و توافق بر روز دوم بنویس.',
'''Tu veux prendre un café demain ? | می‌خواهی فردا قهوه بنوشیم؟
Demain, je ne peux pas. | فردا نمی‌توانم.
Et samedi, ça te va ? | و شنبه، برایت مناسب است؟
Oui, avec plaisir. À samedi ! | بله، با کمال میل. تا شنبه!''',
('Vendredi, je ne peux pas. Dimanche, je suis libre pour un café.','چه روزی برای قهوه پیشنهاد می‌شود؟','dimanche'),
('Salut Ben ! Tu es libre lundi à quinze heures ? Léa','چه ساعتی پیشنهاد شده؟','15 h'))

add('suggestions',7,'pre-3','invitations ability weather',
'پیشنهاد مشترک بدهم و بر یک جایگزین توافق کنم.',
'on peut + مصدر؛ on به معنی ما با صرف مفرد؛ pourquoi pas? به‌عنوان پاسخ؛ توصیهٔ تخصصی هدف نیست.',
'parc=پارک؛ cinéma=سینما؛ idée=ایده؛ ensemble=با هم',
'subjonctif و شرطی کامل برای پیشنهاد لازم نیست؛ on با nous از نظر صرف یکسان نیست.',
'برای یک روز بارانی دو پیشنهاد و انتخاب مشترک بنویس.',
'''On peut aller au parc ? | می‌توانیم به پارک برویم؟
Mais il pleut aujourd’hui. | ولی امروز باران می‌بارد.
Alors, on peut aller au cinéma. | پس می‌توانیم به سینما برویم.
Oui, bonne idée ! | بله، فکر خوبی است!''',
('Il fait beau. On peut aller au parc ensemble.','رفتن به کجا پیشنهاد می‌شود؟','au parc'),
('On peut étudier ensemble à la bibliothèque à seize heures.','چه فعالیتی پیشنهاد شده؟','étudier ensemble'))

add('social-chat',7,'pre-21','nationalities leisure invitations connectors',
'آشنایی با هم‌کلاسی را با موضوع مشترک ادامه بدهم و طبیعی تمام کنم.',
'بازیابی نام، شهر، کلاس و سرگرمی؛ et toi?؛ دعوت کوتاه؛ بدون انباشتن دستور تازه.',
'cours=کلاس؛ nouveau/nouvelle=تازه‌وارد؛ ensemble=با هم؛ aussi=هم',
'گفت‌وگو از معرفی به چند موضوع نامربوط نپرد؛ جنس nouveau/nouvelle از شخصیت روشن باشد.',
'یک آشنایی شش‌نوبتی با هم‌کلاسی و یک برنامهٔ مشترک بنویس.',
'''Salut, tu es nouveau dans le cours ? | سلام، در کلاس تازه‌وارد هستی؟ (خطاب به مرد)
Oui, je m’appelle Amir. Et toi ? | بله، اسم من امیر است. تو چطور؟
Moi, c’est Ben. On étudie ensemble demain ? | من بن هستم. فردا با هم درس بخوانیم؟
Oui, avec plaisir. À demain ! | بله، با کمال میل. تا فردا!''',
('Bonjour, je suis Sara. J’habite à Lille et j’aime lire.','سارا در کدام شهر زندگی می‌کند؟','Lille'),
('Amir et Ben étudient ensemble mardi à dix heures.','آن‌ها چه زمانی با هم درس می‌خوانند؟','mardi à dix heures'))

add('directions',8,'pre-17','prepositions instructions ability',
'آدرس کوتاه بپرسم و دو جهت ساده را بفهمم.',
'allez/tournez در امر vous؛ à gauche/à droite/tout droit؛ au/à la در مقصدِ چند مکان مشخص.',
'gauche=چپ؛ droite=راست؛ tout droit=مستقیم؛ gare=ایستگاه قطار',
'اسم مکان باید با نقشه هماهنگ باشد؛ tout droit با à droite اشتباه نشود؛ همهٔ کاربردهای y لازم نیست.',
'روی نقشهٔ خیالی یک مسیر دو مرحله‌ای به ایستگاه بنویس.',
'''Excusez-moi, où est la gare ? | ببخشید، ایستگاه قطار کجاست؟
Allez tout droit. | مستقیم بروید.
Et après ? | و بعد؟
Tournez à gauche. | به چپ بپیچید.''',
('Allez tout droit, puis tournez à droite. La poste est là.','پس از مستقیم رفتن به کدام سمت بپیچند؟','à droite'),
('La banque est à gauche de la poste.','بانک نسبت به ادارهٔ پست کجاست؟','à gauche de la poste'))

add('public-transport',8,'pre-19','directions dates-and-time',
'مقصد اتوبوس و ایستگاه پیاده‌شدن را بپرسم.',
'ce bus va …?؛ je descends / vous descendez در همان موقعیت؛ en bus/en taxi؛ au centre-ville.',
'bus=اتوبوس؛ arrêt=ایستگاه؛ descendre=پیاده شدن؛ prochain=بعدی',
'زمان‌بندی و خط واقعی شهر ادعا نشود؛ صرف کامل همهٔ افعال -re لازم نیست.',
'سؤال مقصد و محل پیاده‌شدن را برای مسیر خیالی بنویس.',
'''Ce bus va au centre-ville ? | این اتوبوس به مرکز شهر می‌رود؟
Oui, il va au centre-ville. | بله، به مرکز شهر می‌رود.
Je descends où ? | کجا پیاده شوم؟
Au prochain arrêt. | در ایستگاه بعدی.''',
('Ce bus va à la gare. Descendez au prochain arrêt.','کجا باید پیاده شوند؟','au prochain arrêt'),
('Bus 5 : gare – centre-ville. Départ : 08 h 10.','اتوبوس چه ساعتی حرکت می‌کند؟','08 h 10'))

add('travel-tickets',8,'pre-19','public-transport shopping-payment',
'بلیت بخواهم و مقصد، ساعت و سکو را بفهمم.',
'un billet pour …؛ aller simple/aller-retour؛ à quelle heure part …?؛ quai شماره‌دار.',
'billet=بلیت؛ quai=سکو؛ départ=حرکت؛ aller-retour=رفت‌وبرگشت',
'خرید واقعی یا مقررات بلیت ادعا نشود؛ پرواز و هتل در همین درس مخلوط نشوند.',
'درخواست بلیت با مقصد و یک‌طرفه یا رفت‌وبرگشت و سؤال حرکت بنویس.',
'''Un billet pour Lyon, s’il vous plaît. | یک بلیت به لیون، لطفاً.
Un aller simple ? | یک‌طرفه؟
Oui. Le train part à quelle heure ? | بله. قطار چه ساعتی حرکت می‌کند؟
À dix heures, quai deux. | ساعت ده، سکوی دو.''',
('Le train pour Paris part à onze heures, quai trois.','قطار از کدام سکو حرکت می‌کند؟','quai trois'),
('Train pour Lille : 14 h 30, quai 4.','مقصد قطار کدام شهر است؟','Lille'))

add('hotel-stay',8,'pre-18','home-furniture travel-tickets asking-help',
'با نام رزرو و تعداد شب در پذیرش هتل صحبت کنم.',
'j’ai une réservation؛ au nom de …؛ pour deux nuits؛ à quelle heure … برای صبحانه.',
'réservation=رزرو؛ nuit=شب؛ clé=کلید؛ petit déjeuner=صبحانه',
'پرکردن فرم و مشکل پیچیدهٔ رزرو یکجا تحمیل نشود؛ گفت‌وگو رزرو واقعی ایجاد نمی‌کند.',
'ورود کوتاه به هتل با نام خیالی، تعداد شب و سؤال صبحانه بنویس.',
'''Bonjour, j’ai une réservation. | سلام، رزرو دارم.
À quel nom, s’il vous plaît ? | به چه نامی، لطفاً؟
Au nom d’Ali. Pour deux nuits. | به نام علی. برای دو شب.
Oui, voici votre clé. | بله، بفرمایید کلید شما.''',
('J’ai une réservation au nom de Martin pour trois nuits.','رزرو برای چند شب است؟','trois nuits'),
('Petit déjeuner : de 7 h à 10 h. Chambre 12.','صبحانه چه ساعتی شروع می‌شود؟','7 h'))

add('polite-requests',9,'pre-4 pre-14','ability instructions hotel-stay',
'در خدمات عمومی یک درخواست مؤدبانه یا اجازه مطرح کنم.',
'vous pouvez / pourriez-vous قالب آماده؛ est-ce que je peux …? برای اجازه؛ m’aider و m’asseoir به‌صورت عبارت روشن.',
'aider=کمک کردن؛ fenêtre=پنجره؛ ouvrir=باز کردن؛ s’asseoir=نشستن',
'صرف conditionnel کامل لازم نیست؛ درخواست از دیگری با اجازهٔ انجام کار خود یکی نشود.',
'یک درخواست رسمی و یک اجازه‌خواستن بنویس.',
'''Est-ce que je peux ouvrir la fenêtre ? | اجازه دارم پنجره را باز کنم؟
Oui, bien sûr. | بله، حتماً.
Vous pouvez m’aider, s’il vous plaît ? | می‌توانید لطفاً به من کمک کنید؟
Oui, avec plaisir. | بله، با کمال میل.''',
('Je peux m’asseoir ici ? Oui, cette chaise est libre.','گوینده برای چه کاری اجازه می‌خواهد؟','s’asseoir ici'),
('Pourriez-vous parler lentement, s’il vous plaît ?','چه درخواستی مطرح شده؟','parler lentement'))

add('phone-messages',9,'pre-2','polite-requests asking-help future-plans',
'در تماس خود را معرفی و زمان تماس بعدی را مشخص کنم.',
'allô؛ c’est … à l’appareil قالب؛ je peux parler à …?؛ je vais rappeler / rappelez-moi محدود.',
'message=پیام؛ rappeler=دوباره تماس گرفتن؛ demain=فردا؛ à l’appareil=پشت خط',
'پیام طولانی و زنجیرهٔ ضمیرهای مفعولی لازم نیست؛ شماره‌ها خیالی و کلیدها با زمان پیام هماهنگ باشند.',
'یک پیام دو یا سه‌جمله‌ای با نام خیالی و زمان تماس بنویس.',
'''Bonjour, c’est Sara Ali. Je peux parler à madame Martin ? | سلام، سارا علی هستم. می‌توانم با خانم مارتن صحبت کنم؟
Madame Martin n’est pas là aujourd’hui. | خانم مارتن امروز اینجا نیست.
D’accord, je vais rappeler demain. | بسیار خوب، فردا دوباره تماس می‌گیرم.
Très bien, au revoir. | بسیار خوب، خداحافظ.''',
('Bonjour, c’est Ben Martin. Je vais rappeler demain à dix heures.','بن فردا چه ساعتی تماس می‌گیرد؟','dix heures'),
('Salut Ben, c’est Léa. Tu peux m’appeler à dix-sept heures ?','لئا چه ساعتی درخواست تماس دارد؟','17 h'))

add('doctor-symptoms',9,'pre-7','feelings appointment-time polite-requests',
'یک علامت ساده و زمان شروع را بگویم و برای نوبت کمک بخواهم.',
'j’ai mal à la tête / à la gorge؛ j’ai de la fièvre؛ depuis hier به‌صورت عبارت زمان؛ نه تشخیص یا تجویز.',
'tête=سر؛ gorge=گلو؛ fièvre=تب؛ depuis=از زمانِ',
'این درس جای رسیدگی پزشکی نیست؛ انقباض à + le در مثال نیازمندِ au آشکار توضیح داده شود، نه اینکه تمام اعضای بدن فهرست شوند.',
'با وضعیت فرضی دو جملهٔ علامت و یک درخواست نوبت بنویس.',
'''Bonjour, j’ai mal à la tête. | سلام، سردرد دارم.
Depuis quand ? | از چه زمانی؟
Depuis hier. | از دیروز.
Vous avez aussi de la fièvre ? | تب هم دارید؟''',
('J’ai mal à la gorge depuis ce matin. Je voudrais un rendez-vous.','گوینده چه دردی دارد؟','mal à la gorge'),
('J’ai de la fièvre. Je ne me sens pas bien.','چه علامتی در متن آمده؟','de la fièvre'))

add('past-events',9,'pre-20','present-tense daily-routine future-plans',
'دو کار سادهٔ دیروز را با زمان روشن بگویم.',
'passé composé با avoir: j’ai travaillé/étudié؛ tu as …?؛ fait به‌عنوان یک صورت پربسامد محدود؛ جای کمکی و participe.',
'hier=دیروز؛ travaillé=کار کرده؛ étudié=درس خوانده؛ fait=انجام داده',
'همهٔ افعال با être، تطابق participe و تفاوت کامل imparfait/passé composé هدف این درس کوتاه نیست؛ فعل اصلی دوباره صرف نشود.',
'دو جمله دربارهٔ کارهای واقعی یا خیالی دیروز با الگوهای همین درس بنویس.',
'''Tu as travaillé hier ? | دیروز کار کردی؟
Non, j’ai étudié le français. | نه، فرانسوی درس خواندم.
Tu as étudié à la maison ? | در خانه درس خواندی؟
Oui, à la maison. | بله، در خانه.''',
('Hier, j’ai travaillé. Le soir, j’ai étudié le français.','گوینده دیروز عصر چه کرده؟','étudié le français'),
('Ben a fait les courses hier. Léa a étudié.','چه کسی دیروز خرید کرده؟','Ben'))

add('reasons',10,'pre-7','connectors feelings invitations past-events',
'برای یک تصمیم روزمره دلیل و نتیجهٔ ساده بیان کنم.',
'pourquoi?؛ parce que + جملهٔ ساده، parce qu’ پیش از واکه؛ donc برای نتیجه؛ ترتیب معمول فاعل/فعل حفظ می‌شود.',
'pourquoi=چرا؛ parce que=چون؛ donc=پس؛ rester=ماندن',
'برخلاف weil آلمانی، فعل به آخر فرستاده نمی‌شود؛ زنجیرهٔ چند جملهٔ وابسته لازم نیست.',
'دعوتی را با یک دلیل کوتاه رد کن و یک زمان جایگزین پیشنهاد بده.',
'''Tu viens avec nous aujourd’hui ? | امروز با ما می‌آیی؟
Non, je reste à la maison. | نه، در خانه می‌مانم.
Pourquoi ? | چرا؟
Parce que je suis fatiguée. | چون خسته‌ام. (گوینده زن)''',
('Je reste à la maison parce que j’ai de la fièvre.','دلیل در خانه ماندن چیست؟','de la fièvre'),
('Il pleut, donc nous restons ici.','نتیجهٔ بارش باران چیست؟','nous restons ici'))

add('connected-conversation',10,'pre-21','social-chat reasons forms-information phone-messages suggestions',
'معرفی، محل زندگی و یک برنامهٔ مشترک را در گفت‌وگویی پیوسته مدیریت کنم.',
'فقط بازیابی: معرفی، شهر، دعوت و زمان جایگزین؛ tu از ابتدا تا انتها برای دو هم‌کلاسی؛ دستور تازهٔ اجباری ندارد.',
'بازیابی نام، شهر، کلاس، روز و ساعت؛ واژهٔ تازهٔ اجباری ندارد.',
'گفت‌وگوی پایانی فعلی فرانسوی در ممیزی اولیه منسجم بود؛ هدف این طرح کنترل و گسترش نتیجه است، نه نسبت‌دادن خطای Frau/Herr آلمانی به فرانسوی.',
'یک مکالمهٔ شش تا هشت‌نوبتی با نام، شهر و روز انتخابی خودت بنویس و زمان نهایی را روشن کن.',
'''Salut, je m’appelle Léa. Tu es nouveau dans le cours ? | سلام، اسم من لئا است. در کلاس تازه‌وارد هستی؟ (خطاب به مرد)
Oui, moi, c’est Amir. J’habite à Lyon. | بله، من امیر هستم. در لیون زندگی می‌کنم.
Moi aussi. Tu veux prendre un café demain ? | من هم همین‌طور. می‌خواهی فردا قهوه بنوشیم؟
Demain, je ne peux pas. Et samedi ? | فردا نمی‌توانم. شنبه چطور؟''',
('Léa et Amir ne sont pas libres vendredi. Ils vont prendre un café samedi à onze heures.','زمان نهایی قهوه چه ساعتی است؟','onze heures'),
('Léa : Samedi à dix heures au café ? Amir : Oui, avec plaisir. À samedi !','روز نهایی ملاقات چیست؟','samedi'))

LESSONS[-1]['scene'] += [
 dict(role='partner',fr='Oui, samedi à dix heures au café ?',fa='بله، شنبه ساعت ده در کافه؟'),
 dict(role='learner',fr='Oui, avec plaisir. Où est le café ?',fa='بله، با کمال میل. کافه کجاست؟'),
 dict(role='partner',fr='À côté de la gare. À samedi !',fa='کنار ایستگاه قطار. تا شنبه!'),
 dict(role='learner',fr='Très bien, à samedi !',fa='بسیار خوب، تا شنبه!')]
for i,l in enumerate(LESSONS):
    l['proposedIndex']=i+1
    l['transferToIds']=[other['id'] for other in LESSONS[i+1:] if l['id'] in other['prerequisiteIds']]
    l['retrievalFa']='پیش از مطلب تازه، یک پاسخ بدون متن از '+('، '.join(l['prerequisiteIds']) if l['prerequisiteIds'] else 'سلام و پاسخ کوتاه Pre-A1')+' بازیابی شود؛ در صورت نیاز همان الگو کوتاه بازآموزی شود.'
if __name__=='__main__':
    (HERE/'design.json').write_text(json.dumps(dict(language='fr',date='2026-11-26',status='proposal-not-runtime-content',modules=MODULES,lessons=LESSONS),ensure_ascii=False,indent=2)+'\n')
    print(f'Authored French A1 design: {len(LESSONS)} lessons; no runtime changes.')
