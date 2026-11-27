"""Offline compiler for the approved German A1 scope. No network/package dependencies.
Approximate Persian pronunciation is a reading aid, not IPA or native-audio verification.
"""
import json,re,sys
from pathlib import Path
from rows import BANK
from notes import NOTES
HERE=Path(__file__).parent
ROOT=HERE.parents[2]
load=lambda p:json.loads(p.read_text())
D=load(HERE.parent/'design.json')['lessons']
BEFORE=load(ROOT/'scripts/fixtures/german-a1-before.json')
GLOSS=load(HERE/'vocabulary.json')
GLOSS.update({'hallo':'سلام','ich':'من','du':'تو','sie':'او / آن‌ها / شما رسمی','wir':'ما','ihr':'شما دوستانه / مال او مؤنث','es':'آن / فاعل غیرشخصی','der':'حرف تعریف مذکر','die':'حرف تعریف مؤنث یا جمع','das':'آن / حرف تعریف خنثی','ist':'است','sind':'هستند / هستیم','bin':'هستم','bist':'هستی','seid':'هستید','ein':'یک','eine':'یک','einen':'یک، مفعولی مذکر','den':'حرف تعریف مفعولی مذکر','dem':'حرف تعریف داتیو','mein':'مال من','dein':'مال تو','ihren':'مال شما رسمی، مفعولی','seit':'از زمانِ','uhr':'ساعت','heft':'دفتر','hefte':'دفترها','buch':'کتاب','bücher':'کتاب‌ها','stift':'خودکار','stifte':'خودکارها','tasche':'کیف','taschen':'کیف‌ها','null':'صفر','bitte':'لطفاً / بفرمایید','danke':'ممنون','vormittag':'پیش از ظهر','wohnort':'شهر محل زندگی','geburtsdatum':'تاریخ تولد','nachname':'نام خانوادگی','vorname':'نام کوچک','bahnsteig':'سکوی ایستگاه','gleis':'سکو / خط قطار','umkleide':'اتاق پرو','frei':'آزاد / خالی','passte':'مناسب بود','passt':'مناسب است','gelernt':'یاد گرفته / درس خوانده','gearbeitet':'کار کرده','halsschmerzen':'گلودرد','kopfschmerzen':'سردرد','fieber':'تب','durst':'تشنگی','hunger':'گرسنگی','war':'بود','hatte':'داشت','denn':'چون','morgen':'فردا / صبح در Morgen','am':'در روزِ','im':'درِ (in dem)','pro':'به‌ازای','monat':'ماه','rechnung':'صورت‌حساب','zusammen':'با هم','getrennt':'جدا','bar':'نقد','zahlen':'پرداخت کردن','apfel':'سیب','äpfel':'سیب‌ها','milch':'شیر','eier':'تخم‌مرغ‌ها','tüte':'کیسه','größer':'بزرگ‌تر','kleiner':'کوچک‌تر','billiger':'ارزان‌تر','neben':'کنار','unter':'زیر','auf':'روی','können':'توانستن','kann':'می‌توانم / می‌تواند','möchte':'می‌خواهم / می‌خواهد','musst':'باید (تو)','muss':'باید','dürfen':'اجازه داشتن','darf':'اجازه دارم','anrufen':'تلفن کردن','buchstabieren':'هجی کردن','wiederholen':'تکرار کردن'})
for word,meaning in zip('null eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf dreizehn vierzehn fünfzehn sechzehn siebzehn achtzehn neunzehn zwanzig dreißig vierzig fünfzig sechzig siebzig achtzig neunzig hundert'.split(), 'صفر یک دو سه چهار پنج شش هفت هشت نه ده یازده دوازده سیزده چهارده پانزده شانزده هفده هجده نوزده بیست سی چهل پنجاه شصت هفتاد هشتاد نود صد'.split()):GLOSS[word]=meaning
# Longest literal entries first; no translation unrelated to the target row.
LEX=[(word,meaning,re.compile(r'(?<![\w])'+re.escape(word)+r'(?![\w])',re.I)) for word,meaning in sorted(GLOSS.items(),key=lambda x:-len(x[0])) if len(word.split())<=3 and not re.search(r'[^\w\säöüß-]',word)]
STOP=set('ich du er sie es wir ihr der die das ein eine einen ist bin bist sind seid und oder aber in am im an auf mit es'.split())
def vocab(text):
    found=[];used=set()
    for word,meaning,pat in LEX:
        m=pat.search(text)
        if m and not set(range(*m.span()))&used:
            found.append(dict(word=m[0],meaning=meaning));used.update(range(*m.span()))
    found.sort(key=lambda v:v['word'].lower() in STOP)
    if not found:
        if re.fullmatch(r'(?:[A-Z][–-])+[A-Z][.!]?',text):return [dict(word=text.rstrip('.!'),meaning='هجی نام با حروف آلمانی')]
        raise ValueError(('Missing literal vocabulary',text))
    return found[:6]
