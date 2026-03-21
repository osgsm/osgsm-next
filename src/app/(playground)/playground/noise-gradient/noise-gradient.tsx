'use client'

import { useCallback, useEffect } from 'react'
import { useControls, folder } from 'leva'
import { Color } from 'three'
import { uniform, uv, time, vec3 } from 'three/tsl'
import { perlinNoise } from 'tsl-textures'
import { ShaderCanvas } from '@/components/playground/shader-canvas'

const uScale = uniform(1)
const uBalance = uniform(0)
const uContrast = uniform(0)
const uColor1 = uniform(new Color('#4a4a95'))
const uColor2 = uniform(new Color('#202248'))
const uSeed = uniform(0)
const uSpeed = uniform(2.0)

export function NoiseGradientScene() {
  const { scale, balance, contrast, color1, color2, seed, speed } = useControls(
    {
      'Noise Gradient': folder({
        scale: { value: 1, min: 0, max: 4, step: 0.1 },
        balance: { value: -0.1, min: -3, max: 3, step: 0.1 },
        contrast: { value: 0, min: -2, max: 2, step: 0.1 },
        color1: '#4a4a95',
        color2: '#202248',
        seed: { value: 0, min: 0, max: 100, step: 1 },
        speed: { value: 1.0, min: 0, max: 3, step: 0.1 },
      }),
    }
  )

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

  const createColorNode = useCallback(() => {
    const pos = vec3(uv(), time.mul(uSpeed).mul(0.1))

    return perlinNoise({
      position: pos,
      scale: uScale,
      balance: uBalance,
      contrast: uContrast,
      color: uColor1,
      background: uColor2,
      seed: uSeed,
    })
  }, [])

  return (
    <ShaderCanvas
      createColorNodeAction={createColorNode}
      leva={{ titleBar: { title: 'Noise Gradient Controls' } }}
    />
  )
}
