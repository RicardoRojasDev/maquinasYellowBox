#!/usr/bin/env python3
"""
Extrae la imagen PNG embebida en un SVG, convierte los pixeles blancos (o casi blancos)
a transparencia y escribe un nuevo SVG con la imagen actualizada.

Uso:
  pip install -r scripts/requirements.txt
  python scripts/make_svg_transparent.py img/102.svg img/102_transparent.svg
"""
import re
import sys
import base64
from io import BytesIO
from pathlib import Path
from PIL import Image


def make_transparent(png_bytes, threshold=250):
    img = Image.open(BytesIO(png_bytes)).convert("RGBA")
    datas = img.getdata()
    new_data = []
    for item in datas:
        r, g, b, a = item
        if a == 0:
            new_data.append((r, g, b, 0))
            continue
        # consider almost-white as background
        if r >= threshold and g >= threshold and b >= threshold:
            new_data.append((r, g, b, 0))
        else:
            new_data.append((r, g, b, a))
    img.putdata(new_data)
    out = BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()


def process(svg_path: Path, out_path: Path):
    text = svg_path.read_text(encoding="utf-8")
    # Buscar data URI PNG
    m = re.search(r'data:image/png;base64,([A-Za-z0-9+/=]+)', text)
    if not m:
        print("No se encontró PNG embebido en el SVG.")
        return 1
    b64 = m.group(1)
    png_bytes = base64.b64decode(b64)
    new_png = make_transparent(png_bytes)
    new_b64 = base64.b64encode(new_png).decode("ascii")
    new_text = text[: m.start(1)] + new_b64 + text[m.end(1) :]
    out_path.write_text(new_text, encoding="utf-8")
    print(f"Escrito: {out_path}")
    return 0


def main():
    if len(sys.argv) < 3:
        print("Uso: make_svg_transparent.py input.svg output.svg")
        sys.exit(2)
    inp = Path(sys.argv[1])
    out = Path(sys.argv[2])
    if not inp.exists():
        print("Archivo de entrada no existe:", inp)
        sys.exit(2)
    sys.exit(process(inp, out))


if __name__ == "__main__":
    main()
