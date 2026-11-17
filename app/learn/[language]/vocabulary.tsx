import { CoursePage } from '@/components/LanguageCourseUI';
import { isNewLanguage } from '@/lib/languages/newCourses';
import { useLocalSearchParams } from 'expo-router';
import { Suspense, lazy } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

/**
 * The lab is loaded on demand.
 *
 * Its cards are built from the shipped course when the module is evaluated — about 900 German cards and
 * 1 300 Russian ones — so importing it eagerly made the route wait for that work before it could paint,
 * which on a phone looked like a frozen screen. Loading it lazily paints this small placeholder at once
 * and lets the lab appear as soon as its cards are ready.
 */
const WordLab = lazy(() => import('@/components/WordLab'));

/** «واژه‌ها» for the newer courses. German has the word lab; French/Spanish keep their lesson flow. */
export default function LanguageVocabularyRoute() {
  const { language } = useLocalSearchParams<{ language: string }>();
  if (language === 'de') {
    return (
      <Suspense fallback={<View style={labLoading.root} accessibilityRole="progressbar"><ActivityIndicator size="large" color="#4338CA" /></View>}>
        <WordLab language="de" />
      </Suspense>
    );
  }
  if (isNewLanguage(language)) {
    return <CoursePage title="واژه‌ها هنوز برای این زبان باز نشده" back={`/learn/${language}`}>{null}</CoursePage>;
  }
  return <CoursePage title="این مسیر آموزشی پیدا نشد">{null}</CoursePage>;
}

const labLoading = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
});
