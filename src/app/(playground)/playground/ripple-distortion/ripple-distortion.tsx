'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useControls, folder } from 'leva'
import { TextureLoader, SRGBColorSpace } from 'three'
import {
  texture,
  uniform,
  uv,
  mix,
  smoothstep,
  float,
  vec2,
  min as tslMin,
  step,
  sin,
  exp,
  abs,
  length,
  normalize,
} from 'three/tsl'
import { ShaderCanvas } from '@/components/playground/shader-canvas'

const IMAGE_PATHS = [
  '/images/playground/ripple-distortion/1.jpg',
  '/images/playground/ripple-distortion/2.jpg',
  '/images/playground/ripple-distortion/3.jpg',
  '/images/playground/ripple-distortion/4.jpg',
]

const uProgress = uniform(0)
const uImageAspect = uniform(1.0)
const uIndexA = uniform(0)
const uIndexB = uniform(1)
const uRippleCenter = uniform(vec2(0.5, 0.5))
const uRippleFrequency = uniform(50.0)
const uRippleAmplitude = uniform(0.1)

export function RippleDistortionScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  const textures = useMemo(() => {
    const loader = new TextureLoader()
    return IMAGE_PATHS.map((path, i) => {
      const tex = loader.load(path, (loaded) => {
        if (i === 0 && loaded.image) {
          uImageAspect.value = loaded.image.width / loaded.image.height
        }
      })
      tex.colorSpace = SRGBColorSpace
      return tex
    })
  }, [])

  const stateRef = useRef({
    currentIdx: 0,
    phase: 'hold' as 'hold' | 'transition',
    startTime: 0,
    direction: 1 as 1 | -1,
  })

  useEffect(() => {
    stateRef.current.startTime = performance.now()
  }, [])

  const { speed, holdTime, rippleFrequency, rippleAmplitude } = useControls({
    'Ripple Distortion': folder({
      speed: { value: 0.5, min: 0.2, max: 3, step: 0.1 },
      holdTime: { value: 2.0, min: 0.5, max: 5, step: 0.5 },
      rippleFrequency: { value: 50, min: 10, max: 100, step: 5 },
      rippleAmplitude: { value: 0.1, min: 0.0, max: 0.5, step: 0.05 },
    }),
  })

  useEffect(() => {
    uRippleFrequency.value = rippleFrequency
  }, [rippleFrequency])

  useEffect(() => {
    uRippleAmplitude.value = rippleAmplitude
  }, [rippleAmplitude])

  const goTo = useCallback(
    (direction: 1 | -1) => {
      const s = stateRef.current
      if (s.phase === 'transition') return

      const nextIdx =
        (s.currentIdx + direction + textures.length) % textures.length
      uIndexA.value = s.currentIdx
      uIndexB.value = nextIdx
      uProgress.value = 0
      s.direction = direction
      s.phase = 'transition'
      s.startTime = performance.now()
    },
    [textures]
  )

  // Click to set ripple center and trigger transition
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1.0 - (e.clientY - rect.top) / rect.height
      uRippleCenter.value.set(x, y)
      goTo(1)
    }

    container.addEventListener('click', handleClick)
    return () => container.removeEventListener('click', handleClick)
  }, [goTo])

  // Keyboard navigation (ripple from center)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        uRippleCenter.value.set(0.5, 0.5)
        goTo(1)
      } else if (e.key === 'ArrowLeft') {
        uRippleCenter.value.set(0.5, 0.5)
        goTo(-1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goTo])

  // Animation loop: hold → transition → hold → transition ...
  useEffect(() => {
    let rafId: number

    const animate = () => {
      const s = stateRef.current
      const elapsed = (performance.now() - s.startTime) / 1000

      if (s.phase === 'hold') {
        uProgress.value = 0
        if (elapsed > holdTime) {
          uRippleCenter.value.set(0.5, 0.5)
          goTo(1)
        }
      } else {
        const duration = 1.0 / speed
        const progress = Math.min(elapsed / duration, 1)
        uProgress.value = progress

        if (progress >= 1) {
          s.currentIdx =
            (s.currentIdx + s.direction + textures.length) % textures.length
          uIndexA.value = s.currentIdx
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
      // Cover UV: object-fit: cover equivalent
      const canvasAspect = resolution.x.div(resolution.y)
      const scaleX = tslMin(float(1.0), canvasAspect.div(uImageAspect))
      const scaleY = tslMin(float(1.0), uImageAspect.div(canvasAspect))
      const coverUv = uv().sub(0.5).mul(vec2(scaleX, scaleY)).add(0.5)

      // Select texture by uniform index with given UV
      const pickTex = (
        idx: ReturnType<typeof uniform>,
        sampleUv: ReturnType<typeof vec2>
      ) => {
        const texNodesAtUv = textures.map((t) => texture(t, sampleUv))
        const fi = float(idx)
        const s1 = step(float(0.5), fi)
        const s2 = step(float(1.5), fi)
        const s3 = step(float(2.5), fi)
        return mix(
          mix(mix(texNodesAtUv[0], texNodesAtUv[1], s1), texNodesAtUv[2], s2),
          texNodesAtUv[3],
          s3
        )
      }

      // Ripple distortion logic (aspect-corrected for circular ripple)
      const screenUv = uv()
      const toCenter = screenUv.sub(uRippleCenter)
      const corrected = toCenter.mul(vec2(canvasAspect, float(1.0)))
      const distance = length(corrected)
      const maxRadius = float(1.5)
      const waveFront = uProgress.mul(maxRadius)
      const distFromFront = distance.sub(waveFront)

      // Distortion at wavefront edge, fades at start/end of transition
      const decay = float(8.0)
      const progressFade = uProgress.mul(float(1.0).sub(uProgress)).mul(4.0)
      const distortion = sin(distFromFront.mul(uRippleFrequency))
        .mul(uRippleAmplitude)
        .mul(exp(abs(distFromFront).mul(decay).negate()))
        .mul(progressFade)
      const safeToCenter = toCenter.add(vec2(0.0001, 0.0001))
      const direction = normalize(safeToCenter)
      const distortedUv = coverUv.add(direction.mul(distortion))

      // Sample textures with distorted UVs
      const colorA = pickTex(uIndexA, distortedUv)
      const colorB = pickTex(uIndexB, distortedUv)

      // Blend: areas where wavefront has passed show image B
      const softEdge = float(0.02)
      const blend = smoothstep(
        waveFront.add(softEdge),
        waveFront.sub(softEdge),
        distance
      )

      return mix(colorA, colorB, blend)
    },
    [textures]
  )

  return (
    <div ref={containerRef} className="relative h-full cursor-pointer">
      <ShaderCanvas
        createColorNodeAction={createColorNode}
        leva={{ titleBar: { title: 'Ripple Distortion' } }}
        className="h-full"
      />
    </div>
  )
}
