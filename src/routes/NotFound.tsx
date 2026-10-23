import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, Search } from 'lucide-react'

import { Layout } from '../components/Layout/Layout'
import { GlassPanel } from '../components/GlassPanel/GlassPanel'
import { BrandMark } from '../components/Brand/BrandMark'
import { Sticker } from '../components/Media/Sticker'

/** Cute 404: a lost little bear who really wants to go home. */
export function NotFound() {
  const navigate = useNavigate()

  return (
    <Layout plain>
      <section className="section notfound">
        <div className="section__inner notfound__inner">
          <motion.div
            className="notfound__card glass glass--strong"
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="notfound__bear" aria-hidden="true">
              <Sticker media="bubu" decorative />
            </span>
            <p className="section__eyebrow">
              <Search size={14} aria-hidden="true" /> 404
            </p>
            <h1 className="notfound__title">Oops! Dudu is page par kho gaya</h1>
            <p className="notfound__copy">
              Yeh page dreamland mein exist hi nahi karta. Shayad Bubu ne bhool se khidki khol di? Wapas apne ghar
              chale chalo — wahan cake, games aur surprises sab intezaar kar rahe hain.
            </p>

            <div className="notfound__actions">
              <button type="button" className="btn btn--primary btn--lg" onClick={() => navigate('/')}>
                <Home size={18} aria-hidden="true" /> Ghar jaao
              </button>
              <Link className="btn btn--soft btn--lg" to="/letter">
                <ArrowLeft size={18} aria-hidden="true" /> Letter padho
              </Link>
            </div>

            <GlassPanel className="notfound__hint">
              <BrandMark size={26} />
              <span>RAI ka birthday dreamland &middot; 24 October</span>
            </GlassPanel>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}
