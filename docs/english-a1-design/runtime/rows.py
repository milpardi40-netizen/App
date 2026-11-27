"""Authored, lesson-local sentence families. No generic word-list filler.
Each lesson: six approved examples + four anchors + 20 substitutions + 12 retrieval + 8 transfer.
Stable IDs are assigned by generate.py from the approved pre-implementation snapshot.
"""
import json
from pathlib import Path
D = json.loads((Path(__file__).parents[1]/'design.json').read_text())['lessons']
BANK = {}
NAMES = 'Anna|آنا;Ben|بن;Sara|سارا;Tim|تیم'
PLACES = 'London|لندن;Tehran|تهران;Leeds|لیدز;Paris|پاریس'
DAYS = 'Monday|دوشنبه;Tuesday|سه‌شنبه;Friday|جمعه;Saturday|شنبه'
TIMES = 'seven|هفت;eight|هشت;nine|نه;ten|ده'
THINGS = 'book|کتاب;pen|خودکار;phone|گوشی;bag|کیف'
DRINKS = 'tea|چای;coffee|قهوه;water|آب;milk|شیر'
COLOURS = 'blue|آبی;red|قرمز;green|سبز;black|مشکی'

def rows(s):
    return [tuple(line.split(' | ',1)) for line in s.strip().split('\n')]

def v(en, fa, slots, pattern):
    result=[]
    for slot in slots.split(';'):
        x,f=slot.split('|')
        result.append((en.replace('{x}',x),fa.replace('{f}',f).replace('{x}',x),pattern))
    assert len(result)==4
    return result

def add(id, anchors, groups):
    plan=next(l for l in D if l['id']==id)
    a=[(s['en'],s['fa'],'') for s in plan['examples']]+[(en,fa,'') for en,fa in rows(anchors)]
    assert len(a)==10,(id,len(a))
    assert len(groups)==10
    bank=a+[r for g in groups for r in g]
    assert len(bank)==50
    assert len({r[0] for r in bank})==50,(id,'duplicate target')
    BANK[id]=bank

add('foundation-introducing-yourself','''My name is Ben. | اسم من بن است.
I am from Spain. | من اهل اسپانیا هستم.
I live in London. | من در لندن زندگی می‌کنم.
Hello! I am Tim. | سلام! من تیم هستم.''',[
v('My name is {x}.','اسم من {f} است.', 'Anna|آنا;Reza|رضا;Ali|علی;Emma|اما','My name is + name'),
v('I am from {x}.','من اهل {f} هستم.','Turkey|ترکیه;France|فرانسه;Canada|کانادا;Italy|ایتالیا','I am from + country'),
v('I live in {x}.','من در {f} زندگی می‌کنم.','Leeds|لیدز;Paris|پاریس;Rome|رم;Toronto|تورنتو','I live in + city'),
v('Hello, {x}. Nice to meet you.','سلام، {f}. از آشنایی با شما خوشحالم.',NAMES,'Hello, + name'),
v('I am {x}. What is your name?','من {f} هستم. اسم شما چیست؟',NAMES,'I am + name'),
v('Good morning, {x}.','صبح بخیر، {f}.',NAMES,'Good morning, + name'),
v('Good evening, {x}.','عصر بخیر، {f}.',NAMES,'Good evening, + name'),
v('Goodbye, {x}. See you tomorrow.','خداحافظ، {f}. تا فردا.',NAMES,'See you tomorrow'),
v('My name is {x}. I am from Iran.','اسم من {f} است. من اهل ایران هستم.',NAMES,'My name is ...; I am from ...'),
v('Hello, {x}. I live in Tehran.','سلام، {f}. من در تهران زندگی می‌کنم.',NAMES,'Hello ...; I live in ...'),
])

add('foundation-alphabet-and-spelling','''A-B-C-D-E-F. | اِی، بی، سی، دی، ای، اِف.
G-H-I-J-K-L. | جی، اِیچ، آی، جِی، کِی، اِل.
M-N-O-P-Q-R. | اِم، اِن، اُو، پی، کیو، آر.
S-T-U-V-W-X-Y-Z. | اِس، تی، یو، وی، دابِلیو، اِکس، وای، زی.''',[
v('How do you spell {x}?','{f} را چطور هجی می‌کنید؟','Anna|آنا;Ben|بن;Tim|تیم;Ali|علی','How do you spell + name?'),
v('My first name is {x}.','نام کوچک من {f} است.','Anna|آنا;Ben|بن;Tim|تیم;Reza|رضا','My first name is + name'),
v('My last name is {x}.','نام خانوادگی من {f} است.','Lee|لی;Brown|براون;Green|گرین;Smith|اسمیت','My last name is + name'),
v('Please say {x} again.','لطفاً {f} را دوباره بگویید.','A|اِی;E|ای;I|آی;J|جِی','Please say + letter + again'),
v('The first letter is {x}.','حرف اول {f} است.','S|اِس;B|بی;T|تی;A|اِی','The first letter is + letter'),
v('Hello, {x}. Please spell your first name.','سلام، {f}. لطفاً نام کوچکتان را هجی کنید.',NAMES,'Please spell your first name'),
v('Thank you, {x}.','ممنون، {f}.',NAMES,'Thank you, + name'),
v('My name is {x}. Please say your name.','اسم من {f} است. لطفاً نامتان را بگویید.',NAMES,'My name is ...; Please say ...'),
v('Please spell {x} slowly.','لطفاً {f} را آهسته هجی کنید.',NAMES,'Please spell + name + slowly'),
v('My name is {x}. Please spell it again.','اسم من {f} است. لطفاً آن را دوباره هجی کنید.',NAMES,'My name is ...; Please spell it again'),
])

add('foundation-asking-for-help','''Can you repeat that word, please? | می‌توانید لطفاً آن واژه را تکرار کنید؟
What does this word mean? | این واژه چه معنی می‌دهد؟
Please write your name. | لطفاً نامتان را بنویسید.
I need help, please. | لطفاً کمک لازم دارم.''',[
v('Please say {x} slowly.','لطفاً {f} را آهسته بگویید.',NAMES,'Please say + name + slowly'),
v('Please repeat {x}.','لطفاً {f} را تکرار کنید.','this word|این واژه;your name|نامتان;my name|نام من;that word|آن واژه','Please repeat + phrase'),
v('Can you spell {x}, please?','می‌توانید لطفاً {f} را هجی کنید؟',NAMES,'Can you spell + name?'),
v('I do not understand {x}.','من {f} را متوجه نمی‌شوم.','this word|این واژه;that word|آن واژه;your name|نامتان;this name|این نام','I do not understand + phrase'),
v('Please write {x}.','لطفاً {f} را بنویسید.','this word|این واژه;that word|آن واژه;my name|نام من;this name|این نام','Please write + phrase'),
v('Hello, {x}. Can you help me?','سلام، {f}. می‌توانید به من کمک کنید؟',NAMES,'Can you help me?'),
v('Thank you, {x}. I understand.','ممنون، {f}. متوجه می‌شوم.',NAMES,'I understand'),
v('My name is {x}. Please say it again.','اسم من {f} است. لطفاً آن را دوباره بگویید.',NAMES,'My name is ...; Please say it again'),
v('Excuse me, {x}. Please speak slowly.','ببخشید، {f}. لطفاً آهسته صحبت کنید.',NAMES,'Excuse me ...; Please + verb'),
v('Please spell {x}. I do not understand.','لطفاً {f} را هجی کنید. متوجه نمی‌شوم.',NAMES,'Please spell ...; I do not understand'),
])

