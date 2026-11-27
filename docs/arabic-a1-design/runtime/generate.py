"""Deterministic offline Arabic A1 compiler; no existing baseline is overwritten."""
import json,re
from pathlib import Path
from authoring import LESSONS
HERE=Path(__file__).parent
ROOT=HERE.parents[2]
B=json.loads((ROOT/'scripts/fixtures/arabic-a1-before.json').read_text())
strip=lambda s:re.sub('[\u064b-\u065f\u0670ـ]','',s)
words=lambda s:re.findall('[ء-ي]+',strip(s))
from supplement import GLOSS,NOTES
ids={l['number']:l['id'] for l in LESSONS}
CONTENT={};SKILLS={};PRODUCTION={};CHANGED={};INTRO={};PLANS=[]
taught={w for l in B['preA1'] for s in l['sentences'] for w in words(s['ar'])}
titles={1:'نام، ملیت و زبان؛ معرفی کوتاه',13:'پرسش کوتاه، نفی و درخواست تکرار',2:'خانواده؛ مالکیت و توصیف',3:'شغل، درس و محل کار',4:'خانه؛ وجود و جای وسایل',5:'کارهای روز و مضارع ساده',6:'ساعت، روز و یک تاریخ ساده',12:'خواسته، نیاز، توانایی و دعوت',8:'سفارش مرتبط در کافه',7:'رنگ، اندازه و خرید لباس',9:'مسیر کوتاه و دستور مؤدبانه',10:'مقصد، ساعت حرکت و بلیت',11:'دو کار دیروز؛ شروع ماضی',14:'از آشنایی تا قرار؛ گفت‌وگوی پیوسته'}
units=[('هویت، خانواده و کار','الْهُوِيَّةُ وَالْأُسْرَةُ'),('خانه، زمان و برنامه','الْبَيْتُ وَالْوَقْتُ'),('خوراک، خرید و مسیر','الطَّعَامُ وَالتَّسَوُّقُ'),('سفر و کارهای دیروز','السَّفَرُ وَأَمْسِ'),('گفت‌وگوی مرتبط','الْحِوَارُ')]
for index,p in enumerate(LESSONS):
    id=p['id'];old=next(l for l in B['core'] if l['id']==id)
    assert len(p['rows'])==8
    rows=[]
    for (ar,fa,pron,word,meaning),prev in zip(p['rows'],old['sentences']):
        assert word in ar and re.search('[\u064b-\u0652]',ar),(id,ar,word)
        assert not re.search('[ء-ي]',pron),(id,pron)
        rows.append(dict(id=prev['id'],ar=ar,arPlain=strip(ar),fa=fa,pronunciation=pron,pattern=p['grammarFa'],vocabulary=[dict(word=word,meaning=meaning,core=True)]))
        taught.update(words(ar))
    assert len({strip(s['ar']) for s in rows})==8,id
    intro={}
    for text in [*[t[0] for t in p['scene']],p['listening'][0],p['reading'][0]]:
        for w in words(text):
            if w not in taught:
                if w not in GLOSS:raise ValueError((id,'missing introduction',w,text))
                intro[w]=GLOSS[w];taught.add(w)
    INTRO[id]=intro
    skills=[]
    for i,kind in enumerate(['listening','reading']):
        passage,prompt,answer,wrong=p[kind];choices=[answer,*wrong];assert len(set(choices))==3
        n=(index+i)%3;choices=choices[n:]+choices[:n]
        skills.append(dict(kind=kind,passage=passage,promptFa=prompt,choices=choices,correctIndex=choices.index(answer),explanationFa='پاسخ از همین پیام: '+answer))
    q,correct,wrong,why=p['contrast'];options=[correct,*wrong];n=index%3;options=options[n:]+options[:n]
    choices=[rows[0]['fa'],rows[1]['fa'],rows[2]['fa']];assert len(set(choices))==3
    checks=[dict(id=old['checks'][0]['id'],skill='listening',prompt='نمونه را بشنو و معنی آن را انتخاب کن.',audio=rows[0]['ar'],options=choices,answers=[choices[0]],explanation=rows[0]['fa']),dict(id=old['checks'][1]['id'],skill='grammar',prompt=q,options=options,answers=[correct],explanation=why),dict(id=old['checks'][2]['id'],skill='writing',prompt='عبارت همین درس را برای «'+rows[-1]['fa']+'» بنویس.',answers=[rows[-1]['ar']],explanation=rows[-1]['ar']+' — '+rows[-1]['fa'])]
    if len(old['checks'])==4:
        sk=skills[1];checks.append(dict(id=old['checks'][3]['id'],skill='reading',prompt=sk['promptFa'],source=sk['passage'],options=sk['choices'],answers=[sk['choices'][sk['correctIndex']]],explanation=sk['explanationFa']))
    unit=1 if index<4 else 2 if index<8 else 3 if index<11 else 4 if index<13 else 5
    teaching='\n'.join(filter(None,[
        'هدف: '+p['outcomeFa'],'بازیابی آغاز: '+('، '.join(titles[n] for n in p['prerequisiteNumbers']) or 'معرفی کوتاه و جملهٔ اسمی Pre-A1'),
        'پیوند با Pre-A1: '+'؛ '.join(B['preA1'][n-1]['title'] for n in p['preA1Numbers']),
        'دستور در کاربرد: '+p['grammarFa'],NOTES.get(p['number'],''),
        'واژگان نمونه: '+'؛ '.join(r[3]+' = '+r[4] for r in p['rows'][:5]),
        'صورت‌های لازم پیش از تمرین: '+'؛ '.join(w+' = '+m for w,m in intro.items()) if intro else '',
        'مرز سطح: '+p['cautionFa'],
        'شنیدن: تفاوت حرکت کوتاه/بلند، تشدید، حروف حلقی و مفخّم و خطاب ـكَ/ـكِ را از صوت عربی فصیح بشنو. آوانویسی لاتین، راهنمای تقریبیِ خواندن آموزشی است؛ پیوسته‌خوانی، همزهٔ وصل، ادغام شمسی و وقف را کامل تضمین نمی‌کند. در وقف، پایان‌های اعرابی الزاماً مانند خواندن پیوسته شنیده نمی‌شوند.',
        'تولید اختیاری: '+p['productionFa']]))
    CONTENT[id]=dict(title=titles[p['number']],order=index+1,section='foundation' if index<8 else 'survival',unitId=f'ar-a1-u{unit}',unitTitle=f'بخش {unit}: '+units[unit-1][0],unitTitleAr=units[unit-1][1],subtitle=p['outcomeFa'],goal=p['outcomeFa'],situation='هدف: '+p['outcomeFa'],teachingFa=teaching,sentences=rows,dialogue=[dict(speaker='partner' if i%2==0 else 'learner',ar=ar,fa=fa) for i,(ar,fa) in enumerate(p['scene'])],checks=checks)
    SKILLS[id]=skills
    PRODUCTION[id]=dict(speaking=p['productionFa'],writing=p['productionFa'],minWords=5 if index<4 else 8,checklist=['پیام خواسته‌شده را با واژه‌ها و الگوی همین درس رسانده‌ام','جنس گوینده و مخاطب و تطابق اسم/صفت/فعل را روشن نگه داشته‌ام؛ جملهٔ اسمی بدون فعل ربطی معتبر است','زمان و مکان و اطلاعات پیام‌ها به هم مربوط‌اند؛ اطلاعات خیالی مجاز است'])
    CHANGED[id]=[s['id'] for s,o in zip(rows,old['sentences']) if s['ar']!=o['ar'] or s['fa']!=o['fa']]
    PLANS.append(dict(id=id,index=index+1,title=titles[p['number']],module=p['module'],preA1Ids=[B['preA1'][n-1]['id'] for n in p['preA1Numbers']],prerequisiteIds=[ids[n] for n in p['prerequisiteNumbers']],outcomeFa=p['outcomeFa'],grammarFa=p['grammarFa'],cautionFa=p['cautionFa'],productionFa=p['productionFa'],scene=CONTENT[id]['dialogue'],skills=skills))
