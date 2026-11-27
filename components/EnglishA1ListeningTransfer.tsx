import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { EnglishSupplementTask } from '@/components/EnglishSupplementTask';
import type { A1SkillTask } from '@/lib/languages/a1Skills';
import { Typography } from '@/lib/theme';

/** Uses the existing complete-playback check, but explicitly NEVER saves optional evidence. */
export default function EnglishA1ListeningTransfer({ lessonId, task }: { lessonId: string; task: A1SkillTask }) {
  const [open, setOpen] = useState(false);
  const [transcript, setTranscript] = useState(false);
  return <View style={s.card}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => { setOpen(value => !value); setTranscript(false); }} style={s.button}><Text style={s.heading}>تمرین اختیاری · شنیدن اطلاعات تازه {open ? '−' : '+'}</Text></Pressable>
    {open && <>
      <Text style={s.body}>پیام تازه را کامل بشنو و پاسخ بده. متن پس از یک پاسخ درست نمایش داده می‌شود. اگر صدا کار نمی‌کند می‌توانی ادامه بدهی؛ این تمرین شرط پایان درس نیست. صدا با موتور گفتار ساخته می‌شود.</Text>
      <EnglishSupplementTask task={{ id: `en-a1-listening-transfer-v1:${lessonId}`, skill: 'listening', audio: task.passage, prompt: task.promptFa, options: [...task.choices], answers: [task.choices[task.correctIndex]], explanation: task.explanationFa }}
        showExplanationOnCorrect audioRate={1} slowAudioRate={0.5}
        onSave={async (_task, correct, heard) => { setTranscript(correct && heard); }}
      />
      {transcript && <Text style={s.english}>{task.passage}</Text>}
      <Text style={s.body}>پاسخ این بخش ذخیره نمی‌شود، نمرهٔ درس را تغییر نمی‌دهد و قبولی آن اثبات تسلط شنیداری نیست.</Text>
    </>}
  </View>;
}
const s = StyleSheet.create({
  card: { width: '100%', marginTop: 16, padding: 14, gap: 12, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DFE1EF' },
  button: { minHeight: 46, justifyContent: 'center', padding: 8 },
  heading: { fontFamily: Typography.boldFontFamily, fontSize: 16, lineHeight: 28, color: '#302880', textAlign: 'right', writingDirection: 'rtl' },
  body: { fontFamily: Typography.fontFamily, fontSize: 14, lineHeight: 25, color: '#383D50', textAlign: 'right', writingDirection: 'rtl' },
  english: { fontFamily: Typography.latinFontFamily, fontSize: 16, lineHeight: 27, color: '#202039', textAlign: 'left', writingDirection: 'ltr' },
});
