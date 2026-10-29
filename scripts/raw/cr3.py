"""Canon .cr3 raw adapter — stdlib only.

A .cr3 file is an ISO BMFF container with Canon custom boxes. It embeds a 1620 x 1080 baseline JPEG
preview in a top-level `uuid` box, inside a `PRVW` box (lclevy/canon_cr3). This adapter returns that
JPEG unchanged. It decodes no pixels and alters no capture: it only copies bytes out of the file.

Usage:
    python3 scripts/raw/cr3.py OUT_DIR CAPTURE.CR3 [CAPTURE.CR3 ...]

Writes OUT_DIR/<capture stem>.jpg for each capture.
"""

from __future__ import annotations

import pathlib
import struct
import sys

# The top-level uuid box that holds the preview (lclevy/canon_cr3).
PREVIEW_UUID = bytes.fromhex("eaf42b5e1c984b88b9fbb7dc406e4d16")
# Inside the PRVW box: JPEG size at offset 20, JPEG data from offset 24.
_PRVW_SIZE_AT = 20
_PRVW_DATA_AT = 24
_JPEG_SOI = b"\xff\xd8"
_JPEG_EOI = b"\xff\xd9"


class Cr3Error(ValueError):
    """The file is not a .cr3 file that this adapter can read."""


def _boxes(data: bytes, start: int, end: int):
    """Yield (type, box start, payload start, box end) for each box in data[start:end]."""
    i = start
    while i + 8 <= end:
        size, kind = struct.unpack(">I4s", data[i:i + 8])
        header = 8
        if size == 1:  # 64-bit size follows the type
            if i + 16 > end:
                raise Cr3Error(f"box at offset {i}: the 64-bit size is past the end of the file")
            size = struct.unpack(">Q", data[i + 8:i + 16])[0]
            header = 16
        elif size == 0:  # the box runs to the end of the file
            size = end - i
        if size < header or i + size > end:
            raise Cr3Error(f"box at offset {i}: size {size} is not valid")
        yield kind, i, i + header, i + size
        i += size


def extract_preview(data: bytes) -> bytes:
    """Return the embedded 1620 x 1080 preview JPEG of a .cr3 file."""
    for kind, _, payload, box_end in _boxes(data, 0, len(data)):
        if kind != b"uuid" or data[payload:payload + 16] != PREVIEW_UUID:
            continue
        # The PRVW box follows other bytes inside the uuid payload, so search for its type.
        tag = data.find(b"PRVW", payload + 16, box_end)
        if tag < 4:
            raise Cr3Error("the preview uuid box holds no PRVW box")
        prvw = tag - 4
        length = struct.unpack(">I", data[prvw + _PRVW_SIZE_AT:prvw + _PRVW_DATA_AT])[0]
        jpeg = data[prvw + _PRVW_DATA_AT:prvw + _PRVW_DATA_AT + length]
        if len(jpeg) != length or jpeg[:2] != _JPEG_SOI or jpeg[-2:] != _JPEG_EOI:
            raise Cr3Error("the PRVW box does not hold a complete JPEG")
        return jpeg
    raise Cr3Error("the file holds no preview uuid box")


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    out = pathlib.Path(argv[0])
    out.mkdir(parents=True, exist_ok=True)
    failed = 0
    for name in argv[1:]:
        src = pathlib.Path(name)
        try:
            jpeg = extract_preview(src.read_bytes())
        except (OSError, Cr3Error) as err:
            print(f"{src}: {err}", file=sys.stderr)
            failed += 1
            continue
        (out / f"{src.stem}.jpg").write_bytes(jpeg)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
