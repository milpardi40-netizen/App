import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as esbuild from 'esbuild';

const profile = fs.readFileSync('app/profile.tsx', 'utf8');
const settings = fs.readFileSync('components/QuickSettingsModal.tsx', 'utf8');
const home = fs.readFileSync('app/languages.tsx', 'utf8');

assert.equal((profile.match(/<DisplayTypographyCard\s*\/>/g) || []).length, 1, 'remove duplicate standalone typography cards, retain the existing collapsed setting');
assert.match(profile, /showTypography \? <View[^>]*><DisplayTypographyCard/);
assert.equal((settings.match(/navigate\('\/app-lock'\)/g) || []).length, 1, 'one lock shortcut, not a duplicate');
assert.ok(settings.indexOf('accessibilityLabel="قفل دستگاه"') < settings.indexOf('{/* Quick Voice Switch */}'), 'device lock is the first settings item');
assert.match(settings, /<DisplayTypographyCard\s*\/>/, 'typography remains in settings');

const buttons = [...home.matchAll(/<Pressable\b[\s\S]*?<\/Pressable>/g)].map(match => match[0]);
for (const label of ['انتقادات و پیشنهادات', 'تنظیمات و قفل برنامه', 'سایت و دانلود نسخهٔ اندروید']) {
  const button = buttons.find(value => value.includes(`accessibilityLabel="${label}"`));
  assert.ok(button, `preserve ${label}`);
  assert.match(button, /disabled=\{!registered(?: \|\| openingSupport)?\}/, `${label} is not merely visually faded`);
  assert.match(button, /accessibilityState=\{\{ disabled: !registered/);
  assert.match(button, /!registered && styles.headerButtonDisabled/);
}
assert.match(home, /headerButtonDisabled: \{ opacity: 0\.3 \}/);
assert.match(home, /if \(!registered \|\| openingSupport\) return/);
assert.match(home, /const openSite = \(\) => \{\s*if \(!registered\) return/);
assert.ok(buttons.some(button => button.includes("router.push('/profile'") && !button.includes('disabled={!registered')), 'profile/login stays accessible');

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
console.log('Profile/settings checks passed: no duplicate typography, lock first, gated icons, accessible login, verified local/server accounts and fail-closed errors.');
