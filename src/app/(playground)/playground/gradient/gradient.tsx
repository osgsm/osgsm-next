'use client'

import { useCallback, useEffect } from 'react'
import { useControls, folder } from 'leva'
import { Color } from 'three'
import { uniform, uv, time, mix, sin } from 'three/tsl'
import { ShaderCanvas } from '@/components/playground/shader-canvas'

const uColor1 = uniform(new Color('#262a65'))
const uColor2 = uniform(new Color('#4d122f'))
const uSpeed = uniform(0.5)

export function GradientScene() {
  const { color1, color2, speed } = useControls({
    Gradient: folder({
      color1: '#262a65',
      color2: '#4d122f',
      speed: { value: 0.5, min: 0, max: 3, step: 0.1 },
    }),
  })

  useEffect(() => {
    uColor1.value.set(color1)
  }, [color1])

  useEffect(() => {
    uColor2.value.set(color2)
  }, [color2])

  useEffect(() => {
    uSpeed.value = speed
  }, [speed])

  const createColorNode = useCallback(() => {
    const t = sin(time.mul(uSpeed).add(uv().y.mul(3.0)))
      .mul(0.5)
      .add(0.5)
    return mix(uColor1, uColor2, t)
  }, [])

  return (
    <ShaderCanvas
      createColorNodeAction={createColorNode}
      leva={{ titleBar: { title: 'Gradient Controls' } }}
    />
  )
}
