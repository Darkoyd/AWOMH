---
name: verify-claim
description: Verify a factual claim about a tool, library, protocol, or platform limit before it enters The Window's documents. Use before writing any capability claim into a component README, or when re-checking a claim that may have gone stale.
---

# Verify a claim

The claim to verify: `$ARGUMENTS` (if empty, ask which claim, and do not guess from recent context).

## 1. Sharpen the claim

Restate it as something falsifiable before researching. "Strudel supports OSC" is not falsifiable as
written — "Strudel can *receive* OSC messages and bind them to pattern parameters" is. Split compound
claims into sub-claims and handle each separately; compound claims are where errors hide.

## 2. Check whether it is already answered

Find the component that owns the claim from the root `README.md` §5 index. Then grep that component's
**Sources**, **Decisions**, and **Open questions**, plus any file under its `open/`. The claim may already
be verified (then report the existing citation and its date), already contradicted, or already logged as
open. Also check the root `README.md` §4 invariants and §8 sources for a cross-cutting claim, and `scripts/`
for code that assumes it.

## 3. Research

Spawn the `research-verifier` agent with the sharpened claim. It returns a verdict —
VERIFIED / CONTRADICTED / PARTIAL / UNVERIFIABLE — with citations and a ready-to-paste Sources line.

For a claim only Catalina can settle (a preference, the physical setup, an artistic decision), skip the
research and say plainly that this one needs a confirmation rather than a source.

## 4. Report — do not silently file it

Give the user the verdict, the evidence, and the concrete API name or quoted text. Then:

- **VERIFIED** → offer to add the Sources line, in the owning component, via the `architecture-doc-keeper`
  agent.
- **CONTRADICTED** → say what breaks. Name every component README and every file under `scripts/` that
  depends on the false claim; that is the actual cost.
- **PARTIAL** → report exactly which half holds.
- **UNVERIFIABLE** → propose an Open questions entry for the owning component. This is a real result, not a
  failure.

Never round UNVERIFIABLE up to VERIFIED because the claim seems plausible. The project's working method
exists precisely to catch confident-sounding recall, and it has already caught one such error.
