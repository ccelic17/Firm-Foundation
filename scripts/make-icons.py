#!/usr/bin/env python3
"""
Generates the PWA icon set.

These are deliberate PLACEHOLDERS so manifest.json stops 404ing and the app is
installable — replace assets/ with real brand artwork before launch.

Pure stdlib (zlib + struct): no Pillow in the build container.
Run: python3 scripts/make-icons.py
"""
import os
import struct
import zlib

BG = (0x07, 0x09, 0x0F)      # --bg
GOLD = (0xF5, 0xC8, 0x42)    # --gold
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets')


def draw(size):
    """A gold 'foundation' mark: a pillar on a base, centred on the dark ground."""
    px = [[BG for _ in range(size)] for _ in range(size)]

    u = size / 16.0          # design grid unit
    cx = size / 2.0

    def rect(x0, y0, x1, y1):
        for y in range(max(0, int(y0)), min(size, int(y1))):
            for x in range(max(0, int(x0)), min(size, int(x1))):
                px[y][x] = GOLD

    # Base slab
    rect(cx - 5 * u, 11 * u, cx + 5 * u, 12.6 * u)
    # Second course, inset
    rect(cx - 3.8 * u, 9.2 * u, cx + 3.8 * u, 10.7 * u)
    # Central pillar
    rect(cx - 1.15 * u, 3.4 * u, cx + 1.15 * u, 9.2 * u)
    # Capital
    rect(cx - 2.6 * u, 2.2 * u, cx + 2.6 * u, 3.4 * u)

    return px


def png_bytes(px):
    size = len(px)
    raw = b''.join(
        b'\x00' + b''.join(struct.pack('3B', *px[y][x]) for x in range(size))
        for y in range(size)
    )

    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    return (
        b'\x89PNG\r\n\x1a\n'
        + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))
        + chunk(b'IDAT', zlib.compress(raw, 9))
        + chunk(b'IEND', b'')
    )


def ico_bytes(png, size):
    """ICO container wrapping a PNG entry (supported by every current browser)."""
    header = struct.pack('<HHH', 0, 1, 1)
    entry = struct.pack(
        '<BBBBHHII',
        size if size < 256 else 0, size if size < 256 else 0,
        0, 0, 1, 32, len(png), 22
    )
    return header + entry + png


def main():
    os.makedirs(OUT, exist_ok=True)
    written = []

    for size in (192, 512):
        path = os.path.join(OUT, f'icon-{size}.png')
        with open(path, 'wb') as f:
            f.write(png_bytes(draw(size)))
        written.append(path)

    fav = png_bytes(draw(32))
    path = os.path.join(OUT, 'favicon.ico')
    with open(path, 'wb') as f:
        f.write(ico_bytes(fav, 32))
    written.append(path)

    for p in written:
        print(f'{os.path.relpath(p, os.path.join(OUT, ".."))}  {os.path.getsize(p)} bytes')


if __name__ == '__main__':
    main()
