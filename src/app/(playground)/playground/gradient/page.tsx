import type { Metadata } from 'next'
import GradientLoader from './gradient-loader'

export const metadata: Metadata = {
  title: 'Gradient',
}

export default function GradientPage() {
  return (
    <div className="fixed inset-0 bg-iris-3 dark:bg-iris-2">
      <GradientLoader />
    </div>
  )
}
