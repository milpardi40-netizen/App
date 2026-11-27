"""Design-only authoring source. Does not import or modify runtime lesson content."""
import json
from pathlib import Path

LESSONS = []

def add(slug, title, module, goal, pre, prerequisites, recall, vocabulary, grammar, avoid, examples, scene, listening, reading, writing, speaking, error):
    def pairs(value):
        return [dict(zip(('en', 'fa'), row.split(' | ', 1))) for row in value.strip().split('\n')]
    LESSONS.append(dict(
        proposedIndex=len(LESSONS)+1, id=slug, titleFa=title, module=module,
        outcomeFa=goal, preA1Ids=pre.split(), prerequisiteIds=prerequisites.split(),
        retrievalFa=recall, vocabularyFa=vocabulary, grammarFa=grammar,
        outOfScopeFa=avoid, examples=pairs(examples),
        scene=[dict(role='partner' if i % 2 == 0 else 'learner', **p) for i,p in enumerate(pairs(scene))],
        listening=dict(zip(('passage','questionFa','answer'),listening)),
        reading=dict(zip(('passage','questionFa','answer'),reading)),
        writingFa=writing, speakingFa=speaking, commonErrorFa=error,
    ))

add('foundation-introducing-yourself','معرفی خود و آشنایی',1,
'نام، کشور و شهر محل زندگی را بگویم و همین اطلاعات را از دیگری بپرسم.',
'prea1-01-hello prea1-04-i-am prea1-10-review','',
'سلام، I am و Nice to meet you را از Pre-A1 بدون متن بازیابی کن.',
'name=نام؛ country=کشور؛ city=شهر؛ live=زندگی‌کردن؛ from=اهلِ / از',
'My name is / I am؛ پرسش What is your name?؛ I am from؛ I live in به‌صورت قالب آمادهٔ معرفی. تحلیل حال ساده و نظام پرسش با do در درس روزمره می‌آید؛ در این درس همهٔ صرف فعل live امتحان نمی‌شود.',
'شغل و مهارت کاری، همهٔ ضمیرها، خانوادهٔ گسترده و معرفی طولانی در همین درس تدریس نشود.',
'''Hello, my name is Sara. | سلام، اسم من سارا است.
What is your name? | اسم شما چیست؟
Nice to meet you. | از آشنایی با شما خوشحالم.
I am from Iran. | من اهل ایران هستم.
Where are you from? | شما اهل کجا هستید؟
I live in Tehran. | من در تهران زندگی می‌کنم.''',
'''Hello! My name is Ben. What is your name? | سلام! اسم من بن است. اسم شما چیست؟
My name is Sara. Nice to meet you. | اسم من سارا است. از آشنایی با شما خوشحالم.
Nice to meet you too. Where are you from? | من هم از آشنایی با شما خوشحالم. اهل کجا هستید؟
I am from Iran. I live in Tehran. | من اهل ایران هستم. در تهران زندگی می‌کنم.''',
('Hello, my name is Anna. I am from Spain. I live in London.','آنا اهل کدام کشور است؟','Spain'),
('My name is Reza. I am from Iran. I live in Leeds.','رضا در چه شهری زندگی می‌کند؟','Leeds'),
'با اطلاعات خیالی سه جمله دربارهٔ نام، کشور و شهر بنویس.',
'بدون حفظ متن، نام خیالی، کشور و شهر خود را در سه جمله معرفی کن.',
'I from به جای I am from؛ یکی‌گرفتن کشور مبدأ با شهر محل زندگی.')

add('foundation-alphabet-and-spelling','نام و هجی‌کردن',1,
'نام کوتاهی را هجی کنم و هجی نام مخاطب را بفهمم.',
'prea1-01-hello prea1-08-please-thankyou','foundation-introducing-yourself',
'نام خودت را بگو و نام هم‌کلاسی را بپرس.',
'spell=هجی‌کردن؛ letter=حرف؛ again=دوباره؛ slowly=آهسته؛ first name=نام کوچک؛ last name=نام خانوادگی',
'How do you spell ...? و Can you spell ...? فعلاً دو قالب آماده‌اند. نام حروف A–Z در گروه‌های کوتاه و تقابل A/E/I و G/J؛ انگلیسی حرف‌به‌حرف خوانده نمی‌شود.',
'فهرست الفبا یک جملهٔ اجباری طولانی نباشد؛ نوشتن ایمیل، نشانی و صرف کامل do/can وارد نشود.',
'''My first name is Sara. | نام کوچک من سارا است.
My last name is Ali. | نام خانوادگی من علی است.
How do you spell Sara? | سارا را چطور هجی می‌کنید؟
S-A-R-A. | اس، اِی، آر، اِی.
Please spell it again. | لطفاً دوباره آن را هجی کنید.
A, not E. | اِی، نه ای.''',
'''What is your first name? | نام کوچک شما چیست؟
My first name is Sara. | نام کوچک من سارا است.
How do you spell Sara? | سارا را چطور هجی می‌کنید؟
S-A-R-A. | اس، اِی، آر، اِی.''',
('My name is Tim. T-I-M.','کدام نام هجی شد؟','Tim'),
('First name: Sara. Last name: Ali.','نام خانوادگی چیست؟','Ali'),
'یک نام خیالی کوتاه و هجی آن را بنویس؛ مثال‌های دیگر لازم نیست جملهٔ کامل باشند.',
'نام کوتاه خیالی را بگو و حرف‌به‌حرف هجی کن؛ اگر لازم بود با Please spell it again درخواست تکرار کن.',
'نام حرف با صدای آن در کلمه یکی نیست؛ هجی نام با تلفظ خود نام فرق دارد.')

add('foundation-asking-for-help','درخواست کمک و روشن‌کردن معنی',1,
'در کلاس یا گفت‌وگوی ساده کمک، تکرار و آهسته‌گویی بخواهم.',
'prea1-03-yes-no prea1-08-please-thankyou prea1-13-every-day','foundation-introducing-yourself foundation-alphabet-and-spelling',
'لطفاً، ممنون و درخواست هجی نام را بازیابی کن.',
'help=کمک؛ understand=فهمیدن؛ repeat=تکرارکردن؛ say=گفتن؛ slowly=آهسته؛ word=واژه',
'Can you help me?؛ Please + فعل؛ I do not understand به‌صورت قالب؛ this word از اشارهٔ آشنا. تعمیم do در درس روزمره خواهد آمد.',
'عددهای ۱ تا ۱۰۰، همهٔ ماه‌ها، تقویم و مسیریابی از هدف این درس خارج‌اند و به درس‌های اختصاصی منتقل می‌شوند.',
'''Excuse me. | ببخشید. (برای جلب توجه)
Can you help me, please? | می‌توانید لطفاً به من کمک کنید؟
I do not understand. | متوجه نمی‌شوم.
Please speak slowly. | لطفاً آهسته صحبت کنید.
Please say that again. | لطفاً آن را دوباره بگویید.
Thank you. I understand now. | ممنون. الان متوجه می‌شوم.''',
'''Hello. My name is Ben. | سلام. اسم من بن است.
Please say that again, slowly. | لطفاً آن را دوباره و آهسته بگویید.
My name is Ben. B-E-N. | اسم من بن است. بی، ای، اِن.
Thank you. I understand now. | ممنون. الان متوجه می‌شوم.''',
('Please speak slowly. I do not understand.','گوینده از مخاطب چه می‌خواهد؟','Speak slowly.'),
('New word: city. City means شهر. Please say city again.','کدام واژه باید تکرار شود؟','city'),
'دو درخواست برای آهسته‌گویی و تکرار بنویس؛ لازم نیست معرفی بلند بنویسی.',
'فرض کن نام مخاطب را نفهمیده‌ای؛ درخواست تکرار کن و بعد تشکر کن.',
'استفاده از Sorry بدون درخواست روشن؛ حذف please در بافت مؤدبانه به‌عنوان خطای دستوری نمره‌گذاری نشود.')

add('foundation-pronouns-and-be','اشخاص و جمله‌های کوتاه با be',1,
'خودم و افراد آشنا را با ضمیر درست معرفی یا توصیف کنم و سؤال ساده با be بسازم.',
'prea1-04-i-am prea1-11-at-home prea1-12-people','foundation-introducing-yourself foundation-asking-for-help',
'I am، He is و They are آشنای Pre-A1 را با نام‌های خیالی تطبیق بده.',
'I/you/he/she/it/we/they=ضمیرهای فاعلی؛ student=دانش‌آموز/دانشجو؛ teacher=معلم؛ ready=آماده',
'am/is/are؛ جایگزینی اسم با ضمیر؛ be + not؛ جابه‌جایی be در سؤال؛ صورت کوتاه I’m/isn’t/aren’t کنار صورت کامل، نه هدف املایی جداگانه.',
'همهٔ انواع فعل، زمان‌های گذشته و استمراری و ضمیرهای مفعولی تدریس نشوند.',
'''I am a student. | من دانشجو هستم.
She is my teacher. | او معلم من است. (زن)
We are ready. | ما آماده هستیم.
He is not tired. | او خسته نیست. (مرد)
Are you a student? | آیا شما دانشجو هستید؟
Yes, I am. | بله، هستم.''',
'''Are you a student? | آیا شما دانشجو هستید؟
Yes, I am. I am Sara. | بله، هستم. من سارا هستم.
Is Ben your teacher? | آیا بن معلم شماست؟
No, he is not. He is a student too. | نه، نیست. او هم دانشجو است.''',
('Anna is a teacher. Ben and Tim are students.','چه کسی معلم است؟','Anna'),
('I am Sara. This is Anna. She is my teacher. We are ready.','She به چه کسی اشاره می‌کند؟','Anna'),
'سه جمله با I، he یا she و we بنویس؛ یکی منفی باشد.',
'خودت و یک هم‌کلاسی خیالی را معرفی کن و یک سؤال با be بپرس.',
'I is / They is؛ حذف a پیش از شغل مفرد؛ برای he/she جنسیت فرد فرض نشود و در کارت معرفی مشخص باشد.')

