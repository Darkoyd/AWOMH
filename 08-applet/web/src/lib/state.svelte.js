// The applet's state. Build step 1 (§5.2): loaded images, the one on screen, rotation, buffer size.

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
  status = $state("");
  statusError = $state(false);
}

export const applet = new Applet();
