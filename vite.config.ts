import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub Pages serves this project from `https://<user>.github.io/rai-dreamland/`,
 * so that build needs a matching `base`. Only `npm run build:pages` (mode
 * `ghpages`) gets the sub-path — local dev, preview and Vercel stay at the root.
 */
const PAGES_BASE = '/rai-dreamland/'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'ghpages' ? PAGES_BASE : '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          motion: ['framer-motion'],
        },
      },
    },
  },
}))