add('foundation-numbers-and-contact','عدد، سن و شمارهٔ تماس',2,
'سن و شمارهٔ تماس خیالی را بگویم و تفاوت عدد کامل با رقم‌های شماره را بفهمم.',
'prea1-05-numbers prea1-07-i-have','foundation-alphabet-and-spelling foundation-pronouns-and-be',
'اعداد ۱ تا ۱۰ و هجی نام را بازیابی کن.',
'zero=صفر؛ eleven–nineteen=۱۱ تا ۱۹؛ twenty/thirty/forty/fifty/sixty/seventy/eighty/ninety=دهگان؛ hundred=صد؛ number=شماره؛ age=سن',
'ترکیب دهگان و یکان تا ۱۰۰؛ How old are you? / I am ...؛ What is your phone number?؛ صفر به‌صورت zero و آشنایی شنیداری با oh. phone number رقم‌به‌رقم.',
'تقویم، تاریخ تولد کامل، قیمت اعشاری و ایمیل در این درس جمع نشوند.',
'''I am twenty-one. | من بیست‌ویک سال دارم.
How old are you? | چند سال دارید؟
She is thirty. | او سی سال دارد. (زن)
Thirteen, not thirty. | سیزده، نه سی.
What is your phone number? | شمارهٔ تلفن شما چیست؟
My number is zero seven one two. | شمارهٔ من صفر، هفت، یک، دو است.''',
'''What is your name? | اسم شما چیست؟
My name is Tim. | اسم من تیم است.
How old are you, Tim? | تیم، چند سال داری؟
I am twenty-one. | من بیست‌ویک سال دارم.''',
('My number is zero seven two four.','کد چهاررقمی چیست؟','0724'),
('Name: Anna. Age: 30. Contact code: 0712.','آنا چند سال دارد؟','30'),
'برای شخصیت خیالی یک سن و کد چهاررقمی تماس بنویس؛ شمارهٔ واقعی لازم نیست.',
'یک سن را به‌صورت عدد کامل و یک کد را رقم‌به‌رقم بگو؛ سپس برای اطمینان درخواست تکرار کن.',
'thirteen/thirty و fifteen/fifty؛ شماره به عدد چندرقمی تبدیل نشود. نمونهٔ چهاررقمی کد تمرینی است، نه طول معمول شمارهٔ تلفن.')

add('foundation-family-and-possessions','خانواده و مالکیت ساده',2,
'دو عضو خانوادهٔ خیالی را معرفی کنم و بگویم یک وسیله مال چه کسی است.',
'prea1-07-i-have prea1-09-this-is prea1-11-at-home prea1-12-people','foundation-pronouns-and-be foundation-numbers-and-contact',
'This is my ... و his/her name و I have را یادآوری کن.',
'mother=مادر؛ father=پدر؛ sister=خواهر؛ brother=برادر؛ family=خانواده؛ bag=کیف',
'my/your/his/her/our/their پیش از اسم؛ I have / Do you have از قبل؛ مالکیت اسم + ’s برای یک مالک؛ جمع معمولی -s بدون فهرست استثناها.',
'خویشاوندان دور، گذشتهٔ زندگی‌نامه و have got در کنار have یک‌جا تدریس نشوند؛ s مالکیت از is کوتاه‌شده جدا شود.',
'''This is my sister, Anna. | این خواهر من، آنا است.
Her name is Anna. | اسم او آنا است.
I have two brothers. | من دو برادر دارم.
This is Ben’s bag. | این کیف بن است.
Is this your book? | این کتاب شماست؟
No, it is my brother’s book. | نه، کتاب برادرم است.''',
'''Who is this? | این شخص کیست؟
This is my sister, Anna. | این خواهر من، آنا است.
Is this her bag? | آیا این کیف اوست؟
Yes, it is. | بله، همین‌طور است.''',
('This is my brother, Tim. His bag is here.','کیف متعلق به چه کسی است؟','Tim'),
('Ben has a sister. Her name is Anna. This is Anna’s book.','کتاب مال چه کسی است؟','Anna'),
'با خانوادهٔ کاملاً خیالی دو شخص و مالک یک وسیله را در سه جمله معرفی کن.',
'دو عضو یک خانوادهٔ خیالی را معرفی کن و یک سؤال دربارهٔ مالکیت وسیله بپرس.',
'انتخاب his/her به مالک مربوط است نه جنس دستوری وسیله؛ Ben’s bag با Ben is اشتباه نشود. has در خواندن همراه توضیح کوتاه و در روزمره تثبیت شود.')

add('foundation-objects-and-places','وسایل و جای آن‌ها',2,
'نام و جای چند وسیلهٔ آشنا را بپرسم و بگویم.',
'prea1-09-this-is prea1-11-at-home','foundation-family-and-possessions',
'This/that و These are my books را از قبل بازیابی کن.',
'key=کلید؛ table=میز؛ chair=صندلی؛ room=اتاق؛ in=داخل؛ on=روی؛ under=زیر؛ next to=کنار',
'this/that/these/those؛ is/are برای مفرد/جمع؛ Where is/are؛ there is/are برای وجود؛ a/an برحسب صدای آغاز، نه صرفاً حرف.',
'جهت حرکت، کل شبکهٔ شهر و حروف اضافهٔ انتزاعی وارد نشوند.',
'''Where is my book? | کتاب من کجاست؟
It is on the table. | روی میز است.
The bag is under the chair. | کیف زیر صندلی است.
There is a key in the bag. | یک کلید داخل کیف است.
These are my books. | این‌ها کتاب‌های من هستند.
There are two chairs in the room. | دو صندلی در اتاق هست.''',
'''Where is my phone? | گوشی من کجاست؟
It is on the table. | روی میز است.
Is my bag there too? | آیا کیفم هم آنجاست؟
No, it is under the chair. | نه، زیر صندلی است.''',
('The book is on the table. The key is in the bag.','کلید کجاست؟','In the bag.'),
('There is a table in the room. Two books are on the table. A bag is under it.','چند کتاب روی میز است؟','Two.'),
'بدون نیاز به عکس، یک اتاق خیالی با دو وسیله و جای آن‌ها را در سه جمله توصیف کن.',
'در یک اتاق خیالی جای دو وسیله را بگو و جای یک وسیله را بپرس.',
'There is two؛ خلط there is با it is؛ از تصویر یا اشارهٔ بیرونیِ موجودنبودن استفاده نشود.')

add('foundation-time-and-calendar','ساعت و تقویم کاربردی',3,
'زمان کلاس را با روز و ساعت بگویم و یک تاریخ کوتاه را بخوانم.',
'prea1-02-bye prea1-13-every-day','foundation-numbers-and-contact foundation-pronouns-and-be',
'عددها، tomorrow و See you tomorrow را یادآوری کن.',
'today=امروز؛ tomorrow=فردا؛ Monday–Sunday=روزهای هفته؛ January–December=ماه‌ها؛ morning=صبح؛ afternoon=بعدازظهر؛ o’clock=سر ساعت',
'What time / What day؛ at + ساعت، on + روز/تاریخ، in + ماه؛ ساعت دیجیتال سپس half past/quarter past/to؛ تاریخ نوشتاری بی‌ابهام 3 May و خواندن May third یا the third of May با پذیرش هر دو.',
'کل روزها و ماه‌ها در یک هدف گفتاری طولانی امتحان نشوند؛ سال‌های پیچیده و منطقهٔ زمانی هدف نیستند.',
'''What time is it? | ساعت چند است؟
It is nine thirty. | ساعت نه و نیم است.
The class is on Monday. | کلاس دوشنبه است.
It starts at ten. | ساعت ده شروع می‌شود.
Today is the third of May. | امروز سوم ماه مه است.
My class is in June. | کلاس من در ماه ژوئن است.''',
'''What day is the class? | کلاس چه روزی است؟
It is on Monday. | دوشنبه است.
What time does it start? | ساعت چند شروع می‌شود؟
At ten in the morning. | ساعت ده صبح.''',
('The class is on Tuesday at nine thirty in the morning.','کلاس چه ساعتی است؟','9:30 a.m.'),
('English class: Monday, 3 May, 10:00 a.m. Room 2.','کلاس در کدام اتاق است؟','Room 2.'),
'یک اعلان خیالی برای کلاس با روز، ساعت و یک تاریخ بنویس؛ از تاریخ مبهم مثل 03/05 پرهیز کن.',
'روز و ساعت یک کلاس را بگو؛ سپس روز و ساعت کلاس دیگری را بپرس.',
'on Monday نه in Monday؛ What time does it start فعلاً قالب آماده است و does در درس بعد توضیح داده می‌شود؛ در نمونه starts هم s معرفی کوتاه دارد.')

