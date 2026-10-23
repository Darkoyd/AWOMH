# The published format — working file

**Decides:** `02-extraction/README.md` §5.
**Gates:** the moment list `08-applet/README.md` §4.5 waits on.
**Blocked on:** `open/moment-retention.md`, which sets whether a published record carries an image
reference at all.
**Holds no decision. Nothing cites this file as a source.**

## The question

The publication shape is `soul/current.json`, `soul/log.jsonl`, and `soul/lineage.json`. Catalina reopened
the format on 2026-09-10, when the applet became a reader of the soul. The format stopped being an
internal detail and became the interface between the offline side and the browser.

Two things to answer:

1. Is JSON still the right carrier?
2. What names the pairing of a moment's image with its soul, so the applet's moment picker can walk it?
   A second static file, or a field inside the log.

## Constraints that are not artistic

- Static files only. No backend, no database, no server-side code. — root `README.md` §4
- The applet is vanilla JavaScript with no build step and no dependency. A format it cannot parse with
  what the browser already provides is a dependency in disguise. — root `README.md` §4
- Feature values enter the chain as fixed-precision integers, never as floats. A format that stores a
  float and reformats it breaks the chain across languages. — R12
- The extraction version travels with the soul. — R7
- The log is append-only. A format that must rewrite the whole file to add a record fights R8. `.jsonl`
  was chosen for exactly this.
- The soul is a fixed-width value. The lineage tiers are numeric and bounded. — R17, §3
- Everything published stays text-sized and grows at the rate of the wall. — §5
- `scripts/` is stdlib-only Python 3.14. The writer must be stdlib-reachable. — root `README.md` §4

## Options

| Option | Cost |
|---|---|
| Keep JSON and JSONL | Nothing to build. `JSON.parse` in the browser, `json` in the standard library. R12's integers survive if nothing is stored as a float. Verbose, and verbosity is cheap at this size. |
| A compact text form, such as one line of fixed-width fields | Smaller and trivially append-only. Every reader needs a parser, which the applet must then carry by hand. |
| A binary form | Smallest. It needs a hand-written reader in the browser and it makes the published history unreadable without the tool. It also makes a diff in the repo meaningless, and the log is meant to be the work's history. |

## Needs verification before anyone writes it down

- Whether the applet can fetch a published file from the same origin under GitHub Pages with no CORS
  configuration. Likely, and not verified. Use `/verify-claim`.
- Any claim about a size limit or a parse behaviour that a chosen format depends on.

## When settled

Catalina confirms. The decision goes into `02-extraction/README.md` §5, and `08-applet/README.md` §4.5
loses its "format not settled here" paragraph. Then delete this file.
