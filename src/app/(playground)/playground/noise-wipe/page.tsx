import type { Metadata } from 'next'
import NoiseWipeLoader from './noise-wipe-loader'

export const metadata: Metadata = {
  title: 'Noise Wipe Slider',
}

export default function NoiseWipePage() {
  return (
    <div className="fixed inset-0 bg-iris-3 dark:bg-iris-2">
      <NoiseWipeLoader />
    </div>
  )
}
