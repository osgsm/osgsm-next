'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import type { Mesh } from 'three'
import { Scene } from '@/components/playground/scene'

function SpinningCube() {
  const meshRef = useRef<Mesh>(null)

  const { color, wireframe, metalness, roughness } = useControls({
    Appearance: folder({
      color: '#6e56cf',
      wireframe: false,
      metalness: { value: 0.1, min: 0, max: 1 },
      roughness: { value: 0.4, min: 0, max: 1 },
    }),
  })

  const { size } = useControls({
    Geometry: folder({
      size: { value: 1.5, min: 0.5, max: 3 },
    }),
  })

  const { speedX, speedY } = useControls({
    Animation: folder({
      speedX: { value: 0.4, min: -2, max: 2 },
      speedY: { value: 0.6, min: -2, max: 2 },
    }),
  })

  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += speedX * delta
    meshRef.current.rotation.y += speedY * delta
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial
        color={color}
        wireframe={wireframe}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  )
}

export function CubeScene() {
  return (
    <Scene leva={{ titleBar: { title: 'Cube Controls' } }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} />
      <SpinningCube />
    </Scene>
  )
}
