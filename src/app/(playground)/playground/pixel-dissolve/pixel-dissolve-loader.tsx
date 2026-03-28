'use client'

import dynamic from 'next/dynamic'

const PixelDissolveScene = dynamic(
  () => import('./pixel-dissolve').then((mod) => mod.PixelDissolveScene),
  { ssr: false }
)

export default function PixelDissolveLoader() {
  return <PixelDissolveScene />
}
