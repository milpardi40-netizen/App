import { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LocalizedText as Text, LocalizedTextInput as TextInput } from './LocalizedText';
import { PageNavigation } from './PageNavigation';
import { Action, Hear, Panel, w } from './RussianWorkshopUI';
import { GRAMMAR_BANDS, GRAMMAR_UNITS, type GrammarUnit } from '@/lib/languages/russianGrammar/units';
import { VERBS, gapFor, lessonVerbs, normalize, relatedUnits, verbExamples, type Verb } from '@/lib/languages/russianGrammar/catalog';
import { findRussianLesson, type RussianCourseLesson } from '@/lib/languages/russian';
import { playRussianSpeech, stopRussianSpeech } from '@/lib/russianSpeech';
import { narrationRate } from '@/lib/narration';
import { toPersianDigits as fa } from '@/lib/format';
import { shuffleChecks } from '@/lib/shuffleChecks';

type Tutor = (text: string) => void;
function Guidance({ unit, speak }: { unit: GrammarUnit; speak: Tutor }) {
  const [chosen, setChosen] = useState('');
  return <Panel><Text style={w.kicker}>{GRAMMAR_BANDS[unit.level]} · {unit.group}</Text><Text style={w.title}>{unit.title}</Text><Text style={w.copy}>{unit.note}</Text>
    {unit.examples.map(s => <View key={s.text} style={w.sample}><Text style={w.ru}>{s.text}</Text><Text style={w.copy}>{s.fa}</Text><Text style={w.kicker}>{s.pronunciation}</Text><Hear text={s.text} speak={speak} /></View>)}
    <Text style={w.title}>نوبت تو</Text><Text style={w.copy}>{unit.prompt}</Text><View style={w.row}>{unit.choices.map(c => <Action key={c} label={c} onPress={() => { setChosen(c); speak(c); }} active={c === chosen} />)}</View>
    {!!chosen && <Text accessibilityLiveRegion="polite" style={w.copy}>{chosen === unit.answer ? `درست است. ${unit.why}` : `دوباره امتحان کن. ${unit.why}`}</Text>}
  </Panel>;
}
function VerbPractice({ verb, lesson, speak }: { verb: Verb; lesson?: RussianCourseLesson; speak: Tutor }) {
  const examples = useMemo(() => verbExamples(verb, lesson), [verb, lesson]);
  const [index, setIndex] = useState(0), [choice, choose] = useState(''), [training, setTraining] = useState(false);
  const s = examples[index];
  const picks = useMemo(() => {
    const pool = [s.form, ...verb.forms, 'понимаю', 'будем', 'говорят'];
    const distinct = pool.filter((v, i) => pool.findIndex(x => normalize(x) === normalize(v)) === i).slice(0, 3);
    return shuffleChecks(verb.lemma, [{ promptFa: s.text, choices: distinct, correctIndex: 0, explanationFa: '' }])[0].choices;
  }, [s, verb]);
  return <Panel><Text style={w.kicker}>فعل در کاربرد · {GRAMMAR_BANDS[verb.level]}</Text><Text style={w.ru}>{verb.lemma}</Text><Text style={w.title}>{verb.fa}</Text><Hear text={verb.lemma} speak={speak} />
    <Text style={w.kicker}>{training ? 'گوش کن و شکل فعل را در همین جمله پیدا کن.' : 'نمونه را بشنو و ببین فعل چه شکلی گرفته است.'}</Text>
    <View style={w.sample}><Text style={w.ru}>{training && choice !== s.form ? gapFor(s.text, s.form) : s.text}</Text><Text style={w.copy}>{s.fa}</Text><Hear text={s.text} speak={speak} /></View>
    {training ? <><View style={w.row}>{picks.map(c => <Action key={c} active={c === choice} label={c} onPress={() => choose(c)} />)}</View>
      {!!choice && <Text accessibilityLiveRegion="polite" style={w.copy}>{choice === s.form ? `درست است: ${s.form}، از فعل ${verb.lemma}.` : 'این همان شکلی نیست که شنیدی. جمله را دوباره بشنو.'}</Text>}</> : <Action label="تمرین همین مثال" onPress={() => { setTraining(true); speak(s.text); }} />}
    {examples.length > 1 && <Action label={`مثال بعدی · ${fa(index + 1)} از ${fa(examples.length)}`} onPress={() => { setIndex((index + 1) % examples.length); choose(''); setTraining(false); }} />}
  </Panel>;
}
export default function RussianGrammarWorkshop({ lessonId }: { lessonId?: string }) {
  const lesson = findRussianLesson(lessonId), list = useRef<ScrollView>(null);
  const [scoped, scope] = useState(!!lesson), [tab, setTab] = useState<'guide'|'verbs'>('guide');
  const [band, setBand] = useState(-1), [query, setQuery] = useState(''), [page, setPage] = useState(0);
  const [unit, openUnit] = useState<GrammarUnit | null>(null), [verb, openVerb] = useState<Verb | null>(null), [soundError, setSoundError] = useState('');
  useFocusEffect(useCallback(() => () => { void stopRussianSpeech(); }, []));
  const speak = (text: string) => { setSoundError(''); void playRussianSpeech(text, narrationRate('ru-RU','listen'), () => setSoundError('پخش روسی در دستگاه در دسترس نیست. متن، معنی و تمرین همچنان قابل استفاده‌اند.')); };
  const goTop = () => list.current?.scrollTo({ y: 0, animated: false });
  const selectedLesson = scoped ? lesson : undefined;
  const ids = useMemo(() => new Set(selectedLesson ? lessonVerbs(selectedLesson.id) : []), [selectedLesson]);
  const verbs = useMemo(() => VERBS.filter(v => (!selectedLesson || ids.has(v.lemma)) && (band < 0 || v.level === band) &&
    [v.lemma, v.fa, ...v.forms].some(f => normalize(f).includes(normalize(query)))), [selectedLesson, ids, band, query]);
  const units = useMemo(() => selectedLesson ? relatedUnits(selectedLesson) : GRAMMAR_UNITS.filter(u => band < 0 || u.level === band), [selectedLesson, band]);
  const detail = !!unit || !!verb;
  const closeDetail = () => { void stopRussianSpeech(); openVerb(null); openUnit(null); goTop(); };
  const showVerb = (v: Verb) => { openVerb(v); goTop(); };
  return <View style={styles.root}><ScrollView ref={list} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
    <View style={styles.head}><View style={{ flex: 1 }}><Text style={w.kicker}>کارگاه روسی · از پایه تا پیشرفته</Text><Text accessibilityRole="header" style={w.title}>فعل و ضمیر</Text></View><PageNavigation backFallback="/learn/ru" /></View>
    {!!soundError && <Text accessibilityRole="alert" style={w.copy}>{soundError}</Text>}
    {detail ? <><Action label="بازگشت به فهرست کارگاه" onPress={closeDetail} />{unit ? <Guidance key={unit.id} unit={unit} speak={speak}/> : verb && <VerbPractice key={verb.lemma} verb={verb} lesson={selectedLesson} speak={speak}/>}</> : <>
      <Panel><Text style={w.copy}>{selectedLesson ? `مثال‌ها و ساخت‌های مرتبط با «${selectedLesson.title}»` : 'اگر تازه شروع کرده‌ای، از راهنمای «من می‌خواهم» شروع کن. برای پیدا کردن یک فعل، مصدر، شکل شنیده‌شده یا معنی فارسی‌اش را جست‌وجو کن.'}</Text>
        {lesson && <Action label={scoped ? 'دیدن کل کارگاه' : 'فقط مطالب همین درس'} onPress={() => { scope(!scoped); setBand(-1); setQuery(''); setPage(0); }} />}
        <View style={w.row}><Action label="راهنمای فعل و ضمیر" active={tab === 'guide'} onPress={() => setTab('guide')}/><Action label={`فعل‌ها · ${fa(selectedLesson ? ids.size : VERBS.length)}`} active={tab === 'verbs'} onPress={() => setTab('verbs')}/></View>
        {!selectedLesson && <View style={w.row}>{['همه', ...GRAMMAR_BANDS].map((b,i) => <Action key={b} label={b} active={band === i-1} onPress={() => { setBand(i-1); setPage(0); }} />)}</View>}
      </Panel>
      {tab === 'guide' ? <>
        {units.map(u => <Action key={u.id} label={`${GRAMMAR_BANDS[u.level]} · ${u.title}`} onPress={() => { openUnit(u); goTop(); }} />)}
        {selectedLesson && !units.length && <Text style={w.copy}>این درس یک الگوی ضمیریِ تازه ندارد. شکل‌های فعلش را در ادامه ببین.</Text>}
        {selectedLesson && <Panel><Text style={w.title}>فعل‌های همین درس</Text>{verbs.length ? <View style={w.row}>{verbs.slice(0,8).map(v => <Action key={v.lemma} label={v.lemma} onPress={() => showVerb(v)} />)}</View> : <Text style={w.copy}>در نمونه‌های این درس فعل صرف‌شده‌ای لازم نیست.</Text>}<Action label="فهرست فعل‌ها" onPress={() => setTab('verbs')} /></Panel>}
      </> : <>
        <TextInput accessibilityLabel="جست‌وجوی فعل" placeholder="مثلاً хочу یا خواستن" value={query} onChangeText={q => { setQuery(q); setPage(0); }} style={w.input}/>
        <Text style={w.kicker}>{fa(verbs.length)} فعل · به ترتیب نخستین سطح کاربرد</Text>
        {verbs.slice(page * 18, page * 18 + 18).map(v => <Action key={v.lemma} label={`${v.lemma} · ${v.fa}`} onPress={() => showVerb(v)} />)}
        {!verbs.length && <Text style={w.copy}>فعلی با این جست‌وجو پیدا نشد. واژه یا فیلتر سطح را عوض کن.</Text>}
        {verbs.length > 18 && <View style={w.row}><Action label="صفحهٔ قبل" muted={page === 0} onPress={() => { setPage(page - 1); goTop(); }} /><Text style={w.copy}>{fa(page+1)} / {fa(Math.ceil(verbs.length/18))}</Text><Action label="صفحهٔ بعد" muted={(page+1)*18 >= verbs.length} onPress={() => { setPage(page+1); goTop(); }} /></View>}
      </>}
    </>}
  </ScrollView></View>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#F4F7F9' }, page: { width: '100%', maxWidth: 800, alignSelf: 'center', padding: 16, gap: 11, paddingBottom: 64 }, head: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingVertical: 10 } });
