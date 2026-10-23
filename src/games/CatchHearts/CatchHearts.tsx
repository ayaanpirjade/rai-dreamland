import { useCallback, useEffect, useRef, useState } from 'react'
import { Heart, RotateCcw, Timer, Trophy } from 'lucide-react'

import { audio } from '../../lib/audio'
import { useToast } from '../../hooks/useToast'
import { GlassPanel } from '../../components/GlassPanel/GlassPanel'

interface FloatingHeart {
  el: HTMLButtonElement
  x: number
  y: number
  vy: number
  size: number
  rot: number
  vrot: number
  alive: boolean
}

const DURATION = 30
const TARGET = 14
const CATCH_RADIUS = 46

export function CatchHearts() {
  const arenaRef = useRef<HTMLDivElement>(null)
  const heartsRef = useRef<FloatingHeart[]>([])
  const rafRef = useRef<number>(0)
  const lastSpawn = useRef(0)
  const startTime = useRef(0)
  const cursor = useRef({ x: 0, y: 0 })
  const [status, setStatus] = useState<'idle' | 'playing' | 'done'>('idle')
  const [score, setScore] = useState(0)
  const [missed, setMissed] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [won, setWon] = useState(false)
  const { notify } = useToast()

  const clearHearts = useCallback(() => {
    heartsRef.current.forEach((h) => h.el.remove())
    heartsRef.current = []
  }, [])

  const catchHeart = useCallback((heart: FloatingHeart) => {
    if (!heart.alive) return
    heart.alive = false
    heart.el.remove()
    heartsRef.current = heartsRef.current.filter((h) => h !== heart)
    setScore((s) => s + 1)
    audio.play('pop', 0.8)
  }, [])

  const spawnHeart = useCallback(() => {
    const arena = arenaRef.current
    if (!arena) return
    const rect = arena.getBoundingClientRect()
    const size = 30 + Math.random() * 26
    const el = document.createElement('button')
    el.type = 'button'
    el.className = 'catch-heart'
    el.setAttribute('aria-label', 'Catch a floating heart')
    el.style.width = `${size}px`
    el.style.height = `${size}px`
    el.style.setProperty('--hue', String(Math.round(320 + Math.random() * 70)))
    el.innerHTML = '<span aria-hidden="true">💗</span>'
    el.addEventListener('click', (event) => {
      event.preventDefault()
      const heart = heartsRef.current.find((h) => h.el === el)
      if (heart && heart.alive) catchHeart(heart)
    })
    arena.appendChild(el)
    heartsRef.current.push({
      el,
      x: Math.random() * Math.max(1, rect.width - size),
      y: -size,
      vy: 0,
      size,
      rot: Math.random() * 40 - 20,
      vrot: (Math.random() - 0.5) * 40,
      alive: true,
    })
  }, [catchHeart])

  const endGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    clearHearts()
    setStatus('done')
    const finalScore = score
    const didWin = finalScore >= TARGET
    setWon(didWin)
    if (didWin) {
      audio.play('success')
      notify(`Kamaal! ${finalScore} hearts pakde 🎉`, 'success')
    } else {
      audio.play('chime')
      notify(`${finalScore} hearts pakde — thoda aur try karo! 💗`, 'info')
    }
  }, [clearHearts, notify, score])

  const start = useCallback(() => {
    clearHearts()
    setScore(0)
    setMissed(0)
    setTimeLeft(DURATION)
    setWon(false)
    setStatus('playing')
    startTime.current = performance.now()
    lastSpawn.current = 0
    audio.play('chime')
  }, [clearHearts])

  useEffect(() => {
    if (status !== 'playing') return
    const arena = arenaRef.current
    if (!arena) return

    const loop = (now: number) => {
      const rect = arena.getBoundingClientRect()
      const elapsed = (now - startTime.current) / 1000
      const remaining = Math.max(0, DURATION - elapsed)
      setTimeLeft(Math.ceil(remaining))

      const difficulty = Math.min(1, elapsed / DURATION)
      const spawnGap = 780 - difficulty * 430
      if (now - lastSpawn.current > spawnGap) {
        lastSpawn.current = now
        spawnHeart()
      }

      const speedBase = 46 + difficulty * 88
      const list = heartsRef.current
      for (let i = list.length - 1; i >= 0; i--) {
        const heart = list[i]
        heart.vy = speedBase + heart.size * 0.5
        heart.y += heart.vy * 0.016
        heart.rot += heart.vrot * 0.016
        heart.el.style.transform = `translate3d(${heart.x}px, ${heart.y}px, 0) rotate(${heart.rot}deg)`
        if (heart.y > rect.height + 40) {
          heart.alive = false
          heart.el.remove()
          list.splice(i, 1)
          setMissed((m) => m + 1)
        }
      }

      if (remaining <= 0) {
        endGame()
        return
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafRef.current)
      clearHearts()
    }
  }, [status, spawnHeart, clearHearts, endGame])

  const tryCatchAtCursor = useCallback(() => {
    const arena = arenaRef.current
    if (!arena) return
    const rect = arena.getBoundingClientRect()
    const cx = cursor.current.x
    const cy = cursor.current.y
    let best: FloatingHeart | null = null
    let bestDist = CATCH_RADIUS
    for (const heart of heartsRef.current) {
      const hx = heart.x + heart.size / 2
      const hy = heart.y + heart.size / 2
      const dist = Math.hypot(hx - cx, hy - cy)
      if (dist < bestDist) {
        bestDist = dist
        best = heart
      }
    }
    if (best) catchHeart(best)
    void rect
  }, [catchHeart])

  const handlePointer = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const arena = arenaRef.current
    if (!arena) return
    const rect = arena.getBoundingClientRect()
    cursor.current.x = event.clientX - rect.left
    cursor.current.y = event.clientY - rect.top
    if (cursorElRef.current) {
      cursorElRef.current.style.transform = `translate3d(${cursor.current.x}px, ${cursor.current.y}px, 0) translate(-50%, -50%)`
    }
  }, [])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const step = 34
      const arena = arenaRef.current
      if (!arena) return
      const rect = arena.getBoundingClientRect()
      switch (event.key) {
        case 'ArrowLeft':
          cursor.current.x = Math.max(0, cursor.current.x - step)
          break
        case 'ArrowRight':
          cursor.current.x = Math.min(rect.width, cursor.current.x + step)
          break
        case 'ArrowUp':
          cursor.current.y = Math.max(0, cursor.current.y - step)
          break
        case 'ArrowDown':
          cursor.current.y = Math.min(rect.height, cursor.current.y + step)
          break
        case ' ':
        case 'Enter':
          event.preventDefault()
          tryCatchAtCursor()
          return
        default:
          return
      }
      event.preventDefault()
      if (cursorElRef.current) {
        cursorElRef.current.style.transform = `translate3d(${cursor.current.x}px, ${cursor.current.y}px, 0) translate(-50%, -50%)`
      }
    },
    [tryCatchAtCursor],
  )

  const cursorElRef = useRef<HTMLSpanElement>(null)

  const cursorStyle = {
    left: `${cursor.current.x}px`,
    top: `${cursor.current.y}px`,
  }

  return (
    <div className="game game--catch">
      <div className="game__hud">
        <div className="game__stat">
          <Heart size={16} aria-hidden="true" />
          <span>
            Score <strong>{score}</strong>
          </span>
        </div>
        <div className="game__stat">
          <Timer size={16} aria-hidden="true" />
          <span>
            Time <strong>{timeLeft}s</strong>
          </span>
        </div>
        <div className="game__stat">
          <Trophy size={16} aria-hidden="true" />
          <span>
            Missed <strong>{missed}</strong>
          </span>
        </div>
      </div>

      <div className="game__progress" aria-hidden="true">
        <span style={{ width: `${Math.min(100, (score / TARGET) * 100)}%` }} />
      </div>
      <p className="game__goal">
        Target: catch <strong>{TARGET}</strong> hearts. {status === 'playing' ? `${Math.max(0, TARGET - score)} to go!` : 'Tap the hearts as they float by.'}
      </p>

      <div
        ref={arenaRef}
        className={`catch-arena ${status === 'playing' ? 'is-playing' : ''}`}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="application"
        aria-label="Catch the hearts play area. Use arrow keys to move the catcher and press space to catch a heart."
      >
        {status === 'playing' && (
          <span ref={cursorElRef} className="catch-cursor" style={cursorStyle} aria-hidden="true" />
        )}
        {status === 'idle' && (
          <div className="game__overlay">
            <span className="game__overlay-emoji" aria-hidden="true">
              💗
            </span>
            <h3>Catch the Hearts</h3>
            <p>Hearts float down the sky. Catch as many as you can in 30 seconds!</p>
            <button type="button" className="btn btn--primary" onClick={start}>
              Start catching
            </button>
          </div>
        )}
        {status === 'done' && (
          <div className="game__overlay">
            <span className="game__overlay-emoji" aria-hidden="true">
              {won ? '🎉' : '🧸'}
            </span>
            <h3>{won ? 'Kamaal kar diya!' : 'Bahut khoobsurat!'}</h3>
            <p>
              You caught <strong>{score}</strong> hearts{score > missed ? ' — more than you missed!' : '.'}
            </p>
            <button type="button" className="btn btn--primary" onClick={start}>
              <RotateCcw size={16} aria-hidden="true" /> Play again
            </button>
          </div>
        )}
      </div>

      <GlassPanel className="game__hint">
        <strong>How to play:</strong> click or tap a heart to catch it. On a keyboard, move with the arrow keys and
        press <kbd>Space</kbd>.
      </GlassPanel>
    </div>
  )
}
