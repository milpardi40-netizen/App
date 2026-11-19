// Check the shipped curriculum rather than guessing which source files or builders it uses.
const {execFileSync} = require('node:child_process');
const path = require('node:path');
const assert = require('node:assert/strict');
const db = JSON.parse(execFileSync(process.execPath,[path.resolve(__dirname,'content/russian-grammar/export-corpus.cjs'),'--sentences'],{encoding:'utf8'}));
const seen = new Set();
for(const {id,text,fa,pronunciation} of db) {
  assert(!seen.has(id), id); seen.add(id);
  assert(/[А-ЯЁа-яё]/.test(text) && fa.trim() && pronunciation?.trim() && (id.startsWith('lab-') || !/[А-ЯЁа-яёA-Za-z]/.test(pronunciation)), `${id}: ${text} / ${pronunciation}`);
}
console.log(`Validated IDs, Russian, translations and pronunciations for ${db.length} shipped sentences.`);
