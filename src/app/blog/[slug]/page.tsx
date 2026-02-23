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
        <div className="relative flex flex-wrap">
          {post.category && (
            <span className="border border-border bg-iris-2 px-1.5 py-0.5 font-pixel-circle text-sm tracking-wider">
              {post.category}
            </span>
          )}
        </div>
        <h1 className="mt-4 mb-3 text-2xl leading-normal lg:text-3xl">
          {post.title}
        </h1>
        <div className="grid font-pixel-circle text-sm tracking-wider">
          <time>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
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
