import Link from 'next/link'
import Image from 'next/image'

const items = [
  {
    title: 'Cube',
    description: null,
    href: '/playground/cube',
    thumbnail: null,
  },
  {
    title: 'Gradient',
    description: null,
    href: '/playground/gradient',
    thumbnail: null,
  },
]

export default function PlaygroundPage() {
  return (
    <div className="mx-auto mt-16 grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-8 sm:grid-cols-2 md:grid-cols-3 md:px-6">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group relative overflow-hidden rounded-2xl border border-border p-2 transition-colors hover:border-iris-7"
        >
          <div className="relative aspect-video bg-iris-3 dark:bg-iris-2">
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
          <div className="absolute bottom-0 left-0 p-4">
            <h2 className="text-sm font-medium text-iris-11">{item.title}</h2>
            <p className="text-xs text-iris-10">{item.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
