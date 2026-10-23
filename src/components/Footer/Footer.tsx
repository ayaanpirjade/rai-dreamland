import { Link } from 'react-router-dom'

import { BrandMark } from '../Brand/BrandMark'
import { useSectionNav } from '../Navigation/Navigation'
import { NAV_ITEMS } from '../Navigation/Navigation'

export function Footer() {
  const goTo = useSectionNav()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <BrandMark size={44} />
          <div>
            <p className="footer__title">RAI&rsquo;s little dreamland</p>
            <p className="footer__tagline">
              Made with 💗 by Ayaan for RAI &middot; 24 October
            </p>
          </div>
        </div>

        <nav className="footer__links" aria-label="Footer navigation">
          <ul role="list">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => goTo(item.id)}>
                  {item.label}
                </button>
              </li>
            ))}
            <li>
              <Link to="/letter">Birthday Letter</Link>
            </li>
          </ul>
        </nav>

        <div className="footer__meta">
          <p>
            &copy; {year} Ayaan &amp; RAI. Sab kuch pyaar se banaya gaya hai.
          </p>
          <p className="footer__note">
            Yeh website koi personal data collect nahi karti, koi tracking nahi hai, aur sabhi audio effects browser
            mein hi live generate hote hain.
          </p>
        </div>
      </div>
    </footer>
  )
}
