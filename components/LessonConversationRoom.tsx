import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { AlertTriangle, Award, Check, CheckCircle2, HelpCircle, Mic2, RefreshCw, Send, ShieldAlert, Sparkles, Trophy, Volume2 } from 'lucide-react-native';
import SpeakCheck from '@/components/SpeakCheck';
// Both text and input go through the localized wrappers, or the Persian digits and the script-aware
// font/direction policy would be missing from this screen.
import { LocalizedText as Text, LocalizedTextInput as TextInput } from '@/components/LocalizedText';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';
import { Typography } from '@/lib/theme';
import { toPersianDigits as fa } from '@/lib/format';
import { normalizeLessonConversation, type LessonConversationSession } from '@/lib/lessonConversation';
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
import { scoreSpeech } from '@/lib/speechScore';

type ChatLine = { who: string; role?: 'learner' | 'partner'; text: string; fa: string };
type TurnStatus = 'passed' | 'assisted' | 'skipped';
type TurnReport = {
  index: number;
  promptFa: string;
  expected: string;
  heard: string;
  score: number;
  method: 'voice' | 'typed' | 'choice';
  status: TurnStatus;
  retries: number;
  usedHint: boolean;
  usedReveal: boolean;
  feedback: string;
};
type RoomExchangeMode = 'standard' | 'live-challenge';
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
  situation?: string;
  partnerRole?: string;
  initialSession?: LessonConversationSession;
  onSessionChange?: (session: LessonConversationSession) => void;
  /** Level-aware semantic/branching contract. */
  semanticPractice?: BranchingConversation | null;
  levelId?: number;
};

const TYPING_MS = 560;
const LEARNER_LABELS = new Set(['learner', 'شما', 'زبان‌آموز', 'زبانآموز']);

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

function evaluateRoomSummary(reports: readonly TurnReport[]) {
  if (!reports.length) {
    return {
      tier: 'needs-work' as const,
      overall: 0,
      accuracy: 0,
      independence: 0,
      activeRate: 0,
      skippedCount: 0,
      xp: 0,
      answeredCount: 0,
      rankTitle: 'نوبتی از سمت شما ثبت نشد',
      rankSubtitle: 'در این دور نقشی که انتخاب کردید نوبت فعالی نداشت؛ جای نقش‌ها را عوض کنید تا خودتان پاسخ دهید.',
      advice: 'گزینهٔ «جابه‌جایی نقش» را بزنید تا نوبت‌های پاسخ‌گویی به شما برسد.',
    };
  }

  const accuracy = Math.round(reports.reduce((sum, item) => sum + item.score, 0) / reports.length);
  const completed = reports.filter(item => item.status !== 'skipped');
  const skippedCount = reports.length - completed.length;
  const answeredCount = completed.filter(item => item.heard.trim().length > 0).length;
  const activeRate = Math.round((completed.length / reports.length) * 100);

  const independenceRaw = reports.reduce((sum, item) => {
    if (item.status === 'skipped') return sum;
    const penalty = (item.usedReveal ? 28 : 0) + (item.usedHint ? 12 : 0) + Math.min(24, item.retries * 8) + (item.method === 'choice' ? 10 : 0);
    return sum + Math.max(20, 100 - penalty);
  }, 0);
  const independence = Math.round(independenceRaw / reports.length);

  const overall = Math.max(0, Math.min(100, Math.round(accuracy * 0.5 + independence * 0.25 + activeRate * 0.25)));
  const tier: 'mastered' | 'acceptable' | 'needs-work' =
    overall >= 82 && skippedCount === 0
      ? 'mastered'
      : overall >= 60 && skippedCount === 0
        ? 'acceptable'
        : 'needs-work';

  const xp = reports.reduce((sum, item) => {
    if (item.status === 'skipped') return sum;
    if (item.score >= 85 && !item.usedReveal) return sum + 25;
    if (item.score >= 70) return sum + 16;
    return sum + 8;
  }, 0);

  const rankTitle =
    tier === 'mastered'
      ? 'مکالمهٔ مسلط و مستقل'
      : tier === 'acceptable'
        ? 'مکالمهٔ قابل قبول با چند نکته'
        : 'نیاز به تمرین بیشتر';

  const rankSubtitle =
    tier === 'mastered'
      ? 'پاسخ‌های واقعی شما دقیق، مستقل و متناسب با نقش و سطح درس بود.'
      : tier === 'acceptable'
        ? 'منظور مکالمه منتقل شد، اما در چند نوبت وابستگی به راهنما یا لغزش معنایی وجود داشت.'
        : skippedCount > 0
          ? `${fa(skippedCount)} نوبت بدون پاسخ ماند (ناتمام)؛ تا نوبت‌ها کامل نشوند تسلط مکالمه تأیید نمی‌شود.`
          : 'دقت و استقلال پاسخ‌ها هنوز به حد تسلط نرسیده؛ کارنامهٔ نوبت به نوبت را مرور کن و دوباره تمرین کن.';

  const weak = reports.filter(item => item.status === 'skipped' || item.score < 72 || item.usedReveal);
  const advice = !weak.length
    ? 'تمام نوبت‌ها بدون اتکا به متنِ آماده و با دقت بالا انجام شد. برای تسلط کامل، حالت «چالش زنده» یا جابه‌جایی نقش را امتحان کن.'
    : `روی ${fa(weak.length)} نوبت نیازمند تمرین تمرکز کن و در دور بعد بدون «نمایش پاسخ» جمله‌ها را بساز.`;

  return { tier, overall, accuracy, independence, activeRate, skippedCount, xp, answeredCount, rankTitle, rankSubtitle, advice };
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
    expectedQuestion: /[?¿]/.test(line.text),
  };
}

