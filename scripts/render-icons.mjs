// Renders the app icons and launch image from the Illustrator masters in assets/.
// Run after changing a master: npm run icons
//
// Each master is a 1024×1024 SVG with a `background` layer and a `mark` layer; only the mark is used.

import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const assets = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const out = join(assets, 'images');

/** "Sb." — the app icon. */
const ICON_MASTER = 'icon-master-1.svg';
/** "Svoboda." — the launch screen. */
const WORDMARK_MASTER = 'icon-master-2.svg';

// Brand book colours: ink and paper, and the dark theme's ink.
const INK = '#0A0A0A';
const PAPER = '#FFFFFF';
const DARK_INK = '#F2F2F0';

// Android icons are 108 dp layers, of which launchers show the middle 72 dp and guarantee only a
// 66 dp circle. Scaling the mark by 72/108 makes it look the size it does on iOS.
const ANDROID_SCALE = 72 / 108;
const ANDROID_SAFE_RADIUS = ((66 / 108) * 1024) / 2;

const LAUNCH_IMAGE_SCALE = 4;

function readMark(file) {
  const svg = readFileSync(join(assets, file), 'utf8');
  const match = svg.match(/<g id="mark">([\s\S]*?)<\/g>\s*<\/svg>/);
  if (!match) throw new Error(`${file} has no <g id="mark"> layer`);
  return match[1];
}

function square(mark, { fill, background = null, scale = 1 }) {
  const offset = 512 * (1 - scale);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">` +
      (background ? `<rect width="1024" height="1024" fill="${background}"/>` : '') +
      `<g fill="${fill}" transform="translate(${offset} ${offset}) scale(${scale})">${mark}</g></svg>`,
  );
}

/** Bounding box of the opaque pixels, and how far the farthest one is from the centre. */
async function measureInk(svg) {
  const { data, info } = await sharp(svg).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0, radius = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] < 128) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      radius = Math.max(radius, Math.hypot(x + 0.5 - info.width / 2, y + 0.5 - info.height / 2));
    }
  }
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1, radius };
}

function save(image, name) {
  console.log(`  ${name}`);
  return image.png({ compressionLevel: 9 }).toFile(join(out, name));
}

mkdirSync(out, { recursive: true });
const icon = readMark(ICON_MASTER);
const wordmark = readMark(WORDMARK_MASTER);

const android = await measureInk(square(icon, { fill: INK, scale: ANDROID_SCALE }));
if (android.radius > ANDROID_SAFE_RADIUS) {
  throw new Error(
    `The mark reaches ${Math.round(android.radius)}px from the centre on Android; ` +
      `keep it within ${Math.round(ANDROID_SAFE_RADIUS / ANDROID_SCALE)}px in ${ICON_MASTER}.`,
  );
}

console.log('Rendering into assets/images:');
// iOS rejects icons with an alpha channel, even a fully opaque one.
await save(sharp(square(icon, { fill: INK, background: PAPER })).removeAlpha(), 'icon.png');
await save(sharp(square(icon, { fill: DARK_INK })), 'icon-dark.png');
await save(sharp(square(icon, { fill: PAPER })), 'icon-tinted.png');
await save(sharp(square(icon, { fill: INK, scale: ANDROID_SCALE })), 'android-foreground.png');
await save(sharp(square(icon, { fill: PAPER, scale: ANDROID_SCALE })), 'android-monochrome.png');

// Cropped tight to the letters; app.json's splash `imageWidth` sets its size on screen.
const box = await measureInk(square(wordmark, { fill: INK }));
const launch = (fill) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x} ${box.y} ${box.width} ${box.height}" ` +
      `width="${box.width * LAUNCH_IMAGE_SCALE}" height="${box.height * LAUNCH_IMAGE_SCALE}">` +
      `<g fill="${fill}">${wordmark}</g></svg>`,
  );
await save(sharp(launch(INK)), 'splash-icon.png');
await save(sharp(launch(DARK_INK)), 'splash-icon-dark.png');
