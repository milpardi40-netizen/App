import type { SentenceReviewCard } from './courseProgress';
import { readVocabularySnapshot as loadEnglishVocabulary } from './langProgress';
import { LANGUAGE_REGISTRY, type LanguageId } from './languages/registry';
import { isLanguageEnabled } from './features';
import { loadCourseSnapshot } from './courseSnapshot';
import { loadPracticeDays } from './practiceActivity';
import { loadLessonOutcomes } from './lessonOutcomes';
import { loadLearningEvents } from './learningAnalytics';
import { loadCompletionStreak } from './studyStreak';
import { addStreakDays, calendarStreak, dayOffset, noteDate } from './activityCalendar';
import { datedRatings, localDay, ratingsOf } from './reviewHistory';
import { loadWordProgress, isWordMastered } from './wordLabProgress';
import { loadLevelAssessments } from './levelAssessment';
import { loadPlacement } from './placement';
import { loadPronunciationMarks } from './languages/pronunciationProgress';
import { loadSupplement, assessmentScore } from './englishSupplement/progress';
import { loadPodcastProgress, getPodcastEpisode } from './englishPodcast';
import { countPracticeDrafts } from './languages/localPracticeDraft';

export interface LevelBreakdown {
  id: number;
  title: string;
  cefr: string;
  completed: number;
  total: number;
  percent: number;
  partial: number;
  exam: { attempts: number; last: number; best: number } | null;
  state: 'done' | 'active' | 'idle';
}

export interface ReviewBreakdown {
  total: number;
  dueNow: number;
  dueToday: number;
  learning: number;   // interval < 7 days
  maturing: number;   // 7–20 days
  mastered: number;   // >= 21 days
  lapses: number;
  averageEase: number | null;
  lastReviewedAt: string | null;
}

export interface LanguageProfileStat {
  id: LanguageId;
  name: string;
  nativeName: string;
  accent: string;
  home: string;
  started: boolean;
  completedLessons: number;
  totalLessons: number;
  percent: number;
  currentLessonTitle: string | null;
  currentLevelTitle: string | null;
  currentLevelCefr: string | null;
  levels: LevelBreakdown[];
  partial: number;
  reviewsDone: number;
  reviewLowerBound: boolean;
  wordDeck: { seen: number; mastered: number; due: number; reviews: number };
  speaking: { attempts: number; average: number | null; drills: number; drillAverage: number | null; legacyBest: number | null; points: number };
  assessment: { correct: number; answered: number; legacyCorrect: number };
  placement: string | null;
  pronunciation: { practiced: number; review: number };
  extraPractice: number;
  drafts: number;
  podcast: { completed: number; started: number; quizCorrect: number; quizTotal: number };
  supplementExams: number;
  legacyMinutes: number;
  unreadable: boolean;
  reviews: ReviewBreakdown;
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  todayMinutes: number;
  dailyGoalMinutes: number;
  lastActiveDate: string | null;
  updatedAt: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  progress: number; // 0..1
  detail: string;
}

export interface WeekDay {
  key: string;
  weekdayShort: string;
  minutes: number;
  reviews: number;
  isToday: boolean;
  active: boolean;
}

export interface LearnerProfileSummary {
  languages: LanguageProfileStat[];
  unavailable: string[];
  activeLanguages: number;
  completedLessons: number;
  totalLessons: number;
  totalMinutes: number;
  todayMinutes: number;
  dailyGoalMinutes: number;
  longestStreak: number;
  currentStreak: number;
  reviewsTotal: number;
  reviewsDone: number;
  reviewLowerBound: boolean;
  nextReview: { route: string; language: string } | null;
  reviewsDueNow: number;
  reviewsMastered: number;
  vocabulary: { seen: number; mastered: number; totalReviews: number; xp: number };
  week: WeekDay[];
  weekMinutes: number;
  activeDaysLast30: number;
  level: { title: string; next: string | null; progress: number; remaining: number; index: number; total: number };
  achievements: Achievement[];
}

const WEEKDAY_SHORT = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش']; // Sunday-first to match Date#getDay

