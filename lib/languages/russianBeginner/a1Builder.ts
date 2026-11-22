import { orderChecks } from './checkOrder';
import type { LearningLesson, LearningSentence } from '../types';

export type A1SentenceTuple = readonly [
  text: string,
  fa: string,
  pronunciation: string,
  pattern: string,
  vocabulary: readonly [word: string, meaning: string][],
];

export type A1DialogueTuple = readonly [
  speaker: 'هم‌صحبت' | 'زبان‌آموز',
  text: string,
  fa: string,
  pronunciation: string,
];

export interface A1LessonSpec {
  id: string;
  section: 'foundation' | 'survival';
  title: string;
  subtitle: string;
  situation: string;
  teachingFa: string;
  durationMinutes?: number;
  sentences: readonly A1SentenceTuple[];
  dialogue: readonly A1DialogueTuple[];
  checks: readonly [
    { promptFa: string; choices: [string, string, string]; explanationFa: string },
    { promptFa: string; choices: [string, string, string]; explanationFa: string },
  ];
}

export function buildA1Lesson(spec: A1LessonSpec): LearningLesson {
  const sentences: LearningSentence[] = spec.sentences.map(([text, fa, pronunciation, pattern, vocabulary], index) => ({
    id: `${spec.id}-${String(index + 1).padStart(2, '0')}`,
    text,
    fa,
    pronunciation,
    ...(pattern ? { pattern } : {}),
    vocabulary: vocabulary.map(([word, meaning]) => ({ word, meaning })),
  }));
  const dialogue = spec.dialogue.map(([speaker, text, fa, pronunciation]) => ({
    speaker,
    role: speaker === 'زبان‌آموز' ? ('learner' as const) : ('partner' as const),
    text,
    fa,
    pronunciation,
  }));
  return {
    id: spec.id,
    title: spec.title,
    situation: spec.situation,
    durationMinutes: spec.durationMinutes ?? 15,
    teachingFa: spec.teachingFa,
    sentences,
    dialogue,
    checks: orderChecks(
      spec.checks.map(check => ({
        promptFa: check.promptFa,
        choices: [...check.choices],
        correctIndex: 0,
        explanationFa: check.explanationFa,
      })),
      spec.id,
    ),
  };
}

export const A1_SUBTITLES: Record<string, string> = {};
export const A1_SECTIONS: Record<string, 'foundation' | 'survival'> = {};

export function registerA1Specs(specs: readonly A1LessonSpec[]): LearningLesson[] {
  return specs.map(spec => {
    A1_SUBTITLES[spec.id] = spec.subtitle;
    A1_SECTIONS[spec.id] = spec.section;
    return buildA1Lesson(spec);
  });
}
