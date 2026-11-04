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

const honeyDisplay = document.createElement("p");
honeyDisplay.id = "honey-display";

// One place that mirrors state into the display, used by every change.
// Honey accrues fractionally, so whole grams are what get banked on screen.
function renderHoney(): void {
  honeyDisplay.textContent = `Honey: ${
    Math.floor(honeyGrams).toLocaleString()
  } g`;
}
renderHoney();

// A button created through TypeScript with an identity and a click listener.
const clickButton = document.createElement("button");
clickButton.id = "harvest-button";
clickButton.textContent = "Harvest honey";
clickButton.addEventListener("click", () => {
  honeyGrams += 1;
  renderHoney();
});

// The bees work on their own. A repeating interval can't see how much time
// actually passed, so production is driven by animation frames and elapsed
// time instead: +1 g per real second, independent of frame rate. Frames are
// not summed on top of the interval — the interval is gone entirely.
let lastFrameTime = performance.now();

function tick(now: number): void {
  const elapsedSeconds = (now - lastFrameTime) / 1000;
  lastFrameTime = now;
  honeyGrams += elapsedSeconds;
  renderHoney();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

app.append(heading, image, honeyDisplay, clickButton);
