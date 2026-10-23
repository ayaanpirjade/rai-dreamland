import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/* ==========================================================================
   Re-usable geometry helpers.
   Everything is generated at runtime so the site ships with zero binary
   assets to load (and nothing that can 404 at 2am).
   ========================================================================== */

let cachedHeartShape: THREE.Shape | null = null
let cachedHeartGeometry: THREE.ExtrudeGeometry | null = null
let cachedFlatHeartGeometry: THREE.ExtrudeGeometry | null = null

/** The classic parametric heart curve, normalised to roughly 1 unit wide. */
export function getHeartShape(): THREE.Shape {
  if (cachedHeartShape) return cachedHeartShape
  const shape = new THREE.Shape()
  const points: THREE.Vector2[] = []
  const segments = 72
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2
    const x = 16 * Math.pow(Math.sin(t), 3)
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    points.push(new THREE.Vector2(x / 17, y / 17))
  }
  shape.setFromPoints(points)
  shape.autoClose = true
  cachedHeartShape = shape
  return shape
}

/** A puffy 3D heart – used for floating hearts, gifts and decorations. */
export function getHeartGeometry(depth = 0.22): THREE.ExtrudeGeometry {
  if (cachedHeartGeometry) return cachedHeartGeometry
  const geo = new THREE.ExtrudeGeometry(getHeartShape(), {
    depth,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.07,
    bevelThickness: 0.07,
    curveSegments: 24,
  })
  geo.center()
  geo.computeVertexNormals()
  cachedHeartGeometry = geo
  return geo
}

/** A flat, slightly beveled heart – used for bushes, confetti and cut-outs. */
export function getFlatHeartGeometry(depth = 0.1): THREE.ExtrudeGeometry {
  if (cachedFlatHeartGeometry) return cachedFlatHeartGeometry
  const geo = new THREE.ExtrudeGeometry(getHeartShape(), {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.035,
    bevelThickness: 0.03,
    curveSegments: 20,
  })
  geo.center()
  geo.computeVertexNormals()
  cachedFlatHeartGeometry = geo
  return geo
}

let cachedHeartTubeGeometry: THREE.TubeGeometry | null = null

/**
 * A heart-shaped tube — the glowing doorway of the entrance scene.
 * Built by sweeping a tube along the heart curve, which is far more robust
 * than trying to boolean-subtract one shape from another.
 */
export function getHeartTubeGeometry(
  radius = 0.07,
  tubularSegments = 120,
  radialSegments = 12,
): THREE.TubeGeometry {
  if (cachedHeartTubeGeometry) return cachedHeartTubeGeometry
  const points = getHeartShape()
    .getPoints(120)
    .map((p) => new THREE.Vector3(p.x, p.y, 0))
  const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5)
  const geo = new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, true)
  geo.computeVertexNormals()
  cachedHeartTubeGeometry = geo
  return geo
}

/** A rounded, soft-looking "puff" sphere used for clouds and cotton candy. */
export function getPuffGeometry(detail = 2) {
  return new THREE.IcosahedronGeometry(1, detail)
}

/** Rounded box without needing drei – built from a bevelled box geometry. */
export function getRoundedBoxGeometry(width: number, height: number, depth: number, radius = 0.12) {
  const r = Math.min(radius, width / 2.05, height / 2.05, depth / 2.05)
  const shape = new THREE.Shape()
  const w = width / 2 - r
  const h = height / 2 - r
  shape.moveTo(-w, -h - r)
  shape.lineTo(w, -h - r)
  shape.quadraticCurveTo(w + r, -h - r, w + r, -h)
  shape.lineTo(w + r, h)
  shape.quadraticCurveTo(w + r, h + r, w, h + r)
  shape.lineTo(-w, h + r)
  shape.quadraticCurveTo(-w - r, h + r, -w - r, h)
  shape.lineTo(-w - r, -h)
  shape.quadraticCurveTo(-w - r, -h - r, -w, -h - r)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: depth - r * 2,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: r * 0.9,
    bevelThickness: r * 0.9,
    curveSegments: 6,
  })
  geo.translate(0, 0, -(depth - r * 2) / 2)
  geo.computeVertexNormals()
  return geo
}

/** A soft teardrop used for tree tops, lamps and little hills. */
export function getBlobGeometry(detail = 2) {
  const geo = new THREE.SphereGeometry(1, 18, 14)
  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const wobble = 1 + 0.12 * Math.sin(x * 3.1 + y * 2.2 + z * 1.7)
    pos.setXYZ(i, x * wobble, y * wobble, z * wobble)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  geo.computeBoundingSphere()
  void detail
  return geo
}

/** Random-but-deterministic helper for scattering decorations. */
export function seededRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * Merges a list of geometries into a single buffer.
 * Everything is converted to non-indexed and stripped of extra attributes
 * first, because Three's merge helper refuses to mix indexed and
 * non-indexed inputs.
 */
export function mergeAll(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const prepared = geometries.map((geo) => {
    const flat = geo.index ? geo.toNonIndexed() : geo
    if (flat !== geo) geo.dispose()
    for (const name of Object.keys(flat.attributes)) {
      if (name !== 'position' && name !== 'normal' && name !== 'uv' && name !== 'color') {
        flat.deleteAttribute(name)
      }
    }
    if (!flat.getAttribute('uv')) {
      const count = flat.getAttribute('position').count
      flat.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2))
    }
    if (!flat.getAttribute('normal')) flat.computeVertexNormals()
    flat.morphAttributes = {}
    flat.clearGroups()
    return flat
  })

  const merged = mergeGeometries(prepared, false)
  prepared.forEach((geo) => geo.dispose())
  if (!merged) {
    console.warn('mergeAll: merge failed, falling back to the first geometry')
    return geometries[0]
  }
  return merged
}
