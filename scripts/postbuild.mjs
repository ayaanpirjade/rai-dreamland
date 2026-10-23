import { copyFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')

/**
 * GitHub Pages answers unknown paths with `404.html` and keeps the original URL
 * in the address bar. Serving a copy of the SPA shell there means a direct hit
 * on `/rai-dreamland/letter` boots the app and React Router renders that route
 * instead of a dead 404.
 */
await copyFile(join(dist, 'index.html'), join(dist, '404.html'))

// Stop Jekyll from swallowing files that start with an underscore.
await writeFile(join(dist, '.nojekyll'), '')

console.log('✔ postbuild: 404.html + .nojekyll written')
