// The applet's state. Build steps 1 to 4 (§5.2): loaded images, the one on screen, rotation, buffer
// size, the controls, and the loop.

import { applyControls, identityValues } from "./controls.js";
import { NOISE_DEFAULTS } from "./noise.js";
import { LEAK_DEFAULT, RATE_DEFAULT, copyBuffer, newSeed, tick } from "./loop.js";

// Per-viewer conveniences only. The applet writes nothing else (R20).
function recall(key, fallback) {
  try {
    const v = localStorage.getItem(`window.${key}`);
    return v === null ? fallback : Number(v);
  } catch {
    return fallback;
  }
}

export function remember(key, value) {
  try { localStorage.setItem(`window.${key}`, String(value)); } catch { /* storage blocked */ }
}

class Applet {
  debug = $state(false);
  // { name, bitmap, buffer }. Raw: a buffer holds a Float32Array that must never be proxied.
  images = $state.raw([]);
  current = $state(-1);
  turns = $state(recall("turns", 0));        // quarter turns clockwise
  longEdge = $state(recall("longEdge", 512)); // 0 means the source's own size
  // Control values (§4.2). Every default is the identity transform.
  controls = $state(identityValues());
  // Each loaded image with the controls applied once and no noise. These are the static columns of the
  // probe table: every image is read from the same kind of source, so their spread compares framing.
  views = $derived(this.images.map((img) => applyControls(img.buffer, this.controls)));

  // The loop runs on the image on screen, which is the forcing term (§3.1).
  loop = $state({
    playing: false,
    tick: 0,
    rate: recall("rate", RATE_DEFAULT),
    leak: LEAK_DEFAULT,
    seed: newSeed(),
    restartOnToggle: true,
  });
  noise = $state({ ...NOISE_DEFAULTS });
  // The loop's buffer. Raw: it holds a Float32Array that must never be proxied.
  live = $state.raw(null);

  // Start the loop again from the moment, at tick 0. The same seed and settings then repeat the run.
  restart() {
    const img = this.images[this.current];
    this.live = img ? copyBuffer(img.buffer) : null;
    this.loop.tick = 0;
  }

  step() {
    const img = this.images[this.current];
    if (!img || !this.live) return;
    // Snapshots: the tick reads these once per pixel, and a proxy read per pixel is slow.
    this.live = tick(this.live, img.buffer, $state.snapshot(this.controls), $state.snapshot(this.noise),
                     this.loop.seed, this.loop.tick, this.loop.leak);
    this.loop.tick += 1;
  }

  // Show image k. A different size always restarts. Otherwise the setting decides (§7, found by use).
  show(k) {
    if (k === this.current) return;
    const prev = this.live, next = this.images[k]?.buffer;
    this.current = k;
    if (this.loop.restartOnToggle || !prev || !next || prev.width !== next.width || prev.height !== next.height) {
      this.restart();
    }
  }
  status = $state("");
  statusError = $state(false);
}

export const applet = new Applet();
