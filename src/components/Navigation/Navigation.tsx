import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

import { BrandMark } from '../Brand/BrandMark'
import { AudioControls } from '../AudioControls/AudioControls'
import { useScrollSpy } from '../../hooks/useScrollSpy'
import { useToast } from '../../hooks/useToast'

export interface NavItem {
  id: string
  label: string
  short: string
  emoji: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', short: 'Home', emoji: '🏠' },
  { id: 'bears', label: 'Our Bear World', short: 'Bears', emoji: '🧸' },
  { id: 'cake', label: 'Birthday Cake', short: 'Cake', emoji: '🎂' },
  { id: 'games', label: 'Mini-Games', short: 'Games', emoji: '🎀' },
  { id: 'surprises', label: 'Surprises', short: 'Surprises', emoji: '✨' },
]

const SECTION_IDS = NAV_ITEMS.map((item) => item.id)

const SECTION_TITLES: Record<string, string> = {
  home: "RAI 💗 · A Little Birthday Dreamland",
  bears: "Bubu × Dudu · RAI's Bear World",
  cake: "Birthday Cake · RAI 💗",
  games: "Mini-Games · RAI 💗",
  surprises: "Surprises · RAI 💗",
}

/** Smooth-scroll helper that also works when we are not on the home route. */
export function useSectionNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(
    (id: string) => {
      const element = document.getElementById(id)
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: id } })
        return
      }
      if (element) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        element.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
        window.history.replaceState(null, '', `#${id}`)
      }
    },
    [location.pathname, navigate],
  )
}

export function Navigation() {
  const [open, setOpen] = useState(false)
  const goTo = useSectionNav()
  const location = useLocation()
  const navigate = useNavigate()
  const { notify } = useToast()

  const active = useScrollSpy(SECTION_IDS, location.pathname === '/' ? (id) => SECTION_TITLES[id] : undefined)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open)
    return () => document.body.classList.remove('no-scroll')
  }, [open])

  const handleNav = (id: string) => {
    setOpen(false)
    goTo(id)
  }

  const isLetterRoute = location.pathname.startsWith('/letter')

  return (
    <header className="nav-wrap">
      <nav className="nav glass glass--strong" aria-label="Main navigation">
        <button
          type="button"
          className="nav__brand"
          onClick={() => {
            setOpen(false)
            if (location.pathname !== '/') {
              navigate('/')
            } else {
              goTo('home')
            }
          }}
          aria-label="Go to the top of the page"
        >
          <BrandMark size={36} />
          <span className="nav__brand-text">
            <strong>RAI</strong>
            <small>24 October</small>
          </span>
        </button>

        <ul className="nav__links" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`nav__link ${active === item.id && !isLetterRoute ? 'is-active' : ''}`}
                onClick={() => handleNav(item.id)}
                aria-current={active === item.id && !isLetterRoute ? 'true' : undefined}
              >
                <span aria-hidden="true">{item.emoji}</span>
                <span className="nav__link-label">{item.label}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={`nav__link ${isLetterRoute ? 'is-active' : ''}`}
              onClick={() => {
                setOpen(false)
                navigate('/letter')
              }}
              aria-current={isLetterRoute ? 'page' : undefined}
            >
              <span aria-hidden="true">💌</span>
              <span className="nav__link-label">Birthday Letter</span>
            </button>
          </li>
        </ul>

        <div className="nav__tools">
          <AudioControls variant="compact" />
          <button
            type="button"
            className="nav__burger"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="nav__mobile glass"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="nav__mobile-list" role="list">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`nav__mobile-link ${active === item.id && !isLetterRoute ? 'is-active' : ''}`}
                    onClick={() => handleNav(item.id)}
                  >
                    <span className="nav__mobile-emoji" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className={`nav__mobile-link ${isLetterRoute ? 'is-active' : ''}`}
                  onClick={() => {
                    setOpen(false)
                    navigate('/letter')
                  }}
                >
                  <span className="nav__mobile-emoji" aria-hidden="true">
                    💌
                  </span>
                  <span>Birthday Letter</span>
                </button>
              </li>
            </ul>
            <div className="nav__mobile-footer">
              <AudioControls variant="full" />
              <p className="nav__mobile-note">
                Made with 💗 by Ayaan for RAI&rsquo;s birthday on 24 October.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        className="nav__top-fab"
        onClick={() => {
          goTo('home')
          notify('Back to the top of the dreamland ✨', 'info')
        }}
        aria-label="Back to the top"
      >
        ↑
      </button>
    </header>
  )
}
