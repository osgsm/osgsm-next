'use client'

import dynamic from 'next/dynamic'

const ParticlesScene = dynamic(
  () =>
    import('@/components/playground/particles').then(
      (mod) => mod.ParticlesScene
    ),
  { ssr: false }
)

export default function ParticlesPage() {
  return (
    <div className="fixed inset-0 bg-iris-3 dark:bg-iris-2">
      <ParticlesScene />
    </div>
  )
}
