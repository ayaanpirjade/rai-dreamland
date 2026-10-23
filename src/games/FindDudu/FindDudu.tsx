import { useCallback, useMemo, useState } from 'react'
import { RotateCcw, Search } from 'lucide-react'

import { SceneCanvas } from '../../components/ThreeCanvas'
import { GlassPanel } from '../../components/GlassPanel/GlassPanel'
import { FindDuduScene } from '../../scenes/FindDudu/FindDuduScene'
import type { HideSpotId } from '../../scenes/FindDudu/FindDuduScene'
import { audio } from '../../lib/audio'
import { useToast } from '../../hooks/useToast'
import { pick } from '../../lib/utils'

const SPOT_LABELS: Record<HideSpotId, string> = {
  plant: 'the big plant',
  table: 'the little table',
  cushion: 'the round cushion',
  shelf: 'the bookshelf',
  toybox: 'the toy box',
}

const SPOTS: HideSpotId[] = ['plant', 'table', 'cushion', 'shelf', 'toybox']

export function FindDudu() {
  const [hiddenSpot, setHiddenSpot] = useState<HideSpotId>(() => pick(SPOTS))
  const [checked, setChecked] = useState<HideSpotId[]>([])
  const [found, setFound] = useState(false)
  const [moves, setMoves] = useState(0)
  const { notify } = useToast()

  const check = useCallback(
    (spot: HideSpotId) => {
      if (found) return
      setMoves((m) => m + 1)
      if (spot === hiddenSpot) {
        setChecked((prev) => (prev.includes(spot) ? prev : [...prev, spot]))
        setFound(true)
        audio.play('success')
        notify('Mil gaya! Dudu hai hi wahan 🧸💗', 'success')
      } else {
        setChecked((prev) => (prev.includes(spot) ? prev : [...prev, spot]))
        audio.play('pop', 0.6)
        notify(`${SPOT_LABELS[spot]} mein Dudu nahi hai — agli jagah dekho!`, 'info')
      }
    },
    [found, hiddenSpot, notify],
  )

  const restart = useCallback(() => {
    let next = hiddenSpot
    while (next === hiddenSpot) next = pick(SPOTS)
    setHiddenSpot(next)
    setChecked([])
    setFound(false)
    setMoves(0)
    audio.play('chime')
  }, [hiddenSpot])

  const remaining = useMemo(() => SPOTS.filter((s) => !checked.includes(s)).length, [checked])

  return (
    <div className="game game--finddudu">
      <div className="game__hud">
        <div className="game__stat">
          <Search size={16} aria-hidden="true" />
          <span>
            Places left <strong>{remaining}</strong>
          </span>
        </div>
        <div className="game__stat">
          <span>
            Tries <strong>{moves}</strong>
          </span>
        </div>
        <button type="button" className="btn btn--sm btn--soft" onClick={restart}>
          <RotateCcw size={14} aria-hidden="true" /> New hiding spot
        </button>
      </div>

      <p className="game__goal">
        Dudu chhup gaya hai! Ghar ki cheezein tap karo ya neeche se choose karo.
      </p>

      <div className="finddudu-stage">
        <SceneCanvas
          cameraPosition={[0, 3.4, 7.4]}
          cameraFov={44}
          shadows
          className="finddudu-canvas"
        >
          <FindDuduScene hiddenSpot={hiddenSpot} checked={checked} found={found} onCheck={check} />
        </SceneCanvas>

        {found && (
          <div className="finddudu-win" role="status">
            <span aria-hidden="true">🎉</span>
            <strong>Dudu mil gaya!</strong>
            <p>Shabaash! Aapki aankhein bahut sharp hain.</p>
            <button type="button" className="btn btn--primary btn--sm" onClick={restart}>
              <RotateCcw size={14} aria-hidden="true" /> Hide again
            </button>
          </div>
        )}
      </div>

      <GlassPanel className="finddudu-choices">
        <strong>Check a place:</strong>
        <div className="finddudu-choices__row">
          {SPOTS.map((spot) => (
            <button
              key={spot}
              type="button"
              className={`btn btn--sm ${checked.includes(spot) ? 'btn--ghost' : 'btn--soft'} ${found && spot === hiddenSpot ? 'is-found' : ''}`}
              onClick={() => check(spot)}
              disabled={found || checked.includes(spot)}
            >
              {checked.includes(spot) ? '✓ ' : ''}
              {SPOT_LABELS[spot]}
            </button>
          ))}
        </div>
      </GlassPanel>
    </div>
  )
}
