import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { Check, Mic2, Send, Volume2 } from 'lucide-react-native';
import SpeakCheck from '@/components/SpeakCheck';
// Both text and input go through the localized wrappers, or the Persian digits and the script-aware
// font/direction policy would be missing from this screen.
import { LocalizedText as Text, LocalizedTextInput as TextInput } from '@/components/LocalizedText';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';
import { Typography } from '@/lib/theme';
import { scoreSpeech } from '@/lib/speechScore';
import { toPersianDigits as fa } from '@/lib/format';

type ChatLine = { who: string; text: string; fa: string };
type Props = {
  /** The lesson's own dialogue, with its real speaker roles. This is what makes it a conversation. */
  dialogue: ReadonlyArray<{ speaker: string; text: string; fa: string }>;
  /** Only for a lesson without dialogue data: its sentences become the script, read by the partner first. */
  fallback?: ReadonlyArray<{ text: string; fa: string }>;
  locale: 'en-US' | 'ru-RU';
  onSpeak: (text: string, onDone: () => void) => void;
  onStop?: () => void;
};

/** A turn passes at the same bar the speaking test uses, so the two stages never disagree. */
const PASS = 70;
/** How long the other person appears to type before their bubble lands. Short, but it kills the “card flip” feel. */
const TYPING_MS = 620;
const LEARNER_LABELS = new Set(['learner', 'شما', 'زبان‌آموز', 'زبانآموز']);

/** Named roles («مریم»، «پزشک») carry no learner marker; then the learner takes the first role and can flip it. */
const learnerRoleOf = (lines: ChatLine[]) => lines.find(line => LEARNER_LABELS.has(line.who))?.who ?? null;
const nameOf = (who: string) => (who === 'partner' ? 'هم‌صحبت' : who === 'learner' ? 'شما' : who);

/**
 * The lesson conversation room.
 *
 * Every line of the lesson's own dialogue becomes one chat turn, in the role the lesson gives it: the other
 * person types, speaks, and waits; the learner answers aloud (or by typing, when there is no microphone), and
 * their line lands in the thread only once it was actually said. Nothing is graded here and nothing is
 * required to finish the lesson — a learner who cannot speak still reads the whole exchange and leaves.
 */
