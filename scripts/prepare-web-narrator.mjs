// Keep the optional browser voice out of Metro, the initial JS download and native APKs.
import { copyFileSync, mkdirSync } from 'node:fs';
const from = new URL('../node_modules/espeak-ng/', import.meta.url);
const to = new URL('../public/narration/engine/', import.meta.url);
mkdirSync(to, { recursive: true });
for (const file of ['dist/espeak-ng.js', 'dist/espeak-ng.wasm', 'LICENSE', 'README.md']) {
  copyFileSync(new URL(file, from), new URL(file.split('/').pop(), to));
}
