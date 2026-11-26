import { useIsFocused } from '@react-navigation/native';
import { isLanguageId } from '@/lib/languages/registry';
import { localDay } from '@/lib/reviewHistory';
import { addPracticeActivity } from '@/lib/practiceActivity';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { Typography } from '@/lib/theme';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform, Pressable, StyleSheet, View } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { Mic2, RefreshCw, Square, Volume2 } from 'lucide-react-native';
import * as Speech from '@/lib/courseSpeech';
import { toPersianDigits as fa } from '@/lib/format';
import { scoreSpeech, tokens, type SpeakCheckResult, type SpeakWordState } from '@/lib/speechScore';
import { computeSpeechTiming, type SpeechLevel } from '@/lib/speechTiming';
export { scoreSpeech, type SpeakCheckResult, type SpeakWordState };

function feedbackFor(score: number, nearCount = 0) {
  if (score >= 90) return 'عالی! همهٔ واژه‌ها واضح شنیده شد.';
  if (score >= 70) return 'خوب بود؛ قرمزها را دوباره بگویید.';
  if (score >= 40) return 'بخشی شنیده شد؛ آهسته‌تر و نزدیک‌تر به میکروفن تکرار کنید.';
  return 'واضح شنیده نشد؛ ابتدا نمونه را گوش دهید و دوباره بگویید.';
}

type Props = {
  text: string;
  locale: string;
  accent?: string;
  compact?: boolean;
  /** Large microphone control for the immersive conversation room. */
  roomMode?: boolean;
  title?: string;
  onResult?: (result: SpeakCheckResult) => void;
  onSkip?: () => void;
  /** Opens the microphone by itself once (used right after the app pronounced the word). */
  autoStart?: boolean;
  /** Conversation mode: report even an empty attempt instead of forcing another recording. */
  singleAttempt?: boolean;
  /** Learner CEFR level used to scale speaking and thinking-pause headroom (when adaptiveTiming is enabled). */
  level?: SpeechLevel;
  levelId?: number;
  /** Enable level/length-calibrated timing and countdown hint (used in the lesson dialogue stage). */
  adaptiveTiming?: boolean;
  /** Hide target words and missed-word hints (used during real oral exam mode). */
  blindExam?: boolean;
};

let micOwner: symbol | null = null;

/**
 * «بگو» — the learner says the sentence aloud; the device speech recogniser transcribes it and
 * each expected word is shown green (heard) or red (missed) together with a percentage.
 * Works on Android/iOS through the native recogniser and on web through the browser's Web Speech API.
 */
