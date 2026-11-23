/**
 * Shared structure-to-content engine for the Sentence Building («ساخت جمله») stage
 * across all six courses (English, Russian, Turkish, German, French, Spanish) and
 * every CEFR band (Pre-A1 through C1).
 *
 * Pure TypeScript (no React Native dependencies) so it can be verified directly
 * against all 1,400+ shipped lessons.
 */

export interface SentencePiece {
  id: number;
  /** Clickable surface shown on the tile (surrounding punctuation stripped so position isn't leaked). */
  label: string;
  /** Original raw token(s) including punctuation, restored when previewing/speaking the built sentence. */
  raw: string;
  /** Normalized comparison key (case-folded, stress marks & punctuation removed). */
  key: string;
  /** True when this piece contains at least one vocabulary anchor taught in this sentence. */
  isAnchor?: boolean;
}

export interface VocabularyAnchor {
  word: string;
  meaning: string;
}

export interface BridgeCue {
  title: string;
  summary: string;
}

export interface SentenceStructureSummary {
  patternLabel: string;
  explanationFa?: string;
  bridge?: BridgeCue;
  anchors: VocabularyAnchor[];
  clauseHintFa?: string;
}

export interface SentenceDiagnosis {
  complete: boolean;
  correct: boolean;
  matchedPrefix: number;
  slotStates: Array<'ok' | 'wrong'>;
  nextExpected?: string;
  feedbackFa: string;
}

