'use client'

import dynamic from 'next/dynamic'

const NoiseGradientScene = dynamic(
  () =>
    import('@/components/playground/noise-gradient').then(
      (mod) => mod.NoiseGradientScene
    ),
  { ssr: false }
)

export default function NoiseGradientPage() {
  return (
    <div className="fixed inset-0 bg-iris-3 dark:bg-iris-2">
      <NoiseGradientScene />
    </div>
  )
}
