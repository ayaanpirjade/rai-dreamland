import { useEffect, useState } from 'react'

/**
 * Tracks which section is currently on screen so the navigation can show an
 * active indicator, and keeps the document title meaningful.
 */
export function useScrollSpy(ids: string[], titleFor?: (id: string) => string) {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const visible = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio)
          else visible.delete(entry.target.id)
        }
        let best = ''
        let bestRatio = 0
        visible.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio
            best = id
          }
        })
        if (best) setActive(best)
      },
      { threshold: [0.08, 0.2, 0.35, 0.6], rootMargin: '-25% 0px -45% 0px' },
    )

    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node))

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [ids])

  useEffect(() => {
    if (!titleFor || !active) return
    const title = titleFor(active)
    if (title && document.title !== title) document.title = title
  }, [active, titleFor])

  return active
}
