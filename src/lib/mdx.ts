import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type PostType = 'blog' | 'note'

export interface PostMeta {
  slug: string
  title: string
  date: string
  description?: string
  tags?: string[]
}

export interface Post extends PostMeta {
  content: string
}

const contentDirectory = path.join(process.cwd(), 'content')

export function getPostSlugs(type: PostType): string[] {
  const dir = path.join(contentDirectory, type)
  if (!fs.existsSync(dir)) {
    return []
  }
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
}

export function getPostBySlug(type: PostType, slug: string): Post | null {
  const filePath = path.join(contentDirectory, type, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)

  const date = data.date
    ? data.date instanceof Date
      ? data.date.toISOString().split('T')[0]
      : String(data.date)
    : new Date().toISOString().split('T')[0]

  return {
    slug,
    title: data.title || slug,
    date,
    description: data.description,
    tags: data.tags,
    content,
  }
}

export function getAllPosts(type: PostType): PostMeta[] {
  const slugs = getPostSlugs(type)
  const posts = slugs
    .map((slug) => getPostBySlug(type, slug))
    .filter((post): post is Post => post !== null)
    .map(
      (post): PostMeta => ({
        slug: post.slug,
        title: post.title,
        date: post.date,
        description: post.description,
        tags: post.tags,
      })
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}
