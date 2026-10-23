import type { ReactNode } from 'react'

import { Navigation } from '../Navigation/Navigation'
import { Footer } from '../Footer/Footer'
import { Wallpaper } from '../Wallpaper/Wallpaper'

interface LayoutProps {
  children: ReactNode
  /** Hide the decorative wallpaper (used by the 404 page for a calmer layout). */
  plain?: boolean
}

export function Layout({ children, plain = false }: LayoutProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {!plain && <Wallpaper />}

      <Navigation />

      <main id="main" className="app-main">
        {children}
      </main>

      <Footer />
    </div>
  )
}
