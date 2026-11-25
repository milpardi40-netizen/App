import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Download, LockKeyhole, SlidersHorizontal, Volume2, X } from 'lucide-react-native';
import { LocalizedText as Text } from '@/components/LocalizedText';
import DisplayTypographyCard from '@/components/DisplayTypographyCard';
import { AppUpdateCard } from '@/components/AppUpdateCard';
import { prefersRecordedSpeech, setPrefersRecordedSpeech } from '@/lib/content/speechFallback';
import { Typography } from '@/lib/theme';

const palette = {
  canvas: '#F7F2E8',
  paper: '#FFFCF6',
  ink: '#26382D',
  forest: '#31533B',
  forestSoft: '#E3ECE3',
  sage: '#E8EBDD',
  muted: '#746E63',
  border: '#E6DDCE',
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function QuickSettingsModal({ visible, onClose }: Props) {
  const router = useRouter();
  const [useRecorded, setUseRecorded] = useState(false);

  useEffect(() => {
    if (!visible) return;
    void prefersRecordedSpeech().then(setUseRecorded);
  }, [visible]);

  const toggleSpeech = () => {
    const next = !useRecorded;
    setUseRecorded(next);
    void setPrefersRecordedSpeech(next);
  };

  const navigate = (href: string) => {
    onClose();
    router.push(href as never);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.titleIcon}>
                <SlidersHorizontal size={17} color={palette.forest} />
              </View>
              <View style={styles.titleCopy}>
                <Text style={styles.title}>امکانات و تنظیمات سریع</Text>
                <Text style={styles.subtitle}>فونت، صدا، پشتیبان و امنیت در یک نگاه</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="بستن تنظیمات سریع"
              onPress={onClose}
              style={styles.closeBtn}
            >
              <X size={18} color={palette.ink} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Quick Voice Switch */}
            <View style={styles.quickCard}>
              <View style={styles.quickHead}>
                <Volume2 size={17} color={palette.forest} />
                <Text style={styles.quickTitle}>گویندهٔ تلفظ و جمله‌ها</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={toggleSpeech}
                style={({ pressed }) => [styles.toggleRow, useRecorded && styles.toggleRowOn, pressed && styles.pressed]}
              >
                <Text style={styles.toggleLabel}>
                  {useRecorded ? 'صدای ضبط‌شده · روشن' : 'صدای گوشی · پیش‌فرض'}
                </Text>
                <View style={[styles.switchTrack, useRecorded && styles.switchTrackOn]}>
                  <View style={styles.switchThumb} />
                </View>
              </Pressable>
            </View>

            {/* Quick Shortcuts */}
            <View style={styles.shortcutRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigate('/lang/backup')}
                style={({ pressed }) => [styles.shortcutBtn, pressed && styles.pressed]}
              >
                <Download size={16} color={palette.forest} />
                <Text style={styles.shortcutText}>پشتیبان پیشرفت</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigate('/app-lock')}
                style={({ pressed }) => [styles.shortcutBtn, pressed && styles.pressed]}
              >
                <LockKeyhole size={16} color={palette.forest} />
                <Text style={styles.shortcutText}>قفل برنامه</Text>
              </Pressable>
            </View>

            {/* Typography */}
            <DisplayTypographyCard />

            {/* App Update */}
            <AppUpdateCard />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 28, 22, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: palette.canvas,
    borderTopWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: palette.paper,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  titleRow: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  titleIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: palette.forestSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCopy: { flex: 1, alignItems: 'flex-end', gap: 1 },
  title: { fontFamily: Typography.boldFontFamily, fontSize: 16, color: palette.ink, writingDirection: 'rtl' },
  subtitle: { fontFamily: Typography.fontFamily, fontSize: 11.5, color: palette.muted, writingDirection: 'rtl' },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: palette.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 16, gap: 12, paddingBottom: 32 },
  quickCard: {
    borderRadius: 20,
    padding: 15,
    gap: 10,
    backgroundColor: palette.paper,
    borderWidth: 1,
    borderColor: palette.border,
  },
  quickHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  quickTitle: { fontFamily: Typography.boldFontFamily, fontSize: 14.5, color: palette.ink, writingDirection: 'rtl' },
  toggleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.sage,
  },
  toggleRowOn: { backgroundColor: palette.forestSoft, borderColor: palette.forest },
  toggleLabel: { fontFamily: Typography.boldFontFamily, fontSize: 13.5, color: palette.ink, writingDirection: 'rtl' },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.muted,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  switchTrackOn: { backgroundColor: palette.forest, alignItems: 'flex-end' },
  switchThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF' },
  shortcutRow: { flexDirection: 'row-reverse', gap: 10 },
  shortcutBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 15,
    backgroundColor: palette.paper,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  shortcutText: { fontFamily: Typography.boldFontFamily, fontSize: 13, color: palette.forest, writingDirection: 'rtl' },
  pressed: { opacity: 0.85 },
});
