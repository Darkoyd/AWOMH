# 08 — Viewer applet

**In:** the published moments and their souls, read only, from `02-extraction/`.
**Out:** a **stream** of MIDI CC via Web MIDI, through `06-bridge/` into `05-playground/`.
**Ships as:** a static page. Vanilla JavaScript, no build step, no dependency.

---

## 1. What the applet is

The applet is a **viewer instrument**. It is not a second extractor.

```
Extraction (offline):  moment -> soul -> committed to the repo
Applet (in browser):   moment -> readings -> MIDI CC -> Sonic Pi
```

It reverses the direction of MIDI that the piece's own path uses. That reversal is deliberate, and
`06-bridge/` records why it costs nothing.

R20 already draws the boundary. Interaction alters the surface. It never alters the soul. The applet
therefore writes no soul, no lineage, and no file in the repo.

The applet **reads** the published soul, and the moment that soul belongs to. §4.5 holds the mechanism.
Reading is not writing, and the two directions are not symmetric: the soul reaches the applet, and nothing
the applet does reaches the soul.

The distinction to protect: extraction produces the **soul**. Every listener shares it, it is
deterministic, and the repo keeps it forever. The applet produces a **stream**. It is personal and
disposable, and nobody keeps it. Both are randomness derived from an image. If the two words blur, R4's
reproducibility claim fails.

## 2. Vocabulary

The root `README.md` §2 binds `moment`, `reading`, `soul`, and `stream`. These are the applet's own terms,
and they appear nowhere else in the project.

| Term | Meaning |
|---|---|
| **Buffer** | The mutable working image inside the applet. It starts as a copy of a moment. |
| **Test source** | An image the viewer loads in place of a moment, to try the instrument. Debug mode only (§5). It is never a moment, it carries no soul, and nothing derived from it leaves the browser. |
| **Control** | One deterministic parameter the viewer sets. It alters the buffer. |
| **Perturbation** | The noise the applet adds to the buffer each tick. |
| **Tick** | One advance of the loop. |
| **Tap** | The binding of one reading to one output CC. In debug mode, a tap binds a probe. |
| **Curve** | A per-tap function from 0..1 to 0..1. §4.4. It never appears in the Mapping DSL. |
| **Probe** | A candidate reading. Debug mode only (§5). It has an id and a declared range, and it is not in the Feature DSL. It becomes a reading only when Catalina promotes it into `03-feature-dsl/`. |
| **Take** | A recording of one debug-mode run, saved as a file on the viewer's machine. Debug mode only (§5). It is not a stream, and normal mode keeps no take. |

The applet does not define **soul**, **lineage**, or **extraction**. Those belong to `02-extraction/`.

A reading declares its range and stays inside it, under the same rule `03-feature-dsl/` uses. An
out-of-range reading is a broken extractor and must fail loudly.

The applet's reading **ids** are the Feature DSL's ids. One reading vocabulary serves the whole piece, and
sharing ids does not make the applet an extractor (R20).

## 3. The loop

The applet is a shift register whose state is an image.

| Shift register part | Applet part |
|---|---|
| State register | Buffer |
| Feedback function | Controls plus perturbation |
| Clock | Tick |
| Taps | Readings sent as CC |

One tick does two things:

```
buffer_next = perturb(buffer, controls, noise)
cc          = read(buffer)
```

The buffer feeds itself. That is the point of the design. The applet is a source of randomness derived
from the image, not a single reading of it.

§6 item 3 settled the noise. §4.5 takes the seed from the selected moment's soul, and the generator adds
local entropy once, at session start. A session therefore happens once and cannot be repeated.

### 3.1 Conservation: the moment is a forcing term

Repeated blur, shift, and gain drive the buffer to flat grey or to full noise. Both ends kill the music.
The applet holds the buffer between those ends by blending the moment back in on every tick.

```
buffer_next = (1 - a) * perturb(buffer, controls, noise) + a * moment
```

`a` is the **leak coefficient**, range 0 to 1 inclusive, default 0.05. It is the loop's own parameter.
§4.2 exposes it to the viewer and does not redefine it.

