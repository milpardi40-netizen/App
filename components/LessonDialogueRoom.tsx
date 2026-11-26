import { LocalizedText as Text } from '@/components/LocalizedText';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Bot, ChevronLeft, EyeOff, Headphones, MessageCircle, Mic, RefreshCw, UserRound, Volume2 } from 'lucide-react-native';
import SpeakCheck, { type SpeakCheckResult } from '@/components/SpeakCheck';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';
import { stop as stopCourseSpeech } from '@/lib/courseSpeech';
import { Radius, Shadows, Spacing, Typography } from '@/lib/theme';
import { toPersianDigits as fa } from '@/lib/format';
import { comparableRoomRuns, firstWordCue, roomNextStep, type RoomPracticeMode } from '@/lib/dialogueRoomCoach';
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
  /** Keep runs from different authored content versions out of the same trend. */
  contentRevision?: string;
  lessonTitle: string;
  levelId: number;
  situation: string;
  lines: readonly DialogueLine[];
  locale: string;
  onSpeak: (text: string, onDone: () => void) => void;
  /** The operator's own voice (distinct pitch/voice). Defaults to the lesson voice. */
  onSpeakOperator?: (text: string, onDone: () => void) => void;
  onSpeakSlow?: (text: string, onDone: () => void) => void;
  accent?: string;
};

type Speaker = 'operator' | 'me';

function evaluationFor(score: number) {
  if (score >= 90) return 'متن تشخیص‌داده‌شده به نمونه خیلی نزدیک بود؛ حالا با راهنمای کمتر تمرین کن.';
  if (score >= 70) return 'بیشتر متن نمونه تشخیص داده شد؛ فقط جمله‌های مشخص‌شده را دوباره تمرین کن.';
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

/** A speaking indicator, not a microphone-level visualisation. */
function OperatorPresence({ speaking, accent }: { speaking: boolean; accent: string }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let disposed = false;
    let animation: Animated.CompositeAnimation | undefined;
    const update = (reduce: boolean) => {
      animation?.stop();
      pulse.setValue(0);
      if (!disposed && speaking && !reduce) {
        animation = Animated.loop(Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]));
        animation.start();
      }
    };
    void AccessibilityInfo.isReduceMotionEnabled().then(update).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', update);
    return () => { disposed = true; animation?.stop(); subscription.remove(); };
  }, [speaking, pulse]);
  return (
    <View style={styles.presence} accessible accessibilityLabel={speaking ? 'نوبت صحبت اپراتور' : 'همراه تمرین شما'}>
      <Animated.View style={[styles.presenceHalo, { borderColor: accent + '30', opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }] }]} />
      <View style={[styles.presenceAvatar, { backgroundColor: accent }]}><Bot size={38} color="#FFFFFF" strokeWidth={1.5} /></View>
      <View style={styles.voiceBars}>{[8, 16, 24, 13, 20, 10, 17].map((height, index) => <Animated.View key={index} style={{ width: 4, height: speaking ? height : 4, borderRadius: 3, backgroundColor: accent, opacity: speaking ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) : 0.3 }} />)}</View>
    </View>
  );
}

