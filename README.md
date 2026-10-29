# The Window

A cabinet wall in the house fills with stickers over time. Each one is someone's personal mark. The
piece treats the wall as a window: a physical, ever-growing archive that gets sonified. Each time
someone adds a sticker, the wall is photographed — always the whole sticker area. Every such **capture**
is recorded and folds into the soul. The captures the owner chooses to share are **moments**, and they
shape an evolving, long-form generative music piece.

No shared listening experience exists, by design. Each listener renders locally and independently.

**Status:** the chain, the soul rules, and the instrument's shape are settled. The open items are the
concrete feature set, the per-mapping modes, capture standardization, end-to-end latency, and two format
questions. Each component below lists its own.
**Last updated:** 2026-10-29

---

## 1. This document

This is the only document that describes the whole. It owns four things and nothing else:

1. The bound vocabulary (§2).
2. The two paths and how the components connect (§3).
3. The invariants that hold across every component (§4).
4. The index of components, and the questions that belong to no single one (§5, §6).

Every other decision lives in the component that owns it. A decision and a question live in exactly
one place. Cite a rule by number (R1 to R20) and a component by folder, never by section number:
section numbers move, folder names and rule numbers do not.

## 2. Vocabulary (bound — do not use another word for these)

| Term | Meaning | Owner |
|---|---|---|
| **Capture** | One photographed state of the wall, showing the whole sticker area. Immutable. Every capture is recorded, kept locally, and folds into the lineage. Never say "photo". | `01-capture/` |
| **Moment** | A capture the owner elects to share. Every moment is a capture. Not every capture is a moment. | `01-capture/` |
| **Reading** | The value of one feature at one instant. It has an id and a declared range. | `03-feature-dsl/` |
| **Soul** | The published seed. Small, fixed-width, deterministic, shared, kept forever. | `02-extraction/` |
| **Lineage** | The bounded digest that carries the history of captures forward. | `02-extraction/` |
| **Extraction** | The method that folds a capture, plus everything before it, into the next lineage, and derives a soul from it when the capture is a moment. | `02-extraction/` |
| **Generator** | Whatever renders sound from a soul. | `07-renderer/` |
| **Stream** | The viewer-local sequence of CC values the applet sends. Personal, disposable, kept by nobody. | `08-applet/` |

`buffer`, `control`, `perturbation`, `tick`, `tap`, `test source`, `curve`, `probe`, and `take` are applet terms. They
never appear in extraction, and `curve` never appears in the Mapping DSL.

**The soul and the stream are both randomness derived from an image.** Blurring the two words breaks
R4, because R4's reproducibility claim only covers the soul.

## 3. The two paths

**The piece.** Every capture advances the lineage. A moment publishes a soul. This path runs when someone
alters the wall.

```
[01 Capture]      whole sticker area photographed -> capture
      |           the owner elects some captures -> moments
[02 Extraction]   capture + lineage -> next lineage                (R1 to R20)
      |           moment only: lineage -> published soul
[03 Feature DSL]  declared readings from each capture
      |
[04 Mapping DSL]  reading -> sound parameter, one declared mode per mapping
      |           compiles to OSC
[05 Playground]   Sonic Pi or Overtone. Where Catalina composes. Not the shipped renderer.
      |           MIDI CC out, native to both engines
[06 Bridge]       virtual MIDI port on the same machine
      |
[07 Renderer]     Strudel in the browser. midin(). Renders locally.
```

**The instrument.** A viewer tunes what they hear. This path runs while listening.

```
[02 Extraction]   published soul + moment, read only
      |
[08 Applet]       buffer, controls, perturbation, readings -> stream
      |           MIDI CC out via Web MIDI
[06 Bridge]       virtual MIDI port
      |
[05 Playground]   Sonic Pi
```

**The default listening path.** Confirmed on 2026-10-29. Strudel renders from the published soul alone.
The listener needs a supported browser and nothing else: no playground and no virtual MIDI port. The
chain above, through `05-playground/` and `06-bridge/`, stays available for a listener who installs Sonic
Pi and a virtual MIDI port to hear the piece at its full extent. It is an option, not a requirement. How
Strudel reads the soul directly is not designed yet, and `07-renderer/` owns that question.

MIDI runs in opposite directions on the two paths. That is deliberate. A virtual MIDI port carries each
direction separately, so neither path blocks the other. The two paths also run at different rates: the
piece advances at the rate of the wall (R10), and the instrument advances at the tick rate.

Each listener runs their own instance. No shared audio stream and no central server keep the piece
running.

## 4. Invariants

These hold across every component. A component may add to them and may never weaken one.

1. **Verified or confirmed.** To **verify** a claim is to find a source for it. To **confirm** a claim is
   for Catalina to decide it. A claim about a tool, a library, or feasibility is one or the other.
   Anything unresolved is an open question in the owning component, never a silent assumption. Do not
   assert a capability from memory. This rule already paid for itself: research showed Strudel's OSC
   support is send-only, which is why `06-bridge/` is MIDI and not OSC.
2. **Determinism is the soul's alone.** Extraction is pure and deterministic (R4). Everything downstream
   of `trigger` and `range` mode is each listener's own and is not reproducible.