| `a` | Behaviour |
|---|---|
| 0.00 | Pure feedback. The moment erodes away. No conservation guarantee holds. |
| 0.05 | A long erosion arc. The moment stays legible. |
| 0.50 | The moment dominates. Feedback is texture on top of it. |
| 1.00 | No feedback. The tick is a plain filter over the moment. |

Why this shape and not a renormalisation or a periodic refresh: the moment is a constant term in the
recurrence, so for any `a` above 0 the loop contracts toward a bounded neighbourhood of the moment instead
of running away. Conservation is a property of the equation, not a correction applied after the fact. There
is no rescaling step to pump, and no refresh instant to make every reading jump at once.

`a = 0` is permitted and has no guarantee. That is the declared cost of the setting, not a defect.

### 3.2 What the buffer is

The buffer is a `Float32Array` of `width * height * 3` values in the range 0 to 1. RGB only. It is
converted to `ImageData` for the canvas and never stored as one.

Float, not `Uint8ClampedArray`. At `a = 0.05` the per-tick correction toward the moment is small. In 8-bit
storage a small correction rounds to zero, the buffer stops moving, and the loop dies silently at a value
that looks plausible. The same argument applies to every low-magnitude control.

RGB, not RGBA. A moment has no alpha channel, and dropping it removes a quarter of the work per pass.

The buffer runs at a fixed working resolution, independent of the moment's own size. The moment is
scaled into it once, on load. Readings are statistics over the whole frame, so they do not need the
camera's detail, and a fixed size makes the per-tick cost a constant the viewer's machine cannot alter.

The buffer has the aspect ratio of the image it holds. It is not square. A square buffer forces a crop,
which cuts away part of the sticker area, a pad, which adds constant pixels that bias every reading, or a
stretch, which distorts every shape. A buffer with the image's own aspect needs none of the three.
Confirmed on 2026-10-29.

The image it holds is the standardized wall region (`02-extraction/`), not the whole capture. The capture
is 3:2. The wall region is not: it is the wall's width by a fixed length below its upper edge, so it is tall
and narrow. Its aspect is fixed when that length is fixed, and `02-extraction/` holds that question.

Normal mode has one fixed buffer size, and that size is not chosen yet. In debug mode the size is a
setting (§5.1). Debug mode shows which size is enough.

### 3.3 The order of a tick

The order is part of the applet's definition, in the same way mapping order is part of the piece's
definition (`04-mapping-dsl/`). It is declared, and there is no default.

```
1. transformed = apply_controls(buffer)     §4.2
2. perturbed   = apply_noise(transformed)   §4.3
                                            seed from the moment's soul, §4.5
3. buffer      = (1 - a) * perturbed + a * moment
4. readings    = read(buffer)               §4.1
5. cc          = tap(readings) -> MIDI out  §4.4
6. draw(buffer)
```

Readings are taken **after** the blend, from the same buffer state that is drawn. One tick has one buffer
state, and what is heard and what is seen are the same frame. Reading before the blend would put the stream
one tick ahead of the canvas for no gain.

The canvas draws the **buffer**, not the moment. Step 6 has no alternative.

At defaults, with `leak` at 0.05 and no perturbation, the buffer converges to the moment (§4.2). The applet
at rest therefore shows the moment. The choice shows itself at a low `leak`, where the erosion of §3.1
becomes visible on the canvas at the same time as it becomes audible in the stream. The viewer watches the
frame that the viewer hears. §6 item 4 records the choice and points here.

The moment stays immutable in memory, as the forcing term of §3.1. What the canvas draws has no effect on
it.

### 3.4 The clock

The tick runs at a fixed rate from an accumulator, not once per `requestAnimationFrame` callback. A
display-locked tick makes `a` and every rate control frame-rate dependent: the same settings erode twice as
fast on a 120Hz monitor as on a 60Hz one.

Tick rate is a viewer setting in the output panel (§4.4). Default 30 Hz.

