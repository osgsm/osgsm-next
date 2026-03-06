'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Leva } from 'leva'
import { SpinningCube } from '@/components/playground/spinning-cube'

export function CubeScene() {
  return (
    <div className="relative h-full">
      <Canvas
        camera={{ position: [2.5, 2, 3.5], fov: 50 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-3, 2, -2]} intensity={0.3} />
        <SpinningCube />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>
      <Leva
        titleBar={{ title: 'Cube Controls' }}
        collapsed={false}
        oneLineLabels
      />
    </div>
  )
}
