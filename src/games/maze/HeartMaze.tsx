import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw } from 'lucide-react'

import { SceneCanvas } from '../../components/ThreeCanvas'
import { HeartMazeScene } from '../../scenes/HeartMaze/HeartMazeScene'
import { buildHeartMaze, canMove } from './maze'
import { audio } from '../../lib/audio'
import { useToast } from '../../hooks/useToast'
import { GlassPanel } from '../../components/GlassPanel/GlassPanel'

export function HeartMaze() {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000))
  const maze = useMemo(() => buildHeartMaze(11, seed), [seed])
  const [position, setPosition] = useState({ x: maze.start.x, y: maze.start.y })
  const [won, setWon] = useState(false)
  const [moves, setMoves] = useState(0)
  const { notify } = useToast()

  const maxDistance = useMemo(() => {
    let max = 0
    maze.distance.forEach((d) => {
      if (d > max) max = d
    })
    return max
  }, [maze])

  const currentDistance = maze.distance.get(`${position.x},${position.y}`) ?? 0

  const move = useCallback(
    (dx: number, dy: number) => {
      if (won) return
      setPosition((prev) => {
        if (!canMove(maze, prev, dx, dy)) {
          audio.play('error', 0.35)
          return prev
        }
        audio.play('pop', 0.45)
        setMoves((m) => m + 1)
        const next = { x: prev.x + dx, y: prev.y + dy }
        if (next.x === maze.goal.x && next.y === maze.goal.y) {
          setWon(true)
          audio.play('success')
          notify('Bubu ne Dudu tak pahunch hi liya! 💗', 'success')
        }
        return next
      })
    },
    [maze, won, notify],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault()
          move(0, 1)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault()
          move(0, -1)
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault()
          move(-1, 0)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault()
          move(1, 0)
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  const restart = () => {
    const nextSeed = Math.floor(Math.random() * 100000)
    setSeed(nextSeed)
    const nextMaze = buildHeartMaze(11, nextSeed)
    setPosition({ x: nextMaze.start.x, y: nextMaze.start.y })
    setWon(false)
    setMoves(0)
    audio.play('chime')
  }

  return (
    <div className="game game--maze">
      <div className="game__hud">
        <div className="game__stat">
          <span>
            Moves <strong>{moves}</strong>
          </span>
        </div>
        <div className="game__stat">
          <span>
            Progress <strong>{currentDistance}/{maxDistance}</strong>
          </span>
        </div>
        <button type="button" className="btn btn--sm btn--soft" onClick={restart}>
          <RotateCcw size={14} aria-hidden="true" /> New maze
        </button>
      </div>

      <p className="game__goal">
        Bubu ko Dudu tak pahunchana hai! Arrow keys, WASD ya neeche ke buttons use karo.
      </p>

      <div className="maze-layout">
        <div className="maze-stage">
          <SceneCanvas cameraPosition={[0, 9.4, 7.6]} cameraFov={42} className="maze-canvas">
            <HeartMazeScene seed={seed} position={position} won={won} onReachGoal={() => setWon(true)} />
          </SceneCanvas>
          {won && (
            <div className="maze-win" role="status">
              <span aria-hidden="true">💗</span>
              <strong>Mil gaye!</strong>
              <p>Bubu ne dil ka raasta chuna, aur Dudu uska intezaar kar raha tha.</p>
              <button type="button" className="btn btn--primary btn--sm" onClick={restart}>
                <RotateCcw size={14} aria-hidden="true" /> New maze
              </button>
            </div>
          )}
        </div>

        <GlassPanel className="maze-pad">
          <span className="maze-pad__label">Bubu ko chalwao</span>
          <div className="maze-pad__grid">
            <button type="button" className="maze-pad__btn" onClick={() => move(0, 1)} aria-label="Move up">
              <ArrowUp size={18} aria-hidden="true" />
            </button>
            <button type="button" className="maze-pad__btn" onClick={() => move(-1, 0)} aria-label="Move left">
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button type="button" className="maze-pad__btn" onClick={() => move(0, -1)} aria-label="Move down">
              <ArrowDown size={18} aria-hidden="true" />
            </button>
            <button type="button" className="maze-pad__btn" onClick={() => move(1, 0)} aria-label="Move right">
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
