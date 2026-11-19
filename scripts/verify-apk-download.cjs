#!/usr/bin/env node
// Exercise the real update orchestrator without touching a device, network, or learner store.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { transformSync } = require('esbuild');
const js = transformSync(readFileSync('lib/appUpdates.ts', 'utf8'), { loader: 'ts', format: 'cjs' }).code;
const hash = 'ae'.repeat(32);
const release = { version_code: 116, version_name: '1.0.116', download_url: 'https://example.test/5update.apk', sha256: hash, file_size: 20 };
const target = 'file:///cache/updates/milo-update-116.apk';
const pending = 'milo_update_pending_install_v1';

function fixture({ http = 200, size = 20, exists = true, verdict = 'ok', installCode, beforeDownload } = {}) {
  const calls = [], storage = new Map([['course-progress', 'keep']]);
  const deps = {
    'react-native': { Platform: { OS: 'android' } },
    'expo-application': { applicationId: 'com.devicecontrol.milofive', nativeBuildVersion: '115' },
    'expo': { requireNativeModule(name) {
      assert.equal(name, 'MiloApkVerifier');
      return { async check(...args) { calls.push(['verify', ...args]); return verdict; } };
    } },
    'expo-file-system/legacy': {
      cacheDirectory: 'file:///cache/', makeDirectoryAsync: async () => {}, deleteAsync: async uri => { calls.push(['delete', uri]); },
      getInfoAsync: async () => ({ exists, size, isDirectory: false }),
      createDownloadResumable: (_url, uri) => ({ downloadAsync: async () => {
        calls.push(['download', uri]); await beforeDownload?.(); return { status: http };
      } }),
      getContentUriAsync: async uri => { calls.push(['share', uri]); return 'content://private/updates/file.apk'; },
    },
    'expo-intent-launcher': { async startActivityAsync(...args) { calls.push(['install', ...args]); return { extra: { 'android.intent.extra.INSTALL_RESULT': installCode } }; } },
    '@react-native-async-storage/async-storage': { async setItem(k, v) { storage.set(k, v); }, async removeItem(k) { storage.delete(k); } },
    './pairing': {}, './supabase': {},
  };
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', js)(name => { assert.ok(name in deps, name); return deps[name]; }, mod, mod.exports);
  return { download: mod.exports.downloadAndInstall, calls, storage };
}

(async () => {
  let count = 0;
  for (const [setup, override, verifyHash] of [
    [{}, {}, hash], [{}, { sha256: `sha256:${hash}` }, hash], [{}, { file_size: null, sha256: null }, null],
    [{}, { file_size: 0, sha256: null }, null], // older admin record with unknown size
  ]) {
    const f = fixture(setup);
    await f.download({ ...release, ...override });
    assert.deepEqual(f.calls.map(c => c[0]), ['delete', 'download', 'verify', 'share', 'install']);
    assert.deepEqual(f.calls[2], ['verify', target, 116, verifyHash]);
    assert.deepEqual(f.calls.at(-1), ['install', 'android.intent.action.VIEW', { data: 'content://private/updates/file.apk', type: 'application/vnd.android.package-archive', flags: 1, extra: { 'android.intent.extra.RETURN_RESULT': true } }]);
    assert.equal(JSON.parse(f.storage.get(pending)).version_code, 116);
    assert.equal(f.storage.get('course-progress'), 'keep'); count++;
  }
  for (const [setup, override] of [
    [{ http: 206 }, {}], [{ http: 302 }, {}], [{ http: 403 }, {}], [{ size: 0 }, { file_size: null }],
    [{ size: 19 }, {}], [{ exists: false }, {}], [{}, { version_code: 115 }], [{}, { sha256: 'bad' }],
    [{}, { download_url: 'http://example.test' }],
    ...['invalid', 'digest', 'package', 'version', 'signer', 'abi', 'sdk', 'unexpected'].map(verdict => [{ verdict }, {}]),
  ]) {
    const f = fixture(setup);
    await assert.rejects(f.download({ ...release, ...override }));
    assert.ok(!f.calls.some(([c]) => c === 'share' || c === 'install'));
    if (f.calls.some(([c]) => c === 'download')) assert.deepEqual(f.calls.at(-1), ['delete', target]);
    assert.deepEqual([...f.storage], [['course-progress', 'keep']]); count++;
  }
  const rejected = fixture({ installCode: -7 });
  await assert.rejects(rejected.download(release), /-7/);
  assert.deepEqual([...rejected.storage], [['course-progress', 'keep']]); count++;
  let resume;
  const wait = new Promise(resolve => { resume = resolve; });
  const f = fixture({ beforeDownload: () => wait });
  const first = f.download(release);
  await assert.rejects(f.download(release)); resume(); await first;
  assert.equal(f.calls.filter(([c]) => c === 'install').length, 1);
  console.log(`${count + 1} APK download/preflight/handoff cases passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
