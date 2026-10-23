import * as THREE from 'three'
import { mergeAll } from '../src/three/geometry.ts'

function paint(geo, color) {
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

const geos = []
const rock = new THREE.ConeGeometry(7.5, 2.6, 22, 1)
paint(rock, '#d9c6ef')
geos.push(rock)
const grass = new THREE.CylinderGeometry(7.5, 7.35, 0.34, 24)
paint(grass, '#b7ecd0')
geos.push(grass)
const lip = new THREE.TorusGeometry(7.2, 0.14, 8, 28)
paint(lip, '#e8dcff')
geos.push(lip)
const trunk = new THREE.CylinderGeometry(0.1, 0.14, 1.4, 8)
paint(trunk, '#d8a97c')
geos.push(trunk)
const blob = new THREE.IcosahedronGeometry(0.62, 1)
paint(blob, '#ff9fc7')
geos.push(blob)

const merged = mergeAll(geos)
const pos = merged.attributes.position.array
let nan = 0
for (let i = 0; i < pos.length; i++) if (!Number.isFinite(pos[i])) nan++
merged.computeBoundingSphere()
console.log('merged verts=', pos.length / 3, 'nan=', nan, 'radius=', merged.boundingSphere?.radius)
console.log('has color attr:', !!merged.attributes.color, 'has uv:', !!merged.attributes.uv)
