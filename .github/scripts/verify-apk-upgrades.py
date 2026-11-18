#!/usr/bin/env python3
"""Check the exact proposed assets against published APKs, then exercise real replacements on a disposable AVD."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import zipfile

PACKAGES = {
    '5update.apk': 'com.devicecontrol.milofive',
    'login.5update.apk': 'com.devicecontrol.milomultilang',
    '2update.apk': 'com.devicecontrol.companion',
    'login.2update.apk': 'com.devicecontrol.milolang2',
    'english.apk': 'com.devicecontrol.miloenglish',
    'AdminApp.apk': 'com.devicecontrol.miloadmin',
}
PLAN = Path('upgrade-plan.json')


def output(*args, timeout=180):
    proc = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, timeout=timeout)
    if proc.returncode:
        raise RuntimeError(f'{Path(args[0]).name}: {proc.stdout[-1600:]}')
    return proc.stdout.strip()


def require(condition, message):
    if not condition:
        raise SystemExit(message)


def digest(file):
    with file.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def inspect(file, pkg, code):
    tools = Path(os.environ['ANDROID_HOME']) / 'build-tools/36.0.0'
    badging = output(tools / 'aapt', 'dump', 'badging', file)
    header = re.search(r'^package: (.*)$', badging, re.M)
    attrs = dict(re.findall(r"(\w+)='([^']*)'", header[1])) if header else {}
    require(attrs.get('name') == pkg and not attrs.get('split'), f'{file}: unexpected/split package {attrs}')
    require(attrs.get('versionCode') == str(code) and attrs.get('versionName') == f'1.0.{code}',
            f'{file}: release label disagrees with manifest: {attrs}')
    sdk = int(re.search(r"^sdkVersion:'(\d+)'", badging, re.M)[1])
    report = output(tools / 'apksigner', 'verify', '--verbose', '--print-certs', file)
    certs = sorted(re.findall(r'^Signer #\d+ certificate SHA-256 digest: ([\da-fA-F]{64})$', report, re.M))
    require(certs, f'{file}: no verified signer')
    with zipfile.ZipFile(file) as archive:
        abis = sorted({p.split('/')[1] for p in archive.namelist() if re.fullmatch(r'lib/[^/]+/[^/]+\.so', p)})
    print(f'{file}: {pkg} build {code}, minSdk {sdk}, ABIs {abis}, signing cert(s) {certs}', flush=True)
    return sdk, abis, certs


def prepare():
    repo, run = os.environ['GITHUB_REPOSITORY'], int(os.environ['RELEASE_SEQUENCE'])
    code = 100 + run
    # Retention keeps the last five requested releases. Don't use GitHub's /latest (a content pack).
    releases = json.loads(output('gh', 'api', f'repos/{repo}/releases?per_page=100'))
    history = []
    for release in releases:
        tag = re.fullmatch(r'milo-requested-(\d+)', release['tag_name'])
        if tag and not release['draft'] and int(tag[1]) < run:
            history.append((int(tag[1]), {a['name']: a for a in release['assets'] if a['state'] == 'uploaded'}))
    expected_abis = sorted({s.strip() for s in os.environ['MILO_ANDROID_ABIS'].split(',') if s.strip()})
    plan = []
    for name, pkg in PACKAGES.items():
        if name.startswith('login.') and os.environ['INCLUDE_LOGIN'] != 'true':
            continue
        file = Path('out', name, name)
        require(file.is_file() and digest(file) == Path(str(file) + '.sha256').read_text().split()[0],
                f'{file}: missing or damaged build artifact')
        sdk, abis, certs = inspect(file, pkg, code)
        require(abis == expected_abis, f'{file}: expected ABIs {expected_abis}, got {abis}')
        output(Path(os.environ['ANDROID_HOME']) / 'build-tools/36.0.0/zipalign', '-c', '-P', '16', '4', file)
        # Check both upgrade paths for the affected five-language apps; the latest matching build for the others.
        count = 2 if name.endswith('5update.apk') else 1
        older = [(n, assets[name]) for n, assets in sorted(history, key=lambda h: -h[0]) if name in assets][:count]
        require(older, f'{name}: no published baseline to establish signer continuity')
        for n, asset in older:
            tag = f'milo-requested-{n}'
            directory = Path('baselines', tag)
            directory.mkdir(parents=True, exist_ok=True)
            output('gh', 'release', 'download', tag, '--repo', repo, '--pattern', name, '--dir', directory)
            old = directory / name
            require(old.stat().st_size == asset['size'] and 'sha256:' + digest(old) == asset['digest'],
                    f'{old}: not the bytes in the published release')
            old_sdk, _, old_certs = inspect(old, pkg, 100 + n)
            require(certs == old_certs, f'{file}: signer changed since {tag}; NOT an in-place update')
            require(sdk <= old_sdk, f'{file}: minSdk increased since {tag}')
            plan.append(dict(name=name, pkg=pkg, old=str(old), old_code=100 + n, new=str(file), code=code,
                             sdk=sdk, abis=abis, certs=certs))
    PLAN.write_text(json.dumps(plan))


def smoke_test():
    # -e and the qemu check ensure that the fixture reset below can never touch a physical phone.
    adb = ['adb', '-e']
    shell = [*adb, 'shell']
    require(output(*shell, 'getprop', 'ro.kernel.qemu') == '1', 'A disposable Android emulator is required')
    output(*adb, 'root')  # write a marker in the actual private app data directory
    output(*adb, 'wait-for-device', timeout=60)
    require(output(*shell, 'id', '-u') == '0', 'Use a userdebug Google APIs image, not Google Play')
    api = output(*shell, 'getprop', 'ro.build.version.sdk')
    device_abis = output(*shell, 'getprop', 'ro.product.cpu.abilist')
    print(f'Disposable Android API {api}, supported ABIs: {device_abis}', flush=True)
    rows = []
    for p in json.loads(PLAN.read_text()):
        pkg = p['pkg']
        marker = f'/data/user/0/{pkg}/.milo-ci-upgrade'
        value = f"progress-fixture-{p['old_code']}"
        print(f"Testing {p['name']}: {p['old_code']} → {p['code']}", flush=True)
        output(*adb, 'install', '--no-streaming', p['old'])
        output(*shell, f"echo {value} > {marker}")
        # This is the upgrade under test. No uninstall, clearing, downgrade flag, or re-signing.
        output(*adb, 'install', '--no-streaming', '-r', p['new'])
        require(re.search(rf"\bversionCode={p['code']}\b", output(*shell, 'dumpsys', 'package', pkg)), f'{pkg}: wrong installed version')
        require(output(*shell, 'cat', marker) == value, f'{pkg}: app-private data did not survive replacement')
        rows.append(f"| `{p['name']}` | {p['old_code']} → {p['code']} | {p['sdk']} | {', '.join(p['abis'])} | `{' / '.join(p['certs'])}` |")
        output(*adb, 'uninstall', pkg)  # only AFTER the assertion: reset this disposable fixture
    report = f"### Android upgrade checks\n\nAndroid API {api} emulator: installed the official baseline, replaced it with the exact release APK and read back a marker in private app data. No uninstall or downgrade during replacement.\n\n"
    report += '| APK | In-place upgrade | minSdk | APK ABIs | Signer certificate SHA-256 |\n|---|---|---|---|---|\n' + '\n'.join(rows) + '\n'
    Path('upgrade-checks.md').write_text(report)
    with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as summary:
        summary.write(report)


if __name__ == '__main__':
    try:
        {'prepare': prepare, 'install': smoke_test}[sys.argv[1]]()
    except (Exception, SystemExit) as error:
        detail = re.sub(r'https?://\S+', '[URL]', str(error)).strip()[:1800]
        print('::error title=APK upgrade verification::' + detail.replace('%', '%25').replace('\n', '%0A').replace('\r', '%0D'))
        sys.exit(1)