# Carefully fixed frequent forms. Other tokens use the documented approximate grapheme fallback.
PRON={}
for line in '''ich|ایش
mich|میش
dich|دیش
nicht|نیشت
spreche|شپرِشِه
sprechen|شپرِشِن
sprichst|شپریشست
bitte|بیتِه
danke|دانکِه
hallo|هالو
guten|گوتِن
tag|تاک
morgen|مورگِن
abend|آبِنت
tschüss|چوس
auf|آوف
wiedersehen|ویدِرزِهِن
wiederhören|ویدِرهورِن
wie|وی
geht|گِیت
dir|دیر
mir|میر
ihnen|اینِن
heißt|هایست
heiße|هایسِه
heißen|هایسِن
name|نامِه
namen|نامِن
vorname|فورنامِه
nachname|ناخ‌نامِه
wohne|وونِه
wohnst|وونست
wohnt|وونت
wohnen|وونِن
wohnort|وون‌اُرت
wo|وو
woher|ووهِر
wer|وِر
was|واس
wann|وان
warum|واروم
kommen|کومِن
komme|کومِه
kommst|کومست
aus|آوس
dem|دِم
der|دِر
die|دی
das|داس
den|دِن
du|دو
sie|زی
ihr|ایر
wir|ویر
er|اِر
es|اِس
bin|بین
bist|بیست
ist|ایست
sind|زیند
seid|زایت
sein|زاین
habe|هابِه
haben|هابِن
hast|هاست
hat|هات
ein|آین
eine|آینِه
einen|آینِن
kein|کاین
keine|کاینِه
keinen|کاینِن
mein|ماین
meine|ماینِه
dein|داین
deine|داینِه
seine|زاینِه
ihre|ایرِه
ihren|ایرِن
buch|بوخ
bücher|بوشِر
heft|هِفت
hefte|هِفتِه
stift|شتیفت
stifte|شتیفتِه
tasche|تاشِه
taschen|تاشِن
lampe|لامپِه
tisch|تیش
stuhl|شتول
stühle|شتولِه
zimmer|تسیمِر
küche|کوشِه
bad|بات
bett|بِت
fenster|فِنستِر
buchstabieren|بوخ‌شتابیرِن
langsam|لانگزام
wort|وُرت
wiederholen|ویدِرهولِن
entschuldigung|اِنت‌شولدیگونگ
natürlich|ناتورلیش
jetzt|یِتست
verstehe|فِرشتِه‌اِه
schreiben|شرایبِن
schreibt|شرایبت
schön|شون
kennenzulernen|کِنِن‌تسو‌لِرنِن
deutsch|دویچ
deutschland|دویچلانت
persisch|پِرزی‌ش
englisch|اِنگلیش
iran|ایران
türkei|تورکای
können|کونِن
könnten|کونتِن
kann|کان
kannst|کانست
möchte|موشتِه
möchtest|موشتِست
möchten|موشتِن
mag|ماک
magst|ماکست
muss|موس
musst|موست
darf|دارف
helfen|هِلفِن
gern|گِرن
lieber|لیبِر
lesen|لِیزِن
lese|لِیزِه
liest|لیست
lerne|لِرنِه
lernen|لِرنِن
lernst|لِرنست
lernt|لِرنت
arbeite|آربایتِه
arbeitest|آربایتِست
arbeitet|آربایتِت
arbeiten|آربایتِن
pause|پاوزِه
aufgabe|آوفگابِه
seite|زایتِه
heute|هویتِه
gestern|گِستِرن
morgen|مورگِن
morgens|مورگِنس
abends|آبِنتس
uhr|اوئر
um|اوم
halb|هالپ
null|نول
eins|آینس
zwei|تسوای
drei|درای
vier|فیر
fünf|فونف
sechs|زِکس
sieben|زیبِن
acht|آخت
neun|نوین
zehn|تسِین
elf|اِلف
zwölf|تسولف
dreizehn|درایتسِین
vierzehn|فیرتسِین
fünfzehn|فونفتسِین
sechzehn|زِشتسِین
siebzehn|زیپتسِین
achtzehn|آختسِین
neunzehn|نوینتسِین
zwanzig|تسوانتسیش
dreißig|درایسیش
vierzig|فیرتسیش
fünfzig|فونفتسیش
sechzig|زِشتسیش
siebzig|زیپتسیش
achtzig|آختسیش
neunzig|نوینتسیش
hundert|هوندِرت
dreiundzwanzig|درای‌اونت‌تسوانتسیش
vierundzwanzig|فیر‌اونت‌تسوانتسیش
montag|مونتاک
dienstag|دینستاک
mittwoch|میت‌وُخ
donnerstag|دونِرستاک
freitag|فرایتاک
samstag|زامستاک
sonntag|زونتاک
mai|مای
tee|تِه
kaffee|کافِه
wasser|واسِر
milch|میلش
zucker|تسوکِر
suppe|زوپِه
brot|بروت
reis|رایس
äpfel|اِپفِل
eier|آیِر
tüte|توتِه
euro|اُیرو
rechnung|رِشنونگ
zahlen|تسالِن
zusammen|تسوزامِن
getrennt|گِترِنت
karte|کارتِه
bar|بار
größe|گروسِه
größer|گروسِر
klein|کلاین
kleiner|کلاینِر
billiger|بیلیگِر
neu|نوی
alt|آلت
ruhig|روئیش
blau|بلاؤ
grün|گرون
rot|روت
schwarz|شوارتس
weiß|وایس
müde|مودِه
froh|فرو
hunger|هونگِر
durst|دورست
familie|فامیلیِه
mutter|موتِر
vater|فاتِر
bruder|برودِر
schwester|شوِستِر
lehrer|لِرِر
lehrerin|لِرِرین
student|شتودِنت
studentin|شتودِنتین
schule|شولِه
straße|شتراسِه
parkstraße|پارک‌شتراسِه
bahnhof|بانهوف
gleis|گلایس
zug|تسوک
fährt|فِرت
fahre|فارِه
fährst|فِرست
fahren|فارِن
fahrkarte|فارکارتِه
haltestelle|هالتِشتِلِه
nächsten|نِکستِن
aussteigen|آوس‌شتایگِن
steige|شتایگِه
steigen|شتایگِن
links|لینکس
rechts|رِشتس
geradeaus|گِرادِه‌آوس
zentrum|تسِنتروم
frühstück|فروشتوک
frühstücke|فروشتوکِه
frühstückst|فروشتوکست
reservierung|رِزِرویرونگ
nächte|نِشتِه
schlüssel|شلوسِل
nachricht|ناخ‌ریشت
hinterlassen|هینتِرلاسِن
rufen|روفِن
rufe|روفِه
wieder|ویدِر
kopfschmerzen|کُپف‌شمِرتسِن
halsschmerzen|هالس‌شمِرتسِن
fieber|فیبِر
war|وار
warst|وارست
hatte|هاتِه
hattest|هاتِست
gelernt|گِلِرنت
gearbeitet|گِآربایتِت
denn|دِن
aber|آبِر
und|اونت
oder|اودِر
anna|آنا
sara|سارا
amir|امیر
ali|علی
ben|بِن
lena|لِنا
tim|تیم
lee|لی
weber|وِبِر
bonn|بُن
köln|کولن
berlin|بِرلین
café|کافِه
cafe|کافِه
'''.strip().splitlines():
    w,p=line.split('|');PRON[w]=p
