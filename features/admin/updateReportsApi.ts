import { adminClient } from '@/lib/educationAdmin';
import { readableSupabaseError } from '@/lib/errors';
export interface ReportPage<T> { rows: T[]; total: number; started_at?: string }
export interface UpdateVersionReport {
 package_name: string; version_code: number; version_name: string; release_id: string | null;
 release_notes: string; published: boolean | null; published_at: string | null;
 source: 'catalogue' | 'archived' | 'observed'; reporters: number; users: number; sessions: number;
 downloads: number; installers: number; upgrades: number; first_report_at: string | null; last_report_at: string | null;
}
export interface UpdateUserReport {
 user_id: string; full_name: string | null; email: string | null; account_kind: string | null;
 sessions: number; downloads: number; installers: number; upgrades: number;
 first_report_at: string; last_report_at: string; latest_observed_code: number | null;
}
export interface LegacyVersionUser {user_id: string; full_name: string; email: string; app_version: string | null; platform: string | null; last_seen_at: string}
export interface UpdateUserEvent {event_id: string; event_kind: string; previous_code: number | null; occurred_at: string; received_at: string}
async function report<T>(name: string, args: Record<string, unknown>): Promise<ReportPage<T>> {
 const { data, error } = await adminClient().rpc(name, args);
 if (error) {
  if (error.code === 'PGRST202' || error.code === '42883') throw Error('گزارش آپدیت‌ها روی سرور فعال نیست. فایل supabase/SETUP-UPDATE-REPORTS-ONCE.sql باید یک‌بار اجرا شود. اطلاعات فعلی حذف نمی‌شود.');
  throw Error(readableSupabaseError(error));
 }
 return data as ReportPage<T>;
}
export const fetchUpdateVersions = (offset: number) => report<UpdateVersionReport>('admin_update_versions', {p_offset: offset});
export const fetchUpdateVersionUsers = (pkg: string, code: number, offset: number, search: string) => report<UpdateUserReport>('admin_update_version_users', {p_package_name: pkg, p_version_code: code, p_offset: offset, p_search: search});
export const fetchLegacyVersionUsers = (offset: number, search: string) => report<LegacyVersionUser>('admin_update_legacy_users', {p_offset: offset, p_search: search});
export const fetchUpdateUserEvents = (pkg: string, code: number, user: string, offset: number) => report<UpdateUserEvent>('admin_update_user_events', {p_package_name: pkg, p_version_code: code, p_user_id: user, p_offset: offset});