A tap sends a CC message only when its quantised 0 to 127 value differs from the value it last sent.
Sending every tap on every tick floods the port with values the receiver cannot distinguish.

## 4. The screen

Three sections, plus one panel.

1. **Readings.** Read-only. The live value of each feature, with its declared range. This is the Feature
   DSL made visible. The set itself is open: §4.1.
2. **Controls.** The deterministic transform of the buffer. §4.2 declares the set.
3. **Perturbation.** The noise. Amount, character, affected channels, feedback depth. §4.3.
4. **Output panel.** MIDI port, channel, tick rate, and the taps. It belongs to none of the three
   sections. §4.4.

### 4.1 Readings

Open. It waits on `03-feature-dsl/`'s concrete feature set.
Working file: `open/readings.md`.

### 4.2 The control set

Step 1 of the tick. Every control is deterministic: the same buffer and the same control values give the
same result, with no randomness anywhere in this step. Randomness belongs to step 2 alone.

Under §3.1 a held control value does not run away, but it also does not act once. It acts on every tick
against the blend that pulls back toward the moment. Each control therefore declares a **class**, and there
is no default class.

| Class | Meaning |
|---|---|
| `equilibrium` | A held value drives the buffer to a fixed point and holds it there. The value selects a steady state, not a one-shot transform. |
| `rate` | The value is a per-tick increment with no fixed point. It produces steady motion, not a steady state. |

| id | Class | Range | Default | Effect on the buffer |
|---|---|---|---|---|
| `leak` | — | 0 .. 1 | 0.05 | The `a` of §3.1. Structural, not a transform. |
| `gain_r` | `equilibrium` | 0 .. 2 | 1 | Multiplies the red channel. |
| `gain_g` | `equilibrium` | 0 .. 2 | 1 | Multiplies the green channel. |
| `gain_b` | `equilibrium` | 0 .. 2 | 1 | Multiplies the blue channel. |
| `contrast` | `equilibrium` | 0 .. 2 | 1 | Expands or compresses every channel about 0.5. |
| `saturation` | `equilibrium` | 0 .. 2 | 1 | Scales each pixel away from or toward its own luma. |
| `blur` | `equilibrium` | 0 .. 4 px | 0 | Separable box blur radius. |
| `hue_rotate` | `rate` | -30 .. 30 deg/tick | 0 | Rotates the hue of every pixel. |
| `shift_x` | `rate` | -4 .. 4 px/tick | 0 | Translates the buffer horizontally. |
| `shift_y` | `rate` | -4 .. 4 px/tick | 0 | Translates the buffer vertically. |

Every default is the identity transform. At defaults, with `leak` at 0.05 and no perturbation, the buffer
converges to the moment and stays there. The applet at rest shows the moment.

A control value stays inside its declared range. The ranges above are the ranges the applet enforces, not
suggestions to the viewer.

Ordering inside step 1 is fixed: per-channel gain, contrast, saturation, hue rotation, blur, shift. These
operations do not commute, so the order is part of the definition for the same reason §3.3 is.

### 4.3 Perturbation

Open. It no longer waits on §6 item 3, which settled the generator: the soul seeds it and local entropy
joins the seed at session start. No viewer-facing seed field exists, so §4.3 holds the character of the
noise and not a seed control.
Working file: `open/perturbation.md`.

### 4.4 Output panel

Step 5 of the tick. The panel holds the port, the channel, the tick rate, and the taps.

```
Output
------------------------------
Port  [ IAC Bus 1        v ]
Rate  [ 30 ] Hz
Ch    [ 1 v ]

Taps
  luma_mean    linear  -> CC 1    74
  edge_energy  s       -> CC 2    12
  [ + add tap ]
```

| Setting | Range | Default |
|---|---|---|
| `port` | the outputs the browser reports | none. The viewer chooses one. |
| `channel` | 1 .. 16 | 1 |
| `rate` | 1 .. 60 Hz | 30 |

One channel serves every tap. The playground reads incoming CC with
`sync "/midi:<device>:<channel>/control_change"`, so one channel keeps that path to one line. A per-tap
channel would multiply those paths and buy the piece nothing it needs yet.

