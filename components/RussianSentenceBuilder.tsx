import type { LearningSentence } from '@/lib/languages/types';
import LanguageSentenceBuilder from '@/components/LanguageSentenceBuilder';

/** Russian word-order practice. Layout is shared; only the hint differs. */
export default function RussianSentenceBuilder({ sentence, guided = false }: { sentence: LearningSentence; guided?: boolean }) {
  return <LanguageSentenceBuilder sentence={sentence} guided={guided} placeholder="واژه‌ها را به ترتیب جمله انتخاب کنید." />;
}
