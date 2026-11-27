"""Deterministic, offline compiler. All authoring inputs are durable beside this file.
Approximate Persian phonetics use a frozen token lexicon (CMU-derived; see bundled license).
No dependency on cmudict, cache files or network at regeneration time.
"""
import json,re,unicodedata
from pathlib import Path
from rows import BANK,D
from skills import DISTRACTORS
from scenes import ENDINGS
HERE=Path(__file__).parent
ROOT=HERE.parents[2]
load=lambda p:json.loads(p.read_text())
BEFORE=load(ROOT/'scripts/fixtures/english-a1-before.json')
PRON=load(HERE/'pronunciation.json')
GLOSS=load(HERE/'vocabulary.json')
SITUATIONS=[
'در کلاس تازه با هم‌کلاسی آشنا می‌شوید و نام، کشور و شهر خود را می‌گویید.',
'هم‌کلاسی نام شما را می‌پرسد؛ نام را کوتاه می‌گویید و هجی می‌کنید.',
'نام یا واژه‌ای را نفهمیده‌اید؛ درخواست کمک، تکرار و آهسته‌گویی می‌کنید.',
'خود و دو هم‌کلاسی خیالی را با ضمیر و جملهٔ کوتاه معرفی می‌کنید.',
'سن و یک کد تماس کاملاً خیالی را می‌گویید و رقم‌ها را بررسی می‌کنید.',
'خانواده‌ای خیالی را معرفی می‌کنید و می‌گویید کتاب یا کیف مال چه کسی است.',
'در اتاقی خیالی دنبال کتاب و گوشی می‌گردید؛ جای وسایل را می‌پرسید و می‌گویید.',
'روز و ساعت کلاس را از اعلان کوتاه می‌فهمید و یک تاریخ روشن می‌خوانید.',
'دربارهٔ زمان بیدارشدن، کار و درس در یک روز معمولی گفت‌وگو می‌کنید.',
'در تماس با دوست می‌گویید الان چه می‌کنید و تفاوت آن با برنامهٔ همیشگی را بیان می‌کنید.',
'با دوست دربارهٔ کتاب، موسیقی و کارهای آخر هفته گفت‌وگو می‌کنید.',
'دربارهٔ هوای خیالی امروز و فصل مورد علاقه با هم‌کلاسی صحبت می‌کنید.',
'در فروشگاه کتاب یا خودکار می‌خواهید، قیمت و روش پرداخت را می‌پرسید.',
'لباس را با رنگ و اندازه می‌خواهید و دربارهٔ مناسب‌بودن اندازه حرف می‌زنید.',
'در کافه یک نوشیدنی و خوراکی سفارش می‌دهید و یک ترجیح ساده می‌گویید.',
'جای ایستگاه را می‌پرسید و یک مسیر متنی کوتاه را بدون نیاز به نقشه دنبال می‌کنید.',
'برای رفتن به مرکز شهر بلیت می‌خواهید و شمارهٔ اتوبوس یا سکوی قطار را بررسی می‌کنید.',
'برای یک قرار ساده روز و ساعت می‌خواهید و در صورت نیاز زمان دیگری را تأیید می‌کنید.',
'در کلاس دربارهٔ واژه، صفحه و تکلیف سؤال می‌کنید و دستور کوتاه معلم را می‌فهمید.',
'دوست را به کافه دعوت می‌کنید؛ پس از پذیرش یا رد، روی یک زمان مشترک توافق می‌کنید.',
'دربارهٔ یک کار سادهٔ دیروز و برنامهٔ خیالی فردا با نشانهٔ زمانی روشن حرف می‌زنید.',
'در آشنایی کاری کوتاه، شغل، یک توانایی و روز در دسترس بودن را می‌گویید؛ نه مصاحبهٔ تخصصی.',
'یک فرم کوتاه با نام، شهر، نشانی و ایمیل کاملاً خیالی کامل می‌کنید.',
'آگهی متنی کوتاه اتاق را می‌خوانید و دربارهٔ اجاره، امکانات و زمان بازدید می‌پرسید.',
'برای سفر بین‌شهری بلیت رفت‌وبرگشت با مقصد و روز مشخص می‌خواهید.',
'با رزرو خیالی وارد هتل می‌شوید و شمارهٔ اتاق، ساعت صبحانه و حوله می‌خواهید.',
'در تماس خود را معرفی می‌کنید و برای فردی که حاضر نیست پیام کوتاه می‌گذارید.',
'در ادارهٔ پست می‌خواهید یک نامه بفرستید و مقصد، تمبر و فرم را بررسی می‌کنید.',
'در داروخانه علامت خیالی ساده‌ای را می‌گویید و کمک زبانی می‌خواهید؛ تشخیص و دارو هدف نیستند.',
]
assert len(SITUATIONS)==29
LETTERS=dict(zip('ABCDEFGHIJKLMNOPQRSTUVWXYZ','اِی|بی|سی|دی|ای|اِف|جی|اِیچ|آی|جِی|کِی|اِل|اِم|اِن|اُو|پی|کیو|آر|اِس|تی|یو|وی|دابِلیو|اِکس|وای|زی'.split('|')))
def ascii_text(s):
    return unicodedata.normalize('NFKD',s.replace('’',"'")).encode('ascii','ignore').decode()
