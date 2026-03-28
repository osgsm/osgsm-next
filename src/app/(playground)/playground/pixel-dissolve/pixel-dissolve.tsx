'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useControls, folder } from 'leva'
import { TextureLoader, SRGBColorSpace } from 'three'
import { texture, uniform, uv, mix, smoothstep, hash, float } from 'three/tsl'
import { ShaderCanvas } from '@/components/playground/shader-canvas'

const IMAGE_PATHS = [
  '/images/playground/pixel-dissolve/1.jpg',
  '/images/playground/pixel-dissolve/2.jpg',
  '/images/playground/pixel-dissolve/3.jpg',
  '/images/playground/pixel-dissolve/4.jpg',
]

const uProgress = uniform(0)
const uSoftness = uniform(0.1)
const uPixelScale = uniform(1.0)

export function PixelDissolveScene() {
  const textures = useMemo(() => {
    const loader = new TextureLoader()
    return IMAGE_PATHS.map((path) => {
      const tex = loader.load(path)
      tex.colorSpace = SRGBColorSpace
      return tex
    })
  }, [])

  const texNodeA = useMemo(() => texture(textures[0]), [textures])
  const texNodeB = useMemo(() => texture(textures[1]), [textures])

  const texNodesRef = useRef({ a: texNodeA, b: texNodeB })
  useEffect(() => {
    texNodesRef.current = { a: texNodeA, b: texNodeB }
  }, [texNodeA, texNodeB])

  const stateRef = useRef({
    currentIdx: 0,
    phase: 'hold' as 'hold' | 'transition',
    startTime: 0,
    direction: 1 as 1 | -1,
  })

  // Initialize start time
  useEffect(() => {
    stateRef.current.startTime = performance.now()
  }, [])

  const { speed, softness, pixelScale, holdTime } = useControls({
    'Pixel Dissolve': folder({
      speed: { value: 0.5, min: 0.2, max: 3, step: 0.1 },
      softness: { value: 0.1, min: 0, max: 0.5, step: 0.01 },
      pixelScale: { value: 3, min: 1, max: 20, step: 1 },
      holdTime: { value: 2.0, min: 0.5, max: 5, step: 0.5 },
    }),
  })

  useEffect(() => {
    uSoftness.value = softness
  }, [softness])

  useEffect(() => {
    uPixelScale.value = pixelScale
  }, [pixelScale])

  const goTo = useCallback(
    (direction: 1 | -1) => {
      const s = stateRef.current
      if (s.phase === 'transition') return

      const nextIdx =
        (s.currentIdx + direction + textures.length) % textures.length
      texNodesRef.current.a.value = textures[s.currentIdx]
      texNodesRef.current.b.value = textures[nextIdx]
      s.direction = direction
      s.phase = 'transition'
      s.startTime = performance.now()
    },
    [textures]
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(1)
      else if (e.key === 'ArrowLeft') goTo(-1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goTo])

  // Animation loop: hold → dissolve → hold → dissolve ...
  useEffect(() => {
    let rafId: number

    const animate = () => {
      const s = stateRef.current
      const elapsed = (performance.now() - s.startTime) / 1000

      if (s.phase === 'hold') {
        uProgress.value = 0
        if (elapsed > holdTime) {
          goTo(1)
        }
      } else {
        const duration = 1.0 / speed
        const progress = Math.min(elapsed / duration, 1)
        uProgress.value = progress

        if (progress >= 1) {
          s.currentIdx =
            (s.currentIdx + s.direction + textures.length) % textures.length
          texNodesRef.current.a.value = textures[s.currentIdx]
          uProgress.value = 0
          s.phase = 'hold'
          s.startTime = performance.now()
        }
      }

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [textures, speed, holdTime, goTo])

  const createColorNode = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ resolution }: { resolution: any }) => {
      // Per-pixel random threshold via hash
      const pixelCoord = uv().mul(resolution).div(uPixelScale).floor()
      const seed = pixelCoord.x.add(pixelCoord.y.mul(float(10000)))
      // Remap hash (0-1) to (softness, 1-softness) so smoothstep edges
      // stay within [0, 1] and all pixels fully dissolve at progress=1
      const threshold = hash(seed)
        .mul(float(1).sub(uSoftness.mul(2)))
        .add(uSoftness)

      // Smoothstep dissolve blend
      const blend = smoothstep(
        threshold.sub(uSoftness),
        threshold.add(uSoftness),
        uProgress
      )

      return mix(texNodeA, texNodeB, blend)
    },
    [texNodeA, texNodeB]
  )

  return (
    <ShaderCanvas
      createColorNodeAction={createColorNode}
      leva={{ titleBar: { title: 'Pixel Dissolve' } }}
    />
  )
}
