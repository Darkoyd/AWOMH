// The applet's state. Build steps 1 to 5 (§5.2): loaded images, the one on screen, rotation, buffer
// size, the controls, the loop, the output, and takes.

import { applyControls, identityValues } from "./controls.js";
import { NOISE_DEFAULTS } from "./noise.js";
import { LEAK_DEFAULT, RATE_DEFAULT, copyBuffer, newSeed, tick } from "./loop.js";
import { PROBES, computeProbes } from "./probes.js";
import { ccValue, nextFreeCC } from "./taps.js";
import { MIDI, requestAccess, outputs, choose, connected, sendCC } from "./midi.js";
import { startTake, addFrame } from "./take.js";

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

const PROBE_BY_ID = new Map(PROBES.map((p) => [p.id, p]));

function read(buffer) {
  if (!buffer) return null;
  try {
    return { values: computeProbes(buffer), error: null };
  } catch (err) {
    return { values: null, error: err.message };
  }
}

// The value each CC number last sent. Plain, not reactive: it changes on every tick and nothing draws it.
const lastSent = new Map();

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
  // The probes of the loop's buffer: { values, error }. Step 4 of the tick.
  liveProbes = $state.raw(null);

  // The output panel (§4.4).
  output = $state({ status: "off", ports: [], portId: "", channel: recall("channel", 1) });
  // { probe, curve, cc }. The list starts empty (§4.4).
  taps = $state([]);
  // The CC value of each tap on the last tick, by CC number, for display.
  tapValues = $state.raw({});
  // The take being recorded, or null. Its frames are plain: the panel shows only their count.
  take = null;
  takeTicks = $state(0);
  lastTake = $state.raw(null);

  // Start the loop again from the moment, at tick 0. The same seed and settings then repeat the run.
  restart() {
    const img = this.images[this.current];
    this.live = img ? copyBuffer(img.buffer) : null;
    this.liveProbes = read(this.live);
    this.loop.tick = 0;
  }

  // One tick, in the order of §3.3. Step 6, the draw, follows from the new buffer.
  step() {
    const img = this.images[this.current];
    if (!img || !this.live) return;
    const t = this.loop.tick;
    // Steps 1 to 3. Snapshots: the tick reads these once per pixel, and a proxy read per pixel is slow.
    this.live = tick(this.live, img.buffer, $state.snapshot(this.controls), $state.snapshot(this.noise),
                     this.loop.seed, t, this.loop.leak);
    this.liveProbes = read(this.live); // step 4
    this.emit(t);                      // step 5
    this.loop.tick = t + 1;
  }

  // Step 5: taps to CC, sent only on change (§3.4), and the take's frame.
  emit(t) {
    const values = this.liveProbes?.values;
    const ccs = {};
    // A broken probe sends nothing. The probe table shows the error.
    if (values) {
      const live = this.output.status === "ready";
      for (const tap of this.taps) {
        const p = PROBE_BY_ID.get(tap.probe);
        const v = ccValue(values[tap.probe], p.lo, p.hi, tap.curve);
        ccs[tap.cc] = v;
        if (live && lastSent.get(tap.cc) !== v && sendCC(this.output.channel, tap.cc, v)) lastSent.set(tap.cc, v);
      }
    }
    this.tapValues = ccs;
    if (this.take && values) {
      addFrame(this.take, {
        tick: t,
        rate: this.loop.rate,
        leak: this.loop.leak,
        controls: $state.snapshot(this.controls),
        noise: $state.snapshot(this.noise),
        probes: values,
        ccs,
      });
      this.takeTicks = this.take.frames.length;
    }
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

  // --- Output ---

  async enableMidi() {
    const result = await requestAccess((port) => this.portChanged(port));
    this.output.status = result;
    if (result === "ready") this.refreshPorts();
  }

  refreshPorts() {
    this.output.ports = outputs();
    if (!this.output.ports.length) {
      this.output.status = "noports";
    } else if (!this.output.portId) {
      this.output.status = "choose";
    }
  }

  choosePort(id) {
    this.output.portId = id;
    choose(id);
    lastSent.clear();
    this.output.status = connected() ? "ready" : id ? "lost" : "choose";
  }

  // statechange (§4.4): stop on a disconnect, and on a return forget every last-sent value, because the
  // receiver's state is unknown.
  portChanged(port) {
    this.output.ports = outputs();
    if (!MIDI.port || port.id !== this.output.portId) {
      if (this.output.status === "noports" && this.output.ports.length) this.output.status = "choose";
      return;
    }
    if (port.state === "disconnected") {
      this.output.status = "lost";
    } else if (this.output.status === "lost") {
      choose(this.output.portId);
      lastSent.clear();
      this.output.status = "ready";
    }
  }

  addTap() {
    const cc = nextFreeCC(this.taps);
    if (cc === null) return;
    this.taps.push({ probe: PROBES[0].id, curve: "linear", cc });
  }

  // Any change to a tap makes its next tick send, as a new tap's first tick does (§4.4).
  editTap(k, change) {
    const tap = this.taps[k];
    if (change.cc !== undefined && this.taps.some((t, j) => j !== k && t.cc === change.cc)) return false;
    lastSent.delete(tap.cc);
    Object.assign(tap, change);
    lastSent.delete(tap.cc);
    return true;
  }

  removeTap(k) {
    lastSent.delete(this.taps[k].cc);
    this.taps.splice(k, 1);
  }

  // --- Takes ---

  startTake() {
    this.take = startTake({
      seed: this.loop.seed,
      rate: this.loop.rate,
      channel: this.output.channel,
      taps: $state.snapshot(this.taps),
      image: this.images[this.current]?.name ?? "",
    });
    this.takeTicks = 0;
  }

  stopTake() {
    this.lastTake = this.take;
    this.take = null;
  }

  status = $state("");
  statusError = $state(false);
}

export const applet = new Applet();
