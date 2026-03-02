'use client'

import { Suspense, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/cn'
import { sleep } from '@/lib/sleep'
import DecryptedText from '@/components/decrypted-text'

import type { PostMeta } from '@/lib/mdx'

type PostItemProps = {
  post: PostMeta
  basePath: string
}

export function PostItem({ post, basePath }: PostItemProps) {
  const dateString = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <li className="">
      <Link
        href={`${basePath}/${post.slug}`}
        className="group -mx-1 grid gap-2 rounded-3xl border border-border bg-iris-3 p-6 pt-5 transition-colors hover:bg-iris-4 dark:bg-iris-2 dark:hover:bg-iris-3"
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="leading-normal md:text-lg">{post.title}</h2>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          {post.categories && post.categories.length > 0 && (
            <div className="relative -left-0.5 flex flex-wrap gap-1.5">
              {post.categories.map((category) => (
                <span
                  key={category}
                  className="rounded-lg bg-iris-4 px-2 py-0.5 font-sans text-sm tracking-wide text-iris-11 transition-colors group-hover:bg-iris-5 dark:bg-iris-3 dark:group-hover:bg-iris-4"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
          <div className="font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11 uppercase">
            {dateString}
          </div>
        </div>
        {post.description && (
          <p className="mt-2 text-sm text-iris-11">{post.description}</p>
        )}
      </Link>
    </li>
  )
}

type Props = {
  title: string
  description: string
  basePath: string
  posts: PostMeta[]
  categories: string[]
}

function PostListContent({
  title,
  description,
  basePath,
  posts,
  categories,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')
  const [isFading, setIsFading] = useState(false)
  const fadeTimeoutRef = useRef<NodeJS.Timeout>(undefined)

  const filteredPosts = activeCategory
    ? posts.filter((post) => post.categories?.includes(activeCategory))
    : posts

  async function navigateWithFade(href: string) {
    clearTimeout(fadeTimeoutRef.current)
    setIsFading(true)
    await sleep(100)
    router.push(href, { scroll: false })
    await sleep(50)
    setIsFading(false)
  }

  function handleCategoryClick(category: string) {
    if (activeCategory === category) {
      navigateWithFade(basePath)
    } else {
      navigateWithFade(`${basePath}?category=${encodeURIComponent(category)}`)
    }
  }

  return (
    <div>
      <header className="mt-16 mb-16">
        <h1 className="mb-2 -translate-x-px text-2xl leading-normal lg:text-3xl">
          {title}
          <span className="ml-2 font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11">
            <DecryptedText
              animateOn="view"
              text={String(posts.length)}
              speed={30}
            />
          </span>
        </h1>
        <p className="font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11 uppercase">
          <DecryptedText
            animateOn="view"
            text={description}
            sequential
            speed={30}
            useOriginalCharsOnly
          />
        </p>
      </header>

      {categories.length > 0 && (
        <div className="mb-10 grid gap-3">
          <div className="font-pixel-circle text-xs font-bold tracking-wider text-iris-10 uppercase">
            Category:
          </div>
          <div className="relative -left-0.5 flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                if (activeCategory === null) return
                navigateWithFade(basePath)
              }}
              className={cn(
                'rounded-lg px-2 py-0.5 font-sans text-sm tracking-wide transition-colors',
                activeCategory === null
                  ? 'bg-iris-5 text-iris-12 dark:bg-iris-5'
                  : 'bg-iris-4/75 text-iris-11 hover:bg-iris-5 dark:bg-iris-3 dark:hover:bg-iris-6'
              )}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={cn(
                  'rounded-lg px-2 py-0.5 font-sans text-sm tracking-wide transition-colors',
                  activeCategory === category
                    ? 'bg-iris-5 text-iris-12 dark:bg-iris-4'
                    : 'bg-iris-4/75 text-iris-11 hover:bg-iris-5 dark:bg-iris-3 dark:hover:bg-iris-4'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      <ul
        className={cn(
          'grid gap-3 transition-opacity duration-200',
          isFading && 'opacity-0'
        )}
      >
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostItem key={post.slug} post={post} basePath={basePath} />
          ))
        ) : (
          <li className="text-iris-11">No posts found.</li>
        )}
      </ul>
    </div>
  )
}

export function PostList(props: Props) {
  return (
    <Suspense>
      <PostListContent {...props} />
    </Suspense>
  )
}
