#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const esbuild = require('esbuild');
const React = require('react');
const { act, create } = require('react-test-renderer');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let checks = 0;
const check = (value, message) => { assert.ok(value, message); checks++; };
const equal = (value, expected, message) => { assert.deepEqual(value, expected, message); checks++; };
const read = path => fs.readFileSync(path, 'utf8');
const navigation = [];
globalThis.__guideScope = ['en', 'ru', 'tr', 'de', 'fr', 'es', 'ar'];
globalThis.__guideRouter = { push: href => navigation.push(href), replace: href => navigation.push(href), back: () => navigation.push('back'), canGoBack: () => globalThis.__canGoBack };
globalThis.__guideStorage = new Map();
globalThis.__guidePath = '/help';
globalThis.__guideAppState = { currentState: 'active', addEventListener: (_, callback) => { globalThis.__guideStateChange = callback; return { remove() {} }; } };
globalThis.__guideNavigation = { isReady: () => true };
const mocks = {
  'react-native': `export const View='View',Text='Text',Pressable='Pressable',ScrollView='ScrollView',TextInput='TextInput',ActivityIndicator='ActivityIndicator';export const StyleSheet={create:x=>x,absoluteFillObject:{}};export const Platform={OS:'android'};export const AppState=globalThis.__guideAppState;`,
  'expo-router': `export const useRouter=()=>globalThis.__guideRouter,usePathname=()=>globalThis.__guidePath,useGlobalSearchParams=()=>globalThis.__guideParams||{},useNavigationContainerRef=()=>globalThis.__guideNavigation;`,
  '@/components/LocalizedText': `export const LocalizedText='Text';`,
  '@/lib/theme': `export const Typography={fontFamily:'Test'};`,
  '@/lib/features': `export const FEATURES={learnerLogin:false,openLearnerAccount:false};export const LANGUAGE_SCOPE=globalThis.__guideScope;export const MANAGEMENT_BUILD=false,RUSSIAN_ONLY_BUILD=false;export const outsideRussianScope=()=>false;`,
  'lucide-react-native': `export const ArrowLeft='ArrowLeft',ArrowRight='ArrowRight',BookOpen='BookOpen',Check='Check',ChevronDown='ChevronDown',CircleHelp='CircleHelp',Search='Search',X='X';`,
  '@react-native-async-storage/async-storage': `export default {getItem:async key=>globalThis.__guideStorage.get(key)??null,setItem:async(key,value)=>globalThis.__guideStorage.set(key,value)};`,
};
async function bundle(contents) {
  const result = await esbuild.build({ stdin: { contents, resolveDir: process.cwd() }, bundle: true, platform: 'node', format: 'cjs', write: false, jsx: 'automatic', external: ['react', 'react/jsx-runtime'], plugins: [{ name: 'guide-mocks', setup(build) {
    build.onResolve({ filter: /.*/ }, args => mocks[args.path] ? { path: args.path, namespace: 'mock' } : undefined);
    build.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ contents: mocks[args.path], loader: 'js' }));
  } }] });
  const m = { exports: {} };
  new Function('module', 'exports', 'require', result.outputFiles[0].text)(m, m.exports, require);
  return m.exports;
}
function routeExists(href) {
  const path = href.split('?')[0].replace(/^\//, '');
  return [`app/${path}.tsx`, `app/${path}/index.tsx`, `app/${path.replace(/^learn\/[^/]+/, 'learn/[language]')}.tsx`, `app/${path.replace(/^learn\/[^/]+/, 'learn/[language]')}/index.tsx`].some(fs.existsSync);
}
(async () => {
  const api = await bundle(`export * from './lib/appGuide';export * from './lib/languages/registry';export {default as Help} from './app/help';export {AppResumeGuard} from './components/AppResumeGuard';`);
  for (const language of api.LANGUAGE_IDS) for (const mode of ['local', 'device', 'login']) {
    const sections = api.guideSections(language, mode);
    equal(sections.length, 10, `${language}/${mode}: all topics covered`);
    equal(new Set(sections.map(item => item.id)).size, sections.length, 'stable unique section ids');
    check(sections.every(item => item.steps.length >= 3 && item.summary && item.title), 'actionable instructions, not headings only');
    for (const action of sections.flatMap(item => item.actions)) check(routeExists(action.href), `${language}: working route ${action.href}`);
    const toolActions = sections.find(item => item.id === 'tools').actions;
    equal(toolActions.some(item => item.href.includes('podcast')), language === 'en', 'podcast is English-only');
    equal(toolActions.some(item => item.href.includes('vocabulary')), ['en', 'de', 'ru', 'ar'].includes(language), 'word tools only where actually shipped');
    if (language !== 'en') check(!toolActions.some(item => item.href.startsWith('/lang')), 'no out-of-language English shortcut');
    equal(api.searchGuide(sections, '   ').length, 10, 'empty search returns all');
    check(api.searchGuide(sections, 'ميكروفون').some(item => item.id === 'speaking'), 'Arabic yeh normalized in Persian search');
    check(api.searchGuide(sections, 'يادآور').some(item => item.id === 'reminder'), 'reminder search normalized');
    equal(api.searchGuide(sections, 'zzzz-no-match').length, 0, 'search empty state');
    check(sections.find(item => item.id === 'data').steps.join(' ').includes('پشتیبان کامل'), 'backup limitation explained');
  }
  const sections = api.guideSections('en', 'local');
  equal(api.normalizeGuideSearch('  ميکروفون\u200c  كد '), 'میکروفون کد', 'normalization handles Arabic letters/zero-width spacing');
  equal(api.searchGuide(sections, 'قفل برنامه').some(item => item.id === 'settings'), true, 'multiword search');
  let tree;
  await act(async () => { tree = create(React.createElement(api.Help)); });
  const buttons = () => tree.root.findAllByType('Pressable');
  const byLabel = label => buttons().find(item => item.props.accessibilityLabel === label);
  const text = node => node.children.map(child => typeof child === 'string' ? child : text(child)).join('');
  const byText = label => buttons().find(item => text(item) === label);
  equal(buttons().filter(item => item.props.accessibilityState?.expanded).length, 1, 'first topic starts open');
  await act(async () => { byLabel('میکروفون و تمرین گفتاری').props.onPress(); });
  check(byLabel('میکروفون و تمرین گفتاری').props.accessibilityState.expanded, 'accordion opens');
  equal(byLabel('میکروفون و تمرین گفتاری').props['aria-expanded'], true, 'accordion state exposed to web screen readers');
  await act(async () => { byText('بازکردن همه').props.onPress(); });
  equal(buttons().filter(item => item.props.accessibilityState?.expanded).length, 10, 'expand all');
  await act(async () => { byText('بستن همه').props.onPress(); });
  equal(buttons().filter(item => item.props.accessibilityState?.expanded).length, 0, 'collapse all');
  const input = tree.root.findByType('TextInput');
  await act(async () => { input.props.onChangeText('ميكروفون'); });
  check(buttons().filter(item => item.props.accessibilityState?.expanded).length > 0, 'search automatically exposes matching instructions');
  await act(async () => { input.props.onChangeText('zzzz-no-match'); });
  check(tree.root.findAllByType('Text').some(item => text(item) === 'چیزی پیدا نشد'), 'friendly empty state');
  await act(async () => { byLabel('پاک‌کردن جست‌وجو').props.onPress(); });
  equal(tree.root.findByType('TextInput').props.value, '', 'clear search');
  await act(async () => { byLabel('راهنمای روسی').props.onPress(); });
  check(byLabel('راهنمای روسی').props.accessibilityState.selected, 'language selection accessible');
  equal(byLabel('راهنمای روسی').props['aria-pressed'], true, 'language selection exposed to web screen readers');
  await act(async () => { byLabel('از کجا شروع کنم؟').props.onPress(); });
  await act(async () => { byText('ورود به دورهٔ روسی').props.onPress(); });
  equal(navigation.pop(), '/learn/ru', 'shortcut follows selected language');
  await act(async () => { byLabel('بازگشت از راهنما').props.onPress(); });
  equal(navigation.pop(), '/languages', 'direct-entry back falls back to home');
  globalThis.__canGoBack = true;
  await act(async () => { byLabel('بازگشت از راهنما').props.onPress(); });
  equal(navigation.pop(), 'back', 'normal back preserves stack');
  await act(async () => { tree.unmount(); });
  globalThis.__guideScope = ['ru'];
  const scopedApi = await bundle(`export {default as Help} from './app/help';`);
  await act(async () => { tree = create(React.createElement(scopedApi.Help)); });
  equal(buttons().filter(item => item.props.accessibilityLabel?.startsWith('راهنمای ')).length, 1, 'restricted builds show only enabled language');
  check(!buttons().some(item => text(item).includes('پادکست انگلیسی')), 'Russian-only help does not link English-only tools');
  await act(async () => { tree.unmount(); });

  // Actual resume guard + actual resume parser: public guide must not redirect or erase a saved lesson.
  const saved = { version: 1, href: '/learn/de/lesson?id=de-sample', language: 'de', backgroundAt: Date.now() - 2 * 86400000, updatedAt: Date.now() - 2 * 86400000 };
  globalThis.__guideStorage.set('milo_navigation_resume_v1', JSON.stringify(saved));
  navigation.length = 0;
  await act(async () => { tree = create(React.createElement(api.AppResumeGuard)); });
  equal(navigation.length, 0, 'cold entry into help not redirected by stale resume snapshot');
  equal(JSON.parse(globalThis.__guideStorage.get('milo_navigation_resume_v1')).href, saved.href, 'guide does not overwrite saved lesson destination');
  equal(tree.toJSON(), null, 'guide not hidden behind resume overlay');
  await act(async () => { globalThis.__guideStateChange('background'); });
  await act(async () => { globalThis.__guideStateChange('active'); });
  equal(navigation.length, 0, 'background/resume keeps guide visible');
  equal(JSON.parse(globalThis.__guideStorage.get('milo_navigation_resume_v1')).href, saved.href, 'backgrounding guide retains lesson destination');
  await act(async () => { tree.unmount(); });
  const home = read('app/languages.tsx');
  const helpLabel = home.indexOf('accessibilityLabel="راهنمای استفاده از اپ"');
  const helpButton = home.slice(home.lastIndexOf('<Pressable', helpLabel), home.indexOf('</Pressable>', helpLabel));
  check(helpButton.includes("router.push('/help'") && !helpButton.includes('disabled'), 'home help entry is never registration-gated');
  const originalHeader = JSON.parse(read('scripts/fixtures/home-header-before-guide.json'));
  const currentHeader = home.slice(home.indexOf('          <View style={[styles.header,'), home.indexOf('\n\n          <ImageBackground'));
  equal(currentHeader, originalHeader.header, 'original released header restored byte-for-byte: same three actions, order and logo');
  for (const line of originalHeader.styles) check(home.includes(line), 'original header layout/style unchanged: ' + line.split(':')[0].trim());
  check(helpLabel > home.indexOf('</ImageBackground>') && !currentHeader.includes("'/help'"), 'guide placed below hero, outside restored header');
  check(!home.includes('headerStacked') && !home.includes('headerActionsStacked'), 'no guide-induced mobile header stacking');
  check(read('components/RegistrationGate.tsx').includes("pathname === '/help' || BYPASS_GATE || ready"), 'only read-only help is public in login builds');
  check(!read('app/help.tsx').includes('AsyncStorage') && !read('lib/appGuide.ts').includes('AsyncStorage'), 'reading help writes no learning/preferences data');
  check(!read('app/help.tsx').includes('fetch(') && !read('lib/appGuide.ts').includes('fetch('), 'help itself requires no network');
  console.log(`App guide: ${checks} content, route, scope, search, interaction and resume checks passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
