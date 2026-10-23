import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

import { getHeartGeometry, getRoundedBoxGeometry } from '../../three/geometry'
import { getStarTexture } from '../../three/textures'
import { SoftEnvironment } from '../../three/SoftEnvironment'
import { damp } from '../../lib/utils'
import { qualityScale } from '../../lib/devices'
import type { DeviceProfile } from '../../lib/devices'

interface GiftRoomSceneProps {
  profile: DeviceProfile
  reducedMotion?: boolean
  /** Increment to open the box. */
  openToken?: number
  onOpened?: () => void
}

interface HeartBit {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  s: number
  r: number
}

export function GiftRoomScene({ profile, reducedMotion = false, openToken = 0, onOpened }: GiftRoomSceneProps) {
  const { camera } = useThree()
  const lid = useRef<THREE.Group>(null)
  const heart = useRef<THREE.Group>(null)
  const bits = useRef<THREE.Group>(null)
  const openProgress = useRef(0)
  const lastToken = useRef(openToken)
  const burstHearts = useRef<HeartBit[]>([])
  const starTex = useMemo(() => getStarTexture(), [])
  const scale = qualityScale(profile)

  const boxGeo = useMemo(() => getRoundedBoxGeometry(1.7, 1.25, 1.7, 0.16), [])
  const lidGeo = useMemo(() => getRoundedBoxGeometry(1.86, 0.42, 1.86, 0.14), [])
  const ribbonGeo = useMemo(() => getRoundedBoxGeometry(0.34, 1.3, 1.78, 0.06), [])
  const lidRibbonGeo = useMemo(() => getRoundedBoxGeometry(0.36, 0.46, 1.92, 0.06), [])
  const heartGeo = useMemo(() => getHeartGeometry(0.22), [])

  const burstCount = Math.max(18, Math.round(44 * scale))

  useEffect(() => {
    if (openToken === lastToken.current) return
    lastToken.current = openToken
    openProgress.current = 0.001
    burstHearts.current = Array.from({ length: burstCount }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.9 + Math.random() * 1.9
      return {
        x: (Math.random() - 0.5) * 0.4,
        y: 0.7 + Math.random() * 0.3,
        z: (Math.random() - 0.5) * 0.4,
        vx: Math.cos(angle) * speed * 0.6,
        vy: 1.4 + Math.random() * 1.6,
        vz: Math.sin(angle) * speed * 0.6,
        s: 0.12 + Math.random() * 0.16,
        r: Math.random() * Math.PI,
      }
    })
    onOpened?.()
  }, [openToken, burstCount, onOpened])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime

    if (openProgress.current > 0) {
      openProgress.current = Math.min(1, openProgress.current + dt * 0.9)
    }
    const p = openProgress.current
    const eased = p * p * (3 - 2 * p)

    if (lid.current) {
      lid.current.position.y = 0.78 + eased * 1.55
      lid.current.position.x = eased * 0.55
      lid.current.position.z = eased * -0.3
      lid.current.rotation.z = eased * 0.42
      lid.current.rotation.x = eased * -0.2
    }

    if (heart.current) {
      heart.current.visible = p > 0.08
      heart.current.position.y = 0.72 + eased * 0.85 + (reducedMotion ? 0 : Math.sin(t * 2.2) * 0.07)
      heart.current.rotation.y = reducedMotion ? 0.4 : t * 1.1
      const mat = (heart.current.children[0] as THREE.Mesh | undefined)?.material as
        | THREE.MeshStandardMaterial
        | undefined
      if (mat) mat.emissiveIntensity = 0.7 + Math.sin(t * 3) * 0.25 + eased * 0.6
    }

    if (bits.current) {
      const list = burstHearts.current
      list.forEach((bit, i) => {
        bit.vy -= 1.5 * dt
        bit.x += bit.vx * dt
        bit.y += bit.vy * dt
        bit.z += bit.vz * dt
        bit.r += dt * 2
        const child = bits.current?.children[i]
        if (child) {
          child.position.set(bit.x, bit.y, bit.z)
          child.rotation.set(bit.r, bit.r * 0.7, 0)
          const fade = Math.max(0, 1 - p)
          child.scale.setScalar(bit.s * (0.4 + fade * 0.8))
        }
      })
    }

    camera.position.x = damp(camera.position.x, 0, 1.4, dt)
    camera.position.y = damp(camera.position.y, 1.5 + eased * 0.5, 1.4, dt)
    camera.position.z = damp(camera.position.z, 6.4 - eased * 0.7, 1.4, dt)
    camera.lookAt(0, 0.85 + eased * 0.35, 0)
  })

  return (
    <>
      <SoftEnvironment intensity={0.55} />

      <hemisphereLight args={['#fff0f7', '#cdbcf5', 1.2]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3.5, 7, 5]} intensity={1.3} color="#fff5e8" />
      <pointLight position={[-3, 2.4, 2.6]} intensity={13} distance={10} color="#ff9fc8" />

      {/* gift box */}
      <group>
        <mesh geometry={boxGeo} position={[0, 0.32, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#ffc4dd" roughness={0.45} metalness={0.04} />
        </mesh>
        <mesh geometry={ribbonGeo} position={[0, 0.32, 0]} castShadow>
          <meshStandardMaterial color="#fff3c9" roughness={0.35} metalness={0.18} />
        </mesh>
        <mesh geometry={ribbonGeo} position={[0, 0.32, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <meshStandardMaterial color="#fff3c9" roughness={0.35} metalness={0.18} />
        </mesh>

        <group ref={lid} position={[0, 0.78, 0]}>
          <mesh geometry={lidGeo} castShadow>
            <meshStandardMaterial color="#ffb0d0" roughness={0.42} metalness={0.04} />
          </mesh>
          <mesh geometry={lidRibbonGeo} castShadow>
            <meshStandardMaterial color="#fff3c9" roughness={0.35} metalness={0.18} />
          </mesh>
          <mesh geometry={lidRibbonGeo} rotation={[0, Math.PI / 2, 0]} castShadow>
            <meshStandardMaterial color="#fff3c9" roughness={0.35} metalness={0.18} />
          </mesh>
          {/* bow */}
          <mesh position={[-0.26, 0.3, 0]} rotation={[0.2, 0, 0.5]} scale={[0.32, 0.19, 0.19]}>
            <torusGeometry args={[1, 0.42, 12, 22]} />
            <meshStandardMaterial color="#fff3c9" roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh position={[0.26, 0.3, 0]} rotation={[0.2, 0, -0.5]} scale={[0.32, 0.19, 0.19]}>
            <torusGeometry args={[1, 0.42, 12, 22]} />
            <meshStandardMaterial color="#fff3c9" roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.28, 0]} scale={0.14}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color="#ffe08a" roughness={0.3} metalness={0.2} />
          </mesh>
        </group>

        {/* glowing heart inside */}
        <group ref={heart} position={[0, 0.72, 0]} visible={false}>
          <mesh geometry={heartGeo} scale={0.62}>
            <meshStandardMaterial
              color="#ff6f9f"
              emissive="#ff6f9f"
              emissiveIntensity={0.8}
              roughness={0.25}
              metalness={0.12}
            />
          </mesh>
          <pointLight color="#ff8fb8" intensity={8} distance={5} />
          <sprite scale={[2.4, 2.4, 1]}>
            <spriteMaterial map={starTex} color="#ffc0da" transparent opacity={0.6} depthWrite={false} />
          </sprite>
        </group>
      </group>

      {/* burst hearts */}
      <group ref={bits}>
        {Array.from({ length: burstCount }, (_, i) => (
          <mesh key={i} geometry={heartGeo} visible={false}>
            <meshStandardMaterial
              color={['#ff7fae', '#ffa8c8', '#c9a8ff', '#ffb3a0'][i % 4]}
              emissive={['#ff7fae', '#ffa8c8', '#c9a8ff', '#ffb3a0'][i % 4]}
              emissiveIntensity={0.4}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* table */}
      <mesh position={[0, -0.31, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.4, 48]} />
        <meshStandardMaterial color="#f9e2f0" roughness={0.9} />
      </mesh>

      <Sparkles count={34} scale={[7, 5, 5]} position={[0, 1.4, 0]} size={3} speed={0.36} opacity={0.7} color="#ffe2f2" />
    </>
  )
}
