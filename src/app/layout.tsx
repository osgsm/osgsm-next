import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
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
          </nav>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
