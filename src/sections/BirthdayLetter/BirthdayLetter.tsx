import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Copy, Check, MailOpen, RotateCcw, Sparkles, X } from 'lucide-react'

import { GlassPanel } from '../../components/GlassPanel/GlassPanel'
import { Sticker } from '../../components/Media/Sticker'
import { LETTER_COPY_TEXT, LETTER_PARAGRAPHS } from '../../data/letter'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useToast } from '../../hooks/useToast'
import { copyToClipboard } from '../../lib/clipboard'
import { audio } from '../../lib/audio'

type LetterStage = 'sealed' | 'opening' | 'typing' | 'done'

interface BirthdayLetterProps {
  /** Standalone mode is used on the /letter route. */
  standalone?: boolean
}

const CHAR_DELAY = 13

export function BirthdayLetter({ standalone = false }: BirthdayLetterProps) {
  const reducedMotion = useReducedMotion()
  const { notify } = useToast()
  const [stage, setStage] = useState<LetterStage>(standalone ? 'typing' : 'sealed')
  const [typed, setTyped] = useState(0)
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  const fullText = useMemo(() => LETTER_PARAGRAPHS.map((p) => p.text).join('\n\n'), [])

  const stopTyping = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (stage !== 'typing') return
    if (reducedMotion) {
      setTyped(fullText.length)
      setStage('done')
      return
    }
    setTyped(0)
    timerRef.current = window.setInterval(() => {
      setTyped((prev) => {
        if (prev >= fullText.length) {
          stopTyping()
          setStage('done')
          return fullText.length
        }
        return prev + 1
      })
    }, CHAR_DELAY)
    return stopTyping
  }, [stage, reducedMotion, fullText.length, stopTyping])

  const openEnvelope = () => {
    setStage('opening')
    audio.play('whoosh')
    window.setTimeout(() => {
      setStage('typing')
      audio.play('bell')
    }, 900)
  }

  const skip = () => {
    stopTyping()
    setTyped(fullText.length)
    setStage('done')
  }

  const replay = () => {
    stopTyping()
    setTyped(0)
    setCopied(false)
    setStage(standalone ? 'typing' : 'sealed')
    if (standalone) audio.play('bell')
  }

  const close = () => {
    stopTyping()
    setTyped(0)
    setCopied(false)
    setStage('sealed')
  }

  const copy = async () => {
    const ok = await copyToClipboard(LETTER_COPY_TEXT)
    if (ok) {
      setCopied(true)
      audio.play('success')
      notify('Letter copy ho gaya! 💌 Paste kar do jahan chahti ho.', 'success')
      window.setTimeout(() => setCopied(false), 2600)
    } else {
      audio.play('error', 0.6)
      notify('Copy nahi ho paya — browser ne block kar diya. Manual chuno, please.', 'error')
    }
  }

  const shown = fullText.slice(0, typed)
  const isOpen = stage === 'typing' || stage === 'done'

  return (
    <section className={`section letter ${standalone ? 'letter--standalone' : ''}`} id="letter" aria-labelledby="letter-title">
      <div className="section__inner">
        {!standalone && (
          <header className="letter__head">
            <p className="section__eyebrow">
              <Sparkles size={14} aria-hidden="true" /> A letter from Dudu
            </p>
            <h2 className="section__title" id="letter-title">
              To my Darling Begum, RAI&hellip; 💗
            </h2>
            <p className="section__lede">
              Ek chhoti si par dil se likhi hui letter. Envelope kholo aur padh lo — jab mann kare.
            </p>
          </header>
        )}

        <div className="letter__stage">
          <AnimatePresence mode="wait">
            {stage === 'sealed' && (
              <motion.div
                key="sealed"
                className="envelope"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <button type="button" className="envelope__btn" onClick={openEnvelope} data-autofocus>
                  <span className="envelope__flap" aria-hidden="true" />
                  <span className="envelope__body" aria-hidden="true" />
                  <span className="envelope__seal" aria-hidden="true">
                    💗
                  </span>
                  <span className="envelope__cta">
                    <MailOpen size={18} aria-hidden="true" /> Envelope kholo
                  </span>
                </button>
              </motion.div>
            )}

            {stage === 'opening' && (
              <motion.div
                key="opening"
                className="envelope envelope--opening"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0.6, scale: 0.96 }}
                exit={{ opacity: 0 }}
              >
                <span className="envelope__flap envelope__flap--open" aria-hidden="true" />
                <span className="envelope__body" aria-hidden="true" />
                <span className="envelope__cta">Khol raha hoon… ✨</span>
              </motion.div>
            )}

            {isOpen && (
              <motion.div
                key="open"
                className="letter__paper glass glass--strong"
                initial={{ opacity: 0, y: 40, rotateX: -12 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ type: 'spring', stiffness: 160, damping: 20 }}
              >
                <div className="letter__paper-inner">
                  {LETTER_PARAGRAPHS.map((paragraph, index) => {
                    const start = LETTER_PARAGRAPHS.slice(0, index).reduce((acc, p) => acc + p.text.length + 2, 0)
                    const visible = shown.slice(start)
                    const isCurrent = start <= typed && typed < start + paragraph.text.length + 2
                    if (!visible) return null
                    return (
                      <p
                        key={index}
                        className={`letter__para letter__para--${paragraph.type} ${isCurrent ? 'is-typing' : ''}`}
                      >
                        {visible}
                        {isCurrent && <span className="letter__caret" aria-hidden="true" />}
                      </p>
                    )
                  })}
                </div>

                <div className="letter__actions">
                  {stage === 'typing' && (
                    <button type="button" className="btn btn--soft btn--sm" onClick={skip}>
                      Skip ▸▸
                    </button>
                  )}
                  <button type="button" className="btn btn--soft btn--sm" onClick={copy}>
                    {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                    {copied ? 'Copied!' : 'Copy message'}
                  </button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={replay}>
                    <RotateCcw size={14} aria-hidden="true" /> Replay
                  </button>
                  {!standalone && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={close}>
                      <X size={14} aria-hidden="true" /> Close
                    </button>
                  )}
                </div>

                <span className="letter__scribble" aria-hidden="true">
                  💌
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!standalone && (
          <GlassPanel className="letter__aside">
            <Sticker media="night" className="letter__art" decorative />
            <p>
              <strong>Note:</strong> yeh letter screen pe hai, haath mein nahi — par har lafz sach hai. Aur jab tum
              isse padh rahi ho, toh Dudu tumse kuch kehna chahta hai:{' '}
              <em>&ldquo;Tu sach mein meri sabse pyaari Sweetheart ho.&rdquo;</em> 💗
            </p>
          </GlassPanel>
        )}
      </div>
    </section>
  )
}
