/**
 * Pure speech-scoring helpers shared by SpeakCheck / SpeakDrill (kept free of React Native so they are unit-testable).
 */

/** Strip combining stress/accent marks (e.g. Russian «Ира́на») for clean text comparison. */
export function stripStressMarks(text: string): string {
  return text.replace(/[\u0300\u0301]/g, '').replace(/ё/g, 'е');
}

/** Normalise a token for comparison: lower-case, strip punctuation and diacritics that recognisers often drop. */
export function tokens(text: string) {
  return text
    .toLowerCase()
    // Lesson text carries stress/accent marks as combining characters (Russian «Ира́на», French «é» typed as e + ´),
    // and Arabic educational text carries harakat/tashkeel (\u064B-\u065F, \u0670) that STT engines omit.
    // Strip Arabic diacritics and fold Arabic/Persian keyboard variants (أإآٱ -> ا, ة -> ه, ىی -> ي, ک -> ك) cleanly.
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىی]/g, 'ي')
    .replace(/ک/g, 'ك')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ç/g, 's')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ё/g, 'е')
    .replace(/[’'`´؟،؛]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Loose phonetic key: recognisers often return a homophone or a spelling variant for very
 * short words (German «Tee» → "T", "The", "Te"; «Ei» → "Ай"; Turkish «ı/i», «ğ», «ş»; French/Spanish accents).
 */
function phonetic(word: string) {
  return word
    // German, Turkish, Spanish, French folds
    .replace(/äu|eu/g, 'oy')
    .replace(/ei|ai/g, 'ay')
    .replace(/tsch/g, 'c')
    .replace(/sch/g, 's')
    .replace(/ä/g, 'e')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ñ/g, 'n')
    // Russian Cyrillic close-sound folds (soft signs, й/и, щ/ш)
    .replace(/[ьъ]/g, '')
    .replace(/щ/g, 'ш')
    .replace(/й/g, 'и')
    // Common Latin phonetic folds
    .replace(/ph/g, 'f')
    .replace(/th/g, 't')
    .replace(/ck/g, 'k')
    .replace(/c(?=[eiy])/g, 's')
    .replace(/[cq]/g, 'k')
    .replace(/z/g, 's')
    .replace(/y/g, 'i')
    .replace(/w/g, 'v')
    .replace(/v/g, 'f')
    .replace(/h/g, '')
    .replace(/(.)\1+/g, '$1');
}

function similarity(a: string, b: string) {
  if (a === b) return 1;
  const m = a.length, n = b.length;
  if (!m || !n) return 0;
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...new Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
}

export type SpeakWordState = 'ok' | 'near' | 'miss';
export type SpeakCheckResult = { score: number; words: { word: string; ok: boolean; state: SpeakWordState; heard?: string }[]; heard: string };

/** Compare the recognised transcript with the target sentence; marks each expected word as matched or missed. */
export function scoreSpeech(target: string, heard: string): SpeakCheckResult {
  const expected = target.trim().split(/\s+/).filter(Boolean);
  const pool = tokens(heard);
  // Also include adjacent token bigrams so apostrophe splits like French "j' aime" or "c' est" match "jaime" / "cest".
  const bigrams: Array<{ text: string; i: number; j: number }> = [];
  for (let i = 0; i < pool.length - 1; i += 1) {
    if (pool[i].length <= 2) {
      bigrams.push({ text: `${pool[i]}${pool[i + 1]}`, i, j: i + 1 });
    }
  }
  const used = new Set<number>();
  const joined = pool.join('');
  const words = expected.map(raw => {
    const want = tokens(raw)[0] ?? '';
    if (!want) return { word: raw, ok: true, state: 'ok' as SpeakWordState };
    const wantKey = phonetic(want);
    let best = -1, bestSecond = -1, bestScore = 0, bestGot = '';
    pool.forEach((got, index) => {
      if (used.has(index)) return;
      const s = Math.max(similarity(want, got), similarity(wantKey, phonetic(got)));
      if (s > bestScore) { bestScore = s; best = index; bestSecond = -1; bestGot = got; }
    });
    for (const bg of bigrams) {
      if (used.has(bg.i) || used.has(bg.j)) continue;
      const s = Math.max(similarity(want, bg.text), similarity(wantKey, phonetic(bg.text)));
      if (s > bestScore) { bestScore = s; best = bg.i; bestSecond = bg.j; bestGot = bg.text; }
    }
    // Short words are the hardest for recognisers: accept a close phonetic match, and for a
    // single-word target also accept the whole transcript run together ("te e" → "tee").
    const short = wantKey.length <= 3;
    const gotKey = best >= 0 ? phonetic(bestGot) : '';
    let ok = bestScore >= (short ? 0.75 : want.length <= 5 ? 0.67 : 0.75)
      || (short && bestScore >= 0.5 && gotKey[0] === wantKey[0] && gotKey.length <= wantKey.length + 1);
    if (!ok && expected.length === 1 && joined) {
      const joinedScore = Math.max(similarity(want, joined), similarity(wantKey, phonetic(joined)));
      ok = joinedScore >= 0.75 || (joinedScore >= 0.6 && phonetic(joined)[0] === wantKey[0]);
    }
    if (ok && best >= 0) {
      used.add(best);
      if (bestSecond >= 0) used.add(bestSecond);
    }
    // «near»: something was said in that slot and it resembles the target (same first sound or ≥ 45% similar) — pronunciation off, not skipped.
    const near = !ok && best >= 0 && (bestScore >= 0.45 || (gotKey[0] === wantKey[0] && bestScore >= 0.3));
    return { word: raw, ok, state: (ok ? 'ok' : near ? 'near' : 'miss') as SpeakWordState, heard: best >= 0 ? bestGot : undefined };
  });
  const scored = words.filter(w => tokens(w.word).length);
  const score = scored.length ? Math.round((scored.filter(w => w.ok).length / scored.length) * 100) : 0;
  return { score, words, heard: heard.trim() };
}
