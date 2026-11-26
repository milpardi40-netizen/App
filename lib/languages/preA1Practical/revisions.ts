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
  const balanced = balancedSampleRevision(lessonId);
  if (balanced) return balanced;
  if (language === 'tr') return undefined;
  return practicalAssessmentRevision(language, lessonId);
}
