'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMotionValueEvent, useScroll } from 'motion/react'
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

  const scrollRef = useRef<HTMLUListElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const { scrollXProgress } = useScroll({ container: scrollRef, axis: 'x' })

  useMotionValueEvent(scrollXProgress, 'change', (v) => {
    setCanScrollLeft(v > 0.01)
    setCanScrollRight(v < 0.99)
  })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const check = () => {
      if (el.scrollWidth > el.clientWidth) {
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
      }
    }
    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <header className="sticky top-0 z-40 from-iris-1 via-iris-1/25 via-80% to-transparent pb-5 font-sans text-sm text-iris-9 md:text-base dark:bg-linear-to-b">
      <div className="mx-auto max-w-3xl">
        <nav className="flex items-center justify-between gap-2 px-3.5 py-3">
          <Link
            href="/"
            className={cn(
              'group block shrink-0 rounded-full border border-iris-5 bg-iris-4 p-0.5 leading-none text-iris-11 backdrop-blur-sm',
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
            <div className="relative flex items-center overflow-hidden rounded-full border border-border bg-iris-4 p-0.5 transition-colors">
              <ul
                ref={scrollRef}
                className="hide-scrollbar flex overflow-x-auto"
              >
                {[
                  {
                    href: '/blog',
                    label: 'blog',
                  },
                  {
                    href: '/note',
                    label: 'note',
                  },
                  {
                    href: '/about',
                    label: 'about',
                  },
                ].map(({ href, label }) => {
                  const isActive = pathname.startsWith(href)

                  return (
                    <li className="shrink-0" key={label}>
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
              <span
                className={cn(
                  'pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-iris-4 to-transparent transition-opacity min-[442px]:opacity-0!',
                  canScrollLeft ? 'opacity-100' : 'opacity-0'
                )}
              />
              <span
                className={cn(
                  'pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-iris-4 to-transparent transition-opacity min-[442px]:opacity-0!',
                  canScrollRight ? 'opacity-100' : 'opacity-0'
                )}
              />
            </div>
            <CommandMenu blogPosts={blogPosts} notePosts={notePosts} />
          </div>
        </nav>
      </div>
    </header>
  )
}
