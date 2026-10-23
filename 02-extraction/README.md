# 02 — Extraction

**In:** `moment_n` from `01-capture/`, and `lineage_{n-1}` from the repo.
**Out:** `soul_n` and `lineage_n`. The soul is published and kept forever. The lineage is committed and is
input to the next extraction only.
**Next:** `03-feature-dsl/` reads the moment. `08-applet/` reads the published soul.

---

## 1. What this component is

Extraction turns a moment, plus everything that came before it, into a seed. It is the load-bearing
component of the piece: every rule below exists because the soul depends on the **history** of images
while the repo keeps only the **last** one.

Rules carry stable numbers, R1 to R20. Other components cite those numbers. A rule keeps its number
forever, including through an amendment.

## 2. The constraint that shapes everything

The soul depends on the history of images. The repo keeps only the last moment. These two facts agree
only if nothing ever re-reads the history.

> **R1. Extraction is a fold, not a query.**
> `soul_n, lineage_n = extraction(moment_n, lineage_{n-1})`
> Extraction sees exactly one moment and one lineage. It may never require access to the archive.

Everything below follows from R1.

> **R2. The lineage is bounded and small.**
> Its size must not grow with the number of moments. A lineage that accumulates a per-moment record is a
> moment archive under a different name. It brings back the weight that R1 exists to avoid.

> **R3. The lineage is chained, so each soul depends on every moment before it.**
> `lineage_n` comes from `lineage_{n-1}`. The hundredth soul therefore carries the influence of the first
> moment, and that moment exists nowhere. The wall's history survives as *effect*, not as *record*. The
> archive is the soul, not the disk.
> Catalina confirmed on 2026-09-10 that this is what "the soul is built from all the images" means.

> **R4. Extraction is pure and deterministic.**
> Same moment plus same lineage gives the same soul, on any machine, forever. No wall-clock. No ambient
> randomness. No unordered iteration. No dependence on file paths or capture metadata. This is not a
> style preference. The soul is a PRNG seed, and the whole claim of `seed` mode is reproducibility. A
> nondeterministic extraction makes that claim false everywhere downstream.

> **R5. The repo keeps souls. It does not keep moments.**
> Souls are tiny. Keep every one of them, append-only, forever. That log *is* the work's history. It is
> also the only thing that makes an old state reproducible. Moments are heavy, and the repo keeps them
> only as far as R6 requires.

> **R6. Moment retention is the minimum the declared features need.**
> One moment if every feature is `:whole` scope. Two, the current and the immediately previous one, if
> any `:delta` feature exists, because a diff needs both. A feature that needs more history is a decision
> to carry more weight in the repo. Argue for it. Do not slip it in.
> *Under argument: see `open/moment-retention.md`.*

> **R7. Extraction carries a version, and the version travels with the soul.**
> An alteration to the extraction alters every future soul. Each soul record states its
> `extraction_version`. That record keeps R4's promise honest, because it marks which souls compare to
> which. Old souls stay valid because the repo stored them (R5), not because anything can recompute them.

> **R8. Extraction never re-derives an old soul.**
> Extraction writes a soul once and never recomputes it. A recomputed soul under a newer extraction is a
> different soul under an old date. Corrections append. They do not rewrite.

> **R9. Extraction knows nothing about sound.**
> It emits numbers. No sound parameter, instrument name, frequency, or CC number appears anywhere in
> extraction or in the lineage. The Feature and Mapping split, modelled on libmapper, holds only while the
> extraction side stays sound-agnostic.

> **R10. Publication of a soul is a discrete, deliberate event.**
> A new soul appears when someone adds a sticker. Not on a timer. Not on every commit. The piece advances
> at the rate the wall does.

## 3. Lineage contents

R2 demands a fixed-size digest of an unbounded past. The lineage therefore cannot remember events. It can
remember only *shapes*. What it keeps is a statement about what the piece considers worth remembering.

The lineage is **stratified by time depth**, the way the wall is. Each tier answers a different question
about the past, and each tier has its own bound. *F* is the number of features.

| Tier | Field | Remembers | Size |
|---|---|---|---|
| 0 — Identity | `chain` | that *this exact* history happened, unrepeatably | 32 bytes |
| 1 — Age | `generation` | the number of published souls | 1 int |
| 2 — Lifetime | `count`, `mean`, `m2`, `min`, `max` per feature | the slow arc across the whole life of the wall | 5 × F |
| 3 — Momentum | `ema_fast`, `ema_slow` per feature | the recent direction of movement | 2 × F |
| 4 — Gesture | last *k* quantised feature frames (*k* ≈ 4) | the short-term texture of recent movement | k × F |

Tier 0 is what makes R3 true: `chain_n = H(chain_{n-1} ‖ frame_n ‖ extraction_version)`.

Tiers 2 to 4 make the past *legible*. A chain alone is irreversible, and it says nothing a mapping can
read. A running mean can say "the wall grew denser over the last year". Tier 3 minus Tier 2 gives drift
against the lifetime norm. `ema_fast` minus `ema_slow` gives direction. Variance comes from Welford's
`m2`, which updates in fixed space.

> **R11. The lineage is bounded by feature count, never by moment count.**
> This is the operational form of R2. Any field whose size depends on the number of moments is forbidden,
> however small its per-moment cost. Tier 4's window is legal because *k* is fixed in advance. It becomes
> illegal the moment *k* means "all of them".

> **R12. Quantise before hashing.**
> Feature values enter the chain as fixed-precision integers, never as floats. Hashing the text form of a
> float makes the chain depend on one language's formatting rules. R4 promises determinism *on any
> machine, forever*, including machines that do not run the language this was written in. Quantisation is
> also the honest admission that the soul does not need more precision than the camera earns.

