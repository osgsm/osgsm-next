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
          <header className="font-pixel-circle text-sm font-bold tracking-widest uppercase">
            <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
              <Link href="/" className="">
                osgsm.io
              </Link>
              <div className="flex items-center gap-6">
                <ul className="flex gap-6">
                  <li>
                    <Link href="/blog" className="hover:underline">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/note" className="hover:underline">
                      Note
                    </Link>
                  </li>
                </ul>
                <CommandMenu blogPosts={blogPosts} notePosts={notePosts} />
              </div>
            </nav>
          </header>
          <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
