// All purchasable content lives in this one table. The shop UI, the
// economy, and the production math all read from it, so adding an upgrade
// is a data edit — no new logic appears anywhere else.

export type UpgradeEffect =
  | { kind: "clickFlat"; amount: number }
  | { kind: "clickMult"; amount: number }
  | { kind: "passiveFlat"; amount: number }
  | { kind: "passiveMult"; amount: number };

export interface UpgradeDef {
  id: string;
  name: string;
  icon: string;
  /** What changes, in game terms, plus why it fits the apiary. */
  description: string;
  baseCost: number;
  /** Next cost = ceil(baseCost * costGrowth ^ owned). */
  costGrowth: number;
  effect: UpgradeEffect;
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: "smoker",
    name: "Smoker",
    icon: "💨",
    description:
      "Cool puffs of smoke keep the colony calm while you work: +2 g per hand harvest.",
    baseCost: 20,
    costGrowth: 1.4,
    effect: { kind: "clickFlat", amount: 2 },
  },
  {
    id: "worker-bee",
    name: "Worker bee",
    icon: "🐝",
    description:
      "One more forager on the comb, working around the clock: +0.5 g/s.",
    baseCost: 25,
    costGrowth: 1.18,
    effect: { kind: "passiveFlat", amount: 0.5 },
  },
  {
    id: "honey-press",
    name: "Honey press",
    icon: "🍯",
    description: "Crush every comb twice as hard: hand-harvest yield ×2.",
    baseCost: 500,
    costGrowth: 2.4,
    effect: { kind: "clickMult", amount: 2 },
  },
];

/** The price of the next copy: base cost times growth^owned, whole grams. */
export function upgradeCost(def: UpgradeDef, owned: number): number {
  return Math.ceil(def.baseCost * def.costGrowth ** owned);
}
