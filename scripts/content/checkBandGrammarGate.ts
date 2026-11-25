/**
 * Self-check for the band grammar gate (bandGrammarGate.ts). Run via the stubbed pack tool:
 *   node scripts/content/packTool.mjs scripts/content/checkBandGrammarGate.ts
 */
import assert from 'node:assert/strict';
import { looksLikePastVerb, bandGrammarViolations } from './bandGrammarGate';

let checks = 0;
const check = (condition: boolean, message: string) => { assert.ok(condition, message); checks += 1; };

// Past-tense verbs (regular) are rejected through the reconstructed infinitive.
for (const word of ['читал', 'делала', 'был', 'были', 'было', 'занималась', 'видели', 'хотел', 'жил', 'сказал', 'пела', 'думал']) {
  check(looksLikePastVerb(word, 'ru'), `past verb is rejected: ${word}`);
}
// Concrete nouns and non-past verb forms stay allowed despite ending in -л/-ла/-ли.
for (const word of ['стол', 'стул', 'пенал', 'школа', 'канал', 'мама', 'делаю', 'читает', 'или', 'ли', 'угол', 'молоко', 'хорошо']) {
  check(!looksLikePastVerb(word, 'ru'), `non-past word stays allowed: ${word}`);
}
check(!looksLikePastVerb('was', 'en'), 'the past detector is Russian-specific');

// Band gates.
check(bandGrammarViolations('ru', 'pre', 'Я хотел чай.').length === 1, 'pre: past verb is flagged');
check(bandGrammarViolations('ru', 'pre', 'Это мама и папа.').length === 0, 'pre: clean sentence passes');
check(bandGrammarViolations('ru', 'pre', 'Стол и стул здесь.').length === 0, 'pre: -л nouns pass');
check(bandGrammarViolations('ru', 'pre', 'Если будет дождь…').length === 1, 'pre: если is flagged');
check(bandGrammarViolations('ru', 'pre', 'Мы были дома.').length === 1, 'pre: были is flagged');
check(bandGrammarViolations('ru', 'pre', 'Она могла остаться.').length > 0, 'pre: irregular past могла is flagged by the explicit list');
check(bandGrammarViolations('ru', 'A1', 'Это более интересно.').length === 1, 'A1: более is flagged');
check(bandGrammarViolations('ru', 'A1', 'Я читал книгу.').length === 0, 'A1: past tense is allowed (taught at A1)');
check(bandGrammarViolations('ru', 'A1', 'Если хочешь, приходи.').length === 0, 'A1: если is allowed (measured by the beginner core)');
check(bandGrammarViolations('en', 'pre', 'I was here.').length === 0, 'the gate only applies to the language that declares a ladder');
check(bandGrammarViolations('ru', 'B2', 'Он был более чем готов.').length === 0, 'bands without a gate entry pass through');

console.log(`${checks} band-grammar-gate checks passed.`);
