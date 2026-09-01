import urllib.request
import numpy as np
from PIL import Image, ImageEnhance

BG_URL = "https://static.prod-images.emergentagent.com/jobs/9b934897-4696-4151-8655-4293d1c3f381/images/0d11c0623390999ccb1f40d532da7fc97a91cafaa0db69f2274e0e72b3b7acf3.jpeg"
W, H = 1200, 630
CREAM = (245, 241, 234)
TERRA = (214, 156, 126)  # lightened terracotta for legibility on dark bg

urllib.request.urlretrieve(BG_URL, "/tmp/og_bg.jpg")
bg = Image.open("/tmp/og_bg.jpg").convert("RGB")
scale = max(W / bg.width, H / bg.height)
bg = bg.resize((round(bg.width * scale), round(bg.height * scale)), Image.LANCZOS)
left = (bg.width - W) // 2
top = (bg.height - H) // 2
bg = bg.crop((left, top, left + W, top + H))
bg = ImageEnhance.Brightness(bg).enhance(0.8)

# soft dark vignette (center slightly clearer, edges/bottom darker) for logo legibility
grad = Image.new("L", (1, H), 0)
for y in range(H):
    grad.putpixel((0, y), int(110 * (abs(y - H * 0.5) / (H * 0.5)) ** 1.4) + 30)
grad = grad.resize((W, H))
overlay = Image.new("RGB", (W, H), (24, 19, 16))
bg = Image.composite(overlay, bg, grad)

# --- logo: recolor two-tone -> cream (PLUME) + light terracotta (SUITES) ---
logo = Image.open("/tmp/logo.png").convert("RGBA")
logo = logo.crop(logo.getbbox())  # trim transparent padding
arr = np.array(logo).astype(np.int16)
r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
warm = (r - b) > 45  # terracotta SUITES
out = arr.copy()
for i, c in enumerate(CREAM):
    out[..., i] = c
for i, c in enumerate(TERRA):
    out[..., i][warm] = c
out[..., 3] = a
logo_c = Image.fromarray(out.astype(np.uint8), "RGBA")

# scale logo to target width
target_w = 620
lw, lh = logo_c.size
logo_c = logo_c.resize((target_w, round(lh * target_w / lw)), Image.LANCZOS)

# paste centered
lx = (W - logo_c.width) // 2
ly = (H - logo_c.height) // 2
bg_rgba = bg.convert("RGBA")
bg_rgba.alpha_composite(logo_c, (lx, ly))
bg_rgba.convert("RGB").save("/app/frontend/public/og-image.jpg", "JPEG", quality=88, optimize=True, progressive=True)
print("saved og-image", bg_rgba.size, "logo", logo_c.size)
