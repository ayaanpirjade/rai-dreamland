# Bubu × Dudu media

This folder holds the artwork used across the site.

## What is here

| File                       | Used by                                          |
| -------------------------- | ------------------------------------------------ |
| `bubu.webp` / `bubu.png`   | Bubu (white) with the blue striped party hat     |
| `dudu.webp` / `dudu.png`   | Dudu (honey-brown) with the red striped hat      |
| `bubu-bow.webp` / `.png`   | Bubu (white) with the pink bow                   |
| `dudu-bowtie.webp` / `.png`| Dudu (honey-brown) with the black bow tie        |
| `bubu-dudu-party.*`        | Both bears behind a **HAPPY BIRTHDAY** cake      |
| `bubu-dudu-candle.*`       | Both bears sharing a candle-lit cake             |
| `birthday-room.*`          | The birthday room with bunting and balloons      |
| `dudu-balloon.*`           | Dudu with a party hat and a polka-dot balloon    |
| `bubu-dudu-night.*`        | Dudu with a cake, Bubu with a present, moonlit   |

Each image is served as optimised **WebP** with a **PNG/JPEG** fallback, and
falls back to a friendly emoji if even that fails — the page never breaks.

## Adding animated GIFs

The site also looks for these optional files. Drop them straight in and they
appear automatically (no code change needed):

| File                  | Where it appears                        |
| --------------------- | --------------------------------------- |
| `bubu-wave.gif`       | "Open When You Smile" surprise          |
| `dudu-party.gif`      | "A Little Hug" surprise                 |
| `bubu-hug.gif`        | "A Little Hug" surprise                 |
| `heart-pop.gif`       | "A Thousand Tiny Hearts" surprise       |

If a GIF is missing, the matching still image is shown instead.

## Regenerating

The images are built from the originals in `assets/source/`:

```bash
node scripts/build-media.mjs
```

Requires `sharp` (a dev dependency). Edit the crop boxes in that script if
you want different framings.