LETTERS=dict(zip('ABCDEFGHIJKLMNOPQRSTUVWXYZ','آ|بِه|تسِه|دِه|اِ|اِف|گِه|ها|ای|یوت|کا|اِل|اِم|اِن|اُ|پِه|کو|اِر|اِس|تِه|او|فاو|وِه|ایکس|ایپسیلون|تسِت'.split('|')))
def fallback(word):
    w=word.lower()
    # German-specific ordered graphemes; rounded vowels remain only approximate in Persian script.
    w=re.sub(r'^sp','شپ',w);w=re.sub(r'^st','شت',w)
    for a,b in [('tsch','چ'),('sch','ش'),('ch','ش' if re.search('[eiäöü]ch',w) else 'خ'),('ck','ک'),('ng','نگ'),('qu','کو'),('ph','ف'),('ß','س'),('ei','آی'),('ie','ای'),('eu','اُی'),('äu','اُی'),('au','آو'),('eh','اِه'),('ah','آ'),('oh','او'),('ee','اِه'),('oo','او')]:w=w.replace(a,b)
    w=re.sub('s(?=[aeiouäöü])','ز',w)
    # Explicit character map avoids positional zip drift and leaves no Latin placeholder behind.
    chars={'a':'ا','b':'ب','c':'ک','d':'د','e':'ِ','f':'ف','g':'گ','h':'ه','i':'ی','j':'ی','k':'ک','l':'ل','m':'م','n':'ن','o':'ُ','p':'پ','q':'ک','r':'ر','s':'س','t':'ت','u':'و','v':'ف','w':'و','x':'کس','y':'ی','z':'تس','ä':'اِ','ö':'اُ','ü':'او','é':'ِ'}
    w=''.join(chars.get(c,c) for c in w)
    return w