export default function LessonConversationRoom({
  dialogue,
  fallback,
  locale,
  onSpeak,
  onStop,
  lessonId,
  situation,
  partnerRole,
  initialSession,
  onSessionChange,
  semanticPractice,
  levelId,
}: Props) {
  const lines = useMemo<ChatLine[]>(() => {
    const real = dialogue.filter(line => line.text.trim());
    if (real.length) {
      const base = real.map(line => ({ who: line.speaker, role: line.role, text: line.text, fa: line.fa }));
      if (base.length < 6 && fallback?.length) {
        const seen = new Set(base.map(line => line.text.trim().toLowerCase()));
        const extras = fallback.filter(item => item.text.trim() && !seen.has(item.text.trim().toLowerCase()));
        const partnerWho = base.find(line => line.role === 'partner')?.who ?? base[0].who;
        const learnerWho = base.find(line => line.role === 'learner')?.who ?? base.find(line => line.who !== partnerWho)?.who ?? 'learner';
        const needed = Math.min(2, 6 - base.length, extras.length);
        if (needed >= 2) {
          base.push(
            { who: partnerWho, role: 'partner', text: extras[0].text, fa: extras[0].fa },
            { who: learnerWho, role: 'learner', text: extras[1].text, fa: extras[1].fa },
          );
        }
      }
      return base;
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
  const [roomMode, setRoomMode] = useState<RoomExchangeMode>('standard');
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
  const [threadExtras, setThreadExtras] = useState<Record<number, ThreadExtra[]>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spokenFor = useRef<number | null>(null);

  const activeLevel: ConversationLevel = semanticPractice?.level
    ?? (levelId === 0 ? 'Pre-A1' : levelId === 1 ? 'A1' : levelId === 2 ? 'A2' : levelId === 3 ? 'B1' : levelId === 4 ? 'B2' : levelId === 5 ? 'C1' : 'A1');

  const current = displayLines[index];
  const currentRule: SemanticTurn | undefined = current
    ? (semanticPractice?.turns[index] ?? buildFallbackRule(current))
    : undefined;
  const isMine = !!current && !!myRole && current.who === myRole;
  const finished = open && index >= lines.length && !activeFollowUp;
  const sent = useMemo(() => displayLines.slice(0, Math.min(index, displayLines.length)), [displayLines, index]);
  const partnerName = nameOf(lines.find(line => line.who !== myRole)?.who ?? 'partner');

  const stall = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const clearStall = () => { if (stall.current) { clearTimeout(stall.current); stall.current = null; } };
  useEffect(() => () => { clearTimer(); clearStall(); onStop?.(); }, [onStop]);

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
    setThreadExtras({});
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
    setAttempts(0);
    setRevealed(false);
    setChoicePanel(false);
    setDraft('');
    setNote('');
    setDiagnostic(null);
    setHintOpen(false);
    setIndex(value => value + 1);
  }, [clearStall]);

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
    if (roomMode !== 'live-challenge' || followUpUsed) return null;
    if (turnIdx >= lines.length - 1) return null;
    const lang = followUpLanguageFromLocale(locale);
    if (!lang) return null;
    const moves = followUpMoves(lang);
    // In Pre-A1/A1 prefer 'repeat' or 'confirm'; in A2–C1 allow 'why' / 'mean' / 'confirm'.
    const pool = activeLevel === 'Pre-A1' || activeLevel === 'A1'
      ? moves.filter(m => m.id === 'repeat' || m.id === 'confirm')
      : moves.filter(m => m.id === 'why' || m.id === 'mean' || m.id === 'confirm');
    const chosen = pool[(turnIdx + lessonId.length) % pool.length] ?? moves[0];
    return { afterTurn: turnIdx, move: chosen, learnerSourceLine: learnerLine };
  }, [activeLevel, followUpUsed, lessonId.length, lines.length, locale, roomMode]);

  const completeTurnAndAdvance = useCallback((
    turnIdx: number,
    actualText: string,
    status: TurnStatus,
    score: number,
    reply?: { text: string; fa: string },
    expectedText?: string,
  ) => {
    setLearnerActuals(prev => ({
      ...prev,
      [turnIdx]: {
        text: actualText,
        status,
        score,
        correction: expectedText && score < 88 && actualText.toLowerCase() !== expectedText.toLowerCase() ? expectedText : undefined,
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
            { id: `fu-ask-${turnIdx}`, who: 'partner', name: partnerName, text: askText, fa: askFa, tag: 'پرسش غیرمنتظره' },
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

    const isWhyOrMean = activeFollowUp.move.id === 'why' || activeFollowUp.move.id === 'mean';
    const reasonableFreeAnswer = isWhyOrMean && trimmed.split(/\s+/).length >= 2 && !/[\u0600-\u06FF]/.test(trimmed);

    if (matchedOptIdx === -1 && !reasonableFreeAnswer) {
      fail('پاسخت به پرسشِ هم‌صحبت واضح نبود؛ یکی از مسیرهای پاسخ را بگو یا بنویس.', {
        heard: trimmed,
        score: 25,
        feedback: 'هم‌صحبت منتظر توضیح کوتاهِ همین پرسش است.',
      });
      return;
    }

    const pickedOption = activeFollowUp.move.options[matchedOptIdx >= 0 ? matchedOptIdx : 0];
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

    const turnStatus: TurnStatus = (hintOpen || revealed || attempts > 0) ? 'assisted' : 'passed';
    setReports(value => [
      ...value,
      {
        index,
        promptFa,
        expected: current.text,
        heard: answer.trim(),
        score: semantic.score,
        method,
        status: turnStatus,
        retries: attempts,
        usedHint: hintOpen,
        usedReveal: revealed,
        feedback: semantic.feedback,
      },
    ]);
    setDraft('');
    setNote('');
    setDiagnostic(null);
    completeTurnAndAdvance(index, answer.trim(), turnStatus, semantic.score, semantic.branchReply, current.text);
  };

  const skipAsIncomplete = () => {
    if (activeFollowUp) {
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

  const begin = async () => {
    if (starting) return;
    setStarting(true);
    setOpen(true);
    setIndex(0);
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

  const restart = () => {
    clearTimer(); clearStall();
    spokenFor.current = null;
    setBranchReplies({});
    setLearnerActuals({});
    setThreadExtras({});
    setActiveFollowUp(null);
    setFollowUpUsed(false);
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

  const summary = useMemo(() => evaluateRoomSummary(reports), [reports]);

  if (!lines.length) {
    return <View style={styles.wrap}><Text style={styles.emptyNote}>برای این درس گفت‌وگویی ثبت نشده است.</Text></View>;
  }

  const hintKeywords = currentRule?.concepts?.map(g => g[0]).filter(Boolean) ?? [];
  const halfTargetHint = current ? `${current.text.split(/\s+/).slice(0, Math.max(1, Math.ceil(current.text.split(/\s+/).length / 2))).join(' ')} …` : '';
  const hasChoices = Boolean(currentRule?.choices?.length) && (activeLevel === 'Pre-A1' || activeLevel === 'A1');

  const doneCardTheme = summary.tier === 'mastered'
    ? { card: styles.doneCardGreen, badge: styles.trophyGreen, title: styles.doneTitleGreen, text: styles.doneTextGreen, circle: styles.circleGreen }
    : summary.tier === 'acceptable'
      ? { card: styles.doneCardBlue, badge: styles.trophyBlue, title: styles.doneTitleBlue, text: styles.doneTextBlue, circle: styles.circleBlue }
      : { card: styles.doneCardWarn, badge: styles.trophyWarn, title: styles.doneTitleWarn, text: styles.doneTextWarn, circle: styles.circleWarn };

  return (
    <View style={styles.wrap}>
      {!open ? (
        <View style={styles.invite}>
          <View style={styles.inviteBadge}>
            <Sparkles size={14} color={Palette.primary} />
            <Text style={styles.inviteBadgeText}>اتاق مکالمهٔ واقعی · {levelLabelFa(activeLevel)} · {fa(lines.length)} نوبت</Text>
          </View>
          <Text style={styles.inviteTitle}>گفت‌وگوی زنده با {partnerName}</Text>
          {situation ? <Text style={styles.sceneText}>{situation}</Text> : null}
          <Text style={styles.inviteText}>
            هر نوبت بر اساس معنای واقعی، واژه‌های کلیدی، مثبت/منفی بودن و پرسش/پاسخ بررسی می‌شود. اگر پاسخ مبهم باشد هم‌صحبت واکنش نشان می‌دهد و منتظر اصلاح می‌ماند.
          </Text>

          <View style={styles.modeSelector}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: roomMode === 'standard' }}
              onPress={() => setRoomMode('standard')}
              style={[styles.modeCard, roomMode === 'standard' && styles.modeCardOn]}
            >
              <Text style={[styles.modeTitle, roomMode === 'standard' && styles.modeTitleOn]}>گفت‌وگوی استاندارد</Text>
              <Text style={styles.modeDesc}>مسیر اصلی موقعیت با سنجش دقیق هر نوبت</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: roomMode === 'live-challenge' }}
              onPress={() => setRoomMode('live-challenge')}
              style={[styles.modeCard, roomMode === 'live-challenge' && styles.modeCardOn]}
            >
              <Text style={[styles.modeTitle, roomMode === 'live-challenge' && styles.modeTitleOn]}>چالش زنده</Text>
              <Text style={styles.modeDesc}>با پرسش یا توقف غیرمنتظره از سوی هم‌صحبت</Text>
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
                  <Text style={[styles.roleChipText, role === myRole && styles.roleChipTextOn]}>{nameOf(role)}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Pressable accessibilityRole="button" accessibilityState={{ disabled: starting }} disabled={starting} style={styles.enter} onPress={() => void begin()}>
            <Mic2 size={18} color="#FFFFFF" /><Text style={styles.enterText}>شروع مکالمه</Text>
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
              {summary.xp > 0 ? (
                <View style={styles.xpPill}><Award size={13} color={Palette.primary} /><Text style={styles.xpPillText}>+{fa(summary.xp)} امتیاز واقعی مکالمه</Text></View>
              ) : null}
              <Text style={[styles.doneTitle, doneCardTheme.title]}>{summary.rankTitle}</Text>
              <Text style={[styles.doneText, doneCardTheme.text]}>{summary.rankSubtitle}</Text>
            </View>
            <View style={[styles.overallCircle, doneCardTheme.circle]}>
              <Text style={[styles.overallValue, doneCardTheme.title]}>{fa(summary.overall)}٪</Text>
              <Text style={[styles.overallLabel, doneCardTheme.text]}>ارزیابی واقعی</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{fa(summary.accuracy)}٪</Text>
              <Text style={styles.metricLabel}>دقت معنا</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{fa(summary.independence)}٪</Text>
              <Text style={styles.metricLabel}>استقلال پاسخ</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{fa(summary.activeRate)}٪</Text>
              <Text style={styles.metricLabel}>تکمیل نوبت‌ها</Text>
            </View>
          </View>

          <Text style={[styles.finalHint, doneCardTheme.text]}>{summary.advice}</Text>

          {reports.length ? (
            <View style={styles.reviewList}>
              <Text style={styles.reviewHeading}>کارنامهٔ صادقانهٔ نوبت به نوبت</Text>
              {reports.map(item => {
                const tier = item.status === 'skipped' ? 'ناتمام' : item.score >= 85 && !item.usedReveal ? 'مسلط' : item.score >= 68 ? 'قابل قبول' : 'ضعیف';
                const tierColor = item.status === 'skipped' ? '#DC2626' : item.score >= 85 && !item.usedReveal ? Palette.success : item.score >= 68 ? Palette.primary : '#D97706';
                return (
                  <View key={`report-${item.index}`} style={styles.reviewItem}>
                    <View style={styles.reviewTop}>
                      <View style={styles.reviewTurnWrap}>
                        <CheckCircle2 size={14} color={tierColor} />
                        <Text style={styles.reviewTurn}>
                          نوبت {fa(item.index + 1)} · {item.method === 'voice' ? 'گفتاری' : item.method === 'choice' ? 'گزینه‌ای' : 'نوشتاری'}
                          {item.retries > 0 ? ` · ${fa(item.retries)} تلاش مجدد` : ''}
                        </Text>
                      </View>
                      <View style={[styles.scoreTag, { borderColor: tierColor }]}>
                        <Text style={[styles.scoreTagText, { color: tierColor }]}>{tier} · {fa(item.score)}٪</Text>
                      </View>
                    </View>
                    {item.promptFa ? <Text style={styles.reviewPrompt}>هدف نوبت: {item.promptFa}</Text> : null}
                    <Text style={styles.reviewHeard}>پاسخ واقعی شما: {item.heard.trim() ? item.heard : '— (ناتمام)'}</Text>
                    <Text style={item.status !== 'skipped' && item.score >= 68 ? styles.successLine : styles.errorLine}>{item.feedback}</Text>
                    {(item.score < 85 || item.status === 'skipped') ? <Text style={styles.reviewExpected}>الگوی استاندارد: {item.expected}</Text> : null}
                  </View>
                );
              })}
            </View>
          ) : null}

          <View style={styles.doneActions}>
            <Pressable accessibilityRole="button" style={styles.againButton} onPress={restart}><Text style={styles.againText}>تمرین دوباره</Text></Pressable>
            {roles.length > 1 ? <Pressable accessibilityRole="button" style={styles.flipDoneButton} onPress={flipRole}><RefreshCw size={15} color={Palette.primary} /><Text style={styles.flipDoneText}>جابه‌جایی نقش</Text></Pressable> : null}
          </View>
        </View>
      ) : (
        <View style={styles.thread}>
          <View style={styles.metaRow} accessibilityLiveRegion="polite">
            <View style={styles.dots}>{lines.map((line, dot) => <View key={`${line.text}-${dot}`} style={[styles.dot, dot < index && styles.dotDone, dot === index && styles.dotNow]} />)}</View>
            {typing ? <Text style={styles.typingText}>{partnerName} در حال تایپ…</Text> : <Text style={styles.turnCounterBadge}>نوبت {fa(index + 1)} از {fa(lines.length)}</Text>}
          </View>

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
                    <Text style={styles.who}>{nameOf(line.who)}</Text>
                    {isLearnerBubble ? (
                      actual?.status === 'skipped'
                        ? <ShieldAlert size={14} color="#D97706" />
                        : <View style={styles.scorePill}><Check size={12} color={Palette.success} /><Text style={styles.scorePillText}>{fa(actual?.score ?? 100)}٪</Text></View>
                    ) : (
                      <Pressable accessibilityRole="button" accessibilityLabel={`شنیدنِ خط ${fa(at + 1)}`} onPress={() => speak(line.text, at)} style={styles.replay}><Volume2 size={15} color={Palette.primary} /></Pressable>
                    )}
                  </View>
                  <Text style={styles.lineText}>{bubbleText}</Text>
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
                    <Text style={styles.lineText}>{extra.text}</Text>
                    {extra.fa ? <Text style={styles.lineFa}>{extra.fa}</Text> : null}
                  </View>
                ))}
              </View>
            );
          })}

          {activeFollowUp ? (
            <View style={styles.turnCard}>
              <Text style={styles.turnTitle}>واکنش سریع به هم‌صحبت</Text>
              <Text style={styles.turnPrompt}>{fillLine(activeFollowUp.move.askFa, activeFollowUp.learnerSourceLine)}</Text>
              {!typed ? (
                <SpeakCheck
                  key={`fu-${activeFollowUp.afterTurn}-${attempts}`}
                  text={fillLine(activeFollowUp.move.options[0].text, activeFollowUp.learnerSourceLine)}
                  locale={locale}
                  accent={Palette.primary}
                  title="پاسخ بگو"
                  autoStart
                  onResult={result => {
                    if (!result.heard.trim()) {
                      fail('صدایی دریافت نشد؛ دوباره بگو یا بنویس.');
                      return;
                    }
                    submitFollowUpAnswer(result.heard);
                  }}
                  singleAttempt
                />
              ) : null}
              <View style={styles.choiceList}>
                {activeFollowUp.move.options.map((opt, idx) => {
                  const text = fillLine(opt.text, activeFollowUp.learnerSourceLine);
                  return (
                    <Pressable key={`fu-opt-${idx}`} accessibilityRole="button" onPress={() => submitFollowUpAnswer(text)} style={styles.choiceBtn}>
                      <Text style={styles.choiceForeign}>{text}</Text>
                      <Text style={styles.choiceFa}>{opt.fa}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.turnRow}>
                {!typed ? (
                  <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => { setTyped(true); setNote(''); }}><Text style={styles.linkText}>با نوشتن</Text></Pressable>
                ) : (
                  <View style={styles.compose}>
                    <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={sendTyped} returnKeyType="send" placeholder="واکنش خودت را بنویس" placeholderTextColor={Palette.muted} accessibilityLabel="پاسخ به پرسش هم‌صحبت" style={styles.input} />
                    <Pressable accessibilityRole="button" accessibilityLabel="ارسال پاسخ" onPress={sendTyped} style={styles.send}><Send size={16} color="#FFFFFF" /></Pressable>
                  </View>
                )}
              </View>
            </View>
          ) : current && isMine ? (
            <View style={styles.turnCard}>
              <View style={styles.turnHeaderRow}>
                <Text style={styles.turnTitle}>نوبت توست · پاسخ واقعی بده</Text>
                <Text style={styles.levelBadge}>{levelLabelFa(activeLevel)}</Text>
              </View>
              <Text style={styles.turnPrompt}>{currentRule?.promptFa ?? current.fa}</Text>

              {revealed ? (
                <View style={styles.revealBox}>
                  <Text style={styles.revealLabel}>الگوی کمکی (برای تمرین دوباره بگو یا بنویس):</Text>
                  <Text style={styles.turnTarget}>{current.text}</Text>
                </View>
              ) : hintOpen ? (
                <View style={styles.hintBox}>
                  <Text style={styles.turnHint}>
                    {hintKeywords.length ? `مفاهیم کلیدی مورد انتظار: ${hintKeywords.join(' · ')}` : halfTargetHint}
                  </Text>
                </View>
              ) : (
                <Text style={styles.turnHint}>
                  {activeLevel === 'Pre-A1'
                    ? 'می‌توانی جمله‌ات را بگویی، بنویسی، یا پاسخ درست را انتخاب کنی.'
                    : activeLevel === 'B2' || activeLevel === 'C1'
                      ? 'پاسخ کامل و متناسب با لحن موقعیت ارائه بده (جمله‌های تک‌کلمه‌ای پذیرفته نمی‌شوند).'
                      : 'منظور این نوبت را کامل به زبان مقصد بگو یا بنویس.'}
                </Text>
              )}

              {/* Partner pushback + word-level diagnostic on failed attempt */}
              {diagnostic ? (
                <View style={styles.diagnosticCard}>
                  {diagnostic.partnerPushback ? (
                    <View style={styles.pushbackBox}>
                      <Text style={styles.pushbackPartner}>{partnerName}: {diagnostic.partnerPushback.text}</Text>
                      <Text style={styles.pushbackFa}>{diagnostic.partnerPushback.fa}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.diagHeard}>شنیده/ثبت‌شده: «{diagnostic.heard || '—'}»</Text>
                  {diagnostic.wordResults && diagnostic.wordResults.length > 0 ? (
                    <View style={styles.wordBar}>
                      {diagnostic.wordResults.map((w, wi) => (
                        <View key={`${w.word}-${wi}`} style={[styles.wordChip, w.state === 'ok' ? styles.wMatch : w.state === 'near' ? styles.wClose : styles.wMiss]}>
                          <Text style={styles.wordChipText}>{w.word}</Text>
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
                      <Text style={styles.choiceForeign}>{ch.text}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {!typed ? (
                <SpeakCheck
                  key={`${index}-${attempts}-${current.text}`}
                  text={current.text}
                  locale={locale}
                  accent={Palette.primary}
                  title="بگو"
                  autoStart
                  onResult={result => {
                    if (!result.heard.trim()) {
                      fail('صدایی دریافت نشد؛ نزدیک‌تر به میکروفن بگو یا از نوشتن استفاده کن.', {
                        heard: '',
                        score: 0,
                        feedback: 'هیچ گفتاری تشخیص داده نشد.',
                      });
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
                    <Text style={styles.linkText}>با نوشتن</Text>
                  </Pressable>
                ) : (
                  <View style={styles.compose}>
                    <TextInput
                      value={draft}
                      onChangeText={setDraft}
                      onSubmitEditing={sendTyped}
                      returnKeyType="send"
                      placeholder={revealed ? current.text : 'پاسخت را به زبان درس بنویس'}
                      placeholderTextColor={Palette.muted}
                      accessibilityLabel="پاسخ شما"
                      style={styles.input}
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

                {!hintOpen ? (
                  <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => setHintOpen(true)}>
                    <HelpCircle size={14} color={Palette.primary} />
                    <Text style={styles.linkText}>سرنخ معنایی</Text>
                  </Pressable>
                ) : null}

                {!revealed && (attempts >= 1 || hintOpen) ? (
                  <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => setRevealed(true)}>
                    <Text style={styles.linkText}>نمایش الگوی کمکی</Text>
                  </Pressable>
                ) : null}

                {attempts >= 2 ? (
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
              <Text style={styles.who}>{typing ? `${partnerName} در حال تایپ…` : speakingAt === index ? `${partnerName} در حال صحبت…` : partnerName}</Text>
              {!typing ? (
                <>
                  <Text style={styles.lineText}>{current.text}</Text>
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
          {roles.length > 1 ? <Pressable accessibilityRole="button" style={styles.switchRow} onPress={flipRole}><Text style={styles.linkText}>جای من و {partnerName} را عوض کن</Text></Pressable> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'stretch', gap: 9, paddingVertical: 6 },
  invite: { width: '100%', gap: 10, paddingVertical: 14, alignItems: 'center' },
  inviteBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Palette.primarySoft, borderWidth: 1, borderColor: '#DDE2FF' },
  inviteBadgeText: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: Palette.primaryDark, writingDirection: 'rtl' },
  inviteTitle: { fontFamily: Typography.boldFontFamily, fontSize: 18, lineHeight: 30, color: Palette.ink, textAlign: 'center', writingDirection: 'rtl' },
  sceneText: { fontFamily: Typography.fontFamily, fontSize: 15, lineHeight: 25, color: Palette.primaryDark, textAlign: 'center', writingDirection: 'rtl', maxWidth: 560 },
  inviteText: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 23, color: Palette.text, textAlign: 'center', writingDirection: 'rtl', maxWidth: 540 },
  modeSelector: { width: '100%', flexDirection: 'row-reverse', gap: 8, marginTop: 4 },
  modeCard: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', padding: 10, gap: 3, alignItems: 'flex-end' },
  modeCardOn: { borderColor: Palette.primary, backgroundColor: Palette.primarySoft },
  modeTitle: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.ink, writingDirection: 'rtl' },
  modeTitleOn: { color: Palette.primaryDark },
  modeDesc: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 17, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  roleRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 },
  roleChip: { minHeight: 40, borderRadius: 20, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', paddingHorizontal: 14, justifyContent: 'center' },
  roleChipOn: { backgroundColor: Palette.primarySoft, borderColor: Palette.primary },
  roleChipText: { fontFamily: Typography.fontFamily, fontSize: 13, color: Palette.text },
  roleChipTextOn: { color: Palette.primaryDark, fontFamily: Typography.boldFontFamily },
  enter: { minHeight: 52, marginTop: 6, borderRadius: 16, backgroundColor: Palette.primary, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 20 },
  enterText: { fontFamily: Typography.boldFontFamily, fontSize: 15, color: '#FFFFFF', writingDirection: 'rtl' },
  emptyNote: { fontFamily: Typography.fontFamily, fontSize: 13, color: Palette.muted, textAlign: 'center', writingDirection: 'rtl' },
  thread: { width: '100%', gap: 10, marginTop: 6 },
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
  lineFa: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 22, color: Palette.text, textAlign: 'right', writingDirection: 'rtl' },
  correctionHint: { fontFamily: Typography.fontFamily, fontSize: 11, lineHeight: 18, color: '#B45309', textAlign: 'right', writingDirection: 'rtl', marginTop: 2 },
  replay: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, padding: 4 },
  replayText: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.primary, writingDirection: 'rtl' },
  turnCard: { width: '100%', borderRadius: 20, borderWidth: 1, borderColor: '#DDE2FF', backgroundColor: '#FBFBFF', padding: 14, gap: 9 },
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
  switchRow: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
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
  metricsGrid: { flexDirection: 'row-reverse', gap: 8 },
  metricBox: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', gap: 2 },
  metricValue: { fontFamily: Typography.boldFontFamily, fontSize: 15, color: Palette.ink, writingDirection: 'rtl' },
  metricLabel: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.muted, writingDirection: 'rtl' },
  finalHint: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 21, textAlign: 'right', writingDirection: 'rtl' },
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
  reviewExpected: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: Palette.primaryDark, textAlign: 'right', writingDirection: 'rtl' },
  errorLine: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: '#B45309', textAlign: 'right', writingDirection: 'rtl', width: '100%' },
  successLine: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: '#166534', textAlign: 'right', writingDirection: 'rtl' },
  doneActions: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  againButton: { minHeight: 44, paddingHorizontal: 18, borderRadius: 14, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  againText: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: '#FFFFFF', writingDirection: 'rtl' },
  flipDoneButton: { minHeight: 44, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: Palette.primary, backgroundColor: '#FFFFFF', flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  flipDoneText: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.primaryDark, writingDirection: 'rtl' },
});
