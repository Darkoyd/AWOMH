# 04 — Mapping DSL

**In:** readings from `03-feature-dsl/`, and the soul from `02-extraction/`.
**Out:** OSC messages.
**Next:** `05-playground/`. `scripts/osc.py` is the encoder.

---

## 1. What this component is

The Mapping DSL binds a reading to a destination sound parameter. It is the first component that knows
anything about sound, and R9 puts that boundary here on purpose.

Its shape is modelled on **libmapper**, a real OSC-based signal-mapping framework, which is where the
split between a sound-agnostic feature side and a sound-aware mapping side comes from.

## 2. The three modes

Every mapping declares exactly one mode. The modes divide along one line: everyone shares the soul, and
freshness is each listener's own.

| Mode | Draws from | Same soul, two listeners |
|---|---|---|
| `seed` | a PRNG seeded by the soul | Identical |
| `trigger` | fresh randomness; the reading only fires the event | Different |
| `range` | fresh randomness, bounded or biased by the reading | Different, inside the same bounds |

## 3. Decisions

- **A mapping states its mode. There is no default.** The choice between reproducible and fresh is
  compositional, and a silent default would make that choice by accident.
- **`seed` mode reads only from the soul-derived PRNG.** It never reads ambient randomness. Otherwise the
  determinism chain breaks at the last link and R4 was pointless.
- **One soul, one PRNG stream, drawn in a declared order.** Two mappings that draw from one stream in an
  unstated order are nondeterministic in effect, even under a fixed seed. **Mapping order is part of the
  piece's definition.**
- **Every listener on the same soul hears the same structure and a different surface.** This is the formal
  statement of "no shared listening experience required": shared skeleton, personal detail.
- **The DSL compiles to OSC.** The transport is one-directional and small-vocabulary, which is why
  `scripts/osc.py` implements the wire format directly instead of taking a dependency.
- **`curve` is not a term here.** A curve belongs to `08-applet/`: it decides only how a value spreads
  across 127 steps. A mapping mode decides what a value *means*.

## 4. Open questions

- **Per-mapping modes: which features use `seed`, `trigger`, or `range`?** This waits on
  `03-feature-dsl/`'s concrete feature set, because a mode is assigned to a feature.
- **The declared draw order**, once more than one `seed` mapping exists. The rule is fixed; the order is
  not written because the mappings are not written.

## 5. Sources

- **libmapper** — real OSC-based signal-mapping framework from McGill IDMIL. Source: libmapper repo and
  IDMIL project pages.
- **OSC 1.0 wire format** — implemented in `scripts/osc.py`: type tags `i`, `f`, `s`, `b`, `T`, `F`, `N`,
  4-byte padding on every field. Timetag arguments, int64, and arrays are deliberately unsupported until a
  mapping needs one.
