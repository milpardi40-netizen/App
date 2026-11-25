import { Pressable, StyleSheet, View } from 'react-native';
import { Check, RotateCcw, Type } from 'lucide-react-native';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { toPersianDigits as fa } from '@/lib/format';
import {
  useDisplayTypography,
  type DisplayFontPreset,
  type DisplaySizePreset,
} from '@/lib/displayTypography';

const palette = {
  forest: '#31533B',
  forestSoft: '#E3ECE3',
  ink: '#26382D',
  muted: '#647066',
  border: '#E4DEC9',
  sage: '#F7F5EE',
  white: '#FFFCF6',
};

const FONT_OPTIONS: { id: DisplayFontPreset; label: string; desc: string }[] = [
  { id: 'app', label: 'پیش‌فرض اپ', desc: 'Beiruti + کلاسیک' },
  { id: 'modern', label: 'مدرن و خوانا', desc: 'Vazirmatn + Inter' },
  { id: 'system', label: 'فونت خود دستگاه', desc: 'سیستم گوشی' },
];

export default function DisplayTypographyCard() {
  const {
    fontPreset,
    sizePreset,
    effectiveScale,
    deviceScaleClamped,
    setFontPreset,
    setSizePreset,
    resetDefaults,
  } = useDisplayTypography();

  const sizeOptions: { id: DisplaySizePreset; label: string; hint: string }[] = [
    { id: 'app', label: 'پیش‌فرض اپ', hint: `${fa(100)}٪` },
    { id: 'system', label: 'هماهنگ با گوشی', hint: `${fa(Math.round(deviceScaleClamped * 100))}٪` },
    { id: 'small', label: 'کوچک', hint: `${fa(90)}٪` },
    { id: 'large', label: 'درشت', hint: `${fa(112)}٪` },
    { id: 'xlarge', label: 'خیلی درشت', hint: `${fa(122)}٪` },
  ];

  const isCustom = fontPreset !== 'app' || sizePreset !== 'app';

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headIcon}>
          <Type size={17} color={palette.forest} />
        </View>
        <View style={styles.headCopy}>
          <Text style={styles.title}>فونت و اندازهٔ متن</Text>
          <Text style={styles.subtitle}>
            نوع فونت و اندازهٔ نوشته‌ها را در کل برنامه تنظیم کنید.
          </Text>
        </View>
      </View>

      <View style={styles.previewBox}>
        <View style={styles.previewTopRow}>
          <Text noFontBump style={styles.previewLabel}>پیش‌نمایش زنده</Text>
          <Text noFontBump keepColor style={styles.previewBadge}>
            اندازه: {fa(Math.round(effectiveScale * 100))}٪
          </Text>
        </View>
        <Text style={styles.previewFa}>امروز چند جملهٔ کوتاه و کاربردی تمرین می‌کنیم.</Text>
        <Text style={styles.previewForeign}>I practice a few short sentences every day.</Text>
      </View>

      <View style={styles.group}>
        <Text noFontBump style={styles.groupLabel}>اندازهٔ متن</Text>
        <View style={styles.rowsList}>
          {sizeOptions.map(option => {
            const active = sizePreset === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setSizePreset(option.id)}
                style={({ pressed }) => [
                  styles.optionRow,
                  active && styles.optionRowActive,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.optionRowRight}>
                  <View style={[styles.radioCircle, active && styles.radioCircleActive]}>
                    {active ? <Check size={12} color="#FFFFFF" strokeWidth={2.6} /> : null}
                  </View>
                  <Text noFontBump keepColor style={[styles.optionLabel, active && styles.optionLabelActive]}>
                    {option.label}
                  </Text>
                </View>
                <Text noFontBump keepColor style={[styles.optionHint, active && styles.optionHintActive]}>
                  {option.hint}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.group}>
        <Text noFontBump style={styles.groupLabel}>نوع فونت</Text>
        <View style={styles.rowsList}>
          {FONT_OPTIONS.map(option => {
            const active = fontPreset === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setFontPreset(option.id)}
                style={({ pressed }) => [
                  styles.optionRow,
                  active && styles.optionRowActive,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.optionRowRight}>
                  <View style={[styles.radioCircle, active && styles.radioCircleActive]}>
                    {active ? <Check size={12} color="#FFFFFF" strokeWidth={2.6} /> : null}
                  </View>
                  <Text noFontBump keepColor style={[styles.optionLabel, active && styles.optionLabelActive]}>
                    {option.label}
                  </Text>
                </View>
                <Text noFontBump keepColor style={[styles.optionHint, active && styles.optionHintActive]}>
                  {option.desc}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isCustom ? (
        <Pressable
          accessibilityRole="button"
          onPress={resetDefaults}
          style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}
        >
          <RotateCcw size={14} color={palette.forest} />
          <Text noFontBump keepColor style={styles.resetText}>بازگشت به پیش‌فرض</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
    gap: 14,
  },
  head: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  headIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: palette.forestSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headCopy: { flex: 1, minWidth: 0, gap: 2, alignItems: 'flex-end' },
  title: { fontSize: 15.5, lineHeight: 26, color: palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  subtitle: { fontSize: 12, lineHeight: 21, color: palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  previewBox: {
    borderRadius: 16,
    backgroundColor: palette.sage,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    gap: 10,
  },
  previewTopRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  previewLabel: { fontSize: 11.5, lineHeight: 20, color: palette.muted, writingDirection: 'rtl' },
  previewBadge: { fontSize: 11.5, lineHeight: 20, color: palette.forest, writingDirection: 'rtl' },
  previewFa: { fontSize: 15, lineHeight: 26, color: palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  previewForeign: { fontSize: 15.5, lineHeight: 25, color: palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  group: { gap: 8 },
  groupLabel: { fontSize: 13, lineHeight: 22, color: palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  rowsList: { gap: 8 },
  optionRow: {
    minHeight: 48,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.sage,
  },
  optionRowActive: {
    backgroundColor: palette.forestSoft,
    borderColor: palette.forest,
  },
  optionRowRight: { flex: 1, minWidth: 0, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.muted,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: palette.forest,
    backgroundColor: palette.forest,
  },
  optionLabel: { flexShrink: 1, fontSize: 13.5, lineHeight: 22, color: palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  optionLabelActive: { color: palette.forest },
  optionHint: { flexShrink: 0, fontSize: 12, lineHeight: 20, color: palette.muted, writingDirection: 'rtl' },
  optionHintActive: { color: palette.forest },
  resetBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: palette.forestSoft,
  },
  resetText: { fontSize: 12.5, lineHeight: 21, color: palette.forest, writingDirection: 'rtl' },
  pressed: { opacity: 0.78 },
});
