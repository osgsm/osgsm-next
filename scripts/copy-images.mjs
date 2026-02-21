import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) {
    console.log(`Source directory not found: ${src}`)
    return
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

const contentDir = path.join(__dirname, '../content')
const publicDir = path.join(__dirname, '../public')

// Copy blog images
const blogImagesSource = path.join(contentDir, 'blog/images')
const blogImagesDest = path.join(publicDir, 'blog/images')
console.log('Copying blog images...')
copyDir(blogImagesSource, blogImagesDest)

// Copy note images
const noteImagesSource = path.join(contentDir, 'note/images')
const noteImagesDest = path.join(publicDir, 'notes/images')
console.log('Copying note images...')
copyDir(noteImagesSource, noteImagesDest)

console.log('Images copied successfully!')