export default function LessonConversationRoom({ dialogue, fallback, locale, onSpeak, onStop }: Props) {
  const lines = useMemo<ChatLine[]>(() => {
    const real = dialogue.filter(line => line.text.trim());
    if (real.length) return real.map(line => ({ who: line.speaker, text: line.text, fa: line.fa }));
    const scripted = (fallback ?? []).filter(line => line.text.trim());
    // No role data: the partner opens, the learner answers, so the thread still reads as an exchange.
    return scripted.map((line, index) => ({ who: index % 2 === 0 ? 'partner' : 'learner', text: line.text, fa: line.fa }));
  }, [dialogue, fallback]);

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
  const [starting, setStarting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spokenFor = useRef<number | null>(null);

  const current = lines[index];
  const isMine = !!current && !!myRole && current.who === myRole;
  const finished = open && index >= lines.length;
  const sent = useMemo(() => lines.slice(0, Math.min(index, lines.length)), [index, lines]);
  // The other person's name, for the typing line: the first speaker that is not the learner.
  const partnerName = nameOf(lines.find(line => line.who !== myRole)?.who ?? 'partner');

  const stall = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const clearStall = () => { if (stall.current) { clearTimeout(stall.current); stall.current = null; } };
  useEffect(() => () => { clearTimer(); clearStall(); onStop?.(); }, [onStop]);
  useEffect(() => { if (declared) setMyRole(declared); else setMyRole(role => role ?? roles[0] ?? null); }, [declared, roles]);

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
    setAttempts(0); setRevealed(false); setDraft(''); setNote('');
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
  const succeed = () => advance();

  const fail = (message: string) => {
    setAttempts(value => value + 1);
    setNote(message);
    if (attempts >= 1) setRevealed(true); // after two tries, show the line: a nudge, never a wall
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
    setIndex(0); setAttempts(0); setRevealed(false); setTyping(false); setSpeakingAt(null); setDraft(''); setNote('');
  };

  const flipRole = () => {
    const other = roles.find(role => role !== myRole);
    if (!other) return;
    setMyRole(other);
    restart();
  };

  const sendTyped = () => {
    if (!current) return;
    const scored = scoreSpeech(current.text, draft);
    if (scored.score >= PASS) { setDraft(''); succeed(); return; }
    fail('چند واژه از جمله شنیده نشد؛ متنِ پاسخ را کامل‌تر بنویس.');
  };

  if (!lines.length) {
    return <View style={styles.wrap}><Text style={styles.emptyNote}>برای این درس گفت‌وگویی ثبت نشده است.</Text></View>;
  }

  return (
    <View style={styles.wrap}>
      {!open ? (
        <View style={styles.invite}>
          <Text style={styles.inviteTitle}>{fa(lines.length)} نوبت گفت‌وگو با {partnerName}</Text>
          <Text style={styles.inviteText}>خط‌هایِ خودِ همین درس، همان‌طور که بین دو نفر رد و بدل می‌شود. هرچه بشنوی کافی است؛ نوشتن هم می‌توانی.</Text>
          {roles.length > 1 && !declared ? (
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
          <Text style={styles.doneTitle}>گفت‌وگو تمام شد ✓</Text>
          <Text style={styles.doneText}>{fa(lines.length)} نوبت با {partnerName} رد و بدل کردی.</Text>
          <Pressable accessibilityRole="button" style={styles.againButton} onPress={restart}><Text style={styles.againText}>یک بار دیگر</Text></Pressable>
        </View>
      ) : (
        <View style={styles.thread}>
          <View style={styles.metaRow} accessibilityLiveRegion="polite">
            <View style={styles.dots}>{lines.map((line, dot) => <View key={`${line.text}-${dot}`} style={[styles.dot, dot < index && styles.dotDone, dot === index && styles.dotNow]} />)}</View>
            {typing ? <Text style={styles.typingText}>{partnerName} در حال تایپ…</Text> : null}
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
              <Text style={styles.turnTitle}>نوبت توست · به {partnerName} جواب بده</Text>
              <Text style={styles.turnPrompt}>{current.fa}</Text>
              {revealed ? <Text style={styles.turnTarget}>{current.text}</Text> : <Text style={styles.turnHint}>{attempts ? 'اول از حفظ بگو؛ اگر سخت بود «نمایش» را بزن.' : 'همان چیزی که در این موقعیت می‌گویی.'}</Text>}
              {!typed ? (
                <SpeakCheck key={`${index}-${attempts}-${current.text}`} text={current.text} locale={locale} accent={Palette.primary} title="بگو" autoStart onResult={result => { if (result.score >= PASS) { succeed(); return; } fail('واژه‌هایِ قرمز را واضح‌تر بگو و دوباره تلاش کن.'); }} />
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
                {!revealed ? <Pressable accessibilityRole="button" style={styles.linkButton} onPress={() => setRevealed(true)}><Text style={styles.linkText}>نمایش</Text></Pressable> : null}
                {revealed ? <Pressable accessibilityRole="button" style={styles.linkButton} onPress={succeed}><Text style={styles.linkText}>گفتم؛ رد شو</Text></Pressable> : null}
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
          {roles.length > 1 && !declared ? <Pressable accessibilityRole="button" style={styles.switchRow} onPress={flipRole}><Text style={styles.linkText}>جای من و {partnerName} را عوض کن</Text></Pressable> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'stretch', gap: 9, paddingVertical: 6 },
  invite: { width: '100%', gap: 10, paddingVertical: 14, alignItems: 'center' },
  inviteTitle: { fontFamily: Typography.boldFontFamily, fontSize: 18, lineHeight: 30, color: Palette.ink, textAlign: 'center', writingDirection: 'rtl' },
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
  turnRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  linkButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 4 },
  linkText: { fontFamily: Typography.fontFamily, fontSize: 13, color: Palette.primary, writingDirection: 'rtl' },
  compose: { flex: 1, minWidth: 220, flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  input: { flex: 1, minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: Palette.border, backgroundColor: '#FFFFFF', paddingHorizontal: 12, fontFamily: 'Times New Roman', fontSize: 16, color: Palette.ink },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: Palette.primary, alignItems: 'center', justifyContent: 'center' },
  note: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 21, color: '#B91C1C', textAlign: 'center', writingDirection: 'rtl' },
  switchRow: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  doneCard: { width: '100%', marginTop: 12, padding: 20, borderRadius: 18, alignItems: 'center', gap: 8, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' },
  doneTitle: { fontFamily: Typography.boldFontFamily, fontSize: 17, color: '#166534', textAlign: 'center', writingDirection: 'rtl' },
  doneText: { fontFamily: Typography.fontFamily, fontSize: 13, color: '#166534', textAlign: 'center', writingDirection: 'rtl' },
  againButton: { minHeight: 44, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1, borderColor: '#166534', alignItems: 'center', justifyContent: 'center' },
  againText: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: '#166534', writingDirection: 'rtl' },
});