TOKEN=re.compile(r'[A-Za-zÄÖÜäöüßÉé]+|[\u0600-\u06ff]+|\d+')
def pronounce(text):
    text=re.sub(r'\b(?:[A-Z][–-])+[A-Z]\b',lambda m:' '.join(LETTERS[c] for c in m[0] if c in LETTERS),text)
    out=[]
    for t in TOKEN.findall(text):
        if re.search('[\u0600-\u06ff]',t):out.append(t)
        elif t.isdigit():out.append(' '.join(PRON[['null','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun'][int(c)]] for c in t))
        elif t in LETTERS:out.append(LETTERS[t])
        else:out.append(PRON.get(t.lower()) or fallback(t))
    value=' '.join(out)
    assert value and not re.search('[a-zäöüß]',value,re.I),(text,value)
    return value
ENDINGS={
'greetings': [('Bis morgen, Sara!','تا فردا، سارا!'),('Bis morgen, Lena!','تا فردا، لنا!')],
'profile':[('Ich wohne auch in Bonn.','من هم در بن زندگی می‌کنم.'),('Schön, dich kennenzulernen.','از آشنایی با تو خوشحالم.')],
'nationalities':[('Ich spreche auch Deutsch.','من هم آلمانی صحبت می‌کنم.'),('Schön! Dann lernen wir zusammen.','عالی است! پس با هم یاد می‌گیریم.')],
'numbers-age':[('Noch einmal langsam, bitte.','یک بار دیگر آهسته، لطفاً.'),('Null, eins, zwei, drei.','صفر، یک، دو، سه.')],
'family':[('Wie heißt sie?','نام او چیست؟'),('Sie heißt Anna.','نام او آنا است.')],
'possessives':[('Und ist das dein Heft?','و آیا این دفتر تو است؟'),('Nein, das ist Bens Heft.','نه، این دفتر بن است.')],
'shopping-payment':[('Gut, hier ist Ihr Heft.','بسیار خوب، این دفتر شما است.'),('Danke, auf Wiedersehen!','ممنون، خداحافظ!')],
'cafe':[('Zusammen oder getrennt?','با هم یا جدا؟'),('Zusammen, bitte.','با هم، لطفاً.')],
'directions':[('Danke für Ihre Hilfe.','بابت کمکتان ممنون.'),('Gern. Auf Wiedersehen!','خواهش می‌کنم. خداحافظ!')],
'asking-help':[('Vielen Dank.','بسیار ممنون.'),('Gern.','خواهش می‌کنم.')],
'room-search':[('Kann ich das Zimmer sehen?','می‌توانم اتاق را ببینم؟'),('Ja, am Montag um zehn Uhr.','بله، دوشنبه ساعت ده.')],
}
FORMS=[['bin','bist','ist'],['habe','hast','hat'],['sind','seid','bin'],['möchte','möchtest','möchten'],['kann','kannst','können'],['lerne','lernst','lernt'],['wohne','wohnst','wohnt'],['arbeite','arbeitest','arbeitet'],['liegt','liege','liegst'],['steht','stehe','stehst'],['ist','bin','bist'],['geht','gehe','gehst'],['kostet','koste','kostest'],['fährt','fahre','fährst'],['darf','darfst','dürfen'],['trinke','trinkst','trinkt'],['bleibe','bleibst','bleibt'],['hört','höre','hörst'],['komme','kommst','kommt'],['war','warst','waren'],['rufe','rufst','ruft']]
def options(correct,wrong,n):
    c=[correct,*wrong];assert len(c)==3 and len(set(c))==3,c
    n%=3;return c[n:]+c[:n]
