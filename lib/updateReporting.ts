import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import { AppState, Platform } from 'react-native';
import { isSupabaseConfigured } from './pairing';
import { supabase } from './supabase';
import { MANAGEMENT_BUILD } from './features';
import { adminClient } from './educationAdmin';
const reportingClient = () => MANAGEMENT_BUILD ? adminClient() : supabase;
import { createUpdateReporter, UPDATE_REPORT_QUEUE_KEY, UPDATE_SESSION_GAP_MS, type UpdateBuild } from './updateReportingCore';

const reporter = createUpdateReporter({
 read: () => AsyncStorage.getItem(UPDATE_REPORT_QUEUE_KEY),
 write: value => AsyncStorage.setItem(UPDATE_REPORT_QUEUE_KEY, value),
 uuid: () => Crypto.randomUUID(), now: () => Date.now(),
 user: async () => {
  if (Platform.OS !== 'android' || !isSupabaseConfigured()) return null;
  const { data } = await reportingClient().auth.getSession();
  return data.session?.user.id ?? null; // Never create an identity solely to count usage.
 },
 build: () => Application.applicationId ? { package: Application.applicationId, code: Number(Application.nativeBuildVersion), name: Application.nativeApplicationVersion || 'unknown' } : null,
 send: async event => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
   const { error } = await reportingClient().rpc('report_app_update_event', {
    p_owner_id: event.owner, p_event_id: event.id, p_package_name: event.build.package,
    p_version_code: event.build.code, p_version_name: event.build.name,
    p_event_kind: event.kind, p_occurred_at: event.at, p_previous_code: event.previous ?? null,
   }).abortSignal(controller.signal);
   return !error;
  } catch { return false; }
  finally { clearTimeout(timer); }
 },
});
/** Fire-and-forget; the updater's existing result and UI do not depend on reporting. */
export function reportVerifiedUpdateDownload(build: UpdateBuild): void { void reporter.record('download_verified', build); }
export function reportUpdateInstallerRequested(build: UpdateBuild): void { void reporter.record('installer_requested', build); }

/** A cold start or return after >=30 minutes in background is one reported session. */
export function startUpdateUsageReporting(): () => void {
 if (Platform.OS !== 'android' || !isSupabaseConfigured()) return () => {};
 let backgroundAt: number | null = null;
 let disposed = false;
 void reporter.record('session');
 const appState = AppState.addEventListener('change', state => {
  if (state === 'background' && backgroundAt === null) backgroundAt = Date.now();
  if (state === 'active') {
   if (backgroundAt !== null && Date.now() - backgroundAt >= UPDATE_SESSION_GAP_MS) reporter.newSession();
   backgroundAt = null;
   void reporter.record('session');
  }
 });
 const auth = reportingClient().auth.onAuthStateChange((_event, session) => {
  // Outside the auth callback lock; don't await Supabase calls in its callback.
  if (session) setTimeout(() => { if (!disposed) void reporter.record('session'); }, 0);
 });
 return () => { disposed = true; appState.remove(); auth.data.subscription.unsubscribe(); };
}
