import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

import { getFlatHeartGeometry, getHeartGeometry, getPuffGeometry, mergeAll, seededRandom } from '../../three/geometry'
import { getStarTexture, makeSkyTexture } from '../../three/textures'
import { SoftEnvironment } from '../../three/SoftEnvironment'
import { damp } from '../../lib/utils'
import { qualityScale } from '../../lib/devices'
import type { DeviceProfile } from '../../lib/devices'

interface DreamlandSceneProps {
  profile: DeviceProfile
  reducedMotion?: boolean
  onCollect?: (note: string) => void
}

function paint(geo: THREE.BufferGeometry, color: string) {
  const c = new THREE.Color(color)
  const count = geo.attributes.position.count
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geo
}

const TREE_COLORS = ['#ff9fc7', '#ffb6d4', '#c3a9ff', '#9ed2ff', '#ffc59c', '#ff8fb0']

export function DreamlandScene({ profile, reducedMotion = false, onCollect }: DreamlandSceneProps) {
  const { camera, pointer } = useThree()
  const group = useRef<THREE.Group>(null)
  const heartsRef = useRef<THREE.Group>(null)
  const scale = qualityScale(profile)

  const skyTexture = useMemo(
    () =>
      makeSkyTexture([
        { offset: 0, color: '#f6e2ff' },
        { offset: 0.32, color: '#ffd9ec' },
        { offset: 0.68, color: '#e4d9ff' },
        { offset: 1, color: '#d7ecff' },
      ]),
    [],
  )

  const starTexture = useMemo(() => getStarTexture(), [])

  /* --- islands ------------------------------------------------------------ */
  const islands = useMemo(() => {
    const list = [
      { x: 0, y: -4.6, z: 0, r: 7.5, h: 2.6, top: '#b7ecd0' },
      { x: -14, y: -1.6, z: -7, r: 3.4, h: 2.2, top: '#a8e6c6' },
      { x: 13.5, y: -0.4, z: -9, r: 3.9, h: 2.6, top: '#c8f0d8' },
      { x: -10.5, y: 2.6, z: -13, r: 2.7, h: 2, top: '#bdf0d6' },
      { x: 11, y: 3.4, z: -15, r: 3.1, h: 2.3, top: '#a9e6cb' },
      { x: 2.5, y: 5.6, z: -22, r: 2.4, h: 1.9, top: '#c4efd9' },
    ]
    const geos: THREE.BufferGeometry[] = []
    for (const isl of list) {
      const rock = new THREE.ConeGeometry(isl.r, isl.h, 22, 1)
      rock.translate(isl.x, isl.y - isl.h / 2, isl.z)
      paint(rock, '#d9c6ef')
      geos.push(rock)

      const grass = new THREE.CylinderGeometry(isl.r, isl.r * 0.98, 0.34, 24)
      grass.translate(isl.x, isl.y - 0.1, isl.z)
      paint(grass, isl.top)
      geos.push(grass)

      const lip = new THREE.TorusGeometry(isl.r * 0.96, 0.14, 8, 28)
      lip.rotateX(Math.PI / 2)
      lip.translate(isl.x, isl.y - 0.28, isl.z)
      paint(lip, '#e8dcff')
      geos.push(lip)
    }
    return mergeAll(geos)
  }, [])

  /* --- candy trees -------------------------------------------------------- */
  const trees = useMemo(() => {
    const rand = seededRandom(21)
    const geos: THREE.BufferGeometry[] = []
    const spots: [number, number, number][] = [
      [3.4, -4.4, 1.8],
      [-3.8, -4.4, 2.4],
      [1.2, -4.4, -3.6],
      [-5.4, -4.4, -1.4],
      [5.2, -4.4, -2.6],
      [-1.6, -4.4, 4.6],
      [4.6, -4.4, 3.6],
      [-6.2, -4.4, 3.1],
      [0.2, -4.4, -5.4],
      [-13.2, -1.5, -6.4],
      [12.8, -0.3, -8.4],
      [-9.6, 2.7, -12.4],
      [10.2, 3.5, -14.4],
    ]
    spots.forEach(([x, y, z], i) => {
      const h = 1.1 + rand() * 0.9
      const trunk = new THREE.CylinderGeometry(0.1, 0.14, h, 8)
      trunk.translate(x, y + h / 2, z)
      paint(trunk, '#d8a97c')
      geos.push(trunk)

      const color = TREE_COLORS[i % TREE_COLORS.length]
      const blobA = new THREE.IcosahedronGeometry(0.62 + rand() * 0.2, 1)
      blobA.translate(x, y + h + 0.35, z)
      paint(blobA, color)
      geos.push(blobA)

      const blobB = new THREE.IcosahedronGeometry(0.42 + rand() * 0.16, 1)
      blobB.translate(x + 0.38, y + h - 0.05, z + 0.16)
      paint(blobB, color)
      geos.push(blobB)

      const blobC = new THREE.IcosahedronGeometry(0.36 + rand() * 0.14, 1)
      blobC.translate(x - 0.34, y + h + 0.05, z - 0.2)
      paint(blobC, color)
      geos.push(blobC)
    })
    return mergeAll(geos)
  }, [])

  /* --- glowing flowers ---------------------------------------------------- */
  const flowers = useMemo(() => {
    const rand = seededRandom(99)
    const geos: THREE.BufferGeometry[] = []
    const count = Math.round(46 * scale)
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2
      const radius = 1.4 + rand() * 5.6
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const stem = new THREE.CylinderGeometry(0.025, 0.035, 0.34 + rand() * 0.2, 5)
      stem.translate(x, -4.2, z)
      paint(stem, '#7fd6ae')
      geos.push(stem)

      const petalColor = ['#ff9ec4', '#ffd98a', '#b7a4ff', '#ffffff'][i % 4]
      const head = new THREE.IcosahedronGeometry(0.11 + rand() * 0.05, 0)
      head.translate(x, -3.98 + rand() * 0.2, z)
      paint(head, petalColor)
      geos.push(head)
    }
    return mergeAll(geos)
  }, [scale])

  /* --- heart bushes -------------------------------------------------------- */
  const bushes = useMemo(() => {
    const rand = seededRandom(1234)
    const geos: THREE.BufferGeometry[] = []
    const count = Math.round(11 * scale)
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2
      const radius = 2.2 + rand() * 4.8
      const geo = getFlatHeartGeometry(0.14).clone()
      geo.rotateX(-Math.PI / 2)
      geo.scale(0.9 + rand() * 0.5, 0.9 + rand() * 0.4, 0.9)
      geo.translate(Math.cos(angle) * radius, -4.28, Math.sin(angle) * radius)
      paint(geo, ['#8fe3b8', '#a9e6c6', '#b8ecd2'][i % 3])
      geos.push(geo)
    }
    return mergeAll(geos)
  }, [scale])

  /* --- stepping-stone path ------------------------------------------------ */
  const path = useMemo(() => {
    const geos: THREE.BufferGeometry[] = []
    for (let i = 0; i < 14; i++) {
      const t = i / 13
      const x = Math.sin(t * 3.1) * 2.6
      const z = 6.6 - t * 13
      const stone = new THREE.CylinderGeometry(0.55 - t * 0.12, 0.6 - t * 0.12, 0.16, 14)
      stone.translate(x, -4.42, z)
      paint(stone, i % 2 === 0 ? '#ffe2f0' : '#f0e2ff')
      geos.push(stone)
    }
    return mergeAll(geos)
  }, [])

  const heartGeometry = useMemo(() => getHeartGeometry(0.2), [])
  const flatHeartGeometry = useMemo(() => getFlatHeartGeometry(0.12), [])
  const puffGeometry = useMemo(() => getPuffGeometry(1), [])

  const collectibles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const positions: [number, number, number][] = [
          [-4.6, -2.2, 1.2],
          [5.2, -0.6, -1.4],
          [0.4, -1.4, 3.4],
          [-6.4, 0.2, -2.6],
          [7.2, 0.8, 1.6],
          [0.2, 1.2, -4.4],
        ]
        return {
          position: positions[i],
          color: ['#ff7fb0', '#ffa8c8', '#b79cff', '#ffb3a0', '#ff8fb8', '#f4a7ff'][i],
        }
      }),
    [],
  )

  const collectibleMaterials = useMemo(
    () =>
      collectibles.map(
        (item) =>
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(item.color),
            emissive: new THREE.Color(item.color),
            emissiveIntensity: 0.5,
            roughness: 0.3,
            metalness: 0.05,
          }),
      ),
    [collectibles],
  )

  const collectNotes = useMemo(
    () => [
      'Ek chhota sa dil — tere liye hi rakha hai.',
      'Tumhari smile se meri har subah achhi hoti hai.',
      'Dudu ko pata hai bubu uska sabse purana dost hai.',
      'Ye duniya kitni khoobsurat hai jab tum isme ho.',
      'Ek wish: tum hamesha khush raho, Darling Begum.',
      '24 October — sirf tumhara din hai.',
    ],
    [],
  )

  const lanterns = useMemo(
    () => [
      { p: [-7.4, 1.4, -5.2] as const, c: '#ffd48a' },
      { p: [7.8, 2.6, -6.6] as const, c: '#ffa9d0' },
      { p: [-3.4, 3.6, -2.4] as const, c: '#b6c6ff' },
      { p: [9.4, -0.2, 1.2] as const, c: '#ffc0a8' },
      { p: [-10.2, 0.4, 2.6] as const, c: '#c9b6ff' },
    ],
    [],
  )

  const clouds = useMemo(
    () => [
      { p: [-9.5, 6.2, -14] as const, s: 1.5 },
      { p: [8.2, 7.4, -17] as const, s: 1.9 },
      { p: [-5.2, 1.2, -9] as const, s: 1.1 },
      { p: [11.2, 2.4, -11] as const, s: 1.35 },
      { p: [0.5, 8.6, -22] as const, s: 2.2 },
      { p: [-13.5, 3.2, -6] as const, s: 1.25 },
      { p: [5.4, -0.6, -5] as const, s: 0.9 },
    ],
    [],
  )

  const cloudMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0.88,
      }),
    [],
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime

    if (!reducedMotion) {
      const targetX = pointer.x * 2.4
      const targetY = 6.4 + pointer.y * 1.4
      camera.position.x = damp(camera.position.x, targetX, 1.1, dt)
      camera.position.y = damp(camera.position.y, targetY, 1.1, dt)
      camera.position.z = damp(camera.position.z, 19, 1.1, dt)
      camera.lookAt(0, -1.2, 0)
    }

    if (group.current && !reducedMotion) {
      group.current.rotation.y = Math.sin(t * 0.05) * 0.06
      group.current.position.y = Math.sin(t * 0.35) * 0.12
    }

    if (heartsRef.current && !reducedMotion) {
      heartsRef.current.children.forEach((child, i) => {
        child.position.y = collectibles[i].position[1] + Math.sin(t * 1.4 + i) * 0.22
        child.rotation.y = t * 0.9 + i
        child.rotation.z = Math.sin(t * 0.8 + i) * 0.2
      })
    }
  })

  return (
    <>
      <SoftEnvironment intensity={0.42} />

      {/* Soft sky veil — keeps the pastel mood without hiding the CSS wallpaper */}
      <mesh scale={[-1, 1, 1]} position={[0, 0, 0]}>
        <sphereGeometry args={[100, 24, 16]} />
        <meshBasicMaterial
          map={skyTexture}
          side={THREE.BackSide}
          toneMapped={false}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>

      <hemisphereLight args={['#ffe4f3', '#c6b6ff', 1.15]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 14, 9]} intensity={1.35} color="#fff4e2" />
      <directionalLight position={[-9, 6, -8]} intensity={0.6} color="#dcc9ff" />

      {/* moon */}
      <group position={[-13, 11, -34]}>
        <mesh>
          <sphereGeometry args={[2.8, 32, 24]} />
          <meshStandardMaterial color="#fff6e2" emissive="#ffe6b8" emissiveIntensity={0.7} roughness={0.9} />
        </mesh>
        <sprite scale={[12, 12, 1]}>
          <spriteMaterial map={starTexture} color="#ffe9c9" transparent opacity={0.6} depthWrite={false} />
        </sprite>
      </group>

      {/* stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              Float32Array.from(
                Array.from({ length: Math.round(320 * scale) }, () => [
                  (Math.random() - 0.5) * 120,
                  Math.random() * 40 - 8,
                  -10 - Math.random() * 60,
                ]),
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          map={starTexture}
          transparent
          depthWrite={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          color="#fff3fb"
          opacity={0.85}
        />
      </points>

      {/* fluffy clouds drifting across the whole sky */}
      {clouds.map((cloud, i) => (
        <group key={i} position={[cloud.p[0], cloud.p[1], cloud.p[2]]} scale={cloud.s}>
          {[
            [0, 0, 0, 1],
            [0.95, 0.18, 0.1, 0.72],
            [-0.95, 0.12, -0.15, 0.68],
            [0.35, 0.55, 0.2, 0.6],
            [-0.45, 0.48, 0.05, 0.55],
          ].map(([x, y, z, s], j) => (
            <mesh key={j} position={[x, y, z]} scale={s} geometry={puffGeometry} material={cloudMaterial} />
          ))}
        </group>
      ))}

      <group ref={group}>
        {/* world */}
        <mesh geometry={islands}>
          <meshStandardMaterial vertexColors roughness={0.95} metalness={0} flatShading={false} />
        </mesh>
        <mesh geometry={trees}>
          <meshStandardMaterial vertexColors roughness={0.88} metalness={0} />
        </mesh>
        <mesh geometry={flowers}>
          <meshStandardMaterial
            vertexColors
            roughness={0.55}
            metalness={0}
            emissive="#ffd7ec"
            emissiveIntensity={0.25}
          />
        </mesh>
        <mesh geometry={bushes}>
          <meshStandardMaterial vertexColors roughness={0.9} metalness={0} />
        </mesh>
        <mesh geometry={path}>
          <meshStandardMaterial vertexColors roughness={0.8} metalness={0.02} />
        </mesh>

        {/* pond */}
        <mesh position={[-2.6, -4.36, -2.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.9, 48]} />
          <meshStandardMaterial color="#b9e4ff" roughness={0.08} metalness={0.35} transparent opacity={0.92} />
        </mesh>
        <mesh position={[-2.6, -4.34, -2.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.9, 2.15, 48]} />
          <meshStandardMaterial color="#ffd9ef" roughness={0.9} />
        </mesh>

        {/* a cozy bear house */}
        <group position={[4.1, -4.3, 2.9]} rotation={[0, -0.5, 0]}>
          <mesh position={[0, 0.55, 0]} scale={[0.95, 0.7, 0.85]} geometry={puffGeometry}>
            <meshStandardMaterial color="#ffe6f3" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.2, 0]} rotation={[0, 0.78, 0]} scale={[0.62, 0.62, 0.16]} geometry={puffGeometry}>
            <meshStandardMaterial color="#ff9ec7" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.42, 0.78]} scale={[0.3, 0.34, 0.12]}>
            <circleGeometry args={[1, 24]} />
            <meshStandardMaterial color="#a9825f" roughness={0.9} />
          </mesh>
        </group>

        {/* floating lanterns */}
        {lanterns.map((lantern, i) => (
          <group key={i} position={[lantern.p[0], lantern.p[1], lantern.p[2]]}>
            <mesh scale={[0.24, 0.32, 0.24]} geometry={puffGeometry}>
              <meshStandardMaterial
                color="#fff3d6"
                emissive={lantern.c}
                emissiveIntensity={0.9}
                roughness={0.5}
                transparent
                opacity={0.95}
              />
            </mesh>
            {i < 2 && <pointLight color={lantern.c} intensity={9} distance={9} />}
          </group>
        ))}

        {/* collectible hearts */}
        <group ref={heartsRef}>
          {collectibles.map((item, i) => (
            <mesh
              key={i}
              position={item.position}
              geometry={heartGeometry}
              material={collectibleMaterials[i]}
              scale={0.42}
              onClick={(e) => {
                e.stopPropagation()
                onCollect?.(collectNotes[i])
              }}
            />
          ))}
        </group>
      </group>

      {/* foreground decorative hearts */}
      <mesh geometry={flatHeartGeometry} position={[-11.5, -1.2, 6]} scale={1.8} rotation={[0.2, 0.5, 0.3]}>
        <meshStandardMaterial color="#ffc0da" roughness={0.6} transparent opacity={0.55} />
      </mesh>
      <mesh geometry={flatHeartGeometry} position={[12, 1.4, 5]} scale={2.2} rotation={[-0.3, -0.4, 0.8]}>
        <meshStandardMaterial color="#d9c2ff" roughness={0.6} transparent opacity={0.45} />
      </mesh>

      <Sparkles
        count={Math.round(50 * scale)}
        scale={[40, 22, 26]}
        position={[0, 2, -6]}
        size={5}
        speed={0.28}
        opacity={0.7}
        color="#ffe6f6"
      />
    </>
  )
}
