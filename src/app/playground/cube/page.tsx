'use client'

import dynamic from 'next/dynamic'

const CubeScene = dynamic(
  () =>
    import('@/components/playground/cube-scene').then((mod) => mod.CubeScene),
  { ssr: false }
)

export default function CubePage() {
  return (
    <div className="-mx-6 -mt-8 -mb-8 h-dvh bg-iris-3 dark:bg-iris-2">
      <CubeScene />
    </div>
  )
}
