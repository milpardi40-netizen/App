import { LocalizedText as Text } from '@/components/LocalizedText';
import { StyleSheet, View } from 'react-native';
import { READY_THRESHOLD } from '@/lib/content/courseSpec';
import { bandReadinessForLevel, type CourseReadiness } from '@/lib/content/readiness';
import { toPersianDigits as fa } from '@/lib/format';
import { Typography } from '@/lib/theme';

/**
 * Honest content indicator for a level card, in the two branches the course spec measures:
 *
 *   • «ساختار»  — lessons, sentences and an assessment, out of what the band requires;
 *   • «واژگان»  — how much of the band's word target the course really uses, counted out of the target
 *     itself so the percentage can always be read back as «۳۴۱ از ۴۴۹ واژه».
 *
 * The headline is the weaker branch (below READY_THRESHOLD the level is marked «در حال تکمیل»). The
 * vocabulary the downloaded content packs add is shown next to the vocabulary branch, never inside the
 * headline: a number built from generated coverage frames is not a claim about the course.
 */
export default function LevelReadinessLine({ course, levelId, color }: { course: CourseReadiness; levelId: number; color: string }) {
  const band = bandReadinessForLevel(course, levelId);
  if (!band) return null;
  const value = band.readiness;
  const words = `${fa(band.coveredWords)} از ${fa(band.vocabularyTargetSize)}`;
  return (
    <View>
      <View style={styles.wrap}>
        <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(2, value)}%`, backgroundColor: color }]} /></View>
        <Text style={styles.label}>محتوا: {fa(value)}٪ آماده{value < READY_THRESHOLD ? ' · در حال تکمیل' : ''}</Text>
      </View>
      <View style={styles.branches}>
        <Branch label="ساختار" value={band.structureScore} detail={`${fa(band.lessons)} از ${fa(band.lessonsTarget)} درس`} color={color} />
        <Branch
          label={band.vocabularyTarget === 'beginner' ? 'واژگان مقدماتی' : 'واژگان پربسامد'}
          value={band.coverage}
          detail={words}
          color={color}
          note={band.coverageWithPacks > band.coverage ? `با بسته‌ها ${fa(band.coverageWithPacks)}٪` : undefined}
        />
      </View>
    </View>
  );
}

function Branch({ label, value, detail, color, note }: { label: string; value: number; detail: string; color: string; note?: string }) {
  return (
    <View style={styles.branch}>
      <View style={[styles.miniTrack, { flex: 0.34 }]}>
        <View style={[styles.miniFill, { width: `${Math.max(2, value)}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.branchLabel}>{label}: {fa(value)}٪ · {detail}{note ? ` · ${note}` : ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 4 },
  branches: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10, marginTop: 3 },
  branch: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  miniTrack: { height: 3, borderRadius: 2, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  miniFill: { height: 3, borderRadius: 2 },
  track: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  label: { fontFamily: Typography.fontFamily, fontSize: 10.5, color: '#6B7280', writingDirection: 'rtl' },
  branchLabel: { fontFamily: Typography.fontFamily, flex: 1, fontSize: 9.5, lineHeight: 13, color: '#6B7280', writingDirection: 'rtl' },
});
