import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BookOpen, ChevronLeft, Mic, Volume2 } from 'lucide-react-native';
import { LocalizedText as Text } from './LocalizedText';
import { Typography } from '@/lib/theme';

export const ink = '#193653', blue = '#245885';
export function Action({ label, onPress, active = false, muted = false }: { label: string; onPress: () => void; active?: boolean; muted?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: active, disabled: muted }} disabled={muted} onPress={onPress} style={({ pressed }) => [w.action, active && w.active, (pressed || muted) && { opacity: .65 }]}><Text style={[w.actionText, active && { color: '#FFFFFF' }]}>{label}</Text></Pressable>;
}
export function Hear({ text, speak }: { text: string; speak: (s: string) => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`بشنو: ${text}`} onPress={() => speak(text)} style={w.hear}><Volume2 size={18} color={blue} /></Pressable>;
}
export function Panel({ children }: { children: ReactNode }) { return <View style={w.panel}>{children}</View>; }
export function GrammarLink({ fromLesson, onPress }: { fromLesson?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={fromLesson ? 'فعل و ضمیر همین درس' : 'اتاق آموزش افعال'} onPress={onPress} style={w.link}>
    <View style={w.icon}><BookOpen size={23} color={blue} /></View><View style={{ flex: 1, gap: 2 }}><Text style={w.kicker}>کارگاه ۰۱  /  دفتر زبان</Text><Text style={w.title}>{fromLesson ? 'فعل و ضمیر همین درس' : 'اتاق آموزش افعال'}</Text><Text style={w.copy}>{fromLesson ? 'شکل واژه را در همین موقعیت ببین و تمرین کن.' : 'مصدر را بشناس، شکل آن را در جمله ببین و با راوی تمرین کن.'}</Text></View><ChevronLeft size={19} color={blue}/>
  </Pressable>;
}
export function VoiceRoomLink({ fromLesson, onPress }: { fromLesson?: boolean; onPress: () => void }) {
  const title = fromLesson ? 'مکالمهٔ صوتی همین درس' : 'اتاق مکالمهٔ روسی';
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({pressed}) => [w.link,{backgroundColor:'#123E39',borderColor:'#123E39',opacity:pressed ? .88 : 1}]}>
    <View style={[w.icon,{backgroundColor:'#D6E99C'}]}><Mic size={23} color="#16483E"/></View>
    <View style={{flex:1,gap:3}}>
      <Text keepColor style={[w.kicker,{color:'#D6E99C'}]}>کارگاه ۰۲  /  استودیوی گفتار</Text>
      <Text keepColor style={[w.title,{color:'#FFFFFF'}]}>{title}</Text>
      <Text keepColor style={[w.copy,{color:'#E0EEE7'}]}>در نقش یکی از دو نفر، گفت‌وگوی هر درس را با پاسخ خودت پیش ببر.</Text>
    </View>
    <ChevronLeft size={19} color="#D6E99C"/>
  </Pressable>;
}
export const w = StyleSheet.create({
  panel: { backgroundColor: '#FFFFFF', borderColor: '#D5E1E8', borderWidth: 1, borderRadius: 18, padding: 16, gap: 11, alignSelf: 'stretch' },
  link: { backgroundColor: '#EEF6FA', borderWidth: 1, borderColor: '#C8DBE6', borderRadius: 18, padding: 16, gap: 12, flexDirection: 'row-reverse', alignItems: 'center', marginVertical: 5 },
  icon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#DBEDF4', justifyContent: 'center', alignItems: 'center' },
  title: { fontFamily: Typography.fontFamily, fontSize: 21, lineHeight: 30, color: ink, textAlign: 'right', writingDirection: 'rtl' },
  copy: { fontFamily: Typography.fontFamily, fontSize: 15, lineHeight: 24, color: '#43586C', textAlign: 'right', writingDirection: 'rtl' },
  kicker: { fontFamily: Typography.fontFamily, fontSize: 13, color: blue, textAlign: 'right', writingDirection: 'rtl' },
  ru: { fontFamily: Typography.latinFontFamily, fontSize: 20, lineHeight: 28, fontWeight: '700', color: ink, writingDirection: 'ltr', textAlign: 'left' },
  row: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  action: { minHeight: 44, borderRadius: 12, backgroundColor: '#F0F6FA', borderColor: '#BDCFDD', borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8, justifyContent: 'center' },
  active: { borderColor: blue, backgroundColor: blue }, actionText: { fontFamily: Typography.fontFamily, fontSize: 15, color: blue, textAlign: 'center' },
  hear: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#E8F2F7' },
  sample: { backgroundColor: '#F3F8FA', borderRadius: 14, padding: 12, gap: 5 },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#AABECC', borderRadius: 12, paddingHorizontal: 14, color: ink, backgroundColor: '#FFFFFF', fontSize: 16 },
});
