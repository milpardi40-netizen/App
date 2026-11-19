import { useCallback, useMemo, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AudioLines, Headphones, Mic, Pause, Play, RotateCcw } from 'lucide-react-native';
import { LocalizedText as Text } from './LocalizedText';
import { Paper, ss, studio, StudioButton } from './RussianStudioUI';
import { reviewLine, shadowCards, type RoomPhase, type VoiceCard } from '@/lib/languages/russianShadowRoom';
import { normalize } from '@/lib/languages/russianGrammar/catalog';
import { russianTurnAudio, showingRussianPermissionDialog } from '@/lib/russianTurnAudio';
import { toPersianDigits as fa } from '@/lib/format';

const labels = {
  verb: 'به مصدر گوش کن',
  sentence: 'حالا فعل را در جمله بشنو',
  prompt: 'همین جمله را تکرار کن',
  ready: 'آماده‌سازی میکروفون',
  listen: 'گوش می‌دهم؛ جمله را بگو',
};
type RoomProps = {
  title: string;
  cards: VoiceCard[];
  finish: () => void;
};
export default function VerbNarrationSession({ title, cards, finish }: RoomProps) {
  const [results, setResults] = useState<string[]>([]);
  const [state, setState] = useState<{ phase: RoomPhase; index: number; partial?: string } | null>(null);
  const [partialReview, setPartialReview] = useState(false);
  const [note, setNote] = useState('');
  const owner = useRef<AbortController | null>(null);
  const pause = useCallback(() => {
    owner.current?.abort();
    owner.current = null;
    setState(null);
  }, []);
  useFocusEffect(
    useCallback(() => {
      const sub = AppState.addEventListener('change', (s) => {
        if (s !== 'active' && !showingRussianPermissionDialog(owner.current?.signal)) pause();
      });
      return () => {
        sub.remove();
        pause();
      };
    }, [pause]),
  );
  const done = !!cards.length && results.length === cards.length;
  const reviewing = done || partialReview;
  const index = state?.index ?? Math.min(results.length, cards.length - 1),
    card = cards[index];
  function start(restart = false) {
    if (owner.current || !cards.length) return;
    const c = new AbortController();
    owner.current = c;
    setNote('');
    setPartialReview(false);
    let lines = restart ? [] : results;
    if (restart) {
      setResults(lines);
    }
    void shadowCards(
      cards,
      lines.length,
      russianTurnAudio,
      c.signal,
      (phase, index, partial) => setState({ phase, index, partial }),
      (heard) => {
        lines = [...lines, heard];
        setResults(lines);
      },
    )
      .catch((e) => {
        if (!c.signal.aborted)
          setNote(
            e instanceof Error && /[آ-ی]/.test(e.message)
              ? e.message
              : 'صدای دستگاه در دسترس نیست. دوباره تلاش کن یا از این تمرین بگذر.',
          );
      })
      .finally(() => {
        if (owner.current === c) {
          owner.current = null;
          setState(null);
        }
      });
  }
  const reviews = useMemo(
    () => results.map((heard, i) => ({ heard, card: cards[i], diff: reviewLine(cards[i].text, heard) })),
    [results, cards],
  );
  const issues = reviews.filter((r) => !r.diff.matched);
  const step = !state || state.phase === 'verb' ? 0 : state.phase === 'sentence' ? 1 : 2;
  return (
    <View style={{ gap: 12 }}>
      <View style={r.console}>
        <View style={ss.inline}>
          <View style={r.pill}>
            <AudioLines size={15} color="#D5ECA3" />
            <Text keepColor style={r.badge}>
              آموزش افعال
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <Text keepColor style={r.serial}>
            RU / VERBS
          </Text>
        </View>
        <Text keepColor accessibilityRole="header" style={ss.heroTitle}>
          {reviewing ? 'گزارش تکرار جمله‌ها' : 'از مصدر تا جمله'}
        </Text>
        <Text keepColor style={ss.heroCopy}>
          {title}
        </Text>
        <View style={r.track}>
          <View style={[r.fill, { width: `${cards.length ? (results.length / cards.length) * 100 : 0}%` }]} />
        </View>
        <Text keepColor style={r.badge}>
          {fa(results.length)} از {fa(cards.length)} تمرین انجام شد
        </Text>
      </View>
      {reviewing ? (
        <Paper>
          <Text keepColor style={ss.title}>
            {issues.length
              ? `${fa(issues.length)} جمله برای مرور`
              : 'همهٔ پاسخ‌های ثبت‌شده با الگو مطابق بود'}
          </Text>
          <Text style={ss.small}>
            این مقایسه بر اساس متن تشخیص‌داده‌شده است؛ دربارهٔ لهجه یا کیفیت تلفظ داوری نمی‌کند.
          </Text>
          {issues.map(({ card: c, heard, diff }) => (
            <View key={`${c.lemma}:${c.text}`} style={ss.sample}>
              <Text keepColor style={ss.kicker}>
                الگوی درست · {c.lemma}
              </Text>
              <Text keepColor style={ss.ru}>
                {c.text}
              </Text>
              <Text style={ss.small}>میکروفون این‌طور شنید:</Text>
              <Text keepColor style={[ss.ru, { fontSize: 18 }]}>
                {heard}
              </Text>
              {diff.missing.length > 0 && (
                <Text style={ss.copy}>در متن شنیده نشد: {diff.missing.join('، ')}</Text>
              )}
              {diff.extra.length > 0 && <Text style={ss.copy}>در الگو نیست: {diff.extra.join('، ')}</Text>}
              <Text keepColor style={ss.subhead}>
                {diff.order
                  ? 'واژه‌ها درست بودند؛ این بار ترتیب جمله را حفظ کن.'
                  : diff.missing.includes(normalize(c.form))
                    ? `جمله را با شکل «${c.form}» بساز، سپس یک‌نفس بگو.`
                    : 'جمله را آهسته از روی الگو بگو، سپس بدون نگاه کردن تکرار کن.'}
              </Text>
            </View>
          ))}
          {!done && (
            <StudioButton label="ادامه از جملهٔ بعدی" kind="primary" icon={Play} onPress={() => start()} />
          )}
          <StudioButton label="تمرین دوباره" icon={RotateCcw} onPress={() => start(true)} />
        </Paper>
      ) : card ? (
        <Paper>
          <View style={ss.inline}>
            {['فعل', 'جمله', 'تکرار'].map((s, i) => (
              <View key={s} style={[r.tab, state && step === i && r.active]}>
                <Text keepColor style={{ color: state && step === i ? '#FFFFFF' : studio.quiet }}>
                  {fa(i + 1)} · {s}
                </Text>
              </View>
            ))}
          </View>
          <View style={ss.sample}>
            <Text keepColor style={ss.kicker}>
              {card.source} · {fa(index + 1)} / {fa(cards.length)}
            </Text>
            <Text keepColor style={ss.lemma}>
              {card.lemma}
            </Text>
            <Text style={ss.copy}>{card.meaning}</Text>
            <View style={r.rule} />
            <Text keepColor style={ss.ru}>
              {card.text.split(/([А-Яа-яЁё\u0301]+)/).map((w, i) =>
                normalize(w) === normalize(card.form) ? (
                  <Text key={i} keepColor style={{ backgroundColor: '#D8E999', color: studio.ink }}>
                    {w}
                  </Text>
                ) : (
                  w
                ),
              )}
            </Text>
            <Text style={ss.copy}>{card.fa}</Text>
          </View>
          <View style={ss.inline}>
            {state?.phase === 'listen' ? <Mic color={studio.leaf} /> : <Headphones color={studio.leaf} />}
            <Text accessibilityLiveRegion="polite" keepColor style={[ss.subhead, ss.flex]}>
              {state ? labels[state.phase] : 'بشنو، سپس با همان آهنگ بگو'}
            </Text>
          </View>
          {!!state?.partial && (
            <Text keepColor style={ss.ru}>
              {state.partial}
            </Text>
          )}
          {!state && (
            <Text style={ss.small}>
              پس از دعوت راوی، میکروفون برای یک جمله باز می‌شود. فایل صدا ذخیره نمی‌شود؛ تشخیص گفتار دستگاه
              ممکن است به اینترنت نیاز داشته باشد.
            </Text>
          )}
          {!!note && (
            <Text accessibilityRole="alert" style={ss.copy}>
              {note}
            </Text>
          )}
          <StudioButton
            kind="primary"
            label={state ? 'مکث تمرین' : results.length || note ? 'ادامه از همین جمله' : 'شروع تمرین صوتی'}
            icon={state ? Pause : Play}
            onPress={state ? pause : () => start()}
          />
          {!state && results.length > 0 && (
            <StudioButton
              label={`مرور ${fa(results.length)} پاسخ ثبت‌شده`}
              onPress={() => setPartialReview(true)}
            />
          )}
        </Paper>
      ) : (
        <Paper>
          <Text style={ss.copy}>برای این درس هنوز تمرین صوتی آماده نیست.</Text>
        </Paper>
      )}
      {finish && (
        <StudioButton
          label={reviewing ? 'بازگشت به اتاق افعال' : 'رد کردن تمرین فعل'}
          onPress={() => {
            pause();
            finish();
          }}
        />
      )}
    </View>
  );
}
const r = StyleSheet.create({
  console: { backgroundColor: '#293656', borderRadius: 22, padding: 20, gap: 8 },
  pill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#424F72',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 18,
  },
  badge: { color: '#D5ECA3', fontSize: 13 },
  serial: { color: '#B3CEBE', fontSize: 11, letterSpacing: 1.5 },
  track: {
    height: 4,
    marginTop: 8,
    borderRadius: 2,
    backgroundColor: '#39645A',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  fill: { backgroundColor: '#D5ECA3', height: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 7, backgroundColor: '#EEF2E9', borderRadius: 10 },
  active: { backgroundColor: studio.leaf },
  rule: { height: 1, backgroundColor: studio.rule, marginVertical: 3 },
});
