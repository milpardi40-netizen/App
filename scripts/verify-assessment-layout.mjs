#!/usr/bin/env node
/**
 * «سنجش کوتاه» layout audit — one centred, evenly sized assessment page in all six languages.
 *
 * The German/French/Spanish, Russian, Turkish and English lessons each used to carry their own copy of
 * the assessment styles: right-aligned prompts, left-aligned Latin choices, cards whose height followed
 * the length of the text. They now share `components/assessmentLayout.ts` (plus the `centered` variant of
 * the English task card), and this script keeps them from drifting apart again.
 *
 * Run: npm run validate:assessment
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let checks = 0;
const check = (value, message) => { assert.ok(value, message); checks++; };

/* ── the shared layout ────────────────────────────────────────────────────────────────────────── */

const layout = read('components/assessmentLayout.ts');
check(/export const ASSESSMENT_MAX_WIDTH/.test(layout), 'the page has one shared maximum width');
check(/export const ASSESSMENT_CARD_MIN_HEIGHT/.test(layout) && /export const ASSESSMENT_CHOICE_MIN_HEIGHT/.test(layout),
  'question cards and choices have one shared minimum height, so cards are evenly sized');
check(/export const assessmentStyles = StyleSheet\.create\(/.test(layout), 'the shared layout is a real StyleSheet');
check(!/textAlign:\s*'(right|left)'/.test(layout), 'every text run in the assessment is centred');
check(/alignSelf:\s*'center'/.test(layout), 'the assessment column is centred in the page');
check(/choice:\s*\{[\s\S]*?minHeight: ASSESSMENT_CHOICE_MIN_HEIGHT/.test(layout), 'every choice has the same height');
check(/question:\s*\{[\s\S]*?minHeight: ASSESSMENT_CARD_MIN_HEIGHT/.test(layout), 'every question card has the same height');

/* ── every language uses it ───────────────────────────────────────────────────────────────────── */

// German/French/Spanish and Russian/Turkish render their checks inside their own lesson component.
for (const file of ['components/StarterLesson.tsx', 'components/RussianLesson.tsx', 'components/TurkishLesson.tsx']) {
  const source = read(file);
  check(/from '@\/components\/assessmentLayout'/.test(source), `${file} imports the shared assessment layout`);
  check(/\.\.\.assessmentStyles/.test(source), `${file} applies the shared layout to its assessment block`);
  // The spread must come last, otherwise a local style would win again.
  const spread = source.lastIndexOf('...assessmentStyles');
  check(spread > source.indexOf('const styles = { ...StyleSheet.create({'), `${file} applies the shared layout after its own styles`);
  check(/styles\.evidenceCard/.test(source) && /styles\.questionPrompt/.test(source), `${file} still renders the same assessment markup`);
}

// Every language's lesson shell is the same centred page.
for (const file of ['components/StarterLesson.tsx', 'components/RussianLesson.tsx', 'components/TurkishLesson.tsx', 'components/EnglishLessonRoute.tsx']) {
  check(/LessonFinalHub/.test(read(file)), `${file} renders the shared, centred assessment shell`);
}
const hub = read('components/LessonFinalHub.tsx');
check(/ASSESSMENT_MAX_WIDTH/.test(hub), 'the shell caps the page at the shared width');
check(/stageTitle: \{[^}]*textAlign: 'center'/.test(hub) && /stageDesc: \{[^}]*textAlign: 'center'/.test(hub),
  'the stage title and its one-line hint are centred');

// English: the evidence page and its task cards follow the same column.
const evidence = read('components/EnglishLessonEvidence.tsx');
check(/ASSESSMENT_MAX_WIDTH/.test(evidence) && /styles\.column/.test(evidence), 'the English assessment uses the shared centred column');
const centeredTasks = (evidence.match(/<EnglishSupplementTask[^>]*centered/g) ?? []).length;
const allTasks = (evidence.match(/<EnglishSupplementTask/g) ?? []).length;
check(allTasks > 0 && centeredTasks === allTasks, 'every English assessment card uses the centred variant');
const supplement = read('components/EnglishSupplementTask.tsx');
check(/centered\?: boolean/.test(supplement), 'the English task card exposes the centred assessment variant');
check(/const assessment = StyleSheet\.create\(\{/.test(supplement), 'the centred variant is a shared style block');
check(/taskCard: \{[^}]*minHeight: 148/.test(supplement) && /option: \{[^}]*justifyContent: 'center'/.test(supplement),
  'English task cards and their options share one size');

/* ── the extra practice block that sits under the assessment ─────────────────────────────────── */

const extra = read('components/StarterExtraPractice.tsx');
check(!/textAlign:'right'/.test(extra) && !/textAlign: 'right'/.test(extra), 'the extra practice card under the assessment is centred too');

console.log('Assessment layout — one centred, evenly sized page in all six languages\n');
for (const [language, where] of [
  ['German', 'StarterLesson + LessonFinalHub'],
  ['French', 'StarterLesson + LessonFinalHub'],
  ['Spanish', 'StarterLesson + LessonFinalHub'],
  ['Russian', 'RussianLesson + LessonFinalHub'],
  ['Turkish', 'TurkishLesson + LessonFinalHub'],
  ['English', 'EnglishLessonRoute + EnglishLessonEvidence (centred task cards)'],
]) console.log(`  ${language.padEnd(8)} ${where}`);
console.log('\n  page    centred column, max width ' + (/ASSESSMENT_MAX_WIDTH = (\d+)/.exec(layout)?.[1] ?? '?') + 'px');
console.log('  cards   every question card ≥ ' + (/ASSESSMENT_CARD_MIN_HEIGHT = (\d+)/.exec(layout)?.[1] ?? '?') + 'px, vertically centred inside');
console.log('  choices equal height ≥ ' + (/ASSESSMENT_CHOICE_MIN_HEIGHT = (\d+)/.exec(layout)?.[1] ?? '?') + 'px, centred labels');
console.log(`\n${checks} assessment-layout checks passed.`);
