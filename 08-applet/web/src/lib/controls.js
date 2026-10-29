// Controls (§4.2): step 1 of the tick. Deterministic: the same buffer and the same values give the same
// result, with no randomness. The order is part of the definition, because these operations do not
// commute: per-channel gain, contrast, saturation, hue rotation, blur, shift.
//
// Plain JavaScript, no framework import, because this runs on every tick once the loop exists.

const KR = 0.2126, KG = 0.7152, KB = 0.0722; // Rec. 709 luma, as in probes.js

export const CONTROLS = [
  { id: "gain_r", kind: "equilibrium", lo: 0, hi: 2, step: 0.01, identity: 1, unit: "" },
  { id: "gain_g", kind: "equilibrium", lo: 0, hi: 2, step: 0.01, identity: 1, unit: "" },
  { id: "gain_b", kind: "equilibrium", lo: 0, hi: 2, step: 0.01, identity: 1, unit: "" },
  { id: "contrast", kind: "equilibrium", lo: 0, hi: 2, step: 0.01, identity: 1, unit: "" },
  { id: "saturation", kind: "equilibrium", lo: 0, hi: 2, step: 0.01, identity: 1, unit: "" },
  { id: "hue_rotate", kind: "rate", lo: -30, hi: 30, step: 0.5, identity: 0, unit: "deg/tick" },
  { id: "blur", kind: "equilibrium", lo: 0, hi: 4, step: 0.1, identity: 0, unit: "px" },
  { id: "shift_x", kind: "rate", lo: -4, hi: 4, step: 1, identity: 0, unit: "px/tick" },
  { id: "shift_y", kind: "rate", lo: -4, hi: 4, step: 1, identity: 0, unit: "px/tick" },
];

export function identityValues() {
  return Object.fromEntries(CONTROLS.map((c) => [c.id, c.identity]));
}

// A control value stays inside its declared range (§4.2). The applet enforces it here.
function inRange(values) {
  const out = {};
  for (const c of CONTROLS) {
    const v = Number(values[c.id]);
    out[c.id] = Number.isFinite(v) ? Math.min(c.hi, Math.max(c.lo, v)) : c.identity;
  }
  return out;
}

// Hue rotation that keeps luma, as the feColorMatrix "hueRotate" type of W3C Filter Effects Level 1.
function hueMatrix(degrees) {
  const a = (degrees * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [
    0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928,
    0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.140, 0.072 - c * 0.072 - s * 0.283,
    0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072,
  ];
}

// Box blur along one axis, radius r in pixels (fractional: the two outer taps carry the fraction).
// Edges repeat the edge pixel.
function boxBlurAxis(src, dst, width, height, r, horizontal) {
  const whole = Math.floor(r), frac = r - whole;
  const reach = frac > 0 ? whole + 1 : whole;
  const norm = 1 / (2 * r + 1);
  const len = horizontal ? width : height;
  const lines = horizontal ? height : width;
  for (let line = 0; line < lines; line++) {
    for (let i = 0; i < len; i++) {
      let sr = 0, sg = 0, sb = 0;
      for (let k = -reach; k <= reach; k++) {
        const w = Math.abs(k) <= whole ? 1 : frac;
        const j = Math.min(len - 1, Math.max(0, i + k));
        const q = horizontal ? (line * width + j) * 3 : (j * width + line) * 3;
        sr += w * src[q]; sg += w * src[q + 1]; sb += w * src[q + 2];
      }
      const o = horizontal ? (line * width + i) * 3 : (i * width + line) * 3;
      dst[o] = sr * norm; dst[o + 1] = sg * norm; dst[o + 2] = sb * norm;
    }
  }
}

// Apply every control to `buffer` and return a new buffer. The source stays unaltered.
export function applyControls(buffer, values) {
  const v = inRange(values);
  const { width, height, data } = buffer;
  let out = new Float32Array(data.length);
  const hue = v.hue_rotate !== 0 ? hueMatrix(v.hue_rotate) : null;

  // Per-pixel steps, in the declared order: gain, contrast, saturation, hue rotation.
  for (let q = 0; q < data.length; q += 3) {
    let r = data[q] * v.gain_r, g = data[q + 1] * v.gain_g, b = data[q + 2] * v.gain_b;
    r = 0.5 + v.contrast * (r - 0.5);
    g = 0.5 + v.contrast * (g - 0.5);
    b = 0.5 + v.contrast * (b - 0.5);
    const l = KR * r + KG * g + KB * b;
    r = l + v.saturation * (r - l);
    g = l + v.saturation * (g - l);
    b = l + v.saturation * (b - l);
    if (hue) {
      const r2 = hue[0] * r + hue[1] * g + hue[2] * b;
      const g2 = hue[3] * r + hue[4] * g + hue[5] * b;
      const b2 = hue[6] * r + hue[7] * g + hue[8] * b;
      r = r2; g = g2; b = b2;
    }
    out[q] = r; out[q + 1] = g; out[q + 2] = b;
  }

  if (v.blur > 0) {
    const tmp = new Float32Array(out.length);
    boxBlurAxis(out, tmp, width, height, v.blur, true);
    boxBlurAxis(tmp, out, width, height, v.blur, false);
  }

  // Shift by whole pixels. The frame wraps, so nothing leaves it and nothing new enters.
  const dx = Math.round(v.shift_x), dy = Math.round(v.shift_y);
  if (dx !== 0 || dy !== 0) {
    const moved = new Float32Array(out.length);
    for (let y = 0; y < height; y++) {
      const ty = (((y + dy) % height) + height) % height;
      for (let x = 0; x < width; x++) {
        const tx = (((x + dx) % width) + width) % width;
        const s = (y * width + x) * 3, t = (ty * width + tx) * 3;
        moved[t] = out[s]; moved[t + 1] = out[s + 1]; moved[t + 2] = out[s + 2];
      }
    }
    out = moved;
  }

  // The buffer's declared range is 0..1 (§3.2). Gain and contrast can leave it, so the step clamps.
  for (let q = 0; q < out.length; q++) out[q] = out[q] < 0 ? 0 : out[q] > 1 ? 1 : out[q];

  return { width, height, data: out };
}
