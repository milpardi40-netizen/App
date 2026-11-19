import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { LocalizedText as Text, LocalizedTextInput as TextInput } from './LocalizedText';
import { Action, Hear, Panel, w } from './RussianWorkshopUI';
import type { RussianCourseLesson } from '@/lib/languages/russian';
import { exchangeForLesson, exchangeView, matchExchangeReply, type ExchangePath } from '@/lib/languages/russianExchange';
import { stopRussianSpeech } from '@/lib/russianSpeech';

/** Dictation is opt-in, editable before sending, and never required. No recording upload. */
function Dictate({ onDraft, onNotice }: { onDraft: (t: string) => void; onNotice: (t: string) => void }) {
  const [busy, setBusy] = useState(false), live = useRef(true), owning = useRef(false);
  useEffect(() => { live.current = true; return () => { live.current = false; if (owning.current) { owning.current = false; ExpoSpeechRecognitionModule.abort(); } }; }, []);
  useSpeechRecognitionEvent('result', event => { if (owning.current && event.results[0]?.transcript) onDraft(event.results[0].transcript); });
  useSpeechRecognitionEvent('end', () => { owning.current = false; if (live.current) setBusy(false); });
  useSpeechRecognitionEvent('error', () => { if (owning.current) { owning.current = false; setBusy(false); onNotice('صدا تشخیص داده نشد. می‌توانی بنویسی یا نمونه را انتخاب کنی.'); } });
  async function start() {
    if (busy) { if (owning.current) ExpoSpeechRecognitionModule.stop(); return; }
    setBusy(true);
    try {
      await stopRussianSpeech();
      if (!live.current) return;
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!live.current) return;
      if (!granted) throw new Error('unavailable');
      owning.current = true;
      ExpoSpeechRecognitionModule.start({ lang: 'ru-RU', interimResults: true, continuous: false, maxAlternatives: 1 });
    } catch { owning.current = false; if (live.current) { setBusy(false); onNotice('میکروفن یا تشخیص روسی در دسترس نیست. نوشتن و انتخاب نمونه همچنان ممکن است.'); } }
  }
  return <Action label={busy ? 'پایان دیکته' : 'با میکروفن بگو'} onPress={() => { void start(); }} />;
}
export default function RussianTurnExchange({ lesson, path, change, speak }: { lesson: RussianCourseLesson; path: ExchangePath | null; change: (p: ExchangePath | null) => void; speak: (t: string) => void }) {
  const scene = useMemo(() => exchangeForLesson(lesson), [lesson]);
  const current = path ? exchangeView(scene, path) : null;
  const beginner = lesson.levelId <= 1, advanced = lesson.levelId >= 3;
  const [help, setHelp] = useState(false), [draft, setDraft] = useState(''), [notice, setNotice] = useState('');
  const clear = () => { setDraft(''); setNotice(''); setHelp(false); };
  const begin = (starter: ExchangePath['starter']) => { clear(); change({ starter, picks: [] }); if (starter === 'partner') speak(scene.opening.text); };
  const send = (index: number, original?: string) => {
    if (!path || !current?.options[index]) return;
    const choice = current.options[index];
    change({ ...path, picks: [...path.picks, index], ...(original ? { said: { ...path.said, [path.picks.length]: original } } : {}) });
    clear(); speak(choice.reply.text);
  };
  const submit = () => {
    const index = current ? matchExchangeReply(draft, current.options) : -1;
    if (index < 0) { setNotice('منظورت روشن نشد. این تمرین چند مسیر مشخص دارد؛ پاسخ را دقیق‌تر بگو یا از نمونه‌های همین نوبت کمک بگیر.'); return; }
    send(index, draft.trim());
  };
  return <Panel><Text style={w.kicker}>پایان درس · تمرین دونفره</Text><Text accessibilityRole="header" style={w.title}>مکالمهٔ نوبتی</Text><Text style={w.copy}>{lesson.situation}</Text>
    {!path || !current ? <><Text style={w.copy}>چه کسی شروع کند؟</Text><View style={w.row}><Action label="من شروع می‌کنم" onPress={() => begin('learner')}/><Action label="هم‌صحبت شروع کنه" onPress={() => begin('partner')}/></View></> : <>
      {current.history.map(({ who, line }, i) => <View key={i} style={[w.sample, who === 'learner' && { backgroundColor: '#EEF6EE' }]}><Text style={w.kicker}>{who === 'learner' ? 'من' : 'هم‌صحبت'}</Text><Text style={w.ru}>{line.text}</Text>{(beginner || help) && <Text style={w.copy}>{line.fa}</Text>}<Hear text={line.text} speak={speak}/></View>)}
      {current.complete ? <Text accessibilityLiveRegion="polite" style={w.copy}>گفت‌وگو کامل شد. می‌توانی درس را تمام کنی یا با شروع‌کنندهٔ دیگر تمرین کنی.</Text> : <>
        <Text style={w.title}>{!current.history.length ? 'اولین حرف با توست' : 'حالا نوبت توست'}</Text>
        {advanced && !help && <Text style={w.copy}>یکی از این منظورها را به روسی بیان کن: {current.options.map(m => m.say.fa).join(' / ')}</Text>}
        {(beginner || !advanced || help) && current.options.map((m,i) => <View key={`${path.picks.length}:${i}`} style={w.sample}><View style={w.row}><Hear text={m.say.text} speak={speak}/><View style={{ flex: 1 }}><Text style={w.ru}>{m.say.text}</Text></View></View>{(beginner || help) && <Text style={w.copy}>{m.say.fa}</Text>}<Action label={`بگو: ${m.say.text}`} onPress={() => send(i)} /></View>)}
        {(!beginner || help) && <><TextInput accessibilityLabel="پاسخ من به روسی" placeholder="Ответ по-русски…" value={draft} maxLength={350} onChangeText={setDraft} onSubmitEditing={submit} style={[w.input,{ writingDirection: 'ltr', textAlign: 'left' }]} />
          <View style={w.row}><Dictate key={`${path.starter}:${path.picks.length}`} onDraft={setDraft} onNotice={setNotice}/><Action label="فرستادن پاسخ" muted={!draft.trim()} onPress={submit}/></View></>}
        <Action label={help ? 'بستن راهنما' : beginner ? 'می‌خواهم خودم بگویم' : 'نمونه و معنی این نوبت'} onPress={() => setHelp(!help)} />
        {!!notice && <Text accessibilityLiveRegion="polite" style={w.copy}>{notice}</Text>}
      </>}
      <Action label="عوض کردن شروع‌کننده" onPress={() => { void stopRussianSpeech(); clear(); change(null); }}/>
    </>}
  </Panel>;
}
