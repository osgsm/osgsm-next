import Link from 'next/link'

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <Link
        className="absolute top-2.5 left-2.5 z-10 text-iris-10"
        href="/playground/"
      >
        ← Back to playground
      </Link>
      <main className="flex-1">{children}</main>
    </div>
  )
}
