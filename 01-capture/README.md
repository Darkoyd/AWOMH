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
- Standardization is a software step that aligns each capture to fixed points on the wall and takes the
  sticker area from it. `02-extraction/` owns the step, because R4 lives there. Confirmed on 2026-10-29.
- Each fork declares its own wall in `wall/`: the surface colour, the orientation in the frame, the
  alignment points, and the bound of the sticker area. Nothing in this component names one wall (root
  `README.md`, invariant 8). Confirmed on 2026-10-29.
- A capture shows every alignment point and the whole sticker area that `wall/` declares.
- Every wall keeps two rules: no sticker covers an alignment point, and no sticker goes past the declared
  bound of the sticker area. The standardization method holds only while both hold.
- A raw capture enters the chain through a raw adapter under `scripts/raw/`, one per camera format. The
  first adapter is Canon `.cr3`. Confirmed on 2026-10-29.

## 4. Open questions

- **What happens to a capture that does not show every alignment point?** Every capture folds into the
  lineage (R19), so such a capture still needs a defined result. Options: the step fails loudly and the owner retakes (the failed capture still folds in under
  R19), or the step has a fallback.
- **Which camera formats get an adapter next?** Common candidates are Nikon `.nef`, Sony `.arw`, and phone
  JPEG or HEIC. Each format needs its own `/verify-claim` before its adapter is written.
- **Where is the capture archive backed up?** It is the only copy of the chain's blocks, and it is never
  published. One lost capture makes replay impossible from that capture on (R14). A backup must stay
  private and must not enter the public repo (R13).

## 5. Sources

- **Canon `.cr3` container.** An ISO BMFF (ISO/IEC 14496-12) file with Canon custom boxes. It embeds a
  1620 × 1080 JPEG preview in a top-level `uuid` box `eaf42b5e-1c98-4b88-b9fb-b7dc406e4d16`, inside a
  `PRVW` box: JPEG size at offset 20, JPEG data from offset 24. It also embeds a 6000 × 4000 JPEG in
  track 1 and a 160 × 120 thumbnail. Source: lclevy/canon_cr3, observed 2026-10-28.
  <https://github.com/lclevy/canon_cr3>
  Tested 2026-10-28 on 23 local captures with a stdlib parser: every one holds a 1620 × 1080 preview that
  starts `FFD8`, ends `FFD9`, and is baseline JPEG (`SOF0`, marker `FFC0`). `scripts/raw/cr3.py`
  implements that parser.