export default function LessonDialogueRoom({ language, lessonId, contentRevision, lessonTitle, levelId, situation, lines, locale, onSpeak, onSpeakOperator, onSpeakSlow, accent = Palette.primary }: Props) {
  const router = useRouter();
  const historyKey = contentRevision ? `${lessonId}:${contentRevision}` : lessonId;
  const [phase, setPhase] = useState<'choose' | 'run' | 'done'>('choose');
  const [starter, setStarter] = useState<Speaker>('operator');
  const [practicePath, setPracticePath] = useState<'guided' | 'cued'>('guided');
  const [helpVisible, setHelpVisible] = useState(false);
  const [hintKind, setHintKind] = useState<'none' | 'cue' | 'sample'>('none');
  const [samplePlaying, setSamplePlaying] = useState(false);
  const [helpedTurns, setHelpedTurns] = useState<Set<number>>(new Set());
  const [exam, setExam] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const savedRef = useRef(false);
  const [turn, setTurn] = useState(0);
  const [results, setResults] = useState<Record<number, SpeakCheckResult>>({});
  const [pastRuns, setPastRuns] = useState<DialogueRun[]>([]);

  const mode: RoomPracticeMode = exam ? 'exam' : practicePath;
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

  const slowSpeakRef = useRef(onSpeakSlow);
  slowSpeakRef.current = onSpeakSlow;

  const speakerOf = useCallback((index: number): Speaker => ((index % 2 === 0) === (starter === 'operator') ? 'operator' : 'me'), [starter]);

  // One advance per turn, bound to that turn: a late callback for an earlier
  // line (a voice stopped without callbacks, a stale recogniser result) must
  // never skip a sentence or re-advance the same one.
  const advanceFor = useCallback((index: number) => {
    if (index !== turnRef.current || advancedRef.current === index) return;
    advancedRef.current = index;
    setSamplePlaying(false);
    if (index + 1 < linesRef.current.length) setTurn(index + 1);
    else setPhase('done');
  }, []);

  // Every turn carries its own watchdog: the operator's voice reports done or
  // error itself, and if any engine never reports either (a stopped utterance,
  // a dead microphone), the generous timekeeper carries the room to the end so
  // the dialogue always runs through — fully hands-free.
  useEffect(() => {
    if (phase !== 'run' || samplePlaying) return;
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
  }, [phase, turn, starter, speakerOf, advanceFor, samplePlaying]);

  useEffect(() => {
    setHelpVisible(false);
    setHintKind('none');
    if (phase !== 'run' || exam || speakerOf(turn) !== 'me') return;
    const timer = setTimeout(() => setHelpVisible(true), 6500);
    return () => clearTimeout(timer);
  }, [phase, turn, exam, speakerOf]);

  useEffect(() => {
    if (!samplePlaying || phase !== 'run') return;
    let active = true;
    const done = () => { if (active) setSamplePlaying(false); };
    // The microphone has unmounted before this effect plays the sample.
    const timer = setTimeout(done, 25000);
    void stopCourseSpeech().then(() => {
      if (!active) return;
      const speak = slowSpeakRef.current ?? onSpeakRef.current;
      try { speak(linesRef.current[turn]?.text ?? '', done); } catch { done(); }
    }).catch(done);
    return () => { active = false; clearTimeout(timer); void stopCourseSpeech(); };
  }, [samplePlaying, phase, turn]);

  const requestHelp = (kind: 'cue' | 'sample' | 'audio') => {
    if (exam) return;
    setHelpVisible(true);
    setHelpedTurns(current => new Set(current).add(turn));
    if (kind === 'audio') setSamplePlaying(true);
    else setHintKind(kind);
  };

  useEffect(() => { void loadRuns(historyKey).then(setPastRuns); }, [historyKey]);
  useEffect(() => () => { void stopCourseSpeech(); }, []);

  const start = useCallback((who: Speaker, examMode: boolean) => {
    void stopCourseSpeech();
    spokenRef.current = new Set();
    advancedRef.current = -1;
    turnRef.current = 0;
    savedRef.current = false;
    setShowHistory(false);
    setReviewIndex(null);
    setSamplePlaying(false);
    setHelpedTurns(new Set());
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
    const scored = userIndexes.filter(index => results[index]?.heard.trim()).map(index => results[index]?.score).filter((value): value is number => typeof value === 'number');
    if (!scored.length) return null;
    return Math.round(scored.reduce((sum, value) => sum + value, 0) / scored.length);
  }, [results, userIndexes]);

  // Real error-finding from the recogniser results: per-line verdicts, the
  // transcript the device actually heard, and the exact words to re-practise.
  const summary = useMemo(() => {
    if (phase !== 'done') return null;
    const attempted = userIndexes.filter(index => results[index]?.heard.trim());
    const complete = attempted.filter(index => results[index]!.words.length > 0 && results[index]!.words.every(word => word.ok)).length;
    const skipped = userIndexes.length - attempted.length;
    const parts = [`${fa(complete)} جمله مطابق نمونه از ${fa(userIndexes.length)} نوبت تو`];
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
    const comparable = comparableRoomRuns(pastRuns, mode);
    if (!comparable.length) return null;
    const previous = comparable[comparable.length - 1].score;
    if (previous === score) return `هم‌سطح اجرای قبل (${fa(previous)}٪)`;
    const delta = score - previous;
    return `${delta > 0 ? '+' : '−'}${fa(Math.abs(delta))}٪ نسبت به اجرای قبل (${fa(previous)}٪)`;
  }, [phase, score, pastRuns, mode]);

  // Persist this run once the final card shows, so the next visit has a trend.
  useEffect(() => {
    if (phase !== 'done' || score === null || savedRef.current) return;
    savedRef.current = true;
    void saveRun(historyKey, {
      score,
      mode,
      helped: helpedTurns.size,
      attempted: userIndexes.filter(index => results[index]?.heard.trim()).length,
      total: userIndexes.length,
      missed: uniqueMissedWords(missedWords),
      at: Date.now(),
    }).catch(() => { savedRef.current = false; });
  }, [phase, score, historyKey, userIndexes, results, missedWords, mode, helpedTurns]);

  const restart = useCallback(() => {
    void stopCourseSpeech();
    spokenRef.current = new Set();
    advancedRef.current = -1;
    turnRef.current = 0;
    setTurn(0);
    setResults({});
    savedRef.current = false;
    setShowHistory(false);
    setReviewIndex(null);
    setSamplePlaying(false);
    setHelpedTurns(new Set());
    void loadRuns(historyKey).then(setPastRuns).catch(() => undefined);
    setPhase('choose');
  }, [historyKey]);

  const replayOperator = useCallback((text: string) => {
    void stopCourseSpeech();
    onSpeakOperatorRef.current(text, () => undefined);
  }, []);

  const openLiveConversation = useCallback(() => {
    router.push({ pathname: '/conversations', params: { language, lessonId, lessonTitle, levelId: String(levelId), situation } } as never);
  }, [router, language, lessonId, lessonTitle, levelId, situation]);

  const reviewIndexes = userIndexes.filter(index => !results[index]?.heard.trim() || results[index].words.some(word => !word.ok));
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
        <View style={styles.roomHeading}>
          <View style={[styles.roomIcon, { backgroundColor: accent + '12' }]}><Headphones size={24} color={accent} /></View>
          <View style={styles.headingCopy}>
            <Text style={styles.headerEyebrow}>تمرین مکالمهٔ درس</Text>
            <Text style={styles.headerTitle}>اتاق گفت‌وگو</Text>
          </View>
        </View>
        <Text style={styles.headerSituation}>{situation}</Text>
        <View style={styles.roomMeta}>
          <View style={styles.metaItem}><MessageCircle size={14} color={Palette.primaryDark} /><Text style={styles.metaText}>{fa(lines.length)} جمله</Text></View>
          <View style={styles.metaItem}><Mic size={14} color={Palette.primaryDark} /><Text style={styles.metaText}>تمرین نوبتی</Text></View>
          <View style={styles.metaItem}><Headphones size={14} color={Palette.primaryDark} /><Text style={styles.metaText}>گوش کن و پاسخ بده</Text></View>
        </View>
        <Text style={styles.headerNote}>نیمی از جمله‌ها را اپراتور می‌گوید و نیمی را شما؛ هر جمله یک‌بار.</Text>
      </View>

      {phase === 'choose' ? (
        <View style={styles.callCard}>
          <View style={styles.readyBadge}><View style={styles.readyDot} /><Text style={styles.readyText}>آمادهٔ تمرین با شما</Text></View>
          <OperatorPresence speaking={false} accent={accent} />
          <Text style={styles.callTitle}>یک گفت‌وگوی کوتاه، یک قدم جلوتر</Text>
          <Text style={styles.callSubtitle}>گوش بده، پاسخ بده و در پایان بازخورد بگیر.</Text>
          <View style={styles.preferences}>
            <Text style={styles.headerEyebrow}>مسیر تمرین</Text>
            <View style={styles.segmentRow}>
              {(['guided', 'cued'] as const).map(path => <Pressable key={path} accessibilityRole="button" accessibilityLabel={path === 'guided' ? 'مسیر با راهنما' : 'مسیر با اشاره'} accessibilityState={{ selected: practicePath === path }} onPress={() => setPracticePath(path)} style={[styles.segment, practicePath === path && styles.segmentSelected]}><Text style={[styles.segmentText, practicePath === path && { color: accent }]}>{path === 'guided' ? 'با راهنما' : 'با اشاره'}</Text></Pressable>)}
              <View accessible accessibilityLabel="گفت‌وگوی آزاد، غیرفعال؛ نیازمند سرویس هوش مصنوعی" accessibilityState={{ disabled: true }} style={[styles.segment, styles.unavailablePath]}><Text style={styles.segmentText}>آزاد · غیرفعال</Text></View>
            </View>
            <Text style={styles.pathDescription}>{practicePath === 'guided' ? 'متن و ترجمه همراه شماست؛ تمرین دقیق جمله‌های درس.' : 'اول معنی جمله را می‌بینی؛ متن کامل فقط با درخواست کمک باز می‌شود.'}</Text>
            <Text style={styles.serviceNote}>گفت‌وگوی آزادِ واکنش‌پذیر به سرویس هوش مصنوعی نیاز دارد؛ در نسخهٔ بدون هزینه غیرفعال است.</Text>
            <Text style={styles.headerEyebrow}>چه کسی شروع کند؟</Text>
            <View style={styles.segmentRow}>
              {(['operator', 'me'] as const).map(who => <Pressable key={who} accessibilityRole="button" accessibilityLabel={who === 'operator' ? 'اپراتور شروع می‌کند' : 'من شروع می‌کنم'} accessibilityState={{ selected: starter === who }} onPress={() => setStarter(who)} style={[styles.segment, starter === who && styles.segmentSelected]}>
                {who === 'operator' ? <Bot size={16} color={starter === who ? accent : Palette.muted} /> : <UserRound size={16} color={starter === who ? accent : Palette.muted} />}
                <Text style={[styles.segmentText, starter === who && { color: accent }]}>{who === 'operator' ? 'اپراتور' : 'من'}</Text>
              </Pressable>)}
            </View>
            <Pressable accessibilityRole="switch" accessibilityLabel="حالت آزمون" accessibilityState={{ checked: exam }} onPress={() => setExam(value => !value)} style={styles.examSetting}>
              <EyeOff size={18} color={exam ? accent : Palette.muted} />
              <View style={styles.choiceCopy}><Text style={styles.chooseExamText}>حالت آزمون</Text><Text style={styles.choiceDescription}>پاسخ از حافظه، بدون نمایش متن</Text></View>
              <View style={[styles.toggleTrack, exam && { backgroundColor: accent }]}><View style={[styles.toggleThumb, { alignSelf: exam ? 'flex-start' : 'flex-end' }]} /></View>
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="شروع گفت‌وگو" disabled={!lines.length} style={({ pressed }) => [styles.startCall, { backgroundColor: accent }, pressed && styles.pressed]} onPress={() => start(starter, exam)}>
            <Mic size={21} color="#FFFFFF" /><Text keepColor style={styles.startCallText}>شروع گفت‌وگو</Text><ChevronLeft size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.chooseHint}>دسترسی میکروفن لازم است؛ پردازش گفتار در سرویس دستگاه یا مرورگر ممکن است اینترنت بخواهد.</Text>
        </View>
      ) : null}

      {phase === 'run' ? (
        <View style={styles.sessionCard} accessibilityLiveRegion="polite">
          <OperatorPresence speaking={speakerOf(turn) === 'operator'} accent={accent} />
          <View style={styles.sessionTop}>
            <View style={styles.metaItem}>{speakerOf(turn) === 'operator' ? <Headphones size={16} color={accent} /> : <Mic size={16} color={accent} />}<Text style={styles.sessionLabel}>{speakerOf(turn) === 'operator' ? 'نوبت اپراتور · گوش بده' : 'نوبت شما · صحبت کن'}</Text></View>
            <Text style={styles.headerEyebrow}>{fa(Math.min(turn + 1, lines.length))} از {fa(lines.length)}</Text>
          </View>
          <View style={styles.sessionTrack}><View style={[styles.sessionFill, { backgroundColor: accent, width: `${lines.length ? Math.min(100, turn / lines.length * 100) : 0}%` }]} /></View>
          {exam ? <Text style={styles.headerEyebrow}>حالت آزمون · متن جمله‌ها پنهان است</Text> : null}
        </View>
      ) : null}

      {phase !== 'choose' ? (
        <View style={styles.transcript}>
          {(turn > 0 || phase === 'done') ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: showHistory }} onPress={() => setShowHistory(value => !value)} style={styles.historyToggle}><MessageCircle size={16} color={accent} /><Text style={styles.restartText}>{showHistory ? 'بستن متن گفت‌وگو' : 'مرور جمله‌های گفت‌وگو'}</Text></Pressable> : null}
          {lines.map((line, index) => {
            if (phase === 'run' && (index > turn || (index < turn && !showHistory))) return null;
            if (phase === 'done' && !showHistory) return null;
            const mine = speakerOf(index) === 'me';
            const result = mine ? results[index] : undefined;
            const active = phase === 'run' && index === turn;
            // In exam mode the not-yet-passed lines stay hidden; passed lines reveal.
            const reveal = phase === 'done' || index < turn || (mine && result) || (!exam && (practicePath === 'guided' || !mine || hintKind === 'sample'));
            return (
              <View key={`${index}-${line.text}`} style={[styles.bubbleRow, mine ? styles.bubbleRowMine : null]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : null, active ? [styles.focusBubble, { borderColor: accent }] : null]}>
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
                      {mine ? (exam ? 'از حافظه بگو — جمله پنهان است' : line.fa) : `جملهٔ ${fa(index + 1)} — فقط گوش کن`}
                    </Text>
                  )}
                  {active && mine && !exam && hintKind === 'cue' ? <Text style={styles.wordCue}>{firstWordCue(line.text)}</Text> : null}
                  {result ? <Text style={[styles.bubbleScore, result.score >= 70 ? styles.scoreGood : styles.scoreWeak]}>شباهت متن به نمونه: {fa(result.score)}٪</Text> : null}
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
                  <Text style={styles.turnText}>{exam ? 'نوبت توست — جمله را از حافظه بگو:' : practicePath === 'cued' ? 'نوبت توست — جملهٔ درس را با کمک معنی به یاد بیاور:' : 'نوبت توست — همین جمله را بگو:'}</Text>
                  {!exam ? <View style={styles.coachHelp}>
                    <Pressable accessibilityRole="button" accessibilityLabel="کمک می‌خواهم" accessibilityState={{ expanded: helpVisible }} onPress={() => setHelpVisible(value => !value)} style={styles.historyToggle}><Text style={styles.restartText}>{helpVisible ? 'بستن راهنما' : 'کمک می‌خواهم'}</Text></Pressable>
                    {helpVisible ? <View style={styles.helpActions}>
                      <Pressable accessibilityRole="button" accessibilityLabel="یک اشاره" onPress={() => requestHelp('cue')} style={styles.helpAction}><Text style={styles.segmentText}>یک اشاره</Text></Pressable>
                      <Pressable accessibilityRole="button" accessibilityLabel="نمونه پاسخ" onPress={() => requestHelp('sample')} style={styles.helpAction}><Text style={styles.segmentText}>نمونه پاسخ</Text></Pressable>
                      <Pressable accessibilityRole="button" accessibilityLabel={onSpeakSlow ? 'آهسته‌تر بگو' : 'شنیدن نمونه'} disabled={samplePlaying} onPress={() => requestHelp('audio')} style={styles.helpAction}><Volume2 size={16} color={accent} /><Text style={styles.segmentText}>{onSpeakSlow ? 'آهسته‌تر بگو' : 'شنیدن نمونه'}</Text></Pressable>
                    </View> : null}
                  </View> : null}
                  {samplePlaying ? <Text accessibilityLiveRegion="polite" style={styles.turnText}>نمونه را گوش بده؛ میکروفن موقتاً بسته است.</Text> : <SpeakCheck
                    key={`${turn}-${lines[turn]?.text ?? ''}`}
                    text={lines[turn]?.text ?? ''}
                    locale={locale}
                    accent={accent}
                    autoStart
                    singleAttempt
                    roomMode
                    blindExam={exam}
                    onResult={result => onUserResult(turn, result)}
                    onSkip={() => advanceFor(turn)}
                  />}
                </>
              )}
              <Text style={styles.progress}>{fa(Math.min(turn + 1, lines.length))} از {fa(lines.length)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {phase === 'done' ? (
        <View style={styles.doneCard}>
          <Text style={styles.doneTitle}>یک قدم جلوتر رفتی!</Text><Text style={styles.callSubtitle}>نتیجهٔ گفت‌وگوی شما</Text>
          {score === null ? (
            <Text style={styles.doneScore}>—</Text>
          ) : (
            <ScoreRing score={score} />
          )}
          <Text style={styles.scoreDisclaimer}>این درصد فقط شباهت متنِ تشخیص‌داده‌شده به نمونه است؛ نه نمرهٔ تلفظ، روانی یا درستی معنای پاسخ.</Text>
          <Text style={styles.doneEvaluation}>{score === null ? 'گفتاری برای مقایسه دریافت نشد؛ دسترسی میکروفن را بررسی کن.' : evaluationFor(score)}</Text>
          <View style={styles.outcomeCard}>
            <Text style={styles.chooseQuestion}>آنچه در این تمرین انجام دادی</Text>
            <Text style={styles.headerSituation}>{situation}</Text>
            <Text style={styles.doneSummary}>{fa(userIndexes.filter(index => !!results[index]?.heard.trim()).length)} پاسخ با گفتار ثبت‌شده از {fa(userIndexes.length)} نوبت · {fa(helpedTurns.size)} نوبت با کمک</Text>
            <Text style={styles.headerNote}>ثبت پاسخ، به‌تنهایی به معنی درست بودن مفهوم آن نیست.</Text>
            <Text style={styles.nextStep}>{roomNextStep(userIndexes.filter(index => !!results[index]?.heard.trim()).length, userIndexes.length, reviewIndexes.length, mode)}</Text>
          </View>
          {summary ? <Text style={styles.doneSummary}>{summary}</Text> : null}
          {trend ? <Text style={styles.doneTrend}>{trend}</Text> : null}
          {exam ? <Text style={styles.doneExamBadge}>اجرای آزمونی — بدون دیدن متن</Text> : null}
          {showHistory ? userIndexes.map(index => {
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
          }) : null}
          {reviewIndexes.length ? <Pressable accessibilityRole="button" accessibilityLabel="تمرین اشتباه‌ها" onPress={() => setReviewIndex(0)} style={[styles.startCall, { backgroundColor: accent }]}><RefreshCw size={18} color="#FFFFFF" /><Text keepColor style={styles.startCallText}>تمرین اشتباه‌ها · {fa(reviewIndexes.length)} جمله</Text></Pressable> : null}
          {reviewIndex !== null && reviewIndexes[reviewIndex] !== undefined ? (
            <View style={styles.reviewPractice}>
              <Text style={styles.chooseQuestion}>تمرین جملهٔ {fa(reviewIndex + 1)} از {fa(reviewIndexes.length)}</Text>
              <Text style={styles.bubbleForeign}>{lines[reviewIndexes[reviewIndex]].text}</Text>
              <Text style={styles.bubbleFa}>{lines[reviewIndexes[reviewIndex]].fa}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="شنیدن نمونهٔ جمله" onPress={() => replayOperator(lines[reviewIndexes[reviewIndex]].text)} style={styles.historyToggle}><Volume2 size={18} color={accent} /><Text style={styles.restartText}>شنیدن نمونه</Text></Pressable>
              <SpeakCheck key={`review-${reviewIndex}`} text={lines[reviewIndexes[reviewIndex]].text} locale={locale} accent={accent} roomMode onSkip={() => setReviewIndex(reviewIndex + 1 < reviewIndexes.length ? reviewIndex + 1 : null)} />
              <Pressable accessibilityRole="button" onPress={() => setReviewIndex(reviewIndex + 1 < reviewIndexes.length ? reviewIndex + 1 : null)} style={styles.restartButton}><Text style={styles.restartText}>{reviewIndex + 1 < reviewIndexes.length ? 'جملهٔ بعدی' : 'پایان تمرین اشتباه‌ها'}</Text><ChevronLeft size={16} color={accent} /></Pressable>
            </View>
          ) : null}
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
        <Text style={styles.liveTitle}>با یک هم‌زبان تمرین کن</Text>
        <Text style={styles.liveDescription}>آمادهٔ گفت‌وگوی واقعی هستی؟ یک مخاطب دعوت کن.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="گفت‌وگو با هم‌تمرین واقعی" style={[styles.liveButton, { backgroundColor: accent }]} onPress={openLiveConversation}>
          <MessageCircle size={18} color="#FFFFFF" />
          <Text style={styles.liveButtonText}>گفت‌وگو با هم‌تمرین واقعی</Text>
          <ChevronLeft size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pathDescription: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 22, color: Palette.text, textAlign: 'right' },
  serviceNote: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 21, color: Palette.muted, textAlign: 'right' },
  unavailablePath: { opacity: 0.55 },
  coachHelp: { gap: 6 },
  helpActions: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 7, justifyContent: 'center' },
  helpAction: { minHeight: 44, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.surface, flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  wordCue: { fontFamily: Typography.latinFontFamily, fontSize: 20, color: Palette.primaryDark, textAlign: 'center', marginTop: 8 },
  scoreDisclaimer: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 21, color: Palette.muted, textAlign: 'right' },
  outcomeCard: { padding: 14, borderRadius: 16, backgroundColor: Palette.canvas, gap: 9 },
  nextStep: { fontFamily: Typography.fontFamily, fontSize: 14, lineHeight: 24, color: Palette.primaryDark, textAlign: 'right' },
  callCard: { padding: 20, borderRadius: 24, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border, alignItems: 'center', gap: 12 },
  readyBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', borderRadius: 30, paddingHorizontal: 12, paddingVertical: 5 },
  readyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Palette.success },
  readyText: { fontFamily: Typography.fontFamily, fontSize: 12, color: '#166534' },
  presence: { height: 144, alignItems: 'center', justifyContent: 'center', width: '100%' },
  presenceHalo: { position: 'absolute', top: 8, width: 104, height: 104, borderRadius: 52, borderWidth: 2 },
  presenceAvatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  voiceBars: { position: 'absolute', bottom: 0, height: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  callTitle: { fontFamily: Typography.fontFamily, fontSize: 21, lineHeight: 30, color: Palette.ink, textAlign: 'center' },
  callSubtitle: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 22, color: Palette.muted, textAlign: 'center' },
  preferences: { width: '100%', gap: 10, marginVertical: 6 },
  segmentRow: { flexDirection: 'row-reverse', padding: 4, borderRadius: 14, backgroundColor: Palette.canvas, gap: 5 },
  segment: { flex: 1, minHeight: 44, borderRadius: 11, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: 'transparent' },
  segmentSelected: { backgroundColor: Palette.surface, borderColor: Palette.border },
  segmentText: { fontFamily: Typography.fontFamily, fontSize: 14, color: Palette.muted },
  examSetting: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, minHeight: 64, paddingHorizontal: 4 },
  toggleTrack: { width: 40, height: 24, borderRadius: 12, padding: 3, backgroundColor: '#CBD5E1', justifyContent: 'center' },
  toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF' },
  startCall: { width: '100%', minHeight: 54, borderRadius: 16, paddingHorizontal: 16, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 10 },
  startCallText: { fontFamily: Typography.fontFamily, fontSize: 17, color: '#FFFFFF', textAlign: 'center' },
  historyToggle: { minHeight: 44, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 7 },
  focusBubble: { maxWidth: '100%', width: '100%', padding: 22, borderRadius: 20 },
  reviewPractice: { padding: 14, borderRadius: 18, backgroundColor: Palette.canvas, gap: 12, borderWidth: 1, borderColor: Palette.border },
  pressed: { opacity: 0.78 },
  roomHeading: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  roomIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headingCopy: { flex: 1, gap: 2 },
  headerEyebrow: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 19, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  roomMeta: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  metaItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  metaText: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.primaryDark, textAlign: 'right' },
  chooseHeading: { gap: 4, marginBottom: 6 },
  choosePrimary: { borderColor: 'transparent' },
  choiceIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: Palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  choiceIconPrimary: { backgroundColor: '#FFFFFF20' },
  choiceCopy: { flex: 1, gap: 3 },
  primaryText: { color: '#FFFFFF' },
  primaryDescription: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 19, color: '#FFFFFF', textAlign: 'right', writingDirection: 'rtl' },
  choiceDescription: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 19, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  examDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 5 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Palette.border },
  sessionCard: { padding: 14, borderRadius: Radius.lg, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border, gap: 10 },
  sessionTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sessionLabel: { fontFamily: Typography.fontFamily, fontSize: 13, color: Palette.ink, textAlign: 'right' },
  sessionTrack: { height: 5, borderRadius: 3, overflow: 'hidden', backgroundColor: Palette.primarySoft, alignItems: 'flex-end' },
  sessionFill: { height: '100%', borderRadius: 3 },
  liveTitle: { fontFamily: Typography.fontFamily, fontSize: 16, color: Palette.ink, textAlign: 'right', marginBottom: 4 },
  liveDescription: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 21, color: Palette.muted, textAlign: 'right', marginBottom: 12 },
  wrap: { width: '100%', gap: 16 },
  headerCard: { width: '100%', borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.lg, backgroundColor: Palette.surface, padding: 18, gap: 12 },
  headerTitle: { fontFamily: Typography.fontFamily, fontSize: 23, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  headerSituation: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Palette.text, textAlign: 'right', lineHeight: 22, writingDirection: 'rtl' },
  headerNote: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.muted, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl' },
  chooseCard: { width: '100%', borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.lg, backgroundColor: Palette.surface, padding: 16, gap: 10 },
  chooseQuestion: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  chooseButton: { minHeight: 78, borderRadius: 16, borderWidth: 1, borderColor: Palette.border, backgroundColor: Palette.surface, flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 14 },
  chooseButtonText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  chooseExamButton: { minHeight: 72, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.primarySoft, backgroundColor: Palette.canvas, flexDirection: 'row-reverse', alignItems: 'center', gap: 10, padding: 12 },
  chooseExamText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, color: Palette.primaryDark, textAlign: 'right', writingDirection: 'rtl' },
  chooseHint: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, lineHeight: 21, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl', paddingTop: 4 },
  transcript: { width: '100%', gap: 12 },
  bubbleRow: { alignItems: 'flex-start' },
  bubbleRowMine: { alignItems: 'flex-end' },
  bubble: { maxWidth: '92%', borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.lg, backgroundColor: Palette.surface, padding: 14, gap: 6 },
  bubbleMine: { backgroundColor: Palette.primarySoft },
  bubbleHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  bubbleSpeaker: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: Palette.muted, writingDirection: 'rtl' },
  replayButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
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
  ringWrap: { width: 112, height: 112, alignSelf: 'center', marginVertical: Spacing.xs },
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
  liveCard: { width: '100%', marginTop: Spacing.sm, padding: Spacing.md, borderRadius: Radius.xl, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border, ...Shadows.card },
  liveButton: { width: '100%', minHeight: 48, borderRadius: Radius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm },
  liveButtonText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, color: '#FFFFFF', textAlign: 'center', writingDirection: 'rtl' },
});
