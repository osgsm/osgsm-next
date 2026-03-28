import type { Metadata } from 'next'
import PixelDissolveLoader from './pixel-dissolve-loader'

export const metadata: Metadata = {
  title: 'Pixel Dissolve Slider',
}

export default function PixelDissolvePage() {
  return (
    <div className="fixed inset-0 bg-iris-3 dark:bg-iris-2">
      <PixelDissolveLoader />
    </div>
  )
}