export default function SpeakCheck({ text, locale, accent = '#2563EB', compact = false, roomMode = false, title, onResult, onSkip, autoStart = false, singleAttempt = false, level, levelId, adaptiveTiming = false, blindExam = false }: Props) {
  const focused = useIsFocused();
  const focusedRef = useRef(focused); focusedRef.current = focused;
  const skipped = useRef(false);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const owner = useRef(Symbol('practice'));
  const generation = useRef(0);
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState('');
  const [result, setResult] = useState<SpeakCheckResult | null>(null);
  const [error, setError] = useState('');
  const timing = computeSpeechTiming({ text, level, levelId });
  const timingRef = useRef(timing);
  timingRef.current = timing;
  const finalRef = useRef('');
  const segmentsRef = useRef<string[]>([]);
  /** Last transcript of any kind; some Android recognisers end without ever flagging a result as final. */
  const lastHeardRef = useRef('');
  const settledRef = useRef(false);
  const stoppingByUser = useRef(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceFinishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxListenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emptyRetries = useRef(0);
  const busyRetries = useRef(0);
  const clientRetries = useRef(0);
  const targetRef = useRef(text);
  targetRef.current = text;
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const clearListenTimers = useCallback(() => {
    if (silenceFinishTimer.current) {
      clearTimeout(silenceFinishTimer.current);
      silenceFinishTimer.current = null;
    }
    if (maxListenTimer.current) {
      clearTimeout(maxListenTimer.current);
      maxListenTimer.current = null;
    }
  }, []);

  useEffect(() => {
    skipped.current = false;
    setResult(null);
    setPartial('');
    setError('');
    finalRef.current = '';
    segmentsRef.current = [];
    lastHeardRef.current = '';
    settledRef.current = false;
    emptyRetries.current = 0;
    busyRetries.current = 0;
    clientRetries.current = 0;
  }, [text]);
  const cancelAttempt = useCallback(() => {
    generation.current++;
    settledRef.current = true;
    clearListenTimers();
    if (autoTimer.current) clearTimeout(autoTimer.current);
    if (retryTimer.current) clearTimeout(retryTimer.current);
    autoTimer.current = retryTimer.current = null;
    if (micOwner === owner.current) {
      micOwner = null;
      try { void ExpoSpeechRecognitionModule.abort?.(); } catch { /* no active recognizer */ }
    }
    listeningRef.current = false;
    setListening(false);
    setPartial('');
  }, [clearListenTimers]);
  useEffect(() => cancelAttempt, [text, locale, cancelAttempt]);
  useEffect(() => {
    if (!focused) cancelAttempt();
    const sub = AppState.addEventListener('change', state => { if (state !== 'active') cancelAttempt(); });
    return () => sub.remove();
  }, [focused, cancelAttempt]);
  const skip = () => {
    if (skipped.current || !onSkip) return;
    skipped.current = true;
    cancelAttempt();
    try { void Speech.stop(); } catch { /* no audio */ }
    setResult(null); setError('');
    onSkip(); // Deliberately no score, XP, attempt or practice-activity write.
  };
  /** One-tap flow: the word was just spoken, so the mic may open by itself (still cancellable). */
  const autoStartedFor = useRef('');
  const prevAutoStart = useRef(false);
  const startRef = useRef<null | (() => Promise<void>)>(null);
  const listeningRef = useRef(false);
  useEffect(() => { listeningRef.current = listening; }, [listening]);
  useEffect(() => {
    const wasAutoStart = prevAutoStart.current;
    prevAutoStart.current = autoStart;
    if (!autoStart || !focused || skipped.current) {
      autoStartedFor.current = '';
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
      if (wasAutoStart && micOwner === owner.current) {
        const wasListening = listeningRef.current;
        generation.current++;
        clearListenTimers();
        settledRef.current = true;
        micOwner = null;
        listeningRef.current = false;
        setListening(false);
        setPartial('');
        if (wasListening) void ExpoSpeechRecognitionModule.abort?.();
      }
      return;
    }
    if (!text || autoStartedFor.current === text) return;
    autoStartedFor.current = text;
    autoTimer.current = setTimeout(() => { autoTimer.current = null; void startRef.current?.(); }, 420);
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [autoStart, text, focused, clearListenTimers]);

  const finish = useCallback((heard: string) => {
    clearListenTimers();
    const scored = scoreSpeech(targetRef.current, heard);
    setResult(scored);
    if (!heard.trim()) {
      // Allow at most one automatic retry on silence so a quiet room never triggers a busy/rate-limit loop.
      const retry = autoStart && !singleAttempt && !stoppingByUser.current;
      const shouldRetry = retry && emptyRetries.current < 1;
      stoppingByUser.current = false;
      if (singleAttempt) onResultRef.current?.(scored);
      if (shouldRetry && !retryTimer.current) {
        emptyRetries.current += 1;
        retryTimer.current = setTimeout(() => {
          retryTimer.current = null;
          void startRef.current?.();
        }, 650);
      }
      return;
    }
    const id = locale.split('-')[0];
    if (isLanguageId(id)) void addPracticeActivity(id, localDay(), { spoken: 1, scoreSum: scored.score }).catch(() => undefined);
    onResultRef.current?.(scored);
  }, [autoStart, singleAttempt, locale, clearListenTimers]);

  useSpeechRecognitionEvent('start', () => {
    if (micOwner !== owner.current) return;
    listeningRef.current = true;
    setListening(true);
    setError('');
    if (adaptiveTiming && Platform.OS === 'web') {
      clearListenTimers();
      maxListenTimer.current = setTimeout(() => {
        if (micOwner === owner.current && listeningRef.current) {
          stoppingByUser.current = true;
          ExpoSpeechRecognitionModule.stop();
        }
      }, timingRef.current.maxWindowMs);
    }
  });
  useSpeechRecognitionEvent('result', event => {
    if (micOwner !== owner.current || settledRef.current) return;
    const alternatives = (event.results ?? []).map(item => item.transcript).filter(Boolean);
    const transcript = alternatives[0] ?? '';
    // Pick the alternative that matches the target best; recognisers rank homophones arbitrarily.
    const ranked = [...alternatives].sort((a, b) => scoreSpeech(targetRef.current, b).score - scoreSpeech(targetRef.current, a).score);
    const bestTranscript = ranked[0] ?? transcript;
    if (bestTranscript) lastHeardRef.current = bestTranscript;

    if (adaptiveTiming && Platform.OS === 'web' && bestTranscript) {
      if (silenceFinishTimer.current) clearTimeout(silenceFinishTimer.current);
      silenceFinishTimer.current = setTimeout(() => {
        if (micOwner === owner.current && listeningRef.current) {
          stoppingByUser.current = true;
          ExpoSpeechRecognitionModule.stop();
        }
      }, timingRef.current.completeSilenceMs);
    }

    if (event.isFinal) {
      if (adaptiveTiming && Platform.OS === 'web' && bestTranscript) {
        const clean = bestTranscript.trim();
        if (clean && segmentsRef.current[segmentsRef.current.length - 1] !== clean) {
          segmentsRef.current.push(clean);
        }
        finalRef.current = segmentsRef.current.join(' ').trim();
      } else {
        finalRef.current = bestTranscript;
      }
      // On some devices the final result arrives after «end»; score it now if «end» didn't already settle a transcript.
      if (!listeningRef.current && !settledRef.current) {
        const combined = finalRef.current || bestTranscript;
        if (combined) { settledRef.current = true; micOwner = null; }
        finish(combined);
      }
    } else {
      const prefix = adaptiveTiming && segmentsRef.current.length ? `${segmentsRef.current.join(' ')} ` : '';
      setPartial(`${prefix}${transcript}`.trim());
    }
  });
  useSpeechRecognitionEvent('end', () => {
    if (micOwner !== owner.current || settledRef.current) return;
    clearListenTimers();
    listeningRef.current = false;
    setListening(false);
    setPartial('');
    const segmentJoined = segmentsRef.current.join(' ').trim();
    const heard = finalRef.current || segmentJoined || lastHeardRef.current;
    if (heard) { settledRef.current = true; micOwner = null; }
    else { // Some Android recognisers deliver their final transcript just after end.
      const token = generation.current;
      setTimeout(() => { if (generation.current === token && micOwner === owner.current) micOwner = null; }, 250);
    }
    finish(heard);
  });
  useSpeechRecognitionEvent('error', event => {
    if (micOwner !== owner.current || settledRef.current) return;
    clearListenTimers();
    listeningRef.current = false;
    setListening(false);
    setPartial('');
    const code = event.error as string;
    settledRef.current = true; micOwner = null;
    if (code === 'no-speech' || code === 'speech-timeout') {
      const segmentJoined = segmentsRef.current.join(' ').trim();
      finish(finalRef.current || segmentJoined || lastHeardRef.current || '');
      return;
    }
    if (code === 'aborted') return;
    if (code === 'busy') {
      if (busyRetries.current < 1 && !stoppingByUser.current && !retryTimer.current) {
        busyRetries.current += 1;
        retryTimer.current = setTimeout(() => {
          retryTimer.current = null;
          void startRef.current?.();
        }, 450);
        return;
      }
      setError('میکروفن لحظه‌ای مشغول بود؛ دوباره «بگو» را بزنید.');
      return;
    }
    if (code === 'client') {
      if (clientRetries.current < 1 && !stoppingByUser.current && !retryTimer.current) {
        clientRetries.current += 1;
        retryTimer.current = setTimeout(() => {
          retryTimer.current = null;
          void startRef.current?.();
        }, 450);
        return;
      }
      setError('سرویس گفتار دستگاه آماده نشد؛ اتصال اینترنت و فعال بودن سرویس گفتار گوگل را بررسی کنید یا پاسخ را بنویسید.');
      return;
    }
    setError(code === 'not-allowed' || code === 'service-not-allowed'
      ? 'اجازهٔ میکروفن یا تشخیص گفتار داده نشده است؛ از تنظیمات دستگاه فعالش کنید.'
      : code === 'language-not-supported'
        ? 'تشخیص گفتار این زبان روی دستگاه شما در دسترس نیست.'
        : code === 'network'
          ? 'سرویس گفتار دستگاه خطای اتصال داد؛ دوباره امتحان کنید یا از «رد شو» استفاده کنید.'
          : code === 'audio-capture'
            ? 'میکروفن دستگاه در دسترس نیست؛ بررسی کنید برنامهٔ دیگری از آن استفاده نکند.'
            : code === 'too-many-requests'
              ? 'درخواست‌های گفتاری زیاد شد؛ چند لحظه صبر کنید و دوباره «بگو» را بزنید.'
              : 'تشخیص گفتار در دسترس نیست؛ سرویس گفتار گوگل را روی دستگاه بررسی کنید.');
  });

  const start = useCallback(async () => {
    if (!focusedRef.current || skipped.current || (AppState.currentState && AppState.currentState !== 'active')) return;
    if (micOwner === owner.current && listeningRef.current) return;
    clearListenTimers();
    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryTimer.current = null;
    stoppingByUser.current = false;
    setError('');
    setResult(null);
    finalRef.current = '';
    segmentsRef.current = [];
    lastHeardRef.current = '';
    settledRef.current = false;
    const token = ++generation.current;
    try {
      if (typeof ExpoSpeechRecognitionModule.isRecognitionAvailable === 'function' && !ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setError(Platform.OS === 'web'
          ? 'مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند.'
          : 'سرویس تشخیص گفتار روی دستگاه فعال نیست؛ در تنظیمات گوشی سرویس گفتار گوگل را بررسی کنید.');
        return;
      }
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (token !== generation.current) return;
      if (micOwner && micOwner !== owner.current) { setError('ابتدا تمرین گفتاری فعال را پایان دهید.'); return; }
      if (!permission.granted) { setError('برای تمرین گفتاری، اجازهٔ میکروفن لازم است.'); return; }
      // Await audio release before acquiring the microphone (not a fire-and-forget race).
      try { await Speech.stop(); } catch { /* ignore */ }
      if (token !== generation.current || !focusedRef.current || skipped.current) return;
      micOwner = owner.current;
      ExpoSpeechRecognitionModule.start({
        lang: locale,
        interimResults: true,
        continuous: adaptiveTiming && Platform.OS === 'web',
        maxAlternatives: 5,
        contextualStrings: text.trim() ? [text] : undefined,
        requiresOnDeviceRecognition: false,
        // Use packs already supplied by the device when its service supports them. No download/model.
        androidIntentOptions: Platform.OS === 'android' ? { EXTRA_PREFER_OFFLINE: true } : undefined,
        addsPunctuation: false,
      });
    } catch {
      if (token !== generation.current) return;
      if (micOwner === owner.current) micOwner = null;
      setError('تشخیص گفتار در دسترس نیست؛ سرویس گفتار گوگل را روی دستگاه بررسی کنید.');
    }
  }, [locale, text, adaptiveTiming, clearListenTimers]);

  startRef.current = start;
  const stop = useCallback(() => { stoppingByUser.current = true; clearListenTimers(); ExpoSpeechRecognitionModule.stop(); }, [clearListenTimers]);
  const sayWord = useCallback((word: string) => { try { Speech.stop(); Speech.speak(word, { language: locale, rate: 0.6 }); } catch { /* no tts */ } }, [locale]);
  const missed = result ? result.words.filter(w => w.state !== 'ok' && tokens(w.word).length) : [];
  const sayMissed = useCallback(() => { if (!missed.length) return; try { Speech.stop(); Speech.speak(missed.map(w => w.word).join(', '), { language: locale, rate: 0.6 }); } catch { /* no tts */ } }, [missed, locale]);

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact, roomMode && styles.roomWrap]}>
      {!compact && !roomMode && <Text style={styles.title}>{title ?? 'بگو · Speak'}</Text>}
      {(listening || (result && !blindExam)) ? <Text style={styles.hint}>{listening ? (adaptiveTiming ? `در حال شنیدن… (تا حدود ${fa(timing.maxWindowSeconds)} ثانیه فرصت دارید)` : 'در حال شنیدن…') : result ? feedbackFor(result.score, result.words.filter(w => w.state === 'near').length) : ''}</Text> : null}
      {result && !blindExam ? (
        <View style={styles.wordsRow}>
          {result.words.map((item, index) => <Pressable key={`${item.word}-${index}`} accessibilityRole="button" accessibilityLabel={`شنیدن آهستهٔ ${item.word}`} onPress={() => sayWord(item.word)}><Text keepColor style={[styles.word, item.state === 'ok' ? styles.wordOk : item.state === 'near' ? styles.wordNear : styles.wordMiss]}>{item.word}</Text></Pressable>)}
        </View>
      ) : null}
      {listening && partial ? <Text keepColor style={styles.partial}>{partial}</Text> : null}
      {result?.heard && !blindExam ? <View style={styles.scoreRow}><Text style={styles.scoreLabel}>{roomMode ? 'شباهت متن به نمونه' : 'امتیاز'}</Text><Text keepColor style={[styles.scoreValue, { color: result.score >= 70 ? '#15803D' : result.score >= 40 ? '#B45309' : '#B91C1C' }]}>{fa(result.score)}٪</Text></View> : null}
      {/* When the recogniser heard nothing, a percentage would be a fake zero. Say it plainly instead. */}
      {result && !result.heard ? <Text style={styles.hint}>چیزی شنیده نشد. ابتدا نمونه را گوش بده و یک بار دیگر بگو.</Text> : null}
      {result && result.heard ? <Text style={styles.heard}>شنیده شد: <Text keepColor style={styles.heardText}>{result.heard}</Text></Text> : null}
      {result && !blindExam && missed.length ? <View style={styles.legendRow}>
        <Pressable accessibilityRole="button" onPress={sayMissed} style={styles.missedButton}><Volume2 size={14} color="#B91C1C" /><Text keepColor style={styles.missedText}>{missed.length === 1 ? 'همین یک واژه را بشنو و دوباره بگو' : `این ${fa(missed.length)} واژه را بشنو و دوباره بگو`}</Text></Pressable>

      </View> : null}
      {!!error && <Text accessibilityRole="alert" keepColor style={styles.error}>{error}</Text>}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={listening ? 'پایان گفتن' : result ? 'دوباره بگو' : 'شروع گفتن'}
        onPress={() => {
          if (listening) { stop(); return; }
          skipped.current = false;
          emptyRetries.current = 0;
          busyRetries.current = 0;
          clientRetries.current = 0;
          void start();
        }}
        style={({ pressed }) => [styles.button, compact && styles.buttonCompact, roomMode && styles.roomMic, { backgroundColor: listening ? '#B91C1C' : accent }, pressed && styles.buttonPressed]}
      >
        {listening ? <Square size={roomMode ? 23 : compact ? 13 : 16} color="#FFFFFF" fill="#FFFFFF" /> : result ? <RefreshCw size={roomMode ? 26 : compact ? 15 : 18} color="#FFFFFF" /> : <Mic2 size={roomMode ? 28 : compact ? 16 : 19} color="#FFFFFF" />}
        {!roomMode ? <Text keepColor style={[styles.buttonText, compact && styles.buttonTextCompact]}>{listening ? 'تمام شد' : result ? 'دوباره بگو' : 'بگو'}</Text> : null}
      </Pressable>
      {onSkip ? <Pressable accessibilityRole="button" accessibilityLabel="رد شو" onPress={skip} style={styles.skipButton}><Text style={styles.skipText}>رد شو</Text></Pressable> : null}
      {roomMode ? <Text style={styles.hint}>{listening ? 'در حال شنیدن · برای پایان لمس کن' : error ? 'برای تلاش دوباره، میکروفن را لمس کن' : result ? 'برای تکرار، میکروفن را لمس کن' : 'برای صحبت، میکروفن را لمس کن'}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  skipButton: { minHeight: 44, minWidth: 64, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 },
  skipText: { fontSize: 13, color: '#64748B', fontFamily: Typography.fontFamily },
  roomWrap: { backgroundColor: 'transparent', borderWidth: 0, padding: 4, marginTop: 2, gap: 12 },
  roomMic: { width: 80, height: 80, borderRadius: 40, paddingHorizontal: 0, paddingVertical: 0, alignItems: 'center', justifyContent: 'center' },
  wrap: { width: '100%', marginTop: 10, padding: 12, borderRadius: 16, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', gap: 6 },
  wrapCompact: { marginTop: 8, padding: 8, gap: 4, backgroundColor: 'transparent', borderStyle: 'dashed' },
  buttonCompact: { paddingHorizontal: 14, paddingVertical: 7, marginTop: 0 },
  buttonTextCompact: { fontSize: 13 },
  title: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  hint: { fontSize: 12.5, lineHeight: 20, color: '#475569', textAlign: 'center' },
  wordsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 2, width: '100%' },
  // «Thank» and «you.» must each stay whole: the chip may move to the next line, its letters may not.
  word: { fontFamily: Typography.latinFontFamily, fontSize: 17, lineHeight: 24, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden', writingDirection: 'ltr', textAlign: 'left', flexShrink: 0 },
  wordOk: { color: '#15803D', backgroundColor: '#DCFCE7' },
  wordMiss: { color: '#B91C1C', backgroundColor: '#FEE2E2' },
  wordNear: { color: '#B45309', backgroundColor: '#FEF3C7' },
  legendRow: { alignItems: 'center', gap: 4 },
  legend: { fontSize: 11, color: '#94A3B8', textAlign: 'center' },
  missedButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  missedText: { fontSize: 12, color: '#B91C1C', fontWeight: '700' },
  partial: { fontSize: 14, color: '#64748B', fontStyle: 'italic', textAlign: 'center' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreLabel: { fontSize: 13, color: '#475569' },
  scoreValue: { fontSize: 22, lineHeight: 30, fontWeight: '800', color: '#B91C1C', textAlign: 'right', writingDirection: 'rtl' },
  heard: { fontSize: 12, color: '#64748B', textAlign: 'center' },
  heardText: { color: '#334155', fontWeight: '700' },
  error: { fontSize: 12, lineHeight: 19, color: '#B91C1C', textAlign: 'center' },
  button: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 22, paddingVertical: 11, borderRadius: 999, marginTop: 4 },
  buttonPressed: { opacity: 0.85 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