The rate states a range and stays inside it, under the same rule §4.2 applies to every control.

#### The tap list

The list starts empty. The viewer adds one tap at a time, and each tap names its reading, its curve, and
its CC number. The applet proposes the next free CC number, and the viewer may set another. Two taps may
not hold the same CC number: two writers on one control make the last write win, and which write is last is
not defined.

An empty list is a working state. The applet reads, draws, and loops with no tap bound.

#### From a reading to a CC value

```
u  = (v - lo) / (hi - lo)     v is the reading. lo .. hi is its declared range.
w  = curve(u)
cc = round(w * 127)
```

The applet clamps `cc` to 0 .. 127 before it sends. `MIDIOutput.send()` throws `TypeError` on a byte
outside that range and specifies no clamping of its own, so the clamp belongs to the applet (§6).

An out-of-range **reading** never clamps. It fails loudly, under §2. The clamp guards the byte that
rounding produces at the ends of the range. It never hides a broken extractor.

#### Curves

A **curve** is a per-tap function from 0 .. 1 to 0 .. 1. There is no default per tap. A new tap starts with
`linear`.

| id | w | Effect |
|---|---|---|
| `linear` | `u` | Identity. The value a new tap starts with. |
| `in` | `u * u` | The low end of the range crowds. |
| `out` | `sqrt(u)` | The high end of the range crowds. |
| `s` | `u * u * (3 - 2 * u)` | Both ends hold. The middle moves fastest. |
| `flip` | `1 - u` | The direction reverses. |

Every curve maps 0 to 0 and 1 to 1, or 0 to 1 and 1 to 0. A curve therefore alters where the values crowd,
and never the range they reach. That property is what keeps a curve out of the Mapping DSL's territory: a
mapping mode decides what a value means, and a curve decides only how the value spreads across 127 steps.

#### When a tap sends

A tap sends only when its quantised value differs from the value it last sent (§3.4). A new tap has sent
nothing, so its first tick always sends.

#### When the port fails

| State | What the applet does |
|---|---|
| The browser has no Web MIDI (Safari) | The panel says so. Readings, controls, and the loop all still run. |
| The viewer denies permission | The panel says so, and offers to ask again. The loop still runs. |
| No output port exists | The panel says so. The taps stay, and they hold their CC numbers. |
| The chosen port disconnects | The applet stops sending and marks the port lost. The taps stay. |
| The port returns | The applet resumes, and every tap forgets its last sent value. |

`MIDIAccess` fires `statechange` when a port connects or disconnects, and the event names the port
(`06-bridge/`). The applet listens for it. A disconnected port's `send()` throws `InvalidStateError`, so the
applet stops sending on the event rather than on a thrown exception.

Every tap forgets its last sent value when a port returns. The receiver's state is unknown after a
disconnect, and §3.4's rule would otherwise hold back every value that did not move while the port was
gone.

MIDI output is not a condition of the applet running. Every failure above leaves the readings, the
controls, and the canvas working.

### 4.5 The moment source

The applet does not open one fixed image. It reads the published history of the wall and lets the viewer
move through it.

On load the applet fetches the published list of moments. Each entry names one moment: its image and the
soul extracted from it. The viewer selects an entry. Selection does two things, and no more:

1. The image loads into the buffer through §3.2's scale-into-a-fixed-buffer step.
2. The noise seed comes from that entry's soul.

A different selection restarts the loop from that moment. It does not blend two moments, and it does not
carry the old buffer across. §3.1's leak coefficient keeps pointing at the selected moment, because the
selected moment is the forcing term.

The applet writes nothing back. Not the stream, not the selection, not a preference. R20 is stated in §1 and
repeated here, because a screen that walks the published history is where a later session is most likely to
reach for a write.

Failure is defined, and it is not fatal. If the list or a soul cannot be fetched, the applet says so on
screen and runs on whatever moment it already holds. This is the rule §4.4 uses for the MIDI port, applied
to the fetch: a missing part removes a capability, and it never stops the loop.