add('foundation-pronouns-and-be','''You are my friend. | شما دوست من هستید.
It is a book. | این یک کتاب است.
They are teachers. | آن‌ها معلم هستند.
She is not a student. | او دانشجو نیست. (زن)''',[
v('I am {x}.','من {f} هستم.','ready|آماده;tired|خسته;happy|خوشحال;at home|در خانه','I am + description'),
v('He is {x}.','او {f} است. (مرد)','ready|آماده;tired|خسته;happy|خوشحال;at home|در خانه','He is + description'),
v('She is {x}.','او {f} است. (زن)','ready|آماده;tired|خسته;happy|خوشحال;at home|در خانه','She is + description'),
v('They are {x}.','آن‌ها {f} هستند.','ready|آماده;tired|خسته;happy|خوشحال;at home|در خانه','They are + description'),
v('Are you {x}?','آیا شما {f} هستید؟','ready|آماده;tired|خسته;happy|خوشحال;at home|در خانه','Are you + description?'),
v('This is {x}.','این {f} است.','my book|کتاب من;your pen|خودکار شما;my phone|گوشی من;your bag|کیف شما','This is + noun phrase'),
v('Hello, {x}. Are you ready?','سلام، {f}. آماده هستید؟',NAMES,'Are you ready?'),
v('We are not {x}.','ما {f} نیستیم.','tired|خسته;at home|در خانه;teachers|معلم;ready|آماده','We are not + description'),
v('Is {x} a student?','آیا {f} دانشجو است؟',NAMES,'Is + name + a student?'),
v('My name is {x}. I am a teacher.','اسم من {f} است. من معلم هستم.',NAMES,'My name is ...; I am a + job'),
])

add('foundation-numbers-and-contact','''My phone number is zero one two three. | شمارهٔ تلفن تمرینی من صفر، یک، دو، سه است.
Please say each number slowly. | لطفاً هر عدد را آهسته بگویید.
Fifteen, not fifty. | پانزده، نه پنجاه.
One hundred. | صد.''',[
v('I am {x} years old.','من {f} سال دارم.','eleven|یازده;twelve|دوازده;sixteen|شانزده;eighteen|هجده','I am + number + years old'),
v('She is {x} years old.','او {f} سال دارد. (زن)','twenty|بیست;twenty-two|بیست‌ودو;thirty-one|سی‌ویک;forty|چهل','She is + number + years old'),
v('He is {x} years old.','او {f} سال دارد. (مرد)','fifty|پنجاه;sixty|شصت;seventy|هفتاد;eighty|هشتاد','He is + number + years old'),
v('The number is {x}.','عدد {f} است.','fourteen|چهارده;seventeen|هفده;nineteen|نوزده;ninety|نود','The number is + number'),
v('My contact code is {x}.','کد تماس تمرینی من {f} است.','zero two one four|صفر، دو، یک، چهار;zero three two five|صفر، سه، دو، پنج;zero four three six|صفر، چهار، سه، شش;zero five four seven|صفر، پنج، چهار، هفت','My contact code is + digits'),
v('Please repeat {x}.','لطفاً {f} را تکرار کنید.','eleven|یازده;thirteen|سیزده;thirty|سی;fifty|پنجاه','Please repeat + number'),
v('My name is {x}. I am twenty.','اسم من {f} است. من بیست سال دارم.',NAMES,'My name is ...; I am + age'),
v('Is your number {x}?','آیا شمارهٔ شما {f} است؟','zero one|صفر، یک;zero two|صفر، دو;zero three|صفر، سه;zero four|صفر، چهار','Is your number + digits?'),
v('I am {x}. How old are you?','من {f} سال دارم. شما چند سال دارید؟','twenty-three|بیست‌وسه;twenty-four|بیست‌وچهار;twenty-five|بیست‌وپنج;twenty-six|بیست‌وشش','I am + age; How old are you?'),
v('My code is {x}. Please write it.','کد تمرینی من {f} است. لطفاً آن را بنویسید.','one two three four|یک، دو، سه، چهار;two three four five|دو، سه، چهار، پنج;three four five six|سه، چهار، پنج، شش;four five six seven|چهار، پنج، شش، هفت','My code is + digits; Please write it'),
])

add('foundation-family-and-possessions','''This is our family. | این خانوادهٔ ماست.
Their names are Anna and Ben. | نام آن‌ها آنا و بن است.
My father is a teacher. | پدر من معلم است.
Her sister has a phone. | خواهر او یک گوشی دارد.''',[
v('This is my {x}.','این {f} من است.','mother|مادر;father|پدر;brother|برادر;family|خانواده','This is my + relative'),
v('My sister has a {x}.','خواهر من یک {f} دارد.',THINGS,'My sister has a + noun'),
v('This is her {x}.','این {f} اوست. (زن)',THINGS,'This is her + noun'),
v('This is his {x}.','این {f} اوست. (مرد)',THINGS,'This is his + noun'),
v('This is {x}’s book.','این کتاب {f} است.',NAMES,'name + ’s + noun'),
v('Is this your {x}?','آیا این {f} شماست؟','bag|کیف;phone|گوشی;pen|خودکار;chair|صندلی','Is this your + noun?'),
v('My name is {x}. This is my family.','اسم من {f} است. این خانوادهٔ من است.',NAMES,'My name is ...; This is ...'),
v('I have {x} books.','من {f} کتاب دارم.','two|دو;three|سه;four|چهار;five|پنج','I have + number + plural noun'),
v('My sister is {x}. She is a student.','خواهر من {f} سال دارد. او دانشجو است.','eighteen|هجده;twenty|بیست;twenty-one|بیست‌ویک;twenty-two|بیست‌ودو','My sister is + age; She is ...'),
v('This is our {x}. It is big.','این {f} ماست. بزرگ است.','house|خانه;room|اتاق;table|میز;bag|کیف','our + noun; It is + adjective'),
])

add('foundation-objects-and-places','''That is your chair. | آن صندلی شماست.
Those are your books. | آن‌ها کتاب‌های شما هستند.
An apple is on the table. | یک سیب روی میز است.
Where are the keys? | کلیدها کجا هستند؟''',[
v('The {x} is on the table.','{f} روی میز است.',THINGS,'The + noun + is on ...'),
v('The {x} is in the bag.','{f} داخل کیف است.','book|کتاب;pen|خودکار;phone|گوشی;key|کلید','The + noun + is in ...'),
v('Where is the {x}?','{f} کجاست؟',THINGS,'Where is the + noun?'),
v('There is a {x} in the room.','یک {f} در اتاق هست.','table|میز;chair|صندلی;bag|کیف;phone|گوشی','There is a + noun + place'),
v('The {x} is next to the chair.','{f} کنار صندلی است.',THINGS,'The + noun + is next to ...'),
v('This is my {x}.','این {f} من است.','chair|صندلی;table|میز;room|اتاق;key|کلید','This is my + noun'),
v('Are these your {x}?','آیا این‌ها {f} شما هستند؟','books|کتاب‌های;pens|خودکارهای;keys|کلیدهای;bags|کیف‌های','Are these your + plural noun?'),
v('I have {x} keys.','من {f} کلید دارم.','two|دو;three|سه;four|چهار;five|پنج','I have + number + plural noun'),
v('There is a {x} on the chair.','یک {f} روی صندلی هست.',THINGS,'There is ... on ...'),
v('The {x} is not in the bag. It is on the table.','{f} داخل کیف نیست. روی میز است.','book|کتاب;pen|خودکار;phone|گوشی;key|کلید','It is not ...; It is ...'),
])

