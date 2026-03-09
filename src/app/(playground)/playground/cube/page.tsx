'use client'

import dynamic from 'next/dynamic'

const CubeScene = dynamic(
  () => import('@/components/playground/cube').then((mod) => mod.CubeScene),
  { ssr: false }
)

export default function CubePage() {
  return (
    <div className="fixed inset-0 bg-iris-3 dark:bg-iris-2">
      <CubeScene />
    </div>
  )
}
