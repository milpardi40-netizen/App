import { LocalizedText as Text } from '@/components/LocalizedText';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Typography } from '@/lib/theme';
import { englishA1Scaffold } from '@/lib/englishA1Scaffolding';
import { toPersianDigits as fa } from '@/lib/format';

/** One small teaching contrast at a time. Deliberately not a new lesson-completion gate. */
export default function EnglishA1Scaffold({ lessonId, overviewFa, onSpeak }: {
  lessonId: string;
  overviewFa: string;
  onSpeak: (text: string) => void;
}) {
  const scaffold = englishA1Scaffold(lessonId);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [examplesVisible, setExamplesVisible] = useState(true);
  const [overviewVisible, setOverviewVisible] = useState(false);
  if (!scaffold) return null;
  const step = scaffold.steps[index];
  const answer = answers[step.id];
  const correct = answer === step.correctIndex;
  const last = index === scaffold.steps.length - 1;
  const move = (next: number) => { setIndex(next); setExamplesVisible(true); };
  return <View style={s.card}>
    <Text accessibilityRole="header" style={s.title}>{scaffold.titleFa}</Text>
    <Text style={s.body}>{scaffold.prerequisiteFa}</Text>
    <Text style={s.note}>این گام‌ها تمرین اختیاری‌اند؛ می‌توانی هر زمان با «ادامه» وارد بخش بعدی درس شوی. پاسخ‌ها فقط تا وقتی این بخش باز است می‌مانند، ذخیره نمی‌شوند و نمرهٔ تسلط نیستند.</Text>
    <Text style={s.counter}>گام {fa(index + 1)} از {fa(scaffold.steps.length)}</Text>
    <Text accessibilityRole="header" style={s.heading}>{step.titleFa}</Text>
    <Text style={s.body}>{step.explanationFa}</Text>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: examplesVisible }} onPress={() => setExamplesVisible(value => !value)} style={s.button}>
      <Text style={s.buttonText}>{examplesVisible ? 'نمونه‌ها را پنهان کن و بازیابی کن' : 'دیدن دوبارهٔ نمونه‌ها'}</Text>
    </Pressable>
    {examplesVisible && step.examples.map(example => <View key={example.en} style={s.example}>
      <Text style={s.english}>{example.en}</Text><Text style={s.body}>{example.fa}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`شنیدن نمونه: ${example.en}`} onPress={() => onSpeak(example.en)} style={s.button}><Text style={s.buttonText}>شنیدن نمونه</Text></Pressable>
    </View>)}
    <Text style={s.heading}>بازیابی کوتاه</Text><Text style={s.body}>{step.recallFa}</Text>
    <Text style={s.heading}>{step.questionFa}</Text>
    {step.choices.map((choice, n) => <Pressable key={choice} accessibilityRole="radio" accessibilityState={{ checked: answer === n }} onPress={() => setAnswers(previous => ({ ...previous, [step.id]: n }))} style={[s.choice, answer === n && s.selected]}>
      <Text style={s.english}>{choice}</Text>
    </Pressable>)}
    {answer !== undefined && <Text accessibilityLiveRegion="polite" style={s.body}>{correct ? 'این پاسخ درست است. ' : 'این گزینه درست نیست. '}{step.feedbackFa}{correct ? '' : ' دوباره انتخاب کن.'}</Text>}
    <View style={s.controls}>
      {index > 0 && <Pressable accessibilityRole="button" onPress={() => move(index - 1)} style={s.button}><Text style={s.buttonText}>گام قبل</Text></Pressable>}
      {!last && <Pressable accessibilityRole="button" accessibilityState={{ disabled: !correct }} disabled={!correct} onPress={() => { if (correct) move(index + 1); }} style={[s.button, !correct && s.disabled]}><Text style={s.buttonText}>گام بعد</Text></Pressable>}
      {last && correct && <Pressable accessibilityRole="button" onPress={() => move(0)} style={s.button}><Text style={s.buttonText}>مرور از گام اول</Text></Pressable>}
    </View>
    {last && correct && <Text style={s.note}>مرور هدایت‌شده به پایان رسید؛ حالا در بخش تمرین کاربردی، اطلاعات تازه را به کار ببر. درست‌بودن این چند پاسخ، تسلط مستقل را ثابت نمی‌کند.</Text>}
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: overviewVisible }} onPress={() => setOverviewVisible(value => !value)} style={s.button}><Text style={s.buttonText}>نقشهٔ کامل درس و تکلیف تولیدی {overviewVisible ? '−' : '+'}</Text></Pressable>
    {overviewVisible && <Text style={s.body}>{overviewFa}</Text>}
  </View>;
}
const s = StyleSheet.create({
  card: { width: '100%', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#D8D5F0', backgroundColor: '#FFFFFF', gap: 12 },
  title: { fontFamily: Typography.boldFontFamily, fontSize: 19, lineHeight: 30, color: '#302880', textAlign: 'right', writingDirection: 'rtl' },
  heading: { fontFamily: Typography.boldFontFamily, fontSize: 16, lineHeight: 26, color: '#202039', textAlign: 'right', writingDirection: 'rtl' },
  body: { fontFamily: Typography.fontFamily, fontSize: 15, lineHeight: 27, color: '#30364A', textAlign: 'right', writingDirection: 'rtl' },
  note: { fontFamily: Typography.fontFamily, fontSize: 13, lineHeight: 24, color: '#555B70', textAlign: 'right', writingDirection: 'rtl' },
  counter: { fontFamily: Typography.boldFontFamily, fontSize: 14, color: '#5148C8', textAlign: 'right' },
  english: { fontFamily: Typography.latinFontFamily, fontSize: 16, lineHeight: 27, color: '#202039', textAlign: 'left', writingDirection: 'ltr' },
  example: { backgroundColor: '#F5F5FC', borderRadius: 12, padding: 12, gap: 8 },
  button: { minHeight: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: '#EFEEFF', padding: 12 },
  buttonText: { fontFamily: Typography.boldFontFamily, fontSize: 14, color: '#4137A0', textAlign: 'center', writingDirection: 'rtl' },
  choice: { minHeight: 48, justifyContent: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#D8DAE8' },
  selected: { backgroundColor: '#F1F0FF', borderColor: '#5148C8' },
  controls: { flexDirection: 'row-reverse', gap: 10, flexWrap: 'wrap' },
  disabled: { opacity: 0.45 },
});
