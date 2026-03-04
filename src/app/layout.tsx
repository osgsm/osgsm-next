import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { GeistPixelSquare, GeistPixelCircle } from 'geist/font/pixel'
import { Instrument_Serif } from 'next/font/google'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
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
          <Header blogPosts={blogPosts} notePosts={notePosts} />
          <main className="mx-auto w-full max-w-3xl px-6 py-8">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