add('foundation-time-and-calendar','''It is ten o’clock. | ساعت ده است.
It is half past eight. | ساعت هشت‌ونیم است.
It is a quarter past nine. | ساعت نه‌وربع است.
It is a quarter to ten. | ساعت یک ربع به ده است.''',[
v('The class starts at {x}.','کلاس ساعت {f} شروع می‌شود.',TIMES,'at + time'),
v('We have a class on {x}.','ما {f} کلاس داریم.',DAYS,'on + day'),
v('The class is in {x}.','کلاس در ماه {f} است.','January|ژانویه;February|فوریه;March|مارس;April|آوریل','in + month'),
v('The class is in {x}.','کلاس در ماه {f} است.','May|مه;July|ژوئیه;August|اوت;September|سپتامبر','in + month'),
v('My class is on {x}.','کلاس من {f} است.','Wednesday|چهارشنبه;Thursday|پنج‌شنبه;Sunday|یکشنبه;Friday|جمعه','on + day'),
v('Please repeat the number {x}.','لطفاً عدد {f} را تکرار کنید.','thirteen|سیزده;thirty|سی;fifteen|پانزده;fifty|پنجاه','Please repeat + number'),
v('I am at home on {x}.','من {f} در خانه هستم.',DAYS,'I am at home on + day'),
v('Today is {x}.','امروز {f} است.','the first of October|اول اکتبر;the second of November|دوم نوامبر;the third of December|سوم دسامبر;the fourth of June|چهارم ژوئن','Today is + date'),
v('The class is on {x} at ten.','کلاس {f} ساعت ده است.',DAYS,'on + day + at + time'),
v('It is {x}. Please say the time again.','ساعت {f} است. لطفاً ساعت را دوباره بگویید.','seven thirty|هفت‌ونیم;eight thirty|هشت‌ونیم;nine thirty|نه‌ونیم;ten thirty|ده‌ونیم','It is + time; Please say ...'),
])

add('foundation-everyday-routine','''I go to work at eight. | من ساعت هشت سر کار می‌روم.
She has breakfast at seven. | او ساعت هفت صبحانه می‌خورد. (زن)
He goes home at five. | او ساعت پنج به خانه می‌رود. (مرد)
We study English at home. | ما در خانه انگلیسی می‌خوانیم.''',[
v('I get up at {x}.','من ساعت {f} بیدار می‌شوم.','six|شش;eight|هشت;nine|نه;ten|ده','I get up at + time'),
v('I study on {x}.','من {f} درس می‌خوانم.',DAYS,'I study on + day'),
v('She works at {x}.','او ساعت {f} کار می‌کند. (زن)',TIMES,'She works at + time'),
v('Do you work on {x}?','آیا {f} کار می‌کنید؟',DAYS,'Do you + verb + time?'),
v('He does not study on {x}.','او {f} درس نمی‌خواند. (مرد)',DAYS,'He does not + verb'),
v('The class is at {x}.','کلاس ساعت {f} است.',TIMES,'The class is at + time'),
v('My {x} is a teacher.','{f} من معلم است.','mother|مادر;father|پدر;sister|خواهر;brother|برادر','My + relative + is a + job'),
v('I have {x} books at home.','من {f} کتاب در خانه دارم.','two|دو;three|سه;four|چهار;five|پنج','I have + number + books'),
v('I work on {x}, but I do not study.','من {f} کار می‌کنم، اما درس نمی‌خوانم.',DAYS,'I work ..., but I do not ...'),
v('What time does {x} start work?','{f} چه ساعتی کار را شروع می‌کند؟',NAMES,'What time does + name + verb?'),
])

add('survival-current-activities','''They are listening to music. | آن‌ها دارند به موسیقی گوش می‌دهند.
He is not cooking now. | او الان آشپزی نمی‌کند. (مرد)
What are you doing? | چه کار می‌کنی؟
Is she reading a book? | آیا او دارد کتاب می‌خواند؟ (زن)''',[
v('I am {x} now.','من الان دارم {f}.','writing|می‌نویسم;cooking|آشپزی می‌کنم;studying|درس می‌خوانم;working|کار می‌کنم','I am + ing + now'),
v('She is {x} now.','او الان دارد {f}. (زن)','reading|مطالعه می‌کند;writing|می‌نویسد;cooking|آشپزی می‌کند;studying|درس می‌خواند','She is + ing + now'),
v('We are {x} now.','ما الان داریم {f}.','reading|مطالعه می‌کنیم;writing|می‌نویسیم;studying|درس می‌خوانیم;working|کار می‌کنیم','We are + ing + now'),
v('Are you {x} now?','آیا الان داری {f}؟','reading|مطالعه می‌کنی;writing|می‌نویسی;studying|درس می‌خوانی;working|کار می‌کنی','Are you + ing?'),
v('He is not {x} now.','او الان {f}. (مرد)','reading|مطالعه نمی‌کند;writing|نمی‌نویسد;studying|درس نمی‌خواند;working|کار نمی‌کند','He is not + ing'),
v('I work on {x}.','من {f} کار می‌کنم.',DAYS,'I work on + day'),
v('I get up at {x} every day.','من هر روز ساعت {f} بیدار می‌شوم.',TIMES,'I get up at + time + every day'),
v('My book is {x}.','کتاب من {f} است.','on the table|روی میز;under the chair|زیر صندلی;in the bag|داخل کیف;next to the phone|کنار گوشی','My book is + place'),
v('Is {x} working now?','آیا {f} الان دارد کار می‌کند؟',NAMES,'Is + name + ing + now?'),
v('I study on {x}, but I am not studying now.','من {f} درس می‌خوانم، اما الان درس نمی‌خوانم.',DAYS,'present simple + but + present continuous'),
])

add('survival-hobbies-and-free-time','''What do you do in your free time? | در وقت آزادت چه کار می‌کنی؟
I sometimes cook at home. | من گاهی در خانه آشپزی می‌کنم.
He likes football. | او فوتبال دوست دارد. (مرد)
We like walking. | ما پیاده‌روی را دوست داریم.''',[
v('I like {x}.','من {f} را دوست دارم.','cooking|آشپزی;walking|پیاده‌روی;football|فوتبال;books|کتاب‌ها','I like + noun/ing'),
v('Do you like {x}?','آیا {f} را دوست داری؟','music|موسیقی;reading|مطالعه;football|فوتبال;walking|پیاده‌روی','Do you like + noun/ing?'),
v('I do not like {x}.','من {f} را دوست ندارم.','cooking|آشپزی;walking|پیاده‌روی;coffee|قهوه;milk|شیر','I do not like + noun/ing'),
v('She likes {x}.','او {f} را دوست دارد. (زن)','music|موسیقی;reading|مطالعه;football|فوتبال;cooking|آشپزی','She likes + noun/ing'),
v('I often read on {x}.','من اغلب {f} مطالعه می‌کنم.',DAYS,'I often + verb + time'),
v('I study at {x}.','من ساعت {f} درس می‌خوانم.',TIMES,'I study at + time'),
v('I am {x} now.','من الان دارم {f}.','reading|مطالعه می‌کنم;cooking|آشپزی می‌کنم;walking|پیاده‌روی می‌کنم;listening to music|به موسیقی گوش می‌دهم','I am + ing + now'),
v('Do you work on {x}?','آیا {f} کار می‌کنی؟',DAYS,'Do you work on + day?'),
v('I like reading, but I do not like {x}.','من مطالعه را دوست دارم، اما {f} را دوست ندارم.','football|فوتبال;music|موسیقی;cooking|آشپزی;walking|پیاده‌روی','I like ..., but I do not like ...'),
v('Does {x} like music?','آیا {f} موسیقی دوست دارد؟',NAMES,'Does + name + like ...?'),
])

