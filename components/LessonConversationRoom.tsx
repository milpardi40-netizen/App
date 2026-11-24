import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import {
  Award,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Headphones,
  MessageCircle,
  Mic2,
  RefreshCw,
  Send,
  Sparkles,
  Trophy,
  Volume2,
} from 'lucide-react-native';
import SpeakCheck from '@/components/SpeakCheck';
// Both text and input go through the localized wrappers, or the Persian digits and the script-aware
// font/direction policy would be missing from this screen.
import { LocalizedText as Text, LocalizedTextInput as TextInput } from '@/components/LocalizedText';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';
import { Typography } from '@/lib/theme';
import { toPersianDigits as fa } from '@/lib/format';
import { normalizeLessonConversation, type LessonConversationSession } from '@/lib/lessonConversation';
import { getLessonOutcome, saveLessonOutcome, type OralExamOutcome } from '@/lib/lessonOutcomes';
import {
  evaluateSemanticResponse,
  type BranchingConversation,
  type BranchingLocale,
  type Choice,
  type ConversationLevel,
  type SemanticTurn,
  type SpeechWordResult,
} from '@/lib/branchingConversation';
import { stripStressMarks } from '@/lib/speechScore';

type ChatLine = { who: string; role?: 'learner' | 'partner'; text: string; fa: string };
type TurnStatus = 'spoken' | 'typed' | 'choice' | 'skipped';
type TurnReport = {
  index: number;
  promptFa: string;
  expected: string;
  heard: string;
  score: number;
  pronunciationScore?: number;
  method: 'voice' | 'typed' | 'choice';
  status: TurnStatus;
  retries: number;
  feedback: string;
  weakWords?: string[];
};
type RoomMode = 'listen-echo' | 'natural-flow';
type AttemptDiagnostic = {
  heard: string;
  score: number;
  feedback: string;
  wordResults?: SpeechWordResult[];
};

type Props = {
  /** The lesson's own dialogue, with its real speaker roles. This is what makes it a conversation. */
  dialogue: ReadonlyArray<{ speaker: string; role?: 'learner' | 'partner'; text: string; fa: string }>;
  /** Only for a lesson without dialogue data: its sentences become the script, read by the partner first. */
  fallback?: ReadonlyArray<{ text: string; fa: string }>;
  locale: BranchingLocale;
  onSpeak: (text: string, onDone: () => void) => void;
  onStop?: () => void;
  lessonId: string;
  courseId?: string;
  situation?: string;
  partnerRole?: string;
  initialSession?: LessonConversationSession;
  onSessionChange?: (session: LessonConversationSession) => void;
  /** Level-aware semantic/branching contract. */
  semanticPractice?: BranchingConversation | null;
  levelId?: number;
};

const TYPING_MS = 480;
const LEARNER_LABELS = new Set(['learner', 'you', 'شما', 'زبان‌آموز', 'زبانآموز']);

const learnerRoleOf = (lines: ChatLine[]) => lines.find(line => line.role === 'learner')?.who
  ?? lines.find(line => LEARNER_LABELS.has(line.who))?.who
  ?? null;
const nameOf = (who: string) => (who === 'partner' ? 'هم‌صحبت' : who === 'learner' ? 'زبان‌آموز' : who);

function levelLabelFa(level?: ConversationLevel): string {
  switch (level) {
    case 'Pre-A1': return 'مقدماتی (Pre-A1)';
    case 'A1': return 'پایه (A1)';
    case 'A2': return 'مکالمهٔ روزمره (A2)';
    case 'B1': return 'مستقل (B1)';
    case 'B2': return 'استدلالی (B2)';
    case 'C1': return 'پیشرفته (C1)';
    default: return 'واقعی';
  }
}

function evaluateConversationSummary(reports: readonly TurnReport[]) {
  if (!reports.length) {
    return {
      tier: 'good' as const,
      grade: 'B' as OralExamOutcome['grade'],
      overall: 0,
      semantic: 0,
      pronunciation: 0,
      completedCount: 0,
      voiceTurns: 0,
      xp: 0,
      weakWords: [] as string[],
      reviewSentences: [] as string[],
      title: 'گفت‌وگو کامل شد!',
      subtitle: 'هر زمان بخواهی می‌توانی دوباره این مکالمه را تمرین کنی یا نقش هم‌صحبت را بر عهده بگیری.',
      advice: 'برای تسلط بیشتر روی هر دو طرف مکالمه، جابه‌جایی نقش را امتحان کن.',
    };
  }

  const completed = reports.filter(item => item.status !== 'skipped');
  const completedCount = completed.length;
  const activeRatio = completedCount / reports.length;
  const semantic = completed.length
    ? Math.round(completed.reduce((sum, item) => sum + item.score, 0) / completed.length)
    : 0;
  const voiceReports = completed.filter(item => item.method === 'voice');
  const voiceTurns = voiceReports.length;
  const pronunciation = voiceReports.length
    ? Math.round(voiceReports.reduce((sum, item) => sum + (item.pronunciationScore ?? item.score), 0) / voiceReports.length)
    : 0;

  const baseClarity = voiceReports.length
    ? Math.round(semantic * 0.55 + pronunciation * 0.45)
    : semantic;
  const overall = Math.max(0, Math.min(100, Math.round(baseClarity * activeRatio)));

  const tier: 'great' | 'good' | 'practice' =
    completedCount === reports.length && overall >= 82
      ? 'great'
      : completedCount >= Math.ceil(reports.length * 0.5) && overall >= 60
        ? 'good'
        : 'practice';

  const grade: OralExamOutcome['grade'] =
    overall >= 85 && completedCount === reports.length
      ? 'A'
      : overall >= 70
        ? 'B'
        : overall >= 55
          ? 'C'
          : 'needs-work';

  const xp = completed.reduce((sum, item) => {
    const base = item.score >= 85 ? 25 : item.score >= 68 ? 18 : 12;
    const voiceBonus = item.method === 'voice' ? 8 : 0;
    return sum + base + voiceBonus;
  }, 0);

  const weakWords = [...new Set(reports.flatMap(r => r.weakWords ?? []))].slice(0, 8);
  const reviewSentences = [...new Set(
    reports
      .filter(r => r.status === 'skipped' || r.score < 78 || (r.pronunciationScore !== undefined && r.pronunciationScore < 72))
      .map(r => r.expected),
  )];

  const title = tier === 'great'
    ? 'عالی و روان صحبت کردی!'
    : tier === 'good'
      ? 'گفت‌وگوی خیلی خوبی بود!'
      : 'تمرین خوبی انجام دادی!';

  const subtitle = completedCount === 0
    ? 'جمله‌های این گفت‌وگو را مرور کردی؛ هر وقت آماده بودی با شنیدن و تکرار صدایت را هم بسنج.'
    : voiceTurns === 0
      ? `هر ${fa(completedCount)} نوبت را با نوشتن پیش بردی؛ در دور بعد می‌توانی با میکروفن هم بشنوی و تکرار کنی.`
      : tier === 'great'
        ? 'جمله‌های این درس را خیلی طبیعی، واضح و متناسب با جریان گفت‌وگو بیان کردی.'
        : 'منظور مکالمه را خوب منتقل کردی؛ چند جمله را پایین یک بار دیگر بشنو تا کاملاً جا بیفتد.';

  const advice = reviewSentences.length === 0
    ? 'می‌توانی نقش خودت و هم‌صحبت را عوض کنی تا جمله‌های طرف مقابل را هم از زبان خودت بگویی.'
    : 'روی جمله‌های زیر یک بار گوش بده و تکرار کن؛ بعد در «مکالمهٔ روان» بدون متن امتحانشان کن.';

  return {
    tier,
    grade,
    overall,
    semantic,
    pronunciation,
    completedCount,
    voiceTurns,
    xp,
    weakWords,
    reviewSentences,
    title,
    subtitle,
    advice,
  };
}