The concrete format of the list and of a soul record is not settled here.
`02-extraction/open/published-format.md` holds that question, and
`02-extraction/open/moment-retention.md` holds whether an elected moment keeps an image at all. This
section states what the applet needs from the format. It states no schema.

## 5. Debug mode and the build order

The applet has two modes: normal mode and debug mode. Debug mode is the normal applet with extra features.
It is permanent. It is not a phase that ends when the applet ships. Confirmed on 2026-10-29. It replaces
the laboratory phase confirmed on 2026-10-28, and keeps that phase's features.

Debug mode is where anyone plays with the medium before anything about it is fixed. It is how the
project finds:

- the feature set (`03-feature-dsl/`),
- the standardization method for handheld captures (`02-extraction/`),
- the character of the perturbation (§4.3),
- the sounds worth committing to in `07-renderer/`.

Debug mode produces decisions, not artefacts. A decision it leads to goes into the component that owns
it. Rough edges cost nothing here. Every fork has its own wall, so every fork's owner uses debug mode to
find what works for that wall (root `README.md`, invariant 8).

### 5.1 What debug mode adds

| | Normal mode | Debug mode |
|---|---|---|
| Images | Published moments only (§4.5) | Two or more test sources at once (§2) |
| What is read | Readings, under Feature DSL ids | Probes, under free ids |
| Seed | The soul and session entropy. Hidden. Nothing repeats (§6 item 3). | Visible and settable. The same seed and the same settings repeat the same run. |
| Buffer size | One fixed size (§3.2) | A setting. A probe value depends on the size, so compare runs at one size. |
| Output | Live MIDI CC | Live MIDI CC, and takes |

Every viewer may open debug mode. The published applet opens in normal mode, and one small button
switches to debug mode. The button is there, and it does not ask for attention. Confirmed on 2026-10-29.
Debug mode writes nothing either (R20). A test source stays in the viewer's browser, and a take is a file
the viewer chooses to save.

**Images.** Debug mode loads two or more images and shows one at a time. The viewer toggles between
them. The image on screen is the forcing term of §3.1, and the loop runs on it. Confirmed on 2026-10-28.
Debug mode still computes every probe for every loaded image and lists the values together. This is the
standardization test: two captures of an unchanged wall must give nearly equal probes, and a probe that
moves with the framing feeds camera noise into the lineage. A capture loaded here is a test source. It
stays on the viewer's machine.

Debug mode reads JPEG. It never decodes a raw format. No browser is known to decode camera raw (§8). A raw
capture enters through the raw adapter for its format (`01-capture/`, `scripts/raw/`), which gives a JPEG.
For Canon `.cr3`, the adapter takes the embedded preview, and the browser's own decoder decodes it.
Confirmed on 2026-10-28. Whether debug mode runs the adapter in the browser, or loads the JPEG the
Python adapter wrote, is not settled (§7).

**Probes.** A probe declares its range and obeys §2: an out-of-range probe fails loudly. A probe id never
appears in the Feature DSL until Catalina promotes it. Promotion is the moment a probe becomes a reading.

The first probes cover four groups. Confirmed on 2026-10-29. The groups set where the search starts. They
promote nothing.

| Group | What it measures |
|---|---|
| Brightness | The level of light, and how much it varies across the frame. |
| Color | How saturated the frame is, and how wide its spread of hues is. |
| Detail | The density of edges. |
| Spatial | The same statistics per region of a grid. This group is the most sensitive to handheld framing. |

**Seed.** A test source carries no soul, so debug mode seeds the generator from a seed the viewer can
see and set. A repeatable run makes a fair comparison possible: two perturbation settings on the same
noise.

**Takes.** A take records one run, tick by tick: the seed, the control values, every probe, and every
tap's CC value. Debug mode offers it as a file download to the viewer's machine. A take never enters the repo,
and it reaches no soul and no lineage (R20). It exists so that a viewer can shape sound from a run
offline, in a DAW or in Sonic Pi, before committing to a sound in `07-renderer/`.

