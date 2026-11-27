"""Lesson-local continuation of the approved French scenes. No cross-language sentence template."""
BANK={}
def add(slug,text):BANK[slug]=[tuple(s.split(' | ',1)) for s in text.strip().splitlines()]
add('greetings','''Bonjour, madame. | سلام، خانم.
Bonsoir, monsieur. | عصر بخیر، آقا.
Salut, Ben ! | سلام، بن!
Au revoir, madame. | خداحافظ، خانم.
Bonne journée ! | روز خوبی داشته باشید!
Bonne soirée ! | عصر خوبی داشته باشید!
Ça va, merci. | خوبم، ممنون.
À bientôt ! | به‌زودی می‌بینمت!''')
add('profile','''Mon prénom est Anna. | نام کوچک من آنا است.
Moi, c’est Ben. | من بن هستم.
Comment tu t’appelles ? | اسم تو چیست؟
Je m’appelle Amir. | اسم من امیر است.
Tu habites à Paris ? | در پاریس زندگی می‌کنی؟
Non, j’habite à Lille. | نه، در لیل زندگی می‌کنم.
J’habite aussi à Lyon. | من هم در لیون زندگی می‌کنم.
Bonjour, moi, c’est Tim. | سلام، من تیم هستم.
Tu t’appelles Anna ? | اسم تو آنا است؟
Oui, je m’appelle Anna. | بله، اسم من آنا است.
Et toi, tu habites où ? | و تو کجا زندگی می‌کنی؟
Moi, j’habite à Paris. | من در پاریس زندگی می‌کنم.
Bonjour, je suis nouveau ici. | سلام، من اینجا تازه‌وارد هستم. (مرد)
Bonjour, je suis nouvelle ici. | سلام، من اینجا تازه‌وارد هستم. (زن)
Enchanté, Sara. | از آشنایی با تو خوشحالم، سارا. (گوینده مرد)
Enchantée, Ben. | از آشنایی با تو خوشحالم، بن. (گوینده زن)''')
add('asking-help','''Encore une fois, s’il vous plaît. | یک بار دیگر، لطفاً.
Parlez lentement, s’il vous plaît. | لطفاً آهسته صحبت کنید.
Je ne comprends pas ce mot. | این واژه را نمی‌فهمم.
Vous pouvez répéter ? | می‌توانید تکرار کنید؟
Comment ça s’écrit ? | این چطور نوشته می‌شود؟
Mon nom est Lee : L–E–E. | نام من لی است: اِل، اُ، اُ.
Écrivez votre nom, s’il vous plaît. | لطفاً نامتان را بنویسید.
Merci, maintenant, je comprends. | ممنون، الان می‌فهمم.''')
add('nationalities','''Vous venez d’où ? | شما اهل کجا هستید؟
Je viens de France. | من اهل فرانسه هستم.
J’habite à Paris. | در پاریس زندگی می‌کنم.
Je parle français. | فرانسوی صحبت می‌کنم.
Je parle persan. | فارسی صحبت می‌کنم.
Tu parles persan ? | فارسی صحبت می‌کنی؟
Léa est française. Elle habite à Paris. | لئا فرانسوی است. او در پاریس زندگی می‌کند.
Ben est français. | بن فرانسوی است.''')
add('numbers-age','''Zéro, un, deux. | صفر، یک، دو.
Quatre, cinq, six, sept. | چهار، پنج، شش، هفت.
Huit, neuf, dix. | هشت، نه، ده.
Onze, douze, treize, quatorze. | یازده، دوازده، سیزده، چهارده.
Quinze, seize, dix-sept, dix-huit, dix-neuf. | پانزده، شانزده، هفده، هجده، نوزده.
Vingt, trente, quarante, cinquante. | بیست، سی، چهل، پنجاه.
Soixante, soixante-dix, quatre-vingts, quatre-vingt-dix. | شصت، هفتاد، هشتاد، نود.
Vingt et un, vingt-deux, vingt-quatre, cent. | بیست‌ویک، بیست‌ودو، بیست‌وچهار، صد.''')
add('nouns-gender-plural','''Une table et deux tables. | یک میز و دو میز.
C’est une chaise. | یک صندلی است.
Ce sont trois chaises. | این‌ها سه صندلی هستند.
C’est un cahier. | یک دفتر است.
Ce sont deux cahiers. | این‌ها دو دفتر هستند.
Il y a des livres. | کتاب‌هایی وجود دارد.
Il y a trois stylos. | سه خودکار وجود دارد.
Un livre et deux cahiers. | یک کتاب و دو دفتر.''')
add('articles','''C’est un livre. | یک کتاب است.
Le livre est ici. | آن کتاب اینجا است.
C’est une chaise. | یک صندلی است.
La chaise est petite. | آن صندلی کوچک است.
Ce sont des cahiers. | این‌ها دفتر هستند.
Les cahiers sont ici. | آن دفترها اینجا هستند.
C’est une école. | یک مدرسه است.
L’école est là-bas. | آن مدرسه آنجا است.''')
add('subject-pronouns','''Je suis Sara. | من سارا هستم.
Tu es Ben. | تو بن هستی.
Nous sommes ici. | ما اینجا هستیم.
Vous êtes à Paris. | شما در پاریس هستید.
Léa et Anna sont ici. Elles sont ici. | لئا و آنا اینجا هستند. آن‌ها اینجا هستند.
Ben et Amir sont ici. Ils sont ici. | بن و امیر اینجا هستند. آن‌ها اینجا هستند.
On parle français. | ما فرانسوی صحبت می‌کنیم. (گفتاری)
Le livre est neuf. Il est neuf. | کتاب نو است. آن نو است.''')
add('verb-to-be','''Je suis professeur. | من معلم هستم.
Tu es étudiant. | تو دانشجو هستی. (مرد)
Elle est étudiante. | او دانشجو است. (زن)
Nous sommes en cours. | ما در کلاس هستیم.
Vous êtes ici ? | شما اینجا هستید؟
Oui, nous sommes ici. | بله، ما اینجا هستیم.
Ils sont à Paris. | آن‌ها در پاریس هستند. (مردان یا گروه مختلط)
Elles sont à Lyon. | آن‌ها در لیون هستند. (زنان)''')
add('family','''Voici ma mère. | این مادر من است.
Mon père s’appelle Ali. | نام پدرم علی است.
J’ai un frère. | یک برادر دارم.
Ma sœur s’appelle Anna. | نام خواهرم آنا است.
Mon frère a douze ans. | برادرم دوازده سال دارد.
C’est ton père ? | این پدر تو است؟
Oui, c’est mon père. | بله، این پدر من است.
Ma mère est professeure. | مادرم معلم است.''')
add('possessives','''C’est mon cahier. | این دفتر من است.
C’est ma chaise. | این صندلی من است.
Ce sont mes livres. | این‌ها کتاب‌های من هستند.
C’est ton stylo ? | این خودکار تو است؟
Non, c’est le stylo de Ben. | نه، خودکار بن است.
Ben a un livre. Son livre est neuf. | بن یک کتاب دارد. کتاب او نو است.
Léa a une table. Sa table est grande. | لئا یک میز دارد. میز او بزرگ است.
Voici mon amie Anna. | این دوست من آنا است. (زن)''')
add('demonstratives','''Ce stylo est neuf. | این خودکار نو است.
Cette chaise est petite. | این صندلی کوچک است.
Cet hôtel est ici. | این هتل اینجا است.
Ces livres sont là-bas. | این کتاب‌ها آنجا هستند.
Ce cahier est à toi ? | این دفتر مال تو است؟
Oui, ce cahier est à moi. | بله، این دفتر مال من است.
Cette chambre est grande. | این اتاق بزرگ است.
Cette table est vieille. | این میز قدیمی است.''')
add('descriptions','''Le livre est neuf. | کتاب نو است.
La table est grande. | میز بزرگ است.
Le sac est petit. | کیف کوچک است.
La chaise est petite. | صندلی کوچک است.
Le sac n’est pas grand. | کیف بزرگ نیست.
La chambre est calme. | اتاق آرام است.
Les tables sont grandes. | میزها بزرگ هستند.
Les livres sont neufs. | کتاب‌ها نو هستند.''')
add('colors','''Le stylo est noir. | خودکار مشکی است.
Le cahier est vert. | دفتر سبز است.
La chaise est verte. | صندلی سبز است.
La table est noire. | میز مشکی است.
Le livre est rouge. | کتاب قرمز است.
La chambre est blanche. | اتاق سفید است.
La chaise est bleue. | صندلی آبی است.
Ces livres sont rouges. | این کتاب‌ها قرمز هستند.''')
add('feelings','''Je suis content. | خوشحالم. (مرد)
Je suis contente. | خوشحالم. (زن)
J’ai faim. | گرسنه‌ام.
Tu as soif ? | تشنه‌ای؟
Non, je n’ai pas soif. | نه، تشنه نیستم.
Ben est fatigué. | بن خسته است.
Léa est contente. | لئا خوشحال است.
J’ai faim et soif. | گرسنه و تشنه‌ام.''')
add('simple-verbs','''J’ai un stylo. | یک خودکار دارم.
Tu as un livre. | تو یک کتاب داری.
Ben a un sac. | بن یک کیف دارد.
Je porte un sac. | یک کیف حمل می‌کنم.
Je cherche une chaise. | دنبال یک صندلی می‌گردم.
Tu portes un livre ? | کتاب حمل می‌کنی؟
Nous avons des cahiers. | ما دفتر داریم.
Vous avez un stylo ? | شما خودکار دارید؟''')
add('verb-conjugation','''Je parle persan. | من فارسی صحبت می‌کنم.
Tu parles français. | تو فرانسوی صحبت می‌کنی.
Il parle français. | او فرانسوی صحبت می‌کند. (مرد)
Elle parle persan. | او فارسی صحبت می‌کند. (زن)
Vous parlez français. | شما فرانسوی صحبت می‌کنید.
Ils parlent français. | آن‌ها فرانسوی صحبت می‌کنند.
Nous habitons à Lyon. | ما در لیون زندگی می‌کنیم.
Vous habitez à Paris. | شما در پاریس زندگی می‌کنید.''')
add('present-tense','''Je travaille ici. | اینجا کار می‌کنم.
Tu travailles aujourd’hui. | تو امروز کار می‌کنی.
Léa travaille à Lyon. | لئا در لیون کار می‌کند.
Nous étudions le français. | ما فرانسوی درس می‌خوانیم.
Je prends le bus. | سوار اتوبوس می‌شوم.
Tu prends le train. | تو سوار قطار می‌شوی.
Je fais les courses. | خرید می‌کنم.
Nous allons au cours. | ما به کلاس می‌رویم.''')
add('positive-negative-questions','''J’ai un cahier. | دفتر دارم.
Je n’ai pas de cahier. | دفتر ندارم.
Tu as un livre ? | کتاب داری؟
Non, je n’ai pas de livre. | نه، کتاب ندارم.
Ce n’est pas un livre. | این کتاب نیست.
C’est un cahier. | این دفتر است.
Est-ce que tu étudies aujourd’hui ? | آیا امروز درس می‌خوانی؟
Non, je n’étudie pas aujourd’hui. | نه، امروز درس نمی‌خوانم.''')
add('question-words','''Qui est-ce ? | او کیست؟
Tu cherches quoi ? | دنبال چه می‌گردی؟
Tu habites où ? | کجا زندگی می‌کنی؟
Tu viens d’où ? | اهل کجا هستی؟
Comment tu t’appelles ? | اسم تو چیست؟
Tu as quel âge ? | چند سال داری؟
Tu travailles quand ? | چه زمانی کار می‌کنی؟
Combien coûte ce livre ? | این کتاب چقدر قیمت دارد؟''')
add('wants-needs','''J’ai besoin d’un livre. | یک کتاب لازم دارم.
Je voudrais un café, s’il vous plaît. | یک قهوه می‌خواهم، لطفاً.
J’aime le thé. | چای دوست دارم.
Tu veux de l’eau ? | آب می‌خواهی؟
Non, merci. Je ne veux pas de café. | نه، ممنون. قهوه نمی‌خواهم.
Tu as besoin de quoi ? | چه لازم داری؟
Aujourd’hui, j’ai besoin d’un cahier. | امروز یک دفتر لازم دارم.
J’aime le café, mais je voudrais du thé. | قهوه دوست دارم، ولی چای می‌خواهم.''')
add('ability','''Je peux lire en français. | می‌توانم به فرانسوی بخوانم.
Tu peux nager. | تو می‌توانی شنا کنی.
Léa ne peut pas nager. | لئا نمی‌تواند شنا کند.
Nous pouvons étudier ensemble. | می‌توانیم با هم درس بخوانیم.
Vous pouvez venir à dix heures. | می‌توانید ساعت ده بیایید.
Vous pouvez répéter, s’il vous plaît ? | می‌توانید لطفاً تکرار کنید؟
Tu peux lire ce mot ? | می‌توانی این واژه را بخوانی؟
Je ne peux pas venir aujourd’hui. | امروز نمی‌توانم بیایم.''')
add('dates-and-time','''Il est une heure. | ساعت یک است.
Il est deux heures. | ساعت دو است.
Le cours commence à huit heures. | کلاس ساعت هشت شروع می‌شود.
Nous sommes lundi. | امروز دوشنبه است.
On est le deux mai. | امروز دوم ماه مه است.
Le rendez-vous est le premier mai. | قرار اول ماه مه است.
Lundi à douze heures. | دوشنبه ساعت دوازده.
Il est midi. | ظهر است.''')
add('appointment-time','''Je voudrais un rendez-vous. | یک قرار می‌خواهم.
Vous êtes disponible lundi ? | دوشنبه وقت دارید؟
Non, je travaille lundi. | نه، دوشنبه کار می‌کنم.
Vous êtes libre vendredi ? | جمعه آزاد هستید؟
Oui, vendredi matin. | بله، جمعه صبح.
À neuf heures, c’est possible ? | ساعت نه ممکن است؟
Oui, c’est possible. | بله، ممکن است.
Vendredi à neuf heures, c’est bien ça ? | جمعه ساعت نه، درست است؟
Oui, c’est bien ça. | بله، درست است.
Je ne peux pas à dix heures. | ساعت ده نمی‌توانم.
À onze heures, ça va ? | ساعت یازده مناسب است؟
Oui, merci. À jeudi ! | بله، ممنون. تا پنج‌شنبه!
Votre rendez-vous est mardi à quatorze heures. | قرار شما سه‌شنبه ساعت چهارده است.
Le rendez-vous est confirmé. | قرار تأیید شده است.
Quel jour êtes-vous libre ? | چه روزی آزاد هستید؟
Je suis libre samedi matin. | شنبه صبح آزاد هستم.''')
add('forms-information','''Écrivez votre prénom, s’il vous plaît. | لطفاً نام کوچکتان را بنویسید.
J’habite à Lyon. | در لیون زندگی می‌کنم.
Quelle est votre adresse ? | نشانی شما چیست؟
Mon adresse est le douze, rue du Parc. | نشانی من خیابان پارک، پلاک دوازده است.
Quelle est votre date de naissance ? | تاریخ تولد شما چیست؟
Le premier mai. | اول ماه مه.
Nom de famille : Martin. Prénom : Ben. | نام خانوادگی: مارتن. نام کوچک: بن.
Vous pouvez épeler votre nom de famille ? | می‌توانید نام خانوادگی‌تان را هجی کنید؟''')
add('daily-routine','''Le matin, je travaille. | صبح کار می‌کنم.
Le soir, j’étudie. | عصر درس می‌خوانم.
Je me lève à six heures. | ساعت شش بلند می‌شوم.
Je prends mon petit déjeuner à huit heures. | ساعت هشت صبحانه می‌خورم.
Après, je vais au cours. | بعد به کلاس می‌روم.
À midi, je mange. | ظهر غذا می‌خورم.
Le soir, je lis un livre. | شب کتاب می‌خوانم.
Je me couche à dix heures. | ساعت ده می‌خوابم.''')
add('weekly-schedule','''Le lundi, j’étudie le français. | دوشنبه‌ها فرانسوی درس می‌خوانم.
Lundi, le cours commence à neuf heures. | دوشنبه کلاس ساعت نه شروع می‌شود.
Je travaille de huit heures à midi. | از هشت تا ظهر کار می‌کنم.
Mardi, je suis libre. | سه‌شنبه آزاد هستم.
Mercredi, je fais les courses. | چهارشنبه خرید می‌کنم.
Jeudi, j’étudie à la maison. | پنج‌شنبه در خانه درس می‌خوانم.
Vendredi, je travaille. | جمعه کار می‌کنم.
Le dimanche, je suis libre. | یکشنبه‌ها آزاد هستم.''')
add('work-study','''Je travaille au bureau. | در دفتر کار می‌کنم.
J’étudie le français dans ce cours. | در این کلاس فرانسوی درس می‌خوانم.
J’ai une question. | یک سؤال دارم.
Je dois étudier aujourd’hui. | امروز باید درس بخوانم.
Le cours finit à midi. | کلاس ظهر تمام می‌شود.
À quelle heure commence la réunion ? | جلسه چه ساعتی شروع می‌شود؟
La réunion commence à dix heures. | جلسه ساعت ده شروع می‌شود.
Nous faisons une pause. | ما استراحت می‌کنیم.''')
add('instructions','''Écrivez votre nom. | نامتان را بنویسید.
Lisez l’exercice deux. | تمرین دو را بخوانید.
Écoutez et répétez. | گوش کنید و تکرار کنید.
Fermez votre livre, s’il vous plaît. | لطفاً کتابتان را ببندید.
Parlez lentement. | آهسته صحبت کنید.
Répétez ce mot, s’il vous plaît. | لطفاً این واژه را تکرار کنید.
Quel exercice, s’il vous plaît ? | کدام تمرین، لطفاً؟
L’exercice deux. | تمرین دو.''')
add('location','''La salle de bains est ici. | حمام اینجا است.
Où est le sac ? | کیف کجاست؟
Il est dans la cuisine. | در آشپزخانه است.
Mon cahier est dans la chambre. | دفترم در اتاق است.
Ben est dans la chambre ? | بن در اتاق است؟
Non, il est dans la cuisine. | نه، در آشپزخانه است.
Voici la cuisine. | اینجا آشپزخانه است.
La chambre est là-bas. | اتاق آنجا است.''')
add('prepositions','''Le stylo est à côté du livre. | خودکار کنار کتاب است.
La lampe est sur la table. | چراغ روی میز است.
Le cahier est sous le livre. | دفتر زیر کتاب است.
Le sac est derrière la chaise. | کیف پشت صندلی است.
La chaise est devant la table. | صندلی جلوی میز است.
Le livre est dans le sac. | کتاب داخل کیف است.
La table est à côté de la porte. | میز کنار در است.
Le stylo est sous le cahier. | خودکار زیر دفتر است.''')
add('home-furniture','''Il y a deux chaises. | دو صندلی هست.
Il n’y a pas de lit. | تختی نیست.
Il y a une table ? | میز هست؟
Oui, il y a une table. | بله، میز هست.
La lampe est sur la table. | چراغ روی میز است.
Le lit est à côté de la porte. | تخت کنار در است.
La fenêtre est ouverte. | پنجره باز است.
Le salon est petit et calme. | نشیمن کوچک و آرام است.''')
add('ordering-food','''Je voudrais du pain, s’il vous plaît. | مقداری نان می‌خواهم، لطفاً.
Un thé sans sucre, s’il vous plaît. | یک چای بدون شکر، لطفاً.
Avec du lait ou sans lait ? | با شیر یا بدون شیر؟
Sans lait, merci. | بدون شیر، ممنون.
Je voudrais un verre d’eau. | یک لیوان آب می‌خواهم.
La soupe est végétarienne ? | سوپ گیاهی است؟
Oui, elle est végétarienne. | بله، گیاهی است.
Merci, c’est tout. | ممنون، همین است.''')
add('cafe','''Un thé, s’il vous plaît. | یک چای، لطفاً.
Avec du lait, s’il vous plaît. | با شیر، لطفاً.
Sans sucre, merci. | بدون شکر، ممنون.
Vous voulez aussi de l’eau ? | آب هم می‌خواهید؟
Oui, une bouteille d’eau, s’il vous plaît. | بله، یک بطری آب، لطفاً.
Non, merci. | نه، ممنون.
L’addition, s’il vous plaît. | صورت‌حساب، لطفاً.
Vous payez ensemble ou séparément ? | با هم پرداخت می‌کنید یا جدا؟
Séparément, s’il vous plaît. | جدا، لطفاً.
Ensemble, s’il vous plaît. | با هم، لطفاً.
Ça fait cinq euros. | جمعاً پنج یورو می‌شود.
Voilà cinq euros. | بفرمایید پنج یورو.
Je peux payer ici ? | می‌توانم اینجا پرداخت کنم؟
Oui, à la caisse. | بله، پای صندوق.
Merci, au revoir ! | ممنون، خداحافظ!
Je voudrais un café sans lait. | یک قهوه بدون شیر می‌خواهم.''')
add('shopping-payment','''Combien coûte ce stylo ? | این خودکار چقدر قیمت دارد؟
Ce stylo coûte deux euros. | این خودکار دو یورو قیمت دارد.
Je prends ce cahier. | این دفتر را می‌خرم.
Vous payez en espèces ou par carte ? | نقد پرداخت می‌کنید یا با کارت؟
Je paie en espèces. | نقد پرداخت می‌کنم.
Par carte, s’il vous plaît. | با کارت، لطفاً.
Voici votre cahier. | بفرمایید دفتر شما.
Merci. Au revoir ! | ممنون. خداحافظ!''')
add('supermarket','''Où se trouve le pain ? | نان کجاست؟
Le pain est là-bas. | نان آنجا است.
Trois pommes, s’il vous plaît. | سه سیب، لطفاً.
Une bouteille d’eau, s’il vous plaît. | یک بطری آب، لطفاً.
Je voudrais un kilo de pommes. | یک کیلو سیب می‌خواهم.
Vous avez des œufs ? | تخم‌مرغ دارید؟
Non, nous n’avons pas d’œufs aujourd’hui. | نه، امروز تخم‌مرغ نداریم.
Un sac, s’il vous plaît. | یک کیسه، لطفاً.''')
add('clothes-shopping','''Je cherche une veste. | دنبال یک کاپشن می‌گردم.
Vous avez cette chemise en bleu ? | این پیراهن را به رنگ آبی دارید؟
Quelle est votre taille ? | سایز شما چیست؟
Taille S, s’il vous plaît. | سایز اسمال، لطفاً.
Cette chemise est trop petite. | این پیراهن زیادی کوچک است.
Cette veste me va. | این کاپشن اندازهٔ من است.
Combien coûte cette veste ? | این کاپشن چقدر قیمت دارد؟
Je prends cette veste. | این کاپشن را می‌خرم.''')
add('preferences','''Je préfère le riz. | برنج را ترجیح می‌دهم.
Tu préfères le pain ou le riz ? | نان را ترجیح می‌دهی یا برنج؟
Je n’aime pas beaucoup le café. | قهوه را خیلی دوست ندارم.
Tu préfères lire ou nager ? | مطالعه را ترجیح می‌دهی یا شنا را؟
Je préfère lire. | مطالعه را ترجیح می‌دهم.
Ben préfère l’eau. | بن آب را ترجیح می‌دهد.
Je préfère le thé au café. | چای را به قهوه ترجیح می‌دهم.
Aujourd’hui, je préfère étudier à la maison. | امروز ترجیح می‌دهم در خانه درس بخوانم.''')
add('comparisons','''Cette chambre est plus grande que ma chambre. | این اتاق از اتاق من بزرگ‌تر است.
Ce sac est plus petit que l’autre sac. | این کیف از آن کیف دیگر کوچک‌تر است.
Ce livre est moins cher que ce cahier. | این کتاب از این دفتر ارزان‌تر است.
Cette veste est moins chère ? | این کاپشن ارزان‌تر است؟
Non, la chemise est moins chère. | نه، پیراهن ارزان‌تر است.
Ma chambre est plus petite. | اتاق من کوچک‌تر است.
Cette table est plus grande. | این میز بزرگ‌تر است.
Ce cahier est moins cher que le livre. | این دفتر از کتاب ارزان‌تر است.''')
add('leisure','''J’aime écouter de la musique. | دوست دارم موسیقی گوش کنم.
Ben aime se promener. | بن قدم‌زدن را دوست دارد.
Le week-end, je lis. | آخر هفته مطالعه می‌کنم.
Tu nages bien ? | خوب شنا می‌کنی؟
Non, je ne nage pas bien. | نه، خوب شنا نمی‌کنم.
Léa aime lire des livres. | لئا کتاب خواندن را دوست دارد.
Nous écoutons de la musique ensemble. | با هم موسیقی گوش می‌کنیم.
Tu fais quoi le week-end ? | آخر هفته چه کار می‌کنی؟''')
add('weather','''Aujourd’hui, il fait chaud. | امروز هوا گرم است.
Il fait beau aujourd’hui. | امروز هوا خوب است.
Il ne pleut pas. | باران نمی‌بارد.
Il fait chaud aujourd’hui ? | امروز هوا گرم است؟
Non, il fait froid aujourd’hui. | نه، امروز هوا سرد است.
En été, il fait souvent chaud. | در تابستان اغلب هوا گرم است.
En hiver, il fait souvent froid. | در زمستان اغلب هوا سرد است.
Aujourd’hui, je reste à la maison. | امروز در خانه می‌مانم.''')
add('connectors','''Je parle français et Ben parle persan. | من فرانسوی صحبت می‌کنم و بن فارسی صحبت می‌کند.
Tu veux du thé ou du café ? | چای می‌خواهی یا قهوه؟
J’aime lire, mais aujourd’hui, je n’ai pas le temps. | مطالعه را دوست دارم، ولی امروز وقت ندارم.
Il fait froid, mais il ne pleut pas. | هوا سرد است، ولی باران نمی‌بارد.
Nous buvons du thé et nous étudions. | چای می‌نوشیم و درس می‌خوانیم.
J’ai faim et soif. | گرسنه و تشنه‌ام.
Je veux venir, mais je dois travailler. | می‌خواهم بیایم، ولی باید کار کنم.
Tu étudies ici ou à la maison ? | اینجا درس می‌خوانی یا در خانه؟''')
add('future-plans','''Demain, je vais étudier le français. | فردا قرار است فرانسوی درس بخوانم.
Ce soir, je vais lire un livre. | امشب قرار است کتاب بخوانم.
Samedi, je vais voir Ben. | شنبه قرار است بن را ببینم.
Tu vas faire quoi dimanche ? | یکشنبه چه کار خواهی کرد؟
Dimanche, je vais rester à la maison. | یکشنبه قرار است در خانه بمانم.
Nous allons étudier ensemble demain. | فردا قرار است با هم درس بخوانیم.
Demain, je vais faire les courses. | فردا قرار است خرید کنم.
Aujourd’hui, je ne suis pas libre, mais demain, oui. | امروز آزاد نیستم، ولی فردا بله.''')
add('invitations','''Tu es libre ce soir ? | امشب آزاد هستی؟
Oui, avec plaisir. | بله، با کمال میل.
Je suis désolé, je ne peux pas aujourd’hui. | متأسفم، امروز نمی‌توانم. (مرد)
Je suis désolée, je ne peux pas aujourd’hui. | متأسفم، امروز نمی‌توانم. (زن)
Dimanche, ça te va ? | یکشنبه برایت مناسب است؟
Oui, dimanche, c’est bien. | بله، یکشنبه خوب است.
On se retrouve à quinze heures ? | ساعت پانزده همدیگر را ببینیم؟
D’accord, à dimanche ! | بسیار خوب، تا یکشنبه!''')
add('suggestions','''On peut étudier ensemble ? | می‌توانیم با هم درس بخوانیم؟
On peut aller au café aujourd’hui. | می‌توانیم امروز به کافه برویم.
Bonne idée ! | فکر خوبی است!
Aujourd’hui, je ne suis pas libre. | امروز آزاد نیستم.
Alors, on étudie demain. | پس، فردا درس می‌خوانیم.
On peut rester à la maison. | می‌توانیم در خانه بمانیم.
On peut écouter de la musique ? | می‌توانیم موسیقی گوش کنیم؟
Oui, pourquoi pas ? | بله، چرا که نه؟''')
add('social-chat','''Tu habites où, Amir ? | امیر، کجا زندگی می‌کنی؟
J’habite à Lille. | در لیل زندگی می‌کنم.
Tu aimes faire quoi ? | دوست داری چه کار کنی؟
J’aime écouter de la musique. | دوست دارم موسیقی گوش کنم.
Moi aussi, j’aime lire. | من هم مطالعه را دوست دارم.
Tu es libre demain à dix heures ? | فردا ساعت ده آزاد هستی؟
Oui, à dix heures, c’est bien. | بله، ساعت ده خوب است.
Très bien, alors à demain ! | بسیار خوب، پس تا فردا!''')
add('directions','''Tournez à droite. | به راست بپیچید.
La poste est à gauche. | ادارهٔ پست سمت چپ است.
La gare est loin ? | ایستگاه قطار دور است؟
Non, elle est tout près. | نه، خیلی نزدیک است.
La banque est à côté de la poste. | بانک کنار ادارهٔ پست است.
Comment aller à la gare ? | چطور به ایستگاه قطار بروم؟
D’abord tout droit, puis à droite. | اول مستقیم، بعد به راست.
Merci pour votre aide. | بابت کمکتان ممنون.''')
add('public-transport','''Où est l’arrêt de bus ? | ایستگاه اتوبوس کجاست؟
L’arrêt est là-bas. | ایستگاه آنجا است.
Je vais au cours en bus. | با اتوبوس به کلاس می‌روم.
Le bus part à quelle heure ? | اتوبوس چه ساعتی حرکت می‌کند؟
Le bus part à huit heures. | اتوبوس ساعت هشت حرکت می‌کند.
Je descends ici. | اینجا پیاده می‌شوم.
Tu prends le bus ? | سوار اتوبوس می‌شوی؟
Non, je prends un taxi. | نه، تاکسی می‌گیرم.''')
add('travel-tickets','''Un aller-retour, s’il vous plaît. | یک بلیت رفت‌وبرگشت، لطفاً.
Combien coûte le billet ? | بلیت چقدر قیمت دارد؟
Le billet coûte dix euros. | بلیت ده یورو قیمت دارد.
Le train part de quel quai ? | قطار از کدام سکو حرکت می‌کند؟
Du quai quatre. | از سکوی چهار.
Ce train va à Lille ? | این قطار به لیل می‌رود؟
Oui, il part à onze heures. | بله، ساعت یازده حرکت می‌کند.
Un aller simple pour Paris, s’il vous plaît. | یک بلیت یک‌طرفه به پاریس، لطفاً.''')
add('hotel-stay','''Le petit déjeuner est à quelle heure ? | صبحانه چه ساعتی است؟
De sept heures à dix heures. | از هفت تا ده.
Où est ma chambre ? | اتاق من کجاست؟
Votre chambre est ici. | اتاق شما اینجا است.
Quel est le numéro de la chambre ? | شمارهٔ اتاق چیست؟
La chambre douze. | اتاق دوازده.
Le petit déjeuner est compris ? | آیا صبحانه در قیمت حساب شده است؟
Oui, il est compris. | بله، در قیمت حساب شده است.''')
add('polite-requests','''Pourriez-vous parler lentement ? | می‌شود آهسته صحبت کنید؟
Je peux m’asseoir ici ? | می‌توانم اینجا بنشینم؟
Oui, cette chaise est libre. | بله، این صندلی خالی است.
Vous pouvez répéter ce mot ? | می‌توانید این واژه را تکرار کنید؟
Je peux poser une question ? | می‌توانم یک سؤال بپرسم؟
Oui, allez-y. | بله، بفرمایید.
Pourriez-vous écrire votre nom ? | می‌شود نامتان را بنویسید؟
Merci beaucoup pour votre aide. | بابت کمکتان بسیار ممنون.''')
add('phone-messages','''Allô, bonjour. | الو، سلام.
Qui est à l’appareil ? | چه کسی پشت خط است؟
C’est Ben Martin. | بن مارتن هستم.
Je peux laisser un message ? | می‌توانم یک پیام بگذارم؟
Oui, bien sûr. Quel est votre nom ? | بله، حتماً. نام شما چیست؟
Rappelez-moi demain, s’il vous plaît. | لطفاً فردا با من تماس بگیرید.
Je vais appeler à dix heures. | قرار است ساعت ده تماس بگیرم.
Merci, au revoir. | ممنون، خداحافظ.''')
add('doctor-symptoms','''J’ai de la fièvre. | تب دارم.
J’ai mal à la gorge. | گلودرد دارم.
Je voudrais un rendez-vous. | یک نوبت می‌خواهم.
Depuis ce matin. | از امروز صبح.
Vous avez un rendez-vous libre aujourd’hui ? | امروز نوبت خالی دارید؟
Oui, à dix heures. | بله، ساعت ده.
Je ne me sens pas bien. | حالم خوب نیست.
Aidez-moi, s’il vous plaît. | لطفاً به من کمک کنید.''')
add('past-events','''Hier, j’ai travaillé. | دیروز کار کردم.
Le soir, j’ai étudié. | عصر درس خواندم.
J’ai fait les courses hier. | دیروز خرید کردم.
Ben a travaillé à la maison. | بن در خانه کار کرد.
Tu as étudié hier ? | دیروز درس خواندی؟
Oui, j’ai étudié. | بله، درس خواندم.
Tu as fait quoi hier ? | دیروز چه کار کردی؟
J’ai étudié à la maison. | در خانه درس خواندم.''')
add('reasons','''Pourquoi tu restes ici ? | چرا اینجا می‌مانی؟
J’ai de la fièvre. | تب دارم.
Je reste ici parce qu’il pleut. | اینجا می‌مانم، چون باران می‌بارد.
Je ne peux pas venir. Je dois travailler. | نمی‌توانم بیایم. باید کار کنم.
Je bois de l’eau parce que j’ai soif. | آب می‌نوشم، چون تشنه‌ام.
Il pleut, donc nous restons ici. | باران می‌بارد، پس اینجا می‌مانیم.
Demain, je suis libre. On se voit demain ? | فردا آزاد هستم. فردا همدیگر را ببینیم؟
Oui, demain, c’est bien. | بله، فردا خوب است.''')
add('connected-conversation','''Je m’appelle Sara et j’habite à Lille. | اسم من سارا است و در لیل زندگی می‌کنم.
Aujourd’hui, je ne peux pas parce que je dois travailler. | امروز نمی‌توانم، چون باید کار کنم.
Dimanche, je suis libre. Ça te va ? | یکشنبه آزاد هستم. برایت مناسب است؟
Oui, dimanche à quinze heures. À dimanche ! | بله، یکشنبه ساعت پانزده. تا یکشنبه!''')
