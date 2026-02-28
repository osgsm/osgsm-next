'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import type { PostMeta } from '@/lib/mdx'

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

  const filteredPosts = activeCategory
    ? posts.filter((post) => post.categories?.includes(activeCategory))
    : posts

  function handleCategoryClick(category: string) {
    if (activeCategory === category) {
      router.push(basePath, { scroll: false })
    } else {
      router.push(`${basePath}?category=${encodeURIComponent(category)}`, {
        scroll: false,
      })
    }
  }

  return (
    <div>
      <header className="mt-20 mb-10">
        <h1 className="mb-3 -translate-x-px font-features-['palt'] text-2xl leading-normal lg:text-3xl">
          {title}
          <span className="ml-2 font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11">
            ({posts.length})
          </span>
        </h1>
        <p className="font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11 uppercase">
          {description}
        </p>
      </header>

      {categories.length > 0 && (
        <div className="relative -left-1 mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`rounded-lg px-2 py-0.5 font-sans text-sm tracking-wide transition-colors ${
                activeCategory === category
                  ? 'bg-iris-5 text-iris-12'
                  : 'bg-iris-3 text-iris-11'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <ul>
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <li key={post.slug} className="border-t border-border py-6">
              <Link href={`${basePath}/${post.slug}`} className="group block">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-features-['palt'] text-lg group-hover:text-iris-11">
                    {post.title}
                  </h2>
                  <ArrowRight
                    size={16}
                    className="mt-1 shrink-0 text-iris-11 transition-colors group-hover:text-iris-12"
                  />
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {post.categories && post.categories.length > 0 && (
                    <div className="relative -left-1 flex flex-wrap gap-1.5">
                      {post.categories.map((category) => (
                        <span
                          key={category}
                          className="rounded-lg bg-iris-3 px-2 py-0.5 font-sans text-sm tracking-wide text-iris-11"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                  <time className="font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11 uppercase">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
                {post.description && (
                  <p className="mt-2 text-sm text-iris-11">
                    {post.description}
                  </p>
                )}
              </Link>
            </li>
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
