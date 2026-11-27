import { LessonRestartActions } from '@/components/LessonRestartActions';
import { useCourseSnapshot } from '@/hooks/useCourseSnapshot';
import { progressLabel } from '@/lib/levelProgress';
import { MiloGlobeHeadphoneMark } from '@/components/MiloBrandMark';
import { ArabicBottomNav } from './ArabicBottomNav';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock3,
  Play,
  Sparkles,
  Volume2,
} from 'lucide-react-native';
import {
  ARABIC_LESSONS,
  ARABIC_LEVELS,
  type ArabicLesson,
  type ArabicLevelId,
} from '@/lib/arabic/content';
import type { CourseProgress } from '@/lib/courseProgress';
import type { ArabicLessonSession } from '@/lib/arabic/studyState';
import { ARABIC_ENGINE_BLUEPRINT, getArabicLevelMetrics } from '@/lib/arabic/engine';
import { stripArabicDiacritics } from '@/lib/arabic/text';
import { EnglishPalette as Palette } from '@/components/EnglishSupplementTask';
import { Typography } from '@/lib/theme';
import {
  ENGLISH_LEVEL_GRADIENTS,
  EnglishLevelRail,
  EnglishProgressTrack,
  EnglishSectionHeading,
} from '@/components/EnglishUI';
import { toPersianDigits } from '@/lib/format';
import { PageNavigation } from '@/components/PageNavigation';

const LESSONS_PER_GROUP = 10;
const sentenceTotal = ARABIC_LESSONS.reduce((total, lesson) => total + lesson.sentences.length, 0);
const uniqueArabicWordCount = (() => {
  const words = new Set<string>();
  for (const lesson of ARABIC_LESSONS) {
    for (const sentence of lesson.sentences) {
      for (const vocab of sentence.vocabulary) {
        const key = stripArabicDiacritics(vocab.word).trim();
        if (key) words.add(key);
      }
    }
  }
  return words.size;
})();

function lessonStatus(
  lesson: ArabicLesson,
  progress: CourseProgress | null,
  sessions: Record<string, ArabicLessonSession>,
) {
  if (progress?.completedLessonIds.includes(lesson.id)) return 'تکمیل‌شده · قابل مرور';
  const session = sessions[lesson.id];
  if (session && (session.stage > 0 || session.sentenceIndex > 0)) {
    return `ادامه از مرحله ${toPersianDigits(session.stage + 1)}، جمله ${toPersianDigits(session.sentenceIndex + 1)}`;
  }
  return 'شروع درس';
}

