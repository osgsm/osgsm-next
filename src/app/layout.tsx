import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { GeistPixelSquare, GeistPixelCircle } from 'geist/font/pixel'
import Link from 'next/link'

import { CommandMenu } from '@/components/command-menu'
import { Footer } from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'
import { getAllPosts } from '@/lib/mdx'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'osgsm',
    template: '%s | osgsm',
  },
  description: 'Personal portfolio and blog',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const blogPosts = getAllPosts('blog')
  const notePosts = getAllPosts('note')

  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelCircle.variable} ${GeistPixelSquare.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="sticky top-0 z-40 bg-linear-to-b from-iris-2 to-transparent to-80% py-3 font-pixel-circle text-sm font-bold tracking-wide">
            <div className="mx-auto max-w-3xl px-3 lg:px-2">
              <nav className="flex items-center justify-between border border-border bg-iris-2/75 px-2 py-1 backdrop-blur-sm dark:backdrop-brightness-50">
                <Link
                  href="/"
                  className="block h-7 px-2 py-1 text-sm tracking-wider"
                >
                  osgsm.io
                </Link>
                <div className="flex items-center">
                  <ul className="flex">
                    {[
                      {
                        href: '/blog',
                        label: 'Blog',
                      },
                      {
                        href: '/note',
                        label: 'Note',
                      },
                    ].map(({ href, label }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="block h-7 px-2 py-1 text-sm"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <CommandMenu
                        blogPosts={blogPosts}
                        notePosts={notePosts}
                      />
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