def pronounce(s):
    # Spelling targets are spoken letter names, not dictionary words or an article.
    s=re.sub(r'\b(?:[A-Z]-)+[A-Z]\b',lambda m:' '+ ' '.join(LETTERS[c] for c in m[0] if c!='-')+' ',s)
    s=re.sub(r'\b([A-Z])(?=[,.]|$)',lambda m:LETTERS[m[0]],s)
    s=s.replace('sara@example.com','سارا اَت اِگزَمپِل دات کام')
    tokens=re.findall(r"[A-Za-zÀ-ÿ]+(?:['’][A-Za-z]+)*|\d+|[\u0600-\u06ff]+",s)
    result=[]
    for t in tokens:
        if re.search('[\u0600-\u06ff]',t):result.append(t);continue
        k=ascii_text(t).lower()
        if k.endswith("'s") and k not in PRON:
            result.append(PRON[k[:-2]]+'ز');continue
        if k not in PRON:raise ValueError('Missing durable pronunciation token: '+k)
        result.append(PRON[k])
    return ' '.join(result)
GLOSS_PATTERNS=[(word,meaning,re.compile(r'(?<![a-z])'+re.escape(word)+r'(?![a-z])')) for word,meaning in sorted(GLOSS.items(),key=lambda x:-len(x[0])) if len(word.split())<=4]
def vocab(en):
    clean=ascii_text(en).lower()
    # Literal words/phrases only, longest first. Shared function words are useful at this level too.
    found=[]
    covered=set()
    for word,meaning,matcher in GLOSS_PATTERNS:
        m=matcher.search(clean)
        if m and not set(range(m.start(),m.end())).intersection(covered):
            found.append(dict(word=en[m.start():m.end()] if len(clean)==len(en) else word,meaning=meaning))
            covered.update(range(m.start(),m.end()))
    if not found and re.fullmatch(r'(?:[A-Z]-)+[A-Z][.]?',en):
        return [dict(word=en.rstrip('.'),meaning='نام این حروف در الفبای انگلیسی')]
    assert found,('no literal vocabulary',en)
    return found[:10]
def pattern(en,authored):
    if authored:return authored
    patterns=[('My name is','My name is + name'),('I am from','I am from + country'),('I live in','I live in + city'),('I would like','I would like + request'),('Can I','Can I + verb?'),('Can you','Can you + verb?'),('Please','Please + verb'),('I am going to','I am going to + verb'),('I have','I have + noun'),('There is','There is + singular noun'),('There are','There are + plural noun'),('Where is','Where is + noun?'),('How much','How much + is/are ...?'),('What time','What time + question?'),('Do you','Do you + verb?'),('Did you','Did you + verb?'),('I did not','I did not + base verb'),('I do not','I do not + base verb')]
    return next((p for prefix,p in patterns if en.startswith(prefix)),None)
def options(answer,wrong,index):
    choices=[answer,*wrong]
    assert len(set(choices))==3
    n=index%3
    return choices[n:]+choices[:n]
