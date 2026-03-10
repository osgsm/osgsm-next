import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/button'

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <Button
        className="absolute top-2.5 left-2.5 z-10 leading-tight text-iris-11"
        href="/playground"
      >
        <ArrowLeft className="size-3" />
        <span>back to playground</span>
      </Button>
      <main className="flex-1">{children}</main>
    </div>
  )
}
