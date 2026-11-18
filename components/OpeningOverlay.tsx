import { ActivityIndicator, StyleSheet, View } from 'react-native';

/**
 * A quiet progress layer over the screen whose card was just tapped.
 *
 * It exists so the tap is answered immediately, even when the next screen still has to build its course
 * and lessons. It never blocks the content behind it for long: it is removed when the screen loses focus.
 */
export default function OpeningOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View pointerEvents="none" style={styles.overlay} accessibilityRole="progressbar">
      <View style={styles.pill}><ActivityIndicator color="#4338CA" /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(248,250,252,0.55)' },
  pill: { padding: 14, borderRadius: 999, backgroundColor: '#FFFFFF', shadowColor: '#0F172A', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
});
