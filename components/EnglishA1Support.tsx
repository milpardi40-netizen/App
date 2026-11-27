import { LocalizedText as Text } from '@/components/LocalizedText';
import { Pressable, StyleSheet, View } from 'react-native';
import { Typography } from '@/lib/theme';
import { englishA1SupportForLesson, englishA1SupportPreview, englishA1SupportTiming, ENGLISH_A1_SUPPORT_LABELS } from '@/lib/englishA1SupplementMap';

export function EnglishA1SupportLinks({ lessonId, onOpen }: { lessonId: string; onOpen: (unitId: string) => void }) {
  const links = englishA1SupportForLesson(lessonId);
  if (!links.length) return null;
  return <View style={s.card}>
    <Text style={s.heading}>این درس و واحدهای مکمل</Text>
    <Text style={s.body}>همهٔ این‌ها برای همین لحظه نیستند؛ نقش و زمان پیشنهادی را ببین. آموزش را می‌توانی بدون تغییر پیشرفت مرور کنی. مسیر مکمل مستقل است و شرط تازه‌ای برای پایان این درس نیست.</Text>
    {links.map(item => <View key={item.unitId} style={s.card}>
      <Text style={s.heading}>{ENGLISH_A1_SUPPORT_LABELS[item.role]} · {englishA1SupportPreview(item.unitId)?.unit.title}</Text>
      <Text style={s.body}>{englishA1SupportTiming(item)}</Text><Text style={s.body}>{item.reasonFa}</Text>
      <Pressable accessibilityRole="button" onPress={() => onOpen(item.unitId)} style={s.button}><Text style={s.buttonText}>مرور آموزش مرتبط</Text></Pressable>
    </View>)}
  </View>;
}

/** Read-only bridge: not an alternate route to recording evidence in a locked unit. */
export function EnglishA1SupportPreview({ unitId, onOpenCore, onOpenCourse, onSpeak }: {
  unitId: string; onOpenCore: (lessonId: string) => void; onOpenCourse: () => void; onSpeak: (text: string) => void;
}) {
  const target = englishA1SupportPreview(unitId);
  if (!target) return <Text style={s.body}>پیوند آموزش مکمل A1 معتبر نیست.</Text>;
  const {unit, support} = target;
  return <View style={s.page}>
    <Text accessibilityRole="header" style={s.heading}>{unit.title}</Text>
    <Text style={s.body}>{ENGLISH_A1_SUPPORT_LABELS[support.role]} · {englishA1SupportTiming(support)}</Text>
    <Text style={s.body}>{support.reasonFa}</Text>
    <Text style={s.body}>این صفحه فقط مرور آموزش است؛ واحد را تکمیل یا قفل تمرین را باز نمی‌کند و پاسخی ذخیره نمی‌شود. برای تمرین و سنجش، شرایط قبلی مسیر مکمل برقرار است.</Text>
    {unit.teaching.map(section => <View key={section.title} style={s.card}>
      <Text style={s.heading}>{section.title}</Text><Text style={s.body}>{section.text}</Text><Text style={s.english}>{section.example}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`شنیدن آموزش: ${section.title}`} onPress={() => onSpeak(section.audio ?? section.example.replace(/\/[^/]+\//g, ''))} style={s.button}><Text style={s.buttonText}>شنیدن نمونهٔ آموزش</Text></Pressable>
    </View>)}
    <Pressable accessibilityRole="button" onPress={() => onOpenCore(support.afterLessonId)} style={s.button}><Text style={s.buttonText}>بازکردن درس پیشنهادی مسیر اصلی</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={onOpenCourse} style={s.button}><Text style={s.buttonText}>مسیر تمرین مکمل با شرایط قبلی</Text></Pressable>
  </View>;
}
const s = StyleSheet.create({
  page: { gap: 14 }, card: { width: '100%', gap: 10, padding: 14, borderWidth: 1, borderColor: '#DFE1EF', borderRadius: 14, backgroundColor: '#FFFFFF' },
  heading: { fontFamily: Typography.boldFontFamily, fontSize: 17, lineHeight: 28, color: '#302880', textAlign: 'right', writingDirection: 'rtl' },
  body: { fontFamily: Typography.fontFamily, fontSize: 14, lineHeight: 25, color: '#383D50', textAlign: 'right', writingDirection: 'rtl' },
  english: { fontFamily: Typography.latinFontFamily, fontSize: 16, lineHeight: 26, color: '#202039', textAlign: 'left', writingDirection: 'ltr' },
  button: { minHeight: 46, justifyContent: 'center', padding: 12, borderRadius: 12, backgroundColor: '#EFEEFF' },
  buttonText: { fontFamily: Typography.boldFontFamily, fontSize: 14, color: '#4137A0', textAlign: 'center', writingDirection: 'rtl' },
});
