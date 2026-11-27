// Narrow follow-up repair: no lesson edits, no old card IDs removed, no German lab drift.
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const before = require('./fixtures/russian-english-word-lab-repair.json');
const {loadInventory} = require('./helpers/practical-inventory.cjs');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fold = value => value.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/ё/g,'е')
  .replace(/[´`’'!?.,;:«»„“”¿¡…—–]/g,'').replace(/\s+/g,' ').trim();
const expectedTargets = {
  ru: ['два','четы́ре','шесть','во́семь','мя́со','сын','воскресе́нье','час','по́езд','до́рого','о́чень'],
  en: ['first name','last name','spell','address','eleven','twelve','sandwich','sugar','month','turn left','turn right','card'],
};
async function main() {
  const run = spawnSync(process.execPath,['scripts/verify-word-lab-core.mjs'],{encoding:'utf8'});
  assert.equal(run.status,0,run.stdout+run.stderr);
  assert.match(run.stdout,/36 word-lab content checks passed/);
  const app = require('../node_modules/.cache/word-lab-core-test.cjs');
  const inventory = await loadInventory();
  for(const [language,lessons] of Object.entries(inventory))assert.equal(hash(language==='ru'?require('./helpers/approved-russian-prea1.cjs').historicalPre(lessons):lessons),before.inventories[language],language+': entire course inventory unchanged');
  assert.equal(hash(app.CORE_WORDS.de),before.german.core,'German core cards unchanged');
  assert.equal(hash(app.WORD_LAB_WORDS.de),before.german.cards,'German full lab unchanged');
  assert.equal(hash(app.UNRESOLVED_CORE_TARGETS.de),before.german.unresolved,'German unresolved targets unchanged');
  for(const language of ['ru','en']) {
    const snapshot = before.languages[language];
    const targets = expectedTargets[language];
    assert.deepEqual(snapshot.addedCoreTargets,targets,'explicitly reviewed additions, not arbitrary floor padding');
    assert.equal(app.CORE_WORDS[language].length,language==='ru'?116:131);
    const priorCore = app.CORE_WORDS[language].filter(word=>!targets.includes(word.target));
    assert.equal(priorCore.length,snapshot.before.coreCount);
    assert.equal(hash(priorCore.map(word=>word.id).sort()),snapshot.before.coreIdsHash,language+': all previous curated IDs retained');
    const priorCards = app.WORD_LAB_WORDS[language].filter(card=>!snapshot.addedCardIds.includes(card.id));
    assert.equal(priorCards.length,snapshot.before.cardCount);
    assert.equal(hash(priorCards.map(card=>card.id).sort()),snapshot.before.cardIdsHash,language+': all previous learner IDs retained');
    assert.equal((language==='ru'?require('./helpers/approved-russian-prea1.cjs').historicalWordLabHash('core',app.CORE_WORDS.ru):hash(app.CORE_WORDS[language])),snapshot.after.core);
    assert.equal((language==='ru'?require('./helpers/approved-russian-prea1.cjs').historicalWordLabHash('cards',app.WORD_LAB_WORDS.ru):hash(app.WORD_LAB_WORDS[language])),snapshot.after.cards);
    assert.equal(hash(app.UNRESOLVED_CORE_TARGETS[language]),snapshot.after.unresolved);
    const beginner = inventory[language].filter(lesson=>lesson.levelId<=1&&!lesson.id.startsWith('lab-'));
    for(const target of targets) {
      const core = app.CORE_WORDS[language].find(word=>word.target===target);
      assert.ok(core,target+' resolves');
      assert.ok(!/واژهٔ پرتکرار|کلمهٔ پرتکار/.test(core.fa));
      const source = beginner.find(lesson=>lesson.title===core.lessonTitle && lesson.sentences.some(sentence=>(sentence.text??sentence.en)===core.sentence && sentence.fa===core.sentenceFa && sentence.pronunciation===core.sentencePronunciation));
      assert.ok(source,target+': exact existing beginner source, translation and pronunciation');
      assert.ok((' '+fold(core.sentence)+' ').includes(' '+fold(target)+' '),target+': exact whole word/phrase');
      assert.notEqual(fold(core.sentence),fold(target),'not a bare-word or bare-phrase card');
      const id = `${language}-word-${fold(target).replace(/\s+/g,'-')}`;
      const card = app.WORD_LAB_WORDS[language].find(word=>word.id===id);
      assert.ok(card?.curated);assert.ok(app.hasSpokenSentence(card));
      assert.equal(app.spokenSentence(card),core.sentence);
    }
  }
  // Pure verifier normalization regression: curly quotes were handled by production, but not the test.
  const verifier = fs.readFileSync('scripts/verify-word-lab-core.mjs','utf8');
  const source = verifier.slice(verifier.indexOf('const fold ='),verifier.indexOf('// Release72'));
  const verifierFold = new Function(source+'; return fold;')();
  for(const quote of ['“street”','„street“','«street»'])assert.equal(verifierFold(quote),'street');
  assert.equal(verifierFold('Приве́т,'),'привет');
  assert.notEqual(verifierFold('Küche'),verifierFold('Kuchen'),'quote fix does not collapse different words');
  assert.notEqual(verifierFold('Tür'),verifierFold('Türkei'));
  assert.match(verifier,/const FLOOR = \{ de: 154, ru: 113, en: 130 \}/);
  // The prior German repair's original non-German hashes are historical baselines, not deleted guards.
  const germanBefore = require('./fixtures/german-word-lab-repair-before.json');
  for(const language of ['ru','en'])for(const key of ['core','cards','unresolved'])assert.equal(before.languages[language].before[key],germanBefore.protected[language][key]);
  console.log('Russian/English word-lab repair PASS: RU 105 → 116, EN 119 → 131; all 36 common checks pass; 23 reviewed additions use exact existing beginner examples; every previous learner ID, all seven course inventories and German word-lab payloads preserved.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
