import os
from PIL import Image, ImageDraw, ImageFont

def create_gradient_icon(size, is_maskable=False):
    # Create image
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Gradient background
    c1 = (79, 70, 229)   # #4F46E5 indigo
    c2 = (124, 58, 237)  # #7C3AED violet

    # Draw rounded rect or full bleed
    corner_radius = 0 if is_maskable else int(size * 0.22)

    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    for y in range(size):
        ratio = y / size
        r = int(c1[0] * (1 - ratio) + c2[0] * ratio)
        g = int(c1[1] * (1 - ratio) + c2[1] * ratio)
        b = int(c1[2] * (1 - ratio) + c2[2] * ratio)
        bg_draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    if is_maskable:
        mask_draw.rectangle([0, 0, size, size], fill=255)
    else:
        mask_draw.rounded_rectangle([0, 0, size, size], radius=corner_radius, fill=255)

    img.paste(bg, (0, 0), mask)

    # Scale icon features (safe zone: 80% for maskable, 70% normal)
    draw = ImageDraw.Draw(img)
    scale = 0.55 if is_maskable else 0.62
    v_width = size * scale
    v_height = size * scale

    cx = size / 2
    cy = size / 2

    # V coordinates
    top_y = cy - v_height * 0.42
    bottom_y = cy + v_height * 0.42
    left_x = cx - v_width * 0.42
    right_x = cx + v_width * 0.42

    line_w = max(4, int(size * 0.08))

    # Draw V lines
    draw.line([(left_x, top_y), (cx, bottom_y)], fill=(255, 255, 255, 255), width=line_w)
    draw.line([(cx, bottom_y), (right_x, top_y)], fill=(255, 255, 255, 255), width=line_w)

    # Nodes
    node_r = line_w * 0.75
    draw.ellipse([cx - node_r, bottom_y - node_r, cx + node_r, bottom_y + node_r], fill=(255, 255, 255, 255))
    inner_r = node_r * 0.45
    draw.ellipse([cx - inner_r, bottom_y - inner_r, cx + inner_r, bottom_y + inner_r], fill=c1)

    arm_r = line_w * 0.5
    draw.ellipse([left_x - arm_r, top_y - arm_r, left_x + arm_r, top_y + arm_r], fill=(255, 255, 255, 255))
    draw.ellipse([right_x - arm_r, top_y - arm_r, right_x + arm_r, top_y + arm_r], fill=(255, 255, 255, 255))

    return img

def create_og_image():
    w, h = 1200, 630
    img = Image.new("RGBA", (w, h), (15, 23, 42, 255)) # Dark slate navy #0F172A
    draw = ImageDraw.Draw(img)

    # Subtle ambient gradient glow in center-left
    glow_color = (79, 70, 229, 30)
    for r in range(250, 0, -10):
        alpha = int(40 * (1 - r / 250))
        draw.ellipse([180 - r, 315 - r, 180 + r, 315 + r], fill=(79, 70, 229, alpha))

    # Draw Logo Mark on Left
    mark = create_gradient_icon(180, is_maskable=False)
    img.paste(mark, (120, 225), mark)

    # Text rendering
    # Wordmark: VYNTRIXA
    # Tagline: AI-Powered Adaptive Learning Intelligence
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 64)
        font_tag = ImageFont.truetype("arialbd.ttf", 26)
        font_sub = ImageFont.truetype("arial.ttf", 22)
    except:
        font_title = ImageFont.load_default()
        font_tag = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    draw.text((340, 240), "VYNTRIXA", fill=(255, 255, 255, 255), font=font_title)
    draw.text((345, 320), "AI-POWERED ADAPTIVE LEARNING INTELLIGENCE", fill=(129, 140, 248, 255), font=font_tag)
    draw.text((345, 365), "Your skills. Your goal. Your adaptive path.", fill=(148, 163, 184, 255), font=font_sub)

    return img

os.makedirs("frontend/public/icons", exist_ok=True)

# Generate Icons
icon_192 = create_gradient_icon(192, is_maskable=False)
icon_192.save("frontend/public/icons/icon-192x192.png", "PNG")

icon_512 = create_gradient_icon(512, is_maskable=False)
icon_512.save("frontend/public/icons/icon-512x512.png", "PNG")

icon_mask_192 = create_gradient_icon(192, is_maskable=True)
icon_mask_192.save("frontend/public/icons/icon-maskable-192x192.png", "PNG")

icon_mask_512 = create_gradient_icon(512, is_maskable=True)
icon_mask_512.save("frontend/public/icons/icon-maskable-512x512.png", "PNG")

apple_icon = create_gradient_icon(180, is_maskable=False)
apple_icon.save("frontend/public/icons/apple-touch-icon.png", "PNG")
apple_icon.save("frontend/public/apple-touch-icon.png", "PNG")

og_img = create_og_image()
og_img.save("frontend/public/og-image.png", "PNG")

print("Generated all VYNTRIXA icons and og-image.png successfully.")
