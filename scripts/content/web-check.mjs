// Static boot verification for /dialogue-room/[language]: simulate the SPA boot
// by checking that every runtime requirement the bundle asks for resolves.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const dist = path.resolve('dist');
function get(p) {
  return new Promise(resolve => {
    http.get({ host: '127.0.0.1', port: 8081, path: p }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
  });
}

const room = await get('/App/dialogue-room/en');
if (room.status !== 200) { console.log('FAIL shell', room.status); process.exit(1); }
const assets = [...room.body.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1]).filter(u => u.startsWith('/'));
let failures = [];
for (const asset of assets) {
  const r = await get(asset);
  if (r.status !== 200) failures.push(`${asset} -> ${r.status}`);
}
// The bundle must register the screen and know the [language] pattern.
const idx = dist + '/_expo/static/js/web/' + fs.readdirSync(dist + '/_expo/static/js/web').find(n => n.startsWith('index-'));
const bundle = fs.readFileSync(idx, 'utf8');
const registered = bundle.includes('"./dialogue-room/[language].tsx"');
const pushCall = bundle.includes("pathname:'/dialogue-room/[language]'");
console.log('shell 200, assets ok:', failures.length === 0, failures.join(', '));
console.log('screen registered in bundle:', registered, '| home button pushes it:', pushCall);
process.exit(failures.length || !registered || !pushCall ? 1 : 0);
