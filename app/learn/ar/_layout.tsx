import { LocalizedText as Text } from '@/components/LocalizedText';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Slot } from 'expo-router';
import { isLanguageEnabled } from '@/lib/features';
import { Typography } from '@/lib/theme';

export default function ArabicLayout() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!isLanguageEnabled('ar')) return <Redirect href={'/languages' as never} />;
  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F4FBF9', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator color="#0F766E" />
        <Text style={{ fontFamily: Typography.fontFamily, color: '#115E59' }}>در حال آماده‌کردن بخش عربی…</Text>
      </View>
    );
  }
  return <Slot />;
}
