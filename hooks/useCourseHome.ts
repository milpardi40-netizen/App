import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getStudyStreak } from '@/lib/studyStreak';
import { buildDailyPlan, type DailyPlanStep } from '@/lib/dailyPlan';
import type { LanguageId } from '@/lib/languages/registry';
import { useCourseSnapshot } from './useCourseSnapshot';

export function useCourseHome(id: LanguageId) {
  const { data: snapshot, failed, retry } = useCourseSnapshot(id);
  const [streak, setStreak] = useState(0);
  const [plan, setPlan] = useState<DailyPlanStep[]>([]);
  const dueCount = snapshot?.validCards.filter(card => Date.parse(card.dueAt) <= Date.now()).length ?? 0;
  useFocusEffect(useCallback(() => {
    let active = true;
    void getStudyStreak().then(n => { if (active) setStreak(n); });
    void buildDailyPlan({
      lessonDone: false, // the plan's dated lesson marker is set on completion, not on a review
      reviewsDue: dueCount, lessonRoute: id === 'en' ? '/course/lesson' : `/learn/${id}/lesson`,
      reviewRoute: id === 'en' ? '/review' : `/learn/${id}/review`,
      speakRoute: `/learn/${id}/${id === 'ru' ? 'vocabulary' : 'pronunciation'}`,
    }).then(steps => { if (active) setPlan(steps); }).catch(() => undefined);
    return () => { active = false; };
  }, [id, dueCount, snapshot?.progress.updatedAt]));
  return { snapshot, progress: snapshot?.progress, dueCount, streak, plan, retry,
    hasStartedCourse: !!snapshot && (snapshot.course.completed > 0 || Object.keys(snapshot.sessions).length > 0 || snapshot.course.partial > 0),
    error: failed || snapshot?.unreadable ? 'بخشی از پیشرفت خوانده نشد؛ داده‌های ذخیره‌شده تغییر نکرده‌اند.' : '' };
}
