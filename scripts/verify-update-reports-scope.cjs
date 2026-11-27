const fs=require('node:fs');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const before=require('./fixtures/update-reports-before.json');
const hash=x=>createHash('sha256').update(x).digest('hex');
const additions={
 'app/_layout.tsx': ["import { startUpdateUsageReporting } from '@/lib/updateReporting';\n",'  useEffect(() => startUpdateUsageReporting(), []);\n'],
 'features/admin/Shell.tsx': ["  { href: '/admin/update-reports', label: 'گزارش استفاده از آپدیت‌ها', short: 'گزارش آپدیت', icon: History },\n"],
 'lib/appUpdates.ts': ["import { reportVerifiedUpdateDownload, reportUpdateInstallerRequested } from './updateReporting';\n","    const reportingBuild = { package: installedVersion().package || '', code: release.version_code, name: release.version_name };\n",'    reportVerifiedUpdateDownload(reportingBuild);\n','    reportUpdateInstallerRequested(reportingBuild);\n'],
};
for(const [file,expected]of Object.entries(before)){
 let text=fs.readFileSync(file,'utf8');
 for(const line of additions[file]??[]){assert.equal(text.split(line).length,2,`${file}: exact single approved insertion`);text=text.replace(line,'');}
 assert.equal(hash(text),expected,`${file}: existing admin screens, navigation, learner content and layout unchanged outside exact additive wiring`);
}
const screen=fs.readFileSync('features/admin/screens/UpdateReports.tsx','utf8');
assert.ok(!/publishRelease|deleteRelease|setReleasePublished|\.from\(|\.rpc\(/.test(screen),'read-only report, no publishing controls or direct database access');
console.log(`PASS additive scope: ${Object.keys(before).length} existing files protected, only 7 exact wiring lines allowed.`);
