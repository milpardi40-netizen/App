import { ActivityIndicator, StyleSheet, View } from 'react-native';

/**
 * The screen a learner sees for the moment a heavy screen is still being prepared.
 *
 * Language screens are loaded on demand: building a course and its lessons takes long enough on a phone
 * that the tap must answer first. This placeholder paints immediately, so the card press feels instant
 * even though the screen behind it still has work to do.
 */
export default function ScreenLoading({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  return (
    <View style={[styles.root, tone === 'dark' && styles.dark]} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={tone === 'dark' ? '#8FB4FF' : '#4338CA'} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  dark: { backgroundColor: '#0B1220' },
});
