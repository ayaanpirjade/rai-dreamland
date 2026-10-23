import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { Bubu, Dudu } from '../../three/Bear'
import { getHeartGeometry } from '../../three/geometry'
import { SoftEnvironment } from '../../three/SoftEnvironment'
import { buildHeartMaze, cellToWorld } from '../../games/maze/maze'
import { damp } from '../../lib/utils'

interface HeartMazeSceneProps {
  seed: number
  reducedMotion?: boolean
  /** Current cell of the player. */
  position: { x: number; y: number }
  won: boolean
  onReachGoal?: () => void
}

const CELL = 0.86

export function HeartMazeScene({ seed, reducedMotion = false, position, won, onReachGoal }: HeartMazeSceneProps) {
  const maze = useMemo(() => buildHeartMaze(11, seed), [seed])
  const bubu = useRef<THREE.Group>(null)
  const goalReached = useRef(false)
  const { camera } = useThree()

  const heartGeo = useMemo(() => getHeartGeometry(0.18), [])

  const tiles = useMemo(() => {
    const list: { x: number; z: number; color: string }[] = []
    maze.cells.forEach((k) => {
      const [gx, gy] = k.split(',').map(Number)
      const [x, z] = cellToWorld(maze, { x: gx, y: gy }, CELL)
      const alt = (gx + gy) % 2 === 0
      list.push({ x, z, color: alt ? '#ffe3f1' : '#f0e4ff' })
    })
    return list
  }, [maze])

  const walls = useMemo(() => {
    const list: { x: number; z: number; rotY: number }[] = []
    const half = (maze.size - 1) / 2
    maze.wallsV.forEach((k) => {
      const [gx, gy] = k.split(',').map(Number)
      list.push({ x: (gx - half) * CELL + CELL / 2, z: (half - gy) * CELL, rotY: Math.PI / 2 })
    })
    maze.wallsH.forEach((k) => {
      const [gx, gy] = k.split(',').map(Number)
      list.push({ x: (gx - half) * CELL, z: (half - gy) * CELL + CELL / 2, rotY: 0 })
    })
    return list
  }, [maze])

  const [goalX, goalZ] = cellToWorld(maze, maze.goal, CELL)
  const [startX, startZ] = cellToWorld(maze, maze.start, CELL)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const [tx, tz] = cellToWorld(maze, position, CELL)
    if (bubu.current) {
      bubu.current.position.x = damp(bubu.current.position.x, tx, 11, dt)
      bubu.current.position.z = damp(bubu.current.position.z, tz, 11, dt)
      bubu.current.rotation.y = damp(bubu.current.rotation.y, Math.PI, 4, dt)
    }
    if (won && !goalReached.current) {
      goalReached.current = true
      onReachGoal?.()
    }
    if (!won) goalReached.current = false

    camera.position.x = damp(camera.position.x, 0, 2, dt)
    camera.position.y = damp(camera.position.y, 9.4, 2, dt)
    camera.position.z = damp(camera.position.z, 7.6, 2, dt)
    camera.lookAt(0, 0, -0.4)
    void state
  })

  return (
    <>
      <SoftEnvironment intensity={0.45} />

      <hemisphereLight args={['#fff4fa', '#cbb9ef', 1.2]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[5, 9, 6]} intensity={1.2} color="#fff5ea" />
      <pointLight position={[0, 4, 2]} intensity={10} distance={12} color="#ffa9d0" />

      {/* floor tiles */}
      {tiles.map((tile, i) => (
        <mesh key={i} position={[tile.x, -0.06, tile.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[CELL * 0.94, CELL * 0.94]} />
          <meshStandardMaterial color={tile.color} roughness={0.92} />
        </mesh>
      ))}

      {/* walls */}
      {walls.map((wall, i) => (
        <mesh key={i} position={[wall.x, 0.16, wall.z]} rotation={[0, wall.rotY, 0]} castShadow>
          <boxGeometry args={[CELL * 0.94, 0.34, 0.1]} />
          <meshStandardMaterial color="#d9c3f0" roughness={0.75} />
        </mesh>
      ))}

      {/* heart outline glow on the floor */}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[maze.size * CELL * 0.56, 64]} />
        <meshBasicMaterial color="#ffd0e6" transparent opacity={0.25} depthWrite={false} />
      </mesh>

      {/* Bubu the explorer */}
      <group ref={bubu} position={[startX, 0, startZ]}>
        <Bubu scale={0.72} reducedMotion={reducedMotion} pose={won ? 'cheer' : 'idle'} />
      </group>

      {/* Dudu waiting at the top */}
      <group position={[goalX, 0, goalZ]}>
        <Dudu scale={0.78} reducedMotion={reducedMotion} pose={won ? 'wave' : 'idle'} />
      </group>
      <mesh position={[goalX, 0.85, goalZ]} geometry={heartGeo} scale={0.34}>
        <meshStandardMaterial color="#ff7fae" emissive="#ff7fae" emissiveIntensity={0.55} roughness={0.3} />
      </mesh>
    </>
  )
}
