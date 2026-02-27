import type { Post } from '@/lib/mdx'
import { MDXContent } from '@/components/mdx-content'

type Props = {
  post: Post
}

export function PostArticle({ post }: Props) {
  return (
    <article>
      <header className="mt-20 mb-10">
        <div className="relative -left-1 flex flex-wrap gap-2">
          {post.categories?.map((category) => (
            <span
              key={category}
              className="rounded-lg bg-iris-3 px-2 py-0.5 font-sans text-sm tracking-wide text-iris-11"
            >
              {category}
            </span>
          ))}
        </div>
        <h1 className="mt-4 mb-3 -translate-x-px font-features-['palt'] text-2xl leading-normal lg:text-3xl">
          {post.title}
        </h1>
        <div className="grid font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11 uppercase">
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
    </article>
  )
}
