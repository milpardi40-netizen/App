"""Exercise the packaged native views on the disposable API 30 AVD, without a speech account."""
from pathlib import Path
import re
import subprocess
import sys
import time
import unicodedata
import xml.etree.ElementTree as ET

PKG = 'com.devicecontrol.milorussian'

def annotation(level, text):
    message = str(text).replace('%', '%25').replace('\n', '%0A').replace('\r', '%0D')
    print(f'::{level} title=Russian native learner journey::{message}', flush=True)

def report(exc, value, tb):
    annotation('error', str(value)[:2800])
    sys.__excepthook__(exc, value, tb)
sys.excepthook = report

def adb(*args):
    return subprocess.check_output(['adb', *args], text=True, timeout=30).strip()

def shell(*args):
    return adb('shell', *args)

shell('wm','size','720x1600')
shell('wm','density','220')
w, h = map(int, re.findall(r'(\d+)x(\d+)', shell('wm', 'size'))[-1])

def clean(s):
    return ' '.join(''.join(c for c in unicodedata.normalize('NFC',s) if c != '\u0301' and unicodedata.category(c) != 'Cf').split())

def locate(label, *, tap=False, deny_dialog=False):
    # Accessibility tree (not screen pixels or assumptions about the OEM font size).
    # Search in both directions because a screen can keep its offset across a turn.
    targets = [clean(s) for s in ((label,) if isinstance(label,str) else label)]
    visible = []
    for attempt in range(14):
        try:
            shell('uiautomator', 'dump', '/sdcard/ru-studio.xml')
            root = ET.fromstring(adb('exec-out','cat','/sdcard/ru-studio.xml'))
            visible = []
            for node in root.iter('node'):
                texts = [clean(node.get(k,'')) for k in ('text','content-desc')]
                visible.extend(t for t in texts if t)
                deny = deny_dialog and re.search(r':id/permission_deny(?:_and_dont_ask_again)?_button$',node.get('resource-id',''))
                if not deny and not any((target == t if tap else target in t) for target in targets for t in texts):
                    continue
                bounds = list(map(int, re.findall(r'-?\d+',node.get('bounds',''))))
                if len(bounds) != 4: continue
                x1,y1,x2,y2 = bounds
                if not (x2>x1 and min(y2,h)>max(y1,0)): continue
                if tap or deny:
                    shell('input','tap',str((x1+x2)//2),str((max(0,y1)+min(y2,h))//2))
                if deny:
                    break  # let the OS finish closing its permission prompt and inspect the app again
                annotation('notice', ('Tapped' if tap else 'Rendered')+': '+str(next(t for t in texts if any(target in t for target in targets))))
                return
        except (ET.ParseError, subprocess.SubprocessError):
            pass  # first dump can race a permission view or navigation transition
        if attempt >= 2:
            y1,y2 = (.76,.34) if attempt < 8 else (.34,.76)
            shell('input','swipe',str(w//2),str(int(h*y1)),str(w//2),str(int(h*y2)),'360')
        time.sleep(.35)
    raise AssertionError(f'Missing {label!r}. Last visible labels: {visible[:12]} / {visible[-16:]}')

# Start as a learner would: do not depend on how an OEM re-delivers VIEW to a warm task.
locate('ورود به زبان روسی',tap=True)
locate('فعل و ضمیر',tap=True)
locate('شروع با «خواستن»',tap=True)
locate('دیدن مثال',tap=True)
locate('Я хочу чай')
# A system recognizer or Russian acoustic model is not guaranteed on google_apis images.
# Exercise the explicitly denied/offline fallback, not a fictitious successful voice recognition.
# API 30 has no compatible `pm set-permission-flags` command. Respond to Android's
# own permission prompt instead. No permission grant or synthetic voice service.
# Return from the example to the workshop, and from the workshop to the actual home card.
locate('بازگشت به فهرست کارگاه',tap=True)
locate('بازگشت به صفحهٔ قبل',tap=True)
locate('اتاق مکالمهٔ روسی',tap=True)
# The free room starts at hello; advance the same six scene controls the learner sees.
for _ in range(6):
    locate('موقعیت بعدی',tap=True)
    time.sleep(.5)
# The 7th scene's title is at the top even if the previous Next button was at the bottom.
locate('چای می‌خواهم یا آب؟')
locate('من شروع می‌کنم',tap=True)
locate(('دسترسی میکروفون یا تشخیص گفتار داده نشد', 'تشخیص گفتار روسی در این دستگاه', 'میکروفون در دسترس نیست'),deny_dialog=True)
locate('تمرین بدون میکروفون',tap=True)
locate('بگو: Я хочу воду.',tap=True)
locate('Вот твоя вода')
with Path('russian-release.md').open('a') as f:
    f.write('Verified the native verb example and a microphone-free water exchange on the installed APK.\n')
