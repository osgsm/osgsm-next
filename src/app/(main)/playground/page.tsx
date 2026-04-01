import type { Metadata } from 'next'
import DecryptedText from '@/components/decrypted-text'
import { PlaygroundCard } from '@/components/playground-card'
import { playgroundItems } from '@/lib/playground'

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Where ideas go to play',
}

export default function PlaygroundPage() {
  return (
    <div className="mx-auto w-full max-w-360 px-4 py-8 md:px-6">
      <header className="mt-16 mb-16 px-2 md:px-4">
        <h1 className="mb-2 -translate-x-px text-2xl leading-normal lg:text-3xl">
          Playground
          <span className="ml-2 font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11">
            <DecryptedText
              animateOn="view"
              text={String(playgroundItems.length)}
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
        {playgroundItems.map((item) => (
          <PlaygroundCard key={item.href} {...item} />
        ))}
      </div>
    </div>
  )
}
