// Downloads the Higgsfield-generated illustrations into public/images/ as WebP.
// Runs automatically before `npm run dev` and `npm run build`.
// Skips files that already exist, so once public/images/ is committed this is a no-op.
import { mkdir, readFile, writeFile, access } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const src = await readFile(path.join(root, "src/data/images.ts"), "utf8")
const cdn = src.match(/HIGGSFIELD_CDN = "([^"]+)"/)[1]
const entries = [...src.matchAll(/^\s+"?([\w-]+)"?: "(hf_[^"]+)"/gm)].map((m) => [m[1], m[2]])
const outDir = path.join(root, "public/images")
await mkdir(outDir, { recursive: true })

const exists = (p) => access(p).then(() => true, () => false)
let failed = 0
await Promise.all(
  entries.map(async ([key, file]) => {
    const out = path.join(outDir, `${key}.webp`)
    if (await exists(out)) return
    try {
      const res = await fetch(cdn + file)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      await sharp(buf).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out)
      console.log(`  ✓ ${key}.webp`)
    } catch (e) {
      failed++
      console.warn(`  ✗ ${key}: ${e.message}`)
    }
  }),
)
if (failed) console.warn(`[images] ${failed} image(s) could not be downloaded — the site still builds, those slots stay empty.`)
else console.log("[images] all illustrations ready in public/images/")
