import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'

import { audio } from '../../lib/audio'
import { shuffle } from '../../lib/utils'
import { useToast } from '../../hooks/useToast'
import { GlassPanel } from '../../components/GlassPanel/GlassPanel'

const SYMBOLS = ['🧸', '💗', '🎂', '🌸', '🎁', '⭐'] as const

interface Card {
  id: number
  symbol: string
  flipped: boolean
  matched: boolean
}

export function MemoryMatch() {
  const [cards, setCards] = useState<Card[]>([])
  const [moves, setMoves] = useState(0)
  const [flipped, setFlipped] = useState<number[]>([])
  const [locked, setLocked] = useState(false)
  const [won, setWon] = useState(false)
  const { notify } = useToast()

  const deal = useCallback(() => {
    const doubled = [...SYMBOLS, ...SYMBOLS]
    const deck = shuffle(doubled).map((symbol, index) => ({
      id: index,
      symbol,
      flipped: false,
      matched: false,
    }))
    setCards(deck)
    setMoves(0)
    setFlipped([])
    setLocked(false)
    setWon(false)
  }, [])

  useEffect(() => {
    deal()
  }, [deal])

  const matchedCount = useMemo(() => cards.filter((c) => c.matched).length, [cards])

  const flip = useCallback(
    (id: number) => {
      if (locked || won) return
      const card = cards.find((c) => c.id === id)
      if (!card || card.flipped || card.matched) return

      setFlipped((prev) => [...prev, id])
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)))
      audio.play('bell', 0.7)

      if (flipped.length === 1) {
        const first = cards.find((c) => c.id === flipped[0])
        if (first && first.symbol === card.symbol) {
          // matched
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) => (c.id === id || c.id === first.id ? { ...c, flipped: true, matched: true } : c)),
            )
            setFlipped([])
            setMoves((m) => m + 1)
            audio.play('sparkle', 0.7)
          }, 420)
        } else {
          setMoves((m) => m + 1)
          setLocked(true)
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) => (c.id === id || c.id === first?.id ? { ...c, flipped: false } : c)),
            )
            setFlipped([])
            setLocked(false)
          }, 820)
        }
      }
    },
    [cards, flipped, locked, won],
  )

  useEffect(() => {
    if (cards.length === 0) return
    if (matchedCount === cards.length && cards.length > 0) {
      setWon(true)
      audio.play('success')
      notify('Saari pairs mil gayi! 🎀 Bahut khoobsurat!', 'success')
    }
  }, [matchedCount, cards.length, notify])

  return (
    <div className="game game--memory">
      <div className="game__hud">
        <div className="game__stat">
          <span>
            Pairs <strong>{matchedCount / 2}/{SYMBOLS.length}</strong>
          </span>
        </div>
        <div className="game__stat">
          <span>
            Moves <strong>{moves}</strong>
          </span>
        </div>
        <button type="button" className="btn btn--sm btn--soft" onClick={deal}>
          <RotateCcw size={14} aria-hidden="true" /> New round
        </button>
      </div>

      <p className="game__goal">
        {won
          ? 'You did it! Every cute thing found its partner 💗'
          : 'Do cards match? Tap two at a time and find all six pairs.'}
      </p>

      <div className="memory-grid" role="grid" aria-label="Memory matching cards">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            type="button"
            role="gridcell"
            className={`memory-card ${card.flipped || card.matched ? 'is-flipped' : ''} ${card.matched ? 'is-matched' : ''}`}
            onClick={() => flip(card.id)}
            disabled={card.matched || locked}
            aria-label={card.flipped || card.matched ? `Card showing ${card.symbol}` : 'Hidden card'}
            whileTap={{ scale: 0.94 }}
          >
            <span className="memory-card__inner">
              <span className="memory-card__face memory-card__face--back" aria-hidden="true">
                🎀
              </span>
              <span className="memory-card__face memory-card__face--front" aria-hidden="true">
                {card.symbol}
              </span>
            </span>
          </motion.button>
        ))}
      </div>

      {won && (
        <GlassPanel className="game__win">
          <strong>Perfect match! 🧸</strong>
          <span>
            {moves} moves mein sab pairs mil gaye. RAI ke liye taali bajti hai!
          </span>
          <button type="button" className="btn btn--primary btn--sm" onClick={deal}>
            <RotateCcw size={14} aria-hidden="true" /> Play again
          </button>
        </GlassPanel>
      )}
    </div>
  )
}
