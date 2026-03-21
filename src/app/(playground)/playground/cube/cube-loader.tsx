'use client'

import dynamic from 'next/dynamic'

const CubeScene = dynamic(() => import('./cube').then((mod) => mod.CubeScene), {
  ssr: false,
})

export default function CubeLoader() {
  return <CubeScene />
}
