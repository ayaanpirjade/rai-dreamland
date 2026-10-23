import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

import { Bubu, Dudu } from '../../three/Bear'
import type { BearPose } from '../../three/Bear'
import { getHeartGeometry, getPuffGeometry } from '../../three/geometry'
import { SoftEnvironment } from '../../three/SoftEnvironment'
import { damp } from '../../lib/utils'

export type BearWorldStage = 'idle' | 'approach' | 'offer' | 'celebrate' | 'hug'

interface BearWorldSceneProps {
  reducedMotion?: boolean
  /** Increments whenever the "A Little Hug" surprise is triggered. */
  hugToken?: number
  onMessage?: (message: string, tone?: 'love' | 'info') => void
}

const BUBU_HOME = -2.3
const BUBU_OFFER = -0.85
const DUDU_HOME = 1.75

export function BearWorldScene({ reducedMotion = false, hugToken = 0, onMessage }: BearWorldSceneProps) {
  const bubu = useRef<THREE.Group>(null)
  const dudu = useRef<THREE.Group>(null)
  const stage = useRef<BearWorldStage>('idle')
  const clock = useRef(0)
  const lastHugToken = useRef(hugToken)
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)

  const [bubuPose, setBubuPose] = useState<BearPose>('idle')
  const [duduPose, setDuduPose] = useState<BearPose>('idle')
  const [hugAmount, setHugAmount] = useState(0)
  const poseCache = useRef({ bubu: 'idle' as BearPose, dudu: 'idle' as BearPose })
  const hugCache = useRef(0)

  const heartGeometry = useMemo(() => getHeartGeometry(0.2), [])
  const puffGeometry = useMemo(() => getPuffGeometry(1), [])

  const noteColors = ['#ff8fb8', '#ffb3a0', '#c9a8ff', '#ffa8c8', '#ff7fb0']
  const noteMaterials = useMemo(
    () =>
      noteColors.map(
        (color) =>
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            emissive: new THREE.Color(color),
            emissiveIntensity: 0.45,
            roughness: 0.32,
            metalness: 0.05,
          }),
      ),
    [],
  )

  const notes = useMemo(
    () => [
      'Dudu ne Bubu ke liye ek chhota sa dil uthaya.',
      'Bubu ki cheeks hamesha pink rehti hain.',
      'Bubu aur Dudu — duniya ki sabse pyaari jodi.',
      'Ek chhota sa hug, bahut saari khushi.',
      'Aaj ka din sirf ek hi naam rakhta hai — RAI.',
    ],
    [],
  )

  useEffect(() => {
    if (hugToken !== lastHugToken.current) {
      lastHugToken.current = hugToken
      stage.current = 'hug'
      clock.current = 0
      onMessage?.('Dudu ne Bubu ko ek tight hug de diya 🧸💗', 'love')
    }
  }, [hugToken, onMessage])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    clock.current += dt

    camera.position.x = damp(camera.position.x, 0, 2, dt)
    camera.position.y = damp(camera.position.y, 1.5, 2, dt)
    camera.position.z = damp(camera.position.z, 6.4, 2, dt)
    camera.lookAt(0, 0.8, 0)

    let bubuX = BUBU_HOME
    let duduX = DUDU_HOME
    let nextBubu: BearPose = 'idle'
    let nextDudu: BearPose = 'wave'
    let nextHug = 0

    switch (stage.current) {
      case 'idle':
        if (!reducedMotion && clock.current > 2.6) {
          stage.current = 'approach'
          clock.current = 0
        }
        break
      case 'approach': {
        const p = Math.min(1, clock.current / (reducedMotion ? 0.4 : 2.4))
        const eased = p * p * (3 - 2 * p)
        bubuX = BUBU_HOME + (BUBU_OFFER - BUBU_HOME) * eased
        nextDudu = 'idle'
        if (p >= 1) {
          stage.current = 'offer'
          clock.current = 0
        }
        break
      }
      case 'offer': {
        bubuX = BUBU_OFFER
        nextBubu = 'heart'
        nextDudu = 'idle'
        if (clock.current > 2.2) {
          stage.current = 'celebrate'
          clock.current = 0
          onMessage?.('Dono ne milkar ek saath jashn manaaya 🥳', 'love')
        }
        break
      }
      case 'celebrate': {
        bubuX = BUBU_OFFER
        duduX = DUDU_HOME - 0.55
        nextBubu = 'cheer'
        nextDudu = 'cheer'
        if (clock.current > 3.6) {
          stage.current = 'idle'
          clock.current = 0
        }
        break
      }
      case 'hug': {
        const p = Math.min(1, clock.current / (reducedMotion ? 0.5 : 1.9))
        bubuX = BUBU_HOME + (DUDU_HOME - 0.75 - BUBU_HOME) * p
        nextHug = p < 0.75 ? 1 : 0
        if (p >= 1) {
          stage.current = 'idle'
          clock.current = 0
        }
        break
      }
    }

    if (stage.current !== 'hug') nextHug = 0

    if (poseCache.current.bubu !== nextBubu) {
      poseCache.current.bubu = nextBubu
      setBubuPose(nextBubu)
    }
    if (poseCache.current.dudu !== nextDudu) {
      poseCache.current.dudu = nextDudu
      setDuduPose(nextDudu)
    }
    const roundedHug = Math.round(nextHug * 20) / 20
    if (Math.abs(hugCache.current - roundedHug) > 0.02) {
      hugCache.current = roundedHug
      setHugAmount(roundedHug)
    }

    if (bubu.current) {
      bubu.current.position.x = damp(bubu.current.position.x, bubuX, 3.4, dt)
      bubu.current.position.y = reducedMotion ? 0 : Math.abs(Math.sin(t * 3.1)) * 0.05
      bubu.current.rotation.y = damp(bubu.current.rotation.y, 0.85, 3, dt)
    }
    if (dudu.current) {
      dudu.current.position.x = damp(dudu.current.position.x, duduX, 3.4, dt)
      dudu.current.position.y = reducedMotion ? 0 : Math.abs(Math.sin(t * 2.6 + 1)) * 0.045
      dudu.current.rotation.y = damp(dudu.current.rotation.y, -0.85, 3, dt)
    }
  })

  return (
    <>
      <SoftEnvironment intensity={0.5} />

      <hemisphereLight args={['#ffe9f6', '#cfc0ff', 1.2]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 6]} intensity={1.3} color="#fff4e8" />
      <pointLight position={[-3, 2.4, 3]} intensity={14} distance={12} color="#ffa6cd" />
      <pointLight position={[3.4, 2.8, 1.5]} intensity={11} distance={11} color="#b7c8ff" />

      {/* stage */}
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.2, 64]} />
        <meshStandardMaterial color="#ffe7f4" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.2, 5.65, 64]} />
        <meshStandardMaterial color="#ffd0e6" roughness={0.7} />
      </mesh>

      {/* decorative puffs */}
      <mesh position={[-4.2, 0.35, -2.4]} scale={[0.5, 0.7, 0.5]} geometry={puffGeometry}>
        <meshStandardMaterial color="#c9b6ff" roughness={0.9} />
      </mesh>
      <mesh position={[4.4, 0.5, -2.1]} scale={[0.6, 0.8, 0.6]} geometry={puffGeometry}>
        <meshStandardMaterial color="#ffc2dc" roughness={0.9} />
      </mesh>

      {/* Bubu (RAI) */}
      <group ref={bubu} position={[BUBU_HOME, 0, 0]}>
        <Bubu
          pose={bubuPose}
          hug={hugAmount}
          scale={1.25}
          reducedMotion={reducedMotion}
          interactive
          onPoke={() => {
            onMessage?.('Bubu blush ho gayi! Cheeks pink ho gaye 🥰', 'love')
          }}
        />
      </group>

      {/* Dudu (Ayaan) */}
      <group ref={dudu} position={[DUDU_HOME, 0, 0]}>
        <Dudu
          pose={duduPose}
          hug={hugAmount}
          scale={1.25}
          reducedMotion={reducedMotion}
          interactive
          onPoke={() => {
            onMessage?.('Dudu (yaani Ayaan) bola: "Happy Birthday, Bubu!" 🧸', 'love')
          }}
        />
      </group>

      {/* little floating notes */}
      {notes.map((note, i) => {
        const positions: [number, number, number][] = [
          [-3.6, 1.7, 1.2],
          [3.4, 2.1, 0.6],
          [-2.2, 2.5, -1.4],
          [2.4, 2.8, -1.8],
          [0.2, 3.1, 1.6],
        ]
        const colors = ['#ff8fb8', '#ffb3a0', '#c9a8ff', '#ffa8c8', '#ff7fb0']
        void colors
        return (
          <mesh
            key={i}
            position={positions[i]}
            geometry={heartGeometry}
            material={noteMaterials[i]}
            scale={0.3}
            onClick={(e) => {
              e.stopPropagation()
              onMessage?.(note, 'love')
            }}
            onPointerOver={() => {
              gl.domElement.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              gl.domElement.style.cursor = ''
            }}
          />
        )
      })}

      <Sparkles count={40} scale={[11, 5, 6]} position={[0, 1.4, 0]} size={3.4} speed={0.4} opacity={0.7} color="#ffe0f0" />
    </>
  )
}
