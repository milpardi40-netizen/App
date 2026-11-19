import { useState } from 'react';
import { View } from 'react-native';
import { LocalizedText as Text } from './LocalizedText';
import { Action, Hear, Panel, w } from './RussianWorkshopUI';
import type { StarterLine } from '@/lib/languages/russianPreA1';

/** Only the two decodable slots participate; the six oral phrases never become spelling tasks. */
export default function RussianStarterReading({ words, letters, speak }: { words: readonly StarterLine[]; letters: string; speak: (text: string) => void }) {
  const [turn, setTurn] = useState(0), [picked, setPicked] = useState<number | null>(null);
  const index = turn % words.length, word = words[index];
  // Keep both forms on screen in a stable order (not always correct-first).
  return <Panel><Text style={w.kicker}>{letters ? `حرف‌های تازه: ${[...letters].join(' · ')}` : 'مرور حرف‌هایی که بلدی'}</Text>
    <Text style={w.title}>خودت بخوان</Text><Text style={w.copy}>کدام نوشته یعنی «{word.fa}»؟ اول به حرف‌ها نگاه کن.</Text>
    <View style={w.row}>{words.map((s, i) => <Action key={s.text} label={s.text} active={picked === i} onPress={() => { setPicked(i); speak(s.text); }} />)}</View>
    {picked !== null && <Text accessibilityLiveRegion="polite" style={w.copy}>{picked === index ? `درست خواندی: ${word.pronunciation}، یعنی ${word.fa}.` : `این یکی «${words[picked].fa}» است. دوباره نگاه کن.`}</Text>}
    {picked === index && <Action label="نوشتهٔ بعدی" onPress={() => { setTurn(turn + 1); setPicked(null); }} />}
  </Panel>;
}
export function ListenCue({ line, speak }: { line: StarterLine; speak: (text: string) => void }) {
  const [hint, setHint] = useState(false);
  return <View style={w.sample}><View style={w.row}><Hear text={line.text} speak={speak}/><Action label={hint ? 'بستن راهنمای خوانش' : 'اگر صدا نداری: راهنمای خوانش'} onPress={() => setHint(!hint)} /></View>{hint && <Text style={w.copy}>{line.pronunciation}</Text>}</View>;
}
