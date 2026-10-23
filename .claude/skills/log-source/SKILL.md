---
name: log-source
description: Record a verified finding in the Sources section of the component of The Window that owns it, and move any question it resolves out of that component's Open questions into its Decisions. Use after a claim has been verified or confirmed by Catalina.
---

# Log a source

What to log: `$ARGUMENTS` (if empty, ask what was verified and where the evidence came from).

## Preconditions — check before editing anything

A finding may only be logged if it is **verified against a source** or **confirmed directly by Catalina**.
If it is neither, stop and run `/verify-claim` instead. Logging an unsourced claim defeats the point.

Ask which of the two it is if it is not obvious. "Catalina confirmed" is a legitimate provenance for
preferences, the physical setup, and artistic decisions — record it as such rather than dressing it up with
a citation.

## Where it goes

Sources live in the component that relies on the claim, never in one central log. Pick the folder from the
root `README.md` §5 index:

| The claim is about | Folder |
|---|---|
| the camera or the wall | `01-capture/` |
| soul, lineage, hashing, publication | `02-extraction/` |
| features, scopes, ranges | `03-feature-dsl/` |
| mapping, modes, OSC | `04-mapping-dsl/` |
| Sonic Pi or Overtone | `05-playground/` |
| virtual MIDI ports, hot-plug | `06-bridge/` |
| Strudel, Web Audio | `07-renderer/` |
| Web MIDI from a page, the browser instrument | `08-applet/` |
| a cross-cutting invariant (licence, hosting, browser support) | root `README.md` |

A claim that two components rely on goes in the one that owns it, and the other cites the folder.

## What to write

A **Sources** entry, matching the existing style exactly:

```
- **<Thing>** — <what specifically was confirmed, including the API name or exact limit>. Source: <source>.
```

Keep it concrete. "Confirmed working" is useless a year from now; "`midin()` returns a CC accessor,
confirmed in the MIDI & OSC docs" is not. Include the year for anything version- or date-sensitive
(browser support, platform limits, pricing, licensing).

## Ripple effects — this is the part that gets missed

A new finding usually touches more than the Sources list. Check each:

- Does it **resolve** an Open question in that component? Move it to Decisions as a declarative line with
  its consequence, and delete it from Open questions.
- Does it settle a fragment with a file under that component's `open/`? Write the decision into the README
  and delete the working file.
- Does it **contradict** something in another component or in the root README's invariants? Fix the
  affected text, and check `scripts/` for code built on the old understanding.
- Does it **raise** a new uncertainty? Add that to the owning component's Open questions.
- Update `Last updated` in the root `README.md`.

Delegate the edits to the `architecture-doc-keeper` agent, which owns these files and enforces the
Decisions / Open questions / Sources invariants. Then tell the user what moved where.
