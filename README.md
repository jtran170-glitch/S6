# Apiary 🐝

A small incremental game built with TypeScript and Vite: click the hive to
harvest honey by hand, let your bees trickle honey out on their own, and
spend it on upgrades that change how the apiary grows.

## How to play

- **Click the hive** to harvest honey (measured in grams).
- Your starter colony produces **+1 g/s** on its own, updated every
  animation frame from elapsed time, so the rate is real seconds regardless
  of display frame rate.
- Buy upgrades in the shop. Each purchase raises that upgrade's price by
  its growth factor, so early buys stay cheap and repeats bite:

| Upgrade             | Effect                      | Base cost | Growth |
| ------------------- | --------------------------- | --------- | ------ |
| 💨 Smoker           | +2 g per hand harvest       | 20 g      | ×1.4   |
| 🐝 Worker bee       | +0.5 g/s                    | 25 g      | ×1.18  |
| 🌼 Wildflower patch | ×1.25 to all bee production | 300 g     | ×1.5   |
| 🍯 Honey press      | ×2 to hand-harvest yield    | 500 g     | ×2.4   |
| 👑 Queen bee        | ×2 to all bee production    | 2,500 g   | ×2.5   |
| 🪵 Cypress hive     | +12 g/s                     | 8,000 g   | ×1.3   |

## Development

Requires [Deno](https://docs.deno.com/runtime/getting_started/installation/).

```
deno task setup   # one-time: install the git pre-commit hook
deno task dev     # dev server with reload
deno task ci      # fmt + lint + type-check + production build
```

## Structure

All purchasable content lives in one table, `src/game/upgrades.ts`. The
shop UI, the cost math, and the production math walk that table
generically, so adding an upgrade is a data edit with no new logic:

- `src/game/state.ts` — the state shape and the only code that mutates it
- `src/game/production.ts` — derives click power and passive rate from state
- `src/game/loop.ts` — the requestAnimationFrame loop with elapsed time
- `src/game/format.ts` — shared number formatting
- `src/ui/hud.ts` — builds the interface and mirrors state into it
- `src/ui/hive.ts` — the hive button, its SVG art, and harvest feedback
- `src/main.ts` — composition root wiring it all together

## Credits

Tooling adapted from the [CMPM 121 Fall 2026 S01 starter](https://github.com/ucsc-cmpm-121-f26/s01-starter/tree/8974888efb6537be82e8eb069db139ea885039da), which has no explicit repository license. No new license is assigned to that material. The D1 scaffold was authored with OpenAI GPT-6 Astra assistance. Dependencies retain their respective licenses.
