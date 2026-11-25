import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Keyboard,
  MessageCircle,
  Mic2,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  Volume2,
} from 'lucide-react-native';
import SpeakCheck from '@/components/SpeakCheck';
// Both text and input go through the localized wrappers, or the Persian digits and the script-aware
// font/direction policy would be missing from this screen.
import { LocalizedText as Text, LocalizedTextInput as TextInput } from '@/components/LocalizedText';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';
import { Typography } from '@/lib/theme';
import { toPersianDigits as fa } from '@/lib/format';
import {
  normalizeLessonConversation,
  withInferredDialogueRoles,
  type LessonConversationSession,
} from '@/lib/lessonConversation';
import { saveLessonOutcome } from '@/lib/lessonOutcomes';
import {
  conversationPracticeForLesson,
  evaluateSemanticResponse,
  type BranchingConversation,
  type BranchingLocale,
  type Choice,
  type ConversationLevel,
  type SemanticTurn,
} from '@/lib/branchingConversation';
import { hostFor } from '@/lib/conversationHosts';
import { MISSION_STEP_MIN_SCORE, missionForLesson, missionGrade, missionOverall } from '@/lib/conversationMissions';
import {
  CONVERSATION_ROOM_DIALOGUES,
  resolveConversationDialogue,
} from '@/lib/conversationRoomDialogues';

type ChatLine = { who: string; role: 'learner' | 'partner'; text: string; fa: string };
type TurnStatus = 'spoken' | 'typed' | 'choice' | 'skipped';
type ReplyMode = 'choice' | 'voice' | 'type';

type Props = {
  /** The lesson's own dialogue, with its real speaker roles. This is what makes it a conversation. */
  dialogue: ReadonlyArray<{ speaker: string; role?: 'learner' | 'partner'; text: string; fa: string }>;
  /** Only for a lesson without dialogue data: its sentences become short alternating turns. */
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
  /** Level-aware timing and optional Pre-A1/A1 choices. */
  semanticPractice?: BranchingConversation | null;
  levelId?: number;
};

const TYPING_MS = 340;
const FALLBACK_MAX_TURNS = 6;

const learnerRoleOf = (lines: ChatLine[]) =>
  lines.find(line => line.role === 'learner')?.who ?? null;

const nameOf = (who: string) =>
  who === 'partner' ? 'هم‌صحبت' : who === 'learner' ? 'شما' : who === 'زبان‌آموز' ? 'شما' : who;

