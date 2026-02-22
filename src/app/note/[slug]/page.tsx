import { notFound } from 'next/navigation'
import { getPostBySlug, getPostSlugs } from '@/lib/mdx'
import { GiscusComments } from '@/components/giscus-comments'
import { MDXContent } from '@/components/mdx-content'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getPostSlugs('note')
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug('note', slug)

  if (!post) {
    return { title: 'Not Found' }
  }

  return {
    title: post.title,
    description: post.description,
  }
}

export default async function NotePostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug('note', slug)

  if (!post) {
    notFound()
  }

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <div className="text-gray-500">
          <time>{post.date}</time>
          {post.category && <span> · {post.category}</span>}
        </div>
      </header>
      <div className="prose dark:prose-invert max-w-none">
        <MDXContent source={post.content} />
      </div>
      <div className="mt-16">
        <GiscusComments />
      </div>
    </article>
  )
}
