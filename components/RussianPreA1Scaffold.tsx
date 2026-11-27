import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { Typography } from '@/lib/theme';
import { russianPreA1Reading, type RussianPreA1ReadingCard } from '@/lib/languages/russianPreA1Reading';
import { RUSSIAN_PRE_A1_LIGHT_VERBS, RUSSIAN_PRE_A1_LIGHT_VERBS_ID, RUSSIAN_PRE_A1_VERB_STEPS, russianPreA1VerbStep } from '@/lib/languages/russianPreA1Phase2';

/** Read-only, optional support in the existing introduction. No storage or completion gate. */
export default function RussianPreA1Scaffold({lessonId,onSpeak}:{lessonId:string;onSpeak:(text:string)=>void}) {
  const card=russianPreA1Reading(lessonId);
  if(!card)return null;
  return <View style={s.stack}>
    {lessonId===RUSSIAN_PRE_A1_LIGHT_VERBS_ID ? <VerbSteps key={`verbs:${lessonId}`} onSpeak={onSpeak}/> : null}
    <ReadingPractice key={lessonId} card={card} onSpeak={onSpeak}/>
  </View>;
}
function ReadingPractice({card,onSpeak}:{card:RussianPreA1ReadingCard;onSpeak:(text:string)=>void}) {
  const [guide,setGuide]=useState(card.showAidInitially);
  const [answer,setAnswer]=useState<string|null>(null);
  // Alternate positions by a stable ID, never regenerate options during a render.
  const choices=card.lessonId.length%2 ? [card.word,card.distractor] : [card.distractor,card.word];
  return <View style={s.card}>
    <Text accessibilityRole="header" style={s.title}>خواندن سیریلیک · یک گام کوتاه</Text>
    <Text style={s.foreign}>{card.letters}</Text>
    <Text style={s.body}>{card.noteFa}</Text>
    <Text style={s.note}>تمرین اختیاریِ خواندن با کمک است، نه آزمون شنیدن یا نمرهٔ تسلط. اول شکل واژه را بخوان؛ اگر لازم شد صدا و راهنما را بگیر. با «ادامه» می‌توانی وارد درس شوی.</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="راهنمای خواندن سیریلیک" accessibilityState={{expanded:guide}} style={s.button} onPress={()=>setGuide(v=>!v)}><Text style={s.buttonText}>{guide?'پنهان‌کردن بخش‌بندی و راهنمای فارسی':'دیدن بخش‌بندی و راهنمای فارسی'}</Text></Pressable>
    {guide ? <View style={s.model}>
      <Text style={s.foreign}>{card.chunks.join(' · ')}</Text>
      <Text style={s.foreign}>{card.word}</Text>
      <Text style={s.body}>{card.pronunciationFa}</Text>
      <Text style={s.note}>این بخش‌ها کمکِ دیداری‌اند، نه لزوماً هجاهای دستوری؛ در پایان واژه را پیوسته بخوان. تلفظ فارسی تقریبی است.</Text>
    </View> : null}
    <Text style={s.body}>کدام واژهٔ همین درس با این معنی می‌آید؟ {card.meaningFa}</Text>
    {choices.map(choice=><Pressable key={choice} accessibilityRole="radio" accessibilityLabel={`واژهٔ خواندن: ${choice}`} accessibilityState={{checked:answer===choice}} onPress={()=>setAnswer(choice)} style={[s.choice,answer===choice&&s.selected]}><Text style={s.foreign}>{choice}</Text></Pressable>)}
    {answer!==null ? <Text accessibilityLiveRegion="polite" style={s.body}>{answer===card.word?'این انتخاب درست است؛ یک بار بدون راهنمای فارسی بخوان و بعد با صدا مقایسه کن.':'این انتخاب با معنی خواسته‌شده نمی‌خواند. به شکل حروف نگاه کن؛ می‌توانی راهنما را باز کنی و دوباره انتخاب کنی.'}</Text> : null}
    <Pressable accessibilityRole="button" accessibilityLabel="شنیدن واژهٔ خواندن" onPress={()=>onSpeak(card.word)} style={s.button}><Text style={s.buttonText}>شنیدن واژه برای مقایسه</Text></Pressable>
    <Text style={s.note}>پاسخ این کارت فقط تا زمان بازبودن آن می‌ماند؛ ذخیره نمی‌شود و شرط پایان درس نیست.</Text>
  </View>;
}
function VerbSteps({onSpeak}:{onSpeak:(text:string)=>void}) {
  const [index,setIndex]=useState(0);
  const [models,setModels]=useState(true);
  const step=RUSSIAN_PRE_A1_VERB_STEPS[index];
  return <View style={s.card}>
    <Text accessibilityRole="header" style={s.title}>درس ۱۲ · سه گام به‌جای یک فهرست افعال</Text>
    <Text style={s.note}>آموزش اصلی هشت ردیف کوتاه دارد. این مرورِ گام‌به‌گام اختیاری است؛ نمره و ذخیره ندارد و «ادامه» به پاسخ آن وابسته نیست.</Text>
    <View style={s.controls}>{RUSSIAN_PRE_A1_VERB_STEPS.map((item,i)=><Pressable key={item.start} accessibilityRole="button" accessibilityLabel={`گام کوتاه افعال ${i+1}`} accessibilityState={{selected:index===i}} style={[s.button,index===i&&s.selected]} onPress={()=>{setIndex(i);setModels(true);}}><Text style={s.buttonText}>{item.title}</Text></Pressable>)}</View>
    <Text accessibilityRole="header" style={s.title}>{step.title}</Text>
    <Text style={s.body}>{step.note}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="نمایش نمونه‌های گام افعال" accessibilityState={{expanded:models}} style={s.button} onPress={()=>setModels(v=>!v)}><Text style={s.buttonText}>{models?'نمونه‌ها را پنهان کن':'دیدن دوبارهٔ نمونه‌ها'}</Text></Pressable>
    {models ? RUSSIAN_PRE_A1_LIGHT_VERBS.slice(step.start,step.end).map(row=><View key={row.text} style={s.model}>
      <Text style={s.foreign}>{row.text}</Text><Text style={s.body}>{row.fa}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`شنیدن گام افعال: ${row.text}`} style={s.button} onPress={()=>onSpeak(row.text)}><Text style={s.buttonText}>شنیدن نمونه</Text></Pressable>
    </View>) : null}
    <Text style={s.body}>{step.recall}</Text>
    <Text style={s.note}>می‌توانی همین‌جا مکث کنی. گام بعد، یک گروه دیگر است؛ قرار نیست همهٔ جمله‌ها را پشت سر هم در یک پاسخ بگویی.</Text>
  </View>;
}
/** The same pacing labels accompany the real eight speaking targets, not just the overview. */
export function RussianPreA1VerbPacing({lessonId,sentenceIndex}:{lessonId:string;sentenceIndex:number}) {
  const step=russianPreA1VerbStep(lessonId,sentenceIndex);
  return step ? <View style={s.card}><Text accessibilityRole="header" style={s.title}>{step.title}</Text><Text style={s.body}>{step.note}</Text></View> : null;
}
const s=StyleSheet.create({
  stack:{width:'100%',gap:14},
  card:{width:'100%',padding:16,gap:12,borderRadius:16,borderWidth:1,borderColor:'#DDD8F0',backgroundColor:'#FFFFFF'},
  title:{fontFamily:Typography.boldFontFamily,fontSize:17,lineHeight:28,color:'#302880',textAlign:'right',writingDirection:'rtl'},
  body:{fontFamily:Typography.fontFamily,fontSize:15,lineHeight:27,color:'#30364A',textAlign:'right',writingDirection:'rtl'},
  note:{fontFamily:Typography.fontFamily,fontSize:13,lineHeight:24,color:'#555B70',textAlign:'right',writingDirection:'rtl'},
  foreign:{fontFamily:Typography.latinFontFamily,fontSize:21,lineHeight:34,color:'#202039',textAlign:'left',writingDirection:'ltr'},
  model:{padding:12,gap:8,backgroundColor:'#F5F5FC',borderRadius:12},
  button:{minHeight:44,padding:12,borderRadius:12,backgroundColor:'#EFEEFF',justifyContent:'center'},
  buttonText:{fontFamily:Typography.boldFontFamily,fontSize:14,color:'#4137A0',textAlign:'center',writingDirection:'rtl'},
  controls:{gap:8},
  choice:{minHeight:48,padding:12,borderWidth:1,borderColor:'#D8DAE8',borderRadius:12},
  selected:{backgroundColor:'#F1F0FF',borderColor:'#5148C8'},
});
