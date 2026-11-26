import { LessonRestartActions } from '@/components/LessonRestartActions';
import { useCourseHome } from '@/hooks/useCourseHome';
import { progressLabel } from '@/lib/levelProgress';
import { MiloGlobeHeadphoneMark } from '@/components/MiloBrandMark';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock3,
  Compass,
  Flame,
  MessageCircle,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react-native';
import { ArabicBottomNav } from './ArabicBottomNav';
import { ProfileIcon } from '@/components/ProfileIcon';
import { PageNavigation } from '@/components/PageNavigation';
import { ARABIC_LESSONS, ARABIC_LEVELS, type ArabicLevelId } from '@/lib/arabic/content';
import { setArabicCurrentLesson } from '@/lib/arabic/progress';
import { ARABIC_ENGINE_BLUEPRINT, getArabicLevelMetrics } from '@/lib/arabic/engine';
import { arabicStudyDay } from '@/lib/arabic/studyState';
import { loadPracticeDays } from '@/lib/practiceActivity';
import { LearningHomeColors as HomeColors, learningHomeStyles as styles } from '@/components/LearningHomeStyles';
import DailyPlanCard from '@/components/DailyPlanCard';
import { toPersianDigits } from '@/lib/format';
import { EnglishLevelRail, EnglishProgressTrack } from '@/components/EnglishUI';
import { Typography } from '@/lib/theme';

