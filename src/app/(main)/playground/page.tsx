import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import DecryptedText from '@/components/decrypted-text'

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Where ideas go to play',
}

const items = [
  {
    title: 'Noise Gradient with TSL',
    description: null,
    href: '/playground/noise-gradient',
    thumbnail: '/playground/noise-gradient.png',
  },
  {
    title: 'Linear Gradient with TSL',
    description: null,
    href: '/playground/gradient',
    thumbnail: '/playground/gradient.png',
  },
  {
    title: 'Perfectly ordinary cube',
    description: null,
    href: '/playground/cube',
    thumbnail: '/playground/cube.png',
  },
]

export default function PlaygroundPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <header className="mt-16 mb-16 px-1">
        <h1 className="mb-2 -translate-x-px text-2xl leading-normal lg:text-3xl">
          Playground
        </h1>
        <p className="font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11 uppercase">
          <DecryptedText
            animateOn="view"
            text="Ship first, think later"
            sequential
            speed={30}
            useOriginalCharsOnly
          />
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative overflow-hidden rounded-3xl border border-border p-1 transition-colors hover:border-iris-7"
          >
            <div className="relative aspect-video overflow-clip rounded-[1.25rem] bg-iris-3 dark:bg-iris-2">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center font-pixel-circle text-sm font-bold tracking-wider text-iris-10 uppercase">
                  No image
                </div>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-b from-transparent to-iris-1/25 px-5 py-4 pt-4">
              <h2 className="text-sm font-medium text-iris-12">{item.title}</h2>
              <p className="text-xs text-iris-10">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
