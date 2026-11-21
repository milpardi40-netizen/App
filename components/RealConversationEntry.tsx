import { LocalizedText as Text } from '@/components/LocalizedText';
import { useRouter } from 'expo-router';
import { MessageCircle, Users } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/lib/theme';

export default function RealConversationEntry({
  language,
  lessonId,
  lessonTitle,
  levelId,
  situation,
}: {
  language: 'en' | 'ru';
  lessonId: string;
  lessonTitle: string;
  levelId: number;
  situation?: string;
}) {
  const router = useRouter();
  return (
    <View style={styles.card}>
      <View style={styles.icon}><Users size={22} color={Colors.primary[300]} /></View>
      <View style={styles.copy}>
        <Text style={styles.title}>مکالمه با یک زبان‌آموز واقعی</Text>
        <Text style={styles.description}>همین موضوع درس را با یک نفر دیگر تمرین کن؛ با پیام متنی یا صوتی.</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="شروع مکالمه با زبان‌آموز واقعی"
        style={styles.button}
        onPress={() => router.push({
          pathname: '/conversations',
          params: {
            language,
            lessonId,
            lessonTitle,
            levelId: String(levelId),
            situation: situation || '',
          },
        } as never)}
      >
        <MessageCircle size={17} color={Colors.onColor} />
        <Text style={styles.buttonText}>شروع مکالمه</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.xl, padding: Spacing.md, backgroundColor: Colors.primary[500] + '12', borderWidth: 1, borderColor: Colors.primary[500] + '40', gap: Spacing.sm },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary[500] + '20', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  copy: { gap: 4 },
  title: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.neutral[100], textAlign: 'right' },
  description: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.xs, lineHeight: 20, color: Colors.neutral[400], textAlign: 'right' },
  button: { minHeight: 44, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, backgroundColor: Colors.primary[500], flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 7 },
  buttonText: { fontFamily: Typography.fontFamily, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.onColor },
});
