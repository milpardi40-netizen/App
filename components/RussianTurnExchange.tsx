import { useCallback, useMemo, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  AudioLines,
  Check,
  Headphones,
  Keyboard,
  Mic,
  Pause,
  Play,
  RotateCcw,
  UserRound,
} from 'lucide-react-native';
import { LocalizedText as Text, LocalizedTextInput as TextInput } from './LocalizedText';
import { Entry, Paper, PlayLine, ss, studio, StudioButton } from './RussianStudioUI';
import type { RussianCourseLesson } from '@/lib/languages/russian';
import {
  exchangeForLesson,
  exchangeView,
  matchExchangeReply,
  takeTurn,
  type ExchangePath,
} from '@/lib/languages/russianExchange';
import { runVoiceExchange, type VoiceState } from '@/lib/languages/russianVoiceExchange';
import { russianTurnAudio as audio, showingRussianPermissionDialog } from '@/lib/russianTurnAudio';
import { stopRussianSpeech } from '@/lib/russianSpeech';
import { toPersianDigits as fa } from '@/lib/format';

const idle: VoiceState = { phase: 'paused' };
const phaseName = {
  preparing: 'در حال آماده‌کردن میکروفون',
  listening: 'نوبت توست؛ دارم گوش می‌دهم',
  speaking: 'هم‌صحبت دارد حرف می‌زند',
  paused: 'میکروفون بسته است',
  done: 'گفت‌وگو کامل شد',
};
const problem = (e: unknown) =>
  e instanceof Error && /[\u0600-\u06ff]/.test(e.message)
    ? e.message
    : 'صدا در دسترس نیست. دوباره امتحان کن یا بدون میکروفون ادامه بده.';