**Live output.** The taps send MIDI CC through a virtual port (`06-bridge/`) to any receiver: a DAW or
`05-playground/`.

### 5.2 Build order

Each step runs and is worth looking at before the next one starts.

1. Load two or more images. Draw one to a canvas, and toggle between them.
2. Probes. Live numbers for every loaded image, no controls.
3. Controls. The controls alter the buffer. The canvas follows. Until step 4 exists there is no feedback,
   so a control acts once on the image. Step 4 turns that into the equilibrium of §4.2.
4. Perturbation and the loop, with the visible seed.
5. Output. MIDI out, taps, and takes.

Steps 1 to 5 build debug mode. Step 6 builds normal mode:

6. Normal mode. Promoted probes become readings under Feature DSL ids. The file input, the probes, the
   seed field, and takes stay in debug mode. The moment picker and the soul read of §4.5 arrive. Permission failures,
   a missing port, and a stable reading display get their care here and not before. §4.4 already holds
   the port-failure rules that step 6 implements.

The soul read belongs to step 6, because no moment publishes a soul until `02-extraction/` exists. Until
then debug mode's visible seed takes its place.

## 6. Artistic choices

None of these has a technically correct answer. All five are settled. Item numbers are fixed: a settled
item keeps its number.

1. **Whose image.** *Settled 2026-09-10.* A viewer may load an image of their own. It is a **test source**
   (§2), and the file input is debug mode only (§5). Normal mode opens published moments through §4.5
   and nothing else.
   *Amended 2026-10-29.* The file input ships, inside debug mode, and every viewer can reach it through
   one small button (§5.1). The original reason not to ship it still names the cost: a file input points
   the instrument at anything. Normal mode keeps the wall as the subject, and debug mode is the declared
   exception. It exists
   because debug mode is looking for the feature set, and a second image is the cheapest way to see
   whether a reading tracks the wall or tracks one photograph.
   A test source carries no soul, so debug mode seeds it from a visible seed (§5.1). Item 3's
   shipped claim is unaffected: in the shipped applet the generator still takes the selected moment's
   soul and that entropy.
   Nothing derived from a test source is a reading of the wall. It produces no soul and no lineage, the
   applet writes no file (R20, §1), and `moments/` stays as R6 leaves it. §3.2 is unaffected: any image is
   scaled once, on load, into the fixed working buffer, so both kinds use one load path.
2. **Permanent or a laboratory.** *Settled 2026-09-10.* The applet ships. The root `README.md` §5 records
   it as a component of the piece. What this document adds: the work reaches that end state through a
   debug mode, and §5 holds the line between the modes. A shipped applet is the setting item 3 answered in,
   and item 3 weighed reproducibility against the piece and chose against it.
3. **The noise generator.** *Settled 2026-09-10.* The generator takes two things: the selected moment's
   soul, through §4.5, and local entropy drawn once at session start. Step 2 of the tick stays the only
   step with randomness.
   The entropy is internal. The applet does not show it, the viewer cannot set it, and the applet writes it
   nowhere (R20). A session therefore happens once. Nobody can replay it, send it to somebody else, or
   investigate it by running it again. That is the declared cost of the choice, in the same way §3.1
   declares the cost of `a = 0`.
   Debug mode is exempt. Its seed is visible and settable, and a run repeats (§5.1). Confirmed on
   2026-10-28. *Amended 2026-10-29:* every viewer can open debug mode, so every viewer can choose a
   repeatable run. Normal mode keeps the hidden seed and the unrepeatable session.
   What every viewer shares is the soul, not the stream. Two viewers who select the same moment start from
   the same skeleton and diverge on the first tick. That is R4, and it is not shared listening. The soul
   with the tick rate names that shared start. It is not a record, and it replays nothing. A seed is not a
   soul. The stream stays viewer-local and disposable.
4. **Whether the viewer sees the buffer.** *Settled 2026-09-10.* The canvas draws the buffer. §3.3 holds
   the decision. Two consequences: the viewer sees and hears one frame, which is what §3.3 already required
   of the reading order, and at a low `leak` the erosion of §3.1 is visible while it plays. At defaults the
   applet at rest still shows the moment.
