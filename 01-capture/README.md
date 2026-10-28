# 01 — Capture

**In:** the physical wall.
**Out:** one **capture** — one photographed state of the wall, showing the whole sticker area, immutable.
Some captures are elected as **moments**.
**Next:** `02-extraction/`.

---

## 1. What this component is

Someone adds a sticker to the cabinet wall. The wall is photographed. That photograph is a capture. A
capture the owner elects to share is a moment.

Every capture shows the **whole** sticker area, never only the new sticker. No feature compares two
captures. What changed between captures is heard through the lineage (`03-feature-dsl/`).

## 2. Captures and moments

Every moment is a capture. Not every capture is a moment. Confirmed on 2026-10-27.

**Every capture is recorded and kept.** Each one folds into the lineage, so each one shapes every later
soul, shared or not. A retake and a failed capture are captures too. The images stay on the owner's
machine, in `captures/`, and are never published or committed. R19 states the rule.

**The owner elects which captures become moments.** Election is publication: a moment publishes a soul,
and a capture that is not elected publishes nothing. The chain counts captures. The soul log counts
moments.

What a moment *keeps* in the repo — whether its image survives next to its soul forever — is a retention
question about the repo, and `02-extraction/` owns it under R6.

## 3. Decisions

- Every capture shows the whole sticker area. The camera never isolates the new sticker.
- A capture is immutable once taken. A moment is immutable once published.
- Every capture is recorded, kept locally, and folds into the lineage (R19).
- Captures are never published or committed. Only moments reach the repo (R5, R13).
- The capture archive is complete and kept forever. Like the blocks of a blockchain, every capture feeds
  the soul, seen or not. Replaying the archive reproduces every soul (R4, R14). Confirmed on 2026-10-27.
- The capture timestamp orders the captures. It matches the order in which the stickers were placed (R4).
- Election equals publication. Only a moment publishes a soul (R19).
- Capture happens when the wall alters, not on a timer (R10).
- The camera is handheld. The owner aims for the same framing every time, and the framing still varies
  from capture to capture. Captures must be standardized so that a framing change does not read as a
  change in the wall. Confirmed on 2026-10-28.

## 4. Open questions

- **How are captures standardized?** A handheld capture is never pixel-aligned with the one before it.
  Every capture folds into the lineage, so a framing change that moves a reading enters the lineage as if
  the wall had changed. A size check catches a moved camera. It does not catch a nudged one. The method is
  found by experiment, in `08-applet/`'s laboratory phase, which loads several captures side by side.
  Fixed constraints:
  - The step must be deterministic on any machine, because replaying the archive must reproduce every
    soul (R4, R14).
  - Code under `scripts/` is stdlib-only. No alignment method is verified for that environment. Run
    `/verify-claim` before anything relies on one.
  - The step must not alter a capture. A capture is immutable.

  Options, not exclusive: a physical aid at capture time (marks on the floor, a framing guide, fiducial
  markers on the cabinet), or a software registration step before extraction. If the answer is a software
  step, `02-extraction/` owns it, because R4 lives there.
- **Where is the capture archive backed up?** It is the only copy of the chain's blocks, and it is never
  published. One lost capture makes replay impossible from that capture on (R14). A backup must stay
  private and must not enter the public repo (R13).

## 5. Sources

Nothing in this component rests on a verified capability claim. It rests on a physical setup that
Catalina confirms.
