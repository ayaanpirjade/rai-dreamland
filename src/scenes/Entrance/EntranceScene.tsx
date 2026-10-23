import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

import { Dudu } from '../../three/Bear'
import { getHeartGeometry, getHeartTubeGeometry, getPuffGeometry } from '../../three/geometry'
import { getStarTexture, makeSkyTexture } from '../../three/textures'
import { SoftEnvironment } from '../../three/SoftEnvironment'
import { damp } from '../../lib/utils'

export type EntrancePhase = 'approach' | 'reveal' | 'welcome'

interface EntranceSceneProps {
  phase: EntrancePhase
  reducedMotion?: boolean
}

const CAMERA_TARGETS: Record<EntrancePhase, { position: THREE.Vector3; look: THREE.Vector3 }> = {
  approach: { position: new THREE.Vector3(0, 3.2, 17), look: new THREE.Vector3(0, 1.6, 0) },
  reveal: { position: new THREE.Vector3(0.9, 2.4, 10.5), look: new THREE.Vector3(0, 1.6, 0) },
  welcome: { position: new THREE.Vector3(0, 2.1, 7.4), look: new THREE.Vector3(0, 1.5, 0) },
}

export function EntranceScene({ phase, reducedMotion = false }: EntranceSceneProps) {
  const { camera } = useThree()
  const currentLook = useRef(new THREE.Vector3(0, 1.6, 0))
  const heartGroup = useRef<THREE.Group>(null)
  const portalRef = useRef<THREE.Mesh>(null)
  const duduRef = useRef<THREE.Group>(null)

  const heartGeometry = useMemo(() => getHeartGeometry(0.22), [])
  const heartTubeGeometry = useMemo(() => getHeartTubeGeometry(0.075, 120, 12), [])
  const puffGeometry = useMemo(() => getPuffGeometry(2), [])
  const starTexture = useMemo(() => getStarTexture(), [])

  const cloudMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0.92,
      }),
    [],
  )

  const skyTexture = useMemo(
    () =>
      makeSkyTexture([
        { offset: 0, color: '#fff6ef' },
        { offset: 0.34, color: '#ffd9ec' },
        { offset: 0.62, color: '#e7d9ff' },
        { offset: 1, color: '#cfe4ff' },
      ]),
    [],
  )

  const clouds = useMemo(
    () => [
      { p: [-7.5, 5.4, -9] as const, s: 1.5 },
      { p: [6.8, 6.6, -13] as const, s: 1.9 },
      { p: [-4.2, -1.6, -6.5] as const, s: 1.1 },
      { p: [8.2, 0.6, -8.5] as const, s: 1.35 },
      { p: [0.5, 7.6, -18] as const, s: 2.2 },
    ],
    [],
  )

  const floatingHearts = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => ({
        position: [
          Math.sin(i * 2.1) * 5.4,
          -1.4 + ((i * 1.37) % 6.2),
          -1.5 - (i % 5) * 1.3,
        ] as [number, number, number],
        scale: 0.3 + (i % 4) * 0.12,
        speed: 0.35 + (i % 5) * 0.09,
        phase: i * 0.8,
        color: ['#ff8fb8', '#ffa8c8', '#c9a8ff', '#ffb3a0', '#ff7fae'][i % 5],
      })),
    [],
  )

  const heartMaterials = useMemo(
    () =>
      floatingHearts.map(
        (heart) =>
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(heart.color),
            emissive: new THREE.Color(heart.color),
            emissiveIntensity: 0.25,
            roughness: 0.35,
            metalness: 0.05,
          }),
      ),
    [floatingHearts],
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const target = CAMERA_TARGETS[phase]

    camera.position.x = damp(camera.position.x, target.position.x, 1.8, dt)
    camera.position.y = damp(camera.position.y, target.position.y, 1.8, dt)
    camera.position.z = damp(camera.position.z, target.position.z, 1.4, dt)

    currentLook.current.x = damp(currentLook.current.x, target.look.x, 2, dt)
    currentLook.current.y = damp(currentLook.current.y, target.look.y, 2, dt)
    currentLook.current.z = damp(currentLook.current.z, target.look.z, 2, dt)
    camera.lookAt(currentLook.current)

    if (heartGroup.current && !reducedMotion) {
      heartGroup.current.children.forEach((child, i) => {
        child.position.y = Math.sin(t * floatingHearts[i].speed + floatingHearts[i].phase) * 0.42
        child.rotation.z = Math.sin(t * 0.6 + i) * 0.35
        child.rotation.y = t * 0.25 + i
      })
    }

    if (portalRef.current) {
      const pulse = reducedMotion ? 1 : 1 + Math.sin(t * 1.7) * 0.06
      portalRef.current.scale.setScalar(pulse)
      const material = portalRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = reducedMotion ? 0.9 : 0.75 + Math.sin(t * 2.1) * 0.25
    }

    if (duduRef.current) {
      const bob = reducedMotion ? 0 : Math.sin(t * 2.1) * 0.05
      duduRef.current.position.y = bob
    }
  })

  return (
    <>
      <SoftEnvironment intensity={0.5} />

      {/* sky dome */}
      <mesh scale={[-1, 1, 1]} position={[0, 0, 0]}>
        <sphereGeometry args={[90, 32, 24]} />
        <meshBasicMaterial map={skyTexture} side={THREE.BackSide} toneMapped={false} />
      </mesh>

      {/* ambient light */}
      <hemisphereLight args={['#ffe9f6', '#cbb6ff', 1.35]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 9, 7]} intensity={1.5} color="#fff3e0" />
      <pointLight position={[-5, 2.5, 4]} intensity={26} distance={18} color="#ff9ec9" />
      <pointLight position={[5.5, 3.5, -2]} intensity={20} distance={16} color="#a9c9ff" />

      {/* stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              Float32Array.from(
                Array.from({ length: 220 }, () => [
                  (Math.random() - 0.5) * 70,
                  Math.random() * 26 - 2,
                  -12 - Math.random() * 45,
                ]),
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.42}
          map={starTexture}
          transparent
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          color="#fff0f8"
          opacity={0.9}
        />
      </points>

      {/* clouds */}
      {clouds.map((cloud, i) => (
        <group key={i} position={cloud.p as unknown as [number, number, number]} scale={cloud.s}>
          {[
            [0, 0, 0, 1],
            [0.95, 0.18, 0.1, 0.72],
            [-0.95, 0.12, -0.15, 0.68],
            [0.35, 0.55, 0.2, 0.6],
            [-0.45, 0.48, 0.05, 0.55],
          ].map(([x, y, z, s], j) => (
            <mesh
              key={j}
              position={[x, y, z]}
              scale={s}
              geometry={puffGeometry}
              material={cloudMaterial}
            />
          ))}
        </group>
      ))}

      {/* heart-shaped glowing doorway */}
      <group position={[0, 1.5, -3.6]} rotation={[0, 0, 0]}>
        <mesh ref={portalRef} geometry={heartTubeGeometry} scale={2.6}>
          <meshStandardMaterial
            color="#ffc0da"
            emissive="#ff7fb0"
            emissiveIntensity={0.9}
            roughness={0.25}
            metalness={0.15}
            transparent
            opacity={0.95}
          />
        </mesh>
        <mesh position={[0, 0, -0.18]} scale={2.2}>
          <circleGeometry args={[1, 48]} />
          <meshBasicMaterial color="#fff0f8" transparent opacity={0.32} depthWrite={false} />
        </mesh>
        <pointLight position={[0, 0, 1.2]} intensity={22} distance={14} color="#ff9ec9" />
      </group>

      {/* floating hearts */}
      <group ref={heartGroup}>
        {floatingHearts.map((heart, i) => (
          <Float key={i} speed={1.6} rotationIntensity={0.4} floatIntensity={0.6}>
            <mesh
              position={heart.position}
              scale={heart.scale}
              geometry={heartGeometry}
              material={heartMaterials[i]}
            />
          </Float>
        ))}
      </group>

      {/* sparkles */}
      <Sparkles
        count={reducedMotion ? 18 : 58}
        scale={[22, 12, 14]}
        position={[0, 2.4, -4]}
        size={4.2}
        speed={0.35}
        opacity={0.85}
        color="#ffd9ec"
      />

      {/* Dudu waiting at the door */}
      <group ref={duduRef} position={[0, -1.05, 0.6]} scale={1.35}>
        <Dudu pose="wave" reducedMotion={reducedMotion} />
      </group>

      {/* soft floor disc so Dudu isn't floating in the void */}
      <mesh position={[0, -1.08, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.4, 48]} />
        <meshStandardMaterial color="#ffe4f2" roughness={0.85} transparent opacity={0.75} />
      </mesh>
    </>
  )
}
