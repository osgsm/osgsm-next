'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import * as THREE from 'three'
import { WebGPURenderer, PointsNodeMaterial } from 'three/webgpu'
import {
  Fn,
  If,
  instancedArray,
  instanceIndex,
  uniform,
  vec3,
  float,
  hash,
  time,
  abs,
  atan,
  select,
} from 'three/tsl'
import { mx_fractal_noise_vec3 } from 'three/tsl'
import { Scene } from '@/components/playground/scene'

const PARTICLE_COUNT = 16384

function FlowField() {
  const gl = useThree((s) => s.gl) as unknown as WebGPURenderer

  const mouseWorld = useRef(new THREE.Vector3(9999, 9999, 9999))

  const {
    noiseScale,
    evolutionSpeed,
    turbulence,
    speed: timeScale,
    damping,
    repelStrength,
    repelRadius,
  } = useControls({
    Noise: folder({
      noiseScale: { value: 0.1, min: 0.1, max: 3, step: 0.01 },
      evolutionSpeed: { value: 0.15, min: 0, max: 1, step: 0.01 },
      turbulence: { value: 3, min: 1, max: 6, step: 1 },
    }),
    Animation: folder({
      speed: { value: 1.0, min: 0, max: 3, step: 0.1 },
      damping: { value: 0.98, min: 0.9, max: 1.0, step: 0.005 },
    }),
    Mouse: folder({
      repelStrength: { value: 5.0, min: 0, max: 10, step: 0.1 },
      repelRadius: { value: 3.0, min: 0.1, max: 5, step: 0.1 },
    }),
  })

  const { colorMode, opacity, particleSize } = useControls({
    Appearance: folder({
      colorMode: {
        value: 'velocity',
        options: ['velocity', 'position', 'single'],
      },
      opacity: { value: 0.85, min: 0, max: 1, step: 0.01 },
      particleSize: { value: 1.5, min: 1.0, max: 5, step: 0.05 },
    }),
  })

  const controlsRef = useRef({
    noiseScale,
    evolutionSpeed,
    turbulence,
    timeScale,
    damping,
    repelStrength,
    repelRadius,
    colorMode,
    opacity,
    particleSize,
  })
  controlsRef.current = {
    noiseScale,
    evolutionSpeed,
    turbulence,
    timeScale,
    damping,
    repelStrength,
    repelRadius,
    colorMode,
    opacity,
    particleSize,
  }

  const { computeInit, computeUpdate, material, uniforms } = useMemo(() => {
    const positions = instancedArray(PARTICLE_COUNT, 'vec3')
    const velocities = instancedArray(PARTICLE_COUNT, 'vec3')
    const lifetimes = instancedArray(PARTICLE_COUNT, 'float')
    const maxLifetimes = instancedArray(PARTICLE_COUNT, 'float')

    const noiseScaleU = uniform(0.1)
    const evolutionSpeedU = uniform(0.15)
    const turbulenceU = uniform(3)
    const dampingU = uniform(0.98)
    const dt = uniform(0)
    const opacityU = uniform(0.85)
    const particleSizeU = uniform(1.5)
    const colorModeU = uniform(0) // 0=velocity, 1=position, 2=single
    const mousePosU = uniform(new THREE.Vector3(9999, 9999, 9999))
    const repelStrengthU = uniform(5.0)
    const repelRadiusU = uniform(3.0)

    // Curl noise: compute curl of fractal noise field using finite differences
    const curlNoise = Fn(([pos]: ReturnType<typeof vec3>[]) => {
      const eps = float(0.01)
      const p = vec3(pos).toVar()

      const dx = vec3(eps, 0, 0)
      const dy = vec3(0, eps, 0)
      const dz = vec3(0, 0, eps)

      const octaves = turbulenceU.toInt()
      const lacunarity = float(2.0)
      const diminish = float(0.5)

      const pxp = mx_fractal_noise_vec3(
        p.add(dx).mul(noiseScaleU),
        octaves,
        lacunarity,
        diminish
      )
      const pxn = mx_fractal_noise_vec3(
        p.sub(dx).mul(noiseScaleU),
        octaves,
        lacunarity,
        diminish
      )
      const pyp = mx_fractal_noise_vec3(
        p.add(dy).mul(noiseScaleU),
        octaves,
        lacunarity,
        diminish
      )
      const pyn = mx_fractal_noise_vec3(
        p.sub(dy).mul(noiseScaleU),
        octaves,
        lacunarity,
        diminish
      )
      const pzp = mx_fractal_noise_vec3(
        p.add(dz).mul(noiseScaleU),
        octaves,
        lacunarity,
        diminish
      )
      const pzn = mx_fractal_noise_vec3(
        p.sub(dz).mul(noiseScaleU),
        octaves,
        lacunarity,
        diminish
      )

      const invEps2 = float(1).div(eps.mul(2))

      const curlX = pyp.z.sub(pyn.z).sub(pzp.y.sub(pzn.y)).mul(invEps2)
      const curlY = pzp.x.sub(pzn.x).sub(pxp.z.sub(pxn.z)).mul(invEps2)
      const curlZ = pxp.y.sub(pxn.y).sub(pyp.x.sub(pyn.x)).mul(invEps2)

      return vec3(curlX, curlY, curlZ)
    })

    const computeInit = Fn(() => {
      const pos = positions.element(instanceIndex)
      const vel = velocities.element(instanceIndex)
      const life = lifetimes.element(instanceIndex)
      const maxLife = maxLifetimes.element(instanceIndex)

      // Random box distribution
      const hx = hash(instanceIndex).mul(8).sub(4)
      const hy = hash(instanceIndex.add(1)).mul(8).sub(4)
      const hz = hash(instanceIndex.add(2)).mul(8).sub(4)
      pos.assign(vec3(hx, hy, hz))

      vel.assign(vec3(0, 0, 0))

      const duration = hash(instanceIndex.add(3)).mul(4).add(2)
      maxLife.assign(duration)
      life.assign(hash(instanceIndex.add(4)).mul(duration))
    })().compute(PARTICLE_COUNT)

    const computeUpdate = Fn(() => {
      const pos = positions.element(instanceIndex)
      const vel = velocities.element(instanceIndex)
      const life = lifetimes.element(instanceIndex)
      const maxLife = maxLifetimes.element(instanceIndex)

      // Add time offset to noise position for evolution
      const noisePos = pos.add(vec3(0, 0, time.mul(evolutionSpeedU))).toVar()

      // Compute curl noise force
      const curl = curlNoise(noisePos)

      // Apply curl as acceleration
      vel.addAssign(curl.mul(dt).mul(2.0))

      // Mouse repulsion
      const toParticle = pos.sub(mousePosU).toVar()
      const dist = toParticle.length().max(0.001)
      const falloff = float(1).sub(dist.div(repelRadiusU).clamp(0, 1))
      const repelForce = toParticle
        .normalize()
        .mul(falloff.mul(falloff).mul(repelStrengthU).mul(dt))
      vel.addAssign(repelForce)

      // Damping
      vel.mulAssign(dampingU)

      // Update position
      pos.addAssign(vel.mul(dt))

      // Lifetime
      life.subAssign(dt)

      If(life.lessThan(0), () => {
        const hx = hash(instanceIndex.add(time.mul(1000)))
          .mul(8)
          .sub(4)
        const hy = hash(instanceIndex.add(time.mul(1000)).add(1))
          .mul(8)
          .sub(4)
        const hz = hash(instanceIndex.add(time.mul(1000)).add(2))
          .mul(8)
          .sub(4)
        pos.assign(vec3(hx, hy, hz))

        vel.assign(vec3(0, 0, 0))

        const duration = hash(instanceIndex.add(time.mul(1000)).add(3))
          .mul(4)
          .add(2)
        maxLife.assign(duration)
        life.assign(duration)
      })
    })().compute(PARTICLE_COUNT)

    // Color: velocity-based HSL mapping
    const vel = velocities.element(instanceIndex)
    const lifeRatio = lifetimes
      .element(instanceIndex)
      .div(maxLifetimes.element(instanceIndex))

    // Velocity-based hue
    const speed = vel.length()
    const hue = atan(vel.y, vel.x)
      .div(Math.PI * 2)
      .add(0.5)
    const saturation = float(0.7)
    const lightness = float(0.5).add(speed.mul(0.1).clamp(0, 0.3))

    // HSL to RGB
    const hslToRgb = Fn(([h, s, l]: ReturnType<typeof float>[]) => {
      const c = s.mul(float(1).sub(abs(l.mul(2).sub(1))))
      const x = c.mul(float(1).sub(abs(h.mul(6).mod(2).sub(1))))
      const m = l.sub(c.mul(0.5))

      const hue6 = h.mul(6)
      const r = float(0).toVar()
      const g = float(0).toVar()
      const b = float(0).toVar()

      // Sector 0: R=C, G=X, B=0
      // Sector 1: R=X, G=C, B=0
      // Sector 2: R=0, G=C, B=X
      // Sector 3: R=0, G=X, B=C
      // Sector 4: R=X, G=0, B=C
      // Sector 5: R=C, G=0, B=X
      // Approximate with smooth functions
      r.assign(abs(hue6.sub(3)).sub(1).clamp(0, 1))
      g.assign(
        float(2)
          .sub(abs(hue6.sub(2)))
          .clamp(0, 1)
      )
      b.assign(
        float(2)
          .sub(abs(hue6.sub(4)))
          .clamp(0, 1)
      )

      // Apply saturation and lightness
      r.assign(r.sub(0.5).mul(s).add(0.5).mul(l.mul(2).clamp(0, 1)).add(m))
      g.assign(g.sub(0.5).mul(s).add(0.5).mul(l.mul(2).clamp(0, 1)).add(m))
      b.assign(b.sub(0.5).mul(s).add(0.5).mul(l.mul(2).clamp(0, 1)).add(m))

      return vec3(r, g, b)
    })

    // Position-based color
    const posNorm = positions.element(instanceIndex).mul(0.15).add(0.5)
    const posColor = vec3(
      posNorm.x.fract(),
      posNorm.y.fract(),
      posNorm.z.fract()
    )

    // Single color (warm white / soft blue)
    const singleColor = vec3(0.6, 0.7, 1.0)

    const velColor = hslToRgb(hue, saturation, lightness)

    // Mix based on color mode uniform: 0=velocity, 1=position, 2=single
    const finalColor = select(
      colorModeU.lessThan(0.5),
      velColor,
      select(colorModeU.lessThan(1.5), posColor, singleColor)
    )

    // Fade in/out
    const fadeIn = lifeRatio.oneMinus().smoothstep(0, 0.1)
    const fadeOut = lifeRatio.smoothstep(0, 0.2)
    const fade = fadeIn.mul(fadeOut)

    const mat = new PointsNodeMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false,
    })
    mat.positionNode = positions.element(instanceIndex)
    mat.colorNode = finalColor.mul(float(0.5).add(fade.mul(0.5)))
    mat.sizeNode = particleSizeU.mul(float(0.3).add(fade.mul(0.7)))
    mat.opacityNode = opacityU.mul(fade)

    return {
      computeInit,
      computeUpdate,
      material: mat,
      uniforms: {
        noiseScale: noiseScaleU,
        evolutionSpeed: evolutionSpeedU,
        turbulence: turbulenceU,
        damping: dampingU,
        dt,
        opacity: opacityU,
        particleSize: particleSizeU,
        colorMode: colorModeU,
        mousePos: mousePosU,
        repelStrength: repelStrengthU,
        repelRadius: repelRadiusU,
      },
    }
  }, [])

  const initDone = useRef(false)
  useEffect(() => {
    if (initDone.current) return
    initDone.current = true
    gl.computeAsync(computeInit)
  }, [gl, computeInit])

  useFrame((_, delta) => {
    const c = controlsRef.current
    const scaledDelta = Math.min(delta * c.timeScale, 0.1)

    uniforms.dt.value = scaledDelta
    uniforms.noiseScale.value = c.noiseScale
    uniforms.evolutionSpeed.value = c.evolutionSpeed
    uniforms.turbulence.value = c.turbulence
    uniforms.damping.value = c.damping
    uniforms.opacity.value = c.opacity
    uniforms.particleSize.value = c.particleSize
    uniforms.colorMode.value =
      c.colorMode === 'velocity' ? 0 : c.colorMode === 'position' ? 1 : 2
    uniforms.repelStrength.value = c.repelStrength
    uniforms.repelRadius.value = c.repelRadius
    uniforms.mousePos.value.copy(mouseWorld.current)

    gl.compute(computeUpdate)
  })

  return (
    <>
      <sprite
        ref={(sprite) => {
          if (sprite) sprite.count = PARTICLE_COUNT
        }}
        material={material}
        frustumCulled={false}
      />
      <mesh
        visible={false}
        onPointerMove={(e) => {
          e.stopPropagation()
          mouseWorld.current.copy(e.point)
        }}
        onPointerLeave={() => {
          mouseWorld.current.set(9999, 9999, 9999)
        }}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial />
      </mesh>
    </>
  )
}

export function FlowFieldScene() {
  return (
    <Scene
      gl={async (props) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const renderer = new WebGPURenderer(props as any)
        await renderer.init()
        return renderer
      }}
      camera={{ position: [0, 0, 5], fov: 60 }}
      orbitControls={{ minDistance: 1, maxDistance: 10 }}
      leva={{ titleBar: { title: 'Flow Field Controls' } }}
    >
      <FlowField />
    </Scene>
  )
}
