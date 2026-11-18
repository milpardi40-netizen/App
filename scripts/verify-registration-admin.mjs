import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
let count = 0;
const check = (value, message) => { assert.ok(value, message); count += 1; };

const gate = read('components/RegistrationGate.tsx');
// The login/registration UI lives in its own presentational component; the
// session logic stays in RegistrationGate, so form assertions read both.
const loginUi = read('components/LoginScreen.tsx');
const loginFlow = gate + loginUi;
const registration = read('lib/userRegistration.ts');
const layout = read('app/_layout.tsx');
const migration = read('supabase/migrations/202610140002_registered_users_admin.sql');
// The management panel was split into features/admin: routes are thin re-exports,
// so the UI assertions read the screen modules that actually render it.
const admin = [
  read('features/admin/Shell.tsx'),
  read('features/admin/api.ts'),
  read('features/admin/store.tsx'),
  read('features/admin/screens/Dashboard.tsx'),
  read('features/admin/screens/Users.tsx'),
].join('\n');
const adminUsers = read('features/admin/screens/Users.tsx');
const adminApi = read('lib/educationAdmin.ts');
const appConfig = read('app.config.js');
const workflow = read('.github/workflows/android-build.yml');

check(/<RegistrationGate>/.test(layout), 'learner routes are protected by the registration gate');
check(/signInWithOtp\(/.test(registration) && /verifyOtp\(/.test(registration) && /shouldCreateUser/.test(registration), 'login and registration request and verify real Supabase email OTPs');
check(/full_name/.test(registration) && /completeLearnerProfile/.test(gate), 'registration captures the learner name and repairs older incomplete profiles');
check(/routeToLanguageSelection/.test(gate) && /writeResumeSnapshot\(\{ version: 1, href: '\/languages'/.test(gate)
  && /router\.replace\('\/languages'/.test(gate) && !/PLACEMENT_ENTRY_KEY|AssessmentEntry/.test(gate), 'OTP completion sends learners to language selection without an assessment gate');
check(/requestLearnerOtp/.test(gate) && /verifyLearnerOtp/.test(gate) && /onResend/.test(loginFlow), 'the gate separates OTP request, verification, and resend');
check(!/generateLoginCode|signInWithPassword|toAuthPassword/.test(registration + gate), 'the learner gate no longer invents local codes or uses password login');
check(/color: '#26382D'/.test(loginFlow) && /backgroundColor: '#FBF8F1'/.test(loginFlow)
  && /borderColor: '#D9D1C2'/.test(loginFlow) && /placeholderTextColor="#81796D"/.test(loginFlow), 'email and OTP fields use high-contrast warm text, fill, border and placeholder colors');
check(/KeyboardAvoidingView/.test(loginFlow) && /KeyboardAwareScrollView/.test(loginFlow)
  && /bottomOffset=\{24\}/.test(loginFlow), 'auth screens follow and scroll above the keyboard');
check(/LearnerOtpType = 'email'/.test(registration) && /email_change/.test(registration)
  && /rate limit/.test(registration), 'the learner flow verifies email OTPs, preserves anonymous upgrades and handles Supabase send limits');
check(/app_user_profiles/.test(migration) && /ENABLE ROW LEVEL SECURITY/.test(migration), 'registered profiles are protected by RLS');
check(/user_id = auth\.uid\(\)/.test(migration), 'learners can only access their own profile');
check(/admin_registered_users/.test(migration) && /is_education_admin/.test(migration), 'the registered-user directory verifies server-side manager authorization');
check(/education_admins_single_owner_idx/.test(migration), 'the database enforces one operational manager');
check(/کاربران ثبت‌شده/.test(read('features/admin/screens/Dashboard.tsx')) && /fetchUsers/.test(admin) && /حساب ثبت‌شده/.test(adminUsers), 'the management UI lists registered learners');
check(/wide && \(/.test(admin) && /s\.sidebar/.test(admin) && /bottomNav/.test(admin) && /navTextActive/.test(admin), 'the management UI keeps a sidebar on wide screens and its phone navigation bar');
check(!/flexDirection:\s*'column'\s*}\]}[^\n]*sidebar/.test(admin), 'the management navigation does not collapse into top tabs');
check(/sidebar: \{ width: 250/.test(admin) && /bottomText: \{ fontFamily: T\.font\.fa, fontSize: 10/.test(admin) && /size: \{ xs: 11, sm: 12, md: 14/.test(read('features/admin/theme.ts')), 'the management shell keeps a compact density and small Beiruti type');
check(/admin_users_overview/.test(read('features/admin/api.ts')) && /CREATE FUNCTION public\.admin_users_overview/.test(read('supabase/migrations/202611130001_admin_panel_v2.sql')), 'the management client loads the protected directory RPC');
check(/com\.devicecontrol\.miloadmin/.test(appConfig) && /com\.devicecontrol\.companion/.test(read('app.json')), 'learner and management APKs have separate Android package IDs');
check(/MiloAdmin\.apk/.test(workflow) && /MiloMultilang\.apk/.test(workflow), 'CI builds and publishes both standalone APKs');
check(/EXPO_PUBLIC_MILO_ADMIN_APP/.test(read('app/index.tsx')), 'the management APK boots directly into its protected panel');
check(/پیام‌های خصوصی/.test(loginFlow) && /registered_at/.test(adminUsers) && /last_seen_at/.test(adminUsers) && !/message_body|last_message_preview/.test(adminUsers), 'the learner gate discloses private-message boundaries and the learner directory stays account/activity-only');
check(/learnerLogin: process\.env\.EXPO_PUBLIC_LEARNER_LOGIN === 'true'/.test(read('lib/features.ts'))
  && /IS_ADMIN_APP \|\| !FEATURES\.learnerLogin/.test(gate)
  && /if \(BYPASS_GATE\) return;/.test(gate), 'the gate is skipped unless learner login is explicitly enabled, without changing admin authorization');
check(/learner_login:[\s\S]*?default: false/.test(workflow)
  && /github\.event_name == 'workflow_dispatch' && inputs\.learner_login/.test(workflow)
  && /EXPO_PUBLIC_LEARNER_LOGIN=true/.test(workflow), 'CI builds an optional learner login APK only when manually requested');
check(/ProfileEnabledScreen local=\{!FEATURES\.learnerLogin\}/.test(read('app/profile.tsx'))
  && !/personal-sync/.test(read('app/lang/index.tsx'))
  && /if \(!FEATURES\.learnerLogin\) return <Redirect href=\{'\/languages'/.test(read('app/personal-sync.tsx')), 'open builds show the device-local profile and redirect direct account links');
check(Object.values(JSON.parse(read('eas.json')).build).every(profile => profile.env.EXPO_PUBLIC_LEARNER_LOGIN === 'false')
  && /EXPO_PUBLIC_LEARNER_LOGIN=false/.test(read('.env.example')), 'all EAS profiles and the documented example default to no learner login');
check(/learner_login:[\s\S]*?default: false/.test(read('.github/workflows/apk-requested.yml'))
  && /github\.event_name == 'push' \|\| inputs\.learner_login/.test(read('.github/workflows/apk-requested.yml'))
  && /EXPO_PUBLIC_LEARNER_LOGIN: 'false'/.test(read('.github/workflows/apk-learner.yml'))
  && /EXPO_PUBLIC_LEARNER_LOGIN: 'false'/.test(read('.github/workflows/deploy.yml')), 'ordinary APK and web CI builds are open and the alternate login job is opt-in');
const appConfigJs = read('app.config.js');
check(/com\.devicecontrol\.milomultilang/.test(appConfigJs) && /name: 'Admin App'/.test(appConfigJs) && /com\.devicecontrol\.miloadmin/.test(appConfigJs), 'login APK keeps its own package and the management build keeps its own isolated package and branding');
check(/is_education_admin/.test(read('supabase/functions/admin-delete-user/index.ts')) && /deleteUser\(/.test(read('supabase/functions/admin-delete-user/index.ts')), 'account deletion is manager-only and runs on the server');
check(/deleteRegisteredUser/.test(read('features/admin/api.ts')) && /downloadRegisteredUsers/.test(adminUsers), 'manager app can delete users and export users');
check(/MANAGEMENT_BUILD \? adminClient\(\) : supabase/.test(read('lib/conversations.ts')), 'the manager APK sends chat as the manager, not an anonymous learner');
check(/Intentionally silent/.test(read('lib/responsiveSpeech.ts')) && !/Speech\.speak\(locale/.test(read('lib/responsiveSpeech.ts')), 'startup warm-up never speaks words aloud');
check(/welcome-chime\.wav/.test(read('app/_layout.tsx')), 'the original startup sound is kept');
check(/ensureSupportConversation/.test(read('app/feedback.tsx')) && /ensureSupportConversation/.test(read('features/chat/screens/ConversationsHome.tsx')), 'learners reach the manager through the support button');
check(/MiloLogoMotion/.test(read('app/_layout.tsx')) && /MiloLanguageBrand/.test(read('app/languages.tsx')) && /Milo/.test(read('components/MiloLanguageBrand.tsx')), 'startup branding remains while the language home uses the selected Milo wordmark');
check(/welcome-voice\.wav/.test(read('app/languages.tsx')) && /welcome-chime\.wav/.test(read('app/_layout.tsx')), 'Welcome plays on the main screen and the startup sound is kept');
console.log(`${count} registration and private management checks passed.`);
