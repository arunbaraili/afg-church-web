import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist';
function* pages(dir = '') {
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    const path = dir ? `${dir}/${entry.name}` : entry.name;
    if (path === 'admin' || path === 'uploads') continue;
    if (entry.isDirectory()) yield* pages(path);
    else if (path.endsWith('.html')) yield path;
  }
}
const lines = [];
for (const file of pages()) {
  const html = readFileSync(join(root, file), 'utf8');
  const hashes = [...new Set([...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attributes, body]) => !/\bsrc\s*=/i.test(attributes) && body.trim())
    .map(([, , body]) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`))];
  const policy = [
    "default-src 'none'",
    `script-src 'self' ${hashes.join(' ')}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data:",
    "media-src 'self' https:",
    "font-src 'self'",
    "connect-src 'self' https://formspree.io",
    "frame-src https://www.google.com",
    "manifest-src 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self' https://formspree.io",
  ].join('; ');
  const clean = '/' + file.replace(/index\.html$/, '');
  const paths = new Set([clean, '/' + file]);
  if (clean !== '/' && clean.endsWith('/')) paths.add(clean.slice(0,-1));
  for (const path of paths) lines.push(path, `  Content-Security-Policy: ${policy}`, '');
}
writeFileSync(join(root, '_headers'), lines.join('\n'));
