const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const before = require('../fixtures/russian-prea1-phase1-before.json');
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
// Restore only the reviewed five context fields, never unrelated lesson bytes.
function phase2Pre(lessons) {
  const approved = require('../fixtures/russian-prea1-phase3-approved.json');
  const pre=lessons.filter(l=>l.id.startsWith('ru-pre-'));
  if(pre.length) assert.equal(digest(pre), 'levelId' in pre[0] ? approved.preHash : approved.rawPreHash,'exact approved phase-3 payload');
  return lessons.map(l=>{
    const delta=approved.contexts.find(d=>d.id===l.id);
    if(!delta)return l;
    for(const field of ['situation','checks'])assert.deepEqual(l[field],delta.after[field]);
    return {...l,...delta.before};
  });
}
function phase1Pre(lessons) {
  lessons=phase2Pre(lessons);
  const old = require('../fixtures/russian-prea1-phase2-before.json').lesson;
  return lessons.map(l=>{
    if(l.id!==old.id)return l;
    if('levelId' in l)return old;
    const {levelId,module,subtitle,order,...raw}=old;return raw;
  });
}
function verifyApprovedRussianPreA1(lessons) {
  const pre = lessons.filter(l => l.id.startsWith('ru-pre-'));
  const raw = pre.length && !('levelId' in pre[0]);
  const approved = require('../fixtures/russian-prea1-phase2-approved.json');
  assert.equal(digest(phase2Pre(pre)), raw ? approved.rawPreHash : approved.preHash, 'restoring only the reviewed phase-3 context changes matches exact phase-2 content');
  const phase1 = require('../fixtures/russian-prea1-phase1-approved.json');
  assert.equal(digest(phase1Pre(pre)),raw ? phase1.rawPreHash : phase1.preHash,'phase 2 changes only lesson 12; phase 1 stays protected');
  assert.deepEqual(pre.map(l=>[l.id,l.sentences.map(s=>s.id),l.checks.length,l.dialogue]), before.pre.map(l=>[l.id,l.sentences.map(s=>s.id),l.checks.length,l.dialogue]), 'stable lesson/expression IDs, counts, authored scenes and order');
}
// Retain historical guards for every other byte; approved current Pre-A1 has its own exact guard.
function historicalPre(lessons) {
  verifyApprovedRussianPreA1(lessons);
  return lessons.map(l=>{const old=before.pre.find(old=>old.id===l.id); if(!old) return l; if('levelId' in l) return old; const {levelId,module,subtitle,order,...raw}=old; return raw;});
}
module.exports = {verifyApprovedRussianPreA1, historicalPre, phase1Pre, phase2Pre};
function historicalRussianCards(cards) {
  const deltas = require('../fixtures/russian-prea1-phase1-wordlab.json').cards;
  assert.deepEqual(deltas.map(d=>d.after.id).sort(), ['ru-word-двенадцать','ru-word-текстов','ru-word-тринадцать'].sort());
  for (const delta of deltas) assert.deepEqual(cards.find(c=>c.id===delta.after.id), delta.after, 'reviewed course-derived card correction');
  return cards.map(c=>deltas.find(d=>d.after.id===c.id)?.before ?? c);
}
module.exports.historicalRussianCards = historicalRussianCards;

// Reconstruct the historical payload using ONLY the 3 core / 15 card field deltas.
// Both the current bytes and the reconstructed prior bytes must match their own exact hashes.
function phase1WordLab(kind,value) {
  assert.equal(digest(value),require('../fixtures/russian-prea1-phase2-approved.json').wordLab[kind],`Russian ${kind}: approved phase-2 payload`);
  const deltas=require('../fixtures/russian-prea1-phase2-wordlab-deltas.json')[kind]??[];
  const restored=value.map(row=>{
    const delta=deltas.find(d=>d.id===row.id);
    if(!delta)return row;
    for(const field of delta.fields)assert.deepEqual(row[field],delta.after[field]);
    return {...row,...delta.before};
  });
  assert.equal(digest(restored),require('../fixtures/russian-prea1-phase2-before.json').wordLab.ru[kind],'all other word-lab bytes, IDs and order preserved');
  return restored;
}
function historicalWordLabHash(kind,value) {
  const phase1=phase1WordLab(kind,value);
  return digest(kind==='cards'?historicalRussianCards(phase1):phase1);
}
module.exports.historicalWordLabHash=historicalWordLabHash;
module.exports.phase1WordLab=phase1WordLab;
function historicalGender(cards) {
  const id='ru-pre-12-verbs';
  assert.deepEqual(cards[id],require('../fixtures/russian-prea1-phase2-approved.json').genderCard,'only the approved light-lesson gender card changed');
  return {...cards,[id]:require('../fixtures/russian-prea1-phase2-before.json').genderCard};
}
module.exports.historicalGender=historicalGender;