add('foundation-everyday-routine','کارهای روزمره',3,
'برنامهٔ معمول خودم و یک فرد خیالی را با زمان ساده شرح بدهم.',
'prea1-13-every-day prea1-14-i-like','foundation-time-and-calendar foundation-family-and-possessions',
'I go to work و ساعت و روز را بازیابی کن.',
'get up=بیدارشدن/بلندشدن؛ work=کارکردن؛ study=درس‌خواندن؛ eat=خوردن؛ breakfast=صبحانه؛ every day=هر روز',
'حال ساده I/you/we/they و he/she + s؛ do/does برای سؤال و don’t/doesn’t برای نفی؛ فعل اصلی پس از does بدون s. has فقط با مثال پربسامد.',
'حال استمراری در همین درس تدریس نشود؛ همهٔ قیدهای بسامد و تمام تغییرات املایی s حفظ نشوند.',
'''I get up at seven. | من ساعت هفت بیدار می‌شوم.
I eat breakfast at home. | من در خانه صبحانه می‌خورم.
She works on Monday. | او دوشنبه کار می‌کند. (زن)
Do you study every day? | آیا هر روز درس می‌خوانید؟
He does not work on Sunday. | او یکشنبه کار نمی‌کند. (مرد)
What time does she get up? | او چه ساعتی بیدار می‌شود؟ (زن)''',
'''What time do you get up? | چه ساعتی بیدار می‌شوی؟
I get up at seven. | ساعت هفت بیدار می‌شوم.
Do you work on Sunday? | یکشنبه کار می‌کنی؟
No, I do not. I study at home. | نه. در خانه درس می‌خوانم.''',
('Anna gets up at seven. She starts work at nine.','آنا کار را چه ساعتی شروع می‌کند؟','At nine.'),
('Ben studies on Monday and Tuesday. He does not study on Sunday.','بن چه روزی درس نمی‌خواند؟','Sunday.'),
'سه یا چهار جمله دربارهٔ یک روز معمول خیالی بنویس؛ یکی منفی باشد.',
'برنامهٔ یک روزت را در سه جمله بگو و با do یا does دربارهٔ برنامهٔ فرد دیگری سؤال کن.',
'Does she works / She don’t؛ حذف s سوم‌شخص؛ پاسخ تمرین با معیار معنی و الگوی هدف بررسی شود، نه اجبار به جملهٔ حفظی.')

add('survival-current-activities','الان چه کاری انجام می‌دهیم؟',3,
'فعالیت جاری را توصیف کنم و آن را از عادت روزانه جدا کنم.',
'prea1-13-every-day','foundation-everyday-routine foundation-objects-and-places',
'I work every day را در برابر now مقایسه کن و am/is/are را بازیابی کن.',
'now=الان؛ read=خواندن؛ write=نوشتن؛ wait=منتظربودن؛ cook=آشپزی‌کردن؛ listen=گوش‌دادن',
'am/is/are + ing، نفی و سؤال؛ چند فعل آشنا؛ تفاوت I work every day / I am working now؛ بدون فهرست افعال حالت و استثناها.',
'اسم مفعول، حال کامل و برنامهٔ قطعی آینده با استمراری هدف این درس نیستند.',
'''I am reading now. | من الان دارم مطالعه می‌کنم.
She is writing a message. | او دارد یک پیام می‌نویسد. (زن)
We are waiting for Ben. | ما منتظر بن هستیم.
Are you cooking? | آیا داری آشپزی می‌کنی؟
No, I am not. | نه.
I work every day, but I am not working now. | من هر روز کار می‌کنم، اما الان کار نمی‌کنم.''',
'''What are you doing now? | الان چه کار می‌کنی؟
I am reading. | دارم مطالعه می‌کنم.
Is Ben reading too? | آیا بن هم دارد مطالعه می‌کند؟
No, he is writing a message. | نه، او دارد یک پیام می‌نویسد.''',
('Anna is cooking. Ben is reading in the room.','بن الان چه کار می‌کند؟','He is reading.'),
('I study every day. Today I am at home. I am writing a message now.','کدام کار همین الان در حال انجام است؟','Writing a message.'),
'دو جمله دربارهٔ الان و یک جمله دربارهٔ عادت روزانهٔ شخصیت خیالی بنویس.',
'بدون نیاز به عکس، دو فعالیت خیالیِ الان را بگو و یک سؤال استمراری بپرس.',
'I reading؛ I am read؛ تعمیم حال استمراری به I am liking tea در هدف این درس پذیرفته نشود.')

add('survival-hobbies-and-free-time','علاقه‌ها و اوقات فراغت',4,
'دو علاقه و یک بی‌علاقگی را بیان کنم و دربارهٔ علاقهٔ دیگری بپرسم.',
'prea1-14-i-like','foundation-everyday-routine survival-current-activities',
'I like tea و Do you like ... و خواندن را بازیابی کن.',
'music=موسیقی؛ book=کتاب؛ football=فوتبال؛ walk=پیاده‌روی‌کردن؛ weekend=آخر هفته؛ often=اغلب',
'like + اسم / ing؛ do/does؛ often و sometimes در چند جایگاه نمونه؛ and/but برای پیوند دو جمله. like reading با am reading مقایسه شود.',
'مقایسهٔ پیشرفته، would rather، همهٔ فعل‌های دو ساختاری و اصطلاحات ورزش وارد نشوند.',
'''I like music. | من موسیقی دوست دارم.
I like reading books. | من کتاب‌خواندن را دوست دارم.
I do not like football. | من فوتبال دوست ندارم.
Do you like cooking? | آشپزی را دوست داری؟
She often walks at the weekend. | او اغلب آخر هفته پیاده‌روی می‌کند. (زن)
I like tea, but I do not like coffee. | من چای دوست دارم، اما قهوه دوست ندارم.''',
'''What do you do at the weekend? | آخر هفته چه کار می‌کنی؟
I read books. I like reading. | کتاب می‌خوانم. مطالعه را دوست دارم.
Do you like music too? | موسیقی را هم دوست داری؟
Yes, I do. | بله.''',
('I like music and reading. I do not like football.','گوینده چه چیزی را دوست ندارد؟','Football.'),
('Anna reads at the weekend. Ben often cooks. They both like music.','چه کسی اغلب آشپزی می‌کند؟','Ben.'),
'سه جمله دربارهٔ علاقه‌های یک شخصیت خیالی بنویس؛ and یا but را یک بار به کار ببر.',
'دو علاقه را بگو و یک سؤال دربارهٔ علاقهٔ مخاطب بپرس.',
'I like read؛ مخلوط‌کردن like reading و am reading؛ استفادهٔ درست از like to read هم رد نشود.')

add('survival-weather-and-seasons','آب‌وهوا و فصل‌ها',4,
'وضع فعلی هوا و فصل مورد علاقه را ساده بیان کنم.',
'prea1-04-i-am prea1-14-i-like','survival-current-activities survival-hobbies-and-free-time',
'It is و I like و now را بازیابی کن.',
'weather=آب‌وهوا؛ sunny=آفتابی؛ cold=سرد؛ hot=گرم؛ rain=باریدن باران؛ spring/summer/autumn/winter=فصل‌ها',
'It is + صفت برای هوا؛ It is raining؛ in + فصل؛ because برای یک علت ساده با واژه‌های آشنا؛ یک it غیرارجاعی، نه ضمیر برای جسم مشخص.',
'پیش‌بینی با will، داده‌های هواشناسی، sunrise/sunset و گزارش بلند هدف نیستند.',
'''It is sunny today. | امروز هوا آفتابی است.
It is cold in winter. | در زمستان هوا سرد است.
It is raining now. | الان باران می‌بارد.
What is the weather like? | هوا چطور است؟
I like spring. | من بهار را دوست دارم.
I like summer because it is hot. | تابستان را دوست دارم، چون هوا گرم است.''',
'''What is the weather like today? | امروز هوا چطور است؟
It is sunny, but it is cold. | آفتابی است، اما سرد است.
Do you like cold weather? | هوای سرد را دوست داری؟
No, I do not. I like summer. | نه. من تابستان را دوست دارم.''',
('It is cold today. It is raining too.','آیا امروز هوا آفتابی است؟','No.'),
('Spring: warm. Summer: hot. Winter: cold. Anna likes spring.','فصل مورد علاقهٔ آنا چیست؟','Spring.'),
'سه جمله برای هوای خیالی امروز و فصل مورد علاقه بنویس؛ یک علت ساده اختیاری است.',
'هوای امروزِ خیالی را توصیف کن و بگو کدام فصل را دوست داری.',
'Is cold بدون it؛ I am cold دربارهٔ احساس فرد است و با It is cold دربارهٔ هوا فرق دارد.')

add('foundation-buying-something','خرید ساده و قیمت',5,
'یک کالای ساده بخواهم، قیمت را بپرسم و روش پرداخت را بگویم.',
'prea1-08-please-thankyou prea1-09-this-is','foundation-numbers-and-contact foundation-objects-and-places',
'This/that، please، عددهای ۱ تا ۱۰۰ و I want را بازیابی کن.',
'price=قیمت؛ cost=قیمت‌داشتن؛ pound=پوند؛ cash=پول نقد؛ card=کارت؛ buy=خریدن',
'How much is ...? / How much are ...?؛ I would like به‌صورت درخواست مؤدبانهٔ آماده؛ Can I pay by card?؛ a/one/two + اسم.',
'تخفیف، مرجوعی، شرطی، مذاکره و همهٔ پول‌های جهان هدف نیستند؛ قیمت اعشاری پیچیده به این مرحله تحمیل نشود.',
'''I would like this book, please. | این کتاب را می‌خواهم، لطفاً.
How much is it? | قیمتش چقدر است؟
It is ten pounds. | ده پوند است.
How much are these pens? | قیمت این خودکارها چقدر است؟
Can I pay by card? | می‌توانم با کارت پرداخت کنم؟
Yes. Here you are. | بله. بفرمایید.''',
'''Hello. Can I help you? | سلام. می‌توانم کمکتان کنم؟
I would like this book. How much is it? | این کتاب را می‌خواهم. قیمتش چقدر است؟
It is ten pounds. | ده پوند است.
Here you are. Thank you. | بفرمایید. ممنون.''',
('The book is twelve pounds. The pen is two pounds.','قیمت کتاب چقدر است؟','Twelve pounds.'),
('Book: £10. Pen: £2. Pay by cash or card.','آیا پرداخت با کارت ممکن است؟','Yes.'),
'یک درخواست خرید، یک پرسش قیمت و یک پرسش روش پرداخت بنویس.',
'کالای خیالی بخواه، قیمت را بپرس و پس از شنیدن قیمت تشکر کن.',
'How many برای قیمت؛ How much is these؛ پول و قیمت در کل صحنه ثابت بماند.')

