import { LocalizedText as Text } from '@/components/LocalizedText';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bot, ChevronLeft, MessageCircle, UserRound } from 'lucide-react-native';
import SpeakCheck, { type SpeakCheckResult } from '@/components/SpeakCheck';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';
import { stop as stopCourseSpeech } from '@/lib/courseSpeech';
import { Radius, Spacing, Typography } from '@/lib/theme';
import { toPersianDigits as fa } from '@/lib/format';

/**
 * «اتاق گفت‌وگو» — the friendly closing room of every lesson.
 * No new content is invented here: the room runs exactly the sentences the
 * lesson already teaches (the standard eight). The operator reads half of
 * them and the learner says the other half, one pass, no retries; each
 * learner line is scored by the device recogniser and the room ends with one
 * overall score and evaluation. The bottom section always offers the bridge
 * to a real live conversation with another person.
 */
export type DialogueLine = { text: string; fa: string };

type Props = {
  language: string;
  lessonId: string;
  lessonTitle: string;
  levelId: number;
  situation: string;
  lines: readonly DialogueLine[];
  locale: string;
  onSpeak: (text: string, onDone: () => void) => void;
  accent?: string;
};

type Speaker = 'operator' | 'me';

function evaluationFor(score: number) {
  if (score >= 90) return 'عالی بود! جمله‌های تو روان و واضح شنیده شد.';
  if (score >= 70) return 'خوب بود؛ واژه‌های قرمز را یک‌بار در درس گوش بده و تمرین کن.';
  if (score >= 40) return 'شروع خوبی بود؛ جمله‌های ناقص را آهسته‌تر و کنار صدای اپراتور تمرین کن.';
  return 'اشکالی ندارد؛ اول جمله‌های درس را گوش بده و دوباره به این اتاق برگرد.';
}

