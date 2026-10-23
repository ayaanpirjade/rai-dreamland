/**
 * Resolves a path inside `public/` against the app's base URL.
 *
 * The site is deployed under a sub-path on GitHub Pages (`/rai-dreamland/`),
 * so hard-coded `/media/...` URLs would 404 there. Every public asset goes
 * through this helper instead, and it stays a no-op when the app is served
 * from the domain root (local dev, Vercel, a custom domain…).
 */
const BASE = import.meta.env.BASE_URL || '/'

export function asset(path: string) {
  return `${BASE.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}
