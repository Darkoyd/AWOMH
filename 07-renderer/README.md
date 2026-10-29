# 07 — Renderer

**In:** the published soul, by default. MIDI CC through `06-bridge/`, optionally.
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

- **Strudel is the renderer. By default it renders from the published soul alone.** The listener needs no
  playground and no virtual MIDI port. Confirmed on 2026-10-29 (root `README.md`, the default listening
  path).
- **MIDI is the optional way in.** A listener who runs `05-playground/` and a virtual MIDI port drives
  Strudel through `midin()`. Strudel's OSC support is send-only, so on this path MIDI is the only way in.
- **The renderer never receives the lineage** (R18). On the default path it receives the soul alone. On
  the MIDI path it also receives the current readings. Confirmed on 2026-10-29.
- **Strudel's licence sets the project's licence.** AGPL-3.0-or-later, across the whole project. Root
  `README.md` §4 states the full consequence. It is firm.
- **A Web MIDI browser is a requirement on the MIDI path.** No Safari on that path.

## 3. Open questions

- **Does a pattern take numbers from our own JavaScript?** The page fetches the soul with plain browser
  JavaScript, outside Strudel. `@strudel/web` exposes Strudel's functions to the page (§4). No source shows
  a pattern built from JavaScript numbers, or numbers passed into `evaluate()`. Test it in a page before
  anything relies on it.
- **Load `@strudel/web` from a CDN, or keep a copy in the repo?** A copy keeps the site self-contained and
  ships the source next to the site, as AGPL asks. Which version to pin is also open: the docs show 1.0.3
  and 1.3.0.
- **Do Strudel's global function names clash with the page's own?** `initStrudel()` makes every Strudel
  function global. Not checked.
- **Does the default path run in Safari?** It needs no Web MIDI, so invariant 7 may not apply to it.
  Whether Strudel runs in Safari is not verified.
- End-to-end latency of the MIDI path is a chain-level question. The root `README.md` owns it.

## 4. Sources

- **`@strudel/web` runs Strudel in our own page with no build step.** It loads from a script tag. After
  `initStrudel()`, Strudel's functions are available to the page, a pattern plays with `.play()`, and
  `evaluate(code)` runs a code string. Observed 2026-10-29.
  <https://strudel.cc/technical-manual/project-start/>
  <https://cdn.jsdelivr.net/npm/@strudel/web@1.3.0/README.md>
- **Strudel** — real, actively developed browser port of TidalCycles. OSC support is outbound only. MIDI
  input via `midin()` and `cc()` confirmed and documented. Works offline. Licence AGPL-3.0-or-later,
  confirmed from Strudel's FAQ and licence file. Source: strudel.cc docs, tidalcycles/strudel repo.
- **Web MIDI browser support (2026)** — works in Chrome, Edge, Opera, Samsung Internet, and Firefox 108
  and later. Unsupported in Safari on macOS and iOS, with no roadmap, citing fingerprinting. Source:
  web-platform-dx feature tracker, testmuai.com (2026), Super Simple Piano compatibility chart (2026).
