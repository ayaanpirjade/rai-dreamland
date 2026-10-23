/* ==========================================================================
   Small helpers shared across the app.
   ========================================================================== */

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Frame-rate independent damping (Laplacian smoothing). */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt))
}

export function randomRange(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export function randomInt(min: number, max: number) {
  return Math.floor(randomRange(min, max + 1))
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** The birthday is 24 October (month is 1-indexed here). */
export function isBirthdayToday(month: number, day: number) {
  const now = new Date()
  return now.getMonth() + 1 === month && now.getDate() === day
}

/** Days until the next 24 October — works before, on and after the date. */
export function daysUntilBirthday(month: number, day: number) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let target = new Date(now.getFullYear(), month - 1, day)
  if (target < today) target = new Date(now.getFullYear() + 1, month - 1, day)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}