> **R13. The chain is one-way.**
> The lineage cannot be inverted to recover a moment. It cannot even establish what a moment contained.
> Once the moments are discarded, they are genuinely gone. What the piece publishes does not recover the
> wall's images. This property is worth keeping deliberately, because the moments show someone's home.

> **R14. The lineage is irreplaceable, and git is its archive.**
> Nothing can recompute it once the moments are gone. Losing it ends the chain, and any future soul then
> starts a new lineage instead of continuing this one. Committing it on every publication means version
> control already holds every historical lineage, at no extra cost and no extra design effort.

> **R15. The lineage carries a schema version, separate from the extraction version.**
> R7 versions the *method*. This versions the *shape of the memory*. Adding a tier or altering *k* alters
> what the past means. The two version fields answer different questions: "did the same method compute
> this?" against "does this remember the same things?"

> **R16. A schema alteration forks or continues, explicitly.**
> When the tier layout alters, the old lineage either migrates forward or the chain restarts. A migration
> states what the new fields hold for a past that never recorded them. Both routes are legitimate.
> Choosing one by accident is not.

> **R17. The soul is derived from the lineage, and is not equal to it.**
> `soul = H(chain ‖ generation)`, truncated to the declared soul width. The lineage is working state. The
> soul is the published artefact. Keeping them distinct means the internal memory can be restructured
> without altering what a generator consumes.

> **R18. The lineage is opaque to the generator.**
> The generator receives the soul and the current readings. It never reads tiers directly. A mapping that
> wants to hear the wall's long arc must declare that arc as a `:lineage`-scope *feature*. This keeps
> every input to the sound side named, ranged, and visible in the Feature DSL, instead of reaching into
> internal state.

> **R19. The chain advances only on publication.**
> One published soul, one link. A discarded photograph, a failed capture, or a retake leaves no trace. The
> chain counts souls, not shutter presses, so `generation` stays meaningful as the age of the piece.
> This is also the whole of election: `01-capture/` §2.

## 4. The boundary with interaction

> **R20. Interaction alters the surface, never the soul.**
> Tools operate on the `trigger` and `range` side. That freshness is already each listener's own. The
> soul stays fixed, so tuning alters what *this* listener hears. It does not fork the piece, and it does
> not make an old soul irreproducible. Anything that would alter the soul is not tuning. It is a new
> moment.

`08-applet/` is that tooling. It writes no soul, no lineage, and no file in the repo. Its output is a
**stream**: viewer-local, personal, kept by nobody. The soul is shared and kept forever. Those two words
never name the same thing.

Reading is not writing, and the two directions are not symmetric. The applet **reads** the published soul
and the moment it belongs to. Nothing the applet does reaches the soul.

## 5. Publication shape

The repo holds these and serves them statically:

- `soul/current.json` — the newest soul and its `extraction_version`.
- `soul/log.jsonl` — every soul, append-only (R5, R8).
- `soul/lineage.json` — the carried digest (R2). Opaque to the renderer (R18). Input to the next
  extraction only.
- `moments/` — one or two images (R6), and nothing else.

All of it is text-sized and well inside GitHub Pages' limits. It grows at the rate of the wall, not at the
rate of the moments.

`08-applet/` reads the published files, so this shape is a public interface and not only an internal one.
The concrete format is open: `open/published-format.md`.

## 6. Decisions

- Extraction is a fold over one moment and one lineage. It never reads the archive (R1).
- The soul is published and kept forever. Moments are not (R5, R6).
- The lineage is a fixed-size, tiered digest, and git is its archive (R2, R11, R14).
- The soul is derived from the lineage and is not equal to it (R17).
- The generator never reads the lineage. A `:lineage`-scope feature is the only route (R18).
- Extraction emits numbers and names no sound parameter (R9).
- Two independent version fields: the extraction version and the lineage schema version (R7, R15).
- Election equals publication. No new vocabulary for an unelected capture (R19).
- The applet reads the soul and writes nothing (R20).

## 7. Open questions

Settled in `01-capture/`, `03-feature-dsl/`, or `04-mapping-dsl/` if they look adjacent. These are this
component's own.

- **Which features are soul-bearing?** Tiers 2 to 4 size themselves on *F*, so this sets the lineage's
  budget. Until it is answered, the tier table is a shape without dimensions. It waits on
  `03-feature-dsl/`'s feature set.
- **How wide is a soul?** This decides how much of the wall survives into the seed (R17).
- **What are *k* and the two EMA decay rates?** The piece's memory lengths in literal terms. How long
  does a gesture stay in the short window? How fast does the recent past fade into the lifetime average?
  Musical decisions in numeric clothing.
- **What quantisation step does R12 use?** Coarse quantisation hides small wall alterations from the
  chain. Fine quantisation makes camera noise a source of soul movement. This is the same decision as
  "does the soul move smoothly or sharply", seen from the other side.
- **Does an unchanged wall produce a new soul?** Two moments with no new sticker: the same soul, or does
  the lineage advance anyway?
- **Does the soul move smoothly or sharply?** A small alteration to the wall could nudge the soul or
  scramble it. Artistic, and no technical argument settles it.
- **Does R6 change?** Working file: `open/moment-retention.md`.
- **What format do the published files use?** Working file: `open/published-format.md`.

## 8. Sources

- **libmapper** — real OSC-based signal-mapping framework from McGill IDMIL. The model for the
  Feature/Mapping split that R9 protects. Source: libmapper repo and IDMIL project pages.
- The static-hosting limits that §5 relies on are in the root `README.md` §4, verified there.
