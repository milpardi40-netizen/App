import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { PageNavigation } from '@/components/PageNavigation';
import { Paper, ss, StudioButton } from '@/components/RussianStudioUI';
import { BandPicker } from '@/components/RussianBands';
import RussianTurnExchange from '@/components/RussianTurnExchange';
import { RUSSIAN_LESSONS, findRussianLesson, type RussianCourseLesson } from '@/lib/languages/russian';
import type { ExchangePath } from '@/lib/languages/russianExchange';
import { toPersianDigits as fa } from '@/lib/format';

// Rehearsal never completes a lesson or overwrites a saved finale. No mic on entry or scene change.
function Rehearsal({ lesson }: { lesson: RussianCourseLesson }) {
  const [path, setPath] = useState<ExchangePath | null>(null);
  return <RussianTurnExchange practice lesson={lesson} path={path} change={setPath} />;
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
