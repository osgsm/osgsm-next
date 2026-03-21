import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { GeistPixelSquare, GeistPixelCircle } from 'geist/font/pixel'
import { Instrument_Serif } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

const title = 'osgsm.io'
const description = "Shogo Oshima's personal website"

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s | ${title}`,
  },
  description: description,
  openGraph: {
    url: 'https://osgsm.io',
    siteName: 'osgsm.io',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelCircle.variable} ${GeistPixelSquare.variable} ${instrumentSerif.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
