// Builds the whole interface once, then mirrors state into it on refresh.
// The HUD knows how to show the apiary and relays input; it never changes
// game state. Shop cards are generated from the shared upgrade table, so
// each new entry in that table appears here automatically.

import { upgradeCost, type UpgradeDef, UPGRADES } from "../game/upgrades.ts";
import { canAfford, countOwned, type GameState } from "../game/state.ts";
import { clickPower, passiveRate } from "../game/production.ts";
import { formatHoney, formatNumber } from "../game/format.ts";
import { createHive } from "./hive.ts";

export interface Hud {
  refresh(): void;
}

export interface HudCallbacks {
  /** Applies a hand harvest and returns how much honey it yielded. */
  onHarvest(): number;
  /** Applies a purchase; the HUD refreshes either way. */
  onBuy(def: UpgradeDef): void;
}

export function buildUi(
  root: HTMLElement,
  state: GameState,
  callbacks: HudCallbacks,
): Hud {
  const header = document.createElement("header");
  const heading = document.createElement("h1");
  heading.textContent = "🐝 Apiary";
  const tagline = document.createElement("p");
  tagline.className = "tagline";
  tagline.textContent = "Tend the hive. Bottle the gold.";
  header.append(heading, tagline);

  const honeyDisplay = document.createElement("p");
  honeyDisplay.id = "honey-display";
  honeyDisplay.className = "honey";

  const hive = createHive();
  hive.button.addEventListener("click", () => {
    hive.float(callbacks.onHarvest());
    refresh();
  });

  const rateDisplay = document.createElement("p");
  rateDisplay.id = "rate-display";
  rateDisplay.className = "rate";

  const shop = document.createElement("section");
  shop.className = "shop";
  shop.ariaLabel = "Upgrades";
  const shopHeading = document.createElement("h2");
  shopHeading.textContent = "Upgrades";
  const shopGrid = document.createElement("div");
  shopGrid.className = "shop-grid";
  shop.append(shopHeading, shopGrid);

  // One card per table entry — no per-item wiring anywhere.
  const cards = UPGRADES.map((def) => {
    const card = document.createElement("article");
    card.className = "shop-card";

    const cardHeading = document.createElement("h3");
    cardHeading.textContent = `${def.icon} ${def.name}`;
    const cardDescription = document.createElement("p");
    cardDescription.textContent = def.description;
    const cardInfo = document.createElement("p");
    cardInfo.className = "upgrade-info";

    const buyButton = document.createElement("button");
    buyButton.textContent = `Buy ${def.name.toLowerCase()}`;
    buyButton.addEventListener("click", () => {
      callbacks.onBuy(def);
      refresh();
    });

    card.append(cardHeading, cardDescription, cardInfo, buyButton);
    shopGrid.append(card);
    return { def, info: cardInfo, button: buyButton, card };
  });

  function refresh(): void {
    honeyDisplay.textContent = `Honey: ${formatHoney(state.honey)} g`;
    rateDisplay.textContent = `Your bees make +${
      formatNumber(passiveRate(state))
    } g/s · each harvest brings +${formatNumber(clickPower(state))} g`;

    for (const { def, info, button, card } of cards) {
      const owned = countOwned(state, def.id);
      const cost = upgradeCost(def, owned);
      const affordable = canAfford(state, def);
      info.textContent = `Cost: ${cost.toLocaleString()} g · Owned: ${owned}`;
      button.disabled = !affordable;
      card.dataset.affordable = String(affordable);
    }
  }

  refresh();
  root.append(header, honeyDisplay, hive.button, rateDisplay, shop);
  return { refresh };
}