function summarizeReviews(cards: SentenceReviewCard[], now: Date): ReviewBreakdown {
  const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
  let dueNow = 0, dueToday = 0, learning = 0, maturing = 0, mastered = 0, lapses = 0, easeSum = 0, easeCount = 0;
  let last: string | null = null;
  for (const card of cards) {
    const due = new Date(card.dueAt).getTime();
    if (due <= now.getTime()) dueNow += 1;
    if (due <= endOfDay.getTime()) dueToday += 1;
    if (card.intervalDays >= 21) mastered += 1; else if (card.intervalDays >= 7) maturing += 1; else learning += 1;
    lapses += card.lapses || 0;
    if (Number.isFinite(card.ease)) { easeSum += card.ease; easeCount += 1; }
    if (card.lastReviewedAt && (!last || card.lastReviewedAt > last)) last = card.lastReviewedAt;
  }
  return { total: cards.length, dueNow, dueToday, learning, maturing, mastered, lapses, averageEase: easeCount ? easeSum / easeCount : null, lastReviewedAt: last };
}

const LEVEL_STEPS: Array<[number, string]> = [[0, 'تازه‌کار'], [5, 'نوآموز'], [15, 'پیگیر'], [40, 'مستمر'], [80, 'حرفه‌ای'], [150, 'استاد']];

/** Learner rank derived from finished lessons across every language (motivational, not a certificate). */
export function learnerLevel(completedLessons: number): LearnerProfileSummary['level'] {
  let index = 0;
  for (let i = 0; i < LEVEL_STEPS.length; i++) if (completedLessons >= LEVEL_STEPS[i][0]) index = i;
  const next = LEVEL_STEPS[index + 1];
  const start = LEVEL_STEPS[index][0];
  const progress = next ? Math.min(1, (completedLessons - start) / (next[0] - start)) : 1;
  return { title: LEVEL_STEPS[index][1], next: next ? next[1] : null, progress, remaining: next ? Math.max(0, next[0] - completedLessons) : 0, index, total: LEVEL_STEPS.length };
}

function buildAchievements(s: Omit<LearnerProfileSummary, 'achievements'>): Achievement[] {
  const make = (id: string, title: string, description: string, value: number, target: number, unit: string): Achievement => ({
    id, title, description, earned: value >= target, progress: Math.min(1, target ? value / target : 1), detail: `${Math.floor(Math.min(value, target))} از ${target} ${unit}`,
  });
  return [
    make('first-lesson', 'اولین قدم', 'نخستین درس را تمام کردید', s.completedLessons, 1, 'درس'),
    make('ten-lessons', 'ده‌تایی', 'ده درس را کامل کردید', s.completedLessons, 10, 'درس'),
    make('fifty-lessons', 'نیم‌قرن', 'پنجاه درس را کامل کردید', s.completedLessons, 50, 'درس'),
    make('streak-7', 'یک هفته پیاپی', 'هفت روز پشت‌سرهم تمرین کردید', s.longestStreak, 7, 'روز'),
    make('streak-30', 'یک ماه پیاپی', 'سی روز پشت‌سرهم تمرین کردید', s.longestStreak, 30, 'روز'),
    make('hours-5', 'پنج ساعت تمرین', 'پنج ساعت یادگیری ثبت شد', s.totalMinutes, 300, 'دقیقه'),
    make('hours-25', 'بیست‌وپنج ساعت', 'بیست‌وپنج ساعت یادگیری ثبت شد', s.totalMinutes, 1500, 'دقیقه'),
    make('review-50', 'مرورگر', 'پنجاه کارت مرور فعال دارید', s.reviewsTotal, 50, 'کارت'),
    make('mastered-25', 'حافظهٔ بلندمدت', 'بیست‌وپنج جمله به حافظهٔ بلندمدت رسید', s.reviewsMastered, 25, 'جمله'),
    make('polyglot-2', 'دوزبانه', 'در دو زبان پیشرفت ثبت شد', s.activeLanguages, 2, 'زبان'),
    make('polyglot-3', 'چندزبانه', 'در سه زبان پیشرفت ثبت شد', s.activeLanguages, 3, 'زبان'),
    make('words-100', 'صد واژه', 'صد واژهٔ انگلیسی را دیده‌اید', s.vocabulary.seen, 100, 'واژه'),
  ];
}

