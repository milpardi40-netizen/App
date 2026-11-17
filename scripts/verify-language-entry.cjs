const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks += 1; };

const languageScreen = read('app/languages.tsx');
const englishHome = read('app/lang/index.tsx');
const catalog = read('lib/languages/catalog.ts');
const registry = read('lib/languages/registry.ts');
const gate = read('components/RegistrationGate.tsx');
const auth = read('lib/userRegistration.ts');
const resume = read('lib/appResume.ts');
const workflowFiles = [
  '.github/workflows/deploy.yml',
  '.github/workflows/apk-learner.yml',
  '.github/workflows/android-build.yml',
];

check(/onPress=\{\(\) => router\.push\(language\.home as never\)\}/.test(languageScreen), 'language cards navigate directly to their existing home route');
check(/home: '\/lang'/.test(registry) && /home: '\/learn\/ru'/.test(registry), 'English and Russian cards keep the original course destinations');
check(/LANGUAGE_REGISTRY\.map/.test(catalog) && !/id: 'ru'/.test(catalog), 'the catalog is generated from the single language registry instead of hard-coded entries');
check(/زبان را از زندگی یاد بگیر/.test(languageScreen) && /کوتاه، شنیدنی، ماندگار/.test(languageScreen), 'language chooser follows the approved warm-journal copy');
check(/MiloLanguageBrand/.test(languageScreen) && !/MiloLogoMotion/.test(languageScreen) && />Milo</.test(read('components/MiloLanguageBrand.tsx')) && />multilanguage</.test(read('components/MiloLanguageBrand.tsx')) && /Typography\.latinFontFamily/.test(read('components/MiloLanguageBrand.tsx')) && /latinFontFamily:[^\n]*Times New Roman/.test(read('lib/theme.ts')), 'language chooser uses the shared Times-style Milo multilanguage wordmark');
check(/languages\.find\(language => language\.id === id\)/.test(languageScreen) && /renderCard/.test(languageScreen) && /styles\.languageCard/.test(languageScreen) && /languageList: \{ flexDirection: Platform\.OS === 'web' \? 'row'/.test(languageScreen), 'language choices remain catalog-driven cards in one selection row');
check(/learningSteps\.map/.test(languageScreen) && /styles\.stepRow/.test(languageScreen), 'language chooser contains the selected step-by-step path');
check(!/\/placement|PlacementLanguage|PlacementRecommendation|سنجش همان لحظه|شروع پرسش‌های سنجش/.test(languageScreen), 'language chooser contains no assessment route, bank, or CTA');
check(/PlacementCard courseId=\{'en'\} href=\{\'\/learn\/en\/placement\'\}/.test(englishHome)
  && fs.existsSync(path.join(root, 'app/learn/[language]/placement.tsx')), 'English home offers only the per-course starting-point card, not the removed selection quiz');
check(!fs.existsSync(path.join(root, 'app/placement.tsx'))
  && !fs.existsSync(path.join(root, 'lib/placementProfile.ts'))
  && !fs.existsSync(path.join(root, 'scripts/verify-placement.cjs'))
  && fs.existsSync(path.join(root, 'lib/placement.ts')), 'the removed selection-quiz screen, profile logic, and its former test stay gone');
check(/routeToLanguageSelection/.test(gate) && /router\.replace\('\/languages'/.test(gate)
  && !/PLACEMENT|AssessmentEntry/.test(gate), 'successful OTP login still proceeds to language selection without an assessment marker');
check(/signInWithOtp\(/.test(auth) && /verifyOtp\(/.test(auth), 'Supabase email OTP request and verification remain enabled');
check(!/placement/.test(resume), 'resume routing no longer recognizes an assessment route');
for (const file of workflowFiles) {
  check(/npm run validate:language-entry/.test(read(file)), `${file} verifies the new language-entry behavior`);
  check(!/npm run validate:placement/.test(read(file)), `${file} no longer runs the removed quiz test`);
}

console.log(`${checks} language-entry removal and OTP-preservation checks passed.`);

// Keep web course availability and explicitly scoped builds covered in CI.
require('./verify-language-scope.cjs');

// Single-entry language configuration: the registry is the only place a language is declared.
require('./verify-language-registry.cjs');
