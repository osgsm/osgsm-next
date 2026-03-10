'use client'

import type { ComponentProps, ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import {
  LevaPanel,
  type LevaPanelProps,
} from '@/components/playground/leva-panel'

type SceneProps = {
  children: ReactNode
  camera?: ComponentProps<typeof Canvas>['camera']
  gl?: ComponentProps<typeof Canvas>['gl']
  className?: string
  orbitControls?: boolean | ComponentProps<typeof OrbitControls>
  leva?: LevaPanelProps
}

export function Scene({
  children,
  camera = { position: [2.5, 2, 3.5], fov: 50 },
  gl = { antialias: true },
  className,
  orbitControls = true,
  leva,
}: SceneProps) {
  return (
    <div className={className ?? 'relative h-full'}>
      <Canvas camera={camera} gl={gl}>
        {children}
        {orbitControls !== false && (
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={10}
            {...(typeof orbitControls === 'object' ? orbitControls : {})}
          />
        )}
      </Canvas>
      <LevaPanel {...leva} />
    </div>
  )
}
