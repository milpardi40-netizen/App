import {Pressable, StyleSheet, View} from 'react-native';
import {Volume2} from 'lucide-react-native';
import {LocalizedText as Text} from './LocalizedText';
import {sentenceGender} from '@/lib/gender/sentence';
import {genderLesson} from '@/lib/gender/lesson';
import type {Example} from '@/lib/gender/model';

/** Optional listening examples in the grammar step, never an exam or dialogue branch. */
export function LessonGenderCard({language, lesson, speak}:{language:'en'|'ru'; lesson:Parameters<typeof genderLesson>[1]; speak:(text:string)=>void}) {
  const lessonCard = genderLesson(language,lesson);
  if (!lessonCard) return null;
  const {focus,note} = lessonCard;
  const rows: [string, Example][] = lessonCard.kind === 'common' ? [['مشترک',lessonCard.shared]] :
    [['مذکر',lessonCard.masculine],['مؤنث',lessonCard.feminine]];
  if (lessonCard.kind === 'pair' && lessonCard.neuter) rows.push(['خنثی',lessonCard.neuter]);
  return <View style={s.card}>
    <Text accessibilityRole="header" style={s.heading}>مذکر و مؤنث · {focus}</Text>
    <Text style={s.note}>{note}</Text>
    {rows.map(([label,[text,fa]])=><View key={label} style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`شنیدن نمونهٔ ${label}: ${text}`} onPress={()=>speak(text)} style={s.hear}>
        <Volume2 size={19} color="#175c56"/><Text style={s.foreign}>{text}</Text>
      </Pressable>
      <Text style={s.note}>{fa}</Text>
    </View>)}
  </View>;
}
export function SentenceGenderLabel({language,text}:{language:'en'|'ru';text:string}) {
  const label=sentenceGender(language,text);
  return label ? <Text style={s.label}>{label}</Text> : null;
}
const s=StyleSheet.create({card:{alignSelf:'stretch',backgroundColor:'#f3f8f6',borderWidth:1,borderColor:'#bccec7',borderRadius:16,padding:15,gap:8},heading:{textAlign:'right',fontSize:18,fontWeight:'700',color:'#163a34'},note:{textAlign:'right',writingDirection:'rtl',color:'#344740',lineHeight:23},row:{borderTopWidth:1,borderColor:'#ccdcd6',paddingTop:8},label:{textAlign:'right',fontWeight:'700',color:'#175c56'},hear:{flexDirection:'row',alignItems:'center',justifyContent:'center',minHeight:46,gap:8},foreign:{flexShrink:1,textAlign:'center',writingDirection:'ltr',fontSize:18,color:'#192e2a'}});
