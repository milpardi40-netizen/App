"""Fail closed before the Russian release. Verify the packaged artifact, not app.json."""
import importlib.util
import os
from pathlib import Path
import re
import subprocess

spec = importlib.util.spec_from_file_location('apk_checks', Path(__file__).with_name('verify-apk-upgrades.py'))
checks = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checks)
file = Path('MiloRussian.apk')
package = 'com.devicecontrol.milorussian'
code = int(os.environ['MILO_VERSION_CODE'])
sdk, abis, certs = checks.inspect(file, package, code)
checks.require(sdk == 24 and set(abis) == {'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'}, 'Unexpected minSdk or missing legacy architecture')
checks.require(certs == ['fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c'], 'Release signature changed; do not publish')
tools = Path(os.environ['ANDROID_HOME']) / 'build-tools/36.0.0'
checks.output(tools/'zipalign', '-c', '-P', '16', '4', file)
permissions = checks.output(tools/'aapt', 'dump', 'permissions', file)
checks.require('android.permission.RECORD_AUDIO' in permissions, 'Microphone permission missing from packaged app')
previous = os.environ.get('PREVIOUS_RUSSIAN_TAG', '')
if previous:
    checks.require(re.fullmatch('milo-russian-[0-9]+', previous), 'Invalid previous Russian release')
    subprocess.run(['gh','release','download',previous,'--pattern',file.name,'--dir','previous-ru'], check=True)
    old = Path('previous-ru') / file
    manifest = checks.output(tools/'aapt', 'dump', 'badging', old)
    header = manifest.splitlines()[0]
    checks.require(f"name='{package}'" in header and int(re.search("versionCode='(\\d+)'", header)[1]) < code, 'Not an upgrade of the previous Russian APK')
    report = checks.output(tools/'apksigner','verify','--print-certs',old)
    checks.require(re.findall(r'^Signer #\d+ certificate SHA-256 digest: ([\da-f]{64})$', report, re.M) == certs, 'Previous Russian APK had a different signer')
sha = checks.digest(file)
Path('MiloRussian.apk.sha256').write_text(f'{sha}  {file.name}\n')
Path('russian-release.md').write_text(f'''فقط نسخهٔ مستقل روسی · **1.0.{code}** (Android versionCode {code})

Pre-A1: ۱۷ گام شنیدن و خواندن تدریجی. A1: ۴۹ موقعیت روزمره با دو نقش و هشت نوبت مرتبط.
اتاق مکالمه: بعد از آزمون گفتاری هر درس، نقش خودت را در موقعیت همان درس بازی کن و پاسخ هم‌صحبت را بشنو.
اتاق مستقل افعال: فعل و کاربردش در جمله را از راوی بشنو، تکرار کن و در پایان تفاوت‌ها را مرور کن. هر دو اتاق از پایین خانهٔ روسی در دسترس‌اند.

Android package: `{package}` · بدون ورود · Android 7+ · ARM و x86 (۳۲ و ۶۴ بیت)

این فایل جایگزین نسخهٔ دوزبانه یا پنج‌زبانه نیست. برای نصب، برنامهٔ قبلی را حذف نکنید.

`MiloRussian.apk` · {file.stat().st_size:,} bytes · SHA-256: `{sha}`
''')
