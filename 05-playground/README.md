# 05 — Playground

**In:** OSC from `04-mapping-dsl/`. Also MIDI CC from `08-applet/`, through `06-bridge/`.
**Out:** MIDI CC, through `06-bridge/` to `07-renderer/`.
**Engine:** Sonic Pi or Overtone.

---

## 1. What this component is

The playground is **where Catalina composes**. It is not the shipped renderer — `07-renderer/` is. That
distinction is the reason the engine choice is low stakes: nothing a listener runs depends on which one
wins.

It sits at the junction of both paths. The piece's path sends OSC into it and MIDI out of it. The
instrument's path sends MIDI into it from the browser. A virtual MIDI port carries each direction
separately (`06-bridge/`), so neither blocks the other.

## 2. Decisions

- **Sonic Pi and Overtone are the composition playground, not the shipped renderer.**
- **Both are viable.** Both are real and actively maintained. Both accept OSC in and send MIDI out
  natively. The choice is which language Catalina prefers, not a technical fork.
- **Incoming CC is read on one channel.** The applet sends every tap on one MIDI channel, so the receiving
  side stays one `sync` line. A per-tap channel would multiply those paths and buy the piece nothing it
  needs yet.

## 3. Reading the applet's stream

Incoming MIDI enters Sonic Pi's Time State. Code reads it with:

```ruby
sync "/midi:<device>:<channel>/control_change"
```

Wildcard paths work, so the device name does not have to be hard-coded.

## 4. Open questions

- **Sonic Pi or Overtone?** Open, low stakes, a matter of language preference. Only Catalina settles it.
- **Whether the shipped path needs the playground at all.** A static soul file could let a Strudel page
  render with no playground and no virtual MIDI port. That question is about the whole chain, so the root
  `README.md` §6 owns it. If it resolves that way, this component stays as a composition tool and leaves
  the shipped path.

## 5. Sources

- **Sonic Pi** — OSC in on port 4560, and native `midi_*` output functions. Confirmed. Source:
  sonic-pi-net/sonic-pi repo and official tutorials.
- **Sonic Pi MIDI input** — incoming MIDI enters Time State and is read with
  `sync "/midi:<device>:<channel>/control_change"`. Wildcard paths work. Confirmed 2026-09-08. Source:
  Sonic Pi tutorial 11.1 "MIDI In".
  <https://github.com/sonic-pi-net/sonic-pi/blob/dev/etc/doc/tutorial/11.1-MIDI-In.md>
- **Overtone** — OSC client and server, and built-in MIDI device I/O. Confirmed. Source:
  overtone/overtone repo README.
- **Not installed on this machine.** No link that touches the playground runs here, so nothing in this
  component has been run end to end.
