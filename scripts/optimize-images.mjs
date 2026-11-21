// One-off: re-encode the project posters in src/images as WebP, capped at 1200px wide.
// Run with `node scripts/optimize-images.mjs`; it writes <name>.webp next to each source.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.resolve('src/images');
const MAX_WIDTH = 1200;
const QUALITY = 82;

// Read sources into memory so a .webp source can be overwritten in place on Windows.
sharp.cache(false);

for (const file of await readdir(DIR)) {
  if (!/\.(png|jpe?g|webp)$/i.test(file)) {
    continue;
  }

  const src = path.join(DIR, file);
  const out = path.join(DIR, file.replace(/\.(png|jpe?g|webp)$/i, '.webp'));
  const webp = await sharp(await readFile(src))
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  await writeFile(out, webp);
  console.log(file, '->', path.basename(out));
}
