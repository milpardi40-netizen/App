"""Run from repository root; developer tool only (pymorphy3 2.0.6, Russian dictionaries 2.4.417150.4580142).
node scripts/content/russian-grammar/export-corpus.cjs > /tmp/ru-corpus.json
python3 scripts/content/russian-grammar/build-index.py /tmp/ru-corpus.json

Index occurrences, not an entire machine dictionary. Review new lemmas/ambiguous analyses before shipping.
"""
from collections import defaultdict
from functools import lru_cache
from pathlib import Path
import json
import re
import sys
import pymorphy3

base = Path(__file__).resolve().parent
course = json.loads(Path(sys.argv[1]).read_text())
parse = lru_cache(None)(pymorphy3.MorphAnalyzer().parse)
V = {'VERB', 'INFN', 'GRND', 'PRTF', 'PRTS'}
words = re.compile(r'[А-Яа-яЁё\u0301]+')
strip = lambda s: s.lower().replace('\u0301', '')
meanings = dict(line.split('|') for line in (base/'meanings.txt').read_text().splitlines() if line and not line.startswith('#'))

# Contextual homographs and non-verbs in frequency lists («Мерим» is a name, «-нибудь» a suffix).
def lemma(word, context):
    w = strip(word)
    if w in {'амири','нибудь','врачем','мерим','авать','е','суть'}: return None
    if w == 'есть':
        return 'есть' if re.search(r'(люблю|хочу|буд[уе]\w*|можно|пора) есть(?! ли)', context) else 'быть'
    if w in {'нашли','нашёл','нашел'}: return 'найти'
    if w == 'спал': return 'спать'
    if w == 'еду': return 'ехать' if re.search(r'(?:я|завтра|сейчас|утром) еду|еду (?:на|в|к|домой)', context) else None
    if w in {'мою','моем','моём','мой','моешь'} and re.search(r'(мою|моем|моешь|мой) (руки|посуду|окна)',context): return 'мыть'
    if w == 'плачу': return 'плакать' if 'слёз' in context or 'слез' in context else 'платить'
    if w in {'значит','режу','сжаты','измерим','исправим','сравним','сбалансированное','затянут','здравствуйте','окружающей','вооруженных','вооружённых','повести','читаем'}:
        return {'значит':'значить','режу':'резать','сжаты':'сжать','измерим':'измерить','исправим':'исправить','сравним':'сравнить','сбалансированное':'сбалансировать','затянут':'затянуть','здравствуйте':'здравствовать','окружающей':'окружать','вооруженных':'вооружить','вооружённых':'вооружить','повести':'повести','читаем':'читать'}[w]
    p = parse(w)[0]
    return p.normal_form if p.tag.POS in V else None

forms, candidates = defaultdict(set), defaultdict(list)
levels, by_lesson, references, missing = {}, {}, {}, set()

def scan(text, fa, lv, ls, rank, contextual, ref=None, targets=None):
    context = strip(text)
    for m in words.finditer(text):
        word = m.group(); key = lemma(word, context)
        if not key: continue
        if key not in meanings:
            missing.add(key); continue
        forms[key].add(strip(word))
        if ref is not None: targets.setdefault(key, [ref, word])
        if ls is not None and key not in ls: ls.append(key)
        levels.setdefault(key, lv)
        if contextual and fa and not (len(text)>230 or ('«' in text and rank > 0)):
            candidates[key].append((rank, lv, text, fa, word))

for lesson in course:
    ls = by_lesson[lesson['id']] = []
    targets = references[lesson['id']] = {}
    for text, fa, ref in lesson['lines']:
        scan(text, fa, lesson['level'], ls, int(lesson['id'].startswith('lab-')), True, ref, targets)
    for note in lesson['notes']: scan(note, '', lesson['level'], ls, 2, False)
for i, band in enumerate(['pre','A1','A2','B1','B2','C1']):
    pack = json.loads(next(Path('content-packs/ru').glob(band + '.*.json')).read_text())
    for s in pack['sentences']: scan(s['text'], s['fa'], i, None, 2, '«' not in s['text'])

# Authored context for words that otherwise occur only as isolated frequency tokens/grammar notes.
for line in (base/'examples.txt').read_text().splitlines():
    if not line or line.startswith('#'): continue
    key, word, text, fa, *band = line.split('|')
    if band: levels.setdefault(key, int(band[0]))
    assert key in meanings and strip(word) in [strip(x) for x in words.findall(text)], line
    forms[key].add(strip(word))
    candidates[key].append((-1, levels.get(key, 1), text, fa, word))

if missing: sys.exit('Unreviewed analyses: ' + ' '.join(sorted(missing)))
active = [k for k in meanings if forms[k]]
empty = [k for k in active if not candidates[k]]
if empty: sys.exit('Need authored context: ' + ' '.join(empty))
verbs = []
for k in sorted(active, key=lambda k: (levels.get(k,1), list(levels).index(k) if k in levels else 9999)):
    options = sorted(candidates[k], key=lambda c: (c[0], c[1]))
    selected = []
    for _, _, t, fa, w in options:
        if not selected or (strip(w) != strip(selected[0]['form']) and t != selected[0]['text']):
            selected.append(dict(text=t, fa=fa, form=w))
        if len(selected)==2: break
    verbs.append(dict(lemma=k, fa=meanings[k], level=levels.get(k,1), forms=sorted(forms[k]), examples=selected))
output = Path('lib/languages/russianGrammar/verbs.generated.json')
# One record per line: small, deterministic diffs when the lesson corpus changes.
encode = lambda x: json.dumps(x, ensure_ascii=False, separators=(',',':'))
output.write_text('{"verbs":[\n'+',\n'.join(map(encode, verbs))+'\n],"byLesson":{\n'+',\n'.join(encode(k)+':'+encode(v) for k,v in by_lesson.items())+'\n},"references":{\n'+',\n'.join(encode(k)+':'+encode(v) for k,v in references.items())+'\n}}\n')
print(f'{len(verbs)} reviewed verb entries; {len(by_lesson)} lesson links; {sum(len(v["examples"]) for v in verbs)} contextual examples')

# Preserve the original dictionary and its review links. This companion index chooses ONE
# attested, translated utterance per available band. A missing band is not a CEFR label.
by_band = {}
for k in active:
    seen = {}
    for rank, lv, text, fa, word in sorted(candidates[k], key=lambda c: (int(len(words.findall(c[2])) < 2), c[0], len(c[2]))):
        seen.setdefault(lv, [text, fa, word])
    by_band[k] = seen
output.with_name('examplesByBand.generated.json').write_text('{\n'+',\n'.join(encode(k)+':'+encode(by_band[k]) for k in sorted(by_band))+'\n}\n')
print(f'{sum(map(len,by_band.values()))} attested verb/band examples')
