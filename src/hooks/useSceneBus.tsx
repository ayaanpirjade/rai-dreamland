import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * A tiny event bus that lets DOM sections poke the 3D scenes
 * (e.g. "A Little Hug" makes Bubu hug Dudu in the bear world).
 */
interface SceneBusValue {
  hugToken: number
  heartBurstToken: number
  celebrateToken: number
  triggerHug: () => void
  triggerHeartBurst: () => void
  triggerCelebrate: () => void
}

const SceneBusContext = createContext<SceneBusValue | null>(null)

export function SceneBusProvider({ children }: { children: ReactNode }) {
  const [hugToken, setHugToken] = useState(0)
  const [heartBurstToken, setHeartBurstToken] = useState(0)
  const [celebrateToken, setCelebrateToken] = useState(0)

  const triggerHug = useCallback(() => setHugToken((n) => n + 1), [])
  const triggerHeartBurst = useCallback(() => setHeartBurstToken((n) => n + 1), [])
  const triggerCelebrate = useCallback(() => setCelebrateToken((n) => n + 1), [])

  const value = useMemo(
    () => ({
      hugToken,
      heartBurstToken,
      celebrateToken,
      triggerHug,
      triggerHeartBurst,
      triggerCelebrate,
    }),
    [hugToken, heartBurstToken, celebrateToken, triggerHug, triggerHeartBurst, triggerCelebrate],
  )

  return <SceneBusContext.Provider value={value}>{children}</SceneBusContext.Provider>
}

export function useSceneBus() {
  const ctx = useContext(SceneBusContext)
  if (!ctx) throw new Error('useSceneBus must be used inside <SceneBusProvider>')
  return ctx
}
