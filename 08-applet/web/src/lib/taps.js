// Taps (§4.4): step 5 of the tick. A tap binds one reading (a probe, in debug mode) to one CC number,
// through a curve. Plain JavaScript, no framework import.

// A curve maps 0..1 to 0..1, and 0 and 1 to the two ends. It alters where values crowd, never the range.
export const CURVES = {
  linear: (u) => u,
  in: (u) => u * u,
  out: (u) => Math.sqrt(u),
  s: (u) => u * u * (3 - 2 * u),
  flip: (u) => 1 - u,
};

// v is the reading, lo..hi its declared range. The reading was range-checked when it was read, so this
// never sees an out-of-range value. The final clamp guards the byte that rounding gives at the ends.
export function ccValue(v, lo, hi, curve) {
  const u = (v - lo) / (hi - lo);
  const cc = Math.round(CURVES[curve](u) * 127);
  return cc < 0 ? 0 : cc > 127 ? 127 : cc;
}

// The lowest CC number no tap holds. Two taps never share a number (§4.4).
export function nextFreeCC(taps) {
  const used = new Set(taps.map((t) => t.cc));
  for (let n = 1; n <= 127; n++) if (!used.has(n)) return n;
  for (let n = 0; n <= 127; n++) if (!used.has(n)) return n;
  return null;
}