content={};evidence={};skills={};production={};migration={}
for i,plan in enumerate(D):
    id=plan['id'];before=next(l for l in BEFORE['core'] if l['id']==id)
    sentence_rows=[]
    for n,((en,fa,pa),old) in enumerate(zip(BANK[id],before['sentences'])):
        assert '{' not in en+fa and '}' not in en+fa,(id,en,fa)
        row=dict(id=old['id'],en=en,fa=fa,pronunciation=pronounce(en),vocabulary=vocab(en))
        p=pattern(en,pa)
        if p:row['pattern']=p
        sentence_rows.append(row)
    assert len(sentence_rows)==50
    ending=ENDINGS[i]
    scene=[dict(speaker=t['role'],role=t['role'],text=t['en'],fa=t['fa']) for t in plan['scene']]
    scene.extend([dict(speaker='partner',role='partner',text=ending[0],fa=ending[1]),dict(speaker='learner',role='learner',text=ending[2],fa=ending[3])])
    tasks=[]
    for j,c in enumerate(plan['checks']):
        tasks.append(dict(id=f'en-a1-sequenced-v1:{id}:check-{j+1}',skill='reading' if j==0 else 'grammar',prompt=c['promptFa'],**({'source':c['source']} if 'source'in c else {}),options=c['choices'],answers=[c['choices'][c['correctIndex']]],explanation=c['explanationFa']))
    sk=[]
    for j,kind in enumerate(['listening','reading']):
        t=plan[kind];choices=options(t['answer'],DISTRACTORS[i][j*2:j*2+2],i+j)
        sk.append(dict(kind=kind,passage=t['passage'],promptFa=t['questionFa'],choices=choices,correctIndex=choices.index(t['answer']),explanationFa=f"پاسخ از متن همین تمرین: {t['answer']}"))
        tasks.append(dict(id=f'en-a1-sequenced-v1:{id}:{kind}',skill=kind,prompt=t['questionFa'],**({'audio':t['passage']} if kind=='listening' else {'source':t['passage']}),options=choices,answers=[t['answer']],explanation=f"پاسخ از متن همین تمرین: {t['answer']}"))
    for j,n in enumerate([1,4]):
        row=sentence_rows[n]
        tasks.append(dict(id=f'en-a1-sequenced-v1:{id}:write-{j+1}',skill='writing',prompt='عبارت متناظر را مطابق نمونهٔ همین درس بنویس؛ این پرسش بازنویسی کنترل‌شده است، نه تولید آزاد.',source=row['fa'],answers=list(dict.fromkeys(s['en'] for s in sentence_rows if s['fa']==row['fa'])),explanation=row['en']+' — '+row['fa']))
    for j,n in enumerate([21,43]):
        row=sentence_rows[n];wrong=[s['fa'] for s in sentence_rows if s['fa']!=row['fa']][:2]
        choices=options(row['fa'],wrong,i+j)
        tasks.append(dict(id=f'en-a1-sequenced-v1:{id}:review-{j+1}',skill='reading',prompt='معنی همین نمونه چیست؟',source=row['en'],options=choices,answers=[row['fa']],explanation=row['en']+' — '+row['fa']))
    assert len(tasks)==8
    note='\n'.join(['هدف: '+plan['outcomeFa'],'بازیابی: '+plan['retrievalFa'],'واژگان هسته: '+plan['vocabularyFa'],'ساختار: '+plan['grammarFa'],'تلفظ: '+plan['pronunciationFa'],'آوانویسی فارسی تقریبی است؛ شنیدن صوت مرجع است.','مرز این درس: '+plan['outOfScopeFa'],'احتیاط: '+plan['commonErrorFa'],'نوشتن اختیاری: '+plan['writingFa']])
    content[id]=dict(id=id,order=15+i,title=plan['titleFa'],subtitle=plan['outcomeFa'],situation=SITUATIONS[i],teachingFa=note,sentences=sentence_rows,dialogue=scene)
    evidence[id]=tasks;skills[id]=sk
    production[id]=dict(writing=plan['writingFa'],speaking=plan['speakingFa'],checklist=plan['productionSelfCheckFa'],minWords=1 if i==1 else 3 if id=='survival-personal-information' else 6)
    migration[id]=dict(changedSentenceIds=[s['id'] for s,o in zip(sentence_rows,before['sentences']) if s['en']!=o['en'] or s['fa']!=o['fa']],newIndex=i+15)

def js(x):return json.dumps(x,ensure_ascii=False,indent=2)
header='// Generated by docs/english-a1-design/runtime/generate.py. Edit durable authoring inputs, not this file.\n'
fields="'id' | 'order' | 'title' | 'subtitle' | 'situation' | 'teachingFa' | 'sentences' | 'dialogue'"
ts=header+"import type {SentenceLesson} from './courseContent';\nimport type {Task} from './englishSupplement/content';\nimport type {A1SkillTask} from './languages/a1Skills';\nimport type {ProductionPrompt} from './productionPrompt';\n"
ts+=f'export const ENGLISH_A1_CONTENT: Record<string, Pick<SentenceLesson, {fields}>> = '+js(content)+';\n'
ts+='export const ENGLISH_A1_EVIDENCE: Readonly<Record<string, readonly Task[]>> = '+js(evidence)+';\n'
ts+='export const ENGLISH_A1_SKILLS: Readonly<Record<string, readonly A1SkillTask[]>> = '+js(skills)+';\n'
ts+='export const ENGLISH_A1_PRODUCTION: Readonly<Record<string, ProductionPrompt>> = '+js(production)+';\n'
(ROOT/'lib/englishA1.generated.ts').write_text(ts)
(HERE/'migration.json').write_text(js(migration)+'\n')
(ROOT/'lib/englishA1ChangedSlots.generated.json').write_text(js({id: m['changedSentenceIds'] for id,m in migration.items()})+'\n')
print('Generated 29 English A1 lessons / 1450 stable rows / 174 scene turns / 232 current checks / 58 optional tasks.')
