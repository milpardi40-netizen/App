import { RUSSIAN_PRE_A1_LIGHT_VERBS_ID, RUSSIAN_PRE_A1_LIGHT_SENTENCE_REVISION } from '../russianPreA1Phase2';
import {arabicA1SentenceRevision} from '../../arabic/a1Scope';
import {turkishA1SentenceRevision} from '../turkishA1Scope';
import {spanishA1SentenceRevision} from '../spanishA1Scope';
import {frenchA1SentenceRevision} from '../frenchA1Scope';
import {germanA1SentenceRevision} from '../germanA1Scope';
import {englishA1SentenceRevision} from '../../englishA1Scope';
import { balancedAssessmentRevision, balancedSampleRevision } from './balanceRevision';
import { PRACTICAL_PRE_A1_REVISION } from './model';

/** Only assessments whose questions changed; foundations and higher bands keep their saved answers. */
export function practicalAssessmentRevision(language: string, lessonId: string): string | undefined {
  const balanced = balancedAssessmentRevision(language, lessonId);
  if (balanced) return balanced;
  if ((['de', 'fr', 'es'].includes(language) && new RegExp(`^${language}-pre-\\d+$`).test(lessonId))
    || (language === 'tr' && lessonId === 'tr-prea1-08-simple-questions')
    || (language === 'en' && lessonId === 'prea1-14-i-like')
    || (language === 'ar' && lessonId.startsWith('ar-prea1-'))) return PRACTICAL_PRE_A1_REVISION;
  return undefined;
}

/** Old evidence remains historical; it cannot unlock a changed assessment in the current attempt. */
export function revisePracticalEvidence<T extends { evidencePassed: boolean; attemptEvidence?: Record<string, boolean>; checksRevision?: string }>(language: string, lessonId: string, session: T): T {
  const revision = practicalAssessmentRevision(language, lessonId);
  return revision && session.checksRevision !== revision
    ? { ...session, evidencePassed: false, attemptEvidence: {}, checksRevision: revision }
    : session;
}

/** Sentence-level scores change only where the taught sentences changed. */
export function practicalSentenceRevision(language: string, lessonId: string): string | undefined {
  if (language === 'ru' && lessonId === RUSSIAN_PRE_A1_LIGHT_VERBS_ID) return RUSSIAN_PRE_A1_LIGHT_SENTENCE_REVISION;
  // Preserve raw history, but never attach an old utterance's score to a rewritten A1 slot.
  if (language === 'ar' && arabicA1SentenceRevision(lessonId)) return arabicA1SentenceRevision(lessonId);
  if (language === 'en' && englishA1SentenceRevision(lessonId)) return englishA1SentenceRevision(lessonId);
  if (language === 'es' && spanishA1SentenceRevision(lessonId)) return spanishA1SentenceRevision(lessonId);
  if (language === 'fr' && frenchA1SentenceRevision(lessonId)) return frenchA1SentenceRevision(lessonId);
  if (language === 'de' && germanA1SentenceRevision(lessonId)) return germanA1SentenceRevision(lessonId);
  if (language === 'ru' && lessonId.startsWith('ru-a1-')) return 'ru-a1-sequenced-content-v1';
  const balanced = balancedSampleRevision(lessonId);
  if (balanced) return balanced;
  if (language === 'tr') return turkishA1SentenceRevision(lessonId);
  return practicalAssessmentRevision(language, lessonId);
}