/** A snapshot of the same device stores that the lessons, exams and review queues actually write. */
export async function loadLearnerProfileSummary(now = new Date()): Promise<LearnerProfileSummary> {
  const today = localDay(now);
  const [outcomes, events, globalStreak, vocabulary] = await Promise.all([
    loadLessonOutcomes(), loadLearningEvents(), loadCompletionStreak(), loadEnglishVocabulary(),
  ]);
  const vocab = { seen: Object.keys(vocabulary.mastery).length, mastered: Object.values(vocabulary.mastery).filter(n => n >= 2).length,
    totalReviews: vocabulary.totalReviews, xp: vocabulary.xp };
  const allDays = new Set<string>(), weekMs: Record<string, number> = {}, dailyReviews: Record<string, number> = {};
  addStreakDays(allDays, globalStreak.lastDate, globalStreak.count);
  const entries = LANGUAGE_REGISTRY.filter(entry => isLanguageEnabled(entry.id));
  const rows = await Promise.allSettled(entries.map(async (entry): Promise<LanguageProfileStat> => {
    const id = entry.id;
    const [snap, practice, exams, placed, marks, words, drafts] = await Promise.all([
      loadCourseSnapshot(id), loadPracticeDays(id), loadLevelAssessments(id), loadPlacement(id), loadPronunciationMarks(id),
      id === 'ru' || id === 'de' ? loadWordProgress(id) : { cards: {} }, countPracticeDrafts(id),
    ]);
    const { progress, current } = snap;
    const currentLevel = snap.levelDefinitions.find(l => l.id === current?.levelId);
    const days = new Set<string>();
    addStreakDays(days, progress.lastActiveDate, progress.currentStreak);
    for (const session of Object.values(snap.sessions)) noteDate(days, session.updatedAt);
    for (const event of events) if (event.course === id && event.name !== 'session_abandoned') noteDate(days, event.at);
    const reviews = summarizeReviews(snap.validCards, now);
    let reviewsDone = 0, reviewLowerBound = false;
    function addReviewDay(day: string, n: number) {
      if (n > 0) { days.add(day); dailyReviews[day] = (dailyReviews[day] ?? 0) + n; }
    }
    for (const card of snap.validCards) {
      // Revised slots start fresh scheduling; archived reviews still count as actual historical activity.
      const previous = (id === 'en' || id === 'de' || id === 'fr' || id === 'es' || id === 'tr' || id === 'ar') ? (card as SentenceReviewCard).previousContent : undefined;
      const histories = [ratingsOf(card), ...(previous ? [ratingsOf(previous)] : [])];
      for (const h of histories) {
        reviewsDone += h.undated; reviewLowerBound ||= h.lowerBound;
        for (const [day, n] of Object.entries(datedRatings(h))) { reviewsDone += n; addReviewDay(day, n); }
      }
    }
    const wordDeck = { seen: 0, mastered: 0, due: 0, reviews: 0 };
    if ((id === 'ru' || id === 'de') && Object.keys(words.cards).length) {
      const { WORD_LAB_WORDS } = await import('./languages/wordLab');
      for (const word of WORD_LAB_WORDS[id]) {
        const c = (words.cards as import('./wordLabProgress').WordProgress['cards'])[word.id]; if (!c) continue;
        wordDeck.seen++; wordDeck.mastered += Number(isWordMastered(c));
        wordDeck.due += Number(Date.parse(c.dueAt) <= now.getTime()); wordDeck.reviews += c.listened;
        noteDate(days, c.introducedAt); noteDate(days, c.lastReviewedAt);
        for (const [day, n] of Object.entries(datedRatings(ratingsOf(c)))) addReviewDay(day, n);
      }
    }
    reviewsDone += wordDeck.reviews;
    const assessment = { correct: 0, answered: 0, legacyCorrect: 0 };
    const podcastStats = { completed: 0, started: 0, quizCorrect: 0, quizTotal: 0 };
    let supplementExams = 0;
    if (id === 'en') {
      const [supplement, podcast] = await Promise.all([loadSupplement(), loadPodcastProgress()]);
      for (const [day, stat] of Object.entries(vocabulary.daily)) { days.add(day); reviewsDone += stat.reviewed; addReviewDay(day, stat.reviewed); }
      for (const [episodeId, e] of Object.entries(podcast.episodes)) {
        if (!getPodcastEpisode(episodeId)) continue;
        noteDate(days, e.updatedAt); podcastStats.started++; podcastStats.completed += Number(e.completed);
        if (e.quizTotal && typeof e.quizScore === 'number') { podcastStats.quizCorrect += e.quizScore; podcastStats.quizTotal += e.quizTotal; }
      }
      // Includes the legacy listening/writing checks saved by EnglishSupplementTask.
      for (const result of [...snap.lessons.flatMap(l => Object.values(snap.study?.lessonEvidence[l.id] ?? {})), ...Object.values(supplement.evidence)]) {
        assessment.answered++; assessment.correct += Number(result.correct);
      }
      for (const attempt of supplement.assessmentAttempts) {
        noteDate(days, attempt.completedAt ?? attempt.startedAt);
        if (!attempt.completedAt) continue;
        const score = assessmentScore(attempt); supplementExams++; assessment.correct += score.correct; assessment.answered += score.total;
      }
    }
    // Latest answer to each objective checkpoint; revisions never create a fictitious extra question.
    for (const [key, result] of Object.entries(outcomes)) if (key.startsWith(`${id}:extra:`) && result.assessment?.total) {
      assessment.correct += result.assessment.correct; assessment.answered += result.assessment.total; noteDate(days, result.assessment.at);
    }
    let spoken = 0, scoreSum = 0, drills = 0, drillSum = 0, points = 0, extraPractice = 0;
    let legacyBest: number | null = null;
    for (const lesson of snap.lessons) {
      const outcome = outcomes[`${id}:${lesson.id}`];
      const scores = outcome?.speaking ? lesson.sentences.map(sentence => outcome?.speaking?.scores?.[sentence.id]).filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100) : [];
      if (outcome?.speaking && !outcome.speaking.attemptedOnly && scores.includes(0)) {
        // Older versions padded skips with zeros. A positive score is real, the denominator is unknown.
        const best = Math.max(...scores);
        if (best > 0) legacyBest = Math.max(legacyBest ?? 0, best);
      } else if (outcome?.speaking && scores.length) {
        // Historic drill averages included skipped phrases as zero. Only submitted scores are evidence.
        drills++; drillSum += scores.reduce((a, b) => a + b, 0) / scores.length; points += outcome.speaking.points ?? 0; noteDate(days, outcome.speaking.at);
      }
      // A current set of submitted answers supersedes (does not add to) the last saved short check.
      const answers = snap.sessions[lesson.id]?.answers;
      const submitted = answers && Object.keys(answers).length ? (snap.answerKey?.(lesson.id) ?? []).flatMap((correct, i) => answers[i] === undefined ? [] : [correct === answers[i]]) : [];
      if (submitted.length) { assessment.answered += submitted.length; assessment.correct += submitted.filter(Boolean).length; }
      else if (outcome?.assessment?.total) {
        const a = outcome.assessment;
        if (a.attemptedOnly || a.correct === a.total) { assessment.answered += a.total; assessment.correct += a.correct; }
        else assessment.legacyCorrect += a.correct; // total used to mean available, not answered
      }
      noteDate(days, outcome?.assessment?.at);
    }
    const milliseconds = { ...snap.study?.days };
    for (const [day, bucket] of Object.entries(practice)) {
      milliseconds[day] = (milliseconds[day] ?? 0) + bucket.ms;
      spoken += bucket.spoken; scoreSum += bucket.scoreSum; extraPractice += bucket.rounds;
      if (bucket.ms || bucket.spoken || bucket.rounds) days.add(day);
    }
    for (const [day, ms] of Object.entries(milliseconds)) if (ms > 0) { days.add(day); weekMs[day] = (weekMs[day] ?? 0) + ms; }
    const pronunciation = { practiced: 0, review: 0 };
    for (const v of Object.values(marks)) if (v?.mark) { pronunciation[v.mark]++; noteDate(days, v.updatedAt); }
    for (const exam of Object.values(exams)) noteDate(days, exam?.lastAt);
    if (placed?.status === 'placed') noteDate(days, placed.at);
    const streak = calendarStreak(days, today);
    for (const day of days) allDays.add(day);
    const started = days.size > 0 || snap.course.completed > 0 || snap.course.partial > 0 || Object.keys(snap.sessions).length > 0 || reviews.total > 0 ||
      wordDeck.seen > 0 || assessment.answered > 0 || drafts > 0 || pronunciation.practiced + pronunciation.review > 0;
    return { ...entry, started, partial: snap.course.partial, completedLessons: snap.course.completed, totalLessons: snap.course.total, percent: snap.course.percent,
      currentLessonTitle: started ? current?.title ?? null : null, currentLevelTitle: started ? currentLevel?.title ?? null : null, currentLevelCefr: started ? currentLevel?.cefr ?? null : null,
      levels: snap.levelDefinitions.map(level => {
        const tally = snap.levels[level.id] ?? { completed: 0, total: 0, percent: 0, partial: 0 };
        const exam = exams[level.id];
        return { ...level, ...tally, exam: exam ? { attempts: exam.attempts, last: exam.lastPercent, best: exam.bestPercent } : null,
          state: tally.total && tally.completed === tally.total ? 'done' : tally.percent || (started && currentLevel?.id === level.id) ? 'active' : 'idle' };
      }),
      reviews, reviewsDone, reviewLowerBound, wordDeck, assessment, podcast: podcastStats, supplementExams, drafts, pronunciation, extraPractice,
      speaking: { attempts: spoken, average: spoken ? Math.round(scoreSum / spoken) : null, drills, points, legacyBest, drillAverage: drills ? Math.round(drillSum / drills) : null },
      placement: placed?.status === 'placed' ? snap.levelDefinitions.find(l => l.id === placed.levelId)?.cefr ?? null : null,
      currentStreak: streak.current, longestStreak: Math.max(streak.best, progress.longestStreak), lastActiveDate: streak.last,
      totalMinutes: Object.values(milliseconds).reduce((a, b) => a + b, 0) / 60000, todayMinutes: (milliseconds[today] ?? 0) / 60000,
      legacyMinutes: progress.totalMinutes, dailyGoalMinutes: progress.dailyGoalMinutes, updatedAt: started ? progress.updatedAt : null, unreadable: snap.unreadable,
    };
  }));
  const unavailable = rows.flatMap((row, i) => row.status === 'rejected' ? [entries[i].name] : []);
  const languages = rows.flatMap(row => row.status === 'fulfilled' ? [row.value] : []);
  if (!languages.length) throw new Error('سابقهٔ زبان‌ها خوانده نشد.');
  const week: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - 6 + i);
    const key = localDay(d);
    return { key, weekdayShort: WEEKDAY_SHORT[d.getDay()], minutes: (weekMs[key] ?? 0) / 60000, reviews: dailyReviews[key] ?? 0, active: allDays.has(key), isToday: key === today };
  });
  const streak = calendarStreak(allDays, today);
  const sum = (f: (language: LanguageProfileStat) => number) => languages.reduce((n, l) => n + f(l), 0);
  const due = languages.find(l => l.reviews.dueNow || l.wordDeck.due);
  const completedLessons = sum(l => l.completedLessons);
  const base: Omit<LearnerProfileSummary, 'achievements'> = {
    languages, unavailable, completedLessons, totalLessons: sum(l => l.totalLessons), activeLanguages: languages.filter(l => l.started).length,
    totalMinutes: sum(l => l.totalMinutes), todayMinutes: sum(l => l.todayMinutes), dailyGoalMinutes: Math.max(0, ...languages.filter(l => l.started).map(l => l.dailyGoalMinutes)) || 10,
    longestStreak: Math.max(streak.best, globalStreak.best, ...languages.map(l => l.longestStreak)), currentStreak: streak.current,
    reviewsTotal: sum(l => l.reviews.total), reviewsMastered: sum(l => l.reviews.mastered), reviewsDueNow: sum(l => l.reviews.dueNow + l.wordDeck.due),
    reviewsDone: sum(l => l.reviewsDone), reviewLowerBound: languages.some(l => l.reviewLowerBound),
    nextReview: due ? { language: due.name, route: due.reviews.dueNow ? (due.id === 'en' ? '/review' : `/learn/${due.id}/review`) : `/learn/${due.id}/vocabulary` } : null,
    vocabulary: vocab, week, weekMinutes: week.reduce((n, d) => n + d.minutes, 0),
    activeDaysLast30: [...allDays].filter(d => d >= dayOffset(today, -29) && d <= today).length, level: learnerLevel(completedLessons),
  };
  return { ...base, achievements: buildAchievements(base) };
}

/** Two-letter monogram for the avatar, Persian or Latin. */
export function nameInitials(fullName: string, email = ''): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`;
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (email.trim()[0] || '؟').toUpperCase();
}