def grammar_check(rows):
    ordered=sorted(rows,key=lambda r:not r['text'].startswith('Ich '))
    for row in ordered:
        for forms in FORMS:
            m=re.search(r'\b'+forms[0]+r'\b',row['text'],re.I)
            if not m:continue
            # Only exact case makes the replacement and correct option transparent.
            answer=m[0];wrong=forms[1:]
            if answer[0].isupper():wrong=[w.capitalize() for w in wrong]
            return dict(promptFa='در جملهٔ همین درس، شکل درست فعل را انتخاب کن: '+row['text'][:m.start()]+'___'+row['text'][m.end():],choices=[answer,*wrong],correctIndex=0,explanationFa=row['text']+' — '+row['fa'])
    # Short formula lessons still assess a real taught expression, not a fabricated grammar rule.
    row=rows[0];choices=[row['text'],rows[-1]['text'],rows[-2]['text']]
    return dict(promptFa='برای «'+row['fa']+'» کدام عبارت همین درس آمده است؟',choices=choices,correctIndex=0,explanationFa=row['text'])
DIST=load(HERE/'distractors.json')
CONTENT={};SKILLS={};PRODUCTION={};MIGRATION={}
for plan in D:
    slug=plan['id'].removeprefix('de-a1-');old=next(l for l in BEFORE['core'] if l['id']==plan['id'])
    raw=[(t['de'],t['fa']) for t in plan['scene']]+BANK[slug]
    assert len(raw)==len(old['sentences']),(slug,len(raw))
    assert len(set(t[0].lower() for t in raw))==len(raw),(slug,'duplicate')
    rows=[dict(id=prev['id'],text=text,fa=fa,pronunciation=pronounce(text),vocabulary=vocab(text),pattern=plan['grammarFa']) for (text,fa),prev in zip(raw,old['sentences'])]
    scene=[dict(role=t['role'],speaker=t['role'],text=t['de'],fa=t['fa']) for t in plan['scene']]
    if slug in ENDINGS:
        for i,(text,fa) in enumerate(ENDINGS[slug]):scene.append(dict(role='partner' if i%2==0 else 'learner',speaker='partner' if i%2==0 else 'learner',text=text,fa=fa))
    assert len(scene)==len(old['dialogue']),(slug,len(scene),len(old['dialogue']))
    sk=[]
    for i,kind in enumerate(['listening','reading']):
        t=plan[kind];choices=options(t['answer'],DIST[slug][i],plan['proposedIndex']+i)
        sk.append(dict(kind=kind,passage=t['passage'],promptFa=t['questionFa'],choices=choices,correctIndex=choices.index(t['answer']),explanationFa='پاسخ از متن همین تمرین: '+t['answer']))
    r=rows[0];wrong=[]
    for x in rows[1:]:
        if x['fa']!=r['fa'] and x['fa'] not in wrong:wrong.append(x['fa'])
        if len(wrong)==2:break
    choices=options(r['fa'],wrong,plan['proposedIndex'])
    checks=[dict(promptFa='در همین درس «'+r['text']+'» چه معنایی دارد؟',choices=choices,correctIndex=choices.index(r['fa']),explanationFa=r['text']+' — '+r['fa']),grammar_check(rows)]
    r=rows[-1];choices=options(r['text'],[rows[0]['text'],rows[1]['text']],plan['proposedIndex']+1)
    checks.append(dict(promptFa='در متن همین درس برای «'+r['fa']+'» کدام عبارت آمده؟',choices=choices,correctIndex=choices.index(r['text']),explanationFa=r['text']+' — '+r['fa']))
    checks.append(dict(promptFa='متن را بخوان: '+sk[1]['passage']+'\n'+sk[1]['promptFa'],choices=sk[1]['choices'],correctIndex=sk[1]['correctIndex'],explanationFa=sk[1]['explanationFa']))
    CONTENT[plan['id']]=dict(situation='هدف: '+plan['outcomeFa'],teachingFa='\n'.join(['هدف: '+plan['outcomeFa'],'بازیابی کوتاه: '+('، '.join(next(l['title'] for l in BEFORE['core'] if l['id']==id) for id in plan['prerequisiteIds']) or 'سلام و معرفی در Pre-A1'),'توضیح: '+NOTES[slug],'دامنهٔ دستور: '+plan['grammarFa'],'واژگان: '+plan['vocabularyFa'],'احتیاط: '+plan['outOfScopeAndErrorFa'],'شنیدن: '+plan['pronunciationFa'],'تولید: '+plan['productionFa']]),sentences=rows,dialogue=scene,checks=checks)
    SKILLS[plan['id']]=sk
    PRODUCTION[plan['id']]=dict(speaking=plan['productionFa'],writing=plan['productionFa'],minWords=4 if slug in ['greetings','asking-help','numbers-age','forms-information'] else 8,checklist=['پیام خواسته‌شده را با واژه‌های همین درس رسانده‌ام','ساخت هدف و خطاب مناسب را حفظ کرده‌ام','اطلاعات جمله‌ها با هم سازگارند؛ اطلاعات خیالی مجاز است'])
    MIGRATION[plan['id']]=[r['id'] for r,p in zip(rows,old['sentences']) if r['text']!=p['text'] or r['fa']!=p['fa']]
