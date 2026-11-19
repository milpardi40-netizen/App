import byBand from './examplesByBand.generated.json';
import { gapFor, lessonExample, normalize, VERBS, type Verb } from './catalog';
import { GRAMMAR_BANDS } from './units';
import { trailFor, type Rung } from './trails';
import type { LearningLesson } from '../types';
import { shuffleChecks } from '../../shuffleChecks';

type Sample = Verb['examples'][number];
export interface StudyExample extends Sample {
  source: string;
  guide?: Rung;
}
export const BAND_SKILLS = [
  'شنیدن و شناختن',
  'دیدن شکل فعل',
  'پیدا کردن مصدر',
  'ساختن جمله',
  'فهم دقیق پیام',
  'بازیابی بدون گزینه',
];
export function studyExamples(
  verb: Verb,
  band: number,
  lesson?: LearningLesson & { levelId: number },
): StudyExample[] {
  const examples: StudyExample[] = [];
  const local = lesson && band === lesson.levelId ? lessonExample(verb, lesson) : undefined;
  if (local) examples.push({ ...local, source: 'از همین درس' });
  const guide = trailFor(verb.lemma)?.rungs[band];
  if (guide)
    examples.push({
      text: guide.text,
      fa: guide.fa,
      form: guide.form,
      source: `مثال آموزشی ${GRAMMAR_BANDS[band]}`,
      guide,
    });
  const attested = (byBand as Record<string, Record<string, string[]>>)[verb.lemma]?.[band];
  if (attested)
    examples.push({
      text: attested[0],
      fa: attested[1],
      form: attested[2],
      source: `از محتوای ${GRAMMAR_BANDS[band]}`,
    });
  // Even where no example occurs at this band, teach from the actual course, not an invented conjugation.
  examples.push(...verb.examples.map((s) => ({ ...s, source: 'مثال مرجع واژه‌نامه' })));
  return examples.filter((s, i, all) => all.findIndex((x) => normalize(x.text) === normalize(s.text)) === i);
}
export interface VerbDrill {
  prompt: string;
  cue?: string;
  answer: string;
  choices: string[];
  why: string;
  write?: boolean;
}
function picks(seed: string, prompt: string, answer: string, others: string[]) {
  const unique = [answer, ...others]
    .filter((s, i, a) => a.findIndex((x) => normalize(x) === normalize(s)) === i)
    .slice(0, 3);
  return shuffleChecks(seed, [{ promptFa: prompt, choices: unique, correctIndex: 0, explanationFa: '' }])[0]
    .choices;
}
export function drillFor(verb: Verb, s: StudyExample, band: number): VerbDrill {
  const key = `${verb.lemma}:${band}:${s.text}`;
  const drill = (prompt: string, answer: string, others: string[], why: string, cue?: string): VerbDrill => ({
    prompt,
    answer,
    choices: picks(key, prompt, answer, others),
    why,
    cue,
  });
  if (s.guide) {
    const { prompt, answer, others, why } = s.guide;
    return drill(prompt, answer, others, why);
  }
  const forms = [...verb.forms, 'понима́ю', 'бу́дем', 'говоря́т'];
  const why = `در این نمونه «${s.form}» از مصدر «${verb.lemma}» آمده است.`;
  switch (band) {
    case 0:
      return drill(
        'فعل را بشنو. معنی آن کدام است؟',
        verb.fa,
        ['نوشیدن', 'شمردن', 'خوابیدن', 'پس دادن'].filter((m) => !verb.fa.includes(m)),
        `«${verb.lemma}» یعنی ${verb.fa}.`,
      );
    case 1:
      return drill('جمله را بشنو. کدام شکلِ فعل را شنیدی؟', s.form, forms, why);
    case 2:
      return drill(
        'این شکل را در واژه‌نامه زیر کدام مصدر پیدا می‌کنی؟',
        verb.lemma,
        ['говорить', 'жить', 'платить'],
        why,
        s.form,
      );
    case 3:
      return drill('با کمک معنی فارسی جای فعل را پر کن.', s.form, forms, why, gapFor(s.text, s.form));
    case 4: {
      const peers = [
        VERBS.find((v) => v.lemma === 'пить')!,
        VERBS.find((v) => v.lemma === 'видеть')!,
        VERBS.find((v) => v.lemma === 'отдохнуть')!,
      ];
      return drill(
        'جمله را بخوان. کدام ترجمه پیام آن را حفظ می‌کند؟',
        s.fa,
        peers.map((p) => p.examples[0].fa),
        s.fa,
        s.text,
      );
    }
    default:
      return {
        prompt: 'بدون گزینه و از روی معنی، دقیقاً همان شکل فعل را در جمله بنویس.',
        cue: gapFor(s.text, s.form),
        answer: s.form,
        choices: [],
        why,
        write: true,
      };
  }
}
