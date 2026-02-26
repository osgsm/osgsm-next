import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { GeistPixelSquare, GeistPixelCircle } from 'geist/font/pixel'
import { Instrument_Serif } from 'next/font/google'
import Link from 'next/link'

import { CommandMenu } from '@/components/command-menu'
import { Footer } from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'
import { getAllPosts } from '@/lib/mdx'

import './globals.css'

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
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
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelCircle.variable} ${GeistPixelSquare.variable} ${instrumentSerif.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="sticky top-0 z-40 bg-linear-to-b from-iris-2 via-iris-2/25 via-80% to-transparent pb-5 font-serif text-iris-10">
            <div className="mx-auto max-w-3xl lg:px-1">
              <nav className="flex items-center justify-between px-2 py-1">
                <Link href="/" className="block px-2 py-1 text-xl">
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
                        <Link href={href} className="block px-2 py-1 text-lg">
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
