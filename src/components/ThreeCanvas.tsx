import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import type { ReactNode } from 'react'

import { getDeviceProfile, maxPixelRatio } from '../lib/devices'

interface SceneCanvasProps {
  children: ReactNode
  className?: string
  cameraPosition?: [number, number, number]
  cameraFov?: number
  shadows?: boolean
  frameloop?: 'always' | 'demand' | 'never'
  dpr?: [number, number]
  onCreated?: () => void
  fallback?: ReactNode
  style?: React.CSSProperties
}

/**
 * Thin wrapper around R3F's Canvas that:
 *  - checks for WebGL support and renders a friendly fallback when missing
 *  - caps the device pixel ratio based on device capability
 *  - nudges the renderer to re-measure its container (some browsers throttle
 *    ResizeObserver, which would otherwise leave the canvas at 300x150)
 */
export function SceneCanvas({
  children,
  className,
  cameraPosition = [0, 2, 8],
  cameraFov = 45,
  shadows = false,
  frameloop = 'always',
  dpr,
  onCreated,
  fallback,
  style,
}: SceneCanvasProps) {
  const profile = getDeviceProfile()

  useEffect(() => {
    if (!profile.webgl) return
    const nudge = () => window.dispatchEvent(new Event('resize'))
    const timers = [0, 120, 500, 1500].map((delay) => window.setTimeout(nudge, delay))
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [profile.webgl])

  if (!profile.webgl) {
    return (
      <div className="scene-fallback" style={style}>
        {fallback ?? (
          <div className="glass scene-fallback__card">
            <span aria-hidden="true">🧸</span>
            <h3>3D is taking a nap</h3>
            <p>
              This browser can&rsquo;t run WebGL, so the 3D world is sleeping. Everything else on the page still
              works just fine.
            </p>
          </div>
        )}
      </div>
    )
  }

  const ratio = dpr ?? [1, maxPixelRatio(profile)]

  return (
    <Canvas
      className={className}
      style={style}
      dpr={ratio}
      frameloop={frameloop}
      shadows={shadows ? 'soft' : false}
      gl={{ antialias: profile.tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: cameraPosition, fov: cameraFov, near: 0.1, far: 220 }}
      onCreated={({ gl }) => {
        gl.toneMapping = 4 // ACESFilmicToneMapping
        gl.toneMappingExposure = 1.06
        onCreated?.()
      }}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  )
}
