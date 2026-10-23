# 06 — Bridge

**What it is:** a virtual MIDI port on one machine.
**Carries:** MIDI CC from `05-playground/` to `07-renderer/`, and MIDI CC from `08-applet/` to
`05-playground/`.

---

## 1. What this component is

An OS-level feature, not code this project writes:

| Platform | Port |
|---|---|
| macOS | IAC Driver |
| Windows | loopMIDI |
| Linux | ALSA virtual MIDI |

It lets MIDI cross between the browser and the playground on one machine.

## 2. Decisions

- **MIDI, not OSC.** Strudel's OSC support is send-only, so OSC cannot reach the renderer. This is the
  verified finding that set the whole bridge design.
- **The two directions are separate.** The piece sends MIDI out of the playground to the renderer. The
  instrument sends MIDI into the playground from the browser. A virtual MIDI port carries each direction
  separately, so the reversal costs nothing.
- **The port is local to one machine and is not visible on a network.** This is what makes one shared
  static page serve everyone: each person's local playground feeds their own browser session. No per-user
  backend and no accounts.
- **The applet treats port loss as a lost capability, never as a fatal error.** The failure table is in
  `08-applet/README.md` §4.4, next to the code that implements it.

## 3. Open questions

- **End-to-end latency and reliability.** Every link is verified alone; the chain is not. The root
  `README.md` §6 owns this, because it is a property of the chain and not of the port.

## 4. Sources

- **Virtual MIDI bridging** — real-world precedent for Sonic Pi routed through a macOS IAC Driver bus to
  another application. Source: public Sonic Pi MIDI gist (Robin Newman).
- **Web MIDI port hot-plug** — `MIDIAccess` and `MIDIPort` both fire `statechange`, a
  `MIDIConnectionEvent` whose `port` names the affected port. `MIDIPort.state` is `connected` or
  `disconnected`. `MIDIPort.connection` is `open`, `closed`, or `pending`. `send()` on a disconnected port
  throws `InvalidStateError`. The browser reopens a `pending` port by itself when the device returns,
  before it fires `statechange`. Confirmed 2026-09-09. Source: W3C Web MIDI API specification §5.3, §5.4,
  §5.4.2, §5.6, and MDN.
  <https://webaudio.github.io/web-midi-api/>
  <https://developer.mozilla.org/en-US/docs/Web/API/MIDIAccess/statechange_event>
