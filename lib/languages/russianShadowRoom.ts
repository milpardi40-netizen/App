import type { RussianCourseLesson } from './russian';
import { normalize, type Verb } from './russianGrammar/catalog';
import { studyExamples } from './russianGrammar/verbLesson';
import { trailFor } from './russianGrammar/trails';
import { requireActive, type TurnAudio } from './russianVoiceExchange';

export interface VoiceCard {
  lemma: string;
  meaning: string;
  form: string;
  text: string;
  fa: string;
  source: string;
}
export function verbVoiceCards(verb: Verb, band: number, lesson?: RussianCourseLesson): VoiceCard[] {
  const guide = trailFor(verb.lemma);
  const samples = studyExamples(verb, band, lesson).filter((s) => s.text.trim().includes(' '));
  if (!samples.length) {
    // The catalogue teaches these polite imperatives in isolation. Add an addressee
    // or complement so the spoken model actually puts the form into context.
    if (!['здравствовать', 'простить'].includes(verb.lemma))
      throw new Error(`Missing contextual example: ${verb.lemma}`);
    const greeting = verb.lemma === 'здравствовать';
    samples.push(
      greeting
        ? {
            text: 'Здра́вствуйте, А́нна!',
            fa: 'سلام، آنا!',
            form: 'Здра́вствуйте',
            source: 'مثال تکمیلی برای سلام رسمی',
          }
        : {
            text: 'Прости́те меня́, пожа́луйста.',
            fa: 'لطفاً مرا ببخشید.',
            form: 'Прости́те',
            source: 'مثال تکمیلی برای عذرخواهی',
          },
    );
  }
  return samples.map((s) => ({
    ...s,
    lemma: guide?.spoken ?? verb.lemma,
    meaning: guide?.meaning ?? verb.fa,
  }));
}
export type RoomPhase = 'verb' | 'sentence' | 'prompt' | 'ready' | 'listen';
export async function shadowCards(
  cards: VoiceCard[],
  start: number,
  audio: TurnAudio,
  signal: AbortSignal,
  show: (phase: RoomPhase, index: number, partial?: string) => void,
  accept: (heard: string) => void,
) {
  for (let i = start; i < cards.length; i++) {
    const c = cards[i];
    for (const [phase, line] of [
      ['verb', c.lemma],
      ['sentence', c.text],
      ['prompt', 'Повтори́те предложе́ние.'],
    ] as const) {
      requireActive(signal);
      show(phase, i);
      await audio.say(line, signal);
    }
    requireActive(signal);
    show('ready', i);
    const heard = await audio.listen(signal, [c.text.replace(/\u0301/g, '')], (partial) => {
      if (!signal.aborted) show('listen', i, partial);
    });
    requireActive(signal);
    if (!heard.trim()) throw new Error('صدایی ثبت نشد؛ همین جمله را دوباره تمرین کن.');
    accept(heard.trim());
  }
}
const words = (s: string) => normalize(s).match(/[\p{L}\p{N}]+/gu) ?? [];
/** Match token occurrences, not substrings. Separate order from omissions and additions. */
export function reviewLine(expected: string, heard: string) {
  const a = words(expected),
    b = words(heard),
    remaining = [...b],
    missing: string[] = [];
  for (const word of a) {
    const index = remaining.indexOf(word);
    if (index < 0) missing.push(word);
    else remaining.splice(index, 1);
  }
  const order = !missing.length && !remaining.length && a.join(' ') !== b.join(' ');
  return { missing, extra: remaining, order, matched: !order && !missing.length && !remaining.length };
}
