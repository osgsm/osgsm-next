'use client'

import dynamic from 'next/dynamic'

const FlowFieldScene = dynamic(
  () => import('./flow-field').then((mod) => mod.FlowFieldScene),
  { ssr: false }
)

export default function FlowFieldLoader() {
  return <FlowFieldScene />
}
