import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { HeartHandshake, MessageCircleHeart, PartyPopper, Sparkles } from 'lucide-react'

import { SceneCanvas } from '../../components/ThreeCanvas'
import { GlassPanel } from '../../components/GlassPanel/GlassPanel'
import { Sticker } from '../../components/Media/Sticker'
import { BearWorldScene } from '../../scenes/BearWorld/BearWorldScene'
import { useInView } from '../../hooks/useInView'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useSceneBus } from '../../hooks/useSceneBus'
import { useToast } from '../../hooks/useToast'
import { audio } from '../../lib/audio'

interface LogEntry {
  id: number
  text: string
}

export function BearWorld() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.12, rootMargin: '200px' })
  const reducedMotion = useReducedMotion()
  const { hugToken, triggerHug } = useSceneBus()
  const { notify } = useToast()
  const [log, setLog] = useState<LogEntry[]>([
    { id: 0, text: 'Dudu ne kaha: "Bubu, aaj bahut khoobsurat hai tum!" 🧸' },
  ])

  const pushMessage = useCallback(
    (text: string, tone: 'love' | 'info' = 'love') => {
      setLog((prev) => [{ id: Date.now(), text }, ...prev].slice(0, 5))
      if (tone === 'love') notify(text, 'love')
    },
    [notify],
  )

  return (
    <section className="section bearworld" id="bears" aria-labelledby="bears-title">
      <div className="section__inner">
        <header className="bearworld__head">
          <p className="section__eyebrow">
            <Sparkles size={14} aria-hidden="true" /> Scene B
          </p>
          <h2 className="section__title" id="bears-title">
            Bubu × Dudu — our little bear world
          </h2>
          <p className="section__lede">
            <strong>Bubu</strong> is RAI, <strong>Dudu</strong> is Ayaan. Dono asli kawaii bears hain, jo Three.js
            se banaye gaye hain — dodh jaisi fur, chubby cheeks aur bilkul extra cute blinking. 👇
          </p>
        </header>

        <div className="bearworld__layout">
          <div className="bearworld__stage glass" ref={ref}>
            {inView ? (
              <SceneCanvas
                cameraPosition={[0, 1.5, 6.4]}
                cameraFov={42}
                shadows
                className="bearworld-canvas"
              >
                <BearWorldScene reducedMotion={reducedMotion} hugToken={hugToken} onMessage={pushMessage} />
              </SceneCanvas>
            ) : (
              <div className="scene-placeholder">
                <span aria-hidden="true">🧸</span>
                <p>Bubu aur Dudu aa rahe hain…</p>
              </div>
            )}
            <p className="bearworld__hint">Bears ya hearts par tap karo ✨</p>
          </div>

          <div className="bearworld__side">
            <GlassPanel className="bearworld__cards">
              <article className="bear-card bear-card--bubu">
                <Sticker media="bubuBow" className="bear-card__art" />
                <div>
                  <h3>Bubu</h3>
                  <p>Woh tum. RAI. Duniya ki sabse adorable Bubu — yeh title official hai. 💗</p>
                </div>
              </article>
              <article className="bear-card bear-card--dudu">
                <Sticker media="duduBowtie" className="bear-card__art" />
                <div>
                  <h3>Dudu</h3>
                  <p>Woh main. Ayaan. Tumhara sabse purana dost aur sabse zyada nakhre wala. 🧸</p>
                </div>
              </article>
            </GlassPanel>

            <GlassPanel className="bearworld__actions">
              <h3 className="bearworld__actions-title">Kuch karwao</h3>
              <div className="bearworld__buttons">
                <button
                  type="button"
                  className="btn btn--soft btn--sm"
                  onClick={() => {
                    triggerHug()
                  }}
                >
                  <HeartHandshake size={16} aria-hidden="true" /> Ek chhota hug
                </button>
                <button
                  type="button"
                  className="btn btn--soft btn--sm"
                  onClick={() => {
                    audio.play('chime')
                    pushMessage('Bubu aur Dudu ne saath mein jashn manaaya 🥳', 'info')
                  }}
                >
                  <PartyPopper size={16} aria-hidden="true" /> Celebrate
                </button>
                <button
                  type="button"
                  className="btn btn--soft btn--sm"
                  onClick={() => {
                    audio.play('sparkle')
                    pushMessage('Ek chhota sa dil — tumhare liye hi rakha hai. 💗', 'love')
                  }}
                >
                  <MessageCircleHeart size={16} aria-hidden="true" /> Ek dil bhejo
                </button>
              </div>
            </GlassPanel>

            <GlassPanel className="bearworld__log">
              <h3 className="bearworld__actions-title">Bears ki baatein</h3>
              <ul className="log-list" role="list" aria-live="polite">
                {log.map((entry) => (
                  <motion.li
                    key={entry.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {entry.text}
                  </motion.li>
                ))}
              </ul>
            </GlassPanel>
          </div>
        </div>
      </div>
    </section>
  )
}
