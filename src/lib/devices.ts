/* Device capability detection – used to scale the 3D world gracefully. */

export type DeviceTier = 'low' | 'mid' | 'high'

export interface DeviceProfile {
  tier: DeviceTier
  isTouch: boolean
  isMobile: boolean
  reducedMotion: boolean
  webgl: boolean
  cores: number
  devicePixelRatio: number
}

let cached: DeviceProfile | null = null

function detectWebGL(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
    // lose the context immediately, we only wanted a capability check
    const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')
    lose?.loseContext()
    return true
  } catch {
    return false
  }
}

export function getDeviceProfile(): DeviceProfile {
  if (cached) return cached
  if (typeof window === 'undefined') {
    return {
      tier: 'mid',
      isTouch: false,
      isMobile: false,
      reducedMotion: false,
      webgl: false,
      cores: 4,
      devicePixelRatio: 1,
    }
  }

  const cores = navigator.hardwareConcurrency ?? 4
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const ua = navigator.userAgent.toLowerCase()
  const isMobile = isTouch && /android|iphone|ipad|ipod|mobile/.test(ua)
  const width = window.innerWidth
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const webgl = detectWebGL()

  let tier: DeviceTier = 'high'
  if (cores <= 4 || (isMobile && cores <= 6) || width < 420) tier = 'mid'
  if (cores <= 2 || (isMobile && cores <= 4) || width < 360) tier = 'low'
  if (reducedMotion) tier = tier === 'high' ? 'mid' : 'low'
  if (!webgl) tier = 'low'

  cached = {
    tier,
    isTouch,
    isMobile,
    reducedMotion,
    webgl,
    cores,
    devicePixelRatio: window.devicePixelRatio || 1,
  }
  return cached
}

/** Multiplier applied to particle counts / shadow maps. */
export function qualityScale(profile: DeviceProfile = getDeviceProfile()) {
  switch (profile.tier) {
    case 'low':
      return 0.35
    case 'mid':
      return 0.65
    default:
      return 1
  }
}

export function maxPixelRatio(profile: DeviceProfile = getDeviceProfile()) {
  switch (profile.tier) {
    case 'low':
      return 1
    case 'mid':
      return 1.5
    default:
      return 2
  }
}