export default function LessonDialogueRoom({ language, lessonId, lessonTitle, levelId, situation, lines, locale, onSpeak, accent = Palette.primary }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<'choose' | 'run' | 'done'>('choose');
  const [starter, setStarter] = useState<Speaker>('operator');
  const [turn, setTurn] = useState(0);
  const [results, setResults] = useState<Record<number, SpeakCheckResult>>({});

  const turnRef = useRef(0);
  turnRef.current = turn;
  const spokenRef = useRef<Set<string>>(new Set());
  const advancedRef = useRef<number>(-1);

  const speakerOf = useCallback((index: number): Speaker => ((index % 2 === 0) === (starter === 'operator') ? 'operator' : 'me'), [starter]);

  // One advance per turn: a voice engine may report both done and error for the
  // same utterance, and the room must never skip a sentence because of it.
  const advance = useCallback(() => {
    const current = turnRef.current;
    if (advancedRef.current === current) return;
    advancedRef.current = current;
    if (current + 1 < lines.length) setTurn(current + 1);
    else setPhase('done');
  }, [lines.length]);

  // The operator's turn: speak the line exactly once; when the voice finishes
  // (or fails), move on. The spoken-guard keeps engine retries silent.
  useEffect(() => {
    if (phase !== 'run') return;
    const line = lines[turn];
    if (!line) return;
    if (speakerOf(turn) === 'operator') {
      const key = `${starter}:${turn}`;
      if (spokenRef.current.has(key)) return;
      spokenRef.current.add(key);
      onSpeak(line.text, advance);
    }
    return () => { void stopCourseSpeech(); };
  }, [phase, turn, starter, lines, onSpeak, speakerOf, advance]);

  useEffect(() => () => { void stopCourseSpeech(); }, []);

  const start = useCallback((who: Speaker) => {
    spokenRef.current = new Set();
    advancedRef.current = -1;
    turnRef.current = 0;
    setStarter(who);
    setTurn(0);
    setResults({});
    setPhase('run');
  }, []);

  const onUserResult = useCallback((index: number, result: SpeakCheckResult) => {
    setResults(current => (current[index] ? current : { ...current, [index]: result }));
    advance();
  }, [advance]);

  const userIndexes = useMemo(() => lines.map((_, index) => index).filter(index => speakerOf(index) === 'me'), [lines, speakerOf]);

  const score = useMemo(() => {
    const scored = userIndexes.map(index => results[index]?.score).filter((value): value is number => typeof value === 'number');
    if (!scored.length) return null;
    return Math.round(scored.reduce((sum, value) => sum + value, 0) / scored.length);
  }, [results, userIndexes]);

  const openLiveConversation = useCallback(() => {
    router.push({ pathname: '/conversations', params: { language, lessonId, lessonTitle, levelId: String(levelId), situation } } as never);
  }, [router, language, lessonId, lessonTitle, levelId, situation]);

  const lineLabel = (index: number) => (speakerOf(index) === 'operator' ? 'اپراتور' : 'شما');

  return (
    <View style={styles.wrap}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>اتاق گفت‌وگو</Text>
        <Text style={styles.headerSituation}>{situation}</Text>
        <Text style={styles.headerNote}>
          {fa(lines.length)} جملهٔ همین درس روی میز است؛ نیمی را اپراتور می‌گوید و نیمی را شما — هر جمله فقط یک‌بار.
        </Text>
      </View>

      {phase === 'choose' ? (
        <View style={styles.chooseCard}>
          <Text style={styles.chooseQuestion}>چه کسی گفت‌وگو را شروع می‌کند؟</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="اپراتور شروع می‌کند" style={styles.chooseButton} onPress={() => start('operator')}>
            <Bot size={18} color={accent} />
            <Text style={styles.chooseButtonText}>اپراتور شروع می‌کند</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="من شروع می‌کنم" style={styles.chooseButton} onPress={() => start('me')}>
            <UserRound size={18} color={accent} />
            <Text style={styles.chooseButtonText}>من شروع می‌کنم</Text>
          </Pressable>
        </View>
      ) : null}

      {phase !== 'choose' ? (
        <View style={styles.transcript}>
          {lines.map((line, index) => {
            if (index > turn && phase === 'run') return null;
            const mine = speakerOf(index) === 'me';
            const result = mine ? results[index] : undefined;
            const active = phase === 'run' && index === turn;
            return (
              <View key={`${index}-${line.text}`} style={[styles.bubbleRow, mine ? styles.bubbleRowMine : null]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : null, active ? { borderColor: accent } : null]}>
                  <View style={styles.bubbleHead}>
                    {mine ? <UserRound size={13} color={accent} /> : <Bot size={13} color={Palette.muted} />}
                    <Text style={styles.bubbleSpeaker}>{lineLabel(index)}</Text>
                  </View>
                  <Text style={styles.bubbleForeign}>{line.text}</Text>
                  <Text style={styles.bubbleFa}>{line.fa}</Text>
                  {result ? <Text style={[styles.bubbleScore, result.score >= 70 ? styles.scoreGood : styles.scoreWeak]}>امتیاز این جمله: {fa(result.score)}٪</Text> : null}
                  {mine && !result && phase === 'done' ? <Text style={styles.bubbleScore}>این جمله نوبت تو بود و گفته نشد</Text> : null}
                </View>
              </View>
            );
          })}
          {phase === 'run' ? (
            <View style={styles.turnCard}>
              {speakerOf(turn) === 'operator' ? (
                <Text style={styles.turnText}>اپراتور دارد می‌گوید… گوش کن.</Text>
              ) : (
                <>
                  <Text style={styles.turnText}>نوبت توست — همین جمله را بگو:</Text>
                  <SpeakCheck
                    key={`${turn}-${lines[turn]?.text ?? ''}`}
                    text={lines[turn]?.text ?? ''}
                    locale={locale}
                    accent={accent}
                    autoStart
                    singleAttempt
                    onResult={result => onUserResult(turn, result)}
                  />
                </>
              )}
              <Text style={styles.progress}>{fa(Math.min(turn + 1, lines.length))} از {fa(lines.length)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {phase === 'done' ? (
        <View style={styles.doneCard}>
          <Text style={styles.doneTitle}>پایان گفت‌وگو</Text>
          {score === null ? (
            <Text style={styles.doneScore}>—</Text>
          ) : (
            <Text style={[styles.doneScore, score >= 70 ? styles.scoreGood : styles.scoreWeak]}>{fa(score)}٪</Text>
          )}
          <Text style={styles.doneEvaluation}>{evaluationFor(score ?? 0)}</Text>
          {userIndexes.map(index => {
            const result = results[index];
            if (!result) return null;
            const missed = result.words.filter(word => !word.ok).map(word => word.word);
            return (
              <View key={`review-${index}`} style={styles.reviewRow}>
                <Text style={styles.reviewLine}>{lines[index]?.text}</Text>
                {missed.length ? <Text style={styles.reviewMissed}>واژه‌های ناقص: {missed.join('، ')}</Text> : <Text style={styles.reviewOk}>روان و کامل</Text>}
              </View>
            );
          })}
        </View>
      ) : null}

      <Pressable accessibilityRole="button" accessibilityLabel="مکالمه با شخص زنده" style={[styles.liveButton, { backgroundColor: accent }]} onPress={openLiveConversation}>
        <MessageCircle size={18} color="#FFFFFF" />
        <Text style={styles.liveButtonText}>مکالمه با شخص زنده</Text>
        <ChevronLeft size={16} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: Spacing.md },
  headerCard: { width: '100%', borderWidth: 1, borderColor: Palette.border, borderStartWidth: 4, borderStartColor: Palette.primary, borderRadius: Radius.lg, backgroundColor: Palette.surface, padding: Spacing.md, gap: Spacing.xs },
  headerTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  headerSituation: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Palette.text, textAlign: 'right', lineHeight: 22, writingDirection: 'rtl' },
  headerNote: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  chooseCard: { width: '100%', borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.lg, backgroundColor: Palette.surface, padding: Spacing.md, gap: Spacing.sm },
  chooseQuestion: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  chooseButton: { minHeight: 48, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.canvas, alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm },
  chooseButtonText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Palette.ink, textAlign: 'center', writingDirection: 'rtl' },
  transcript: { width: '100%', gap: Spacing.xs },
  bubbleRow: { alignItems: 'flex-start' },
  bubbleRowMine: { alignItems: 'flex-end' },
  bubble: { maxWidth: '92%', borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.lg, backgroundColor: Palette.surface, padding: Spacing.sm, gap: 2 },
  bubbleMine: { backgroundColor: Palette.primarySoft },
  bubbleHead: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bubbleSpeaker: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.muted, writingDirection: 'rtl' },
  bubbleForeign: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Palette.ink, textAlign: 'right' },
  bubbleFa: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  bubbleScore: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, textAlign: 'right', writingDirection: 'rtl', marginTop: 2 },
  scoreGood: { color: Palette.success },
  scoreWeak: { color: Palette.danger },
  turnCard: { width: '100%', borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.lg, backgroundColor: Palette.canvas, padding: Spacing.md, gap: Spacing.sm },
  turnText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  progress: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.muted, textAlign: 'center' },
  doneCard: { width: '100%', borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.lg, backgroundColor: Palette.surface, padding: Spacing.md, gap: Spacing.sm },
  doneTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  doneScore: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xl, textAlign: 'right', color: Palette.ink },
  doneEvaluation: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Palette.text, textAlign: 'right', lineHeight: 22, writingDirection: 'rtl' },
  reviewRow: { width: '100%', borderTopWidth: 1, borderTopColor: Palette.border, paddingTop: Spacing.xs, gap: 2 },
  reviewLine: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Palette.ink, textAlign: 'right' },
  reviewOk: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.success, textAlign: 'right', writingDirection: 'rtl' },
  reviewMissed: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.danger, textAlign: 'right', writingDirection: 'rtl' },
  liveButton: { minHeight: 48, borderRadius: Radius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm },
  liveButtonText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: '#FFFFFF', textAlign: 'center', writingDirection: 'rtl' },
});
