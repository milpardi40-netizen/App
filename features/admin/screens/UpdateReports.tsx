import { useState } from 'react';
import { View } from 'react-native';
import { LocalizedText as Text } from '@/components/LocalizedText';
import { findAppTarget } from '@/lib/appReleases';
import { useAdminQuery } from '../store';
import { Banner, Button, Card, EmptyState, Loading, Page, SearchBox, Segmented, StatTile, adminStyles as a, faDateTime, n } from '../ui';
import { fetchLegacyVersionUsers, fetchUpdateUserEvents, fetchUpdateVersionUsers, fetchUpdateVersions, type UpdateUserReport, type UpdateVersionReport } from '../updateReportsApi';

export const UPDATE_EVENT_LABELS: Record<string, string> = {
 session: 'نشست استفاده', download_verified: 'دانلود درون‌برنامه‌ایِ تأییدشده',
 installer_requested: 'درخواست بازکردن نصب‌کننده', upgrade_observed: 'اجرای نسخهٔ بالاتر مشاهده شد',
};
const date = (value: string | null) => value ? faDateTime(value) : 'گزارش نشده';
export function UpdateReportsScreen() {
 const [tab, setTab] = useState<'versions' | 'legacy'>('versions');
 const [selected, setSelected] = useState<UpdateVersionReport | null>(null);
 return <Page title="گزارش استفاده از آپدیت‌ها" subtitle="فقط مشاهده؛ انتشار، ویرایش و حذف نسخه‌ها در بخش قبلی به‌روزرسانی اپ‌ها باقی است.">
  <Banner kind="notice" text="تعدادها مربوط به رویدادهای گزارش‌شده از نسخه‌های مجهز به ثبت آمار است، نه همهٔ استفاده‌های واقعی. گذشتهٔ ثبت‌نشده نامشخص است؛ عدد صفر فقط یعنی رویدادی دریافت نشده. دانلود مستقیم بیرون برنامه و دستگاهِ بدون حساب قابل شمارش نیست." />
  <Segmented value={tab} onChange={value => { setTab(value); setSelected(null); }} options={[{id: 'versions', label: 'نسخه‌ها و استفاده‌های ثبت‌شده'}, {id: 'legacy', label: 'آخرین اطلاعات قبلی کاربران'}]} />
  {tab === 'legacy' ? <LegacyUsers /> : selected ? <View style={{gap: 12}}><Button label="بازگشت به فهرست نسخه‌ها" variant="soft" onPress={() => setSelected(null)} /><VersionUsers key={`${selected.package_name}:${selected.version_code}`} version={selected} /></View> : <VersionList onSelect={setSelected} />}
 </Page>;
}
function Pager({offset, total, change}: {offset: number; total: number; change: (value: number) => void}) {
 return <View style={{flexDirection: 'row-reverse', gap: 8, flexWrap: 'wrap', alignItems: 'center'}}>
  <Text style={a.muted}>صفحهٔ {n(Math.floor(offset / 50) + 1)} · مجموع {n(total)} ردیف</Text>
  <Button label="صفحهٔ قبل" small variant="soft" disabled={offset === 0} onPress={() => change(Math.max(0, offset - 50))} />
  <Button label="صفحهٔ بعد" small variant="soft" disabled={offset + 50 >= total} onPress={() => change(offset + 50)} />
 </View>;
}
function VersionList({onSelect}: {onSelect: (v: UpdateVersionReport) => void}) {
 const [offset, setOffset] = useState(0);
 return <VersionPage key={offset} offset={offset} change={setOffset} onSelect={onSelect} />;
}
function VersionPage({offset, change, onSelect}: {offset: number; change: (n: number) => void; onSelect: (v: UpdateVersionReport) => void}) {
 const query = useAdminQuery(`update-reports:versions:${offset}`, () => fetchUpdateVersions(offset));
 return <Card title="نسخه‌های منتشرشده، بایگانی‌شده و مشاهده‌شده" aside={<Button label="تلاش دوباره / تازه‌سازی" small variant="ghost" onPress={query.refresh} />}>
  {query.error ? <Banner kind="error" text={query.error} /> : query.loading ? <Loading /> : query.data ? <>
   <Text style={a.muted}>شروع ثبت روی سرور: {date(query.data.started_at ?? null)}. نیازمند نصب نسخهٔ دارای ثبت رویداد نیز هست.</Text>
   {!query.data.rows.length ? <EmptyState title="هنوز نسخه‌ای در گزارش موجود نیست" hint="نسخه‌های قدیمیِ حذف‌شده پیش از فعال‌شدن بایگانی قابل بازسازی نیستند." /> : null}
   {query.data.rows.map(row => <Card key={`${row.package_name}:${row.version_code}`} title={`${findAppTarget(row.package_name)?.title || row.package_name} · ${row.version_name} (${n(row.version_code)})`}>
    <Text selectable style={a.muted}>{row.package_name}</Text>
    <Text style={a.muted}>{row.source === 'archived' ? 'بایگانی انتشار (حتی پس از حذف از فهرست اصلی)' : row.source === 'observed' ? 'از اجرای اپ مشاهده شده؛ در فهرست انتشار ثبت نشده' : row.published ? 'در فهرست انتشار؛ فعال' : 'در فهرست انتشار؛ غیرفعال'}</Text>
    <Text style={a.muted}>تاریخ انتشار ثبت‌شده: {date(row.published_at)}</Text>
    <View style={a.grid}><StatTile label="کاربران دارای نشست ثبت‌شده" value={row.users} /><StatTile label="نشست‌های گزارش‌شده" value={row.sessions} /><StatTile label="دانلودهای تأییدشده درون اپ" value={row.downloads} /></View>
    <Text style={a.muted}>درخواست نصب‌کننده: {n(row.installers)} · مشاهدهٔ ارتقا در اجرا: {n(row.upgrades)} · همهٔ حساب‌های دارای رویداد: {n(row.reporters)}</Text>
    <Text style={a.muted}>اولین دریافت: {date(row.first_report_at)} · آخرین دریافت: {date(row.last_report_at)}</Text>
    {row.release_notes ? <Text style={a.muted}>{row.release_notes}</Text> : null}
    <Button label="کاربران و جزئیات این نسخه" onPress={() => onSelect(row)} />
   </Card>)}
   <Pager offset={offset} total={query.data.total} change={change} />
  </> : null}
 </Card>;
}
function VersionUsers({version}: {version: UpdateVersionReport}) {
 const [offset, setOffset] = useState(0), [draft, setDraft] = useState(''), [search, setSearch] = useState('');
 const [selected, setSelected] = useState<UpdateUserReport | null>(null);
 return <Card title={`${version.version_name} · ${n(version.version_code)}`}>
  <Text selectable style={a.muted}>{version.package_name}</Text>
  <Banner kind="notice" text="یک نشست یعنی شروع برنامه یا بازگشت پس از حداقل ۳۰ دقیقه در پس‌زمینه؛ نه تعداد لمس و نه زمان استفاده. درخواست نصب‌کننده، نصب موفق نیست. «مشاهدهٔ ارتقا» یعنی اجرای نسخهٔ بالاتر از نسخهٔ قبلاً گزارش‌شده؛ تأیید فروشگاه یا اندروید نیست." />
  <SearchBox value={draft} onChange={setDraft} placeholder="نام، ایمیل یا شناسهٔ حساب" />
  <Button label="جست‌وجوی کاربران این نسخه" small onPress={() => {setSearch(draft.trim()); setOffset(0); setSelected(null);}} />
  <UsersPage key={`${search}:${offset}`} version={version} offset={offset} search={search} change={value => {setOffset(value); setSelected(null);}} onSelect={setSelected} />
  {selected ? <UserEvents key={selected.user_id} version={version} user={selected} /> : null}
 </Card>;
}
function UsersPage({version, offset, search, change, onSelect}: {version: UpdateVersionReport; offset: number; search: string; change: (v: number) => void; onSelect: (u: UpdateUserReport) => void}) {
 const query = useAdminQuery(`update-reports:users:${version.package_name}:${version.version_code}:${offset}:${search}`, () => fetchUpdateVersionUsers(version.package_name, version.version_code, offset, search));
 return <View style={{gap: 12}}>
  {query.error ? <Banner kind="error" text={query.error} /> : query.loading ? <Loading /> : query.data ? <>
   {!query.data.rows.length ? <EmptyState title="کاربری با رویداد ثبت‌شده پیدا نشد" hint="نبود گزارش به معنی استفاده‌نکردن نیست." /> : null}
   {query.data.rows.map(user => <Card key={user.user_id} title={user.full_name || 'حساب بدون پروفایل نام‌دار'}>
    <Text selectable style={a.muted}>{user.email || 'ایمیل ثبت نشده'} · {user.user_id}</Text>
    <Text style={a.muted}>نشست: {n(user.sessions)} · دانلود تأییدشده: {n(user.downloads)} · درخواست نصب‌کننده: {n(user.installers)} · مشاهدهٔ ارتقا: {n(user.upgrades)}</Text>
    <Text style={a.muted}>اولین دریافت: {date(user.first_report_at)} · آخرین دریافت: {date(user.last_report_at)}</Text>
    <Text style={a.muted}>آخرین ساختِ دارای نشست برای همین اپ: {user.latest_observed_code ? n(user.latest_observed_code) : 'نامشخص'} (نه تضمینِ نسخهٔ نصب‌شدهٔ فعلی)</Text>
    <Button label="دیدن زمان و نوع رویدادهای این کاربر" small variant="soft" onPress={() => onSelect(user)} />
   </Card>)}<Pager offset={offset} total={query.data.total} change={change} />
  </> : null}<Button label="تازه‌سازی کاربران" small variant="ghost" onPress={query.refresh} />
 </View>;
}
function UserEvents({version, user}: {version: UpdateVersionReport; user: UpdateUserReport}) {
 const [offset, setOffset] = useState(0);
 return <EventsPage key={offset} version={version} user={user} offset={offset} change={setOffset} />;
}
function EventsPage({version, user, offset, change}: {version: UpdateVersionReport; user: UpdateUserReport; offset: number; change: (v: number) => void}) {
 const query = useAdminQuery(`update-reports:events:${version.package_name}:${version.version_code}:${user.user_id}:${offset}`, () => fetchUpdateUserEvents(version.package_name, version.version_code, user.user_id, offset));
 return <Card title={`رویدادهای ${user.full_name || user.user_id}`}>
  {query.error ? <Banner kind="error" text={query.error} /> : query.loading ? <Loading /> : query.data ? <>
   {query.data.rows.map(event => <View key={event.event_id} style={{gap: 4, paddingVertical: 8}}>
    <Text style={a.name}>{UPDATE_EVENT_LABELS[event.event_kind] || event.event_kind}{event.previous_code ? ` · از ساخت ${n(event.previous_code)}` : ''}</Text>
    <Text style={a.muted}>زمان اعلام‌شدهٔ دستگاه: {date(event.occurred_at)} · دریافت سرور: {date(event.received_at)}</Text>
    <Text selectable style={a.muted}>{event.event_id}</Text>
   </View>)}<Pager offset={offset} total={query.data.total} change={change} />
  </> : null}<Button label="تازه‌سازی رویدادها" small variant="ghost" onPress={query.refresh} />
 </Card>;
}
function LegacyUsers() {
 const [offset, setOffset] = useState(0), [draft, setDraft] = useState(''), [search, setSearch] = useState('');
 return <Card title="آخرین اطلاعات موجودِ حساب‌ها">
  <Banner kind="notice" text="این دادهٔ فعلیِ پروفایل است، نه تاریخچهٔ استفاده: نوع بستهٔ اپ و تعداد دفعات استفاده در دادهٔ قدیمی موجود نیست و نامشخص است. کاربر به نسخهٔ یک اپ مشخص نسبت داده نمی‌شود؛ حسابِ دستگاه هم لزوماً یک شخص یکتا نیست." />
  <SearchBox value={draft} onChange={setDraft} placeholder="نام، ایمیل یا نسخهٔ گزارش‌شده" />
  <Button label="جست‌وجوی اطلاعات قبلی" small onPress={() => {setSearch(draft.trim()); setOffset(0);}} />
  <LegacyPage key={`${offset}:${search}`} offset={offset} search={search} change={setOffset} />
 </Card>;
}
function LegacyPage({offset, search, change}: {offset: number; search: string; change: (v: number) => void}) {
 const query = useAdminQuery(`update-reports:legacy:${offset}:${search}`, () => fetchLegacyVersionUsers(offset, search));
 return <View style={{gap: 12}}>
  {query.error ? <Banner kind="error" text={query.error} /> : query.loading ? <Loading /> : query.data ? <>
   {!query.data.rows.length ? <EmptyState title="پروفایلی پیدا نشد" /> : null}
   {query.data.rows.map(user => <View key={user.user_id} style={{gap: 4, paddingVertical: 10}}>
    <Text style={a.name}>{user.full_name}</Text><Text selectable style={a.muted}>{user.email} · {user.user_id}</Text>
    <Text style={a.muted}>آخرین نسخهٔ پروفایل: {user.app_version || 'نامشخص'} · بستر: {user.platform || 'نامشخص'}</Text>
    <Text style={a.muted}>آخرین فعالیت پروفایل: {date(user.last_seen_at)} · نوع اپ: نامشخص · دفعات استفادهٔ گذشته: نامشخص</Text>
   </View>)}<Pager offset={offset} total={query.data.total} change={change} />
  </> : null}<Button label="تازه‌سازی اطلاعات قبلی" small variant="ghost" onPress={query.refresh} />
 </View>;
}
