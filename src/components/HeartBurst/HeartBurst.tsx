import { useEffect, useRef } from 'react'

interface HeartBurstProps {
  /** Increments to fire a new burst. */
  token: number
  count?: number
  duration?: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  vrot: number
  color: string
  life: number
}

/** A controlled, GPU-cheap burst of floating hearts drawn on a 2D canvas. */
export function HeartBurst({ token, count = 120, duration = 4200 }: HeartBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const startRef = useRef(0)
  const lastToken = useRef(token)

  useEffect(() => {
    if (token === lastToken.current) return
    lastToken.current = token

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const palette = ['#ff7fb0', '#ffa8c8', '#c9a8ff', '#ffb3a0', '#f4a7ff', '#ff9ec4']
    particles.current = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 60 + Math.random() * 220
      return {
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
        y: window.innerHeight * 0.62 + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 130,
        size: 12 + Math.random() * 26,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 4,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 1,
      }
    })
    startRef.current = performance.now()

    const drawHeart = (px: number, py: number, size: number, rot: number, color: string) => {
      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(rot)
      ctx.scale(size / 32, size / 32)
      ctx.beginPath()
      for (let i = 0; i <= 40; i++) {
        const t = (i / 40) * Math.PI * 2
        const x = 16 * Math.pow(Math.sin(t), 3)
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
      ctx.restore()
    }

    const loop = (now: number) => {
      const elapsed = now - startRef.current
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      const dt = 0.016

      particles.current.forEach((p) => {
        p.vy += 42 * dt
        p.vx *= 0.995
        p.vy *= 0.995
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.vrot * dt
        p.life = Math.max(0, 1 - elapsed / duration)
        if (p.life > 0) {
          ctx.globalAlpha = Math.min(1, p.life * 1.4)
          drawHeart(p.x, p.y, p.size, p.rot, p.color)
        }
      })
      ctx.globalAlpha = 1

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      }
    }

    rafRef.current = requestAnimationFrame(loop)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [token, count, duration])

  return <canvas ref={canvasRef} className="heart-burst" aria-hidden="true" />
}
