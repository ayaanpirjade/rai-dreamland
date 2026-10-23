import * as THREE from 'three'

/* ==========================================================================
   Canvas-generated textures.
   Drawing them at runtime means: no binary assets, instant availability
   and no chance of a missing file breaking a surprise.
   ========================================================================== */

function makeCanvas(size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context is unavailable')
  return { canvas, ctx }
}

let starTexture: THREE.Texture | null = null

/** Soft round glow used for stars, sparkles and lantern halos. */
export function getStarTexture(): THREE.Texture {
  if (starTexture) return starTexture
  const size = 128
  const { canvas, ctx } = makeCanvas(size)
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.25, 'rgba(255,240,250,0.75)')
  gradient.addColorStop(0.55, 'rgba(255,200,235,0.28)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // a tiny cross flare for a magical feel
  ctx.globalCompositeOperation = 'lighter'
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(size / 2, size * 0.16)
  ctx.lineTo(size / 2, size * 0.84)
  ctx.moveTo(size * 0.16, size / 2)
  ctx.lineTo(size * 0.84, size / 2)
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  starTexture = texture
  return texture
}

let heartTexture: THREE.Texture | null = null

/** A glossy little heart used for confetti and paper hearts. */
export function getHeartTexture(): THREE.Texture {
  if (heartTexture) return heartTexture
  const size = 256
  const { canvas, ctx } = makeCanvas(size)
  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  const cx = size / 2
  const cy = size / 2
  for (let i = 0; i <= 100; i++) {
    const t = (i / 100) * Math.PI * 2
    const x = cx + (16 * Math.pow(Math.sin(t), 3) * size) / 34
    const y = cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * (size / 34)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  heartTexture = texture
  return texture
}

/**
 * The personalised cake topper: "RAI" written in the site's own script font,
 * rendered to a transparent texture so it always matches the typography.
 */
export function makeTopperTexture(text = 'RAI', accent = '#ff6f9f'): THREE.Texture {
  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context is unavailable')

  ctx.clearRect(0, 0, width, height)

  // soft glow behind the letters
  ctx.shadowColor = accent
  ctx.shadowBlur = 26
  ctx.fillStyle = '#fffafd'
  ctx.strokeStyle = accent
  ctx.lineWidth = 6
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 132px Pacifico, "Segoe Script", cursive`
  ctx.strokeText(text, width / 2, height / 2 + 4)
  ctx.fillText(text, width / 2, height / 2 + 4)
  ctx.shadowBlur = 0

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** A soft painted sky gradient used on the large background dome. */
export function makeSkyTexture(
  stops: { offset: number; color: string }[],
): THREE.Texture {
  const width = 32
  const height = 512
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context is unavailable')

  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  for (const stop of stops) gradient.addColorStop(stop.offset, stop.color)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

/** Wood-ish candy stripes for the cake ribbon / gift box. */
export function makeStripeTexture(colorA: string, colorB: string): THREE.Texture {
  const size = 128
  const { canvas, ctx } = makeCanvas(size)
  ctx.fillStyle = colorA
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = colorB
  ctx.save()
  ctx.translate(size / 2, size / 2)
  ctx.rotate(-Math.PI / 4)
  for (let i = -size; i < size; i += 26) {
    ctx.fillRect(i, -size, 13, size * 2)
  }
  ctx.restore()
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}
