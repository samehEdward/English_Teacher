// Renders every app icon from one design, so the Android launcher, the
// adaptive icon and the PWA icons can never drift apart.
//
// The mark: "a ticket that talks" - a white speech bubble carrying the
// tube-cap stripe (IT blue over lab violet) on surgical teal.
//
//   node scripts/make-icons.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const TEAL = '#0A6F5C', INK = '#16211D', IT = '#2E58C9', LAB = '#7B3DB5';

// The bubble, drawn in a 100x100 unit box (content spans x 18-82, y 22-84).
const bubble = `
  <defs><clipPath id="body"><rect x="18" y="22" width="64" height="48" rx="8"/></clipPath></defs>
  <rect x="18" y="22" width="64" height="48" rx="8" fill="#fff"/>
  <path d="M28 69 L28 84 L43 69 Z" fill="#fff"/>
  <g clip-path="url(#body)">
    <rect x="18" y="22" width="9" height="24" fill="${IT}"/>
    <rect x="18" y="46" width="9" height="24" fill="${LAB}"/>
  </g>
  <rect x="36" y="34" width="36" height="6" rx="3" fill="${INK}"/>
  <rect x="36" y="49" width="24" height="6" rx="3" fill="${INK}" opacity="0.55"/>`;

// Full-bleed icon: content kept inside the 80% maskable safe circle.
const full = (s = 512) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${s}" height="${s}">
  <rect width="512" height="512" fill="${TEAL}"/>
  <g transform="translate(36 22.8) scale(4.4)">${bubble}</g></svg>`;

// Adaptive-icon foreground: transparent, content inside the 66dp safe circle
// of the 108dp canvas.
const foreground = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">
  <g transform="translate(19 16.9) scale(0.7)">${bubble}</g></svg>`;

const rounded = (r) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="${r}" fill="#fff"/></svg>`);
const circle = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="256" cy="256" r="256" fill="#fff"/></svg>`);

async function png(svg, size, out, mask) {
  let img = sharp(Buffer.from(svg), { density: 384 }).resize(size, size);
  if (mask) img = sharp(await img.png().toBuffer()).composite([{ input: await sharp(mask).resize(size, size).png().toBuffer(), blend: 'dest-in' }]);
  await img.png().toFile(out);
}

const pub = 'public/icons';
fs.writeFileSync(path.join(pub, 'icon-192.svg'), full(192));
fs.writeFileSync(path.join(pub, 'icon-512.svg'), full(512));
await png(full(), 192, path.join(pub, 'icon-192.png'));
await png(full(), 512, path.join(pub, 'icon-512.png'));
await png(full(), 512, path.join(pub, 'icon-maskable-512.png'));

// index.html's favicon/apple-touch links are resolved by Vite from the
// project root, so the root icons/ folder must carry the same artwork as
// public/icons or the built site ships a stale favicon.
for (const f of ['icon-192.svg', 'icon-512.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png']) {
  fs.copyFileSync(path.join(pub, f), path.join('icons', f));
}

const res = 'android/app/src/main/res';
const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, k] of Object.entries(densities)) {
  const dir = path.join(res, `mipmap-${d}`);
  await png(full(), 48 * k, path.join(dir, 'ic_launcher.png'), rounded(92));
  await png(full(), 48 * k, path.join(dir, 'ic_launcher_round.png'), circle);
  await png(foreground, 108 * k, path.join(dir, 'ic_launcher_foreground.png'));
}
console.log('icons written');
