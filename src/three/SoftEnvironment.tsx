import { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * A soft "studio" environment map generated locally with RoomEnvironment.
 * It gives every PBR material (the bears, the cake, the gifts) a gentle
 * creamy sheen without shipping an HDR file or hitting a CDN.
 */
export function SoftEnvironment({ intensity = 0.55 }: { intensity?: number }) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)

  const envMap = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    pmrem.compileEquirectangularShader()
    const room = new RoomEnvironment()
    const target = pmrem.fromScene(room, 0.04)
    room.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(material)) material.forEach((m) => m.dispose())
      else material?.dispose()
    })
    pmrem.dispose()
    return target.texture
  }, [gl])

  scene.environment = envMap
  scene.environmentIntensity = intensity

  return null
}
