import { getAllPosts } from '@/lib/mdx'
import type { PostType } from '@/lib/mdx'

export function getAllCategories(type: PostType): string[] {
  const posts = getAllPosts(type)
  const categories = new Set<string>()

  for (const post of posts) {
    if (post.categories) {
      for (const category of post.categories) {
        categories.add(category)
      }
    }
  }

  const sorted = Array.from(categories).sort()
  const othersIndex = sorted.indexOf('Others')
  if (othersIndex !== -1) {
    sorted.splice(othersIndex, 1)
    sorted.push('Others')
  }

  return sorted
}
