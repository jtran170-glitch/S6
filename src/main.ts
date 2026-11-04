// Vite turns this import into a production-safe URL. Keep it as a file so
// assets deploy separately, exactly like the game bundle.
// @deno-types="./asset-url.d.ts"
import faviconUrl from "./assets/favicon.svg?no-inline";

const app = document.querySelector<HTMLElement>("#app")!;

// The browser tab gets a honeycomb mark from the deployed asset.
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/svg+xml";
favicon.href = faviconUrl;
document.head.append(favicon);

// The resource. Honey is stored in grams, a real unit for an apiary.
let honeyGrams = 0;

// Upgrade counts, with base costs and how fast each price climbs per
// purchase. A cost multiplies by its growth factor every time you buy one
// more, so early purchases stay cheap and later ones bite.
let smokers = 0;
let workerBees = 0;
let honeyPresses = 0;

const SMOKER_BASE_COST = 20;
const SMOKER_GROWTH = 1.4;
const WORKER_BEE_BASE_COST = 25;
const WORKER_BEE_GROWTH = 1.18;
const HONEY_PRESS_BASE_COST = 500;
const HONEY_PRESS_GROWTH = 2.4;

// The price of the next purchase: base cost times growth^owned, rounded up
// so costs stay in whole grams.
function currentCost(baseCost: number, growth: number, owned: number): number {
  return Math.ceil(baseCost * growth ** owned);
}

// Your starter colony makes 1 g/s; each worker bee adds 0.5 g/s.
function passiveRate(): number {
  return 1 + 0.5 * workerBees;
}

// Each hand harvest: 1 g bare-handed, +2 g per smoker, doubled per press.
function clickGain(): number {
  return (1 + 2 * smokers) * 2 ** honeyPresses;
}

// Header: the game's name and what it is about.
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

// The hive itself is the main action: click it to harvest honey by hand.
// The skep (dome hive) is drawn inline; two bees drift around it.
const HIVE_SVG = `
<svg viewBox="0 0 200 200" aria-hidden="true">
  <ellipse cx="100" cy="172" rx="60" ry="9" fill="#7a4f21" opacity="0.22" />
  <g stroke="#8a5a2b" stroke-width="3">
    <path d="M70 58 A30 30 0 0 1 130 58 Z" fill="#f0b94f" />
    <rect x="62" y="56" width="76" height="32" rx="16" fill="#e2a23c" />
    <rect x="52" y="86" width="96" height="34" rx="17" fill="#f0b94f" />
    <rect x="44" y="118" width="112" height="34" rx="17" fill="#e2a23c" />
  </g>
  <circle cx="100" cy="25" r="5" fill="#8a5a2b" />
  <path d="M86 152 v-5 a14 14 0 0 1 28 0 v5 z" fill="#4a2c14" />
  <g class="bee bee-a">
    <ellipse cx="150" cy="66" rx="7" ry="5" fill="#ffcf40" stroke="#3b2c1a" stroke-width="1.5" />
    <path d="M146 64 h8 M146 68 h8" stroke="#3b2c1a" stroke-width="1.5" />
    <ellipse cx="147" cy="59" rx="4" ry="2.5" fill="#ffffff" opacity="0.85" />
    <ellipse cx="153" cy="59" rx="4" ry="2.5" fill="#ffffff" opacity="0.85" />
  </g>
  <g class="bee bee-b">
    <ellipse cx="40" cy="118" rx="7" ry="5" fill="#ffcf40" stroke="#3b2c1a" stroke-width="1.5" />
    <path d="M36 116 h8 M36 120 h8" stroke="#3b2c1a" stroke-width="1.5" />
    <ellipse cx="37" cy="111" rx="4" ry="2.5" fill="#ffffff" opacity="0.85" />
    <ellipse cx="43" cy="111" rx="4" ry="2.5" fill="#ffffff" opacity="0.85" />
  </g>
</svg>`;

const hive = document.createElement("button");
hive.id = "hive";
hive.className = "hive";
hive.type = "button";
hive.ariaLabel = "Harvest honey from the hive";
hive.innerHTML = HIVE_SVG;

// Small "+N g" numbers drift up from where you harvested. Decorative only.
function showHarvestFloat(gain: number): void {
  const floater = document.createElement("span");
  floater.className = "float-num";
  floater.ariaHidden = "true";
  floater.textContent = `+${gain.toLocaleString()} g`;
  floater.style.left = `${20 + Math.random() * 60}%`;
  floater.style.top = `${35 + Math.random() * 25}%`;
  floater.addEventListener("animationend", () => floater.remove());
  hive.append(floater);
}

hive.addEventListener("click", () => {
  const gain = clickGain();
  honeyGrams += gain;
  showHarvestFloat(gain);
  render();
});

// Live feedback about production, updated with the rest of the display.
const rateDisplay = document.createElement("p");
rateDisplay.id = "rate-display";
rateDisplay.className = "rate";

// The shop. Every upgrade shares the card layout, but each still has its
// own buy handler, cost check, and render lines — duplication that the
// upcoming data-driven pass will collapse.
const shop = document.createElement("section");
shop.className = "shop";
shop.ariaLabel = "Upgrades";

