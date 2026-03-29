import type { Metadata } from 'next'
import RippleDistortionLoader from './ripple-distortion-loader'

export const metadata: Metadata = {
  title: 'Ripple Distortion Slider',
}

export default function RippleDistortionPage() {
  return (
    <div className="fixed inset-0 bg-iris-3 dark:bg-iris-2">
      <RippleDistortionLoader />
    </div>
  )
}
