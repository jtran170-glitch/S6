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

// The first consequential upgrade: a smoker calms the bees, so every hand
// harvest yields more. Cost is flat for now; scaling arrives later.
const SMOKER_COST = 20;
let smokers = 0;

function clickGain(): number {
  return 1 + 2 * smokers;
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

// The shop, with the smoker as its first card.
const shop = document.createElement("section");
shop.className = "shop";
shop.ariaLabel = "Upgrades";

const smokerCard = document.createElement("article");
smokerCard.className = "shop-card";

const smokerName = document.createElement("h2");
smokerName.textContent = "Smoker";

const smokerDescription = document.createElement("p");
smokerDescription.textContent = "Calms the bees: +2 g per hand harvest.";

const smokerInfo = document.createElement("p");
smokerInfo.className = "smoker-info";

const buySmoker = document.createElement("button");
buySmoker.textContent = "Buy a smoker";
buySmoker.addEventListener("click", () => {
  if (honeyGrams < SMOKER_COST) return; // unaffordable purchases are refused
  honeyGrams -= SMOKER_COST;
  smokers += 1;
  render();
});

smokerCard.append(smokerName, smokerDescription, smokerInfo, buySmoker);
shop.append(smokerCard);

// One place that mirrors state into the display, used by every change.
// Honey accrues fractionally, so whole grams are what get banked on screen.
function render(): void {
  honeyDisplay.textContent = `Honey: ${
    Math.floor(honeyGrams).toLocaleString()
  } g`;
  smokerInfo.textContent =
    `Cost: ${SMOKER_COST.toLocaleString()} g · Owned: ${smokers}`;
  const affordable = honeyGrams >= SMOKER_COST;
  buySmoker.disabled = !affordable;
  smokerCard.dataset.affordable = String(affordable);
}
render();

// The bees work on their own. A repeating interval can't see how much time
// actually passed, so production is driven by animation frames and elapsed
// time instead: +1 g per real second, independent of frame rate. Frames are
// not summed on top of the interval — there is no interval.
let lastFrameTime = performance.now();

function tick(now: number): void {
  const elapsedSeconds = (now - lastFrameTime) / 1000;
  lastFrameTime = now;
  honeyGrams += elapsedSeconds;
  render();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

app.append(heading, image, honeyDisplay, clickButton, shop);
