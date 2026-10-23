/**
 * Publishes the production build to the `gh-pages` branch.
 *
 * GitHub Pages then serves it from
 * https://ayaanpirjade.github.io/rai-dreamland/
 *
 * Usage:  npm run deploy      (builds first, then pushes `dist`)
 */
import { execFileSync, execSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')

const git = (args, cwd = root) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()

execSync('npm run build:pages', { cwd: root, stdio: 'inherit' })

if (!existsSync(dist)) {
  console.error('✖ dist/ was not generated — build failed.')
  process.exit(1)
}

const remote = git(['remote', 'get-url', 'origin'])
const tmp = mkdtempSync(join(tmpdir(), 'rai-pages-'))
cpSync(dist, tmp, { recursive: true })
writeFileSync(join(tmp, '.nojekyll'), '')

const run = (args) => execFileSync('git', args, { cwd: tmp, stdio: 'inherit' })

run(['init', '-b', 'gh-pages'])
run(['add', '-A'])
run([
  '-c',
  'user.name=deploy-bot',
  '-c',
  'user.email=deploy-bot@users.noreply.github.com',
  'commit',
  '-m',
  `Deploy ${new Date().toISOString()}`,
])
run(['push', '--force', remote, 'gh-pages'])
rmSync(tmp, { recursive: true, force: true })

console.log('\n✔ Deployed → https://ayaanpirjade.github.io/rai-dreamland/')
