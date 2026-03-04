'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CommandMenu } from '@/components/command-menu'
import { cn } from '@/lib/cn'
import type { PostMeta } from '@/lib/mdx'

export function Header({
  blogPosts,
  notePosts,
}: {
  blogPosts: PostMeta[]
  notePosts: PostMeta[]
}) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header className="sticky top-0 z-40 from-iris-1 via-iris-1/25 via-80% to-transparent pb-5 font-sans text-sm text-iris-9 md:text-base dark:bg-linear-to-b">
      <div className="mx-auto max-w-3xl">
        <nav className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-3">
          <Link
            href="/"
            className={cn(
              'group block rounded-full border border-iris-5 bg-iris-4 p-0.5 leading-none text-iris-11 backdrop-blur-sm',
              'transition-colors',
              'hover:text-iris-12'
            )}
          >
            <span
              className={cn(
                'block rounded-full border bg-iris-3 px-3 py-1.5 leading-none text-iris-11 transition-colors',
                isHome
                  ? 'border-iris-7'
                  : 'border-iris-5 group-hover:border-iris-7 group-hover:text-iris-12'
              )}
            >
              <span className="block -translate-y-px">osgsm.io</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center rounded-full border border-border bg-iris-4 p-0.5 transition-colors">
              <ul className="flex">
                {[
                  {
                    href: '/blog',
                    label: 'blog',
                  },
                  {
                    href: '/note',
                    label: 'note',
                  },
                ].map(({ href, label }) => {
                  const isActive = pathname.startsWith(href)

                  return (
                    <li key={label}>
                      <Link
                        href={href}
                        className={cn(
                          'group block rounded-full border bg-iris-3 px-3 py-1.5 leading-none text-iris-11 backdrop-blur-sm transition-colors',
                          isActive
                            ? 'border-iris-7'
                            : 'border-iris-5 hover:border-iris-7 hover:text-iris-12'
                        )}
                      >
                        <span className="block -translate-y-px">{label}</span>
                      </Link>
                    </li>
                  )
                })}
                <li>
                  <span className="block rounded-full border border-iris-5 bg-iris-3 px-3 py-1.5 leading-none text-iris-11 opacity-50 backdrop-blur-sm">
                    <s className="block -translate-y-px text-mauve-10">
                      playground
                    </s>
                  </span>
                </li>
              </ul>
            </div>
            <CommandMenu blogPosts={blogPosts} notePosts={notePosts} />
          </div>
        </nav>
      </div>
    </header>
  )
}
