import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { Award, Check, CheckCircle2, Mic2, RefreshCw, Send, Sparkles, Trophy, Volume2 } from 'lucide-react-native';
import SpeakCheck from '@/components/SpeakCheck';
// Both text and input go through the localized wrappers, or the Persian digits and the script-aware
// font/direction policy would be missing from this screen.
import { LocalizedText as Text, LocalizedTextInput as TextInput } from '@/components/LocalizedText';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';
import { Typography } from '@/lib/theme';
import { toPersianDigits as fa } from '@/lib/format';
import { normalizeLessonConversation, type LessonConversationSession } from '@/lib/lessonConversation';
import { evaluateSemanticResponse, type BranchingConversation } from '@/lib/branchingConversation';
import { scoreSpeech } from '@/lib/speechScore';

type ChatLine = { who: string; role?: 'learner' | 'partner'; text: string; fa: string };
type TurnReport = {
  index: number;
  promptFa: string;
  expected: string;
  heard: string;
  score: number;
  method: 'voice' | 'typed';
  feedback: string;
};
type Props = {
  /** The lesson's own dialogue, with its real speaker roles. This is what makes it a conversation. */
  dialogue: ReadonlyArray<{ speaker: string; role?: 'learner' | 'partner'; text: string; fa: string }>;
  /** Only for a lesson without dialogue data: its sentences become the script, read by the partner first. */
  fallback?: ReadonlyArray<{ text: string; fa: string }>;
  locale: 'en-US' | 'ru-RU';
  onSpeak: (text: string, onDone: () => void) => void;
  onStop?: () => void;
  lessonId: string;
  situation?: string;
  partnerRole?: string;
  initialSession?: LessonConversationSession;
  onSessionChange?: (session: LessonConversationSession) => void;
  /** Optional level-aware semantic/branching practice. Omitted lessons keep exact-line rehearsal. */
  semanticPractice?: BranchingConversation | null;
};

/** How long the other person appears to type before their bubble lands. Short, but it kills the “card flip” feel. */
const TYPING_MS = 620;
const LEARNER_LABELS = new Set(['learner', 'شما', 'زبان‌آموز', 'زبانآموز']);

/** Named roles («مریم»، «پزشک») carry no learner marker; then the learner takes the first role and can flip it. */
const learnerRoleOf = (lines: ChatLine[]) => lines.find(line => line.role === 'learner')?.who
  ?? lines.find(line => LEARNER_LABELS.has(line.who))?.who
  ?? null;
const nameOf = (who: string) => (who === 'partner' ? 'هم‌صحبت' : who === 'learner' ? 'شما' : who);

/**
 * The lesson conversation room.
 *
 * Every line of the lesson's own dialogue becomes one chat turn, in the role the lesson gives it: the other
 * person types, speaks, and waits; the learner answers aloud (or by typing, when there is no microphone), and
 * their line lands in the thread only once it was actually said. Nothing is graded here and nothing is
 * required to finish the lesson — a learner who cannot speak still reads the whole exchange and leaves.
 */
