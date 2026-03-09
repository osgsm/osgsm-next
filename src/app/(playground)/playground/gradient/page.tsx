'use client'

import dynamic from 'next/dynamic'

const GradientScene = dynamic(
  () =>
    import('@/components/playground/gradient').then((mod) => mod.GradientScene),
  { ssr: false }
)

export default function GradientPage() {
  return (
    <div className="fixed inset-0 bg-iris-3 dark:bg-iris-2">
      <GradientScene />
    </div>
  )
}
