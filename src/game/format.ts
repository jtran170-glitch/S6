// Shared number formatting for every display surface, so grams read the
// same in the counter, the rate line, and the price tags.

const wholeGrams = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

/** Honey on hand: whole grams banked on screen. */
export function formatHoney(amount: number): string {
  return wholeGrams.format(Math.floor(amount));
}

/** Rates and per-click amounts: one decimal while they stay small. */
export function formatNumber(value: number): string {
  if (value < 1000) {
    const rounded = value.toFixed(1);
    return rounded.endsWith(".0") ? rounded.slice(0, -2) : rounded;
  }
  return wholeGrams.format(value);
}
