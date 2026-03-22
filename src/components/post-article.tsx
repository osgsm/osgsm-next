import type { Post, PostType } from '@/lib/mdx'
import { ArrowLeft } from 'lucide-react'
import { MDXContent } from '@/components/mdx-content'
import { Button } from '@/components/button'
import DecryptedText from '@/components/decrypted-text'

type Props = {
  post: Post
  type: PostType
}

export function PostArticle({ post, type }: Props) {
  const dateString = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <article>
        <header className="my-16">
          <div className="relative -left-1 flex flex-wrap gap-1.5 text-iris-11">
            {post.categories?.map((category) => (
              <span
                key={category}
                className="rounded-lg bg-iris-4/75 px-2 py-0.5 font-sans text-sm tracking-wide text-iris-11 dark:bg-iris-3"
              >
                {category}
              </span>
            ))}
          </div>
          <h1 className="mt-4 mb-3 -translate-x-px text-xl leading-normal lg:text-3xl">
            {post.title}
          </h1>
          <div className="grid font-pixel-circle text-xs font-bold tracking-wider text-iris-11 uppercase">
            <DecryptedText
              animateOn="view"
              text={dateString}
              sequential
              speed={30}
              useOriginalCharsOnly
            />
          </div>
        </header>
        <div className="prose dark:prose-invert max-w-none">
          <MDXContent source={post.content} />
        </div>
      </article>
      <Button className="mt-16 leading-tight text-iris-11" href={`/${type}`}>
        <ArrowLeft className="size-3" />
        <span>back to {type}</span>
      </Button>
    </div>
  )
}
