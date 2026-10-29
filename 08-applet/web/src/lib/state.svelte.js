// The applet's state. Build steps 1 to 3 (§5.2): loaded images, the one on screen, rotation, buffer
// size, and the controls.

import { applyControls, identityValues } from "./controls.js";

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
  // The buffer state of each image: its source with the controls applied. Until the loop exists
  // (step 4) a control acts once, so every image gets the same controls and the columns stay comparable.
  views = $derived(this.images.map((img) => applyControls(img.buffer, this.controls)));
  status = $state("");
  statusError = $state(false);
}

export const applet = new Applet();
