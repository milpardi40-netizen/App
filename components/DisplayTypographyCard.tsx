import { Pressable, StyleSheet, View } from 'react-native';
import { RotateCcw, Type } from 'lucide-react-native';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { toPersianDigits as fa } from '@/lib/format';
import {
  useDisplayTypography,
  type DisplayFontPreset,
  type DisplaySizePreset,
} from '@/lib/displayTypography';

const palette = {
  forest: '#3A5A40',
  forestSoft: '#E8F0E8',
  ink: '#223127',
  muted: '#647066',
  border: '#E4DEC9',
  sage: '#F7F5EE',
  white: '#FFFFFF',
};

const FONT_OPTIONS: { id: DisplayFontPreset; label: string; desc: string }[] = [
  { id: 'app', label: 'پیش‌فرض اپ', desc: 'Beiruti + کلاسیک' },
  { id: 'modern', label: 'مدرن و خوانا', desc: 'Vazirmatn + Inter' },
  { id: 'system', label: 'فونت خود دستگاه', desc: 'فونت سیستم گوشی' },
];

export default function DisplayTypographyCard({
  compact = false,
}: {
  compact?: boolean;
}) {
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
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.head}>
        <View style={styles.headIcon}>
          <Type size={17} color={palette.forest} />
        </View>
        <View style={styles.headCopy}>
          <Text style={styles.title}>فونت و اندازهٔ متن</Text>
          <Text style={styles.subtitle}>
            نوع فونت و اندازهٔ نوشته‌ها را بدون تغییر ساختار درس‌ها تنظیم کن.
          </Text>
        </View>
      </View>

      <View style={styles.previewBox}>
        <View style={styles.previewTopRow}>
          <Text style={styles.previewLabel}>پیش‌نمایش زنده</Text>
          <Text style={styles.previewBadge}>اندازهٔ فعلی: {fa(Math.round(effectiveScale * 100))}٪</Text>
        </View>
        <Text style={styles.previewFa}>امروز چند جملهٔ کوتاه و کاربردی تمرین می‌کنیم.</Text>
        <Text style={styles.previewForeign}>I practice a few short sentences every day.</Text>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>اندازهٔ متن</Text>
        <View style={styles.optionsWrap}>
          {sizeOptions.map(option => {
            const active = sizePreset === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setSizePreset(option.id)}
                style={({ pressed }) => [
                  styles.optionChip,
                  active && styles.optionChipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text keepColor style={[styles.optionLabel, active && styles.optionLabelActive]}>
                  {option.label}
                </Text>
                <Text keepColor style={[styles.optionHint, active && styles.optionHintActive]}>
                  {option.hint}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>نوع فونت</Text>
        <View style={styles.optionsWrap}>
          {FONT_OPTIONS.map(option => {
            const active = fontPreset === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setFontPreset(option.id)}
                style={({ pressed }) => [
                  styles.optionChip,
                  active && styles.optionChipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text keepColor style={[styles.optionLabel, active && styles.optionLabelActive]}>
                  {option.label}
                </Text>
                <Text keepColor style={[styles.optionHint, active && styles.optionHintActive]}>
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
          <Text keepColor style={styles.resetText}>بازگشت به پیش‌فرض</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    gap: 14,
  },
  cardCompact: {
    borderWidth: 0,
    padding: 4,
    backgroundColor: 'transparent',
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
  headCopy: { flex: 1, gap: 2, alignItems: 'flex-end' },
  title: { fontSize: 15.5, lineHeight: 24, color: palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  subtitle: { fontSize: 12, lineHeight: 19, color: palette.muted, textAlign: 'right', writingDirection: 'rtl' },
  previewBox: {
    borderRadius: 14,
    backgroundColor: palette.sage,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
    gap: 6,
  },
  previewTopRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  previewLabel: { fontSize: 11, color: palette.muted, writingDirection: 'rtl' },
  previewBadge: { fontSize: 11, color: palette.forest, writingDirection: 'rtl' },
  previewFa: { fontSize: 15, lineHeight: 24, color: palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  previewForeign: { fontSize: 16, lineHeight: 24, color: palette.ink, textAlign: 'left', writingDirection: 'ltr' },
  group: { gap: 7 },
  groupLabel: { fontSize: 12.5, color: palette.ink, textAlign: 'right', writingDirection: 'rtl' },
  optionsWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.sage,
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 1,
  },
  optionChipActive: {
    backgroundColor: palette.forest,
    borderColor: palette.forest,
  },
  optionLabel: { fontSize: 12.5, color: palette.ink, writingDirection: 'rtl' },
  optionLabelActive: { color: '#FFFFFF' },
  optionHint: { fontSize: 10.5, color: palette.muted, writingDirection: 'rtl' },
  optionHintActive: { color: '#E8F0E8' },
  resetBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: palette.forestSoft,
  },
  resetText: { fontSize: 12.5, color: palette.forest, writingDirection: 'rtl' },
  pressed: { opacity: 0.78 },
});