add('survival-weather-and-seasons','''It is warm in spring. | در بهار هوا گرم و ملایم است.
It is cool in autumn. | در پاییز هوا خنک است.
I am cold. | من احساس سرما می‌کنم.
Is it raining? | آیا باران می‌بارد؟''',[
v('It is {x} today.','امروز هوا {f} است.','cold|سرد;hot|گرم;warm|گرم و ملایم;cool|خنک','It is + weather adjective'),
v('Do you like {x}?','آیا {f} را دوست داری؟','spring|بهار;summer|تابستان;autumn|پاییز;winter|زمستان','Do you like + season?'),
v('I do not like {x}.','من {f} را دوست ندارم.','cold weather|هوای سرد;hot weather|هوای گرم;rain|باران;winter|زمستان','I do not like + noun'),
v('Is it {x} today?','آیا امروز هوا {f} است؟','sunny|آفتابی;cold|سرد;hot|گرم;warm|گرم و ملایم','Is it + weather adjective?'),
v('It is not {x} today.','امروز هوا {f} نیست.','sunny|آفتابی;cold|سرد;hot|گرم;cool|خنک','It is not + weather adjective'),
v('I am at home on {x}.','من {f} در خانه هستم.',DAYS,'I am at home on + day'),
v('We are {x} now.','ما الان داریم {f}.','reading|مطالعه می‌کنیم;cooking|آشپزی می‌کنیم;working|کار می‌کنیم;walking|پیاده‌روی می‌کنیم','We are + ing + now'),
v('She likes {x}.','او {f} را دوست دارد. (زن)','music|موسیقی;reading|مطالعه;tea|چای;coffee|قهوه','She likes + noun/ing'),
v('It is {x}, but we are at home.','هوا {f} است، اما ما در خانه هستیم.','sunny|آفتابی;warm|گرم و ملایم;hot|گرم;cool|خنک','It is ..., but ...'),
v('I like {x} because it is warm.','من {f} را دوست دارم، چون هوا گرم و ملایم است.','spring|بهار;May|ماه مه;June|ماه ژوئن;September|ماه سپتامبر','I like ... because ...'),
])

add('foundation-buying-something','''How much is this pen? | قیمت این خودکار چقدر است؟
I would like two pens, please. | دو خودکار می‌خواهم، لطفاً.
I can pay in cash. | می‌توانم نقدی پرداخت کنم.
It is five pounds. | پنج پوند است.''',[
v('I would like this {x}, please.','این {f} را می‌خواهم، لطفاً.','pen|خودکار;phone|گوشی;bag|کیف;chair|صندلی','I would like this + noun'),
v('How much is this {x}?','قیمت این {f} چقدر است؟','book|کتاب;bag|کیف;chair|صندلی;phone|گوشی','How much is this + noun?'),
v('It is {x} pounds.','{f} پوند است.','two|دو;twelve|دوازده;twenty|بیست;thirty|سی','It is + price + pounds'),
v('How much are these {x}?','قیمت این {f} چقدر است؟','books|کتاب‌ها;bags|کیف‌ها;chairs|صندلی‌ها;phones|گوشی‌ها','How much are these + plural noun?'),
v('I would like {x} books, please.','{f} کتاب می‌خواهم، لطفاً.','two|دو;three|سه;four|چهار;five|پنج','I would like + number + noun'),
v('The {x} is on the table.','{f} روی میز است.',THINGS,'The + noun + is + place'),
v('Please repeat {x}.','لطفاً {f} را تکرار کنید.','thirteen|سیزده;thirty|سی;fifteen|پانزده;fifty|پنجاه','Please repeat + number'),
v('Do you have a {x}?','آیا {f} دارید؟',THINGS,'Do you have a + noun?'),
v('I would like this book. Is it {x} pounds?','این کتاب را می‌خواهم. آیا {f} پوند است؟','ten|ده;twelve|دوازده;fifteen|پانزده;twenty|بیست','I would like ...; Is it + price?'),
v('These {x} are for my sister.','این {f} برای خواهرم هستند.','books|کتاب‌ها;pens|خودکارها;bags|کیف‌ها;phones|گوشی‌ها','These + plural noun + are for ...'),
])

add('survival-shopping-and-clothing','''I would like a red coat. | یک پالتوی قرمز می‌خواهم.
It is too large. | بیش از حد بزرگ است.
These shoes are too small. | این کفش‌ها بیش از حد کوچک هستند.
What size would you like? | چه اندازه‌ای می‌خواهید؟''',[
v('Do you have a {x} shirt?','آیا پیراهن {f} دارید؟',COLOURS,'a + colour + noun'),
v('I would like a {x} coat.','یک پالتوی {f} می‌خواهم.','blue|آبی;green|سبز;black|مشکی;small|کوچک','I would like a + adjective + noun'),
v('These shoes are {x}.','این کفش‌ها {f} هستند.','blue|آبی;green|سبز;black|مشکی;too large|بیش از حد بزرگ','These shoes are + adjective'),
v('The shirt is {x}.','پیراهن {f} است.','small|کوچک;medium|اندازهٔ متوسط;large|بزرگ;blue|آبی','The shirt is + description'),
v('Do you have {x} shoes?','کفش {f} دارید؟',COLOURS,'Do you have + colour + shoes?'),
v('How much is this {x}?','قیمت این {f} چقدر است؟','shirt|پیراهن;coat|پالتو;bag|کیف;book|کتاب','How much is this + noun?'),
v('It is {x} pounds.','{f} پوند است.','ten|ده;fifteen|پانزده;twenty|بیست;thirty|سی','It is + price'),
v('Is this your {x}?','آیا این {f} شماست؟','shirt|پیراهن;coat|پالتو;bag|کیف;book|کتاب','Is this your + noun?'),
v('I like this {x} shirt. Can I try it on?','این پیراهن {f} را دوست دارم. می‌توانم آن را امتحان کنم؟',COLOURS,'I like ...; Can I try it on?'),
v('The {x} coat is too small.','پالتوی {f} بیش از حد کوچک است.',COLOURS,'The + colour + coat + is too small'),
])

add('survival-cafe-and-food','''Some water, please. | کمی آب، لطفاً.
A cup of coffee, please. | یک فنجان قهوه، لطفاً.
Can I pay by card? | می‌توانم با کارت پرداخت کنم؟
The sandwich is five pounds. | ساندویچ پنج پوند است.''',[
v('I would like {x}, please.','{f} می‌خواهم، لطفاً.','a coffee|یک قهوه;a sandwich|یک ساندویچ;a glass of milk|یک لیوان شیر;some water|کمی آب','I would like + order'),
v('A {x}, please.','یک {f}، لطفاً.','tea|چای;coffee|قهوه;sandwich|ساندویچ;glass of water|لیوان آب','A + order + please'),
v('How much is the {x}?','قیمت {f} چقدر است؟','tea|چای;coffee|قهوه;milk|شیر;water|آب','How much is the + noun?'),
v('I would like my {x} without sugar.','{f} را بدون شکر می‌خواهم.','tea|چایم;coffee|قهوه‌ام;milk|شیرم;drink|نوشیدنی‌ام','I would like ... without sugar'),
v('Do you have {x}?','آیا {f} دارید؟','tea|چای;coffee|قهوه;milk|شیر;sandwiches|ساندویچ','Do you have + item?'),
v('It is {x} pounds.','{f} پوند است.','two|دو;three|سه;five|پنج;ten|ده','It is + price'),
v('My {x} is on the table.','{f} من روی میز است.','book|کتاب;phone|گوشی;bag|کیف;pen|خودکار','My + noun + is + place'),
v('I like {x}.','من {f} دوست دارم.',DRINKS,'I like + item'),
v('I would like {x} and a sandwich.','{f} و یک ساندویچ می‌خواهم.','a tea|یک چای;a coffee|یک قهوه;a glass of water|یک لیوان آب;a glass of milk|یک لیوان شیر','I would like ... and ...'),
v('A cup of {x} without milk, please.','یک فنجان {f} بدون شیر، لطفاً.','tea|چای;coffee|قهوه;black tea|چای سیاه;green tea|چای سبز','A cup of ... without ...'),
])

