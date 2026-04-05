'use client'

import dynamic from 'next/dynamic'

const NoiseWipeScene = dynamic(
  () => import('./noise-wipe').then((mod) => mod.NoiseWipeScene),
  { ssr: false }
)

export default function NoiseWipeLoader() {
  return <NoiseWipeScene />
}
