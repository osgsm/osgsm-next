'use client'

import dynamic from 'next/dynamic'

const RippleDistortionScene = dynamic(
  () => import('./ripple-distortion').then((mod) => mod.RippleDistortionScene),
  { ssr: false }
)

export default function RippleDistortionLoader() {
  return <RippleDistortionScene />
}
