import type { Post } from '@/lib/mdx'
import { GiscusComments } from '@/components/giscus-comments'
import { MDXContent } from '@/components/mdx-content'

type Props = {
  post: Post
}

export function PostArticle({ post }: Props) {
  return (
    <article>
      <header className="mt-20 mb-10">
        <div className="relative flex flex-wrap gap-3">
          {post.categories?.map((category) => (
            <span
              key={category}
              className="bg-iris-3 px-1.5 font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider"
            >
              {category}
            </span>
          ))}
        </div>
        <h1 className="mt-4 mb-3 -translate-x-px text-2xl leading-normal lg:text-3xl">
          {post.title}
        </h1>
        <div className="grid font-pixel-circle text-[0.8125rem]/[1.75] tracking-wider">
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
