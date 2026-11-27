import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { ENGLISH_A1_INTERACTIONS } from '@/lib/englishA1Interactions';
import { Typography } from '@/lib/theme';

export default function EnglishA1Interaction({ lessonId, onSpeak }: { lessonId: string; onSpeak: (text: string, rate?: number) => void }) {
  const task = ENGLISH_A1_INTERACTIONS[lessonId];
  const [open, setOpen] = useState(false);
  const [firstAttempt, setFirstAttempt] = useState(false);
  const [branch, setBranch] = useState<number | null>(null);
  const [secondAttempt, setSecondAttempt] = useState(false);
  const [checks, setChecks] = useState<number[]>([]);
  if (!task) return null;
  const reset = () => { setFirstAttempt(false); setBranch(null); setSecondAttempt(false); setChecks([]); };
  const follow = branch === null ? null : task.branches[branch];
  const partner = (text: string) => <View style={s.card}>
    <Text style={s.english}>{text}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`شنیدن نوبت مخاطب: ${text}`} onPress={() => onSpeak(text, 1)} style={s.button}><Text style={s.buttonText}>شنیدن مخاطب</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={() => onSpeak(text, 0.5)} style={s.button}><Text style={s.buttonText}>دوباره و آهسته</Text></Pressable>
  </View>;
  return <View style={s.card}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => { setOpen(value => !value); reset(); }} style={s.button}><Text style={s.heading}>تمرین اختیاری · پاسخ و روشن‌سازی {open ? '−' : '+'}</Text></Pressable>
    {open && <>
      <Text style={s.body}>{task.contextFa}</Text>
      <Text style={s.note}>این تمرین دو نوبتِ ازپیش‌نوشته دارد. برنامه صدایت را نمی‌شنود و پاسخ را تحلیل نمی‌کند؛ خودت مسیر تمرین را انتخاب می‌کنی. ابتدا بلند پاسخ بده، بعد یک نمونه را ببین.</Text>
      {partner(task.first.text)}<Text style={s.body}>{task.first.goalFa}</Text>
      <Pressable accessibilityRole="button" onPress={() => setFirstAttempt(true)} style={s.button}><Text style={s.buttonText}>پاسخ اول را گفتم؛ دیدن یک نمونه</Text></Pressable>
      {firstAttempt && <>
        <Text style={s.note}>این فقط یک پاسخ ممکن است؛ عبارت‌های درستِ دیگر هم ممکن‌اند. دکمهٔ بالا خوداظهاری است، نه ارزیابی گفتار.</Text>
        <Text style={s.english}>{task.first.example}</Text>
        <Text style={s.heading}>یک مسیر را خودت انتخاب کن</Text>
        {task.branches.map((item, index) => <Pressable key={item.labelFa} accessibilityRole="radio" accessibilityState={{checked:branch===index}} onPress={() => { setBranch(index); setSecondAttempt(false); setChecks([]); }} style={s.button}><Text style={s.buttonText}>{item.labelFa}</Text></Pressable>)}
      </>}
      {follow && <>
        {partner(follow.text)}<Text style={s.body}>{follow.goalFa}</Text>
        <Pressable accessibilityRole="button" onPress={() => setSecondAttempt(true)} style={s.button}><Text style={s.buttonText}>پاسخ دوم را گفتم؛ دیدن یک نمونه</Text></Pressable>
        {secondAttempt && <>
          <Text style={s.english}>{follow.example}</Text><Text style={s.heading}>خودسنجی همین اجرا</Text>
          {task.checksFa.map((item,index) => <Pressable key={item} accessibilityRole="checkbox" accessibilityState={{checked:checks.includes(index)}} onPress={() => setChecks(previous=>previous.includes(index)?previous.filter(n=>n!==index):[...previous,index])} style={s.button}><Text style={s.body}>{checks.includes(index)?'✓ ':''}{item}</Text></Pressable>)}
          <Pressable accessibilityRole="button" onPress={reset} style={s.button}><Text style={s.buttonText}>تمرین دوباره با مسیر دیگر</Text></Pressable>
        </>}
      </>}
      <Text style={s.note}>پاسخ‌ها و تیک‌ها ذخیره نمی‌شوند، روی نمره و پایان درس اثری ندارند و تسلط مستقل را ثابت نمی‌کنند. اتاق گفت‌وگوی اصلی زیر این بخش با سابقهٔ قبلی خودش باقی است.</Text>
    </>}
  </View>;
}
const s = StyleSheet.create({
  card:{width:'100%',padding:14,gap:12,borderRadius:16,borderWidth:1,borderColor:'#DFE1EF',backgroundColor:'#FFFFFF'},
  heading:{fontFamily:Typography.boldFontFamily,fontSize:16,lineHeight:28,color:'#302880',textAlign:'right',writingDirection:'rtl'},
  body:{fontFamily:Typography.fontFamily,fontSize:14,lineHeight:25,color:'#383D50',textAlign:'right',writingDirection:'rtl'},
  note:{fontFamily:Typography.fontFamily,fontSize:13,lineHeight:24,color:'#555B70',textAlign:'right',writingDirection:'rtl'},
  english:{fontFamily:Typography.latinFontFamily,fontSize:16,lineHeight:27,color:'#202039',textAlign:'left',writingDirection:'ltr'},
  button:{minHeight:46,justifyContent:'center',padding:12,borderRadius:12,backgroundColor:'#EFEEFF'},
  buttonText:{fontFamily:Typography.boldFontFamily,fontSize:14,lineHeight:24,color:'#4137A0',textAlign:'center',writingDirection:'rtl'},
});
