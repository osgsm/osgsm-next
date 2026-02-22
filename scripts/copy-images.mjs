import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const contentDir = path.join(__dirname, '../content')
const publicDir = path.join(__dirname, '../public')

const copyPostAssets = (type, publicType) => {
  const typeDir = path.join(contentDir, type)
  if (!fs.existsSync(typeDir)) {
    console.log(`Content directory not found: ${typeDir}`)
    return
  }

  const entries = fs.readdirSync(typeDir, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const slug = entry.name
    const postDir = path.join(typeDir, slug)
    const files = fs.readdirSync(postDir)
    const assets = files.filter((file) => file !== 'index.mdx')

    if (assets.length === 0) continue

    const destDir = path.join(publicDir, publicType, 'images', slug)
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    for (const asset of assets) {
      fs.copyFileSync(path.join(postDir, asset), path.join(destDir, asset))
    }
  }
}

console.log('Copying blog images...')
copyPostAssets('blog', 'blog')

console.log('Copying note images...')
copyPostAssets('note', 'notes')

console.log('Images copied successfully!')
