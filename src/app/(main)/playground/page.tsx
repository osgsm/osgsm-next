import Link from 'next/link'
import Image from 'next/image'

const items = [
  {
    title: 'Cube',
    description: 'A spinning cube with interactive controls',
    href: '/playground/cube',
    thumbnail: '/images/playground/cube.gif',
  },
]

export default function PlaygroundPage() {
  return (
    <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group overflow-hidden rounded-2xl border border-border transition-colors hover:border-iris-7"
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
              <div className="flex h-full items-center justify-center text-sm text-iris-11">
                Preview
              </div>
            )}
          </div>
          <div className="px-3 py-2">
            <h2 className="text-sm font-medium">{item.title}</h2>
            <p className="text-xs text-iris-11">{item.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
