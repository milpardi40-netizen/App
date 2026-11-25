import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { DisplayTypographyContext, type DisplayFontPreset } from '@/components/FitScrollView';

export type { DisplayFontPreset } from '@/components/FitScrollView';
export type DisplaySizePreset = 'app' | 'system' | 'small' | 'large' | 'xlarge';

export interface DisplayTypographyPreferences {
  fontPreset: DisplayFontPreset;
  sizePreset: DisplaySizePreset;
}

const STORAGE_KEY = 'display_typography_v1';
const SYSTEM_SCALE_MIN = 0.9;
const SYSTEM_SCALE_MAX = 1.2;

const DEFAULT_PREFS: DisplayTypographyPreferences = {
  fontPreset: 'app',
  sizePreset: 'app',
};

const VALID_FONTS = new Set<DisplayFontPreset>(['app', 'modern', 'system']);
const VALID_SIZES = new Set<DisplaySizePreset>(['app', 'system', 'small', 'large', 'xlarge']);

export function clampSystemFontScale(rawScale: number | undefined | null): number {
  const numeric = typeof rawScale === 'number' && Number.isFinite(rawScale) && rawScale > 0 ? rawScale : 1;
  const clamped = Math.min(SYSTEM_SCALE_MAX, Math.max(SYSTEM_SCALE_MIN, numeric));
  return Math.round(clamped * 100) / 100;
}

export function resolveFontScale(sizePreset: DisplaySizePreset, deviceFontScale: number): number {
  switch (sizePreset) {
    case 'system':
      return clampSystemFontScale(deviceFontScale);
    case 'small':
      return 0.9;
    case 'large':
      return 1.12;
    case 'xlarge':
      return 1.22;
    case 'app':
    default:
      return 1;
  }
}

type DisplayTypographyActionsValue = {
  fontPreset: DisplayFontPreset;
  sizePreset: DisplaySizePreset;
  effectiveScale: number;
  deviceScaleClamped: number;
  setFontPreset: (preset: DisplayFontPreset) => void;
  setSizePreset: (preset: DisplaySizePreset) => void;
  resetDefaults: () => void;
};

const DisplayTypographyActionsContext = createContext<DisplayTypographyActionsValue>({
  fontPreset: 'app',
  sizePreset: 'app',
  effectiveScale: 1,
  deviceScaleClamped: 1,
  setFontPreset: () => undefined,
  setSizePreset: () => undefined,
  resetDefaults: () => undefined,
});

function normalizePrefs(raw: unknown): DisplayTypographyPreferences {
  if (!raw || typeof raw !== 'object') return DEFAULT_PREFS;
  const record = raw as Partial<DisplayTypographyPreferences>;
  return {
    fontPreset: record.fontPreset && VALID_FONTS.has(record.fontPreset) ? record.fontPreset : 'app',
    sizePreset: record.sizePreset && VALID_SIZES.has(record.sizePreset) ? record.sizePreset : 'app',
  };
}

export function DisplayTypographyProvider({ children }: { children: React.ReactNode }) {
  const { fontScale } = useWindowDimensions();
  const [prefs, setPrefs] = useState<DisplayTypographyPreferences>(DEFAULT_PREFS);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (!active || !raw) return;
        try {
          setPrefs(normalizePrefs(JSON.parse(raw)));
        } catch {
          // Ignore malformed persisted settings and keep defaults.
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: DisplayTypographyPreferences) => {
    setPrefs(next);
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const setFontPreset = useCallback(
    (fontPreset: DisplayFontPreset) => {
      persist({ ...prefs, fontPreset });
    },
    [persist, prefs],
  );

  const setSizePreset = useCallback(
    (sizePreset: DisplaySizePreset) => {
      persist({ ...prefs, sizePreset });
    },
    [persist, prefs],
  );

  const resetDefaults = useCallback(() => {
    persist(DEFAULT_PREFS);
  }, [persist]);

  const deviceScaleClamped = clampSystemFontScale(fontScale);
  const effectiveScale = resolveFontScale(prefs.sizePreset, fontScale);

  const displayValue = useMemo(
    () => ({ fontPreset: prefs.fontPreset, scale: effectiveScale }),
    [prefs.fontPreset, effectiveScale],
  );

  const actionsValue = useMemo<DisplayTypographyActionsValue>(
    () => ({
      fontPreset: prefs.fontPreset,
      sizePreset: prefs.sizePreset,
      effectiveScale,
      deviceScaleClamped,
      setFontPreset,
      setSizePreset,
      resetDefaults,
    }),
    [deviceScaleClamped, effectiveScale, prefs.fontPreset, prefs.sizePreset, resetDefaults, setFontPreset, setSizePreset],
  );

  return (
    <DisplayTypographyActionsContext.Provider value={actionsValue}>
      <DisplayTypographyContext.Provider value={displayValue}>{children}</DisplayTypographyContext.Provider>
    </DisplayTypographyActionsContext.Provider>
  );
}

export function useDisplayTypography() {
  return useContext(DisplayTypographyActionsContext);
}