const LEAD_PUNCT = /^[¿¡«„“"'(]+/;
const TRAIL_PUNCT = /[.,!?;:…»“"')؟،؛]+$/;

/** Strip combining stress marks (e.g. Russian а́), Arabic harakat, and surrounding punctuation for fair order comparison. */
export function normalizeBuilderToken(value: string): string {
  return value
    .normalize('NFC')
    .replace(/[\u0300\u0301\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىی]/g, 'ي')
    .replace(/ک/g, 'ك')
    .replace(/ё/g, 'е')
    .replace(/[’‘`]/g, "'")
    .toLocaleLowerCase()
    .replace(/^[¿¡«„“"'(\s]+|[.,!?;:…»“"')؟،؛\s]+$/g, '')
    .trim();
}

export function stripTilePunctuation(raw: string): string {
  const cleaned = raw.replace(LEAD_PUNCT, '').replace(TRAIL_PUNCT, '').trim();
  return cleaned || raw.trim();
}

export function normalizeSentenceOrder(value: string): string {
  return value
    .split(/\s+/)
    .map(normalizeBuilderToken)
    .filter(Boolean)
    .join(' ');
}

const CLAUSE_BREAKERS = new Set([
  // English
  'because', 'although', 'though', 'however', 'while', 'when', 'where', 'if', 'unless', 'until', 'since', 'after', 'before', 'which', 'that', 'so', 'but', 'and',
  // Russian
  'потому', 'поскольку', 'так', 'чтобы', 'когда', 'пока', 'если', 'хотя', 'однако', 'поэтому', 'который', 'которая', 'которое', 'которые', 'но', 'а', 'и',
  // German
  'weil', 'obwohl', 'wenn', 'als', 'dass', 'ob', 'deshalb', 'trotzdem', 'während', 'bevor', 'nachdem', 'aber', 'denn', 'und', 'sondern',
  // French
  'parce', 'puisque', 'quand', 'lorsque', 'si', 'bien', 'cependant', 'donc', 'mais', 'et', 'qui', 'que', 'pour',
  // Spanish
  'porque', 'aunque', 'cuando', 'si', 'sin', 'por', 'pero', 'y', 'que', 'para',
  // Turkish
  'çünkü', 'ama', 'fakat', 'ancak', 'eğer', 'rağmen', 'için', 've', 'veya', 'ki',
  // Arabic
  'لأن', 'لان', 'ولكن', 'لكن', 'عندما', 'إذا', 'اذا', 'لو', 'بينما', 'حتى', 'ثم', 'أو', 'او', 'الذي', 'التي',
]);

function matchesVocabulary(label: string, anchors: readonly VocabularyAnchor[]): boolean {
  const normLabel = normalizeBuilderToken(label);
  if (!normLabel) return false;
  return anchors.some(anchor => {
    const words = anchor.word.split(/\s+/).map(normalizeBuilderToken).filter(Boolean);
    return words.some(w => w.length >= 2 && (normLabel === w || (w.length >= 4 && normLabel.startsWith(w.slice(0, 4)))));
  });
}

/**
 * Word-level tokenization: every word is one clickable tile, with trailing/leading punctuation
 * stripped from `label` (so punctuation never leaks which word is last or mid-clause) while
 * `raw` preserves the original token for clean sentence display & TTS playback.
 */
export function buildWordPieces(text: string, anchors: readonly VocabularyAnchor[] = []): SentencePiece[] {
  const rawTokens = text.trim().split(/\s+/).filter(Boolean);
  return rawTokens.map((raw, id) => {
    const label = stripTilePunctuation(raw);
    return {
      id,
      label,
      raw,
      key: normalizeBuilderToken(label),
      isAnchor: matchesVocabulary(label, anchors),
    };
  });
}

/**
 * Syntax/clause chunk tokenization for longer sentences (typically 8+ words at A2–C1):
 * groups adjacent words into 4–7 structural chunks along punctuation breaks, clause connectors,
 * and taught multi-word vocabulary collocations so learners practice clause assembly rather than
 * hunting through 15 isolated words.
 */
export function buildChunkPieces(text: string, anchors: readonly VocabularyAnchor[] = []): SentencePiece[] {
  const rawTokens = text.trim().split(/\s+/).filter(Boolean);
  if (rawTokens.length < 7) return buildWordPieces(text, anchors);

  // Build spans for multi-word vocabulary collocations so they stay intact when possible.
  const normTokens = rawTokens.map(normalizeBuilderToken);
  const keepTogetherAfter = new Set<number>();
  for (const anchor of anchors) {
    const anchorTokens = anchor.word.split(/\s+/).map(normalizeBuilderToken).filter(Boolean);
    if (anchorTokens.length < 2) continue;
    for (let i = 0; i <= normTokens.length - anchorTokens.length; i += 1) {
      if (anchorTokens.every((tok, off) => normTokens[i + off] === tok)) {
        for (let off = 0; off < anchorTokens.length - 1; off += 1) keepTogetherAfter.add(i + off);
      }
    }
  }

  const groups: string[][] = [];
  let current: string[] = [];
  for (let i = 0; i < rawTokens.length; i += 1) {
    const raw = rawTokens[i];
    const clean = normalizeBuilderToken(raw);
    const startsClause = current.length >= 2 && !keepTogetherAfter.has(i - 1) && CLAUSE_BREAKERS.has(clean);
    if (startsClause) {
      groups.push(current);
      current = [raw];
      continue;
    }
    current.push(raw);
    const endsClause = /[,.;:!?…]$/.test(raw);
    const maxChunk = keepTogetherAfter.has(i) ? 4 : 3;
    const remaining = rawTokens.length - (i + 1);
    if ((endsClause || current.length >= maxChunk) && !keepTogetherAfter.has(i) && remaining >= 2) {
      groups.push(current);
      current = [];
    }
  }
  if (current.length) groups.push(current);

  if (groups.length < 3) return buildWordPieces(text, anchors);

  return groups.map((group, id) => {
    const raw = group.join(' ');
    const stripped = group.map((tok, idx) => {
      let out = tok;
      if (idx === 0) out = out.replace(LEAD_PUNCT, '');
      if (idx === group.length - 1) out = out.replace(TRAIL_PUNCT, '');
      return out;
    }).join(' ').trim() || raw;
    return {
      id,
      label: stripped,
      raw,
      key: normalizeSentenceOrder(stripped),
      isAnchor: group.some(tok => matchesVocabulary(tok, anchors)),
    };
  });
}

/** Deterministic non-trivial scramble seeded by sentence ID so tiles never start in the solved order. */
export function scrambleSentencePieces(pieces: readonly SentencePiece[], seedId: string): SentencePiece[] {
  const list = [...pieces];
  if (list.length < 2) return list;
  let seed = [...seedId].reduce((sum, ch) => sum + ch.charCodeAt(0), 31);
  for (let i = list.length - 1; i > 0; i -= 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = seed % (i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  const sameOrder = list.every((item, idx) => item.key === pieces[idx].key);
  if (sameOrder) {
    const distinctIdx = list.findIndex((item, idx) => item.key !== list[0].key);
    if (distinctIdx > 0) [list[0], list[distinctIdx]] = [list[distinctIdx], list[0]];
    else if (list.length >= 2) [list[0], list[list.length - 1]] = [list[list.length - 1], list[0]];
  }
  return list;
}

export function formatBuiltSentence(pieces: readonly SentencePiece[], chosenIds: readonly number[]): string {
  const byId = new Map(pieces.map(p => [p.id, p]));
  return chosenIds
    .map(id => byId.get(id)?.raw ?? '')
    .filter(Boolean)
    .join(' ')
    .replace(/\s+([,.;:!?…])/g, '$1')
    .trim();
}

function deriveSyntacticOutline(text: string, anchors: readonly VocabularyAnchor[]): string {
  const trimmed = text.trim();
  const isQuestion = /[?؟]\s*$/.test(trimmed);
  const words = trimmed.split(/\s+/).filter(Boolean);
  const connectors = words.filter(w => CLAUSE_BREAKERS.has(normalizeBuilderToken(w)));
  if (connectors.length > 0 && words.length >= 6) {
    return isQuestion
      ? `ساختار پرسشی مرکب با پیوند «${stripTilePunctuation(connectors[0])}»`
      : `ساختار دو‌بخشی با پیوند «${stripTilePunctuation(connectors[0])}»`;
  }
  if (isQuestion) {
    return `پرسش (${stripTilePunctuation(words[0] ?? '')} … ?)`;
  }
  if (anchors.length >= 2) {
    return `${anchors[0].word} + … + ${anchors[1].word}`;
  }
  if (anchors.length === 1) {
    return `جمله پیرامون «${anchors[0].word}»`;
  }
  return words.length <= 3 ? 'عبارت یا جملهٔ کوتاه' : 'ترتیب طبیعی جمله (فاعل / خبر / تکمیل‌کننده)';
}

function firstUsefulNoteLine(note?: string): string | undefined {
  if (!note) return undefined;
  const line = note
    .split(/\n+/)
    .map(part => part.trim())
    .find(part => part.length >= 10 && !/^(خواندن|نوشتن|تمرین گفتاری):/.test(part));
  if (!line) return undefined;
  return line.length > 170 ? `${line.slice(0, 167)}…` : line;
}

/**
 * Connects a sentence's structural pattern, grammar explanation, Persian bridge rule,
 * and vocabulary anchors into one coherent summary card inside «ساخت جمله».
 */
export function buildSentenceStructureSummary(input: {
  text: string;
  pattern?: string;
  explanation?: string;
  bridge?: BridgeCue;
  lessonNote?: string;
  vocabulary?: readonly VocabularyAnchor[];
}): SentenceStructureSummary {
  const anchors = (input.vocabulary ?? []).filter(v => v.word.trim() && v.meaning.trim()).slice(0, 4);
  const patternLabel = input.pattern?.trim() || deriveSyntacticOutline(input.text, anchors);
  const explanationFa = input.explanation?.trim() || (!input.pattern ? firstUsefulNoteLine(input.lessonNote) : firstUsefulNoteLine(input.lessonNote));
  const trimmed = input.text.trim();
  const connector = trimmed.split(/\s+/).find(w => CLAUSE_BREAKERS.has(normalizeBuilderToken(w)));
  const clauseHintFa = connector && trimmed.split(/\s+/).length >= 7
    ? `دقت کن بخش دوم پس از پیوند «${stripTilePunctuation(connector)}» می‌آید.`
    : /[?؟]\s*$/.test(trimmed)
      ? 'این نمونه پرسشی است؛ به جایگاه واژهٔ پرسشی و فعل دقت کن.'
      : undefined;
  return {
    patternLabel,
    explanationFa,
    bridge: input.bridge,
    anchors,
    clauseHintFa,
  };
}

/**
 * Slot-by-slot evaluation of the learner's built sequence against the target pieces.
 * Provides concrete structural feedback pinpointing the exact mismatch position.
 */
export function diagnoseSentenceBuild(
  targetPieces: readonly SentencePiece[],
  chosenPieces: readonly SentencePiece[],
  patternLabel?: string,
): SentenceDiagnosis {
  const slotStates: Array<'ok' | 'wrong'> = [];
  let matchedPrefix = 0;
  let prefixIntact = true;
  for (let i = 0; i < chosenPieces.length; i += 1) {
    const target = targetPieces[i];
    const ok = !!target && chosenPieces[i].key === target.key;
    slotStates.push(ok ? 'ok' : 'wrong');
    if (ok && prefixIntact) matchedPrefix += 1;
    else prefixIntact = false;
  }

  const complete = chosenPieces.length === targetPieces.length;
  const correct = complete && slotStates.every(s => s === 'ok');
  const nextExpected = targetPieces[matchedPrefix]?.label;

  if (correct) {
    return {
      complete: true,
      correct: true,
      matchedPrefix,
      slotStates,
      feedbackFa: 'دقیقاً درست ساخته شد! ساختار و ترتیب جمله کامل است.',
    };
  }

  if (!chosenPieces.length) {
    return {
      complete: false,
      correct: false,
      matchedPrefix: 0,
      slotStates: [],
      nextExpected,
      feedbackFa: 'هنوز هیچ واژه‌ای انتخاب نشده است.',
    };
  }

  if (matchedPrefix === chosenPieces.length && !complete) {
    return {
      complete: false,
      correct: false,
      matchedPrefix,
      slotStates,
      nextExpected,
      feedbackFa: `تا اینجا درست است (${matchedPrefix} بخش). هنوز ${targetPieces.length - chosenPieces.length} بخش دیگر باقی مانده است.`,
    };
  }

  const firstMismatchPos = matchedPrefix + 1;
  const wrongLabel = chosenPieces[matchedPrefix]?.label ?? '';
  const hintTail = patternLabel ? ` به الگوی «${patternLabel}» دقت کن.` : '';
  return {
    complete,
    correct: false,
    matchedPrefix,
    slotStates,
    nextExpected,
    feedbackFa: matchedPrefix === 0
      ? `آغاز جمله با «${wrongLabel}» نیست؛ جایگاه اول را بردار و با توجه به ساختار جمله دوباره بچین.${hintTail}`
      : `تا بخش ${matchedPrefix} درست است، اما در جایگاه ${firstMismatchPos} به‌جای «${wrongLabel}» باید نقش بعدی بیاید.${hintTail}`,
  };
}
