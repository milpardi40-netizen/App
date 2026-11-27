import { LocalizedText as Text } from '@/components/LocalizedText';
import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { type SentenceLesson } from '@/lib/courseContent';
import type { Task } from '@/lib/englishSupplement/content';
import { EnglishSupplementTask, supplementStyles as s } from './EnglishSupplementTask';
import { englishEvidenceFor } from '@/lib/lessonEvidenceBank';
import { loadSupplement } from '@/lib/englishSupplement/progress';
import { loadStudy, recordLessonEvidence } from '@/lib/englishStudyState';
import { StyleSheet } from 'react-native';
import { Typography } from '@/lib/theme';
import { EnglishPalette } from '@/components/EnglishSupplementTask';
import { ASSESSMENT_MAX_WIDTH } from '@/components/assessmentLayout';

/** Historical evidence is retained, but restarted attempts track their own checks. */
export function EnglishLessonEvidence({ lesson, onPassed, attemptEvidence, onAttemptResult, onProgress }: {
  lesson: SentenceLesson;
  onPassed: () => void;
  attemptEvidence?: Record<string, boolean>;
  onAttemptResult?: (taskId: string, correct: boolean) => void;
  onProgress?: (correct: number, total: number) => void;
}) {
  const tasks = useMemo(() => englishEvidenceFor(lesson), [lesson]);

  const initialAttemptEvidence = useRef(attemptEvidence);
  const isNewAttempt = initialAttemptEvidence.current !== undefined;
  const activeRef = useRef(false);
  const [done, setDone] = useState<Record<string, boolean>>(initialAttemptEvidence.current ?? {});
  const doneRef = useRef(done);
  const [loading, setLoading] = useState(!isNewAttempt);
  const [loadError, setLoadError] = useState('');
  const onPassedRef = useRef(onPassed);
  const onProgressRef = useRef(onProgress);
  doneRef.current = done;

  useEffect(() => { onPassedRef.current = onPassed; }, [onPassed]);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

  useEffect(() => {
    if (loading || loadError) return;
    const correct = tasks.filter(item => !!done[item.id]).length;
    onProgressRef.current?.(correct, tasks.length);
  }, [done, loadError, loading, tasks]);

  useEffect(() => {
    activeRef.current = true;
    return () => { activeRef.current = false; };
  }, []);

  useEffect(() => {
    if (isNewAttempt) {
      if (tasks.every(item => !!initialAttemptEvidence.current?.[item.id])) onPassedRef.current();
      return;
    }
    let active = true;
    void Promise.all([loadStudy(), loadSupplement()]).then(([state, supplement]) => {
      if (!active) return;
      const saved = { ...supplement.evidence, ...state.lessonEvidence[lesson.id] };
      const restored = Object.fromEntries(tasks.map(item => {
        const result = saved[item.id];
        return [item.id, !!result?.correct && (item.skill !== 'listening' || result.heard)];
      }));
      doneRef.current = restored;
      setDone(restored);
      setLoading(false);
      setLoadError('');
      if (tasks.every(item => restored[item.id])) onPassedRef.current();
    }).catch(() => {
      if (!active) return;
      setLoadError('سنجش ذخیره‌شده خوانده نشد؛ برای حفظ اطلاعات، پاسخ تازه ثبت نمی‌شود.');
      setLoading(false);
    });
    return () => { active = false; };
  }, [isNewAttempt, lesson.id, tasks]);

  async function saveCoreLessonResult(task: Task, correct: boolean, heard: boolean) {
    await recordLessonEvidence(lesson.id, task.id, task.skill, correct, heard);
    if (!activeRef.current) return;
    const next = { ...doneRef.current, [task.id]: correct && (task.skill !== 'listening' || heard) };
    doneRef.current = next;
    setDone(next);
    if (isNewAttempt) onAttemptResult?.(task.id, next[task.id]);
    if (tasks.every(item => next[item.id])) onPassedRef.current();
  }

  const description = `برای پایان این درس، به هر ${tasks.length} سنجشِ مرتبط با هدف‌هایش درست پاسخ دهید. پاسخ نادرست را می‌توانید دوباره امتحان کنید؛ شنیداری پس از پخش کامل ثبت می‌شود. گفتار خودکار نمره‌گذاری نمی‌شود.`;

  // Centred like the assessment page of every other language: one narrow column, centred copy, then
  // equally sized task cards from the shared English supplement component.
  return <View style={styles.column}>
    <Text style={styles.heading}>سنجش کوتاه پایان درس</Text>
    <Text style={styles.text}>{description}</Text>
    {loading ? <Text style={styles.text}>در حال بازیابی پاسخ‌های ذخیره‌شده…</Text> : null}
    {!!loadError && <Text accessibilityRole="alert" style={styles.error}>{loadError}</Text>}
    {!loading && !loadError && tasks.map(task => done[task.id]
      ? <Text key={task.id} style={styles.done}>{task.skill === 'listening' ? 'شنیداری' : task.skill === 'writing' ? 'نوشتاری' : task.skill === 'reading' ? 'درک مطلب' : 'واژگان و دستور'}: ثبت شد ✓</Text>
      : <EnglishSupplementTask key={task.id} task={task} centered onSave={saveCoreLessonResult} />)}
  </View>;
}

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: ASSESSMENT_MAX_WIDTH, alignSelf: 'center', alignItems: 'stretch', gap: 10, marginTop: 18 },
  heading: { fontFamily: Typography.boldFontFamily, color: EnglishPalette.ink, fontSize: 19, lineHeight: 28, fontWeight: '400', textAlign: 'center', writingDirection: 'rtl' },
  text: { fontFamily: Typography.fontFamily, color: EnglishPalette.text, fontSize: 14, lineHeight: 24, textAlign: 'center', writingDirection: 'rtl' },
  done: { fontFamily: Typography.fontFamily, color: EnglishPalette.success, fontSize: 13, lineHeight: 22, textAlign: 'center', writingDirection: 'rtl', backgroundColor: EnglishPalette.successSoft, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  error: { fontFamily: Typography.fontFamily, color: EnglishPalette.danger, fontSize: 13, lineHeight: 22, textAlign: 'center', writingDirection: 'rtl' },
});
