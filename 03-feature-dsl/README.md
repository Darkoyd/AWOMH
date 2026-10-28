# 03 — Feature DSL

**In:** the current moment and the lineage.
**Out:** **readings** — plain numbers and vectors, each with an id and a declared range.
**Next:** `04-mapping-dsl/`. The same ids also serve `08-applet/`.

---

## 1. What this component is

The Feature DSL declares what the piece reads from a moment. It is the whole vocabulary of the piece's
inputs: if a mapping wants to hear something, that something is a declared feature first.

Features output plain numbers and vectors. They name no sound parameter, no instrument, no frequency, and
no CC number. That is R9, and the Feature/Mapping split — modelled on libmapper — holds only while this
side stays sound-agnostic.

## 2. What a feature declares

| Field | Meaning |
|---|---|
| **id** | The name. One vocabulary serves the whole piece, including the applet. |
| **scope** | What the feature may read. See §3. |
| **type and range** | The declared output shape and bounds. |
| **extraction method** | A tag naming how the value is computed. |
| **soul-bearing** | Whether the value feeds the soul. See §4. |

## 3. Scope

Scope means "what this feature may read".

| Scope | Reads | Notes |
|---|---|---|
| `:whole` | the current moment | Always available, including for the very first moment. |
| `:lineage` | the current moment and the lineage | How a feature perceives history under R1. Bounded by R2. |

`:lineage` scope exists because of R18: the generator never reads lineage tiers directly. A mapping that
wants to hear the wall's long arc declares that arc as a `:lineage` feature, so every input to the sound
side is named, ranged, and visible here instead of reaching into internal state.

## 4. Decisions

- **No feature compares two moments.** There is no `:delta` scope. Change between captures comes from the
  lineage, which already holds momentum, variance, and the recent gesture (`02-extraction/`). A feature
  that wants to hear change declares it with `:lineage` scope. Confirmed on 2026-10-28.

- **Every feature declares whether it feeds the soul.** A soul-bearing feature must satisfy R4 strictly. A
  feature that only colours the surface may be looser. Mixing the two silently is what makes a
  reproducibility bug impossible to find later.
- **A feature declares its range and stays inside it.** An out-of-range value means a broken extractor and
  must fail loudly. Clamping hides the break behind a plausible number.
- **Features name no sound parameter** (R9).
- **One reading vocabulary serves the whole piece.** `08-applet/` displays readings under these same ids.
  Sharing ids does not make the applet an extractor — it shares the vocabulary, not the role (R20).
- **The feature count *F* sizes the lineage.** Tiers 2 to 4 are per-feature, so adding a feature widens
  the lineage (R11).

## 5. Open questions

- **The concrete feature set: which readings get defined first, and how many?** This is the piece's
  largest open item, and three other components wait on it:
  - `02-extraction/` cannot size the lineage tiers without *F*.
  - `04-mapping-dsl/` cannot assign per-mapping modes to features that do not exist.
  - `08-applet/`'s readings section has nothing to display.

  The set is found by experiment, in `08-applet/`'s laboratory phase. A candidate there is a **probe**,
  not a reading. A probe enters this DSL only when Catalina promotes it, so no placeholder id becomes
  vocabulary by accident.
- **Does a feature survive handheld framing?** The camera is handheld (`01-capture/`). A feature whose
  value moves when the framing moves feeds camera noise into the lineage, and the lineage then reports
  that noise as change in the wall. `01-capture/` owns the standardization question.

## 6. Sources

- **libmapper** — the model for the Feature/Mapping split. See `02-extraction/README.md` §8.
