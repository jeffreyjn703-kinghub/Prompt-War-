import os
from PIL import Image, ImageDraw, ImageFont

icons_dir = os.path.join("frontend", "public", "icons")
os.makedirs(icons_dir, exist_ok=True)

def create_icon(size: int, maskable: bool = False) -> Image.Image:
    # 32-bit RGBA image
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background
    if maskable:
        # Full bleed background for maskable icons
        draw.rectangle([0, 0, size, size], fill=(79, 70, 229, 255)) # #4F46E5
        # Inner safe circle accent
        center = size // 2
        radius = int(size * 0.38)
    else:
        # Rounded rectangle for standard icon
        corner_r = int(size * 0.22)
        draw.rounded_rectangle([0, 0, size, size], radius=corner_r, fill=(79, 70, 229, 255))
        center = size // 2
        radius = int(size * 0.42)

    # Draw gradient-like nested subtle circles
    draw.ellipse(
        [center - radius, center - radius, center + radius, center + radius],
        fill=(99, 102, 241, 255) # #6366F1
    )

    # Core node constellation / "S" lightning path
    scale = size / 512.0
    # Coordinates for stylized path
    pts = [
        (256 * scale, 100 * scale),
        (370 * scale, 170 * scale),
        (370 * scale, 240 * scale),
        (256 * scale, 310 * scale),
        (142 * scale, 240 * scale),
        (142 * scale, 370 * scale),
        (256 * scale, 430 * scale),
        (370 * scale, 370 * scale)
    ]

    # Thick path lines
    line_w = max(4, int(22 * scale))
    draw.line([pts[0], pts[1], pts[2], pts[3], pts[4], pts[5], pts[6], pts[7]], fill=(255, 255, 255, 255), width=line_w, joint="curve")

    # Nodes
    node_r = max(6, int(18 * scale))
    for pt in [pts[0], pts[3], pts[6]]:
        draw.ellipse([pt[0] - node_r, pt[1] - node_r, pt[0] + node_r, pt[1] + node_r], fill=(250, 204, 21, 255)) # Yellow/Amber accent node
    for pt in [pts[1], pts[2], pts[4], pts[5], pts[7]]:
        draw.ellipse([pt[0] - node_r * 0.7, pt[1] - node_r * 0.7, pt[0] + node_r * 0.7, pt[1] + node_r * 0.7], fill=(255, 255, 255, 255))

    return img

sizes = [
    (192, False, "icon-192x192.png"),
    (512, False, "icon-512x512.png"),
    (192, True, "icon-maskable-192x192.png"),
    (512, True, "icon-maskable-512x512.png"),
    (180, False, "apple-touch-icon.png")
]

for s, maskable, fname in sizes:
    icon = create_icon(s, maskable)
    out_path = os.path.join(icons_dir, fname)
    icon.save(out_path, "PNG")
    print(f"Generated {out_path} ({s}x{s}, maskable={maskable})")
