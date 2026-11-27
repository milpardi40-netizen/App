const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const ts = require('typescript');
const esbuild = require('esbuild');
const React = require('react');
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const handlerHashes = {
  'components/RussianLesson.tsx': '5e919c92cfd9281fac5ed3efb72d544b2c55f53d05907ba5051643e48b657414',
  'components/TurkishLesson.tsx': 'a61032187bbe049925306cfe04a571686f38066f6fed0cadcfcfeceb47898993',
  'components/StarterLesson.tsx': 'e271f14a0d07fb79e7014faf1628c469289492a69b733cb87387f389dca80e4f',
  'components/EnglishLessonRoute.tsx': '874449d95c054bcf922b96c8ac2bb2d5531a7bd331d49db92f91b94953814a3a',
  'components/arabic/ArabicLessonScreen.tsx': 'e85544ddf2316dcf6e8e8c00f678f9b9a55ca687be73f975cb182d821427163d',
};
(async () => {
  const result = await esbuild.build({ stdin: { contents: `export {SENTENCE_LESSONS as en} from './lib/courseContent';export {RUSSIAN_LESSONS as ru} from './lib/languages/russian';export {TURKISH_LESSONS as tr} from './lib/languages/turkish';export {ARABIC_LESSONS as ar} from './lib/arabic/content';export {NEW_COURSES} from './lib/languages/newCourses';`, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false, plugins: [{ name: 'content-only', setup(build) {
    build.onResolve({ filter: /createCourseProgressStore$/ }, () => ({ path: 'store', namespace: 'mock' }));
    build.onResolve({ filter: /starterSessions$/ }, () => ({ path: 'sessions', namespace: 'mock' }));
    build.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ contents: args.path === 'store' ? 'export const createCourseProgressStore=()=>({});' : 'export const createStarterSessions=()=>({});' }));
  } }] });
  const mod = { exports: {} }; new Function('module', 'exports', result.outputFiles[0].text)(mod, mod.exports);
  const inventory = Object.fromEntries(['en', 'ru', 'tr', 'ar', 'de', 'fr', 'es'].map(language => [language, mod.exports[language] || mod.exports.NEW_COURSES[language].lessons]));
  // Six-language Pre-A1 authoring is now authorised; retain the original protected-band and structural baselines.
  require('./helpers/practical-inventory.cjs').verifyScope(inventory);
  const names = ['speak', 'speakForTarget', 'skipSpeakingSentence', 'next', 'goToPreviousStage', 'goToPreviousSentence', 'restartListening'];
  const sources = {};
  for (const [file, expectedHash] of Object.entries(handlerHashes)) {
    const source = sources[file] = fs.readFileSync(file, 'utf8');
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const handlers = {}; let titles = 0, stageTitles = 0, stepperHeadings = 0, checks = 0;
    const stages = new Set();
    function visit(node) {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && names.includes(node.name.text)) handlers[node.name.text] = node.initializer.getText(ast);
      if (ts.isBinaryExpression(node) && node.left.getText(ast) === 'stage' && node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken && ts.isNumericLiteral(node.right)) stages.add(Number(node.right.text));
      if (ts.isJsxElement(node)) {
        const opening = node.openingElement.getText(ast);
        if (opening.includes('styles.stepperHeading')) stepperHeadings++;
        if (node.children.length === 1 && node.children[0].getText(ast) === '{lesson.title}') {
          if (opening.includes('styles.headerTitle')) titles++;
          if (opening.includes('styles.stageTitle')) stageTitles++;
        }
      }
      if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(ast) === 'SpeakCheck') checks++;
      ts.forEachChild(node, visit);
    }
    visit(ast);
    // Only the assessment denominator inside `next` changed, not navigation/speech control flow.
    if (file === 'components/EnglishLessonRoute.tsx') handlers.next = handlers.next.replace('englishEvidenceFor(lesson).length', 'CORE_LESSON_EVIDENCE[lesson.id]?.length ?? 2');
    // The Arabic A1 save stamps a content generation; navigation/speech logic is protected by the original hash.
    if (file === 'components/arabic/ArabicLessonScreen.tsx') handlers.next = handlers.next.replace("        ...(isArabicA1Core(lesson.id) ? {sampleRevision:arabicA1SentenceRevision(lesson.id),checksRevision:ARABIC_A1_ASSESSMENT_REVISION} : {}),\n", '');
    // Allow exactly the requested removal of the 7.5s narrator-to-microphone race.
    // Keep the original hash protecting EVERY other handler, stage and control.
    assert.ok(!handlers.speakForTarget.includes('setTimeout(armMic,'));
    assert.equal((handlers.speakForTarget.match(/Recognition starts only on playback completion\/error, never on an estimated duration\./g) || []).length, 1);
    handlers.speakForTarget = handlers.speakForTarget.replace(/^([ \t]*)\/\/ Recognition starts only on playback completion\/error, never on an estimated duration\.$/m,
      (_, indent) => `${indent}if (targetKey) {\n${indent}  narratorFallbackRef.current = setTimeout(armMic, Math.min(7500, Math.max(2400, text.length * 130)));\n${indent}}`);
    assert.equal(digest(handlers), expectedHash, file + ': narration, skip, forward/back navigation and restart handlers unchanged');
    assert.equal(titles, 1, file + ': lesson title retained in header');
    assert.equal(stageTitles, 0, file + ': no duplicate intro title');
    assert.equal(stepperHeadings, 0, file + ': no duplicate stage heading');
    assert.equal(checks, 3, file + ': main, shadowing and vocabulary microphone components retained');
    assert.deepEqual([...stages].filter(stage => stage < 10).sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], file + ': all ten stages retained');
    assert.ok(source.includes('<BlindListeningList') && source.includes('<LessonDialogueRoom') && source.includes('<LessonFinalHub'), file + ': listening, assessments and dialogue retained');
    assert.ok(source.includes('مرحلهٔ قبل') && source.includes('scheduleOnPass(result, () => { void next(); });'));
  }
  // These helpers serve main sentences AND shadowing. Hide normal only where a
  // same-rate sound button already exists; never remove shadowing's sole normal control.
  for (const [file, prefix, rates] of [
    ['components/EnglishLessonRoute.tsx', 'ENGLISH', [0.5, 1, 1.15]],
    ['components/arabic/ArabicLessonScreen.tsx', 'ARABIC', [0.55, 1, 1.08]],
  ]) {
    const source = sources[file];
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const helper = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text.endsWith('SpeechRateControls'));
    const code = ts.transpile(helper.getText(ast), { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 });
    const env = { React, View: 'View', Pressable: 'Pressable', Text: 'Text', Volume2: 'Volume2', styles: new Proxy({}, { get: (_, key) => key }), Palette: { primary: '#123456' }, [`${prefix}_SLOW_SPEECH_RATE`]: rates[0], [`${prefix}_NORMAL_SPEECH_RATE`]: rates[1], [`${prefix}_NATURAL_SPEECH_RATE`]: rates[2] };
    const Helper = new Function(...Object.keys(env), code + `;return ${helper.name.text};`)(...Object.values(env));
    for (const showNormal of [false, true]) {
      const played = [];
      const element = Helper({ onPlay: rate => played.push(rate), showNormal });
      const buttons = React.Children.toArray(element.props.children).filter(child => child.type === 'Pressable');
      assert.equal(buttons.length, showNormal ? 3 : 2);
      buttons.forEach(button => button.props.onPress());
      assert.deepEqual(played, showNormal ? rates : [rates[0], rates[2]], file + ': correct, distinct speeds replayed');
    }
    assert.ok(source.includes('SpeechRateControls showNormal={false} onPlay='), file + ': only main sentences hide duplicate normal');
  }
  const turkish = sources['components/TurkishLesson.tsx'];
  assert.ok(turkish.includes('rate = 0.78') && turkish.includes('const NORMAL_SPEECH_RATE = 0.85;') && turkish.includes('accessibilityLabel={`پخش معمولی ${unitLabel}`}'), 'Turkish normal control is not a duplicate: preserve both existing rates');
  assert.equal((sources['components/StarterLesson.tsx'].match(/پخش معمولی/g) || []).length, 1, 'German/French/Spanish keep normal in shadowing only');
  for (const file of ['components/RussianLesson.tsx', 'components/StarterLesson.tsx', 'components/TurkishLesson.tsx']) assert.ok(sources[file].includes('{sessionError || completionError}</Text>'), 'session error kept once next to retry');
  const total = Object.values(inventory).reduce((sum, lessons) => sum + lessons.length, 0);
  console.log(`Seven-language lesson UI checks passed: ${total} structurally preserved lessons, ten-stage render paths, protected control handlers plus the approved completion-only mic fix, duplicate-free headers, replay helper execution, Turkish rate exception and preserved independent practice.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
