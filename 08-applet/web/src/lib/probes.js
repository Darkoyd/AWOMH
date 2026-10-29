// Probes (§5.1): candidate readings. Each has a free id, a group, and a declared range. A value outside
// its range is a broken probe and fails loudly. It is never clamped (§2).
//
// Every probe reads a buffer: Float32Array, width * height * 3, RGB in 0..1. Plain JavaScript, no
// framework import, because these run on every tick once the loop exists.

const GRID = 3; // the spatial group splits the frame into GRID x GRID regions

// Rec. 709 luma weights, on the buffer's encoded values.
const KR = 0.2126, KG = 0.7152, KB = 0.0722;

// A float sum can land a hair outside a bound it cannot cross in exact arithmetic. That is rounding,
// not a broken probe, so the range check allows this much and no more.
const TOLERANCE = 1e-9;

export class ProbeRangeError extends Error {}

function declare(id, group, lo, hi, meaning) {
  return { id, group, lo, hi, meaning };
}

export const PROBES = [
  declare("luma_mean", "Brightness", 0, 1, "Mean luma of the frame."),
  declare("luma_std", "Brightness", 0, 0.5, "Standard deviation of luma across the frame."),
  declare("chroma_mean", "Color", 0, 1, "Mean chroma: max(R,G,B) - min(R,G,B) per pixel."),
  declare("hue_spread", "Color", 0, 1,
    "1 - |mean hue vector|, weighted by chroma. 0 is one hue, 1 is hues spread evenly. 0 with no chroma."),
  declare("edge_energy", "Detail", 0, 1, "Mean of (|dx| + |dy|) / 2 of luma, forward differences."),
];
for (let r = 0; r < GRID; r++) {
  for (let c = 0; c < GRID; c++) {
    PROBES.push(declare(`grid_luma_r${r}c${c}`, "Spatial", 0, 1, `Mean luma of region row ${r}, column ${c}.`));
  }
}
for (let r = 0; r < GRID; r++) {
  for (let c = 0; c < GRID; c++) {
    PROBES.push(declare(`grid_chroma_r${r}c${c}`, "Spatial", 0, 1, `Mean chroma of region row ${r}, column ${c}.`));
  }
}

const BY_ID = new Map(PROBES.map((p) => [p.id, p]));

// Compute every probe for one buffer. Returns { id: value }. Throws ProbeRangeError on the first value
// outside its declared range.
export function computeProbes({ width, height, data }) {
  const n = width * height;
  const luma = new Float64Array(n);
  let lumaSum = 0, lumaSq = 0, chromaSum = 0, hueX = 0, hueY = 0;
  const cellLuma = new Float64Array(GRID * GRID);
  const cellChroma = new Float64Array(GRID * GRID);
  const cellCount = new Float64Array(GRID * GRID);

  for (let y = 0, i = 0, q = 0; y < height; y++) {
    const row = Math.min(GRID - 1, Math.floor((y * GRID) / height));
    for (let x = 0; x < width; x++, i++, q += 3) {
      const r = data[q], g = data[q + 1], b = data[q + 2];
      const l = KR * r + KG * g + KB * b;
      luma[i] = l;
      lumaSum += l;
      lumaSq += l * l;

      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const chroma = max - min;
      chromaSum += chroma;
      if (chroma > 0) {
        // Hue angle on the colour wheel, from the hexagonal projection.
        const angle = Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b);
        hueX += chroma * Math.cos(angle);
        hueY += chroma * Math.sin(angle);
      }

      const cell = row * GRID + Math.min(GRID - 1, Math.floor((x * GRID) / width));
      cellLuma[cell] += l;
      cellChroma[cell] += chroma;
      cellCount[cell] += 1;
    }
  }

  let edge = 0, edgeCount = 0;
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const i = y * width + x;
      edge += (Math.abs(luma[i + 1] - luma[i]) + Math.abs(luma[i + width] - luma[i])) / 2;
      edgeCount++;
    }
  }

  const lumaMean = lumaSum / n;
  const values = {
    luma_mean: lumaMean,
    luma_std: Math.sqrt(Math.max(0, lumaSq / n - lumaMean * lumaMean)),
    chroma_mean: chromaSum / n,
    hue_spread: chromaSum > 0 ? 1 - Math.hypot(hueX, hueY) / chromaSum : 0,
    edge_energy: edgeCount > 0 ? edge / edgeCount : 0,
  };
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const k = r * GRID + c;
      values[`grid_luma_r${r}c${c}`] = cellLuma[k] / cellCount[k];
      values[`grid_chroma_r${r}c${c}`] = cellChroma[k] / cellCount[k];
    }
  }

  for (const [id, v] of Object.entries(values)) {
    const p = BY_ID.get(id);
    if (!(v >= p.lo - TOLERANCE && v <= p.hi + TOLERANCE)) {
      throw new ProbeRangeError(`probe ${id} is ${v}, outside its declared range ${p.lo} to ${p.hi}`);
    }
  }
  return values;
}
