import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { GeistPixelSquare, GeistPixelCircle } from 'geist/font/pixel'
import { Instrument_Serif } from 'next/font/google'
import Link from 'next/link'

import { CommandMenu } from '@/components/command-menu'
import { Footer } from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'
import { cn } from '@/lib/cn'
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
    default: 'osgsm.io',
    template: '%s | osgsm.io',
  },
  description: "Shogo Oshima's personal website",
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
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="sticky top-0 z-40 from-iris-1 via-iris-1/25 via-80% to-transparent pb-5 font-sans text-sm text-iris-9 md:text-base dark:bg-linear-to-b">
            <div className="mx-auto max-w-3xl">
              <nav className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-3">
                <Link
                  href="/"
                  className="group block rounded-full border border-iris-5 bg-iris-4 p-0.5 leading-none text-iris-11 backdrop-blur-sm"
                >
                  <span className="block rounded-full border border-iris-5 bg-iris-3 px-3 py-1.5 leading-none text-iris-11 transition-colors group-hover:border-iris-6 group-hover:bg-iris-5">
                    <span className="block -translate-y-px transition-colors group-hover:text-iris-12">
                      osgsm.io
                    </span>
                  </span>
                </Link>
                <div className="ml-auto flex items-center gap-2">
                  <div className="flex items-center rounded-full border border-border bg-iris-4 p-0.5">
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
                            className={cn(
                              'group block rounded-full border border-iris-5 bg-iris-3 px-3 py-1.5 leading-none text-iris-11 backdrop-blur-sm',
                              'transition-colors',
                              'hover:border-iris-6 hover:bg-iris-5'
                            )}
                          >
                            <span className="block -translate-y-px transition-colors group-hover:text-iris-12">
                              {label}
                            </span>
                          </Link>
                        </li>
                      ))}
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
          <main className="mx-auto w-full max-w-3xl px-6 py-8">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
