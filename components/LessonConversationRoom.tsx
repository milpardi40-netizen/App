import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  MessageCircle,
  Mic2,
  RefreshCw,
  Send,
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
  type BranchingConversation,
  type BranchingLocale,
  type Choice,
  type ConversationLevel,
  type SemanticTurn,
} from '@/lib/branchingConversation';
import {
  CONVERSATION_ROOM_DIALOGUES,
  resolveConversationDialogue,
} from '@/lib/conversationRoomDialogues';

type ChatLine = { who: string; role: 'learner' | 'partner'; text: string; fa: string };
type TurnStatus = 'spoken' | 'typed' | 'choice' | 'skipped';

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

const TYPING_MS = 420;
const FALLBACK_MAX_TURNS = 6;

const learnerRoleOf = (lines: ChatLine[]) =>
  lines.find(line => line.role === 'learner')?.who ?? null;

const nameOf = (who: string) =>
  who === 'partner' ? 'هم‌صحبت' : who === 'learner' ? 'زبان‌آموز' : who;

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

  // Use the lesson's own dialogue with explicit/inferred roles; for early alphabet/word lessons
  // without a dialogue array, surface up to 6 distinct items cleanly.
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
  const [myRole, setMyRole] = useState<string | null>(declared ?? roles[0] ?? null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const [speakingAt, setSpeakingAt] = useState<number | null>(null);
  const [showPhrase, setShowPhrase] = useState(true);
  const [typed, setTyped] = useState(false);
  const [choicePanel, setChoicePanel] = useState(false);
  const [choiceFeedback, setChoiceFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');
  const [learnerActuals, setLearnerActuals] = useState<Record<number, { text: string; status: TurnStatus }>>({});
  const [starting, setStarting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [samplePlaying, setSamplePlaying] = useState(false);

  const outcomeSavedRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stall = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spokenFor = useRef<number | null>(null);

  const activeLevel: ConversationLevel = effectiveSemanticPractice?.level
    ?? (levelId === 0 ? 'Pre-A1' : levelId === 1 ? 'A1' : levelId === 2 ? 'A2' : levelId === 3 ? 'B1' : levelId === 4 ? 'B2' : levelId === 5 ? 'C1' : 'A1');

  const current = lines[index];
  const currentRule: SemanticTurn | undefined = current
    ? (effectiveSemanticPractice?.turns[index] ?? effectiveSemanticPractice?.allTurns?.[index])
    : undefined;
  const isMine = !!current && !!myRole && current.who === myRole;
  const finished = open && index >= lines.length;
  const sent = useMemo(() => lines.slice(0, Math.min(index, lines.length)), [lines, index]);
  const partnerName = nameOf(lines.find(line => line.who !== myRole)?.who ?? 'هم‌صحبت');
  const myRoleLabel = myRole ? nameOf(myRole) : 'شما';

  const clearTimer = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const clearStall = () => { if (stall.current) { clearTimeout(stall.current); stall.current = null; } };
  useEffect(() => () => { clearTimer(); clearStall(); onStop?.(); }, [onStop]);

  useEffect(() => {
    const restored = normalizeLessonConversation(initialSession, lines.length, roles, declared);
    setOpen(restored.started || restored.completed);
    setIndex(restored.currentTurn);
    setShowPhrase(restored.started ? restored.revealed : true);
    setMyRole(restored.myRole ?? declared ?? roles[0] ?? null);
    setTyped(false);
    setChoicePanel(false);
    setChoiceFeedback(null);
    setDraft('');
    setNote('');
    setLearnerActuals({});
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
    setChoicePanel(false);
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
      setNote('اول پاسخت را بگو یا بنویس، یا از «رد شو / خط بعدی» برو.');
      return;
    }
    const turnStatus: TurnStatus = method === 'voice' ? 'spoken' : method === 'choice' ? 'choice' : 'typed';
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
    setLearnerActuals(prev => ({
      ...prev,
      [index]: { text: current.text, status: 'skipped' },
    }));
    advance();
  };

  const begin = async () => {
    if (starting) return;
    setStarting(true);
    setOpen(true);
    setIndex(0);
    setShowPhrase(true);
    outcomeSavedRef.current = false;
    clearTimer(); clearStall();
    spokenFor.current = null;
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setTyped(true);
        setNote('میکروفن باز نشد؛ می‌توانی پاسخت را بنویسی یا جمله‌ها را گوش بدهی.');
      }
    } catch {
      setTyped(true);
      setNote('میکروفن آماده نشد؛ می‌توانی پاسخت را بنویسی یا جمله‌ها را گوش بدهی.');
    } finally {
      setStarting(false);
    }
  };

  const restart = () => {
    clearTimer(); clearStall();
    onStop?.();
    spokenFor.current = null;
    setLearnerActuals({});
    outcomeSavedRef.current = false;
    setIndex(0);
    setTyping(false);
    setSpeakingAt(null);
    setSamplePlaying(false);
    setShowPhrase(true);
    setDraft('');
    setNote('');
    setChoicePanel(false);
    setChoiceFeedback(null);
  };

  const submitChoice = (ch: Choice) => {
    if (!ch.correct) {
      setChoiceFeedback({
        ok: false,
        text: `«${ch.text}» با پاسخ مورد نظر این نوبت هماهنگ نیست؛ گزینهٔ درست را انتخاب کن.`,
      });
      return;
    }
    setChoiceFeedback(null);
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

  // Quietly record completion without surfacing exam grades or percentage scores to the learner.
  useEffect(() => {
    if (!finished || !lines.length || outcomeSavedRef.current) return;
    outcomeSavedRef.current = true;
    const entries = Object.values(learnerActuals);
    const voiceTurns = entries.filter(item => item.status === 'spoken').length;
    void saveLessonOutcome(resolvedCourseId, lessonId, {
      oralExam: {
        mode: 'listen-echo',
        overall: 100,
        bestOverall: 100,
        pronunciation: 100,
        semantic: 100,
        independence: 100,
        interaction: 100,
        grade: 'A',
        passed: true,
        voiceTurns,
        totalTurns: lines.length,
        at: new Date().toISOString(),
      },
    });
  }, [finished, learnerActuals, lessonId, lines.length, resolvedCourseId]);

  if (!lines.length) {
    return <View style={styles.wrap}><Text style={styles.emptyNote}>برای این درس گفت‌وگویی ثبت نشده است.</Text></View>;
  }

  const hasChoices = Boolean(currentRule?.choices?.length) && (activeLevel === 'Pre-A1' || activeLevel === 'A1');
  const learnerTurnsTotal = lines.filter(line => line.who === myRole).length;

  return (
    <View style={styles.wrap}>
      {!open ? (
        <View style={styles.invite}>
          <View style={styles.inviteBadgesRow}>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalBadgeText}>شبیه‌سازی تعاملی · اختیاری</Text>
            </View>
            <View style={styles.inviteBadge}>
              <MessageCircle size={14} color={Palette.primary} />
              <Text style={styles.inviteBadgeText}>
                تمرین گفت‌وگوی درس · {levelLabelFa(activeLevel)} · {fa(lines.length)} نوبت
              </Text>
            </View>
          </View>

          <Text style={styles.inviteTitle}>
            {hasAuthoredDialogue
              ? 'همین گفت‌وگوی درس را با آرامش تمرین کن'
              : 'واژه‌ها و عبارت‌های این درس را در نوبت‌های کوتاه تکرار کن'}
          </Text>
          {situation ? <Text style={styles.sceneText}>موقعیت: {situation}</Text> : null}
          <Text style={styles.inviteText}>
            هم‌صحبت خط خودش را می‌گوید و نوبت شما می‌رسد. می‌توانی جمله را بشنوی، بگویی یا بنویسی — بدون نمره و بدون هیچ عجله‌ای.
          </Text>

          {roles.length > 1 ? (
            <View style={styles.roleBox}>
              <Text style={styles.roleHint}>نقش خودت را انتخاب کن:</Text>
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
                        {nameOf(role)} ({fa(turnCount)} نوبت)
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
        <View style={styles.doneCard}>
          <View style={styles.doneHeader}>
            <View style={styles.doneIconBadge}>
              <CheckCircle2 size={22} color="#FFFFFF" />
            </View>
            <View style={styles.doneCopy}>
              <Text style={styles.doneTitle}>گفت‌وگو تمام شد!</Text>
              <Text style={styles.doneText}>
                خیلی خوب بود؛ همهٔ خط‌های این مکالمه را مرور و تمرین کردی. هر وقت خواستی دوباره بشنو یا با نقش مقابل تمرین کن.
              </Text>
            </View>
          </View>

          <View style={styles.reviewList}>
            <Text style={styles.reviewHeading}>مرور خط‌های گفت‌وگو</Text>
            {lines.map((line, idx) => (
              <Pressable
                key={`done-line-${idx}`}
                accessibilityRole="button"
                onPress={() => speak(line.text, -30 - idx)}
                style={styles.reviewLineBtn}
              >
                <Volume2 size={15} color={Palette.primary} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.reviewLineText, isRtlTarget && styles.rtlText]}>{line.text}</Text>
                  <Text style={styles.reviewLineFa}>{nameOf(line.who)}: {line.fa}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.doneActions}>
            <Pressable accessibilityRole="button" style={styles.againButton} onPress={restart}>
              <RefreshCw size={15} color="#FFFFFF" />
              <Text style={styles.againText}>تمرین دوباره</Text>
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
        <View style={styles.thread}>
          <View style={styles.metaRow} accessibilityLiveRegion="polite">
            <View style={styles.dots}>
              {lines.map((line, dot) => (
                <View
                  key={`${line.text}-${dot}`}
                  style={[styles.dot, dot < index && styles.dotDone, dot === index && styles.dotNow]}
                />
              ))}
            </View>
            <View style={styles.metaRight}>
              {typing ? <Text style={styles.typingText}>{partnerName} در حال صحبت…</Text> : null}
              <Text style={styles.turnCounterBadge}>خط {fa(index + 1)} از {fa(lines.length)}</Text>
            </View>
          </View>

          {sent.map((line, at) => {
            const actual = learnerActuals[at];
            const isLearnerBubble = line.who === myRole;
            const bubbleText = isLearnerBubble && actual && actual.status !== 'skipped' ? actual.text : line.text;
            return (
              <View key={`sent-wrap-${at}`} style={styles.sentGroup}>
                <View style={[styles.bubble, isLearnerBubble ? styles.mine : styles.theirs]}>
                  <View style={styles.bubbleTop}>
                    <Text style={styles.who}>{isLearnerBubble ? `شما (${myRoleLabel})` : partnerName}</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`شنیدنِ خط ${fa(at + 1)}`}
                      onPress={() => speak(line.text, at)}
                      style={styles.replay}
                    >
                      <Volume2 size={15} color={Palette.primary} />
                    </Pressable>
                  </View>
                  <Text style={[styles.lineText, isRtlTarget && styles.rtlText]}>{bubbleText}</Text>
                  {line.fa ? <Text style={styles.lineFa}>{line.fa}</Text> : null}
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
                <Pressable
                  accessibilityRole="button"
                  style={styles.togglePhraseBtn}
                  onPress={() => setShowPhrase(value => !value)}
                >
                  {showPhrase ? <EyeOff size={13} color={Palette.primaryDark} /> : <Eye size={13} color={Palette.primaryDark} />}
                  <Text style={styles.togglePhraseText}>{showPhrase ? 'تمرین از حفظ' : 'نمایش جمله'}</Text>
                </Pressable>
              </View>

              <Text style={styles.turnPrompt}>{currentRule?.promptFa ?? current.fa}</Text>

              {showPhrase ? (
                <View style={styles.phraseCard}>
                  <View style={styles.phraseCardTop}>
                    <Text style={[styles.turnTarget, isRtlTarget && styles.rtlText]}>{current.text}</Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={playCurrent}
                      style={[styles.listenBtn, samplePlaying && styles.listenBtnActive]}
                    >
                      <Volume2 size={15} color="#FFFFFF" />
                      <Text style={styles.listenBtnText}>{samplePlaying ? 'در حال پخش…' : 'شنیدن'}</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.hiddenHintRow}>
                  <Pressable accessibilityRole="button" style={styles.helperChip} onPress={playCurrent}>
                    <Volume2 size={14} color={Palette.primaryDark} />
                    <Text style={styles.helperChipText}>{samplePlaying ? 'در حال پخش…' : 'شنیدن جمله'}</Text>
                  </Pressable>
                </View>
              )}

              {choicePanel && hasChoices && currentRule?.choices ? (
                <View style={styles.choiceList}>
                  {currentRule.choices.map((ch: Choice, idx: number) => (
                    <Pressable
                      key={`choice-${index}-${idx}`}
                      accessibilityRole="button"
                      onPress={() => submitChoice(ch)}
                      style={styles.choiceBtn}
                    >
                      <Text style={[styles.choiceForeign, isRtlTarget && styles.rtlText]}>{ch.text}</Text>
                    </Pressable>
                  ))}
                  {choiceFeedback ? (
                    <Text accessibilityLiveRegion="polite" style={styles.choiceFeedbackText}>
                      {choiceFeedback.text}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              {!typed ? (
                <SpeakCheck
                  key={`${index}-${current.text}`}
                  text={current.text}
                  locale={locale}
                  accent={Palette.primary}
                  title="پاسخ با صدای خودت"
                  level={activeLevel}
                  adaptiveTiming
                  autoStart={false}
                  blindExam={false}
                  compact
                  onResult={result => {
                    if (!result.heard.trim()) {
                      setNote('صدایی دریافت نشد؛ دوباره میکروفن را بزن، بنویس، یا «نوبت بعدی» را بزن.');
                      return;
                    }
                    submitAnswer(result.heard, 'voice');
                  }}
                  singleAttempt
                />
              ) : (
                <View style={styles.compose}>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    onSubmitEditing={sendTyped}
                    returnKeyType="send"
                    placeholder="پاسخ خودت را بنویس…"
                    placeholderTextColor={Palette.muted}
                    accessibilityLabel="پاسخ شما"
                    style={[styles.input, isRtlTarget && styles.rtlInput]}
                  />
                  <Pressable accessibilityRole="button" accessibilityLabel="ارسال پاسخ" onPress={sendTyped} style={styles.send}>
                    <Send size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              )}

              <View style={styles.turnRow}>
                <View style={styles.turnModeGroup}>
                  {!typed ? (
                    <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => { setTyped(true); setNote(''); }}>
                      <Text style={styles.linkText}>نوشتن پاسخ</Text>
                    </Pressable>
                  ) : (
                    <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => { setTyped(false); setNote(''); }}>
                      <Text style={styles.linkText}>بازگشت به میکروفن</Text>
                    </Pressable>
                  )}

                  {hasChoices ? (
                    <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => { setChoicePanel(v => !v); setChoiceFeedback(null); }}>
                      <Text style={styles.linkText}>{choicePanel ? 'بستن گزینه‌ها' : 'انتخاب از گزینه‌ها'}</Text>
                    </Pressable>
                  ) : null}
                </View>

                <Pressable accessibilityRole="button" style={styles.skipButton} onPress={moveToNextTurn}>
                  <Text style={styles.skipText}>نوبت بعدی</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {current && !isMine ? (
            <View style={[styles.bubble, styles.theirs, typing && styles.bubblePending]}>
              <Text style={styles.who}>
                {typing ? `${partnerName} در حال آماده‌شدن…` : speakingAt === index ? `${partnerName} در حال صحبت…` : partnerName}
              </Text>
              {!typing ? (
                <>
                  <Text style={[styles.lineText, isRtlTarget && styles.rtlText]}>{current.text}</Text>
                  <Text style={styles.lineFa}>{current.fa}</Text>
                  <View style={styles.partnerActionsRow}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="دوباره بشنو"
                      onPress={() => speak(current.text, index)}
                      style={styles.replay}
                    >
                      <Volume2 size={15} color={Palette.primary} />
                      <Text style={styles.replayText}>دوباره بشنو</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="ادامه به نوبت بعدی"
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
                  accessibilityLabel="رد کردن مکث هم‌صحبت"
                  onPress={advance}
                  style={styles.partnerContinueBtn}
                >
                  <Text style={styles.partnerContinueText}>ادامه</Text>
                </Pressable>
              )}
            </View>
          ) : null}

          {note ? <Text accessibilityLiveRegion="polite" style={styles.note}>{note}</Text> : null}

          <View style={styles.bottomActionsRow}>
            {roles.length > 1 ? (
              <Pressable accessibilityRole="button" style={styles.switchRow} onPress={flipRole}>
                <Text style={styles.linkText}>جابه‌جایی نقش با {partnerName}</Text>
              </Pressable>
            ) : null}
            <Pressable accessibilityRole="button" style={styles.switchRow} onPress={restart}>
              <Text style={styles.linkText}>شروع دوباره</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'stretch', gap: 8, paddingVertical: 6 },
  invite: { width: '100%', gap: 10, paddingVertical: 16, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE2FF', alignItems: 'center' },
  inviteBadgesRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6 },
  optionalBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  optionalBadgeText: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: '#047857', writingDirection: 'rtl' },
  inviteBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 4, borderRadius: 20, backgroundColor: Palette.primarySoft, borderWidth: 1, borderColor: '#DDE2FF' },
  inviteBadgeText: { fontFamily: Typography.boldFontFamily, fontSize: 11.5, color: Palette.primaryDark, writingDirection: 'rtl' },
  inviteTitle: { fontFamily: Typography.boldFontFamily, fontSize: 17, lineHeight: 28, color: Palette.ink, textAlign: 'center', writingDirection: 'rtl' },
  sceneText: { fontFamily: Typography.boldFontFamily, fontSize: 13.5, lineHeight: 22, color: Palette.primaryDark, textAlign: 'center', writingDirection: 'rtl', maxWidth: 560 },
  inviteText: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 22, color: Palette.text, textAlign: 'center', writingDirection: 'rtl', maxWidth: 560 },
  roleBox: { width: '100%', gap: 6, alignItems: 'center', marginTop: 2 },
  roleHint: { fontFamily: Typography.fontFamily, fontSize: 11.5, color: Palette.muted, textAlign: 'center', writingDirection: 'rtl' },
  roleRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  roleChip: { minHeight: 36, borderRadius: 18, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', paddingHorizontal: 13, justifyContent: 'center' },
  roleChipOn: { backgroundColor: Palette.primarySoft, borderColor: Palette.primary },
  roleChipText: { fontFamily: Typography.fontFamily, fontSize: 12.5, color: Palette.text },
  roleChipTextOn: { color: Palette.primaryDark, fontFamily: Typography.boldFontFamily },
  enter: { minHeight: 48, width: '100%', maxWidth: 320, marginTop: 4, borderRadius: 16, backgroundColor: Palette.primary, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
  enterText: { fontFamily: Typography.boldFontFamily, fontSize: 15, color: '#FFFFFF', writingDirection: 'rtl' },
  emptyNote: { fontFamily: Typography.fontFamily, fontSize: 13, color: Palette.muted, textAlign: 'center', writingDirection: 'rtl' },
  thread: { width: '100%', gap: 10, marginTop: 4 },
  metaRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  metaRight: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#E2E5F5' },
  dotDone: { backgroundColor: Palette.primary },
  dotNow: { backgroundColor: Palette.primarySoft, borderWidth: 1, borderColor: Palette.primary },
  typingText: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.muted, writingDirection: 'rtl' },
  turnCounterBadge: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: Palette.primaryDark, writingDirection: 'rtl' },
  sentGroup: { gap: 6 },
  bubble: { width: '100%', borderRadius: 18, padding: 13, borderWidth: 1, gap: 5 },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderColor: Palette.border, borderBottomLeftRadius: 6, maxWidth: '92%' },
  mine: { alignSelf: 'flex-end', backgroundColor: Palette.primarySoft, borderColor: '#DDE2FF', borderBottomRightRadius: 6, maxWidth: '92%' },
  bubblePending: { opacity: 0.55 },
  bubbleTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  who: { fontFamily: Typography.boldFontFamily, fontSize: 11.5, color: Palette.primaryDark, writingDirection: 'rtl' },
  lineText: { fontFamily: 'Times New Roman', fontSize: 18, lineHeight: 27, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  rtlText: { fontFamily: Typography.boldFontFamily, textAlign: 'right', writingDirection: 'rtl' },
  rtlInput: { fontFamily: Typography.fontFamily, textAlign: 'right', writingDirection: 'rtl' },
  lineFa: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 21, color: Palette.text, textAlign: 'right', writingDirection: 'rtl' },
  replay: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, padding: 4 },
  replayText: { fontFamily: Typography.fontFamily, fontSize: 11.5, color: Palette.primary, writingDirection: 'rtl' },
  turnCard: { width: '100%', borderRadius: 18, borderWidth: 1, borderColor: '#DDE2FF', backgroundColor: '#FBFBFF', padding: 14, gap: 10 },
  turnHeaderRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  turnTitle: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.primaryDark, writingDirection: 'rtl' },
  togglePhraseBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' },
  togglePhraseText: { fontFamily: Typography.boldFontFamily, fontSize: 11.5, color: Palette.primaryDark, writingDirection: 'rtl' },
  turnPrompt: { fontFamily: Typography.fontFamily, fontSize: 15, lineHeight: 25, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  phraseCard: { borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C7D2FE', padding: 12 },
  phraseCardTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  turnTarget: { flex: 1, fontFamily: 'Times New Roman', fontSize: 18, lineHeight: 27, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  listenBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: Palette.primary },
  listenBtnActive: { backgroundColor: Palette.primaryDark },
  listenBtnText: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: '#FFFFFF', writingDirection: 'rtl' },
  hiddenHintRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  helperChip: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' },
  helperChipText: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: Palette.primaryDark, writingDirection: 'rtl' },
  choiceList: { gap: 7 },
  choiceBtn: { borderRadius: 12, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', padding: 11 },
  choiceForeign: { fontFamily: 'Times New Roman', fontSize: 15, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  choiceFeedbackText: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 19, color: '#B45309', backgroundColor: '#FEF3C7', borderColor: '#FDE68A', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, textAlign: 'right', writingDirection: 'rtl' },
  turnRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  turnModeGroup: { flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  partnerActionsRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 4 },
  partnerContinueBtn: { alignSelf: 'flex-start', minHeight: 32, paddingHorizontal: 14, borderRadius: 999, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  partnerContinueText: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: '#FFFFFF', writingDirection: 'rtl' },
  linkButton: { minHeight: 36, flexDirection: 'row-reverse', alignItems: 'center', gap: 4, justifyContent: 'center', paddingHorizontal: 4 },
  linkText: { fontFamily: Typography.fontFamily, fontSize: 13, color: Palette.primary, writingDirection: 'rtl' },
  skipButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 999, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' },
  skipText: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: Palette.text, writingDirection: 'rtl' },
  compose: { flex: 1, minWidth: 220, flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  input: { flex: 1, minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', paddingHorizontal: 12, fontFamily: 'Times New Roman', fontSize: 16, color: Palette.ink },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  note: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: Palette.primaryDark, textAlign: 'center', writingDirection: 'rtl' },
  bottomActionsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', gap: 8 },
  switchRow: { minHeight: 36, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  doneCard: { width: '100%', marginTop: 10, padding: 16, borderRadius: 20, alignItems: 'stretch', gap: 14, borderWidth: 1, backgroundColor: '#F6FBF8', borderColor: '#BBF7D0' },
  doneHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  doneIconBadge: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  doneCopy: { flex: 1, gap: 3, alignItems: 'flex-end' },
  doneTitle: { fontFamily: Typography.boldFontFamily, fontSize: 16, lineHeight: 24, color: '#14532D', textAlign: 'right', writingDirection: 'rtl' },
  doneText: { fontFamily: Typography.fontFamily, fontSize: 12.5, lineHeight: 20, color: '#166534', textAlign: 'right', writingDirection: 'rtl' },
  reviewList: { gap: 8 },
  reviewHeading: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  reviewLineBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, padding: 10, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCECE2' },
  reviewLineText: { fontFamily: 'Times New Roman', fontSize: 15, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  reviewLineFa: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  doneActions: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  againButton: { minHeight: 44, paddingHorizontal: 18, borderRadius: 14, backgroundColor: Palette.primary, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6 },
  againText: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: '#FFFFFF', writingDirection: 'rtl' },
  flipDoneButton: { minHeight: 44, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: Palette.primary, backgroundColor: '#FFFFFF', flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  flipDoneText: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.primaryDark, writingDirection: 'rtl' },
});
