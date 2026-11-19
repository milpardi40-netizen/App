import { useLocalSearchParams } from 'expo-router';
import RussianGrammarWorkshop from '@/components/RussianGrammarWorkshop';

export default function RussianGrammarRoute() {
  const { lessonId } = useLocalSearchParams<{ lessonId?: string }>();
  return <RussianGrammarWorkshop key={lessonId ?? 'all'} lessonId={lessonId} />;
}
