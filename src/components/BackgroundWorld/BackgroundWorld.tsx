import { SceneCanvas } from '../ThreeCanvas'
import { DreamlandScene } from '../../scenes/Dreamland/DreamlandScene'
import { useDeviceProfile } from '../../hooks/useDeviceProfile'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useToast } from '../../hooks/useToast'

/**
 * The living pastel cloud kingdom that sits behind every section.
 * It is deliberately cheap: merged geometry, no shadow maps, one draw call
 * per material family.
 */
export function BackgroundWorld() {
  const profile = useDeviceProfile()
  const reducedMotion = useReducedMotion()
  const { notify } = useToast()

  if (!profile.webgl) return null

  return (
    <div className="background-world" aria-hidden="true">
      <SceneCanvas cameraPosition={[0, 6.4, 19]} cameraFov={52} className="background-world__canvas">
        <DreamlandScene profile={profile} reducedMotion={reducedMotion} onCollect={(note) => notify(note, 'love')} />
      </SceneCanvas>
      <div className="background-world__scrim" />
    </div>
  )
}
