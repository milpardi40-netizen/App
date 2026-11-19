import { useEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { PageNavigation } from '@/components/PageNavigation';
import { Paper, ss, StudioButton } from '@/components/RussianStudioUI';
import { BandPicker } from '@/components/RussianBands';
import RussianDialoguePractice from '@/components/RussianDialoguePractice';
import { RUSSIAN_LESSONS, findRussianLesson, type RussianCourseLesson } from '@/lib/languages/russian';
import { modeForLevel } from '@/components/LanguageDialoguePractice';
import { playRussianSpeech, stopRussianSpeech } from '@/lib/russianSpeech';
import { toPersianDigits as fa } from '@/lib/format';

// The independent room rehearses the same complete, local sentence list as the lesson stage.
function Rehearsal({ lesson }: { lesson: RussianCourseLesson }) {
  useEffect(() => () => { void stopRussianSpeech(); }, []);
  return <RussianDialoguePractice
    sentences={lesson.sentences}
    onSpeak={text => { void playRussianSpeech(text, 0.9); }}
    locale="ru-RU"
    defaultMode={modeForLevel(lesson.levelId)}
  />;
}
export default function RussianConversationRoom() {
  const { lessonId } = useLocalSearchParams<{ lessonId?: string }>(),
    router = useRouter(),
    scroll = useRef<ScrollView>(null);
  const lesson = findRussianLesson(lessonId) ?? RUSSIAN_LESSONS[0];
  const group = RUSSIAN_LESSONS.filter((l) => l.levelId === lesson.levelId),
    i = group.indexOf(lesson);
  const go = (next: RussianCourseLesson) => {
    router.setParams({ lessonId: next.id });
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  return (
    <View style={ss.root}>
      <ScrollView ref={scroll} contentContainerStyle={ss.page} keyboardShouldPersistTaps="handled">
        <View style={ss.inline}>
          <View style={ss.flex}>
            <Text keepColor style={ss.kicker}>
              روسی / تمرین آزاد
            </Text>
            <Text accessibilityRole="header" keepColor style={ss.title}>
              اتاق مکالمه
            </Text>
          </View>
          <PageNavigation backFallback="/learn/ru" />
        </View>
        <Paper>
          <Text keepColor style={ss.kicker}>
            موقعیت {fa(i + 1)} از {fa(group.length)}
          </Text>
          <Text keepColor style={ss.title}>
            {lesson.title}
          </Text>
          <BandPicker
            value={lesson.levelId}
            set={(n) => {
              if (n !== lesson.levelId) go(RUSSIAN_LESSONS.find((l) => l.levelId === n)!);
            }}
          />
        </Paper>
        <Rehearsal key={lesson.id} lesson={lesson} />
        <View style={ss.wrap}>
          <StudioButton label="موقعیت بعدی" disabled={i === group.length - 1} onPress={() => go(group[i + 1])} />
          <StudioButton label="موقعیت قبلی" disabled={!i} onPress={() => go(group[i - 1])} />
        </View>
        <Text style={ss.small}>اینجا آزادانه تمرین کن؛ جای ادامهٔ درس اصلی‌ات تغییر نمی‌کند.</Text>
      </ScrollView>
    </View>
  );
}
