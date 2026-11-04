// Owns time. requestAnimationFrame steps the simulation with elapsed
// seconds, so growth depends on real time rather than frame count. Long
// gaps are clamped — background tabs pause animation frames — so coming
// back to the tab never dumps a mountain of honey at once.

export type TickListener = (elapsedSeconds: number) => void;

const MAX_FRAME_SECONDS = 0.25;

/** Starts the loop; returns a function that stops it. */
export function startGameLoop(onTick: TickListener): () => void {
  let lastFrameTime = performance.now();
  let rafId = 0;

  const frame = (now: number): void => {
    const elapsed = Math.min(
      (now - lastFrameTime) / 1000,
      MAX_FRAME_SECONDS,
    );
    lastFrameTime = now;
    onTick(elapsed);
    rafId = requestAnimationFrame(frame);
  };

  rafId = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(rafId);
}
