import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { PageNavigation } from '@/components/PageNavigation';
import { EnglishA1SupportPreview } from '@/components/EnglishA1Support';
import { playResponsiveSpeech, stopResponsiveSpeech } from '@/lib/responsiveSpeech';
import { Typography } from '@/lib/theme';

export default function EnglishA1SupportScreen() {
  const params = useLocalSearchParams<{unit?: string | string[]}>();
  const unitId = (Array.isArray(params.unit) ? params.unit[0] : params.unit) ?? '';
  const router = useRouter();
  const [error, setError] = useState('');
  useEffect(() => () => { void stopResponsiveSpeech(); }, [unitId]);
  return <ScrollView contentContainerStyle={{padding:18,gap:14,paddingBottom:48}}>
    <PageNavigation backFallback="/lang/library?level=1" />
    {!!error && <Text accessibilityLiveRegion="polite" style={{fontFamily:Typography.fontFamily,color:'#A32335',textAlign:'right'}}>{error}</Text>}
    <View><EnglishA1SupportPreview unitId={unitId}
      onOpenCore={id => router.push({pathname:'/course/lesson',params:{id}} as never)}
      onOpenCourse={() => router.push({pathname:'/lang/supplement',params:{level:'A1'}} as never)}
      onSpeak={text => { setError(''); void playResponsiveSpeech({text,locale:'en-US',rate:0.78,onError:()=>setError('صدا پخش نشد؛ تنظیمات صدای دستگاه را بررسی و دوباره تلاش کنید.')}); }}
    /></View>
  </ScrollView>;
}