add('survival-directions-and-neighborhood','''Turn right at the café. | کنار کافه به راست بپیچید.
The bank is opposite the station. | بانک روبه‌روی ایستگاه است.
First, go straight. Then turn left. | اول مستقیم بروید. بعد به چپ بپیچید.
Please say the directions again. | لطفاً مسیر را دوباره بگویید.''',[
v('Where is the {x}, please?','لطفاً بگویید {f} کجاست؟','bank|بانک;café|کافه;bus stop|ایستگاه اتوبوس;station|ایستگاه','Where is the + place?'),
v('The {x} is next to the bank.','{f} کنار بانک است.','café|کافه;station|ایستگاه;shop|فروشگاه;bus stop|ایستگاه اتوبوس','The + place + is next to ...'),
v('Turn left at the {x}.','کنار {f} به چپ بپیچید.','café|کافه;station|ایستگاه;shop|فروشگاه;bus stop|ایستگاه اتوبوس','Turn left at the + landmark'),
v('Turn right at the {x}.','کنار {f} به راست بپیچید.','bank|بانک;station|ایستگاه;shop|فروشگاه;bus stop|ایستگاه اتوبوس','Turn right at the + landmark'),
v('Is the {x} near here?','آیا {f} نزدیک اینجاست؟','bank|بانک;café|کافه;station|ایستگاه;shop|فروشگاه','Is the + place + near here?'),
v('The {x} is under the chair.','{f} زیر صندلی است.',THINGS,'The + noun + is under ...'),
v('Please spell {x}.','لطفاً {f} را هجی کنید.',NAMES,'Please spell + name'),
v('We are at home on {x}.','ما {f} در خانه هستیم.',DAYS,'We are + place + on + day'),
v('Go straight, then turn left at the {x}.','مستقیم بروید، بعد کنار {f} به چپ بپیچید.','bank|بانک;café|کافه;shop|فروشگاه;station|ایستگاه','Go straight, then turn left at ...'),
v('The {x} is opposite the bank. Is it near here?','{f} روبه‌روی بانک است. آیا نزدیک اینجاست؟','café|کافه;station|ایستگاه;shop|فروشگاه;bus stop|ایستگاه اتوبوس','opposite + landmark; Is it near here?'),
])

add('survival-public-transport','''Where is the bus stop? | ایستگاه اتوبوس کجاست؟
How much is a ticket? | قیمت یک بلیت چقدر است؟
A ticket to the station, please. | یک بلیت به ایستگاه، لطفاً.
Does this train go to the centre? | آیا این قطار به مرکز شهر می‌رود؟''',[
v('The bus leaves at {x}.','اتوبوس ساعت {f} حرکت می‌کند.',TIMES,'The bus leaves at + time'),
v('The train leaves from platform {x}.','قطار از سکوی {f} حرکت می‌کند.','one|یک;two|دو;three|سه;four|چهار','from platform + number'),
v('Does bus number {x} go to the station?','آیا اتوبوس شمارهٔ {f} به ایستگاه می‌رود؟','two|دو;five|پنج;ten|ده;twelve|دوازده','Does bus number ... go to ...?'),
v('One ticket to {x}, please.','یک بلیت به {f}، لطفاً.','the station|ایستگاه;the centre|مرکز شهر;Park Street|خیابان پارک;the café|کافه','One ticket to + destination'),
v('Is this platform {x}?','آیا این سکوی {f} است؟','one|یک;two|دو;three|سه;four|چهار','Is this platform + number?'),
v('The station is next to the {x}.','ایستگاه کنار {f} است.','bank|بانک;shop|فروشگاه;café|کافه;bus stop|ایستگاه اتوبوس','next to the + landmark'),
v('Turn left at the {x}.','کنار {f} به چپ بپیچید.','bank|بانک;shop|فروشگاه;café|کافه;bus stop|ایستگاه اتوبوس','Turn left at the + landmark'),
v('A ticket is {x} pounds.','یک بلیت {f} پوند است.','two|دو;three|سه;five|پنج;ten|ده','A ticket is + price'),
v('The train leaves at {x} from platform two.','قطار ساعت {f} از سکوی دو حرکت می‌کند.',TIMES,'leaves at + time + from platform ...'),
v('Bus number {x} goes to the centre.','اتوبوس شمارهٔ {f} به مرکز شهر می‌رود.','two|دو;five|پنج;twelve|دوازده;twenty|بیست','Bus number ... goes to ...'),
])

add('survival-appointments-and-time','''Can I change my appointment? | می‌توانم زمان قرارم را تغییر بدهم؟
Tuesday morning is good. | صبح سه‌شنبه مناسب است.
I am busy at ten. | ساعت ده گرفتارم.
Please repeat the time. | لطفاً ساعت را تکرار کنید.''',[
v('Are you free on {x}?','آیا {f} وقت آزاد دارید؟','Monday|دوشنبه;Friday|جمعه;Saturday|شنبه;Wednesday|چهارشنبه','Are you free on + day?'),
v('Can I come at {x}?','می‌توانم ساعت {f} بیایم؟','seven|هفت;eight|هشت;nine|نه;eleven|یازده','Can I come at + time?'),
v('I am busy on {x}.','من {f} گرفتارم.',DAYS,'I am busy on + day'),
v('My appointment is at {x}.','قرار من ساعت {f} است.',TIMES,'My appointment is at + time'),
v('Is {x} available?','آیا برای {f} وقت خالی هست؟','Monday morning|صبح دوشنبه;Tuesday morning|صبح سه‌شنبه;Friday afternoon|بعدازظهر جمعه;Saturday afternoon|بعدازظهر شنبه','Is + time + available?'),
v('The bus leaves at {x}.','اتوبوس ساعت {f} حرکت می‌کند.',TIMES,'leaves at + time'),
v('Please write {x}.','لطفاً {f} را بنویسید.','your name|نامتان;your number|شماره‌تان;the day|روز;the time|ساعت','Please write + information'),
v('I work on {x}.','من {f} کار می‌کنم.',DAYS,'I work on + day'),
v('My appointment is on {x} at eleven.','قرار من {f} ساعت یازده است.',DAYS,'on + day + at + time'),
v('Can I come on {x}? I am free in the morning.','می‌توانم {f} بیایم؟ صبح وقت آزاد دارم.',DAYS,'Can I come on ...?; I am free ...'),
])

