import { useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Headphones } from 'lucide-react-native';
import { LocalizedText as Text, LocalizedTextInput as Input } from '@/components/LocalizedText';
import { PageNavigation } from '@/components/PageNavigation';
import { BandPicker } from '@/components/RussianBands';
import { Entry, Paper, StudioButton, ss } from '@/components/RussianStudioUI';
import VerbNarrationSession from '@/components/VerbNarrationSession';
import { VERBS, normalize, type Verb } from '@/lib/languages/russianGrammar/catalog';
import { verbVoiceCards, type VoiceCard } from '@/lib/languages/russianShadowRoom';
import { GRAMMAR_BANDS } from '@/lib/languages/russianGrammar/units';
import { toPersianDigits as fa } from '@/lib/format';

const batchSize = 12;
export default function VerbRoom() {
  const router = useRouter(),
    scroll = useRef<ScrollView>(null);
  const [band, setBand] = useState(-1),
    [query, setQuery] = useState(''),
    [page, setPage] = useState(0);
  const [session, setSession] = useState<{ title: string; cards: VoiceCard[] } | null>(null);
  const list = useMemo(
    () =>
      VERBS.filter(
        (v) =>
          (band < 0 || v.level === band) &&
          [v.lemma, v.fa, ...v.forms].some((w) => normalize(w).includes(normalize(query))),
      ),
    [query, band],
  );
  const top = () => scroll.current?.scrollTo({ y: 0, animated: false });
  const close = () => {
    setSession(null);
    top();
  };
  const open = (verbs: Verb[], title: string, single = false) => {
    setSession({
      title,
      cards: verbs.flatMap((v) => {
        const cards = verbVoiceCards(v, band < 0 ? v.level : band);
        return single ? cards : cards.slice(0, 1);
      }),
    });
    top();
  };
  return (
    <View style={ss.root}>
      <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={ss.page}>
        <View style={ss.inline}>
          <View style={ss.flex}>
            <Text keepColor style={ss.kicker}>
              روسی / تمرین مستقل
            </Text>
            <Text accessibilityRole="header" keepColor style={ss.title}>
              اتاق آموزش افعال
            </Text>
          </View>
          <PageNavigation backFallback="/learn/ru" onBack={session ? close : undefined} />
        </View>
        {session ? (
          <VerbNarrationSession {...session} finish={close} />
        ) : (
          <>
            <View style={[ss.hero, { backgroundColor: '#293656' }]}>
              <Text keepColor style={ss.heroKicker}>
                دفتر شنیداری / {fa(VERBS.length)} فعل
              </Text>
              <Text keepColor style={ss.heroTitle}>
                فعل را در جمله بگو
              </Text>
              <Text keepColor style={ss.heroCopy}>
                اول مصدر را بشنو، بعد به شکل آن در جمله گوش کن. با دعوت راوی همان جمله را بگو؛ بازخوردت در
                پایان آماده است.
              </Text>
            </View>
            <Paper>
              <Text keepColor style={ss.subhead}>
                تمرین پیشنهادی
              </Text>
              <Entry
                icon={Headphones}
                title="خواستن، خواندن و گفتن"
                sub="یک جلسهٔ کوتاه با سه فعل پرکاربرد"
                onPress={() =>
                  open(
                    ['хотеть', 'читать', 'говорить'].map((id) => VERBS.find((v) => v.lemma === id)!),
                    'سه فعل پرکاربرد',
                  )
                }
              />
              <StudioButton
                label="رد کردن و بازگشت به خانه"
                onPress={() => router.replace('/learn/ru' as never)}
              />
            </Paper>
            <Paper>
              <Text keepColor style={ss.subhead}>
                انتخاب از همهٔ فعل‌ها
              </Text>
              <BandPicker
                all
                value={band}
                set={(n) => {
                  setBand(n);
                  setPage(0);
                }}
              />
              <Input
                accessibilityLabel="جست‌وجوی فعل"
                placeholder="مصدر، شکل فعل یا معنی فارسی"
                value={query}
                onChangeText={(q) => {
                  setQuery(q);
                  setPage(0);
                }}
                style={ss.input}
              />
              <Text style={ss.small}>
                {list.length
                  ? `${fa(list.length)} فعل · صفحهٔ ${fa(page + 1)} از ${fa(Math.ceil(list.length / batchSize))}`
                  : 'فعلی پیدا نشد. معنی فارسی یا شکل دیگری از فعل را امتحان کن.'}
              </Text>
              {list.slice(page * batchSize, (page + 1) * batchSize).map((v) => (
                <Entry
                  key={v.lemma}
                  icon={BookOpen}
                  title={v.lemma}
                  sub={`${v.fa} · ${GRAMMAR_BANDS[v.level]}`}
                  onPress={() => open([v], v.fa, true)}
                />
              ))}
              <View style={ss.wrap}>
                <StudioButton
                  label="صفحهٔ بعد"
                  disabled={(page + 1) * batchSize >= list.length}
                  onPress={() => {
                    setPage(page + 1);
                    top();
                  }}
                />
                <StudioButton
                  label="صفحهٔ قبل"
                  disabled={!page}
                  onPress={() => {
                    setPage(page - 1);
                    top();
                  }}
                />
              </View>
            </Paper>
          </>
        )}
      </ScrollView>
    </View>
  );
}
