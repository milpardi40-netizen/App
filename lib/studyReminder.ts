import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { nativeStudyReminder } from '@/modules/milo-study-reminder';

/** Local opt-in reminders. Android uses a single self-renewing native alarm, not Expo/FCM. */
export const STUDY_REMINDER_KEY = 'milo_study_reminder_v1';
export const STUDY_REMINDER_CHANNEL = 'milo-study';
const IDENTIFIER = 'milo-study-reminder';
const ERROR_KEY = 'milo_study_reminder_error_v1';
const IOS_PREFIX = `${IDENTIFIER}:date:`;
const IOS_DAYS = 30;
const TEST_IDENTIFIER = `${IDENTIFIER}:test`;

export interface StudyReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
  lastStudiedDay: string;
}

export type StudyReminderStatus = 'scheduled' | 'disabled' | 'unsupported' | 'permission-denied'
  | 'channel-blocked' | 'update-required' | 'test-scheduled' | 'error';
export const DEFAULT_REMINDER_HOUR = 20;
export const REMINDER_OPTIONS: ReadonlyArray<{ hour: number; label: string }> = [
  { hour: 8, label: '۸ صبح' },
  { hour: 12, label: '۱۲ ظهر' },
  { hour: 17, label: '۵ عصر' },
  { hour: 20, label: '۸ شب' },
  { hour: 22, label: '۱۰ شب' },
];

const defaults = (): StudyReminderSettings => ({ enabled: false, hour: DEFAULT_REMINDER_HOUR, minute: 0, lastStudiedDay: '' });
let work: Promise<unknown> = Promise.resolve();
// Toggle, resume, time changes and lesson completion must not overwrite each other.
function serial<T>(operation: () => Promise<T>): Promise<T> {
  const next = work.then(operation, operation);
  work = next.catch(() => undefined);
  return next;
}

export function localDayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function normalize(value: Partial<StudyReminderSettings> | null): StudyReminderSettings {
  return {
    enabled: value?.enabled === true,
    hour: Number.isInteger(value?.hour) && value!.hour! >= 0 && value!.hour! <= 23 ? value!.hour! : DEFAULT_REMINDER_HOUR,
    minute: Number.isInteger(value?.minute) && value!.minute! >= 0 && value!.minute! <= 59 ? value!.minute! : 0,
    lastStudiedDay: typeof value?.lastStudiedDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.lastStudiedDay) ? value.lastStudiedDay : '',
  };
}

async function stored(): Promise<StudyReminderSettings> {
  const raw = await AsyncStorage.getItem(STUDY_REMINDER_KEY);
  return raw ? normalize(JSON.parse(raw)) : defaults();
}

export async function loadStudyReminder(): Promise<StudyReminderSettings> {
  try {
    const native = nativeStudyReminder();
    const raw = native ? await native.getSettings() : null;
    if (!raw) return await stored();
    const settings = normalize(JSON.parse(raw));
    // Native owns the opt-in/time, but a failed native write must not erase a lesson marker.
    try { settings.lastStudiedDay = [settings.lastStudiedDay, (await stored()).lastStudiedDay].sort().pop() || ''; } catch { /* native preference still works without the mirror */ }
    return settings;
  } catch (cause) {
    await recordError('load', cause);
    return defaults();
  }
}

async function save(settings: StudyReminderSettings): Promise<void> {
  await AsyncStorage.setItem(STUDY_REMINDER_KEY, JSON.stringify(settings));
}

async function recordError(stage: string, cause: unknown): Promise<void> {
  const error = cause as { code?: string; message?: string };
  const detail = `${stage}: ${error?.code || ''} ${error?.message || String(cause)}`.trim().slice(0, 600);
  console.warn('[study-reminder]', detail);
  try { await AsyncStorage.setItem(ERROR_KEY, detail); } catch { /* console/native log remains available */ }
}

