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
    title: 'Curl Noise Flow Field',
    description: null,
    href: '/playground/flow-field',
    thumbnail: '/playground/flow-field.png',
  },
  {
    title: 'GPGPU Particles',
    description: null,
    href: '/playground/particles',
    thumbnail: '/playground/particles.gif',
  },
  {
    title: 'Noise Gradient with TSL',
    description: null,
    href: '/playground/noise-gradient',
    thumbnail: '/playground/noise-gradient.png',
  },
  {
    title: 'Perfectly Ordinary Cube',
    description: null,
    href: '/playground/cube',
    thumbnail: '/playground/cube.png',
  },
]

export default function PlaygroundPage() {
  return (
    <div className="mx-auto w-full max-w-360 px-4 py-8 md:px-6">
      <header className="mt-16 mb-16 px-2 md:px-4">
        <h1 className="mb-2 -translate-x-px text-2xl leading-normal lg:text-3xl">
          Playground
          <span className="ml-2 font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11">
            <DecryptedText
              animateOn="view"
              text={String(items.length)}
              speed={30}
            />
          </span>
        </h1>
        <p className="font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11 uppercase">
          <DecryptedText
            animateOn="view"
            text="Built for fun, not profit"
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
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-b from-transparent to-mauve-12/50 px-4 py-3 text-iris-5 dark:to-iris-1/25 dark:text-iris-12/90">
                <h2 className="text-sm font-medium">{item.title}</h2>
                <p className="text-xs">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
