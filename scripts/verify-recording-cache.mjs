// Exercise the native pack player without a network, speaker or device filesystem.
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const files = new Map();
let response = { status: 404, body: 'Not Found' };
let downloads = 0, plays = 0;
globalThis.mockFs = {
  cacheDirectory: 'cache/', EncodingType: { Base64: 'base64' },
  makeDirectoryAsync: async () => {},
  getInfoAsync: async uri => ({ exists: files.has(uri), size: files.get(uri)?.length }),
  readAsStringAsync: async uri => Buffer.from(files.get(uri).slice(0, 3), 'latin1').toString('base64'),
  deleteAsync: async uri => files.delete(uri),
  downloadAsync: async (_, uri) => { downloads++; files.set(uri, response.body); return { uri, status: response.status }; },
  moveAsync: async ({ from, to }) => { files.set(to, files.get(from)); files.delete(from); },
};
globalThis.mockPlayer = { isLoaded: true, seekTo: async () => {}, play: () => plays++, pause() {}, remove() {} };
const modules = {
  'expo-file-system/legacy': 'module.exports = globalThis.mockFs',
  'react-native': "export const Platform = { OS: 'android' }",
  'expo-audio': 'export const createAudioPlayer = () => globalThis.mockPlayer',
};
const bundle = await build({ entryPoints: ['lib/content/packAudio.ts'], bundle: true, write: false, format: 'esm', plugins: [{
  name: 'device-stubs', setup(b) {
    b.onResolve({ filter: /.*/ }, ({ path }) => path in modules ? { path, namespace: 'stub' } : undefined);
    b.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({ contents: modules[path] }));
  },
}] });
const { registerPackAudio, tryPlayRecorded, stopRecorded } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
registerPackAudio('Hallo', 'milo-segment:de-A1.mp3?start=0&dur=1698');
files.set('cache/milo-audio/de-A1.mp3', 'Not Found'); // stale cache from the old app
assert.equal(await tryPlayRecorded('Hallo'), false);
assert.equal(files.size, 0);
response.status = 200; // a proxy error page is not an MP3 either
assert.equal(await tryPlayRecorded('Hallo'), false);
assert.equal(plays, 0);
for (const body of ['ID3audio', '\xff\xfbaudio']) {
  files.clear(); // OS eviction must not leave a stale path in memory
  response.body = body;
  const before = downloads;
  assert.equal(await tryPlayRecorded('Hallo'), true);
  assert.equal(await tryPlayRecorded('Hallo'), true);
  assert.equal(downloads, before + 1);
}
stopRecorded();
console.log('Recording cache: 404, legacy error page, retry, offline replay and eviction passed.');
