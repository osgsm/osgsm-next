'use client'

import dynamic from 'next/dynamic'

const ParticlesScene = dynamic(
  () => import('./particles').then((mod) => mod.ParticlesScene),
  { ssr: false }
)

export default function ParticlesLoader() {
  return <ParticlesScene />
}