assert len(CONTENT)==14 and sum(len(v['dialogue']) for v in CONTENT.values())==61
emit=lambda name,value,typ:'export const '+name+': '+typ+' = '+json.dumps(value,ensure_ascii=False,indent=2)+';\n'
header="// Generated by docs/arabic-a1-design/runtime/generate.py; edit authoring sources.\nimport type {ArabicLesson} from './content';\nimport type {A1SkillTask} from '../languages/a1Skills';\nimport type {ProductionPrompt} from '../productionPrompt';\n"
(ROOT/'lib/arabic/a1Sequenced.generated.ts').write_text(header+emit('ARABIC_A1_CONTENT',CONTENT,"Readonly<Record<string, Pick<ArabicLesson, 'title'|'order'|'section'|'unitId'|'unitTitle'|'unitTitleAr'|'subtitle'|'goal'|'situation'|'teachingFa'|'sentences'|'dialogue'|'checks'>>>")+emit('ARABIC_A1_SKILLS',SKILLS,'Readonly<Record<string, readonly A1SkillTask[]>>')+emit('ARABIC_A1_PRODUCTION',PRODUCTION,'Readonly<Record<string, ProductionPrompt>>'))
(ROOT/'lib/arabic/a1ChangedSlots.generated.json').write_text(json.dumps(CHANGED,ensure_ascii=False,indent=2)+'\n')
(HERE/'migration.json').write_text(json.dumps(CHANGED,ensure_ascii=False,indent=2)+'\n')
(HERE/'introduced-forms.json').write_text(json.dumps(INTRO,ensure_ascii=False,indent=2)+'\n')
(HERE.parent/'design.json').write_text(json.dumps(dict(language='ar',variety='Modern Standard Arabic; ar-SA TTS locale is not a dialect claim',authorization='User approved design and full implementation together',lessons=PLANS),ensure_ascii=False,indent=2)+'\n')
print('Generated Arabic A1: 14 lessons/112 stable rows/61 exact scene turns/43 authored checks/28 skills/14 production; changed:',sum(map(len,CHANGED.values())))
