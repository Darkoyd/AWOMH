# §4.1 Readings — working file

**Fills:** `08-applet/README.md` §4.1.
**Blocked on:** the concrete feature set. `03-feature-dsl/` owns that question.
**Holds no decision. Nothing cites this file as a source.**

## The question

What does the readings section show, and how does it show a range?

## Already fixed. Do not open these again.

- The section shows the live value of each feature with its declared range, and takes no input. It is the
  Feature DSL made visible. — §4
- A **reading** is the value of one feature at one tick. It has an id and a declared range. — root
  `README.md` §2
- The applet's reading ids are the Feature DSL's ids. One reading vocabulary serves the whole piece. —
  `03-feature-dsl/`
- A reading stays inside its declared range. An out-of-range reading is a broken extractor and must fail
  loudly. — §2
- Before the feature set exists, the section shows probes. That is the laboratory phase. — §5.1
- Readings are taken after the blend, from the same buffer state that is drawn. Step 4 of the tick. — §3.3
- Sharing ids does not make the applet an extractor. It shares the vocabulary, not the role. — R20

## Open

1. Which features come first, and how many. This is the blocker, and it is `03-feature-dsl/`'s question.
2. How a value and its range appear together. A number with the range beside it, a bar inside the range, or
   both.
3. What "fail loudly" looks like on screen for an out-of-range reading.
4. Whether the display updates every tick at 30 Hz, or at a slower rate that a person can read. The reading
   itself is taken every tick either way.

## To verify

- Nothing. This fragment waits on a decision, not on a source.

## When settled

Write §4.1 into `08-applet/README.md`, then delete this file.