add('survival-shopping-and-clothing','خرید لباس با رنگ و اندازه',5,
'لباسی با رنگ و اندازهٔ مشخص بخواهم و دربارهٔ اندازه‌بودن آن بگویم.',
'prea1-09-this-is','foundation-buying-something foundation-objects-and-places',
'قیمت‌پرسیدن و this/these را بازیابی کن.',
'shirt=پیراهن؛ coat=پالتو/کت؛ shoes=کفش؛ blue=آبی؛ red=قرمز؛ small/medium/large=کوچک/متوسط/بزرگ؛ size=اندازه',
'رنگ پیش از اسم؛ a blue shirt؛ these shoes؛ too + صفت برای too small؛ Can I try it on? به‌صورت قالب. it/them در همین دو نمونه معرفی شوند.',
'مقایسهٔ تفضیلی، جنس پارچه، سیاست مرجوعی و شکایت چندمرحله‌ای وارد نشوند.',
'''I would like a blue shirt. | یک پیراهن آبی می‌خواهم.
Do you have a medium? | اندازهٔ متوسط دارید؟
Can I try it on? | می‌توانم آن را امتحان کنم؟
It is too small. | بیش از حد کوچک است.
These shoes are red. | این کفش‌ها قرمز هستند.
How much is the large shirt? | قیمت پیراهن اندازهٔ بزرگ چقدر است؟''',
'''What colour would you like? | چه رنگی می‌خواهید؟
Blue, please. Do you have a medium? | آبی، لطفاً. اندازهٔ متوسط دارید؟
Yes. Here you are. | بله. بفرمایید.
Thank you. Can I try it on? | ممنون. می‌توانم آن را امتحان کنم؟''',
('I would like a red shirt, size small.','مشتری چه رنگی می‌خواهد؟','Red.'),
('Blue shirt: medium, £20. Red shirt: small, £15.','قیمت پیراهن آبی چقدر است؟','£20.'),
'برای یک لباس خیالی رنگ، اندازه و درخواست امتحان‌کردن را بنویس.',
'لباسی بخواه و اگر اندازه مناسب نبود با too small یا too large بگو.',
'shirt blue به جای blue shirt؛ It are؛ colour/color هر دو پذیرفته شوند.')

add('survival-cafe-and-food','سفارش در کافه',5,
'یک نوشیدنی و خوراکی سفارش بدهم، ترجیح ساده بگویم و صورت‌حساب بخواهم.',
'prea1-08-please-thankyou prea1-14-i-like','foundation-buying-something survival-hobbies-and-free-time',
'Tea, please و I would like و قیمت را بازیابی کن.',
'coffee=قهوه؛ tea=چای؛ sandwich=ساندویچ؛ milk=شیر؛ sugar=شکر؛ bill=صورت‌حساب؛ with/without=با/بدون',
'a cup of / a glass of در مقدارهای ساده؛ a sandwich و some water؛ with/without؛ I’d like کنار I would like؛ bill please. برای نوشیدنی a tea در بافت سفارش هم درست است.',
'همهٔ قواعد شمارش‌پذیری، رژیم غذایی تخصصی، دستور پخت و ادعای رفع حساسیت هدف نیستند.',
'''I would like a cup of tea, please. | یک فنجان چای می‌خواهم، لطفاً.
With milk, please. | با شیر، لطفاً.
No sugar, thank you. | شکر نه، ممنون.
A sandwich too, please. | یک ساندویچ هم لطفاً.
How much is the sandwich? | قیمت ساندویچ چقدر است؟
The bill, please. | صورت‌حساب، لطفاً.''',
'''What would you like? | چه میل دارید؟
A cup of tea and a sandwich, please. | یک فنجان چای و یک ساندویچ، لطفاً.
Tea with milk? | چای با شیر؟
Yes, please. No sugar. | بله، لطفاً. بدون شکر.''',
('A coffee with milk, please. No sugar.','قهوه با چه چیزی سفارش داده شده است؟','Milk, no sugar.'),
('Tea £2. Coffee £3. Sandwich £5. Milk is available.','قیمت ساندویچ چقدر است؟','£5.'),
'یک سفارش کوتاه با یک نوشیدنی، یک خوراکی و یک ترجیح بنویس.',
'سفارش بده؛ به یک پرسش دربارهٔ شیر یا شکر جواب بده و صورت‌حساب بخواه.',
'ردکردن a tea به‌عنوان همیشه غلط؛ استفاده از with no sugar هم درست است؛ ضمیرهای صحنه با نقش مشتری/فروشنده ثابت بمانند.')

add('survival-directions-and-neighborhood','پرسیدن مسیر کوتاه',6,
'جای یک مکان عمومی را بپرسم و مسیر دو یا سه‌مرحله‌ای ساده بفهمم.',
'prea1-03-yes-no prea1-13-every-day','foundation-objects-and-places foundation-asking-for-help',
'Where is، next to و درخواست آهسته‌گویی را بازیابی کن.',
'station=ایستگاه؛ bank=بانک؛ street=خیابان؛ left=چپ؛ right=راست؛ straight=مستقیم؛ near=نزدیک',
'Where is ...?؛ امر Go/Turn؛ next to/opposite؛ first/then برای ترتیب؛ Is it near? با be. مسیر با متن خودبسنده، بدون نقشهٔ غایب.',
'توصیف شبکهٔ پیچیده، فاصلهٔ دقیق، شرطی مسیر و عبارت‌های چندمعنایی طولانی وارد نشوند.',
'''Excuse me, where is the station? | ببخشید، ایستگاه کجاست؟
Go straight. | مستقیم بروید.
Turn left at the bank. | کنار بانک به چپ بپیچید.
The station is next to the café. | ایستگاه کنار کافه است.
Is it near here? | به اینجا نزدیک است؟
Yes, it is. | بله، نزدیک است.''',
'''Can I help you? | می‌توانم کمکتان کنم؟
Yes, please. Where is the station? | بله، لطفاً. ایستگاه کجاست؟
Go straight, then turn left at the bank. | مستقیم بروید، بعد کنار بانک به چپ بپیچید.
Straight, then left. Thank you. | مستقیم، بعد چپ. ممنون.''',
('Go straight. Turn right at the café. The bank is there.','کنار کافه به کدام سمت باید پیچید؟','Right.'),
('The café is next to the bank. The station is opposite the bank.','چه مکانی روبه‌روی بانک است؟','The station.'),
'مسیر خیالی دو مرحله‌ای از بانک به کافه بنویس؛ همهٔ اطلاعات لازم در متن خودت باشد.',
'جای ایستگاه را بپرس و برای اطمینان دو دستور شنیده‌شده را بازگو کن.',
'مخلوط‌شدن left و right؛ حرکت مسیر نباید به مکان یا نقشهٔ معرفی‌نشده وابسته باشد.')

add('survival-public-transport','اتوبوس و قطار شهری',6,
'بلیت شهری بخواهم و شماره، مقصد و زمان حرکت را بفهمم.',
'prea1-05-numbers','survival-directions-and-neighborhood foundation-time-and-calendar foundation-buying-something',
'عدد، ساعت، قیمت و Where is ... را بازیابی کن.',
'bus=اتوبوس؛ train=قطار؛ ticket=بلیت؛ stop=ایستگاه اتوبوس؛ platform=سکو؛ leave=حرکت‌کردن؛ centre=مرکز',
'One ticket to ...؛ Which bus ...?؛ Does this bus go to ...?؛ leaves at از حال ساده؛ platform + عدد؛ پرسش مقصد پیش از سوارشدن.',
'پرواز، بار، قوانین تعویض و تغییر مسیر چنداتصالی به درس سفر مربوط‌اند و اینجا لازم نیستند.',
'''One ticket to the city centre, please. | یک بلیت به مرکز شهر، لطفاً.
Does this bus go to the station? | آیا این اتوبوس به ایستگاه می‌رود؟
Which bus goes to the centre? | کدام اتوبوس به مرکز شهر می‌رود؟
Bus number ten. | اتوبوس شمارهٔ ده.
The train leaves at nine. | قطار ساعت نه حرکت می‌کند.
It leaves from platform two. | از سکوی دو حرکت می‌کند.''',
'''Where would you like to go? | می‌خواهید کجا بروید؟
To the city centre, please. | به مرکز شهر، لطفاً.
Take bus number ten. | اتوبوس شمارهٔ ده را سوار شوید.
Number ten. Thank you. | شمارهٔ ده. ممنون.''',
('The train to Leeds leaves at ten from platform three.','سکو چند است؟','Three.'),
('Bus 10: City Centre, 09:00. Bus 12: Station, 09:30.','کدام اتوبوس ساعت نه‌ونیم به ایستگاه می‌رود؟','Bus 12.'),
'یک درخواست بلیت و یک سؤال برای مطمئن‌شدن از مقصد بنویس.',
'برای مرکز شهر بلیت بخواه و شماره یا زمان حرکت را برای اطمینان تکرار کن.',
'Does this bus goes؛ خلط شمارهٔ اتوبوس، ساعت و شمارهٔ سکو؛ centre/center هر دو پذیرفته شوند.')

