import { useLocalSearchParams, useRouter } from 'expo-router';
import { isRetiredEnglishA1Lab, ENGLISH_A1_LAB_RETIREMENT_NOTICE } from '@/lib/englishLessonAvailability';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { Suspense, lazy } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

const EnglishLessonRoute = lazy(() => import('@/components/EnglishLessonRoute'));

export default function EnglishLessonScreen() {
  const { restartToken, id } = useLocalSearchParams<{ restartToken?: string; id?: string | string[] }>();
  const router = useRouter();
  const lessonId = Array.isArray(id) ? id[0] : id;
  // Do not mount the lesson (or its speech/session effects) for an old deep link.
  if (lessonId && isRetiredEnglishA1Lab(lessonId)) return <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 20, backgroundColor: '#F8FAFF' }}>
    <Text accessibilityRole="header" style={{ fontFamily: 'Beiruti', fontSize: 24, textAlign: 'right' }}>بازبینی آزمایشگاه قدیمی A1</Text>
    <Text style={{ fontFamily: 'Beiruti', fontSize: 18, lineHeight: 30, textAlign: 'right', writingDirection: 'rtl' }}>{ENGLISH_A1_LAB_RETIREMENT_NOTICE}</Text>
    <Pressable accessibilityRole="button" onPress={() => router.replace('/lang/library?level=1')} style={{ backgroundColor: '#635BFF', padding: 16, borderRadius: 12 }}>
      <Text style={{ fontFamily: 'Beiruti', color: '#FFFFFF', textAlign: 'center', fontSize: 18 }}>رفتن به درس‌های اصلی A1</Text>
    </Pressable>
  </View>;
  return (
    <Suspense fallback={
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F8FAFF' }}>
        <ActivityIndicator color="#635BFF" size="large" />
        <Text style={{ fontFamily: 'Beiruti', color: '#334155', fontSize: 13, textAlign: 'center', writingDirection: 'rtl' }}>
          در حال آماده‌کردن اولین درس…
        </Text>
      </View>
    }>
      <EnglishLessonRoute key={restartToken ?? "resume"} />
    </Suspense>
  );
}
