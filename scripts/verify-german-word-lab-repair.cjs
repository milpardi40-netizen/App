// Narrow repair guard: German lab only, with pre-repair non-German output snapshots.
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const {loadInventory} = require('./helpers/practical-inventory.cjs');
const before = require('./fixtures/german-word-lab-repair-before.json');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function main() {
  const run = spawnSync(process.execPath,['scripts/verify-word-lab-core.mjs','--language=de'],{encoding:'utf8'});
  assert.equal(run.status,0,run.stdout+run.stderr);
  const app = require('../node_modules/.cache/word-lab-core-test.cjs');
  assert.equal(app.CORE_WORDS.de.length,154);
  assert.equal(app.UNRESOLVED_CORE_TARGETS.de.length,17);
  const added = new Set(before.addedCoreTargets);
  assert.equal(added.size,16);
  const previous = app.CORE_WORDS.de.filter(word=>!added.has(word.target));
  assert.equal(previous.length,before.coreCount);
  assert.equal(hash(previous.map(word=>word.id).sort()),before.coreIdsHash,'all 138 previous curated IDs preserved');
  const addedCards = new Set(before.addedCardIds);
  const previousCards = app.WORD_LAB_WORDS.de.filter(card=>!addedCards.has(card.id));
  assert.equal(previousCards.length,before.cardCount);
  assert.equal(hash(previousCards.map(card=>card.id).sort()),before.cardIdsHash,'all 795 existing learner card IDs preserved');
  // Russian/English were separately authorized for repair after this German-only phase.
  // Keep exact payload guards, now against those explicitly approved follow-up snapshots.
  const followUp = require('./fixtures/russian-english-word-lab-repair.json');
  for(const language of ['ru','en']) {
    const approved = followUp.languages[language].after;
    assert.equal((language==='ru'?require('./helpers/approved-russian-prea1.cjs').historicalWordLabHash('core',app.CORE_WORDS.ru):hash(app.CORE_WORDS[language])),approved.core,language+': approved follow-up core payload');
    assert.equal((language==='ru'?require('./helpers/approved-russian-prea1.cjs').historicalWordLabHash('cards',app.WORD_LAB_WORDS.ru):hash(app.WORD_LAB_WORDS[language])),approved.cards,language+': approved follow-up card payload');
    assert.equal(hash(app.UNRESOLVED_CORE_TARGETS[language]),approved.unresolved,language+': approved follow-up unresolved list');
  }
  const inventory = await loadInventory();
  assert.equal(hash(inventory.de.filter(lesson=>!lesson.id.startsWith('lab-'))),before.germanCourseHash,'German lessons themselves are unchanged');
  const beginner = inventory.de.filter(lesson=>lesson.levelId<=1&&!lesson.id.startsWith('lab-'));
  const fold = text => text.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/[!?.,;:]/g,' ').replace(/\s+/g,' ').trim();
  for(const target of added) {
    const core = app.CORE_WORDS.de.find(word=>word.target===target);
    assert.ok(core,target+' emitted');
    assert.ok(!/واژهٔ پرتکرار|کلمهٔ پرتکار/.test(core.fa));
    const source = beginner.find(lesson=>lesson.title===core.lessonTitle && lesson.sentences.some(sentence=>sentence.text===core.sentence && sentence.fa===core.sentenceFa && sentence.pronunciation===core.sentencePronunciation));
    assert.ok(source,target+': exact existing beginner source, translation and pronunciation');
    assert.ok(fold(core.sentence).split(' ').includes(fold(target)),target+': exact token, not a prefix or inflection substitute');
    const learnerId = `de-word-${fold(target).replace(/\s+/g,'-')}`;
    const card = app.WORD_LAB_WORDS.de.find(card=>card.id===learnerId);
    assert.ok(card?.curated);assert.equal(card.exampleTarget,core.sentence);
    assert.equal(app.spokenSentence(card),core.sentence);
  }
  const source = fs.readFileSync('scripts/verify-word-lab-core.mjs','utf8');
  assert.match(source,/const FLOOR = \{ de: 154, ru: 113, en: 130 \}/,'no recorded threshold lowered');
  // Ordinary default invocation still covers all three languages; only an explicit flag narrows it.
  assert.ok(source.includes(": ['de', 'ru', 'en'];"));
  console.log('German word-lab repair PASS: 138 → 154 curated, all 16 added cards use exact existing beginner examples; 795 previous learner IDs retained, German lessons unchanged and separately approved English/Russian follow-up outputs verified; all floors retained.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
