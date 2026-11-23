import {
  createCourseProgressStore,
  type CourseProgress,
  type ReviewRating,
  type SentenceReviewCard,
} from '@/lib/createCourseProgressStore';
import { ARABIC_LESSONS } from './content';

export const ARABIC_PROGRESS_STORAGE_KEY = 'arabic_course_progress_v1';

const store = createCourseProgressStore({
  key: ARABIC_PROGRESS_STORAGE_KEY,
  lessons: ARABIC_LESSONS,
  cloudSync: false,
  recordEstimatedTime: false,
  markVocabularyOnCompletion: false,
  allowEmpty: true,
});

export type ArabicCourseProgress = CourseProgress;
export type ArabicReviewCard = SentenceReviewCard;
export type ArabicReviewRating = ReviewRating;

export const getArabicProgress = store.getCourseProgress;
export const syncArabicProgress = store.syncCourseProgress;
export const completeArabicLesson = store.completeSentenceLesson;
export const setArabicCurrentLesson = store.setCurrentLesson;
export const addArabicSentenceToReview = store.addSentenceToReview;
export const getArabicDueReviewCards = store.getDueReviewCards;
export const rateArabicReviewCard = store.rateReviewCard;
export const exportArabicProgress = store.exportProgress;
export const restoreArabicProgress = store.restoreProgress;
