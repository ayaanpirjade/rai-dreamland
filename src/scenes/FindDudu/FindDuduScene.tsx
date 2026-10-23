import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { Dudu } from '../../three/Bear'
import { getHeartGeometry, getPuffGeometry } from '../../three/geometry'
import { SoftEnvironment } from '../../three/SoftEnvironment'

export type HideSpotId = 'plant' | 'table' | 'cushion' | 'shelf' | 'toybox'

export interface FindDuduSceneProps {
  hiddenSpot: HideSpotId
  checked: HideSpotId[]
  found: boolean
  reducedMotion?: boolean
  onCheck: (spot: HideSpotId) => void
}

const SPOTS: { id: HideSpotId; label: string; position: [number, number, number]; dudu: [number, number, number] }[] = [
  { id: 'plant', label: 'the big plant', position: [3.5, 0, 1.4], dudu: [3.5, 0.05, 0.95] },
  { id: 'table', label: 'the little table', position: [2.6, 0, -2.3], dudu: [2.6, 0.02, -2.3] },
  { id: 'cushion', label: 'the round cushion', position: [-2.3, 0, 1.9], dudu: [-2.3, 0.08, 2.35] },
  { id: 'shelf', label: 'the bookshelf', position: [-2.9, 0, -2.4], dudu: [-2.7, 0.05, -2.1] },
  { id: 'toybox', label: 'the toy box', position: [0.4, 0, 2.5], dudu: [0.4, 0.12, 2.5] },
]

