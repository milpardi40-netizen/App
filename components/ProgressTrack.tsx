import { View } from 'react-native';
import { formatPercent } from '@/lib/levelProgress';

export function ProgressTrack({ value, color = '#5148C8', height = 8, trackColor = '#E7EAF2' }: { value: number; color?: string; height?: number; trackColor?: string }) {
  const percent = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  return <View accessibilityRole="progressbar" accessibilityLabel="پیشرفت" accessible aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={formatPercent(percent)}
    style={{ direction: 'ltr', width: '100%', alignItems: 'flex-end', height, flexShrink: 0, overflow: 'hidden', borderRadius: height, backgroundColor: trackColor }}>
    {percent > 0 && <View style={{ width: `${percent}%`, minWidth: 1, height, borderRadius: height, backgroundColor: color }} />}
  </View>;
}
