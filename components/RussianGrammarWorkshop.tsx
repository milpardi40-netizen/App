import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, ScrollView, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ArrowLeft, BookMarked, BookOpen, Compass, ListFilter, Search, Users } from 'lucide-react-native';
import { LocalizedText as Text, LocalizedTextInput as TextInput } from './LocalizedText';
import { PageNavigation } from './PageNavigation';
import {
  Entry,
  Feedback,
  NextButton,
  Paper,
  PlayLine,
  ss,
  studio,
  StudioButton,
  StudioHero,
} from './RussianStudioUI';
import { BandPicker } from './RussianBands';
import { VerbTutor } from './RussianVerbTutor';
import { GRAMMAR_BANDS, GRAMMAR_UNITS, type GrammarUnit } from '@/lib/languages/russianGrammar/units';
import { VERBS, lessonVerbs, normalize, relatedUnits, type Verb } from '@/lib/languages/russianGrammar/catalog';
import { VERB_TRAILS } from '@/lib/languages/russianGrammar/trails';
import { markKey, markPractised, readMarks } from '@/lib/languages/russianGrammar/marks';
import { findRussianLesson } from '@/lib/languages/russian';
import { playRussianSpeech, stopRussianSpeech } from '@/lib/russianSpeech';
import { narrationRate } from '@/lib/narration';
import { toPersianDigits as fa } from '@/lib/format';

