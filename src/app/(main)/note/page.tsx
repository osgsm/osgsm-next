import { getAllPosts } from '@/lib/mdx'
import { getAllCategories } from '@/lib/categories'
import { PostList } from '@/components/post-list'

export const metadata = {
  title: 'Note',
  description: 'Messy notes for future me',
}

export default function NotePage() {
  const posts = getAllPosts('note')
  const categories = getAllCategories('note')

  return (
    <PostList
      title="Note"
      description="Messy notes for future me"
      basePath="/note"
      posts={posts}
      categories={categories}
    />
  )
}