function evaluateRoomSummary(reports: readonly TurnReport[]) {
  if (!reports.length) {
    return {
      overall: 100,
      accuracy: 100,
      participation: 100,
      fluency: 100,
      xp: 35,
      answeredCount: 0,
      rankTitle: 'مکالمهٔ کامل و موفق',
      rankSubtitle: 'کل گفت‌وگو را با موفقیت به پایان رساندید و با جریان واقعی جمله‌ها همراه شدید.',
      advice: 'برای تسلط بیشتر، می‌توانید جای نقش‌ها را عوض کنید و همین سناریو را از دید طرف مقابل تمرین کنید.',
    };
  }
  const accuracy = Math.round(reports.reduce((sum, item) => sum + item.score, 0) / reports.length);
  const answeredCount = reports.filter(item => item.heard.trim().length > 0).length;
  const participation = Math.round((answeredCount / reports.length) * 100);
  const fluencyRaw = reports.reduce((sum, item) => {
    const voiceBonus = item.heard.trim() && item.method === 'voice' ? 14 : 0;
    return sum + Math.min(100, item.score + voiceBonus);
  }, 0);
  const fluency = Math.round(fluencyRaw / reports.length);
  const overall = Math.min(100, Math.round(accuracy * 0.5 + participation * 0.25 + fluency * 0.25));
  const turnXp = reports.reduce((sum, item) => {
    if (!item.heard.trim()) return sum + 4;
    if (item.score >= 85) return sum + 25;
    if (item.score >= 70) return sum + 20;
    if (item.score >= 40) return sum + 12;
    return sum + 6;
  }, 0);
  const xp = turnXp + 30;
  const rankTitle = overall >= 85
    ? 'مکالمهٔ مسلط و طبیعی'
    : overall >= 70
      ? 'مکالمهٔ موفق و کاربردی'
      : 'مسیر مکالمه کامل شد';
  const rankSubtitle = overall >= 85
    ? 'یک گفت‌وگوی واقعی را با دقت و روانی عالی پیش بردید؛ در موقعیت واقعی کاملاً آماده هستید.'
    : overall >= 70
      ? 'منظور پیام‌ها را به‌خوبی منتقل کردید و یک تمرین واقعی ارزشمند انجام دادید.'
      : 'شما کل سناریو را تا انتها تجربه کردید؛ با مرور نوبت‌های علامت‌دار در دور بعد کاملاً مسلط می‌شوید.';
  const weak = reports.filter(item => item.score < 70);
  const advice = !weak.length
    ? 'تمام نوبت‌ها را با تسلط انجام دادید. پیشنهاد می‌شود یک بار هم با جابه‌جایی نقش تمرین کنید.'
    : `روی ${fa(weak.length)} نوبت با امتیاز زیر ۷۰٪ تمرکز کنید؛ جمله‌های پیشنهادی زیر الگوهای طبیعی‌تری به شما می‌دهند.`;
  return { overall, accuracy, participation, fluency, xp, answeredCount, rankTitle, rankSubtitle, advice };
}