add('survival-school-and-learning','''Please write your answer here. | لطفاً پاسختان را اینجا بنویسید.
Do not close your book. | کتابتان را نبندید.
I do not understand question two. | سؤال دو را متوجه نمی‌شوم.
The homework is on page ten. | تکلیف در صفحهٔ ده است.''',[
v('Open your book at page {x}.','کتابتان را در صفحهٔ {f} باز کنید.','one|یک;two|دو;five|پنج;twelve|دوازده','Open your book at page + number'),
v('Please read question {x}.','لطفاً سؤال {f} را بخوانید.','one|یک;two|دو;three|سه;four|چهار','Please read question + number'),
v('Please write the word {x}.','لطفاً واژهٔ {f} را بنویسید.','city|شهر;book|کتاب;class|کلاس;name|نام','Please write the word + word'),
v('What does “{x}” mean?','«{x}» چه معنی می‌دهد؟','room|اتاق;street|خیابان;class|کلاس;homework|تکلیف','What does + word + mean?'),
v('The class starts at {x}.','کلاس ساعت {f} شروع می‌شود.',TIMES,'The class starts at + time'),
v('Please spell {x} slowly.','لطفاً {f} را آهسته هجی کنید.',NAMES,'Please spell + name + slowly'),
v('I study on {x}.','من {f} درس می‌خوانم.',DAYS,'I study on + day'),
v('The book is {x}.','کتاب {f} است.','on the table|روی میز;in the bag|داخل کیف;under the chair|زیر صندلی;next to the phone|کنار گوشی','The book is + place'),
v('I do not understand question {x}. Please help me.','سؤال {f} را متوجه نمی‌شوم. لطفاً کمکم کنید.','one|یک;three|سه;four|چهار;five|پنج','I do not understand ...; Please help me'),
v('The class is on {x} at ten.','کلاس {f} ساعت ده است.',DAYS,'on + day + at + time'),
])

add('survival-invitations-and-plans','''Let us have tea together. | بیا با هم چای بخوریم.
Sorry, I cannot come. | ببخشید، نمی‌توانم بیایم.
I am free tomorrow afternoon. | فردا بعدازظهر وقت آزاد دارم.
Where would you like to meet? | کجا دوست داری همدیگر را ببینیم؟''',[
v('Would you like to meet on {x}?','دوست داری {f} همدیگر را ببینیم؟',DAYS,'Would you like to + verb?'),
v('Let us meet at {x}.','بیا ساعت {f} همدیگر را ببینیم.','six|شش;seven|هفت;eight|هشت;nine|نه','Let us meet at + time'),
v('Sorry, I am busy on {x}.','ببخشید، {f} گرفتارم.','Monday|دوشنبه;Tuesday|سه‌شنبه;Saturday|شنبه;Sunday|یکشنبه','Sorry, I am busy on + day'),
v('Would you like {x}?','آیا {f} میل داری؟','a tea|یک چای;a coffee|یک قهوه;a sandwich|یک ساندویچ;some water|کمی آب','Would you like + item?'),
v('Let us meet at the {x}.','بیا در {f} همدیگر را ببینیم.','café|کافه;station|ایستگاه;shop|فروشگاه;bus stop|ایستگاه اتوبوس','Let us meet at the + place'),
v('I like {x}.','من {f} را دوست دارم.','music|موسیقی;reading|مطالعه;walking|پیاده‌روی;cooking|آشپزی','I like + noun/ing'),
v('The café is next to the {x}.','کافه کنار {f} است.','bank|بانک;station|ایستگاه;shop|فروشگاه;bus stop|ایستگاه اتوبوس','next to the + landmark'),
v('Are you free at {x}?','آیا ساعت {f} وقت آزاد داری؟',TIMES,'Are you free at + time?'),
v('Let us meet on {x} at ten.','بیا {f} ساعت ده همدیگر را ببینیم.',DAYS,'Let us meet on ... at ...'),
v('I am busy on {x}, but I am free tomorrow.','من {f} گرفتارم، اما فردا وقت آزاد دارم.',DAYS,'I am busy ..., but I am free ...'),
])

add('survival-past-and-future-plans','''We were at home last night. | ما دیشب در خانه بودیم.
She studied yesterday. | او دیروز درس خواند. (زن)
I am not going to work tomorrow. | قصد ندارم فردا کار کنم.
Were you at home yesterday? | آیا دیروز در خانه بودی؟''',[
v('I was at the {x} yesterday.','من دیروز در {f} بودم.','café|کافه;station|ایستگاه;shop|فروشگاه;bank|بانک','I was + place + yesterday'),
v('I am going to {x} tomorrow.','من قصد دارم فردا {f}.','work|کار کنم;read|مطالعه کنم;cook|آشپزی کنم;walk|پیاده‌روی کنم','I am going to + verb + tomorrow'),
v('She went to the {x} yesterday.','او دیروز به {f} رفت. (زن)','station|ایستگاه;shop|فروشگاه;bank|بانک;class|کلاس','She went to + place + yesterday'),
v('Did you {x} yesterday?','آیا دیروز {f}؟','work|کار کردی;read|مطالعه کردی;cook|آشپزی کردی;walk|پیاده‌روی کردی','Did you + verb + yesterday?'),
v('I did not {x} yesterday.','من دیروز {f}.','study|درس نخواندم;cook|آشپزی نکردم;walk|پیاده‌روی نکردم;work at home|در خانه کار نکردم','I did not + verb + yesterday'),
v('I work on {x}.','من {f} کار می‌کنم.',DAYS,'I work on + day'),
v('I am {x} now.','من الان دارم {f}.','reading|مطالعه می‌کنم;studying|درس می‌خوانم;working|کار می‌کنم;cooking|آشپزی می‌کنم','I am + ing + now'),
v('Let us meet on {x}.','بیا {f} همدیگر را ببینیم.',DAYS,'Let us meet on + day'),
v('I studied yesterday. I am going to work on {x}.','من دیروز درس خواندم. قصد دارم {f} کار کنم.',DAYS,'past simple; be going to + verb'),
v('Was {x} at the café yesterday?','آیا {f} دیروز در کافه بود؟',NAMES,'Was + name + place + yesterday?'),
])

add('survival-job-interview','''I am a shop assistant. | من فروشنده هستم.
What do you do? | شغلتان چیست؟
I cannot work on Sunday. | من نمی‌توانم یکشنبه کار کنم.
Can you start tomorrow? | می‌توانید فردا شروع کنید؟''',[
v('I can work on {x}.','من می‌توانم {f} کار کنم.',DAYS,'I can + verb + day'),
v('Can you start at {x}?','می‌توانید ساعت {f} شروع کنید؟',TIMES,'Can you start at + time?'),
v('I am available on {x}.','من {f} وقت آزاد دارم.','Tuesday|سه‌شنبه;Friday|جمعه;Saturday|شنبه;Wednesday|چهارشنبه','I am available on + day'),
v('I work at the {x}.','من در {f} کار می‌کنم.','café|کافه;station|ایستگاه;school|مدرسه;hotel|هتل','I work at the + place'),
v('I can {x}.','من می‌توانم {f}.','read English|انگلیسی بخوانم;write my name|نامم را بنویسم;help you|به شما کمک کنم;start tomorrow|فردا شروع کنم','I can + verb'),
v('My name is {x}. I am a student.','اسم من {f} است. من دانشجو هستم.',NAMES,'My name is ...; I am a + role'),
v('I study at {x}.','من ساعت {f} درس می‌خوانم.',TIMES,'I study at + time'),
v('Did you work on {x}?','آیا {f} کار کردید؟',DAYS,'Did you work on + day?'),
v('I can work on {x}, but not in the morning.','من می‌توانم {f} کار کنم، اما صبح نمی‌توانم.',DAYS,'I can ..., but not ...'),
v('I am going to start work on {x}.','من قصد دارم {f} کار را شروع کنم.',DAYS,'I am going to start work on + day'),
])

