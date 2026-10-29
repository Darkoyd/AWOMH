# Wall — this fork's wall

**Owner:** Catalina.
**Read by:** `01-capture/` and `02-extraction/`, through the fields below.

---

## 1. What this folder is

The chain works on any wall (root `README.md`, invariant 8). Everything that is true of one wall only lives
here, and nowhere else. A fork replaces this folder with a description of its own wall.

This file is the declaration in prose. Its machine form, its fields, and how its version travels with the
soul are open in the root `README.md` §6. The method that reads these facts lives in `02-extraction/`.

## 2. The declaration

| Field | This wall | Confirmed |
|---|---|---|
| Surface | A white cabinet panel. Pure white. | 2026-10-29 |
| Shape in the frame | Too long for one frame. Narrow enough that both long edges fit. | 2026-10-29 |
| Orientation | The camera is held sideways. The wall's upper end is at the right of the image. | 2026-10-29 |
| Alignment points | Four: the two upper corners, and the two screws that hold the inner shelves. | 2026-10-29 |
| Sticker area bound | A marker on the wall. No sticker goes below it. | 2026-10-29 |
| Camera | Canon, handheld. Captures are `.cr3`. Raw adapter: `scripts/raw/cr3.py`. | 2026-10-28 |

## 3. The wall's rules

The owner keeps these. The method in `02-extraction/` holds only while they hold.

1. No sticker covers a screw. Confirmed on 2026-10-29.
2. No sticker goes below the marker. Confirmed on 2026-10-29.

## 4. The archive of this wall

- **The archive starts at IMG_2466.** IMG_2465 was discarded and deleted on 2026-10-29, before any lineage
  existed. It showed neither upper corner and only one screw. From the first fold onward, R19 holds: no
  capture is discarded.
- **Framing changes after IMG_2488.** Every capture up to IMG_2488 that was checked stops short of the
  marker. From the next capture onward, the camera frames from further back so that the marker is in the
  frame. Confirmed on 2026-10-29.
- **Captures checked on 2026-10-29:** IMG_2466, 2470, 2478, and 2488 show all four alignment points. The
  other kept captures are not checked yet.

## 5. Open questions about this wall

- **How long is the region, in numbers?** It runs from the upper edge to the marker. Measure it, relative
  to the wall's width, from the first capture that shows the marker.
- **Was the filled strip empty in every existing capture?** `02-extraction/` fills the strip below the
  frame edge with the surface colour. That is correct only if the strip held no sticker. In IMG_2488 the
  last sticker sits just above the marker, close to the frame edge. Check it, and every capture before
  it, before the first fold.
- **How large is the exposure spread?** IMG_2466 is grey and IMG_2488 is near white. The correction in
  `02-extraction/` must cover at least that range.
