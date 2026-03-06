import { getAllPosts } from '@/lib/mdx'
import { getAllCategories } from '@/lib/categories'
import { PostList } from '@/components/post-list'

export const metadata = {
  title: 'Blog',
  description: 'Lessons learned, written down',
}

export default function BlogPage() {
  const posts = getAllPosts('blog')
  const categories = getAllCategories('blog')

  return (
    <PostList
      title="Blog"
      description="Lessons learned, written down"
      basePath="/blog"
      posts={posts}
      categories={categories}
    />
  )
}
