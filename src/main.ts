// Composition root: creates the state, builds the interface, wires input,
// and starts the loop. Game rules live in game/, display code in ui/, and
// this file only connects them.

// Vite turns this import into a production-safe URL. Keep it as a file so
// assets deploy separately, exactly like the game bundle.
// @deno-types="./asset-url.d.ts"
import faviconUrl from "./assets/favicon.svg?no-inline";

import { startGameLoop } from "./game/loop.ts";
import { clickPower, passiveRate } from "./game/production.ts";
import { addHoney, createInitialState, purchase } from "./game/state.ts";
import { buildUi } from "./ui/hud.ts";

const app = document.querySelector<HTMLElement>("#app")!;

// The browser tab gets a honeycomb mark from the deployed asset.
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/svg+xml";
favicon.href = faviconUrl;
document.head.append(favicon);

const state = createInitialState();

const hud = buildUi(app, state, {
  onHarvest: () => {
    const gain = clickPower(state);
    addHoney(state, gain);
    return gain;
  },
  onBuy: (def) => purchase(state, def),
});

// The bees work on their own: the passive rate applies to elapsed seconds,
// whatever the frame rate. Clicks land between frames through onHarvest.
startGameLoop((elapsedSeconds) => {
  addHoney(state, passiveRate(state) * elapsedSeconds);
  hud.refresh();
});
