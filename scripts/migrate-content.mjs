import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const contentDirs = [
  path.join(__dirname, '../content/blog'),
  path.join(__dirname, '../content/note'),
]

function convertFrontmatter(content) {
  // Match YAML frontmatter
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/
  const match = content.match(frontmatterRegex)

  if (!match) {
    console.log('  No frontmatter found')
    return content
  }

  let frontmatter = match[1]
  const body = content.slice(match[0].length)

  // Check if time.created exists and convert to date
  const timeCreatedMatch = frontmatter.match(
    /time:\s*\n\s*created:\s*["']?([^"'\n]+)["']?/
  )

  if (timeCreatedMatch) {
    const createdDate = timeCreatedMatch[1].trim()
    // Parse ISO date and convert to YYYY-MM-DD format
    const date = new Date(createdDate)
    const formattedDate = date.toISOString().split('T')[0]

    // Remove the time block and add date field
    frontmatter = frontmatter
      .replace(
        /time:\s*\n\s*created:\s*["']?[^"'\n]+["']?\n\s*updated:\s*["']?[^"'\n]+["']?/,
        ''
      )
      .replace(/time:\s*\n\s*created:\s*["']?[^"'\n]+["']?/, '')
      .trim()

    // Add date field after title if it exists
    if (frontmatter.includes('title:')) {
      frontmatter = frontmatter.replace(
        /(title:\s*["']?[^"'\n]+["']?)(\n|$)/,
        `$1\ndate: ${formattedDate}\n`
      )
    } else {
      frontmatter = `date: ${formattedDate}\n${frontmatter}`
    }

    console.log(`  Converted: time.created -> date: ${formattedDate}`)
  } else if (!frontmatter.includes('date:')) {
    // If no time.created and no date, add current date
    const today = new Date().toISOString().split('T')[0]
    frontmatter = frontmatter.replace(
      /(title:\s*["']?[^"'\n]+["']?)(\n|$)/,
      `$1\ndate: ${today}\n`
    )
    console.log(`  Added default date: ${today}`)
  }

  // Clean up any empty lines
  frontmatter = frontmatter.replace(/\n{3,}/g, '\n\n').trim()

  return `---\n${frontmatter}\n---${body}`
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`)
    return
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))
  console.log(`\nProcessing ${files.length} files in ${dir}`)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    console.log(`Processing: ${file}`)

    const content = fs.readFileSync(filePath, 'utf8')
    const converted = convertFrontmatter(content)

    fs.writeFileSync(filePath, converted, 'utf8')
  })
}

console.log('Starting frontmatter migration...')
contentDirs.forEach(processDirectory)
console.log('\nMigration complete!')
