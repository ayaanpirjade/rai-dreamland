import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import { Layout } from './components/Layout/Layout'
import { Entrance } from './sections/Entrance/Entrance'
import { Home } from './sections/Home/Home'
import { BearWorld } from './sections/BearWorld/BearWorld'
import { Birthday } from './sections/Birthday/Birthday'
import { MiniGames } from './sections/MiniGames/MiniGames'
import { Surprises } from './sections/Surprises/Surprises'
import { BirthdayLetter } from './sections/BirthdayLetter/BirthdayLetter'
import { NotFound } from './routes/NotFound'
import { ToastProvider } from './hooks/useToast'
import { SceneBusProvider } from './hooks/useSceneBus'
import { readSession } from './lib/storage'

const INTRO_KEY = 'rai.intro.seen'

function HomePage() {
  const location = useLocation()
  const [showIntro, setShowIntro] = useState(() => !readSession(INTRO_KEY, false))

  // Handle "navigate to /#section" requests coming from other routes.
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null
    if (!state?.scrollTo) return
    const timer = window.setTimeout(() => {
      const element = document.getElementById(state.scrollTo as string)
      if (element) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        element.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
        window.history.replaceState(null, '', `#${state.scrollTo}`)
      }
    }, 260)
    return () => window.clearTimeout(timer)
  }, [location.state])

  return (
    <>
      {showIntro && (
        <Entrance
          onEntered={() => {
            setShowIntro(false)
          }}
        />
      )}

      <Layout>
        <Home />
        <BearWorld />
        <Birthday />
        <MiniGames />
        <Surprises />
        <BirthdayLetter />
      </Layout>
    </>
  )
}

function LetterPage() {
  useEffect(() => {
    document.title = "A Letter for RAI 💗 · RAI's Birthday Dreamland"
    return () => {
      document.title = "RAI 💗 · A Little Birthday Dreamland"
    }
  }, [])

  return (
    <Layout>
      <BirthdayLetter standalone />
    </Layout>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <SceneBusProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/letter" element={<LetterPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SceneBusProvider>
    </ToastProvider>
  )
}
