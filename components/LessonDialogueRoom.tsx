import { LocalizedText as Text } from '@/components/LocalizedText';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Bot, ChevronLeft, EyeOff, MessageCircle, RefreshCw, UserRound, Volume2 } from 'lucide-react-native';
import SpeakCheck, { type SpeakCheckResult } from '@/components/SpeakCheck';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';
import { stop as stopCourseSpeech } from '@/lib/courseSpeech';
import { Radius, Shadows, Spacing, Typography } from '@/lib/theme';
import { toPersianDigits as fa } from '@/lib/format';
import { loadRuns, saveRun, uniqueMissedWords, type DialogueRun } from '@/lib/dialogueRoomHistory';

/**
 * «اتاق گفت‌وگو» — the friendly closing room of every lesson.
 * No new content is invented here: the room runs exactly the sentences the
 * lesson already teaches (the standard eight). The operator reads half of
 * them with their own distinct voice and the learner says the other half,
 * one pass, no retries; each learner line is scored by the device recogniser
 * and the room ends with a real error report, a progress trend against the
 * previous run and a working restart. A hidden exam mode runs the same
 * dialogue without showing the text: listen and answer from memory.
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
  /** The operator's own voice (distinct pitch/voice). Defaults to the lesson voice. */
  onSpeakOperator?: (text: string, onDone: () => void) => void;
  accent?: string;
};

type Speaker = 'operator' | 'me';

function evaluationFor(score: number) {
  if (score >= 90) return 'عالی بود! جمله‌های تو روان و واضح شنیده شد.';
  if (score >= 70) return 'خوب بود؛ واژه‌های قرمز را یک‌بار در درس گوش بده و تمرین کن.';
  if (score >= 40) return 'شروع خوبی بود؛ جمله‌های ناقص را آهسته‌تر و کنار صدای اپراتور تمرین کن.';
  return 'اشکالی ندارد؛ اول جمله‌های درس را گوش بده و دوباره به این اتاق برگرد.';
}

function scoreColor(score: number): string {
  if (score >= 70) return Palette.success;
  if (score >= 40) return Palette.warning;
  return Palette.danger;
}

