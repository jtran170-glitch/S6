// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "D1 project";

const image = document.createElement("img");
image.src = tileUrl;
image.alt = "A teal tile with a cream circle";
image.width = 96;
image.height = 96;

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

const honeyDisplay = document.createElement("p");
honeyDisplay.id = "honey-display";

// A button created through TypeScript with an identity and a click listener.
const clickButton = document.createElement("button");
clickButton.id = "harvest-button";
clickButton.textContent = "Harvest honey";
clickButton.addEventListener("click", () => {
  honeyGrams += clickGain();
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

function createShopCard(name: string, description: string) {
  const card = document.createElement("article");
  card.className = "shop-card";
  const cardHeading = document.createElement("h2");
  cardHeading.textContent = name;
  const cardDescription = document.createElement("p");
  cardDescription.textContent = description;
  const cardInfo = document.createElement("p");
  cardInfo.className = "upgrade-info";
  const buyButton = document.createElement("button");
  card.append(cardHeading, cardDescription, cardInfo, buyButton);
  return { card, info: cardInfo, button: buyButton };
}

const smoker = createShopCard(
  "Smoker",
  "Calms the bees: +2 g per hand harvest.",
);
const workerBee = createShopCard(
  "Worker bee",
  "One more forager on the comb: +0.5 g/s.",
);
const honeyPress = createShopCard(
  "Honey press",
  "Presses every comb twice as hard: doubles hand-harvest yield.",
);

smoker.button.textContent = "Buy a smoker";
smoker.button.addEventListener("click", () => {
  const cost = currentCost(SMOKER_BASE_COST, SMOKER_GROWTH, smokers);
  if (honeyGrams < cost) return;
  honeyGrams -= cost;
  smokers += 1;
  render();
});

workerBee.button.textContent = "Buy a worker bee";
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

honeyPress.button.textContent = "Buy a honey press";
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

shop.append(smoker.card, workerBee.card, honeyPress.card);

// One place that mirrors state into the display, used by every change.
// Honey accrues fractionally, so whole grams are what get banked on screen.
function formatRate(rate: number): string {
  return rate.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function render(): void {
  honeyDisplay.textContent = `Honey: ${
    Math.floor(honeyGrams).toLocaleString()
  } g`;
  rateDisplay.textContent = `Bee production: +${
    formatRate(passiveRate())
  } g/s · Each harvest: +${clickGain().toLocaleString()} g`;

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

app.append(heading, image, honeyDisplay, clickButton, rateDisplay, shop);
