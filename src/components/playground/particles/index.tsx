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
} from 'three/tsl'
import { Scene } from '@/components/playground/scene'

const PARTICLE_COUNT = 50000

function Particles() {
  const gl = useThree((s) => s.gl) as unknown as WebGPURenderer
  const { pointer, raycaster, camera } = useThree()

  const intersectPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    []
  )
  const intersectPoint = useMemo(() => new THREE.Vector3(), [])

  const {
    attractorStrength,
    gravity,
    damping,
    speed: timeScale,
  } = useControls({
    Simulation: folder({
      attractorStrength: { value: 20, min: 0, max: 50, step: 0.1 },
      gravity: { value: -0.5, min: -5, max: 5, step: 0.1 },
      damping: { value: 0.98, min: 0.9, max: 1.0, step: 0.005 },
    }),
    Animation: folder({
      speed: { value: 1.0, min: 0, max: 3, step: 0.1 },
    }),
  })

  const { color, opacity } = useControls({
    Appearance: folder({
      color: '#b4aaff',
      opacity: { value: 0.85, min: 0, max: 1, step: 0.01 },
    }),
  })

  const controlsRef = useRef({
    attractorStrength,
    gravity,
    damping,
    timeScale,
    color,
    opacity,
  })
  controlsRef.current = {
    attractorStrength,
    gravity,
    damping,
    timeScale,
    color,
    opacity,
  }

  const { computeInit, computeUpdate, material, geometry, uniforms } =
    useMemo(() => {
      const positions = instancedArray(PARTICLE_COUNT, 'vec3')
      const velocities = instancedArray(PARTICLE_COUNT, 'vec3')
      const lifetimes = instancedArray(PARTICLE_COUNT, 'float')
      const maxLifetimes = instancedArray(PARTICLE_COUNT, 'float')

      const attractorPos = uniform(new THREE.Vector3(0, 0, 0))
      const attractorStrengthU = uniform(20)
      const gravityU = uniform(-0.5)
      const dampingU = uniform(0.98)
      const dt = uniform(0)
      const colorU = uniform(new THREE.Color('#b4aaff'))
      const particleSizeU = uniform(2.0)
      const opacityU = uniform(0.85)

      const computeInit = Fn(() => {
        const pos = positions.element(instanceIndex)
        const vel = velocities.element(instanceIndex)
        const life = lifetimes.element(instanceIndex)
        const maxLife = maxLifetimes.element(instanceIndex)

        const r = hash(instanceIndex).mul(8)
        const theta = hash(instanceIndex.add(1)).mul(Math.PI * 2)
        const phi = hash(instanceIndex.add(2)).mul(Math.PI)

        pos.x.assign(r.mul(phi.sin()).mul(theta.cos()))
        pos.y.assign(r.mul(phi.sin()).mul(theta.sin()))
        pos.z.assign(r.mul(phi.cos()))

        vel.assign(vec3(0, 0, 0))

        const duration = hash(instanceIndex.add(3)).mul(3).add(1)
        maxLife.assign(duration)
        life.assign(hash(instanceIndex.add(4)).mul(duration))
      })().compute(PARTICLE_COUNT)

      const computeUpdate = Fn(() => {
        const pos = positions.element(instanceIndex)
        const vel = velocities.element(instanceIndex)
        const life = lifetimes.element(instanceIndex)
        const maxLife = maxLifetimes.element(instanceIndex)

        const toAttractor = attractorPos.sub(pos)
        const distance = toAttractor.length()
        const direction = toAttractor.normalize()
        const force = direction
          .mul(attractorStrengthU)
          .div(distance.mul(distance).add(1.0))
        vel.addAssign(force.mul(dt))

        vel.y.addAssign(gravityU.mul(dt))

        vel.mulAssign(dampingU)

        pos.addAssign(vel.mul(dt))

        life.subAssign(dt)

        If(life.lessThan(0), () => {
          const r = hash(instanceIndex.add(time.mul(1000))).mul(2)
          const theta = hash(instanceIndex.add(time.mul(1000)).add(1)).mul(
            Math.PI * 2
          )
          const phi = hash(instanceIndex.add(time.mul(1000)).add(2)).mul(
            Math.PI
          )

          pos.x.assign(attractorPos.x.add(r.mul(phi.sin()).mul(theta.cos())))
          pos.y.assign(attractorPos.y.add(r.mul(phi.sin()).mul(theta.sin())))
          pos.z.assign(attractorPos.z.add(r.mul(phi.cos())))

          vel.assign(vec3(0, 0, 0))

          const duration = hash(instanceIndex.add(time.mul(1000)).add(3))
            .mul(3)
            .add(1)
          maxLife.assign(duration)
          life.assign(duration)
        })
      })().compute(PARTICLE_COUNT)

      const lifeRatio = lifetimes
        .element(instanceIndex)
        .div(maxLifetimes.element(instanceIndex))

      const mat = new PointsNodeMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })
      mat.positionNode = positions.element(instanceIndex)
      mat.colorNode = colorU.mul(float(0.3).add(lifeRatio.mul(0.7)))
      mat.sizeNode = particleSizeU.mul(float(0.2).add(lifeRatio.mul(0.8)))
      mat.opacityNode = opacityU.mul(lifeRatio.smoothstep(0, 0.3))

      const geo = new THREE.BufferGeometry()
      geo.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(3), 3)
      )
      geo.drawRange.count = 1
      geo.computeBoundingSphere()
      geo.boundingSphere!.radius = 1000

      return {
        computeInit,
        computeUpdate,
        material: mat,
        geometry: geo,
        uniforms: {
          attractorPos,
          attractorStrength: attractorStrengthU,
          gravity: gravityU,
          damping: dampingU,
          dt,
          color: colorU,
          opacity: opacityU,
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
    uniforms.attractorStrength.value = c.attractorStrength
    uniforms.gravity.value = c.gravity
    uniforms.damping.value = c.damping
    uniforms.opacity.value = c.opacity
    uniforms.color.value.set(c.color)

    raycaster.setFromCamera(pointer, camera)
    const ray = raycaster.ray
    ray.intersectPlane(intersectPlane, intersectPoint)
    uniforms.attractorPos.value.copy(intersectPoint)

    gl.compute(computeUpdate)
  })

  return (
    <points
      ref={(mesh) => {
        if (mesh) mesh.count = PARTICLE_COUNT
      }}
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  )
}

export function ParticlesScene() {
  return (
    <Scene
      gl={async (props) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const renderer = new WebGPURenderer(props as any)
        await renderer.init()
        return renderer
      }}
      camera={{ position: [0, 0, 5], fov: 60 }}
      orbitControls={false}
      leva={{ titleBar: { title: 'Particle Controls' } }}
    >
      <Particles />
    </Scene>
  )
}
