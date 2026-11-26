#!/usr/bin/env node
/* JS/native bridge contracts with mocks, plus native wiring checks. Not a device test. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const esbuild = require('esbuild');
let checks = 0;
const check = (value, message) => { assert.ok(value, message); checks++; };
const equal = (a, b, message) => { assert.deepEqual(a, b, message); checks++; };

async function harness(os = 'android') {
  const state = {
    os, storage: new Map(), native: null, nativeAvailable: true, calls: [], pending: new Map(),
    granted: true, canAskAgain: true, allowRequest: true, channelBlocked: false,
    fail: '', prompts: 0, lastError: '',
  };
  state.bridge = {
    async getSettings() { state.calls.push('getSettings'); return state.native ? JSON.stringify(state.native) : null; },
    async configure(json) {
      state.calls.push('configure');
      if (state.fail === 'native') { state.lastError = 'configure: SecurityException: device error'; throw Error('device error'); }
      if (state.channelBlocked) return 'channel-blocked';
      const next = JSON.parse(json);
      next.lastStudiedDay = [state.native?.lastStudiedDay || '', next.lastStudiedDay].sort().pop();
      state.native = next;
      return next.enabled ? 'scheduled' : 'disabled';
    },
    async markStudied(day) {
      state.calls.push(`study:${day}`);
      if (state.fail === 'native-study') throw Error('study write failed');
      if (state.native) state.native.lastStudiedDay = day;
    },
    async reconcile() { state.calls.push('reconcile'); return state.channelBlocked ? 'channel-blocked' : state.granted ? 'scheduled' : 'permission-denied'; },
    async test() { state.calls.push('test'); return state.channelBlocked ? 'channel-blocked' : 'test-scheduled'; },
    async getLastError() { return state.lastError; },
  };
  global.__studyHarness = state;
  const result = esbuild.buildSync({
    stdin: { contents: "module.exports = require('./lib/studyReminder');", resolveDir: process.cwd() },
    bundle: true, platform: 'node', format: 'cjs', write: false,
    external: ['react-native', 'expo-notifications', '@react-native-async-storage/async-storage', '@/modules/milo-study-reminder'],
  });
  const m = { exports: {} };
  const requireMock = name => {
    if (name === 'react-native') return { Platform: { OS: os } };
    if (name === '@/modules/milo-study-reminder') return { nativeStudyReminder: () => os === 'android' && state.nativeAvailable ? state.bridge : null };
    if (name.includes('async-storage')) return { __esModule: true, default: {
      async getItem(key) { return state.storage.get(key) ?? null; },
      async setItem(key, value) { if (state.fail === 'storage' && key === 'milo_study_reminder_v1') throw Error('disk full'); state.storage.set(key, value); },
      async removeItem(key) { state.storage.delete(key); },
    } };
    if (name === 'expo-notifications') return {
      AndroidImportance: { DEFAULT: 3 }, SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval' },
      async setNotificationChannelAsync(id) { state.calls.push(`channel:${id}`); if (state.fail === 'channel') throw Error('channel failed'); },
      async getPermissionsAsync() { state.calls.push('permission'); if (state.fail === 'permission') throw Error('permission failed'); return { granted: state.granted, canAskAgain: state.canAskAgain }; },
      async requestPermissionsAsync() { state.prompts++; return { granted: state.allowRequest }; },
      async cancelScheduledNotificationAsync(id) { state.calls.push(`cancel:${id}`); state.pending.delete(id); },
      async getAllScheduledNotificationsAsync() { return [...state.pending.values()]; },
      async scheduleNotificationAsync(request) { if (state.fail === 'ios-schedule') throw Error('iOS schedule failed'); state.pending.set(request.identifier, request); return request.identifier; },
    };
    throw Error(`Unexpected import ${name}`);
  };
  new Function('module', 'exports', 'require', result.outputFiles[0].text)(m, m.exports, requireMock);
  return { api: m.exports, state };
}

(async () => {
  let { api, state } = await harness();
  const off = await api.loadStudyReminder();
  equal(off, { enabled: false, hour: 20, minute: 0, lastStudiedDay: '' }, 'opt-in default preserved');
  equal(await api.reconcileStudyReminder(), 'disabled', 'no automatic opt-in');
  equal(state.prompts, 0, 'no prompt on initial startup');
  const on = { ...off, enabled: true };
  state.pending.set('chat', { identifier: 'chat' });
  state.pending.set('milo-study-reminder', { identifier: 'milo-study-reminder' });
  equal(await api.scheduleStudyReminder(on), 'scheduled', 'enable native alarm');
  equal(state.native, on, 'native receives preferences');
  check(!state.pending.has('milo-study-reminder') && state.pending.has('chat'), 'legacy migration removes only old study alarm');
  check(state.calls.indexOf('channel:milo-study') < state.calls.indexOf('permission'), 'channel created before Android13 permission check');
  check(!state.calls.some(x => x.startsWith('expo-schedule')), 'Android never uses Expo scheduling');
  state.storage.set(api.STUDY_REMINDER_KEY, JSON.stringify(off));
  equal(await api.loadStudyReminder(), on, 'native settings authoritative over stale AsyncStorage mirror');
  const date = new Date(2026, 10, 26, 12);
  await Promise.all([api.noteStudyToday(date), api.scheduleStudyReminder({ ...on, hour: 17 })]);
  equal(state.native.lastStudiedDay, '2026-11-26', 'concurrent stale card cannot erase lesson completion');
  equal(state.native.hour, 17, 'serialized time change retained');
  equal(await api.studiedToday(date), true, 'study marker readable');
  equal(await api.testStudyReminder(), 'test-scheduled', 'test uses independent native alarm');
  equal(state.native.hour, 17, 'test does not alter daily time');
  state.fail = 'native-study';
  await api.noteStudyToday(new Date(2026, 10, 27, 12));
  equal((await api.loadStudyReminder()).lastStudiedDay, '2026-11-27', 'lesson marker survives native failure in local mirror');
  state.fail = '';
  await api.reconcileStudyReminder();
  equal(state.native.lastStudiedDay, '2026-11-27', 'resume repairs the native marker after a transient failure');
  await api.noteStudyToday(date);
  equal(state.native.lastStudiedDay, '2026-11-26', 'explicit lesson completion survives a backwards device-calendar change');
  await api.scheduleStudyReminder({ ...on, lastStudiedDay: '2026-11-27' });
  equal(state.native.lastStudiedDay, '2026-11-26', 'stale settings snapshot cannot overwrite explicit completion after clock change');
  equal(await api.reconcileStudyReminder(), 'scheduled', 'resume repairs existing native alarm');
  check(state.calls.includes('reconcile'), 'resume uses native reconciliation, not Expo re-registration');
  equal(await api.scheduleStudyReminder({ ...state.native, enabled: false }), 'disabled', 'disable native alarm');
  check(!state.native.enabled, 'disable is durable');
  equal(await api.reconcileStudyReminder(), 'disabled', 'disabled preference survives resume');

  ({ api, state } = await harness());
  state.granted = false; state.allowRequest = false;
  equal(await api.scheduleStudyReminder(on), 'permission-denied', 'denial distinguished from native failures');
  equal(state.prompts, 1, 'explicit opt-in can request permission');
  check(!state.native, 'denial does not persist false enabled state');
  state.canAskAgain = false;
  equal(await api.testStudyReminder(), 'permission-denied', 'permanent denial has recovery status');
  equal(state.prompts, 1, 'does not re-prompt permanently denied permission');
  state.storage.set(api.STUDY_REMINDER_KEY, JSON.stringify(on));
  await api.reconcileStudyReminder();
  equal(state.prompts, 1, 'resume never prompts');
  state.granted = true; state.channelBlocked = true;
  equal(await api.scheduleStudyReminder(on), 'channel-blocked', 'system channel block surfaced');
  state.channelBlocked = false;
  equal(await api.scheduleStudyReminder(on), 'scheduled', 'recovery after channel re-enabled');

  for (const stage of ['channel', 'permission', 'native']) {
    ({ api, state } = await harness()); state.fail = stage;
    equal(await api.scheduleStudyReminder(on), 'error', `${stage} errors caught`);
    check((await api.studyReminderError()).length > 0, `${stage} error detail retained`);
    equal((await api.loadStudyReminder()).enabled, false, `${stage} failure doesn't claim active`);
  }
  ({ api, state } = await harness()); state.fail = 'storage';
  equal(await api.scheduleStudyReminder(on), 'scheduled', 'Android mirror failure does not misreport successful native scheduling');
  equal((await api.loadStudyReminder()).enabled, true, 'native state survives mirror failure');
  await api.noteStudyToday(date); // must never break lesson rewards
  checks++;
  ({ api, state } = await harness()); state.nativeAvailable = false;
  equal(await api.scheduleStudyReminder(on), 'update-required', 'old Android binary must not pretend native fix exists');
  equal(await api.scheduleStudyReminder(off), 'disabled', 'old binaries can still disable legacy reminder');
  equal(await api.testStudyReminder(), 'update-required', 'test also explains native update requirement');
  ({ api, state } = await harness('web'));
  equal(await api.scheduleStudyReminder(on), 'unsupported', 'web never schedules');
  equal(await api.testStudyReminder(), 'unsupported', 'web cannot claim a device test');
  equal(state.prompts, 0, 'web never prompts');

  ({ api, state } = await harness('ios'));
  state.pending.set('chat', { identifier: 'chat' });
  equal(await api.scheduleStudyReminder(on), 'scheduled', 'iOS dated scheduling works');
  equal(state.pending.size, 31, '30 dated study notifications plus untouched chat');
  const reminder = [...state.pending.values()].find(x => x.identifier !== 'chat');
  check(reminder.trigger.date instanceof Date && reminder.trigger.date > new Date(), 'valid future DATE trigger');
  const days = [...state.pending.values()].filter(x => x.identifier !== 'chat').map(x => api.localDayKey(x.trigger.date));
  equal(new Set(days).size, 30, 'one notification per local date');
  await api.noteStudyToday();
  check([...state.pending.values()].filter(x => x.identifier !== 'chat').every(x => api.localDayKey(x.trigger.date) !== api.localDayKey()), 'iOS removes today after lesson completion');
  equal(state.pending.size, 31, 'replacement does not duplicate pending reminders');
  state.fail = 'ios-schedule';
  equal(await api.scheduleStudyReminder({ ...on, hour: 8 }), 'error', 'iOS native rejection surfaced');
  equal(state.pending.size, 31, 'old iOS schedule retained on failed replacement');
  state.fail = '';
  equal(await api.testStudyReminder(), 'test-scheduled', 'iOS explicit test scheduled independently');
  await api.reconcileStudyReminder();
  check(state.pending.has('milo-study-reminder:test'), 'iOS lifecycle renewal preserves a pending explicit test');
  await api.scheduleStudyReminder(off);
  equal([...state.pending.keys()], ['chat'], 'disable removes only study notifications');

  // Execute the shared presentation handler; keep ordinary chat behavior unchanged.
  let handler;
  let completed = false;
  const appState = { currentState: 'active' };
  const handlerModule = { exports: {} };
  const handlerSource = esbuild.transformSync(fs.readFileSync('lib/chatNotifications.ts', 'utf8'), { loader: 'ts', format: 'cjs' }).code;
  new Function('module', 'exports', 'require', handlerSource)(handlerModule, handlerModule.exports, name => {
    if (name === 'react-native') return { AppState: appState, Platform: { OS: 'ios' } };
    if (name === 'expo-notifications') return { setNotificationHandler(value) { handler = value; } };
    if (name === './studyReminder') return { studiedToday: async () => completed };
    return {};
  });
  const present = (kind, eventId = 'study-reminder') => handler.handleNotification({ request: { content: { data: { kind, eventId } } } });
  equal((await present('chat')).shouldShowBanner, false, 'foreground chat still uses quiet in-app banner');
  equal((await present('chat', 'local-test:chat')).shouldShowBanner, true, 'chat test still appears foreground');
  equal((await present('study')).shouldShowBanner, true, 'foreground study is not hidden as chat');
  completed = true;
  equal((await present('study')).shouldShowBanner, false, 'completed study suppresses foreground iOS reminder');
  appState.currentState = 'background';
  equal((await present('study')).shouldShowBanner, false, 'completed study suppresses background iOS handler too');
  equal((await present('study', 'local-test:study')).shouldShowBanner, true, 'explicit test bypasses studied-today suppression');
  equal((await present('chat')).shouldShowBanner, true, 'background chat unchanged');

  let markedOnMedalFailure = false;
  const rewardsModule = { exports: {} };
  const rewardsSource = esbuild.transformSync(fs.readFileSync('lib/lessonRewards.ts', 'utf8'), { loader: 'ts', format: 'cjs' }).code;
  new Function('module', 'exports', 'require', rewardsSource)(rewardsModule, rewardsModule.exports, name => {
    if (name === './studyReminder') return { noteStudyToday: async () => { markedOnMedalFailure = true; } };
    if (name === './lessonMedals') return { loadMedalProgress: async () => { throw Error('medal storage failed'); }, loadSeenMedals: async () => [] };
    return {};
  });
  await assert.rejects(rewardsModule.exports.finishLessonRewards(), /medal storage/);
  check(markedOnMedalFailure, 'medal failure cannot prevent completed-day recording');

  const read = path => fs.readFileSync(path, 'utf8');
  const root = 'modules/milo-study-reminder';
  const kotlin = read(`${root}/android/src/main/java/expo/modules/milostudyreminder/StudyReminderScheduler.kt`);
  const manifest = read(`${root}/android/src/main/AndroidManifest.xml`);
  check(/setAndAllowWhileIdle\(AlarmManager.RTC_WAKEUP/.test(kotlin), 'native alarm is wall-clock/inexact, no exact grant required');
  check(!/alarms\(c\)\.setExact/.test(kotlin) && !manifest.includes('SCHEDULE_EXACT_ALARM'), 'no unnecessary exact-alarm permission');
  for (const event of ['BOOT_COMPLETED', 'MY_PACKAGE_REPLACED', 'TIME_SET', 'TIMEZONE_CHANGED']) check(manifest.includes(event), `${event} restores local alarm`);
  check(manifest.includes('android:exported="false"'), 'receiver is private');
  check(kotlin.includes('Calendar.DAY_OF_YEAR, 1') && !kotlin.includes('86_400_000'), 'next day uses calendar arithmetic/DST');
  check(kotlin.includes('lastStudiedDay') && kotlin.includes('lastNotifiedDay') && kotlin.includes('day(Date(at)) == today'), 'native receiver guards completion, duplicate and stale-day delivery');
  check(kotlin.includes('at != p.getLong("nextAt", 0)') && kotlin.includes('at > System.currentTimeMillis() + 1000'), 'stale/early alarm is rejected');
  check(kotlin.includes('p.getLong("testAt", 0)') && kotlin.includes('cancel(c, true)'), 'test has separate identity and can be cancelled');
  check(kotlin.includes('NotificationManagerCompat.from(c).areNotificationsEnabled()') && kotlin.includes('IMPORTANCE_NONE'), 'both app permission and channel block checked natively');
  check(kotlin.includes('getLaunchIntentForPackage') && !kotlin.includes('https://'), 'tap opens normally, delivery requires no network');
  check(kotlin.includes('Log.e(') && kotlin.includes('lastError'), 'native failures retained and logged');
  check(read(`${root}/expo-module.config.json`).includes('MiloStudyReminderModule'), 'Expo autolink metadata registered');
  const bridge = read('components/StudyReminderBridge.tsx');
  check(bridge.includes('reconcileStudyReminder') && bridge.includes("state === 'active'") && bridge.includes('clearInterval'), 'lifecycle repair and cleanup wired');
  check(read('app/_layout.tsx').includes('<StudyReminderBridge />'), 'bridge mounted in learner root');
  const card = read('components/StudyReminderCard.tsx');
  check(card.includes('testStudyReminder') && card.includes('Linking.openSettings') && card.includes('studyReminderError'), 'device test, recovery settings and diagnostic UI present');
  console.log(`Study reminder: ${checks} bridge/behavior/wiring checks passed (mocked native; physical Android test still required).`);
})().catch(error => { console.error(error); process.exitCode = 1; });
