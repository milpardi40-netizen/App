import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Headphones, Mic2, MessageCircle, Volume2 } from 'lucide-react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import SpeakCheck from '@/components/SpeakCheck';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';
import { Typography } from '@/lib/theme';
import { toPersianDigits as fa } from '@/lib/format';

type ConversationLine = { id: string; text: string; fa: string };
type Speaker = 'learner' | 'device';

type Props = {
  lines: ConversationLine[];
  locale: 'en-US' | 'ru-RU';
  onSpeak: (text: string, onDone: () => void) => void;
  onStop?: () => void;
};

/** A light, lesson-local conversation: every original sentence becomes one alternating turn. */
export default function LessonConversationRoom({ lines, locale, onSpeak, onStop }: Props) {
  const [starter, setStarter] = useState<Speaker | null>(null);
  const [turnIndex, setTurnIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const spokenTurn = useRef<number | null>(null);
  const roomLines = useMemo(() => lines.filter(line => line.text.trim()), [lines]);
  const complete = !!starter && turnIndex >= roomLines.length;
  const current = roomLines[turnIndex];
  const currentSpeaker: Speaker | null = starter && current
    ? (turnIndex % 2 === 0 ? starter : starter === 'learner' ? 'device' : 'learner')
    : null;

  useEffect(() => {
    if (!current || currentSpeaker !== 'device' || spokenTurn.current === turnIndex) return;
    spokenTurn.current = turnIndex;
    setSpeaking(true);
    const finish = () => {
      setSpeaking(false);
      setTurnIndex(value => value === turnIndex ? value + 1 : value);
    };
    onSpeak(current.text, finish);
  }, [current, currentSpeaker, onSpeak, turnIndex]);

  useEffect(() => () => { onStop?.(); }, [onStop]);

  const chooseStarter = async (choice: Speaker) => {
    if (starting) return;
    setStarting(true);
    setStartError('');
    try {
      // Ask from the learner's tap so browser and native permission prompts are user-initiated.
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setStartError('برای مکالمهٔ خودکار، اجازهٔ میکروفن و تشخیص گفتار را فعال کنید.');
        return;
      }
      spokenTurn.current = null;
      setTurnIndex(0);
      setStarter(choice);
    } catch {
      setStartError('دسترسی میکروفن آماده نشد؛ دوباره تلاش کنید و اجازهٔ دسترسی را بدهید.');
    } finally {
      setStarting(false);
    }
  };

  const nextTurn = () => setTurnIndex(value => Math.min(value + 1, roomLines.length));

  return (
    <View style={styles.wrap}>
      <View style={styles.icon}><MessageCircle size={30} color={Palette.primary} /></View>
      <Text style={styles.title}>اتاق مکالمهٔ درس</Text>
      <Text style={styles.subtitle}>جمله‌های همین درس را یکی‌یکی با دستگاه تمرین کنید.</Text>

      {!starter ? (
        <View style={styles.choiceGroup}>
          <Text style={styles.prompt}>چه کسی مکالمه را شروع کند؟</Text>
          <Text style={styles.permissionHint}>برای جابه‌جایی خودکار نوبت‌ها، میکروفن لازم است.</Text>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: starting }} disabled={starting} style={styles.primaryButton} onPress={() => void chooseStarter('learner')}>
            <Mic2 size={18} color="#FFFFFF" /><Text style={styles.primaryButtonText}>من شروع می‌کنم</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: starting }} disabled={starting} style={styles.secondaryButton} onPress={() => void chooseStarter('device')}>
            <Headphones size={18} color={Palette.primary} /><Text style={styles.secondaryButtonText}>دستگاه شروع کند</Text>
          </Pressable>
          {starting ? <ActivityIndicator color={Palette.primary} /> : null}
          {startError ? <Text accessibilityRole="alert" style={styles.permissionError}>{startError}</Text> : null}
        </View>
      ) : complete ? (
        <View style={styles.doneCard}>
          <Text style={styles.doneTitle}>مکالمه تمام شد</Text>
          <Text style={styles.doneText}>همهٔ جمله‌های این درس در مکالمه استفاده شدند.</Text>
        </View>
      ) : current ? (
        <View style={styles.conversation}>
          <Text style={styles.counter}>نوبت {fa(turnIndex + 1)} از {fa(roomLines.length)}</Text>
          <View style={[styles.bubble, currentSpeaker === 'device' ? styles.deviceBubble : styles.learnerBubble]}>
            <Text style={styles.speaker}>{currentSpeaker === 'device' ? 'دستگاه' : 'شما'}</Text>
            <Text style={styles.lineText}>{current.text}</Text>
            {current.fa ? <Text style={styles.translation}>{current.fa}</Text> : null}
            {currentSpeaker === 'device' ? (
              <View style={styles.statusRow}>
                <Volume2 size={16} color={Palette.primary} />
                <Text style={styles.statusText}>{speaking ? 'دستگاه در حال صحبت است…' : 'در حال آماده‌سازی صدا…'}</Text>
              </View>
            ) : (
              <SpeakCheck key={`${turnIndex}-${current.id}`} text={current.text} locale={locale} accent={Palette.primary} title="نوبت شما" autoStart onResult={nextTurn} />
            )}
          </View>
          <View style={styles.history}>
            {roomLines.slice(0, turnIndex).map((line, index) => {
              const who: Speaker = index % 2 === 0 ? starter : starter === 'learner' ? 'device' : 'learner';
              return <View key={`${line.id}-${index}`} style={[styles.historyBubble, who === 'device' ? styles.deviceBubble : styles.learnerBubble]}>
                <Text style={styles.speaker}>{who === 'device' ? 'دستگاه' : 'شما'}</Text>
                <Text style={styles.historyText}>{line.text}</Text>
              </View>;
            })}
          </View>
        </View>
      ) : (
        <View style={styles.doneCard}><Text style={styles.doneTitle}>برای این درس جمله‌ای ثبت نشده است.</Text></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', gap: 9, paddingVertical: 6 },
  icon: { width: 64, height: 64, borderRadius: 32, backgroundColor: Palette.primarySoft, alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  title: { fontFamily: Typography.boldFontFamily, fontSize: 24, lineHeight: 34, color: Palette.ink, textAlign: 'center', writingDirection: 'rtl' },
  subtitle: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 22, color: Palette.text, textAlign: 'center', writingDirection: 'rtl' },
  choiceGroup: { width: '100%', maxWidth: 520, gap: 10, marginTop: 16 },
  prompt: { fontFamily: Typography.boldFontFamily, fontSize: 16, color: Palette.ink, textAlign: 'center', writingDirection: 'rtl', marginBottom: 4 },
  permissionHint: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: Palette.muted, textAlign: 'center', writingDirection: 'rtl' },
  permissionError: { fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, color: '#B91C1C', textAlign: 'center', writingDirection: 'rtl' },
  primaryButton: { minHeight: 52, borderRadius: 16, backgroundColor: Palette.primary, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 16 },
  primaryButtonText: { fontFamily: Typography.boldFontFamily, fontSize: 15, color: '#FFFFFF', writingDirection: 'rtl' },
  secondaryButton: { minHeight: 50, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Palette.border, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 16 },
  secondaryButtonText: { fontFamily: Typography.fontFamily, fontSize: 14, color: Palette.primary, writingDirection: 'rtl' },
  conversation: { width: '100%', gap: 10, marginTop: 10 },
  counter: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.muted, textAlign: 'center', writingDirection: 'rtl' },
  bubble: { width: '100%', borderRadius: 20, padding: 15, borderWidth: 1, gap: 6 },
  deviceBubble: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderColor: Palette.border, borderBottomLeftRadius: 6 },
  learnerBubble: { alignSelf: 'flex-end', backgroundColor: Palette.primarySoft, borderColor: '#DDE2FF', borderBottomRightRadius: 6 },
  speaker: { fontFamily: Typography.fontFamily, fontSize: 11, color: Palette.primaryDark, textAlign: 'right', writingDirection: 'rtl' },
  lineText: { fontFamily: 'Times New Roman', fontSize: 19, lineHeight: 29, fontWeight: '700', color: Palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  translation: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 22, color: Palette.text, textAlign: 'right', writingDirection: 'rtl' },
  statusRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7, marginTop: 6 },
  statusText: { fontFamily: Typography.fontFamily, fontSize: 12, color: Palette.primary, writingDirection: 'rtl' },
  history: { gap: 8 },
  historyBubble: { maxWidth: '88%', borderRadius: 15, padding: 10, borderWidth: 1, borderColor: Palette.border },
  historyText: { fontFamily: 'Times New Roman', fontSize: 14, lineHeight: 21, color: Palette.text, textAlign: 'left', writingDirection: 'ltr' },
  doneCard: { width: '100%', marginTop: 16, padding: 20, borderRadius: 18, alignItems: 'center', gap: 8, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' },
  doneTitle: { fontFamily: Typography.boldFontFamily, fontSize: 17, color: '#166534', textAlign: 'center', writingDirection: 'rtl' },
  doneText: { fontFamily: Typography.fontFamily, fontSize: 13, color: '#166534', textAlign: 'center', writingDirection: 'rtl' },
});
