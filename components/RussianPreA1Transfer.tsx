import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LocalizedText as Text, LocalizedTextInput as TextInput } from '@/components/LocalizedText';
import { Typography } from '@/lib/theme';
import { RUSSIAN_PRE_A1_EVERYDAY, RUSSIAN_PRE_A1_TRANSFERS, type RussianPreA1EverydayPanel, type RussianPreA1Transfer, type RussianPreA1TransferCase } from '@/lib/languages/russianPreA1Phase3';

type Props={lessonId:string;onSpeak:(text:string)=>void};
/** Additional examples are reachable in vocabulary, never forced into the saved core quiz. */
export function RussianPreA1Everyday({lessonId,onSpeak}:Props){
 const panel=RUSSIAN_PRE_A1_EVERYDAY[lessonId];
 return panel?<EverydayPanel key={lessonId} panel={panel} onSpeak={onSpeak}/>:null;
}
function EverydayPanel({panel,onSpeak}:{panel:RussianPreA1EverydayPanel;onSpeak:Props['onSpeak']}){
 const [index,setIndex]=useState(0);const row=panel.rows[index];
 return <View style={s.card}>
  <Text accessibilityRole="header" style={s.title}>{panel.titleFa}</Text>
  <Text style={s.body}>{panel.noteFa}</Text>
  <Text style={s.note}>عبارت‌های کاربردیِ بیشتر؛ اختیاری و بدون نمره. نقشِ تمرین را انتخاب کن، نه اینکه مجبور باشی اطلاعات واقعی خودت را ثبت کنی.</Text>
  {panel.rows.length>1?<View style={s.controls}>{panel.rows.map((item,i)=><Pressable key={item.id} accessibilityRole="radio" accessibilityLabel={`عبارت کاربردی: ${item.id}`} accessibilityState={{checked:index===i}} style={[s.button,index===i&&s.selected]} onPress={()=>setIndex(i)}><Text style={s.buttonText}>{item.labelFa}</Text></Pressable>)}</View>:null}
  <Text style={s.foreign}>{row.text}</Text><Text style={s.body}>{row.fa}</Text>
  <Text style={s.note}>{row.pronunciationFa}</Text><Text style={s.body}>{row.noteFa}</Text>
  <Pressable accessibilityRole="button" accessibilityLabel="شنیدن عبارت کاربردی" style={s.button} onPress={()=>onSpeak(row.text)}><Text style={s.buttonText}>شنیدن همین نمونه</Text></Pressable>
 </View>;
}
/** No automatic language grade: a short independent attempt followed by optional self-comparison. */
export default function RussianPreA1Transfer({lessonId,onSpeak}:Props){
 const practice=RUSSIAN_PRE_A1_TRANSFERS[lessonId];
 return practice?<TransferPanel key={lessonId} practice={practice} onSpeak={onSpeak}/>:null;
}
function TransferPanel({practice,onSpeak}:{practice:RussianPreA1Transfer;onSpeak:Props['onSpeak']}){
 const [open,setOpen]=useState(false);const [index,setIndex]=useState(0);
 return <View style={s.card}>
  <Text accessibilityRole="header" style={s.title}>کاربرد کوتاه با اطلاعات تازه</Text>
  <Text style={s.body}>{practice.titleFa}</Text>
  <Text style={s.note}>اختیاری است و شرط «ادامه» نیست. می‌توانی فقط شفاهی جواب بدهی یا یک پاسخ کوتاه بنویسی؛ نوشته و انتخاب‌ها ذخیره یا نمره‌گذاری نمی‌شوند. از اطلاعات خیالیِ کارت استفاده کن.</Text>
  <Pressable accessibilityRole="button" accessibilityLabel="بازکردن تمرین انتقال روسی" accessibilityState={{expanded:open}} style={s.button} onPress={()=>setOpen(v=>!v)}><Text style={s.buttonText}>{open?'بستن تمرین کوتاه':'امتحان با اطلاعات تازه'}</Text></Pressable>
  {open?<>
   <View style={s.controls}>{practice.cases.map((item,i)=><Pressable key={item.id} accessibilityRole="radio" accessibilityLabel={`کارت تازه ${i+1}`} accessibilityState={{checked:index===i}} style={[s.button,index===i&&s.selected]} onPress={()=>setIndex(i)}><Text style={s.buttonText}>کارت {i===0?'اول':'دوم'}</Text></Pressable>)}</View>
   <TransferAttempt key={practice.cases[index].id} item={practice.cases[index]} hintFa={practice.hintFa} onSpeak={onSpeak}/>
  </>:null}
 </View>;
}
function TransferAttempt({item,hintFa,onSpeak}:{item:RussianPreA1TransferCase;hintFa:string;onSpeak:Props['onSpeak']}){
 const [draft,setDraft]=useState('');const [sample,setSample]=useState(false);const [hint,setHint]=useState(false);
 return <View style={s.stack}>
  <Text style={s.facts}>{item.factsFa}</Text><Text style={s.body}>{item.taskFa}</Text>
  <TextInput accessibilityLabel="پاسخ کوتاه اختیاری روسی" value={draft} onChangeText={setDraft} placeholder="اگر خواستی، پاسخ کوتاه را اینجا بنویس" maxLength={160} multiline autoCorrect={false} autoCapitalize="sentences" style={s.input}/>
  <Pressable accessibilityRole="button" accessibilityLabel="راهنمای کوتاه انتقال" accessibilityState={{expanded:hint}} style={s.button} onPress={()=>setHint(v=>!v)}><Text style={s.buttonText}>{hint?'پنهان‌کردن راهنما':'یک راهنمای کوتاه'}</Text></Pressable>
  {hint?<Text style={s.body}>{hintFa}</Text>:null}
  <Pressable accessibilityRole="button" accessibilityLabel="مقایسه با یک نمونه روسی" accessibilityState={{expanded:sample}} style={s.button} onPress={()=>setSample(v=>!v)}><Text style={s.buttonText}>{sample?'پنهان‌کردن نمونه و تلاش دوباره':'دیدن یک نمونه برای مقایسه'}</Text></Pressable>
  {sample?<View style={s.model}>
   <Text style={s.foreign}>{item.sample}</Text><Text style={s.body}>{item.sampleFa}</Text><Text style={s.body}>{item.feedbackFa}</Text>
   <Text style={s.note}>این فقط یک نمونه است؛ بیانِ درستِ دیگری هم ممکن است. این بخش نوشتهٔ تو را خودکار درست/غلط اعلام نمی‌کند و مدرک تسلط نیست.</Text>
   <Pressable accessibilityRole="button" accessibilityLabel="شنیدن نمونهٔ انتقال" style={s.button} onPress={()=>onSpeak(item.sample)}><Text style={s.buttonText}>شنیدن نمونه برای مقایسه</Text></Pressable>
  </View>:null}
 </View>;
}
const s=StyleSheet.create({
 card:{width:'100%',padding:16,gap:12,borderRadius:16,borderWidth:1,borderColor:'#DDD8F0',backgroundColor:'#FFFFFF'},
 stack:{gap:12},title:{fontFamily:Typography.boldFontFamily,fontSize:17,lineHeight:28,color:'#302880',textAlign:'right',writingDirection:'rtl'},
 body:{fontFamily:Typography.fontFamily,fontSize:15,lineHeight:27,color:'#30364A',textAlign:'right',writingDirection:'rtl'},
 note:{fontFamily:Typography.fontFamily,fontSize:13,lineHeight:24,color:'#555B70',textAlign:'right',writingDirection:'rtl'},
 facts:{fontFamily:Typography.boldFontFamily,fontSize:16,lineHeight:28,color:'#242043',textAlign:'right',writingDirection:'rtl'},
 foreign:{fontFamily:Typography.latinFontFamily,fontSize:21,lineHeight:34,color:'#202039',textAlign:'left',writingDirection:'ltr'},
 controls:{gap:8},button:{minHeight:44,padding:12,borderRadius:12,backgroundColor:'#EFEEFF',justifyContent:'center'},
 buttonText:{fontFamily:Typography.boldFontFamily,fontSize:14,color:'#4137A0',textAlign:'center',writingDirection:'rtl'},
 selected:{backgroundColor:'#E4E1FF',borderColor:'#5148C8',borderWidth:1},
 model:{padding:12,gap:8,borderRadius:12,backgroundColor:'#F5F5FC'},
 input:{minHeight:70,padding:12,borderWidth:1,borderColor:'#D8DAE8',borderRadius:12,fontFamily:Typography.latinFontFamily,fontSize:18,color:'#202039',textAlign:'left',writingDirection:'ltr'},
});
