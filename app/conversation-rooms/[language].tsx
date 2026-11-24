import { LocalizedText as Text } from '@/components/LocalizedText';
import { FEATURES, isLanguageEnabled } from '@/lib/features';
import { LANGUAGE_IDS } from '@/lib/languages/registry';
import { Colors, Typography } from '@/lib/theme';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { lazy, Suspense, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

const EnglishConversationRooms = lazy(() => import('@/components/routes/EnglishConversationRooms'));
const StarterConversationRooms = lazy(() => import('@/components/routes/StarterConversationRooms'));
const TurkishConversationRooms = lazy(() => import('@/components/routes/TurkishConversationRooms'));
const ArabicConversationRooms = lazy(() => import('@/components/routes/ArabicConversationRooms'));
const RussianConversationRooms = lazy(() => import('@/components/routes/RussianConversationRooms'));

const LOADING_FALLBACK = (
  <View style={{ flex: 1, backgroundColor: '#FAF8F4', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
    <ActivityIndicator color={Colors.primary[600]} />
    <Text style={{ fontFamily: Typography.fontFamily, color: '#5B6257' }}>در حال آماده‌کردن اتاق‌های مکالمه…</Text>
  </View>
);

export default function ConversationRoomsRoute() {
  const { language } = useLocalSearchParams<{ language?: string }>();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!language || !isLanguageEnabled(language) || (language === 'ru' && !FEATURES.russianCourse)) {
    return <Redirect href={'/languages' as never} />;
  }
  if (!ready) return LOADING_FALLBACK;

  let screen: React.ReactNode = null;
  if (language === 'en') screen = <EnglishConversationRooms />;
  else if (language === 'tr') screen = <TurkishConversationRooms />;
  else if (language === 'ar') screen = <ArabicConversationRooms />;
  else if (language === 'ru') screen = <RussianConversationRooms />;
  else if (language === 'de' || language === 'fr' || language === 'es') {
    screen = <StarterConversationRooms language={language} />;
  } else {
    return <Redirect href={'/languages' as never} />;
  }

  return <Suspense fallback={LOADING_FALLBACK}>{screen}</Suspense>;
}

export function generateStaticParams() {
  return LANGUAGE_IDS.map(language => ({ language }));
}