function levelLabelFa(level?: ConversationLevel): string {
  switch (level) {
    case 'Pre-A1': return 'مقدماتی (Pre-A1)';
    case 'A1': return 'پایه (A1)';
    case 'A2': return 'روزمره (A2)';
    case 'B1': return 'مستقل (B1)';
    case 'B2': return 'استدلالی (B2)';
    case 'C1': return 'پیشرفته (C1)';
    default: return 'گفت‌وگو';
  }
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

  const effectiveDialogue = useMemo(
    () => resolveConversationDialogue(lessonId, dialogue),
    [dialogue, lessonId],
  );
  const usesCuratedDialogue = Boolean(lessonId && CONVERSATION_ROOM_DIALOGUES[lessonId]);

  const effectiveSemanticPractice = useMemo<BranchingConversation | null | undefined>(() => {
    if (!usesCuratedDialogue) return semanticPractice;
    const inferredLevelId =
      levelId ??
      (semanticPractice?.level === 'Pre-A1'
        ? 0
        : semanticPractice?.level === 'A1'
          ? 1
          : semanticPractice?.level === 'A2'
            ? 2
            : semanticPractice?.level === 'B1'
              ? 3
              : semanticPractice?.level === 'B2'
                ? 4
                : semanticPractice?.level === 'C1'
                  ? 5
                  : 1);
    return conversationPracticeForLesson(
      {
        id: lessonId,
        levelId: inferredLevelId,
        sentences: effectiveDialogue.map(line => ({ text: line.text, fa: line.fa })),
        dialogue: withInferredDialogueRoles(effectiveDialogue),
      },
      locale,
    );
  }, [effectiveDialogue, lessonId, levelId, locale, semanticPractice, usesCuratedDialogue]);

  const hasAuthoredDialogue = useMemo(
    () => effectiveDialogue.some(line => line.text.trim().length > 0),
    [effectiveDialogue],
  );

  const lines = useMemo<ChatLine[]>(() => {
    const real = effectiveDialogue.filter(line => line.text.trim());
    if (real.length) {
      return withInferredDialogueRoles(real).map(line => ({
        who: line.speaker,
        role: line.role,
        text: line.text,
        fa: line.fa,
      }));
    }
    const scripted = (fallback ?? []).filter(line => line.text.trim()).slice(0, FALLBACK_MAX_TURNS);
    return scripted.map((line, index) => ({
      who: index % 2 === 0 ? 'هم‌صحبت' : 'زبان‌آموز',
      role: index % 2 === 0 ? ('partner' as const) : ('learner' as const),
      text: line.text,
      fa: line.fa,
    }));
  }, [effectiveDialogue, fallback]);

  const roles = useMemo(() => [...new Set(lines.map(line => line.who))], [lines]);
  const declared = learnerRoleOf(lines);

  const activeLevel: ConversationLevel = effectiveSemanticPractice?.level
    ?? (levelId === 0 ? 'Pre-A1' : levelId === 1 ? 'A1' : levelId === 2 ? 'A2' : levelId === 3 ? 'B1' : levelId === 4 ? 'B2' : levelId === 5 ? 'C1' : 'A1');
  const isBeginnerBand = activeLevel === 'Pre-A1' || activeLevel === 'A1';

  const [myRole, setMyRole] = useState<string | null>(declared ?? roles[0] ?? null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const [speakingAt, setSpeakingAt] = useState<number | null>(null);
  const [showPhrase, setShowPhrase] = useState(isBeginnerBand);
  const [showTranslations, setShowTranslations] = useState(true);
  const [replyMode, setReplyMode] = useState<ReplyMode>(isBeginnerBand ? 'choice' : 'type');
  const [, setTyped] = useState(false);
  const [choiceFeedback, setChoiceFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');
  const [learnerActuals, setLearnerActuals] = useState<Record<number, { text: string; status: TurnStatus }>>({});
  // Real scoring: per-turn percent + the partner's fork reaction (branching scenes).
  const [turnScores, setTurnScores] = useState<Record<number, number>>({});
  const [reactions, setReactions] = useState<Record<number, { text: string; fa: string; ending?: string }>>({});
  const [hydrated, setHydrated] = useState(false);
  const [samplePlaying, setSamplePlaying] = useState(false);

  const outcomeSavedRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stall = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spokenFor = useRef<number | null>(null);

  const current = lines[index];
  const currentRule: SemanticTurn | undefined = current
    ? (effectiveSemanticPractice?.turns[index] ?? effectiveSemanticPractice?.allTurns?.[index])
    : undefined;
  const isMine = !!current && !!myRole && current.who === myRole;
  const finished = open && index >= lines.length;
  const sent = useMemo(() => lines.slice(0, Math.min(index, lines.length)), [lines, index]);

  const levelIndex = levelId ?? (activeLevel === 'Pre-A1' ? 0 : activeLevel === 'A2' ? 2 : activeLevel === 'B1' ? 3 : activeLevel === 'B2' ? 4 : activeLevel === 'C1' ? 5 : 1);
  const host = hostFor(resolvedCourseId, levelIndex);

  // Mission: goal + the learner's own turns as a checklist, scored for real.
  const mission = useMemo(() => missionForLesson(
    lessonId,
    situation,
    lines.map((line, turn) => ({ turn, label: line.fa })).filter(item => lines[item.turn].who === myRole),
  ), [lessonId, situation, lines, myRole]);
  const myTurnIndices = useMemo(() => lines.map((line, turn) => (line.who === myRole ? turn : -1)).filter(turn => turn >= 0), [lines, myRole]);
  const overallPercent = missionOverall(turnScores, myTurnIndices);
  const missionPassed = overallPercent >= mission.passPercent;
  const endingLabel = useMemo(() => Object.values(reactions).find(reaction => reaction.ending)?.ending, [reactions]);
  const skippedCount = Object.values(learnerActuals).filter(item => item.status === 'skipped').length;
  const voiceCount = Object.values(learnerActuals).filter(item => item.status === 'spoken').length;
  const partnerName = nameOf(lines.find(line => line.who !== myRole)?.who ?? 'هم‌صحبت');
  const myRoleLabel = myRole ? nameOf(myRole) : 'شما';

  const clearTimer = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const clearStall = () => { if (stall.current) { clearTimeout(stall.current); stall.current = null; } };
  useEffect(() => () => { clearTimer(); clearStall(); onStop?.(); }, [onStop]);

  useEffect(() => {
    const restored = normalizeLessonConversation(initialSession, lines.length, roles, declared);
    setOpen(restored.started || restored.completed);
    setIndex(restored.currentTurn);
    setShowPhrase(restored.started ? restored.revealed : isBeginnerBand);
    setMyRole(restored.myRole ?? declared ?? roles[0] ?? null);
    setReplyMode(isBeginnerBand ? 'choice' : 'type');
    setTyped(false);
    setChoiceFeedback(null);
    setDraft('');
    setNote('');
    setLearnerActuals({});
    setTurnScores({});
    setReactions({});
    setSamplePlaying(false);
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
      attempts: 0,
      revealed: showPhrase,
      completed: finished,
    });
  }, [finished, hydrated, index, lines.length, myRole, onSessionChange, open, showPhrase]);

  useEffect(() => {
    setSamplePlaying(false);
  }, [open, index, isMine]);

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
  }, [onSpeak]);

  const playCurrent = useCallback(() => {
    if (!current) return;
    setNote('');
    setSamplePlaying(true);
    speak(current.text, -4, () => {
      setSamplePlaying(false);
    });
  }, [current, speak]);

  const advance = useCallback(() => {
    clearStall();
    onStop?.();
    setChoiceFeedback(null);
    setDraft('');
    setNote('');
    setSamplePlaying(false);
    setIndex(value => value + 1);
  }, [onStop]);

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
  }, [advance, speak]);

  useEffect(() => {
    if (!open || !current || isMine) return;
    if (typing || spokenFor.current === index) return;
    showPartner(index);
  }, [current, index, isMine, open, showPartner, typing]);

  const submitAnswer = (answer: string, method: 'voice' | 'typed' | 'choice' = 'typed') => {
    if (!current) return;
    const cleaned = answer.trim();
    if (!cleaned) {
      setNote('اول پاسخی انتخاب کن، بنویس یا با «پاسخ نمونه» ادامه بده.');
      return;
    }
    const turnStatus: TurnStatus = method === 'voice' ? 'spoken' : method === 'choice' ? 'choice' : 'typed';
    // Real evaluation: typed/spoken turns must actually match the situation; a rejected
    // reply stays on the turn with feedback (the sample button below is the escape hatch).
    let score = 100;
    if (method !== 'choice' && currentRule) {
      const evaluation = evaluateSemanticResponse(currentRule, cleaned, locale, activeLevel);
      if (!evaluation.accepted) {
        setNote(evaluation.feedback);
        return;
      }
      score = evaluation.score;
      if (evaluation.branchReply) {
        const isFinalMine = myTurnIndices[myTurnIndices.length - 1] === index;
        setReactions(prev => ({
          ...prev,
          [index]: { text: evaluation.branchReply!.text, fa: evaluation.branchReply!.fa, ...(isFinalMine ? { ending: 'پایان: مسیر تازهٔ گفت‌وگو' } : {}) },
        }));
      }
    }
    setTurnScores(prev => ({ ...prev, [index]: score }));
    setLearnerActuals(prev => ({
      ...prev,
      [index]: { text: cleaned, status: turnStatus },
    }));
    setDraft('');
    setNote('');
    advance();
  };

  const moveToNextTurn = () => {
    if (!current) return;
    setTurnScores(prev => ({ ...prev, [index]: 40 }));
    setLearnerActuals(prev => ({
      ...prev,
      [index]: { text: current.text, status: 'skipped' },
    }));
    advance();
  };

  // Start immediately without blocking on a scary microphone permission popup; mic is 100% opt-in.
  const begin = () => {
    setOpen(true);
    setIndex(0);
    setShowPhrase(isBeginnerBand);
    setReplyMode(isBeginnerBand ? 'choice' : 'type');
    outcomeSavedRef.current = false;
    setTurnScores({});
    setReactions({});
    clearTimer();
    clearStall();
    spokenFor.current = null;
  };

  const restart = () => {
    clearTimer();
    clearStall();
    onStop?.();
    spokenFor.current = null;
    setLearnerActuals({});
    setTurnScores({});
    setReactions({});
    outcomeSavedRef.current = false;
    setIndex(0);
    setTyping(false);
    setSpeakingAt(null);
    setSamplePlaying(false);
    setShowPhrase(isBeginnerBand);
    setReplyMode(isBeginnerBand ? 'choice' : 'type');
    setDraft('');
    setNote('');
    setChoiceFeedback(null);
  };

  const submitChoice = (ch: Choice) => {
    if (!ch.correct) {
      setChoiceFeedback({
        ok: false,
        text: `«${ch.text}» با معنیِ این نوبت هماهنگ نیست؛ گزینهٔ متناسب با موقعیت را انتخاب کن.`,
      });
      return;
    }
    setChoiceFeedback(null);
    // Scene fork: this choice moves the conversation down its own path and the partner
    // reacts to it; an `ending` choice on the final turn names the session's ending.
    if (ch.branchReply) {
      setReactions(prev => ({ ...prev, [index]: { text: ch.branchReply!.text, fa: ch.branchReply!.fa, ending: ch.ending } }));
    }
    // Play the selected line briefly in background or just append cleanly into the chat thread.
    submitAnswer(ch.text, 'choice');
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

  const selectReplyMode = (mode: ReplyMode) => {
    setReplyMode(mode);
    setNote('');
    setChoiceFeedback(null);
    if (mode === 'type') setTyped(true);
    else setTyped(false);
    if (mode === 'voice') {
      void ExpoSpeechRecognitionModule?.requestPermissionsAsync?.().catch(() => undefined);
    }
  };

  // Record the real outcome of the session (mission score with a pass mark), not a blanket success.
  useEffect(() => {
    if (!finished || !lines.length || outcomeSavedRef.current) return;
    outcomeSavedRef.current = true;
    const answered = Object.keys(learnerActuals).length;
    void saveLessonOutcome(resolvedCourseId, lessonId, {
      oralExam: {
        mode: 'guided-practice',
        overall: overallPercent,
        bestOverall: overallPercent,
        pronunciation: overallPercent,
        semantic: overallPercent,
        independence: answered ? Math.max(0, 100 - Math.round((skippedCount / answered) * 100)) : 0,
        interaction: myTurnIndices.length ? Math.round((answered / myTurnIndices.length) * 100) : 0,
        grade: missionGrade(overallPercent),
        passed: missionPassed,
        voiceTurns: voiceCount,
        totalTurns: lines.length,
        at: new Date().toISOString(),
      },
    });
  }, [finished, learnerActuals, lessonId, lines.length, missionPassed, overallPercent, resolvedCourseId, skippedCount, voiceCount, myTurnIndices.length]);

  const availableChoices: Choice[] = useMemo(() => {
    if (currentRule?.choices?.length) return currentRule.choices;
    if (!current) return [];
    return [{ text: current.text, correct: true }];
  }, [current, currentRule]);

  const canUseChoices = availableChoices.length > 0;

  if (!lines.length) {
    return <View style={styles.wrap}><Text style={styles.emptyNote}>برای این درس گفت‌وگویی ثبت نشده است.</Text></View>;
  }

  const learnerTurnsTotal = lines.filter(line => line.who === myRole).length;

  return (
    <View style={styles.wrap}>
      {!open ? (
        <View style={styles.invite}>
          <View style={styles.inviteBadgesRow}>
            <View style={styles.inviteBadge}>
              <MessageCircle size={14} color={Palette.primary} />
              <Text style={styles.inviteBadgeText}>
                اتاق گفت‌وگو · {levelLabelFa(activeLevel)}
              </Text>
            </View>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalBadgeText}>{fa(lines.length)} نوبت · بدون استرس</Text>
            </View>
          </View>

          <Text style={styles.inviteTitle}>
            {hasAuthoredDialogue
              ? 'این موقعیت را مثل یک چتِ واقعی پیش ببر'
              : 'عبارت‌های این درس را در یک گفت‌وگوی کوتاه تمرین کن'}
          </Text>
          {situation ? <Text style={styles.sceneText}>{situation}</Text> : null}
          <Text style={styles.inviteText}>
            {isBeginnerBand
              ? 'هم‌صحبت پیام می‌دهد و شما با یک لمس پاسخ آماده را انتخاب می‌کنید (اگر خواستید می‌توانید با صدا یا تایپ هم جواب بدهید).'
              : 'هم‌صحبت پیام می‌دهد و شما با تایپ، صدا یا انتخاب پاسخ ادامه می‌دهید.'}
          </Text>

          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>شروع گفت‌وگو:</Text>
            <Text style={[styles.previewLine, isRtlTarget && styles.rtlText]}>{lines[0]?.text}</Text>
            <Text style={styles.previewFa}>{lines[0]?.fa}</Text>
          </View>

          {roles.length > 1 ? (
            <View style={styles.roleBox}>
              <Text style={styles.roleHint}>نقش خودت در گفت‌وگو:</Text>
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
                        {nameOf(role)} ({fa(turnCount)} پیام)
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            style={styles.enter}
            onPress={begin}
          >
            <MessageCircle size={18} color="#FFFFFF" />
            <Text style={styles.enterText}>ورود به گفت‌وگو ({fa(learnerTurnsTotal)} نوبت شما)</Text>
          </Pressable>
        </View>
      ) : finished ? (
        <View style={[styles.doneCard, !missionPassed && styles.doneCardRetry]}>
          <View style={styles.doneHeader}>
            <View style={[styles.doneIconBadge, !missionPassed && styles.doneIconRetry]}>
              {missionPassed ? <CheckCircle2 size={22} color="#FFFFFF" /> : <AlertCircle size={22} color="#FFFFFF" />}
            </View>
            <View style={styles.doneCopy}>
              <Text style={styles.doneTitle}>{missionPassed ? 'مأموریت انجام شد!' : 'مأموریت کامل نشد'}</Text>
              <Text style={styles.doneText}>
                {missionPassed
                  ? `امتیاز گفت‌وگو: ${fa(overallPercent)}٪ از حد قبولی ${fa(mission.passPercent)}٪. هر پیام را لمس کنی دوباره پخش می‌شود.`
                  : `امتیاز این بار ${fa(overallPercent)}٪ بود (حد قبولی ${fa(mission.passPercent)}٪). گام‌های نارنجی را با صدا یا نوشتنِ خودت دوباره بگو و تکرار کن.`}
              </Text>
            </View>
          </View>

          {endingLabel ? (
            <View style={styles.endingChip}><Text style={styles.endingChipText}>{endingLabel}</Text></View>
          ) : null}

          <View style={styles.missionList}>
            <Text style={styles.missionListTitle}>چک‌لیست مأموریت</Text>
            {mission.steps.map(step => {
              const stepScore = turnScores[step.turn] ?? 0;
              const stepDone = stepScore >= MISSION_STEP_MIN_SCORE;
              return (
                <View key={`mission-${step.turn}`} style={styles.missionStepRow}>
                  <Text style={[styles.missionStepDot, stepDone && styles.missionStepDotDone]}>{stepDone ? '✓' : '•'}</Text>
                  <Text numberOfLines={1} style={[styles.missionStepLabel, stepDone && styles.missionStepLabelDone]}>{step.label}</Text>
                  <Text style={[styles.missionStepScore, !stepDone && styles.missionStepScoreWeak]}>{fa(stepScore)}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.reviewList}>
            <Text style={styles.reviewHeading}>متن کامل گفت‌وگو</Text>
            {lines.map((line, idx) => {
              const isMineDone = line.who === myRole;
              return (
                <Pressable
                  key={`done-line-${idx}`}
                  accessibilityRole="button"
                  onPress={() => speak(line.text, -30 - idx)}
                  style={[styles.reviewBubble, isMineDone ? styles.reviewBubbleMine : styles.reviewBubblePartner]}
                >
                  <View style={styles.reviewBubbleTop}>
                    <Text style={styles.reviewWho}>{isMineDone ? `شما (${myRoleLabel})` : partnerName}</Text>
                    <Volume2 size={14} color={Palette.primary} />
                  </View>
                  <Text style={[styles.reviewLineText, isRtlTarget && styles.rtlText]}>{line.text}</Text>
                  <Text style={styles.reviewLineFa}>{line.fa}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.doneActions}>
            <Pressable accessibilityRole="button" style={styles.againButton} onPress={restart}>
              <RefreshCw size={15} color="#FFFFFF" />
              <Text style={styles.againText}>تکرار گفت‌وگو</Text>
            </Pressable>
            {roles.length > 1 ? (
              <Pressable accessibilityRole="button" style={styles.flipDoneButton} onPress={flipRole}>
                <RefreshCw size={15} color={Palette.primary} />
                <Text style={styles.flipDoneText}>تمرین در نقش {partnerName}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.chatShell}>
          {/* Host strip + mission banner (format reform: who you are talking to, and what for) */}
          {host ? (
            <View style={styles.hostStrip}>
              <Text style={styles.hostEmoji}>{host.emoji}</Text>
              <View style={styles.hostCopy}>
                <Text style={styles.hostName}>{host.name} · میزبان این سطح</Text>
                <Text style={styles.hostBio}>{host.bio}</Text>
              </View>
              <View style={styles.missionChip}>
                <Target size={12} color="#FFFFFF" />
                <Text style={styles.missionChipText}>مأموریت</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.missionBanner}>
            <Text numberOfLines={1} style={styles.missionGoalText}>🎯 {mission.goal}</Text>
            <Text style={styles.missionProgressText}>
              گام {fa(Object.values(turnScores).filter(value => value >= MISSION_STEP_MIN_SCORE).length)} از {fa(myTurnIndices.length)}
            </Text>
          </View>

          {/* Chat Header */}
          <View style={styles.chatTopBar} accessibilityLiveRegion="polite">
            <View style={styles.partnerInfo}>
              <View style={styles.partnerAvatar}>
                <Text style={styles.partnerAvatarText}>{partnerName.slice(0, 1)}</Text>
              </View>
              <View style={styles.partnerCopy}>
                <Text style={styles.partnerTitle}>{partnerName}</Text>
                <Text style={styles.partnerStatus}>
                  {typing ? 'در حال نوشتن…' : speakingAt === index ? 'در حال صحبت…' : `پیام ${fa(index + 1)} از ${fa(lines.length)}`}
                </Text>
              </View>
            </View>
            <View style={styles.chatTopControls}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showTranslations ? 'مخفی کردن ترجمه فارسی' : 'نمایش ترجمه فارسی'}
                onPress={() => setShowTranslations(v => !v)}
                style={styles.iconPill}
              >
                {showTranslations ? <Eye size={13} color={Palette.primaryDark} /> : <EyeOff size={13} color={Palette.muted} />}
                <Text style={styles.iconPillText}>ترجمه</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="شروع دوباره"
                onPress={restart}
                style={styles.iconPill}
              >
                <RefreshCw size={13} color={Palette.primaryDark} />
              </Pressable>
            </View>
          </View>

          {/* Progress Dots */}
          <View style={styles.progressTrack}>
            {lines.map((line, dot) => (
              <View
                key={`${line.text}-${dot}`}
                style={[styles.progressSeg, dot < index && styles.progressSegDone, dot === index && styles.progressSegNow]}
              />
            ))}
          </View>

          {/* Conversation Thread */}
          <View style={styles.thread}>
            {sent.map((line, at) => {
              const actual = learnerActuals[at];
              const isLearnerBubble = line.who === myRole;
              const bubbleText = isLearnerBubble && actual && actual.status !== 'skipped' ? actual.text : line.text;
              const reaction = reactions[at];
              return (
                <View key={`sent-wrap-${at}`} style={styles.bubbleGroup}>
                <View style={[styles.bubble, isLearnerBubble ? styles.mine : styles.theirs]}>
                  <View style={styles.bubbleTop}>
                    <Text style={styles.who}>{isLearnerBubble ? `شما (${myRoleLabel})` : partnerName}</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`شنیدنِ خط ${fa(at + 1)}`}
                      onPress={() => speak(line.text, at)}
                      style={styles.replay}
                    >
                      <Volume2 size={14} color={Palette.primary} />
                    </Pressable>
                  </View>
                  <Text style={[styles.lineText, isRtlTarget && styles.rtlText]}>{bubbleText}</Text>
                  {showTranslations && line.fa ? <Text style={styles.lineFa}>{line.fa}</Text> : null}
                </View>
                {reaction ? (
                  <View style={[styles.bubble, styles.theirs, styles.reactionBubble]}>
                    <Text style={styles.who}>{partnerName} · واکنش</Text>
                    <Text style={[styles.lineText, isRtlTarget && styles.rtlText]}>{reaction.text}</Text>
                    <Text style={styles.lineFa}>{reaction.fa}</Text>
                  </View>
                ) : null}
                </View>
              );
            })}

            {/* Partner active turn bubble */}
            {current && !isMine ? (
              <View style={[styles.bubble, styles.theirs, typing && styles.bubblePending]}>
                <Text style={styles.who}>
                  {typing ? `${partnerName} در حال نوشتن…` : speakingAt === index ? `${partnerName} در حال صحبت…` : partnerName}
                </Text>
                {!typing ? (
                  <>
                    <Text style={[styles.lineText, isRtlTarget && styles.rtlText]}>{current.text}</Text>
                    {showTranslations ? <Text style={styles.lineFa}>{current.fa}</Text> : null}
                    <View style={styles.partnerActionsRow}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="دوباره بشنو"
                        onPress={() => speak(current.text, index)}
                        style={styles.replayChip}
                      >
                        <Volume2 size={14} color={Palette.primary} />
                        <Text style={styles.replayText}>بشنو</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="ادامه به پیام بعدی"
                        onPress={advance}
                        style={styles.partnerContinueBtn}
                      >
                        <Text style={styles.partnerContinueText}>ادامه</Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="نمایش پیام هم‌صحبت"
                    onPress={advance}
                    style={styles.partnerContinueBtn}
                  >
                    <Text style={styles.partnerContinueText}>ادامه</Text>
                  </Pressable>
                )}
              </View>
            ) : null}
          </View>

          {/* Learner active turn composer */}
          {current && isMine ? (
            <View style={styles.composerCard}>
              <View style={styles.composerHead}>
                <View style={styles.composerTitleRow}>
                  <Sparkles size={14} color={Palette.primary} />
                  <Text style={styles.turnTitle}>نوبت شما ({myRoleLabel})</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  style={styles.togglePhraseBtn}
                  onPress={() => setShowPhrase(value => !value)}
                >
                  {showPhrase ? <EyeOff size={13} color={Palette.primaryDark} /> : <Eye size={13} color={Palette.primaryDark} />}
                  <Text style={styles.togglePhraseText}>{showPhrase ? 'مخفی کردن الگو' : 'نمایش راهنما'}</Text>
                </Pressable>
              </View>

              <Text style={styles.turnPrompt}>{currentRule?.promptFa ?? current.fa}</Text>

              {showPhrase ? (
                <View style={styles.phraseCard}>
                  <Text style={[styles.turnTarget, isRtlTarget && styles.rtlText]}>{current.text}</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={playCurrent}
                    style={[styles.listenBtn, samplePlaying && styles.listenBtnActive]}
                  >
                    <Volume2 size={14} color="#FFFFFF" />
                    <Text style={styles.listenBtnText}>{samplePlaying ? 'پخش…' : 'بشنو'}</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable accessibilityRole="button" style={styles.helperChip} onPress={playCurrent}>
                  <Volume2 size={14} color={Palette.primaryDark} />
                  <Text style={styles.helperChipText}>{samplePlaying ? 'در حال پخش…' : 'شنیدن پاسخ نمونه'}</Text>
                </Pressable>
              )}

              {/* Mode Selector Tabs */}
              <View style={styles.modeSwitcher}>
                {canUseChoices ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => selectReplyMode('choice')}
                    style={[styles.modeTab, replyMode === 'choice' && styles.modeTabActive]}
                  >
                    <MessageCircle size={13} color={replyMode === 'choice' ? '#FFFFFF' : Palette.primaryDark} />
                    <Text style={[styles.modeTabText, replyMode === 'choice' && styles.modeTabTextActive]}>پاسخ آماده</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => selectReplyMode('type')}
                  style={[styles.modeTab, replyMode === 'type' && styles.modeTabActive]}
                >
                  <Keyboard size={13} color={replyMode === 'type' ? '#FFFFFF' : Palette.primaryDark} />
                  <Text style={[styles.modeTabText, replyMode === 'type' && styles.modeTabTextActive]}>نوشتن</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => selectReplyMode('voice')}
                  style={[styles.modeTab, replyMode === 'voice' && styles.modeTabActive]}
                >
                  <Mic2 size={13} color={replyMode === 'voice' ? '#FFFFFF' : Palette.primaryDark} />
                  <Text style={[styles.modeTabText, replyMode === 'voice' && styles.modeTabTextActive]}>گفتار (اختیاری)</Text>
                </Pressable>
              </View>

              {replyMode === 'choice' && canUseChoices ? (
                <View style={styles.choiceList}>
                  {availableChoices.map((ch: Choice, idx: number) => (
                    <Pressable
                      key={`choice-${index}-${idx}`}
                      accessibilityRole="button"
                      onPress={() => submitChoice(ch)}
                      style={({ pressed }) => [styles.choiceBtn, pressed && styles.pressed]}
                    >
                      <Text style={[styles.choiceForeign, isRtlTarget && styles.rtlText]}>{ch.text}</Text>
                      <Text style={styles.choiceSendHint}>ارسال</Text>
                    </Pressable>
                  ))}
                  {choiceFeedback ? (
                    <Text accessibilityLiveRegion="polite" style={styles.choiceFeedbackText}>
                      {choiceFeedback.text}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              {replyMode === 'type' ? (
                <View style={styles.compose}>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    onSubmitEditing={sendTyped}
                    returnKeyType="send"
                    placeholder="پیامت را بنویس…"
                    placeholderTextColor={Palette.muted}
                    accessibilityLabel="پاسخ شما"
                    style={[styles.input, isRtlTarget && styles.rtlInput]}
                  />
                  <Pressable accessibilityRole="button" accessibilityLabel="ارسال پیام" onPress={sendTyped} style={styles.send}>
                    <Send size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              ) : null}

              {replyMode === 'voice' ? (
                <SpeakCheck
                  key={`${index}-${current.text}`}
                  text={current.text}
                  locale={locale}
                  accent={Palette.primary}
                  title="با صدای خودت بگو (اختیاری)"
                  level={activeLevel}
                  adaptiveTiming
                  autoStart={false}
                  blindExam={false}
                  compact
                  onResult={result => {
                    if (!result.heard.trim()) {
                      setNote('صدایی دریافت نشد؛ دوباره امتحان کن یا از پاسخ آماده / نوشتن استفاده کن.');
                      return;
                    }
                    submitAnswer(result.heard, 'voice');
                  }}
                  singleAttempt
                />
              ) : null}

              <View style={styles.composerFooter}>
                <Pressable accessibilityRole="button" style={styles.skipButton} onPress={moveToNextTurn}>
                  <Text style={styles.skipText}>ارسال با پاسخ نمونه</Text>
                </Pressable>
                {roles.length > 1 ? (
                  <Pressable accessibilityRole="button" style={styles.linkButton} onPress={flipRole}>
                    <Text style={styles.linkText}>جابه‌جایی نقش</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}

          {note ? <Text accessibilityLiveRegion="polite" style={styles.note}>{note}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'stretch', gap: 10, paddingVertical: 6 },
  invite: {
    width: '100%',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE2FF',
    alignItems: 'center',
  },
  inviteBadgesRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6 },
  optionalBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  optionalBadgeText: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: '#047857', writingDirection: 'rtl' },
  inviteBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 4, borderRadius: 20, backgroundColor: Palette.primarySoft, borderWidth: 1, borderColor: '#DDE2FF' },
  inviteBadgeText: { fontFamily: Typography.boldFontFamily, fontSize: 11.5, color: Palette.primaryDark, writingDirection: 'rtl' },
  inviteTitle: { fontFamily: Typography.boldFontFamily, fontSize: 17, lineHeight: 28, color: Palette.ink, textAlign: 'center', writingDirection: 'rtl' },
  sceneText: { fontFamily: Typography.boldFontFamily, fontSize: 13.5, lineHeight: 22, color: Palette.primaryDark, textAlign: 'center', writingDirection: 'rtl', maxWidth: 560 },
  inviteText: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 22, color: Palette.text, textAlign: 'center', writingDirection: 'rtl', maxWidth: 560 },
  previewCard: { width: '100%', borderRadius: 16, backgroundColor: '#F8FAFF', borderWidth: 1, borderColor: '#E2E8F5', padding: 12, gap: 4 },
  previewLabel: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  previewLine: { fontFamily: Typography.latinFontFamily, fontSize: 16, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  previewFa: { fontFamily: Typography.fontFamily, fontSize: 12.5, color: Palette.text, textAlign: 'right', writingDirection: 'rtl' },
  roleBox: { width: '100%', gap: 6, alignItems: 'center' },
  roleHint: { fontFamily: Typography.fontFamily, fontSize: 11.5, color: Palette.muted, textAlign: 'center', writingDirection: 'rtl' },
  roleRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  roleChip: { minHeight: 36, borderRadius: 18, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', paddingHorizontal: 13, justifyContent: 'center' },
  roleChipOn: { backgroundColor: Palette.primarySoft, borderColor: Palette.primary },
  roleChipText: { fontFamily: Typography.fontFamily, fontSize: 12.5, color: Palette.text },
  roleChipTextOn: { color: Palette.primaryDark, fontFamily: Typography.boldFontFamily },
  enter: { minHeight: 48, width: '100%', maxWidth: 340, marginTop: 2, borderRadius: 16, backgroundColor: Palette.primary, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
  enterText: { fontFamily: Typography.boldFontFamily, fontSize: 15, color: '#FFFFFF', writingDirection: 'rtl' },
  emptyNote: { fontFamily: Typography.fontFamily, fontSize: 13, color: Palette.muted, textAlign: 'center', writingDirection: 'rtl' },

  chatShell: { width: '100%', borderRadius: 22, backgroundColor: '#F8F9FE', borderWidth: 1, borderColor: '#DFE4F2', padding: 12, gap: 10 },
  chatTopBar: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E6EAF5' },
  partnerInfo: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  partnerAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  partnerAvatarText: { fontFamily: Typography.boldFontFamily, fontSize: 14, color: '#FFFFFF' },
  partnerCopy: { flex: 1, minWidth: 0, alignItems: 'flex-end' },
  partnerTitle: { fontFamily: Typography.boldFontFamily, fontSize: 13.5, color: Palette.ink, writingDirection: 'rtl' },
  partnerStatus: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.muted, writingDirection: 'rtl' },
  chatTopControls: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  iconPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Palette.border },
  iconPillText: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Palette.primaryDark, writingDirection: 'rtl' },
  progressTrack: { flexDirection: 'row-reverse', gap: 4 },
  progressSeg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E2E6F3' },
  progressSegDone: { backgroundColor: Palette.primary },

  hostStrip: { width: '100%', flexDirection: 'row-reverse', alignItems: 'center', gap: 10, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F5', padding: 10 },
  hostEmoji: { fontSize: 22 },
  hostCopy: { flex: 1, minWidth: 0, gap: 1 },
  hostName: { fontFamily: Typography.boldFontFamily, fontSize: 12.5, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  hostBio: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  missionChip: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, borderRadius: 999, backgroundColor: Palette.primary, paddingHorizontal: 9, paddingVertical: 4 },
  missionChipText: { fontFamily: Typography.boldFontFamily, fontSize: 10.5, color: '#FFFFFF' },
  missionBanner: { width: '100%', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderRadius: 14, backgroundColor: '#FFF8E6', borderWidth: 1, borderColor: '#F2E3B3', paddingHorizontal: 12, paddingVertical: 8 },
  missionGoalText: { flex: 1, fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 19, color: '#8A6D1A', textAlign: 'right', writingDirection: 'rtl' },
  missionProgressText: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: '#8A6D1A' },
  bubbleGroup: { width: '100%', gap: 4 },
  reactionBubble: { borderStyle: 'dashed', borderColor: '#B9C4E8' },
  endingChip: { alignSelf: 'center', borderRadius: 999, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE', paddingHorizontal: 12, paddingVertical: 5 },
  endingChipText: { fontFamily: Typography.boldFontFamily, fontSize: 11.5, color: '#4338CA', writingDirection: 'rtl' },
  missionList: { width: '100%', borderRadius: 14, backgroundColor: '#F8FAFF', borderWidth: 1, borderColor: '#E2E8F5', padding: 12, gap: 6 },
  missionListTitle: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  missionStepRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  missionStepDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFF1D6', borderWidth: 1, borderColor: '#F2C94C', textAlign: 'center', lineHeight: 16, fontSize: 11, color: '#92600A', overflow: 'hidden' },
  missionStepDotDone: { backgroundColor: '#D1FAE5', borderColor: '#34D399', color: '#065F46' },
  missionStepLabel: { flex: 1, fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.text, textAlign: 'right', writingDirection: 'rtl' },
  missionStepLabelDone: { color: '#065F46' },
  missionStepScore: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: '#059669' },
  missionStepScoreWeak: { color: '#B45309' },
  progressSegNow: { backgroundColor: '#10B981' },
  thread: { width: '100%', gap: 8, paddingVertical: 4 },
  bubble: { borderRadius: 18, padding: 12, borderWidth: 1, gap: 4 },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderColor: Palette.border, borderBottomLeftRadius: 5, maxWidth: '90%' },
  mine: { alignSelf: 'flex-end', backgroundColor: '#EEF2FF', borderColor: '#C7D2FE', borderBottomRightRadius: 5, maxWidth: '90%' },
  bubblePending: { opacity: 0.65 },
  bubbleTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  who: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Palette.primaryDark, writingDirection: 'rtl' },
  lineText: { fontFamily: Typography.latinFontFamily, fontSize: 17, lineHeight: 26, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  rtlText: { fontFamily: Typography.boldFontFamily, textAlign: 'right', writingDirection: 'rtl' },
  rtlInput: { fontFamily: Typography.fontFamily, textAlign: 'right', writingDirection: 'rtl' },
  lineFa: { fontFamily: Typography.fontFamily, fontSize: 12.5, lineHeight: 20, color: Palette.text, textAlign: 'right', writingDirection: 'rtl' },
  replay: { padding: 3 },
  replayChip: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: '#F1F5FF', borderWidth: 1, borderColor: '#D6E0FF' },
  replayText: { fontFamily: Typography.boldFontFamily, fontSize: 11.5, color: Palette.primary, writingDirection: 'rtl' },
  partnerActionsRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 4 },
  partnerContinueBtn: { alignSelf: 'flex-start', minHeight: 32, paddingHorizontal: 14, borderRadius: 999, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  partnerContinueText: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: '#FFFFFF', writingDirection: 'rtl' },

  composerCard: { width: '100%', borderRadius: 18, borderWidth: 1, borderColor: '#C7D2FE', backgroundColor: '#FFFFFF', padding: 13, gap: 10 },
  composerHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  composerTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  turnTitle: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.primaryDark, writingDirection: 'rtl' },
  togglePhraseBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' },
  togglePhraseText: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Palette.primaryDark, writingDirection: 'rtl' },
  turnPrompt: { fontFamily: Typography.fontFamily, fontSize: 14, lineHeight: 23, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  phraseCard: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderRadius: 14, backgroundColor: '#F8FAFF', borderWidth: 1, borderColor: '#DBE4FF', padding: 10 },
  turnTarget: { flex: 1, fontFamily: Typography.latinFontFamily, fontSize: 17, lineHeight: 25, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  listenBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, backgroundColor: Palette.primary },
  listenBtnActive: { backgroundColor: Palette.primaryDark },
  listenBtnText: { fontFamily: Typography.boldFontFamily, fontSize: 11.5, color: '#FFFFFF', writingDirection: 'rtl' },
  helperChip: { alignSelf: 'flex-end', flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' },
  helperChipText: { fontFamily: Typography.boldFontFamily, fontSize: 11.5, color: Palette.primaryDark, writingDirection: 'rtl' },

  modeSwitcher: { flexDirection: 'row-reverse', gap: 6, padding: 3, borderRadius: 12, backgroundColor: '#F1F4FA' },
  modeTab: { flex: 1, minHeight: 34, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 9, paddingHorizontal: 6 },
  modeTabActive: { backgroundColor: Palette.primary },
  modeTabText: { fontFamily: Typography.boldFontFamily, fontSize: 11.5, color: Palette.primaryDark, writingDirection: 'rtl' },
  modeTabTextActive: { color: '#FFFFFF' },

  choiceList: { gap: 7 },
  choiceBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderRadius: 14, borderWidth: 1, borderColor: '#D6DDF2', backgroundColor: '#FBFBFF', paddingHorizontal: 13, paddingVertical: 11 },
  choiceForeign: { flex: 1, fontFamily: Typography.latinFontFamily, fontSize: 15.5, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  choiceSendHint: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Palette.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: '#EEF2FF', writingDirection: 'rtl' },
  choiceFeedbackText: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 19, color: '#B45309', backgroundColor: '#FEF3C7', borderColor: '#FDE68A', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, textAlign: 'right', writingDirection: 'rtl' },
  compose: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  input: { flex: 1, minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', paddingHorizontal: 12, fontFamily: Typography.latinFontFamily, fontSize: 15.5, color: Palette.ink },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  composerFooter: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 2 },
  skipButton: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 11, borderRadius: 999, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' },
  skipText: { fontFamily: Typography.boldFontFamily, fontSize: 11.5, color: Palette.text, writingDirection: 'rtl' },
  linkButton: { minHeight: 34, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  linkText: { fontFamily: Typography.fontFamily, fontSize: 12.5, color: Palette.primary, writingDirection: 'rtl' },
  note: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: Palette.primaryDark, textAlign: 'center', writingDirection: 'rtl' },
  pressed: { opacity: 0.85 },

  doneCard: { width: '100%', marginTop: 6, padding: 16, borderRadius: 22, alignItems: 'stretch', gap: 14, borderWidth: 1, backgroundColor: '#F6FBF8', borderColor: '#BBF7D0' },
  doneCardRetry: { backgroundColor: '#FFF9EF', borderColor: '#F5D08C' },
  doneIconRetry: { backgroundColor: '#D97706' },
  doneHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  doneIconBadge: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  doneCopy: { flex: 1, gap: 3, alignItems: 'flex-end' },
  doneTitle: { fontFamily: Typography.boldFontFamily, fontSize: 16, lineHeight: 24, color: '#14532D', textAlign: 'right', writingDirection: 'rtl' },
  doneText: { fontFamily: Typography.fontFamily, fontSize: 12.5, lineHeight: 20, color: '#166534', textAlign: 'right', writingDirection: 'rtl' },
  reviewList: { gap: 8 },
  reviewHeading: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  reviewBubble: { borderRadius: 15, padding: 11, borderWidth: 1, gap: 3 },
  reviewBubblePartner: { backgroundColor: '#FFFFFF', borderColor: '#DCECE2' },
  reviewBubbleMine: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
  reviewBubbleTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  reviewWho: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Palette.primaryDark, writingDirection: 'rtl' },
  reviewLineText: { fontFamily: Typography.latinFontFamily, fontSize: 15.5, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  reviewLineFa: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  doneActions: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  againButton: { minHeight: 44, paddingHorizontal: 18, borderRadius: 14, backgroundColor: Palette.primary, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6 },
  againText: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: '#FFFFFF', writingDirection: 'rtl' },
  flipDoneButton: { minHeight: 44, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: Palette.primary, backgroundColor: '#FFFFFF', flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  flipDoneText: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.primaryDark, writingDirection: 'rtl' },
});
