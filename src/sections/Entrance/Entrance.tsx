import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import { SceneCanvas } from '../../components/ThreeCanvas'
import { EntranceScene } from '../../scenes/Entrance/EntranceScene'
import type { EntrancePhase } from '../../scenes/Entrance/EntranceScene'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { audio } from '../../lib/audio'
import { writeSession } from '../../lib/storage'

const INTRO_KEY = 'rai.intro.seen'

interface EntranceProps {
  onEntered: () => void
}

export function Entrance({ onEntered }: EntranceProps) {
  const [phase, setPhase] = useState<EntrancePhase>('approach')
  const [visible, setVisible] = useState(true)
  const reducedMotion = useReducedMotion()

  const finish = useCallback(() => {
    writeSession(INTRO_KEY, true)
    setVisible(false)
    onEntered()
  }, [onEntered])

  useEffect(() => {
    if (reducedMotion) {
      setPhase('welcome')
      return
    }
    const timers: number[] = []
    timers.push(window.setTimeout(() => setPhase('reveal'), 2600))
    timers.push(window.setTimeout(() => setPhase('welcome'), 5200))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [reducedMotion])

  const enter = () => {
    audio.startMusic()
    audio.play('chime')
    finish()
  }

  const skip = () => {
    audio.play('bell', 0.6)
    finish()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="entrance"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
          role="dialog"
          aria-label="Welcome to RAI's birthday dreamland"
        >
          <div className="entrance__canvas">
            <SceneCanvas cameraPosition={[0, 3.2, 17]} cameraFov={42} className="entrance__scene">
              <EntranceScene phase={phase} reducedMotion={reducedMotion} />
            </SceneCanvas>
          </div>

          <div className="entrance__overlay">
            <div className="entrance__copy">
              <AnimatePresence mode="wait">
                {phase === 'approach' && (
                  <motion.p
                    key="approach"
                    className="entrance__line"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Sparkles size={18} aria-hidden="true" />
                    Someone very special has a birthday coming&hellip;
                  </motion.p>
                )}

                {phase === 'reveal' && (
                  <motion.div
                    key="reveal"
                    className="entrance__reveal"
                    initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 16 }}
                  >
                    <p className="entrance__kicker">Today is the day</p>
                    <h1 className="entrance__name">RAI 💗</h1>
                    <p className="entrance__date">24 October &middot; A little world made just for you</p>
                  </motion.div>
                )}

                {phase === 'welcome' && (
                  <motion.div
                    key="welcome"
                    className="entrance__reveal"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                  >
                    <h2 className="entrance__welcome">Welcome to your little world, Darling Begum.</h2>
                    <p className="entrance__sub">
                      Duniya ke liye tum RAI ho, par mere liye tum meri sabse pyaari Sweetheart ho.
                    </p>
                    <button type="button" className="btn btn--primary btn--lg entrance__enter" onClick={enter}>
                      ENTER MY LITTLE WORLD ✨
                    </button>
                    <button type="button" className="entrance__skip" onClick={skip}>
                      Skip intro
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="entrance__credit" aria-hidden="true">
            made with 💗 by Ayaan
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
