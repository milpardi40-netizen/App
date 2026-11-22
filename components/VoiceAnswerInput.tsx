import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { Mic2, Square } from 'lucide-react-native';
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
  const finalRef = useRef('');
  const lastHeardRef = useRef('');
  const settledRef = useRef(false);
  const generation = useRef(0);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => () => { generation.current++; void ExpoSpeechRecognitionModule.abort?.(); }, []);

  useSpeechRecognitionEvent('start', () => {
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
    setListening(false);
    setPartial('');
    const code = event.error;
    settledRef.current = true;
    if (code === 'aborted') return;
    if (code === 'no-speech') {
      setError('چیزی شنیده نشد؛ یک بار دیگر بگو.');
      return;
    }
    setError(code === 'not-allowed' || code === 'service-not-allowed'
      ? 'اجازهٔ میکروفن یا تشخیص گفتار داده نشده است؛ از تنظیمات دستگاه فعالش کنید.'
      : code === 'language-not-supported'
        ? 'تشخیص گفتار این زبان روی دستگاه شما در دسترس نیست.'
        : code === 'network'
          ? 'برای تشخیص گفتار این زبان، اتصال اینترنت لازم است.'
          : 'تشخیص گفتار در دسترس نیست؛ سرویس گفتار گوگل را روی دستگاه بررسی کنید.');
  });

  const start = async () => {
    if (disabled) return;
    setError('');
    setPartial('');
    setTranscript('');
    finalRef.current = '';
    lastHeardRef.current = '';
    settledRef.current = false;
    const token = ++generation.current;
    try {
      if (Platform.OS === 'web' && !ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setError('مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند.');
        return;
      }
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (token !== generation.current) return;
      if (!permission.granted) {
        setError('برای پاسخ گفتاری، اجازهٔ میکروفن لازم است.');
        return;
      }
      ExpoSpeechRecognitionModule.start({
        lang: locale,
        interimResults: true,
        continuous: false,
        maxAlternatives: 5,
        contextualStrings,
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
        onPress={() => (listening ? stop() : void start())}
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
