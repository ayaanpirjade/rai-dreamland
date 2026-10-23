import { Sparkles } from '@react-three/drei'

import { Cake } from '../../three/Cake'
import type { CakeDecorations } from '../../three/Cake'
import { SoftEnvironment } from '../../three/SoftEnvironment'

interface CakeDecoratorSceneProps {
  decorations: CakeDecorations
  reducedMotion?: boolean
}

/** The live 3D cake the player decorates in the "Decorate RAI's Cake" game. */
export function CakeDecoratorScene({ decorations, reducedMotion = false }: CakeDecoratorSceneProps) {
  return (
    <>
      <SoftEnvironment intensity={0.55} />

      <hemisphereLight args={['#fff2f8', '#d7c6f7', 1.3]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3.5, 7, 5]} intensity={1.35} color="#fff7ec" />
      <pointLight position={[-3, 2.6, 3]} intensity={14} distance={11} color="#ffa9d0" />

      <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.4, 48]} />
        <meshStandardMaterial color="#fbe4f1" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.4, 4.7, 48]} />
        <meshStandardMaterial color="#ffd0e6" roughness={0.8} />
      </mesh>

      <Cake decorations={decorations} lit scale={0.95} />

      <Sparkles
        count={reducedMotion ? 14 : 34}
        scale={[7, 4, 5]}
        position={[0, 2.2, 0]}
        size={3}
        speed={0.35}
        opacity={0.7}
        color="#ffe0f2"
      />
    </>
  )
}
