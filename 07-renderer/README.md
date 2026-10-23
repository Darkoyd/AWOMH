# 07 — Renderer

**In:** MIDI CC through `06-bridge/`.
**Out:** audio, in the listener's own browser.
**Engine:** Strudel.

---

## 1. What this component is

Strudel is the **shipped** renderer. It is a real, actively developed browser port of TidalCycles, it runs
entirely client-side via Web Audio, and it works offline once loaded.

It receives live MIDI CC through `midin()` and wires a CC value straight into a pattern parameter.

Every listener runs their own instance. No shared audio stream and no central server keep the piece
running, which is the concept and not an optimisation.

## 2. Decisions

- **Strudel is the renderer, driven by MIDI.** Its OSC support is send-only, so MIDI is the only way in.
- **The renderer receives the soul and the current readings, never the lineage** (R18).
- **Strudel's licence sets the project's licence.** AGPL-3.0-or-later, across the whole project. Root
  `README.md` §4 states the full consequence. It is firm.
- **A supported browser is a requirement, not a recommendation.** No Safari.

## 3. Open questions

- None of this component's own. Two chain-level questions touch it, and the root `README.md` §6 owns
  both: end-to-end latency, and whether a static soul file could drive the renderer with no playground and
  no bridge at all.

## 4. Sources

- **Strudel** — real, actively developed browser port of TidalCycles. OSC support is outbound only. MIDI
  input via `midin()` and `cc()` confirmed and documented. Works offline. Licence AGPL-3.0-or-later,
  confirmed from Strudel's FAQ and licence file. Source: strudel.cc docs, tidalcycles/strudel repo.
- **Web MIDI browser support (2026)** — works in Chrome, Edge, Opera, Samsung Internet, and Firefox 108
  and later. Unsupported in Safari on macOS and iOS, with no roadmap, citing fingerprinting. Source:
  web-platform-dx feature tracker, testmuai.com (2026), Super Simple Piano compatibility chart (2026).
