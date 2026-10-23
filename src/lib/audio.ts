/* ==========================================================================
   Ayaan's little audio studio
   ------------------------------------------------------------------
   Everything here is *generated* with the Web Audio API, so there are no
   audio files to download, no licences to worry about and no CDN that can
   disappear the night before the birthday.

   - `music`  : a slow, dreamy pentatonic arpeggio + warm pad
   - `sfx`    : soft bells, sparkles, pops and chimes for interactions
   ========================================================================== */

export type SfxName = 'bell' | 'sparkle' | 'pop' | 'chime' | 'whoosh' | 'success' | 'error'

type Listener = (state: AudioState) => void

export interface AudioState {
  playing: boolean
  muted: boolean
  volume: number
  supported: boolean
  failed: boolean
}

const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21]
const ROOT = 261.63 // C4

function midiToFreq(semi: number) {
  return ROOT * Math.pow(2, semi / 12)
}

class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private musicBus: GainNode | null = null
  private sfxBus: GainNode | null = null
  private noiseBuffer: AudioBuffer | null = null
  private scheduler: number | null = null
  private step = 0
  private listeners = new Set<Listener>()

  playing = false
  muted = false
  volume = 0.5
  supported = typeof window !== 'undefined' && typeof window.AudioContext !== 'undefined'
  failed = false

  /* -- state ------------------------------------------------------------- */

  private emit() {
    const state = this.getState()
    this.listeners.forEach((fn) => fn(state))
  }

  getState(): AudioState {
    return {
      playing: this.playing,
      muted: this.muted,
      volume: this.volume,
      supported: this.supported,
      failed: this.failed,
    }
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    fn(this.getState())
    return () => {
      this.listeners.delete(fn)
    }
  }

  /* -- setup ------------------------------------------------------------- */

  private ensureContext(): AudioContext | null {
    if (!this.supported) {
      this.failed = true
      this.emit()
      return null
    }
    if (this.ctx) return this.ctx

    try {
      const Ctor: typeof AudioContext =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctor()
      const master = ctx.createGain()
      master.gain.value = this.muted ? 0 : this.volume
      master.connect(ctx.destination)

      const musicBus = ctx.createGain()
      musicBus.gain.value = 0.0
      musicBus.connect(master)

      const sfxBus = ctx.createGain()
      sfxBus.gain.value = 0.9
      sfxBus.connect(master)

      // tiny feedback-delay "room" so everything sounds soft and rounded
      const delay = ctx.createDelay(1.0)
      delay.delayTime.value = 0.26
      const feedback = ctx.createGain()
      feedback.gain.value = 0.28
      const wet = ctx.createGain()
      wet.gain.value = 0.22
      delay.connect(feedback)
      feedback.connect(delay)
      delay.connect(wet)
      wet.connect(master)

      const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 1.2), ctx.sampleRate)
      const data = noise.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

      this.ctx = ctx
      this.master = master
      this.musicBus = musicBus
      this.sfxBus = sfxBus
      this.noiseBuffer = noise
      return ctx
    } catch {
      this.failed = true
      this.supported = false
      this.emit()
      return null
    }
  }

  /* -- music ------------------------------------------------------------- */

  startMusic() {
    const ctx = this.ensureContext()
    if (!ctx || !this.musicBus) return
    void ctx.resume()

    this.playing = true
    this.musicBus.gain.cancelScheduledValues(ctx.currentTime)
    this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, ctx.currentTime)
    this.musicBus.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 1.6)

    if (this.scheduler === null) {
      this.step = 0
      this.scheduler = window.setInterval(() => this.tick(), 460)
    }
    this.emit()
  }

  stopMusic() {
    const ctx = this.ctx
    if (ctx && this.musicBus) {
      this.musicBus.gain.cancelScheduledValues(ctx.currentTime)
      this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, ctx.currentTime)
      this.musicBus.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
    }
    if (this.scheduler !== null) {
      window.clearInterval(this.scheduler)
      this.scheduler = null
    }
    this.playing = false
    this.emit()
  }

  toggleMusic() {
    if (this.playing) this.stopMusic()
    else this.startMusic()
  }

  private tick() {
    const ctx = this.ctx
    const bus = this.musicBus
    if (!ctx || !bus) return

    const t = ctx.currentTime + 0.02
    const bar = this.step % PENTATONIC.length
    const note = PENTATONIC[(bar * 3 + Math.floor(bar / 2)) % PENTATONIC.length]

    // gentle arpeggio
    this.pluck(midiToFreq(note + 12), t, 0.16, 'triangle', bus, 0.5)
    if (this.step % 2 === 0) {
      this.pluck(midiToFreq(PENTATONIC[(bar * 2) % PENTATONIC.length] + 12), t + 0.24, 0.13, 'sine', bus, 0.36)
    }
    // warm pad every 4 steps
    if (this.step % 4 === 0) {
      this.pluck(midiToFreq(PENTATONIC[bar % 5]), t, 2.2, 'sine', bus, 0.16, 0.4)
    }
    this.step += 1
  }

  private pluck(
    freq: number,
    when: number,
    dur: number,
    type: OscillatorType,
    dest: AudioNode,
    peak: number,
    attack = 0.02,
  ) {
    const ctx = this.ctx
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, when)
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.exponentialRampToValueAtTime(peak, when + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur)
    osc.connect(gain)
    gain.connect(dest)
    osc.start(when)
    osc.stop(when + dur + 0.05)
  }

  /* -- sfx --------------------------------------------------------------- */

  play(name: SfxName, volumeScale = 1) {
    if (this.muted) return
    const ctx = this.ensureContext()
    const bus = this.sfxBus
    if (!ctx || !bus) return
    void ctx.resume()
    const t = ctx.currentTime + 0.01

    switch (name) {
      case 'bell': {
        this.pluck(880, t, 0.7, 'sine', bus, 0.16 * volumeScale)
        this.pluck(1320, t + 0.02, 0.55, 'sine', bus, 0.08 * volumeScale)
        break
      }
      case 'sparkle': {
        for (let i = 0; i < 5; i++) {
          this.pluck(1400 + i * 420, t + i * 0.045, 0.22, 'sine', bus, 0.09 * volumeScale)
        }
        break
      }
      case 'pop': {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(420, t)
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.1)
        gain.gain.setValueAtTime(0.0001, t)
        gain.gain.exponentialRampToValueAtTime(0.22 * volumeScale, t + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
        osc.connect(gain)
        gain.connect(bus)
        osc.start(t)
        osc.stop(t + 0.25)
        break
      }
      case 'chime': {
        ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
          this.pluck(f, t + i * 0.07, 0.5, 'triangle', bus, 0.12 * volumeScale),
        )
        break
      }
      case 'whoosh': {
        if (!this.noiseBuffer) break
        const src = ctx.createBufferSource()
        const filter = ctx.createBiquadFilter()
        const gain = ctx.createGain()
        src.buffer = this.noiseBuffer
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(600, t)
        filter.frequency.exponentialRampToValueAtTime(2600, t + 0.35)
        filter.Q.value = 1.4
        gain.gain.setValueAtTime(0.0001, t)
        gain.gain.exponentialRampToValueAtTime(0.14 * volumeScale, t + 0.06)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45)
        src.connect(filter)
        filter.connect(gain)
        gain.connect(bus)
        src.start(t)
        src.stop(t + 0.5)
        break
      }
      case 'success': {
        ;[523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
          this.pluck(f, t + i * 0.085, 0.6, 'sine', bus, 0.14 * volumeScale),
        )
        break
      }
      case 'error': {
        this.pluck(320, t, 0.25, 'triangle', bus, 0.13 * volumeScale)
        this.pluck(240, t + 0.12, 0.3, 'triangle', bus, 0.12 * volumeScale)
        break
      }
    }
  }

  /* -- volume ------------------------------------------------------------ */

  setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v))
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.05)
    }
    this.emit()
  }

  setMuted(muted: boolean) {
    this.muted = muted
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.05)
    }
    this.emit()
  }

  toggleMute() {
    this.setMuted(!this.muted)
  }

  dispose() {
    this.stopMusic()
    if (this.ctx) {
      void this.ctx.close().catch(() => undefined)
      this.ctx = null
    }
  }
}

export const audio = new AudioEngine()
