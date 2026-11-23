import { LocalizedText as Text } from '@/components/LocalizedText';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Check, Volume2 } from 'lucide-react-native';
import { ARABIC_LESSONS, type ArabicCheck, type ArabicLesson } from '@/lib/arabic/content';
import { playArabicSpeech } from '@/lib/arabic/speech';
import { loadArabicStudy, recordArabicLessonEvidence } from '@/lib/arabic/studyState';
import { normalizeArabic } from '@/lib/arabic/text';
import { ASSESSMENT_MAX_WIDTH } from '@/components/assessmentLayout';
import { Typography } from '@/lib/theme';
import { ArabicPalette as Palette } from './ArabicUI';

function skillLabel(skill: ArabicCheck['skill']): string {
  if (skill === 'listening') return 'شنیداری';
  if (skill === 'writing') return 'نوشتاری';
  if (skill === 'reading') return 'درک مطلب';
  return 'واژگان و دستور';
}

function buildFallbackChecks(lesson: ArabicLesson): ArabicCheck[] {
  const first = lesson.sentences[0];
  const second = lesson.sentences[1] ?? first;
  if (!first) return [];
  const distractors = [...new Set(ARABIC_LESSONS.flatMap(item => item.sentences.map(s => s.fa)))]
    .filter(fa => fa !== first.fa)
    .slice(0, 2);
  const options = [first.fa, ...distractors];
  return [
    {
      id: `${lesson.id}-listening`,
      skill: 'listening',
      prompt: 'جملهٔ عربی را بشنوید و معنی درست آن را انتخاب کنید.',
      audio: first.ar,
      options,
      answers: [first.fa],
      explanation: 'به واژه‌ها و صدای جمله در بخش جمله‌های اصلی برگردید.',
    },
    {
      id: `${lesson.id}-writing`,
      skill: 'writing',
      prompt: 'جملهٔ عربیِ متناظر با این معنی را بنویسید (بدون اعراب هم پذیرفته می‌شود).',
      source: second.fa,
      answers: [second.ar, second.arPlain ?? second.ar],
      explanation: `الگوی درس: ${second.ar}`,
    },
  ];
}