/** The score ring on the final report card: a track circle plus a progress arc. */
function ScoreRing({ score }: { score: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const color = scoreColor(score);
  return (
    <View style={styles.ringWrap}>
      <Svg width={112} height={112} viewBox="0 0 112 112">
        <Circle cx={56} cy={56} r={radius} stroke={Palette.border} strokeWidth={9} fill="none" />
        <Circle
          cx={56}
          cy={56}
          r={radius}
          stroke={score === 0 ? color : color}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(circumference * Math.max(score, 2)) / 100} ${circumference}`}
          transform="rotate(-90 56 56)"
        />
      </Svg>
      <View style={styles.ringCenter} pointerEvents="none">
        <Text style={[styles.ringScore, { color: score === 0 ? Palette.ink : color }]}>{fa(score)}٪</Text>
      </View>
    </View>
  );
}

export default function LessonDialogueRoom({ language, lessonId, lessonTitle, levelId, situation, lines, locale, onSpeak, onSpeakOperator, accent = Palette.primary }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<'choose' | 'run' | 'done'>('choose');
  const [starter, setStarter] = useState<Speaker>('operator');
  const [exam, setExam] = useState(false);
  const [turn, setTurn] = useState(0);
  const [results, setResults] = useState<Record<number, SpeakCheckResult>>({});
  const [pastRuns, setPastRuns] = useState<DialogueRun[]>([]);

  const turnRef = useRef(0);
  turnRef.current = turn;
  const spokenRef = useRef<Set<string>>(new Set());
  const advancedRef = useRef<number>(-1);
  // Lesson props arrive as fresh array/function identities on every parent
  // render. The room must never stop or restart its voice because of that, so
  // the speech effect reads them through refs and depends on turn state only.
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const onSpeakRef = useRef(onSpeak);
  onSpeakRef.current = onSpeak;
  const onSpeakOperatorRef = useRef(onSpeakOperator ?? onSpeak);
  onSpeakOperatorRef.current = onSpeakOperator ?? onSpeak;

  const speakerOf = useCallback((index: number): Speaker => ((index % 2 === 0) === (starter === 'operator') ? 'operator' : 'me'), [starter]);

  // One advance per turn, bound to that turn: a late callback for an earlier
  // line (a voice stopped without callbacks, a stale recogniser result) must
  // never skip a sentence or re-advance the same one.
  const advanceFor = useCallback((index: number) => {
    if (index !== turnRef.current || advancedRef.current === index) return;
    advancedRef.current = index;
    if (index + 1 < linesRef.current.length) setTurn(index + 1);
    else setPhase('done');
  }, []);

  // Every turn carries its own watchdog: the operator's voice reports done or
  // error itself, and if any engine never reports either (a stopped utterance,
  // a dead microphone), the generous timekeeper carries the room to the end so
  // the dialogue always runs through — fully hands-free.
  useEffect(() => {
    if (phase !== 'run') return;
    const line = linesRef.current[turn];
    if (!line) return;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    if (speakerOf(turn) === 'operator') {
      const key = `${starter}:${turn}`;
      if (!spokenRef.current.has(key)) {
        spokenRef.current.add(key);
        onSpeakOperatorRef.current(line.text, () => advanceFor(turn));
      }
      watchdog = setTimeout(() => advanceFor(turn), Math.min(30000, Math.max(15000, 4000 + line.text.length * 150)));
    } else {
      // The learner's turn: SpeakCheck opens the microphone by itself; if the
      // recogniser never returns anything at all, move on and mark it skipped.
      watchdog = setTimeout(() => advanceFor(turn), Math.max(30000, 12000 + line.text.length * 200));
    }
    return () => { if (watchdog) clearTimeout(watchdog); };
  }, [phase, turn, starter, speakerOf, advanceFor]);

  useEffect(() => { void loadRuns(lessonId).then(setPastRuns); }, [lessonId]);
  useEffect(() => () => { void stopCourseSpeech(); }, []);

  const start = useCallback((who: Speaker, examMode: boolean) => {
    void stopCourseSpeech();
    spokenRef.current = new Set();
    advancedRef.current = -1;
    turnRef.current = 0;
    setStarter(who);
    setExam(examMode);
    setTurn(0);
    setResults({});
    setPhase('run');
  }, []);

  const onUserResult = useCallback((index: number, result: SpeakCheckResult) => {
    if (index !== turnRef.current) return;
    setResults(current => (current[index] ? current : { ...current, [index]: result }));
    advanceFor(index);
  }, [advanceFor]);

  const userIndexes = useMemo(() => lines.map((_, index) => index).filter(index => speakerOf(index) === 'me'), [lines, speakerOf]);

  const score = useMemo(() => {
    const scored = userIndexes.map(index => results[index]?.score).filter((value): value is number => typeof value === 'number');
    if (!scored.length) return null;
    return Math.round(scored.reduce((sum, value) => sum + value, 0) / scored.length);
  }, [results, userIndexes]);

  // Real error-finding from the recogniser results: per-line verdicts, the
  // transcript the device actually heard, and the exact words to re-practise.
  const summary = useMemo(() => {
    if (phase !== 'done') return null;
    const attempted = userIndexes.filter(index => results[index]);
    const complete = attempted.filter(index => results[index]!.words.every(word => word.ok)).length;
    const skipped = userIndexes.length - attempted.length;
    const parts = [`${fa(complete)} جملهٔ کامل از ${fa(userIndexes.length)} نوبت تو`];
    if (skipped) parts.push(`${fa(skipped)} جمله گفته نشد`);
    return parts.join(' · ');
  }, [phase, results, userIndexes]);

  const missedWords = useMemo(() => {
    if (phase !== 'done') return [];
    const seen = new Set<string>();
    for (const index of userIndexes) {
      for (const word of results[index]?.words ?? []) {
        if (!word.ok) seen.add(word.word);
      }
    }
    return [...seen];
  }, [phase, results, userIndexes]);

  // Words the learner has now missed twice or more across runs — the ones to
  // practise first.
  const repeatMisses = useMemo(() => {
    if (phase !== 'done') return new Set<string>();
    const earlier = new Set<string>();
    for (const run of pastRuns) for (const word of run.missed) earlier.add(word);
    const repeated = new Set<string>();
    for (const word of missedWords) if (earlier.has(word.toLocaleLowerCase())) repeated.add(word);
    return repeated;
  }, [phase, missedWords, pastRuns]);

  const trend = useMemo(() => {
    if (phase !== 'done' || score === null || !pastRuns.length) return null;
    const previous = pastRuns[pastRuns.length - 1].score;
    if (previous === score) return `هم‌سطح اجرای قبل (${fa(previous)}٪)`;
    const delta = score - previous;
    return `${delta > 0 ? '+' : '−'}${fa(Math.abs(delta))}٪ نسبت به اجرای قبل (${fa(previous)}٪)`;
  }, [phase, score, pastRuns]);

  // Persist this run once the final card shows, so the next visit has a trend.
  const savedRef = useRef(false);
  useEffect(() => {
    if (phase !== 'done' || score === null || savedRef.current) return;
    savedRef.current = true;
    void saveRun(lessonId, {
      score,
      attempted: userIndexes.filter(index => results[index]).length,
      total: userIndexes.length,
      missed: uniqueMissedWords(missedWords),
      at: Date.now(),
    }).then(setPastRuns);
  }, [phase, score, lessonId, userIndexes, results, missedWords]);

  const restart = useCallback(() => {
    void stopCourseSpeech();
    spokenRef.current = new Set();
    advancedRef.current = -1;
    turnRef.current = 0;
    setTurn(0);
    setResults({});
    setPhase('choose');
  }, []);

  const replayOperator = useCallback((text: string) => {
    void stopCourseSpeech();
    onSpeakOperatorRef.current(text, () => undefined);
  }, []);

  const openLiveConversation = useCallback(() => {
    router.push({ pathname: '/conversations', params: { language, lessonId, lessonTitle, levelId: String(levelId), situation } } as never);
  }, [router, language, lessonId, lessonTitle, levelId, situation]);

  const lineLabel = (index: number) => (speakerOf(index) === 'operator' ? 'اپراتور' : 'شما');

  // Heat-map text for a learner line: each word takes its verdict colour.
  const learnerText = (result: SpeakCheckResult | undefined) => {
    if (!result) return null;
    return (
      <Text style={styles.bubbleForeign}>
        {result.words.map((word, wordIndex) => (
          <Text
            key={`${word.word}-${wordIndex}`}
            style={{ color: word.state === 'ok' ? Palette.success : word.state === 'near' ? Palette.warning : Palette.danger }}
          >
            {word.word}{wordIndex < result.words.length - 1 ? ' ' : ''}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>اتاق گفت‌وگو</Text>
        <Text style={styles.headerSituation}>{situation}</Text>
        <Text style={styles.headerNote}>
          {fa(lines.length)} جملهٔ همین درس روی میز است؛ نیمی را اپراتور با صدای خودش می‌گوید و نیمی را شما — هر جمله فقط یک‌بار.
        </Text>
      </View>

      {phase === 'choose' ? (
        <View style={styles.chooseCard}>
          <Text style={styles.chooseQuestion}>چه کسی گفت‌وگو را شروع می‌کند؟</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="اپراتور شروع می‌کند" style={styles.chooseButton} onPress={() => start('operator', false)}>
            <Bot size={18} color={accent} />
            <Text style={styles.chooseButtonText}>اپراتور شروع می‌کند</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="من شروع می‌کنم" style={styles.chooseButton} onPress={() => start('me', false)}>
            <UserRound size={18} color={accent} />
            <Text style={styles.chooseButtonText}>من شروع می‌کنم</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="حالت آزمون" style={styles.chooseExamButton} onPress={() => start(starter, true)}>
            <EyeOff size={16} color={Palette.primaryDark} />
            <Text style={styles.chooseExamText}>حالت آزمون — بدون دیدن متن</Text>
          </Pressable>
          <Text style={styles.chooseHint}>از انتخاب تا کارت نتیجه هیچ لمسی لازم نیست؛ همه‌چیز خودکار پیش می‌رود.</Text>
        </View>
      ) : null}

      {phase !== 'choose' ? (
        <View style={styles.transcript}>
          {lines.map((line, index) => {
            if (index > turn && phase === 'run') return null;
            const mine = speakerOf(index) === 'me';
            const result = mine ? results[index] : undefined;
            const active = phase === 'run' && index === turn;
            // In exam mode the not-yet-passed lines stay hidden; passed lines reveal.
            const reveal = !exam || index < turn || phase === 'done' || (mine && result);
            return (
              <View key={`${index}-${line.text}`} style={[styles.bubbleRow, mine ? styles.bubbleRowMine : null]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : null, active ? { borderColor: accent } : null]}>
                  <View style={styles.bubbleHead}>
                    {mine ? <UserRound size={13} color={accent} /> : <Bot size={13} color={Palette.muted} />}
                    <Text style={styles.bubbleSpeaker}>{lineLabel(index)}</Text>
                    {!mine && !active && phase !== 'run' ? (
                      <Pressable accessibilityRole="button" accessibilityLabel={`شنیدن دوبارهٔ جملهٔ اپراتور`} hitSlop={8} style={styles.replayButton} onPress={() => replayOperator(line.text)}>
                        <Volume2 size={13} color={accent} />
                      </Pressable>
                    ) : null}
                  </View>
                  {reveal ? (
                    <>
                      {mine && result ? learnerText(result) : <Text style={styles.bubbleForeign}>{line.text}</Text>}
                      <Text style={styles.bubbleFa}>{line.fa}</Text>
                    </>
                  ) : (
                    <Text style={styles.bubbleHidden}>
                      {mine ? 'از حافظه بگو — جمله پنهان است' : `جملهٔ ${fa(index + 1)} — فقط گوش کن`}
                    </Text>
                  )}
                  {result ? <Text style={[styles.bubbleScore, result.score >= 70 ? styles.scoreGood : styles.scoreWeak]}>امتیاز این جمله: {fa(result.score)}٪</Text> : null}
                  {mine && !result && phase === 'done' ? <Text style={styles.bubbleScore}>این جمله نوبت تو بود و گفته نشد</Text> : null}
                </View>
              </View>
            );
          })}
          {phase === 'run' ? (
            <View style={styles.turnCard}>
              {speakerOf(turn) === 'operator' ? (
                <Text style={styles.turnText}>{exam ? `جملهٔ ${fa(turn + 1)} — گوش کن و آماده باش.` : 'اپراتور دارد می‌گوید… گوش کن.'}</Text>
              ) : (
                <>
                  <Text style={styles.turnText}>{exam ? 'نوبت توست — همین جمله را از حافظه بگو:' : 'نوبت توست — همین جمله را بگو:'}</Text>
                  <SpeakCheck
                    key={`${turn}-${lines[turn]?.text ?? ''}`}
                    text={lines[turn]?.text ?? ''}
                    locale={locale}
                    accent={accent}
                    autoStart
                    singleAttempt
                    blindExam={exam}
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
            <ScoreRing score={score} />
          )}
          <Text style={styles.doneEvaluation}>{evaluationFor(score ?? 0)}</Text>
          {summary ? <Text style={styles.doneSummary}>{summary}</Text> : null}
          {trend ? <Text style={styles.doneTrend}>{trend}</Text> : null}
          {exam ? <Text style={styles.doneExamBadge}>اجرای آزمونی — بدون دیدن متن</Text> : null}
          {userIndexes.map(index => {
            const result = results[index];
            if (!result) return null;
            const missed = result.words.filter(word => word.state === 'miss').map(word => word.word);
            const near = result.words.filter(word => word.state === 'near').map(word => word.word);
            const heard = result.heard;
            return (
              <View key={`review-${index}`} style={styles.reviewRow}>
                <Text style={styles.reviewLine}>{lines[index]?.text}</Text>
                {heard && missed.length ? <Text style={styles.reviewHeard}>دستگاه این را شنید: {heard}</Text> : null}
                {missed.length ? <Text style={styles.reviewMissed}>شنیده نشد: {missed.join('، ')}</Text> : null}
                {near.length ? <Text style={styles.reviewNear}>نزدیک بود ولی دقیق نبود: {near.join('، ')}</Text> : null}
                {!missed.length && !near.length ? <Text style={styles.reviewOk}>روان و کامل</Text> : null}
              </View>
            );
          })}
          {missedWords.length ? (
            <View style={styles.chipWrap}>
              <Text style={styles.doneErrors}>برای تمرین دوباره:</Text>
              <View style={styles.chipRow}>
                {missedWords.map(word => (
                  <View key={word} style={[styles.chip, repeatMisses.has(word) ? styles.chipRepeat : null]}>
                    <Text style={repeatMisses.has(word) ? styles.chipRepeatText : styles.chipText}>{word}{repeatMisses.has(word) ? ' · همیشه' : ''}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          <Pressable accessibilityRole="button" accessibilityLabel="شروع مجدد گفت‌وگو" style={styles.restartButton} onPress={restart}>
            <RefreshCw size={16} color={accent} />
            <Text style={styles.restartText}>شروع مجدد گفت‌وگو</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.liveCard}>
        <Pressable accessibilityRole="button" accessibilityLabel="مکالمه با شخص زنده" style={[styles.liveButton, { backgroundColor: accent }]} onPress={openLiveConversation}>
          <MessageCircle size={18} color="#FFFFFF" />
          <Text style={styles.liveButtonText}>مکالمه با شخص زنده</Text>
          <ChevronLeft size={16} color="#FFFFFF" />
        </Pressable>
      </View>
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
  chooseExamButton: { minHeight: 44, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.primarySoft, backgroundColor: Palette.primarySoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm },
  chooseExamText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Palette.primaryDark, textAlign: 'center', writingDirection: 'rtl' },
  chooseHint: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  transcript: { width: '100%', gap: Spacing.xs },
  bubbleRow: { alignItems: 'flex-start' },
  bubbleRowMine: { alignItems: 'flex-end' },
  bubble: { maxWidth: '92%', borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.lg, backgroundColor: Palette.surface, padding: Spacing.sm, gap: 2 },
  bubbleMine: { backgroundColor: Palette.primarySoft },
  bubbleHead: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bubbleSpeaker: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.muted, writingDirection: 'rtl' },
  replayButton: { paddingHorizontal: 6, paddingVertical: 2 },
  bubbleForeign: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Palette.ink, textAlign: 'right' },
  bubbleFa: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  bubbleHidden: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Palette.muted, textAlign: 'right', fontStyle: 'italic', writingDirection: 'rtl' },
  bubbleScore: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, textAlign: 'right', writingDirection: 'rtl', marginTop: 2 },
  scoreGood: { color: Palette.success },
  scoreWeak: { color: Palette.danger },
  turnCard: { width: '100%', borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.lg, backgroundColor: Palette.canvas, padding: Spacing.md, gap: Spacing.sm },
  turnText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  progress: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.muted, textAlign: 'center' },
  doneCard: { width: '100%', borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.lg, backgroundColor: Palette.surface, padding: Spacing.md, gap: Spacing.sm },
  doneTitle: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  doneScore: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xl, textAlign: 'right', color: Palette.ink },
  ringWrap: { width: 112, height: 112, alignSelf: 'flex-end', marginVertical: Spacing.xs },
  ringCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  ringScore: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.lg, color: Palette.ink },
  doneEvaluation: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Palette.text, textAlign: 'right', lineHeight: 22, writingDirection: 'rtl' },
  doneSummary: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  doneTrend: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Palette.primaryDark, textAlign: 'right', writingDirection: 'rtl' },
  doneExamBadge: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  reviewRow: { width: '100%', borderTopWidth: 1, borderTopColor: Palette.border, paddingTop: Spacing.xs, gap: 2 },
  reviewLine: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Palette.ink, textAlign: 'right' },
  reviewHeard: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.text, textAlign: 'right', writingDirection: 'rtl' },
  reviewOk: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.success, textAlign: 'right', writingDirection: 'rtl' },
  reviewMissed: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.danger, textAlign: 'right', writingDirection: 'rtl' },
  reviewNear: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.warning, textAlign: 'right', writingDirection: 'rtl' },
  chipWrap: { width: '100%', gap: Spacing.xs },
  chipRow: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderRadius: Radius.full, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.canvas, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.primaryDark, writingDirection: 'rtl' },
  chipRepeat: { borderColor: Palette.danger, backgroundColor: Palette.dangerSoft },
  chipRepeatText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.danger, writingDirection: 'rtl' },
  doneErrors: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Palette.primaryDark, textAlign: 'right', writingDirection: 'rtl' },
  restartButton: { minHeight: 44, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.canvas, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm },
  restartText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Palette.primaryDark, textAlign: 'center', writingDirection: 'rtl' },
  liveCard: { width: '100%', marginTop: Spacing.xl, padding: Spacing.md, borderRadius: Radius.xl, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border, ...Shadows.card },
  liveButton: { width: '100%', minHeight: 48, borderRadius: Radius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm },
  liveButtonText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: '#FFFFFF', textAlign: 'center', writingDirection: 'rtl' },
});
