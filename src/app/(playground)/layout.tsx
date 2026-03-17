import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/button'

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 z-10 mx-auto max-w-7xl px-3.5 py-3">
        <Button className="leading-tight text-iris-11" href="/playground">
          <ArrowLeft className="size-3" />
          <span>back to playground</span>
        </Button>
      </div>
      <main className="flex-1">{children}</main>
    </div>
  )
}
