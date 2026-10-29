// Canon .cr3 raw adapter, browser twin of scripts/raw/cr3.py.
//
// A .cr3 file is an ISO BMFF container with Canon custom boxes. It embeds a 1620 x 1080 baseline JPEG
// preview in a top-level `uuid` box, inside a `PRVW` box (lclevy/canon_cr3). extractPreview() returns
// that JPEG unchanged. It decodes no pixels: the browser's own decoder does that.

const PREVIEW_UUID = [0xea, 0xf4, 0x2b, 0x5e, 0x1c, 0x98, 0x4b, 0x88,
                      0xb9, 0xfb, 0xb7, 0xdc, 0x40, 0x6e, 0x4d, 0x16];
// Inside the PRVW box: JPEG size at offset 20, JPEG data from offset 24.
const PRVW_SIZE_AT = 20;
const PRVW_DATA_AT = 24;

export class Cr3Error extends Error {}

function fourcc(bytes, at) {
  return String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
}

function* boxes(view, start, end) {
  let i = start;
  while (i + 8 <= end) {
    let size = view.getUint32(i);
    let header = 8;
    if (size === 1) {  // 64-bit size follows the type
      if (i + 16 > end) throw new Cr3Error(`box at offset ${i}: the 64-bit size is past the end of the file`);
      size = Number(view.getBigUint64(i + 8));
      header = 16;
    } else if (size === 0) {  // the box runs to the end of the file
      size = end - i;
    }
    if (size < header || i + size > end) throw new Cr3Error(`box at offset ${i}: size ${size} is not valid`);
    yield { start: i, payload: i + header, end: i + size };
    i += size;
  }
}

function findTag(bytes, tag, from, to) {
  for (let i = from; i + 4 <= to; i++) {
    if (fourcc(bytes, i) === tag) return i;
  }
  return -1;
}

// Return the embedded preview JPEG of a .cr3 file as a Uint8Array view into `buffer`.
export function extractPreview(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  for (const box of boxes(view, 0, bytes.length)) {
    if (fourcc(bytes, box.start + 4) !== "uuid") continue;
    if (!PREVIEW_UUID.every((b, k) => bytes[box.payload + k] === b)) continue;
    // The PRVW box follows other bytes inside the uuid payload, so search for its type.
    const tag = findTag(bytes, "PRVW", box.payload + 16, box.end);
    if (tag < 4) throw new Cr3Error("the preview uuid box holds no PRVW box");
    const prvw = tag - 4;
    const length = view.getUint32(prvw + PRVW_SIZE_AT);
    const jpeg = bytes.subarray(prvw + PRVW_DATA_AT, prvw + PRVW_DATA_AT + length);
    const n = jpeg.length;
    if (n !== length || jpeg[0] !== 0xff || jpeg[1] !== 0xd8 || jpeg[n - 2] !== 0xff || jpeg[n - 1] !== 0xd9) {
      throw new Cr3Error("the PRVW box does not hold a complete JPEG");
    }
    return jpeg;
  }
  throw new Cr3Error("the file holds no preview uuid box");
}