export default function RussianTurnExchange({
  lesson,
  path,
  change,
  practice = false,
  finish,
  locked,
}: {
  practice?: boolean;
  finish?: () => void;
  locked?: boolean;
  lesson: RussianCourseLesson;
  path: ExchangePath | null;
  change: (p: ExchangePath | null) => void;
}) {
  const scene = useMemo(() => exchangeForLesson(lesson), [lesson]);
  const view = path ? exchangeView(scene, path) : null,
    beginner = lesson.levelId <= 1;
  const [manual, setManual] = useState(false),
    [voice, setVoice] = useState<VoiceState>(idle),
    [help, setHelp] = useState(false),
    [draft, setDraft] = useState('');
  const [repairs, setRepairs] = useState<{ heard: string; example: string }[]>([]);
  function noteRepair(heard: string, example: string) {
    setRepairs((rows) =>
      rows.some((row) => row.heard === heard && row.example === example)
        ? rows
        : [...rows, { heard, example }],
    );
  }
  const owner = useRef<AbortController | null>(null);
  const cancel = useCallback(() => {
    owner.current?.abort();
    owner.current = null;
    void stopRussianSpeech().catch(() => {});
  }, []);
  const pause = useCallback(() => {
    cancel();
    setVoice(idle);
  }, [cancel]);
  useFocusEffect(
    useCallback(() => {
      const app = AppState.addEventListener('change', (state) => {
        if (state === 'background' && !showingRussianPermissionDialog(owner.current?.signal)) pause();
      });
      return () => {
        app.remove();
        pause();
      }; // no automatic microphone on focus, mount, or restored progress
    }, [pause]),
  );
  function own() {
    cancel();
    const c = new AbortController();
    owner.current = c;
    return c;
  }
  function preview(text: string) {
    const c = own();
    setVoice({ phase: 'speaking' });
    void audio
      .say(text, c.signal)
      .then(() => {
        if (!c.signal.aborted) setVoice(idle);
      })
      .catch((e) => {
        if (!c.signal.aborted) setVoice({ phase: 'paused', note: problem(e) });
      });
  }
  function startVoice(p: ExchangePath, replay: boolean) {
    const c = own();
    setVoice({ phase: 'preparing' });
    setDraft('');
    void runVoiceExchange(
      scene,
      p,
      replay,
      audio,
      c.signal,
      (accepted) => {
        setHelp(false);
        setDraft('');
        change(accepted);
      },
      setVoice,
      noteRepair,
    ).catch((e) => {
      if (!c.signal.aborted) setVoice({ phase: 'paused', note: problem(e) });
    });
  }
  function begin(starter: ExchangePath['starter']) {
    const p: ExchangePath = { starter, picks: [] };
    setHelp(false);
    setDraft('');
    setRepairs([]);
    change(p);
    if (!manual) startVoice(p, starter === 'partner');
    else if (starter === 'partner') preview(scene.opening.text);
    else pause();
  }
  function send(i: number, original?: string) {
    if (!path || !view?.options[i]) return;
    change(takeTurn(path, i, original));
    setHelp(false);
    setDraft('');
    preview(view.options[i].reply.text);
  }
  function submit() {
    const i = view ? matchExchangeReply(draft, view.options) : -1;
    if (i < 0) {
      if (draft.trim() && view?.options[0]) noteRepair(draft.trim(), view.options[0].say.text);
      setVoice({ phase: 'paused', note: 'منظورت روشن نشد. پاسخ یکی از مسیرهای همین نوبت را بگو یا بنویس.' });
      return;
    }
    send(i, draft);
  }
  function swapMode() {
    pause();
    setManual(!manual);
    setDraft('');
    if (manual && path && !view?.complete) startVoice(path, true);
  }
  const busy = ['listening', 'preparing', 'speaking'].includes(voice.phase),
    live = voice.phase === 'listening';
  const StatusIcon = live
    ? Mic
    : voice.phase === 'speaking'
      ? AudioLines
      : view?.complete
        ? Check
        : Headphones;
  return (
    <Paper>
      <View style={[ss.hero, { backgroundColor: '#143F3C' }]}>
        <Text keepColor style={ss.heroKicker}>
          {practice ? 'تمرین آزاد' : 'پس از آزمون گفتاری'} / نقش‌آفرینی روسی
        </Text>
        <Text keepColor accessibilityRole="header" style={ss.heroTitle}>
          {lesson.title}
        </Text>
        <Text keepColor style={ss.heroCopy}>
          {lesson.situation}
        </Text>
      </View>
      {!path || !view ? (
        <>
          <View style={[ss.note, { backgroundColor: studio.mint }]}>
            <Text keepColor style={ss.subhead}>
              {manual ? 'تمرین بدون میکروفون' : 'یک بار شروع کن، بعد فقط حرف بزن'}
            </Text>
            <Text style={ss.copy}>
              {manual
                ? 'می‌توانی جواب را انتخاب کنی یا بنویسی؛ هم‌صحبت جواب همان را می‌دهد.'
                : 'وقتی نوبت تو شد، به روسی بگو و مکث کن. لازم نیست «ارسال» بزنی؛ هم‌صحبت جوابت را می‌گوید و دوباره گوش می‌دهد.'}
            </Text>
          </View>
          {beginner && !manual && (
            <View style={ss.sample}>
              <Text style={ss.kicker}>برای شروع، همین را هم می‌توانی بگویی</Text>
              <Text keepColor style={ss.ru}>
                {scene.learnerFirst[0].say.text}
              </Text>
              <Text style={ss.small}>
                {scene.learnerFirst[0].say.fa}
                {scene.learnerFirst[0].say.pronunciation
                  ? ` · ${scene.learnerFirst[0].say.pronunciation}`
                  : ''}
              </Text>
              <PlayLine text={scene.learnerFirst[0].say.text} speak={preview} label="اول نمونه را بشنو" />
            </View>
          )}
          <Text keepColor style={ss.subhead}>
            چه کسی شروع کند؟
          </Text>
          <Entry
            icon={manual ? UserRound : Mic}
            title="من شروع می‌کنم"
            sub={manual ? 'اول جواب من' : 'میکروفون باز می‌شود؛ اول تو بگو'}
            onPress={() => begin('learner')}
          />
          <Entry
            icon={Headphones}
            title="هم‌صحبت شروع کنه"
            sub={manual ? 'اول صدای هم‌صحبت' : 'اول گوش کن، بعد با میکروفون جواب بده'}
            onPress={() => begin('partner')}
          />
          {!manual && (
            <Text style={ss.small}>
              با شروع مکالمهٔ صوتی، اجازهٔ میکروفون لازم است. برنامه فایل صدایت را نگه نمی‌دارد؛ تشخیص گفتارِ
              دستگاه ممکن است به اینترنت نیاز داشته باشد.
            </Text>
          )}
        </>
      ) : (
        <>
          <View style={[ss.note, { backgroundColor: live ? studio.mint : studio.paper }]}>
            <View style={ss.inline}>
              <StatusIcon size={25} color={studio.leaf} />
              <View style={ss.flex}>
                <Text keepColor style={ss.kicker}>
                  {view.complete ? 'پایان دو نوبت' : `نوبت تو · ${fa(path.picks.length + 1)} از ۲`}
                </Text>
                <Text accessibilityLiveRegion="polite" keepColor style={ss.subhead}>
                  {voice.phase === 'speaking'
                    ? phaseName.speaking
                    : view.complete
                      ? phaseName.done
                      : manual
                        ? 'پاسخ با نوشتن یا انتخاب'
                        : phaseName[voice.phase]}
                </Text>
              </View>
            </View>
            {!!voice.note && (
              <Text accessibilityLiveRegion="polite" style={ss.copy}>
                {voice.note}
              </Text>
            )}
            {!!voice.heard && (
              <Text keepColor style={ss.ru}>
                {voice.heard}
              </Text>
            )}
            {!manual &&
              (busy ? (
                <StudioButton label="مکث مکالمه" icon={Pause} onPress={pause} />
              ) : (
                !view.complete && (
                  <StudioButton
                    label="ادامهٔ مکالمهٔ صوتی"
                    kind="primary"
                    icon={Mic}
                    onPress={() => startVoice(path, true)}
                  />
                )
              ))}
          </View>
          {view.history.map(({ who, line }, i) => (
            <View
              key={`${path.starter}:${i}`}
              style={[
                ss.sample,
                {
                  backgroundColor: who === 'learner' ? '#F1F3E8' : '#FAEEE5',
                  borderLeftColor: who === 'learner' ? '#85A475' : '#C58259',
                },
              ]}
            >
              <Text keepColor style={ss.kicker}>
                {who === 'learner' ? 'تو گفتی' : 'هم‌صحبت'}
              </Text>
              <Text keepColor style={ss.ru}>
                {line.text}
              </Text>
              {(beginner || help) && <Text style={ss.small}>{line.fa}</Text>}
              {(!busy || manual || view.complete) && (
                <PlayLine text={line.text} speak={preview} label="بازپخش" />
              )}
            </View>
          ))}
          {!view.complete && (
            <>
              <Text keepColor style={ss.subhead}>
                {beginner ? 'در این نوبت می‌توانی بگویی' : 'یکی از این منظورها را به روسی بگو'}
              </Text>
              {view.options.map((m, i) => (
                <View key={`${path.picks.length}:${i}`} style={ss.note}>
                  {(beginner || help || lesson.levelId === 2) && (
                    <Text keepColor style={ss.ru}>
                      {m.say.text}
                    </Text>
                  )}
                  <Text style={ss.copy}>{m.say.fa}</Text>
                  {beginner && !!m.say.pronunciation && <Text style={ss.small}>{m.say.pronunciation}</Text>}
                  {(beginner || help) && (!busy || manual) && (
                    <PlayLine text={m.say.text} speak={preview} label="شنیدن نمونه" />
                  )}
                  {manual && (beginner || help || lesson.levelId === 2) && (
                    <StudioButton label={`بگو: ${m.say.text}`} onPress={() => send(i)} />
                  )}
                </View>
              ))}
              {!beginner && (
                <StudioButton
                  label={help ? 'بستن راهنما' : 'نمایش نمونهٔ روسی'}
                  onPress={() => setHelp(!help)}
                />
              )}
              {manual && (
                <>
                  <TextInput
                    accessibilityLabel="پاسخ من به روسی"
                    placeholder="Ответ по-русски…"
                    autoCapitalize="none"
                    value={draft}
                    maxLength={350}
                    onChangeText={setDraft}
                    onSubmitEditing={submit}
                    style={ss.input}
                  />
                  <StudioButton label="فرستادن پاسخ" disabled={!draft.trim()} onPress={submit} />
                </>
              )}
            </>
          )}
          {view.complete && (
            <View style={ss.note}>
              <Text keepColor style={ss.subhead}>
                مرور گفت‌وگو
              </Text>
              <Text style={ss.copy}>
                هر دو نوبت را پیش بردی.{' '}
                {repairs.length
                  ? 'برای پاسخ‌هایی که منظورشان روشن نشد، این نمونه‌ها را مرور کن.'
                  : 'در صورت نیاز، پاسخ‌های همین موقعیت را دوباره بشنو.'}
              </Text>
              {repairs.map(({ heard, example }) => (
                <View key={`${heard}:${example}`} style={ss.sample}>
                  <Text style={ss.small}>پاسخ ثبت‌شده</Text>
                  <Text keepColor style={ss.ru}>
                    {heard}
                  </Text>
                  <Text style={ss.small}>یک پاسخ مناسب در آن نوبت</Text>
                  <Text keepColor style={ss.ru}>
                    {example}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <StudioButton
            icon={RotateCcw}
            label="عوض کردن شروع‌کننده"
            onPress={() => {
              pause();
              setHelp(false);
              setDraft('');
              change(null);
            }}
          />
        </>
      )}
      {!view && !!voice.note && (
        <Text accessibilityLiveRegion="polite" style={ss.copy}>
          {voice.note}
        </Text>
      )}
      {!view?.complete && (
        <StudioButton
          icon={manual ? Play : Keyboard}
          label={manual ? 'مکالمه با میکروفون' : 'تمرین بدون میکروفون'}
          onPress={swapMode}
        />
      )}
      {finish && (
        <StudioButton
          kind={view?.complete ? 'primary' : 'subtle'}
          disabled={locked || (!!view?.complete && voice.phase === 'speaking')}
          label={view?.complete ? 'پایان درس' : 'رد کردن مکالمه و پایان درس'}
          onPress={() => {
            pause();
            finish();
          }}
        />
      )}
    </Paper>
  );
}
