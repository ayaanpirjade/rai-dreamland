import { motion } from 'framer-motion'
import { ArrowRight, CalendarHeart, Cake, Gamepad2, Gift, PawPrint, Sparkles } from 'lucide-react'

import { GlassPanel } from '../../components/GlassPanel/GlassPanel'
import { Sticker } from '../../components/Media/Sticker'
import { useSectionNav } from '../../components/Navigation/Navigation'
import { daysUntilBirthday, isBirthdayToday } from '../../lib/utils'

const TOUR = [
  {
    id: 'bears',
    emoji: '🧸',
    media: 'bubuBow',
    title: 'Our Bear World',
    copy: 'Bubu aur Dudu ka apna chhota sa love story — click karo, kuch naya milega.',
    accent: 'pink',
  },
  {
    id: 'cake',
    emoji: '🎂',
    media: 'candle',
    title: 'Birthday Cake',
    copy: 'Pastel cake, jalte candles aur ek badi si celebration — MAKE A WISH!',
    accent: 'lavender',
  },
  {
    id: 'games',
    emoji: '🎀',
    media: 'room',
    title: 'Mini-Games',
    copy: 'Chaar khoobsurat games: hearts pakdo, Dudu dhoondo, pairs milao, cake sajao.',
    accent: 'blue',
  },
  {
    id: 'surprises',
    emoji: '✨',
    media: 'night',
    title: 'Surprises',
    copy: 'Paanch chhote surprises jo sirf tumhare liye banaye gaye hain.',
    accent: 'peach',
  },
] as const

export function Home() {
  const goTo = useSectionNav()
  const today = isBirthdayToday(10, 24)
  const days = daysUntilBirthday(10, 24)

  return (
    <section className="section home" id="home" aria-labelledby="home-title">
      <div className="section__inner">
        <motion.div
          className="home__hero glass glass--strong"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="home__hero-text">
            <p className="section__eyebrow">
              <Sparkles size={14} aria-hidden="true" /> 24 October &middot; Ayaan se RAI ke liye
            </p>
            <h1 className="home__title" id="home-title">
              <span className="home__title-kicker">RAI, meri</span>
              <span className="home__title-line">
                <span className="home__title-script">Darling Begum</span>
                <span className="home__title-heart" aria-hidden="true">
                  💗
                </span>
              </span>
            </h1>
            <p className="home__lede">
              Duniya ke liye tum RAI ho, par mere liye tum meri sabse pyaari Sweetheart ho. Yeh chhoti si duniya
              maine tumhare liye banayi hai — pyaar se, thode se nonsense ke saath, aur bahut saare sparkles ke
              saath.
            </p>

            <div className="home__actions">
              <button type="button" className="btn btn--primary btn--lg" onClick={() => goTo('cake')}>
                <Cake size={18} aria-hidden="true" /> Make a wish
              </button>
              <button type="button" className="btn btn--soft btn--lg" onClick={() => goTo('bears')}>
                <PawPrint size={18} aria-hidden="true" /> Meet Bubu &amp; Dudu
              </button>
            </div>

            <div className="home__facts">
              <span className="home__fact">
                <CalendarHeart size={15} aria-hidden="true" /> 24 October
              </span>
              <span className="home__fact">
                <Gift size={15} aria-hidden="true" /> From Dudu, with love
              </span>
              <span className="home__fact">
                <Gamepad2 size={15} aria-hidden="true" /> 5 playable games
              </span>
            </div>

            {today ? (
              <p className="home__countdown home__countdown--today">Aaj hi toh hai! Happy Birthday, RAI! 🎉</p>
            ) : (
              <p className="home__countdown">
                Birthday <strong>24 October</strong> &middot; {days} din baaki ✨
              </p>
            )}
          </div>

          <div className="home__hero-art">
            <div className="home__orb home__orb--1" />
            <div className="home__orb home__orb--2" />
            <div className="home__orb home__orb--3" />

            <span className="home__spark home__spark--1" aria-hidden="true">
              ✨
            </span>
            <span className="home__spark home__spark--2" aria-hidden="true">
              ⭐
            </span>

            <figure className="sticker-frame home__hero-frame">
              <Sticker media="party" decorative eager />
              <figcaption className="home__hero-caption">
                <span>24 October</span>
                <span className="home__hero-caption-dot" aria-hidden="true">
                  ♥
                </span>
                <span>Bubu &amp; Dudu</span>
              </figcaption>
            </figure>

            <div className="home__pals">
              <Sticker media="bubu" className="home__pal home__pal--bubu" decorative eager />
              <span className="home__pal-heart" aria-hidden="true">
                💗
              </span>
              <Sticker media="dudu" className="home__pal home__pal--dudu" decorative eager />
            </div>
          </div>
        </motion.div>

        <div className="home__tour">
          {TOUR.map((card, index) => (
            <motion.button
              key={card.id}
              type="button"
              className={`tour-card glass tour-card--${card.accent}`}
              onClick={() => goTo(card.id)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <span className="tour-card__emoji" aria-hidden="true">
                {card.emoji}
              </span>
              <Sticker media={card.media} className="tour-card__art" decorative />
              <span className="tour-card__title">{card.title}</span>
              <span className="tour-card__copy">{card.copy}</span>
              <span className="tour-card__cta">
                Chalo andar <ArrowRight size={15} aria-hidden="true" />
              </span>
            </motion.button>
          ))}
        </div>

        <GlassPanel className="home__note">
          <p>
            <strong>Chhota sa disclaimer:</strong> yeh website ek digital gift hai — ismein koi asli cake, asli gift
            box ya asli hug nahi hai. Bas pyaar asli hai. 💗
          </p>
        </GlassPanel>
      </div>
    </section>
  )
}
