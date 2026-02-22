import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'

import { CommandMenu } from '@/components/command-menu'
import { getAllPosts } from '@/lib/mdx'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

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
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-xl font-bold">
              osgsm
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
      </body>
    </html>
  )
}
