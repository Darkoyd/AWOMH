# 01 — Capture

**In:** the physical wall.
**Out:** one **moment** — one photographed state of the wall, showing the whole sticker area, immutable.
**Next:** `02-extraction/`.

---

## 1. What this component is

Someone adds a sticker to the cabinet wall. The wall is photographed. That photograph, once published, is
a moment.

Every moment shows the **whole** sticker area, never only the new sticker. Isolating what is new is the
job of a `:delta` feature (`03-feature-dsl/`), and a diff needs both frames.

## 2. Which captures become moments

Not every image of the wall is a moment. The owner elects which captures get shared. Election **is**
publication, and R19 already covers it: the chain advances only on publication, so a discarded
photograph, a failed capture, or a retake leaves no trace and produces no soul. The chain counts souls,
not shutter presses.

An unelected capture is therefore not a moment and needs no name of its own.

What an elected moment *keeps* — whether its image survives next to its soul forever — is a retention
question about the repo, and `02-extraction/` owns it under R6.

## 3. Decisions

- Every moment shows the whole sticker area. Isolating the new sticker is a feature's job, not the
  camera's.
- A moment is immutable once published.
- Election equals publication (R19). No separate vocabulary for an unelected capture.
- Capture happens when the wall alters, not on a timer (R10).

## 4. Open questions

- **Fixed camera or handheld?** This is the component's one real open item, and it decides whether
  `:delta` extraction is a plain pixel diff or needs alignment first. A clean pixel diff requires a fixed
  camera position. A handheld photograph requires alignment before any `:delta` feature is meaningful.
  Consequence if handheld: every `:delta` feature rests on an alignment step that does not exist yet. A
  size check catches a moved camera. It does not catch a nudged one.
  Only Catalina can settle this one — it is about the physical setup, not about a source.

## 5. Sources

Nothing in this component rests on a verified capability claim. It rests on a physical setup that
Catalina confirms.
