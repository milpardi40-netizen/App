import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import {
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  ClipboardCheck,
  HelpCircle,
  Mic2,
  RefreshCw,
  Send,
  ShieldAlert,
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
import { fillLine, followUpLanguageFromLocale, followUpMoves, type FollowUpMove } from '@/lib/dialogueFollowUps';
import { scoreSpeech, stripStressMarks } from '@/lib/speechScore';

type ChatLine = { who: string; role?: 'learner' | 'partner'; text: string; fa: string };
type TurnStatus = 'passed' | 'assisted' | 'skipped';
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
  usedHint: boolean;
  usedReveal: boolean;
  feedback: string;
  weakWords?: string[];
};
type RoomMode = 'oral-exam' | 'guided-practice';
type ActiveFollowUp = {
  afterTurn: number;
  move: FollowUpMove;
  learnerSourceLine: string;
};
type AttemptDiagnostic = {
  heard: string;
  score: number;
  feedback: string;
  partnerPushback?: { text: string; fa: string };
  wordResults?: SpeechWordResult[];
  missingConcepts?: string[];
};
type ThreadExtra = {
  id: string;
  who: 'partner' | 'learner';
  name: string;
  text: string;
  fa: string;
  tag?: string;
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

const TYPING_MS = 520;
const LEARNER_LABELS = new Set(['learner', 'you', 'شما', 'زبان‌آموز', 'زبانآموز']);

const OPENING_CUES: Record<BranchingLocale, { text: string; fa: string }> = {
  'en-US': { text: 'All right, let us begin the speaking check. You start.', fa: 'بسیار خب، امتحان شفاهی را شروع می‌کنیم. شما آغاز کنید.' },
  'de-DE': { text: 'Gut, fangen wir an. Sie beginnen.', fa: 'خوب است، شروع می‌کنیم. شما آغاز کنید.' },
  'fr-FR': { text: 'Très bien, commençons. C’est à vous.', fa: 'بسیار خب، شروع می‌کنیم. نوبت شماست.' },
  'es-ES': { text: 'Muy bien, empecemos. Tú comienzas.', fa: 'بسیار خب، شروع می‌کنیم. شما آغاز کنید.' },
  'tr-TR': { text: 'Harika, başlayalım. İlk söz sizde.', fa: 'عالی، شروع می‌کنیم. نوبت اول با شماست.' },
  'ru-RU': { text: 'Хорошо, начнём. Ваша очередь.', fa: 'بسیار خب، شروع می‌کنیم. نوبت شماست.' },
  'ar-SA': { text: 'حَسَنًا، لِنَبْدَأْ. تَفَضَّلْ أَنْتَ بِالْبِدَايَةِ.', fa: 'بسیار خب، شروع می‌کنیم. شما آغاز کنید.' },
};

const learnerRoleOf = (lines: ChatLine[]) => lines.find(line => line.role === 'learner')?.who
  ?? lines.find(line => LEARNER_LABELS.has(line.who))?.who
  ?? null;
const nameOf = (who: string) => (who === 'partner' ? 'هم‌صحبت' : who === 'learner' ? 'شما' : who);

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

function gradeBadgeFa(grade: OralExamOutcome['grade']): string {
  switch (grade) {
    case 'A': return 'رتبه A · عالی';
    case 'B': return 'رتبه B · خوب';
    case 'C': return 'رتبه C · قابل قبول';
    default: return 'نیاز به تمرین';
  }
}

function evaluateRoomSummary(
  reports: readonly TurnReport[],
  mode: RoomMode,
  followUpScore: number | null,
) {
  if (!reports.length) {
    return {
      tier: 'needs-work' as const,
      grade: 'needs-work' as const,
      overall: 0,
      semantic: 0,
      pronunciation: 0,
      independence: 0,
      interaction: 0,
      activeRate: 0,
      skippedCount: 0,
      voiceTurns: 0,
      xp: 0,
      weakWords: [] as string[],
      weakSentences: [] as string[],
      rankTitle: 'نوبتی از سمت شما ثبت نشد',
      rankSubtitle: 'در این دور نقشی که انتخاب کردید نوبت فعالی نداشت؛ جای نقش‌ها را عوض کنید تا خودتان پاسخ دهید.',
      advice: 'گزینهٔ «جابه‌جایی نقش» را بزنید تا نوبت‌های پاسخ‌گویی به شما برسد.',
      passed: false,
    };
  }

  const semantic = Math.round(reports.reduce((sum, item) => sum + item.score, 0) / reports.length);
  const completed = reports.filter(item => item.status !== 'skipped');
  const skippedCount = reports.length - completed.length;
  const activeRate = Math.round((completed.length / reports.length) * 100);
  const voiceReports = completed.filter(item => item.method === 'voice');
  const voiceTurns = voiceReports.length;

  // Real oral pronunciation score: strictly reflects spoken voice turns in exam mode.
  const avgVoicePron = voiceReports.length
    ? Math.round(voiceReports.reduce((sum, item) => sum + (item.pronunciationScore ?? item.score), 0) / voiceReports.length)
    : 0;
  const voiceCoverage = voiceReports.length / reports.length;
  const pronunciation = mode === 'oral-exam'
    ? Math.round(avgVoicePron * voiceCoverage)
    : voiceReports.length
      ? Math.round(avgVoicePron * Math.max(0.5, voiceCoverage))
      : Math.round(semantic * 0.45);

  const independenceRaw = reports.reduce((sum, item) => {
    if (item.status === 'skipped') return sum;
    const typedPenalty = mode === 'oral-exam' && item.method === 'typed' ? 22 : 0;
    const penalty = (item.usedReveal ? 30 : 0)
      + (item.usedHint ? 12 : 0)
      + Math.min(24, item.retries * 9)
      + (item.method === 'choice' ? 12 : 0)
      + typedPenalty;
    return sum + Math.max(15, 100 - penalty);
  }, 0);
  const independence = Math.round(independenceRaw / reports.length);

  const interaction = followUpScore !== null
    ? Math.round(activeRate * 0.65 + followUpScore * 0.35)
    : activeRate;

  const rawOverall = mode === 'oral-exam'
    ? Math.round(semantic * 0.4 + pronunciation * 0.3 + independence * 0.15 + interaction * 0.15)
    : Math.round(semantic * 0.5 + independence * 0.25 + interaction * 0.25);

  // An unfinished turn caps the grade so skipped answers never look "mastered".
  const overall = skippedCount > 0 ? Math.min(64, Math.max(0, rawOverall)) : Math.max(0, Math.min(100, rawOverall));

  const grade: OralExamOutcome['grade'] =
    skippedCount === 0 && overall >= 85 && (mode === 'guided-practice' || voiceTurns >= Math.ceil(reports.length * 0.5))
      ? 'A'
      : skippedCount === 0 && overall >= 70
        ? 'B'
        : skippedCount === 0 && overall >= 55
          ? 'C'
          : 'needs-work';

  const tier: 'mastered' | 'acceptable' | 'needs-work' =
    grade === 'A' ? 'mastered' : grade === 'B' || grade === 'C' ? 'acceptable' : 'needs-work';

  const passed = grade !== 'needs-work';

  const xp = reports.reduce((sum, item) => {
    if (item.status === 'skipped') return sum;
    const base = item.score >= 85 && !item.usedReveal ? 25 : item.score >= 70 ? 16 : 8;
    const oralBonus = mode === 'oral-exam' && item.method === 'voice' ? 10 : 0;
    return sum + base + oralBonus;
  }, 0);

  const weakWords = [...new Set(reports.flatMap(r => r.weakWords ?? []))].slice(0, 8);
  const weakSentences = [...new Set(
    reports
      .filter(r => r.status === 'skipped' || r.score < 75 || (r.pronunciationScore !== undefined && r.pronunciationScore < 70))
      .map(r => r.expected),
  )];

  const rankTitle = mode === 'oral-exam'
    ? (grade === 'A'
      ? 'قبولی ممتاز در امتحان شفاهی'
      : grade === 'B'
        ? 'قبولی خوب در امتحان شفاهی'
        : grade === 'C'
          ? 'قبولی مرزی در امتحان شفاهی'
          : 'نیاز به تمرین بیشتر برای قبولی شفاهی')
    : (tier === 'mastered'
      ? 'تمرین هدایت‌شده با تسلط کامل'
      : tier === 'acceptable'
        ? 'تمرین هدایت‌شدهٔ قابل قبول'
        : 'نیاز به مرور بیشتر در تمرین');

  const rankSubtitle = mode === 'oral-exam'
    ? (skippedCount > 0
      ? `${fa(skippedCount)} سؤال بدون پاسخ ماند؛ در امتحان شفاهی برای قبولی باید همهٔ نوبت‌ها را پاسخ دهی.`
      : voiceTurns === 0
        ? 'همهٔ پاسخ‌ها با نوشتن ثبت شدند؛ برای امتیاز واقعی گفتار و رتبهٔ عالی، امتحان را با میکروفن بده.'
        : grade === 'A'
          ? 'پاسخ‌های شفاهی شما بدون راهنما، روان، دقیق و متناسب با پرسش ممتحن بود.'
          : grade === 'B'
            ? 'منظور مکالمه و ساختار جمله به‌خوبی منتقل شد؛ چند واژه یا تلفظ هنوز جای صیقل دارد.'
            : 'معنای اصلی منتقل شد، اما تکرار خطا یا وضوح گفتار هنوز به سطح تسلط نرسیده است.')
    : 'این نتیجه مربوط به حالت تمرین هدایت‌شده است؛ برای ثبت رکورد رسمی، «امتحان شفاهی واقعی» را امتحان کن.';

  const weakCount = reports.filter(item => item.status === 'skipped' || item.score < 72 || item.usedReveal).length;
  const advice = mode === 'oral-exam'
    ? (weakCount === 0 && voiceTurns === reports.length
      ? 'عملکرد شفاهی فوق‌العاده‌ای داشتی! می‌توانی برای تسلط دوطرفه «جابه‌جایی نقش» را هم امتحان کنی.'
      : voiceTurns < reports.length
        ? 'سعی کن در دور بعدی همهٔ پاسخ‌ها را با میکروفن بگویی تا نمرهٔ تلفظ و روانی گفتار کامل ثبت شود.'
        : `روی ${fa(weakCount)} نوبت ضعیف‌تر و واژه‌های مشخص‌شده زیر کار کن و دوباره امتحان بده.`)
    : 'حالا که با جریان گفت‌وگو آشنا شدی، حالت «امتحان شفاهی واقعی» را بزن تا بدون راهنما نمرهٔ رسمی بگیری.';

  return {
    tier,
    grade,
    overall,
    semantic,
    pronunciation,
    independence,
    interaction,
    activeRate,
    skippedCount,
    voiceTurns,
    xp,
    weakWords,
    weakSentences,
    rankTitle,
    rankSubtitle,
    advice,
    passed,
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

  // Keep the lesson's authentic dialogue intact without injecting unrelated trailing sentences.
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
  const [roomMode, setRoomMode] = useState<RoomMode>('oral-exam');
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const [speakingAt, setSpeakingAt] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [typed, setTyped] = useState(false);
  const [choicePanel, setChoicePanel] = useState(false);
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');
  const [reports, setReports] = useState<TurnReport[]>([]);
  const [learnerActuals, setLearnerActuals] = useState<Record<number, { text: string; status: TurnStatus; score: number; correction?: string }>>({});
  const [diagnostic, setDiagnostic] = useState<AttemptDiagnostic | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [activeFollowUp, setActiveFollowUp] = useState<ActiveFollowUp | null>(null);
  const [followUpUsed, setFollowUpUsed] = useState(false);
  const [followUpScore, setFollowUpScore] = useState<number | null>(null);
  const [threadExtras, setThreadExtras] = useState<Record<number, ThreadExtra[]>>({});
  const [openingCuePlayed, setOpeningCuePlayed] = useState(false);
  const [previousBest, setPreviousBest] = useState<OralExamOutcome | null>(null);
  const outcomeSavedRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spokenFor = useRef<number | null>(null);

  const activeLevel: ConversationLevel = semanticPractice?.level
    ?? (levelId === 0 ? 'Pre-A1' : levelId === 1 ? 'A1' : levelId === 2 ? 'A2' : levelId === 3 ? 'B1' : levelId === 4 ? 'B2' : levelId === 5 ? 'C1' : 'A1');

  const isExamMode = roomMode === 'oral-exam';
  const current = displayLines[index];
  const currentRule: SemanticTurn | undefined = current
    ? (semanticPractice?.turns[index] ?? semanticPractice?.allTurns?.[index] ?? buildFallbackRule(current))
    : undefined;
  const isMine = !!current && !!myRole && current.who === myRole;
  const finished = open && index >= lines.length && !activeFollowUp;
  const sent = useMemo(() => displayLines.slice(0, Math.min(index, displayLines.length)), [displayLines, index]);
  const partnerName = isExamMode
    ? 'ممتحن'
    : nameOf(lines.find(line => line.who !== myRole)?.who ?? 'partner');

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
    setRevealed(restored.revealed);
    setMyRole(restored.myRole ?? declared ?? roles[0] ?? null);
    setBranchReplies({});
    setTyped(false);
    setChoicePanel(false);
    setDraft('');
    setNote('');
    setReports([]);
    setLearnerActuals({});
    setDiagnostic(null);
    setHintOpen(false);
    setActiveFollowUp(null);
    setFollowUpUsed(false);
    setFollowUpScore(null);
    setThreadExtras({});
    setOpeningCuePlayed(false);
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
      revealed,
      completed: finished,
    });
  }, [attempts, finished, hydrated, index, lines.length, myRole, onSessionChange, open, revealed]);

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

  const advance = useCallback(() => {
    clearStall();
    onStop?.();
    setAttempts(0);
    setRevealed(false);
    setChoicePanel(false);
    setDraft('');
    setNote('');
    setDiagnostic(null);
    setHintOpen(false);
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
    if (!open || !current || isMine || activeFollowUp) return;
    if (typing || spokenFor.current === index) return;
    showPartner(index);
  }, [activeFollowUp, current, index, isMine, open, showPartner, typing]);

  const maybePickFollowUp = useCallback((learnerLine: string, turnIdx: number): ActiveFollowUp | null => {
    if (!isExamMode || followUpUsed) return null;
    if (turnIdx >= lines.length - 1) return null;
    const lang = followUpLanguageFromLocale(locale);
    if (!lang) return null;
    const moves = followUpMoves(lang);
    const pool = activeLevel === 'Pre-A1' || activeLevel === 'A1'
      ? moves.filter(m => m.id === 'repeat' || m.id === 'confirm')
      : moves.filter(m => m.id === 'why' || m.id === 'mean' || m.id === 'confirm');
    const chosen = pool[(turnIdx + lessonId.length) % pool.length] ?? moves[0];
    return { afterTurn: turnIdx, move: chosen, learnerSourceLine: learnerLine };
  }, [activeLevel, followUpUsed, isExamMode, lessonId.length, lines.length, locale]);

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
        correction: expectedText && score < 88 && cleanActual !== cleanExpected ? expectedText : undefined,
      },
    }));

    if (reply && turnIdx + 1 < lines.length) {
      setBranchReplies(value => ({ ...value, [turnIdx + 1]: reply }));
    }

    if (status !== 'skipped') {
      const followUp = maybePickFollowUp(actualText, turnIdx);
      if (followUp) {
        const askText = fillLine(followUp.move.ask, actualText);
        const askFa = fillLine(followUp.move.askFa, actualText);
        setFollowUpUsed(true);
        setActiveFollowUp(followUp);
        setAttempts(0);
        setRevealed(false);
        setDraft('');
        setNote('');
        setDiagnostic(null);
        setHintOpen(false);
        setThreadExtras(prev => ({
          ...prev,
          [turnIdx]: [
            ...(prev[turnIdx] ?? []),
            { id: `fu-ask-${turnIdx}`, who: 'partner', name: partnerName, text: askText, fa: askFa, tag: 'پرسش زندهٔ ممتحن' },
          ],
        }));
        speak(askText, -1);
        return;
      }
    }

    advance();
  }, [advance, lines.length, maybePickFollowUp, partnerName, speak]);

  const fail = (message: string, diag?: AttemptDiagnostic) => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setNote(message);
    if (diag) setDiagnostic(diag);
    if (diag?.partnerPushback) {
      speak(diag.partnerPushback.text, -2);
    }
  };

  const submitFollowUpAnswer = (answer: string) => {
    if (!activeFollowUp) return;
    const trimmed = answer.trim();
    if (!trimmed) {
      setNote('لطفاً به پرسش هم‌صحبت پاسخ بده.');
      return;
    }
    const turnIdx = activeFollowUp.afterTurn;
    const optTargets = activeFollowUp.move.options.map(opt => fillLine(opt.text, activeFollowUp.learnerSourceLine));
    const matchedOptIdx = optTargets.findIndex(optText => {
      const s = scoreSpeech(optText, trimmed);
      return s.score >= 65;
    });

    const isPreOrA1 = activeLevel === 'Pre-A1' || activeLevel === 'A1';
    const isArabic = locale.toLowerCase().startsWith('ar');
    const repeatedSourceLine = isPreOrA1 && scoreSpeech(activeFollowUp.learnerSourceLine, trimmed).score >= 60;
    const shortConfirmWord = isPreOrA1 && activeFollowUp.move.id === 'confirm'
      && /^(yes|yeah|ok|okay|sure|ja|klar|oui|sí|si|evet|tamam|да|конечно|نعم|أجل|بلى|حسناً|حسنا|تمام)[!.]?$/i.test(trimmed);
    const isWhyOrMean = activeFollowUp.move.id === 'why' || activeFollowUp.move.id === 'mean';
    const reasonableFreeAnswer = isWhyOrMean && trimmed.split(/\s+/).length >= 2 && (isArabic ? !/[پچژگ]/.test(trimmed) : !/[\u0600-\u06FF]/.test(trimmed));

    if (matchedOptIdx === -1 && !repeatedSourceLine && !shortConfirmWord && !reasonableFreeAnswer) {
      fail('پاسخت به پرسشِ ممتحن واضح نبود؛ کوتاه و مستقیم به همین پرسش جواب بده.', {
        heard: trimmed,
        score: 25,
        feedback: 'ممتحن منتظر پاسخ کوتاه به همین پرسش است.',
      });
      return;
    }

    const pickedOption = activeFollowUp.move.options[matchedOptIdx >= 0 ? matchedOptIdx : 0];
    setFollowUpScore(attempts === 0 ? 100 : attempts === 1 ? 80 : 65);
    setThreadExtras(prev => ({
      ...prev,
      [turnIdx]: [
        ...(prev[turnIdx] ?? []),
        { id: `fu-ans-${turnIdx}`, who: 'learner', name: 'شما', text: trimmed, fa: '' },
        { id: `fu-ack-${turnIdx}`, who: 'partner', name: partnerName, text: pickedOption.after.text, fa: pickedOption.after.fa },
      ],
    }));
    setActiveFollowUp(null);
    speak(pickedOption.after.text, -3, () => advance());
  };

  const submitAnswer = (answer: string, method: 'voice' | 'typed' | 'choice' = 'typed') => {
    if (activeFollowUp) {
      submitFollowUpAnswer(answer);
      return;
    }
    if (!current || !currentRule) return;
    const promptFa = currentRule.promptFa || current.fa;
    const semantic = evaluateSemanticResponse(currentRule, answer, locale, activeLevel);

    if (!semantic.accepted) {
      fail(semantic.feedback, {
        heard: answer,
        score: semantic.score,
        feedback: semantic.feedback,
        partnerPushback: semantic.partnerPushback,
        wordResults: semantic.wordResults,
        missingConcepts: semantic.missingConcepts,
      });
      return;
    }

    const weakWords = (semantic.wordResults ?? [])
      .filter(w => w.state !== 'ok')
      .map(w => w.word.replace(/[.,!?;:¿¡؟،؛"«»()]/g, '').trim())
      .filter(Boolean);

    const turnStatus: TurnStatus = (hintOpen || revealed || attempts > 0) ? 'assisted' : 'passed';
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
        usedHint: hintOpen,
        usedReveal: revealed,
        feedback: semantic.feedback,
        weakWords,
      },
    ]);
    setDraft('');
    setNote('');
    setDiagnostic(null);
    completeTurnAndAdvance(index, answer.trim(), turnStatus, semantic.score, semantic.branchReply, current.text);
  };

  const skipAsIncomplete = () => {
    if (activeFollowUp) {
      setFollowUpScore(30);
      setActiveFollowUp(null);
      advance();
      return;
    }
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
        usedHint: hintOpen,
        usedReveal: revealed,
        feedback: 'این نوبت بدون پاسخ کامل رد شد (ناتمام).',
      },
    ]);
    completeTurnAndAdvance(index, '— (ناتمام)', 'skipped', 0, undefined, current.text);
  };

  const begin = async (selectedMode?: RoomMode) => {
    if (starting) return;
    const chosenMode = selectedMode ?? roomMode;
    setRoomMode(chosenMode);
    setStarting(true);
    setOpen(true);
    setIndex(0);
    setOpeningCuePlayed(false);
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
      // If turn 0 belongs to the learner, play a brief natural examiner greeting first.
      const firstLine = lines[0];
      if (firstLine && firstLine.who === (myRole ?? declared ?? roles[0])) {
        const cue = OPENING_CUES[locale] ?? OPENING_CUES['en-US'];
        setOpeningCuePlayed(true);
        speak(cue.text, -5);
      }
    }
  };

  const restart = (nextMode?: RoomMode) => {
    clearTimer(); clearStall();
    spokenFor.current = null;
    if (nextMode) setRoomMode(nextMode);
    setBranchReplies({});
    setLearnerActuals({});
    setThreadExtras({});
    setActiveFollowUp(null);
    setFollowUpUsed(false);
    setFollowUpScore(null);
    setOpeningCuePlayed(false);
    outcomeSavedRef.current = false;
    setIndex(0); setAttempts(0); setRevealed(false); setTyping(false); setSpeakingAt(null);
    setDraft(''); setNote(''); setDiagnostic(null); setReports([]); setHintOpen(false); setChoicePanel(false);
  };

  const flipRole = () => {
    const other = roles.find(role => role !== myRole);
    if (!other) return;
    setMyRole(other);
    restart();
  };

  const sendTyped = () => {
    if (!current && !activeFollowUp) return;
    submitAnswer(draft, 'typed');
  };

  const summary = useMemo(
    () => evaluateRoomSummary(reports, roomMode, followUpScore),
    [reports, roomMode, followUpScore],
  );

  // Persist finished oral exam / practice outcome once so the user keeps a durable record per lesson.
  useEffect(() => {
    if (!finished || !reports.length || outcomeSavedRef.current) return;
    outcomeSavedRef.current = true;
    const record: OralExamOutcome = {
      mode: roomMode,
      overall: summary.overall,
      bestOverall: Math.max(summary.overall, previousBest?.bestOverall ?? 0),
      pronunciation: summary.pronunciation,
      semantic: summary.semantic,
      independence: summary.independence,
      interaction: summary.interaction,
      grade: summary.grade,
      passed: summary.passed,
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

  const hintKeywords = currentRule?.concepts?.map(g => g[0]).filter(Boolean) ?? [];
  const halfTargetHint = current ? `${current.text.split(/\s+/).slice(0, Math.max(1, Math.ceil(current.text.split(/\s+/).length / 2))).join(' ')} …` : '';
  const hasChoices = !isExamMode && Boolean(currentRule?.choices?.length) && (activeLevel === 'Pre-A1' || activeLevel === 'A1');
  const learnerTurnsTotal = lines.filter(line => line.who === myRole).length;
  const openingCue = OPENING_CUES[locale] ?? OPENING_CUES['en-US'];

  const doneCardTheme = summary.tier === 'mastered'
    ? { card: styles.doneCardGreen, badge: styles.trophyGreen, title: styles.doneTitleGreen, text: styles.doneTextGreen, circle: styles.circleGreen }
    : summary.tier === 'acceptable'
      ? { card: styles.doneCardBlue, badge: styles.trophyBlue, title: styles.doneTitleBlue, text: styles.doneTextBlue, circle: styles.circleBlue }
      : { card: styles.doneCardWarn, badge: styles.trophyWarn, title: styles.doneTitleWarn, text: styles.doneTextWarn, circle: styles.circleWarn };

  return (
    <View style={styles.wrap}>
      {!open ? (
        <View style={styles.invite}>
          <View style={styles.inviteBadgesRow}>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalBadgeText}>بخش اختیاری</Text>
            </View>
            <View style={styles.inviteBadge}>
              <Sparkles size={14} color={Palette.primary} />
              <Text style={styles.inviteBadgeText}>اتاق مکالمه و امتحان شفاهی · {levelLabelFa(activeLevel)} · {fa(learnerTurnsTotal)} پرسش</Text>
            </View>
          </View>

          <Text style={styles.inviteTitle}>آماده‌ای دانش همین درس را زنده امتحان بدهی؟</Text>
          {situation ? <Text style={styles.sceneText}>موقعیت: {situation}</Text> : null}
          <Text style={styles.inviteText}>
            تکمیل این بخش اجباری نیست و هر زمان بخواهی می‌توانی درس را به پایان برسانی؛ اما اگر وارد شوی، ممتحن صوتی با پرسش‌های زنده از همین درس از تو امتحان شفاهی می‌گیرد و کارنامهٔ ۴ شاخصه (تلفظ، معنا، استقلال، واکنش) برایت صادر می‌کند.
          </Text>

          {previousBest ? (
            <View style={styles.recordBanner}>
              <Trophy size={16} color={Palette.primaryDark} />
              <Text style={styles.recordBannerText}>
                بهترین رکورد قبلی شما در این درس: {fa(previousBest.bestOverall)}٪ ({gradeBadgeFa(previousBest.grade)})
              </Text>
            </View>
          ) : null}

          <View style={styles.modeSelector}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: roomMode === 'oral-exam' }}
              onPress={() => setRoomMode('oral-exam')}
              style={[styles.modeCard, roomMode === 'oral-exam' && styles.modeCardExamOn]}
            >
              <View style={styles.modeHeadRow}>
                <ClipboardCheck size={15} color={roomMode === 'oral-exam' ? Palette.primaryDark : Palette.muted} />
                <Text style={[styles.modeTitle, roomMode === 'oral-exam' && styles.modeTitleOn]}>امتحان شفاهی واقعی</Text>
              </View>
              <Text style={styles.modeDesc}>بدون متنِ آماده و تقلب · همراه با پرسش غیرمنتظرهٔ ممتحن و صدور کارنامهٔ رسمی</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: roomMode === 'guided-practice' }}
              onPress={() => setRoomMode('guided-practice')}
              style={[styles.modeCard, roomMode === 'guided-practice' && styles.modeCardOn]}
            >
              <View style={styles.modeHeadRow}>
                <HelpCircle size={15} color={roomMode === 'guided-practice' ? Palette.primaryDark : Palette.muted} />
                <Text style={[styles.modeTitle, roomMode === 'guided-practice' && styles.modeTitleOn]}>تمرین هدایت‌شده</Text>
              </View>
              <Text style={styles.modeDesc}>با شنیدن نمونه، سرنخ معنایی و الگوی کمکی برای آماده‌شدن پیش از امتحان</Text>
            </Pressable>
          </View>

          {roles.length > 1 ? (
            <View style={styles.roleRow}>
              {roles.map(role => (
                <Pressable
                  key={role}
                  accessibilityRole="button"
                  accessibilityState={{ selected: role === myRole }}
                  onPress={() => { setMyRole(role); restart(); }}
                  style={[styles.roleChip, role === myRole && styles.roleChipOn]}
                >
                  <Text style={[styles.roleChipText, role === myRole && styles.roleChipTextOn]}>نقش شما: {nameOf(role)}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: starting }}
            disabled={starting}
            style={[styles.enter, isExamMode && styles.enterExam]}
            onPress={() => void begin()}
          >
            {isExamMode ? <ClipboardCheck size={18} color="#FFFFFF" /> : <Mic2 size={18} color="#FFFFFF" />}
            <Text style={styles.enterText}>{isExamMode ? 'شروع امتحان شفاهی' : 'شروع تمرین مکالمه'}</Text>
          </Pressable>
          {starting ? <ActivityIndicator color={Palette.primary} /> : null}
        </View>
      ) : finished ? (
        <View style={[styles.doneCard, doneCardTheme.card]}>
          <View style={styles.heroBanner}>
            <View style={[styles.trophyBadge, doneCardTheme.badge]}>
              {summary.tier === 'needs-work' ? <AlertTriangle size={22} color="#FFFFFF" /> : <Trophy size={24} color="#FFFFFF" />}
            </View>
            <View style={styles.heroCopy}>
              <View style={styles.gradePillsRow}>
                <View style={styles.xpPill}>
                  <Award size={13} color={Palette.primary} />
                  <Text style={styles.xpPillText}>{isExamMode ? gradeBadgeFa(summary.grade) : 'حالت تمرین'}</Text>
                </View>
                {summary.xp > 0 ? (
                  <View style={styles.xpPill}>
                    <Text style={styles.xpPillText}>+{fa(summary.xp)} امتیاز</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.doneTitle, doneCardTheme.title]}>{summary.rankTitle}</Text>
              <Text style={[styles.doneText, doneCardTheme.text]}>{summary.rankSubtitle}</Text>
            </View>
            <View style={[styles.overallCircle, doneCardTheme.circle]}>
              <Text style={[styles.overallValue, doneCardTheme.title]}>{fa(summary.overall)}٪</Text>
              <Text style={[styles.overallLabel, doneCardTheme.text]}>نمرهٔ واقعی</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{fa(summary.pronunciation)}٪</Text>
              <Text style={styles.metricLabel}>تلفظ و گفتار</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{fa(summary.semantic)}٪</Text>
              <Text style={styles.metricLabel}>دقت معنا</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{fa(summary.independence)}٪</Text>
              <Text style={styles.metricLabel}>استقلال پاسخ</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{fa(summary.interaction)}٪</Text>
              <Text style={styles.metricLabel}>تعامل زنده</Text>
            </View>
          </View>

          <Text style={[styles.finalHint, doneCardTheme.text]}>{summary.advice}</Text>

          {summary.weakSentences.length > 0 ? (
            <View style={styles.weakFocusBox}>
              <Text style={styles.weakFocusTitle}>تمرین پیشنهادی برای تثبیت (بشنو و تکرار کن)</Text>
              {summary.weakWords.length > 0 ? (
                <Text style={styles.weakWordsText}>واژه‌های نیازمند دقت بیشتر: {summary.weakWords.join(' · ')}</Text>
              ) : null}
              {summary.weakSentences.slice(0, 3).map((sentence, idx) => (
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

          {reports.length ? (
            <View style={styles.reviewList}>
              <Text style={styles.reviewHeading}>کارنامهٔ نوبت به نوبت</Text>
              {reports.map(item => {
                const tier = item.status === 'skipped' ? 'ناتمام' : item.score >= 85 && !item.usedReveal ? 'مسلط' : item.score >= 68 ? 'قابل قبول' : 'ضعیف';
                const tierColor = item.status === 'skipped' ? '#DC2626' : item.score >= 85 && !item.usedReveal ? Palette.success : item.score >= 68 ? Palette.primary : '#D97706';
                return (
                  <View key={`report-${item.index}`} style={styles.reviewItem}>
                    <View style={styles.reviewTop}>
                      <View style={styles.reviewTurnWrap}>
                        <CheckCircle2 size={14} color={tierColor} />
                        <Text style={styles.reviewTurn}>
                          پرسش {fa(item.index + 1)} · {item.method === 'voice' ? 'شفاهی (صدا)' : item.method === 'choice' ? 'گزینه‌ای' : 'نوشتاری'}
                          {item.retries > 0 ? ` · ${fa(item.retries)} تلاش مجدد` : ''}
                        </Text>
                      </View>
                      <View style={[styles.scoreTag, { borderColor: tierColor }]}>
                        <Text style={[styles.scoreTagText, { color: tierColor }]}>{tier} · {fa(item.score)}٪</Text>
                      </View>
                    </View>
                    {item.promptFa ? <Text style={styles.reviewPrompt}>موقعیت/هدف: {item.promptFa}</Text> : null}
                    <Text style={styles.reviewHeard}>پاسخ شما: {item.heard.trim() ? item.heard : '— (ناتمام)'}</Text>
                    <Text style={item.status !== 'skipped' && item.score >= 68 ? styles.successLine : styles.errorLine}>{item.feedback}</Text>
                    <Pressable accessibilityRole="button" onPress={() => speak(item.expected, -20 - item.index)} style={styles.expectedPlayRow}>
                      <Volume2 size={14} color={Palette.primary} />
                      <Text style={styles.reviewExpected}>الگوی استاندارد: {item.expected}</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : null}

          <View style={styles.doneActions}>
            {!isExamMode ? (
              <Pressable accessibilityRole="button" style={styles.againButton} onPress={() => restart('oral-exam')}>
                <Text style={styles.againText}>حالا امتحان شفاهی واقعی بده</Text>
              </Pressable>
            ) : (
              <Pressable accessibilityRole="button" style={styles.againButton} onPress={() => restart('oral-exam')}>
                <Text style={styles.againText}>تکرار امتحان برای نمرهٔ بهتر</Text>
              </Pressable>
            )}
            {roles.length > 1 ? (
              <Pressable accessibilityRole="button" style={styles.flipDoneButton} onPress={flipRole}>
                <RefreshCw size={15} color={Palette.primary} />
                <Text style={styles.flipDoneText}>جابه‌جایی نقش</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.thread}>
          <View style={styles.liveModeBar}>
            <View style={[styles.liveModeBadge, isExamMode ? styles.liveExamBadge : styles.livePracticeBadge]}>
              {isExamMode ? <ClipboardCheck size={13} color="#FFFFFF" /> : <Sparkles size={13} color={Palette.primaryDark} />}
              <Text style={[styles.liveModeBadgeText, isExamMode && { color: '#FFFFFF' }]}>
                {isExamMode ? 'امتحان شفاهی واقعی · بدون تقلب' : 'تمرین هدایت‌شده'}
              </Text>
            </View>
            <Text style={styles.turnCounterBadge}>نوبت {fa(index + 1)} از {fa(lines.length)}</Text>
          </View>

          <View style={styles.metaRow} accessibilityLiveRegion="polite">
            <View style={styles.dots}>{lines.map((line, dot) => <View key={`${line.text}-${dot}`} style={[styles.dot, dot < index && styles.dotDone, dot === index && styles.dotNow]} />)}</View>
            {typing ? <Text style={styles.typingText}>{partnerName} در حال صحبت…</Text> : null}
          </View>

          {openingCuePlayed ? (
            <View style={[styles.bubble, styles.theirs]}>
              <View style={styles.bubbleTop}>
                <Text style={styles.who}>{partnerName}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="شنیدن پیام شروع ممتحن" onPress={() => speak(openingCue.text, -5)} style={styles.replay}>
                  <Volume2 size={15} color={Palette.primary} />
                </Pressable>
              </View>
              <Text style={[styles.lineText, isRtlTarget && styles.rtlText]}>{openingCue.text}</Text>
              <Text style={styles.lineFa}>{openingCue.fa}</Text>
            </View>
          ) : null}

          {sent.map((line, at) => {
            const actual = learnerActuals[at];
            const isLearnerBubble = line.who === myRole;
            const bubbleText = isLearnerBubble && actual ? actual.text : line.text;
            const bubbleFa = isLearnerBubble && actual?.status === 'skipped' ? 'این نوبت ناتمام ثبت شد' : line.fa;
            const extras = threadExtras[at] ?? [];
            return (
              <View key={`sent-wrap-${at}`} style={styles.sentGroup}>
                <View style={[styles.bubble, isLearnerBubble ? (actual?.status === 'skipped' ? styles.mineSkipped : styles.mine) : styles.theirs]}>
                  <View style={styles.bubbleTop}>
                    <Text style={styles.who}>{isLearnerBubble ? 'شما' : partnerName}</Text>
                    {isLearnerBubble ? (
                      actual?.status === 'skipped'
                        ? <ShieldAlert size={14} color="#D97706" />
                        : <View style={styles.scorePill}><Check size={12} color={Palette.success} /><Text style={styles.scorePillText}>{fa(actual?.score ?? 100)}٪</Text></View>
                    ) : (
                      <Pressable accessibilityRole="button" accessibilityLabel={`شنیدنِ خط ${fa(at + 1)}`} onPress={() => speak(line.text, at)} style={styles.replay}><Volume2 size={15} color={Palette.primary} /></Pressable>
                    )}
                  </View>
                  <Text style={[styles.lineText, isRtlTarget && styles.rtlText]}>{bubbleText}</Text>
                  {bubbleFa ? <Text style={styles.lineFa}>{bubbleFa}</Text> : null}
                  {isLearnerBubble && actual?.correction ? (
                    <Text style={styles.correctionHint}>عبارت طبیعی‌تر: {actual.correction}</Text>
                  ) : null}
                </View>

                {extras.map(extra => (
                  <View key={extra.id} style={[styles.bubble, extra.who === 'learner' ? styles.mine : styles.theirsBranch]}>
                    <View style={styles.bubbleTop}>
                      <Text style={styles.who}>{extra.name}{extra.tag ? ` · ${extra.tag}` : ''}</Text>
                      {extra.who === 'partner' ? (
                        <Pressable accessibilityRole="button" accessibilityLabel="شنیدن پاسخ هم‌صحبت" onPress={() => speak(extra.text, -4)} style={styles.replay}>
                          <Volume2 size={14} color={Palette.primary} />
                        </Pressable>
                      ) : null}
                    </View>
                    <Text style={[styles.lineText, isRtlTarget && styles.rtlText]}>{extra.text}</Text>
                    {extra.fa ? <Text style={styles.lineFa}>{extra.fa}</Text> : null}
                  </View>
                ))}
              </View>
            );
          })}

          {activeFollowUp ? (
            <View style={styles.turnCard}>
              <Text style={styles.turnTitle}>پرسش غیرمنتظرهٔ ممتحن — واکنش سریع بده</Text>
              <Text style={styles.turnPrompt}>
                {activeLevel === 'Pre-A1'
                  ? `ممتحن مطمئن می‌شود درست شنیده است: ${fillLine(activeFollowUp.move.askFa, activeFollowUp.learnerSourceLine)}`
                  : fillLine(activeFollowUp.move.askFa, activeFollowUp.learnerSourceLine)}
              </Text>
              {!typed ? (
                <SpeakCheck
                  key={`fu-${activeFollowUp.afterTurn}-${attempts}`}
                  text={activeLevel === 'Pre-A1' ? activeFollowUp.learnerSourceLine : fillLine(activeFollowUp.move.options[0].text, activeFollowUp.learnerSourceLine)}
                  locale={locale}
                  accent={Palette.primary}
                  title="پاسخ شفاهی بده"
                  level={activeLevel}
                  adaptiveTiming
                  autoStart
                  blindExam={isExamMode}
                  onResult={result => {
                    if (!result.heard.trim()) {
                      setNote('صدایی دریافت نشد؛ بدون عجله دوباره «پاسخ شفاهی بده» را بزن یا با نوشتن جواب بده.');
                      return;
                    }
                    submitFollowUpAnswer(result.heard);
                  }}
                  singleAttempt
                />
              ) : null}
              {!isExamMode ? (
                <View style={styles.choiceList}>
                  {activeFollowUp.move.options.map((opt, idx) => {
                    const text = fillLine(opt.text, activeFollowUp.learnerSourceLine);
                    return (
                      <Pressable key={`fu-opt-${idx}`} accessibilityRole="button" onPress={() => submitFollowUpAnswer(text)} style={styles.choiceBtn}>
                        <Text style={[styles.choiceForeign, isRtlTarget && styles.rtlText]}>{text}</Text>
                        <Text style={styles.choiceFa}>{opt.fa}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
              <View style={styles.turnRow}>
                {!typed ? (
                  <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => { setTyped(true); setNote(''); }}><Text style={styles.linkText}>با نوشتن</Text></Pressable>
                ) : (
                  <View style={styles.compose}>
                    <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={sendTyped} returnKeyType="send" placeholder="واکنش خودت را بنویس" placeholderTextColor={Palette.muted} accessibilityLabel="پاسخ به پرسش هم‌صحبت" style={[styles.input, isRtlTarget && styles.rtlInput]} />
                    <Pressable accessibilityRole="button" accessibilityLabel="ارسال پاسخ" onPress={sendTyped} style={styles.send}><Send size={16} color="#FFFFFF" /></Pressable>
                  </View>
                )}
                {attempts >= 1 ? (
                  <Pressable accessibilityRole="button" style={styles.skipButton} onPress={skipAsIncomplete}>
                    <Text style={styles.skipText}>عبور از این پرسش</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : current && isMine ? (
            <View style={[styles.turnCard, isExamMode && styles.turnCardExam]}>
              <View style={styles.turnHeaderRow}>
                <Text style={styles.turnTitle}>
                  {isExamMode ? 'پرسش ممتحن · شفاهی پاسخ بده' : 'نوبت توست · پاسخ واقعی بده'}
                </Text>
                <Text style={styles.levelBadge}>{levelLabelFa(activeLevel)}</Text>
              </View>
              <Text style={styles.turnPrompt}>{currentRule?.promptFa ?? current.fa}</Text>

              {!isExamMode && revealed ? (
                <View style={styles.revealBox}>
                  <Text style={styles.revealLabel}>الگوی کمکی (برای تمرین دوباره بگو یا بنویس):</Text>
                  <Text style={[styles.turnTarget, isRtlTarget && styles.rtlText]}>{current.text}</Text>
                </View>
              ) : !isExamMode && hintOpen ? (
                <View style={styles.hintBox}>
                  <Text style={styles.turnHint}>
                    {hintKeywords.length ? `مفاهیم کلیدی مورد انتظار: ${hintKeywords.join(' · ')}` : halfTargetHint}
                  </Text>
                </View>
              ) : (
                <Text style={styles.turnHint}>
                  {isExamMode
                    ? (activeLevel === 'Pre-A1' || activeLevel === 'A1'
                      ? 'متن پاسخ برای سنجش واقعی پنهان است؛ جملهٔ درست را با صدای خودت بگو.'
                      : 'بدون کمک متنِ آماده، پاسخ کامل و طبیعی خودت را به زبان درس بگو.')
                    : (activeLevel === 'Pre-A1'
                      ? 'می‌توانی جمله‌ات را بگویی، بنویسی، یا پاسخ درست را انتخاب کنی.'
                      : activeLevel === 'B2' || activeLevel === 'C1'
                        ? 'پاسخ کامل و متناسب با لحن موقعیت ارائه بده (جمله‌های تک‌کلمه‌ای پذیرفته نمی‌شوند).'
                        : 'منظور این نوبت را کامل به زبان مقصد بگو یا بنویس.')}
                </Text>
              )}

              {/* Partner pushback + word-level diagnostic on failed attempt (word hints hidden in exam mode) */}
              {diagnostic ? (
                <View style={styles.diagnosticCard}>
                  {diagnostic.partnerPushback ? (
                    <View style={styles.pushbackBox}>
                      <Text style={[styles.pushbackPartner, isRtlTarget && styles.rtlText]}>{partnerName}: {diagnostic.partnerPushback.text}</Text>
                      <Text style={styles.pushbackFa}>{diagnostic.partnerPushback.fa}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.diagHeard}>شنیده/ثبت‌شده: «{diagnostic.heard || '—'}»</Text>
                  {!isExamMode && diagnostic.wordResults && diagnostic.wordResults.length > 0 ? (
                    <View style={[styles.wordBar, isRtlTarget && styles.rtlWordBar]}>
                      {diagnostic.wordResults.map((w, wi) => (
                        <View key={`${w.word}-${wi}`} style={[styles.wordChip, w.state === 'ok' ? styles.wMatch : w.state === 'near' ? styles.wClose : styles.wMiss]}>
                          <Text style={[styles.wordChipText, isRtlTarget && styles.rtlWordChipText]}>{w.word}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
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
                  key={`${index}-${attempts}-${current.text}-${roomMode}`}
                  text={current.text}
                  locale={locale}
                  accent={Palette.primary}
                  title={isExamMode ? 'پاسخ شفاهی به ممتحن' : 'بگو'}
                  level={activeLevel}
                  adaptiveTiming
                  autoStart
                  blindExam={isExamMode}
                  onResult={result => {
                    if (!result.heard.trim()) {
                      setNote('صدایی دریافت نشد؛ بدون عجله دوباره دکمهٔ صدا را بزن یا از نوشتن استفاده کن.');
                      return;
                    }
                    submitAnswer(result.heard, 'voice');
                  }}
                  singleAttempt
                />
              ) : null}

              <View style={styles.turnRow}>
                {!isExamMode && (activeLevel === 'Pre-A1' || activeLevel === 'A1') ? (
                  <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => speak(current.text, -4)}>
                    <Volume2 size={14} color={Palette.primary} />
                    <Text style={styles.linkText}>شنیدن نمونه</Text>
                  </Pressable>
                ) : null}

                {!typed ? (
                  <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => { setTyped(true); setNote(''); }}>
                    <Text style={styles.linkText}>{isExamMode ? 'نوشتن (جایگزین بدون میکروفن)' : 'با نوشتن'}</Text>
                  </Pressable>
                ) : (
                  <View style={styles.compose}>
                    <TextInput
                      value={draft}
                      onChangeText={setDraft}
                      onSubmitEditing={sendTyped}
                      returnKeyType="send"
                      placeholder={!isExamMode && revealed ? current.text : 'پاسخت را به زبان درس بنویس'}
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

                {!isExamMode && !hintOpen ? (
                  <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => setHintOpen(true)}>
                    <HelpCircle size={14} color={Palette.primary} />
                    <Text style={styles.linkText}>سرنخ معنایی</Text>
                  </Pressable>
                ) : null}

                {!isExamMode && !revealed && (attempts >= 1 || hintOpen) ? (
                  <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => setRevealed(true)}>
                    <Text style={styles.linkText}>نمایش الگوی کمکی</Text>
                  </Pressable>
                ) : null}

                {(isExamMode ? attempts >= 1 : attempts >= 2) ? (
                  <Pressable accessibilityRole="button" style={styles.skipButton} onPress={skipAsIncomplete}>
                    <Text style={styles.skipText}>رد شدن (ثبت به‌عنوان ناتمام)</Text>
                  </Pressable>
                ) : null}

                {typed ? (
                  <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => { setTyped(false); setNote(''); }}>
                    <Text style={styles.linkText}>میکروفن</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}

          {current && !isMine && !activeFollowUp ? (
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

          {note ? <Text accessibilityRole="alert" style={styles.note}>{note}</Text> : null}

          <View style={styles.bottomActionsRow}>
            {roles.length > 1 ? (
              <Pressable accessibilityRole="button" style={styles.switchRow} onPress={flipRole}>
                <Text style={styles.linkText}>جای من و {partnerName} را عوض کن</Text>
              </Pressable>
            ) : null}
            <Pressable accessibilityRole="button" style={styles.switchRow} onPress={() => restart(isExamMode ? 'guided-practice' : 'oral-exam')}>
              <Text style={styles.linkText}>{isExamMode ? 'تغییر به تمرین هدایت‌شده' : 'تغییر به امتحان شفاهی'}</Text>
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
  modeCardOn: { borderColor: Palette.primary, backgroundColor: Palette.primarySoft },
  modeCardExamOn: { borderColor: Palette.primaryDark, backgroundColor: '#EEF2FF', borderWidth: 1.5 },
  modeHeadRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  modeTitle: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.ink, writingDirection: 'rtl' },
  modeTitleOn: { color: Palette.primaryDark },
  modeDesc: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 18, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  roleRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 2 },
  roleChip: { minHeight: 38, borderRadius: 20, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', paddingHorizontal: 14, justifyContent: 'center' },
  roleChipOn: { backgroundColor: Palette.primarySoft, borderColor: Palette.primary },
  roleChipText: { fontFamily: Typography.fontFamily, fontSize: 12.5, color: Palette.text },
  roleChipTextOn: { color: Palette.primaryDark, fontFamily: Typography.boldFontFamily },
  enter: { minHeight: 52, width: '100%', maxWidth: 340, marginTop: 4, borderRadius: 16, backgroundColor: Palette.primary, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 20 },
  enterExam: { backgroundColor: Palette.primaryDark },
  enterText: { fontFamily: Typography.boldFontFamily, fontSize: 15, color: '#FFFFFF', writingDirection: 'rtl' },
  emptyNote: { fontFamily: Typography.fontFamily, fontSize: 13, color: Palette.muted, textAlign: 'center', writingDirection: 'rtl' },
  thread: { width: '100%', gap: 10, marginTop: 6 },
  liveModeBar: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  liveModeBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  liveExamBadge: { backgroundColor: Palette.primaryDark },
  livePracticeBadge: { backgroundColor: Palette.primarySoft, borderWidth: 1, borderColor: '#DDE2FF' },
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
  theirsBranch: { alignSelf: 'flex-start', backgroundColor: '#F5F3FF', borderColor: '#DDD6FE', borderBottomLeftRadius: 6, maxWidth: '92%' },
  mine: { alignSelf: 'flex-end', backgroundColor: Palette.primarySoft, borderColor: '#DDE2FF', borderBottomRightRadius: 6, maxWidth: '92%' },
  mineSkipped: { alignSelf: 'flex-end', backgroundColor: '#FEF3C7', borderColor: '#FCD34D', borderBottomRightRadius: 6, maxWidth: '92%' },
  bubblePending: { opacity: 0.5 },
  bubbleTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  who: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.primaryDark, writingDirection: 'rtl' },
  scorePill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, backgroundColor: '#ECFDF5' },
  scorePillText: { fontFamily: Typography.boldFontFamily, fontSize: 10, color: '#047857' },
  lineText: { fontFamily: 'Times New Roman', fontSize: 18, lineHeight: 28, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  rtlText: { fontFamily: Typography.boldFontFamily, textAlign: 'right', writingDirection: 'rtl' },
  rtlInput: { fontFamily: Typography.fontFamily, textAlign: 'right', writingDirection: 'rtl' },
  rtlWordBar: { flexDirection: 'row-reverse' },
  rtlWordChipText: { fontFamily: Typography.boldFontFamily, writingDirection: 'rtl' },
  lineFa: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 22, color: Palette.text, textAlign: 'right', writingDirection: 'rtl' },
  correctionHint: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 18, color: '#B45309', textAlign: 'right', writingDirection: 'rtl', marginTop: 2 },
  replay: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, padding: 4 },
  replayText: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.primary, writingDirection: 'rtl' },
  turnCard: { width: '100%', borderRadius: 20, borderWidth: 1, borderColor: '#DDE2FF', backgroundColor: '#FBFBFF', padding: 14, gap: 9 },
  turnCardExam: { borderColor: Palette.primary, backgroundColor: '#F5F7FF' },
  turnHeaderRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  turnTitle: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.primaryDark, writingDirection: 'rtl' },
  levelBadge: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.primary, backgroundColor: Palette.primarySoft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, writingDirection: 'rtl' },
  turnPrompt: { fontFamily: Typography.fontFamily, fontSize: 15, lineHeight: 26, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  turnHint: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 21, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  hintBox: { borderRadius: 12, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', padding: 10 },
  revealBox: { borderRadius: 12, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', padding: 10, gap: 4 },
  revealLabel: { fontFamily: Typography.fontFamily, fontSize: 11, color: '#B45309', textAlign: 'right', writingDirection: 'rtl' },
  turnTarget: { fontFamily: 'Times New Roman', fontSize: 17, lineHeight: 27, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  diagnosticCard: { borderRadius: 14, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2', padding: 11, gap: 8 },
  pushbackBox: { borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FCA5A5', padding: 9, gap: 3 },
  pushbackPartner: { fontFamily: 'Times New Roman', fontSize: 14, fontWeight: '700', color: '#991B1B', textAlign: 'left', writingDirection: 'ltr' },
  pushbackFa: { fontFamily: Typography.fontFamily, fontSize: 12, color: '#7F1D1D', textAlign: 'right', writingDirection: 'rtl' },
  diagHeard: { fontFamily: Typography.fontFamily, fontSize: 12, color: '#991B1B', textAlign: 'right', writingDirection: 'rtl' },
  wordBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  wordChip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  wMatch: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  wClose: { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' },
  wMiss: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  wordChipText: { fontFamily: 'Times New Roman', fontSize: 12, fontWeight: '700', color: Palette.ink },
  choiceList: { gap: 7 },
  choiceBtn: { borderRadius: 12, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', padding: 11, gap: 3 },
  choiceForeign: { fontFamily: 'Times New Roman', fontSize: 15, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  choiceFa: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  turnRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  linkButton: { minHeight: 38, flexDirection: 'row-reverse', alignItems: 'center', gap: 4, justifyContent: 'center', paddingHorizontal: 4 },
  linkText: { fontFamily: Typography.fontFamily, fontSize: 13, color: Palette.primary, writingDirection: 'rtl' },
  skipButton: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 6 },
  skipText: { fontFamily: Typography.fontFamily, fontSize: 12, color: '#B45309', writingDirection: 'rtl' },
  compose: { flex: 1, minWidth: 220, flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  input: { flex: 1, minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', paddingHorizontal: 12, fontFamily: 'Times New Roman', fontSize: 16, color: Palette.ink },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  note: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 21, color: '#B91C1C', textAlign: 'center', writingDirection: 'rtl' },
  bottomActionsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', gap: 8 },
  switchRow: { minHeight: 38, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  doneCard: { width: '100%', marginTop: 12, padding: 18, borderRadius: 22, alignItems: 'stretch', gap: 14, borderWidth: 1 },
  doneCardGreen: { backgroundColor: '#F6FBF8', borderColor: '#BBF7D0' },
  doneCardBlue: { backgroundColor: '#F5F7FF', borderColor: '#C7D2FE' },
  doneCardWarn: { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' },
  heroBanner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  trophyBadge: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  trophyGreen: { backgroundColor: '#16A34A' },
  trophyBlue: { backgroundColor: Palette.primary },
  trophyWarn: { backgroundColor: '#D97706' },
  heroCopy: { flex: 1, gap: 4, alignItems: 'flex-end' },
  gradePillsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 5 },
  xpPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 12, backgroundColor: Palette.primarySoft },
  xpPillText: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Palette.primaryDark, writingDirection: 'rtl' },
  doneTitle: { fontFamily: Typography.boldFontFamily, fontSize: 16, lineHeight: 24, textAlign: 'right', writingDirection: 'rtl' },
  doneTitleGreen: { color: '#14532D' },
  doneTitleBlue: { color: '#1E3A8A' },
  doneTitleWarn: { color: '#92400E' },
  doneText: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl' },
  doneTextGreen: { color: '#166534' },
  doneTextBlue: { color: '#1E40AF' },
  doneTextWarn: { color: '#B45309' },
  overallCircle: { minWidth: 66, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  circleGreen: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  circleBlue: { backgroundColor: '#E0E7FF', borderColor: '#A5B4FC' },
  circleWarn: { backgroundColor: '#FEF3C7', borderColor: '#FBBF24' },
  overallValue: { fontFamily: Typography.boldFontFamily, fontSize: 18, writingDirection: 'rtl' },
  overallLabel: { fontFamily: Typography.fontFamily, fontSize: 10, writingDirection: 'rtl' },
  metricsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  metricBox: { flex: 1, minWidth: '45%', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', gap: 2 },
  metricValue: { fontFamily: Typography.boldFontFamily, fontSize: 15, color: Palette.ink, writingDirection: 'rtl' },
  metricLabel: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.muted, writingDirection: 'rtl' },
  finalHint: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 21, textAlign: 'right', writingDirection: 'rtl' },
  weakFocusBox: { padding: 12, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FDE68A', gap: 7 },
  weakFocusTitle: { fontFamily: Typography.boldFontFamily, fontSize: 12.5, color: '#92400E', textAlign: 'right', writingDirection: 'rtl' },
  weakWordsText: { fontFamily: Typography.fontFamily, fontSize: 12, color: '#B45309', textAlign: 'right', writingDirection: 'rtl' },
  weakSentenceBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, padding: 9, borderRadius: 11, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
  weakSentenceText: { flex: 1, fontFamily: 'Times New Roman', fontSize: 14, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
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
  errorLine: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: '#B45309', textAlign: 'right', writingDirection: 'rtl', width: '100%' },
  successLine: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: '#166534', textAlign: 'right', writingDirection: 'rtl' },
  doneActions: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  againButton: { minHeight: 44, paddingHorizontal: 18, borderRadius: 14, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  againText: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: '#FFFFFF', writingDirection: 'rtl' },
  flipDoneButton: { minHeight: 44, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: Palette.primary, backgroundColor: '#FFFFFF', flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  flipDoneText: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.primaryDark, writingDirection: 'rtl' },
});
