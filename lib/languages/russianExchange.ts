import { ALTERNATE_REPLIES } from './russianExchangeAlternatives';
import type { LearningLesson } from './types';
import { starterSocialEnd, starterStep } from './russianPreA1';

/** A move is an utterance, its *own* reply and the legal continuations from that reply.
 * Store the path, not a transcript or a script cursor. Nothing here requires a server or microphone. */
export interface Line { text: string; fa: string; pronunciation?: string; aliases?: readonly string[] }
export interface Move { say: Line; reply: Line; next: Move[] }
export interface Exchange { opening: Line; partnerFirst: Move[]; learnerFirst: Move[] }
export type ExchangePath = { starter: 'learner' | 'partner'; picks: number[]; said?: Record<string, string> };
const line = (text: string, fa: string, ...aliases: string[]): Line => ({ text, fa, aliases });
const move = (say: Line, reply: Line, ...next: Move[]): Move => ({ say, reply, next });
const welcome = line('Пожалуйста!', 'خواهش می‌کنم!');
const slower = line('Помедленнее, пожалуйста.', 'لطفاً آهسته‌تر.', 'можно помедленнее', 'скажите медленнее');
const repeat = line('Повторите, пожалуйста.', 'لطفاً تکرار کنید.', 'еще раз', 'можно еще раз', 'повтори');
const example = line('Можно пример?', 'یک مثال می‌زنید؟', 'приведите пример', 'можно другой пример');
const understood = line('Теперь понятно, спасибо.', 'حالا فهمیدم، ممنون.', 'все понятно', 'теперь понятно');

export function exchangeForLesson(lesson: LearningLesson): Exchange {
  const starter = starterStep(lesson.id);
  if (starter) {
    const paths = [0, 1].map(i => move(starter.oral[1 + i * 2], starter.oral[2 + i * 2],
      move(...starterSocialEnd(starter.id, i)), move(...starter.follow[i])));
    return { opening: starter.oral[0], partnerFirst: paths, learnerFirst: paths };
  }
  const [a, b, c, d, e] = lesson.dialogue;
  const [s, t] = lesson.sentences;
  const word = s.vocabulary[0].word.replace(/[.,?!]+$/, '');
  const about = line(`Как употребить «${word}»?`, `«${word}» را چطور به کار می‌بریم؟`);
  const sample = (v: Line) => line(`Например: ${v.text}`, `مثلاً: ${v.fa}`);
  const showExample = move(example, sample(t));
  const close = move(understood, welcome);
  if (lesson.id.startsWith('lab-')) {
    const pick = (sample: typeof s) => move(line(`Давайте разберём «${sample.vocabulary[0].word}».`, `بیایید «${sample.vocabulary[0].word}» را بررسی کنیم.`), sample,
      move(repeat, sample), close);
    const paths = [pick(s), pick(t)];
    return { opening: line('Какое слово разберём на примере?', 'کدام واژه را با مثال بررسی کنیم؟'), learnerFirst: paths, partnerFirst: paths };
  }
  const alt = ALTERNATE_REPLIES[lesson.id];
  const canonical = move(b, c, d && e ? move(d, e) : move(repeat, c), showExample);
  const retry = move(repeat, a, move(b, c), move(about, sample(s)));
  const alternative = alt ? move(line(alt[0], alt[1]), line(alt[2], alt[3]), move(slower, line(alt[2], alt[3])), close) : null;
  const partnerFirst = [canonical, ...(alternative ? [alternative] : []), retry];
  const learnerFirst = [move(a, b, d ? move(c, d) : move(slower, b), move(about, sample(s)))];
  // An independent request or statement also works as an opener. Don't start a scene with a
  // disconnected «yes/no» written as an answer to a question the partner never asked.
  if (alternative && /^(Я |Мы |У меня |У вас |Можно |Давайте |Какой |Что вы |На какое |Хотите )/u.test(alternative.say.text)) learnerFirst.push(alternative);
  learnerFirst.push(move(about, sample(s), move(slower, sample(s)), close));
  return { opening: a, partnerFirst, learnerFirst };
}

export function exchangeView(scene: Exchange, path: ExchangePath) {
  const history: { who: 'learner' | 'partner'; line: Line }[] = [];
  if (path.starter === 'partner') history.push({ who: 'partner', line: scene.opening });
  let options = path.starter === 'partner' ? scene.partnerFirst : scene.learnerFirst;
  for (const [n, i] of path.picks.entries()) {
    if (!Number.isInteger(i) || !options[i]) return null;
    const choice = options[i];
    const original = path.said?.[n];
    history.push({ who: 'learner', line: original ? { ...choice.say, text: original } : choice.say }, { who: 'partner', line: choice.reply });
    options = choice.next;
  }
  return { history, options, complete: options.length === 0 };
}
export function validExchangePath(scene: Exchange, raw: unknown): raw is ExchangePath {
  if (!raw || typeof raw !== 'object') return false;
  const p = raw as ExchangePath;
  if (!(p.starter === 'learner' || p.starter === 'partner') || !Array.isArray(p.picks) || p.picks.length > 2 || !exchangeView(scene, p)) return false;
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
const politeForm = (s: string) => plainRussian(s).replace(/(?:^| )пожалуйста(?= |$)/g, ' ').trim().replace(/\s+/g, ' ');
// Explicit short spoken equivalents. Don't accept arbitrary substrings or silently drop negation.
const SPOKEN: Record<string, string[]> = {
  'я хочу чай': ['чай', 'хочу чай', 'мне чай', 'можно чай'],
  'я хочу воду': ['воду', 'вода', 'хочу воду', 'мне воду', 'можно воду'],
  'это кот': ['кот'], 'это дом': ['дом'], 'я анна': ['анна', 'меня зовут анна'], 'я нина': ['нина', 'меня зовут нина'],
  'один': ['1'], 'два': ['2'], 'три': ['3'], 'четыре': ['4'], 'пять': ['5'], 'подъезд один': ['подъезд 1'], 'подъезд два': ['подъезд 2'],
};
export const replyPhrases = (say: Line) => [say.text, ...(say.aliases ?? []), ...(SPOKEN[plainRussian(say.text)] ?? [])];
/** Never guess from a single overlapping word (e.g. «не хочу чай» is NOT «хочу чай»). */
export function matchExchangeReply(input: string, options: readonly Move[]) {
  const typed = plainRussian(input), polite = politeForm(input);
  if (!typed) return -1;
  const hits = options.map(({ say }, i) => replyPhrases(say).some(text => plainRussian(text) === typed || (polite && politeForm(text) === polite)) ? i : -1).filter(i => i >= 0);
  return hits.length === 1 ? hits[0] : -1;
}
export function takeTurn(path: ExchangePath, index: number, original?: string): ExchangePath {
  return { ...path, picks: [...path.picks, index], ...(original ? { said: { ...path.said, [path.picks.length]: original.trim() } } : {}) };
}
