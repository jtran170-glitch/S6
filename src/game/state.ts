// Owns the shape of the game state and the rules for changing it. This is
// the only module that touches state fields directly; everything else reads
// state or asks this module to change it.

import { upgradeCost, type UpgradeDef } from "./upgrades.ts";

export interface GameState {
  /** Honey on hand, in grams. Accrues fractionally. */
  honey: number;
  /** owned[upgradeId] = how many copies were bought. */
  owned: Record<string, number>;
}

export function createInitialState(): GameState {
  return { honey: 0, owned: {} };
}

export function countOwned(state: GameState, id: string): number {
  return state.owned[id] ?? 0;
}

/** Credits honey from any source — clicks, bees, future events. */
export function addHoney(state: GameState, amount: number): void {
  state.honey += amount;
}

export function canAfford(state: GameState, def: UpgradeDef): boolean {
  return state.honey >= upgradeCost(def, countOwned(state, def.id));
}

/** Deducts the current cost and banks the copy; refuses when too pricey. */
export function purchase(state: GameState, def: UpgradeDef): boolean {
  const cost = upgradeCost(def, countOwned(state, def.id));
  if (state.honey < cost) return false;
  state.honey -= cost;
  state.owned[def.id] = countOwned(state, def.id) + 1;
  return true;
}
