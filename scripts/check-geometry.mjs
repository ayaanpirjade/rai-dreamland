import * as THREE from 'three'
import {
  getHeartGeometry,
  getFlatHeartGeometry,
  getHeartTubeGeometry,
  getRoundedBoxGeometry,
  getPuffGeometry,
  getBlobGeometry,
} from '../src/three/geometry.ts'

const checks = [
  ['heart', getHeartGeometry(0.22)],
  ['flatHeart', getFlatHeartGeometry(0.1)],
  ['heartTube', getHeartTubeGeometry(0.075, 120, 12)],
  ['roundedBox', getRoundedBoxGeometry(1.7, 1.25, 1.7, 0.16)],
  ['puff', getPuffGeometry(2)],
  ['blob', getBlobGeometry(2)],
]

for (const [name, geo] of checks) {
  const pos = geo.attributes.position.array
  let nan = 0
  for (let i = 0; i < pos.length; i++) if (!Number.isFinite(pos[i])) nan++
  geo.computeBoundingSphere()
  console.log(
    `${name.padEnd(12)} verts=${pos.length / 3} nan=${nan} radius=${geo.boundingSphere?.radius} NaN=${
      geo.boundingSphere && !Number.isFinite(geo.boundingSphere.radius)
    }`,
  )
}
