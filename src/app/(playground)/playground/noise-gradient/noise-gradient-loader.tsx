'use client'

import dynamic from 'next/dynamic'

const NoiseGradientScene = dynamic(
  () => import('./noise-gradient').then((mod) => mod.NoiseGradientScene),
  { ssr: false }
)

export default function NoiseGradientLoader() {
  return <NoiseGradientScene />
}
