import {isArabicA1Core, arabicA1SentenceRevision, reviseArabicA1ReviewCard} from '../arabic/a1Scope';
import {isTurkishA1Core, turkishA1SentenceRevision, resumeTurkishA1Samples, reviseTurkishA1ReviewCard} from './turkishA1Scope';
import {isSpanishA1Core, spanishA1SentenceRevision, resumeSpanishA1Samples, reviseSpanishA1ReviewCard} from './spanishA1Scope';
import {isGermanA1Core, germanA1SentenceRevision, resumeGermanA1Samples, reviseGermanA1ReviewCard} from './germanA1Scope';
import {isFrenchA1Core, frenchA1SentenceRevision, resumeFrenchA1Samples, reviseFrenchA1ReviewCard} from './frenchA1Scope';
export const isSequencedStarterA1 = (id: string) => isArabicA1Core(id) || isTurkishA1Core(id) || isGermanA1Core(id) || isFrenchA1Core(id) || isSpanishA1Core(id);
export const sequencedStarterSentenceRevision = (id: string) => arabicA1SentenceRevision(id) ?? turkishA1SentenceRevision(id) ?? germanA1SentenceRevision(id) ?? frenchA1SentenceRevision(id) ?? spanishA1SentenceRevision(id);
export function resumeSequencedStarterSamples<T extends {sampleRevision?: string; revealed: boolean}>(id: string, session: T): T {
  return resumeTurkishA1Samples(id, resumeSpanishA1Samples(id, resumeFrenchA1Samples(id, resumeGermanA1Samples(id, session))));
}
export const reviseSequencedStarterReviewCard: typeof reviseGermanA1ReviewCard = card => reviseArabicA1ReviewCard(reviseTurkishA1ReviewCard(reviseSpanishA1ReviewCard(reviseFrenchA1ReviewCard(reviseGermanA1ReviewCard(card)))));