export default function LessonConversationRoom({ dialogue, fallback, locale, onSpeak, onStop, lessonId, situation, partnerRole, initialSession, onSessionChange, semanticPractice }: Props) {
  const lines = useMemo<ChatLine[]>(() => {
    const real = dialogue.filter(line => line.text.trim());
    if (real.length) {
      const base = real.map(line => ({ who: line.speaker, role: line.role, text: line.text, fa: line.fa }));
      // Enrich short dialogues (< 6 lines) with unused lesson sentences so every room feels like a rich 6-turn exchange.
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
    // No role data: the partner opens, the learner answers, so the thread still reads as an exchange.
    return scripted.map((line, index) => ({ who: index % 2 === 0 ? 'partner' : 'learner', role: index % 2 === 0 ? 'partner' as const : 'learner' as const, text: line.text, fa: line.fa }));
  }, [dialogue, fallback]);

  const [branchReplies, setBranchReplies] = useState<Record<number, { text: string; fa: string }>>({});
  const displayLines = useMemo<ChatLine[]>(() => lines.map((line, lineIndex) => branchReplies[lineIndex] ? { ...line, ...branchReplies[lineIndex] } : line), [branchReplies, lines]);

  const roles = useMemo(() => [...new Set(lines.map(line => line.who))], [lines]);
  const declared = learnerRoleOf(lines);
  const [myRole, setMyRole] = useState<string | null>(declared ?? roles[0] ?? null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const [speakingAt, setSpeakingAt] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [typed, setTyped] = useState(false);
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');
  const [turnScore, setTurnScore] = useState<number | null>(null);
  const [turnReviewed, setTurnReviewed] = useState(false);
  const [pendingReply, setPendingReply] = useState<{ text: string; fa: string } | undefined>();
  const [reports, setReports] = useState<TurnReport[]>([]);
  const [hintOpen, setHintOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spokenFor = useRef<number | null>(null);

  const current = displayLines[index];
  const currentRule = semanticPractice?.turns[index];
  const isMine = !!current && !!myRole && current.who === myRole;
  const finished = open && index >= lines.length;
  const sent = useMemo(() => displayLines.slice(0, Math.min(index, displayLines.length)), [displayLines, index]);
  // The other person's name, for the typing line: the first speaker that is not the learner.
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
    setDraft('');
    setNote('');
    setTurnScore(null);
    setTurnReviewed(false);
    setPendingReply(undefined);
    setReports([]);
    setHintOpen(false);
    setHydrated(true);
  // A lesson mounts once per route. Do not rehydrate from the parent's changing save object.
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
    // Some native engines never deliver `end`. The line has to leave the screen anyway: a conversation that
    // waits forever on one utterance is worse than one that moves on after a fair reading time.
    clearStall();
    stall.current = setTimeout(() => { setSpeakingAt(current => (current === at ? null : current)); onEnd?.(); }, 2200 + Math.min(6000, text.length * 110));
    let settled = false;
    onSpeak(text, () => {
      if (settled) return;
      settled = true;
      clearStall();
      setSpeakingAt(current => (current === at ? null : current));
      onEnd?.();
    });
  }, [clearStall, onSpeak]);

  const advance = useCallback(() => {
    clearStall();
    setAttempts(0); setRevealed(false); setDraft(''); setNote(''); setHintOpen(false); setTurnScore(null); setTurnReviewed(false); setPendingReply(undefined);
    setIndex(value => value + 1);
  }, [clearStall]);

  const linesRef = useRef(lines); linesRef.current = lines;
  const indexRef = useRef(index); indexRef.current = index;

  // The partner's turn: a beat of «typing», then the line lands in the thread and is read aloud; when they
  // have finished, the reply slot opens by itself.
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

  // One owner for the partner's turn, so a re-render can never speak the same line twice.
  useEffect(() => {
    if (!open || !current || isMine) return;
    if (typing || spokenFor.current === index) return;
    showPartner(index);
  }, [current, index, isMine, open, showPartner, typing]);

  // After the learner's line, the partner answers — same beat, same voice, no button to press.
  const succeed = (reply?: { text: string; fa: string }) => {
    if (reply && index + 1 < lines.length) setBranchReplies(value => ({ ...value, [index + 1]: reply }));
    advance();
  };

  const fail = (message: string) => {
    setAttempts(value => value + 1);
    setNote(message);
    if (attempts >= 1) setRevealed(true); // after two tries, show the line: a nudge, never a wall
  };

  const submitAnswer = (answer: string, method: 'voice' | 'typed' = 'typed') => {
    if (!current || turnReviewed) return;
    const promptFa = semanticPractice?.turns[index]?.promptFa ?? current.fa;
    if (currentRule) {
      const semantic = evaluateSemanticResponse(currentRule, answer, locale, semanticPractice?.level ?? 'A1');
      setReports(value => [...value, { index, promptFa, expected: current.text, heard: answer, score: semantic.score, method, feedback: semantic.feedback }]);
      setDraft(''); setNote(''); setPendingReply(semantic.accepted ? semantic.branchReply : undefined); setTurnReviewed(true); succeed(semantic.accepted ? semantic.branchReply : undefined);
      return;
    }
    // This room is a conversation rehearsal, not a second pronunciation exam.
    // Once the learner has made one attempt, the turn advances; pronunciation
    // feedback belongs to the speaking stage immediately before this room.
    const scored = scoreSpeech(current.text, answer);
    const feedback = !answer.trim()
      ? 'در این نوبت پاسخی ثبت نشد؛ یک بار با صدای بلند یا نوشتن امتحان کن.'
      : scored.score >= 85
        ? 'بسیار طبیعی و دقیق! کاملاً قابل فهم بود.'
        : scored.score >= 70
          ? 'منظور پیام به‌خوبی منتقل شد؛ تنها چند جزئیات ریز جای بهتر شدن دارد.'
          : 'تلاش خوبی بود؛ شکل کامل‌تر جملهٔ پیشنهادی را مرور کن.';
    setReports(value => [...value, { index, promptFa, expected: current.text, heard: answer, score: scored.score, method, feedback }]);
    setDraft(''); setNote(''); setTurnReviewed(true); succeed();
  };

  // Asked from the learner's own tap, so both the browser and native permission prompt are user-initiated.
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
    setIndex(0); setAttempts(0); setRevealed(false); setTyping(false); setSpeakingAt(null); setDraft(''); setNote(''); setReports([]); setTurnReviewed(false); setTurnScore(null);
  };

  const flipRole = () => {
    const other = roles.find(role => role !== myRole);
    if (!other) return;
    setMyRole(other);
    restart();
  };

  const sendTyped = () => {
    if (!current) return;
    submitAnswer(draft, 'typed');
  };

  const summary = useMemo(() => evaluateRoomSummary(reports), [reports]);

  if (!lines.length) {
    return <View style={styles.wrap}><Text style={styles.emptyNote}>برای این درس گفت‌وگویی ثبت نشده است.</Text></View>;
  }

  return (
    <View style={styles.wrap}>
      {!open ? (
        <View style={styles.invite}>
          <View style={styles.inviteBadge}><Sparkles size={14} color={Palette.primary} /><Text style={styles.inviteBadgeText}>شبیه‌سازی موقعیت واقعی · {fa(lines.length)} نوبت</Text></View>
          <Text style={styles.inviteTitle}>یک گفت‌وگوی واقعی با {partnerName}</Text>
          {situation ? <Text style={styles.sceneText}>{situation}</Text> : null}
          <Text style={styles.inviteText}>تو صحبت می‌کنی؛ {partnerRole || partnerName} به حرفت واکنش نشان می‌دهد. در پایان، گزارش کامل مکالمه و امتیاز عملکردت ثبت می‌شود.</Text>
          {roles.length > 1 ? (
            <View style={styles.roleRow}>
              {roles.map(role => <Pressable key={role} accessibilityRole="button" accessibilityState={{ selected: role === myRole }} onPress={() => { setMyRole(role); restart(); }} style={[styles.roleChip, role === myRole && styles.roleChipOn]}><Text style={[styles.roleChipText, role === myRole && styles.roleChipTextOn]}>{nameOf(role)}</Text></Pressable>)}
            </View>
          ) : null}
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: starting }} disabled={starting} style={styles.enter} onPress={() => void begin()}>
            <Mic2 size={18} color="#FFFFFF" /><Text style={styles.enterText}>ورود به گفت‌وگو</Text>
          </Pressable>
          {starting ? <ActivityIndicator color={Palette.primary} /> : null}
        </View>
      ) : finished ? (
        <View style={styles.doneCard}>
          <View style={styles.heroBanner}>
            <View style={styles.trophyBadge}><Trophy size={24} color="#FFFFFF" /></View>
            <View style={styles.heroCopy}>
              <View style={styles.xpPill}><Award size={13} color={Palette.primary} /><Text style={styles.xpPillText}>+{fa(summary.xp)} امتیاز مکالمه</Text></View>
              <Text style={styles.doneTitle}>{summary.rankTitle} ✓</Text>
              <Text style={styles.doneText}>{summary.rankSubtitle}</Text>
            </View>
            <View style={styles.overallCircle}>
              <Text style={styles.overallValue}>{fa(summary.overall)}٪</Text>
              <Text style={styles.overallLabel}>ارزیابی کل</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{fa(summary.accuracy)}٪</Text>
              <Text style={styles.metricLabel}>دقت معنا</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{fa(summary.participation)}٪</Text>
              <Text style={styles.metricLabel}>مشارکت فعال</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>{fa(summary.fluency)}٪</Text>
              <Text style={styles.metricLabel}>روانی بیان</Text>
            </View>
          </View>

          <Text style={styles.finalHint}>{fa(lines.length)} نوبت با {partnerName} انجام شد ({fa(summary.answeredCount)} پاسخ فعال). {summary.advice}</Text>

          {reports.length ? (
            <View style={styles.reviewList}>
              <Text style={styles.reviewHeading}>کارنامهٔ نوبت به نوبت</Text>
              {reports.map(item => {
                const tier = item.score >= 85 ? 'عالی' : item.score >= 70 ? 'موفق' : 'قابل بهبود';
                const tierColor = item.score >= 85 ? Palette.success : item.score >= 70 ? Palette.primary : '#D97706';
                return (
                  <View key={`report-${item.index}`} style={styles.reviewItem}>
                    <View style={styles.reviewTop}>
                      <View style={styles.reviewTurnWrap}>
                        <CheckCircle2 size={14} color={tierColor} />
                        <Text style={styles.reviewTurn}>نوبت {fa(item.index + 1)} · {item.method === 'voice' ? 'گفتاری' : 'نوشتاری'}</Text>
                      </View>
                      <View style={[styles.scoreTag, { borderColor: tierColor }]}>
                        <Text style={[styles.scoreTagText, { color: tierColor }]}>{tier} · {fa(item.score)}٪</Text>
                      </View>
                    </View>
                    {item.promptFa ? <Text style={styles.reviewPrompt}>{item.promptFa}</Text> : null}
                    <Text style={styles.reviewHeard}>پاسخ شما: {item.heard.trim() ? item.heard : '— (ثبت نشد)'}</Text>
                    <Text style={item.score >= 70 ? styles.successLine : styles.errorLine}>{item.feedback}</Text>
                    {item.score < 85 ? <Text style={styles.reviewExpected}>پیشنهاد طبیعی‌تر: {item.expected}</Text> : null}
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

          {sent.map((line, at) => (
            <View key={`sent-${at}-${line.text}`} style={[styles.bubble, line.who === myRole ? styles.mine : styles.theirs]}>
              <View style={styles.bubbleTop}>
                <Text style={styles.who}>{nameOf(line.who)}</Text>
                {line.who === myRole ? <Check size={14} color={Palette.success} /> : (
                  <Pressable accessibilityRole="button" accessibilityLabel={`شنیدنِ خط ${fa(at + 1)}`} onPress={() => speak(line.text, at)} style={styles.replay}><Volume2 size={15} color={Palette.primary} /></Pressable>
                )}
              </View>
              <Text style={styles.lineText}>{line.text}</Text>
              {line.fa ? <Text style={styles.lineFa}>{line.fa}</Text> : null}
            </View>
          ))}

          {current && isMine ? (
            <View style={styles.turnCard}>
              <Text style={styles.turnTitle}>نوبت توست · خودت جواب بده</Text>
              <Text style={styles.turnPrompt}>{semanticPractice?.turns[index]?.promptFa ?? current.fa}</Text>
              {revealed ? <Text style={styles.turnTarget}>{current.text}</Text> : hintOpen ? <Text style={styles.turnHint}>{current.text.split(/\s+/).slice(0, Math.max(1, Math.ceil(current.text.split(/\s+/).length / 2))).join(' ')} …</Text> : <Text style={styles.turnHint}>هر پاسخی که منظورت را می‌رساند بگو.</Text>}
              {!typed ? (
                <SpeakCheck key={`${index}-${attempts}-${current.text}`} text={current.text} locale={locale} accent={Palette.primary} title="بگو" autoStart onResult={result => {
                  if (currentRule) { submitAnswer(result.heard, 'voice'); return; }
                  const promptFa = semanticPractice?.turns[index]?.promptFa ?? current.fa;
                  const feedback = !result.heard.trim()
                    ? 'در این نوبت صدایی دریافت نشد؛ در دور بعد واضح‌تر و نزدیک‌تر به میکروفن بگو.'
                    : result.score >= 85
                      ? 'بسیار طبیعی و دقیق! کاملاً قابل فهم بود.'
                      : result.score >= 70
                        ? 'منظور پیام به‌خوبی منتقل شد؛ تنها چند جزئیات ریز جای بهتر شدن دارد.'
                        : 'تلاش خوبی بود؛ شکل کامل‌تر جملهٔ پیشنهادی را مرور کن.';
                  setReports(value => [...value, { index, promptFa, expected: current.text, heard: result.heard, score: result.score, method: 'voice', feedback }]);
                  setTurnReviewed(true); setNote(''); succeed();
                }} singleAttempt />
              ) : null}
              <View style={styles.turnRow}>
                {!typed ? (
                  <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => { setTyped(true); setNote(''); }}><Text style={styles.linkText}>با نوشتن</Text></Pressable>
                ) : (
                  <View style={styles.compose}>
                    <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={sendTyped} returnKeyType="send" placeholder={revealed ? current.text : 'پاسخت را بنویس'} placeholderTextColor={Palette.muted} accessibilityLabel="پاسخ شما" style={styles.input} />
                    <Pressable accessibilityRole="button" onPress={sendTyped} style={styles.send}><Send size={16} color="#FFFFFF" /></Pressable>
                  </View>
                )}
                {!revealed ? <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => setHintOpen(true)}><Text style={styles.linkText}>راهنما</Text></Pressable> : null}
                {!revealed && hintOpen ? <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => setRevealed(true)}><Text style={styles.linkText}>نمایش پاسخ</Text></Pressable> : null}
                {revealed ? <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => succeed()}><Text style={styles.linkText}>گفتم؛ رد شو</Text></Pressable> : null}
                <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => { setTyped(false); setNote(''); }}><Text style={styles.linkText}>میکروفن</Text></Pressable>
              </View>
            </View>
          ) : null}

          {current && !isMine ? (
            <View style={[styles.bubble, styles.theirs, typing && styles.bubblePending]}>
              <Text style={styles.who}>{typing ? `${partnerName} در حال تایپ…` : speakingAt === index ? `${partnerName} در حال صحبت…` : partnerName}</Text>
              {!typing ? <><Text style={styles.lineText}>{current.text}</Text><Text style={styles.lineFa}>{current.fa}</Text><Pressable accessibilityRole="button" accessibilityLabel="دوباره بشنو" onPress={() => speak(current.text, index)} style={styles.replay}><Volume2 size={15} color={Palette.primary} /><Text style={styles.replayText}>دوباره بشنو</Text></Pressable></> : null}
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
  inviteText: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 23, color: Palette.text, textAlign: 'center', writingDirection: 'rtl', maxWidth: 520 },
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
  bubble: { width: '100%', borderRadius: 20, padding: 14, borderWidth: 1, gap: 5 },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderColor: Palette.border, borderBottomLeftRadius: 6, maxWidth: '92%' },
  mine: { alignSelf: 'flex-end', backgroundColor: Palette.primarySoft, borderColor: '#DDE2FF', borderBottomRightRadius: 6, maxWidth: '92%' },
  bubblePending: { opacity: 0.5 },
  bubbleTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  who: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.primaryDark, writingDirection: 'rtl' },
  lineText: { fontFamily: 'Times New Roman', fontSize: 18, lineHeight: 28, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  lineFa: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 22, color: Palette.text, textAlign: 'right', writingDirection: 'rtl' },
  replay: { padding: 4 },
  replayText: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.primary, writingDirection: 'rtl' },
  turnCard: { width: '100%', borderRadius: 20, borderWidth: 1, borderColor: '#DDE2FF', backgroundColor: '#FBFBFF', padding: 14, gap: 8 },
  turnTitle: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.primaryDark, writingDirection: 'rtl' },
  turnPrompt: { fontFamily: Typography.fontFamily, fontSize: 15, lineHeight: 26, color: Palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  turnHint: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 21, color: Palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  turnTarget: { fontFamily: 'Times New Roman', fontSize: 17, lineHeight: 27, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  reviewCard: { borderRadius: 14, padding: 10, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', gap: 6 },
  reviewScore: { fontFamily: Typography.boldFontFamily, fontSize: 14, color: '#166534', textAlign: 'center', writingDirection: 'rtl' },
  reviewHint: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: '#166534', textAlign: 'center', writingDirection: 'rtl' },
  reviewActions: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 10 },
  continueButton: { minHeight: 40, borderRadius: 12, paddingHorizontal: 14, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  continueButtonText: { fontFamily: Typography.boldFontFamily, fontSize: 12, color: '#FFFFFF', writingDirection: 'rtl' },
  retryButton: { minHeight: 40, flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 6 },
  turnRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  linkButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 4 },
  linkText: { fontFamily: Typography.fontFamily, fontSize: 13, color: Palette.primary, writingDirection: 'rtl' },
  compose: { flex: 1, minWidth: 220, flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  input: { flex: 1, minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', paddingHorizontal: 12, fontFamily: 'Times New Roman', fontSize: 16, color: Palette.ink },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  note: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 21, color: '#B91C1C', textAlign: 'center', writingDirection: 'rtl' },
  switchRow: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  doneCard: { width: '100%', marginTop: 12, padding: 18, borderRadius: 22, alignItems: 'stretch', gap: 14, backgroundColor: '#F6FBF8', borderWidth: 1, borderColor: '#BBF7D0' },
  heroBanner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1FAE5' },
  trophyBadge: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1, gap: 4, alignItems: 'flex-end' },
  xpPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 12, backgroundColor: Palette.primarySoft },
  xpPillText: { fontFamily: Typography.boldFontFamily, fontSize: 11, color: Palette.primaryDark, writingDirection: 'rtl' },
  doneTitle: { fontFamily: Typography.boldFontFamily, fontSize: 16, lineHeight: 24, color: '#14532D', textAlign: 'right', writingDirection: 'rtl' },
  doneText: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: '#166534', textAlign: 'right', writingDirection: 'rtl' },
  overallCircle: { minWidth: 66, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 16, backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#86EFAC', alignItems: 'center', justifyContent: 'center' },
  overallValue: { fontFamily: Typography.boldFontFamily, fontSize: 18, color: '#14532D', writingDirection: 'rtl' },
  overallLabel: { fontFamily: Typography.fontFamily, fontSize: 10, color: '#166534', writingDirection: 'rtl' },
  metricsGrid: { flexDirection: 'row-reverse', gap: 8 },
  metricBox: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', gap: 2 },
  metricValue: { fontFamily: Typography.boldFontFamily, fontSize: 15, color: Palette.ink, writingDirection: 'rtl' },
  metricLabel: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.muted, writingDirection: 'rtl' },
  finalHint: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 21, color: '#166534', textAlign: 'right', writingDirection: 'rtl' },
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
  againButton: { minHeight: 44, paddingHorizontal: 18, borderRadius: 14, backgroundColor: '#166534', alignItems: 'center', justifyContent: 'center' },
  againText: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: '#FFFFFF', writingDirection: 'rtl' },
  flipDoneButton: { minHeight: 44, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: Palette.primary, backgroundColor: '#FFFFFF', flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  flipDoneText: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: Palette.primaryDark, writingDirection: 'rtl' },
});
