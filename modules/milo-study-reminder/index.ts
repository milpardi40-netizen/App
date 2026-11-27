import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

export interface NativeStudyReminder {
  getSettings(): Promise<string | null>;
  configure(settingsJson: string): Promise<string>;
  reconcile(): Promise<string>;
  markStudied(day: string): Promise<void>;
  test(): Promise<string>;
  getLastError(): Promise<string>;
  getDiagnostics?(): Promise<string>;
}

/** No fallback to the broken Android Expo scheduler in an older binary. */
export function nativeStudyReminder(): NativeStudyReminder | null {
  return Platform.OS === 'android'
    ? requireOptionalNativeModule<NativeStudyReminder>('MiloStudyReminder')
    : null;
}
