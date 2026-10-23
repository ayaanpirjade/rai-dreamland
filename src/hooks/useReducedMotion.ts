import { useEffect, useState } from 'react'

/**
 * Tracks `prefers-reduced-motion` and mirrors it onto <html data-reduced-motion>
 * so CSS can opt out of animations too.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => {
      setReduced(mq.matches)
      document.documentElement.dataset.reducedMotion = String(mq.matches)
    }
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
