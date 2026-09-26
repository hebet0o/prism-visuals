import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { PLACEHOLDER_IMAGES } from '../src/utils/constants.js'

// Originals stay untouched. Run npm run optimize:images after replacing homepage photos.
const output = 'public/optimized/home'
await fs.mkdir(output, { recursive: true })
const manifest = {}
let originalBytes = 0
let smallBytes = 0
for (const [group, sources] of Object.entries(PLACEHOLDER_IMAGES)) {
  for (const source of sources) {
    const input = `public${source}`
    const metadata = await sharp(input).rotate().metadata()
    const widths = group === 'hero' ? [640, 960, 1600, 2400] : [480, 800, 1200]
    const variants = []
    for (const width of widths) {
      const filename = `${group}-${path.parse(source).name}-${width}.webp`
      const result = await sharp(input).rotate().resize({ width, withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 }).toFile(`${output}/${filename}`)
      if (!variants.some(v => v.width === result.width)) variants.push({ src: `/optimized/home/${filename}`, width: result.width })
    }
    const fallback = variants[Math.min(1, variants.length - 1)].src
    manifest[source] = { src: fallback, srcSet: variants.map(v => `${v.src} ${v.width}w`).join(', '), width: metadata.autoOrient?.width ?? metadata.width, height: metadata.autoOrient?.height ?? metadata.height }
    originalBytes += (await fs.stat(input)).size
    smallBytes += (await fs.stat(`public${variants[0].src}`)).size
  }
}
await fs.writeFile('src/utils/homeImages.json', JSON.stringify(manifest, null, 2) + '\n')

// Preserve SVG vector/text geometry; resize only its oversized embedded bitmaps.
let logo = await fs.readFile('public/prism_final_full_white.svg', 'utf8')
const embedded = [...new Set(logo.match(/data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/=\s]+?(?=["'])/g) || [])]
for (const uri of embedded) {
  const bitmap = Buffer.from(uri.slice(uri.indexOf(',') + 1).replace(/\s/g, ''), 'base64')
  const compressed = await sharp(bitmap).resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100 }).toBuffer()
  logo = logo.replaceAll(uri, `data:image/webp;base64,${compressed.toString('base64')}`)
}
await fs.writeFile('public/optimized/prism-logo.svg', logo)
await sharp('public/prism_final.png').resize(64, 64, { fit: 'contain', background: '#00000000' })
  .png({ compressionLevel: 9 }).toFile('public/optimized/favicon.png')
console.log(JSON.stringify({ originalPhotoBytes: originalBytes, smallestPhotoBytes: smallBytes, originalLogoBytes: (await fs.stat('public/prism_final_full_white.svg')).size, optimizedLogoBytes: Buffer.byteLength(logo), embeddedImages: embedded.length }, null, 2))
