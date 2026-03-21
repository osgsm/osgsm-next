import type { Metadata } from 'next'
import NoiseGradientLoader from './noise-gradient-loader'

export const metadata: Metadata = {
  title: 'Noise Gradient with TSL',
}

export default function NoiseGradientPage() {
  return (
    <div className="fixed inset-0 bg-iris-3 dark:bg-iris-2">
      <NoiseGradientLoader />
    </div>
  )
}
