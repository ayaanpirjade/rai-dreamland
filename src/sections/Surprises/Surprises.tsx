import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gift, Heart, HeartHandshake, Mail, PartyPopper, Sparkles } from 'lucide-react'

import { GlassPanel } from '../../components/GlassPanel/GlassPanel'
import { Modal } from '../../components/Modal/Modal'
import { HeartBurst } from '../../components/HeartBurst/HeartBurst'
import { Sticker } from '../../components/Media/Sticker'
import { SceneCanvas } from '../../components/ThreeCanvas'
import { GiftRoomScene } from '../../scenes/GiftRoom/GiftRoomScene'
import { useInView } from '../../hooks/useInView'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useDeviceProfile } from '../../hooks/useDeviceProfile'
import { useSceneBus } from '../../hooks/useSceneBus'
import { useToast } from '../../hooks/useToast'
import { audio } from '../../lib/audio'
import { pick } from '../../lib/utils'
import { HUG_LINES, SECRET_GIFT_MESSAGE, SMILE_MESSAGES, SURPRISE_NOTES } from '../../data/messages'

export function Surprises() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.02, rootMargin: '300px' })
  const reducedMotion = useReducedMotion()
  const profile = useDeviceProfile()
  const { triggerHug } = useSceneBus()
  const { notify } = useToast()

  const [smileMessage, setSmileMessage] = useState<string | null>(null)
  const [burstToken, setBurstToken] = useState(0)
  const [hugActive, setHugActive] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [giftOpen, setGiftOpen] = useState(false)
  const [giftRevealed, setGiftRevealed] = useState(false)
  const [giftToken, setGiftToken] = useState(0)

  const openSmile = useCallback(() => {
    const message = pick(SMILE_MESSAGES)
    setSmileMessage(message)
    audio.play('bell')
    notify('Ek smile mili! 😊', 'love')
  }, [notify])

  const launchHearts = useCallback(() => {
    setBurstToken((n) => n + 1)
    audio.play('sparkle')
    notify('A thousand tiny hearts, sirf tumhare liye 💗', 'love')
  }, [notify])

  const doHug = useCallback(() => {
    triggerHug()
    setHugActive(true)
    audio.play('chime')
    notify(pick(HUG_LINES), 'love')
    window.setTimeout(() => setHugActive(false), 3200)
  }, [triggerHug, notify])

  const openGift = useCallback(() => {
    setGiftOpen(true)
    setGiftRevealed(false)
    setGiftToken((n) => n + 1)
    audio.play('whoosh')
  }, [])

  return (
    <section className="section surprises" id="surprises" aria-labelledby="surprises-title" ref={ref}>
      <div className="section__inner">
        <header className="surprises__head">
          <p className="section__eyebrow">
            <Sparkles size={14} aria-hidden="true" /> Scene E
          </p>
          <h2 className="section__title" id="surprises-title">
            A few surprises, just for you
          </h2>
          <p className="section__lede">
            Paanch chhote surprises jo sirf tumhare liye banaye gaye hain. Har ek actually kaam karta hai — try
            karo! 💗
          </p>
        </header>

        <div className="surprises__grid">
          {/* 1 — smile */}
          <GlassPanel className="surprise surprise--smile" strong>
            <Sticker media="bubuWave" className="surprise__art" decorative />
            <h3>Open When You Smile</h3>
            <p>Ek chhoti si khushi, sirf tumhare smile ke liye.</p>
            <button type="button" className="btn btn--soft" onClick={openSmile}>
              Smile karo ✨
            </button>
            <AnimatePresence mode="wait">
              {smileMessage && (
                <motion.p
                  key={smileMessage}
                  className="surprise__reveal"
                  initial={{ opacity: 0, y: 12, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  role="status"
                >
                  {smileMessage}
                </motion.p>
              )}
            </AnimatePresence>
          </GlassPanel>

          {/* 2 — hug */}
          <GlassPanel className={`surprise surprise--hug ${hugActive ? 'is-active' : ''}`} strong>
            <Sticker media="duduParty" className="surprise__art" decorative />
            <h3>A Little Hug</h3>
            <p>Bubu ne Dudu ko ek tight hug diya — wahi wala, jo tumhe pasand hai.</p>
            <button type="button" className="btn btn--soft" onClick={doHug}>
              <HeartHandshake size={16} aria-hidden="true" /> Ek hug de do
            </button>
            <div className="surprise__hug" aria-hidden="true">
              <Sticker media="hug" className="surprise__hug-art" decorative />
            </div>
          </GlassPanel>

          {/* 3 — thousand hearts */}
          <GlassPanel className="surprise surprise--hearts" strong>
            <Sticker media="heartPop" className="surprise__art" decorative />
            <h3>A Thousand Tiny Hearts</h3>
            <p>Ek chhoti si kaanun, aur poori duniya ke pyaar bhar dil mein.</p>
            <button type="button" className="btn btn--soft" onClick={launchHearts}>
              <Heart size={16} aria-hidden="true" /> Dil bhar do
            </button>
          </GlassPanel>

          {/* 4 — sweetheart note */}
          <GlassPanel className="surprise surprise--note" strong>
            <span className="surprise__icon" aria-hidden="true">
              💌
            </span>
            <h3>For My Sweetheart</h3>
            <p>Ek note jo sirf tumhare liye hai.</p>
            <button type="button" className="btn btn--soft" onClick={() => setNoteOpen(true)}>
              <Mail size={16} aria-hidden="true" /> Note kholo
            </button>
          </GlassPanel>

          {/* 5 — one last gift */}
          <GlassPanel className="surprise surprise--gift" strong>
            <span className="surprise__icon" aria-hidden="true">
              🎁
            </span>
            <h3>One Last Gift</h3>
            <p>Ek dabba, jo andar se poori tarah pyaar se bhara hai.</p>
            <button type="button" className="btn btn--soft" onClick={openGift}>
              <Gift size={16} aria-hidden="true" /> Gift kholo
            </button>
          </GlassPanel>
        </div>

        <div className="surprises__gift-stage glass">
          {inView ? (
            <SceneCanvas cameraPosition={[0, 1.5, 6.4]} cameraFov={42} shadows className="gift-canvas">
              <GiftRoomScene
                profile={profile}
                reducedMotion={reducedMotion}
                openToken={giftToken}
                onOpened={() => {
                  setGiftRevealed(true)
                  audio.play('success')
                }}
              />
            </SceneCanvas>
          ) : (
            <div className="scene-placeholder">
              <span aria-hidden="true">🎁</span>
              <p>Ek dabba intezaar kar raha hai…</p>
            </div>
          )}
          <div className="surprises__gift-actions">
            <button type="button" className="btn btn--primary" onClick={openGift}>
              <PartyPopper size={16} aria-hidden="true" /> {giftRevealed ? 'Dobara kholo' : 'Gift kholo'}
            </button>
            {giftRevealed && (
              <button type="button" className="btn btn--soft" onClick={() => setGiftOpen(true)}>
                Message padho 💌
              </button>
            )}
          </div>
        </div>
      </div>

      <HeartBurst token={burstToken} />

      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="For my Sweetheart"
        description="A small note, written just for RAI."
      >
        <div className="sweetnote">
          {SURPRISE_NOTES.map((note, index) => (
            <motion.p
              key={note}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              {note}
            </motion.p>
          ))}
          <p className="sweetnote__sign">— Tumhara Dudu 💗</p>
        </div>
      </Modal>

      <Modal
        open={giftOpen}
        onClose={() => setGiftOpen(false)}
        title="Ek last gift"
        description="Yeh dabba tumhare liye hai."
        size="lg"
      >
        <div className="giftmessage">
          {SECRET_GIFT_MESSAGE.split('\n').map((line, index) => (
            <p key={index} className={index === 0 ? 'giftmessage__lead' : undefined}>
              {line}
            </p>
          ))}
        </div>
      </Modal>
    </section>
  )
}
