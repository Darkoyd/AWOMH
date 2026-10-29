// Perturbation (§4.3): step 2 of the tick, the only step with randomness. In debug mode the seed is
// visible and settable, and the same seed with the same settings repeats the same run (§5.1).
//
// The noise is counter-based: every value is a hash of (seed, tick, position, channel). No generator
// state carries from tick to tick, so tick t gives the same noise however the run reached it.
//
// §4.3 is open. Its open items are settings here, so debug mode can find the answers:
//   character  white | value | drift          (open item 1)
//   channels   independent | shared           (open item 2)
//   amount     0 .. 0.5, additive amplitude    (open item 4)
// Plain JavaScript, no framework import.

export const NOISE_DEFAULTS = {
  character: "white",
  channels: "independent",
  amount: 0.05,
  scale: 8,   // value and drift: lattice spacing in pixels
  period: 30, // drift: ticks from one lattice frame to the next
};

export const AMOUNT_MAX = 0.5;

// 32-bit integer mixing (the "lowbias32" finaliser).
function mix(x) {
  x ^= x >>> 16; x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15; x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}

// A uniform value in [-1, 1) from five integers.
function hash(seed, a, b, c, d) {
  let h = mix(seed ^ 0x9e3779b9);
  h = mix(h ^ a); h = mix(h ^ b); h = mix(h ^ c); h = mix(h ^ d);
  return h / 0x80000000 - 1;
}

const smooth = (t) => t * t * (3 - 2 * t);

// The lattice of one value-noise frame: hashed values at every lattice point that covers the frame.
// Hashing the lattice once per tick, not once per pixel, keeps a tick inside its time budget.
function lattice(seed, frame, width, height, scale, ch) {
  const cols = Math.floor((width - 1) / scale) + 2, rows = Math.floor((height - 1) / scale) + 2;
  const v = new Float64Array(cols * rows);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) v[y * cols + x] = hash(seed, frame, x, y, ch);
  return { v, cols };
}

// Value noise at (x, y): bilinear with a smoothstep between the four lattice points around it.
function sample({ v, cols }, x, y, scale) {
  const gx = x / scale, gy = y / scale;
  const x0 = Math.floor(gx), y0 = Math.floor(gy);
  const fx = smooth(gx - x0), fy = smooth(gy - y0);
  const i = y0 * cols + x0;
  const top = v[i] + fx * (v[i + 1] - v[i]);
  const bottom = v[i + cols] + fx * (v[i + cols + 1] - v[i + cols]);
  return top + fy * (bottom - top);
}

// One function per channel for this tick: (x, y, i) -> a value in [-1, 1].
function fields(settings, seed, tick, width, height, channels) {
  const { scale } = settings;
  return Array.from({ length: channels }, (_, ch) => {
    switch (settings.character) {
      case "white":
        return (x, y, i) => hash(seed, tick, i, ch, 0);
      case "value": {
        const L = lattice(seed, tick, width, height, scale, ch);
        return (x, y) => sample(L, x, y, scale);
      }
      case "drift": {
        const t = tick / settings.period, f = Math.floor(t), w = smooth(t - f);
        const A = lattice(seed, f, width, height, scale, ch), B = lattice(seed, f + 1, width, height, scale, ch);
        return (x, y) => {
          const a = sample(A, x, y, scale);
          return a + w * (sample(B, x, y, scale) - a);
        };
      }
      default:
        throw new Error(`noise character "${settings.character}" is not known`);
    }
  });
}

// Add noise to `buffer` in place, then clamp to the buffer's declared range 0..1 (§3.2). Clamping here
// keeps the blend of step 3 inside 0..1, because it mixes two values that are already inside.
export function applyNoise(buffer, settings, seed, tick) {
  const { width, height, data } = buffer;
  const amount = Math.min(AMOUNT_MAX, Math.max(0, settings.amount));
  if (amount > 0) {
    const shared = settings.channels === "shared";
    const [f0, f1, f2] = fields(settings, seed, tick, width, height, shared ? 1 : 3);
    for (let y = 0, i = 0, q = 0; y < height; y++) {
      for (let x = 0; x < width; x++, i++, q += 3) {
        if (shared) {
          const n = amount * f0(x, y, i);
          data[q] += n; data[q + 1] += n; data[q + 2] += n;
        } else {
          data[q] += amount * f0(x, y, i);
          data[q + 1] += amount * f1(x, y, i);
          data[q + 2] += amount * f2(x, y, i);
        }
      }
    }
  }
  for (let q = 0; q < data.length; q++) data[q] = data[q] < 0 ? 0 : data[q] > 1 ? 1 : data[q];
  return buffer;
}
