#!/usr/bin/env bash
set -euo pipefail
pkg=com.devicecontrol.milorussian
adb shell input keyevent 82
if [[ -f previous-ru/MiloRussian.apk ]]; then
  adb install --no-streaming previous-ru/MiloRussian.apk
  adb root
  adb wait-for-device
  adb shell "echo russian > /data/user/0/$pkg/.ru-upgrade-marker"
  adb install --no-streaming -r MiloRussian.apk
  [[ $(adb shell cat "/data/user/0/$pkg/.ru-upgrade-marker" | tr -d '\r') == russian ]]
  echo 'Replacement from the previous dedicated Russian APK kept app-private data.' >> russian-release.md
else
  adb install --no-streaming MiloRussian.apk
  echo 'Fresh install tested; no previous dedicated Russian release was available for replacement testing.' >> russian-release.md
fi
# Boot the exact signed standalone APK and wait for a rendered learner view, not merely a live PID.
adb shell am start -W -n "$pkg/.MainActivity"
for i in {1..30}; do
  if adb shell uiautomator dump /sdcard/ru-window.xml >/dev/null 2>&1 && adb shell cat /sdcard/ru-window.xml | grep -E 'روسی|Русский|انتخاب زبان|زبان را از زندگی یاد بگیر' >/dev/null; then
    echo 'Verified standalone learner launch on an API 30 emulator.' >> russian-release.md
    python3 .github/scripts/smoke-russian-studio.py
    exit 0
  fi
  sleep 2
done
adb logcat -d -t 300 ReactNativeJS:E AndroidRuntime:E '*:S'
echo '::error::Russian learner screen did not render on Android.'
exit 1
