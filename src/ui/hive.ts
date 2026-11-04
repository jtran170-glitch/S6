// The hive button: the game's main action, drawn as an inline SVG skep
// (a dome-shaped woven hive) with two bees that drift around it. Pure
// view: it never touches game state.

export interface Hive {
  button: HTMLButtonElement;
  /** Spawn a small "+N g" floater that drifts up and fades. */
  float(gain: number): void;
}

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

export function createHive(): Hive {
  const button = document.createElement("button");
  button.id = "hive";
  button.className = "hive";
  button.type = "button";
  button.ariaLabel = "Harvest honey from the hive";
  button.innerHTML = HIVE_SVG;

  function float(gain: number): void {
    const floater = document.createElement("span");
    floater.className = "float-num";
    floater.ariaHidden = "true";
    floater.textContent = `+${gain.toLocaleString()} g`;
    floater.style.left = `${20 + Math.random() * 60}%`;
    floater.style.top = `${35 + Math.random() * 25}%`;
    floater.addEventListener("animationend", () => floater.remove());
    button.append(floater);
  }

  return { button, float };
}
