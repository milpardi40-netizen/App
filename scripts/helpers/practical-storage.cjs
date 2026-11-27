const esbuild = require('esbuild');
async function modules() {
  const result = await esbuild.build({ stdin: { contents: `export { russianChecksRevisionFor as previousRussianRevisionFor } from './lib/languages/russianPreA1';export * as assessment from './lib/lessonAssessment';export * as pairs from './lib/lessonDialoguePairs';export * as bank from './lib/lessonEvidenceBank';export * as ru from './lib/languages/russianStudyState';export {normalizeArabic} from './lib/arabic/text';export * as balanceRevision from './lib/languages/preA1Practical/balanceRevision';export * as chunks from './lib/lessonChunks';export * as starter from './lib/languages/starterSessions'; export * as tr from './lib/languages/turkishStudyState';export * as en from './lib/englishStudyState';export * as ar from './lib/arabic/studyState';export * as revisions from './lib/languages/preA1Practical/revisions';export * as evidence from './lib/englishSupplement/content';export * as outcomes from './lib/lessonOutcomes';`, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false, plugins: [{ name: 'storage-stubs', setup(build) {
    build.onResolve({ filter: /^react-native$/ }, () => ({ path: 'platform', namespace: 'stub' }));
    build.onResolve({ filter: /^@react-native-async-storage\/async-storage$/ }, () => ({ path: 'storage', namespace: 'stub' }));
    build.onResolve({ filter: /personalLearningSync$|learningChanges$|createCourseProgressStore$/ }, args => ({ path: args.path.split('/').at(-1), namespace: 'stub' }));
    build.onLoad({ filter: /.*/, namespace: 'stub' }, args => ({ contents: {
      platform: 'export const Platform = {get OS(){return globalThis.__practicalOS;}};',
      storage: 'export default {async getItem(k){return globalThis.__practicalMemory.get(k)??null},async setItem(k,v){globalThis.__practicalMemory.set(k,v)}};',
      personalLearningSync: 'export const schedulePersonalLearningSync=()=>{};',
      learningChanges: 'export const notifyLearningChange=()=>{};export const positionTimestamp=()=>new Date().toISOString();',
      createCourseProgressStore: 'export const createCourseProgressStore=()=>({});',
    }[args.path] }));
  } }] });
  const mod = { exports: {} }; new Function('module', 'exports', result.outputFiles[0].text)(mod, mod.exports); return mod.exports;
}
module.exports = { modules };
