/* ==========================================================================
   Turns the original Bubu × Dudu artwork in `assets/source/` into
   optimised web images inside `public/media/`.

   Run with:  node scripts/build-media.mjs
   ========================================================================== */
import { mkdir, readdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sourceDir = resolve(__dirname, '../assets/source')
const outDir = resolve(__dirname, '../public/media')

/* Full-scene artwork ------------------------------------------------------ */
const scenes = [
  { src: 'bubu-dudu-party.jpg', name: 'bubu-dudu-party' },
  { src: 'bubu-dudu-candle.jpg', name: 'bubu-dudu-candle' },
  { src: 'birthday-room.jpg', name: 'birthday-room' },
  { src: 'dudu-balloon.jpg', name: 'dudu-balloon' },
  { src: 'bubu-dudu-night.jpg', name: 'bubu-dudu-night' },
]

/* Portrait stickers cropped out of the artwork ---------------------------- */
/* Bubu is the white bear, Dudu is the honey-brown one. */
const stickers = [
  // Dudu — honey-brown bear in the red striped party hat (left side of the party scene)
  { src: 'bubu-dudu-party.jpg', name: 'dudu', left: 18, top: 138, width: 232, height: 274 },
  // Bubu — white bear in the blue striped party hat (right side of the party scene)
  { src: 'bubu-dudu-party.jpg', name: 'bubu', left: 294, top: 148, width: 216, height: 268 },
  // Dudu — honey-brown bear with the black bow tie (right side of the candle scene)
  { src: 'bubu-dudu-candle.jpg', name: 'dudu-bowtie', left: 254, top: 188, width: 256, height: 216 },
  // Bubu — white bear with the pink bow (left side of the candle scene)
  { src: 'bubu-dudu-candle.jpg', name: 'bubu-bow', left: 34, top: 194, width: 236, height: 214 },
]

await mkdir(outDir, { recursive: true })

// clean out previously generated files (keep README.md)
for (const file of await readdir(outDir)) {
  if (file !== 'README.md') await rm(resolve(outDir, file), { force: true })
}

for (const scene of scenes) {
  const input = resolve(sourceDir, scene.src)
  await sharp(input)
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(resolve(outDir, `${scene.name}.webp`))
  await sharp(input)
    .resize({ width: 900, withoutEnlargement: true })
    .jpeg({ quality: 84, progressive: true, mozjpeg: true })
    .toFile(resolve(outDir, `${scene.name}.jpg`))
  console.log(`scene: ${scene.name}`)
}

for (const sticker of stickers) {
  const input = resolve(sourceDir, sticker.src)
  let pipeline = sharp(input).extract({
    left: sticker.left,
    top: sticker.top,
    width: sticker.width,
    height: sticker.height,
  })
  if (sticker.trim) pipeline = pipeline.trim({ threshold: 12 })
  const buffer = await pipeline.toBuffer()

  const meta = await sharp(buffer).metadata()
  const target = Math.min(520, Math.max(meta.width ?? 320, meta.height ?? 320))

  await sharp(buffer)
    .resize({ width: target, height: target, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(resolve(outDir, `${sticker.name}.png`))
  await sharp(buffer)
    .resize({ width: target, height: target, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88, effort: 5 })
    .toFile(resolve(outDir, `${sticker.name}.webp`))
  console.log(`sticker: ${sticker.name} (${meta.width}x${meta.height} -> ${target}px)`)
}

console.log('media built')
