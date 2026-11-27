import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as esbuild from 'esbuild';

const profile = fs.readFileSync('app/profile.tsx', 'utf8');
const home = fs.readFileSync('app/languages.tsx', 'utf8');
const englishHome = fs.readFileSync('app/lang/index.tsx', 'utf8');
const starterHome = fs.readFileSync('components/StarterHome.tsx', 'utf8');
const arabicHome = fs.readFileSync('components/arabic/ArabicHomeScreen.tsx', 'utf8');

assert.ok(!fs.existsSync('components/QuickSettingsModal.tsx'), 'remove the unused duplicate settings UI');
for (const [name, source] of Object.entries({ home, englishHome, starterHome, arabicHome })) {
  assert.ok(!/QuickSettingsModal|quickSettingsOpen/.test(source), name + ': no separate settings state or modal');
  assert.ok(source.includes('پروفایل و تنظیمات'), name + ': clear merged label');
  assert.equal((source.match(/(?:router\.push|open)\('\/profile'/g) || []).length, 1, name + ': one combined entry');
}
for (const component of ['DisplayTypographyCard', 'RecordedSpeechSetting', 'StudyReminderCard', 'AppUpdateCard', 'LanguagesSection', 'AchievementsSection', 'TodayAndTrendSection', 'AccountSection']) {
  assert.equal((profile.match(new RegExp('<'+component+'(?:\\s|/|>)', 'g')) || []).length, 1, component + ': one canonical instance');
}
assert.match(profile, /showTypography \? <View[^>]*><DisplayTypographyCard/);
assert.equal((profile.match(/router\.push\('\/lang\/backup'/g) || []).length, 1, 'one backup action, not duplicated in account');
assert.equal((profile.match(/router\.push\('\/app-lock'/g) || []).length, 1, 'one app-lock action');
assert.ok(profile.includes('پشتیبان انگلیسی'), 'backup scope is honest; no unimplemented all-language promise');
const settingsArea = profile.slice(profile.indexOf('{!loading ? <>'), profile.indexOf('</KeyboardAwareScrollView>'));
assert.ok(settingsArea.includes('<RecordedSpeechSetting') && settingsArea.includes('<AppUpdateCard') && settingsArea.includes('<StudyReminderCard'), 'settings and reminders are independent of login and statistics availability');
assert.ok(!/!profile|summary \?/.test(settingsArea), 'basic settings cannot be gated by profile or stats');
const account = profile.slice(profile.indexOf('function AccountSection'), profile.indexOf('/* ───────────────────────── Local profile'));
assert.ok(!/AppUpdateCard|onBackup|buildVersion|نام نمایشی/.test(account), 'account does not duplicate update, backup or identity display');
for (const action of ['onSync', 'onManage', 'onSignOut', 'onRegister']) assert.ok(account.includes(action), action + ': preserve unique account capabilities');

const buttons = [...home.matchAll(/<Pressable\b[\s\S]*?<\/Pressable>/g)].map(match => match[0]);
for (const label of ['انتقادات و پیشنهادات', 'سایت و دانلود نسخهٔ اندروید']) {
  const button = buttons.find(value => value.includes(`accessibilityLabel="${label}"`));
  assert.ok(button, `preserve ${label}`);
  assert.match(button, /disabled=\{!registered(?: \|\| openingSupport)?\}/, `${label} retains its access policy`);
  assert.match(button, /accessibilityState=\{\{ disabled: !registered/);
}
assert.match(home, /if \(!registered \|\| openingSupport\) return/);
assert.match(home, /const openSite = \(\) => \{\s*if \(!registered\) return/);
assert.ok(buttons.some(button => button.includes("router.push('/profile'") && !button.includes('disabled={!registered')), 'merged profile/settings stays accessible before login');

// Validate the actual registration predicate: pending and anonymous sessions must not unlock icons.
const globals = { login: false, local: null, profile: null, fail: false };
globalThis.__quickSettingsAuthTest = globals;
const mocks = {
  './features': 'export const FEATURES={get learnerLogin(){return globalThis.__quickSettingsAuthTest.login}};',
  './localProfile': 'export const getLocalProfile=async()=>{if(globalThis.__quickSettingsAuthTest.fail)throw Error();return globalThis.__quickSettingsAuthTest.local};',
  './userRegistration': 'export const getRegisteredSession=async()=>{if(globalThis.__quickSettingsAuthTest.fail)throw Error();return {profile:globalThis.__quickSettingsAuthTest.profile}};',
};
const result = await esbuild.build({ entryPoints: ['lib/registrationStatus.ts'], bundle: true, platform: 'node', format: 'cjs', write: false, plugins: [{ name: 'auth-test-mocks', setup(build) {
  build.onResolve({ filter: /^\.\// }, args => mocks[args.path] ? { path: args.path, namespace: 'mock' } : undefined);
  build.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ contents: mocks[args.path] }));
}}] });
const mod = { exports: {} };
new Function('module', 'exports', result.outputFiles[0].text)(mod, mod.exports);
const registered = mod.exports.isLearnerRegistered;
assert.equal(await registered(), false);
globals.local = { verifiedAt: null };
assert.equal(await registered(), false);
globals.local.verifiedAt = '2026-11-26';
assert.equal(await registered(), true);
globals.login = true;
assert.equal(await registered(), false, 'anonymous session does not unlock controls');
globals.profile = { user_id: 'registered-user' };
assert.equal(await registered(), true);
globals.fail = true;
assert.equal(await registered(), false, 'read failures fail closed');
delete globalThis.__quickSettingsAuthTest;
console.log('Merged profile/settings checks passed: one home entry, one instance per setting, independent basic settings, preserved account/learning/reminder features, honest backup scope and unchanged registration gates for support/site.');
