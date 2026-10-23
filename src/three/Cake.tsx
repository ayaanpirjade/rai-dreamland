import { useMemo } from 'react'
import * as THREE from 'three'

import { getFlatHeartGeometry, getHeartGeometry, getPuffGeometry } from './geometry'
import { makeTopperTexture } from './textures'

export interface CakeDecorations {
  /** Frosting / top colour of each layer, bottom to top. */
  layers: string[]
  icing: string
  candles: number
  hearts: number
  flowers: number
  strawberries: number
  topper: 'RAI' | 'heart' | 'star' | 'none'
}

export const DEFAULT_DECORATIONS: CakeDecorations = {
  layers: ['#ffd9ea', '#f3e2ff', '#fff2e0'],
  icing: '#fffaf4',
  candles: 5,
  hearts: 3,
  flowers: 4,
  strawberries: 4,
  topper: 'RAI',
}

interface CakeProps {
  decorations?: CakeDecorations
  lit?: boolean
  flare?: number
  scale?: number
  onCandleClick?: () => void
}

const LAYER_RADII = [1.5, 1.16, 0.84]
const LAYER_HEIGHTS = [0.82, 0.72, 0.64]

export function Cake({ decorations = DEFAULT_DECORATIONS, lit = true, flare = 0, scale = 1, onCandleClick }: CakeProps) {
  const heartGeo = useMemo(() => getHeartGeometry(0.16), [])
  const flatHeartGeo = useMemo(() => getFlatHeartGeometry(0.08), [])
  const puffGeo = useMemo(() => getPuffGeometry(1), [])
  const topperTex = useMemo(() => makeTopperTexture('RAI', '#ff6f9f'), [])

  const layerTops = useMemo(() => {
    const tops: number[] = []
    let y = 0
    for (const h of LAYER_HEIGHTS) {
      y += h
      tops.push(y)
    }
    return tops
  }, [])

  const topY = layerTops[layerTops.length - 1]

  return (
    <group scale={scale}>
      {/* plate */}
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[1.85, 1.95, 0.14, 48]} />
        <meshStandardMaterial color="#f7fbff" roughness={0.25} metalness={0.1} />
      </mesh>
      <mesh position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.86, 2.05, 48]} />
        <meshStandardMaterial color="#ffd9ea" roughness={0.4} />
      </mesh>

      {/* layers */}
      {LAYER_RADII.map((radius, i) => {
        const height = LAYER_HEIGHTS[i]
        const y = layerTops[i] - height / 2
        return (
          <group key={i}>
            <mesh position={[0, y, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[radius, radius, height, 48]} />
              <meshStandardMaterial color={decorations.layers[i] ?? '#ffd9ea'} roughness={0.62} metalness={0.02} />
            </mesh>
            {/* cream trim ring */}
            <mesh position={[0, layerTops[i] - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[radius * 0.99, 0.075, 10, 48]} />
              <meshStandardMaterial color={decorations.icing} roughness={0.45} />
            </mesh>
            {/* soft frosting cap */}
            <mesh position={[0, layerTops[i] + 0.02, 0]} scale={[1, 0.14, 1]}>
              <sphereGeometry args={[radius, 40, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={decorations.icing} roughness={0.5} />
            </mesh>
            {/* icing drips */}
            {Array.from({ length: 10 }, (_, d) => {
              const angle = (d / 10) * Math.PI * 2
              return (
                <mesh
                  key={d}
                  position={[Math.cos(angle) * radius * 0.99, layerTops[i] - 0.12 - (d % 3) * 0.06, Math.sin(angle) * radius * 0.99]}
                  scale={[0.09, 0.16 + (d % 3) * 0.05, 0.09]}
                >
                  <sphereGeometry args={[1, 12, 10]} />
                  <meshStandardMaterial color={decorations.icing} roughness={0.5} />
                </mesh>
              )
            })}
          </group>
        )
      })}

      {/* strawberries */}
      {Array.from({ length: decorations.strawberries }, (_, i) => {
        const angle = (i / Math.max(1, decorations.strawberries)) * Math.PI * 2 + 0.4
        const r = 0.52
        return (
          <group key={`s${i}`} position={[Math.cos(angle) * r, topY + 0.12, Math.sin(angle) * r]}>
            <mesh scale={[0.1, 0.13, 0.1]} castShadow>
              <coneGeometry args={[1, 1, 12]} />
              <meshStandardMaterial color="#ff6b81" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.12, 0]} scale={[0.09, 0.03, 0.09]}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color="#5ec48f" roughness={0.7} />
            </mesh>
          </group>
        )
      })}

      {/* little flowers */}
      {Array.from({ length: decorations.flowers }, (_, i) => {
        const angle = (i / Math.max(1, decorations.flowers)) * Math.PI * 2 - 0.5
        const r = 0.66
        const colors = ['#ffd98a', '#b7a4ff', '#ff9ec4', '#8fd8ff']
        return (
          <group key={`f${i}`} position={[Math.cos(angle) * r, topY + 0.08, Math.sin(angle) * r]}>
            {Array.from({ length: 5 }, (_, p) => {
              const pa = (p / 5) * Math.PI * 2
              return (
                <mesh
                  key={p}
                  position={[Math.cos(pa) * 0.07, 0, Math.sin(pa) * 0.07]}
                  scale={[0.055, 0.03, 0.055]}
                  geometry={puffGeo}
                >
                  <meshStandardMaterial color={colors[i % colors.length]} roughness={0.6} />
                </mesh>
              )
            })}
            <mesh position={[0, 0.015, 0]} scale={0.035}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color="#fff3c4" roughness={0.5} />
            </mesh>
          </group>
        )
      })}

      {/* hearts leaning on the cake */}
      {Array.from({ length: decorations.hearts }, (_, i) => {
        const angle = (i / Math.max(1, decorations.hearts)) * Math.PI * 2
        return (
          <mesh
            key={`h${i}`}
            position={[Math.cos(angle) * 1.42, 0.34, Math.sin(angle) * 1.42]}
            rotation={[0, -angle + Math.PI / 2, 0.18]}
            geometry={flatHeartGeo}
            scale={0.42}
          >
            <meshStandardMaterial color="#ff7fae" roughness={0.35} emissive="#ff7fae" emissiveIntensity={0.25} />
          </mesh>
        )
      })}

      {/* candles */}
      {Array.from({ length: decorations.candles }, (_, i) => {
        const count = Math.max(1, decorations.candles)
        const angle = (i / count) * Math.PI * 2
        const r = count > 1 ? 0.3 : 0
        const x = Math.cos(angle) * r
        const z = Math.sin(angle) * r
        const flameScale = 1 + flare * 0.7
        const striped = i % 2 === 0 ? '#ff9ec4' : '#fff3d6'
        return (
          <group key={`c${i}`} position={[x, topY + 0.04, z]} onClick={onCandleClick}>
            <mesh position={[0, 0.16, 0]} castShadow>
              <cylinderGeometry args={[0.055, 0.06, 0.32, 12]} />
              <meshStandardMaterial color={striped} roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.325, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.05, 6]} />
              <meshStandardMaterial color="#5c4a3a" roughness={0.9} />
            </mesh>
            {lit && (
              <group position={[0, 0.4, 0]} scale={flameScale}>
                <mesh>
                  <sphereGeometry args={[0.055, 12, 12]} />
                  <meshBasicMaterial color="#fff3b0" toneMapped={false} />
                </mesh>
                <mesh position={[0, 0.05, 0]} scale={[0.7, 1.5, 0.7]}>
                  <coneGeometry args={[0.04, 0.1, 10]} />
                  <meshBasicMaterial color="#ffb347" toneMapped={false} transparent opacity={0.9} />
                </mesh>
                <pointLight color="#ffca7a" intensity={1.1 + flare * 2.4} distance={3.4} />
              </group>
            )}
          </group>
        )
      })}

      {/* topper */}
      {decorations.topper === 'RAI' && (
        <group position={[0, topY + 0.36, 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.95, 0.48]} />
            <meshBasicMaterial map={topperTex} transparent toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
      {decorations.topper === 'heart' && (
        <mesh position={[0, topY + 0.42, 0]} geometry={heartGeo} scale={0.42}>
          <meshStandardMaterial color="#ff6f9f" roughness={0.3} emissive="#ff6f9f" emissiveIntensity={0.35} />
        </mesh>
      )}
      {decorations.topper === 'star' && (
        <mesh position={[0, topY + 0.44, 0]} rotation={[0, 0, 0.3]} scale={0.42}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#ffd98a" roughness={0.25} metalness={0.3} emissive="#ffcf7a" emissiveIntensity={0.3} />
        </mesh>
      )}
    </group>
  )
}