export function ArabicLessonEvidence({
  lesson,
  onPassed,
  attemptEvidence,
  onAttemptResult,
}: {
  lesson: ArabicLesson;
  onPassed: () => void;
  attemptEvidence?: Record<string, boolean>;
  onAttemptResult?: (taskId: string, correct: boolean) => void;
}) {
  const tasks = useMemo(
    () => (lesson.checks?.length ? lesson.checks : buildFallbackChecks(lesson)),
    [lesson],
  );

  const initialAttemptEvidence = useRef(attemptEvidence);
  const isNewAttempt = initialAttemptEvidence.current !== undefined;
  const activeRef = useRef(false);
  const [done, setDone] = useState<Record<string, boolean>>(initialAttemptEvidence.current ?? {});
  const [heardMap, setHeardMap] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(!isNewAttempt);
  const [loadError, setLoadError] = useState('');
  const doneRef = useRef(done);
  const onPassedRef = useRef(onPassed);
  doneRef.current = done;
  onPassedRef.current = onPassed;

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (tasks.length === 0) {
      onPassedRef.current();
      setLoading(false);
      return;
    }
    if (isNewAttempt) {
      if (tasks.every(item => !!initialAttemptEvidence.current?.[item.id])) onPassedRef.current();
      setLoading(false);
      return;
    }
    let active = true;
    void loadArabicStudy()
      .then(state => {
        if (!active) return;
        const saved = state.lessonEvidence[lesson.id] ?? {};
        const restored = Object.fromEntries(
          tasks.map(item => {
            const result = saved[item.id];
            return [item.id, !!result?.correct && (item.skill !== 'listening' || result.heard)];
          }),
        );
        doneRef.current = restored;
        setDone(restored);
        setLoading(false);
        setLoadError('');
        if (tasks.every(item => restored[item.id])) onPassedRef.current();
      })
      .catch(() => {
        if (!active) return;
        setLoadError('سنجش ذخیره‌شده خوانده نشد؛ برای حفظ اطلاعات، پاسخ تازه ثبت نمی‌شود.');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isNewAttempt, lesson.id, tasks]);

  async function submitCheck(task: ArabicCheck, rawAnswer: string) {
    const normalizedInput = normalizeArabic(rawAnswer);
    const isCorrect = task.answers.some(ans => normalizeArabic(ans) === normalizedInput || ans.trim() === rawAnswer.trim());
    const heard = task.skill !== 'listening' ? true : Boolean(heardMap[task.id]);

    if (task.skill === 'listening' && !heard) {
      setNotes(prev => ({ ...prev, [task.id]: 'ابتدا فایل صوتی این پرسش را تا پایان گوش دهید.' }));
      return;
    }

    await recordArabicLessonEvidence(lesson.id, task.id, task.skill, isCorrect, heard).catch(() => undefined);
    if (!activeRef.current) return;

    if (!isCorrect) {
      setNotes(prev => ({ ...prev, [task.id]: task.explanation }));
      return;
    }

    const next = { ...doneRef.current, [task.id]: true };
    doneRef.current = next;
    setDone(next);
    setNotes(prev => ({ ...prev, [task.id]: '' }));
    if (isNewAttempt) onAttemptResult?.(task.id, true);
    if (tasks.every(item => next[item.id])) onPassedRef.current();
  }

  return (
    <View style={styles.column}>
      <Text style={styles.heading}>سنجش کوتاه پایان درس</Text>
      <Text style={styles.text}>
        برای پایان این درس، به هر {tasks.length.toLocaleString('fa-IR')} سنجش مرتبط پاسخ درست دهید. در پاسخ نوشتاری، نوشتن با حرکات یا بدون حرکات هر دو پذیرفته می‌شود.
      </Text>
      {loading ? <Text style={styles.text}>در حال بازیابی پاسخ‌های ذخیره‌شده…</Text> : null}
      {!!loadError && <Text accessibilityRole="alert" style={styles.error}>{loadError}</Text>}
      {!loading &&
        !loadError &&
        tasks.map(task =>
          done[task.id] ? (
            <Text key={task.id} style={styles.done}>
              {skillLabel(task.skill)}: ثبت شد ✓
            </Text>
          ) : (
            <View key={task.id} style={styles.card}>
              <Text style={styles.skillBadge}>{skillLabel(task.skill)}</Text>
              <Text style={styles.prompt}>{task.prompt}</Text>
              {task.source ? <Text style={styles.source}>{task.source}</Text> : null}
              {task.audio ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    playArabicSpeech(task.audio!, {
                      onDone: () => setHeardMap(prev => ({ ...prev, [task.id]: true })),
                    })
                  }
                  style={styles.audioBtn}
                >
                  <Volume2 size={16} color="#FFFFFF" />
                  <Text style={styles.audioBtnText}>
                    {heardMap[task.id] ? 'پخش دوباره (شنیده شد ✓)' : 'پخش جملهٔ عربی'}
                  </Text>
                </Pressable>
              ) : null}

              {task.options?.length ? (
                <View style={styles.optionList}>
                  {task.options.map((opt, idx) => (
                    <Pressable
                      key={`${task.id}-opt-${idx}`}
                      accessibilityRole="button"
                      onPress={() => void submitCheck(task, opt)}
                      style={styles.optionBtn}
                    >
                      <Text style={styles.optionText}>{opt}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={styles.inputWrap}>
                  <TextInput
                    value={drafts[task.id] ?? ''}
                    onChangeText={value => setDrafts(prev => ({ ...prev, [task.id]: value }))}
                    placeholder="جملهٔ عربی را بنویسید…"
                    placeholderTextColor={Palette.muted}
                    style={styles.input}
                  />
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void submitCheck(task, drafts[task.id] ?? '')}
                    style={styles.submitBtn}
                  >
                    <Check size={16} color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>ثبت پاسخ</Text>
                  </Pressable>
                </View>
              )}

              {notes[task.id] ? <Text style={styles.hint}>{notes[task.id]}</Text> : null}
            </View>
          ),
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: ASSESSMENT_MAX_WIDTH, alignSelf: 'center', alignItems: 'stretch', gap: 10, marginTop: 18 },
  heading: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 19,
    lineHeight: 28,
    color: Palette.ink,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  text: {
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    lineHeight: 24,
    color: Palette.text,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  error: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    lineHeight: 22,
    color: Palette.danger,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  done: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    lineHeight: 22,
    color: Palette.success,
    backgroundColor: Palette.successSoft,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  card: {
    borderRadius: 17,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    padding: 15,
    gap: 10,
    shadowColor: '#211A68',
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  skillBadge: {
    alignSelf: 'flex-end',
    fontFamily: Typography.boldFontFamily,
    fontSize: 11,
    color: Palette.primaryDark,
    backgroundColor: Palette.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    writingDirection: 'rtl',
  },
  prompt: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 15,
    lineHeight: 25,
    color: Palette.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  source: {
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    lineHeight: 24,
    color: Palette.ink,
    backgroundColor: Palette.surfaceMuted,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 12,
    borderRadius: 12,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  audioBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: Palette.primary,
    paddingHorizontal: 16,
  },
  audioBtnText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 14,
    color: '#FFFFFF',
    writingDirection: 'rtl',
  },
  optionList: { gap: 8 },
  optionBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surfaceMuted,
    padding: 13,
  },
  optionText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 14,
    color: Palette.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputWrap: { gap: 8 },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surfaceMuted,
    paddingHorizontal: 13,
    fontFamily: Typography.boldFontFamily,
    fontSize: 16,
    color: Palette.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  submitBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: Palette.primary,
  },
  submitBtnText: {
    fontFamily: Typography.boldFontFamily,
    fontSize: 15,
    color: '#FFFFFF',
    writingDirection: 'rtl',
  },
  hint: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    lineHeight: 22,
    color: Palette.warning,
    backgroundColor: Palette.warningSoft,
    borderRadius: 12,
    padding: 10,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
