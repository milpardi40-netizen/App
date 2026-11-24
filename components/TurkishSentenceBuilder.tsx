import LanguageSentenceBuilder, { type LanguageSentenceBuilderProps } from '@/components/LanguageSentenceBuilder';

type Props = Omit<LanguageSentenceBuilderProps, 'placeholder'>;

/** Turkish word-order & structural sentence builder. */
export default function TurkishSentenceBuilder(props: Props) {
  return <LanguageSentenceBuilder {...props} placeholder="واژه‌ها را به ترتیب جملهٔ ترکی استانبولی انتخاب کنید." />;
}
