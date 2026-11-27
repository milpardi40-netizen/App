/* Documentation-only consistency checks. Does not change or load this design into the app. */
const assert = require('node:assert/strict');
const path = require('node:path');
const { createHash } = require('node:crypto');
const baseline = require('../../scripts/fixtures/russian-a1-before.json');
const { loadInventory } = require('../../scripts/helpers/practical-inventory.cjs');
const plan = require('./blueprint.json');
const evidence = require('./pre-a1-evidence.json');
const detailed = require('./all-29-detailed-design.json');
const fs = require('node:fs');

(async () => {
  const root = path.resolve(__dirname, '../..');
  // The inventory bundler resolves its imports from the repository root.
  process.chdir(root);
  const current = (await loadInventory()).ru;
  const pre = current.filter(l => l.levelId === 0);
  const a1 = current.filter(l => l.levelId === 1);
  assert.equal(plan.status, 'review-required-not-runtime');
  assert.equal(plan.lessons.length, 29);
  assert.equal(plan.modules.length, 9);
  assert.deepEqual(new Set(plan.lessons.map(l => l.id)), new Set(a1.map(l => l.id)));
  assert.equal(new Set(plan.lessons.map(l => l.id)).size, plan.lessons.length);
  const outcomes = new Set(plan.outcomes.map(o => o.id));
  const preIds = new Set(pre.map(l => l.id));
  const byId = new Map(plan.lessons.map(l => [l.id, l]));
  const moduleIds = new Set(plan.modules.map(m => m.id));
  for (const [index, lesson] of plan.lessons.entries()) {
    assert.equal(lesson.proposedOrder, index + 1);
    assert.equal(lesson.currentOrder, baseline.a1Structure.findIndex(l => l.id === lesson.id) + 1);
    assert.equal(lesson.proposedOrder, a1.findIndex(l => l.id === lesson.id) + 1);
    assert(moduleIds.has(lesson.moduleId));
    assert(lesson.goalFa && lesson.grammarScopeFa && lesson.transferTaskFa);
    assert(lesson.vocabularySeeds.length > 0);
    assert.equal(lesson.vocabularyStatus, 'proposed-not-complete-not-certified-new');
    assert.equal(lesson.baselineEvidenceStatus, 'observed-in-content-not-proven-mastery');
    assert(lesson.baselineLessonIds.length > 0);
    for (const id of lesson.baselineLessonIds) assert(preIds.has(id), `${lesson.id}: unknown baseline ${id}`);
    assert(lesson.outcomeIds.length > 0);
    for (const id of lesson.outcomeIds) assert(outcomes.has(id));
    for (const id of lesson.prerequisiteLessonIds) {
      assert(byId.has(id), `${lesson.id}: unknown dependency ${id}`);
      // Strictly earlier prerequisites also exclude every possible dependency cycle.
      assert(byId.get(id).proposedOrder < lesson.proposedOrder, `${lesson.id}: forward/circular dependency ${id}`);
    }
    for (const id of lesson.reviewAt) {
      assert(byId.get(id)?.proposedOrder > lesson.proposedOrder);
      assert(byId.get(id).prerequisiteLessonIds.includes(lesson.id));
    }
  }
  assert.deepEqual(plan.modules.flatMap(m => m.lessonIds), plan.lessons.map(l => l.id));
  for (const module of plan.modules) {
    assert.equal(module.checkpointAfter, module.lessonIds.at(-1));
    for (const id of module.lessonIds) assert.equal(byId.get(id).moduleId, module.id);
  }
  for (const outcome of outcomes) assert(plan.lessons.some(l => l.outcomeIds.includes(outcome)));
  assert.equal(evidence.preA1LessonCount, pre.length);
  assert.equal(evidence.preA1ExampleRowCount, pre.reduce((n, l) => n + l.sentences.length, 0));
  assert.equal(evidence.a1LessonCount, a1.length);
  assert.equal(evidence.a1ExampleRowCount, a1.reduce((n, l) => n + l.sentences.length, 0));
  assert.deepEqual(evidence.preA1Lessons, pre.map((l, index) => ({
    id: l.id, displayOrder: index + 1, titleFa: l.title,
    examples: l.sentences.map(s => ({ id: s.id, ru: s.text, fa: s.fa })),
  })));
  assert.equal(detailed.status, 'detailed-design-all-29-review-only-not-runtime');
  assert.equal(detailed.lessons.length, 29);
  const manuscript = fs.readFileSync(path.join(root, 'docs/RUSSIAN-A1-ALL-29-DETAILED-DESIGN.md'), 'utf8');
  assert.equal((manuscript.match(/^## درس \d+ — /gm) || []).length, 29);
  const normalize = text => text.normalize('NFD').replace(/\u0301/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  for (const [index, lesson] of detailed.lessons.entries()) {
    // Every inherited design field must remain in sync with the approved-sequence blueprint.
    for (const [key, value] of Object.entries(plan.lessons[index])) assert.deepEqual(lesson[key], value, `${lesson.id}: ${key}`);
    for (const key of ['sceneFa', 'retrievalFa', 'writingTaskFa', 'contrastFa', 'boundaryFa']) assert(lesson[key]?.trim(), `${lesson.id}: missing ${key}`);
    assert.equal(lesson.examples.length, 6);
    assert.equal(lesson.dialogue.length, 4);
    assert.equal(new Set(lesson.examples.map(line => normalize(line.ru))).size, lesson.examples.length);
    for (const [i, line] of lesson.dialogue.entries()) assert.equal(line.role, i % 2 === 0 ? 'partner' : 'learner');
    for (const line of [...lesson.examples, ...lesson.dialogue]) {
      assert(line.ru && line.fa);
      assert(/[А-Яа-яЁё]/u.test(line.ru));
      assert(manuscript.includes(line.ru) && manuscript.includes(line.fa), `${lesson.id}: rendered line missing`);
    }
    for (const key of ['listening', 'reading']) {
      const task = lesson[key];
      assert(task.ru && task.questionFa && task.answerFa);
      for (const text of Object.values(task)) assert(manuscript.includes(text));
      const nearCopy = lesson.examples.some(line => normalize(line.ru) === normalize(task.ru));
      assert(!nearCopy, `${lesson.id}: ${key} exactly copies a core example`);
    }
    const russian = [...lesson.examples, ...lesson.dialogue, lesson.listening, lesson.reading].map(line => line.ru).join('\n');
    assert(!/авто́бус|во́сьми|работа́ет/u.test(russian), `${lesson.id}: known incorrect stress`);
  }
  console.log('All-29 design verified: 174 bilingual example rows, 116 alternating-role dialogue turns, 58 comprehension tasks with keys, 29 writing tasks; rendered manuscript and blueprint stay in sync.');
  // Implementation is now authorised; protect actual non-A1 content rather than banning runtime edits.
  const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(digest(current.filter(l => l.levelId !== 1)), baseline.protected.ru);
  console.log('Architecture/implementation alignment verified: 29 ordered lessons, 9 modules, earlier-only prerequisites and unchanged Pre-A1/A2–C1.');
  console.log('This validates document consistency, NOT linguistic accuracy, complete lexical coverage, learner mastery or CEFR certification.');
})().catch(error => { console.error(error); process.exitCode = 1; });
