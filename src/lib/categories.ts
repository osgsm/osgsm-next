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

  return Array.from(categories).sort()
}
