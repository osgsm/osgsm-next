'use client'

import { cn } from '@/lib/cn'
import { ThemeToggle } from '@/components/theme-toggle'

export function Footer() {
  return (
    <footer className="mt-auto pt-16 font-sans text-sm/[1.125rem] text-iris-10 dark:text-iris-8">
      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between px-3.5 py-4'
        )}
      >
        <div>
          <p>&copy; Shogo Oshima</p>
          <p className="grid text-iris-10 opacity-85 dark:opacity-75">
            <span>
              <span className="italic">Built with </span>☕
              <span className="italic"> in Osaka, Japan</span>
            </span>
          </p>
        </div>
        <ThemeToggle />
      </div>
    </footer>
  )
}
