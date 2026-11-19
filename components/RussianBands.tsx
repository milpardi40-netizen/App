import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { studio } from './RussianStudioUI';
import { LocalizedText as Text } from './LocalizedText';
import { GRAMMAR_BANDS } from '@/lib/languages/russianGrammar/units';

export function BandPicker({
  value,
  set,
  all = false,
}: {
  value: number;
  set: (b: number) => void;
  all?: boolean;
}) {
  const { width, fontScale } = useWindowDimensions();
  const bands = all ? ['همه', ...GRAMMAR_BANDS] : GRAMMAR_BANDS;
  // Equal-height touch targets; use balanced rows rather than leaving C1 alone on a narrow phone.
  const capacity = Math.max(2, Math.floor((Math.min(width, 720) - 66) / Math.max(49, fontScale * 51)));
  const cols = Math.ceil(bands.length / Math.ceil(bands.length / capacity));
  return (
    <View style={{ gap: 4 }}>
      {Array.from({ length: Math.ceil(bands.length / cols) }, (_, row) => (
        <View style={styles.row} key={row}>
          {bands.slice(row * cols, (row + 1) * cols).map((s, i) => {
            const n = row * cols + i - Number(all),
              selected = n === value;
            return (
              <Pressable
                key={s}
                accessibilityRole="button"
                accessibilityLabel={n < 0 ? 'همهٔ سطح‌ها' : `سطح ${s}`}
                accessibilityState={{ selected }}
                onPress={() => set(n)}
                style={({ pressed }) => [
                  styles.band,
                  { flex: s === 'Pre-A1' ? 1.4 : 1 },
                  selected && styles.active,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text keepColor style={{ fontSize: 15, color: selected ? '#FFFFFF' : studio.ink }}>
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { direction: 'ltr', flexDirection: 'row-reverse', gap: 4 },
  band: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F3E9',
    borderRadius: 9,
    paddingVertical: 5,
  },
  active: { backgroundColor: studio.deep },
});