export async function studyReminderError(): Promise<string> {
  try {
    return (await nativeStudyReminder()?.getLastError()) || (await AsyncStorage.getItem(ERROR_KEY)) || '';
  } catch { return ''; }
}

async function clearError(): Promise<void> {
  try { await AsyncStorage.removeItem(ERROR_KEY); } catch { /* not a scheduling failure */ }
}

async function permission(prompt: boolean): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!prompt || current.canAskAgain === false) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

function isOurs(id: string): boolean { return id === IDENTIFIER || id.startsWith(IOS_PREFIX); }

/** iOS has a 64-request system limit: 30 dated reminders, renewed on each foreground/lesson. */
async function scheduleIOS(settings: StudyReminderSettings): Promise<StudyReminderStatus> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  const old = pending.filter(item => isOurs(item.identifier));
  if (!settings.enabled) {
    for (const item of pending.filter(item => isOurs(item.identifier) || item.identifier === TEST_IDENTIFIER)) await Notifications.cancelScheduledNotificationAsync(item.identifier);
    await save(settings);
    return 'disabled';
  }
  if (pending.length - old.length + old.length + IOS_DAYS > 64) {
    throw new Error('iOS notification capacity exceeded; other reminders were not removed');
  }
  const now = new Date();
  const batch = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const created: string[] = [];
  try {
    for (let offset = 0; offset <= IOS_DAYS && created.length < IOS_DAYS; offset += 1) {
      const date = new Date(now);
      date.setDate(now.getDate() + offset);
      date.setHours(settings.hour, settings.minute, 0, 0);
      if (date <= now || localDayKey(date) === settings.lastStudiedDay) continue;
      const id = `${IOS_PREFIX}${batch}:${localDayKey(date)}`;
      // Include before awaiting: native scheduling might succeed before a bridge error.
      created.push(id);
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: { title: 'وقت یک درس کوتاه', body: 'چند دقیقه تمرین کن و زنجیرهٔ یادگیری‌ات را ادامه بده.', sound: 'default', data: { kind: 'study', eventId: 'study-reminder', route: '/lang' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
    }
    for (const item of old) await Notifications.cancelScheduledNotificationAsync(item.identifier);
    await save(settings);
  } catch (cause) {
    await Promise.all(created.map(id => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
    throw cause;
  }
  return 'scheduled';
}

async function apply(settings: StudyReminderSettings, prompt: boolean): Promise<StudyReminderStatus> {
  if (Platform.OS === 'web') return 'unsupported';
  let stage = 'prepare';
  try {
    const native = nativeStudyReminder();
    if (Platform.OS === 'android' && !native) {
      if (settings.enabled) return 'update-required';
      await Notifications.cancelScheduledNotificationAsync(IDENTIFIER);
      await save({ ...settings, enabled: false });
      return 'disabled';
    }
    const current = await loadStudyReminder();
    const next = normalize({ ...settings, lastStudiedDay: current.lastStudiedDay });
    if (next.enabled) {
      stage = 'channel';
      // Android 13 requires a channel before requesting POST_NOTIFICATIONS.
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(STUDY_REMINDER_CHANNEL, {
          name: 'یادآور مطالعه', importance: Notifications.AndroidImportance.DEFAULT,
          description: 'یک یادآوری روزانه برای ادامهٔ درس', sound: 'default',
          vibrationPattern: [0, 90], enableVibrate: true,
        });
      }
      stage = 'permission';
      if (!await permission(prompt)) return 'permission-denied';
    }
    stage = 'schedule';
    let result: StudyReminderStatus;
    if (native) {
      // Remove only the v1 Expo reminder, never chat or other notifications.
      await Notifications.cancelScheduledNotificationAsync(IDENTIFIER);
      result = await native.configure(JSON.stringify(next)) as StudyReminderStatus;
      if (result === 'scheduled' || result === 'disabled') {
        // Native preferences are authoritative; failure of this migration mirror must not undo a real alarm.
        try { await save(next); } catch (cause) { console.warn('[study-reminder] preference mirror failed', cause); }
      }
    } else result = await scheduleIOS(next);
    if (result === 'scheduled' || result === 'disabled') await clearError();
    return result;
  } catch (cause) {
    await recordError(stage, cause);
    return 'error';
  }
}

export function scheduleStudyReminder(settings: StudyReminderSettings): Promise<StudyReminderStatus> {
  return serial(() => apply(settings, true));
}

/** Never prompts on startup/resume. Repairs the native alarm and migrates old opt-ins. */
export function reconcileStudyReminder(): Promise<StudyReminderStatus> {
  return serial(async () => {
    if (Platform.OS === 'web') return 'unsupported';
    const settings = await loadStudyReminder();
    if (!settings.enabled) return 'disabled';
    try {
      const native = nativeStudyReminder();
      const snapshot = native ? await native.getSettings() : null;
      if (native && snapshot) {
        if (settings.lastStudiedDay > normalize(JSON.parse(snapshot)).lastStudiedDay) await native.markStudied(settings.lastStudiedDay);
        const result = await native.reconcile() as StudyReminderStatus;
        if (result === 'scheduled') await clearError();
        return result;
      }
      return apply(settings, false);
    } catch (cause) { await recordError('reconcile', cause); return 'error'; }
  });
}

export function noteStudyToday(date = new Date()): Promise<void> {
  return serial(async () => {
    try {
      const settings = await loadStudyReminder();
      const next = { ...settings, lastStudiedDay: localDayKey(date) };
      const native = nativeStudyReminder();
      if (native) {
        try { await native.markStudied(next.lastStudiedDay); }
        catch (cause) { await recordError('study-native', cause); }
      }
      await save(next);
      if (Platform.OS === 'ios' && next.enabled) await apply(next, false);
    } catch (cause) {
      // A notification failure must never prevent lesson rewards/progress.
      await recordError('study-completed', cause);
    }
  });
}

export async function studiedToday(date = new Date()): Promise<boolean> {
  return (await loadStudyReminder()).lastStudiedDay === localDayKey(date);
}

export function testStudyReminder(): Promise<StudyReminderStatus> {
  return serial(async () => {
    if (Platform.OS === 'web') return 'unsupported';
    try {
      const native = nativeStudyReminder();
      if (Platform.OS === 'android' && !native) return 'update-required';
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(STUDY_REMINDER_CHANNEL, { name: 'یادآور مطالعه', importance: Notifications.AndroidImportance.DEFAULT, sound: 'default' });
      }
      if (!await permission(true)) return 'permission-denied';
      let result: StudyReminderStatus;
      if (native) result = await native.test() as StudyReminderStatus;
      else {
        await Notifications.scheduleNotificationAsync({
          identifier: TEST_IDENTIFIER,
          content: { title: 'آزمایش یادآور مطالعه', body: 'یادآور روی این گوشی کار می‌کند.', sound: 'default', data: { kind: 'study', eventId: 'local-test:study' } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 10, repeats: false },
        });
        result = 'test-scheduled';
      }
      await clearError();
      return result;
    } catch (cause) { await recordError('test', cause); return 'error'; }
  });
}

export async function studyReminderSummary(): Promise<string> {
  if (Platform.OS === 'web') return 'این پیش‌نمایش وب از اعلان محلی گوشی پشتیبانی نمی‌کند.';
  const settings = await loadStudyReminder();
  if (!settings.enabled) return 'خاموش — هیچ یادآوری روزانه‌ای نمی‌فرستیم.';
  const label = REMINDER_OPTIONS.find(item => item.hour === settings.hour)?.label ?? `${String(settings.hour).padStart(2, '0')}:${String(settings.minute).padStart(2, '0')}`;
  return `هر روز حدود ${label}؛ اگر آن روز درسی کامل نکرده باشی.${Platform.OS === 'ios' ? ' برنامهٔ ۳۰ روز آینده با هر بار بازکردن اپ تمدید می‌شود.' : ''}`;
}
