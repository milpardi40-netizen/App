import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { ArrowLeft, Check, ChevronLeft, Headphones, type LucideIcon } from 'lucide-react-native';
import { LocalizedText as Text } from './LocalizedText';
import { toPersianDigits as fa } from '@/lib/format';

// Ink, paper, pencil and a single warm accent. Never use colour alone to identify a step.
export const studio = {
  ink: '#173E3B',
  deep: '#103F39',
  leaf: '#246456',
  mint: '#E3F1DF',
  lime: '#D9EC9A',
  paper: '#FAF8F1',
  white: '#FFFEFA',
  rule: '#D8DED2',
  clay: '#AD482F',
  peach: '#FAE8DE',
  quiet: '#4C625A',
};
export function NotebookMark({ compact = false }: { compact?: boolean }) {
  const { width } = useWindowDimensions();
  const size = compact || width < 380 ? 77 : 111;
  return (
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 110 110" aria-hidden>
        <Circle cx="54" cy="54" r="47" fill="#24574C" />
        <G rotation={-13} origin="50,58">
          <Rect x="16" y="27" width="65" height="67" rx="6" fill="#D8E999" stroke="#123B33" strokeWidth="2" />
          <Path d="M25 41h32M25 49h23M25 76h33" stroke="#899965" strokeWidth="1.5" />
        </G>
        <G rotation={9} origin="60,53">
          <Rect x="39" y="17" width="56" height="70" rx="5" fill="#FFFAE9" stroke="#183E35" strokeWidth="2" />
          <Path d="M47 30h38M47 65h38M47 73h27" stroke="#C7CFB5" strokeWidth="1.7" />
          <SvgText textAnchor="middle" x="66" y="57" fontSize="27" fontWeight="bold" fontFamily="serif" fill="#234C40">
            Я
          </SvgText>
          <Path d="M76 16v18l5-4 4 4V16" fill="#D7704D" />
        </G>
        <Path d="M11 23v-9m-4 4h9M90 95v-7m-4 3h8" stroke="#D8E999" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    </View>
  );
}
export function StudioHero({
  eyebrow,
  title,
  copy,
  children,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  children?: ReactNode;
}) {
  return (
    <View style={ss.hero}>
      <View style={ss.inline}>
        <View style={ss.flex}>
          <Text keepColor style={ss.heroKicker}>
            {eyebrow}
          </Text>
          <Text accessibilityRole="header" keepColor style={ss.heroTitle}>
            {title}
          </Text>
        </View>
        <NotebookMark />
      </View>
      <Text keepColor style={ss.heroCopy}>
        {copy}
      </Text>
      {children}
    </View>
  );
}
export function Paper({ children }: { children: ReactNode }) {
  return <View style={ss.paper}>{children}</View>;
}
export function StudioButton({
  label,
  onPress,
  icon: Icon,
  kind = 'subtle',
  selected,
  disabled,
  a11y,
}: {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  kind?: 'primary' | 'subtle' | 'light';
  selected?: boolean;
  disabled?: boolean;
  a11y?: string;
}) {
  const solid = kind === 'primary' || selected,
    color = solid ? '#FFFFFF' : studio.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y ?? label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        ss.button,
        kind === 'light' && { backgroundColor: studio.lime, borderColor: studio.lime },
        solid && { backgroundColor: studio.deep, borderColor: studio.deep },
        (pressed || disabled) && { opacity: 0.65 },
      ]}
    >
      {Icon && <Icon size={18} color={color} />}
      <Text keepColor style={[ss.buttonText, { color }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function PlayLine({ text, speak, label }: { text: string; speak: (s: string) => void; label?: string }) {
  return (
    <StudioButton icon={Headphones} label={label || 'بشنو'} a11y={`بشنو: ${text}`} onPress={() => speak(text)} />
  );
}
export function Entry({
  title,
  sub,
  number,
  onPress,
  selected,
  done,
  icon: Icon,
  a11y,
}: {
  title: string;
  sub?: string;
  number?: number;
  onPress: () => void;
  selected?: boolean;
  done?: boolean;
  icon?: LucideIcon;
  a11y?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y || title}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [ss.entry, (pressed || selected) && { backgroundColor: studio.mint }]}
    >
      <View style={[ss.badge, done && { backgroundColor: studio.lime }]}>
        {done ? (
          <Check size={19} color={studio.ink} />
        ) : Icon ? (
          <Icon size={20} color={studio.leaf} />
        ) : (
          <Text keepColor style={ss.number}>
            {fa(number ?? 1)}
          </Text>
        )}
      </View>
      <View style={ss.flex}>
        <Text keepColor style={ss.itemTitle}>
          {title}
        </Text>
        {!!sub && <Text style={ss.small}>{sub}</Text>}
      </View>
      <ChevronLeft size={19} color={studio.leaf} />
    </Pressable>
  );
}
export function NextButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <StudioButton icon={ArrowLeft} kind="primary" label={label} onPress={onPress} />;
}
export function Feedback({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View accessibilityLiveRegion="polite" style={[ss.note, { backgroundColor: ok ? studio.mint : studio.peach }]}>
      <Text keepColor style={ss.subhead}>
        {ok ? 'درست است' : 'یک بار دیگر'}
      </Text>
      <Text style={ss.copy}>{text}</Text>
    </View>
  );
}
export const ss = StyleSheet.create({
  root: { flex: 1, backgroundColor: studio.paper },
  page: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 62,
    gap: 14,
  },
  inline: { direction: 'ltr', flexDirection: 'row-reverse', alignItems: 'center', gap: 11 },
  wrap: { direction: 'ltr', flexDirection: 'row-reverse', alignItems: 'center', flexWrap: 'wrap', gap: 7 },
  flex: { flex: 1, minWidth: 0, gap: 3 },
  hero: { backgroundColor: studio.deep, paddingHorizontal: 21, paddingVertical: 18, borderRadius: 24, gap: 9 },
  heroKicker: { color: studio.lime, fontSize: 14, lineHeight: 23 },
  heroTitle: { fontSize: 32, lineHeight: 44, color: '#FFFFFF' },
  heroCopy: { color: '#E5F0E5', fontSize: 17, lineHeight: 27 },
  title: { fontSize: 24, lineHeight: 34, color: studio.ink },
  subhead: { fontSize: 18, lineHeight: 27, color: studio.leaf },
  copy: { fontSize: 16, lineHeight: 26, color: studio.quiet },
  small: { fontSize: 14, lineHeight: 22, color: studio.quiet },
  kicker: { fontSize: 13, lineHeight: 21, color: studio.leaf },
  ru: { fontSize: 24, lineHeight: 36, color: studio.ink, writingDirection: 'ltr', textAlign: 'left' },
  lemma: { fontSize: 34, lineHeight: 45, color: studio.ink, writingDirection: 'ltr', textAlign: 'left' },
  paper: {
    backgroundColor: studio.white,
    borderWidth: 1,
    borderColor: studio.rule,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  note: { backgroundColor: '#F0F2E5', padding: 13, gap: 5, borderRadius: 12 },
  sample: {
    backgroundColor: '#F4F5EA',
    borderRadius: 13,
    borderLeftWidth: 4,
    borderLeftColor: '#83A976',
    padding: 14,
    gap: 7,
  },
  button: {
    minHeight: 44,
    maxWidth: '100%',
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: studio.rule,
    backgroundColor: studio.white,
    direction: 'ltr',
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: { flexShrink: 1, color: studio.ink, fontSize: 15, lineHeight: 23 },
  entry: {
    direction: 'ltr',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 11,
    minHeight: 60,
    padding: 10,
    backgroundColor: '#F5F6EF',
    borderRadius: 13,
  },
  badge: {
    backgroundColor: '#E5EADA',
    minWidth: 37,
    minHeight: 37,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  number: { fontSize: 19, color: studio.leaf },
  itemTitle: { color: studio.ink, fontSize: 18, lineHeight: 26 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#94A79A',
    borderRadius: 12,
    paddingHorizontal: 12,
    color: studio.ink,
    backgroundColor: studio.white,
    fontSize: 16,
  },
});
