import { EnglishPalette } from '@/components/EnglishSupplementTask';
import {
  ENGLISH_LEVEL_GRADIENTS,
  EnglishLevelRail,
  EnglishProgressTrack,
  EnglishSectionHeading,
} from '@/components/EnglishUI';
import { ARABIC_LEVELS, type ArabicLevelId } from '@/lib/arabic/content';

export const ArabicPalette = {
  ...EnglishPalette,
  bg: EnglishPalette.canvas,
  surfaceSoft: EnglishPalette.tealSoft,
  gold: EnglishPalette.warning,
  goldSoft: EnglishPalette.warningSoft,
} as const;

export const ARABIC_LEVEL_GRADIENTS: Record<ArabicLevelId, readonly [string, string]> = ENGLISH_LEVEL_GRADIENTS;

export function ArabicProgressTrack({
  value,
  max,
  color = ArabicPalette.primary,
  trackColor,
  height = 7,
}: {
  value: number;
  max: number;
  color?: string;
  trackColor?: string;
  height?: number;
}) {
  const percent = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;
  return <EnglishProgressTrack value={percent} color={color} trackColor={trackColor} height={height} />;
}

export function ArabicLevelRail({
  activeLevelId,
  counts,
  onSelect,
}: {
  activeLevelId: ArabicLevelId;
  counts?: Partial<Record<ArabicLevelId, { completed: number; total: number }>>;
  onSelect: (levelId: ArabicLevelId) => void;
}) {
  return (
    <EnglishLevelRail<ArabicLevelId>
      activeLevelId={activeLevelId}
      counts={counts}
      levels={ARABIC_LEVELS}
      direction="rtl"
      onSelect={onSelect}
    />
  );
}

export { EnglishSectionHeading as ArabicSectionHeading };
