import type { LearningLesson } from './types';

/** A move is an utterance, its *own* reply and the legal continuations from that reply.
 * Store the path, not a transcript or a script cursor. Nothing here requires a server or microphone. */
export interface Line { text: string; fa: string; pronunciation?: string }
export interface Move { say: Line; reply?: Line; next: Move[] }
export interface Exchange { opening: Line; partnerFirst: Move[]; learnerFirst: Move[] }
export type ExchangePath = { starter: 'learner' | 'partner'; picks: number[]; said?: Record<string, string> };
// No phrase bank or generated fallback: every model and reply is an actual line
// already available in this lesson. The last learner line may close the scene itself.
function script(lines: readonly Line[], i: number): Move[] {
  return i >= lines.length ? [] : [{ say: lines[i], reply: lines[i + 1], next: script(lines, i + 2) }];
}
export function exchangeForLesson(lesson: LearningLesson): Exchange {
  const lines = lesson.dialogue;
  // Some supplementary labs repeat the same two recorded lines verbatim. Play that exchange once.
  const local = lines.length === 4 && lines[0].text === lines[2].text && lines[1].text === lines[3].text
    ? lines.slice(0, 2) : lines;
  return { opening: local[0], learnerFirst: script(local, 0), partnerFirst: script(local, 1) };
}

export function exchangeView(scene: Exchange, path: ExchangePath) {
  const history: { who: 'learner' | 'partner'; line: Line; heard?: string }[] = [];
  if (path.starter === 'partner') history.push({ who: 'partner', line: scene.opening });
  let options = path.starter === 'partner' ? scene.partnerFirst : scene.learnerFirst;
  for (const [n, i] of path.picks.entries()) {
    if (!Number.isInteger(i) || !options[i]) return null;
    const choice = options[i];
    const original = path.said?.[n];
    history.push({ who: 'learner', line: choice.say, ...(original ? { heard: original } : {}) });
    if (choice.reply) history.push({ who: 'partner', line: choice.reply });
    options = choice.next;
  }
  return { history, options, complete: options.length === 0 };
}
export function validExchangePath(scene: Exchange, raw: unknown): raw is ExchangePath {
  if (!raw || typeof raw !== 'object') return false;
  const p = raw as ExchangePath;
  if (!(p.starter === 'learner' || p.starter === 'partner') || !Array.isArray(p.picks) || !exchangeView(scene, p)) return false;
  if (p.said === undefined) return true;
  if (!p.said || typeof p.said !== 'object' || Array.isArray(p.said)) return false;
  return Object.entries(p.said).every(([k, v]) => {
    const i = Number(k);
    if (String(i) !== k || !Number.isInteger(i) || i < 0 || i >= p.picks.length || typeof v !== 'string' || v.length > 350) return false;
    const before = exchangeView(scene, { starter: p.starter, picks: p.picks.slice(0, i) });
    return !!before && matchExchangeReply(v, before.options) === p.picks[i];
  });
}
export const plainRussian = (s: string) => s.toLowerCase().replace(/\u0301/g, '').replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
export const replyPhrases = (say: Line) => [say.text];
/** Never guess from a single overlapping word (e.g. «не хочу чай» is NOT «хочу чай»). */
export function matchExchangeReply(input: string, options: readonly Move[]) {
  const typed = plainRussian(input);
  if (!typed) return -1;
  const hits = options.map(({ say }, i) => replyPhrases(say).some(text => plainRussian(text) === typed) ? i : -1).filter(i => i >= 0);
  return hits.length === 1 ? hits[0] : -1;
}
export function takeTurn(path: ExchangePath, index: number, original?: string): ExchangePath {
  return { ...path, picks: [...path.picks, index], ...(original ? { said: { ...path.said, [path.picks.length]: original.trim() } } : {}) };
}