def emit(name,data,typ):return 'export const '+name+': '+typ+' = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n'
header="// Generated by docs/german-a1-design/runtime/generate.py. Edit authoring sources, not this file.\nimport type {LearningLesson} from './types';\nimport type {A1SkillTask} from './a1Skills';\nimport type {ProductionPrompt} from '../productionPrompt';\n"
(ROOT/'lib/languages/germanA1.generated.ts').write_text(header+emit('GERMAN_A1_CONTENT',CONTENT,"Readonly<Record<string, Pick<LearningLesson, 'situation'|'teachingFa'|'sentences'|'dialogue'|'checks'>>>")+emit('GERMAN_A1_SKILLS',SKILLS,'Readonly<Record<string, readonly A1SkillTask[]>>')+emit('GERMAN_A1_PRODUCTION',PRODUCTION,'Readonly<Record<string, ProductionPrompt>>'))
(ROOT/'lib/languages/germanA1ChangedSlots.generated.json').write_text(json.dumps(MIGRATION,ensure_ascii=False,indent=2)+'\n')
(HERE/'migration.json').write_text(json.dumps(MIGRATION,ensure_ascii=False,indent=2)+'\n')
print(f'Generated {len(CONTENT)} German A1 lessons / {sum(len(l["sentences"]) for l in CONTENT.values())} stable rows / {sum(len(l["dialogue"]) for l in CONTENT.values())} scene turns / 224 authored checks / 112 optional tasks.')