add('survival-appointments-and-time','گرفتن و تغییر قرار',6,
'برای یک خدمت ساده زمان قرار بخواهم و یک زمان جایگزین پیشنهاد کنم.',
'prea1-13-every-day','foundation-time-and-calendar survival-public-transport',
'روز، ساعت و Do you have time ... را بازیابی کن.',
'appointment=قرار؛ free=وقت‌آزادداشتن؛ available=در دسترس؛ morning=صبح؛ afternoon=بعدازظهر؛ change=تغییردادن',
'I would like an appointment؛ Are you free on ...?؛ Can I come at ...?؛ on/at؛ دو انتخاب زمانی با or. هدف قرار اداری/کلاس است نه شرح درمان.',
'شرطی پیچیده، cancel/reschedule رسمی و درخواست علت پزشکی لازم نیستند.',
'''I would like an appointment, please. | یک وقت ملاقات می‌خواهم، لطفاً.
Are you free on Tuesday? | سه‌شنبه وقت آزاد دارید؟
Can I come at ten? | می‌توانم ساعت ده بیایم؟
Ten is not available. | ساعت ده وقت خالی نیست.
Is eleven OK? | ساعت یازده مناسب است؟
Yes, Tuesday at eleven. | بله، سه‌شنبه ساعت یازده.''',
'''Can you come on Tuesday at ten? | می‌توانید سه‌شنبه ساعت ده بیایید؟
Sorry, I work at ten. Is eleven OK? | ببخشید، ساعت ده کار می‌کنم. یازده مناسب است؟
Yes. Tuesday at eleven. | بله. سه‌شنبه ساعت یازده.
Thank you. See you then. | ممنون. آن موقع می‌بینمتان.''',
('Your appointment is on Friday at two in the afternoon.','قرار چه روزی است؟','Friday.'),
('Appointment: Anna, Tuesday, 11:00 a.m. Please come to room 2.','آنا چه ساعتی باید بیاید؟','11:00 a.m.'),
'یک درخواست قرار و یک پیام تأیید روز و ساعت با اطلاعات خیالی بنویس.',
'یک زمان پیشنهاد کن؛ اگر مخاطب آن زمان را ندارد، زمان دوم را تأیید کن.',
'تأیید ساعت ردشده در پایان مکالمه؛ همهٔ نوبت‌ها باید یک زمان نهایی مشترک داشته باشند.')

add('survival-school-and-learning','کاربرد زبان در کلاس',7,
'دربارهٔ شروع کلاس و تکلیف سؤال کنم و دستور کوتاه معلم را بفهمم.',
'prea1-11-at-home','foundation-asking-for-help foundation-time-and-calendar foundation-everyday-routine',
'Please say that again و هجی‌کردن و زمان کلاس را بازیابی کن.',
'lesson=درس؛ homework=تکلیف؛ page=صفحه؛ question=پرسش؛ answer=پاسخ؛ open=بازکردن',
'امر مثبت/منفی Open/Don’t ...؛ When does ... start?؛ What does ... mean? به‌صورت قالب سؤال دربارهٔ واژه؛ Can I ask ...?؛ a/an در مثال‌های آشنا.',
'اصطلاحات مدرسه و نظام آموزشی کشورها یا دستور زبان انتزاعی کامل وارد نشوند.',
'''Open your book at page ten. | کتابتان را در صفحهٔ ده باز کنید.
Please read the question. | لطفاً سؤال را بخوانید.
Do not write the answer yet. | هنوز پاسخ را ننویسید.
What does “city” mean? | «city» چه معنی می‌دهد؟
Can I ask a question? | می‌توانم یک سؤال بپرسم؟
When does the class start? | کلاس چه زمانی شروع می‌شود؟''',
'''Please open your book at page ten. | لطفاً کتابتان را در صفحهٔ ده باز کنید.
Page ten? | صفحهٔ ده؟
Yes. Read the question, please. | بله. لطفاً سؤال را بخوانید.
What does “city” mean? | «city» چه معنی می‌دهد؟''',
('Open your book at page twelve. Read question two.','کدام سؤال باید خوانده شود؟','Question two.'),
('Homework: Read page 10. Write answers to questions 1 and 2. Class: Monday at 10.','برای تکلیف چه صفحه‌ای باید خوانده شود؟','Page 10.'),
'پیام کوتاهی به معلم خیالی بنویس: زمان کلاس را بپرس و دربارهٔ معنی city سؤال کن.',
'درخواست اجازهٔ سؤال کن، معنی واژهٔ داده‌شده را بپرس و درخواست تکرار کن.',
'What means city؛ homework در این کاربرد جمع s نمی‌گیرد؛ متن خودبسنده جای صفحهٔ کتاب بیرونی را بگیرد.')

add('survival-invitations-and-plans','دعوت و توافق روی برنامه',7,
'دعوت ساده کنم، آن را قبول یا مؤدبانه رد کنم و روی زمان توافق کنم.',
'prea1-02-bye prea1-14-i-like','survival-appointments-and-time survival-hobbies-and-free-time survival-cafe-and-food',
'روز/ساعت، Do you like و قهوه‌خواستن را بازیابی کن.',
'invite=دعوت‌کردن؛ meet=دیدن/ملاقات‌کردن؛ together=با هم؛ busy=گرفتار؛ tomorrow=فردا؛ great=عالی',
'Would you like to ...? به‌صورت دعوت؛ Let’s + فعل؛ I’d love to به‌صورت پذیرش آماده؛ Sorry, I can’t؛ Are you free ...?؛ توافق روز/ساعت.',
'کل شرطی would، آیندهٔ will و وعدهٔ قطعی استمراری در این درس تدریس نشوند.',
'''Would you like to have coffee tomorrow? | دوست داری فردا قهوه بخوریم؟
Yes, I would love to. | بله، خیلی دوست دارم.
Sorry, I am busy on Friday. | ببخشید، جمعه گرفتارم.
Are you free on Saturday? | شنبه وقت آزاد داری؟
Let us meet at ten. | بیا ساعت ده همدیگر را ببینیم.
Great. See you on Saturday. | عالی است. شنبه می‌بینمت.''',
'''Would you like to have coffee on Friday? | دوست داری جمعه قهوه بخوریم؟
Sorry, I am busy on Friday. Are you free on Saturday? | ببخشید، جمعه گرفتارم. شنبه وقت آزاد داری؟
Yes. Let us meet at ten on Saturday. | بله. بیا شنبه ساعت ده همدیگر را ببینیم.
Great. See you then. | عالی است. آن موقع می‌بینمت.''',
('I am busy on Tuesday. Let us meet on Wednesday at ten.','روز پیشنهادی نهایی کدام است؟','Wednesday.'),
('Hi Anna. Coffee on Saturday at ten? At the café next to the station. — Ben','کافه کجاست؟','Next to the station.'),
'دعوت کوتاه با زمان و مکان خیالی بنویس و برای رد آن یک پاسخ مؤدبانهٔ جایگزین هم بده.',
'دعوت کن، پاسخ مخاطب را در نظر بگیر و فقط زمان پذیرفته‌شده را در پایان تأیید کن.',
'Let’s to meet؛ رد دعوت و سپس تأیید همان روز بدون رفع تعارض.')

add('survival-past-and-future-plans','دیروز و برنامهٔ فردا',7,
'یک کار سادهٔ دیروز و یک برنامهٔ فردا را با نشانهٔ زمانی روشن بگویم.',
'prea1-13-every-day','foundation-everyday-routine survival-current-activities survival-invitations-and-plans',
'I work every day / I am working now را با yesterday و tomorrow مقایسه کن.',
'yesterday=دیروز؛ tomorrow=فردا؛ last night=دیشب؛ next week=هفتهٔ بعد؛ was/were=گذشتهٔ be؛ went=گذشتهٔ go',
'was/were؛ worked/studied/went در چند نمونهٔ پربسامد؛ did not + بن فعل و Did you ...? محدود؛ be going to + فعل برای برنامه. تمرین در دو گذر دیروز/فردا، نه آزمون هم‌زمان همهٔ زمان‌ها.',
'فهرست افعال بی‌قاعده، حال کامل، تفاوت‌های ظریف will/going to و داستان بلند خارج از دامنه‌اند.',
'''I was at home yesterday. | من دیروز در خانه بودم.
I worked yesterday. | من دیروز کار کردم.
She went to the café. | او به کافه رفت. (زن)
Did you study yesterday? | آیا دیروز درس خواندی؟
I did not work yesterday. | من دیروز کار نکردم.
I am going to study tomorrow. | من قصد دارم فردا درس بخوانم.''',
'''Were you at home yesterday? | دیروز در خانه بودی؟
Yes, I was. I studied at home. | بله. در خانه درس خواندم.
What are you going to do tomorrow? | قصد داری فردا چه کار کنی؟
I am going to meet Anna at the café. | قصد دارم آنا را در کافه ببینم.''',
('I worked yesterday. Tomorrow I am going to study at home.','برنامهٔ فردا چیست؟','Study at home.'),
('Yesterday Ben was at home. Tomorrow he is going to meet Anna at ten.','بن دیروز کجا بود؟','At home.'),
'دو جمله با yesterday و دو جمله با tomorrow بنویس؛ گذشتهٔ افعال تازه لازم نیست.',
'دربارهٔ دیروز دو جمله و دربارهٔ برنامهٔ فردا دو جمله بگو؛ از اطلاعات خیالی استفاده کن.',
'Did you went / I did not worked؛ I going to؛ در تألیف نهایی واژه‌های زمان پیش از تغییر فعل تمرین شوند.')

