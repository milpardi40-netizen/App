const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const esbuild = require('esbuild');
const before = require('../fixtures/six-prea1-before.json');
const balanceBefore = require('../fixtures/prea1-balance-before.json');
const balance = require('../../lib/languages/preA1Practical/balanceManifest.json');
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function loadInventory() {
  const built = await esbuild.build({ stdin: { contents: `export {SENTENCE_LESSONS as en} from './lib/courseContent';export {RUSSIAN_LESSONS as ru} from './lib/languages/russian';export {TURKISH_LESSONS as tr} from './lib/languages/turkish';export {ARABIC_LESSONS as ar} from './lib/arabic/content';export {NEW_COURSES} from './lib/languages/newCourses';`, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false, plugins: [{ name: 'content-only', setup(build) {
    build.onResolve({ filter: /createCourseProgressStore$|starterSessions$/ }, args => ({ path: args.path, namespace: 'mock' }));
    build.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ contents: args.path.endsWith('starterSessions') ? 'export const createStarterSessions=()=>({});' : 'export const createCourseProgressStore=()=>({});' }));
  } }] });
  const mod = { exports: {} }; new Function('module', 'exports', built.outputFiles[0].text)(mod, mod.exports);
  return Object.fromEntries(['en', 'ru', 'tr', 'ar', 'de', 'fr', 'es'].map(language => [language, mod.exports[language] || mod.exports.NEW_COURSES[language].lessons]));
}
function verifyScope(inventory) {
  for (const [language, lessons] of Object.entries(inventory)) {
    if (language === 'ar') { require('./approved-arabic-a1.cjs').verifyApprovedArabicA1(lessons); continue; }
    if (language === 'tr') { require('./approved-turkish-a1.cjs').verifyApprovedTurkishA1(lessons); continue; }
    if (language === 'es') {
      const approved = require('../fixtures/spanish-a1-before.json');
      assert.equal(digest(lessons.filter(l=>l.levelId!==1)),approved.protected.es,'Spanish outside the separately approved A1 scope stays byte-identical');
      const shape = l=>({id:l.id,sentenceIds:l.sentences.map(s=>s.id),checks:l.checks.length,dialogue:l.dialogue.length});
      assert.deepEqual(lessons.filter(l=>l.levelId===1).map(shape).sort((a,b)=>a.id.localeCompare(b.id)),approved.core.map(shape).sort((a,b)=>a.id.localeCompare(b.id)));
      continue;
    }
    if (language === 'fr') {
      const approved = require('../fixtures/french-a1-before.json');
      assert.equal(digest(lessons.filter(l=>l.levelId!==1)),approved.protected.fr,'French outside the separately approved A1 scope stays byte-identical');
      const shape = l=>({id:l.id,sentenceIds:l.sentences.map(s=>s.id),checks:l.checks.length,dialogue:l.dialogue.length});
      assert.deepEqual(lessons.filter(l=>l.levelId===1).map(shape).sort((a,b)=>a.id.localeCompare(b.id)),approved.core.map(shape).sort((a,b)=>a.id.localeCompare(b.id)));
      continue;
    }
    if (language === 'de') {
      const approved = require('../fixtures/german-a1-before.json');
      assert.equal(digest(lessons.filter(l=>l.levelId!==1)),approved.protected.de,'German outside the separately approved A1 scope stays byte-identical');
      const shape = l=>({id:l.id,sentenceIds:l.sentences.map(s=>s.id),checks:l.checks.length,dialogue:l.dialogue.length});
      assert.deepEqual(lessons.filter(l=>l.levelId===1).map(shape).sort((a,b)=>a.id.localeCompare(b.id)),approved.core.map(shape).sort((a,b)=>a.id.localeCompare(b.id)));
      continue;
    }
    if (language === 'en') {
      // The separately approved English A1 implementation is no longer a protected Pre-A1 band.
      const approved = require('../fixtures/english-a1-before.json');
      const ids = new Set(approved.core.map(l => l.id));
      assert.equal(digest(lessons.filter(l => !ids.has(l.id))), approved.protected.en, 'English outside the approved 29 A1 lessons stays byte-identical');
      assert.deepEqual(lessons.filter(l => ids.has(l.id)).map(l => ({id:l.id, sentenceIds:l.sentences.map(s=>s.id)})).sort((a,b)=>a.id.localeCompare(b.id)), approved.core.map(l=>({id:l.id,sentenceIds:l.sentences.map(s=>s.id)})).sort((a,b)=>a.id.localeCompare(b.id)));
      continue;
    }
    if (language === 'ru') {
      const a1Before = require('../fixtures/russian-a1-before.json');
      assert.equal(digest(lessons.filter(l => l.levelId !== 1)), a1Before.protected.ru, 'Russian Pre-A1 and A2–C1 stay byte-identical');
      const current = lessons.filter(l => l.levelId === 1).map(l => ({ id: l.id, sentenceIds: l.sentences.map(s => s.id), dialogueCount: l.dialogue.length, checksCount: l.checks.length }));
      assert.deepEqual(current.sort((a,b) => a.id.localeCompare(b.id)), [...a1Before.a1Structure].sort((a,b) => a.id.localeCompare(b.id)), 'A1 keeps every lesson, sentence ID and assessment/dialogue shape');
      continue;
    }
    assert.equal(digest(lessons.filter(l => l.levelId !== 0)), before.protected[language], language + ': all A1–C1 content stays byte-identical');
    const structure = lessons.map(l => ({ id: l.id, levelId: l.levelId, order: l.order, sentences: l.sentences.filter(s => !balance[l.id]?.newIds.includes(s.id)).map(s => s.id), learningMode: l.learningMode, checks: l.checks?.length }));
    assert.equal(digest(structure), before.structure[language], language + ': lesson count/order/IDs, all original sentence IDs, learning modes and check counts stay stable');
    for (const old of balanceBefore[language]) {
      const lesson = lessons.find(l => l.id === old.id);
      if (!balance[old.id]) assert.equal(digest(lesson), old.hash, old.id + ': lessons outside the targeted balance plan stay identical');
      else {
        assert.equal(lesson.sentences.length, balance[old.id].count, old.id + ': individually authorised count');
        for (const sentence of old.sentences) {
          const current = lesson.sentences.find(s => s.id === sentence.id);
          assert.ok(current, sentence.id + ': original ID is retained');
          if (!balance[old.id].split) assert.equal(digest(current), sentence.hash, sentence.id + ': additive lessons preserve old examples exactly');
        }
      }
    }
  }
}
module.exports = { loadInventory, verifyScope };
