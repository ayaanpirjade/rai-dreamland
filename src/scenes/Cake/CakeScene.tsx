import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

import { Cake } from '../../three/Cake'
import { DEFAULT_DECORATIONS } from '../../three/Cake'
import type { CakeDecorations } from '../../three/Cake'
import { SoftEnvironment } from '../../three/SoftEnvironment'
import { damp } from '../../lib/utils'
import { qualityScale } from '../../lib/devices'
import type { DeviceProfile } from '../../lib/devices'

interface CakeSceneProps {
  profile: DeviceProfile
  reducedMotion?: boolean
  /** Increment to trigger the wish + confetti celebration. */
  wishToken?: number
  decorations?: CakeDecorations
  onCelebrate?: () => void
}

interface Confetto {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  rx: number
  ry: number
  rz: number
  sx: number
  sy: number
  sz: number
}

const CONFETTI_COLORS = ['#ff8fb8', '#ffd98a', '#b7a4ff', '#8fd8ff', '#a9e6c6', '#ffffff', '#ffb3a0']

export function CakeScene({ profile, reducedMotion = false, wishToken = 0, decorations, onCelebrate }: CakeSceneProps) {
  const { camera } = useThree()
  const confettiRef = useRef<THREE.InstancedMesh>(null)
  const particles = useRef<Confetto[]>([])
  const active = useRef(false)
  const flare = useRef(0)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const lastToken = useRef(wishToken)
  const cameraTarget = useRef(new THREE.Vector3(0, 1.35, 6.6))
  const scale = qualityScale(profile)

  const count = Math.max(40, Math.round(160 * scale))

  useEffect(() => {
    if (wishToken === lastToken.current) return
    lastToken.current = wishToken

    flare.current = 1
    active.current = true
    particles.current = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 2.2 + Math.random() * 3.4
      return {
        x: (Math.random() - 0.5) * 0.5,
        y: 2.1 + Math.random() * 0.4,
        z: (Math.random() - 0.5) * 0.5,
        vx: Math.cos(angle) * speed * 0.55,
        vy: 4.2 + Math.random() * 3.2,
        vz: Math.sin(angle) * speed * 0.55,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        rz: Math.random() * Math.PI,
        sx: (Math.random() - 0.5) * 9,
        sy: (Math.random() - 0.5) * 9,
        sz: (Math.random() - 0.5) * 9,
      }
    })

    const mesh = confettiRef.current
    if (mesh) {
      for (let i = 0; i < count; i++) {
        const color = new THREE.Color(CONFETTI_COLORS[i % CONFETTI_COLORS.length])
        mesh.setColorAt(i, color)
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }

    onCelebrate?.()
  }, [wishToken, count, onCelebrate])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime

    // candle flare settles down after the wish
    flare.current = damp(flare.current, 0, 1.2, dt)

    // camera drifts in while celebrating
    const targetZ = active.current ? 5.4 : 6.6
    cameraTarget.current.z = damp(cameraTarget.current.z, targetZ, 1.2, dt)
    camera.position.z = damp(camera.position.z, cameraTarget.current.z, 1.6, dt)
    camera.position.y = damp(camera.position.y, active.current ? 1.9 : 1.5, 1.4, dt)
    camera.lookAt(0, 1.15, 0)

    const mesh = confettiRef.current
    if (mesh) {
      const list = particles.current
      for (let i = 0; i < list.length; i++) {
        const p = list[i]
        p.vy -= 6.4 * dt
        p.vx *= 0.995
        p.vz *= 0.995
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.z += p.vz * dt
        p.rx += p.sx * dt
        p.ry += p.sy * dt
        p.rz += p.sz * dt

        if (p.y < -1.6) {
          p.y = -1.6
          p.vy = 0
          p.vx *= 0.9
          p.vz *= 0.9
        }

        dummy.position.set(p.x, p.y, p.z)
        dummy.rotation.set(p.rx, p.ry, p.rz)
        const w = reducedMotion ? 0.02 : 0.13
        dummy.scale.set(w, w * 1.7, w * 0.35)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
      if (active.current && list.every((p) => p.y <= -1.55)) active.current = false
    }

    void t
  })

  return (
    <>
      <SoftEnvironment intensity={0.55} />

      <hemisphereLight args={['#fff0f8', '#d9c9ff', 1.25]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 6]} intensity={1.35} color="#fff6ea" />
      <pointLight position={[-3.4, 2.6, 3]} intensity={16} distance={12} color="#ffa9d0" />
      <pointLight position={[3.6, 3, -2]} intensity={12} distance={12} color="#b9c9ff" />

      {/* table */}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 48]} />
        <meshStandardMaterial color="#fbe6f2" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6, 6.35, 48]} />
        <meshStandardMaterial color="#ffd0e6" roughness={0.8} />
      </mesh>

      <group position={[0, 0, 0]}>
        <Cake decorations={decorations ?? DEFAULT_DECORATIONS} lit flare={flare.current} />
      </group>

      <instancedMesh ref={confettiRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial side={THREE.DoubleSide} toneMapped={false} />
      </instancedMesh>

      <Sparkles count={40} scale={[9, 5, 6]} position={[0, 2.4, 0]} size={3.6} speed={0.42} opacity={0.8} color="#ffe0f2" />
    </>
  )
}