function PronounTutor({ unit, speak }: { unit: GrammarUnit; speak: (s: string) => void }) {
  const [index, setIndex] = useState(0),
    [train, setTrain] = useState(false),
    [chosen, choose] = useState('');
  const s = unit.examples[index];
  return (
    <Paper>
      <Text keepColor style={ss.kicker}>
        دفتر ضمیرها و الگوها · {GRAMMAR_BANDS[unit.level]} · {unit.group}
      </Text>
      <Text accessibilityRole="header" keepColor style={ss.title}>
        {unit.title}
      </Text>
      <Text style={ss.copy}>{unit.note}</Text>
      {!train ? (
        <>
          <View style={ss.sample}>
            <Text style={ss.kicker}>
              مثال {fa(index + 1)} از {fa(unit.examples.length)}
            </Text>
            <Text keepColor style={ss.ru}>
              {s.text}
            </Text>
            <Text style={ss.copy}>{s.fa}</Text>
            <Text style={ss.small}>{s.pronunciation}</Text>
            <PlayLine text={s.text} speak={speak} />
          </View>
          <View style={ss.wrap}>
            <StudioButton
              label="مثال بعدی"
              onPress={() => {
                void stopRussianSpeech();
                setIndex((index + 1) % unit.examples.length);
              }}
            />
            <NextButton
              label="نوبت تو"
              onPress={() => {
                void stopRussianSpeech();
                setTrain(true);
              }}
            />
          </View>
        </>
      ) : (
        <>
          <Text style={ss.copy}>{unit.prompt}</Text>
          <View style={ss.wrap}>
            {unit.choices.map((c) => (
              <StudioButton
                key={c}
                selected={chosen === c}
                label={c}
                onPress={() => {
                  choose(c);
                  speak(c);
                }}
              />
            ))}
          </View>
          {!!chosen && <Feedback ok={chosen === unit.answer} text={unit.why} />}
          <StudioButton label="دیدن دوبارهٔ مثال‌ها" onPress={() => setTrain(false)} />
        </>
      )}
    </Paper>
  );
}
const byLemma = new Map(VERBS.map((v) => [v.lemma, v]));
const pageSize = 18;
type Tab = 'path' | 'units' | 'index';
export default function RussianGrammarWorkshop({ lessonId }: { lessonId?: string }) {
  const lesson = findRussianLesson(lessonId),
    scroll = useRef<ScrollView>(null),
    mounted = useRef(false);
  const [scoped, setScoped] = useState(!!lesson),
    [tab, setTab] = useState<Tab>('path');
  const [level, setLevel] = useState(0),
    [filter, setFilter] = useState(-1),
    [query, setQuery] = useState(''),
    [page, setPage] = useState(0);
  const [unit, setUnit] = useState<GrammarUnit>(),
    [verb, setVerb] = useState<Verb>(),
    [band, setBand] = useState(0);
  const [marks, setMarks] = useState<string[]>([]),
    [storageNote, setStorageNote] = useState(''),
    [soundNote, setSoundNote] = useState('');
  useEffect(() => {
    mounted.current = true;
    let live = true;
    void readMarks()
      .then((m) => {
        if (live) setMarks((prev) => [...new Set([...prev, ...m])]);
      })
      .catch(() => {
        if (live) setStorageNote('خواندن نشان‌های کارگاه ممکن نشد؛ تمرین‌ها باز هستند.');
      });
    return () => {
      live = false;
      mounted.current = false;
    };
  }, []);
  const speak = (text: string) => {
    setSoundNote('');
    const fail = () =>
      mounted.current && setSoundNote('پخش روسی در این دستگاه در دسترس نیست. متن و تمرین همچنان باز هستند.');
    void playRussianSpeech(text, narrationRate('ru-RU', 'listen'), fail).catch(fail);
  };
  const top = () => scroll.current?.scrollTo({ y: 0, animated: false });
  const resetAudio = () => {
    void stopRussianSpeech();
    setSoundNote('');
  };
  const close = useCallback(() => {
    void stopRussianSpeech();
    setSoundNote('');
    setUnit(undefined);
    setVerb(undefined);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, []);
  const detail = !!unit || !!verb;
  useFocusEffect(
    useCallback(() => {
      const back = BackHandler.addEventListener('hardwareBackPress', () => {
        if (detail) close();
        return detail;
      });
      return () => {
        back.remove();
        void stopRussianSpeech();
      };
    }, [detail, close]),
  );
  const local = scoped ? lesson : undefined,
    ids = useMemo(() => new Set(local ? lessonVerbs(local.id) : []), [local]);
  const list = useMemo(
    () =>
      VERBS.filter(
        (v) =>
          (!local || ids.has(v.lemma)) &&
          (filter < 0 || v.level === filter) &&
          [v.lemma, v.fa, ...v.forms].some((s) => normalize(s).includes(normalize(query))),
      ),
    [local, ids, query, filter],
  );
  const units = useMemo(
    () => (local ? relatedUnits(local) : GRAMMAR_UNITS.filter((u) => u.level === level)),
    [local, level],
  );
  const open = (v: Verb, b: number) => {
    resetAudio();
    setVerb(v);
    setBand(b);
    top();
  };
  const selectBand = (b: number) => {
    resetAudio();
    setBand(b);
    top();
  };
  const record = () => {
    if (verb)
      void markPractised(verb.lemma, band)
        .then((m) => {
          if (mounted.current) {
            setMarks(m);
            setStorageNote('');
          }
        })
        .catch(() => {
          if (mounted.current) setStorageNote('تمرین درست بود، ولی نشان آن روی دستگاه ذخیره نشد.');
        });
  };
  const localList = useMemo(() => [...ids].map((id) => byLemma.get(id)).filter((v): v is Verb => !!v), [ids]);
  const pathLevel = local?.levelId ?? level;
  const route = local ? localList : VERB_TRAILS.map((t) => byLemma.get(t.lemma)!);
  const first = route.find((v) => !marks.includes(markKey(v.lemma, pathLevel))) ?? route[0];
  const switchScope = () => {
    resetAudio();
    setScoped(!scoped);
    setQuery('');
    setFilter(-1);
    setPage(0);
    setTab('path');
    top();
  };
  return (
    <View style={ss.root}>
      <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={ss.page}>
        <View style={ss.inline}>
          <View style={ss.flex}>
            <Text keepColor style={ss.kicker}>
              زبان روسی / دفتر یادگیری
            </Text>
            <Text keepColor style={ss.subhead}>
              کارگاه فعل و ضمیر
            </Text>
          </View>
          <PageNavigation backFallback="/learn/ru" onBack={detail ? close : undefined} />
        </View>
        {!!storageNote && (
          <Text accessibilityRole="alert" style={ss.small}>
            {storageNote}
          </Text>
        )}
        {!!soundNote && (
          <Text accessibilityRole="alert" style={ss.small}>
            {soundNote}
          </Text>
        )}
        {detail ? (
          <>
            <StudioButton label="بازگشت به فهرست کارگاه" onPress={close} />
            {verb ? (
              <>
                <View style={ss.inline}>
                  <View style={ss.flex}>
                    <Text keepColor style={ss.kicker}>
                      {verb.lemma} · {verb.fa}
                    </Text>
                    <Text style={ss.small}>سطح تمرین این فعل را انتخاب کن.</Text>
                  </View>
                </View>
                <BandPicker value={band} set={selectBand} />
                <VerbTutor
                  key={`${verb.lemma}:${band}`}
                  verb={verb}
                  band={band}
                  lesson={local}
                  speak={speak}
                  onPass={record}
                  onStep={() => {
                    resetAudio();
                    top();
                  }}
                  nextBand={() => selectBand(band + 1)}
                  finish={close}
                />
              </>
            ) : (
              unit && <PronounTutor key={unit.id} unit={unit} speak={speak} />
            )}
          </>
        ) : (
          <>
            <StudioHero
              eyebrow={local ? 'دفتر همراهِ درس' : 'کارگاه روسی  /  از پایه تا C1'}
              title={local ? local.title : 'از فعل تا جمله'}
              copy={
                local
                  ? `مثال‌ها و ساخت‌های مرتبط با «${local.title}»`
                  : 'از معنی یک فعل شروع کن. بعد آن را در یک جمله بشنو و خودت به کار ببر. در هر سطح به همان فعل برمی‌گردی، با یک کاربرد تازه.'
              }
            >
              {tab === 'path' && first && (
                <StudioButton
                  kind="light"
                  icon={ArrowLeft}
                  label={`${marks.some((k) => k.endsWith(`:${pathLevel}`)) ? 'تمرین' : 'شروع با'} «${VERB_TRAILS.find((t) => t.lemma === first.lemma)?.meaning || first.fa}»`}
                  onPress={() => open(first, pathLevel)}
                />
              )}
            </StudioHero>
            {lesson && (
              <StudioButton
                label={scoped ? 'دیدن کل کارگاه' : 'فقط مطالب همین درس'}
                icon={ListFilter}
                onPress={switchScope}
              />
            )}
            <View
              style={[
                ss.inline,
                { gap: 4, padding: 4, backgroundColor: '#EAEDE1', borderRadius: 16, alignItems: 'stretch' },
              ]}
            >
              {(
                [
                  { id: 'path', name: 'مسیر فعل‌ها', icon: Compass },
                  { id: 'units', name: 'ضمیرها و الگوها', icon: Users },
                  { id: 'index', name: 'واژه‌نامهٔ فعل', icon: Search },
                ] as const
              ).map(({ id, name, icon: Icon }) => (
                <Pressable
                  key={id}
                  accessibilityRole="button"
                  accessibilityLabel={name}
                  accessibilityState={{ selected: tab === id }}
                  onPress={() => setTab(id)}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: 60,
                    padding: 4,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    opacity: pressed ? 0.7 : 1,
                    backgroundColor: tab === id ? studio.deep : 'transparent',
                  })}
                >
                  <Icon size={18} color={tab === id ? studio.lime : studio.leaf} />
                  <Text keepColor style={{ fontSize: 14, color: tab === id ? '#FFFFFF' : studio.ink }}>
                    {name}
                  </Text>
                </Pressable>
              ))}
            </View>
            {tab === 'path' ? (
              <Paper>
                <Text keepColor style={ss.kicker}>
                  {local ? 'پیوند به موقعیت همین درس' : 'مسیر پیشنهادی  /  شش فعل پرکاربرد'}
                </Text>
                <Text accessibilityRole="header" keepColor style={ss.title}>
                  {local ? 'فعل‌های همین درس' : 'یک فعل، شش پله'}
                </Text>
                {!local && (
                  <>
                    <Text style={ss.copy}>
                      تازه‌کاری؟ از پلهٔ اول و «خواستن» شروع کن. اگر سطح بالاتری داری، پلهٔ خودت را انتخاب کن.
                    </Text>
                    <BandPicker value={level} set={setLevel} />
                  </>
                )}
                {route.map((v, i) => {
                  const trail = VERB_TRAILS.find((t) => t.lemma === v.lemma),
                    done = marks.includes(markKey(v.lemma, pathLevel));
                  return (
                    <Entry
                      key={v.lemma}
                      number={i + 1}
                      done={done}
                      title={trail?.meaning || v.fa}
                      sub={`${v.lemma} · ${done ? 'تمرین شد' : trail?.rungs[pathLevel].goal || 'پایه، مثال و تمرین'}`}
                      onPress={() => open(v, pathLevel)}
                    />
                  );
                })}
                {!route.length && (
                  <Text style={ss.copy}>
                    این درس بدون فعلِ آشکار هم معنی می‌دهد. بخش ضمیرها را ببین یا کل کارگاه را باز کن.
                  </Text>
                )}
              </Paper>
            ) : tab === 'units' ? (
              <Paper>
                <Text keepColor style={ss.kicker}>
                  همراهِ فعل · شخص، نقش و ارجاع
                </Text>
                <Text accessibilityRole="header" keepColor style={ss.title}>
                  ضمیرها و الگوها
                </Text>
                {!local && <BandPicker value={level} set={setLevel} />}
                {units.map((u) => (
                  <Entry
                    key={u.id}
                    icon={Users}
                    title={u.title}
                    sub={`${GRAMMAR_BANDS[u.level]} · ${u.group}`}
                    onPress={() => {
                      setUnit(u);
                      top();
                    }}
                  />
                ))}
              </Paper>
            ) : (
              <Paper>
                <Text keepColor style={ss.kicker}>
                  مرجع آفلاین · {fa(local ? ids.size : VERBS.length)} فعل
                </Text>
                <Text accessibilityRole="header" keepColor style={ss.title}>
                  چه فعلی شنیدی؟
                </Text>
                <TextInput
                  accessibilityLabel="جست‌وجوی فعل"
                  placeholder="مثلاً хочу یا خواستن"
                  value={query}
                  onChangeText={(q) => {
                    setQuery(q);
                    setPage(0);
                  }}
                  style={ss.input}
                />
                {!local && (
                  <>
                    <Text style={ss.small}>فیلتر بر اساس نخستین سطحِ کاربرد در دوره</Text>
                    <BandPicker
                      all
                      value={filter}
                      set={(b) => {
                        setFilter(b);
                        setPage(0);
                      }}
                    />
                  </>
                )}
                <Text style={ss.small}>{fa(list.length)} نتیجه</Text>
                {list.slice(page * pageSize, (page + 1) * pageSize).map((v) => (
                  <Entry
                    key={v.lemma}
                    icon={BookOpen}
                    title={v.lemma}
                    sub={`${v.fa} · ${GRAMMAR_BANDS[v.level]}`}
                    a11y={`${v.lemma} · ${v.fa}`}
                    onPress={() => open(v, local?.levelId ?? (filter >= 0 ? filter : 0))}
                  />
                ))}
                {!list.length && (
                  <Text style={ss.copy}>فعلی پیدا نشد. شکل دیگری بنویس یا فیلتر سطح را بردار.</Text>
                )}
                {list.length > pageSize && (
                  <View style={ss.wrap}>
                    <StudioButton
                      label="صفحهٔ قبل"
                      disabled={!page}
                      onPress={() => {
                        setPage(page - 1);
                        top();
                      }}
                    />
                    <Text style={ss.small}>
                      {fa(page + 1)} / {fa(Math.ceil(list.length / pageSize))}
                    </Text>
                    <StudioButton
                      label="صفحهٔ بعد"
                      disabled={(page + 1) * pageSize >= list.length}
                      onPress={() => {
                        setPage(page + 1);
                        top();
                      }}
                    />
                  </View>
                )}
              </Paper>
            )}
            {tab === 'units' && !units.length && (
              <Text style={ss.copy}>این درس یک الگوی ضمیری تازه ندارد؛ دفتر کامل از بالای صفحه در دسترس است.</Text>
            )}
            {tab === 'path' && !local && (
              <Entry
                icon={BookMarked}
                title="دنبال یک فعل دیگر می‌گردی؟"
                sub="همهٔ فعل‌های دوره با معنی، صدا و تمرین"
                onPress={() => {
                  setTab('index');
                  top();
                }}
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
