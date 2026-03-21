'use client'

import dynamic from 'next/dynamic'

const GradientScene = dynamic(
  () => import('./gradient').then((mod) => mod.GradientScene),
  { ssr: false }
)

export default function GradientLoader() {
  return <GradientScene />
}
