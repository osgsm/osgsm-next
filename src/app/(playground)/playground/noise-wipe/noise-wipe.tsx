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
  vec3,
  min as tslMin,
  step,
} from 'three/tsl'
import { mx_noise_float } from 'three/tsl'
import { ShaderCanvas } from '@/components/playground/shader-canvas'

const IMAGE_PATHS = [
  '/images/playground/noise-wipe/1.jpg',
  '/images/playground/noise-wipe/2.jpg',
  '/images/playground/noise-wipe/3.jpg',
  '/images/playground/noise-wipe/4.jpg',
]

const uProgress = uniform(0)
const uSoftness = uniform(0.05)
const uNoiseScale = uniform(2.0)
const uImageAspect = uniform(1.0)
const uIndexA = uniform(0)
const uIndexB = uniform(1)

export function NoiseWipeScene() {
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

  const { speed, softness, noiseScale, holdTime } = useControls({
    'Noise Wipe': folder({
      speed: { value: 0.8, min: 0.2, max: 3, step: 0.1 },
      softness: { value: 0.05, min: 0, max: 0.5, step: 0.01 },
      noiseScale: { value: 2.0, min: 0.5, max: 10, step: 0.5 },
      holdTime: { value: 2.0, min: 0.5, max: 5, step: 0.5 },
    }),
  })

  useEffect(() => {
    uSoftness.value = softness
  }, [softness])

  useEffect(() => {
    uNoiseScale.value = noiseScale
  }, [noiseScale])

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(1)
      else if (e.key === 'ArrowLeft') goTo(-1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goTo])

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

      // Create all texture nodes upfront — select by uniform index
      const texNodes = textures.map((t) => texture(t, coverUv))
      const pickTex = (idx: ReturnType<typeof uniform>) => {
        const fi = float(idx)
        const s1 = step(float(0.5), fi)
        const s2 = step(float(1.5), fi)
        const s3 = step(float(2.5), fi)
        return mix(
          mix(mix(texNodes[0], texNodes[1], s1), texNodes[2], s2),
          texNodes[3],
          s3
        )
      }

      const colorA = pickTex(uIndexA)
      const colorB = pickTex(uIndexB)

      // Perlin noise threshold for wipe transition
      // Use UV-based position scaled by noiseScale
      const noisePos = vec3(uv().mul(uNoiseScale), float(0))
      const noiseVal = mx_noise_float(noisePos).mul(0.5).add(0.5)

      // Remap noise to (softness, 1-softness) so all pixels complete at progress=1
      const threshold = noiseVal
        .mul(float(1).sub(uSoftness.mul(2)))
        .add(uSoftness)

      // Smoothstep wipe blend
      const blend = smoothstep(
        threshold.sub(uSoftness),
        threshold.add(uSoftness),
        uProgress
      )

      return mix(colorA, colorB, blend)
    },
    [textures]
  )

  return (
    <ShaderCanvas
      createColorNodeAction={createColorNode}
      leva={{ titleBar: { title: 'Noise Wipe' } }}
    />
  )
}