add('survival-job-interview','معرفی توانایی کاری ساده',8,
'شغل، توانایی ساده و زمان در دسترس بودن را در یک آشنایی کاری بگویم.',
'prea1-04-i-am prea1-13-every-day','foundation-everyday-routine survival-appointments-and-time survival-school-and-learning',
'شغل‌های آشنا، I work و روزهای هفته را بازیابی کن.',
'job=شغل؛ shop=فروشگاه؛ computer=رایانه؛ use=استفاده‌کردن؛ speak=صحبت‌کردن؛ start=شروع‌کردن',
'can/can’t + بن فعل برای توانایی؛ Can you ...?؛ I work in ...؛ available on ...؛ a + شغل. can درخواست در درس کمک اکنون با توانایی مقایسه شود.',
'مصاحبهٔ حرفه‌ای، رزومه، دستمزد/قرارداد، سابقه با present perfect و استدلال اقناعی هدف A1 نیستند.',
'''I work in a shop. | من در فروشگاه کار می‌کنم.
I can use a computer. | من می‌توانم از رایانه استفاده کنم.
Can you speak English? | می‌توانید انگلیسی صحبت کنید؟
I can speak a little English. | من کمی انگلیسی صحبت می‌کنم.
I am available on Monday. | من دوشنبه وقت آزاد دارم.
I can start at nine. | می‌توانم ساعت نه شروع کنم.''',
'''Can you use a computer? | می‌توانید از رایانه استفاده کنید؟
Yes, I can. | بله، می‌توانم.
Can you work on Monday? | می‌توانید دوشنبه کار کنید؟
Yes. I can start at nine. | بله. می‌توانم ساعت نه شروع کنم.''',
('I can use a computer. I can work on Tuesday, but not Monday.','چه روزی می‌تواند کار کند؟','Tuesday.'),
('Name: Sara. Job: shop assistant. Available: Monday morning. Languages: Persian, a little English.','سارا چه زمانی وقت آزاد دارد؟','Monday morning.'),
'برای یک شخصیت خیالی شغل، یک توانایی و یک زمان آزاد را در سه جمله بنویس.',
'خودت را برای یک آشنایی کاری ساده معرفی کن؛ یک توانایی و یک روز آزاد بگو.',
'can to use / can uses؛ عنوان قدیمی job-interview نباید به وعدهٔ آمادگی مصاحبهٔ واقعی تعبیر شود. shop assistant با ترجمهٔ فروشنده معرفی شود.')

add('survival-personal-information','اطلاعات خیالی و فرم ساده',8,
'یک فرم ساده را با نام، شهر، نشانی و راه تماس خیالی کامل کنم.',
'prea1-07-i-have','foundation-alphabet-and-spelling foundation-numbers-and-contact survival-job-interview',
'نام، هجی، عدد، سن و شغل را بازیابی کن.',
'address=نشانی؛ email=ایمیل؛ street=خیابان؛ form=فرم؛ first name=نام کوچک؛ last name=نام خانوادگی؛ dot=نقطه؛ at=ات‌ساین در ایمیل',
'What is your ...?؛ My ... is ...؛ حرف‌به‌حرف‌گویی و رقم‌ها؛ نشانی 12 Park Street؛ ایمیل نمونه با example.com. فرم الزاماً جملهٔ کامل نمی‌خواهد.',
'مدرک هویتی، گذرواژه، اطلاعات بانکی، تاریخ تولد واقعی یا بارگذاری سند درخواست نشود.',
'''My first name is Sara. | نام کوچک من سارا است.
My last name is Ali. | نام خانوادگی من علی است.
What is your address? | نشانی شما چیست؟
My address is 12 Park Street. | نشانی من پلاک ۱۲، خیابان پارک است.
My email is sara@example.com. | ایمیل من sara@example.com است.
Please check your name. | لطفاً نامتان را بررسی کنید.''',
'''What is your first name? | نام کوچک شما چیست؟
Sara. S-A-R-A. | سارا. اس، اِی، آر، اِی.
And your address? | و نشانی شما؟
12 Park Street. | پلاک ۱۲، خیابان پارک.''',
('My address is fourteen Park Street. One four.','شمارهٔ پلاک چیست؟','14'),
('First name: Ben. Last name: Lee. Address: 12 Park Street. Email: ben@example.com.','نام خانوادگی چیست؟','Lee'),
'فرم خیالی چهارخانه‌ای را کامل کن: First name، Last name، Address، Email. از example.com استفاده کن.',
'در نقش شخصیت خیالی نام و نشانی را بگو و یکی از آن‌ها را برای اطمینان هجی یا تکرار کن.',
'جابجایی first/last name؛ اطلاعات واقعی ضروری نیست؛ نام‌گذاری فضای ذخیره باید lessonId و sentenceId را با هم در نظر بگیرد.')

add('survival-renting-a-home','پرس‌وجوی ساده برای اتاق',8,
'یک آگهی کوتاه اتاق را بفهمم و دربارهٔ قیمت، امکانات و زمان دیدن آن سؤال کنم.',
'prea1-11-at-home','foundation-objects-and-places foundation-buying-something survival-appointments-and-time survival-personal-information',
'there is/are، قیمت، جای مکان و زمان قرار را بازیابی کن.',
'room=اتاق؛ rent=اجاره؛ month=ماه؛ kitchen=آشپزخانه؛ bathroom=حمام/دستشویی؛ internet=اینترنت؛ included=شامل‌شده',
'Is there ...?؛ How much is the rent?؛ per month به‌صورت واحد قیمت؛ Can I see ...?؛ Is ... included? قالب آماده. واحد پول در آگهی/صحنه یکسان بماند.',
'قرارداد، حقوق مستأجر، ضمانت، مذاکرهٔ شرایط و شکایت حقوقی هدف نیستند.',
'''I am looking for a room. | من دنبال یک اتاق هستم.
How much is the rent? | اجاره چقدر است؟
It is five hundred pounds per month. | ماهی پانصد پوند است.
Is there a kitchen? | آیا آشپزخانه دارد؟
Is internet included? | آیا اینترنت در قیمت اجاره حساب شده است؟
Can I see the room on Tuesday? | می‌توانم سه‌شنبه اتاق را ببینم؟''',
'''Hello. Are you looking for a room? | سلام. دنبال اتاق هستید؟
Yes. How much is the rent? | بله. اجاره چقدر است؟
Five hundred pounds per month. | ماهی پانصد پوند.
Thank you. Can I see it on Tuesday? | ممنون. می‌توانم سه‌شنبه آن را ببینم؟''',
('The room is six hundred pounds per month. Internet is included.','اجارهٔ ماهانه چقدر است؟','Six hundred pounds.'),
('Room: £500 per month. Shared kitchen. Near the station. Internet included.','آیا اتاق نزدیک ایستگاه است؟','Yes.'),
'برای آگهی داده‌شده دو سؤال دربارهٔ اتاق و یک درخواست زمان بازدید بنویس.',
'قیمت و یک امکان را بپرس و زمانی برای دیدن اتاق پیشنهاد کن.',
'۵۰۰ و ۶۰۰ نیاز به گسترش عددهای آشنا با hundred پیش از شنیدن دارند؛ وعدهٔ آموزش قرارداد از عنوان حذف شود؛ shared=مشترک پیش از متن معرفی شود.')

add('survival-travel-and-tickets','سفر و بلیت بین‌شهری',9,
'بلیت بین‌شهری با مقصد و روز مشخص بخواهم و زمان رفت‌وبرگشت را بررسی کنم.',
'prea1-05-numbers','survival-public-transport survival-past-and-future-plans survival-personal-information',
'بلیت شهری، روز/ساعت و برنامهٔ tomorrow را بازیابی کن.',
'single=یک‌طرفه؛ return=رفت‌وبرگشت؛ journey=سفر؛ arrive=رسیدن؛ leave=حرکت‌کردن؛ tomorrow=فردا',
'A single/return to ...؛ on/at؛ What time does ... arrive?؛ I am going to travel ...؛ ترجیح واژگانی British single/return همراه یادداشت one-way/round-trip فقط برای تشخیص.',
'قوانین ویزا، بار مجاز، تعویض/استرداد و مشکل اتصال پرواز هدف این درس نیستند.',
'''A return ticket to Leeds, please. | یک بلیت رفت‌وبرگشت به لیدز، لطفاً.
For tomorrow, please. | برای فردا، لطفاً.
What time does the train leave? | قطار چه ساعتی حرکت می‌کند؟
It leaves at ten. | ساعت ده حرکت می‌کند.
What time does it arrive? | چه ساعتی می‌رسد؟
I am going to return on Friday. | قصد دارم جمعه برگردم.''',
'''A single or a return? | یک‌طرفه یا رفت‌وبرگشت؟
A return to Leeds, please. | رفت‌وبرگشت به لیدز، لطفاً.
When are you going to return? | قصد دارید چه زمانی برگردید؟
On Friday. | جمعه.''',
('The train leaves at ten and arrives at twelve.','قطار چه ساعتی می‌رسد؟','At twelve.'),
('London → Leeds. Departure: 10:00. Arrival: 12:00. Return: Friday, 15:00.','قطار برگشت چه روزی است؟','Friday.'),
'درخواست بلیت با مقصد، روز رفت و روز برگشت خیالی بنویس.',
'بلیت رفت‌وبرگشت بخواه و زمان رسیدن را از حرکت جداگانه بپرس.',
'خلط arrive/leave؛ departure=حرکت و arrival=رسیدن پیش از خواندن آموزش داده شوند؛ مقصد و روز برگشت در صحنه ناسازگار نشوند.')

