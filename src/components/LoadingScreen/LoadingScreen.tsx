import { motion } from 'framer-motion'
import { BrandMark } from '../Brand/BrandMark'

interface LoadingScreenProps {
  message?: string
  /** 0–1 when we know the real progress; omit for an honest indeterminate state. */
  progress?: number
  tips?: string[]
}

/** Branded loading screen used while the heavy 3D bundles arrive. */
export function LoadingScreen({ message = 'Warming up the dreamland…', progress, tips }: LoadingScreenProps) {
  const pct = progress === undefined ? null : Math.round(Math.min(1, Math.max(0, progress)) * 100)

  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader__inner">
        <motion.div
          className="loader__mark"
          animate={{ y: [0, -12, 0], rotate: [-4, 4, -4] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <BrandMark size={86} />
        </motion.div>
        <h2 className="loader__title">RAI&rsquo;s little dreamland</h2>
        <p className="loader__msg">{message}</p>
        <div className="loader__bar" aria-hidden="true">
          {pct === null ? <span className="loader__bar-indeterminate" /> : <span style={{ width: `${pct}%` }} />}
        </div>
        <p className="loader__pct">{pct === null ? 'Loading the pastel clouds…' : `${pct}%`}</p>
        {tips && tips.length > 0 && <p className="loader__tip">{tips[Math.floor(Date.now() / 6000) % tips.length]}</p>}
      </div>
    </div>
  )
}