add('survival-personal-information','''Please complete this form. | لطفاً این فرم را کامل کنید.
Please spell your last name. | لطفاً نام خانوادگی‌تان را هجی کنید.
What is your city? | شهر شما چیست؟
My city is London. | شهر من لندن است.''',[
v('My first name is {x}.','نام کوچک من {f} است.','Anna|آنا;Ben|بن;Tim|تیم;Reza|رضا','My first name is + name'),
v('My last name is {x}.','نام خانوادگی من {f} است.','Lee|لی;Brown|براون;Green|گرین;Smith|اسمیت','My last name is + name'),
v('My address is {x} Park Street.','نشانی من پلاک {f}، خیابان پارک است.','ten|ده;eleven|یازده;fourteen|چهارده;twenty|بیست','My address is + number + street'),
v('I live in {x}.','من در {f} زندگی می‌کنم.',PLACES,'I live in + city'),
v('Please check your {x}.','لطفاً {f} را بررسی کنید.','address|نشانی‌تان;email|ایمیلتان;number|شماره‌تان;first name|نام کوچکتان','Please check your + information'),
v('I am {x} years old.','من {f} سال دارم.','eighteen|هجده;twenty|بیست;thirty|سی;forty|چهل','I am + age + years old'),
v('I can work on {x}.','من می‌توانم {f} کار کنم.',DAYS,'I can work on + day'),
v('Please spell {x} slowly.','لطفاً {f} را آهسته هجی کنید.',NAMES,'Please spell + name + slowly'),
v('My name is {x}. I live at 12 Park Street.','اسم من {f} است. در پلاک ۱۲، خیابان پارک زندگی می‌کنم.',NAMES,'My name is ...; I live at + address'),
v('Is your first name {x}? Please check the form.','آیا نام کوچک شما {f} است؟ لطفاً فرم را بررسی کنید.',NAMES,'Is your first name ...?; Please check ...'),
])

add('survival-renting-a-home','''Is the room available? | آیا اتاق در دسترس است؟
The kitchen is shared. | آشپزخانه مشترک است.
The room is near the station. | اتاق نزدیک ایستگاه است.
Is there a bathroom? | آیا حمام دارد؟''',[
v('The rent is {x} pounds per month.','اجاره ماهی {f} پوند است.','four hundred|چهارصد;five hundred|پانصد;six hundred|ششصد;seven hundred|هفتصد','The rent is + price + per month'),
v('Is there a {x}?','آیا {f} دارد؟','table|میز;chair|صندلی;phone|تلفن;book|کتاب','Is there a + noun?'),
v('Can I see the room on {x}?','می‌توانم {f} اتاق را ببینم؟','Monday|دوشنبه;Friday|جمعه;Saturday|شنبه;Wednesday|چهارشنبه','Can I see the room on + day?'),
v('The room is next to the {x}.','اتاق کنار {f} است.','kitchen|آشپزخانه;bathroom|حمام;shared kitchen|آشپزخانهٔ مشترک;shared bathroom|حمام مشترک','The room is next to the + place'),
v('The room is {x}.','اتاق {f} است.','small|کوچک;large|بزرگ;cold|سرد;warm|گرم','The room is + adjective'),
v('My address is {x} Park Street.','نشانی من پلاک {f}، خیابان پارک است.','ten|ده;twelve|دوازده;fourteen|چهارده;twenty|بیست','My address is + address'),
v('Are you free at {x}?','آیا ساعت {f} وقت آزاد دارید؟',TIMES,'Are you free at + time?'),
v('There are {x} chairs in the room.','{f} صندلی در اتاق هست.','two|دو;three|سه;four|چهار;five|پنج','There are + number + noun'),
v('I can come on {x}. Is ten OK?','می‌توانم {f} بیایم. ساعت ده مناسب است؟',DAYS,'I can come on ...; Is ... OK?'),
v('The room is {x}, and internet is included.','اتاق {f} است و اینترنت در قیمت اجاره حساب شده است.','near the station|نزدیک ایستگاه;near the café|نزدیک کافه;next to the kitchen|کنار آشپزخانه;next to the bathroom|کنار حمام','The room is ... and ... is included'),
])

add('survival-travel-and-tickets','''A single ticket to London, please. | یک بلیت یک‌طرفه به لندن، لطفاً.
I am going to travel tomorrow. | من قصد دارم فردا سفر کنم.
Is this the train to Leeds? | آیا این قطار به لیدز می‌رود؟
Please repeat the arrival time. | لطفاً ساعت رسیدن را تکرار کنید.''',[
v('A return ticket to {x}, please.','یک بلیت رفت‌وبرگشت به {f}، لطفاً.','London|لندن;Paris|پاریس;York|یورک;Oxford|آکسفورد','A return ticket to + destination'),
v('The train arrives at {x}.','قطار ساعت {f} می‌رسد.',TIMES,'The train arrives at + time'),
v('I am going to return on {x}.','من قصد دارم {f} برگردم.','Monday|دوشنبه;Tuesday|سه‌شنبه;Saturday|شنبه;Sunday|یکشنبه','I am going to return on + day'),
v('The train leaves from platform {x}.','قطار از سکوی {f} حرکت می‌کند.','one|یک;two|دو;three|سه;four|چهار','leaves from platform + number'),
v('A single to {x}, please.','یک بلیت یک‌طرفه به {f}، لطفاً.','Leeds|لیدز;York|یورک;Oxford|آکسفورد;Paris|پاریس','A single to + destination'),
v('The ticket is {x} pounds.','بلیت {f} پوند است.','ten|ده;twenty|بیست;thirty|سی;forty|چهل','The ticket is + price'),
v('My first name is {x}.','نام کوچک من {f} است.',NAMES,'My first name is + name'),
v('Is this platform {x}?','آیا این سکوی {f} است؟','one|یک;two|دو;three|سه;four|چهار','Is this platform + number?'),
v('I am going to travel to {x} tomorrow. I would like a return ticket.','من قصد دارم فردا به {f} بروم. یک بلیت رفت‌وبرگشت می‌خواهم.',PLACES,'I am going to + verb; I would like + noun'),
v('The train leaves at ten and arrives at {x}.','قطار ساعت ده حرکت می‌کند و ساعت {f} می‌رسد.','eleven|یازده;twelve|دوازده;one|یک;two|دو','leaves at ... and arrives at ...'),
])

