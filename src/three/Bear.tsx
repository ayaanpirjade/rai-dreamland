import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getHeartGeometry } from './geometry'

export type BearPose = 'idle' | 'wave' | 'heart' | 'cheer' | 'hug' | 'sleep'
export type BearAccessory = 'bow' | 'bowtie' | 'none'

export interface BearProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  bodyColor?: string
  bellyColor?: string
  innerEarColor?: string
  cheekColor?: string
  eyeColor?: string
  noseColor?: string
  tongueColor?: string
  outlineColor?: string
  heartColor?: string
  accessory?: BearAccessory
  pose?: BearPose
  /** 0 = neutral, 1 = fully hugging (arms reach forward). */
  hug?: number
  onPoke?: () => void
  interactive?: boolean
  reducedMotion?: boolean
  castShadow?: boolean
  name?: string
}

const OUTLINE = '#3a2620'

/**
 * Bubu & Dudu — original kawaii bears built entirely from Three.js geometry.
 *
 * They follow the sticker reference: thick dark outlines, big round ears,
 * simple dot eyes with a sparkle, soft blush, and a tiny open mouth with a
 * pink tongue. Bubu is the white bear, Dudu is the honey-brown one.
 */
export function Bear({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  bodyColor = '#c8925f',
  bellyColor = '#e8bd93',
  innerEarColor = '#7a4a34',
  cheekColor = '#f7d68d',
  eyeColor = '#2a1a14',
  noseColor = '#3a2620',
  tongueColor = '#f492a3',
  outlineColor = OUTLINE,
  heartColor = '#ff6f9f',
  accessory = 'none',
  pose = 'idle',
  hug = 0,
  onPoke,
  interactive = false,
  reducedMotion = false,
  castShadow = true,
  name,
}: BearProps) {
  const root = useRef<THREE.Group>(null)
  const bodyGroup = useRef<THREE.Group>(null)
  const headGroup = useRef<THREE.Group>(null)
  const armLeft = useRef<THREE.Group>(null)
  const armRight = useRef<THREE.Group>(null)
  const eyeLeft = useRef<THREE.Group>(null)
  const eyeRight = useRef<THREE.Group>(null)
  const heartRef = useRef<THREE.Group>(null)

  const blink = useRef({ next: 1.6, closed: 0 })
  const hover = useRef(0)
  const gl = useThree((state) => state.gl)

  const materials = useMemo(() => {
    const fur = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bodyColor),
      roughness: 0.95,
      metalness: 0,
    })
    const belly = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bellyColor),
      roughness: 0.96,
      metalness: 0,
    })
    const inner = new THREE.MeshStandardMaterial({
      color: new THREE.Color(innerEarColor),
      roughness: 0.92,
      metalness: 0,
    })
    const cheek = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cheekColor),
      roughness: 0.9,
      metalness: 0,
      transparent: true,
      opacity: 0.85,
    })
    const eye = new THREE.MeshStandardMaterial({
      color: new THREE.Color(eyeColor),
      roughness: 0.3,
      metalness: 0.05,
    })
    const shine = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 })
    const nose = new THREE.MeshStandardMaterial({
      color: new THREE.Color(noseColor),
      roughness: 0.45,
      metalness: 0,
    })
    const tongue = new THREE.MeshStandardMaterial({
      color: new THREE.Color(tongueColor),
      roughness: 0.5,
      metalness: 0,
    })
    const outline = new THREE.MeshBasicMaterial({
      color: new THREE.Color(outlineColor),
      side: THREE.BackSide,
    })
    const heart = new THREE.MeshStandardMaterial({
      color: new THREE.Color(heartColor),
      roughness: 0.32,
      metalness: 0.08,
      emissive: new THREE.Color(heartColor),
      emissiveIntensity: 0.32,
    })
    const bowPink = new THREE.MeshStandardMaterial({ color: '#ff8fb4', roughness: 0.5 })
    const bowTie = new THREE.MeshStandardMaterial({ color: '#2e2a2a', roughness: 0.55 })
    return { fur, belly, inner, cheek, eye, shine, nose, tongue, outline, heart, bowPink, bowTie }
  }, [
    bodyColor,
    bellyColor,
    innerEarColor,
    cheekColor,
    eyeColor,
    noseColor,
    tongueColor,
    outlineColor,
    heartColor,
  ])

  const heartGeometry = useMemo(() => getHeartGeometry(0.2), [])
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 26, 20), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 0.05)

    if (root.current) {
      const targetScale = scale * (1 + hover.current * 0.05)
      root.current.scale.setScalar(THREE.MathUtils.lerp(root.current.scale.x, targetScale, 1 - Math.exp(-12 * dt)))
    }

    if (bodyGroup.current) {
      const breathe = reducedMotion ? 0 : Math.sin(t * 1.7) * 0.028
      const bounce = reducedMotion ? 0 : Math.abs(Math.sin(t * 2.3)) * 0.055
      const cheer = pose === 'cheer' && !reducedMotion ? Math.abs(Math.sin(t * 5.5)) * 0.16 : 0
      bodyGroup.current.scale.set(1 + breathe * 0.5, 1 + breathe, 1 + breathe * 0.5)
      bodyGroup.current.position.y = bounce + cheer
    }

    if (headGroup.current) {
      const tilt = reducedMotion ? 0 : Math.sin(t * 0.8) * 0.09
      const turn = reducedMotion ? 0 : Math.sin(t * 0.53 + 1.2) * 0.16
      const cheerTilt = pose === 'cheer' ? Math.sin(t * 6) * 0.12 : 0
      headGroup.current.rotation.z = THREE.MathUtils.lerp(headGroup.current.rotation.z, tilt + cheerTilt, 0.08)
      headGroup.current.rotation.y = THREE.MathUtils.lerp(headGroup.current.rotation.y, turn, 0.08)
    }

    // blinking
    if (eyeLeft.current && eyeRight.current) {
      const b = blink.current
      if (!reducedMotion) {
        b.next -= dt
        if (b.next <= 0) {
          b.closed = 0.16
          b.next = 2.2 + Math.random() * 3.2
        }
        if (b.closed > 0) {
          b.closed -= dt
          const s = b.closed > 0 ? 0.12 : 1
          eyeLeft.current.scale.y = s
          eyeRight.current.scale.y = s
        } else {
          eyeLeft.current.scale.y = 1
          eyeRight.current.scale.y = 1
        }
      }
    }

    // arms
    const waveAmount = pose === 'wave' ? 1 : 0
    const hugRot = hug * 1.15
    if (armRight.current) {
      const wave = reducedMotion ? 0 : Math.sin(t * 8) * 0.5 * waveAmount
      const rest = 0.22
      armRight.current.rotation.z = THREE.MathUtils.lerp(armRight.current.rotation.z, -rest - wave + hugRot, 0.12)
      armRight.current.rotation.x = THREE.MathUtils.lerp(
        armRight.current.rotation.x,
        pose === 'cheer' ? -0.9 : hug * -0.6,
        0.1,
      )
    }
    if (armLeft.current) {
      const wave = reducedMotion ? 0 : Math.sin(t * 8 + Math.PI) * 0.5 * waveAmount
      const rest = 0.22
      armLeft.current.rotation.z = THREE.MathUtils.lerp(armLeft.current.rotation.z, rest + wave - hugRot, 0.12)
      armLeft.current.rotation.x = THREE.MathUtils.lerp(
        armLeft.current.rotation.x,
        pose === 'cheer' ? -0.9 : hug * -0.6,
        0.1,
      )
    }

    if (heartRef.current) {
      const float = reducedMotion ? 0 : Math.sin(t * 2.4) * 0.05
      heartRef.current.position.y = -0.02 + float
      heartRef.current.rotation.z = reducedMotion ? 0 : Math.sin(t * 1.4) * 0.12
    }
  })

  const setHover = (value: number) => {
    if (!interactive) return
    hover.current = value
    gl.domElement.style.cursor = value > 0 ? 'pointer' : ''
  }

  const shadow = castShadow ? { castShadow: true } : { castShadow: false }

  /** A sphere with the signature thick sticker outline behind it. */
  const Sticker = ({
    position,
    scale: s,
    material,
    outline = true,
  }: {
    position: [number, number, number]
    scale: [number, number, number]
    material: THREE.Material
    outline?: boolean
  }) => (
    <>
      {outline && (
        <mesh
          geometry={sphere}
          position={position}
          scale={[s[0] * 1.07, s[1] * 1.07, s[2] * 1.07]}
          material={materials.outline}
        />
      )}
      <mesh geometry={sphere} position={position} scale={s} material={material} {...shadow} />
    </>
  )

  return (
    <group
      ref={root}
      position={position}
      rotation={rotation}
      scale={scale}
      name={name}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(1)
      }}
      onPointerOut={() => setHover(0)}
      onClick={(e) => {
        if (!interactive || !onPoke) return
        e.stopPropagation()
        onPoke()
      }}
    >
      <group ref={bodyGroup}>
        {/* legs */}
        <Sticker position={[-0.34, -0.6, 0.08]} scale={[0.28, 0.2, 0.32]} material={materials.fur} />
        <Sticker position={[0.34, -0.6, 0.08]} scale={[0.28, 0.2, 0.32]} material={materials.fur} />

        {/* body */}
        <Sticker position={[0, -0.12, 0]} scale={[0.66, 0.6, 0.55]} material={materials.fur} />
        {/* belly patch */}
        <mesh position={[0, -0.13, 0.36]} scale={[0.4, 0.36, 0.26]} material={materials.belly}>
          <sphereGeometry args={[1, 22, 18]} />
        </mesh>

        {/* arms */}
        <group ref={armLeft} position={[-0.56, 0.0, 0.05]} rotation={[0, 0, 0.22]}>
          <Sticker position={[0, -0.16, 0]} scale={[0.19, 0.29, 0.19]} material={materials.fur} />
        </group>
        <group ref={armRight} position={[0.56, 0.0, 0.05]} rotation={[0, 0, -0.22]}>
          <Sticker position={[0, -0.16, 0]} scale={[0.19, 0.29, 0.19]} material={materials.fur} />
        </group>

        {/* head */}
        <group ref={headGroup} position={[0, 0.56, 0.02]}>
          <Sticker position={[0, 0, 0]} scale={[0.6, 0.56, 0.55]} material={materials.fur} />

          {/* ears */}
          <Sticker position={[-0.38, 0.35, -0.02]} scale={[0.25, 0.25, 0.25]} material={materials.fur} />
          <mesh position={[-0.38, 0.35, 0.09]} scale={0.135} material={materials.inner}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>
          <Sticker position={[0.38, 0.35, -0.02]} scale={[0.25, 0.25, 0.25]} material={materials.fur} />
          <mesh position={[0.38, 0.35, 0.09]} scale={0.135} material={materials.inner}>
            <sphereGeometry args={[1, 16, 12]} />
          </mesh>

          {/* blush */}
          <mesh position={[-0.35, -0.11, 0.42]} scale={[0.13, 0.085, 0.05]} rotation={[0, 0.3, 0]} material={materials.cheek}>
            <sphereGeometry args={[1, 14, 12]} />
          </mesh>
          <mesh position={[0.35, -0.11, 0.42]} scale={[0.13, 0.085, 0.05]} rotation={[0, -0.3, 0]} material={materials.cheek}>
            <sphereGeometry args={[1, 14, 12]} />
          </mesh>

          {/* eyes */}
          <group ref={eyeLeft} position={[-0.18, 0.06, 0.47]}>
            <mesh scale={[0.065, 0.082, 0.06]} material={materials.eye}>
              <sphereGeometry args={[1, 16, 14]} />
            </mesh>
            <mesh position={[0.024, 0.032, 0.05]} scale={0.024} material={materials.shine}>
              <sphereGeometry args={[1, 10, 10]} />
            </mesh>
          </group>
          <group ref={eyeRight} position={[0.18, 0.06, 0.47]}>
            <mesh scale={[0.065, 0.082, 0.06]} material={materials.eye}>
              <sphereGeometry args={[1, 16, 14]} />
            </mesh>
            <mesh position={[0.024, 0.032, 0.05]} scale={0.024} material={materials.shine}>
              <sphereGeometry args={[1, 10, 10]} />
            </mesh>
          </group>

          {/* tiny nose */}
          <mesh position={[0, 0.0, 0.52]} scale={[0.045, 0.032, 0.03]} material={materials.nose}>
            <sphereGeometry args={[1, 12, 10]} />
          </mesh>

          {/* open mouth with a little tongue */}
          <mesh position={[0, 0.08, 0.5]} scale={[0.075, 0.065, 0.045]} material={materials.nose}>
            <sphereGeometry args={[1, 16, 14]} />
          </mesh>
          <mesh position={[0, 0.052, 0.53]} scale={[0.045, 0.032, 0.022]} material={materials.tongue}>
            <sphereGeometry args={[1, 12, 10]} />
          </mesh>

          {/* accessory */}
          {accessory === 'bow' && (
            <group position={[-0.2, 0.42, 0.18]} rotation={[0, 0.35, 0.35]}>
              <mesh position={[-0.11, 0, 0]} scale={[0.13, 0.1, 0.06]} material={materials.bowPink}>
                <sphereGeometry args={[1, 16, 12]} />
              </mesh>
              <mesh position={[0.11, 0, 0]} scale={[0.13, 0.1, 0.06]} material={materials.bowPink}>
                <sphereGeometry args={[1, 16, 12]} />
              </mesh>
              <mesh scale={[0.055, 0.055, 0.05]} material={materials.bowPink}>
                <sphereGeometry args={[1, 12, 10]} />
              </mesh>
            </group>
          )}
          {accessory === 'bowtie' && (
            <group position={[0, -0.36, 0.46]}>
              <mesh position={[-0.1, 0, 0]} rotation={[0, 0, 0.2]} scale={[0.1, 0.07, 0.04]} material={materials.bowTie}>
                <sphereGeometry args={[1, 14, 10]} />
              </mesh>
              <mesh position={[0.1, 0, 0]} rotation={[0, 0, -0.2]} scale={[0.1, 0.07, 0.04]} material={materials.bowTie}>
                <sphereGeometry args={[1, 14, 10]} />
              </mesh>
              <mesh scale={0.042} material={materials.bowTie}>
                <sphereGeometry args={[1, 12, 10]} />
              </mesh>
            </group>
          )}
        </group>

        {/* held heart */}
        {(pose === 'heart' || hug > 0.02) && (
          <group ref={heartRef} position={[0, -0.05, 0.52]} rotation={[0.1, 0, 0]}>
            <mesh material={materials.heart} scale={0.34}>
              <primitive object={heartGeometry} attach="geometry" />
            </mesh>
          </group>
        )}
      </group>
    </group>
  )
}

/** Bubu – RAI's sweet white bear: snow-white with dark ears, a pink bow and pink blush. */
export function Bubu(props: Omit<BearProps, 'bodyColor' | 'innerEarColor' | 'accessory'>) {
  return (
    <Bear
      bodyColor="#ffffff"
      bellyColor="#ffffff"
      innerEarColor="#5a3a2c"
      cheekColor="#ffc0d8"
      accessory="bow"
      {...props}
    />
  )
}

/** Dudu – Ayaan's bear: honey-brown with a black bow tie and golden blush. */
export function Dudu(props: Omit<BearProps, 'bodyColor' | 'innerEarColor' | 'accessory'>) {
  return (
    <Bear
      bodyColor="#c8925f"
      bellyColor="#e8bd93"
      innerEarColor="#7a4a34"
      cheekColor="#f7d68d"
      accessory="bowtie"
      {...props}
    />
  )
}
