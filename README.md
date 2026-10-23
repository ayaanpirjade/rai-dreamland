# RAI 💗 · A Little Birthday Dreamland

A tiny kawaii birthday world built with **React + Vite + Three.js** — Bubu (white, RAI),
Dudu (honey-brown, Ayaan), a cake, five mini-games, surprises and a letter.

## 🌐 Live

**https://ayaanpirjade.github.io/rai-dreamland/**

## Local development

```bash
npm install
npm run dev          # http://127.0.0.1:5173
```

## Build & deploy

The site is hosted on **GitHub Pages** from the `gh-pages` branch.

```bash
npm run deploy       # builds with /rai-dreamland/ base, then pushes dist → gh-pages
```

`npm run build:pages` only builds (`dist/`) without pushing, and
`npm run preview:pages` serves that build locally at
<http://127.0.0.1:4173/rai-dreamland/> so you can check sub-path URLs before deploying.

`scripts/postbuild.mjs` copies `index.html` → `404.html` (so deep links such as
`/rai-dreamland/letter` work on Pages) and drops `.nojekyll`.

## Project layout

```
src/
  sections/     page sections (Home, BearWorld, Birthday, MiniGames, Surprises, Letter)
  scenes/       React Three Fiber scenes (bears, cake, gift, games)
  three/        shared geometry, textures, bear + cake models
  games/        CatchHearts, FindDudu, MemoryMatch, HeartMaze, CakeDecorator
  data/         media registry, letter + surprise copy
public/media/   Bubu & Dudu artwork (built by scripts/build-media.mjs)
```

## Artwork

All bear art in `public/media/` comes from the original files in `assets/source/`,
cropped and optimised by `scripts/build-media.mjs` (`sharp`).

- **Bubu** — white bear, pink bow → RAI
- **Dudu** — honey-brown bear, bow tie → Ayaan

Made with a lot of pink for RAI's birthday on **24 October**. 🎂
