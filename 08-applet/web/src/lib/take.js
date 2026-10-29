// Takes (§5.1): a recording of one debug-mode run, tick by tick. A take is a file the viewer chooses to
// save. It never enters the repo, and it reaches no soul and no lineage (R20).
//
// The format is open (§7). A take saves as two files:
//   .csv  every tick: seed, leak, rate, control values, noise settings, every probe, every tap's CC.
//   .mid  a Standard MIDI File, format 0: the taps' CC values, one MIDI tick per loop tick.
// Plain JavaScript, no framework import.

export function startTake(meta) {
  return { meta, frames: [] };
}

export function addFrame(take, frame) {
  take.frames.push(frame);
}

function csvCell(v) {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function takeToCSV(take) {
  if (!take.frames.length) return "";
  const first = take.frames[0];
  const cols = [
    "tick", "seed", "rate", "leak",
    ...Object.keys(first.controls).map((k) => `control.${k}`),
    ...Object.keys(first.noise).map((k) => `noise.${k}`),
    ...Object.keys(first.probes).map((k) => `probe.${k}`),
    ...take.meta.taps.map((t) => `cc${t.cc}.${t.probe}.${t.curve}`),
  ];
  const rows = take.frames.map((f) => [
    f.tick, take.meta.seed, f.rate, f.leak,
    ...Object.values(f.controls), ...Object.values(f.noise), ...Object.values(f.probes),
    ...take.meta.taps.map((t) => f.ccs[t.cc] ?? ""),
  ]);
  return [cols, ...rows].map((r) => r.map(csvCell).join(",")).join("\n") + "\n";
}

function varLen(n) {
  const bytes = [n & 0x7f];
  while ((n >>= 7)) bytes.unshift((n & 0x7f) | 0x80);
  return bytes;
}

// Standard MIDI File, format 0, one track. Division = the loop rate in ticks per quarter note, and the
// tempo is 60 BPM, so one MIDI tick lasts one loop tick. A CC event appears only when its value changes,
// the same rule the live output follows (§3.4).
export function takeToMIDI(take) {
  const { rate, channel, taps } = take.meta;
  const events = [];
  // Tempo: 1,000,000 microseconds per quarter note.
  events.push({ tick: 0, bytes: [0xff, 0x51, 0x03, 0x0f, 0x42, 0x40] });
  const last = new Map();
  const start = take.frames.length ? take.frames[0].tick : 0;
  for (const f of take.frames) {
    for (const t of taps) {
      const v = f.ccs[t.cc];
      if (v === undefined || last.get(t.cc) === v) continue;
      last.set(t.cc, v);
      events.push({ tick: f.tick - start, bytes: [0xb0 | (channel - 1), t.cc, v] });
    }
  }
  const end = take.frames.length ? take.frames.at(-1).tick - start + 1 : 0;
  events.push({ tick: end, bytes: [0xff, 0x2f, 0x00] }); // end of track

  const track = [];
  let at = 0;
  for (const e of events) {
    track.push(...varLen(e.tick - at), ...e.bytes);
    at = e.tick;
  }
  const u32 = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const u16 = (n) => [(n >>> 8) & 255, n & 255];
  return new Uint8Array([
    ..."MThd".split("").map((c) => c.charCodeAt(0)), ...u32(6), ...u16(0), ...u16(1), ...u16(rate),
    ..."MTrk".split("").map((c) => c.charCodeAt(0)), ...u32(track.length), ...track,
  ]);
}

export function download(name, data, type) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
