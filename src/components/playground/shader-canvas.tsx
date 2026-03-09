'use client'

import { useEffect, useRef, type ComponentProps } from 'react'
import { Leva } from 'leva'
import { uniform } from 'three/tsl'
import {
  WebGPURenderer,
  OrthographicCamera,
  PlaneGeometry,
  Mesh,
  Scene,
  Vector2,
  MeshBasicNodeMaterial,
} from 'three/webgpu'
type ColorNode = NonNullable<MeshBasicNodeMaterial['colorNode']>

export type ShaderCanvasProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createColorNodeAction: (params: { resolution: any; mouse: any }) => ColorNode
  leva?: ComponentProps<typeof Leva>
  className?: string
}

export function ShaderCanvas({
  createColorNodeAction,
  leva: levaProps,
  className,
}: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    if (!canvas) return

    let renderer: WebGPURenderer
    let animationId: number
    let disposed = false

    const scene = new Scene()
    const camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
    camera.position.z = 1

    const resolution = uniform(
      new Vector2(canvas.clientWidth, canvas.clientHeight)
    )
    const mouse = uniform(new Vector2(0, 0))

    const material = new MeshBasicNodeMaterial()
    material.colorNode = createColorNodeAction({ resolution, mouse })

    const plane = new Mesh(new PlaneGeometry(1, 1), material)
    scene.add(plane)

    const handleResize = () => {
      if (disposed || !canvas) return
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      renderer.setSize(width, height, false)
      resolution.value.set(width, height)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (disposed || !canvas) return
      const rect = canvas.getBoundingClientRect()
      mouse.value.set(
        e.clientX - rect.left,
        rect.height - (e.clientY - rect.top)
      )
    }

    async function init() {
      renderer = new WebGPURenderer({
        canvas,
        antialias: true,
      })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)

      await renderer.init()
      if (disposed) {
        renderer.dispose()
        return
      }

      window.addEventListener('resize', handleResize)
      canvas.addEventListener('mousemove', handleMouseMove)

      const animate = () => {
        if (disposed) return
        animationId = requestAnimationFrame(animate)
        renderer.render(scene, camera)
      }
      animate()
    }

    init()

    return () => {
      disposed = true
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      canvas?.removeEventListener('mousemove', handleMouseMove)
      try {
        material.dispose()
        plane.geometry.dispose()
      } catch {
        // nodeBuilderState may already be cleared during navigation
      }
      renderer?.dispose()
    }
  }, [createColorNodeAction])

  return (
    <div className={className ?? 'relative h-full'}>
      <canvas ref={canvasRef} className="block h-full w-full" />
      <Leva collapsed={false} oneLineLabels {...levaProps} />
    </div>
  )
}
