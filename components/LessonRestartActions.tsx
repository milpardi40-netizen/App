import { prepareLevelRestart } from '@/lib/levelRestart';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { RotateCcw } from 'lucide-react-native';
import { LocalizedText as Text } from './LocalizedText';
import { Typography } from '@/lib/theme';
import { prepareLessonRestart } from '@/lib/lessonRestart';

type Props = { lessonPath: string; firstLessonId?: string; lessonId?: string; color?: string };

/** Same two actions on every language home and every selected-level home. No progress wipe. */
export function LessonRestartActions({ lessonPath, firstLessonId, lessonId, color = '#4338CA' }: Props) {
  const router = useRouter();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const restart = async (id: string, level: boolean) => {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    try { router.push(await (level ? prepareLevelRestart(lessonPath, id) : prepareLessonRestart(lessonPath, id)) as never); }
    catch { setError('شروع مجدد آماده نشد؛ دوباره تلاش کنید.'); }
    finally { busy.current = false; setPending(false); }
  };
  return <View style={styles.wrap}>
    <View style={styles.row}>
      {([['شروع از ابتدای سطح', firstLessonId], ['شروع از ابتدای این درس', lessonId]] as const).map(([label, id]) => <Pressable
        key={label} accessibilityRole="button" accessibilityLabel={label}
        accessibilityState={{ disabled: !id || pending }} disabled={!id || pending}
        onPress={() => { if (id) void restart(id, label === 'شروع از ابتدای سطح'); }}
        style={({ pressed }) => [styles.button, (pressed || !id || pending) && { opacity: 0.55 }]}
      ><RotateCcw size={16} color={color} /><Text style={[styles.label, { color }]}>{label}</Text></Pressable>)}
    </View>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
  </View>;
}
const styles = StyleSheet.create({
  wrap: { width: '100%', marginTop: 10 },
  row: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  button: { flexGrow: 1, flexBasis: 135, minHeight: 48, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 14, borderWidth: 1, borderColor: '#DDE2EF', backgroundColor: '#F5F6FC', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 5 },
  label: { flexShrink: 1, fontFamily: Typography.fontFamily, fontSize: 12, lineHeight: 20, textAlign: 'center', writingDirection: 'rtl' },
  error: { fontFamily: Typography.fontFamily, color: '#B91C1C', textAlign: 'right', marginTop: 6 },
});