const shopHeading = document.createElement("h2");
shopHeading.textContent = "Upgrades";
shop.append(shopHeading);

const shopGrid = document.createElement("div");
shopGrid.className = "shop-grid";

function createShopCard(
  name: string,
  icon: string,
  description: string,
  buttonLabel: string,
) {
  const card = document.createElement("article");
  card.className = "shop-card";
  const cardHeading = document.createElement("h3");
  cardHeading.textContent = `${icon} ${name}`;
  const cardDescription = document.createElement("p");
  cardDescription.textContent = description;
  const cardInfo = document.createElement("p");
  cardInfo.className = "upgrade-info";
  const buyButton = document.createElement("button");
  buyButton.textContent = buttonLabel;
  card.append(cardHeading, cardDescription, cardInfo, buyButton);
  return { card, info: cardInfo, button: buyButton };
}

const smoker = createShopCard(
  "Smoker",
  "💨",
  "Cool puffs of smoke keep the colony calm while you work: +2 g per hand harvest.",
  "Buy a smoker",
);
const workerBee = createShopCard(
  "Worker bee",
  "🐝",
  "One more forager on the comb, working around the clock: +0.5 g/s.",
  "Buy a worker bee",
);
const honeyPress = createShopCard(
  "Honey press",
  "🍯",
  "Crush every comb twice as hard: hand-harvest yield ×2.",
  "Buy a honey press",
);

smoker.button.addEventListener("click", () => {
  const cost = currentCost(SMOKER_BASE_COST, SMOKER_GROWTH, smokers);
  if (honeyGrams < cost) return;
  honeyGrams -= cost;
  smokers += 1;
  render();
});

workerBee.button.addEventListener("click", () => {
  const cost = currentCost(
    WORKER_BEE_BASE_COST,
    WORKER_BEE_GROWTH,
    workerBees,
  );
  if (honeyGrams < cost) return;
  honeyGrams -= cost;
  workerBees += 1;
  render();
});

honeyPress.button.addEventListener("click", () => {
  const cost = currentCost(
    HONEY_PRESS_BASE_COST,
    HONEY_PRESS_GROWTH,
    honeyPresses,
  );
  if (honeyGrams < cost) return;
  honeyGrams -= cost;
  honeyPresses += 1;
  render();
});

shopGrid.append(smoker.card, workerBee.card, honeyPress.card);
shop.append(shopGrid);

// One place that mirrors state into the display, used by every change.
// Honey accrues fractionally, so whole grams are what get banked on screen.
function formatRate(rate: number): string {
  return rate.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function render(): void {
  honeyDisplay.textContent = `Honey: ${
    Math.floor(honeyGrams).toLocaleString()
  } g`;
  rateDisplay.textContent = `Your bees make +${
    formatRate(passiveRate())
  } g/s · each harvest brings +${clickGain().toLocaleString()} g`;

  smoker.info.textContent = `Cost: ${
    currentCost(SMOKER_BASE_COST, SMOKER_GROWTH, smokers).toLocaleString()
  } g · Owned: ${smokers}`;
  const smokerAffordable =
    honeyGrams >= currentCost(SMOKER_BASE_COST, SMOKER_GROWTH, smokers);
  smoker.button.disabled = !smokerAffordable;
  smoker.card.dataset.affordable = String(smokerAffordable);

  workerBee.info.textContent = `Cost: ${
    currentCost(WORKER_BEE_BASE_COST, WORKER_BEE_GROWTH, workerBees)
      .toLocaleString()
  } g · Owned: ${workerBees}`;
  const workerBeeAffordable = honeyGrams >=
    currentCost(WORKER_BEE_BASE_COST, WORKER_BEE_GROWTH, workerBees);
  workerBee.button.disabled = !workerBeeAffordable;
  workerBee.card.dataset.affordable = String(workerBeeAffordable);

  honeyPress.info.textContent = `Cost: ${
    currentCost(HONEY_PRESS_BASE_COST, HONEY_PRESS_GROWTH, honeyPresses)
      .toLocaleString()
  } g · Owned: ${honeyPresses}`;
  const honeyPressAffordable = honeyGrams >=
    currentCost(HONEY_PRESS_BASE_COST, HONEY_PRESS_GROWTH, honeyPresses);
  honeyPress.button.disabled = !honeyPressAffordable;
  honeyPress.card.dataset.affordable = String(honeyPressAffordable);
}
render();

// The bees work on their own. A repeating interval can't see how much time
// actually passed, so production is driven by animation frames and elapsed
// time instead: the rate applies per real second, independent of frame rate.
// Frames are not summed on top of the interval — there is no interval.
let lastFrameTime = performance.now();

function tick(now: number): void {
  const elapsedSeconds = (now - lastFrameTime) / 1000;
  lastFrameTime = now;
  honeyGrams += passiveRate() * elapsedSeconds;
  render();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

app.append(header, honeyDisplay, hive, rateDisplay, shop);
