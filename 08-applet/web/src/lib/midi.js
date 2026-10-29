// Web MIDI output (§4.4). MIDI output is not a condition of the applet running: every failure here
// removes a capability and leaves the loop, the readings, and the canvas working.
// Plain JavaScript, no framework import.

export const MIDI = {
  access: null,
  port: null,
};

// Ask the browser for MIDI access. Returns "ready", "unsupported", or "denied".
export async function requestAccess(onChange) {
  if (typeof navigator === "undefined" || !navigator.requestMIDIAccess) return "unsupported";
  try {
    MIDI.access = await navigator.requestMIDIAccess();
  } catch {
    return "denied";
  }
  // statechange names the port that connected or disconnected (06-bridge/).
  MIDI.access.onstatechange = (event) => onChange(event.port);
  return "ready";
}

export function outputs() {
  return MIDI.access ? [...MIDI.access.outputs.values()].map((p) => ({ id: p.id, name: p.name })) : [];
}

export function choose(id) {
  MIDI.port = (id && MIDI.access?.outputs.get(id)) || null;
  return MIDI.port;
}

export function connected() {
  return Boolean(MIDI.port && MIDI.port.state === "connected");
}

// Send one control change. channel is 1..16, cc and value are 0..127.
export function sendCC(channel, cc, value) {
  if (!connected()) return false;
  MIDI.port.send([0xb0 | (channel - 1), cc, value]);
  return true;
}
