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
    assert.equal(digest(lessons.filter(l => language === 'ru' || l.levelId !== 0)), before.protected[language], language + ': Russian and all A1–C1 content stays byte-identical');
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
