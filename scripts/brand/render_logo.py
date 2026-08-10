"""Render HabitFlow brand raster assets (favicons, app icons, OG image).

Draws the HabitFlow mark natively with PIL so no SVG rasterizer is needed.
Single source of truth for the geometry, kept in sync with the SVGs in
apps/web/public/brand/.
"""
import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PRIMARY = (99, 102, 241)     # #6366F1
ACCENT = (139, 92, 246)      # #8B5CF6
INK = (23, 24, 31)           # #17181F
WHITE = (255, 255, 255)

APP_WEB = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "apps", "web"))
PUBLIC = os.path.join(APP_WEB, "public")
BRAND = os.path.join(PUBLIC, "brand")
os.makedirs(PUBLIC, exist_ok=True)
os.makedirs(BRAND, exist_ok=True)


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def diagonal_gradient(size, c1, c2):
    w, h = size
    img = Image.new("RGB", (1, 1))
    scale = 4
    small = Image.new("RGB", (w // scale, h // scale))
    px = small.load()
    sw, sh = small.size
    for y in range(sh):
        for x in range(sw):
            t = (x / max(sw - 1, 1) + y / max(sh - 1, 1)) / 2
            px[x, y] = lerp(c1, c2, t)
    return small.resize((w, h), Image.BICUBIC)


def cubic(p0, p1, p2, p3, n=48):
    pts = []
    for i in range(n + 1):
        t = i / n
        mt = 1 - t
        x = mt**3 * p0[0] + 3 * mt**2 * t * p1[0] + 3 * mt * t**2 * p2[0] + t**3 * p3[0]
        y = mt**3 * p0[1] + 3 * mt**2 * t * p1[1] + 3 * mt * t**2 * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts


def flame_polygon():
    # Mirrors the SVG path in logo-mark.svg, normalized to a 48x48 viewBox.
    p1 = cubic((24, 9.5), (29.5, 16), (32.5, 20), (32.5, 24.2))
    p2 = cubic((32.5, 24.2), (32.5, 28.7), (28.7, 32), (24, 32))
    p3 = cubic((24, 32), (19.3, 32), (15.5, 28.7), (15.5, 24.2))
    p4 = cubic((15.5, 24.2), (15.5, 20), (18.5, 16), (24, 9.5))
    return p1 + p2 + p3 + p4


def draw_mark(draw, scale, inset=0.0):
    """Draw the tile mark (gradient tile + white flame + indigo check)."""
    # tile (rounded square) spanning the full canvas
    draw.rounded_rectangle([0, 0, draw.im.size[0], draw.im.size[1]], radius=12 * scale,
                           fill=(0, 0, 0, 0))
    poly = [(x * scale, y * scale) for (x, y) in flame_polygon()]
    draw.polygon(poly, fill=WHITE + (245,))
    # check mark
    cw = 2.5 * scale
    draw.line([(19 * scale, 26 * scale), (23.2 * scale, 29.6 * scale)], fill=PRIMARY, width=int(cw))
    draw.line([(23.2 * scale, 29.6 * scale), (29.8 * scale, 20.8 * scale)], fill=PRIMARY, width=int(cw))


def render_tile(size):
    """Gradient rounded tile with flame + check, at exact px size."""
    img = Image.new("RGBA", (size, size))
    grad = diagonal_gradient((size, size), PRIMARY, ACCENT)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=max(1, int(size * 0.25)),
                                           fill=255)
    img = Image.alpha_composite(img.convert("RGBA"),
                                Image.merge("RGBA", grad.split()[:3] + (mask,)))
    d = ImageDraw.Draw(img)
    poly = [(x / 48 * size, y / 48 * size) for (x, y) in flame_polygon()]
    d.polygon(poly, fill=WHITE + (245,))
    cw = max(2, round(2.5 / 48 * size))
    d.line([(19 / 48 * size, 26 / 48 * size), (23.2 / 48 * size, 29.6 / 48 * size)],
           fill=PRIMARY, width=cw)
    d.line([(23.2 / 48 * size, 29.6 / 48 * size), (29.8 / 48 * size, 20.8 / 48 * size)],
           fill=PRIMARY, width=cw)
    return img


def render_og():
    W, H = 1200, 630
    img = diagonal_gradient((W, H), PRIMARY, ACCENT)
    img = img.convert("RGBA")
    d = ImageDraw.Draw(img)

    # large faint flame motif in the background (bottom right)
    motif = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    md = ImageDraw.Draw(motif)
    poly = [(x / 48 * 460, y / 48 * 460) for (x, y) in flame_polygon()]
    md.polygon(poly, fill=WHITE + (18,))
    motif = motif.filter(ImageFilter.GaussianBlur(2))
    img = Image.alpha_composite(img, motif)

    # logo tile
    tile = render_tile(168)
    img.paste(tile, (90, H // 2 - 84), tile)

    # wordmark + tagline
    seg_bold = "C:\\Windows\\Fonts\\segoeuib.ttf"
    arial = "C:\\Windows\\Fonts\\arial.ttf"
    f_word = ImageFont.truetype(seg_bold, 76)
    f_tag = ImageFont.truetype(arial, 30)
    word = "HabitFlow"
    d.text((300, H // 2 - 82), word, font=f_word, fill=WHITE)
    tag = "Your AI co-pilot for habits that stick"
    d.text((304, H // 2 + 24), tag, font=f_tag, fill=(238, 239, 250))
    return img.convert("RGB")


def main():
    render_tile(512).save(os.path.join(PUBLIC, "icon-512.png"))
    render_tile(192).save(os.path.join(PUBLIC, "icon-192.png"))
    render_tile(180).save(os.path.join(PUBLIC, "apple-icon.png"))
    render_tile(32).save(os.path.join(PUBLIC, "favicon-32.png"))
    render_tile(16).save(os.path.join(PUBLIC, "favicon-16.png"))

    ico = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    ico.alpha_composite(render_tile(48).resize((48, 48), Image.LANCZOS))
    ico.save(os.path.join(PUBLIC, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])

    render_og().save(os.path.join(BRAND, "og-image.png"))
    print("OK: brand rasters written to", PUBLIC, "and", BRAND)


if __name__ == "__main__":
    main()
