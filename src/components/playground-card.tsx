import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/cn'
import type { PlaygroundItem } from '@/lib/playground'

export function PlaygroundCard({
  title,
  description,
  href,
  thumbnail,
}: PlaygroundItem) {
  return (
    <Link
      href={href}
      className="group relative -mx-1 overflow-clip rounded-3xl border border-border p-1 transition-colors hover:border-iris-7"
    >
      <div className="relative aspect-video overflow-clip rounded-[1.25rem]">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="rounded-[1.25rem] object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center font-pixel-circle text-sm font-bold tracking-wider text-iris-10 uppercase">
            No image
          </div>
        )}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 mx-4 rounded-3xl bg-linear-to-b from-transparent to-mauve-12/80 pt-8 pb-3 text-iris-5',
            'dark:to-iris-1/90 dark:text-iris-12'
          )}
        >
          <h2 className="text-sm font-medium">{title}</h2>
          <p className="text-xs">{description}</p>
        </div>
      </div>
    </Link>
  )
}