export default function ArabicLibraryScreen() {
  const [expandedGroup, setExpandedGroup] = useState(0);
  const { level } = useLocalSearchParams<{ level?: string }>();
  const router = useRouter();
  const { data: snapshot, failed, retry } = useCourseSnapshot('ar');
  const progress = snapshot?.progress ?? null;
  const sessions = (snapshot?.sessions ?? {}) as Record<string, ArabicLessonSession>;
  const error = failed || snapshot?.unreadable ? 'بخشی از سابقه خوانده نشد؛ داده‌های ذخیره‌شده تغییر نکرده‌اند.' : '';
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);
  const selected = hydrated ? ARABIC_LEVELS.find(item => String(item.id) === level) : undefined;
  useEffect(() => { setExpandedGroup(0); }, [selected?.id]);

  const lessons = useMemo(
    () =>
      selected
        ? ARABIC_LESSONS
            .filter(item => item.levelId === selected.id)
            .slice()
            .sort((a, b) => a.order - b.order)
        : [],
    [selected],
  );
  const completedIds = progress?.completedLessonIds ?? [];
  const completed = lessons.filter(item => completedIds.includes(item.id)).length;
  const levelStartLesson = lessons.find(item => item.id === (selected ? snapshot?.resumeForLevel(selected.id)?.id : undefined)) ?? lessons[0];
  const levelFullyCompleted = lessons.length > 0 && completed === lessons.length;
  const levelStartLabel = levelFullyCompleted
    ? 'بازبینی این سطح'
    : levelStartLesson && sessions[levelStartLesson.id]
      ? 'ادامهٔ درس این سطح'
      : 'شروع یادگیری از این سطح';
  const metrics = selected ? getArabicLevelMetrics(selected.id, completedIds) : null;
  const blueprint = selected ? ARABIC_ENGINE_BLUEPRINT.find(item => item.levelId === selected.id) : null;

  const lessonGroups = useMemo(() => {
    const groups: ArabicLesson[][] = [];
    for (let index = 0; index < lessons.length; index += LESSONS_PER_GROUP) {
      groups.push(lessons.slice(index, index + LESSONS_PER_GROUP));
    }
    return groups;
  }, [lessons]);

  const activeLesson =
    ARABIC_LESSONS.find(item => item.id === (snapshot?.current?.id ?? progress?.currentLessonId)) ??
    ARABIC_LESSONS[0];
  const activeLevelId: ArabicLevelId = activeLesson?.levelId ?? 0;
  const counts = snapshot?.levels ?? {};

  const openLevel = (levelId: ArabicLevelId) =>
    router.push({ pathname: '/learn/ar/library', params: { level: String(levelId) } } as never);
  const startSelectedLevel = () => {
    if (levelStartLesson) {
      router.push({ pathname: '/learn/ar/lesson', params: { id: levelStartLesson.id } } as never);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          {!selected ? (
            <>
              <View style={styles.topBar}>
                <PageNavigation backFallback="/learn/ar" />
                <Text style={styles.pageTitle}>مسیر یادگیری عربی</Text>
                <Text style={styles.pageIntro}>یک سطح را انتخاب کنید.</Text>
              </View>

              <LinearGradient
                colors={['#19204C', '#343B8A', '#5148C8']}
                start={{ x: 0.95, y: 0.1 }}
                end={{ x: 0.05, y: 0.95 }}
                style={styles.overviewHero}
              >
                <View pointerEvents="none" style={styles.heroOrb} />
                <View style={styles.heroTopRow}>
                  <View style={styles.heroIcon}>
                    <MiloGlobeHeadphoneMark size={48} />
                  </View>
                  <View style={styles.heroPill}>
                    <Sparkles size={13} color="#C8C9FF" />
                    <Text style={styles.heroPillText}>{toPersianDigits(ARABIC_LEVELS.length)} سطح آموزشی</Text>
                  </View>
                </View>
                <Text style={styles.overviewTitle}>یک مسیر روشن؛{'\n'}جمله به جمله</Text>
                <View style={styles.overviewMetrics}>
                  <View style={styles.overviewMetric}>
                    <Text style={styles.overviewMetricValue}>{toPersianDigits(ARABIC_LESSONS.length)}</Text>
                    <Text style={styles.overviewMetricLabel}>درس موجود</Text>
                  </View>
                  <View style={styles.overviewMetricDivider} />
                  <View style={styles.overviewMetric}>
                    <Text style={styles.overviewMetricValue}>{toPersianDigits(sentenceTotal)}</Text>
                    <Text style={styles.overviewMetricLabel}>جملهٔ اصلی</Text>
                  </View>
                  <View style={styles.overviewMetricDivider} />
                  <View style={styles.overviewMetric}>
                    <Text style={styles.overviewMetricValue}>{toPersianDigits(uniqueArabicWordCount)}</Text>
                    <Text style={styles.overviewMetricLabel}>واژهٔ یکتا</Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.levelRailCard}>
                <EnglishSectionHeading
                  eyebrow="YOUR CURRENT STEP"
                  title="پیشرفت در سطح‌ها"
                  detail="برای شروع فقط یک سطح را باز کنید؛ لازم نیست همهٔ مسیر را یک‌باره ببینید."
                />
                <View style={styles.railWrap}>
                  <EnglishLevelRail<ArabicLevelId>
                    activeLevelId={activeLevelId}
                    counts={counts}
                    levels={ARABIC_LEVELS}
                    direction="rtl"
                    onSelect={openLevel}
                  />
                </View>
                <Text style={styles.railCurrent}>
                  {ARABIC_LEVELS.find(item => item.id === activeLevelId)?.title}
                </Text>
              </View>

              <EnglishSectionHeading
                eyebrow="CHOOSE A LEVEL"
                title="انتخاب سطح"
                detail="آمار هر کارت از درس‌ها، جمله‌ها و واژه‌های یکتای همان سطح محاسبه می‌شود."
              />
              <View style={styles.levelList}>
                {ARABIC_LEVELS.map(item => {
                  const stats = getArabicLevelMetrics(item.id, completedIds);
                  const pct = counts[item.id]?.percent ?? stats.percent;
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`فهرست درس‌های ${item.title}`}
                      style={({ pressed }) => [styles.levelOption, pressed && styles.pressed]}
                      onPress={() => openLevel(item.id)}
                    >
                      <LinearGradient colors={ENGLISH_LEVEL_GRADIENTS[item.id]} style={styles.levelOptionMark}>
                        <Text style={styles.levelOptionNumber}>{toPersianDigits(item.id)}</Text>
                      </LinearGradient>
                      <View style={styles.levelOptionContent}>
                        <View style={styles.levelOptionTitleRow}>
                          <Text style={styles.levelOptionTitle}>{item.title}</Text>
                          <Text style={[styles.levelOptionBand, { color: item.accent }]}>{item.cefr}</Text>
                        </View>
                        <Text style={styles.levelOptionDescription}>{item.subtitle}</Text>
                        <View style={styles.levelOptionMeta}>
                          <Text style={styles.levelOptionMetaText}>{progressLabel(counts[item.id])}</Text>
                          <View style={styles.metaDot} />
                          <Text style={styles.levelOptionMetaText}>
                            {toPersianDigits(stats.sentenceCount)} جمله
                          </Text>
                          <View style={styles.metaDot} />
                          <Text style={styles.levelOptionMetaText}>
                            {toPersianDigits(stats.vocabularyCount)} واژهٔ یکتا
                          </Text>
                        </View>
                        <EnglishProgressTrack value={pct} color={item.accent} height={5} />
                      </View>
                      <ChevronLeft size={19} color={Palette.muted} />
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            <>
              <View style={styles.selectedTopBar}>
                <View style={styles.selectedBrandRow}>
                  <MiloGlobeHeadphoneMark size={48} />
                  <PageNavigation backFallback="/learn/ar/library" />
                </View>
                <Text style={styles.brandEyebrow}>LEVEL {selected.id} · COURSE MAP</Text>
              </View>

              {metrics && (
                <LinearGradient
                  colors={ENGLISH_LEVEL_GRADIENTS[selected.id]}
                  start={{ x: 0.95, y: 0 }}
                  end={{ x: 0.05, y: 1 }}
                  style={styles.levelHero}
                >
                  <View pointerEvents="none" style={styles.levelHeroOrb} />
                  <View style={styles.levelHeroTop}>
                    <View style={styles.levelHeroTag}>
                      <Text style={styles.levelHeroTagText}>LEVEL {selected.id}</Text>
                    </View>
                    <Text style={styles.levelHeroBand}>{selected.cefr}</Text>
                  </View>
                  <Text style={styles.selectedTitle}>{selected.title}</Text>
                  <Text style={styles.selectedArabicTitle}>{selected.arabicTitle}</Text>
                  <Text style={styles.selectedDescription}>{selected.subtitle}</Text>
                  <View style={styles.selectedProgressHeading}>
                    <Text style={styles.selectedProgressLabel}>پیشرفت این سطح</Text>
                    <Text style={styles.selectedProgressValue}>{progressLabel(counts[selected.id])}</Text>
                  </View>
                  <EnglishProgressTrack
                    value={counts[selected.id]?.percent ?? metrics.percent}
                    color="#B8F28F"
                    trackColor="rgba(255,255,255,0.22)"
                    height={7}
                  />
                  <View style={styles.metricGrid}>
                    <View style={styles.heroMetric}>
                      <Text style={styles.heroMetricValue}>{toPersianDigits(metrics.sentenceCount)}</Text>
                      <Text style={styles.heroMetricLabel}>جمله</Text>
                    </View>
                    <View style={styles.heroMetricDivider} />
                    <View style={styles.heroMetric}>
                      <Text style={styles.heroMetricValue}>{toPersianDigits(metrics.patternCount)}</Text>
                      <Text style={styles.heroMetricLabel}>الگوی ثبت‌شده</Text>
                    </View>
                    <View style={styles.heroMetricDivider} />
                    <View style={styles.heroMetric}>
                      <Text style={styles.heroMetricValue}>{toPersianDigits(metrics.vocabularyCount)}</Text>
                      <Text style={styles.heroMetricLabel}>واژهٔ یکتا</Text>
                    </View>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${levelStartLabel}: ${selected.title}`}
                    accessibilityState={{ disabled: !levelStartLesson }}
                    disabled={!levelStartLesson}
                    style={({ pressed }) => [
                      styles.levelStartButton,
                      pressed && styles.pressed,
                      !levelStartLesson && styles.levelStartButtonDisabled,
                    ]}
                    onPress={startSelectedLevel}
                  >
                    <Play size={16} color={selected.accent} fill={selected.accent} />
                    <Text style={styles.levelStartButtonText}>{levelStartLabel}</Text>
                    <ChevronLeft size={18} color={selected.accent} />
                  </Pressable>
                  <LessonRestartActions lessonPath="/learn/ar/lesson" firstLessonId={lessons[0]?.id} lessonId={levelStartLesson?.id} color={selected.accent} />
                </LinearGradient>
              )}

              {blueprint ? (
                <View style={styles.focusCard}>
                  <View style={styles.focusHeadingRow}>
                    <View style={styles.focusIcon}>
                      <Sparkles size={17} color={Palette.primary} />
                    </View>
                    <View style={styles.focusHeadingCopy}>
                      <Text style={styles.focusTitle}>موضوعات و هدف‌های این سطح</Text>
                    </View>
                  </View>
                  <Text style={styles.focusDescription}>{blueprint.focus}</Text>
                  <View style={styles.moduleGrid}>
                    <View style={styles.moduleChip}>
                      <View style={[styles.moduleDot, { backgroundColor: selected.accent }]} />
                      <Text style={styles.moduleText}>خواندن: {blueprint.readingGoal}</Text>
                    </View>
                    <View style={styles.moduleChip}>
                      <View style={[styles.moduleDot, { backgroundColor: selected.accent }]} />
                      <Text style={styles.moduleText}>گفتار: {blueprint.speakingGoal}</Text>
                    </View>
                    <View style={styles.moduleChip}>
                      <View style={[styles.moduleDot, { backgroundColor: selected.accent }]} />
                      <Text style={styles.moduleText}>دستور: {blueprint.grammarGoal}</Text>
                    </View>
                  </View>
                </View>
              ) : null}

              <View style={styles.lessonSectionHeading}>
                <View>
                  <Text style={styles.lessonSectionTitle}>درس‌ها، به ترتیب</Text>
                </View>
                <View style={styles.lessonCountPill}>
                  <BookOpen size={13} color={Palette.primary} />
                  <Text style={styles.lessonCountText}>{toPersianDigits(lessons.length)} درس</Text>
                </View>
              </View>

              <View style={styles.groupList}>
                {lessonGroups.map((group, index) => {
                  const first = group[0];
                  const last = group[group.length - 1];
                  const groupCompleted = group.filter(item => completedIds.includes(item.id)).length;
                  const open = expandedGroup === index;
                  const groupNumber = index + 1;
                  const groupTitle = `بخش ${toPersianDigits(groupNumber)} · درس‌های ${toPersianDigits(first.order)} تا ${toPersianDigits(last.order)}`;
                  return (
                    <View key={`${first.id}-${last.id}`} style={styles.group}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={groupTitle}
                        accessibilityState={{ expanded: open }}
                        style={styles.groupHeader}
                        onPress={() => setExpandedGroup(open ? -1 : index)}
                      >
                        <View style={[styles.groupNumber, open && styles.groupNumberActive]}>
                          <Text style={[styles.groupNumberText, open && styles.groupNumberTextActive]}>
                            {toPersianDigits(groupNumber)}
                          </Text>
                        </View>
                        <View style={styles.groupHeaderCopy}>
                          <Text style={styles.groupTitle}>{groupTitle}</Text>
                          <Text style={styles.groupMeta}>
                            {toPersianDigits(group.length)} درس · {toPersianDigits(groupCompleted)} تکمیل‌شده · درس‌های{' '}
                            {toPersianDigits(first.order)} تا {toPersianDigits(last.order)}
                          </Text>
                        </View>
                        {open ? (
                          <ChevronUp size={18} color={Palette.primary} />
                        ) : (
                          <ChevronDown size={18} color={Palette.muted} />
                        )}
                      </Pressable>
                      {open && (
                        <View style={styles.lessonList}>
                          {group.map(item => {
                            const status = lessonStatus(item, progress, sessions);
                            const isComplete = completedIds.includes(item.id);
                            const isResumable = !isComplete && status.startsWith('ادامه');
                            const previewSentence = item.sentences[0];
                            return (
                              <Pressable
                                key={item.id}
                                accessibilityRole="button"
                                accessibilityLabel={`${item.order}. ${item.title}`}
                                style={({ pressed }) => [styles.lessonCard, pressed && styles.pressed]}
                                onPress={() =>
                                  router.push({ pathname: '/learn/ar/lesson', params: { id: item.id } } as never)
                                }
                              >
                                <View style={[styles.lessonOrder, isComplete && styles.lessonOrderComplete]}>
                                  {isComplete ? (
                                    <Check size={16} color="#FFFFFF" strokeWidth={3} />
                                  ) : (
                                    <Text style={styles.lessonOrderText}>{toPersianDigits(item.order)}</Text>
                                  )}
                                </View>
                                <View style={styles.lessonCopy}>
                                  <View style={styles.lessonTitleLine}>
                                    <Text style={styles.lessonTitle}>{item.title}</Text>
                                    <View
                                      style={[
                                        styles.lessonStatus,
                                        isComplete && styles.lessonStatusDone,
                                        isResumable && styles.lessonStatusResume,
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.lessonStatusText,
                                          isComplete && styles.lessonStatusTextDone,
                                          isResumable && styles.lessonStatusTextResume,
                                        ]}
                                      >
                                        {status}
                                      </Text>
                                    </View>
                                  </View>
                                  <Text style={styles.lessonSubtitle}>{item.subtitle}</Text>
                                  {previewSentence ? (
                                    <View style={styles.lessonSentencePreview}>
                                      <View style={styles.lessonSentenceHeader}>
                                        <Volume2 size={12} color={Palette.primary} />
                                        <Text style={styles.lessonSentenceEyebrow}>جملهٔ آغازین</Text>
                                      </View>
                                      <Text style={styles.lessonSentenceAr}>{previewSentence.ar}</Text>
                                      <Text style={styles.lessonSentenceFa}>{previewSentence.fa}</Text>
                                      {!!previewSentence.vocabulary.length && (
                                        <View style={styles.lessonVocabRow}>
                                          {previewSentence.vocabulary.slice(0, 3).map((word, wIdx) => (
                                            <Text key={`${word.word}-${wIdx}`} style={styles.lessonVocabChip}>
                                              {word.word} · {word.meaning}
                                            </Text>
                                          ))}
                                        </View>
                                      )}
                                    </View>
                                  ) : null}
                                  <View style={styles.lessonFooter}>
                                    <View style={styles.lessonFooterItem}>
                                      <Clock3 size={12} color={Palette.muted} />
                                      <Text style={styles.lessonFooterText}>
                                        {toPersianDigits(item.durationMinutes)} دقیقه
                                      </Text>
                                    </View>
                                    <Text style={styles.lessonFooterDot}>·</Text>
                                    <Text style={styles.lessonFooterText}>
                                      {toPersianDigits(item.sentences.length)} جملهٔ اصلی
                                    </Text>
                                  </View>
                                </View>
                                <View style={styles.lessonPlayIcon}>
                                  <Play size={13} color={Palette.primary} fill={Palette.primary} />
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </>
          )}
          {!!error && (
            <Pressable accessibilityRole="button" onPress={retry}>
              <Text accessibilityRole="alert" style={styles.error}>
                {error} تلاش دوباره
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
      <ArabicBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.canvas },
  scrollContent: { flexGrow: 1 },
  page: { width: '100%', maxWidth: 900, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 50, gap: 17 },
  topBar: { gap: 4 },
  selectedBrandRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  selectedTopBar: { gap: 5 },
  brandEyebrow: { fontFamily: 'Times New Roman', color: Palette.primary, fontSize: 7, fontWeight: '800', letterSpacing: 1.2, writingDirection: 'ltr' },
  pageTitle: { fontFamily: Typography.fontFamily, color: Palette.ink, fontSize: 29, lineHeight: 39, fontWeight: '400', textAlign: 'right', writingDirection: 'rtl' },
  pageIntro: { fontFamily: Typography.fontFamily, color: Palette.text, fontSize: 13, lineHeight: 23, textAlign: 'right', writingDirection: 'rtl' },
  overviewHero: { position: 'relative', overflow: 'hidden', marginTop: 16, borderRadius: 25, padding: 20, gap: 10, shadowColor: '#282671', shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  heroOrb: { position: 'absolute', top: -50, left: -42, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.09)' },
  heroTopRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  heroIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  heroPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 6 },
  heroPillText: { fontFamily: Typography.fontFamily, color: '#FFFFFF', fontSize: 10, fontWeight: '400', writingDirection: 'rtl' },
  overviewTitle: { fontFamily: Typography.fontFamily, color: '#FFFFFF', fontSize: 26, lineHeight: 38, fontWeight: '400', textAlign: 'right', writingDirection: 'rtl' },
  overviewMetrics: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-around', marginTop: 5, paddingTop: 13, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)' },
  overviewMetric: { flex: 1, alignItems: 'center', gap: 2 },
  overviewMetricValue: { fontFamily: Typography.numberFontFamily, color: '#FFFFFF', fontSize: 18, fontWeight: '400', writingDirection: 'rtl' },
  overviewMetricLabel: { fontFamily: Typography.fontFamily, color: '#CFD2FF', fontSize: 9, writingDirection: 'rtl' },
  overviewMetricDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.18)' },
  levelRailCard: { padding: 16, gap: 12, borderRadius: 21, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  railWrap: { paddingVertical: 5 },
  railCurrent: { fontFamily: Typography.boldFontFamily, color: Palette.primaryDark, fontSize: 12, textAlign: 'right', writingDirection: 'rtl' },
  levelList: { gap: 9 },
  levelOption: { minHeight: 96, flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border, shadowColor: '#211A68', shadowOpacity: 0.035, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  levelOptionMark: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  levelOptionNumber: { fontFamily: 'Beiruti', color: '#FFFFFF', fontSize: 17, fontWeight: '400', writingDirection: 'rtl' },
  levelOptionContent: { flex: 1, gap: 5 },
  levelOptionTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  levelOptionTitle: { flexShrink: 1, fontFamily: Typography.boldFontFamily, color: Palette.ink, fontSize: 13.5, textAlign: 'right', writingDirection: 'rtl' },
  levelOptionBand: { fontFamily: 'Times New Roman', fontSize: 9, fontWeight: '800', writingDirection: 'ltr' },
  levelOptionDescription: { fontFamily: Typography.fontFamily, color: Palette.text, fontSize: 11, textAlign: 'right', writingDirection: 'rtl' },
  levelOptionMeta: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  levelOptionMetaText: { fontFamily: Typography.fontFamily, color: Palette.muted, fontSize: 9.5, writingDirection: 'rtl' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Palette.border },
  pressed: { opacity: 0.82, transform: [{ scale: 0.995 }] },
  levelHero: { position: 'relative', overflow: 'hidden', padding: 20, borderRadius: 25, gap: 9, shadowColor: '#24245C', shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  levelHeroOrb: { position: 'absolute', top: -60, right: -30, width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(255,255,255,0.10)' },
  levelHeroTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  levelHeroTag: { borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 10, paddingVertical: 5 },
  levelHeroTagText: { fontFamily: 'Times New Roman', color: '#FFFFFF', fontSize: 8, fontWeight: '800', letterSpacing: 1, writingDirection: 'ltr' },
  levelHeroBand: { fontFamily: 'Times New Roman', color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '800', writingDirection: 'ltr' },
  selectedTitle: { fontFamily: Typography.boldFontFamily, color: '#FFFFFF', fontSize: 22, lineHeight: 33, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 },
  selectedArabicTitle: { fontFamily: Typography.boldFontFamily, color: 'rgba(255,255,255,0.88)', fontSize: 14, textAlign: 'right', writingDirection: 'rtl' },
  selectedDescription: { fontFamily: Typography.fontFamily, color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl' },
  selectedProgressHeading: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  selectedProgressLabel: { fontFamily: Typography.fontFamily, color: '#DCE0FF', fontSize: 10, writingDirection: 'rtl' },
  selectedProgressValue: { fontFamily: Typography.numberFontFamily, color: '#FFFFFF', fontSize: 10, fontWeight: '400', writingDirection: 'rtl' },
  levelStartButton: { minHeight: 48, marginTop: 5, paddingHorizontal: 15, borderRadius: 15, backgroundColor: '#FFFFFF', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 9 },
  levelStartBeginningButton: { minHeight: 48, marginTop: 8, paddingHorizontal: 15, borderRadius: 15, backgroundColor: '#F5F2FF', borderWidth: 1, borderColor: '#D8D2FF', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 9 },
  levelStartButtonDisabled: { opacity: 0.55 },
  levelStartButtonText: { flex: 1, fontFamily: Typography.fontFamily, color: Palette.ink, fontSize: 12, fontWeight: '400', textAlign: 'right', writingDirection: 'rtl' },
  metricGrid: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-around', paddingTop: 12, marginTop: 2, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)' },
  heroMetric: { flex: 1, alignItems: 'center', gap: 1 },
  heroMetricValue: { fontFamily: Typography.numberFontFamily, color: '#FFFFFF', fontSize: 17, fontWeight: '400', writingDirection: 'rtl' },
  heroMetricLabel: { fontFamily: Typography.fontFamily, color: '#D6D9FF', fontSize: 9, writingDirection: 'rtl' },
  heroMetricDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.18)' },
  focusCard: { padding: 17, borderRadius: 21, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border, gap: 10 },
  focusHeadingRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 9 },
  focusIcon: { width: 36, height: 36, borderRadius: 13, backgroundColor: Palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  focusHeadingCopy: { flex: 1, alignItems: 'flex-end', gap: 1 },
  focusTitle: { fontFamily: Typography.fontFamily, color: Palette.ink, fontSize: 17, fontWeight: '400', textAlign: 'right', writingDirection: 'rtl' },
  focusDescription: { fontFamily: Typography.fontFamily, color: Palette.text, fontSize: 12, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl' },
  moduleGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 7 },
  moduleChip: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, maxWidth: '100%', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: Palette.surfaceMuted, borderWidth: 1, borderColor: Palette.border },
  moduleDot: { width: 6, height: 6, borderRadius: 3 },
  moduleText: { flexShrink: 1, fontFamily: Typography.fontFamily, color: Palette.text, fontSize: 11, lineHeight: 18, textAlign: 'right', writingDirection: 'rtl' },
  lessonSectionHeading: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 },
  lessonSectionTitle: { fontFamily: Typography.fontFamily, color: Palette.ink, fontSize: 20, lineHeight: 29, fontWeight: '400', textAlign: 'right', writingDirection: 'rtl' },
  lessonCountPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: Palette.primarySoft },
  lessonCountText: { fontFamily: Typography.numberFontFamily, color: Palette.primaryDark, fontSize: 10, fontWeight: '400', writingDirection: 'rtl' },
  groupList: { gap: 10 },
  group: { gap: 8 },
  groupHeader: { minHeight: 68, flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 17, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  groupNumber: { width: 36, height: 36, borderRadius: 12, backgroundColor: Palette.surfaceMuted, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Palette.border },
  groupNumberActive: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  groupNumberText: { fontFamily: Typography.numberFontFamily, color: Palette.muted, fontSize: 12, fontWeight: '400', writingDirection: 'rtl' },
  groupNumberTextActive: { color: '#FFFFFF' },
  groupHeaderCopy: { flex: 1, alignItems: 'flex-end', gap: 2 },
  groupTitle: { fontFamily: Typography.fontFamily, color: Palette.ink, fontSize: 12.5, fontWeight: '400', textAlign: 'right', writingDirection: 'rtl' },
  groupMeta: { fontFamily: Typography.fontFamily, color: Palette.muted, fontSize: 9.5, textAlign: 'right', writingDirection: 'rtl' },
  lessonList: { gap: 8 },
  lessonCard: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 18, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  lessonOrder: { width: 33, height: 33, borderRadius: 11, backgroundColor: Palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  lessonOrderComplete: { backgroundColor: Palette.success },
  lessonOrderText: { fontFamily: 'Beiruti', color: Palette.primaryDark, fontSize: 11, fontWeight: '400', writingDirection: 'rtl' },
  lessonCopy: { flex: 1, gap: 4 },
  lessonTitleLine: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  lessonTitle: { fontFamily: Typography.fontFamily, flexShrink: 1, color: Palette.ink, fontSize: 13.5, fontWeight: '400', textAlign: 'right', writingDirection: 'rtl' },
  lessonSubtitle: { fontFamily: Typography.fontFamily, color: Palette.muted, fontSize: 10.5, textAlign: 'right', writingDirection: 'rtl' },
  lessonStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: Palette.surfaceMuted },
  lessonStatusDone: { backgroundColor: Palette.successSoft },
  lessonStatusResume: { backgroundColor: Palette.warningSoft },
  lessonStatusText: { fontFamily: Typography.fontFamily, color: Palette.muted, fontSize: 8.5, fontWeight: '400', writingDirection: 'rtl' },
  lessonStatusTextDone: { color: Palette.success },
  lessonStatusTextResume: { color: Palette.warning },
  lessonSentencePreview: { marginTop: 5, padding: 10, borderRadius: 14, backgroundColor: Palette.surfaceMuted, borderWidth: 1, borderColor: Palette.border, gap: 4 },
  lessonSentenceHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  lessonSentenceEyebrow: { fontFamily: Typography.fontFamily, color: Palette.primary, fontSize: 8.5, fontWeight: '400', writingDirection: 'rtl' },
  lessonSentenceAr: { fontFamily: Typography.boldFontFamily, color: Palette.ink, fontSize: 15, lineHeight: 25, textAlign: 'right', writingDirection: 'rtl' },
  lessonSentenceFa: { fontFamily: Typography.fontFamily, color: Palette.text, fontSize: 10.5, textAlign: 'right', writingDirection: 'rtl' },
  lessonVocabRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 5, marginTop: 2 },
  lessonVocabChip: { fontFamily: Typography.fontFamily, color: Palette.primaryDark, backgroundColor: Palette.primarySoft, fontSize: 9, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8, writingDirection: 'rtl' },
  lessonFooter: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, marginTop: 3 },
  lessonFooterItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 3 },
  lessonFooterText: { fontFamily: Typography.fontFamily, color: Palette.muted, fontSize: 9, writingDirection: 'rtl' },
  lessonFooterDot: { color: Palette.border, fontSize: 11 },
  lessonPlayIcon: { width: 27, height: 27, borderRadius: 9, backgroundColor: Palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  error: { fontFamily: Typography.fontFamily, color: Palette.danger, backgroundColor: Palette.dangerSoft, padding: 12, borderRadius: 12, textAlign: 'right', writingDirection: 'rtl' },
});
