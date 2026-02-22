import { notFound } from 'next/navigation'
import { getPostBySlug, getPostSlugs } from '@/lib/mdx'
import { GiscusComments } from '@/components/giscus-comments'
import { MDXContent } from '@/components/mdx-content'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getPostSlugs('blog')
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug('blog', slug)

  if (!post) {
    return { title: 'Not Found' }
  }

  return {
    title: post.title,
    description: post.description,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug('blog', slug)

  if (!post) {
    notFound()
  }

  return (
    <article>
      <header className="mt-20 mb-10">
        <div className="relative -left-1 flex flex-wrap text-gray-500">
          {post.category && (
            <span className="rounded-full border border-border bg-mauve-2 px-2 py-0.5 text-sm text-mauve-10">
              {post.category}
            </span>
          )}
        </div>
        <h1 className="mt-3 mb-2 text-2xl leading-normal lg:text-3xl">
          {post.title}
        </h1>
        <div className="grid text-mauve-10">
          <time>{post.date}</time>
        </div>
      </header>
      <div className="prose dark:prose-invert max-w-none">
        <MDXContent source={post.content} />
      </div>
      <div className="mt-20">
        <GiscusComments />
      </div>
    </article>
  )
}
