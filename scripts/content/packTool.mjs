/**
 * Runner for the pack-factory TypeScript tools (validatePack.ts, genCoveragePacks.ts,
 * checkBandGrammarGate.ts) inside plain Node.
 *
 * The tools read the real course modules, whose chain reaches react-native (Platform in
 * createCourseProgressStore/packs), which cannot be parsed outside the app — the same problem the
 * other verifiers solve with esbuild stubs. Usage:
 *
 *   node scripts/content/packTool.mjs scripts/content/validatePack.ts content-packs/ru/pre.v9.json
 *   node scripts/content/packTool.mjs scripts/content/genCoveragePacks.ts --langs ru --bands pre
 *   node scripts/content/packTool.mjs scripts/content/checkBandGrammarGate.ts
 */
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const entry = process.argv[2];
if (!entry) { console.error('usage: node scripts/content/packTool.mjs <tool.ts> [args...]'); process.exit(2); }
const toolArgs = process.argv.slice(3);
const output = path.join(root, 'node_modules', '.cache', `pack-tool-${path.basename(entry, '.ts')}.cjs`);

await esbuild.build({
  stdin: { contents: `import './${path.relative(root, path.resolve(root, entry)).replaceAll('\\\\', '/')}';`, resolveDir: root },
  absWorkingDir: root,
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: output,
  logLevel: 'error',
  define: { __DEV__: 'false', 'process.env.NODE_ENV': '"production"' },
  // The factory only reads data, but the course module chain imports React Native modules that
  // cannot be parsed outside the app. Stub them exactly like the other verifiers do.
  plugins: [{
    name: 'pack-tool-platform-stubs',
    setup(build) {
      const STUB = 'const noop = async () => null;\n'
        + 'export const Platform = { OS: "web", select: (values) => values.web ?? values.default };\n'
        + 'export default { getItem: noop, setItem: noop, removeItem: noop };\n'
        + 'export const supabase = { auth: { getSession: noop }, from: () => ({ upsert: noop }) };\n'
        + 'export const createAudioPlayer = () => ({ play: noop, pause: noop, remove: noop, seekTo: noop, addListener: () => ({ remove: noop }) });\n'
        + 'export const setAudioModeAsync = noop;\n'
        + 'export const documentDirectory = null;\n'
        + 'export const readAsStringAsync = noop;\n'
        + 'export const writeAsStringAsync = noop;\n'
        + 'export const deleteAsync = noop;\n'
        + 'export const getInfoAsync = noop;\n'
        + 'export const makeDirectoryAsync = noop;\n';
      const namespace = 'pack-tool-platform-stub';
      build.onResolve({ filter: /^(react-native|expo|@expo|@react-native|@react-navigation|@react-native-async-storage)/ }, () => ({ path: 'platform', namespace }));
      build.onResolve({ filter: /^\.\/supabase$/ }, args =>
        (args.importer.endsWith('/lib/createCourseProgressStore.ts') ? { path: 'platform', namespace } : null));
      build.onLoad({ filter: /.*/, namespace }, () => ({ contents: STUB, loader: 'js' }));
    },
  }],
});

process.argv = [process.argv[0], path.resolve(root, entry), ...toolArgs];
createRequire(import.meta.url)(output);
