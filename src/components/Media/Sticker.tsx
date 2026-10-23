import { useState } from 'react'
import type { CSSProperties } from 'react'

import { MEDIA } from '../../data/media'
import type { MediaKey } from '../../data/media'

interface StickerProps {
  media: MediaKey
  className?: string
  style?: CSSProperties
  /** Decorative images are hidden from screen readers. */
  decorative?: boolean
  eager?: boolean
}

function fallbackChain(media: MediaKey, depth = 0): MediaKey[] {
  const item = MEDIA[media]
  if (!item.fallbackMedia || depth > 2) return []
  return [item.fallbackMedia, ...fallbackChain(item.fallbackMedia, depth + 1)]
}

/**
 * Renders a Bubu × Dudu image or GIF.
 *
 * Uses a <picture> element so the optimised WebP is served first with a
 * PNG/JPEG fallback, and gracefully degrades to a friendly emoji if nothing
 * can be loaded at all.
 */
export function Sticker({ media, className = '', style, decorative = false, eager = false }: StickerProps) {
  const [step, setStep] = useState(0)
  const [exhausted, setExhausted] = useState(false)

  const chain: MediaKey[] = [media, ...fallbackChain(media)]
  const current = chain[Math.min(step, chain.length - 1)]
  const item = MEDIA[current]

  const handleError = () => {
    if (step < chain.length - 1) setStep(step + 1)
    else setExhausted(true)
  }

  if (exhausted) {
    return (
      <span
        className={`sticker sticker--fallback ${className}`}
        style={style}
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : item.alt}
        aria-hidden={decorative ? true : undefined}
      >
        {item.emoji}
      </span>
    )
  }

  const alt = decorative ? '' : item.alt

  return (
    <picture className={`sticker ${className}`} style={style}>
      {!item.animated && item.src.endsWith('.webp') && <source srcSet={item.src} type="image/webp" />}
      {item.fallbackSrc && !item.animated && (
        <source
          srcSet={item.fallbackSrc}
          type={item.fallbackSrc.endsWith('.png') ? 'image/png' : 'image/jpeg'}
        />
      )}
      <img
        src={item.animated ? item.src : (item.fallbackSrc ?? item.src)}
        alt={alt}
        aria-hidden={decorative ? true : undefined}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={handleError}
      />
    </picture>
  )
}
