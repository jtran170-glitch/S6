// Derives production from state by walking the upgrade table. Effects are
// data: every "flat" entry adds its amount per owned copy, every "mult"
// entry compounds per owned copy. A new upgrade kind of data starts
// working here with no new code path per item.

import { UPGRADES } from "./upgrades.ts";
import { countOwned, type GameState } from "./state.ts";

// What you have before buying anything: two bare hands and a starter
// colony that keeps a trickle of honey flowing.
const HAND_YIELD = 1;
const COLONY_RATE = 1;

export function clickPower(state: GameState): number {
  let flat = HAND_YIELD;
  let mult = 1;
  for (const def of UPGRADES) {
    const owned = countOwned(state, def.id);
    if (owned === 0) continue;
    const effect = def.effect;
    if (effect.kind === "clickFlat") flat += effect.amount * owned;
    if (effect.kind === "clickMult") mult *= effect.amount ** owned;
  }
  return flat * mult;
}

export function passiveRate(state: GameState): number {
  let flat = COLONY_RATE;
  let mult = 1;
  for (const def of UPGRADES) {
    const owned = countOwned(state, def.id);
    if (owned === 0) continue;
    const effect = def.effect;
    if (effect.kind === "passiveFlat") flat += effect.amount * owned;
    if (effect.kind === "passiveMult") mult *= effect.amount ** owned;
  }
  return flat * mult;
}