function buildFallbackRule(line: ChatLine): SemanticTurn {
  const words = line.text
    .toLocaleLowerCase()
    .replace(/[.,!?;:¿¡]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);
  return {
    promptFa: line.fa || line.text,
    targetText: line.text,
    concepts: words.length ? words.slice(0, 2).map(w => [w]) : [[line.text]],
    expectedQuestion: /[?¿؟]/.test(line.text),
  };
}

export default function LessonConversationRoom({
  dialogue,
  fallback,
  locale,
  onSpeak,
  onStop,
  lessonId,
  courseId,
  situation,
  initialSession,
  onSessionChange,
  semanticPractice,
  levelId,
}: Props) {
  const isRtlTarget = locale.toLowerCase().startsWith('ar');
  const resolvedCourseId = courseId ?? locale.split('-')[0].toLowerCase();

  // Keep the lesson's authentic dialogue strictly intact — only taught phrases appear here.
  const lines = useMemo<ChatLine[]>(() => {
    const real = dialogue.filter(line => line.text.trim());
    if (real.length) {
      return real.map(line => ({ who: line.speaker, role: line.role, text: line.text, fa: line.fa }));
    }
    const scripted = (fallback ?? []).filter(line => line.text.trim());
    return scripted.map((line, index) => ({
      who: index % 2 === 0 ? 'partner' : 'learner',
      role: index % 2 === 0 ? ('partner' as const) : ('learner' as const),
      text: line.text,
      fa: line.fa,
    }));
  }, [dialogue, fallback]);

  const [branchReplies, setBranchReplies] = useState<Record<number, { text: string; fa: string }>>({});
  const displayLines = useMemo<ChatLine[]>(
    () => lines.map((line, lineIndex) => (branchReplies[lineIndex] ? { ...line, ...branchReplies[lineIndex] } : line)),
    [branchReplies, lines],
  );

  const roles = useMemo(() => [...new Set(lines.map(line => line.who))], [lines]);
  const declared = learnerRoleOf(lines);
  const [myRole, setMyRole] = useState<string | null>(declared ?? roles[0] ?? null);
  const [roomMode, setRoomMode] = useState<RoomMode>('listen-echo');
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const [speakingAt, setSpeakingAt] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showPhrase, setShowPhrase] = useState(false);
  const [typed, setTyped] = useState(false);
  const [choicePanel, setChoicePanel] = useState(false);
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');
  const [reports, setReports] = useState<TurnReport[]>([]);
  const [learnerActuals, setLearnerActuals] = useState<Record<number, { text: string; status: TurnStatus; score: number; correction?: string }>>({});
  const [diagnostic, setDiagnostic] = useState<AttemptDiagnostic | null>(null);
  const [starting, setStarting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [samplePlaying, setSamplePlaying] = useState(false);
  const [autoMicArmed, setAutoMicArmed] = useState(false);
  const [previousBest, setPreviousBest] = useState<OralExamOutcome | null>(null);
  const outcomeSavedRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spokenFor = useRef<number | null>(null);

  const activeLevel: ConversationLevel = semanticPractice?.level
    ?? (levelId === 0 ? 'Pre-A1' : levelId === 1 ? 'A1' : levelId === 2 ? 'A2' : levelId === 3 ? 'B1' : levelId === 4 ? 'B2' : levelId === 5 ? 'C1' : 'A1');

  const isEchoMode = roomMode === 'listen-echo';
  const current = displayLines[index];
  const currentRule: SemanticTurn | undefined = current
    ? (semanticPractice?.turns[index] ?? semanticPractice?.allTurns?.[index] ?? buildFallbackRule(current))
    : undefined;
  const isMine = !!current && !!myRole && current.who === myRole;
  const finished = open && index >= lines.length;
  const sent = useMemo(() => displayLines.slice(0, Math.min(index, displayLines.length)), [displayLines, index]);
  const partnerName = nameOf(lines.find(line => line.who !== myRole)?.who ?? 'partner');
  const myRoleLabel = myRole ? nameOf(myRole) : 'شما';

  const stall = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const clearStall = () => { if (stall.current) { clearTimeout(stall.current); stall.current = null; } };
  useEffect(() => () => { clearTimer(); clearStall(); onStop?.(); }, [onStop]);

  useEffect(() => {
    let active = true;
    void getLessonOutcome(resolvedCourseId, lessonId).then(outcome => {
      if (active && outcome?.oralExam) setPreviousBest(outcome.oralExam);
    });
    return () => { active = false; };
  }, [resolvedCourseId, lessonId]);

  useEffect(() => {
    const restored = normalizeLessonConversation(initialSession, lines.length, roles, declared);
    setOpen(restored.started || restored.completed);
    setIndex(restored.currentTurn);
    setAttempts(restored.attempts);
    setShowPhrase(restored.revealed);
    setMyRole(restored.myRole ?? declared ?? roles[0] ?? null);
    setBranchReplies({});
    setTyped(false);
    setChoicePanel(false);
    setDraft('');
    setNote('');
    setReports([]);
    setLearnerActuals({});
    setDiagnostic(null);
    setSamplePlaying(false);
    setAutoMicArmed(false);
    outcomeSavedRef.current = false;
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => { setMyRole(role => role ?? declared ?? roles[0] ?? null); }, [declared, roles]);
  useEffect(() => {
    if (!hydrated || !open || !lines.length) return;
    onSessionChange?.({
      started: true,
      currentTurn: Math.min(index, lines.length),
      ...(myRole ? { myRole } : {}),
      attempts,
      revealed: showPhrase,
      completed: finished,
    });
  }, [attempts, finished, hydrated, index, lines.length, myRole, onSessionChange, open, showPhrase]);

  // In natural-flow mode, arm auto-mic when a learner turn starts; in listen-echo, wait calmly until they tap "بشنو و تکرار کن" or speak directly.
  useEffect(() => {
    if (!open || !current || !isMine) {
      setSamplePlaying(false);
      setAutoMicArmed(false);
      return;
    }
    setSamplePlaying(false);
    setAutoMicArmed(roomMode === 'natural-flow');
  }, [open, index, isMine, roomMode, current]);

  const speak = useCallback((text: string, at: number, onEnd?: () => void) => {
    setSpeakingAt(at);
    clearStall();
    stall.current = setTimeout(() => {
      setSpeakingAt(currentAt => (currentAt === at ? null : currentAt));
      onEnd?.();
    }, 2200 + Math.min(6000, text.length * 110));
    let settled = false;
    onSpeak(text, () => {
      if (settled) return;
      settled = true;
      clearStall();
      setSpeakingAt(currentAt => (currentAt === at ? null : currentAt));
      onEnd?.();
    });
  }, [clearStall, onSpeak]);

  const playAndEchoCurrent = useCallback(() => {
    if (!current) return;
    setNote('');
    setAutoMicArmed(false);
    setSamplePlaying(true);
    speak(current.text, -4, () => {
      setSamplePlaying(false);
      setAutoMicArmed(true);
    });
  }, [current, speak]);

  const advance = useCallback(() => {
    clearStall();
    onStop?.();
    setAttempts(0);
    setShowPhrase(false);
    setChoicePanel(false);
    setDraft('');
    setNote('');
    setDiagnostic(null);
    setSamplePlaying(false);
    setAutoMicArmed(false);
    setIndex(value => value + 1);
  }, [clearStall, onStop]);

  const linesRef = useRef(lines); linesRef.current = lines;
  const indexRef = useRef(index); indexRef.current = index;

  const showPartner = useCallback((at: number) => {
    setTyping(true);
    clearTimer();
    timer.current = setTimeout(() => {
      timer.current = null;
      spokenFor.current = at;
      setTyping(false);
      speak(linesRef.current[at].text, at, () => {
        if (indexRef.current === at) advance();
      });
    }, TYPING_MS);
  }, [advance, clearTimer, speak]);

  useEffect(() => {
    if (!open || !current || isMine) return;
    if (typing || spokenFor.current === index) return;
    showPartner(index);
  }, [current, index, isMine, open, showPartner, typing]);

  const completeTurnAndAdvance = useCallback((
    turnIdx: number,
    actualText: string,
    status: TurnStatus,
    score: number,
    reply?: { text: string; fa: string },
    expectedText?: string,
  ) => {
    const cleanActual = stripStressMarks(actualText).trim().toLowerCase();
    const cleanExpected = expectedText ? stripStressMarks(expectedText).trim().toLowerCase() : '';
    setLearnerActuals(prev => ({
      ...prev,
      [turnIdx]: {
        text: actualText,
        status,
        score,
        correction: expectedText && status !== 'skipped' && score < 88 && cleanActual !== cleanExpected ? expectedText : undefined,
      },
    }));

    if (reply && turnIdx + 1 < lines.length) {
      setBranchReplies(value => ({ ...value, [turnIdx + 1]: reply }));
    }

    advance();
  }, [advance, lines.length]);

  const fail = (message: string, diag?: AttemptDiagnostic) => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setAutoMicArmed(false);
    setNote(message);
    if (diag) setDiagnostic(diag);
  };

  const submitAnswer = (answer: string, method: 'voice' | 'typed' | 'choice' = 'typed') => {
    if (!current || !currentRule) return;
    const promptFa = currentRule.promptFa || current.fa;
    const semantic = evaluateSemanticResponse(currentRule, answer, locale, activeLevel);

    if (!semantic.accepted) {
      fail('کمی واضح‌تر تکرار کن؛ می‌توانی اول تلفظش را بشنوی و بعد بگویی.', {
        heard: answer,
        score: semantic.score,
        feedback: semantic.feedback,
        wordResults: semantic.wordResults,
      });
      return;
    }

    const weakWords = (semantic.wordResults ?? [])
      .filter(w => w.state !== 'ok')
      .map(w => w.word.replace(/[.,!?;:¿¡؟،؛"«»()]/g, '').trim())
      .filter(Boolean);

    const turnStatus: TurnStatus = method === 'voice' ? 'spoken' : method === 'choice' ? 'choice' : 'typed';
    setReports(value => [
      ...value,
      {
        index,
        promptFa,
        expected: current.text,
        heard: answer.trim(),
        score: semantic.score,
        pronunciationScore: semantic.pronunciationScore,
        method,
        status: turnStatus,
        retries: attempts,
        feedback: semantic.feedback,
        weakWords,
      },
    ]);
    setDraft('');
    setNote('');
    setDiagnostic(null);
    completeTurnAndAdvance(index, answer.trim(), turnStatus, semantic.score, semantic.branchReply, current.text);
  };

  const moveToNextTurn = () => {
    if (!current) return;
    const promptFa = currentRule?.promptFa ?? current.fa;
    setReports(value => [
      ...value,
      {
        index,
        promptFa,
        expected: current.text,
        heard: '',
        score: 0,
        pronunciationScore: 0,
        method: typed ? 'typed' : 'voice',
        status: 'skipped',
        retries: attempts,
        feedback: 'از این نوبت عبور شد؛ متن آن برای مرور آماده است.',
      },
    ]);
    completeTurnAndAdvance(index, current.text, 'skipped', 0, undefined, current.text);
  };

  const begin = async (selectedMode?: RoomMode) => {
    if (starting) return;
    const chosenMode = selectedMode ?? roomMode;
    setRoomMode(chosenMode);
    setStarting(true);
    setOpen(true);
    setIndex(0);
    outcomeSavedRef.current = false;
    clearTimer(); clearStall();
    spokenFor.current = null;
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) { setTyped(true); setNote('میکروفن باز نشد؛ می‌توانی پاسخت را بنویسی.'); }
    } catch {
      setTyped(true);
      setNote('میکروفن آماده نشد؛ می‌توانی پاسخت را بنویسی.');
    } finally {
      setStarting(false);
    }
  };

  const restart = (nextMode?: RoomMode) => {
    clearTimer(); clearStall();
    spokenFor.current = null;
    if (nextMode) setRoomMode(nextMode);
    setBranchReplies({});
    setLearnerActuals({});
    outcomeSavedRef.current = false;
    setIndex(0); setAttempts(0); setShowPhrase(false); setTyping(false); setSpeakingAt(null);
    setSamplePlaying(false); setAutoMicArmed(false);
    setDraft(''); setNote(''); setDiagnostic(null); setReports([]); setChoicePanel(false);
  };

  const flipRole = () => {
    if (roles.length < 2) return;
    const currentIdx = myRole ? roles.indexOf(myRole) : 0;
    const nextRole = roles[(Math.max(0, currentIdx) + 1) % roles.length];
    if (!nextRole) return;
    setMyRole(nextRole);
    restart();
  };

  const sendTyped = () => {
    if (!current) return;
    submitAnswer(draft, 'typed');
  };

  const summary = useMemo(() => evaluateConversationSummary(reports), [reports]);

  // Persist finished conversation outcome quietly so progress & previous best clarity stay available.
  useEffect(() => {
    if (!finished || !reports.length || outcomeSavedRef.current) return;
    outcomeSavedRef.current = true;
    const record: OralExamOutcome = {
      mode: roomMode,
      overall: summary.overall,
      bestOverall: Math.max(summary.overall, previousBest?.bestOverall ?? 0),
      pronunciation: summary.pronunciation,
      semantic: summary.semantic,
      independence: 100,
      interaction: reports.length ? Math.round((summary.completedCount / reports.length) * 100) : 100,
      grade: summary.grade,
      passed: summary.overall >= 55,
      voiceTurns: summary.voiceTurns,
      totalTurns: reports.length,
      at: new Date().toISOString(),
    };
    setPreviousBest(prev => (prev ? { ...record, bestOverall: Math.max(record.bestOverall, prev.bestOverall) } : record));
    void saveLessonOutcome(resolvedCourseId, lessonId, { oralExam: record });
  }, [finished, lessonId, previousBest?.bestOverall, reports.length, resolvedCourseId, roomMode, summary]);

  if (!lines.length) {
    return <View style={styles.wrap}><Text style={styles.emptyNote}>برای این درس گفت‌وگویی ثبت نشده است.</Text></View>;
  }

  const hasChoices = Boolean(currentRule?.choices?.length) && (activeLevel === 'Pre-A1' || activeLevel === 'A1');
  const learnerTurnsTotal = lines.filter(line => line.who === myRole).length;
  const phraseVisible = isEchoMode || showPhrase;

  const doneCardTheme = summary.tier === 'great'
    ? { card: styles.doneCardGreen, badge: styles.trophyGreen, title: styles.doneTitleGreen, text: styles.doneTextGreen, circle: styles.circleGreen }
    : { card: styles.doneCardBlue, badge: styles.trophyBlue, title: styles.doneTitleBlue, text: styles.doneTextBlue, circle: styles.circleBlue };

  return (
    <View style={styles.wrap}>
      {!open ? (
        <View style={styles.invite}>
          <View style={styles.inviteBadgesRow}>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalBadgeText}>بخش اختیاری</Text>
            </View>
            <View style={styles.inviteBadge}>
              <MessageCircle size={14} color={Palette.primary} />
              <Text style={styles.inviteBadgeText}>اتاق مکالمهٔ درس · {levelLabelFa(activeLevel)} · {fa(lines.length)} خط گفت‌وگو</Text>
            </View>
          </View>

          <Text style={styles.inviteTitle}>همین جمله‌های درس را در گفت‌وگوی واقعی تمرین کن</Text>
          {situation ? <Text style={styles.sceneText}>موقعیت: {situation}</Text> : null}
          <Text style={styles.inviteText}>
            صدای هم‌صحبت را می‌شنوی و با همان عبارت‌ها و واژه‌هایی که در همین درس یاد گرفتی پاسخ می‌دهی. می‌توانی جمله‌ها را بشنوی و برگردانی، یا از روی حافظه مکالمه کنی — بدون هیچ استرسی و در هر دو نقش!
          </Text>

          {previousBest ? (
            <View style={styles.recordBanner}>
              <Trophy size={16} color={Palette.primaryDark} />
              <Text style={styles.recordBannerText}>
                بهترین وضوح مکالمهٔ قبلی شما در این درس: {fa(previousBest.bestOverall)}٪
              </Text>
            </View>
          ) : null}

          <View style={styles.modeSelector}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: roomMode === 'listen-echo' }}
              onPress={() => setRoomMode('listen-echo')}
              style={[styles.modeCard, roomMode === 'listen-echo' && styles.modeCardActive]}
            >
              <View style={styles.modeHeadRow}>
                <Headphones size={15} color={roomMode === 'listen-echo' ? Palette.primaryDark : Palette.muted} />
                <Text style={[styles.modeTitle, roomMode === 'listen-echo' && styles.modeTitleOn]}>بشنو و بگو (همراه با الگو)</Text>
              </View>
              <Text style={styles.modeDesc}>جملهٔ هر نوبت را می‌بینی، با یک لمس می‌شنوی و همان لحظه با صدای خودت برمی‌گردانی</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: roomMode === 'natural-flow' }}
              onPress={() => setRoomMode('natural-flow')}
              style={[styles.modeCard, roomMode === 'natural-flow' && styles.modeCardActive]}
            >
              <View style={styles.modeHeadRow}>
                <Sparkles size={15} color={roomMode === 'natural-flow' ? Palette.primaryDark : Palette.muted} />
                <Text style={[styles.modeTitle, roomMode === 'natural-flow' && styles.modeTitleOn]}>مکالمهٔ روان (بدون متن)</Text>
              </View>
              <Text style={styles.modeDesc}>تنها معنای فارسی نوبتت را می‌بینی و طبیعی پاسخ می‌دهی؛ هر وقت خواستی هم می‌شنوی</Text>
            </Pressable>
          </View>

          {roles.length > 1 ? (
            <View style={styles.roleBox}>
              <Text style={styles.roleHint}>انتخاب نقش (هر نقشی را برداری، فقط جمله‌های درس را تمرین می‌کنی):</Text>
              <View style={styles.roleRow}>
                {roles.map(role => {
                  const turnCount = lines.filter(line => line.who === role).length;
                  return (
                    <Pressable
                      key={role}
                      accessibilityRole="button"
                      accessibilityState={{ selected: role === myRole }}
                      onPress={() => { setMyRole(role); restart(); }}
                      style={[styles.roleChip, role === myRole && styles.roleChipOn]}
                    >
                      <Text style={[styles.roleChipText, role === myRole && styles.roleChipTextOn]}>
                        نقش شما: {nameOf(role)} ({fa(turnCount)} نوبت)
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: starting }}
            disabled={starting}
            style={styles.enter}
            onPress={() => void begin()}
          >
            <Mic2 size={18} color="#FFFFFF" />
            <Text style={styles.enterText}>شروع گفت‌وگو ({fa(learnerTurnsTotal)} نوبت)</Text>
          </Pressable>
          {starting ? <ActivityIndicator color={Palette.primary} /> : null}
        </View>
      ) : finished ? (
        <View style={[styles.doneCard, doneCardTheme.card]}>
          {reports.length === 0 ? (
            <>
              <View style={styles.heroBanner}>
                <View style={[styles.trophyBadge, styles.trophyBlue]}>
                  <CheckCircle2 size={24} color="#FFFFFF" />
                </View>
                <View style={styles.heroCopy}>
                  <Text style={[styles.doneTitle, styles.doneTitleBlue]}>
                    {learnerTurnsTotal === 0
                      ? 'در این نقش نوبت گفت‌وگو ثبت نشده است'
                      : 'این گفت‌وگو در نشست قبلی کامل شده است'}
                  </Text>
                  <Text style={[styles.doneText, styles.doneTextBlue]}>
                    {previousBest
                      ? `بهترین وضوح ثبت‌شدهٔ شما در این درس: ${fa(previousBest.bestOverall)}٪. می‌توانی دوباره تمرین کنی یا جای نقش‌ها را عوض کنی.`
                      : 'می‌توانی کل خط‌های درس را دوباره بشنوی، گفت‌وگو را از نو تمرین کنی، یا نقش طرف مقابل را بر عهده بگیری.'}
                  </Text>
                </View>
              </View>

              <View style={styles.reviewList}>
                <Text style={styles.reviewHeading}>مرور صوتی جمله‌های همین گفت‌وگو</Text>
                {displayLines.map((line, idx) => (
                  <Pressable
                    key={`resume-line-${idx}`}
                    accessibilityRole="button"
                    onPress={() => speak(line.text, -30 - idx)}
                    style={styles.weakSentenceBtn}
                  >
                    <Volume2 size={15} color={Palette.primary} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={[styles.weakSentenceText, isRtlTarget && styles.rtlText]}>{line.text}</Text>
                      <Text style={styles.resumeLineFa}>{nameOf(line.who)}: {line.fa}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>

              <View style={styles.doneActions}>
                <Pressable accessibilityRole="button" style={styles.againButton} onPress={() => restart()}>
                  <Text style={styles.againText}>شروع دوبارهٔ گفت‌وگو</Text>
                </Pressable>
                {roles.length > 1 ? (
                  <Pressable accessibilityRole="button" style={styles.flipDoneButton} onPress={flipRole}>
                    <RefreshCw size={15} color={Palette.primary} />
                    <Text style={styles.flipDoneText}>تمرین در نقش {partnerName}</Text>
                  </Pressable>
                ) : null}
              </View>
            </>
          ) : (
            <>
              <View style={styles.heroBanner}>
                <View style={[styles.trophyBadge, doneCardTheme.badge]}>
                  <Trophy size={24} color="#FFFFFF" />
                </View>
                <View style={styles.heroCopy}>
                  <View style={styles.gradePillsRow}>
                    <View style={styles.xpPill}>
                      <Award size={13} color={Palette.primary} />
                      <Text style={styles.xpPillText}>{isEchoMode ? 'بشنو و بگو' : 'مکالمهٔ روان'}</Text>
                    </View>
                    {summary.xp > 0 ? (
                      <View style={styles.xpPill}>
                        <Text style={styles.xpPillText}>+{fa(summary.xp)} امتیاز تمرین</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.doneTitle, doneCardTheme.title]}>{summary.title}</Text>
                  <Text style={[styles.doneText, doneCardTheme.text]}>{summary.subtitle}</Text>
                </View>
                <View style={[styles.overallCircle, doneCardTheme.circle]}>
                  <Text style={[styles.overallValue, doneCardTheme.title]}>{fa(summary.overall)}٪</Text>
                  <Text style={[styles.overallLabel, doneCardTheme.text]}>وضوح کل</Text>
                </View>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{summary.voiceTurns > 0 ? `${fa(summary.pronunciation)}٪` : '—'}</Text>
                  <Text style={styles.metricLabel}>وضوح گفتار</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{fa(summary.semantic)}٪</Text>
                  <Text style={styles.metricLabel}>دقت عبارت‌ها</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{fa(summary.completedCount)} از {fa(reports.length)}</Text>
                  <Text style={styles.metricLabel}>نوبت‌های مکالمه</Text>
                </View>
              </View>

              <Text style={[styles.finalHint, doneCardTheme.text]}>{summary.advice}</Text>

              {summary.reviewSentences.length > 0 ? (
                <View style={styles.weakFocusBox}>
                  <Text style={styles.weakFocusTitle}>گوش دادن و تثبیت جمله‌های این مکالمه</Text>
                  {summary.weakWords.length > 0 ? (
                    <Text style={styles.weakWordsText}>واژه‌های خوب برای تکرار بیشتر: {summary.weakWords.join(' · ')}</Text>
                  ) : null}
                  {summary.reviewSentences.slice(0, 3).map((sentence, idx) => (
                    <Pressable
                      key={`weak-sent-${idx}`}
                      accessibilityRole="button"
                      onPress={() => speak(sentence, -10 - idx)}
                      style={styles.weakSentenceBtn}
                    >
                      <Volume2 size={15} color={Palette.primary} />
                      <Text style={[styles.weakSentenceText, isRtlTarget && styles.rtlText]}>{sentence}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              <View style={styles.reviewList}>
                <Text style={styles.reviewHeading}>مرور خط به خط مکالمه</Text>
                {reports.map(item => {
                  const statusLabel = item.status === 'skipped' ? 'مرور شد' : item.score >= 85 ? 'بسیار روان' : 'خوب';
                  const statusColor = item.status === 'skipped' ? Palette.primary : item.score >= 85 ? Palette.success : Palette.primary;
                  return (
                    <View key={`report-${item.index}`} style={styles.reviewItem}>
                      <View style={styles.reviewTop}>
                        <View style={styles.reviewTurnWrap}>
                          <CheckCircle2 size={14} color={statusColor} />
                          <Text style={styles.reviewTurn}>
                            نوبت {fa(item.index + 1)} · {item.method === 'voice' ? 'گفتاری' : item.method === 'choice' ? 'انتخابی' : 'نوشتاری'}
                          </Text>
                        </View>
                        <View style={[styles.scoreTag, { borderColor: statusColor }]}>
                          <Text style={[styles.scoreTagText, { color: statusColor }]}>
                            {item.status === 'skipped' ? statusLabel : `${statusLabel} · ${fa(item.score)}٪`}
                          </Text>
                        </View>
                      </View>
                      {item.promptFa ? <Text style={styles.reviewPrompt}>معنا: {item.promptFa}</Text> : null}
                      {item.status !== 'skipped' ? (
                        <Text style={styles.reviewHeard}>پاسخ شما: {item.heard}</Text>
                      ) : null}
                      <Pressable accessibilityRole="button" onPress={() => speak(item.expected, -20 - item.index)} style={styles.expectedPlayRow}>
                        <Volume2 size={14} color={Palette.primary} />
                        <Text style={styles.reviewExpected}>شنیدن جملهٔ درس: {item.expected}</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>

              <View style={styles.doneActions}>
                {roles.length > 1 ? (
                  <Pressable accessibilityRole="button" style={styles.againButton} onPress={flipRole}>
                    <Text style={styles.againText}>حالا نقش {partnerName} را تمرین کن</Text>
                  </Pressable>
                ) : null}
                {isEchoMode ? (
                  <Pressable accessibilityRole="button" style={styles.flipDoneButton} onPress={() => restart('natural-flow')}>
                    <Sparkles size={15} color={Palette.primary} />
                    <Text style={styles.flipDoneText}>امتحان در «مکالمهٔ روان»</Text>
                  </Pressable>
                ) : (
                  <Pressable accessibilityRole="button" style={styles.flipDoneButton} onPress={() => restart('listen-echo')}>
                    <RefreshCw size={15} color={Palette.primary} />
                    <Text style={styles.flipDoneText}>تمرین دوباره</Text>
                  </Pressable>
                )}
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={styles.thread}>
          <View style={styles.liveModeBar}>
            <View style={styles.liveModeBadge}>
              {isEchoMode ? <Headphones size={13} color={Palette.primaryDark} /> : <Sparkles size={13} color={Palette.primaryDark} />}
              <Text style={styles.liveModeBadgeText}>
                {isEchoMode ? 'بشنو و بگو · همراه با الگو' : 'مکالمهٔ روان · بدون متن'}
              </Text>
            </View>
            <Text style={styles.turnCounterBadge}>نوبت {fa(index + 1)} از {fa(lines.length)}</Text>
          </View>

          <View style={styles.metaRow} accessibilityLiveRegion="polite">
            <View style={styles.dots}>{lines.map((line, dot) => <View key={`${line.text}-${dot}`} style={[styles.dot, dot < index && styles.dotDone, dot === index && styles.dotNow]} />)}</View>
            {typing ? <Text style={styles.typingText}>{partnerName} در حال صحبت…</Text> : null}
          </View>

          {sent.map((line, at) => {
            const actual = learnerActuals[at];
            const isLearnerBubble = line.who === myRole;
            const bubbleText = isLearnerBubble && actual ? actual.text : line.text;
            const bubbleFa = line.fa;
            return (
              <View key={`sent-wrap-${at}`} style={styles.sentGroup}>
                <View style={[styles.bubble, isLearnerBubble ? styles.mine : styles.theirs]}>
                  <View style={styles.bubbleTop}>
                    <Text style={styles.who}>{isLearnerBubble ? `شما (${myRoleLabel})` : partnerName}</Text>
                    <View style={styles.bubbleRightActions}>
                      {isLearnerBubble && actual && actual.status !== 'skipped' ? (
                        <View style={styles.scorePill}><Check size={12} color={Palette.success} /><Text style={styles.scorePillText}>{fa(actual.score)}٪</Text></View>
                      ) : null}
                      <Pressable accessibilityRole="button" accessibilityLabel={`شنیدنِ خط ${fa(at + 1)}`} onPress={() => speak(line.text, at)} style={styles.replay}>
                        <Volume2 size={15} color={Palette.primary} />
                      </Pressable>
                    </View>
                  </View>
                  <Text style={[styles.lineText, isRtlTarget && styles.rtlText]}>{bubbleText}</Text>
                  {bubbleFa ? <Text style={styles.lineFa}>{bubbleFa}</Text> : null}
                  {isLearnerBubble && actual?.correction ? (
                    <Text style={styles.correctionHint}>عبارت درس: {actual.correction}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}

          {current && isMine ? (
            <View style={styles.turnCard}>
              <View style={styles.turnHeaderRow}>
                <Text style={styles.turnTitle}>
                  {index === 0 ? `شروع گفت‌وگو با شماست (${myRoleLabel})` : `نوبت شما · ${myRoleLabel}`}
                </Text>
                <Text style={styles.levelBadge}>{levelLabelFa(activeLevel)}</Text>
              </View>
              <Text style={styles.turnPrompt}>{currentRule?.promptFa ?? current.fa}</Text>

              {phraseVisible ? (
                <View style={styles.phraseCard}>
                  <View style={styles.phraseCardTop}>
                    <Text style={styles.phraseCardLabel}>جملهٔ شما در همین درس:</Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={playAndEchoCurrent}
                      style={[styles.echoListenBtn, samplePlaying && styles.echoListenBtnActive]}
                    >
                      <Volume2 size={15} color="#FFFFFF" />
                      <Text style={styles.echoListenText}>
                        {samplePlaying ? 'در حال پخش… گوش بده' : 'بشنو و تکرار کن'}
                      </Text>
                    </Pressable>
                  </View>
                  <Text style={[styles.turnTarget, isRtlTarget && styles.rtlText]}>{current.text}</Text>
                </View>
              ) : (
                <View style={styles.naturalHelperBar}>
                  <Text style={styles.turnHint}>
                    به زبان همین درس پاسخ بده؛ هر وقت خواستی بشنوی یا ببینی، با دکمه‌های پایین آزادانه کمک بگیر.
                  </Text>
                  <View style={styles.helperChipsRow}>
                    <Pressable accessibilityRole="button" style={styles.helperChip} onPress={playAndEchoCurrent}>
                      <Volume2 size={14} color={Palette.primaryDark} />
                      <Text style={styles.helperChipText}>{samplePlaying ? 'در حال پخش…' : 'بشنو تا یادت بیاد'}</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" style={styles.helperChip} onPress={() => setShowPhrase(true)}>
                      <Eye size={14} color={Palette.primaryDark} />
                      <Text style={styles.helperChipText}>نمایش جمله</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {!isEchoMode && showPhrase ? (
                <Pressable accessibilityRole="button" style={styles.hidePhraseLink} onPress={() => setShowPhrase(false)}>
                  <EyeOff size={13} color={Palette.muted} />
                  <Text style={styles.hidePhraseText}>پنهان کردن دوبارهٔ جمله</Text>
                </Pressable>
              ) : null}

              {diagnostic ? (
                <View style={styles.coachCard}>
                  <Text style={styles.coachTitle}>یک بار دیگر واضح‌تر بگو تا کامل ثبت شود</Text>
                  <Text style={styles.coachHeard}>شنیده شد: «{diagnostic.heard || '—'}»</Text>
                  {diagnostic.wordResults && diagnostic.wordResults.length > 0 ? (
                    <View style={[styles.wordBar, isRtlTarget && styles.rtlWordBar]}>
                      {diagnostic.wordResults.map((w, wi) => (
                        <Pressable
                          key={`${w.word}-${wi}`}
                          accessibilityRole="button"
                          onPress={() => speak(w.word, -40 - wi)}
                          style={[styles.wordChip, w.state === 'ok' ? styles.wMatch : w.state === 'near' ? styles.wClose : styles.wMiss]}
                        >
                          <Text style={[styles.wordChipText, isRtlTarget && styles.rtlWordChipText]}>{w.word}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                  <Pressable accessibilityRole="button" onPress={playAndEchoCurrent} style={styles.coachListenBtn}>
                    <Volume2 size={14} color={Palette.primaryDark} />
                    <Text style={styles.coachListenText}>شنیدن تلفظ درست و تکرار</Text>
                  </Pressable>
                </View>
              ) : null}

              {choicePanel && hasChoices && currentRule?.choices ? (
                <View style={styles.choiceList}>
                  {currentRule.choices.map((ch: Choice, idx: number) => (
                    <Pressable key={`choice-${index}-${idx}`} accessibilityRole="button" onPress={() => submitAnswer(ch.text, 'choice')} style={styles.choiceBtn}>
                      <Text style={[styles.choiceForeign, isRtlTarget && styles.rtlText]}>{ch.text}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {!typed ? (
                <SpeakCheck
                  key={`${index}-${current.text}-${roomMode}`}
                  text={current.text}
                  locale={locale}
                  accent={Palette.primary}
                  title={isEchoMode ? 'تکرار با صدای خودت' : 'پاسخ با صدای خودت'}
                  level={activeLevel}
                  adaptiveTiming
                  autoStart={autoMicArmed && !samplePlaying && !typed}
                  blindExam={false}
                  onResult={result => {
                    if (!result.heard.trim()) {
                      setAutoMicArmed(false);
                      setNote('صدایی دریافت نشد؛ می‌توانی «بشنو و تکرار کن» را بزنی یا دوباره روی میکروفن بگو.');
                      return;
                    }
                    submitAnswer(result.heard, 'voice');
                  }}
                  singleAttempt
                />
              ) : null}

              <View style={styles.turnRow}>
                {!typed ? (
                  <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => { setTyped(true); setNote(''); }}>
                    <Text style={styles.linkText}>نوشتن پاسخ</Text>
                  </Pressable>
                ) : (
                  <View style={styles.compose}>
                    <TextInput
                      value={draft}
                      onChangeText={setDraft}
                      onSubmitEditing={sendTyped}
                      returnKeyType="send"
                      placeholder={phraseVisible ? current.text : 'پاسخت را به زبان درس بنویس'}
                      placeholderTextColor={Palette.muted}
                      accessibilityLabel="پاسخ شما"
                      style={[styles.input, isRtlTarget && styles.rtlInput]}
                    />
                    <Pressable accessibilityRole="button" accessibilityLabel="ارسال پاسخ" onPress={sendTyped} style={styles.send}>
                      <Send size={16} color="#FFFFFF" />
                    </Pressable>
                  </View>
                )}

                {hasChoices ? (
                  <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => setChoicePanel(v => !v)}>
                    <Text style={styles.linkText}>{choicePanel ? 'بستن گزینه‌ها' : 'انتخاب از گزینه‌ها'}</Text>
                  </Pressable>
                ) : null}

                {attempts >= 1 ? (
                  <Pressable accessibilityRole="button" style={styles.skipButton} onPress={moveToNextTurn}>
                    <Text style={styles.skipText}>رفتن به خط بعدی</Text>
                  </Pressable>
                ) : null}

                {typed ? (
                  <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => { setTyped(false); setNote(''); }}>
                    <Text style={styles.linkText}>بازگشت به میکروفن</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}

          {current && !isMine ? (
            <View style={[styles.bubble, styles.theirs, typing && styles.bubblePending]}>
              <Text style={styles.who}>{typing ? `${partnerName} در حال آماده‌شدن…` : speakingAt === index ? `${partnerName} در حال صحبت…` : partnerName}</Text>
              {!typing ? (
                <>
                  <Text style={[styles.lineText, isRtlTarget && styles.rtlText]}>{current.text}</Text>
                  <Text style={styles.lineFa}>{current.fa}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="دوباره بشنو" onPress={() => speak(current.text, index)} style={styles.replay}>
                    <Volume2 size={15} color={Palette.primary} />
                    <Text style={styles.replayText}>دوباره بشنو</Text>
                  </Pressable>
                </>
              ) : null}
            </View>
          ) : null}

          {note ? <Text accessibilityLiveRegion="polite" style={styles.note}>{note}</Text> : null}

          <View style={styles.bottomActionsRow}>
            {roles.length > 1 ? (
              <Pressable accessibilityRole="button" style={styles.switchRow} onPress={flipRole}>
                <Text style={styles.linkText}>جای من و {partnerName} را عوض کن</Text>
              </Pressable>
            ) : null}
            <Pressable accessibilityRole="button" style={styles.switchRow} onPress={() => restart(isEchoMode ? 'natural-flow' : 'listen-echo')}>
              <Text style={styles.linkText}>{isEchoMode ? 'تغییر به مکالمهٔ روان (بدون متن)' : 'تغییر به بشنو و بگو (همراه با الگو)'}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'stretch', gap: 9, paddingVertical: 6 },
  invite: { width: '100%', gap: 11, paddingVertical: 16, paddingHorizontal: 14, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE2FF', alignItems: 'center' },
  inviteBadgesRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6 },
  optionalBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  optionalBadgeText: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: '#047857', writingDirection: 'rtl' },
  inviteBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: Palette.primarySoft, borderWidth: 1, borderColor: '#DDE2FF' },
  inviteBadgeText: { fontFamily: Typography.boldFontFamily, fontSize: 11.5, color: Palette.primaryDark, writingDirection: 'rtl' },
  inviteTitle: { fontFamily: Typography.boldFontFamily, fontSize: 18, lineHeight: 30, color: Palette.ink, textAlign: 'center', writingDirection: 'rtl' },
  sceneText: { fontFamily: Typography.boldFontFamily, fontSize: 14, lineHeight: 24, color: Palette.primaryDark, textAlign: 'center', writingDirection: 'rtl', maxWidth: 560 },
  inviteText: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 23, color: Palette.text, textAlign: 'center', writingDirection: 'rtl', maxWidth: 560 },
  recordBanner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: '#F5F7FF', borderWidth: 1, borderColor: '#C7D2FE' },
  recordBannerText: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: Palette.primaryDark, writingDirection: 'rtl' },
  modeSelector: { width: '100%', flexDirection: 'row-reverse', gap: 8, marginTop: 2 },
  modeCard: { flex: 1, borderRadius: 15, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#F8FAFC', padding: 11, gap: 4, alignItems: 'flex-end' },
  modeCardActive: { borderColor: Palette.primary, backgroundColor: Palette.primarySoft, borderWidth: 1.5 },
  modeHeadRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  modeTitle: { fontFamily: Typography.boldFontFamily, fontSize: 12.5, color: Palette.ink, writingDirection: 'rtl' },
  modeTitleOn: { color: Palette.primaryDark },
  modeDesc: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 18, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  roleBox: { width: '100%', gap: 6, alignItems: 'center', marginTop: 2 },
  roleHint: { fontFamily: Typography.fontFamily, fontSize: 11.5, color: Palette.muted, textAlign: 'center', writingDirection: 'rtl' },
  roleRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  roleChip: { minHeight: 38, borderRadius: 20, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', paddingHorizontal: 14, justifyContent: 'center' },
  roleChipOn: { backgroundColor: Palette.primarySoft, borderColor: Palette.primary },
  roleChipText: { fontFamily: Typography.fontFamily, fontSize: 12.5, color: Palette.text },
  roleChipTextOn: { color: Palette.primaryDark, fontFamily: Typography.boldFontFamily },
  enter: { minHeight: 52, width: '100%', maxWidth: 340, marginTop: 4, borderRadius: 16, backgroundColor: Palette.primary, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 20 },
  enterText: { fontFamily: Typography.boldFontFamily, fontSize: 15, color: '#FFFFFF', writingDirection: 'rtl' },
  emptyNote: { fontFamily: Typography.fontFamily, fontSize: 13, color: Palette.muted, textAlign: 'center', writingDirection: 'rtl' },
  thread: { width: '100%', gap: 10, marginTop: 6 },
  liveModeBar: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  liveModeBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: Palette.primarySoft, borderWidth: 1, borderColor: '#DDE2FF' },
  liveModeBadgeText: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Palette.primaryDark, writingDirection: 'rtl' },
  metaRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#E2E5F5' },
  dotDone: { backgroundColor: Palette.primary },
  dotNow: { backgroundColor: Palette.primarySoft, borderWidth: 1, borderColor: Palette.primary },
  typingText: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.muted, writingDirection: 'rtl' },
  turnCounterBadge: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: Palette.primaryDark, writingDirection: 'rtl' },
  sentGroup: { gap: 6 },
  bubble: { width: '100%', borderRadius: 20, padding: 14, borderWidth: 1, gap: 5 },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderColor: Palette.border, borderBottomLeftRadius: 6, maxWidth: '92%' },
  mine: { alignSelf: 'flex-end', backgroundColor: Palette.primarySoft, borderColor: '#DDE2FF', borderBottomRightRadius: 6, maxWidth: '92%' },
  bubblePending: { opacity: 0.5 },
  bubbleTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  bubbleRightActions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  who: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.primaryDark, writingDirection: 'rtl' },
  scorePill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, backgroundColor: '#ECFDF5' },
  scorePillText: { fontFamily: Typography.boldFontFamily, fontSize: 10, color: '#047857' },
  lineText: { fontFamily: 'Times New Roman', fontSize: 18, lineHeight: 28, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  rtlText: { fontFamily: Typography.boldFontFamily, textAlign: 'right', writingDirection: 'rtl' },
  rtlInput: { fontFamily: Typography.fontFamily, textAlign: 'right', writingDirection: 'rtl' },
  rtlWordBar: { flexDirection: 'row-reverse' },
  rtlWordChipText: { fontFamily: Typography.boldFontFamily, writingDirection: 'rtl' },
  lineFa: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 22, color: Palette.text, textAlign: 'right', writingDirection: 'rtl' },
  correctionHint: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 18, color: Palette.primaryDark, textAlign: 'right', writingDirection: 'rtl', marginTop: 2 },
  replay: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, padding: 4 },
  replayText: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.primary, writingDirection: 'rtl' },
  turnCard: { width: '100%', borderRadius: 20, borderWidth: 1, borderColor: '#DDE2FF', backgroundColor: '#FBFBFF', padding: 14, gap: 10 },
  turnHeaderRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  turnTitle: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.primaryDark, writingDirection: 'rtl' },
  levelBadge: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.primary, backgroundColor: Palette.primarySoft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, writingDirection: 'rtl' },
  turnPrompt: { fontFamily: Typography.fontFamily, fontSize: 15, lineHeight: 26, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  turnHint: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 21, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  phraseCard: { borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C7D2FE', padding: 12, gap: 8 },
  phraseCardTop: { flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  phraseCardLabel: { fontFamily: Typography.fontFamily, fontSize: 11.5, color: Palette.muted, writingDirection: 'rtl' },
  echoListenBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: Palette.primary },
  echoListenBtnActive: { backgroundColor: Palette.primaryDark },
  echoListenText: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: '#FFFFFF', writingDirection: 'rtl' },
  turnTarget: { fontFamily: 'Times New Roman', fontSize: 18, lineHeight: 28, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  naturalHelperBar: { gap: 8 },
  helperChipsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  helperChip: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' },
  helperChipText: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: Palette.primaryDark, writingDirection: 'rtl' },
  hidePhraseLink: { flexDirection: 'row-reverse', alignItems: 'center', alignSelf: 'flex-end', gap: 4 },
  hidePhraseText: { fontFamily: Typography.fontFamily, fontSize: 11.5, color: Palette.muted, writingDirection: 'rtl' },
  coachCard: { borderRadius: 14, borderWidth: 1, borderColor: '#FDE68A', backgroundColor: '#FFFBEB', padding: 11, gap: 8 },
  coachTitle: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: '#92400E', textAlign: 'right', writingDirection: 'rtl' },
  coachHeard: { fontFamily: Typography.fontFamily, fontSize: 12, color: '#78350F', textAlign: 'right', writingDirection: 'rtl' },
  coachListenBtn: { flexDirection: 'row-reverse', alignItems: 'center', alignSelf: 'flex-end', gap: 6, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FCD34D' },
  coachListenText: { fontFamily: Typography.boldFontFamily, fontSize: 11.5, color: Palette.primaryDark, writingDirection: 'rtl' },
  wordBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  wordChip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  wMatch: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  wClose: { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' },
  wMiss: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  wordChipText: { fontFamily: 'Times New Roman', fontSize: 12, fontWeight: '700', color: Palette.ink },
  choiceList: { gap: 7 },
  choiceBtn: { borderRadius: 12, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', padding: 11, gap: 3 },
  choiceForeign: { fontFamily: 'Times New Roman', fontSize: 15, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  turnRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  linkButton: { minHeight: 38, flexDirection: 'row-reverse', alignItems: 'center', gap: 4, justifyContent: 'center', paddingHorizontal: 4 },
  linkText: { fontFamily: Typography.fontFamily, fontSize: 13, color: Palette.primary, writingDirection: 'rtl' },
  skipButton: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 6 },
  skipText: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.muted, writingDirection: 'rtl' },
  compose: { flex: 1, minWidth: 220, flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  input: { flex: 1, minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', paddingHorizontal: 12, fontFamily: 'Times New Roman', fontSize: 16, color: Palette.ink },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  note: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 21, color: Palette.primaryDark, textAlign: 'center', writingDirection: 'rtl' },
  bottomActionsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', gap: 8 },
  switchRow: { minHeight: 38, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  doneCard: { width: '100%', marginTop: 12, padding: 18, borderRadius: 22, alignItems: 'stretch', gap: 14, borderWidth: 1 },
  doneCardGreen: { backgroundColor: '#F6FBF8', borderColor: '#BBF7D0' },
  doneCardBlue: { backgroundColor: '#F5F7FF', borderColor: '#C7D2FE' },
  heroBanner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  trophyBadge: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  trophyGreen: { backgroundColor: '#16A34A' },
  trophyBlue: { backgroundColor: Palette.primary },
  heroCopy: { flex: 1, gap: 4, alignItems: 'flex-end' },
  gradePillsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 5 },
  xpPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 12, backgroundColor: Palette.primarySoft },
  xpPillText: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Palette.primaryDark, writingDirection: 'rtl' },
  doneTitle: { fontFamily: Typography.boldFontFamily, fontSize: 16, lineHeight: 24, textAlign: 'right', writingDirection: 'rtl' },
  doneTitleGreen: { color: '#14532D' },
  doneTitleBlue: { color: '#1E3A8A' },
  doneText: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl' },
  doneTextGreen: { color: '#166534' },
  doneTextBlue: { color: '#1E40AF' },
  overallCircle: { minWidth: 66, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  circleGreen: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  circleBlue: { backgroundColor: '#E0E7FF', borderColor: '#A5B4FC' },
  overallValue: { fontFamily: Typography.boldFontFamily, fontSize: 18, writingDirection: 'rtl' },
  overallLabel: { fontFamily: Typography.fontFamily, fontSize: 10, writingDirection: 'rtl' },
  metricsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  metricBox: { flex: 1, minWidth: '30%', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', gap: 2 },
  metricValue: { fontFamily: Typography.boldFontFamily, fontSize: 15, color: Palette.ink, writingDirection: 'rtl' },
  metricLabel: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.muted, writingDirection: 'rtl' },
  finalHint: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 21, textAlign: 'right', writingDirection: 'rtl' },
  weakFocusBox: { padding: 12, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C7D2FE', gap: 7 },
  weakFocusTitle: { fontFamily: Typography.boldFontFamily, fontSize: 12.5, color: Palette.primaryDark, textAlign: 'right', writingDirection: 'rtl' },
  weakWordsText: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.text, textAlign: 'right', writingDirection: 'rtl' },
  weakSentenceBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, padding: 9, borderRadius: 11, backgroundColor: '#F5F7FF', borderWidth: 1, borderColor: '#DDE2FF' },
  weakSentenceText: { flex: 1, fontFamily: 'Times New Roman', fontSize: 14, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  resumeLineFa: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  reviewList: { gap: 8 },
  reviewHeading: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  reviewItem: { padding: 12, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', gap: 5 },
  reviewTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  reviewTurnWrap: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  reviewTurn: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: Palette.ink, writingDirection: 'rtl' },
  scoreTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  scoreTagText: { fontFamily: Typography.boldFontFamily, fontSize: 11, writingDirection: 'rtl' },
  reviewPrompt: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 19, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  reviewHeard: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: Palette.text, textAlign: 'right', writingDirection: 'rtl' },
  expectedPlayRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 2 },
  reviewExpected: { flex: 1, fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: Palette.primaryDark, textAlign: 'right', writingDirection: 'rtl' },
  doneActions: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  againButton: { minHeight: 44, paddingHorizontal: 18, borderRadius: 14, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  againText: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: '#FFFFFF', writingDirection: 'rtl' },
  flipDoneButton: { minHeight: 44, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: Palette.primary, backgroundColor: '#FFFFFF', flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  flipDoneText: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.primaryDark, writingDirection: 'rtl' },
});
