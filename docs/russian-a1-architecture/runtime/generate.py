"""Reproduce A1 runtime content only. Run from repository root; no APK/build or storage edits."""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[3]
source = Path(__file__).resolve().parent
lessons = json.loads((source / 'lessons.json').read_text())
skills = json.loads((source / 'skills.json').read_text())
plan = json.loads((source.parent / 'blueprint.json').read_text())
assert [l['id'] for l in lessons] == [l['id'] for l in plan['lessons']]
assert set(skills) == {l['id'] for l in lessons}
for l in lessons:
    assert l['sentences'] and len(l['dialogue']) == 6 and len(l['checks']) == 2
    for row in l['sentences']:
        assert len(row) == 5 and all(row[:4]) and row[4]
        assert all(w in row[0] and meaning for w, meaning in row[4])
    for c in l['checks']:
        assert len(set(c['choices'])) == 3 and c['explanationFa']
    for task in skills[l['id']]:
        assert len(set(task['choices'])) == 3 and 0 <= task['correctIndex'] < 3
for filename, constant, rows in [('a1Band1.ts', 'A1_FOUNDATION', lessons[:10]), ('a1Band2.ts', 'A1_SURVIVAL', lessons[10:])]:
    (root / 'lib/languages/russianBeginner' / filename).write_text(
        "import { registerA1Specs } from './a1Builder';\n\n// Generated from docs/russian-a1-architecture/runtime; preserve stable IDs.\nexport const "
        + constant + ' = registerA1Specs(' + json.dumps(rows, ensure_ascii=False, indent=2) + ');\n')
(root / 'lib/languages/russianA1Skills.ts').write_text(
    "import type { A1SkillTask } from './a1Skills';\n\n// Generated optional, ungraded comprehension of taught forms.\nexport const RUSSIAN_A1_SKILLS: Readonly<Record<string, readonly A1SkillTask[]>> = "
    + json.dumps(skills, ensure_ascii=False, indent=2) + ';\n')
print('Generated 29 Russian A1 lessons and 58 optional comprehension tasks.')

# Repair only A1 workshop pointers; the global dictionary, Pre-A1 and A2–C1 stay identical.
# Curated lemma candidates disambiguate homographs (e.g. стоит: price vs standing).
import re
index_path = root / 'lib/languages/russianGrammar/verbs.generated.json'
index = json.loads(index_path.read_text())
verbs = {v['lemma']: v for v in index['verbs']}
links = json.loads((source / 'verb-links.json').read_text())
def norm(text):
    return text.lower().replace('\u0301', '').replace('ё', 'е')
for lesson in lessons:
    refs = {}
    lines = [(f"{lesson['id']}-{n:02}", row[0]) for n, row in enumerate(lesson['sentences'], 1)]
    lines += [(f'd:{n}', row[1]) for n, row in enumerate(lesson['dialogue'])]
    for lemma in links[lesson['id']]:
        forms = {norm(w) for w in [lemma, *verbs[lemma]['forms']]}
        for key, text in lines:
            form = next((w for w in re.findall('[А-Яа-яЁё\u0301]+', text) if norm(w) in forms), None)
            if form:
                refs[lemma] = [key, form]
                break
    index['byLesson'][lesson['id']] = list(refs)
    index['references'][lesson['id']] = refs
encode = lambda v: json.dumps(v, ensure_ascii=False, separators=(',', ':'))
index_path.write_text('{"verbs":[\n' + ',\n'.join(map(encode, index['verbs']))
    + '\n],"byLesson":{\n' + ',\n'.join(encode(k)+':'+encode(v) for k,v in index['byLesson'].items())
    + '\n},"references":{\n' + ',\n'.join(encode(k)+':'+encode(v) for k,v in index['references'].items()) + '\n}}\n')
