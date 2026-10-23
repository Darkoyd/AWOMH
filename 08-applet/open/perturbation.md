# §4.3 Perturbation — working file

**Fills:** `08-applet/README.md` §4.3.
**Blocked on:** nothing. §6 item 3 settled on 2026-09-10 and unblocked this file.
**Holds no decision. Nothing cites this file as a source.**

## The question

What noise does the applet add to the buffer on each tick, and which parts of it does the viewer set?

## Already fixed. Do not open these again.

- Perturbation is the noise the applet adds to the buffer each tick. — §2
- It is step 2 of the tick, after the controls and before the blend. — §3.3
- Step 2 is the only step with randomness. Every control in §4.2 is deterministic. — §4.2
- The section holds amount, character, affected channels, and feedback depth. — §4
- The buffer is a `Float32Array` of `width * height * 3` values in the range 0 to 1, RGB only. — §3.2
- The blend of §3.1 pulls the buffer back toward the moment on every tick. Noise acts against that pull,
  not on a single frame.
- The generator takes the selected moment's soul and local entropy drawn once at session start. No
  viewer-facing seed field exists, and the entropy is written nowhere. — §6 item 3, §4.5

## Open

1. The character of the noise. Per-pixel white noise, value noise at a scale, or a field that drifts
   between ticks. Each sounds different because each alters a whole-frame statistic differently.
2. Whether the three channels take independent noise or one shared field. Independent noise moves the
   saturation reading. A shared field does not.
3. What "feedback depth" alters. §3.1 already gives the loop its leak coefficient `a`. Depth must name
   something `a` does not, or it must go.
4. Whether the noise amount stays inside a declared range, as every control in §4.2 does.
5. Whether a value may leave 0 to 1 after noise, and where the clamp goes. §3.2 declares the range of the
   buffer.
6. How the soul and the session entropy combine into the generator's state. §6 item 3 names both inputs and
   names no method.
7. How a session is investigated when no run repeats. §6 item 3 removed replay and named no replacement.

## To verify

- What local entropy source a browser exposes at session start. §6 item 3 needs one and names no API. Run
  `/verify-claim`, then `/log-source`.
- What metadata survives on a moment, and what a browser reads from it without a third-party parser. The
  applet treats image metadata as a possible source of noise, not a confirmed one. — §9. Run
  `/verify-claim`, then `/log-source`.

## When settled

Write §4.3 into `08-applet/README.md`, then delete this file.