5. **Whether the soul reaches the applet.** *Settled 2026-09-10.* It does, always. The applet reads the
   published moments and seeds each session from the selected moment's soul. §4.5 holds the mechanism. Two
   consequences: every listener starts from a shared skeleton, which is R4 and not shared listening, and
   item 3 chose a noise generator rather than a seed source.

## 7. Open questions

- **§4.1 Readings.** Waits on `03-feature-dsl/`. Working file: `open/readings.md`.
- **§4.3 Perturbation.** Unblocked. Working file: `open/perturbation.md`.
- **Does the browser decode the extracted preview?** It is baseline JPEG (§8), and not yet run in a
  browser. Build step 1 runs it. If it fails, the fallback is a JPEG the owner exports.
- **Where does debug mode get the JPEG of a raw capture?** It can run a JavaScript twin of the raw adapter
  in the browser, or load the JPEG that `scripts/raw/` wrote. A twin means every adapter exists twice.
- **What size is the normal-mode buffer?** Its aspect is the wall region's (§3.2). Debug mode sets the
  size for each run (§5.1), and normal mode's size comes from what debug mode shows. Its upper limit is the
  resolution the raw adapter gives.
- **What does debug mode read for an image that is not on screen?** Only the image on screen drives the loop.
  For the standardization test, the probes of every loaded image must come from the same kind of source.
  That is the raw image scaled into the buffer, with no controls and no noise. Not settled.
- **What format does a take use?** It must open in a DAW or in Sonic Pi without a converter the repo
  carries. Not settled.
- **Does a toggle restart the loop?** A new forcing term can restart the buffer from the new image, as
  §4.5 does for a new moment, or keep the buffer and let the blend pull it across. Found by use.

## 8. Sources

- **Canon `.cr3` container** — see `01-capture/`, which owns that claim.
- **Browsers decode no camera raw format.** MDN's image type guide lists APNG, AVIF, GIF, JPEG, JPEG XL,
  PNG, SVG, and WebP, plus BMP, ICO, TIFF, and XBM. No camera raw format appears. This does not prove
  absence, and no source states that any browser decodes `.cr3`. Observed 2026-10-28.
  <https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types>

- **A browser page sends MIDI.** `MIDIOutput.send()` works in Chrome, Edge, and Firefox 108 and later. The
  browser asks the viewer for permission. Safari does not support it.
  Sources: MDN Web MIDI API. Chrome for Developers, permission prompt.
  <https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API>
  <https://developer.chrome.com/blog/web-midi-permission-prompt>
- **`send()` rejects an invalid byte and specifies no clamping.** It throws `TypeError` when the data is
  not a valid MIDI message, and a non-SysEx data byte above 127 makes the message invalid. It also throws
  `NotAllowedError` for SysEx without permission. Confirmed 2026-09-09.
  Sources: W3C Web MIDI API specification §5.4.2. MDN `MIDIOutput.send()`.
  <https://developer.mozilla.org/en-US/docs/Web/API/MIDIOutput/send>
- **Port hot-plug** — see `06-bridge/`, which owns that claim.
- **The playground receives MIDI** — see `05-playground/`, which owns that claim.

## 9. Not verified

Do not state any of these as fact until a source exists.

- That a browser exposes a local entropy source the applet may draw from at session start. §6 item 3 needs
  one, and it names no API.
- That a browser page cannot open a raw UDP socket. This is the stated reason the applet reaches the
  playground by MIDI instead of OSC. The conclusion holds without it, because MIDI is already the settled
  bridge.
- What metadata survives on the moments, and what a browser reads from it without a third-party parser. The
  applet treats image metadata as a possible source of noise, not a confirmed one.
- What a real browser does with a CC message that carries a data byte above 127, such as
  `[0xB0, 200, 64]`. The specification rejects it through the "valid MIDI message" test rather than through
  a rule that names the byte range, and nobody has run it here. §4.4 does not depend on the answer, because
  the applet clamps the byte before it sends.