add('survival-hotel-and-stay','''Where is reception? | پذیرش کجاست؟
There is no towel in my room. | در اتاق من حوله نیست.
Is breakfast included? | آیا صبحانه در قیمت حساب شده است؟
The bathroom is next to the room. | حمام کنار اتاق است.''',[
v('I have a booking for {x} nights.','من برای {f} شب رزرو دارم.','two|دو;three|سه;four|چهار;five|پنج','I have a booking for + number + nights'),
v('My room is number {x}.','شمارهٔ اتاق من {f} است.','ten|ده;eleven|یازده;twelve|دوازده;fourteen|چهارده','My room is number + number'),
v('Breakfast is at {x}.','صبحانه ساعت {f} است.',TIMES,'Breakfast is at + time'),
v('Can I have {x}, please?','می‌توانم لطفاً {f} داشته باشم؟','a key|یک کلید;some water|کمی آب;a cup of tea|یک فنجان چای;a glass of milk|یک لیوان شیر','Can I have + request?'),
v('Where is the {x}?','{f} کجاست؟','bathroom|حمام;kitchen|آشپزخانه;café|کافه;station|ایستگاه','Where is the + place?'),
v('My last name is {x}.','نام خانوادگی من {f} است.','Lee|لی;Brown|براون;Green|گرین;Smith|اسمیت','My last name is + name'),
v('The room is {x} pounds per night.','اتاق شبی {f} پوند است.','forty|چهل;fifty|پنجاه;sixty|شصت;seventy|هفتاد','price + per night'),
v('I am going to arrive on {x}.','من قصد دارم {f} برسم.',DAYS,'I am going to arrive on + day'),
v('I am in room {x}. Can I have a towel?','من در اتاق {f} هستم. می‌توانم یک حوله داشته باشم؟','ten|ده;eleven|یازده;twelve|دوازده;fourteen|چهارده','I am in room ...; Can I have ...?'),
v('I have a booking. My name is {x}.','من رزرو دارم. اسم من {f} است.',NAMES,'I have a booking; My name is ...'),
])

add('survival-phone-and-messages','''Please call me later. | لطفاً بعداً به من زنگ بزن.
Can you say your number again? | می‌توانی شماره‌ات را دوباره بگویی؟
I am at the station. | من در ایستگاه هستم.
He is not here now. | او الان اینجا نیست. (مرد)''',[
v('Hello, this is {x} speaking.','سلام، {f} هستم. (در تماس)','Anna|آنا;Ben|بن;Tim|تیم;Reza|رضا','This is + name + speaking'),
v('Can I speak to {x}, please?','می‌توانم لطفاً با {f} صحبت کنم؟','Anna|آنا;Sara|سارا;Tim|تیم;Reza|رضا','Can I speak to + name?'),
v('Please call me at {x}.','لطفاً ساعت {f} به من زنگ بزن.','four|چهار;six|شش;seven|هفت;eight|هشت','Please call me at + time'),
v('Please ask {x} to call me.','لطفاً به {f} بگو به من زنگ بزند.',NAMES,'Please ask + name + to call me'),
v('I am at the {x} now.','من الان در {f} هستم.','café|کافه;shop|فروشگاه;hotel|هتل;bank|بانک','I am at the + place + now'),
v('My contact code is {x}.','کد تماس تمرینی من {f} است.','zero one two three|صفر، یک، دو، سه;zero two three four|صفر، دو، سه، چهار;zero three four five|صفر، سه، چهار، پنج;zero four five six|صفر، چهار، پنج، شش','My contact code is + digits'),
v('Let us meet on {x}.','بیا {f} همدیگر را ببینیم.',DAYS,'Let us meet on + day'),
v('She is {x} now.','او الان دارد {f}. (زن)','reading|مطالعه می‌کند;working|کار می‌کند;cooking|آشپزی می‌کند;studying|درس می‌خواند','She is + ing + now'),
v('This is {x}. I am at the café. Please call me.','{f} هستم. در کافه هستم. لطفاً به من زنگ بزن.',NAMES,'This is ...; I am ...; Please call ...'),
v('I am busy on {x}. Can you call tomorrow?','من {f} گرفتارم. می‌توانی فردا زنگ بزنی؟',DAYS,'I am busy ...; Can you call ...?'),
])

add('survival-services-and-post-office','''Where is the post office? | ادارهٔ پست کجاست؟
I have a small parcel. | من یک بستهٔ کوچک دارم.
One stamp, please. | یک تمبر، لطفاً.
Can I pay by card here? | می‌توانم اینجا با کارت پرداخت کنم؟''',[
v('I would like to send this letter to {x}.','می‌خواهم این نامه را به {f} بفرستم.','Leeds|لیدز;Paris|پاریس;Tehran|تهران;York|یورک','I would like to send ... to + destination'),
v('A stamp is {x} pounds.','قیمت یک تمبر {f} پوند است.','two|دو;three|سه;four|چهار;five|پنج','A stamp is + price'),
v('Please write your {x} here.','لطفاً {f} را اینجا بنویسید.','name|نامتان;address|نشانی‌تان;city|شهرتان;number|شماره‌تان','Please write your + information'),
v('I would like {x} stamps, please.','{f} تمبر می‌خواهم، لطفاً.','two|دو;three|سه;four|چهار;five|پنج','I would like + number + stamps'),
v('The post office is next to the {x}.','ادارهٔ پست کنار {f} است.','bank|بانک;station|ایستگاه;café|کافه;shop|فروشگاه','The post office is next to ...'),
v('My address is {x} Park Street.','نشانی من پلاک {f}، خیابان پارک است.','ten|ده;twelve|دوازده;fourteen|چهارده;twenty|بیست','My address is + address'),
v('Turn right at the {x}.','کنار {f} به راست بپیچید.','bank|بانک;station|ایستگاه;café|کافه;shop|فروشگاه','Turn right at the + landmark'),
v('I can come on {x}.','من می‌توانم {f} بیایم.',DAYS,'I can come on + day'),
v('I am sending a letter to {x}. Do I need a stamp?','دارم نامه‌ای به {f} می‌فرستم. آیا به تمبر نیاز دارم؟',PLACES,'I am sending ...; Do I need ...?'),
v('Please write {x} on the form. Then check the address.','لطفاً {f} را روی فرم بنویسید. بعد نشانی را بررسی کنید.','Anna|آنا;Ben|بن;Sara|سارا;Tim|تیم','Please write ...; Then check ...'),
])

add('survival-health-and-pharmacy','''I need help now. | الان به کمک نیاز دارم.
I would like an appointment with a doctor. | می‌خواهم از پزشک وقت بگیرم.
Please speak slowly. I do not understand. | لطفاً آهسته صحبت کنید. متوجه نمی‌شوم.
I would like to speak to the pharmacist. | می‌خواهم با داروساز صحبت کنم.''',[
v('I feel {x}.','من احساس {f} می‌کنم.','ill|بیماری;tired|خستگی;cold|سرما;hot|گرما','I feel + adjective'),
v('My {x} hurts.','{f} من درد می‌کند.','head|سر;arm|بازوی;leg|پای;back|کمر','My + body part + hurts'),
v('Is the pharmacy open on {x}?','آیا داروخانه {f} باز است؟',DAYS,'Is the pharmacy open on + day?'),
v('The pharmacy opens at {x}.','داروخانه ساعت {f} باز می‌شود.',TIMES,'The pharmacy opens at + time'),
v('Can I see a doctor on {x}?','می‌توانم {f} به پزشک مراجعه کنم؟',DAYS,'Can I see a doctor on + day?'),
v('Please call {x}.','لطفاً به {f} زنگ بزنید.',NAMES,'Please call + name'),
v('The pharmacy is next to the {x}.','داروخانه کنار {f} است.','bank|بانک;station|ایستگاه;café|کافه;shop|فروشگاه','The pharmacy is next to ...'),
v('I have an appointment at {x}.','من ساعت {f} وقت ملاقات دارم.',TIMES,'I have an appointment at + time'),
v('I do not feel well. Can I come at {x}?','حالم خوب نیست. می‌توانم ساعت {f} بیایم؟',TIMES,'I do not feel well; Can I come ...?'),
v('I am at the {x}. I need help, please.','من در {f} هستم. لطفاً کمک لازم دارم.','station|ایستگاه;hotel|هتل;shop|فروشگاه;café|کافه','I am at ...; I need help'),
])

assert set(BANK)=={l['id'] for l in D}
