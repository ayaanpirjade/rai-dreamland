import type { CSSProperties } from 'react'

/**
 * The site-wide backdrop — a soft pastel scrapbook.
 *
 * Three layers, back to front:
 *   1. `wash`    — slow, huge colour blobs that give the page its mood.
 *   2. `pattern` — a tiled kawaii doodle pattern (hearts, stars, paws, dots).
 *   3. `floaties`— a handful of drifting stickers for gentle life.
 *
 * Everything is CSS only: no canvas, no scroll listeners, no layout cost.
 */

interface Floaty {
  emoji: string
  left: string
  top: string
  size: number
  duration: number
  delay: number
  drift: number
  opacity: number
}

const FLOATIES: Floaty[] = [
  { emoji: '💗', left: '4%', top: '14%', size: 26, duration: 13, delay: 0, drift: 14, opacity: 0.5 },
  { emoji: '🎀', left: '91%', top: '9%', size: 24, duration: 16, delay: 1.5, drift: -18, opacity: 0.45 },
  { emoji: '⭐', left: '82%', top: '38%', size: 18, duration: 11, delay: 3, drift: 10, opacity: 0.4 },
  { emoji: '🧸', left: '2%', top: '52%', size: 22, duration: 15, delay: 2, drift: 16, opacity: 0.32 },
  { emoji: '🎈', left: '95%', top: '62%', size: 24, duration: 14, delay: 0.8, drift: -14, opacity: 0.38 },
  { emoji: '💗', left: '88%', top: '82%', size: 20, duration: 12, delay: 4, drift: 12, opacity: 0.42 },
  { emoji: '✨', left: '7%', top: '78%', size: 18, duration: 10, delay: 1.2, drift: -10, opacity: 0.45 },
  { emoji: '🍰', left: '46%', top: '4%', size: 18, duration: 17, delay: 2.6, drift: 8, opacity: 0.28 },
  { emoji: '💫', left: '60%', top: '90%', size: 16, duration: 13, delay: 5, drift: -12, opacity: 0.35 },
]

export function Wallpaper() {
  return (
    <div className="wallpaper" aria-hidden="true">
      <div className="wallpaper__wash">
        <span className="wallpaper__blob wallpaper__blob--pink" />
        <span className="wallpaper__blob wallpaper__blob--lav" />
        <span className="wallpaper__blob wallpaper__blob--mint" />
        <span className="wallpaper__blob wallpaper__blob--peach" />
      </div>

      <div className="wallpaper__pattern" />

      <div className="wallpaper__floaties">
        {FLOATIES.map((f, i) => (
          <span
            key={i}
            className="wallpaper__floaty"
            style={
              {
                left: f.left,
                top: f.top,
                '--size': `${f.size}px`,
                '--dur': `${f.duration}s`,
                '--delay': `${f.delay}s`,
                '--drift': `${f.drift}px`,
                '--float-opacity': f.opacity,
              } as CSSProperties
            }
          >
            {f.emoji}
          </span>
        ))}
      </div>

      <div className="wallpaper__glow" />
    </div>
  )
}
