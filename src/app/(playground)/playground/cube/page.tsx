import type { Metadata } from 'next'
import CubeLoader from './cube-loader'

export const metadata: Metadata = {
  title: 'Perfectly Ordinary Cube',
  openGraph: {
    images: [
      {
        url: 'https://osgsm.io/images/playground/index/cube.png',
        width: 1920,
        height: 1080,
      },
    ],
  },
}

export default function CubePage() {
  return (
    <div className="fixed inset-0 bg-iris-3 dark:bg-iris-2">
      <CubeLoader />
    </div>
  )
}
