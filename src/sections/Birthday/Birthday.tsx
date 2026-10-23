import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Cake, PartyPopper, Sparkles, X } from 'lucide-react'

import { SceneCanvas } from '../../components/ThreeCanvas'
import { GlassPanel } from '../../components/GlassPanel/GlassPanel'
import { Sticker } from '../../components/Media/Sticker'
import { CakeScene } from '../../scenes/Cake/CakeScene'
import { useInView } from '../../hooks/useInView'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useDeviceProfile } from '../../hooks/useDeviceProfile'
import { useToast } from '../../hooks/useToast'
import { audio } from '../../lib/audio'
import { CAKE_CELEBRATION, CAKE_MESSAGES } from '../../data/messages'

export function Birthday() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12, rootMargin: '200px' })
  const reducedMotion = useReducedMotion()
  const profile = useDeviceProfile()
  const { notify } = useToast()
  const [wishToken, setWishToken] = useState(0)
  const [celebrating, setCelebrating] = useState(false)

  const makeWish = useCallback(() => {
    const message = CAKE_MESSAGES[Math.floor(Math.random() * CAKE_MESSAGES.length)]
    setWishToken((n) => n + 1)
    notify(message, 'love')
    audio.play('whoosh', 0.8)
  }, [notify])

  const onCelebrate = useCallback(() => {
    setCelebrating(true)
    audio.play('success')
  }, [])

  return (
    <section className="section birthday" id="cake" aria-labelledby="cake-title">
      <div className="section__inner">
        <header className="birthday__head">
          <p className="section__eyebrow">
            <Sparkles size={14} aria-hidden="true" /> Scene D
          </p>
          <h2 className="section__title" id="cake-title">
            The birthday cake
          </h2>
          <p className="section__lede">
            Teen pastel layers, creamy frosting, strawberries aur glowing candles. Ek button dabao, wish karo, aur
            poori duniya jashn mein utar padegi. 🎂
          </p>
        </header>

        <div className="birthday__stage glass" ref={ref}>
          {inView ? (
            <SceneCanvas cameraPosition={[0, 1.5, 6.6]} cameraFov={42} shadows className="birthday-canvas">
              <CakeScene
                profile={profile}
                reducedMotion={reducedMotion}
                wishToken={wishToken}
                onCelebrate={onCelebrate}
              />
            </SceneCanvas>
          ) : (
            <div className="scene-placeholder">
              <span aria-hidden="true">🎂</span>
              <p>Cake lag raha hai…</p>
            </div>
          )}

          <div className="birthday__controls">
            <button type="button" className="btn btn--primary btn--lg" onClick={makeWish}>
              <Cake size={20} aria-hidden="true" /> MAKE A WISH 🎂
            </button>
            <p className="birthday__hint">Blow out the candles and make it count ✨</p>
          </div>

          <Sticker media="candle" className="birthday__art" decorative />

          <AnimatePresence>
            {celebrating && (
              <motion.div
                className="birthday__celebration"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                role="status"
              >
                <button
                  type="button"
                  className="birthday__close"
                  onClick={() => setCelebrating(false)}
                  aria-label="Close celebration"
                >
                  <X size={18} aria-hidden="true" />
                </button>
                <span className="birthday__celebration-emoji" aria-hidden="true">
                  🎉
                </span>
                <h3>{CAKE_CELEBRATION[0]}</h3>
                {CAKE_CELEBRATION.slice(1).map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <GlassPanel className="birthday__celebration-note">
                  <PartyPopper size={16} aria-hidden="true" />
                  <span>Chal, ab cake ki slice khaate hain — ek dum se poori plate! 🍰</span>
                </GlassPanel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
