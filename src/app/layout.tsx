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
          <header className="sticky top-0 z-40 from-iris-1 via-iris-1/25 via-80% to-transparent pb-5 font-sans text-iris-9 dark:bg-linear-to-b">
            <div className="mx-auto max-w-3xl lg:px-1">
              <nav className="flex items-center justify-between px-2 py-3">
                <Link
                  href="/"
                  className="block rounded-full border border-iris-5 bg-iris-3 px-3 py-1.5 leading-none text-iris-11 backdrop-blur-sm"
                >
                  <span className="block -translate-y-px">osgsm.io</span>
                </Link>
                <div className="flex items-center">
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
                    ].map(({ href, label }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="block rounded-full border border-iris-5 bg-iris-3 px-3 py-1.5 leading-none text-iris-11 backdrop-blur-sm"
                        >
                          <span className="block -translate-y-px">{label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <CommandMenu blogPosts={blogPosts} notePosts={notePosts} />
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