3. **AGPL-3.0-or-later.** Integrating Strudel puts the whole project under AGPL-3.0-or-later. The repo
   stays public, the source ships alongside the hosted site, and Strudel's copyright notices stay
   intact. Never propose a proprietary dependency, a private repo, or a closed backend component. Firm,
   not a preference.
4. **Static only.** Distribution is a public GitHub repo plus GitHub Pages: no backend, no database, no
   server-side code, no accounts. Automatic HTTPS, which Web MIDI requires. A 1GB site limit and 100GB
   of bandwidth per month, both soft. A format the browser cannot parse with what it already provides is
   a dependency in disguise.
5. **A virtual MIDI port is local to one machine** and is not visible on a network. One shared static
   page therefore serves everyone, because each person's local playground feeds their own browser
   session.
6. **Stdlib only, no build step.** Python 3.14 with no pip and no third-party module for `scripts/`.
   Vanilla JavaScript with no build step and no dependency for anything the browser runs. This keeps the
   site servable by GitHub Pages and the repo AGPL-clean.
7. **Web MIDI needs a supported browser.** Chrome, Edge, Opera, Samsung Internet, and Firefox 108 and
   later. Not Safari on macOS or iOS, with no roadmap as of 2026. The applet needs one, and so does the
   renderer on its optional MIDI path. The default listening path does not use Web MIDI.
8. **Distributable to any wall.** Anyone may run The Window on their own wall: fork the repo, take
   captures, extract the soul locally, and publish to GitHub Pages. Confirmed on 2026-10-29. Three
   consequences:
   - Nothing in the chain may depend on one particular wall. A fact about one wall (its colour, its
     alignment points, its orientation in the frame) is that wall's declaration, not a rule of the piece.
   - The person who forks is comfortable with git and a terminal. Extraction stays stdlib Python under
     `scripts/`, run on the owner's machine, because captures never leave it (R13).
   - A fork ships with Catalina's composition as the default sound, and the owner may replace it.

## 5. The components

| Folder | Component | Status |
|---|---|---|
| `01-capture/` | The wall, the camera, and which captures become moments | Capture and election settled as R19. Handheld camera settled. Standardization open. |
| `02-extraction/` | Soul and lineage. Rules R1 to R20. The publication shape. | Rules settled. Retention and format open. |
| `03-feature-dsl/` | The readings a moment yields | Shape settled. The concrete feature set open. |
| `04-mapping-dsl/` | Reading to sound parameter, and the OSC it compiles to | Shape settled. Per-mapping modes open. |
| `05-playground/` | Sonic Pi or Overtone, where Catalina composes | Settled. Engine choice open, low stakes. |
| `06-bridge/` | The virtual MIDI port | Settled. |
| `07-renderer/` | Strudel in the browser | Default path from the soul alone settled. How Strudel reads the soul open. |
| `wall/` | This fork's wall: surface, orientation, alignment points, sticker-area bound, the wall's rules | Catalina's wall declared in prose. Machine form open. |
| `08-applet/` | The viewer instrument | Shape, loop, controls, output, debug mode, and all five artistic choices settled. Readings and perturbation open. |

Unsettled fragments that need working space live in the owning component's `open/` folder. A file there
holds the question, the fixed constraints, and the options. It holds no decision, and nothing cites it as
a source. When a fragment settles, the decision goes into the component README and the working file is
deleted.

## 6. Questions that belong to no single component

- **End-to-end latency and reliability of the full chain.** Every link is verified alone. The chain is
  not. This is the only question about the chain as a whole, which is why it is here.
- **How does a fork describe its wall?** Invariant 8 makes every wall-specific fact a declaration. Which
  fields the declaration holds, which component owns it, and how its version travels with the soul (as
  R7 does for the extraction version) are not designed. The facts recorded for Catalina's wall in
  `01-capture/` and `02-extraction/` are the first example of one.

## 7. Working method

Settle one fragment at a time. Do not scaffold the next layer while working on this one. One exception:
the debug mode of `08-applet/` crosses layers on purpose, because the feature set, the
standardization method, and the sound are found there by experiment. `scripts/osc.py`
and `scripts/raw/cr3.py` are the only code that exists; everything else is design, and code for a component waits on that
component's open questions.

Use `/verify-claim` before adding a capability claim, and `/log-source` to record the citation in the
owning component's **Sources** section.

## 8. Sources for the invariants

Every other citation lives in the component that relies on it. These three are cross-cutting, so they live
here.

- **Strudel's licence** — AGPL-3.0-or-later, confirmed from Strudel's FAQ and licence file. Source:
  strudel.cc docs, tidalcycles/strudel repo. Full component detail in `07-renderer/`.
- **GitHub Pages** — free static hosting, automatic HTTPS, a 1GB site size and 100GB monthly bandwidth as
  soft limits, public repo required on the free tier. Confirmed 2026. Source: multiple independent 2026
  writeups, cross-checked against each other.
- **Web MIDI browser support (2026)** — works in Chrome, Edge, Opera, Samsung Internet, and Firefox 108 and
  later. Unsupported in Safari on macOS and iOS, with no roadmap, citing fingerprinting. Source:
  web-platform-dx feature tracker, testmuai.com (2026), Super Simple Piano compatibility chart (2026).
