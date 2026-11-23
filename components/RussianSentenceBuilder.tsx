import LanguageSentenceBuilder, { type LanguageSentenceBuilderProps } from '@/components/LanguageSentenceBuilder';

type Props = Omit<LanguageSentenceBuilderProps, 'placeholder'>;

/** Russian word-order & structural sentence builder. */
export default function RussianSentenceBuilder({ guided = false, ...rest }: Props) {
  return <LanguageSentenceBuilder {...rest} guided={guided} placeholder="واژه‌ها را به ترتیب جمله انتخاب کنید." />;
}
