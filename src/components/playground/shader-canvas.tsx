'use client'

import { useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import {
  LevaPanel,
  type LevaPanelProps,
} from '@/components/playground/leva-panel'
import { WebGPURenderer, MeshBasicNodeMaterial, Vector2 } from 'three/webgpu'
import { uniform } from 'three/tsl'

type ColorNode = NonNullable<MeshBasicNodeMaterial['colorNode']>

export type ShaderCanvasProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createColorNodeAction: (params: { resolution: any; mouse: any }) => ColorNode
  leva?: LevaPanelProps
  className?: string
}

function ShaderPlane({
  createColorNodeAction,
}: Pick<ShaderCanvasProps, 'createColorNodeAction'>) {
  const size = useThree((s) => s.size)
  const gl = useThree((s) => s.gl)

  const resolution = useMemo(
    () => uniform(new Vector2(size.width, size.height)),
    [size.width, size.height]
  )
  const mouse = useMemo(() => uniform(new Vector2(0, 0)), [])

  const material = useMemo(() => {
    const mat = new MeshBasicNodeMaterial()
    mat.colorNode = createColorNodeAction({ resolution, mouse })
    return mat
  }, [createColorNodeAction, resolution, mouse])

  useEffect(() => {
    resolution.value.set(size.width, size.height)
  }, [size, resolution])

  useEffect(() => {
    const canvas = gl.domElement
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.value.set(
        e.clientX - rect.left,
        rect.height - (e.clientY - rect.top)
      )
    }
    canvas.addEventListener('mousemove', handleMouseMove)
    return () => canvas.removeEventListener('mousemove', handleMouseMove)
  }, [gl, mouse])

  useEffect(() => {
    return () => {
      try {
        material.dispose()
      } catch {
        // nodeBuilderState may already be cleared during navigation
      }
    }
  }, [material])

  return (
    <mesh>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

export function ShaderCanvas({
  createColorNodeAction,
  leva: levaProps,
  className,
}: ShaderCanvasProps) {
  return (
    <div className={className ?? 'relative h-full'}>
      <Canvas
        gl={async (props) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const renderer = new WebGPURenderer(props as any)
          await renderer.init()
          return renderer
        }}
      >
        <OrthographicCamera
          makeDefault
          manual
          left={-0.5}
          right={0.5}
          top={0.5}
          bottom={-0.5}
          near={0.1}
          far={10}
          position={[0, 0, 1]}
        />
        <ShaderPlane createColorNodeAction={createColorNodeAction} />
      </Canvas>
      <LevaPanel {...levaProps} />
    </div>
  )
}
