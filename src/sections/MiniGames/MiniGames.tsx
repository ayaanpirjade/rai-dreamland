import { lazy, Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import { Gamepad2, Sparkles } from 'lucide-react'

import { CatchHearts } from '../../games/CatchHearts/CatchHearts'
import { FindDudu } from '../../games/FindDudu/FindDudu'
import { MemoryMatch } from '../../games/MemoryMatch/MemoryMatch'
import { LoadingScreen } from '../../components/LoadingScreen/LoadingScreen'

const CakeDecorator = lazy(() =>
  import('../../games/CakeDecorator/CakeDecorator').then((m) => ({ default: m.CakeDecorator })),
)
const HeartMaze = lazy(() =>
  import('../../games/maze/HeartMaze').then((m) => ({ default: m.HeartMaze })),
)

const GAMES = [
  { id: 'catch', label: 'Catch the Hearts', emoji: '💗', blurb: '30 seconds mein jitne hearts pakad sako!' },
  { id: 'find', label: 'Find Dudu', emoji: '🧸', blurb: 'Dudu chhupa hai — use dhoondho!' },
  { id: 'memory', label: 'Match Our Cute Things', emoji: '🎀', blurb: 'Saari jodiyan milao aur jeeto.' },
  { id: 'decorate', label: "Decorate RAI's Cake", emoji: '🎂', blurb: 'Apni pasand ka cake sajao.' },
  { id: 'maze', label: 'Heart Maze', emoji: '💞', blurb: 'Bubu ko Dudu tak pahunchao.' },
] as const

type GameId = (typeof GAMES)[number]['id']

export function MiniGames() {
  const [active, setActive] = useState<GameId>('catch')

  return (
    <section className="section minigames" id="games" aria-labelledby="games-title">
      <div className="section__inner">
        <header className="minigames__head">
          <p className="section__eyebrow">
            <Gamepad2 size={14} aria-hidden="true" /> Arcade
          </p>
          <h2 className="section__title" id="games-title">
            Mini-games for my favourite girl
          </h2>
          <p className="section__lede">
            Paanch asli playable games. Har ek ke apne rules hain, apni score hai aur apna win moment. Koi fake
            button nahi — sab kuch chalta hai. 🎮
          </p>
        </header>

        <div className="minigames__tabs" role="tablist" aria-label="Mini games">
          {GAMES.map((game) => (
            <button
              key={game.id}
              type="button"
              role="tab"
              id={`tab-${game.id}`}
              aria-selected={active === game.id}
              aria-controls={`panel-${game.id}`}
              tabIndex={active === game.id ? 0 : -1}
              className={`minigames__tab ${active === game.id ? 'is-active' : ''}`}
              onClick={() => setActive(game.id)}
              onKeyDown={(event) => {
                if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
                event.preventDefault()
                const index = GAMES.findIndex((g) => g.id === active)
                const delta = event.key === 'ArrowRight' ? 1 : -1
                const next = GAMES[(index + delta + GAMES.length) % GAMES.length]
                setActive(next.id)
                document.getElementById(`tab-${next.id}`)?.focus()
              }}
            >
              <span className="minigames__tab-emoji" aria-hidden="true">
                {game.emoji}
              </span>
              <span className="minigames__tab-label">{game.label}</span>
            </button>
          ))}
        </div>

        <div
          className="minigames__panel glass"
          role="tabpanel"
          id={`panel-${active}`}
          aria-labelledby={`tab-${active}`}
          tabIndex={0}
        >
          <motion.p className="minigames__blurb" key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Sparkles size={14} aria-hidden="true" /> {GAMES.find((g) => g.id === active)?.blurb}
          </motion.p>

          {active === 'catch' && <CatchHearts />}
          {active === 'find' && <FindDudu />}
          {active === 'memory' && <MemoryMatch />}
          {active === 'decorate' && (
            <Suspense fallback={<LoadingScreen message="Cake saja rahe hain…" />}>
              <CakeDecorator />
            </Suspense>
          )}
          {active === 'maze' && (
            <Suspense fallback={<LoadingScreen message="Maze ban raha hai…" />}>
              <HeartMaze />
            </Suspense>
          )}
        </div>
      </div>
    </section>
  )
}
