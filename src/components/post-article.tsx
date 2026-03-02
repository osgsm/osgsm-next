import type { Post } from '@/lib/mdx'
import { MDXContent } from '@/components/mdx-content'
import DecryptedText from '@/components/decrypted-text'

type Props = {
  post: Post
}

export function PostArticle({ post }: Props) {
  const dateString = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return (
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
        <div className="grid font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11 uppercase">
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
  )
}
