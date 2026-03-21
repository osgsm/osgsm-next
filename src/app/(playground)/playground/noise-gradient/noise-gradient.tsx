'use client'

import { useCallback, useEffect } from 'react'
import { useControls, folder } from 'leva'
import { Color } from 'three'
import { uniform, uv, time, vec3, float, mix } from 'three/tsl'
import { perlinNoise } from 'tsl-textures'
import { ShaderCanvas } from '@/components/playground/shader-canvas'

const uScale = uniform(1)
const uBalance = uniform(0)
const uContrast = uniform(0)
const uColor1 = uniform(new Color('#4a4a95'))
const uColor2 = uniform(new Color('#202248'))
const uSeed = uniform(0)
const uSpeed = uniform(2.0)
const uFineNoiseScale = uniform(200)
const uFineNoiseIntensity = uniform(0.15)

export function NoiseGradientScene() {
  const {
    scale,
    balance,
    contrast,
    color1,
    color2,
    seed,
    speed,
    fineNoiseScale,
    fineNoiseIntensity,
  } = useControls({
    'Noise Gradient': folder({
      scale: { value: 1, min: 0, max: 4, step: 0.1 },
      balance: { value: -0.1, min: -3, max: 3, step: 0.1 },
      contrast: { value: 0, min: -2, max: 2, step: 0.1 },
      color1: '#4a4a95',
      color2: '#202248',
      seed: { value: 0, min: 0, max: 100, step: 1 },
      speed: { value: 1.0, min: 0, max: 3, step: 0.1 },
      fineNoiseScale: { value: 200, min: 100, max: 300, step: 10 },
      fineNoiseIntensity: { value: 0.15, min: 0, max: 1, step: 0.01 },
    }),
  })

  useEffect(() => {
    uScale.value = scale
  }, [scale])

  useEffect(() => {
    uBalance.value = balance
  }, [balance])

  useEffect(() => {
    uContrast.value = contrast
  }, [contrast])

  useEffect(() => {
    uColor1.value.set(color1)
  }, [color1])

  useEffect(() => {
    uColor2.value.set(color2)
  }, [color2])

  useEffect(() => {
    uSeed.value = seed
  }, [seed])

  useEffect(() => {
    uSpeed.value = speed
  }, [speed])

  useEffect(() => {
    uFineNoiseScale.value = fineNoiseScale
  }, [fineNoiseScale])

  useEffect(() => {
    uFineNoiseIntensity.value = fineNoiseIntensity
  }, [fineNoiseIntensity])

  const createColorNode = useCallback(() => {
    const pos = vec3(uv(), time.mul(uSpeed).mul(0.1))

    const baseNoise = perlinNoise({
      position: pos,
      scale: uScale,
      balance: uBalance,
      contrast: uContrast,
      color: uColor1,
      background: uColor2,
      seed: uSeed,
    })

    // Fine-grained perlin noise overlay
    const finePos = vec3(uv().mul(uFineNoiseScale), time.mul(uSpeed).mul(0.05))
    const fineNoise = perlinNoise({
      position: finePos,
      scale: float(1),
      balance: float(0),
      contrast: float(0),
      color: uColor1,
      background: uColor2,
      seed: uSeed.add(42),
    })

    return mix(baseNoise, fineNoise, uFineNoiseIntensity)
  }, [])

  return (
    <ShaderCanvas
      createColorNodeAction={createColorNode}
      leva={{ titleBar: { title: 'Noise Gradient Controls' } }}
    />
  )
}