const arabicOverrides = StyleSheet.create({
  sentenceArabic: {
    fontFamily: Typography.boldFontFamily,
    color: '#191919',
    fontSize: 18,
    lineHeight: 30,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  wordChipAr: {
    fontFamily: Typography.boldFontFamily,
    color: HomeColors.accentDeep,
    fontSize: 12,
    writingDirection: 'rtl',
  },
  levelTitleFa: {
    fontFamily: Typography.boldFontFamily,
    color: '#191919',
    fontSize: 13,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  currentLevelNameFa: {
    fontFamily: Typography.boldFontFamily,
    color: '#191919',
    fontSize: 13.5,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  blueprintSummary: {
    fontFamily: Typography.fontFamily,
    color: HomeColors.muted,
    fontSize: 10.5,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default function ArabicHomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 640;
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [measuredMinutes, setMeasuredMinutes] = useState(0);
  const [timeError, setTimeError] = useState(false);
  const { snapshot, progress, hasStartedCourse, plan, streak, error, retry } = useCourseHome('ar');

  useEffect(() => {
    void import('@/components/arabic/ArabicLessonScreen');
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void loadPracticeDays('ar')
        .then(days => {
          if (!active) return;
          const ms = days[arabicStudyDay()]?.ms ?? 0;
          setMeasuredMinutes(Math.floor(ms / 6000) / 10);
          setTimeError(false);
        })
        .catch(() => {
          if (active) setTimeError(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const currentLesson =
    ARABIC_LESSONS.find(lesson => lesson.id === (snapshot?.current?.id ?? progress?.currentLessonId)) ??
    ARABIC_LESSONS[0];
  const currentLevel =
    ARABIC_LEVELS.find(level => level.id === currentLesson?.levelId) ?? ARABIC_LEVELS[0];
  const currentSentence = currentLesson?.sentences[0];
  const completedIds = progress?.completedLessonIds ?? [];
  const completed = snapshot?.course.completed ?? 0;
  const levelMetrics = getArabicLevelMetrics(currentLevel.id, completedIds);
  const currentBlueprint = ARABIC_ENGINE_BLUEPRINT.find(level => level.levelId === currentLevel.id);
  const dailyGoal = progress?.dailyGoalMinutes ?? 10;
  const dailyPct = Math.min(100, dailyGoal ? (measuredMinutes / dailyGoal) * 100 : 0);
  const levelCounts = snapshot?.levels ?? {};
  const levelProgress = levelCounts[currentLevel.id]?.percent ?? levelMetrics.percent;

  const openLevel = (levelId: ArabicLevelId) =>
    router.push({ pathname: '/learn/ar/library', params: { level: String(levelId) } } as never);
  const openCurrentLesson = () => {
    if (currentLesson) {
      router.push({ pathname: '/learn/ar/lesson', params: { id: currentLesson.id } } as never);
    }
  };


  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View style={styles.header}>
            <View style={styles.brandLockup}>
              <View style={styles.brandMark}>
                <MiloGlobeHeadphoneMark size={48} />
              </View>
              <View style={styles.brandCopy}>
                <Text style={styles.headerTitle}>مسیر یادگیری عربی</Text>
              </View>
            </View>
            <PageNavigation backFallback="/languages" />
          </View>

          <LinearGradient
            colors={['#FFFFFF', '#FAF9F5', '#F4F1EA']}
            start={{ x: 0.95, y: 0.08 }}
            end={{ x: 0.04, y: 1 }}
            style={[styles.welcomeBlock, compact && styles.welcomeBlockCompact]}
          >
            <View pointerEvents="none" style={styles.welcomeGlowOne} />
            <View pointerEvents="none" style={styles.welcomeGlowTwo} />
            <View style={styles.welcomeCopy}>
              <View style={styles.welcomeEyebrowRow}>
                <Sparkles size={13} color={HomeColors.gold} />
              </View>
              <Text style={styles.welcomeTitle}>عربی؛ زبان فرهنگ، گفت‌وگو و جهان معاصر</Text>
              <Text style={styles.welcomeDescription}>
                عربی فصیح معاصر از Pre-A1 تا C1؛ با خط حرکات‌دار، ساخت جملهٔ راست‌به‌چپ و مکالمهٔ واقعی.
              </Text>
              <View style={styles.welcomeTags}>
                <View style={styles.welcomeTag}>
                  <BookOpen size={12} color={HomeColors.gold} />
                  <Text style={styles.welcomeTagText}>یادگیری جمله‌محور</Text>
                </View>
                <View style={styles.welcomeTag}>
                  <Sparkles size={12} color="#B8E3D5" />
                  <Text style={styles.welcomeTagText}>تمرین کوتاه روزانه</Text>
                </View>
              </View>
            </View>
            <View style={[styles.welcomeVisual, compact && styles.welcomeVisualCompact]}>
              <Image
                source={require('../../assets/images/language-ar-watercolor.jpg')}
                resizeMode="cover"
                style={styles.welcomeImage}
              />
              <LinearGradient
                colors={['rgba(16,42,86,0.00)', 'rgba(16,42,86,0.12)']}
                style={styles.welcomeImageShade}
              />
              <View style={styles.welcomeImageStamp}>
                <Text style={styles.welcomeImageStampMain}>AR</Text>
                <View style={styles.welcomeImageStampLine} />
                <Text style={styles.welcomeImageStampSub}>LEARN</Text>
              </View>
            </View>
          </LinearGradient>

          {!!error && (
            <Pressable accessibilityRole="button" onPress={retry}>
              <Text accessibilityRole="alert">{error} تلاش دوباره</Text>
            </Pressable>
          )}

          <View style={styles.pathPanel}>
            <View style={styles.panelHeadingRow}>
              <View style={styles.panelHeadingText}>
                <Text style={styles.panelTitle}>سطح خودت را انتخاب کن</Text>
                <Text style={styles.panelHint}>از هر سطحی که درس دارد شروع کن.</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                style={styles.libraryLink}
                onPress={() => router.push('/learn/ar/library' as never)}
              >
                <Text style={styles.libraryLinkText}>کتابخانه</Text>
                <ChevronLeft size={16} color={HomeColors.accent} />
              </Pressable>
            </View>

            <View style={styles.railWrap}>
              <EnglishLevelRail<ArabicLevelId>
                activeLevelId={currentLevel.id}
                counts={levelCounts}
                levels={ARABIC_LEVELS}
                direction="rtl"
                onSelect={openLevel}
              />
            </View>

            <View style={styles.currentLevelCard}>
              <View style={[styles.levelNumber, { backgroundColor: `${currentLevel.accent}14` }]}>
                <Text style={[styles.levelNumberText, { color: currentLevel.accent }]}>
                  {toPersianDigits(currentLevel.id)}
                </Text>
              </View>
              <View style={styles.currentLevelCopy}>
                <Text style={arabicOverrides.currentLevelNameFa}>{currentLevel.title}</Text>
                <Text style={styles.currentLevelDescription} numberOfLines={2}>
                  {currentLevel.subtitle}
                </Text>
              </View>
              <View style={styles.currentLevelCount}>
                <Text style={[styles.levelCountValue, { color: currentLevel.accent }]}>
                  {toPersianDigits(levelMetrics.completed)} / {toPersianDigits(levelMetrics.total)}
                </Text>
                <Text style={styles.levelCountLabel}>درس</Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: showRoadmap }}
              style={styles.mapToggle}
              onPress={() => setShowRoadmap(value => !value)}
            >
              <View style={styles.mapToggleIcon}>
                <Compass size={16} color={HomeColors.accent} />
              </View>
              <View style={styles.mapToggleText}>
                <Text style={styles.mapToggleTitle}>
                  {showRoadmap ? 'بستن نقشهٔ کامل' : 'دیدن جزئیات سطح‌ها'}
                </Text>
                {currentBlueprint ? (
                  <Text style={arabicOverrides.blueprintSummary} numberOfLines={1}>
                    {currentBlueprint.focus}
                  </Text>
                ) : null}
              </View>
              {showRoadmap ? (
                <ChevronUp size={18} color={HomeColors.accent} />
              ) : (
                <ChevronDown size={18} color={HomeColors.muted} />
              )}
            </Pressable>

            {showRoadmap && (
              <View style={styles.fullRoadmap}>
                {ARABIC_LEVELS.map(level => {
                  const metrics = getArabicLevelMetrics(level.id, completedIds);
                  const passed = metrics.total > 0 && metrics.completed === metrics.total;
                  return (
                    <Pressable
                      key={level.id}
                      accessibilityRole="button"
                      accessibilityLabel={`فهرست درس‌های ${level.title}`}
                      style={({ pressed }) => [
                        styles.levelCard,
                        level.id === currentLevel.id && styles.levelCardActive,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() => openLevel(level.id)}
                    >
                      <View style={[styles.levelNumber, { backgroundColor: `${level.accent}14` }]}>
                        {passed ? (
                          <Check size={17} color={level.accent} strokeWidth={2.6} />
                        ) : (
                          <Text style={[styles.levelNumberText, { color: level.accent }]}>
                            {toPersianDigits(level.id)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.levelText}>
                        <View style={styles.levelTitleRow}>
                          <Text style={[arabicOverrides.levelTitleFa, { flexShrink: 1 }]}>
                            {level.title}
                          </Text>
                          <Text style={[styles.levelCefr, { color: level.accent }]}>{level.cefr}</Text>
                        </View>
                        <Text style={styles.levelDesc} numberOfLines={1}>
                          {level.subtitle}
                        </Text>
                        <Text style={styles.levelStats}>
                          {progressLabel(levelCounts[level.id])} · {toPersianDigits(metrics.sentenceCount)} جمله ·{' '}
                          {toPersianDigits(metrics.vocabularyCount)} واژهٔ یکتا
                        </Text>
                        <EnglishProgressTrack
                          value={levelCounts[level.id]?.percent ?? metrics.percent}
                          color={level.accent}
                          height={5}
                        />
                      </View>
                      <ChevronLeft size={18} color={HomeColors.muted} />
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {currentLesson ? (
            <View style={styles.lessonCard}>
              <LinearGradient
                colors={['#5146E5', '#20C49A', '#5146E5']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={styles.lessonCardAccent}
              />
              <View style={styles.lessonMetaRow}>
                <View style={styles.levelTag}>
                  <View style={[styles.levelTagDot, { backgroundColor: currentLevel.accent }]} />
                  <Text style={[styles.levelTagText, { color: currentLevel.accent }]}>
                    {currentLevel.arabicTitle}
                  </Text>
                  <Text style={styles.levelTagDivider}>·</Text>
                  <Text
                    style={[
                      styles.levelTagText,
                      { color: currentLevel.accent, writingDirection: currentLevel.id === 0 ? 'rtl' : 'ltr' },
                    ]}
                  >
                    {currentLevel.cefr}
                  </Text>
                </View>
                <Text style={styles.lessonOrder}>
                  {toPersianDigits(
                    Math.max(1, ARABIC_LESSONS.findIndex(item => item.id === currentLesson.id) + 1),
                  )}{' '}
                  از {toPersianDigits(ARABIC_LESSONS.length)}
                </Text>
              </View>

              <View style={styles.lessonHeading}>
                <Text style={styles.lessonEyebrow}>ادامهٔ یادگیری</Text>
                <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
                <Text style={styles.lessonSubtitle}>{currentLesson.subtitle}</Text>
              </View>

              {currentSentence ? (
                <View style={styles.sentenceCard}>
                  <View style={styles.sentenceTopRow}>
                    <View style={styles.sentenceIcon}>
                      <BookOpen size={15} color={HomeColors.accent} />
                    </View>
                    <Text style={styles.sentenceLabel}>جملهٔ منتخب این درس</Text>
                    <Text style={styles.sentenceNumber}>
                      {toPersianDigits(1)} / {toPersianDigits(currentLesson.sentences.length)}
                    </Text>
                  </View>
                  <Text style={arabicOverrides.sentenceArabic}>{currentSentence.ar}</Text>
                  <Text style={styles.sentencePersian}>{currentSentence.fa}</Text>
                  {!!currentSentence.vocabulary.length && (
                    <View style={styles.wordChipRow}>
                      {currentSentence.vocabulary.map(item => (
                        <View key={`${currentSentence.id}-${item.word}`} style={styles.wordChip}>
                          <Text style={arabicOverrides.wordChipAr}>{item.word}</Text>
                          <Text style={styles.wordChipDivider}>·</Text>
                          <Text style={styles.wordChipFa}>{item.meaning}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ) : null}

              <View style={styles.levelProgressBlock}>
                <View style={styles.levelProgressMeta}>
                  <Text style={styles.levelProgressLabel}>پیشرفت در {currentLevel.title}</Text>
                  <Text style={styles.levelProgressValue}>{progressLabel(levelCounts[currentLevel.id])}</Text>
                </View>
                <EnglishProgressTrack value={levelProgress} color={currentLevel.accent} height={7} />
              </View>

              <View style={styles.lessonFooter}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={hasStartedCourse ? 'ادامهٔ آموزش عربی' : 'شروع اولین درس عربی'}
                  style={({ pressed }) => [styles.continueButton, pressed && styles.buttonPressed]}
                  onPress={openCurrentLesson}
                >
                  <LinearGradient
                    colors={['#635BFF', '#4338CA']}
                    start={{ x: 0.96, y: 0 }}
                    end={{ x: 0.04, y: 1 }}
                    style={styles.continueButtonGradient}
                  >
                    <Play size={16} color="#F5E7BC" fill="#F5E7BC" />
                    <Text style={styles.continueButtonText}>
                      {hasStartedCourse ? 'ادامهٔ آموزش' : 'شروع اولین درس'}
                    </Text>
                    <ArrowLeft size={17} color="#FFFFFF" />
                  </LinearGradient>
                </Pressable>
                <View style={styles.lessonCountPill}>
                  <Text style={styles.lessonCountValue}>
                    {toPersianDigits(currentLesson.sentences.length)}
                  </Text>
                  <Text style={styles.lessonCountLabel}>جمله</Text>
                </View>
              </View>

              <LessonRestartActions lessonPath="/learn/ar/lesson" firstLessonId={ARABIC_LESSONS.find(item => item.levelId === currentLevel.id)?.id} lessonId={currentLesson.id} />
            </View>
          ) : null}

          {plan.length ? (
            <View style={{ marginBottom: 12 }}>
              <DailyPlanCard
                steps={plan}
                onOpen={step =>
                  router.push(
                    (step.id === 'lesson' && currentLesson
                      ? `/learn/ar/lesson?id=${currentLesson.id}`
                      : step.route) as never,
                  )
                }
              />
            </View>
          ) : null}

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>برنامهٔ امروز</Text>
            </View>
            <View style={styles.dailyGoalPill}>
              <Flame size={14} color={HomeColors.amber} />
              <Text style={styles.dailyGoalText}>{toPersianDigits(dailyGoal)} دقیقه هدف روزانه</Text>
            </View>
          </View>

          <LinearGradient
            colors={['#FFFFFF', '#FAF9F5', '#F4F1EA']}
            start={{ x: 0.95, y: 0.05 }}
            end={{ x: 0.04, y: 1 }}
            style={styles.todayCard}
          >
            <View pointerEvents="none" style={styles.todayGlow} />
            <View style={styles.todayTopRow}>
              <View style={styles.todayIcon}>
                <Clock3 size={18} color={HomeColors.gold} />
              </View>
              <View style={styles.todayCopy}>
                <Text style={styles.todayValue}>
                  {toPersianDigits(measuredMinutes)} <Text style={styles.todayUnit}>دقیقه</Text>
                </Text>
                <Text style={styles.todayLabel}>
                  {timeError ? 'زمان ثبت‌شده خوانده نشد' : 'زمان یادگیری ثبت‌شده امروز'}
                </Text>
              </View>
              <View style={styles.todayProgressRing}>
                <View style={styles.todayProgressRingInner}>
                  <Text style={styles.todayPercentText}>{toPersianDigits(Math.round(dailyPct))}٪</Text>
                </View>
              </View>
            </View>
            <View style={styles.todayProgressTrack}>
              <EnglishProgressTrack value={dailyPct} color={HomeColors.gold} trackColor="#E7E3DA" height={7} />
            </View>
            <View style={styles.todayFootnote}>
              <BookOpen size={14} color={HomeColors.gold} />
              <Text style={styles.todayFootnoteText}>
                {toPersianDigits(completed)} از {toPersianDigits(ARABIC_LESSONS.length)} درس اصلی تکمیل‌شده
              </Text>
              {streak > 0 ? (
                <View style={styles.streakPill}>
                  <Flame size={12} color="#C4E8D8" />
                  <Text style={styles.streakText}>{toPersianDigits(streak)} روز پیاپی</Text>
                </View>
              ) : null}
            </View>
          </LinearGradient>

          <View style={styles.quickSection}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionTitleBlock}>
                <Text style={styles.sectionTitle}>میان‌برهای تو</Text>
              </View>
            </View>
            <View style={[styles.quickRow, compact && styles.quickRowCompact]}>
              <Pressable
                accessibilityRole="button"
                style={styles.quickCard}
                onPress={() => router.push('/learn/ar/library' as never)}
              >
                <View style={[styles.quickIcon, { backgroundColor: '#FEF3C7' }]}>
                  <BookOpen size={18} color="#D97706" />
                </View>
                <View style={styles.quickCopy}>
                  <Text style={styles.quickTitle}>کتابخانهٔ درس‌ها</Text>
                  <Text style={styles.quickDesc}>فهرست کامل سطوح Pre-A1 تا C1</Text>
                </View>
                <ChevronLeft size={17} color={HomeColors.muted} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.quickCard}
                onPress={() => router.push('/learn/ar/review' as never)}
              >
                <View style={[styles.quickIcon, { backgroundColor: HomeColors.sageSoft }]}>
                  <RefreshCw size={18} color={HomeColors.sage} />
                </View>
                <View style={styles.quickCopy}>
                  <Text style={styles.quickTitle}>مرور جمله‌ها</Text>
                  <Text style={styles.quickDesc}>کارت‌های زمان‌بندی‌شدهٔ تو</Text>
                </View>
                <ChevronLeft size={17} color={HomeColors.muted} />
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="باز کردن واژه‌خانهٔ عربی"
              style={({ pressed }) => [styles.quickCard, pressed && styles.buttonPressed]}
              onPress={() => router.push('/learn/ar/vocabulary' as never)}
            >
              <View style={[styles.quickIcon, { backgroundColor: HomeColors.accentSoft }]}>
                <Sparkles size={18} color={HomeColors.accent} />
              </View>
              <View style={styles.quickCopy}>
                <Text style={styles.quickTitle}>واژه‌خانهٔ عربی</Text>
                <Text style={styles.quickDesc}>ببین، یک بار بشنو، بعد از فارسی بگو</Text>
              </View>
              <ChevronLeft size={17} color={HomeColors.muted} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="باز کردن کارگاه تلفظ عربی"
              accessibilityHint="تمرین مخارج حروف، حرکات و آهنگ جمله؛ بدون ضبط میکروفن"
              style={({ pressed }) => [styles.quickCard, pressed && styles.buttonPressed]}
              onPress={() => router.push('/learn/ar/pronunciation' as never)}
            >
              <View style={[styles.quickIcon, { backgroundColor: HomeColors.accentSoft }]}>
                <Volume2 size={18} color={HomeColors.accent} />
              </View>
              <View style={styles.quickCopy}>
                <Text style={styles.quickTitle}>کارگاه تلفظ عربی</Text>
                <Text style={styles.quickDesc}>مخارج حروف، حرکات و آهنگ جمله</Text>
              </View>
              <ChevronLeft size={17} color={HomeColors.muted} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="پروفایل و تنظیمات"
              style={({ pressed }) => [styles.quickCard, pressed && styles.buttonPressed]}
              onPress={() => router.push('/profile' as never)}
            >
              <View style={[styles.quickIcon, { backgroundColor: 'transparent' }]}>
                <ProfileIcon size={34} />
              </View>
              <View style={styles.quickCopy}>
                <Text style={styles.quickTitle}>پروفایل و تنظیمات</Text>
                <Text style={styles.quickDesc}>حساب، پیشرفت و تنظیمات برنامه</Text>
              </View>
              <ChevronLeft size={17} color={HomeColors.muted} />
            </Pressable>
          </View>

          <View style={styles.noteCard}>
            <Sparkles size={16} color={HomeColors.accent} />
            <Text style={styles.noteText}>هر روز، یک قدم کوچک.</Text>
          </View>
        </View>
      </ScrollView>
      <ArabicBottomNav />
    </View>
  );
}
