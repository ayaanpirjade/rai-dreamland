/**
 * The Bubu × Dudu media library.
 *
 * All artwork is derived from the original files in `assets/source/` by
 * `scripts/build-media.mjs`, which crops the bears out and emits optimised
 * WebP + PNG/JPEG pairs into `public/media/`.
 *
 * The animated GIF slots are optional: drop a file with the matching name
 * into `public/media/` and it will be used automatically. Until then the
 * component falls back to a static frame, so nothing ever looks broken.
 */
import { asset } from '../lib/asset'

export type MediaKey =
  | 'bubu'
  | 'dudu'
  | 'bubuBow'
  | 'duduBowtie'
  | 'party'
  | 'candle'
  | 'room'
  | 'balloon'
  | 'night'
  | 'bubuWave'
  | 'duduParty'
  | 'hug'
  | 'heartPop'

export interface MediaItem {
  /** Path inside `public/` (the WebP version). */
  src: string
  /** Alternative format for older browsers. */
  fallbackSrc?: string
  /** Accessible description */
  alt: string
  /** Shown if every source fails to load */
  emoji: string
  /** Another image used when this one is missing. */
  fallbackMedia?: MediaKey
  /** True for animated GIFs */
  animated?: boolean
}

export const MEDIA_SOURCE: Record<MediaKey, MediaItem> = {
  /* --- the bears -------------------------------------------------------- */
  bubu: {
    src: '/media/bubu.webp',
    fallbackSrc: '/media/bubu.png',
    alt: 'Bubu — the white bear wearing a blue striped party hat',
    emoji: '🧸',
  },
  dudu: {
    src: '/media/dudu.webp',
    fallbackSrc: '/media/dudu.png',
    alt: 'Dudu — the honey-brown bear wearing a red striped party hat',
    emoji: '🧸',
  },
  bubuBow: {
    src: '/media/bubu-bow.webp',
    fallbackSrc: '/media/bubu-bow.png',
    alt: 'Bubu — the white bear with a pink bow',
    emoji: '🧸',
  },
  duduBowtie: {
    src: '/media/dudu-bowtie.webp',
    fallbackSrc: '/media/dudu-bowtie.png',
    alt: 'Dudu — the honey-brown bear with a black bow tie',
    emoji: '🧸',
  },

  /* --- full scenes ------------------------------------------------------ */
  party: {
    src: '/media/bubu-dudu-party.webp',
    fallbackSrc: '/media/bubu-dudu-party.jpg',
    alt: 'Bubu and Dudu in party hats behind a Happy Birthday cake',
    emoji: '🎂',
  },
  candle: {
    src: '/media/bubu-dudu-candle.webp',
    fallbackSrc: '/media/bubu-dudu-candle.jpg',
    alt: 'Bubu and Dudu sharing a candle-lit cake under string lights',
    emoji: '🕯️',
  },
  room: {
    src: '/media/birthday-room.webp',
    fallbackSrc: '/media/birthday-room.jpg',
    alt: 'The birthday room with bunting, balloons and a Happy Birthday cake',
    emoji: '🎈',
  },
  balloon: {
    src: '/media/dudu-balloon.webp',
    fallbackSrc: '/media/dudu-balloon.jpg',
    alt: 'Dudu with a striped party hat holding a polka-dot balloon',
    emoji: '🎈',
  },
  night: {
    src: '/media/bubu-dudu-night.webp',
    fallbackSrc: '/media/bubu-dudu-night.jpg',
    alt: 'Dudu with a cake and Bubu holding a present on a starlit night',
    emoji: '🌙',
  },

  /* --- optional animated GIFs (drop the file in and it lights up) -------- */
  bubuWave: {
    src: '/media/bubu-wave.gif',
    alt: 'Bubu waving hello',
    emoji: '👋',
    fallbackMedia: 'bubu',
    animated: true,
  },
  duduParty: {
    src: '/media/dudu-party.gif',
    alt: 'Dudu celebrating with a party hat',
    emoji: '🎉',
    fallbackMedia: 'dudu',
    animated: true,
  },
  hug: {
    src: '/media/bubu-hug.gif',
    alt: 'Bubu giving Dudu a warm bear hug',
    emoji: '🫂',
    fallbackMedia: 'candle',
    animated: true,
  },
  heartPop: {
    src: '/media/heart-pop.gif',
    alt: 'A pink heart popping with sparkles',
    emoji: '💗',
    fallbackMedia: 'party',
    animated: true,
  },
}

/** Every public path is resolved against the deployment base URL. */
export const MEDIA: Record<MediaKey, MediaItem> = Object.fromEntries(
  Object.entries(MEDIA_SOURCE).map(([key, item]) => [
    key,
    {
      ...item,
      src: asset(item.src),
      fallbackSrc: item.fallbackSrc ? asset(item.fallbackSrc) : undefined,
    },
  ]),
) as Record<MediaKey, MediaItem>