import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

import { audio } from '../../lib/audio'
import type { AudioState } from '../../lib/audio'
import { useToast } from '../../hooks/useToast'

interface AudioControlsProps {
  variant?: 'compact' | 'full'
}

export function AudioControls({ variant = 'compact' }: AudioControlsProps) {
  const [state, setState] = useState<AudioState>(() => audio.getState())
  const { notify } = useToast()

  useEffect(() => audio.subscribe(setState), [])

  const toggleMusic = () => {
    if (!state.supported) {
      notify('This browser cannot play audio, but everything else works 💗', 'error')
      return
    }
    if (state.playing) {
      audio.stopMusic()
      notify('Music paused — take your time 🌙', 'info')
    } else {
      audio.startMusic()
      notify('Dreamy music on 🎵', 'success')
    }
  }

  const toggleMute = () => {
    const next = !state.muted
    audio.setMuted(next)
    notify(next ? 'Sound muted 🔇' : 'Sound back on 🔊', 'info')
  }

  if (variant === 'compact') {
    return (
      <div className="audio audio--compact">
        <button
          type="button"
          className={`audio__btn ${state.playing ? 'is-on' : ''}`}
          onClick={toggleMusic}
          aria-pressed={state.playing}
          aria-label={state.playing ? 'Pause background music' : 'Play background music'}
          title={state.playing ? 'Pause music' : 'Play music'}
        >
          <span className="audio__bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="sr-only">{state.playing ? 'Pause music' : 'Play music'}</span>
        </button>
        <button
          type="button"
          className="audio__btn"
          onClick={toggleMute}
          aria-pressed={state.muted}
          aria-label={state.muted ? 'Unmute all sounds' : 'Mute all sounds'}
          title={state.muted ? 'Unmute' : 'Mute'}
        >
          {state.muted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
        </button>
      </div>
    )
  }

  return (
    <div className="audio audio--full">
      <div className="audio__row">
        <button
          type="button"
          className={`btn btn--sm ${state.playing ? 'btn--primary' : 'btn--soft'}`}
          onClick={toggleMusic}
          aria-pressed={state.playing}
        >
          {state.playing ? '⏸ Pause music' : '🎵 Play music'}
        </button>
        <button
          type="button"
          className="btn btn--sm btn--ghost"
          onClick={toggleMute}
          aria-pressed={state.muted}
        >
          {state.muted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      </div>
      <label className="audio__volume">
        <span className="sr-only">Music volume</span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={Math.round(state.volume * 100)}
          onChange={(e) => audio.setVolume(Number(e.target.value) / 100)}
          aria-valuetext={`${Math.round(state.volume * 100)} percent volume`}
        />
      </label>
      <p className="audio__hint">Soft bells &amp; sparkles, generated live in your browser.</p>
    </div>
  )
}
