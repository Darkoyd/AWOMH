"""Minimal OSC 1.0 encoder and UDP client — stdlib only.

The Window sends OSC to the playground (Sonic Pi listens on 4560; Overtone takes OSC too).
That is a one-directional, small-vocabulary use of OSC, so it does not justify a dependency:
this module implements the wire format directly.

Supported type tags: i (int32), f (float32), s (string), b (blob), T/F (bool), N (nil).
Not supported: timetag arguments, int64, arrays. Add them only if a mapping actually needs one.
"""

from __future__ import annotations

import socket
import struct
import time
from typing import Any, Iterable, Sequence

_IMMEDIATELY = struct.pack(">II", 0, 1)  # OSC timetag meaning "now"
# Seconds between the NTP epoch (1900-01-01) and the Unix epoch (1970-01-01).
_NTP_DELTA = 2208988800


def _pad(data: bytes) -> bytes:
    """OSC pads every field to a 4-byte boundary."""
    return data + b"\x00" * (-len(data) % 4)


def _encode_string(value: str) -> bytes:
    # At least one trailing null, then pad — so an exact multiple of 4 still gains 4 bytes.
    return _pad(value.encode("utf-8") + b"\x00")


def _encode_blob(value: bytes) -> bytes:
    return struct.pack(">i", len(value)) + _pad(value)


def _encode_arg(value: Any) -> tuple[str, bytes]:
    """Return (type tag, payload) for one argument.

    bool is checked before int deliberately — in Python bool *is* an int, and silently
    sending True as the integer 1 would lose the distinction the receiver may be matching on.
    """
    if value is None:
        return "N", b""
    if isinstance(value, bool):
        return ("T" if value else "F"), b""
    if isinstance(value, int):
        if not -(2**31) <= value < 2**31:
            raise ValueError(f"int out of OSC int32 range: {value}")
        return "i", struct.pack(">i", value)
    if isinstance(value, float):
        return "f", struct.pack(">f", value)
    if isinstance(value, str):
        return "s", _encode_string(value)
    if isinstance(value, (bytes, bytearray)):
        return "b", _encode_blob(bytes(value))
    raise TypeError(f"unsupported OSC argument type: {type(value).__name__}")


def encode_message(address: str, *args: Any) -> bytes:
    """Encode a single OSC message."""
    if not address.startswith("/"):
        raise ValueError(f"OSC address must start with '/': {address!r}")
    tags = ","
    payload = b""
    for arg in args:
        tag, blob = _encode_arg(arg)
        tags += tag
        payload += blob
    return _encode_string(address) + _encode_string(tags) + payload


def encode_bundle(messages: Iterable[bytes], when: float | None = None) -> bytes:
    """Encode an OSC bundle. `when` is a Unix timestamp, or None for 'immediately'.

    Bundling matters here: a moment yields many readings at once, and the playground
    should see them as one coherent frame rather than a stream of unrelated messages.
    """
    if when is None:
        timetag = _IMMEDIATELY
    else:
        ntp = when + _NTP_DELTA
        seconds = int(ntp)
        fraction = int((ntp - seconds) * (2**32)) & 0xFFFFFFFF
        timetag = struct.pack(">II", seconds, fraction)
    out = _encode_string("#bundle") + timetag
    for msg in messages:
        out += struct.pack(">i", len(msg)) + msg
    return out


class OSCClient:
    """Fire-and-forget UDP sender. OSC over UDP is unreliable by design — no delivery guarantee."""

    def __init__(self, host: str = "127.0.0.1", port: int = 4560) -> None:
        self.host = host
        self.port = port
        self._sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    def send(self, address: str, *args: Any) -> None:
        self._sock.sendto(encode_message(address, *args), (self.host, self.port))

    def send_bundle(self, messages: Sequence[tuple[str, tuple]], when: float | None = None) -> None:
        encoded = [encode_message(addr, *a) for addr, a in messages]
        self._sock.sendto(encode_bundle(encoded, when), (self.host, self.port))

    def close(self) -> None:
        self._sock.close()

    def __enter__(self) -> "OSCClient":
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()


if __name__ == "__main__":
    # Send one frame to the default Sonic Pi OSC port. Harmless if nothing is listening.
    with OSCClient() as client:
        client.send("/window/hello", 1, 0.5, "wall")
        client.send_bundle(
            [("/window/feature/density", (0.42,)), ("/window/feature/count", (17,))],
            when=time.time(),
        )
    print(f"sent to 127.0.0.1:4560 (no delivery confirmation — OSC over UDP is fire-and-forget)")
