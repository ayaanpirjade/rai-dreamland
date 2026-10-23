import { useCallback, useEffect, useState } from 'react'
import { Minus, Plus, Sparkles } from 'lucide-react'

import { SceneCanvas } from '../../components/ThreeCanvas'
import { CakeDecoratorScene } from '../../scenes/CakeDecorator/CakeDecoratorScene'
import { DEFAULT_DECORATIONS } from '../../three/Cake'
import type { CakeDecorations } from '../../three/Cake'
import { audio } from '../../lib/audio'
import { useToast } from '../../hooks/useToast'
import { readSession, writeSession } from '../../lib/storage'

const STORAGE_KEY = 'rai.cake.masterpiece'

const LAYER_SWATCHES = [
  ['#ffd9ea', '#f3e2ff', '#fff2e0'],
  ['#ffe7c9', '#ffd0e0', '#e2f0ff'],
  ['#d9f5e4', '#e4dcff', '#ffe1ec'],
  ['#fff0b8', '#ffd6e8', '#d6f0ff'],
  ['#ffcfc4', '#f4d9ff', '#e8ffe8'],
]

const ICING_SWATCHES = ['#fffaf4', '#ffd9ea', '#fff3c9', '#e2f0ff', '#f4e2ff']

interface StepperProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

function Stepper({ label, value, min, max, onChange }: StepperProps) {
  return (
    <div className="decorator__stepper">
      <span className="decorator__stepper-label">{label}</span>
      <div className="decorator__stepper-controls">
        <button
          type="button"
          className="decorator__step"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus size={14} aria-hidden="true" />
        </button>
        <output className="decorator__stepper-value" aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          className="decorator__step"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export function CakeDecorator() {
  const [decorations, setDecorations] = useState<CakeDecorations>(DEFAULT_DECORATIONS)
  const [finished, setFinished] = useState(false)
  const { notify } = useToast()

  useEffect(() => {
    const saved = readSession<{ decorations: CakeDecorations } | null>(STORAGE_KEY, null)
    if (saved?.decorations) {
      setDecorations({ ...DEFAULT_DECORATIONS, ...saved.decorations })
      setFinished(true)
    }
  }, [])

  const update = useCallback((patch: Partial<CakeDecorations>) => {
    setDecorations((prev) => ({ ...prev, ...patch }))
    audio.play('pop', 0.45)
  }, [])

  const setLayer = (index: number, color: string) => {
    setDecorations((prev) => {
      const layers = [...prev.layers]
      layers[index] = color
      return { ...prev, layers }
    })
    audio.play('bell', 0.5)
  }

  const finish = () => {
    const saved = writeSession(STORAGE_KEY, { decorations })
    setFinished(true)
    audio.play('success')
    notify(
      saved
        ? 'Tumhara masterpiece save ho gaya! 🎂✨'
        : 'Masterpiece ban gaya! (Browser ne save nahi kiya, par yahin hai 💗)',
      saved ? 'success' : 'info',
    )
  }

  return (
    <div className="game game--decorator">
      <div className="decorator__layout">
        <div className="decorator__stage">
          <SceneCanvas cameraPosition={[0, 2.4, 5.6]} cameraFov={42} shadows className="decorator-canvas">
            <CakeDecoratorScene decorations={decorations} />
          </SceneCanvas>
        </div>

        <div className="decorator__panel glass">
          <h4 className="decorator__title">Decorate the cake</h4>

          <div className="decorator__group">
            <span className="decorator__label">Layer colours</span>
            {LAYER_SWATCHES.map((set, rowIndex) => (
              <div key={rowIndex} className="decorator__swatches">
                {set.map((color, colIndex) => (
                  <button
                    key={color}
                    type="button"
                    className={`decorator__swatch ${decorations.layers[colIndex] === color ? 'is-active' : ''}`}
                    style={{ background: color }}
                    onClick={() => setLayer(colIndex, color)}
                    aria-label={`Layer ${colIndex + 1} colour ${color}`}
                    aria-pressed={decorations.layers[colIndex] === color}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="decorator__group">
            <span className="decorator__label">Frosting</span>
            <div className="decorator__swatches">
              {ICING_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`decorator__swatch ${decorations.icing === color ? 'is-active' : ''}`}
                  style={{ background: color }}
                  onClick={() => update({ icing: color })}
                  aria-label={`Frosting colour ${color}`}
                  aria-pressed={decorations.icing === color}
                />
              ))}
            </div>
          </div>

          <div className="decorator__group">
            <Stepper
              label="Candles"
              value={decorations.candles}
              min={0}
              max={9}
              onChange={(v) => update({ candles: v })}
            />
            <Stepper label="Hearts" value={decorations.hearts} min={0} max={8} onChange={(v) => update({ hearts: v })} />
            <Stepper
              label="Flowers"
              value={decorations.flowers}
              min={0}
              max={8}
              onChange={(v) => update({ flowers: v })}
            />
            <Stepper
              label="Strawberries"
              value={decorations.strawberries}
              min={0}
              max={8}
              onChange={(v) => update({ strawberries: v })}
            />
          </div>

          <div className="decorator__group">
            <span className="decorator__label">Topper</span>
            <div className="decorator__swatches">
              {(['RAI', 'heart', 'star', 'none'] as const).map((topper) => (
                <button
                  key={topper}
                  type="button"
                  className={`decorator__chip ${decorations.topper === topper ? 'is-active' : ''}`}
                  onClick={() => update({ topper })}
                  aria-pressed={decorations.topper === topper}
                >
                  {topper === 'RAI' ? 'RAI' : topper === 'heart' ? '💗' : topper === 'star' ? '⭐' : '—'}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="btn btn--primary decorator__finish" onClick={finish}>
            <Sparkles size={16} aria-hidden="true" /> OUR MASTERPIECE ✨
          </button>

          {finished && (
            <p className="decorator__done" role="status">
              Masterpiece ready! RAI ka naam topper pe hai — exactly jaisa hona chahiye. 🎂
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
