# The Window

A cabinet wall fills with stickers over time. Each addition is photographed. Every
**capture** is recorded and folds into the soul. The captures the owner shares are **moments**, and they
drive an evolving, long-form generative music piece. Every listener renders locally and independently. There is no
shared listening experience, by design.

## The documents

`README.md` in the root describes the whole. It owns the bound vocabulary, the two paths, the invariants
that hold everywhere, and the index of components. Read it first.

Every other decision lives in the component folder that owns it. One folder, one component of the chain:

| Folder | Owns |
|---|---|
| `01-capture/` | The wall, the camera, which captures become moments. |
| `02-extraction/` | Soul and lineage. Rules R1 to R20. The publication shape. |
| `03-feature-dsl/` | The readings a moment yields: id, scope, range. |
| `04-mapping-dsl/` | Reading to sound parameter. `seed`, `trigger`, `range`. Compiles to OSC. |
| `05-playground/` | Sonic Pi or Overtone. Where Catalina composes. Not the shipped renderer. |
| `06-bridge/` | The virtual MIDI port, in both directions. |
| `07-renderer/` | Strudel in the browser. The shipped renderer. |
| `08-applet/` | The viewer instrument. Normal mode and debug mode. |
| `wall/` | This fork's wall: the facts true of one wall only. A fork replaces it. |

**A decision and an open question live in exactly one place.** Cite rules by number (R1 to R20) and
components by folder. Never cite a section number across documents: section numbers move, folder names and
rule numbers do not.

Each component folder may hold an `open/` folder: one file per unsettled fragment. Such a file holds the
question, the fixed constraints, and the options. It holds no decision, and nothing cites it as a source.
When a fragment settles, write the decision into that component's `README.md` and delete the working file.

## Vocabulary (bound — do not use another word for these)

- **Capture** — one photographed state of the wall. Immutable. Every capture is recorded, kept locally,
  and folds into the lineage. Never say "photo".
- **Moment** — a capture the owner elects to share. Every moment is a capture. Not every capture is a
  moment.
- **Reading** — the value of one feature at one instant. It has an id and a declared range.
- **Soul** — the published seed. Shared, deterministic, kept forever.
- **Lineage** — the bounded digest that carries the history of captures forward.
- **Stream** — the viewer-local CC values the applet sends. Personal, disposable, kept by nobody.
- **Buffer**, **control**, **perturbation**, **tick**, **tap**, **test source**, **curve**, **probe**, **take** — applet terms
  only. They never appear in extraction, and **curve** never appears in the Mapping DSL.

The soul and the stream are both randomness derived from an image. Blurring the two words breaks R4.

## Working method (non-negotiable)

Two words, two meanings. To **verify** a claim is to find a source for it. To **confirm** a claim is for
Catalina to decide it. Claims about tools, libraries, or feasibility are **either verified or confirmed**.
Anything unresolved goes in the owning component's open questions, never silently assumed.

- Do not assert a capability from memory. Verify it, then cite the source in that component's **Sources**
  section.
- If you cannot verify it, and Catalina has not confirmed it, it is an open question. Say so.
- This rule already paid for itself: research showed that Strudel's OSC support is send-only, which is why
  the bridge is MIDI and not OSC.

Use `/verify-claim` before adding a capability claim. Use `/log-source` to record the citation.

## Two paths

```
The piece:      01-capture -> 02-extraction -> soul
                           -> 03-feature-dsl -> 04-mapping-dsl -> OSC
                           -> 05-playground (Sonic Pi/Overtone) -> MIDI CC
                           -> 06-bridge -> 07-renderer (Strudel in the browser)

The instrument: 02-extraction (soul, read only) -> 08-applet -> MIDI CC via Web MIDI
                           -> 06-bridge -> 05-playground
```

MIDI runs in opposite directions on the two paths. That is deliberate, and a virtual MIDI port carries each
direction separately. The playground is where Catalina composes. It is **not** the shipped renderer.
Strudel is.

## Licensing constraint

Integrating Strudel puts the whole project under **AGPL-3.0-or-later**. The repo stays public, the source
ships alongside the hosted site, and Strudel's copyright notices stay intact. Never propose a proprietary
dependency, a private repo, or a closed backend component. This is firm, not a preference.

## Environment

This machine has Python 3.14 and Node 20, and **no pip and no third-party Python modules**. Code under
`scripts/` is therefore stdlib-only and runs as-is. Do not add a dependency to it without saying so.

`scripts/osc.py` and `scripts/raw/cr3.py` (the Canon raw adapter) are the only code that exists. Everything
else is design.

The applet is vanilla JavaScript, with no build step and no dependency. That keeps it servable by GitHub
Pages and keeps the repo AGPL-clean.

Sonic Pi is not installed here, so no link that touches the playground runs on this machine.

`moments/` holds one image and nothing else, under R6.

## Status

The chain, the soul rules, and the applet's shape are settled. What stays open is the concrete feature set,
the per-mapping modes, capture standardization, end-to-end latency, moment retention, and the published format.
Treat code under `scripts/` as scaffolding that waits on those answers.

## Working style

Settle one fragment at a time. Do not scaffold the next layer while working on this one. One exception:
the debug mode of `08-applet/` crosses layers on purpose, because the feature set, the
standardization method, and the sound are found there by experiment.
