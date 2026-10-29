// The loop (§3): one tick, steps 1 to 3 of §3.3. Readings (4), output (5), and drawing (6) happen in the
// caller, from the buffer this returns. Plain JavaScript, no framework import.

import { applyControls } from "./controls.js";
import { applyNoise } from "./noise.js";

export const LEAK_DEFAULT = 0.05;
export const RATE_DEFAULT = 30;
export const RATE_MIN = 1;
export const RATE_MAX = 60;

// buffer_next = (1 - a) * perturb(controls(buffer), noise) + a * moment      (§3.1, §3.3)
export function tick(buffer, moment, controls, noise, seed, t, leak) {
  const a = Math.min(1, Math.max(0, leak));
  const next = applyNoise(applyControls(buffer, controls), noise, seed, t); // steps 1 and 2
  const out = next.data, m = moment.data;
  for (let q = 0; q < out.length; q++) out[q] = (1 - a) * out[q] + a * m[q]; // step 3
  return next;
}

export function copyBuffer({ width, height, data }) {
  return { width, height, data: new Float32Array(data) };
}

// A fresh seed for the visible seed field. Debug mode only: normal mode takes the soul (§6 item 3).
export function newSeed() {
  const v = new Uint32Array(1);
  crypto.getRandomValues(v);
  return v[0];
}