add('survival-hotel-and-stay','ورود و درخواست ساده در هتل',9,
'رزرو خیالی را معرفی کنم، شمارهٔ اتاق و ساعت صبحانه را بپرسم و درخواست کوتاه بگویم.',
'prea1-08-please-thankyou','survival-renting-a-home survival-travel-and-tickets',
'نام، عدد اتاق، امکانات و ساعت را بازیابی کن.',
'booking=رزرو؛ night=شب؛ key=کلید؛ breakfast=صبحانه؛ towel=حوله؛ reception=پذیرش',
'I have a booking؛ for two nights؛ What time is ...?؛ Can I have ...? درخواست مؤدبانه؛ there is/isn’t برای یک مشکل ساده، نه شکایت تفصیلی.',
'پرداخت شرکتی، جریمه، مذاکرهٔ جبران خسارت و پیش‌پرداخت حقوقی لازم نیستند.',
'''I have a booking. My name is Sara Ali. | رزرو دارم. اسم من سارا علی است.
A room for two nights, please. | یک اتاق برای دو شب، لطفاً.
What is my room number? | شمارهٔ اتاق من چیست؟
Your room is number twelve. | شمارهٔ اتاق شما دوازده است.
What time is breakfast? | صبحانه چه ساعتی است؟
Can I have a towel, please? | می‌توانم یک حوله داشته باشم، لطفاً؟''',
'''Good evening. What is your name? | عصر بخیر. اسمتان چیست؟
Sara Ali. I have a booking for two nights. | سارا علی. برای دو شب رزرو دارم.
Yes. Room twelve. Here is your key. | بله. اتاق دوازده. این هم کلیدتان.
Thank you. What time is breakfast? | ممنون. صبحانه چه ساعتی است؟''',
('Your room is fourteen. Breakfast is at seven thirty.','صبحانه چه ساعتی است؟','7:30.'),
('Hotel Park. Breakfast: 7:30–9:00. Reception: ground floor. Room 12: Sara Ali.','شمارهٔ اتاق سارا چیست؟','12'),
'برای پذیرش یک پیام کوتاه بنویس: شمارهٔ اتاق خیالی و درخواست حوله.',
'رزرو خیالی را معرفی کن و دربارهٔ ساعت صبحانه یا یک وسیلهٔ لازم سؤال کن.',
'عدم تمایز two nights/two rooms؛ ground floor=طبقهٔ همکف پیش از خواندن معرفی شود؛ نوبت چهارم صحنه سؤال باز طبیعی است، نه پاسخ‌گیری اجباری خارج از متن.')

add('survival-phone-and-messages','تماس و پیام کوتاه',9,
'خودم را در تماس معرفی کنم و پیامی کوتاه با زمان تماس مجدد بنویسم.',
'prea1-13-every-day','survival-current-activities survival-invitations-and-plans survival-personal-information',
'Can you call me? و ساعت و درخواست تکرار را بازیابی کن.',
'call=تماس‌گرفتن؛ message=پیام؛ later=بعداً؛ busy=گرفتار؛ number=شماره؛ leave=گذاشتن در leave a message',
'This is ... speaking به‌صورت قالب تماس؛ Can I speak to ...?؛ Can I leave a message?؛ Please call me at ...؛ is working now برای علت در دسترس نبودن.',
'نقل‌قول غیرمستقیم، تماس اداری پیچیده و ضبط/ارسال اطلاعات واقعی هدف نیستند.',
'''Hello, this is Sara speaking. | سلام، سارا هستم. (در تماس)
Can I speak to Ben, please? | می‌توانم با بن صحبت کنم، لطفاً؟
He is working now. | او الان مشغول کار است. (مرد)
Can I leave a message? | می‌توانم پیغام بگذارم؟
Please call me at five. | لطفاً ساعت پنج به من زنگ بزن.
Thank you. Goodbye. | ممنون. خداحافظ.''',
'''Hello, this is Anna. | سلام، آنا هستم.
Hello. Can I speak to Ben, please? | سلام. می‌توانم با بن صحبت کنم، لطفاً؟
Sorry, he is working now. | ببخشید، او الان مشغول کار است.
Please ask him to call Sara at five. Thank you. | لطفاً به او بگویید ساعت پنج به سارا زنگ بزند. ممنون.''',
('Hi Ben. This is Sara. Please call me at six, not five.','تماس باید چه ساعتی باشد؟','At six.'),
('Hi Anna. I am at the station. Please call me at four. Thanks, Ben.','چه کسی پیام را نوشته است؟','Ben.'),
'پیام خیالی سه‌جمله‌ای بنویس: نام، جای فعلی و زمان تماس؛ شمارهٔ واقعی لازم نیست.',
'برای تماس خودت را معرفی کن؛ اگر فرد حاضر نیست، یک پیغام کوتاه با زمان بگذار.',
'I am Sara به‌عنوان تنها شکل درست تحمیل نشود؛ در شنیدن/پاسخ نقش تماس‌گیرنده و گیرنده ثابت بماند؛ ask him to یک قالب محدود پایانی است.')

add('survival-services-and-post-office','خدمات ساده و ادارهٔ پست',9,
'برای ارسال یک نامه کمک بخواهم، مقصد و قیمت را بفهمم و یک فرم ساده را بخوانم.',
'prea1-08-please-thankyou','foundation-buying-something survival-personal-information survival-directions-and-neighborhood',
'نشانی، قیمت، Please و Where is را بازیابی کن.',
'letter=نامه؛ stamp=تمبر؛ post office=ادارهٔ پست؛ send=فرستادن؛ parcel=بسته؛ form=فرم',
'I would like to send ...؛ to + مقصد؛ How much is ...?؛ Do I need ...?؛ Please write ...؛ مرور can برای کمک. stamp=تمبر با price اشتباه نشود.',
'بانکداری، بیمه، ترخیص گمرکی، ردیابی حقوقی و همهٔ خدمات شهر در یک درس جمع نشوند.',
'''I would like to send this letter. | می‌خواهم این نامه را بفرستم.
To London, please. | به لندن، لطفاً.
How much is a stamp? | قیمت یک تمبر چقدر است؟
Do I need a form? | آیا به فرم نیاز دارم؟
Please write the address here. | لطفاً نشانی را اینجا بنویسید.
Can you help me with this form? | می‌توانید برای این فرم به من کمک کنید؟''',
'''Hello. Can I help you? | سلام. می‌توانم کمکتان کنم؟
I would like to send this letter to London. | می‌خواهم این نامه را به لندن بفرستم.
A stamp is two pounds. | قیمت یک تمبر دو پوند است.
One stamp, please. Thank you. | یک تمبر، لطفاً. ممنون.''',
('Please write the name and address on the form.','چه دو اطلاعاتی باید نوشته شود؟','Name and address.'),
('To: Anna Lee. Address: 12 Park Street, London. Stamp: £2.','شهر مقصد کدام است؟','London.'),
'برای نامهٔ خیالی نام و نشانی گیرنده را بنویس و یک پرسش دربارهٔ هزینه اضافه کن.',
'در ادارهٔ پست بخواه یک نامه بفرستی؛ مقصد را بگو و قیمت تمبر را بپرس.',
'send to با جهت from اشتباه نشود؛ here در متن به خانهٔ فرم نمایش‌داده‌شده اشاره کند، نه تصویر غایب.')

add('survival-health-and-pharmacy','بیان حال و درخواست کمک در داروخانه',9,
'یک علامت ساده را بگویم و درخواست کمک زبانی کنم، بدون تشخیص یا توصیهٔ درمانی.',
'prea1-04-i-am prea1-06-how-are-you prea1-13-every-day','foundation-asking-for-help survival-appointments-and-time survival-phone-and-messages',
'I am tired، I need help و وقت ملاقات و تماس را بازیابی کن.',
'headache=سردرد؛ pain=درد؛ ill=بیمار؛ doctor=پزشک؛ pharmacy=داروخانه؛ help=کمک؛ water=آب',
'I have a headache؛ My ... hurts به‌صورت قالب محدود؛ I feel ...؛ Can you help me?؛ Where is ...?؛ نیاز فوری با I need help now. تولید جملهٔ علائم خیالی، نه دادهٔ حساس واقعی.',
'تشخیص، دوز، نام دارو، تضمین درمان و توصیهٔ ایمنی پزشکی نوشته نشود؛ درس جای خدمات درمانی نیست.',
'''I do not feel well. | حالم خوب نیست.
I have a headache. | سردرد دارم.
My stomach hurts. | شکمم درد می‌کند.
I need a doctor. | به پزشک نیاز دارم.
Where is the pharmacy? | داروخانه کجاست؟
Can you help me, please? | می‌توانید لطفاً به من کمک کنید؟''',
'''Hello. How can I help you? | سلام. چطور می‌توانم کمکتان کنم؟
I do not feel well. I have a headache. | حالم خوب نیست. سردرد دارم.
Would you like to speak to the pharmacist? | می‌خواهید با داروساز صحبت کنید؟
Yes, please. | بله، لطفاً.''',
('I have a headache. I need to speak to the pharmacist.','علامت گفته‌شده چیست؟','A headache.'),
('Park Pharmacy. Open Monday to Friday, 9:00–17:00. Closed Sunday.','آیا داروخانه یکشنبه باز است؟','No.'),
'برای یک شخصیت خیالی دو جمله دربارهٔ حال او و یک درخواست کمک بنویس؛ نام دارو لازم نیست.',
'در نقش شخصیت خیالی یک علامت ساده را بگو و درخواست صحبت با فرد مناسب کن.',
'I have headache بدون a در مدل هدف؛ stomach=شکم و pharmacist=داروساز پیش از نمونه/صحنه معرفی شوند؛ پاسخ زبانی هرگز نمرهٔ سلامت تلقی نشود.')