export function FindDuduScene({ hiddenSpot, checked, found, reducedMotion = false, onCheck }: FindDuduSceneProps) {
  const duduRef = useRef<THREE.Group>(null)
  const heartGroup = useRef<THREE.Group>(null)
  const foundAt = useRef(0)
  const puffGeo = useMemo(() => getPuffGeometry(1), [])
  const heartGeo = useMemo(() => getHeartGeometry(0.18), [])

  const hidden = SPOTS.find((s) => s.id === hiddenSpot) ?? SPOTS[0]

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (found && foundAt.current === 0) foundAt.current = t

    if (duduRef.current) {
      const targetScale = found ? 1 : 0
      const s = duduRef.current.scale.x
      const next = s + (targetScale - s) * Math.min(1, delta * 6)
      const pop = found && !reducedMotion ? 1 + Math.abs(Math.sin((t - foundAt.current) * 7)) * 0.14 : 1
      duduRef.current.scale.setScalar(next * pop)
      duduRef.current.visible = next > 0.02
      duduRef.current.position.y = hidden.dudu[1] + (found && !reducedMotion ? Math.abs(Math.sin((t - foundAt.current) * 6)) * 0.16 : 0)
    }

    if (heartGroup.current) {
      heartGroup.current.visible = found
      if (found) {
        const age = t - foundAt.current
        heartGroup.current.children.forEach((child, i) => {
          const a = age * 1.4 + i * 1.1
          const r = 0.6 + age * 0.9
          child.position.set(Math.cos(a) * r, 0.7 + age * 0.7 + Math.sin(i) * 0.2, Math.sin(a) * r * 0.6)
          child.rotation.z = a
          const s = Math.max(0, 0.3 - age * 0.06)
          child.scale.setScalar(s)
        })
      }
    }
  })

  return (
    <>
      <SoftEnvironment intensity={0.5} />

      <hemisphereLight args={['#fff2f8', '#c9b8f0', 1.25]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 7, 5]} intensity={1.25} color="#fff5e9" />
      <pointLight position={[-2.5, 2.4, 2.5]} intensity={11} distance={9} color="#ffa9d0" />

      {/* room */}
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#ffe9f3" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.2, -4.4]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#f2e6ff" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-4.9, 2.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#e9f1ff" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[4.9, 2.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#fff2e4" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* rug */}
      <mesh position={[0, 0.01, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.6, 48]} />
        <meshStandardMaterial color="#ffd6ea" roughness={0.95} />
      </mesh>

      {/* bookshelf */}
      <group
        position={[-2.9, 0, -2.4]}
        onClick={(e) => {
          e.stopPropagation()
          if (!found) onCheck('shelf')
        }}
      >
        <mesh position={[0, 1.05, 0]} scale={[0.7, 1.05, 0.3]} geometry={puffGeo}>
          <meshStandardMaterial color="#d9b98f" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.2, 0.18]} scale={[0.62, 0.72, 0.16]} geometry={puffGeo}>
          <meshStandardMaterial color="#c69a6d" roughness={0.85} />
        </mesh>
        {[0.7, 1.15, 1.6].map((y, i) => (
          <mesh key={i} position={[-0.4 + i * 0.32, y, 0.3]} scale={[0.09, 0.22, 0.06]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={['#ff9ec4', '#b7a4ff', '#8fd8ff'][i]} roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* little table with lamp */}
      <group
        position={[2.6, 0, -2.3]}
        onClick={(e) => {
          e.stopPropagation()
          if (!found) onCheck('table')
        }}
      >
        <mesh position={[0, 0.5, 0]} scale={[0.85, 0.12, 0.6]} geometry={puffGeo}>
          <meshStandardMaterial color="#f6d9b8" roughness={0.8} />
        </mesh>
        {[
          [-0.6, 0.25, -0.35],
          [0.6, 0.25, -0.35],
          [-0.6, 0.25, 0.35],
          [0.6, 0.25, 0.35],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} scale={[0.07, 0.3, 0.07]}>
            <cylinderGeometry args={[1, 1, 1, 8]} />
            <meshStandardMaterial color="#e8c49c" roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[0.1, 0.78, 0]} scale={[0.16, 0.2, 0.16]} geometry={puffGeo}>
          <meshStandardMaterial color="#ffe1a8" emissive="#ffcf7a" emissiveIntensity={0.6} roughness={0.5} />
        </mesh>
      </group>

      {/* plant */}
      <group
        position={[3.5, 0, 1.4]}
        onClick={(e) => {
          e.stopPropagation()
          if (!found) onCheck('plant')
        }}
      >
        <mesh position={[0, 0.22, 0]} scale={[0.28, 0.28, 0.28]} geometry={puffGeo}>
          <meshStandardMaterial color="#e8a67d" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.75, 0]} scale={[0.42, 0.5, 0.42]} geometry={puffGeo}>
          <meshStandardMaterial color="#8fd8a8" roughness={0.9} />
        </mesh>
        <mesh position={[0.18, 1.1, 0.1]} scale={[0.24, 0.3, 0.24]} geometry={puffGeo}>
          <meshStandardMaterial color="#a6e5bd" roughness={0.9} />
        </mesh>
      </group>

      {/* cushion */}
      <group
        position={[-2.3, 0, 1.9]}
        onClick={(e) => {
          e.stopPropagation()
          if (!found) onCheck('cushion')
        }}
      >
        <mesh position={[0, 0.16, 0]} scale={[0.62, 0.2, 0.62]} geometry={puffGeo}>
          <meshStandardMaterial color="#c9b6ff" roughness={0.9} />
        </mesh>
      </group>

      {/* toy box */}
      <group
        position={[0.4, 0, 2.5]}
        onClick={(e) => {
          e.stopPropagation()
          if (!found) onCheck('toybox')
        }}
      >
        <mesh position={[0, 0.24, 0]} scale={[0.5, 0.28, 0.4]} geometry={puffGeo}>
          <meshStandardMaterial color="#ffd48a" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.5, 0]} scale={[0.52, 0.06, 0.42]} geometry={puffGeo}>
          <meshStandardMaterial color="#ffe7b0" roughness={0.85} />
        </mesh>
      </group>

      {/* the hidden Dudu */}
      <group ref={duduRef} position={hidden.dudu} scale={0} visible={false}>
        <Dudu scale={1.05} reducedMotion={reducedMotion} pose={found ? 'cheer' : 'idle'} />
      </group>

      {/* celebration hearts */}
      <group ref={heartGroup} visible={false}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} geometry={heartGeo}>
            <meshStandardMaterial color="#ff7fae" emissive="#ff7fae" emissiveIntensity={0.4} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* hint markers on checked spots */}
      {SPOTS.filter((s) => checked.includes(s.id) && s.id !== hiddenSpot).map((s) => (
        <mesh key={`hint-${s.id}`} position={[s.position[0], 1.35, s.position[2]]} scale={0.16}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#cfc0e8" roughness={0.9} transparent opacity={0.8} />
        </mesh>
      ))}
    </>
  )
}
