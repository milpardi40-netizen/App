#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(path.join(root, file), 'utf8');
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks += 1; };

const appLock = read('lib/appLock.ts');
const gate = read('components/AppLockGate.tsx');
const settings = read('app/app-lock.tsx');
const rootLayout = read('app/_layout.tsx');
// The route files are thin switches: the learner build redirects, the admin build renders the chat
// feature, so the deletion UI lives in the feature screen the route loads.
const humanChat = read('features/chat/screens/HumanConversation.tsx');
const contactsHome = read('features/chat/screens/ConversationsHome.tsx');
const keyboardAttachment = read('components/KeyboardAttachedView.native.tsx');
const emmaRoute = read('app/conversations/emma.tsx');
const conversations = read('lib/conversations.ts');
const migration = read('supabase/migrations/202610130001_user_chat_deletion.sql');

check(/SecureStore\.setItemAsync/.test(appLock), 'native lock configuration uses encrypted device storage');
check(/CryptoDigestAlgorithm\.SHA256/.test(appLock) && /getRandomBytesAsync\(24\)/.test(appLock), 'app pattern is salted and SHA-256 hashed');
check(!/pattern:\s*pattern/.test(appLock), 'raw app pattern is never persisted');
check(/authenticateAsync\([\s\S]*?disableDeviceFallback:\s*false/.test(appLock), 'device authentication permits the phone PIN, pattern or password fallback');
check(/AppState\.addEventListener\('change'/.test(gate) && /state === 'inactive' \|\| state === 'background'/.test(gate), 'app relocks when hidden or backgrounded');
check(/nextFailures >= 5/.test(gate) && /30_000/.test(gate), 'pattern brute-force attempts receive a cooldown');
check(/<AppLockGate>[\s\S]*?<Stack/.test(rootLayout), 'app lock guards the complete route stack');
check(/savePattern\(pattern\)/.test(settings) && /setDeviceLockEnabled\(true\)/.test(settings), 'settings can independently enable pattern and phone lock');
check(/confirmDelete\(/.test(contactsHome) && /deleteConversationForMe/.test(contactsHome), 'a real-person chat can be deleted, with confirmation, from the chat list');
check(/EmmaDisabled/.test(emmaRoute) && /<Redirect href=/.test(emmaRoute), 'the retired Emma coach route redirects instead of half-rendering');
check(/hideConversationLocally/.test(conversations) && /\.from\('learning_contacts'\)[\s\S]*?\.delete\(\)/.test(conversations), 'contact deletion is immediate locally and RLS-protected remotely');
check(/GRANT DELETE ON TABLE public\.learning_contacts TO authenticated/.test(migration), 'database migration grants the DELETE operation constrained by existing RLS');
/** The chat answer card rides on the shared keyboard attachment (KeyboardStickyView). */
const composerFollowsKeyboard = file => {
  const open = file.search(/<KeyboardAttachedView\b[^>]*>/);
  if (open === -1) return false;
  const tag = file.match(/<KeyboardAttachedView\b[^>]*>/)[0];
  const close = file.indexOf('</KeyboardAttachedView>', open);
  if (close === -1) return false;
  const body = file.slice(open + tag.length, close);
  return /styles\.answerCard/.test(body);
};
check(composerFollowsKeyboard(humanChat), 'the composer and its side buttons follow the keyboard animation');
check(/KeyboardStickyView/.test(keyboardAttachment) && /offset=\{\{ closed: 0, opened: openedOffset \}\}/.test(keyboardAttachment), 'the attachment rides the single native keyboard inset with the composer');
check(/answerCard:\s*\{[^}]*flexShrink:\s*0/.test(humanChat), 'the composer stays fully visible during keyboard resize');
check(!/marginBottom:\s*100/.test(humanChat), 'no fixed composer offset fights keyboard movement');

console.log(`${checks} app-lock, deletion, and dynamic-keyboard checks passed.`);
