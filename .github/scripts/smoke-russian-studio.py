"""Exercise the packaged native views on the disposable API 30 AVD, without a speech account."""
from pathlib import Path
import re
import subprocess
import time
import unicodedata
import xml.etree.ElementTree as ET

PKG = 'com.devicecontrol.milorussian'

def adb(*args):
    return subprocess.check_output(['adb', *args], text=True, timeout=25).strip()

def shell(*args):
    return adb('shell', *args)

def open_page(page):
    shell('am', 'start', '-W', '-n', PKG+'/.MainActivity', '-a', 'android.intent.action.VIEW', '-d', 'milorussian://learn/ru/'+page)

w, h = map(int, re.findall(r'(\d+)x(\d+)', shell('wm', 'size'))[-1])

def clean(s):
    return unicodedata.normalize('NFC', s).replace('\u0301','').replace('\u200e','').replace('\u200f','')

def locate(label, *, tap=False):
    # Accessibility tree (not screen pixels or assumptions about the OEM font size).
    # Search in both directions because a screen can keep its offset across a turn.
    target = clean(label)
    visible = []
    for attempt in range(14):
        try:
            shell('uiautomator', 'dump', '/sdcard/ru-studio.xml')
            root = ET.fromstring(adb('exec-out','cat','/sdcard/ru-studio.xml'))
            visible = []
            for node in root.iter('node'):
                texts = [clean(node.get(k,'')) for k in ('text','content-desc')]
                visible.extend(t for t in texts if t)
                if not any(target in t for t in texts):
                    continue
                bounds = list(map(int, re.findall(r'-?\d+',node.get('bounds',''))))
                if len(bounds) != 4: continue
                x1,y1,x2,y2 = bounds
                if not (x2>x1 and min(y2,h)>max(y1,0)): continue
                if tap:
                    shell('input','tap',str((x1+x2)//2),str((max(0,y1)+min(y2,h))//2))
                print(('Tapped' if tap else 'Rendered')+': '+label, flush=True)
                return
        except (ET.ParseError, subprocess.SubprocessError):
            pass  # first dump can race a permission view or navigation transition
        if attempt >= 2:
            y1,y2 = (.76,.34) if attempt < 8 else (.34,.76)
            shell('input','swipe',str(w//2),str(int(h*y1)),str(w//2),str(int(h*y2)),'360')
        time.sleep(.35)
    raise AssertionError(f'Missing {label!r} on the installed APK. Last visible labels: {visible[-25:]}')

open_page('grammar')
locate('شروع با «خواستن»',tap=True)
locate('دیدن مثال',tap=True)
locate('Я хочу чай')
# A system recognizer or Russian acoustic model is not guaranteed on google_apis images.
# Exercise the explicitly denied/offline fallback, not a fictitious successful voice recognition.
shell('pm','set-permission-flags',PKG,'android.permission.RECORD_AUDIO','user-set','user-fixed')
open_page('conversation?lessonId=ru-pre-this-is')
locate('من شروع می‌کنم',tap=True)
locate('تمرین بدون میکروفون',tap=True)
locate('بگو: Я хочу воду.',tap=True)
locate('Вот твоя вода')
with Path('russian-release.md').open('a') as f:
    f.write('Verified the native verb example and a microphone-free water exchange on the installed APK.\n')
