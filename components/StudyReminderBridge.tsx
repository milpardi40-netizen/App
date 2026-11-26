import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { localDayKey, reconcileStudyReminder } from '@/lib/studyReminder';

/** Repair opted-in schedules after an update/resume; never prompt or start a service. */
export function StudyReminderBridge() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let clock = `${localDayKey()}:${new Date().getTimezoneOffset()}`;
    const reconcile = () => { void reconcileStudyReminder(); };
    reconcile();
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') reconcile();
    });
    // Also cover midnight/timezone changes while the app remains open.
    const timer = setInterval(() => {
      const next = `${localDayKey()}:${new Date().getTimezoneOffset()}`;
      if (AppState.currentState === 'active' && next !== clock) {
        clock = next;
        reconcile();
      }
    }, 60_000);
    return () => { listener.remove(); clearInterval(timer); };
  }, []);
  return null;
}
