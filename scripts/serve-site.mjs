#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteDist = path.resolve(process.env.SITE_DIST_DIR || path.join(root, 'dist', 'site'));
const port = Number.parseInt(process.env.PORT || '8082', 10);
const gzipCache = new Map();
const ASSET_EXT_RE = /\.(?:js|mjs|css|json|wasm|png|jpe?g|webp|gif|svg|ico|ttf|woff2?|mp3|wav|ogg|map|txt)$/i;

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=UTF-8';
  if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) return 'application/javascript; charset=UTF-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=UTF-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=UTF-8';
  if (filePath.endsWith('.wasm')) return 'application/wasm';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.ico')) return 'image/x-icon';
  if (filePath.endsWith('.ttf')) return 'font/ttf';
  if (filePath.endsWith('.woff2')) return 'font/woff2';
  if (filePath.endsWith('.woff')) return 'font/woff';
  if (filePath.endsWith('.mp3')) return 'audio/mpeg';
  if (filePath.endsWith('.wav')) return 'audio/wav';
  return 'application/octet-stream';
}

function sendFile(req, res, filePath) {
  const type = contentType(filePath);
  const compressible = /\.(?:html|js|mjs|css|json|svg|ttf|wasm)$/i.test(filePath);
  const acceptsGzip = /\bgzip\b/i.test(String(req.headers['accept-encoding'] || ''));
  const isHead = req.method === 'HEAD';

  if (compressible && acceptsGzip) {
    let gz = gzipCache.get(filePath);
    if (!gz) {
      gz = zlib.gzipSync(fs.readFileSync(filePath));
      gzipCache.set(filePath, gz);
    }
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Encoding': 'gzip',
      'Content-Length': gz.length,
      'Cache-Control': 'no-cache',
    });
    res.end(isHead ? undefined : gz);
    return;
  }

  const data = fs.readFileSync(filePath);
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': data.length,
    'Cache-Control': 'no-cache',
  });
  res.end(isHead ? undefined : data);
}

function resolvePath(urlPathname) {
  const clean = decodeURIComponent(urlPathname.split('?')[0] || '/');
  const rel = clean.replace(/^\/+/, '');
  const candidates = [];

  if (!rel) {
    candidates.push(path.join(siteDist, 'index.html'));
  } else {
    const direct = path.resolve(siteDist, rel);
    if (direct.startsWith(siteDist)) {
      candidates.push(direct);
      if (!path.extname(direct)) {
        candidates.push(`${direct}.html`, path.join(direct, 'index.html'));
      }
    }
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  if (clean.startsWith('/app/') && !ASSET_EXT_RE.test(clean)) {
    const appFallback = path.join(siteDist, 'app', 'index.html');
    if (fs.existsSync(appFallback)) return appFallback;
  }

  return null;
}

const server = http.createServer((req, res) => {
  const rawUrl = req.url || '/';
  const [pathname, query] = rawUrl.split('?');
  if (pathname === '/app') {
    res.writeHead(302, { Location: `/app/${query ? `?${query}` : ''}` });
    res.end();
    return;
  }

  const filePath = resolvePath(rawUrl);
  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('Not found');
    return;
  }
  sendFile(req, res, filePath);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving MiloLang site on http://0.0.0.0:${port}`);
});