# One authored form/function check and one meaning check per lesson.
FORM_CHECKS = [
('I ___ from Iran.', ['am','is','are'], 0, 'با I در معرفی از am استفاده می‌شود.'),
('برای فهمیدن املای نام کدام درخواست درست است؟', ['How old are you?','How do you spell Sara?','Where are you from?'], 1, 'spell دربارهٔ هجی است، نه سن یا کشور.'),
('برای درخواست آهسته‌گویی کدام جمله مناسب است؟', ['Thank you.','I am Sara.','Please speak slowly.'], 2, 'درخواست باید دقیقاً عمل مورد نیاز را روشن کند.'),
('They ___ ready.', ['am','is','are'], 2, 'با they از are استفاده می‌شود.'),
('عدد ۳۰ کدام است؟', ['thirty','thirteen','three'], 0, 'thirteen برابر ۱۳ است؛ thirty برابر ۳۰.'),
('Anna is my sister. ___ name is Anna.', ['His','Her','Their'], 1, 'در این کارت آنا خواهر معرفی شده است؛ her به مالک برمی‌گردد.'),
('There ___ two chairs in the room.', ['is','am','are'], 2, 'با دو صندلی از there are استفاده می‌کنیم.'),
('The class is ___ Monday.', ['on','in','at'], 0, 'برای روز هفته on به کار می‌رود.'),
('Does she ___ on Sunday?', ['works','work','working'], 1, 'بعد از does بن فعل بدون s می‌آید.'),
('I ___ reading now.', ['do','is','am'], 2, 'حال استمراری با I am + ing ساخته می‌شود.'),
('برای بیان علاقهٔ کلی کدام درست است؟', ['I like reading.','I am like read.','I likes reading.'], 0, 'like reading علاقه را بیان می‌کند، نه لزوماً فعالیت همین الان.'),
('___ is cold today.', ['I','It','They'], 1, 'برای بیان وضعیت هوا از it استفاده می‌کنیم.'),
('How much ___ these pens?', ['am','is','are'], 2, 'pens جمع است؛ are می‌خواهد.'),
('کدام عبارت یک پیراهن آبی را بیان می‌کند؟', ['a blue shirt','a shirt blue','blue a shirt'], 0, 'رنگ پیش از اسم می‌آید.'),
('برای درخواست مؤدبانهٔ چای کدام جمله درست است؟', ['I would tea.','I would like a cup of tea, please.','I like would tea.'], 1, 'would like در اینجا درخواست است؛ like به‌تنهایی می‌تواند علاقه را بیان کند.'),
('Turn ___ at the bank. (به چپ)', ['straight','right','left'], 2, 'left یعنی چپ؛ go straight یعنی مستقیم برو.'),
('Does this bus ___ to the station?', ['go','goes','going'], 0, 'پس از does از go استفاده می‌شود.'),
('قرار سه‌شنبه ساعت ۱۱ است. کدام تأیید درست است؟', ['Tuesday at ten.','Tuesday at eleven.','Friday at eleven.'], 1, 'در تأیید قرار هم روز و هم ساعت باید یکسان باشند.'),
('برای پرسیدن معنی city کدام درست است؟', ['What means city?','What city does mean?','What does city mean?'], 2, 'در این قالب پرسشی does پیش از city می‌آید.'),
('Let us ___ at ten.', ['meet','to meet','meeting'], 0, 'بعد از let us بن فعل می‌آید.'),
('Did you ___ yesterday?', ['worked','work','working'], 1, 'بعد از did از بن فعل استفاده می‌کنیم.'),
('I can ___ a computer.', ['uses','to use','use'], 2, 'بعد از can بن فعل بدون to و s می‌آید.'),
('در فرم First name به کدام اطلاعات نیاز دارد؟', ['نام کوچک','نام خانوادگی','نشانی'], 0, 'First name نام کوچک است و Last name نام خانوادگی.'),
('£500 per month یعنی چه؟', ['پانصد پوند در روز','پانصد پوند در ماه','پنجاه پوند در ماه'], 1, 'per month یعنی در ماه؛ five hundred یعنی پانصد.'),
('برای بلیت رفت‌وبرگشت کدام را می‌خواهیم؟', ['A room.','A single ticket.','A return ticket.'], 2, 'در نمونهٔ بریتانیایی return ticket رفت‌وبرگشت است.'),
('A room for two ___ . (دو شب)', ['nights','rooms','keys'], 0, 'مدت اقامت با nights بیان شده است، نه تعداد اتاق.'),
('Ben is working now. کدام پیام مناسب است؟', ['Ben is free now.','Please ask Ben to call Sara at five.','The train leaves at five.'], 1, 'پیام تماس باید گیرنده، نام تماس‌گیرنده و زمان را روشن کند.'),
('I would like to send this letter ___ London.', ['from','at','to'], 2, 'to مقصد ارسال را معرفی می‌کند.'),
('کدام جمله سردرد را بیان می‌کند؟', ['I have a headache.','I have a ticket.','I am at home.'], 0, 'headache یعنی سردرد؛ تشخیص و دارو جزو سنجش نیستند.'),
]
PRONUNCIATION = [
'پیوند my name is و تمایز نام/کشور؛ مدل صوتی کوتاه و طبیعی، بدون اجبار به تقلید لهجه.',
'نام حروف A/E/I و G/J را با دو نام کوتاه مقایسه کن؛ هجی و تلفظ کلمه جدا تمرین شوند.',
'تکیهٔ slowly و again؛ عبارت Please say that again با مکث طبیعی و بدون بلندگویی اجباری.',
'am/is/are کامل و صورت کوتاه؛ تلفظ ضعیف are پذیرفته شود؛ he/she با کارت فرد مشخص تمرین شوند.',
'تکیه و کشش thirteen/thirty و fifteen/fifty؛ رقم‌های کد با مکث کوتاه خوانده شوند.',
'آشنایی شنیداری با پایان brothers و Ben’s؛ از نوشتن فارسی به‌عنوان تلفظ دقیق استفاده نشود.',
'مقایسهٔ this/these و /ð/ در نمونه‌های آشنا؛ فهم‌پذیری مهم‌تر از لهجهٔ بومی است.',
'تمایز شنیداری nine/nineteen و quarter/half؛ ساعت را نخست دیجیتال تمرین کن.',
'سه تلفظ s سوم‌شخص با نمونه‌های works/reads/watches در تألیف نهایی معرفی شوند، نه حفظ جدول.',
'پایان ing و شنیدن am/is پیش از آن؛ read و reading کنار هم شنیده شوند.',
'گروه‌بندی like reading و do you like؛ do you در گفتار طبیعی هم شنیده شود.',
'تمایز weather/whether در املا موضوع نیست؛ cold/hot و raining با صدای روشن و عادی تمرین شوند.',
'پایان pounds و تفاوت قیمت کامل با رقم‌های تماس؛ I’d like فقط کنار I would like معرفی شود.',
'رنگ و اندازه با تکیهٔ معنایی؛ shoes و shirt در شنیدن اشتباه نشوند.',
'گروه‌های a cup of و with milk را یک‌جا بشنو؛ صورت‌های کوتاه درخواست را کنار صورت کامل نگه دار.',
'کلمات جهت با تکیهٔ واضح؛ left/right در دستور دو مرحله‌ای با یک مکث تمرین شوند.',
'عدد اتوبوس، زمان و سکو جدا شنیده شوند؛ bus و buses فقط با واژهٔ معرفی‌شده.',
'روز و ساعت نهایی با تکیهٔ اصلاحی تکرار شوند؛ Tuesday/Thursday پیش از آزمون مقایسه شوند.',
'شمارهٔ page و question جدا شنیده شوند؛ واژهٔ city در سؤال معنی و هجی یکسان بماند.',
'پذیرش و رد دعوت با لحن محترمانه؛ can/can’t فقط به یک تمایز صوتی شکننده وابسته نباشند.',
'worked /t/ و studied /d/ در نمونه‌ها؛ تفاوت went با go به‌صورت واژهٔ کامل، نه قاعدهٔ ساختگی.',
'can در جملهٔ خبری ممکن است ضعیف شود؛ در سنجش can’t برای رفع ابهام متن/بافت کافی داده شود.',
'dot و at در خواندن ایمیل؛ نشانی نوشتاری با خواندن رقم‌ها تطبیق داده شود.',
'five hundred با fifty مقایسه شود؛ per month یک واحد معنایی و صوتی باشد.',
'single/return و leave/arrive در جمله؛ مدل صوتی مقصدهای Leeds/London قبل از شنیدن.',
'booking و breakfast با تکیهٔ درست؛ room twelve با room twenty اشتباه نشود.',
'This is ... speaking به‌صورت گروه؛ نام و ساعت در پیام واضح باشند، نه وابسته به کیفیت واقعی خط تلفن.',
'letter و later در بافت خود؛ مقصد پس از to روشن شنیده شود.',
'headache و pharmacy/pharmacist پیش از سنجش شنیده شوند؛ فهم علامت هدف است، نه ارزیابی پزشکی.',
]
assert len(FORM_CHECKS) == len(PRONUNCIATION) == len(LESSONS) == 29
for index, (lesson, form, pronunciation) in enumerate(zip(LESSONS, FORM_CHECKS, PRONUNCIATION)):
    prompt, choices, correct, explanation = form
    choices_meaning = [s['fa'] for s in lesson['examples'][:3]]
    offset = index % 3
    choices_meaning = choices_meaning[offset:] + choices_meaning[:offset]
    lesson['checks'] = [
        dict(kind='meaning', promptFa='معنی این نمونه در همین بافت چیست؟', source=lesson['examples'][0]['en'], choices=choices_meaning, correctIndex=choices_meaning.index(lesson['examples'][0]['fa']), explanationFa=lesson['examples'][0]['fa']),
        dict(kind='form-or-function', promptFa=prompt, choices=choices, correctIndex=correct, explanationFa=explanation),
    ]
    lesson['pronunciationFa'] = pronunciation
    lesson['transferToIds'] = [later['id'] for later in LESSONS[index+1:] if lesson['id'] in later['prerequisiteIds']]
    lesson['productionSelfCheckFa'] = [
        'هدف همین تمرین را با اطلاعات واقعی یا کاملاً خیالی انجام داده‌ام؛ افشای اطلاعات خصوصی لازم نیست.',
        'واژه‌ها و الگوی هدف همین درس را به کار برده‌ام؛ لازم نیست از همهٔ قواعد قبلی استفاده کنم.',
        'معنی جمله‌ها با هم سازگار است؛ اگر زمان، قیمت، شخص یا مکان را تغییر داده‌ام، نوبت‌های بعدی هم سازگارند.',
    ]

if __name__ == '__main__':
    dest = Path(__file__).with_name('design.json')
    dest.write_text(json.dumps(dict(status='proposal-not-runtime-content', date='2026-11-26', lessons=LESSONS), ensure_ascii=False, indent=2)+'\n')
    print(f'Wrote {len(LESSONS)} design records: {dest}')
