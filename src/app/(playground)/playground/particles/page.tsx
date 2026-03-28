import type { Metadata } from 'next'
import ParticleLoader from './particles-loader'

export const metadata: Metadata = {
  title: 'GPGPU Particles',
  openGraph: {
    images: [
      {
        url: 'https://osgsm.io/images/playground/index/particles.gif',
        width: 800,
        height: 450,
      },
    ],
  },
}

export default function ParticlesPage() {
  return (
    <div className="fixed inset-0 bg-iris-3 dark:bg-iris-2">
      <ParticleLoader />
    </div>
  )
}
