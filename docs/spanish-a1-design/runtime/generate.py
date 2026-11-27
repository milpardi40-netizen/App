"""Offline compiler for the approved Spanish A1 scope. No network/package dependencies.
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
BEFORE=load(ROOT/'scripts/fixtures/spanish-a1-before.json')
GLOSS=load(HERE/'vocabulary.json')
from pronunciation import pronounce as spanish_pronounce
def pronounce(text):return spanish_pronounce(text)
# Literal vocabulary only, using the Spanish input inventory plus lesson-local entries.
LEX=[(word,meaning,re.compile(r'(?<![\w])'+re.escape(word)+r'(?![\w])',re.I)) for word,meaning in sorted(GLOSS.items(),key=lambda x:-len(x[0])) if len(word.split())<=4]
def vocab(text):
    found=[];used=set()
    for word,meaning,pat in LEX:
        m=pat.search(text)
        if m and not set(range(*m.span()))&used:
            found.append(dict(word=m[0],meaning=meaning));used.update(range(*m.span()))
    if not found:
        if re.fullmatch(r'(?:[A-Z][–-])+[A-Z][.!]?',text):return [dict(word=text.rstrip('.!'),meaning='هجی نام با حروف اسپانیایی')]
        raise ValueError(('Missing literal vocabulary',text))
    return found[:6]
ENDINGS={
'greetings':[('Nos vemos mañana.','فردا همدیگر را می‌بینیم.'),('Sí, hasta mañana.','بله، تا فردا.')],
'profile':[('Yo vivo en Toledo.','من در تولدو زندگی می‌کنم.'),('Encantada, Lucía.','از آشنایی با تو خوشحالم، لوسیا. (گوینده زن)')],
'asking-help':[('Gracias, Ali.','ممنون، علی.'),('De nada.','خواهش می‌کنم.')],
'nationalities':[('Yo también hablo español. ¿Hablas persa?','من هم اسپانیایی صحبت می‌کنم. فارسی صحبت می‌کنی؟'),('Sí, hablo persa.','بله، فارسی صحبت می‌کنم.')],
'numbers-age':[('Gracias. ¿Y Ben cuántos años tiene?','ممنون. و بن چند سال دارد؟'),('Tiene treinta y dos años.','سی‌ودو سال دارد.')],
'family':[('¿Tienes también un hermano?','برادر هم داری؟'),('No, tengo una hermana.','نه، یک خواهر دارم.')],
'possessives':[('¿Y esta bolsa?','و این کیف؟'),('Es mi bolsa.','این کیف من است.')],
'cafe':[('Son tres euros.','سه یورو می‌شود.'),('Aquí tiene. Gracias, adiós.','بفرمایید. ممنون، خداحافظ.')],
'shopping-payment':[('Con tarjeta, por favor.','با کارت، لطفاً.'),('Aquí tiene su cuaderno. Gracias.','بفرمایید دفتر شما. ممنون.')],
'directions':[('Gracias por su ayuda.','بابت کمکتان ممنون.'),('De nada. Hasta luego.','خواهش می‌کنم. تا بعد.')],
'metro-directions':[('Entonces, ¿delante de la plaza?','پس، جلوی میدان؟'),('Sí, exactamente.','بله، دقیقاً.')],
}
def options(correct,wrong,n):
    c=[correct,*wrong];assert len(c)==3 and len(set(c))==3,c
    n%=3;return c[n:]+c[:n]
from checks import CHECKS
DIST=load(HERE/'distractors.json')
CONTENT={};SKILLS={};PRODUCTION={};MIGRATION={}
for plan in D:
    slug=plan['id'].removeprefix('es-a1-');old=next(l for l in BEFORE['core'] if l['id']==plan['id'])
    raw=[(t['es'],t['fa']) for t in plan['scene']]+BANK[slug]
    assert len(raw)==len(old['sentences']),(slug,len(raw))
    assert len(set(t[0].lower() for t in raw))==len(raw),(slug,'duplicate')
    rows=[dict(id=prev['id'],text=text,fa=fa,pronunciation=pronounce(text),vocabulary=vocab(text),pattern=plan['grammarFa']) for (text,fa),prev in zip(raw,old['sentences'])]
    scene=[dict(role=t['role'],speaker=t['role'],text=t['es'],fa=t['fa']) for t in plan['scene']]
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
    checks=[dict(promptFa='در همین درس «'+r['text']+'» چه معنایی دارد؟',choices=choices,correctIndex=choices.index(r['fa']),explanationFa=r['text']+' — '+r['fa']),CHECKS[slug]]
    r=rows[-1];choices=options(r['text'],[rows[0]['text'],rows[1]['text']],plan['proposedIndex']+1)
    checks.append(dict(promptFa='در متن همین درس برای «'+r['fa']+'» کدام عبارت آمده؟',choices=choices,correctIndex=choices.index(r['text']),explanationFa=r['text']+' — '+r['fa']))
    checks.append(dict(promptFa='متن را بخوان: '+sk[1]['passage']+'\n'+sk[1]['promptFa'],choices=sk[1]['choices'],correctIndex=sk[1]['correctIndex'],explanationFa=sk[1]['explanationFa']))
    CONTENT[plan['id']]=dict(situation='هدف: '+plan['outcomeFa'],teachingFa='\n'.join(['هدف: '+plan['outcomeFa'],'بازیابی کوتاه: '+('، '.join(next(l['title'] for l in BEFORE['core'] if l['id']==id) for id in plan['prerequisiteIds']) or 'سلام و معرفی در Pre-A1'),'توضیح: '+NOTES[slug],'دامنهٔ دستور: '+plan['grammarFa'],'واژگان: '+plan['vocabularyFa'],'احتیاط: '+plan['outOfScopeAndErrorFa'],'شنیدن: '+plan['pronunciationFa'],'تولید: '+plan['productionFa']]),sentences=rows,dialogue=scene,checks=checks)
    SKILLS[plan['id']]=sk
    PRODUCTION[plan['id']]=dict(speaking=plan['productionFa'],writing=plan['productionFa'],minWords=4 if slug in ['greetings','asking-help','numbers-age','forms-information'] else 8,checklist=['پیام خواسته‌شده را با واژه‌های همین درس رسانده‌ام','ساخت هدف، جنس/شمار و خطاب را حفظ کرده‌ام؛ ضمیر روشن می‌تواند حذف شود','اطلاعات جمله‌ها با هم سازگارند؛ اطلاعات خیالی مجاز است'])
    MIGRATION[plan['id']]=[r['id'] for r,p in zip(rows,old['sentences']) if r['text']!=p['text'] or r['fa']!=p['fa']]
def emit(name,data,typ):return 'export const '+name+': '+typ+' = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n'
header="// Generated by docs/spanish-a1-design/runtime/generate.py. Edit authoring sources, not this file.\nimport type {LearningLesson} from './types';\nimport type {A1SkillTask} from './a1Skills';\nimport type {ProductionPrompt} from '../productionPrompt';\n"
(ROOT/'lib/languages/spanishA1.generated.ts').write_text(header+emit('SPANISH_A1_CONTENT',CONTENT,"Readonly<Record<string, Pick<LearningLesson, 'situation'|'teachingFa'|'sentences'|'dialogue'|'checks'>>>")+emit('SPANISH_A1_SKILLS',SKILLS,'Readonly<Record<string, readonly A1SkillTask[]>>')+emit('SPANISH_A1_PRODUCTION',PRODUCTION,'Readonly<Record<string, ProductionPrompt>>'))
(ROOT/'lib/languages/spanishA1ChangedSlots.generated.json').write_text(json.dumps(MIGRATION,ensure_ascii=False,indent=2)+'\n')
(HERE/'migration.json').write_text(json.dumps(MIGRATION,ensure_ascii=False,indent=2)+'\n')
print(f'Generated {len(CONTENT)} Spanish A1 lessons / {sum(len(l["sentences"]) for l in CONTENT.values())} stable rows / {sum(len(l["dialogue"]) for l in CONTENT.values())} scene turns / 224 authored checks / 112 optional tasks.')
