// Runs automatically before `npm run dev` and `npm run build`.
//  1. Downloads the Higgsfield-generated illustrations into public/images/ (WebP).
//  2. Downloads your own photos (listed as "photos/…" in src/data/site.ts) from your
//     original site repo into public/photos/, resized so the page stays fast.
// Files that already exist are skipped, so committed files are never overwritten.
import { mkdir, readFile, writeFile, access } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

/** Where your original photos live (the old CV site repo). */
const PHOTO_SOURCE = "https://raw.githubusercontent.com/Almightyhao/CV/main/"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const exists = (p) => access(p).then(() => true, () => false)
let failed = 0

async function download(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

// 1. Higgsfield illustrations
const imagesTs = await readFile(path.join(root, "src/data/images.ts"), "utf8")
const cdn = imagesTs.match(/HIGGSFIELD_CDN = "([^"]+)"/)[1]
const generated = [...imagesTs.matchAll(/^\s+"?([\w-]+)"?: "(hf_[^"]+)"/gm)].map((m) => [m[1], m[2]])
await mkdir(path.join(root, "public/images"), { recursive: true })
await Promise.all(
  generated.map(async ([key, file]) => {
    const out = path.join(root, "public/images", `${key}.webp`)
    if (await exists(out)) return
    try {
      const buf = await download(cdn + file)
      await sharp(buf).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out)
      console.log(`  ✓ images/${key}.webp`)
    } catch (e) {
      failed++
      console.warn(`  ✗ images/${key}: ${e.message}`)
    }
  }),
)

// 2. Your own photos
const siteTs = await readFile(path.join(root, "src/data/site.ts"), "utf8")
const photos = [...new Set([...siteTs.matchAll(/"photos\/([^"]+)"/g)].map((m) => m[1]))]
await mkdir(path.join(root, "public/photos"), { recursive: true })
await Promise.all(
  photos.map(async (name) => {
    const out = path.join(root, "public/photos", name)
    if (await exists(out)) return
    try {
      const buf = await download(PHOTO_SOURCE + encodeURIComponent(name))
      const img = sharp(buf).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      const ext = path.extname(name).toLowerCase()
      const data = ext === ".png" ? await img.png({ compressionLevel: 9 }).toBuffer() : await img.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
      await writeFile(out, data)
      console.log(`  ✓ photos/${name}`)
    } catch (e) {
      failed++
      console.warn(`  ✗ photos/${name}: ${e.message}`)
    }
  }),
)

if (failed) console.warn(`[images] ${failed} file(s) could not be downloaded — the site still builds, those slots show text cards.`)
else console.log("[images] illustrations and photos ready")
