import { LocalizedText as Text } from '@/components/LocalizedText';
import { Stack } from 'expo-router';
import { PageNavigation } from '@/components/PageNavigation';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Colors, Typography } from '@/lib/theme';

const RELOAD_FLAG = 'milo-not-found-reloaded';

/**
 * A web session opened before a route shipped keeps its old JS bundle: the new
 * route matches nothing and lands here. One session-guarded reload picks the
 * fresh bundle up; anything genuinely unknown then shows this screen with a
 * manual reload — never a silent loop.
 */
export default function NotFoundScreen() {
  const [path, setPath] = useState('');
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      setPath(window.location.pathname + window.location.search);
      if (sessionStorage.getItem(RELOAD_FLAG) !== '1' && window.location.pathname !== '/') {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
      }
    } catch {
      // Storage unavailable (private mode): skip the auto-reload silently.
    }
  }, []);

  const reloadFresh = () => {
    try { sessionStorage.removeItem(RELOAD_FLAG); } catch {}
    window.location.reload();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'صفحه یافت نشد' }} />
      <View style={styles.container}>
        <PageNavigation tone="dark" />
        <Text style={styles.title}>صفحه مورد نظر یافت نشد</Text>
        {Platform.OS === 'web' ? (
          <>
            <Pressable accessibilityRole="button" style={styles.reloadButton} onPress={reloadFresh}>
              <Text style={styles.reloadText}>بارگذاری نسخهٔ تازه</Text>
            </Pressable>
            {path ? <Text style={styles.pathNote}>{path}</Text> : null}
          </>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[950],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
  },
  reloadButton: {
    marginTop: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    backgroundColor: Colors.neutral[900],
  },
  reloadText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.md,
    color: Colors.neutral[0],
  },
  pathNote: {
    marginTop: 16,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.neutral[400],
    textAlign: 'center',
  },
});
