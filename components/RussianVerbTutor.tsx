import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { BookOpen, Check, PencilLine, Sprout } from 'lucide-react-native';
import { LocalizedText as Text, LocalizedTextInput as TextInput } from './LocalizedText';
import { Feedback, NextButton, Paper, PlayLine, ss, studio, StudioButton } from './RussianStudioUI';
import { normalize, type Verb } from '@/lib/languages/russianGrammar/catalog';
import { GRAMMAR_BANDS } from '@/lib/languages/russianGrammar/units';
import { trailFor } from '@/lib/languages/russianGrammar/trails';
import { BAND_SKILLS, drillFor, studyExamples } from '@/lib/languages/russianGrammar/verbLesson';
import type { RussianCourseLesson } from '@/lib/languages/russian';
import { toPersianDigits as fa } from '@/lib/format';

function MarkedLine({ text, form }: { text: string; form: string }) {
  return (
    <Text keepColor style={ss.ru}>
      {text.split(/([А-Яа-яЁё\u0301]+)/).map((token, i) =>
        normalize(token) === normalize(form) ? (
          <Text key={i} keepColor style={{ backgroundColor: '#D8E999', color: studio.ink }}>
            {token}
          </Text>
        ) : (
          token
        ),
      )}
    </Text>
  );
}
const names = ['پایه', 'مثال', 'تمرین'];
export function VerbTutor({
  verb,
  band,
  lesson,
  speak,
  onStep,
  onPass,
  nextBand,
  finish,
}: {
  verb: Verb;
  band: number;
  lesson?: RussianCourseLesson;
  speak: (s: string) => void;
  onStep: () => void;
  onPass: () => void;
  nextBand: () => void;
  finish: () => void;
}) {
  const [step, setStep] = useState(0),
    [index, setIndex] = useState(0),
    [chosen, choose] = useState(''),
    [draft, setDraft] = useState('');
  const samples = useMemo(() => studyExamples(verb, band, lesson), [verb, band, lesson]);
  const s = samples[index],
    guide = trailFor(verb.lemma),
    check = useMemo(() => drillFor(verb, s, band), [verb, s, band]);
  const spoken = guide?.spoken || verb.lemma,
    meaning = guide?.meaning || verb.fa;
  const passed = !!chosen && normalize(chosen) === normalize(check.answer);
  const turnPage = (n: number) => {
    setStep(n);
    choose('');
    setDraft('');
    onStep();
  };
  const submit = (v: string) => {
    choose(v);
    if (normalize(v) === normalize(check.answer)) onPass();
  };
  return (
    <Paper>
      <View style={ss.inline}>
        <View style={[ss.badge, { backgroundColor: studio.mint }]}>
          {step === 0 ? (
            <Sprout size={22} color={studio.leaf} />
          ) : step === 1 ? (
            <BookOpen size={22} color={studio.leaf} />
          ) : (
            <PencilLine size={22} color={studio.leaf} />
          )}
        </View>
        <View style={ss.flex}>
          <Text keepColor style={ss.kicker}>
            برگ {fa(step + 1)} از ۳ · {GRAMMAR_BANDS[band]}
          </Text>
          <Text keepColor accessibilityRole="header" style={ss.title}>
            {['اول خودِ فعل', 'یک فعل در جمله', 'حالا از تو'][step]}
          </Text>
        </View>
      </View>
      <View style={ss.inline}>
        {names.map((n, i) => (
          <View key={n} style={{ flex: 1, gap: 3 }}>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: i <= step ? studio.leaf : studio.rule }} />
            <Text style={ss.small}>{n}</Text>
          </View>
        ))}
      </View>
      {step === 0 ? (
        <>
          <View style={ss.sample}>
            <Text style={ss.kicker}>مصدر · نامِ کار یا حالت</Text>
            <Text keepColor style={ss.lemma}>
              {spoken}
            </Text>
            <Text keepColor style={ss.title}>
              {meaning}
            </Text>
            {guide && <Text style={ss.small}>خوانش تقریبی: {guide.soundFa}</Text>}
            <PlayLine text={spoken} speak={speak} label="صدای فعل" />
          </View>
          <Text style={ss.copy}>
            {guide?.intro ||
              `در واژه‌نامه، این کار یا حالت را با «${verb.lemma}» پیدا می‌کنی. مصدر به‌تنهایی نمی‌گوید چه کسی و چه زمانی؛ در جمله ببین گوینده چه شکلی به آن داده است.`}
          </Text>
          <Text keepColor style={ss.kicker}>
            هدف این برگ: {s.guide?.goal || BAND_SKILLS[band]}
          </Text>
          <NextButton label="دیدن مثال" onPress={() => turnPage(1)} />
        </>
      ) : step === 1 ? (
        <>
          <View style={ss.sample}>
            <Text keepColor style={ss.kicker}>
              {s.source}
            </Text>
            <MarkedLine text={s.text} form={s.form} />
            <Text style={ss.copy}>{s.fa}</Text>
            <PlayLine text={s.text} speak={speak} label="شنیدن جمله" />
          </View>
          <Text keepColor style={ss.subhead}>
            {s.guide?.goal || 'مصدر را در جمله پیدا کن'}
          </Text>
          <Text style={ss.copy}>
            {s.guide?.note ||
              (normalize(s.form) === normalize(verb.lemma)
                ? `اینجا همان مصدرِ «${verb.lemma}» را می‌بینی. به واژه‌های کنارش گوش بده تا بفهمی در این جمله چه می‌کند.`
                : `سرواژهٔ فرهنگ «${verb.lemma}» است؛ گوینده در این موقعیت از «${s.form}» استفاده کرده. دوباره گوش کن و همان بخش را پیدا کن.`)}
          </Text>
          <NextButton
            label="تمرین همین مثال"
            onPress={() => {
              turnPage(2);
              if (!s.guide && band <= 1) speak(band ? s.text : spoken);
            }}
          />
          <View style={ss.wrap}>
            <StudioButton label="بازگشت به پایه" onPress={() => turnPage(0)} />
            {samples.length > 1 && (
              <StudioButton
                label={`مثال بعدی · ${fa(index + 1)} از ${fa(samples.length)}`}
                onPress={() => {
                  setIndex((index + 1) % samples.length);
                  onStep();
                }}
              />
            )}
          </View>
        </>
      ) : (
        <>
          <Text style={ss.copy}>{check.prompt}</Text>
          {!!check.cue && (
            <Text keepColor style={ss.ru}>
              {check.cue}
            </Text>
          )}
          {!s.guide && (band === 3 || band === 5) && <Text style={ss.copy}>{s.fa}</Text>}
          <PlayLine text={!s.guide && band === 0 ? spoken : s.text} speak={speak} label="دوباره بشنو" />
          {check.write ? (
            <>
              <TextInput
                accessibilityLabel="شکل فعل در جمله"
                value={draft}
                onChangeText={setDraft}
                autoCapitalize="none"
                placeholder="По-русски…"
                style={ss.input}
                onSubmitEditing={() => draft.trim() && submit(draft.trim())}
              />
              <StudioButton
                label="بررسی پاسخ"
                disabled={!draft.trim() || passed}
                onPress={() => submit(draft.trim())}
              />
            </>
          ) : (
            <View style={ss.wrap}>
              {check.choices.map((c) => (
                <StudioButton
                  key={c}
                  selected={chosen === c}
                  icon={passed && chosen === c ? Check : undefined}
                  label={c}
                  onPress={() => submit(c)}
                />
              ))}
            </View>
          )}
          {!!chosen && (
            <Feedback
              ok={passed}
              text={
                passed
                  ? check.why
                  : `هنوز نه. ${s.guide?.why || 'به مثال برگرد، شکل برجسته را ببین و دوباره تلاش کن.'}`
              }
            />
          )}
          {passed &&
            (band < 5 ? (
              <NextButton label={`همین فعل در ${GRAMMAR_BANDS[band + 1]}`} onPress={nextBand} />
            ) : (
              <NextButton label="انتخاب فعل بعدی" onPress={finish} />
            ))}
          <StudioButton label="بازگشت به مثال" onPress={() => turnPage(1)} />
        </>
      )}
    </Paper>
  );
}
