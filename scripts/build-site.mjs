#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteSrc = path.join(root, 'site');
const distRoot = path.join(root, 'dist');
const siteOut = path.join(distRoot, 'site');
const appOut = path.join(siteOut, 'app');
const assetsOut = path.join(siteOut, 'assets');
const fontsOut = path.join(assetsOut, 'fonts');
const landingOnly = process.argv.includes('--landing-only');
const webBaseUrl = (process.env.EXPO_PUBLIC_WEB_BASE_URL || '/app').replace(/\/+$/, '') || '/app';

const SITE_ASSETS = [
  'milo-premium-mark.png',
  'favicon.png',
  'language-en-watercolor.jpg',
  'language-fr-watercolor.jpg',
  'language-de-watercolor.jpg',
  'language-es-watercolor.jpg',
  'language-tr-watercolor.jpg',
  'language-ar-watercolor.jpg',
];

const SITE_FONTS = [
  ['@expo-google-fonts/beiruti/500Medium/Beiruti_500Medium.ttf', 'Beiruti-Medium.ttf'],
  ['@expo-google-fonts/beiruti/700Bold/Beiruti_700Bold.ttf', 'Beiruti-Bold.ttf'],
  ['@expo-google-fonts/beiruti/900Black/Beiruti_900Black.ttf', 'Beiruti-Black.ttf'],
  ['@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf', 'Inter-Regular.ttf'],
  ['@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf', 'Inter-Bold.ttf'],
];

function copyDirContents(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirContents(from, to);
    else fs.copyFileSync(from, to);
  }
}

if (!landingOnly) {
  const tempAppDist = path.join(distRoot, '.tmp-site-app');
  fs.rmSync(tempAppDist, { recursive: true, force: true });

  const env = {
    ...process.env,
    EXPO_PUBLIC_MILO_ADMIN_APP: 'false',
    EXPO_PUBLIC_ENABLE_EDUCATION_ADMIN: 'false',
    EXPO_PUBLIC_LEARNER_LOGIN: 'false',
    EXPO_PUBLIC_LANGUAGE_SCOPE: 'en,fr,tr,es,de,ar',
    EXPO_PUBLIC_WEB_BASE_URL: webBaseUrl,
  };

  console.log(`Exporting web app with baseUrl=${webBaseUrl} ...`);
  const result = spawnSync(
    process.execPath,
    ['scripts/run-expo.mjs', 'export', '--platform', 'web', '--output-dir', tempAppDist, '--clear'],
    { cwd: root, env, stdio: 'inherit' },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  fs.rmSync(siteOut, { recursive: true, force: true });
  fs.mkdirSync(appOut, { recursive: true });
  copyDirContents(tempAppDist, appOut);
  fs.rmSync(tempAppDist, { recursive: true, force: true });
} else {
  fs.mkdirSync(siteOut, { recursive: true });
}

copyDirContents(siteSrc, siteOut);
fs.mkdirSync(assetsOut, { recursive: true });
for (const file of SITE_ASSETS) {
  const srcFile = path.join(root, 'assets', 'images', file);
  if (!fs.existsSync(srcFile)) {
    console.error(`Missing asset: ${srcFile}`);
    process.exit(1);
  }
  fs.copyFileSync(srcFile, path.join(assetsOut, file));
}

fs.mkdirSync(fontsOut, { recursive: true });
for (const [relSrc, destName] of SITE_FONTS) {
  const srcFont = path.join(root, 'node_modules', relSrc);
  if (!fs.existsSync(srcFont)) {
    console.error(`Missing font: ${srcFont}`);
    process.exit(1);
  }
  fs.copyFileSync(srcFont, path.join(fontsOut, destName));
}

console.log(`Built unified website at ${path.relative(root, siteOut)}`);
