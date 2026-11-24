import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { Mic2, Square } from 'lucide-react-native';
import * as Speech from '@/lib/courseSpeech';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { Typography } from '@/lib/theme';

type Props = {
  locale: string;
  /** Words that help the recogniser stay on the mission topic. */
  contextualStrings?: string[];
  disabled?: boolean;
  onTranscript: (text: string) => void;
};

/**
 * «بگو» — a speech-to-text answer box for the turn-based conversation.
 *
 * It only transcribes. Scoring and feedback happen in the conversation screen,
 * so the learner is free to answer the mission in their own words.
 */
export default function VoiceAnswerInput({ locale, contextualStrings = [], disabled = false, onTranscript }: Props) {
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState('');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const listeningRef = useRef(false);
  const finalRef = useRef('');
  const lastHeardRef = useRef('');
  const settledRef = useRef(false);
  const busyRetries = useRef(0);
  const clientRetries = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<null | (() => Promise<void>)>(null);
  const generation = useRef(0);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => () => {
    generation.current++;
    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryTimer.current = null;
    if (listeningRef.current) void ExpoSpeechRecognitionModule.abort?.();
  }, []);

  useSpeechRecognitionEvent('start', () => {
    listeningRef.current = true;
    setListening(true);
    setError('');
  });

  useSpeechRecognitionEvent('result', event => {
    if (settledRef.current) return;
    const alternatives = (event.results ?? [])
      .map(item => item.transcript)
      .filter((item): item is string => Boolean(item));
    // The longest alternative is usually the most complete sentence.
    const best = [...alternatives].sort((a, b) => b.length - a.length)[0] ?? '';
    if (best) lastHeardRef.current = best;
    if (event.isFinal) {
      finalRef.current = best;
      if (best) {
        settledRef.current = true;
        setTranscript(best);
        onTranscriptRef.current(best.trim());
      }
    } else {
      setPartial(best);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    listeningRef.current = false;
    setListening(false);
    setPartial('');
    if (settledRef.current) return;
    const heard = finalRef.current || lastHeardRef.current;
    if (heard.trim()) {
      settledRef.current = true;
      setTranscript(heard);
      onTranscriptRef.current(heard.trim());
    }
  });

  useSpeechRecognitionEvent('error', event => {
    listeningRef.current = false;
    setListening(false);
    setPartial('');
    const code = event.error as string;
    settledRef.current = true;
    if (code === 'aborted') return;
    if (code === 'no-speech' || code === 'speech-timeout') {
      setError('چیزی شنیده نشد؛ یک بار دیگر بگو.');
      return;
    }
    if (code === 'busy') {
      if (busyRetries.current < 1 && !retryTimer.current) {
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
      if (clientRetries.current < 1 && !retryTimer.current) {
        clientRetries.current += 1;
        retryTimer.current = setTimeout(() => {
          retryTimer.current = null;
          void startRef.current?.();
        }, 450);
        return;
      }
      setError('سرویس گفتار دستگاه آماده نشد؛ اتصال اینترنت و فعال بودن سرویس گفتار گوگل را بررسی کنید.');
      return;
    }
    setError(code === 'not-allowed' || code === 'service-not-allowed'
      ? 'اجازهٔ میکروفن یا تشخیص گفتار داده نشده است؛ از تنظیمات دستگاه فعالش کنید.'
      : code === 'language-not-supported'
        ? 'تشخیص گفتار این زبان روی دستگاه شما در دسترس نیست.'
        : code === 'network'
          ? 'برای تشخیص گفتار این زبان، اتصال اینترنت لازم است.'
          : code === 'audio-capture'
            ? 'میکروفن دستگاه در دسترس نیست؛ بررسی کنید برنامهٔ دیگری از آن استفاده نکند.'
            : code === 'too-many-requests'
              ? 'درخواست‌های گفتاری زیاد شد؛ چند لحظه صبر کنید و دوباره «بگو» را بزنید.'
              : 'تشخیص گفتار در دسترس نیست؛ سرویس گفتار گوگل را روی دستگاه بررسی کنید.');
  });

  const start = async () => {
    if (disabled || listeningRef.current) return;
    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryTimer.current = null;
    setError('');
    setPartial('');
    setTranscript('');
    finalRef.current = '';
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
      if (!permission.granted) {
        setError('برای پاسخ گفتاری، اجازهٔ میکروفن لازم است.');
        return;
      }
      try { void Speech.stop(); } catch { /* ignore */ }
      ExpoSpeechRecognitionModule.start({
        lang: locale,
        interimResults: true,
        continuous: false,
        maxAlternatives: 5,
        contextualStrings: contextualStrings.length ? contextualStrings : undefined,
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
      });
    } catch {
      setError('تشخیص گفتار در دسترس نیست؛ سرویس گفتار گوگل را روی دستگاه بررسی کنید.');
    }
  };

  const stop = () => {
    try { ExpoSpeechRecognitionModule.stop(); } catch { /* already stopped */ }
  };
  startRef.current = start;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>
        {listening ? 'در حال شنیدن…' : transcript ? 'شنیده شد' : 'برای پاسخ گفتاری، دکمهٔ «بگو» را بزن'}
      </Text>
      {partial ? <Text keepColor style={styles.partial}>{partial}</Text> : null}
      {transcript ? <Text keepColor style={styles.transcript}>{transcript}</Text> : null}
      {error ? <Text accessibilityRole="alert" keepColor style={styles.error}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={listening ? 'پایان گفتن' : 'بگو'}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => {
          if (listening) { stop(); return; }
          busyRetries.current = 0;
          clientRetries.current = 0;
          void start();
        }}
        style={({ pressed }) => [
          styles.button,
          listening && styles.buttonListening,
          disabled && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        {listening ? <Square size={18} color="#FFFFFF" fill="#FFFFFF" /> : <Mic2 size={20} color="#FFFFFF" />}
        <Text keepColor style={styles.buttonText}>{listening ? 'تمام شد' : 'بگو'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', gap: 6, paddingVertical: 4 },
  title: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, color: '#64748B', textAlign: 'center' },
  partial: { fontFamily: Typography.latinFontFamily, fontSize: 14, lineHeight: 21, color: '#475569', textAlign: 'center', fontStyle: 'italic' },
  transcript: { fontFamily: Typography.latinFontFamily, fontSize: 15, lineHeight: 22, color: '#0F172A', textAlign: 'center', fontWeight: '700' },
  error: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, lineHeight: 19, color: '#B91C1C', textAlign: 'center' },
  button: { minHeight: 46, minWidth: 132, paddingHorizontal: 22, borderRadius: 23, backgroundColor: '#635BFF', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  buttonListening: { backgroundColor: '#B91C1C' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
